import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave, faCalendar, faChartBar, faPen,
    faClipboardCheck, faTrash, faChevronRight,
    faFire, faArrowLeft, faStar, faCheck
} from '@fortawesome/free-solid-svg-icons';
import DailyCheckIn from '../components/DailyCheckIn';
import DailySummary from '../components/DailySummary';
import { getCheckInStatus } from '../utils/journalQuestions';

// ─── Mood selector ────────────────────────────────────────────────────────────
const MOODS = [
    { emoji: '🔥', label: 'Fired Up', color: '#ff5e00' },
    { emoji: '💪', label: 'Strong',   color: '#22c55e' },
    { emoji: '😐', label: 'Neutral',  color: '#eab308' },
    { emoji: '😔', label: 'Low',      color: '#3b82f6' },
    { emoji: '😤', label: 'Stressed', color: '#ef4444' },
];

// ─── Writing prompts ──────────────────────────────────────────────────────────
const PROMPTS = [
    "What did you conquer today?",
    "What's one thing you're proud of?",
    "What slowed you down — and how will you fix it?",
    "What did you learn today that made you better?",
    "Where did you show up strong today?",
    "What's the one move that will change tomorrow?",
    "What's holding you back right now?",
    "Who did you become a little more like today?",
    "What would Goggins say about your day?",
    "What's your win for today, no matter how small?",
];

function getPrompt() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return PROMPTS[dayOfYear % PROMPTS.length];
}

// ─── Format date nicely ───────────────────────────────────────────────────────
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Journal() {
    const { journalEntries, saveJournalEntry } = useData();
    const [view, setView] = useState('write'); // 'write' | 'checkin' | 'history' | 'entry'
    const [text, setText] = useState('');
    const [mood, setMood] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [manualText, setManualText] = useState('');
    const textareaRef = useRef(null);

    const todayKey = new Date().toISOString().split('T')[0];
    const todayEntry = journalEntries.find(e => e.date?.startsWith(todayKey));
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const prompt = getPrompt();
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    // Auto-focus textarea when switching to write view
    useEffect(() => {
        if (view === 'write' && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [view]);

    // Load today's text if already written
    useEffect(() => {
        if (todayEntry?.text && !text) {
            setText(todayEntry.text);
            if (todayEntry.mood !== undefined) {
                setMood(todayEntry.mood);
            }
        }
    }, [todayEntry]);

    const handleSave = async () => {
        if (!text.trim()) return;
        setSaving(true);
        try {
            const entry = {
                date: new Date().toISOString(),
                type: 'manual',
                text: text.trim(),
                mood,
            };
            // If there's an existing check-in entry today, preserve its analysis
            if (todayEntry?.analysis) {
                entry.type = 'checkin';
                entry.responses = todayEntry.responses;
                entry.analysis = todayEntry.analysis;
            }
            await saveJournalEntry(entry);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    const handleCheckInComplete = async (data) => {
        const entry = {
            date: new Date().toISOString(),
            type: 'checkin',
            responses: data.responses,
            analysis: data.analysis,
            text: text.trim() || null,
            mood,
        };
        await saveJournalEntry(entry);
        setView('write');
        setManualText('');
    };

    const openEntry = (entry) => {
        setSelectedEntry(entry);
        setView('entry');
    };

    // ─── NAV TABS ─────────────────────────────────────────────────────────────
    const tabs = [
        { id: 'write',   icon: faPen,           label: 'Write' },
        { id: 'checkin', icon: faClipboardCheck, label: 'Check-In' },
        { id: 'history', icon: faCalendar,        label: 'History' },
    ];

    return (
        <div className="space-y-6 animate-in">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="header-font text-4xl fire-text mb-1">Daily Journal</h1>
                    <p className="text-gray-400 text-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        {todayEntry && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-fire-orange/20 text-fire-orange rounded-full">
                                ✓ Logged today
                            </span>
                        )}
                    </p>
                </div>

                {/* Stats pill */}
                <div className="glass-panel px-4 py-2 text-center hidden md:block">
                    <p className="text-2xl font-bold fire-text">{journalEntries.length}</p>
                    <p className="text-xs text-gray-500">entries</p>
                </div>
            </div>

            {/* ── Tab bar ──────────────────────────────────────────────────── */}
            {view !== 'entry' && (
                <div className="glass-panel p-1.5 inline-flex gap-1 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                view === tab.id
                                    ? 'bg-gradient-to-r from-fire-orange to-fire-red text-white shadow-[0_0_15px_rgba(255,94,0,0.3)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">

                {/* ── WRITE VIEW ────────────────────────────────────────────── */}
                {view === 'write' && (
                    <motion.div
                        key="write"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-4"
                    >
                        {/* Prompt card */}
                        <div className="glass-panel px-6 py-4 border-l-4 border-fire-orange flex items-center gap-3">
                            <FontAwesomeIcon icon={faFire} className="text-fire-orange text-xl shrink-0" />
                            <p className="text-gray-200 italic text-lg leading-snug">"{prompt}"</p>
                        </div>

                        {/* Main writing area */}
                        <div className="glass-panel overflow-hidden">
                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Start writing... no judgment, no rules. Just you and your thoughts."
                                rows={14}
                                className="w-full px-6 py-5 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none text-base leading-relaxed"
                                style={{ fontFamily: "'Georgia', serif" }}
                            />

                            {/* Bottom bar */}
                            <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                                {/* Mood selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 mr-1">Mood:</span>
                                    {MOODS.map((m, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setMood(mood === i ? null : i)}
                                            title={m.label}
                                            className={`text-xl transition-all rounded-lg p-1 ${
                                                mood === i
                                                    ? 'bg-white/15 shadow-lg scale-110'
                                                    : 'opacity-50 hover:opacity-100'
                                            }`}
                                        >
                                            {m.emoji}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Word count + Save */}
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-600">{wordCount} words</span>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleSave}
                                        disabled={!text.trim() || saving}
                                        className={`px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                                            saved
                                                ? 'bg-green-600/80 text-white'
                                                : 'bg-gradient-to-r from-fire-orange to-fire-red text-white hover:shadow-[0_0_20px_rgba(255,94,0,0.4)] disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={saved ? faCheck : (saving ? faSave : faSave)} className={saving ? 'animate-pulse' : ''} />
                                        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save'}
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Mood label display */}
                        {mood !== null && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-gray-400 pl-1"
                            >
                                Feeling: <span style={{ color: MOODS[mood].color }}>{MOODS[mood].emoji} {MOODS[mood].label}</span>
                            </motion.p>
                        )}

                        {/* Today's check-in nudge */}
                        {!todayEntry?.analysis && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="glass-panel p-4 flex items-center justify-between border border-white/5 cursor-pointer hover:border-fire-orange/30 transition-all group"
                                onClick={() => setView('checkin')}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🧠</span>
                                    <div>
                                        <p className="text-sm font-semibold">Add your daily check-in</p>
                                        <p className="text-xs text-gray-500">8 questions · 2 minutes · tracks mood & energy</p>
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faChevronRight} className="text-gray-500 group-hover:text-fire-orange transition-colors" />
                            </motion.div>
                        )}

                        {/* Today's check-in summary if done */}
                        {todayEntry?.analysis && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-panel p-4 flex items-center gap-4 border border-green-500/20 bg-green-500/5"
                            >
                                <span className="text-3xl">{todayEntry.analysis.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-400">Check-in complete</p>
                                    <p className="text-xs text-gray-400">{todayEntry.analysis.feeling}</p>
                                </div>
                                <button
                                    onClick={() => openEntry(todayEntry)}
                                    className="text-xs text-gray-400 hover:text-white transition-colors"
                                >
                                    View →
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ── CHECK-IN VIEW ─────────────────────────────────────────── */}
                {view === 'checkin' && (
                    <motion.div
                        key="checkin"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-4"
                    >
                        {todayEntry?.analysis ? (
                            // Already done
                            <div className="glass-panel p-8 text-center space-y-4">
                                <div className="text-6xl">{todayEntry.analysis.emoji}</div>
                                <h2 className="header-font text-3xl fire-text">Check-In Complete</h2>
                                <p className="text-gray-400">{todayEntry.analysis.feeling}</p>
                                <button
                                    onClick={() => openEntry(todayEntry)}
                                    className="px-6 py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.4)] transition-all"
                                >
                                    View Full Summary →
                                </button>
                            </div>
                        ) : (
                            <DailyCheckIn onComplete={handleCheckInComplete} />
                        )}
                    </motion.div>
                )}

                {/* ── HISTORY VIEW ──────────────────────────────────────────── */}
                {view === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                    >
                        {sortedEntries.length === 0 ? (
                            <div className="glass-panel p-12 text-center">
                                <div className="text-6xl mb-4">📖</div>
                                <p className="text-gray-400 text-lg">No journal entries yet</p>
                                <p className="text-gray-600 text-sm mt-2">Start writing — your future self will thank you.</p>
                                <button
                                    onClick={() => setView('write')}
                                    className="mt-6 px-6 py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.4)] transition-all"
                                >
                                    Write First Entry
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sortedEntries.map((entry, index) => {
                                    const isToday = entry.date?.startsWith(todayKey);
                                    const preview = entry.text
                                        ? entry.text.slice(0, 100) + (entry.text.length > 100 ? '…' : '')
                                        : entry.analysis
                                        ? `${entry.analysis.feeling} — ${entry.analysis.insights?.[0]?.text || 'Check-in complete'}`
                                        : 'No text';
                                    const moodData = entry.mood !== undefined && entry.mood !== null ? MOODS[entry.mood] : null;

                                    return (
                                        <motion.div
                                            key={entry.date}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                            onClick={() => openEntry(entry)}
                                            className="glass-panel p-5 cursor-pointer hover:border-fire-orange/30 border border-transparent transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                                    {/* Emoji / icon */}
                                                    <div className="text-3xl shrink-0 mt-0.5">
                                                        {entry.analysis?.emoji || (moodData ? moodData.emoji : '📝')}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <p className="font-semibold text-white">
                                                                {formatDate(entry.date)}
                                                            </p>
                                                            {isToday && (
                                                                <span className="text-xs px-2 py-0.5 bg-fire-orange/20 text-fire-orange rounded-full">Today</span>
                                                            )}
                                                            {entry.type === 'checkin' && (
                                                                <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                                                                    <FontAwesomeIcon icon={faClipboardCheck} className="mr-1" />Check-in
                                                                </span>
                                                            )}
                                                            {moodData && (
                                                                <span className="text-xs" style={{ color: moodData.color }}>
                                                                    {moodData.emoji} {moodData.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-400 leading-snug line-clamp-2">{preview}</p>
                                                        {entry.text && (
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {entry.text.trim().split(/\s+/).length} words
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <FontAwesomeIcon
                                                    icon={faChevronRight}
                                                    className="text-gray-600 group-hover:text-fire-orange transition-colors shrink-0 mt-1"
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── ENTRY DETAIL VIEW ─────────────────────────────────────── */}
                {view === 'entry' && selectedEntry && (
                    <motion.div
                        key="entry"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-4"
                    >
                        {/* Back button */}
                        <button
                            onClick={() => { setSelectedEntry(null); setView('history'); }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Back to History
                        </button>

                        {/* Show full entry */}
                        {selectedEntry.text && (
                            <div className="glass-panel p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FontAwesomeIcon icon={faPen} className="text-fire-orange" />
                                    <div>
                                        <p className="font-semibold">{formatDate(selectedEntry.date)}</p>
                                        {selectedEntry.mood !== undefined && selectedEntry.mood !== null && MOODS[selectedEntry.mood] && (
                                            <p className="text-sm" style={{ color: MOODS[selectedEntry.mood].color }}>
                                                {MOODS[selectedEntry.mood].emoji} {MOODS[selectedEntry.mood].label}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                                    {selectedEntry.text}
                                </p>
                            </div>
                        )}

                        {/* Check-in summary if it exists */}
                        {selectedEntry.analysis && <DailySummary entry={selectedEntry} />}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
