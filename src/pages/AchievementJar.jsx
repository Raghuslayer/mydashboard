import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTrophy, faPlus, faStar, faMedal, faCrown, faFire, 
    faRocket, faHeart, faBolt, faGem, faCalendar, faFilter,
    faEdit, faTrash, faCheck
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

// Achievement icons pool
const achievementIcons = [faTrophy, faStar, faMedal, faCrown, faFire, faRocket, faHeart, faBolt, faGem];

// Achievement colors pool - MASCULINE & POWERFUL
const achievementColors = [
    'from-red-600 to-red-800',        // Battle Red
    'from-blue-600 to-blue-900',      // Steel Blue
    'from-emerald-600 to-emerald-800',// Victory Green
    'from-amber-600 to-amber-800',    // Gold Medal
    'from-purple-600 to-purple-900',  // Royal Purple
    'from-cyan-500 to-cyan-700',      // Electric Cyan
    'from-orange-600 to-orange-800',  // Fire Orange
    'from-slate-600 to-slate-800',    // Iron Gray
];

export default function AchievementJar() {
    const { achievementJar, addAchievement, updateAchievement, deleteAchievement } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all'); // all, week, month, year
    const [viewMode, setViewMode] = useState('floating'); // floating, grid

    // Filter achievements by time
    const filteredAchievements = useMemo(() => {
        if (timeFilter === 'all') return achievementJar;

        const now = Date.now();
        const timeRanges = {
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000,
        };

        return achievementJar.filter(achievement => {
            return now - achievement.date <= timeRanges[timeFilter];
        });
    }, [achievementJar, timeFilter]);

    const handleAddAchievement = (achievementData) => {
        addAchievement(achievementData);
        setShowAddModal(false);
    };

    const handleEditAchievement = (achievementData) => {
        updateAchievement(editingAchievement.id, achievementData);
        setEditingAchievement(null);
        setShowAddModal(false);
    };

    const handleDeleteAchievement = (id) => {
        deleteAchievement(id);
        setShowDetailModal(false);
        setSelectedAchievement(null);
    };

    const openDetailModal = (achievement) => {
        setSelectedAchievement(achievement);
        setShowDetailModal(true);
    };

    const openEditModal = (achievement) => {
        setEditingAchievement(achievement);
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
                <div className="absolute inset-0 bg-gradient-to-br from-fire-orange/10 to-fire-red/10 animate-pulse"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="header-font text-4xl fire-text mb-2 flex items-center gap-3 animate-slide-in-left">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <FontAwesomeIcon icon={faTrophy} className="text-3xl" />
                                </motion.div>
                                Achievement Jar
                            </h1>
                            <p className="text-gray-400">
                                Your personal cookie jar of victories. When you feel low, remember these moments.
                            </p>
                            <p className="text-sm text-fire-orange mt-2 font-semibold animate-pulse-scale">
                                {filteredAchievements.length} Achievement{filteredAchievements.length !== 1 ? 's' : ''} Collected
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setEditingAchievement(null);
                                setShowAddModal(true);
                            }}
                            className="bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] text-white px-6 py-3 font-semibold flex items-center gap-2 justify-center btn-3d"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add Achievement
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-4"
            >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('floating')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'floating'
                                    ? 'bg-fire-orange text-white shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Floating View
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-fire-orange text-white shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Grid View
                        </button>
                    </div>

                    {/* Time Filter */}
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fire-orange transition-colors"
                        >
                            <option value="all">All Time</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-12 text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-fire-orange/20 flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faTrophy} className="text-5xl text-fire-orange" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Start Your Achievement Journey</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Add your first achievement to your jar. Every victory counts, no matter how small.
                    </p>
                    <button
                        onClick={() => {
                            setEditingAchievement(null);
                            setShowAddModal(true);
                        }}
                        className="bg-gradient-to-r from-fire-orange to-fire-red text-white px-8 py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(255,94,0,0.5)] transition-all inline-flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add Your First Achievement
                    </button>
                </motion.div>
            )}

            {/* Achievements Display */}
            {filteredAchievements.length > 0 && (
                <>
                    {viewMode === 'floating' ? (
                        <FloatingAchievements
                            achievements={filteredAchievements}
                            onAchievementClick={openDetailModal}
                        />
                    ) : (
                        <GridAchievements
                            achievements={filteredAchievements}
                            onAchievementClick={openDetailModal}
                        />
                    )}
                </>
            )}

            {/* Add/Edit Achievement Modal */}
            <AchievementFormModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingAchievement(null);
                }}
                onSave={editingAchievement ? handleEditAchievement : handleAddAchievement}
                initialData={editingAchievement}
            />

            {/* Achievement Detail Modal */}
            <AchievementDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedAchievement(null);
                }}
                achievement={selectedAchievement}
                onEdit={openEditModal}
                onDelete={handleDeleteAchievement}
            />
        </div>
    );
}

// Floating Achievements Component
function FloatingAchievements({ achievements, onAchievementClick }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 min-h-[600px] relative overflow-hidden"
        >
            {/* Background gradient animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-fire-orange/5 via-transparent to-fire-red/5 animate-pulse"></div>

            {/* Floating achievements */}
            <div className="relative z-10">
                {achievements.map((achievement, index) => (
                    <FloatingAchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        index={index}
                        onClick={() => onAchievementClick(achievement)}
                    />
                ))}
            </div>

            {/* Motivational overlay text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <h2 className="header-font text-6xl text-white/5 text-center">
                    YOU ARE<br />UNSTOPPABLE
                </h2>
            </div>
        </motion.div>
    );
}

// Floating Achievement Card
function FloatingAchievementCard({ achievement, index, onClick }) {
    const icon = achievementIcons[achievement.iconIndex || 0];
    const colorClass = achievementColors[achievement.colorIndex || 0];

    // Grid-based positioning to prevent overlap
    const cols = 4;
    const rows = 3;
    const col = index % cols;
    const row = Math.floor(index / cols) % rows;
    
    // Calculate position with spacing
    const baseX = (col * (100 / cols)) + (100 / cols / 2) - 6; // Center in cell, -6 for card width
    const baseY = (row * (100 / rows)) + (100 / rows / 2) - 6; // Center in cell, -6 for card height
    
    // Add small random offset for natural feel (but keep in bounds)
    const randomOffsetX = useMemo(() => (Math.random() - 0.5) * 8, []);
    const randomOffsetY = useMemo(() => (Math.random() - 0.5) * 8, []);
    
    const randomDelay = useMemo(() => Math.random() * 2, []);
    const randomDuration = useMemo(() => 15 + Math.random() * 10, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: [0, 15, -10, 0],
                y: [0, -20, 10, 0],
            }}
            transition={{
                opacity: { duration: 0.5, delay: index * 0.1 },
                scale: { duration: 0.5, delay: index * 0.1 },
                x: {
                    duration: randomDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: randomDelay,
                },
                y: {
                    duration: randomDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: randomDelay,
                },
            }}
            className="absolute cursor-pointer group z-10"
            style={{
                left: `${baseX + randomOffsetX}%`,
                top: `${baseY + randomOffsetY}%`,
            }}
            onClick={onClick}
        >
            <div className={`w-24 h-24 bg-gradient-to-br ${colorClass} shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all flex items-center justify-center relative overflow-hidden animate-glow`}
                style={{ borderRadius: '4px' }}>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <FontAwesomeIcon icon={icon} className="text-3xl text-white relative z-10 drop-shadow-lg" />
                
                {/* 3D Glow effect */}
                <div className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    {achievement.title}
                </div>
            </div>
        </motion.div>
    );
}

// Grid Achievements Component
function GridAchievements({ achievements, onAchievementClick }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {achievements.map((achievement, index) => (
                <GridAchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                    onClick={() => onAchievementClick(achievement)}
                />
            ))}
        </motion.div>
    );
}

// Grid Achievement Card
function GridAchievementCard({ achievement, index, onClick }) {
    const icon = achievementIcons[achievement.iconIndex || 0];
    const colorClass = achievementColors[achievement.colorIndex || 0];
    const date = new Date(achievement.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="glass-panel p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden depth-2"
        >
            {/* Background gradient - MASCULINE */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity steel-overlay`}></div>

            <div className="relative z-10">
                {/* Icon with 3D effect */}
                <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`w-16 h-16 bg-gradient-to-br ${colorClass} shadow-lg flex items-center justify-center mb-4 transition-transform animate-float relative overflow-hidden`}
                    style={{ borderRadius: '4px' }}>
                    <FontAwesomeIcon icon={icon} className="text-2xl text-white drop-shadow-lg relative z-10" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-fire-orange transition-colors">
                    {achievement.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {achievement.description}
                </p>

                {/* Date */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 text-xs text-gray-500"
                >
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>{date}</span>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Achievement Form Modal
function AchievementFormModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        iconIndex: 0,
        colorIndex: 0,
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                iconIndex: initialData.iconIndex || 0,
                colorIndex: initialData.colorIndex || 0,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                iconIndex: 0,
                colorIndex: 0,
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onSave({
            ...formData,
            date: initialData?.date || Date.now(),
        });

        setFormData({ title: '', description: '', iconIndex: 0, colorIndex: 0 });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Achievement' : 'Add New Achievement'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Achievement Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Completed my first marathon"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange transition-colors"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your achievement and how it made you feel..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange transition-colors resize-none"
                    />
                </div>

                {/* Icon Selection */}
                <div>
                    <label className="block text-sm font-semibold mb-3">Choose Icon</label>
                    <div className="grid grid-cols-5 gap-3">
                        {achievementIcons.map((icon, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setFormData({ ...formData, iconIndex: index })}
                                className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                                    formData.iconIndex === index
                                        ? 'bg-fire-orange text-white shadow-lg scale-110'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                <FontAwesomeIcon icon={icon} className="text-2xl" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Selection */}
                <div>
                    <label className="block text-sm font-semibold mb-3">Choose Color</label>
                    <div className="grid grid-cols-4 gap-3">
                        {achievementColors.map((colorClass, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setFormData({ ...formData, colorIndex: index })}
                                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${colorClass} transition-all ${
                                    formData.colorIndex === index
                                        ? 'ring-4 ring-white scale-110'
                                        : 'hover:scale-105'
                                }`}
                            >
                                {formData.colorIndex === index && (
                                    <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="glass-panel p-4">
                    <p className="text-xs text-gray-400 mb-3">Preview</p>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${achievementColors[formData.colorIndex]} shadow-lg flex items-center justify-center`}>
                            <FontAwesomeIcon icon={achievementIcons[formData.iconIndex]} className="text-2xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">{formData.title || 'Your Achievement'}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2">{formData.description || 'Description will appear here'}</p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-3 rounded-xl transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-fire-orange to-fire-red text-white px-6 py-3 rounded-xl hover:shadow-[0_0_30px_rgba(255,94,0,0.5)] transition-all font-semibold"
                    >
                        {initialData ? 'Update' : 'Add'} Achievement
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Achievement Detail Modal
function AchievementDetailModal({ isOpen, onClose, achievement, onEdit, onDelete }) {
    if (!achievement) return null;

    const icon = achievementIcons[achievement.iconIndex || 0];
    const colorClass = achievementColors[achievement.colorIndex || 0];
    const date = new Date(achievement.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6">
                {/* Icon and Title */}
                <div className="text-center">
                    <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${colorClass} shadow-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
                        <FontAwesomeIcon icon={icon} className="text-5xl text-white relative z-10" />
                    </div>
                    <h2 className="header-font text-3xl fire-text mb-2">{achievement.title}</h2>
                    <p className="text-gray-400 flex items-center gap-2 justify-center">
                        <FontAwesomeIcon icon={faCalendar} />
                        {date}
                    </p>
                </div>

                {/* Description */}
                {achievement.description && (
                    <div className="glass-panel p-6">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {achievement.description}
                        </p>
                    </div>
                )}

                {/* Motivational Quote */}
                <div className="glass-panel p-6 bg-gradient-to-br from-fire-orange/10 to-fire-red/10 border-fire-orange/30">
                    <p className="text-center italic text-gray-300">
                        "Remember this moment when you need strength. You've done it before, you can do it again."
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => onEdit(achievement)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this achievement?')) {
                                onDelete(achievement.id);
                            }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}