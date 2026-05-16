import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFire, faCalendarCheck, faUserClock, faBan,
    faPlus, faCheck, faTrash, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';

const QUADRANTS = [
    {
        id: 'q1',
        title: 'DO NOW',
        label: 'Urgent + Important',
        action: 'Attack these immediately. No excuses.',
        icon: faFire,
        accentColor: '#ef4444',
        bg: 'rgba(239,68,68,0.06)',
        border: 'rgba(239,68,68,0.30)',
        glow: 'rgba(239,68,68,0.15)',
    },
    {
        id: 'q2',
        title: 'SCHEDULE',
        label: 'Important, Not Urgent',
        action: 'Lock in a time. These build your future.',
        icon: faCalendarCheck,
        accentColor: '#3b82f6',
        bg: 'rgba(59,130,246,0.06)',
        border: 'rgba(59,130,246,0.30)',
        glow: 'rgba(59,130,246,0.15)',
    },
    {
        id: 'q3',
        title: 'DELEGATE',
        label: 'Urgent, Not Important',
        action: 'Hand it off. Your time is too valuable.',
        icon: faUserClock,
        accentColor: '#eab308',
        bg: 'rgba(234,179,8,0.06)',
        border: 'rgba(234,179,8,0.30)',
        glow: 'rgba(234,179,8,0.15)',
    },
    {
        id: 'q4',
        title: 'ELIMINATE',
        label: 'Not Urgent, Not Important',
        action: 'Cut it. Dead weight. Move on.',
        icon: faBan,
        accentColor: '#6b7280',
        bg: 'rgba(107,114,128,0.06)',
        border: 'rgba(107,114,128,0.25)',
        glow: 'rgba(107,114,128,0.10)',
    },
];

export default function Matrix() {
    const { matrixTasks, addMatrixTask, toggleMatrixTask, deleteMatrixTask } = useData();
    const [inputs, setInputs] = useState({ q1: '', q2: '', q3: '', q4: '' });
    const [collapsed, setCollapsed] = useState({ q1: false, q2: false, q3: false, q4: false });
    const [revealedTaskId, setRevealedTaskId] = useState(null);
    const [localLoading, setLocalLoading] = useState(true);
    const inputRefs = useRef({});

    React.useEffect(() => {
        const t = setTimeout(() => setLocalLoading(false), 900);
        return () => clearTimeout(t);
    }, []);

    if (localLoading) return <div className="p-8"><LoadingScreen fullPage={false} /></div>;

    const getQ = (id) => (matrixTasks || []).filter(t => t.quadrant === id);

    const handleAdd = (id) => {
        const val = inputs[id].trim();
        if (!val) return;
        addMatrixTask(id, val);
        setInputs(p => ({ ...p, [id]: '' }));
        inputRefs.current[id]?.focus();
    };

    const handleKey = (e, id) => {
        if (e.key === 'Enter') handleAdd(id);
    };

    const toggleCollapse = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-1">Eisenhower</p>
                    <h1 className="header-font text-4xl text-white tracking-wide leading-none">PRIORITY MATRIX</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Every task has a place. Know yours.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-2xl font-black text-white">{(matrixTasks || []).filter(t => t.done).length}</p>
                    <p className="text-[11px] uppercase tracking-widest text-gray-500">Completed</p>
                </div>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUADRANTS.map((q, idx) => {
                    const tasks = getQ(q.id);
                    const done = tasks.filter(t => t.done).length;
                    const isCollapsed = collapsed[q.id];

                    return (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="rounded-2xl overflow-hidden flex flex-col"
                            style={{
                                background: q.bg,
                                border: `1px solid ${q.border}`,
                                boxShadow: `0 4px 24px ${q.glow}`,
                            }}
                        >
                            {/* Quadrant Header */}
                            <button
                                onClick={() => toggleCollapse(q.id)}
                                className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${q.accentColor}20`, border: `1px solid ${q.accentColor}40` }}
                                    >
                                        <FontAwesomeIcon icon={q.icon} style={{ color: q.accentColor }} className="text-base" />
                                    </div>
                                    <div className="text-left">
                                        <p className="header-font text-lg text-white tracking-wider leading-none">{q.title}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{q.label}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {tasks.length > 0 && (
                                        <span
                                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{
                                                background: done === tasks.length ? 'rgba(34,197,94,0.15)' : `${q.accentColor}15`,
                                                color: done === tasks.length ? '#4ade80' : q.accentColor,
                                            }}
                                        >
                                            {done}/{tasks.length}
                                        </span>
                                    )}
                                    <FontAwesomeIcon
                                        icon={isCollapsed ? faChevronDown : faChevronUp}
                                        className="text-gray-600 text-xs"
                                    />
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        {/* Divider */}
                                        <div className="mx-5 border-t" style={{ borderColor: q.border }} />

                                        {/* Hint text */}
                                        <p className="px-5 pt-3 pb-2 text-[11px] italic text-gray-600">{q.action}</p>

                                        {/* Task List */}
                                        <div className="px-5 space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pb-1">
                                            <AnimatePresence>
                                                {tasks.length === 0 ? (
                                                    <p className="text-center text-gray-700 text-sm py-4">No tasks yet. Add one below.</p>
                                                ) : (
                                                    tasks.map(task => (
                                                        <motion.div
                                                            key={task.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: task.done ? 0.45 : 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 10 }}
                                                            className="group flex items-center gap-3 py-2 px-3 rounded-xl transition-colors hover:bg-white/5"
                                                            onContextMenu={(e) => { e.preventDefault(); setRevealedTaskId(revealedTaskId === task.id ? null : task.id); }}
                                                        >
                                                            {/* Checkbox */}
                                                            <button
                                                                onClick={() => toggleMatrixTask(task.id, !task.done)}
                                                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                                                style={{
                                                                    borderColor: task.done ? '#22c55e' : q.accentColor,
                                                                    background: task.done ? '#22c55e' : 'transparent',
                                                                }}
                                                            >
                                                                {task.done && <FontAwesomeIcon icon={faCheck} className="text-white text-[9px]" />}
                                                            </button>

                                                            {/* Text */}
                                                            <span
                                                                className={`flex-1 text-sm leading-relaxed ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}
                                                            >
                                                                {task.text}
                                                            </span>

                                                            {/* Delete */}
                                                            <button
                                                                onClick={() => deleteMatrixTask(task.id)}
                                                                className={`transition-all p-1 rounded text-gray-600 hover:text-red-400 ${revealedTaskId === task.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                            </button>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Input */}
                                        <div className="px-5 pb-5 pt-3">
                                            <div className="flex gap-2">
                                                <input
                                                    ref={el => inputRefs.current[q.id] = el}
                                                    type="text"
                                                    value={inputs[q.id]}
                                                    onChange={e => setInputs(p => ({ ...p, [q.id]: e.target.value }))}
                                                    onKeyDown={e => handleKey(e, q.id)}
                                                    placeholder="Type task, press Enter..."
                                                    className="flex-1 bg-black/30 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-white/25 placeholder-gray-600 transition-colors"
                                                />
                                                <button
                                                    onClick={() => handleAdd(q.id)}
                                                    disabled={!inputs[q.id].trim()}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                                                    style={{
                                                        background: inputs[q.id].trim() ? `${q.accentColor}25` : 'rgba(255,255,255,0.04)',
                                                        border: `1px solid ${inputs[q.id].trim() ? q.accentColor + '60' : 'rgba(255,255,255,0.08)'}`,
                                                        color: inputs[q.id].trim() ? q.accentColor : '#4b5563',
                                                        cursor: inputs[q.id].trim() ? 'pointer' : 'not-allowed',
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
