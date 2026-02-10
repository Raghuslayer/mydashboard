import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrophy, faMedal, faStar, faAward, faCrown,
    faFire, faRocket, faBolt, faGem, faHeart
} from '@fortawesome/free-solid-svg-icons';

const achievementsList = [
    { id: 'first_day', name: 'First Step', description: 'Completed your first day', icon: faStar, requiredDays: 1, color: 'from-gray-400 to-gray-600' },
    { id: 'week_warrior', name: 'Week Warrior', description: '7 days streak', icon: faMedal, requiredDays: 7, color: 'from-blue-400 to-blue-600' },
    { id: 'month_master', name: 'Month Master', description: '30 days streak', icon: faTrophy, requiredDays: 30, color: 'from-purple-400 to-purple-600' },
    { id: 'legendary', name: 'Legendary', description: '100 days streak', icon: faCrown, requiredDays: 100, color: 'from-yellow-400 to-orange-600' },
    { id: 'year_one', name: 'Year One', description: '365 days streak', icon: faGem, requiredDays: 365, color: 'from-pink-400 to-red-600' },
];

export default function AchievementBadges({ streakData }) {
    const { currentStreak, longestStreak } = streakData;
    const bestStreak = Math.max(currentStreak, longestStreak);

    const getUnlockedAchievements = () => {
        return achievementsList.filter(achievement => bestStreak >= achievement.requiredDays);
    };

    const getNextAchievement = () => {
        return achievementsList.find(achievement => bestStreak < achievement.requiredDays);
    };

    const unlockedAchievements = getUnlockedAchievements();
    const nextAchievement = getNextAchievement();

    return (
        <div className="space-y-4">
            {/* Achievement showcase */}
            {unlockedAchievements.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faTrophy} className="text-fire-orange text-xl" />
                        <h3 className="text-lg font-semibold">Achievements Unlocked</h3>
                        <span className="ml-auto text-sm text-gray-400">{unlockedAchievements.length}/{achievementsList.length}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {unlockedAchievements.map((achievement, index) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className={`aspect-square rounded-2xl bg-gradient-to-br ${achievement.color} p-4 flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer`}>
                                    <FontAwesomeIcon icon={achievement.icon} className="text-white text-3xl mb-2" />
                                    <p className="text-white text-xs font-semibold text-center">{achievement.name}</p>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    <p className="text-white text-xs font-semibold">{achievement.name}</p>
                                    <p className="text-gray-400 text-xs">{achievement.description}</p>
                                </div>

                                {/* Shine effect */}
                                <motion.div
                                    animate={{
                                        opacity: [0, 0.5, 0],
                                        x: [-100, 100]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: index * 0.5
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Next achievement goal */}
            {nextAchievement && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-6 bg-gradient-to-br from-fire-orange/5 to-fire-red/5 border-fire-orange/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center relative">
                            <FontAwesomeIcon icon={nextAchievement.icon} className="text-gray-400 text-2xl" />
                            <div className="absolute inset-0 bg-white/5 rounded-xl backdrop-blur-sm flex items-center justify-center">
                                <span className="text-3xl">🔒</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Next Achievement</p>
                            <p className="font-semibold text-lg">{nextAchievement.name}</p>
                            <p className="text-xs text-gray-400">{nextAchievement.description}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold fire-text">{nextAchievement.requiredDays - bestStreak}</p>
                            <p className="text-xs text-gray-400">days to go</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(bestStreak / nextAchievement.requiredDays) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-fire-orange to-fire-red rounded-full"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {bestStreak} / {nextAchievement.requiredDays} days
                        </p>
                    </div>
                </motion.div>
            )}

            {/* No achievements yet */}
            {unlockedAchievements.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-panel p-8 text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <FontAwesomeIcon icon={faTrophy} className="text-gray-500 text-3xl" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start Your Achievement Journey</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Complete tasks daily to unlock achievements and build your streak. Your first badge is just one day away!
                    </p>
                </motion.div>
            )}
        </div>
    );
}
