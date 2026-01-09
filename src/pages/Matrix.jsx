import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFire, faCalendarCheck, faUserClock, faTrash,
    faPlus, faCheck, faXmark, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

const quadrants = [
    {
        id: 'q1',
        title: 'DO FIRST',
        subtitle: 'Urgent & Important',
        desc: 'Crises, deadlines, pressing problems.',
        bgColor: 'bg-gradient-to-br from-red-900/40 to-black',
        borderColor: 'border-red-500/50',
        iconColor: 'text-red-500',
        badgeColor: 'bg-red-500/20 text-red-300',
        icon: faFire
    },
    {
        id: 'q2',
        title: 'SCHEDULE',
        subtitle: 'Not Urgent & Important',
        desc: 'Planning, prevention, relationship building.',
        bgColor: 'bg-gradient-to-br from-blue-900/40 to-black',
        borderColor: 'border-blue-500/50',
        iconColor: 'text-blue-500',
        badgeColor: 'bg-blue-500/20 text-blue-300',
        icon: faCalendarCheck
    },
    {
        id: 'q3',
        title: 'DELEGATE',
        subtitle: 'Urgent & Not Important',
        desc: 'Interruptions, some calls/emails, popular activities.',
        bgColor: 'bg-gradient-to-br from-yellow-900/40 to-black',
        borderColor: 'border-yellow-500/50',
        iconColor: 'text-yellow-500',
        badgeColor: 'bg-yellow-500/20 text-yellow-300',
        icon: faUserClock
    },
    {
        id: 'q4',
        title: 'ELIMINATE',
        subtitle: 'Not Urgent & Not Important',
        desc: 'Trivia, busy work, time wasters.',
        bgColor: 'bg-gradient-to-br from-gray-800/40 to-black',
        borderColor: 'border-gray-600/50',
        iconColor: 'text-gray-400',
        badgeColor: 'bg-gray-600/20 text-gray-300',
        icon: faTrash
    },
];

export default function Matrix() {
    const { matrixTasks, addMatrixTask, toggleMatrixTask, deleteMatrixTask } = useData();
    const [inputs, setInputs] = useState({ q1: '', q2: '', q3: '', q4: '' });
    const [focusedQ, setFocusedQ] = useState(null);

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

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h2 className="header-font text-3xl text-white">Eisenhower Matrix</h2>
                    <p className="text-gray-400 text-sm max-w-xl">
                        Prioritize tasks by urgency and importance. Focus on what matters, simple.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0">
                {quadrants.map(q => {
                    const tasks = getTasksForQuadrant(q.id);
                    const completedCount = tasks.filter(t => t.done).length;

                    return (
                        <div
                            key={q.id}
                            className={`tile relative rounded-2xl border ${q.borderColor} ${q.bgColor} flex flex-col shadow-lg transition-all duration-300 hover:shadow-black/50 overflow-hidden group`}
                            onMouseEnter={() => setFocusedQ(q.id)}
                            onMouseLeave={() => setFocusedQ(null)}
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-white/5 flex items-start justify-between bg-black/20 backdrop-blur-sm">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className={`p-2 rounded-lg ${q.badgeColor}`}>
                                            <FontAwesomeIcon icon={q.icon} className="text-lg" />
                                        </div>
                                        <h3 className="header-font text-xl text-white tracking-wide">{q.title}</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-snug ml-1">{q.subtitle}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border border-white/10 ${completedCount === tasks.length && tasks.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-black/40 text-gray-400'}`}>
                                    {completedCount}/{tasks.length}
                                </span>
                            </div>

                            {/* Task List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                                {tasks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-4">
                                        <FontAwesomeIcon icon={q.icon} className={`text-4xl mb-3 ${q.iconColor}`} />
                                        <p className="text-sm font-medium text-white">{q.desc}</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`group/item flex items-start gap-3 p-3 rounded-xl border transition-all ${task.done
                                                    ? 'bg-black/20 border-transparent opacity-50'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleMatrixTask(task.id, !task.done)}
                                                className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${task.done
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-500 hover:border-white text-transparent'
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                            </button>

                                            <span className={`flex-1 text-sm leading-relaxed break-words ${task.done ? 'line-through' : 'text-gray-200'}`}>
                                                {task.text}
                                            </span>

                                            <button
                                                onClick={() => deleteMatrixTask(task.id)}
                                                className="opacity-0 group-hover/item:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-all"
                                                title="Delete"
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input Area (Bottom pinned) */}
                            <div className="p-4 bg-black/30 border-t border-white/5">
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        value={inputs[q.id]}
                                        onChange={(e) => setInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        onKeyPress={(e) => handleKeyPress(e, q.id)}
                                        placeholder="Add task..."
                                        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder-gray-500"
                                    />
                                    <button
                                        onClick={() => handleAdd(q.id)}
                                        disabled={!inputs[q.id].trim()}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${inputs[q.id].trim()
                                                ? `${q.badgeColor} hover:bg-white/20`
                                                : 'text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
