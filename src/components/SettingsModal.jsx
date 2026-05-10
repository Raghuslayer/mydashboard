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
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setError('');
        setSuccess(false);

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

            setSuccess(true);
            setTimeout(() => {
                setSaving(false);
                onClose();
            }, 800);
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
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 30 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="glass-panel w-full max-w-md p-8 relative depth-5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white btn-3d"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>

                            {/* Header */}
                            <h2 className="header-font text-3xl fire-text mb-8 animate-slide-in-left">SETTINGS</h2>

                            {/* Form */}
                            <div className="space-y-6">
                                {/* Name */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faUser} className="text-[var(--color-primary)]" />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-[rgba(30,41,59,0.6)] border border-[var(--color-border)] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_20px_var(--color-glow)] transition-all"
                                    />
                                </motion.div>

                                {/* DOB */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faCake} className="text-[var(--color-primary)]" />
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full bg-[rgba(30,41,59,0.6)] border border-[var(--color-border)] px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_20px_var(--color-glow)] transition-all"
                                    />
                                </motion.div>

                                {/* College Start */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faGraduationCap} className="text-[var(--color-primary)]" />
                                        College Start
                                    </label>
                                    <input
                                        type="date"
                                        value={collegeStart}
                                        onChange={(e) => setCollegeStart(e.target.value)}
                                        className="w-full bg-[rgba(30,41,59,0.6)] border border-[var(--color-border)] px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_20px_var(--color-glow)] transition-all"
                                    />
                                </motion.div>

                                {/* College End */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faGraduationCap} className="text-[var(--color-primary)]" />
                                        College End
                                    </label>
                                    <input
                                        type="date"
                                        value={collegeEnd}
                                        onChange={(e) => setCollegeEnd(e.target.value)}
                                        className="w-full bg-[rgba(30,41,59,0.6)] border border-[var(--color-border)] px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_20px_var(--color-glow)] transition-all"
                                    />
                                </motion.div>

                                {/* Theme Switcher */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="pb-2"
                                >
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                                        <FontAwesomeIcon icon={faPalette} className="text-[var(--color-primary)]" />
                                        Theme
                                    </label>
                                    <div className="mb-4">
                                        <ThemeSwitcher />
                                    </div>
                                </motion.div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-900/30 border border-red-600 px-4 py-3 text-red-300 text-sm font-medium animate-shake"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Success Message */}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-900/30 border border-green-600 px-4 py-3 text-green-300 text-sm font-medium"
                                    >
                                        ✓ Settings saved successfully!
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 bg-[rgba(30,41,59,0.6)] hover:bg-[rgba(30,41,59,0.8)] text-gray-300 px-6 py-3 transition-all font-bold uppercase tracking-wider btn-3d"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white px-6 py-3 font-bold uppercase tracking-wider btn-3d disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <span className="animate-spin-fast">⚙️</span>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Settings'
                                        )}
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
