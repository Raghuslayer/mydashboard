import React from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { staticData, routineTabs } from '../data/staticData';

export default function StatsBar() {
    const { userData, checkedStates, dailyTasks } = useData();

    // Calculate XP progress with safety checks
    const level = userData?.level || 1;
    const xp = userData?.xp || 0;
    const currentLevelXp = (level - 1) * 100;
    const xpInLevel = Math.max(0, xp - currentLevelXp);
    const xpPercent = Math.min(100, Math.max(0, xpInLevel));

    // Calculate daily progress with safety checks
    const calculateProgress = () => {
        let total = 0;
        let completed = 0;

        try {
            // Count routine tasks - with safety checks
            if (Array.isArray(routineTabs)) {
                routineTabs.forEach(tabId => {
                    const items = staticData?.[tabId];
                    if (Array.isArray(items)) {
                        const rawStates = checkedStates?.[tabId];
                        // Convert object to array if needed (Firebase stores arrays as objects)
                        const states = Array.isArray(rawStates)
                            ? rawStates
                            : Object.values(rawStates || {});
                        total += items.length;
                        completed += states.filter(Boolean).length;
                    }
                });
            }

            // Count daily tasks
            if (Array.isArray(dailyTasks)) {
                total += dailyTasks.length;
                completed += dailyTasks.filter(t => t?.done).length;
            }
        } catch (e) {
            console.error('StatsBar calculateProgress error:', e);
        }

        return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
    };

    const progress = calculateProgress();

    const handleReset = () => {
        if (window.confirm('Reset all progress for today?')) {
            window.location.reload();
        }
    };

    return (
        <div className="hidden md:flex items-center justify-between mb-8">
            {/* Goal / Focus */}
            <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Current Focus</p>
                <h2 className="header-font text-3xl lg:text-4xl text-white leading-none">
                    {(userData?.goal || 'UNLEASH YOUR INNER FIRE').toUpperCase()}
                </h2>
            </div>

            {/* Stats Bars */}
            <div className="flex items-center gap-6">
                {/* XP Bar */}
                <div className="w-40">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
                        <span>XP Progress</span>
                        <span>{xpInLevel} / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-fire-orange to-fire-red h-full rounded-full transition-all duration-500"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Level {level}</p>
                </div>

                {/* Daily Progress Bar */}
                <div className="w-40">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
                        <span>Daily Tasks</span>
                        <span>{progress.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="bg-green-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress.percent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{progress.completed}/{progress.total} done</p>
                </div>

                {/* Reset Button */}
                <button
                    onClick={handleReset}
                    className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors"
                    title="Reset Day"
                >
                    <FontAwesomeIcon icon={faArrowsRotate} />
                </button>
            </div>
        </div>
    );
}
