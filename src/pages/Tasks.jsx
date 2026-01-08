import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import Modal from '../components/Modal';
import { getTaskBreakdown } from '../services/gemini';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheckDouble, faWandMagicSparkles, faListCheck } from '@fortawesome/free-solid-svg-icons';

export default function Tasks() {
    const { dailyTasks, addDailyTask, toggleDailyTask, clearCompletedDailyTasks } = useData();
    const [newTask, setNewTask] = useState('');

    // AI Breakdown State
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [breakingDownTask, setBreakingDownTask] = useState(null); // The task being analyzed
    const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);

    const remaining = dailyTasks.filter(t => !t.done).length;
    const percent = dailyTasks.length === 0 ? 0 : Math.round(((dailyTasks.length - remaining) / dailyTasks.length) * 100);

    const handleAdd = () => {
        if (newTask.trim()) {
            addDailyTask(newTask.trim());
            setNewTask('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleAdd();
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

    return (
        <div className="glass-panel p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="header-font text-3xl text-white">Daily Tasks</h2>
                    <p className="text-xs text-gray-400">{new Date().toDateString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">
                        {dailyTasks.length - remaining}/{dailyTasks.length} done
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-fire-orange to-fire-red rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            {/* Add Task */}
            <div className="flex gap-3 mb-6">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a task e.g., 'Finish DSA problem set'"
                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:border-fire-orange focus:outline-none transition-colors"
                />
                <button
                    onClick={handleAdd}
                    className="bg-green-600 hover:bg-green-500 px-4 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} /> Add
                </button>
                <button
                    onClick={clearCompletedDailyTasks}
                    className="bg-white/10 hover:bg-white/20 px-4 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faCheckDouble} /> Clear Done
                </button>
            </div>

            {/* Task List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {dailyTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No tasks yet. Add your first one above!</p>
                ) : (
                    dailyTasks.map(task => (
                        <div
                            key={task.id}
                            className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
                        >
                            <label className="flex items-start gap-3 flex-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={(e) => toggleDailyTask(task.id, e.target.checked)}
                                    className="mt-1 accent-fire-orange w-5 h-5"
                                />
                                <div>
                                    <p className={`text-sm ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {task.text}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </label>

                            {/* Magic Wand Button (Visible on Hover) */}
                            {!task.done && (
                                <button
                                    onClick={() => handleMagicWand(task)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 p-2"
                                    title="Break down with AI"
                                >
                                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-gray-300 mb-1 font-medium">💡 Tip</p>
                <p className="text-sm text-gray-400">Keep tasks small and measurable. Aim for 3-5 high-impact items.</p>
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
                        <p className="text-indigo-300 animate-pulse">Deconstructuring "{breakingDownTask?.text}"...</p>
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
                                        <span className="text-indigo-500 mt-1">•</span> {sub}
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
