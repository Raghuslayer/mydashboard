import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine, faFire, faTrophy, faCalendar, faCrosshairs,
    faArrowUp, faArrowDown, faMedal, faLightbulb
} from '@fortawesome/free-solid-svg-icons';

export default function Analytics() {
    const { historyData, userData, dailyTaskHistory } = useData();
    const [timeRange, setTimeRange] = useState('month'); // week, month, year, all

    // Calculate analytics
    const analytics = useMemo(() => {
        let relevantData = historyData;

        if (timeRange === 'week') {
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            relevantData = historyData.filter(d => new Date(d.date).getTime() >= weekAgo);
        } else if (timeRange === 'month') {
            const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            relevantData = historyData.filter(d => new Date(d.date).getTime() >= monthAgo);
        } else if (timeRange === 'year') {
            const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
            relevantData = historyData.filter(d => new Date(d.date).getTime() >= yearAgo);
        }

        const totalDays = relevantData.length;
        const totalCompleted = relevantData.reduce((sum, d) => sum + (d.completed || 0), 0);
        const totalTasks = relevantData.reduce((sum, d) => sum + (d.total || 0), 0);
        const avgCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

        // Find best day
        let bestDay = null;
        let bestCompletion = 0;
        relevantData.forEach(d => {
            const completion = d.total > 0 ? (d.completed / d.total) * 100 : 0;
            if (completion > bestCompletion) {
                bestCompletion = completion;
                bestDay = d;
            }
        });

        // Calculate streak
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        const sortedData = [...relevantData].sort((a, b) => new Date(a.date) - new Date(b.date));
        sortedData.forEach((d, idx) => {
            const completion = d.total > 0 ? (d.completed / d.total) * 100 : 0;
            if (completion >= 50) {
                tempStreak++;
                if (idx === sortedData.length - 1) currentStreak = tempStreak;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 0;
            }
        });
        maxStreak = Math.max(maxStreak, tempStreak);

        return {
            totalDays,
            totalCompleted,
            totalTasks,
            avgCompletion,
            bestDay,
            bestCompletion,
            currentStreak,
            maxStreak
        };
    }, [historyData, timeRange]);

    // Generate heatmap data based on time range
    const heatmapData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let startDate = new Date(today);

        // Determine start date based on time range
        if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate.setDate(startDate.getDate() - 30);
        } else if (timeRange === 'year') {
            startDate.setDate(startDate.getDate() - 365);
        } else if (timeRange === 'all') {
            // Find earliest date in history
            if (historyData.length > 0) {
                const sortedData = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date));
                startDate = new Date(sortedData[0].date);
            } else {
                startDate.setDate(startDate.getDate() - 365);
            }
        }

        const weeks = [];
        let currentWeek = [];

        // Fixed: Create new date object each iteration to avoid mutation
        for (let d = new Date(startDate); d <= today; ) {
            const dateStr = d.toISOString().split('T')[0];
            const dayData = historyData.find(h => h.date === dateStr);
            const completion = dayData && dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;

            currentWeek.push({
                date: dateStr,
                completion,
                dayOfWeek: d.getDay()
            });

            if (d.getDay() === 6 || d.getTime() === today.getTime()) {
                weeks.push([...currentWeek]);
                currentWeek = [];
            }

            // Increment date properly
            d.setDate(d.getDate() + 1);
        }

        return weeks;
    }, [historyData, timeRange]);

    // Calculate month labels with exact week-column spans for perfect alignment
    const monthLabels = useMemo(() => {
        if (heatmapData.length === 0) return [];

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Walk through each week-column and tally how many columns each month owns
        const monthSpans = [];
        let currentLabel = null;
        let currentCount = 0;

        heatmapData.forEach((week) => {
            // Identify the month of the first day in this week
            const monthKey = monthNames[new Date(week[0].date).getMonth()];
            if (monthKey !== currentLabel) {
                if (currentLabel !== null) {
                    monthSpans.push({ label: currentLabel, cols: currentCount });
                }
                currentLabel = monthKey;
                currentCount = 1;
            } else {
                currentCount++;
            }
        });
        if (currentLabel !== null) {
            monthSpans.push({ label: currentLabel, cols: currentCount });
        }

        return monthSpans;
    }, [heatmapData]);

    // Get intensity color
    const getIntensityColor = (completion) => {
        if (completion === 0) return 'bg-white/5';
        if (completion < 25) return 'bg-blue-900/40';
        if (completion < 50) return 'bg-blue-700/60';
        if (completion < 75) return 'bg-cyan-600/70';
        return 'bg-emerald-600/80';
    };

    const getIntensityGlow = (completion) => {
        if (completion === 0) return '';
        if (completion < 25) return 'shadow-[0_0_10px_rgba(30,58,95,0.5)]';
        if (completion < 50) return 'shadow-[0_0_15px_rgba(30,144,255,0.5)]';
        if (completion < 75) return 'shadow-[0_0_20px_rgba(0,217,255,0.5)]';
        return 'shadow-[0_0_25px_rgba(16,185,129,0.5)]';
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-emerald-600/10"></div>
                <div className="relative z-10">
                    <h1 className="header-font text-4xl fire-text mb-2 flex items-center gap-3">
                        <FontAwesomeIcon icon={faChartLine} className="text-3xl" />
                        Analytics & Insights
                    </h1>
                    <p className="text-gray-400">
                        Track your progress and visualize your consistency over time.
                    </p>
                </div>
            </motion.div>

            {/* Time Range Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-4"
            >
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'week', label: '📅 This Week' },
                        { id: 'month', label: '📆 This Month' },
                        { id: 'year', label: '📊 This Year' },
                        { id: 'all', label: '🎯 All Time' }
                    ].map(range => (
                        <button
                            key={range.id}
                            onClick={() => setTimeRange(range.id)}
                            className={`px-4 py-2 font-medium transition-all ${
                                timeRange === range.id
                                    ? 'bg-[var(--color-primary)] text-black shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Key Metrics - Simplified */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
                {[
                    {
                        label: 'Completion',
                        value: `${analytics.avgCompletion}%`,
                        icon: faCrosshairs,
                        color: 'from-blue-600 to-blue-800',
                        trend: analytics.avgCompletion >= 75 ? 'up' : 'down'
                    },
                    {
                        label: 'Current Streak',
                        value: analytics.currentStreak,
                        icon: faFire,
                        color: 'from-orange-600 to-orange-800',
                        trend: analytics.currentStreak > 0 ? 'up' : 'down'
                    },
                    {
                        label: 'Best Streak',
                        value: analytics.maxStreak,
                        icon: faTrophy,
                        color: 'from-amber-600 to-amber-800',
                        trend: 'neutral'
                    },
                    {
                        label: 'Total XP',
                        value: userData.xp,
                        icon: faMedal,
                        color: 'from-emerald-600 to-emerald-800',
                        trend: 'up'
                    }
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + idx * 0.05 }}
                        className="glass-panel p-3 md:p-4 relative overflow-hidden group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10 group-hover:opacity-15 transition-opacity`}></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-2">
                                <FontAwesomeIcon icon={metric.icon} className="text-lg md:text-xl text-[var(--color-primary)]" />
                                {metric.trend === 'up' && (
                                    <FontAwesomeIcon icon={faArrowUp} className="text-emerald-500 text-xs" />
                                )}
                                {metric.trend === 'down' && (
                                    <FontAwesomeIcon icon={faArrowDown} className="text-red-500 text-xs" />
                                )}
                            </div>
                            <p className="text-2xl md:text-3xl font-bold mb-1">{metric.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{metric.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6"
            >
                <h2 className="header-font text-2xl fire-text mb-6 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} />
                    Your Consistency ({timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : timeRange === 'year' ? 'This Year' : 'All Time'})
                </h2>

                <div className="overflow-x-auto pb-4">
                    <div className="inline-block min-w-full">
                        {/* Month labels - each label width = cols * (cell 20px + gap 2px) */}
                        <div className="flex gap-0 mb-1">
                            <div className="w-12 shrink-0"></div>
                            {monthLabels.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="text-xs text-gray-500 text-left font-semibold overflow-hidden"
                                    style={{ width: `${item.cols * 22}px`, minWidth: 0 }}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>

                        {/* Heatmap grid — cell=20px, gap=2px → each col = 22px */}
                        <div className="flex gap-0">
                            {/* Day labels */}
                            <div className="flex flex-col gap-0.5 w-12 shrink-0 mr-0">
                                {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((day, idx) => (
                                    <div key={idx} className="h-5 flex items-center justify-end pr-1 text-xs text-gray-600 font-medium">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Weeks — rendered with explicit gap so cols = 22px each */}
                            <div className="flex gap-0.5">
                                {heatmapData.map((week, weekIdx) => (
                                    <div key={weekIdx} className="flex flex-col gap-0.5">
                                        {week.map((day, dayIdx) => (
                                            <motion.div
                                                key={`${weekIdx}-${dayIdx}`}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: (weekIdx * 7 + dayIdx) * 0.005 }}
                                                className={`w-5 h-5 border border-white/10 cursor-pointer transition-all hover:scale-150 hover:z-10 ${getIntensityColor(day.completion)} ${getIntensityGlow(day.completion)}`}
                                                style={{ borderRadius: '2px' }}
                                                title={`${day.date}: ${Math.round(day.completion)}% complete`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                    <span className="text-gray-400 font-semibold">Completion Level:</span>
                    <div className="flex gap-3 flex-wrap justify-center">
                        {[
                            { color: 'bg-white/5', label: 'None' },
                            { color: 'bg-blue-900/40', label: '1-25%' },
                            { color: 'bg-blue-700/60', label: '26-50%' },
                            { color: 'bg-cyan-600/70', label: '51-75%' },
                            { color: 'bg-emerald-600/80', label: '76-100%' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`w-4 h-4 ${item.color} border border-white/10`} style={{ borderRadius: '2px' }}></div>
                                <span className="text-gray-400">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Insights - Simplified & Motivating */}
            {analytics.bestDay && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-panel p-6 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 border-emerald-600/30"
                >
                    <h3 className="header-font text-lg md:text-xl fire-text mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLightbulb} />
                        Your Progress
                    </h3>
                    <div className="space-y-2 text-sm md:text-base text-gray-300">
                        {analytics.currentStreak > 0 && (
                            <p className="flex items-center gap-2">
                                <span className="text-lg">🔥</span>
                                <span><span className="font-bold text-fire-orange">{analytics.currentStreak} day streak</span> - Keep it going!</span>
                            </p>
                        )}
                        <p className="flex items-center gap-2">
                            <span className="text-lg">📊</span>
                            <span>Completing <span className="font-bold text-cyan-400">{analytics.avgCompletion}%</span> of tasks on average</span>
                        </p>
                        {analytics.avgCompletion >= 75 && (
                            <p className="flex items-center gap-2 text-emerald-400">
                                <span className="text-lg">✨</span>
                                <span><span className="font-bold">Exceptional consistency!</span> You're crushing it.</span>
                            </p>
                        )}
                        {analytics.avgCompletion >= 50 && analytics.avgCompletion < 75 && (
                            <p className="flex items-center gap-2 text-amber-400">
                                <span className="text-lg">💪</span>
                                <span>You're on track. <span className="font-bold">Push a bit harder</span> to reach 75%.</span>
                            </p>
                        )}
                        {analytics.avgCompletion < 50 && (
                            <p className="flex items-center gap-2 text-amber-400">
                                <span className="text-lg">🎯</span>
                                <span><span className="font-bold">Focus on consistency.</span> Small daily wins compound.</span>
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
