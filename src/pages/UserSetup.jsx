import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { validateDOB } from '../utils/lifeCalculations';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCake, faUser, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

export default function UserSetup() {
    const { updateUserProfile } = useData();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [collegeStart, setCollegeStart] = useState('');
    const [collegeEnd, setCollegeEnd] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate DOB
        const validation = validateDOB(dob);
        if (!validation.valid) {
            setError(validation.error);
            return;
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

        setLoading(true);
        try {
            // Save profile
            await updateUserProfile({
                dob: dob,
                name: name.trim() || 'User',
                theme: 'intense', // Default theme
                collegeStartDate: collegeStart || null,
                collegeEndDate: collegeEnd || null
            });

            // Navigate to overview
            setTimeout(() => {
                navigate('/dashboard/overview');
            }, 500);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError('Failed to save profile. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass-panel p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="header-font text-4xl fire-text mb-2"
                        >
                            WELCOME
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-400"
                        >
                            Let's set up your life dashboard
                        </motion.p>
                    </div>

                    {/* College Dates (Optional) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-fire-orange" />
                                College Period (Optional)
                            </label>
                            <span className="text-xs text-gray-500">Skip if not applicable</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={collegeStart}
                                    onChange={(e) => setCollegeStart(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={collegeEnd}
                                    onChange={(e) => setCollegeEnd(e.target.value)}
                                    min={collegeStart}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        {collegeStart && collegeEnd && (
                            <p className="text-xs text-gray-500">
                                Duration: {Math.floor((new Date(collegeEnd) - new Date(collegeStart)) / (1000 * 60 * 60 * 24 * 365.25))} years
                            </p>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all"
                            />
                        </motion.div>

                        {/* DOB Input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-fire-orange focus:ring-1 focus:ring-fire-orange transition-all
                                [color-scheme:dark]"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                This helps us visualize your life journey and remaining time
                            </p>
                        </motion.div>

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

                        {/* Submit Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-fire-orange to-fire-red text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,94,0,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Setting up...' : 'Start Your Journey'}
                        </motion.button>
                    </form>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 text-center"
                    >
                        <p className="text-xs text-gray-500">
                            Your data is securely stored and only visible to you
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
