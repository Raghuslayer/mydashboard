import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataProvider';
import Modal from '../components/Modal';
import { getTaskBreakdown } from '../services/gemini';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faCheckDouble, faWandMagicSparkles, faListCheck, faChartLine,
    faTrash, faArrowRight, faCalendarCheck
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
    const [showChart, setShowChart] = useState(false);

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

    // Chart data for task completion percentage over last 30 days
    const chartData = useMemo(() => {
        const today = new Date();
        const days = [];

        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            days.push(d);
        }

        // Create a map of historyData by date
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
            return null; // No data
        });

        return {
            labels,
            datasets: [
                {
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
                }
            ]
        };
    }, [historyData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.parsed.y || 0}% completed`
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: '#6b7280',
                    callback: (val) => `${val}%`
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280', maxRotation: 45 }
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with toggle */}
            <div className="glass-panel p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="header-font text-3xl text-white">Daily Tasks</h2>
                        <p className="text-xs text-gray-400">{new Date().toDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowChart(!showChart)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showChart ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
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
                        placeholder="Add a task e.g., 'Finish DSA problem set'"
                        className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-fire-orange focus:outline-none transition-colors placeholder-gray-500"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newTask.trim()}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 rounded-xl text-white transition-colors flex items-center gap-2 font-medium"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={clearCompletedDailyTasks}
                        disabled={completed === 0}
                        className="bg-white/5 hover:bg-white/10 disabled:opacity-30 px-4 py-2 rounded-lg text-gray-300 transition-colors flex items-center gap-2 text-sm"
                    >
                        <FontAwesomeIcon icon={faCheckDouble} /> Clear Completed
                    </button>
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                    {dailyTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faListCheck} className="text-3xl text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-lg">No tasks yet</p>
                            <p className="text-gray-600 text-sm">Add your first task above to get started!</p>
                        </div>
                    ) : (
                        dailyTasks.map((task, idx) => (
                            <div
                                key={task.id}
                                className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${task.done
                                        ? 'bg-green-900/20 border-green-500/20'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-500 hover:border-fire-orange'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={(e) => toggleDailyTask(task.id, e.target.checked)}
                                            className="sr-only"
                                        />
                                        {task.done && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>
                                            {task.text}
                                        </p>
                                    </div>
                                </label>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!task.done && (
                                        <button
                                            onClick={() => handleMagicWand(task)}
                                            className="text-indigo-400 hover:text-indigo-300 p-2 hover:bg-indigo-500/20 rounded-lg transition-colors"
                                            title="Break down with AI"
                                        >
                                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Delete task"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Analytics Chart (Toggle) */}
            {showChart && (
                <div className="glass-panel p-6 animate-in">
                    <h3 className="header-font text-2xl text-white mb-4 flex items-center gap-3">
                        <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
                        Task Completion Trend
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">Daily task completion percentage over the last 30 days</p>
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="glass-panel p-4 border border-blue-500/20 bg-blue-900/10">
                <p className="text-sm text-blue-300 mb-1 font-medium">💡 Pro Tip</p>
                <p className="text-sm text-gray-400">Keep tasks small and measurable. Aim for 3-5 high-impact items. Tasks reset daily to keep you focused on what matters today.</p>
            </div>

            {/* AI Breakdown Modal */}
            <Modal
                isOpen={isBreakdownModalOpen}
                onClose={() => setIsBreakdownModalOpen(false)}
                title="Smart Task Breakdown"
            >
                {loadingBreakdown ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
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
                                        <FontAwesomeIcon icon={faArrowRight} className="text-indigo-500 mt-1 text-xs" />
                                        {sub}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsBreakdownModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addSubtasksToDaily}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={faListCheck} /> Add All
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
