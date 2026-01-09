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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Tasks() {
    const { dailyTasks, addDailyTask, toggleDailyTask, clearCompletedDailyTasks, deleteDailyTask, dailyTaskHistory } = useData();
    const [newTask, setNewTask] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null); // null = current 30 days

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

    const handleKeyPress = (e) => { if (e.key === 'Enter') handleAdd(); };
    const handleDelete = (taskId) => { if (deleteDailyTask) deleteDailyTask(taskId); };

    const handleMagicWand = async (task) => {
        setBreakingDownTask(task);
        setIsBreakdownModalOpen(true);
        setLoadingBreakdown(true);
        setGeneratedSubtasks([]);
        try {
            const subtasks = await getTaskBreakdown(task.text);
            setGeneratedSubtasks(subtasks);
        } catch (error) {
            setGeneratedSubtasks(["Could not generate subtasks."]);
        } finally {
            setLoadingBreakdown(false);
        }
    };

    const addSubtasksToDaily = () => {
        generatedSubtasks.forEach(sub => addDailyTask(sub));
        setIsBreakdownModalOpen(false);
    };

    // Scientific Analytics: Monthly stats + Consistency Score + Day of Week Analysis
    const monthlyAnalytics = useMemo(() => {
        if (!dailyTaskHistory || dailyTaskHistory.length === 0) return [];

        const grouped = {};
        dailyTaskHistory.forEach(day => {
            const date = new Date(day.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            if (!grouped[monthKey]) {
                grouped[monthKey] = { key: monthKey, name: monthName, days: [] };
            }
            grouped[monthKey].days.push({
                ...day,
                percent: day.percent || (day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0),
                dayOfWeek: date.getDay() // 0 = Sun, 1 = Mon, etc.
            });
        });

        return Object.keys(grouped).sort().reverse().slice(0, 12).map(key => {
            const month = grouped[key];
            const days = month.days;
            const sortedByPercent = [...days].sort((a, b) => b.percent - a.percent);
            const avgPercent = Math.round(days.reduce((acc, d) => acc + d.percent, 0) / days.length) || 0;

            // 1. Consistency Score (based on Standard Deviation)
            // Lower StdDev = Higher Consistency. Score out of 100.
            const variance = days.reduce((acc, d) => acc + Math.pow(d.percent - avgPercent, 2), 0) / days.length;
            const stdDev = Math.sqrt(variance);
            const consistencyScore = Math.max(0, Math.round(100 - stdDev)); // Simple metric: 100 is perfect consistency

            // 2. Day of Week Analysis
            const dayStats = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
            days.forEach(d => {
                dayStats[d.dayOfWeek].total += d.percent;
                dayStats[d.dayOfWeek].count += 1;
            });
            const bestDayIndex = dayStats
                .map((d, i) => ({ avg: d.count ? d.total / d.count : 0, day: i }))
                .sort((a, b) => b.avg - a.avg)[0].day;
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const productiveDay = daysOfWeek[bestDayIndex];

            // 3. Best & Needs Improvement
            const bestDays = sortedByPercent.filter(d => d.percent > 0).slice(0, 3);
            // Fix: Only show "Needs Improvement" if percent < 100
            const worstDays = [...days]
                .filter(d => d.total > 0 && d.percent < 100)
                .sort((a, b) => a.percent - b.percent) // Lowest percent first
                .slice(0, 3);

            const perfectDays = days.filter(d => d.percent === 100).length;

            return {
                ...month,
                avgPercent,
                bestDays,
                worstDays,
                perfectDays,
                totalDays: days.length,
                consistencyScore,
                productiveDay
            };
        });
    }, [dailyTaskHistory]);

    // Chart data - show selected month or last 30 days
    const chartData = useMemo(() => {
        let daysToShow = [];
        let title = 'Last 30 Days';

        if (selectedMonth && monthlyAnalytics.length > 0) {
            const monthData = monthlyAnalytics.find(m => m.key === selectedMonth);
            if (monthData) {
                daysToShow = [...monthData.days].sort((a, b) => new Date(a.date) - new Date(b.date));
                title = monthData.name;
            }
        } else {
            // Last 30 days
            const today = new Date();
            const dataMap = {};
            dailyTaskHistory?.forEach(day => {
                dataMap[day.date] = day;
            });

            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const key = d.toISOString().split('T')[0];
                daysToShow.push({
                    date: key,
                    percent: dataMap[key]?.percent ?? null
                });
            }
        }

        const labels = daysToShow.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const percentages = daysToShow.map(d => d.percent);

        return {
            title,
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
                pointRadius: 3,
                pointHoverRadius: 6,
                spanGaps: true,
            }]
        };
    }, [dailyTaskHistory, selectedMonth, monthlyAnalytics]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y ?? 'No data'}%` } }
        },
        scales: {
            y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', callback: (val) => `${val}%` } },
            x: { grid: { display: false }, ticks: { color: '#6b7280', maxRotation: 45 } }
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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
                        <button onClick={() => setShowAnalytics(!showAnalytics)} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showAnalytics ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
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
                        <div className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-fire-orange to-fire-red'}`} style={{ width: `${percent}%` }} />
                    </div>
                    {percent === 100 && total > 0 && (
                        <p className="text-green-400 text-sm mt-2 font-medium"><FontAwesomeIcon icon={faCalendarCheck} /> All tasks completed! 🎉</p>
                    )}
                </div>

                {/* Add Task */}
                {/* Add Task */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={handleKeyPress} placeholder="Add a task..." className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-fire-orange focus:outline-none placeholder-gray-500 w-full" />
                    <div className="flex gap-3">
                        <button onClick={handleAdd} disabled={!newTask.trim()} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 disabled:opacity-50 px-5 py-3 sm:py-0 rounded-xl text-white flex items-center justify-center gap-2 font-medium">
                            <FontAwesomeIcon icon={faPlus} /> Add
                        </button>
                        <button onClick={clearCompletedDailyTasks} disabled={completed === 0} className="bg-white/5 hover:bg-white/10 disabled:opacity-30 px-4 py-3 sm:py-0 rounded-lg text-gray-300 flex items-center justify-center gap-2 text-sm">
                            <FontAwesomeIcon icon={faCheckDouble} />
                        </button>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                    {dailyTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <FontAwesomeIcon icon={faListCheck} className="text-4xl text-gray-600 mb-3" />
                            <p className="text-gray-500">No tasks yet. Add one above!</p>
                        </div>
                    ) : (
                        dailyTasks.map((task) => (
                            <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${task.done ? 'bg-green-900/20 border-green-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                        <input type="checkbox" checked={task.done} onChange={(e) => toggleDailyTask(task.id, e.target.checked)} className="sr-only" />
                                        {task.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`text-sm ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>{task.text}</span>
                                </label>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!task.done && <button onClick={() => handleMagicWand(task)} className="text-indigo-400 hover:text-indigo-300 p-2" title="AI breakdown"><FontAwesomeIcon icon={faWandMagicSparkles} /></button>}
                                    <button onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 p-2" title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Analytics Section */}
            {showAnalytics && (
                <div className="space-y-6 animate-in">
                    {/* Chart */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="header-font text-2xl text-white flex items-center gap-3">
                                <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
                                {chartData.title}
                            </h3>
                            {selectedMonth && (
                                <button onClick={() => setSelectedMonth(null)} className="text-sm text-gray-400 hover:text-white px-3 py-1 bg-white/10 rounded-lg">
                                    ← Back to 30 Days
                                </button>
                            )}
                        </div>
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
                        <p className="text-gray-500 text-sm mb-4">Click a month to view its chart and detailed breakdown</p>

                        {monthlyAnalytics.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Complete some tasks to see your analytics!</p>
                        ) : (
                            <div className="space-y-3">
                                {monthlyAnalytics.map((month) => (
                                    <div key={month.key} className={`border rounded-xl overflow-hidden transition-all ${selectedMonth === month.key ? 'border-green-500/50 bg-green-900/10' : 'border-white/10'}`}>
                                        <button onClick={() => setSelectedMonth(selectedMonth === month.key ? null : month.key)} className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors text-left gap-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                                                <span className="header-font text-lg text-white">{month.name}</span>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className={`font-bold px-2 py-1 rounded ${month.avgPercent >= 80 ? 'bg-green-500/20 text-green-400' : month.avgPercent >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {month.avgPercent}% avg
                                                    </span>
                                                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded whitespace-nowrap">
                                                        C-Score: {month.consistencyScore}
                                                    </span>
                                                    {month.perfectDays > 0 && <span className="text-xs text-green-400 flex items-center gap-1"><FontAwesomeIcon icon={faTrophy} /> {month.perfectDays}</span>}
                                                </div>
                                            </div>
                                            <FontAwesomeIcon icon={selectedMonth === month.key ? faChevronUp : faChevronDown} className="text-gray-400 hidden sm:block" />
                                        </button>

                                        {selectedMonth === month.key && (
                                            <div className="p-4 bg-black/30 grid md:grid-cols-2 gap-4">
                                                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/20">
                                                    <h4 className="text-green-400 text-sm font-bold mb-3"><FontAwesomeIcon icon={faTrophy} /> Best Performance</h4>
                                                    {month.bestDays.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {month.bestDays.map((day, idx) => (
                                                                <li key={idx} className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-300">{formatDate(day.date)}</span>
                                                                    <span className="text-green-400 font-bold">{day.percent}%</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="text-gray-500 text-sm">No data</p>}
                                                </div>
                                                {/* Insights Panel */}
                                                <div className="col-span-1 md:col-span-2 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 flex flex-col sm:flex-row justify-between gap-4">
                                                    <div>
                                                        <h4 className="text-indigo-300 text-sm font-bold mb-1">💡 Scientific Insight</h4>
                                                        <p className="text-gray-300 text-sm">
                                                            Your most productive day is <span className="text-white font-bold">{month.productiveDay}</span>.
                                                            Consistency Score: <span className="text-white font-bold">{month.consistencyScore}/100</span>.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/20">
                                                    <h4 className="text-green-400 text-sm font-bold mb-3"><FontAwesomeIcon icon={faTrophy} /> Best Performance</h4>
                                                    {month.bestDays.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {month.bestDays.map((day, idx) => (
                                                                <li key={idx} className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-300">{formatDate(day.date)}</span>
                                                                    <span className="text-green-400 font-bold">{day.percent}%</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="text-gray-500 text-sm">No data</p>}
                                                </div>

                                                <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20">
                                                    <h4 className="text-red-400 text-sm font-bold mb-3"><FontAwesomeIcon icon={faExclamationTriangle} /> Needs Improvement</h4>
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
                                                        <div className="flex flex-col items-center py-2 text-center">
                                                            <span className="text-2xl mb-1">🎉</span>
                                                            <p className="text-green-400 font-bold text-sm">Flawless Month!</p>
                                                            <p className="text-xs text-gray-400">No days under 100%</p>
                                                        </div>
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

            {/* AI Modal */}
            <Modal isOpen={isBreakdownModalOpen} onClose={() => setIsBreakdownModalOpen(false)} title="Smart Breakdown">
                {loadingBreakdown ? (
                    <div className="flex flex-col items-center py-12">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-indigo-300">Analyzing...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ul className="space-y-2 bg-indigo-500/10 p-4 rounded-lg">
                            {generatedSubtasks.map((sub, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                    <FontAwesomeIcon icon={faArrowRight} className="text-indigo-500 mt-1 text-xs" /> {sub}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setIsBreakdownModalOpen(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                            <button onClick={addSubtasksToDaily} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg"><FontAwesomeIcon icon={faListCheck} /> Add All</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
