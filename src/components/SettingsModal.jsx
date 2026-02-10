import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faCake, faPalette, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import ThemeSwitcher from './ThemeSwitcher';
import { validateDOB, calculateAge } from '../utils/lifeCalculations';

export default function SettingsModal({ isOpen, onClose }) {
    const { userProfile, updateUserProfile } = useData();
    const [name, setName] = useState(userProfile.name || '');
    const [dob, setDob] = useState(userProfile.dob || '');
    const [collegeStart, setCollegeStart] = useState(userProfile.collegeStartDate || '');
    const [collegeEnd, setCollegeEnd] = useState(userProfile.collegeEndDate || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setError('');

        // Validate DOB if changed
        if (dob && dob !== userProfile.dob) {
            const validation = validateDOB(dob);
            if (!validation.valid) {
                setError(validation.error);
                return;
            }
        }

        // Validate college dates if provided
        if (collegeStart && collegeEnd) {
            const start = new Date(collegeStart);
            const end = new Date(collegeEnd);
            if (end <= start) {
                setError('College end date must be after start date');
                return;
            }
        }

        setSaving(true);
        try {
            await updateUserProfile({
                name: name.trim() || 'User',
                dob: dob || userProfile.dob,
                collegeStartDate: collegeStart || null,
                collegeEndDate: collegeEnd || null
            });

            setTimeout(() => {
                setSaving(false);
                onClose();
            }, 500);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError('Failed to save settings. Please try again.');
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="glass-panel w-full max-w-md p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>

                            {/* Header */}
                            <h2 className="header-font text-3xl fire-text mb-6">Settings</h2>

                            {/* Form */}
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FontAwesomeIcon icon={faUser} className="text-fire-orange" />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all"
                                    />
                                </div>

                                {/* DOB */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FontAwesomeIcon icon={faCake} className="text-fire-orange" />
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all [color-scheme:dark]"
                                    />
                                    {dob && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Age: {calculateAge(dob)} years
                                        </p>
                                    )}
                                </div>

                                {/* College Dates */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FontAwesomeIcon icon={faGraduationCap} className="text-fire-orange" />
                                        College Period (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Start</label>
                                            <input
                                                type="date"
                                                value={collegeStart}
                                                onChange={(e) => setCollegeStart(e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">End</label>
                                            <input
                                                type="date"
                                                value={collegeEnd}
                                                onChange={(e) => setCollegeEnd(e.target.value)}
                                                min={collegeStart}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Theme Switcher */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FontAwesomeIcon icon={faPalette} className="text-fire-orange" />
                                        Theme
                                    </label>
                                    <ThemeSwitcher />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                                    >
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.5)] transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
