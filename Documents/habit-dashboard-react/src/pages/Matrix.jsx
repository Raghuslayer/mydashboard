import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const quadrants = [
    { id: 'q1', title: 'DO FIRST', subtitle: 'Urgent & Important', color: 'red' },
    { id: 'q2', title: 'SCHEDULE', subtitle: 'Not Urgent & Important', color: 'blue' },
    { id: 'q3', title: 'DELEGATE', subtitle: 'Urgent & Not Important', color: 'yellow' },
    { id: 'q4', title: 'ELIMINATE', subtitle: 'Not Urgent & Not Important', color: 'gray' },
];

export default function Matrix() {
    const { matrixTasks, addMatrixTask, toggleMatrixTask, deleteMatrixTask } = useData();
    const [inputs, setInputs] = useState({ q1: '', q2: '', q3: '', q4: '' });

    const handleAdd = (quadrant) => {
        if (inputs[quadrant].trim()) {
            addMatrixTask(quadrant, inputs[quadrant].trim());
            setInputs(prev => ({ ...prev, [quadrant]: '' }));
        }
    };

    const handleKeyPress = (e, quadrant) => {
        if (e.key === 'Enter') handleAdd(quadrant);
    };

    const getTasksForQuadrant = (quadrant) => {
        return (matrixTasks || []).filter(t => t.quadrant === quadrant);
    };

    const colorClasses = {
        red: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500/20', hover: 'hover:bg-red-500/40' },
        blue: { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/20', hover: 'hover:bg-blue-500/40' },
        yellow: { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-500/40' },
        gray: { border: 'border-gray-500', text: 'text-gray-500', bg: 'bg-gray-500/20', hover: 'hover:bg-gray-500/40' },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {quadrants.map(q => {
                const colors = colorClasses[q.color];
                const tasks = getTasksForQuadrant(q.id);
                const completed = tasks.filter(t => t.done).length;

                return (
                    <div key={q.id} className={`glass-panel p-6 border-t-4 ${colors.border} flex flex-col h-80 md:h-96`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`header-font text-2xl ${colors.text}`}>
                                {q.title} <span className="text-lg text-gray-500 ml-2">({completed}/{tasks.length})</span>
                            </h3>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">{q.subtitle}</span>
                        </div>

                        {/* Input */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={inputs[q.id]}
                                onChange={(e) => setInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                                onKeyPress={(e) => handleKeyPress(e, q.id)}
                                placeholder={`Add ${q.title.toLowerCase()} task...`}
                                className={`flex-1 bg-black/30 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:${colors.border} transition-colors text-sm`}
                            />
                            <button
                                onClick={() => handleAdd(q.id)}
                                className={`${colors.bg} ${colors.hover} ${colors.text} px-3 rounded transition-colors`}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No tasks yet</p>
                            ) : (
                                tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={(e) => toggleMatrixTask(task.id, e.target.checked)}
                                            className="accent-fire-orange w-4 h-4"
                                        />
                                        <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => deleteMatrixTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
