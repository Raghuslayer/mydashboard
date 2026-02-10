import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faPen, faCalendar, faChartLine,
    faCheckCircle, faBook, faStar
} from '@fortawesome/free-solid-svg-icons';
import DailyCheckIn from '../components/DailyCheckIn';
import DailySummary from '../components/DailySummary';
import { getCheckInStatus } from '../utils/journalQuestions';

export default function Journal() {
    const { journalEntries, saveJournalEntry } = useData();
    const [view, setView] = useState('today'); // 'today', 'checkin', 'manual', 'history'
    const [manualText, setManualText] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);

    const todayKey = new Date().toISOString().split('T')[0];
    const todayEntry = journalEntries.find(e => e.date?.startsWith(todayKey));
    const checkInStatus = getCheckInStatus();

    const handleCheckInComplete = async (data) => {
        const entry = {
            date: new Date().toISOString(),
            type: 'checkin',
            responses: data.responses,
            analysis: data.analysis,
            text: manualText || null
        };

        await saveJournalEntry(entry);
        setView('today');
        setManualText('');
    };

    const handleManualSave = async () => {
        if (!manualText.trim()) return;

        const entry = {
            date: new Date().toISOString(),
            type: 'manual',
            text: manualText
        };

        await saveJournalEntry(entry);
        setManualText('');
        setView('today');
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="header-font text-4xl fire-text mb-2">Daily Journal</h1>
                    <p className="text-gray-400">Reflect, track, and understand your journey</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="glass-panel p-2 inline-flex gap-2">
                <button
                    onClick={() => setView('today')}
                    className={`px-4 py-2 rounded-lg transition-all ${view === 'today'
                        ? 'bg-gradient-to-r from-fire-orange to-fire-red text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                    Today
                </button>
                <button
                    onClick={() => setView('history')}
                    className={`px-4 py-2 rounded-lg transition-all ${view === 'history'
                        ? 'bg-gradient-to-r from-fire-orange to-fire-red text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    History
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* Today View */}
                {view === 'today' && (
                    <motion.div
                        key="today"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {todayEntry ? (
                            // Show today's entry
                            <DailySummary entry={todayEntry} />
                        ) : (
                            // Prompt for check-in
                            <div className="space-y-4">
                                {/* Daily Check-In Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-panel p-8 text-center relative overflow-hidden group cursor-pointer"
                                    onClick={() => setView('checkin')}
                                >
                                    {/* Animated background */}
                                    <motion.div
                                        animate={{
                                            background: [
                                                'radial-gradient(circle at 20% 50%, rgba(255,94,0,0.1) 0%, transparent 50%)',
                                                'radial-gradient(circle at 80% 50%, rgba(255,42,0,0.1) 0%, transparent 50%)',
                                                'radial-gradient(circle at 20% 50%, rgba(255,94,0,0.1) 0%, transparent 50%)'
                                            ]
                                        }}
                                        transition={{ duration: 5, repeat: Infinity }}
                                        className="absolute inset-0"
                                    />

                                    <div className="relative z-10">
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-6xl mb-4"
                                        >
                                            📝
                                        </motion.div>
                                        <h2 className="header-font text-3xl fire-text mb-2">
                                            Daily Check-In
                                        </h2>
                                        <p className="text-gray-400 mb-6">
                                            {checkInStatus.message}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Answer 8 quick questions to track your mood, energy, and wellbeing
                                        </p>
                                        <button className="px-8 py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.5)] transition-all">
                                            <FontAwesomeIcon icon={faStar} className="mr-2" />
                                            Start Check-In
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Manual Entry Option */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="glass-panel p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Or write a manual entry</h3>
                                        <FontAwesomeIcon icon={faPen} className="text-fire-orange" />
                                    </div>
                                    <button
                                        onClick={() => setView('manual')}
                                        className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        Write Manual Entry
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Check-In View */}
                {view === 'checkin' && (
                    <motion.div
                        key="checkin"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="mb-4">
                            <button
                                onClick={() => setView('today')}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                        <DailyCheckIn onComplete={handleCheckInComplete} />

                        {/* Optional: Add manual notes */}
                        <div className="mt-6 glass-panel p-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Add any additional thoughts or reflections..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all resize-none"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Manual Entry View */}
                {view === 'manual' && (
                    <motion.div
                        key="manual"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-panel p-6"
                    >
                        <div className="mb-4">
                            <button
                                onClick={() => setView('today')}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                        <h2 className="text-2xl font-semibold mb-4">Manual Journal Entry</h2>
                        <textarea
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder="Write your thoughts, reflections, or anything on your mind..."
                            rows={12}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all resize-none mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setView('today')}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleManualSave}
                                disabled={!manualText.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                Save Entry
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* History View */}
                {view === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="glass-panel p-6">
                            <h2 className="text-2xl font-semibold mb-6">Journal History</h2>
                            {journalEntries.length > 0 ? (
                                <div className="space-y-3">
                                    {journalEntries
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((entry, index) => {
                                            const entryDate = new Date(entry.date);
                                            const isToday = entry.date?.startsWith(todayKey);

                                            return (
                                                <motion.div
                                                    key={entry.date}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => {
                                                        setSelectedEntry(entry);
                                                        setView('today');
                                                    }}
                                                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-all group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            {entry.analysis && (
                                                                <div className="text-3xl">{entry.analysis.emoji}</div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold">
                                                                    {entryDate.toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                    {isToday && (
                                                                        <span className="ml-2 text-xs px-2 py-1 bg-fire-orange/20 text-fire-orange rounded">Today</span>
                                                                    )}
                                                                </p>
                                                                {entry.analysis && (
                                                                    <p className="text-sm text-gray-400">{entry.analysis.feeling}</p>
                                                                )}
                                                                {entry.type === 'manual' && (
                                                                    <p className="text-sm text-gray-400">Manual entry</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <FontAwesomeIcon
                                                            icon={faChartLine}
                                                            className="text-gray-500 group-hover:text-fire-orange transition-colors"
                                                        />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📖</div>
                                    <p className="text-gray-400">No journal entries yet</p>
                                    <p className="text-sm text-gray-500 mt-2">Start your first check-in to begin tracking!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Selected Entry View */}
                {selectedEntry && view === 'today' && (
                    <div>
                        <div className="mb-4">
                            <button
                                onClick={() => {
                                    setSelectedEntry(null);
                                    setView('history');
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ← Back to History
                            </button>
                        </div>
                        <DailySummary entry={selectedEntry} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
