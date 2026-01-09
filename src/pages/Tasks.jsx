import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataProvider';
import Modal from '../components/Modal';
import { getTaskBreakdown } from '../services/gemini';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faCheckDouble, faWandMagicSparkles, faListCheck, faChartLine,
    faTrash, faArrowRight, faCalendarCheck, faCalendarDays, faTrophy,
    faExclamationTriangle, faChevronDown, faChevronUp
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

export default function Tasks() {
    const { dailyTasks, addDailyTask, toggleDailyTask, clearCompletedDailyTasks, deleteDailyTask, historyData } = useData();
    const [newTask, setNewTask] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [expandedMonth, setExpandedMonth] = useState(null);

    // AI Breakdown State
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [breakingDownTask, setBreakingDownTask] = useState(null);
    const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);

    const completed = dailyTasks.filter(t => t.done).length;
    const total = dailyTasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const handleAdd = () => {
        if (newTask.trim()) {
            addDailyTask(newTask.trim());
            setNewTask('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    const handleDelete = (taskId) => {
        if (deleteDailyTask) {
            deleteDailyTask(taskId);
        }
    };

    // AI Magic Wand Handler
    const handleMagicWand = async (task) => {
        setBreakingDownTask(task);
        setIsBreakdownModalOpen(true);
        setLoadingBreakdown(true);
        setGeneratedSubtasks([]);

        try {
            const subtasks = await getTaskBreakdown(task.text);
            setGeneratedSubtasks(subtasks);
        } catch (error) {
            setGeneratedSubtasks(["Could not generate subtasks. Try again later."]);
        } finally {
            setLoadingBreakdown(false);
        }
    };

    const addSubtasksToDaily = () => {
        generatedSubtasks.forEach(sub => addDailyTask(sub));
        setIsBreakdownModalOpen(false);
    };

    // Monthly analytics - group history data by month
    const monthlyAnalytics = useMemo(() => {
        if (!historyData || historyData.length === 0) return [];

        const grouped = {};
        historyData.forEach(day => {
            const date = new Date(day.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            if (!grouped[monthKey]) {
                grouped[monthKey] = {
                    key: monthKey,
                    name: monthName,
                    days: []
                };
            }

            // Calculate percentage for each day
            const dayPercent = (day.total || 0) > 0
                ? Math.round(((day.completed || 0) / (day.total || 1)) * 100)
                : 0;

            grouped[monthKey].days.push({
                ...day,
                percent: dayPercent
            });
        });

        // Calculate stats for each month
        return Object.keys(grouped)
            .sort()
            .reverse()
            .slice(0, 6)
            .map(key => {
                const month = grouped[key];
                const sortedByPercent = [...month.days].sort((a, b) => b.percent - a.percent);
                const sortedByDate = [...month.days].sort((a, b) => new Date(a.date) - new Date(b.date));

                // Average percentage
                const avgPercent = Math.round(
                    month.days.reduce((acc, d) => acc + d.percent, 0) / month.days.length
                ) || 0;

                // Best days (top 3 with >0%)
                const bestDays = sortedByPercent.filter(d => d.percent > 0).slice(0, 3);

                // Worst days (bottom 3 with data)
                const worstDays = sortedByPercent.filter(d => d.total > 0).reverse().slice(0, 3);

                // 100% days count
                const perfectDays = month.days.filter(d => d.percent === 100).length;

                return {
                    ...month,
                    avgPercent,
                    bestDays,
                    worstDays,
                    perfectDays,
                    totalDays: month.days.length
                };
            });
    }, [historyData]);

    // Current month chart data
    const chartData = useMemo(() => {
        const today = new Date();
        const days = [];

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            days.push(d);
        }

        const dataMap = {};
        historyData?.forEach(day => {
            const dateKey = typeof day.date === 'string'
                ? day.date.split('T')[0]
                : new Date(day.date).toISOString().split('T')[0];
            dataMap[dateKey] = day;
        });

        const labels = days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const percentages = days.map(d => {
            const key = d.toISOString().split('T')[0];
            const dayData = dataMap[key];
            if (dayData && dayData.total > 0) {
                return Math.round((dayData.completed / dayData.total) * 100);
            }
            return null;
        });

        return {
            labels,
            datasets: [{
                label: 'Completion %',
                data: percentages,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#22c55e',
                pointRadius: 3,
                pointHoverRadius: 6,
                spanGaps: true,
            }]
        };
    }, [historyData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y || 0}% completed` } }
        },
        scales: {
            y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', callback: (val) => `${val}%` } },
            x: { grid: { display: false }, ticks: { color: '#6b7280', maxRotation: 45 } }
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Main Tasks Panel */}
            <div className="glass-panel p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="header-font text-3xl text-white">Daily Tasks</h2>
                        <p className="text-xs text-gray-400">{new Date().toDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showAnalytics ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                        >
                            <FontAwesomeIcon icon={faChartLine} />
                            <span className="hidden sm:inline">Analytics</span>
                        </button>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{percent}%</p>
                            <p className="text-xs text-gray-400">{completed}/{total} done</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-fire-orange to-fire-red'}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    {percent === 100 && total > 0 && (
                        <p className="text-green-400 text-sm mt-2 font-medium flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarCheck} /> All tasks completed! Great job! 🎉
                        </p>
                    )}
                </div>

                {/* Add Task */}
                <div className="flex gap-3 mb-6">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a task..."
                        className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-fire-orange focus:outline-none transition-colors placeholder-gray-500"
                    />
                    <button onClick={handleAdd} disabled={!newTask.trim()} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-5 rounded-xl text-white transition-colors flex items-center gap-2 font-medium">
                        <FontAwesomeIcon icon={faPlus} /> Add
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                    <button onClick={clearCompletedDailyTasks} disabled={completed === 0} className="bg-white/5 hover:bg-white/10 disabled:opacity-30 px-4 py-2 rounded-lg text-gray-300 transition-colors flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faCheckDouble} /> Clear Done
                    </button>
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {dailyTasks.length === 0 ? (
                        <div className="text-center py-10">
                            <FontAwesomeIcon icon={faListCheck} className="text-4xl text-gray-600 mb-3" />
                            <p className="text-gray-500">No tasks yet. Add your first one above!</p>
                        </div>
                    ) : (
                        dailyTasks.map((task, idx) => (
                            <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${task.done ? 'bg-green-900/20 border-green-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                        <input type="checkbox" checked={task.done} onChange={(e) => toggleDailyTask(task.id, e.target.checked)} className="sr-only" />
                                        {task.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`text-sm ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>{task.text}</span>
                                </label>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!task.done && <button onClick={() => handleMagicWand(task)} className="text-indigo-400 hover:text-indigo-300 p-2 rounded-lg" title="AI breakdown"><FontAwesomeIcon icon={faWandMagicSparkles} /></button>}
                                    <button onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg" title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Analytics Section */}
            {showAnalytics && (
                <div className="space-y-6 animate-in">
                    {/* 30-Day Chart */}
                    <div className="glass-panel p-6">
                        <h3 className="header-font text-2xl text-white mb-4 flex items-center gap-3">
                            <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
                            Last 30 Days Trend
                        </h3>
                        <div className="h-64">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Monthly Archives */}
                    <div className="glass-panel p-6">
                        <h3 className="header-font text-2xl text-white mb-4 flex items-center gap-3">
                            <FontAwesomeIcon icon={faCalendarDays} className="text-orange-400" />
                            Monthly Performance
                        </h3>

                        {monthlyAnalytics.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Not enough data yet. Keep tracking!</p>
                        ) : (
                            <div className="space-y-3">
                                {monthlyAnalytics.map((month) => (
                                    <div key={month.key} className="border border-white/10 rounded-xl overflow-hidden">
                                        {/* Month Header - Clickable */}
                                        <button
                                            onClick={() => setExpandedMonth(expandedMonth === month.key ? null : month.key)}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="header-font text-xl text-white">{month.name}</span>
                                                <span className={`text-sm font-bold px-2 py-1 rounded ${month.avgPercent >= 80 ? 'bg-green-500/20 text-green-400' : month.avgPercent >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {month.avgPercent}% avg
                                                </span>
                                                {month.perfectDays > 0 && (
                                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faTrophy} /> {month.perfectDays} perfect days
                                                    </span>
                                                )}
                                            </div>
                                            <FontAwesomeIcon
                                                icon={expandedMonth === month.key ? faChevronUp : faChevronDown}
                                                className="text-gray-400"
                                            />
                                        </button>

                                        {/* Expanded Details */}
                                        {expandedMonth === month.key && (
                                            <div className="p-4 bg-black/30 grid md:grid-cols-2 gap-4">
                                                {/* Best Days */}
                                                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/20">
                                                    <h4 className="text-green-400 text-sm font-bold mb-3 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faTrophy} /> Best Performance
                                                    </h4>
                                                    {month.bestDays.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {month.bestDays.map((day, idx) => (
                                                                <li key={idx} className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-300">{formatDate(day.date)}</span>
                                                                    <span className="text-green-400 font-bold">{day.percent}%</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">No data</p>
                                                    )}
                                                </div>

                                                {/* Worst Days */}
                                                <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20">
                                                    <h4 className="text-red-400 text-sm font-bold mb-3 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faExclamationTriangle} /> Needs Improvement
                                                    </h4>
                                                    {month.worstDays.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {month.worstDays.map((day, idx) => (
                                                                <li key={idx} className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-300">{formatDate(day.date)}</span>
                                                                    <span className="text-red-400 font-bold">{day.percent}%</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">No data</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Breakdown Modal */}
            <Modal isOpen={isBreakdownModalOpen} onClose={() => setIsBreakdownModalOpen(false)} title="Smart Task Breakdown">
                {loadingBreakdown ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-indigo-300 animate-pulse">Analyzing "{breakingDownTask?.text}"...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">
                            <h4 className="text-indigo-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faWandMagicSparkles} /> Suggested Sub-tasks:
                            </h4>
                            <ul className="space-y-2">
                                {generatedSubtasks.map((sub, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <FontAwesomeIcon icon={faArrowRight} className="text-indigo-500 mt-1 text-xs" /> {sub}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setIsBreakdownModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={addSubtasksToDaily} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <FontAwesomeIcon icon={faListCheck} /> Add All
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
