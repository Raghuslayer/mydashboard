import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { Link } from 'react-router-dom';
import LifeVisualization from '../components/LifeVisualization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck, faTableCellsLarge, faPenNib, faBullseye, faFire, faRocket } from '@fortawesome/free-solid-svg-icons';
import { calculateDaysSinceBirth, calculateProgressPercentage } from '../utils/lifeCalculations';
import { routineTabs, staticData } from '../data/staticData';

export default function Overview() {
    const { userData, userProfile, checkedStates, dailyTasks, customRoutineTasks } = useData();

    // Calculate today's progress
    const todayProgress = React.useMemo(() => {
        let completed = 0;
        let total = 0;

        // Count routine tasks
        routineTabs.forEach(tabId => {
            const isEditable = ['morning', 'deepWork', 'night', 'vault', 'learning', 'commitments', 'neverDo', 'mustDo', 'skills'].includes(tabId);
            const items = isEditable ? (customRoutineTasks[tabId] || []) : (staticData[tabId] || []);
            total += items.length;

            const tabState = checkedStates[tabId] || {};
            if (isEditable && typeof tabState === 'object' && !Array.isArray(tabState)) {
                completed += Object.values(tabState).filter(Boolean).length;
            } else {
                const states = Array.isArray(tabState) ? tabState : Object.values(tabState);
                completed += states.filter(Boolean).length;
            }
        });

        // Count daily tasks
        total += dailyTasks.length;
        completed += dailyTasks.filter(t => t.done).length;

        return { completed, total, percentage: calculateProgressPercentage(completed, total) };
    }, [checkedStates, dailyTasks, customRoutineTasks]);

    const xpProgress = (userData.xp % 100);

    return (
        <div className="space-y-6 animate-in">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-fire-orange/5 to-fire-red/5"></div>
                <div className="relative z-10">
                    <h1 className="header-font text-5xl fire-text mb-2">
                        {getGreeting()}, {userProfile.name || 'Warrior'}!
                    </h1>
                    <p className="text-gray-400 text-lg">Your journey of transformation continues</p>

                    {/* Level & XP */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fire-orange to-fire-red flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-white">{userData.level}</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Level</p>
                                <p className="text-2xl font-bold">{userData.level}</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">XP Progress</span>
                                <span className="text-sm font-semibold text-fire-orange">{xpProgress}/100</span>
                            </div>
                            <div className="progress-track h-3 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="progress-fill h-full"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Life Summary - Compact View */}
            {userProfile.dob ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="header-font text-2xl">Life Overview</h2>
                        <Link
                            to="/dashboard/life-visualization"
                            className="text-sm text-fire-orange hover:text-fire-yellow transition-colors"
                        >
                            View Detailed →
                        </Link>
                    </div>
                    <LifeVisualization dob={userProfile.dob} compact={true} />
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6"
                >
                    <h3 className="text-lg font-semibold mb-2">Set Up Your Life Dashboard</h3>
                    <p className="text-gray-400 mb-4">Add your date of birth to visualize your life journey</p>
                    <Link
                        to="/dashboard/settings"
                        className="inline-block px-6 py-2 bg-gradient-to-r from-fire-orange to-fire-red text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        Go to Settings
                    </Link>
                </motion.div>
            )}

            {/* Today's Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6"
            >
                <h2 className="header-font text-2xl mb-4">Today's Progress</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Tasks Completed</span>
                            <span className="text-lg font-bold">
                                {todayProgress.completed} / {todayProgress.total}
                            </span>
                        </div>
                        <div className="progress-track h-4 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${todayProgress.percentage}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="progress-fill h-full"
                            ></motion.div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{todayProgress.percentage}% Complete</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="header-font text-2xl mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionCard
                        to="/dashboard/tasks"
                        icon={faListCheck}
                        label="Daily Tasks"
                        color="orange"
                        delay={0.5}
                    />
                    <QuickActionCard
                        to="/dashboard/matrix"
                        icon={faTableCellsLarge}
                        label="Priority Matrix"
                        color="red"
                        delay={0.6}
                    />
                    <QuickActionCard
                        to="/dashboard/journal"
                        icon={faPenNib}
                        label="Journal"
                        color="yellow"
                        delay={0.7}
                    />
                    <QuickActionCard
                        to="/dashboard/goal"
                        icon={faBullseye}
                        label="Main Goal"
                        color="orange"
                        delay={0.8}
                    />
                </div>
            </motion.div>

            {/* Main Goal Display */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel p-8 text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-fire-orange/10 to-fire-red/10"></div>
                <div className="relative z-10">
                    <FontAwesomeIcon icon={faRocket} className="text-4xl text-fire-orange mb-4" />
                    <h2 className="header-font text-3xl fire-text mb-2">Your Main Goal</h2>
                    <p className="text-2xl font-semibold text-white">{userData.goal}</p>
                </div>
            </motion.div>
        </div>
    );
}

function QuickActionCard({ to, icon, label, color, delay }) {
    const colorClasses = {
        orange: 'from-fire-orange/20 to-fire-orange/5 hover:shadow-[0_0_20px_rgba(255,94,0,0.3)]',
        red: 'from-fire-red/20 to-fire-red/5 hover:shadow-[0_0_20px_rgba(255,42,0,0.3)]',
        yellow: 'from-fire-yellow/20 to-fire-yellow/5 hover:shadow-[0_0_20px_rgba(255,157,0,0.3)]',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <Link
                to={to}
                className={`glass-panel p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${colorClasses[color]}`}
            >
                <FontAwesomeIcon icon={icon} className="text-3xl text-fire-orange" />
                <span className="text-sm font-semibold text-center">{label}</span>
            </Link>
        </motion.div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
}
