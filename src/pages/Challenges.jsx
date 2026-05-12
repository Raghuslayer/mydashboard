import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFire, faTrophy, faCrosshairs, faCheck, faPlus, faEdit,
    faTrash, faClock, faMedal, faGem, faBolt, faSkull, faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

const difficultyColors = {
    easy: { grad: 'from-emerald-500 to-emerald-700', glow: 'rgba(16,185,129,0.5)', label: 'EASY', xp: 50 },
    medium: { grad: 'from-amber-500 to-amber-700', glow: 'rgba(245,158,11,0.5)', label: 'MEDIUM', xp: 100 },
    hard: { grad: 'from-red-500 to-red-800', glow: 'rgba(239,68,68,0.5)', label: 'HARD', xp: 250 },
    extreme: { grad: 'from-purple-500 to-purple-900', glow: 'rgba(168,85,247,0.5)', label: 'EXTREME', xp: 500 },
};

function todayStr() { return new Date().toISOString().split('T')[0]; }

export default function Challenges() {
    const { challenges: saved, addChallenge, updateChallenge, deleteChallenge, checkInChallenge } = useData();
    const challenges = saved || [];
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detail, setDetail] = useState(null);
    const [filter, setFilter] = useState('all');
    const [justCheckedIn, setJustCheckedIn] = useState(null);

    const filtered = useMemo(() => {
        let list = [...challenges];
        if (filter === 'active') list = list.filter(c => !c.completed);
        else if (filter === 'completed') list = list.filter(c => c.completed);
        return list.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return b.createdAt - a.createdAt;
        });
    }, [challenges, filter]);

    const stats = useMemo(() => ({
        total: challenges.length,
        active: challenges.filter(c => !c.completed).length,
        completed: challenges.filter(c => c.completed).length,
    }), [challenges]);

    const handleSave = (data) => {
        if (editing) { updateChallenge(editing.id, data); setEditing(null); }
        else addChallenge(data);
        setShowAdd(false);
    };

    const handleCheckIn = (id) => {
        checkInChallenge(id);
        setJustCheckedIn(id);
        setTimeout(() => setJustCheckedIn(null), 2000);
        // refresh detail if open
        setDetail(prev => prev?.id === id ? { ...prev, _refresh: Date.now() } : prev);
    };

    const handleDelete = (id) => {
        deleteChallenge(id);
        setDetail(null);
    };

    // Get live challenge data for detail modal
    const liveDetail = detail ? challenges.find(c => c.id === detail.id) || detail : null;

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-purple-600/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="header-font text-4xl fire-text mb-2 flex items-center gap-3">
                            <FontAwesomeIcon icon={faCrosshairs} />
                            Challenges
                        </h1>
                        <p className="text-gray-400">Mark every day. Miss one — it resets. Finish all days — it becomes a gem. 💎</p>
                    </div>
                    <button onClick={() => { setEditing(null); setShowAdd(true); }}
                        className="bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white px-6 py-3 font-semibold flex items-center gap-2 btn-3d">
                        <FontAwesomeIcon icon={faPlus} /> New Challenge
                    </button>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total', value: stats.total, icon: faCrosshairs, color: 'from-blue-600 to-blue-800' },
                    { label: 'Active', value: stats.active, icon: faFire, color: 'from-orange-500 to-orange-800' },
                    { label: 'Completed', value: stats.completed, icon: faGem, color: 'from-purple-500 to-purple-800' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className="glass-panel p-4 text-center relative overflow-hidden group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <div className="relative z-10">
                            <FontAwesomeIcon icon={s.icon} className="text-xl text-[var(--color-primary)] mb-2" />
                            <p className="text-3xl font-bold">{s.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-panel p-3 flex gap-2 flex-wrap">
                {['all', 'active', 'completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 font-medium capitalize transition-all ${filter === f
                            ? 'bg-[var(--color-primary)] text-black shadow-lg'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass-panel p-12 text-center">
                    <div className="gem-icon mx-auto mb-6">💎</div>
                    <h3 className="text-2xl font-bold mb-2">No Challenges Yet</h3>
                    <p className="text-gray-400 mb-6">Create a challenge, mark it every day, earn a gem when you finish.</p>
                    <button onClick={() => { setEditing(null); setShowAdd(true); }}
                        className="bg-gradient-to-r from-amber-600 to-purple-600 text-white px-8 py-3 font-semibold inline-flex items-center gap-2 btn-3d hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
                        <FontAwesomeIcon icon={faPlus} /> Create First Challenge
                    </button>
                </motion.div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filtered.map((c, i) => (
                        <ChallengeCard key={c.id} challenge={c} index={i}
                            justCheckedIn={justCheckedIn === c.id}
                            onCheckIn={() => handleCheckIn(c.id)}
                            onClick={() => setDetail(c)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Add/Edit Modal */}
            <ChallengeFormModal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditing(null); }}
                onSave={handleSave} initialData={editing} />

            {/* Detail Modal */}
            {liveDetail && (
                <ChallengeDetailModal isOpen={!!detail} onClose={() => setDetail(null)}
                    challenge={liveDetail}
                    onCheckIn={() => handleCheckIn(liveDetail.id)}
                    onEdit={(c) => { setEditing(c); setDetail(null); setShowAdd(true); }}
                    onDelete={handleDelete} />
            )}
        </div>
    );
}

// ── Challenge Card ──────────────────────────────────────────
function ChallengeCard({ challenge: c, index, onClick, onCheckIn, justCheckedIn }) {
    const diff = difficultyColors[c.difficulty] || difficultyColors.medium;
    const target = c.targetDays || 30;
    const streak = c.currentStreak || 0;
    const pct = Math.min(100, Math.round((streak / target) * 100));
    const today = todayStr();
    const checkedToday = c.lastCheckIn === today;
    const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })();
    const atRisk = !c.completed && !checkedToday && c.lastCheckIn && c.lastCheckIn !== yesterday;

    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.04 }}
            className="glass-panel p-5 cursor-pointer group relative overflow-hidden depth-2"
            onClick={onClick}>
            <div className={`absolute inset-0 bg-gradient-to-br ${diff.grad} opacity-10 group-hover:opacity-20 transition-opacity`} />

            {/* Completed Gem Overlay */}
            {c.completed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-7xl opacity-10 select-none">💎</div>
                </div>
            )}

            <div className="relative z-10 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                        <h3 className="text-lg font-bold line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">{c.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{target} day challenge</p>
                    </div>
                    <span className={`px-2 py-0.5 bg-gradient-to-r ${diff.grad} text-white text-xs font-bold uppercase shrink-0`}>
                        {diff.label}
                    </span>
                </div>

                {/* Streak ring */}
                <div className="flex items-center gap-3">
                    <StreakRing streak={streak} target={target} color={diff.glow} completed={c.completed} />
                    <div>
                        <p className="text-2xl font-black">{streak}<span className="text-sm font-normal text-gray-400">/{target}</span></p>
                        <p className="text-xs text-gray-400">days streak</p>
                    </div>
                    {atRisk && !c.completed && (
                        <span className="ml-auto text-red-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                            <FontAwesomeIcon icon={faSkull} /> AT RISK
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="progress-track h-2">
                    <motion.div className="progress-fill h-full" initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faMedal} /> {diff.xp} XP
                    </span>
                    {c.completed ? (
                        <span className="text-xs text-purple-400 font-bold flex items-center gap-1">
                            <span>💎</span> In Achievement Vault!
                        </span>
                    ) : checkedToday ? (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <FontAwesomeIcon icon={faCheck} /> Done Today
                        </span>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                            onClick={onCheckIn}
                            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${justCheckedIn
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-[0_0_16px_rgba(245,158,11,0.6)]'}`}>
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            {justCheckedIn ? 'Checked!' : "Mark Today"}
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Circular streak ring
function StreakRing({ streak, target, color, completed }) {
    const r = 22, circ = 2 * Math.PI * r;
    const pct = Math.min(1, streak / (target || 1));
    return (
        <svg width={56} height={56} className="shrink-0">
            <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
            <circle cx={28} cy={28} r={r} fill="none"
                stroke={completed ? '#a855f7' : '#f59e0b'}
                strokeWidth={5} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
            <text x={28} y={33} textAnchor="middle" fontSize={13} fill="white" fontWeight="bold">
                {completed ? '💎' : `${Math.round(pct * 100)}%`}
            </text>
        </svg>
    );
}

// ── Form Modal ──────────────────────────────────────────────
function ChallengeFormModal({ isOpen, onClose, onSave, initialData }) {
    const [form, setForm] = useState({ title: '', description: '', difficulty: 'medium', targetDays: 30 });

    React.useEffect(() => {
        if (initialData) {
            setForm({ title: initialData.title || '', description: initialData.description || '',
                difficulty: initialData.difficulty || 'medium', targetDays: initialData.targetDays || 30 });
        } else {
            setForm({ title: '', description: '', difficulty: 'medium', targetDays: 30 });
        }
    }, [initialData, isOpen]);

    const submit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave({ ...form, targetDays: Number(form.targetDays) });
        setForm({ title: '', description: '', difficulty: 'medium', targetDays: 30 });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Challenge' : 'New Challenge'}>
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold mb-2">Challenge Title *</label>
                    <input type="text" value={form.title} required
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., 100 Push-ups every day"
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea value={form.description} rows={3}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="What exactly will you do each day?"
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] resize-none" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">
                        Number of Days <span className="text-[var(--color-primary)]">{form.targetDays}</span>
                    </label>
                    <input type="range" min={1} max={365} value={form.targetDays}
                        onChange={e => setForm({ ...form, targetDays: e.target.value })}
                        className="w-full accent-[var(--color-primary)]" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 day</span><span>30</span><span>90</span><span>365 days</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Difficulty</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(difficultyColors).map(([d, v]) => (
                            <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                                className={`px-4 py-3 font-semibold transition-all ${form.difficulty === d
                                    ? `bg-gradient-to-r ${v.grad} text-white shadow-lg`
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                {v.label} · {v.xp} XP
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 font-semibold">Cancel</button>
                    <button type="submit"
                        className="flex-1 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white py-3 font-semibold btn-3d hover:shadow-[0_0_24px_var(--color-glow)] transition-all">
                        {initialData ? 'Update' : 'Launch'} Challenge
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ── Detail Modal ────────────────────────────────────────────
function ChallengeDetailModal({ isOpen, onClose, challenge: c, onCheckIn, onEdit, onDelete }) {
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    if (!c) return null;
    const diff = difficultyColors[c.difficulty] || difficultyColors.medium;
    const target = c.targetDays || 30;
    const streak = c.currentStreak || 0;
    const today = todayStr();
    const checkedToday = c.lastCheckIn === today;
    const pct = Math.min(100, Math.round((streak / target) * 100));

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="space-y-5">
                {/* Title */}
                <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h2 className="header-font text-3xl fire-text">{c.title}</h2>
                        <span className={`px-3 py-1 bg-gradient-to-r ${diff.grad} text-white text-xs font-bold uppercase shrink-0`}>
                            {diff.label}
                        </span>
                    </div>
                    {c.description && <p className="text-gray-400">{c.description}</p>}
                </div>

                {/* Streak display */}
                <div className={`glass-panel p-5 bg-gradient-to-br ${diff.grad} bg-opacity-10 relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${diff.grad} opacity-10`} />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Current Streak</p>
                            <p className="text-5xl font-black">{streak}<span className="text-lg text-gray-400">/{target} days</span></p>
                        </div>
                        <StreakRing streak={streak} target={target} color={diff.glow} completed={c.completed} />
                    </div>
                    <div className="progress-track h-2 mt-4">
                        <motion.div className="progress-fill h-full" initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pct}% complete · {target - streak} days remaining</p>
                </div>

                {/* Last check-in */}
                {c.lastCheckIn && (
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        Last check-in: {c.lastCheckIn}
                    </p>
                )}

                {/* XP reward */}
                <div className="glass-panel p-4 bg-gradient-to-br from-amber-600/10 to-amber-800/10 border-amber-600/20 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Completion Reward</p>
                        <p className="text-3xl font-bold text-amber-400">{diff.xp} XP + 💎 Gem</p>
                    </div>
                    <FontAwesomeIcon icon={faMedal} className="text-4xl text-amber-500 opacity-50" />
                </div>

                {/* Completed gem */}
                {c.completed && (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel p-6 text-center bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/40"
                        style={{ boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}>
                        <div className="text-6xl mb-3 animate-pulse">💎</div>
                        <p className="text-purple-300 font-bold text-lg">Challenge Complete!</p>
                        <p className="text-gray-400 text-sm">This gem was added to your Achievement Vault.</p>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                    {!c.completed && !checkedToday && (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={onCheckIn}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 font-bold flex items-center justify-center gap-2 btn-3d hover:shadow-[0_0_24px_rgba(245,158,11,0.5)] transition-all">
                            <FontAwesomeIcon icon={faCalendarCheck} /> Mark Today ✓
                        </motion.button>
                    )}
                    {!c.completed && checkedToday && (
                        <div className="flex-1 bg-emerald-600/20 border border-emerald-500 text-emerald-400 py-3 font-bold flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faCheck} /> Checked in today!
                        </div>
                    )}
                    <button onClick={() => onEdit(c)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 font-semibold flex items-center gap-2 btn-3d transition-colors">
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {!confirmDelete ? (
                        <button onClick={() => setConfirmDelete(true)}
                            className="bg-red-700 hover:bg-red-600 text-white px-5 py-3 font-semibold flex items-center gap-2 btn-3d transition-colors">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDelete(false)}
                                className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-3 font-semibold btn-3d transition-colors text-sm">
                                Cancel
                            </button>
                            <button onClick={() => { setConfirmDelete(false); onDelete(c.id); }}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-3 font-bold btn-3d transition-colors text-sm flex items-center gap-1">
                                <FontAwesomeIcon icon={faTrash} /> Delete?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
