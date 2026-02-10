import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    calculateDaysSinceBirth,
    calculateDaysToFuture,
    calculateLifetimeDays,
    calculateProgressPercentage,
    calculateAge,
    calculateWeeksSinceBirth,
    calculateLifetimeWeeks,
    formatDaysToReadable,
    EXPECTED_LIFETIME_YEARS,
    COLLEGE_PERIOD_YEARS
} from '../utils/lifeCalculations';

export default function LifeVisualization({ dob, compact = false }) {
    const lifeStats = useMemo(() => {
        if (!dob) return null;

        const daysSinceBirth = calculateDaysSinceBirth(dob);
        const age = calculateAge(dob);
        const weeksSinceBirth = calculateWeeksSinceBirth(dob);

        // Total expected lifetime
        const totalLifetimeDays = calculateLifetimeDays(dob, EXPECTED_LIFETIME_YEARS);
        const totalLifetimeWeeks = calculateLifetimeWeeks(EXPECTED_LIFETIME_YEARS);

        // Days/weeks remaining to expected end of life
        const daysLeft = Math.max(0, totalLifetimeDays - daysSinceBirth);
        const weeksLeft = Math.max(0, totalLifetimeWeeks - weeksSinceBirth);

        // College period (4 years from now)
        const now = new Date();
        const collegeDaysLeft = calculateDaysToFuture(now, COLLEGE_PERIOD_YEARS);
        const collegeWeeksLeft = Math.floor(collegeDaysLeft / 7);

        // Progress percentages
        const lifeProgress = calculateProgressPercentage(daysSinceBirth, totalLifetimeDays);

        return {
            age,
            daysSinceBirth,
            weeksSinceBirth,
            totalLifetimeDays,
            totalLifetimeWeeks,
            daysLeft,
            weeksLeft,
            collegeDaysLeft,
            collegeWeeksLeft,
            lifeProgress
        };
    }, [dob]);

    if (!lifeStats) {
        return (
            <div className="glass-panel p-8 text-center">
                <p className="text-gray-400">Set your date of birth to visualize your life journey</p>
            </div>
        );
    }

    if (compact) {
        return <CompactView stats={lifeStats} />;
    }

    return <DetailedView stats={lifeStats} dob={dob} />;
}

function CompactView({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Days Gone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-4 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-900/10"></div>
                <div className="relative z-10">
                    <h3 className="text-sm text-gray-400 mb-2">Days Lived</h3>
                    <p className="text-3xl font-bold text-red-400">{stats.daysSinceBirth.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.lifeProgress}% of expected life</p>
                </div>
            </motion.div>

            {/* College Days Left */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-4 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-900/10"></div>
                <div className="relative z-10">
                    <h3 className="text-sm text-gray-400 mb-2">College Period Left</h3>
                    <p className="text-3xl font-bold text-green-400">{stats.collegeDaysLeft.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDaysToReadable(stats.collegeDaysLeft)}</p>
                </div>
            </motion.div>

            {/* Life Days Left */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-4 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-900/10"></div>
                <div className="relative z-10">
                    <h3 className="text-sm text-gray-400 mb-2">Life Days Left</h3>
                    <p className="text-3xl font-bold text-emerald-400">{stats.daysLeft.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Until age {EXPECTED_LIFETIME_YEARS}</p>
                </div>
            </motion.div>
        </div>
    );
}

function DetailedView({ stats, dob }) {
    // Create week grid (each cell = 1 week)
    const weekGrid = useMemo(() => {
        const grid = [];
        const totalWeeks = stats.totalLifetimeWeeks;
        const passedWeeks = stats.weeksSinceBirth;

        for (let i = 0; i < totalWeeks; i++) {
            grid.push({
                index: i,
                passed: i < passedWeeks,
                isCurrentWeek: i === passedWeeks
            });
        }

        return grid;
    }, [stats]);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Your Age"
                    value={`${stats.age} years`}
                    color="blue"
                    delay={0}
                />
                <StatCard
                    label="Weeks Lived"
                    value={stats.weeksSinceBirth.toLocaleString()}
                    color="red"
                    delay={0.1}
                />
                <StatCard
                    label="Weeks Left (College)"
                    value={stats.collegeWeeksLeft.toLocaleString()}
                    color="green"
                    delay={0.2}
                />
                <StatCard
                    label="Weeks Left (Life)"
                    value={stats.weeksLeft.toLocaleString()}
                    color="emerald"
                    delay={0.3}
                />
            </div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-6"
            >
                <h3 className="text-lg font-semibold mb-4">Life Progress</h3>
                <div className="progress-track h-4 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.lifeProgress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-red-500 to-red-700"
                    ></motion.div>
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">
                    {stats.lifeProgress}% of expected lifetime ({EXPECTED_LIFETIME_YEARS} years)
                </p>
            </motion.div>

            {/* Week Grid Visualization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Life in Weeks</h3>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span className="text-gray-400">Lived</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span className="text-gray-400">Remaining</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-[2px] overflow-auto max-h-[400px] custom-scrollbar"
                    style={{
                        gridTemplateColumns: 'repeat(52, minmax(8px, 1fr))',
                    }}>
                    {weekGrid.map((week, idx) => (
                        <motion.div
                            key={week.index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: Math.min(idx * 0.001, 2) }}
                            className={`aspect-square rounded-sm ${week.isCurrentWeek
                                    ? 'bg-yellow-500 ring-2 ring-yellow-400'
                                    : week.passed
                                        ? 'bg-red-500/80 hover:bg-red-400'
                                        : 'bg-green-500/80 hover:bg-green-400'
                                } transition-colors cursor-pointer`}
                            title={`Week ${week.index + 1} ${week.passed ? '(Lived)' : '(Future)'}`}
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Each square represents one week of your life. Current week highlighted in yellow.
                </p>
            </motion.div>
        </div>
    );
}

function StatCard({ label, value, color, delay }) {
    const colors = {
        blue: 'from-blue-500/10 to-blue-900/10 text-blue-400',
        red: 'from-red-500/10 to-red-900/10 text-red-400',
        green: 'from-green-500/10 to-green-900/10 text-green-400',
        emerald: 'from-emerald-500/10 to-emerald-900/10 text-emerald-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-panel p-4 relative overflow-hidden"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}></div>
            <div className="relative z-10">
                <h3 className="text-xs text-gray-400 mb-1">{label}</h3>
                <p className={`text-2xl font-bold ${colors[color].split(' ')[2]}`}>{value}</p>
            </div>
        </motion.div>
    );
}
