import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faCalendar, faTrophy } from '@fortawesome/free-solid-svg-icons';

export default function StreakTracker({ streakData }) {
    const { currentStreak, longestStreak, streakCalendar } = streakData;

    // Get last 30 days for calendar view
    const getLast30Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            days.push({
                date,
                dateKey,
                isActive: streakCalendar[dateKey] === true,
                isToday: i === 0
            });
        }
        return days;
    };

    const days = getLast30Days();

    return (
        <div className="space-y-4">
            {/* Streak Stats */}
            <div className="grid grid-cols-2 gap-4">
                {/* Current Streak */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel p-6 relative overflow-hidden group"
                >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-fire-orange/10 to-fire-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fire-orange to-fire-red flex items-center justify-center">
                                <FontAwesomeIcon icon={faFire} className="text-white text-lg" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Current Streak</p>
                                <motion.p
                                    key={currentStreak}
                                    initial={{ scale: 1.2, color: '#ff5e00' }}
                                    animate={{ scale: 1, color: '#fff' }}
                                    transition={{ duration: 0.3 }}
                                    className="text-3xl font-bold"
                                >
                                    {currentStreak}
                                </motion.p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">days in a row</p>

                        {/* Fire effect for high streaks */}
                        {currentStreak >= 7 && (
                            <motion.div
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -top-2 -right-2 text-4xl"
                            >
                                🔥
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Longest Streak */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="glass-panel p-6 relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fire-yellow to-fire-orange flex items-center justify-center">
                            <FontAwesomeIcon icon={faTrophy} className="text-white text-lg" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Best Streak</p>
                            <p className="text-3xl font-bold">{longestStreak}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">personal record</p>
                </motion.div>
            </div>

            {/* Don't Break the Chain Calendar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-panel p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faCalendar} className="text-fire-orange" />
                    <h3 className="text-lg font-semibold">Last 30 Days</h3>
                </div>

                <div className="grid grid-cols-10 gap-2">
                    {days.map((day, index) => (
                        <motion.div
                            key={day.dateKey}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className={`aspect-square rounded-lg border-2 transition-all duration-300 relative group/day ${day.isActive
                                    ? 'bg-gradient-to-br from-fire-orange to-fire-red border-fire-orange shadow-[0_0_10px_rgba(255,94,0,0.3)]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                } ${day.isToday ? 'ring-2 ring-fire-yellow' : ''
                                }`}
                            title={day.date.toLocaleDateString()}
                        >
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-xs rounded opacity-0 group-hover/day:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>

                            {day.isActive && (
                                <div className="absolute inset-0 flex items-center justify-center text-xs">
                                    ✓
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-fire-orange to-fire-red"></div>
                        <span>Active day</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white/5 border border-white/10"></div>
                        <span>Missed day</span>
                    </div>
                    {currentStreak > 0 && (
                        <div className="ml-auto text-fire-orange font-semibold">
                            Don't break the chain! 🔥
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Motivation Message */}
            {currentStreak === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-panel p-4 bg-fire-orange/5 border-fire-orange/30"
                >
                    <p className="text-sm text-center">
                        <span className="fire-text font-semibold">Start your streak today!</span>
                        <br />
                        <span className="text-gray-400 text-xs">Complete at least one task to begin building momentum</span>
                    </p>
                </motion.div>
            )}
        </div>
    );
}
