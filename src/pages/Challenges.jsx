import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFire, faTrophy, faCrosshairs, faCalendar, faUsers, faCheck,
    faPlus, faEdit, faTrash, faClock, faLightbulb, faMedal
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

// Challenge difficulty colors - MASCULINE & POWERFUL
const difficultyColors = {
    easy: 'from-emerald-600 to-emerald-800',
    medium: 'from-amber-600 to-amber-800',
    hard: 'from-red-600 to-red-800',
    extreme: 'from-purple-600 to-purple-900'
};

const difficultyRewards = {
    easy: 50,
    medium: 100,
    hard: 250,
    extreme: 500
};

export default function Challenges() {
    const { userData, addXP, challenges: savedChallenges, addChallenge: saveChallenge, updateChallenge: updateSavedChallenge, deleteChallenge: deleteSavedChallenge } = useData();
    const [challenges, setChallenges] = useState(savedChallenges || []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [editingChallenge, setEditingChallenge] = useState(null);

    // Sync with saved challenges
    React.useEffect(() => {
        setChallenges(savedChallenges || []);
    }, [savedChallenges]);

    // Filter challenges
    const filteredChallenges = useMemo(() => {
        let filtered = challenges;

        if (filterType === 'active') {
            filtered = filtered.filter(c => !c.completed);
        } else if (filterType === 'completed') {
            filtered = filtered.filter(c => c.completed);
        } else if (filterType === 'weekly') {
            filtered = filtered.filter(c => c.type === 'weekly');
        } else if (filterType === 'monthly') {
            filtered = filtered.filter(c => c.type === 'monthly');
        }

        return filtered.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return b.createdAt - a.createdAt;
        });
    }, [challenges, filterType]);

    const stats = useMemo(() => {
        const total = challenges.length;
        const completed = challenges.filter(c => c.completed).length;
        const active = challenges.filter(c => !c.completed).length;
        const totalRewards = challenges
            .filter(c => c.completed)
            .reduce((sum, c) => sum + (difficultyRewards[c.difficulty] || 0), 0);

        return { total, completed, active, totalRewards };
    }, [challenges]);

    const handleAddChallenge = (challengeData) => {
        const newChallenge = {
            id: crypto.randomUUID(),
            ...challengeData,
            completed: false,
            progress: 0,
            createdAt: Date.now(),
            completedAt: null
        };
        setChallenges(prev => [newChallenge, ...prev]);
        setShowAddModal(false);
    };

    const handleCompleteChallenge = (id) => {
        setChallenges(prev =>
            prev.map(c =>
                c.id === id
                    ? { ...c, completed: true, progress: 100, completedAt: Date.now() }
                    : c
            )
        );

        const challenge = challenges.find(c => c.id === id);
        if (challenge) {
            const reward = difficultyRewards[challenge.difficulty] || 0;
            addXP(reward);
        }

        setShowDetailModal(false);
    };

    const handleDeleteChallenge = (id) => {
        setChallenges(prev => prev.filter(c => c.id !== id));
        setShowDetailModal(false);
    };

    const handleEditChallenge = (challengeData) => {
        setChallenges(prev =>
            prev.map(c =>
                c.id === editingChallenge.id
                    ? { ...c, ...challengeData }
                    : c
            )
        );
        setEditingChallenge(null);
        setShowAddModal(false);
    };

    const openDetailModal = (challenge) => {
        setSelectedChallenge(challenge);
        setShowDetailModal(true);
    };

    const openEditModal = (challenge) => {
        setEditingChallenge(challenge);
        setShowAddModal(true);
        setShowDetailModal(false);
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-red-600/10"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="header-font text-4xl fire-text mb-2 flex items-center gap-3">
                                <FontAwesomeIcon icon={faCrosshairs} className="text-3xl" />
                                Challenges
                            </h1>
                            <p className="text-gray-400">
                                Push your limits with weekly and monthly challenges. Earn massive XP rewards.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingChallenge(null);
                                setShowAddModal(true);
                            }}
                            className="bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white px-6 py-3 font-semibold flex items-center gap-2 justify-center btn-3d"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New Challenge
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {[
                    { label: 'Total', value: stats.total, icon: faCrosshairs, color: 'from-blue-600 to-blue-800' },
                    { label: 'Active', value: stats.active, icon: faFire, color: 'from-orange-600 to-orange-800' },
                    { label: 'Completed', value: stats.completed, icon: faTrophy, color: 'from-emerald-600 to-emerald-800' },
                    { label: 'XP Earned', value: stats.totalRewards, icon: faMedal, color: 'from-amber-600 to-amber-800' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="glass-panel p-3 md:p-4 text-center relative overflow-hidden group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-15 transition-opacity`}></div>
                        <div className="relative z-10">
                            <FontAwesomeIcon icon={stat.icon} className="text-lg md:text-xl text-[var(--color-primary)] mb-2" />
                            <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-panel p-4"
            >
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'All Challenges' },
                        { id: 'active', label: 'Active' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'weekly', label: 'Weekly' },
                        { id: 'monthly', label: 'Monthly' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setFilterType(filter.id)}
                            className={`px-4 py-2 font-medium transition-all ${
                                filterType === filter.id
                                    ? 'bg-[var(--color-primary)] text-black shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Empty State */}
            {filteredChallenges.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-12 text-center"
                >
                    <div className="w-24 h-24 bg-amber-600/20 flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faCrosshairs} className="text-5xl text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Challenges Yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Create your first challenge to push your limits and earn massive XP rewards.
                    </p>
                    <button
                        onClick={() => {
                            setEditingChallenge(null);
                            setShowAddModal(true);
                        }}
                        className="bg-gradient-to-r from-amber-600 to-red-600 text-white px-8 py-3 font-semibold hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all inline-flex items-center gap-2 btn-3d"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Create Your First Challenge
                    </button>
                </motion.div>
            )}

            {/* Challenges Grid */}
            {filteredChallenges.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredChallenges.map((challenge, idx) => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            index={idx}
                            onClick={() => openDetailModal(challenge)}
                        />
                    ))}
                </motion.div>
            )}

            {/* Add/Edit Challenge Modal */}
            <ChallengeFormModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingChallenge(null);
                }}
                onSave={editingChallenge ? handleEditChallenge : handleAddChallenge}
                initialData={editingChallenge}
            />

            {/* Challenge Detail Modal */}
            <ChallengeDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedChallenge(null);
                }}
                challenge={selectedChallenge}
                onComplete={handleCompleteChallenge}
                onEdit={openEditModal}
                onDelete={handleDeleteChallenge}
            />
        </div>
    );
}

// Challenge Card Component
function ChallengeCard({ challenge, index, onClick }) {
    const colorClass = difficultyColors[challenge.difficulty] || difficultyColors.easy;
    const reward = difficultyRewards[challenge.difficulty] || 0;
    const daysLeft = challenge.type === 'weekly' ? 7 : 30;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="glass-panel p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden depth-2"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity steel-overlay`}></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                            {challenge.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <FontAwesomeIcon icon={faCalendar} />
                            <span>{challenge.type === 'weekly' ? 'Weekly' : 'Monthly'}</span>
                        </div>
                    </div>
                    <div className={`px-3 py-1 bg-gradient-to-r ${colorClass} text-white text-xs font-bold uppercase tracking-wider`}>
                        {challenge.difficulty}
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {challenge.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-bold text-[var(--color-primary)]">{challenge.progress}%</span>
                    </div>
                    <div className="progress-track h-2">
                        <motion.div
                            className="progress-fill h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${challenge.progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faMedal} className="text-amber-600" />
                        <span className="text-sm font-bold">{reward} XP</span>
                    </div>
                    {challenge.completed ? (
                        <div className="flex items-center gap-1 text-emerald-500 font-bold">
                            <FontAwesomeIcon icon={faCheck} />
                            Completed
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <FontAwesomeIcon icon={faClock} />
                            Active
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Challenge Form Modal
function ChallengeFormModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'weekly',
        difficulty: 'medium',
        targetValue: 1
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                type: initialData.type || 'weekly',
                difficulty: initialData.difficulty || 'medium',
                targetValue: initialData.targetValue || 1
            });
        } else {
            setFormData({
                title: '',
                description: '',
                type: 'weekly',
                difficulty: 'medium',
                targetValue: 1
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onSave(formData);
        setFormData({ title: '', description: '', type: 'weekly', difficulty: 'medium', targetValue: 1 });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Challenge' : 'Create New Challenge'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Challenge Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., 100 Push-ups Challenge"
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your challenge..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Challenge Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['weekly', 'monthly'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`px-4 py-3 font-medium transition-all ${
                                    formData.type === type
                                        ? 'bg-[var(--color-primary)] text-black'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {type === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Difficulty</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(difficultyColors).map(([diff, color]) => (
                            <button
                                key={diff}
                                type="button"
                                onClick={() => setFormData({ ...formData, difficulty: diff })}
                                className={`px-4 py-3 font-medium transition-all ${
                                    formData.difficulty === diff
                                        ? `bg-gradient-to-r ${color} text-white`
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {diff.charAt(0).toUpperCase() + diff.slice(1)} ({difficultyRewards[diff]} XP)
                            </button>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-3 transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white px-6 py-3 hover:shadow-[0_0_30px_var(--color-glow)] transition-all font-semibold btn-3d"
                    >
                        {initialData ? 'Update' : 'Create'} Challenge
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Challenge Detail Modal
function ChallengeDetailModal({ isOpen, onClose, challenge, onComplete, onEdit, onDelete }) {
    if (!challenge) return null;

    const colorClass = difficultyColors[challenge.difficulty] || difficultyColors.easy;
    const reward = difficultyRewards[challenge.difficulty] || 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="header-font text-3xl fire-text mb-2">{challenge.title}</h2>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 bg-gradient-to-r ${colorClass} text-white text-xs font-bold uppercase tracking-wider`}>
                                    {challenge.difficulty}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    {challenge.type === 'weekly' ? '📅 Weekly Challenge' : '📆 Monthly Challenge'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {challenge.description && (
                    <div className="glass-panel p-6">
                        <p className="text-gray-300 leading-relaxed">
                            {challenge.description}
                        </p>
                    </div>
                )}

                {/* Progress */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold">Challenge Progress</span>
                        <span className="text-2xl font-bold text-[var(--color-primary)]">{challenge.progress}%</span>
                    </div>
                    <div className="progress-track h-3">
                        <motion.div
                            className="progress-fill h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${challenge.progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Reward */}
                <div className="glass-panel p-6 bg-gradient-to-br from-amber-600/10 to-amber-800/10 border-amber-600/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Reward for Completion</p>
                            <p className="text-3xl font-bold text-amber-500">{reward} XP</p>
                        </div>
                        <FontAwesomeIcon icon={faMedal} className="text-5xl text-amber-600 opacity-50" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {!challenge.completed && (
                        <button
                            onClick={() => onComplete(challenge.id)}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-3 transition-all font-semibold flex items-center justify-center gap-2 btn-3d hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                        >
                            <FontAwesomeIcon icon={faCheck} />
                            Mark as Complete
                        </button>
                    )}
                    {challenge.completed && (
                        <div className="flex-1 bg-emerald-600/20 border border-emerald-600 text-emerald-400 px-6 py-3 font-semibold flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faCheck} />
                            Completed
                        </div>
                    )}
                    <button
                        onClick={() => onEdit(challenge)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 transition-colors font-semibold flex items-center justify-center gap-2 btn-3d"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Delete this challenge?')) {
                                onDelete(challenge.id);
                            }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 transition-colors font-semibold flex items-center justify-center gap-2 btn-3d"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}
