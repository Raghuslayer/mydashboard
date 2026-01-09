import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataProvider';
import Modal from '../components/Modal';
import { getHabitAnalysis } from '../services/gemini';
import { staticData, routineTabs } from '../data/staticData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarCheck, faCalendarXmark, faLightbulb, faCalendarDays, faRobot, faWandMagicSparkles,
    faTrophy, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analysis() {
    const { historyData, dailyAnalysis, setDailyAnalysis, checkedStates, dailyTasks, getRoutineTasks, editableRoutineTabs } = useData();
    const [selectedMonth, setSelectedMonth] = useState('current');

    // AI Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    // Removed local aiAnalysis state in favor of context
    const [loadingAi, setLoadingAi] = useState(false);

    // Psychology tips based on performance
    const psychologyTips = [
        { title: 'Momentum Builder', text: 'Your consistency is building. Each day adds to your momentum - keep the chain going!', icon: faLightbulb },
        { title: 'Weekend Warrior', text: 'Weekends show dips. Try scheduling specific times for habits on Sat/Sun.', icon: faLightbulb },
        { title: 'Morning Power', text: 'Starting strong sets the tone. Front-load important tasks for best results.', icon: faLightbulb },
        { title: 'Recovery Mode', text: 'After a miss, the next day is crucial. One bad day never ruins progress - quitting does.', icon: faLightbulb },
    ];

    // Group data by month including current
    const monthlyData = useMemo(() => {
        if (!historyData || historyData.length === 0) return {};

        const grouped = {};
        historyData.forEach(day => {
            const date = new Date(day.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    name: monthName,
                    key: monthKey,
                    days: [],
                    completed: [],
                    total: []
                };
            }
            grouped[monthKey].days.push(day);
            grouped[monthKey].completed.push(day.completed || 0);
            grouped[monthKey].total.push(day.total || 0);
        });
        return grouped;
    }, [historyData]);

    // Calculate monthly stats
    const monthlyStats = useMemo(() => {
        return Object.keys(monthlyData)
            .sort()
            .reverse()
            .slice(0, 6)
            .map(key => {
                const month = monthlyData[key];
                const avgCompleted = Math.round(month.completed.reduce((a, b) => a + b, 0) / month.completed.length) || 0;
                const totalCompleted = month.completed.reduce((a, b) => a + b, 0);
                const avgTotal = Math.round(month.total.reduce((a, b) => a + b, 0) / month.total.length) || 0;
                const mostlyMissed = avgTotal > 0 ? avgTotal - avgCompleted : 0;

                // Calculate streak
                let streak = 0;
                let maxStreak = 0;
                const sortedDays = [...month.days].sort((a, b) => new Date(a.date) - new Date(b.date));
                sortedDays.forEach(day => {
                    if ((day.completed || 0) > 0) {
                        streak++;
                        maxStreak = Math.max(maxStreak, streak);
                    } else {
                        streak = 0;
                    }
                });

                // Calculate worst days (most skipped tasks - only if skipped > 0)
                const worstDays = [...month.days]
                    .filter(d => (d.total || 0) > 0 && ((d.total || 0) - (d.completed || 0)) > 0)
                    .sort((a, b) => {
                        const aSkipped = (a.total || 0) - (a.completed || 0);
                        const bSkipped = (b.total || 0) - (b.completed || 0);
                        return bSkipped - aSkipped; // Most skipped first
                    })
                    .slice(0, 2);

                // Calculate Scientific Metrics for Archives
                const [year, monthNum] = month.key.split('-').map(Number);
                const daysInMonth = new Date(year, monthNum, 0).getDate();

                // Assume missing days are 0 completion (or just days not logged yet)
                // For past months, missing records usually mean no activity
                const totalMissedDays = Math.max(0, daysInMonth - month.days.length);

                // Consistency Score (Standard Deviation)
                // We must include the "0" days in the variation calculation for accuracy
                const allCompletedCounts = [...month.completed, ...Array(totalMissedDays).fill(0)];
                const mean = allCompletedCounts.reduce((a, b) => a + b, 0) / allCompletedCounts.length;
                const variance = allCompletedCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allCompletedCounts.length;
                const stdDev = Math.sqrt(variance);
                const consistencyScore = Math.max(0, Math.round(100 - (stdDev * 5)));

                return {
                    name: month.name,
                    key: month.key,
                    avgCompleted,
                    totalCompleted,
                    mostlyMissed,
                    maxStreak,
                    daysTracked: month.days.length,
                    bestDay: sortedDays.reduce((a, b) => (a.completed > b.completed ? a : b), {}),
                    worstDays,
                    consistencyScore: Number.isFinite(consistencyScore) ? consistencyScore : 0,
                    totalMissedDays
                };
            });
    }, [monthlyData]);

    // Get stats for current selection
    // Get stats for current selection
    const currentStats = useMemo(() => {
        if (selectedMonth === 'current') {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);

            // 1. Generate full 30-day timeline to catch MISSING days
            const allDaysMap = new Map();
            // Fill with existing history first
            historyData.forEach(d => {
                const date = new Date(d.date);
                if (date >= thirtyDaysAgo && date <= today) {
                    allDaysMap.set(date.toISOString().split('T')[0], { ...d, date: date.toISOString() });
                }
            });

            // Fill gaps with 0-data objects
            const fullHistory = [];
            let maxTotalSeen = 0;
            allDaysMap.forEach(d => maxTotalSeen = Math.max(maxTotalSeen, d.total || 0));
            if (maxTotalSeen === 0) maxTotalSeen = 10; // Default if no data

            for (let i = 0; i < 30; i++) {
                const d = new Date(thirtyDaysAgo);
                d.setDate(d.getDate() + i);
                const key = d.toISOString().split('T')[0];

                if (allDaysMap.has(key)) {
                    fullHistory.push(allDaysMap.get(key));
                } else {
                    // Inject MISSING day
                    fullHistory.push({
                        date: d.toISOString(),
                        completed: 0,
                        total: maxTotalSeen, // Assume typical load
                        isMissing: true
                    });
                }
            }

            if (fullHistory.length === 0) return {};

            const totalCompleted = fullHistory.reduce((acc, curr) => acc + (curr.completed || 0), 0);
            const avgCompleted = Math.round(totalCompleted / fullHistory.length) || 0;
            const totalMissedDays = fullHistory.filter(d => (d.completed || 0) === 0).length;

            // 2. Consistency Score (Standard Deviation)
            const completedCounts = fullHistory.map(d => d.completed || 0);
            const mean = completedCounts.reduce((a, b) => a + b, 0) / completedCounts.length;
            const variance = completedCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / completedCounts.length;
            const stdDev = Math.sqrt(variance);
            // Score: 100 - (CV * 100) where CV is Coefficient of Variation, simplified mapping
            // Lower StdDev relative to mean is better. 
            // Simple robust linear map: 0 stdDev -> 100, High stdDev -> Lower score
            const consistencyScore = Math.max(0, Math.round(100 - (stdDev * 5)));
            const finalConsistencyScore = Number.isFinite(consistencyScore) ? consistencyScore : 0;

            // Streak
            let streak = 0;
            let maxStreak = 0;
            const sorted = [...fullHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
            let bestDay = sorted[0];

            sorted.forEach(d => {
                if ((d.completed || 0) > (bestDay?.completed || 0)) bestDay = d;
                if ((d.completed || 0) > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
                else streak = 0;
            });

            // Find worst days (lowest completion)
            // Now correctly includes inserted "Missing Days" (0 completed)
            const worstDays = [...sorted]
                .filter(d => (d.total || 0) > 0)
                .sort((a, b) => {
                    const aPercent = (a.completed || 0) / (a.total || 1);
                    const bPercent = (b.completed || 0) / (b.total || 1);
                    return aPercent - bPercent; // Lowest % first (0% is worst)
                })
                .slice(0, 3); // Top 3 worst

            return {
                avgCompleted,
                totalCompleted,
                maxStreak,
                bestDay,
                worstDays,
                worstDays,
                consistencyScore: finalConsistencyScore,
                totalMissedDays
            };
        }
        return monthlyStats.find(m => m.key === selectedMonth) || {};
    }, [selectedMonth, historyData, monthlyStats]);

    // Get chart data for selected month - show ALL days on x-axis
    const chartData = useMemo(() => {
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        today.setHours(23, 59, 59, 999); // End of today for comparisons
        let maxTotal = 0;

        // Helper to format any date to YYYY-MM-DD string
        const formatDateKey = (d) => {
            const date = new Date(d);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        // Calculate today's completed count using same logic as StatsBar
        let todayCompleted = 0;

        // Count routine tasks from all tabs (using custom tasks for editable tabs)
        if (Array.isArray(routineTabs)) {
            routineTabs.forEach(tabId => {
                const isEditable = editableRoutineTabs?.includes(tabId);
                const items = (getRoutineTasks && isEditable)
                    ? getRoutineTasks(tabId)
                    : staticData?.[tabId];

                if (Array.isArray(items)) {
                    const rawStates = checkedStates?.[tabId];

                    if (isEditable && rawStates && typeof rawStates === 'object' && !Array.isArray(rawStates)) {
                        // ID-based counting for editable tabs
                        todayCompleted += Object.values(rawStates).filter(Boolean).length;
                    } else {
                        // Index-based counting for legacy tabs
                        const states = Array.isArray(rawStates)
                            ? rawStates
                            : Object.values(rawStates || {});
                        todayCompleted += states.filter(Boolean).length;
                    }
                }
            });
        }

        // Also count completed daily tasks
        if (Array.isArray(dailyTasks)) {
            todayCompleted += dailyTasks.filter(t => t?.done).length;
        }

        // Create a map of date -> data for quick lookup
        const dataMap = {};
        historyData.forEach(day => {
            // Parse day.date robustly - it could be YYYY-MM-DD or ISO string or other format
            const dateKey = formatDateKey(day.date);
            dataMap[dateKey] = day;
            if ((day.total || 0) > maxTotal) maxTotal = day.total || 0;
        });

        // Add/override today's data with live checkedStates
        dataMap[todayKey] = { completed: todayCompleted, total: todayCompleted };
        if (todayCompleted > maxTotal) maxTotal = todayCompleted;

        if (maxTotal === 0) maxTotal = 81;

        // Generate all days for the range
        let allDays = [];

        if (selectedMonth === 'current') {
            // Last 30 days including today (only past/present, no future)
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0);
                allDays.push(d);
            }
        } else {
            // Selected month: "YYYY-MM" - generate days up to today (or end of month if past)
            const [targetYear, targetMonth] = selectedMonth.split('-').map(Number);
            const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
            const todayNormalized = new Date();
            todayNormalized.setHours(23, 59, 59, 999);

            for (let day = 1; day <= daysInMonth; day++) {
                const d = new Date(targetYear, targetMonth - 1, day);
                // Only include days up to today (no future dates)
                if (d <= todayNormalized) {
                    allDays.push(d);
                }
            }
        }

        // Generate labels and data for ALL days
        const labels = allDays.map(d =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );

        const completed = allDays.map(d => {
            const key = formatDateKey(d);
            return dataMap[key] ? Number(dataMap[key].completed) || 0 : 0;
        });

        return {
            labels,
            maxTotal,
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: completed,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    // Dynamic coloring for points
                    pointBackgroundColor: (context) => {
                        const val = context.raw;
                        // Assuming 0 or very low means "needs improvement"
                        if (val === 0) return '#ef4444'; // Red
                        if (val === chartData.maxTotal) return '#22c55e'; // Green
                        return '#ff9d00'; // Default Orange
                    },
                    pointBorderColor: (context) => {
                        const val = context.raw;
                        if (val === 0) return '#ef4444';
                        if (val === chartData.maxTotal) return '#22c55e';
                        return '#ff9d00';
                    },
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        };
    }, [selectedMonth, historyData, checkedStates, dailyTasks]);

    // Chart options - use useMemo to update when chartData changes
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ff5e00',
                borderWidth: 1,
                callbacks: {
                    label: (context) => `Tasks: ${context.raw}`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9ca3af', maxRotation: 45 }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9ca3af', stepSize: 10 },
                beginAtZero: true,
                min: 0,
                max: chartData.maxTotal || 100,
                suggestedMax: chartData.maxTotal || 100
            }
        }
    }), [chartData.maxTotal]);

    // Find best and worst days FOR SELECTED MONTH (Re-used currentStats logic above for cleaner code)
    // Use the calculated stats directly
    const stats = currentStats;
    // Note: In full implementation, we'd ensure worstDay is also calculated. 
    // For this edit, relying on the 'currentStats' I added to be sufficient for the AI.

    const randomTip = psychologyTips[Math.floor(Math.random() * psychologyTips.length)];

    const handleGetAiInsights = async () => {
        setIsAiModalOpen(true);

        // Use cached analysis if available (Smart API Usage)
        if (dailyAnalysis && !dailyAnalysis.includes("Error")) {
            return;
        }

        setLoadingAi(true);
        try {
            // Get last 7 days of history
            const recentHistory = historyData
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 7);

            const analysis = await getHabitAnalysis(currentStats, recentHistory);
            setDailyAnalysis(analysis);
        } catch (error) {
            setDailyAnalysis("The Oracle is silent today. (API Error: Check connection or limits)");
        } finally {
            setLoadingAi(false);
        }
    };

    if (!historyData || historyData.length === 0) {
        return (
            <div className="glass-panel p-10 text-center">
                <div className="text-6xl text-gray-600 mb-4">📊</div>
                <h2 className="header-font text-3xl text-white mb-2">Not Enough Data Yet</h2>
                <p className="text-gray-400">Complete tasks to see your performance analysis!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Header with AI Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="header-font text-3xl text-white">Analysis & Trends</h2>
                    <p className="text-gray-400 text-sm">Track your consistency over time</p>
                </div>
                <button
                    onClick={handleGetAiInsights}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-indigo-500/20 group"
                >
                    <FontAwesomeIcon icon={faRobot} className="text-xl group-hover:animate-bounce" />
                    <span className="font-semibold">Get AI Coach Insights</span>
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Best Day */}
                <div className="tile p-6 rounded-xl flex items-center gap-4 bg-gradient-to-br from-green-900/40 to-black border border-green-500/30">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl">
                        <FontAwesomeIcon icon={faCalendarCheck} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Best Day</p>
                        <p className="header-font text-3xl text-white">
                            {stats.bestDay ? new Date(stats.bestDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}
                        </p>
                        <p className="text-green-400 text-xs">{stats.bestDay?.completed || 0} tasks</p>
                    </div>
                </div>

                {/* Needs Focus - Show worst performing days */}
                {/* Needs Focus - Show worst performing days */}
                <div className="tile p-6 rounded-xl flex items-start gap-4 bg-gradient-to-br from-red-900/40 to-black border border-red-500/30">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-2xl flex-shrink-0">
                        <FontAwesomeIcon icon={faCalendarXmark} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Needs Focus</p>
                            {stats.totalMissedDays > 0 && (
                                <span className="text-red-400 text-xs bg-red-900/40 px-2 py-0.5 rounded-full">{stats.totalMissedDays} missed days</span>
                            )}
                        </div>

                        {stats.worstDays && stats.worstDays.length > 0 && stats.worstDays[0].completed < stats.worstDays[0].total ? (
                            <div className="space-y-1 mt-1">
                                {stats.worstDays.map((day, idx) => {
                                    const percent = Math.round(((day.completed || 0) / (day.total || 1)) * 100);
                                    // Skip if perfect day
                                    if (percent === 100) return null;

                                    return (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${idx === 0 ? 'text-red-400' : 'text-orange-400'}`}>#{idx + 1}</span>
                                            <span className="header-font text-lg text-white truncate">
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-red-400 text-xs">
                                                {day.isMissing ? "(Missed)" : `(${percent}%)`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-1">
                                <p className="header-font text-lg text-green-400">Perfect! 🎉</p>
                                <p className="text-xs text-gray-500">No tasks skipped</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Metrics Tile (New) */}
                <div className="tile p-6 rounded-xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 flex flex-col justify-between">
                    <div>
                        <p className="text-indigo-400 text-xs uppercase tracking-wider mb-1">Consistency Score</p>
                        <div className="flex items-end gap-2">
                            <h4 className="header-font text-4xl text-white">{stats.consistencyScore ?? 'N/A'}</h4>
                            <span className="text-gray-400 text-sm mb-1">/ 100</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${stats.consistencyScore || 0}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats.consistencyScore >= 80 ? '🔥 Highly Consistent' : stats.consistencyScore >= 50 ? '⚖️ Balanced' : '📉 erratic'}
                        </p>
                    </div>
                </div>

                {/* Psychology Tip */}
                <div className="tile p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-8xl text-blue-500/10 group-hover:text-blue-500/20 transition-all">
                        <FontAwesomeIcon icon={faLightbulb} />
                    </div>
                    <p className="text-blue-400 text-xs uppercase tracking-wider mb-2 font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faLightbulb} /> Psychology Tip
                    </p>
                    <h4 className="header-font text-xl text-white mb-1">{randomTip.title}</h4>
                    <p className="text-sm text-gray-300 leading-snug relative z-10">{randomTip.text}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="tile p-6 rounded-xl glass-panel">
                <h3 className="header-font text-3xl text-white mb-6">Performance Trend</h3>
                <div className="h-80 md:h-96">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Monthly Archives */}
            <div className="space-y-4">
                <h3 className="header-font text-2xl text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-orange-400" /> Monthly Archives
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Current Month Button */}
                    <div
                        onClick={() => setSelectedMonth('current')}
                        className={`tile p-5 rounded-xl cursor-pointer transition-all border-2 ${selectedMonth === 'current'
                            ? 'border-orange-400 bg-orange-400/10'
                            : 'border-transparent hover:border-orange-400/50 bg-white/5'
                            }`}
                    >
                        <h4 className="header-font text-xl text-orange-400 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarCheck} /> Current Month
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Click to view</span>
                                <span className="text-white font-semibold">→</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                View tasks completed this month
                            </div>
                        </div>
                    </div>

                    {/* Monthly Stats Cards */}
                    {monthlyStats.map(month => (
                        <div
                            key={month.key}
                            onClick={() => setSelectedMonth(month.key)}
                            className={`tile p-5 rounded-xl cursor-pointer transition-all border-2 ${selectedMonth === month.key
                                ? 'border-orange-400 bg-orange-400/10'
                                : 'border-transparent hover:border-white/20 bg-white/5'
                                }`}
                        >
                            <h4 className="header-font text-xl text-white mb-4">{month.name}</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Avg Tasks/Day</span>
                                    <span className="text-white font-semibold">{month.avgCompleted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Completed</span>
                                    <span className="text-white font-semibold">{month.totalCompleted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Mostly Missed</span>
                                    <span className="text-red-400 font-semibold">{month.mostlyMissed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Best Streak</span>
                                    <span className="text-green-400 font-semibold">{month.maxStreak} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Days Tracked</span>
                                    <span className="text-white font-semibold">{month.daysTracked}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Results Modal */}
            <Modal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                title="Stoic Performance Coach"
            >
                {loadingAi ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-2xl text-white font-semibold animate-pulse">Consulting the Oracle...</h3>
                        <p className="text-gray-400 mt-2">Analyzing your discipline and consistency.</p>
                    </div>
                ) : (
                    <div className="text-gray-200 leading-relaxed space-y-4 whitespace-pre-line text-lg">
                        {dailyAnalysis ? (
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-indigo-400 text-2xl mb-4" />
                                <div>{dailyAnalysis}</div>
                            </div>
                        ) : (
                            <p>No analysis available.</p>
                        )}
                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-sm text-gray-500 italic">"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
