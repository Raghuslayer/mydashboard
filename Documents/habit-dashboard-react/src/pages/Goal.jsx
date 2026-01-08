import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Goal() {
    const { userData, updateGoal } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [newGoal, setNewGoal] = useState('');

    const currentGoal = userData?.goal || 'UNLEASH YOUR INNER FIRE';

    const handleEdit = () => {
        setNewGoal(currentGoal);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (newGoal.trim()) {
            await updateGoal(newGoal.trim());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewGoal('');
    };

    return (
        <div className="glass-panel p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="header-font text-5xl md:text-6xl fire-text mb-6">MY ULTIMATE GOAL</h2>

            {isEditing ? (
                <div className="space-y-4">
                    <textarea
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white text-lg focus:border-fire-orange focus:outline-none resize-none"
                        rows={3}
                        placeholder="Enter your ultimate goal..."
                        autoFocus
                    />
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg text-white transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faSave} /> Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-white transition-all flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTimes} /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 italic leading-relaxed">
                        "{currentGoal}"
                    </p>
                    <button
                        onClick={handleEdit}
                        className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg text-white transition-all flex items-center gap-2 mx-auto"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} /> EDIT GOAL
                    </button>
                </>
            )}
        </div>
    );
}
