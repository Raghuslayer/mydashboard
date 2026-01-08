import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faSave, faTimes, faGraduationCap, faListCheck } from '@fortawesome/free-solid-svg-icons';
import TileGrid from '../components/TileGrid';

export default function SemesterGoals() {
    const { semesterGoals, addSemesterGoal, updateSemesterGoal, deleteSemesterGoal } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form States
    const [formData, setFormData] = useState({ title: '', description: '', contextItems: '' });

    const handleAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({ title: '', description: '', contextItems: '' });
    };

    const handleEdit = (goal) => {
        setIsAdding(true);
        setEditingId(goal.id);
        setFormData({
            title: goal.title,
            description: goal.description,
            contextItems: goal.contextItems ? goal.contextItems.join('\n') : ''
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            deleteSemesterGoal(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const contextArray = formData.contextItems
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');

        const goalPayload = {
            title: formData.title,
            description: formData.description,
            contextItems: contextArray,
            thumbnail: 'https://placehold.co/600x400/9D0000/FF2A00?text=GOAL', // Default thumbnail
            icon: 'faGraduationCap'
        };

        if (editingId) {
            updateSemesterGoal(editingId, goalPayload);
        } else {
            addSemesterGoal(goalPayload);
        }

        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="header-font text-4xl md:text-5xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Semester Goals
                    </h1>
                    <p className="text-gray-400 font-light tracking-wide">
                        Define your academic and personal targets.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-fire-orange hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-orange-500/20"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span className="hidden md:inline">Add Goal</span>
                </button>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semesterGoals.length === 0 ? (
                    <div className="col-span-full text-center py-20 opacity-50">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-6xl mb-4 text-gray-600" />
                        <p className="text-xl text-gray-400">No goals set yet. Add one to get started!</p>
                    </div>
                ) : (
                    semesterGoals.map(goal => (
                        <div key={goal.id} className="glass-panel group relative overflow-hidden flex flex-col h-full hover:border-fire-orange/30 transition-all duration-300">

                            {/* Decorative Top Bar */}
                            <div className="h-1 bg-gradient-to-r from-fire-orange to-fire-yellow w-full absolute top-0 left-0" />

                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="header-font text-2xl text-white">{goal.title}</h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="text-gray-400 hover:text-white p-2"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="text-gray-400 hover:text-red-500 p-2"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-400 mb-6 text-sm leading-relaxed">{goal.description}</p>

                                {goal.contextItems && goal.contextItems.length > 0 && (
                                    <div className="bg-black/20 rounded-lg p-4">
                                        <h4 className="text-xs uppercase tracking-widest text-fire-yellow mb-3 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faListCheck} /> Milestones
                                        </h4>
                                        <ul className="space-y-2">
                                            {goal.contextItems.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                                    <span className="text-fire-orange mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit/Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-lg p-8 relative animate-slide-up">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>

                        <h2 className="header-font text-3xl mb-6 text-white">
                            {editingId ? 'Edit Goal' : 'New Goal'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-fire-orange focus:outline-none transition-colors"
                                    placeholder="e.g. Master React"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-fire-orange focus:outline-none transition-colors h-24 resize-none"
                                    placeholder="Briefly describe your goal..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Milestones (One per line)</label>
                                <textarea
                                    value={formData.contextItems}
                                    onChange={(e) => setFormData({ ...formData, contextItems: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-fire-orange focus:outline-none transition-colors h-32 resize-none"
                                    placeholder="Build 3 Projects&#10;Learn Redux&#10;Deploy to Vercel"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-fire-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faSave} />
                                {editingId ? 'Update Goal' : 'Create Goal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
