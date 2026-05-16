import React from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCrosshairs, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { staticData, routineTabs } from '../data/staticData';
import { getTierForLevel } from '../utils/tierSystem';

export default function StatsBar() {
    const { userData, checkedStates, dailyTasks, getRoutineTasks, editableRoutineTabs, achievementJar } = useData();

    // Calculate XP progress with quadratic scaling (PUBG-style)
    const xp = userData?.xp || 0;
    // Formula: XP = 50 * (L^2 - L) => L = floor((1 + sqrt(1 + 0.08 * xp)) / 2)
    const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 0.08 * xp)) / 2));
    const currentLevelBaseXp = 50 * (level * level - level);
    const nextLevelBaseXp = 50 * ((level + 1) * (level + 1) - (level + 1));
    const xpInLevel = Math.max(0, xp - currentLevelBaseXp);
    const xpRequiredForNextLevel = nextLevelBaseXp - currentLevelBaseXp;
    const xpPercent = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForNextLevel) * 100));

    // Calculate daily progress with safety checks
    const calculateProgress = () => {
        let total = 0;
        let completed = 0;

        try {
            // Count routine tasks - use custom tasks for editable tabs
            if (Array.isArray(routineTabs)) {
                routineTabs.forEach(tabId => {
                    const isEditable = editableRoutineTabs?.includes(tabId);
                    const items = (getRoutineTasks && isEditable)
                        ? getRoutineTasks(tabId)
                        : staticData?.[tabId];

                    if (Array.isArray(items)) {
                        const rawStates = checkedStates?.[tabId];

                        if (isEditable && rawStates && typeof rawStates === 'object' && !Array.isArray(rawStates)) {
                            // ID-based counting for editable tabs
                            total += items.length;
                            completed += Object.values(rawStates).filter(Boolean).length;
                        } else {
                            // Index-based counting for legacy tabs
                            const states = Array.isArray(rawStates)
                                ? rawStates
                                : Object.values(rawStates || {});
                            total += items.length;
                            completed += states.filter(Boolean).length;
                        }
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
            {/* Goal / Focus Block */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4 mb-1">
                    <div className="flex items-center gap-2 text-fire-orange bg-fire-orange/10 px-3 py-1 rounded-md border border-fire-orange/20">
                        <FontAwesomeIcon icon={faCrosshairs} className="text-xs" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Active Objective</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-xs" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                <h2 className="header-font text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 leading-none filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                    {(userData?.goal || 'UNLEASH YOUR INNER FIRE').toUpperCase()}
                </h2>
            </div>

            {/* Stats Bars */}
            <div className="flex items-center gap-6">
                {/* XP Bar */}
                <div className="w-40">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
                        <span>XP Progress</span>
                        <span>{xpInLevel} / {xpRequiredForNextLevel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-fire-orange to-fire-red h-full rounded-full transition-all duration-500"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[11px] text-gray-400 font-bold tracking-wider">Lv.{level}</p>
                        <p className="text-[11px] font-bold tracking-wider flex items-center gap-1.5" style={{ color: getTierForLevel(level).color }}>
                            <FontAwesomeIcon icon={getTierForLevel(level).icon} />
                            {getTierForLevel(level).name}
                        </p>
                    </div>
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

                {/* Achievement Vault Counter */}
                {achievementJar && achievementJar.length > 0 && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: 2,
                    }}>
                        <div style={{ fontSize: 9, color: 'rgba(160,110,80,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 1 }}>
                            Vault
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(192,36,42,0.12)',
                            border: '1px solid rgba(192,36,42,0.28)',
                            borderRadius: 6, padding: '3px 10px',
                        }}>
                            <span style={{ fontSize: 13 }}>🏆</span>
                            <span style={{ fontFamily: "'Teko', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#c8943a', lineHeight: 1 }}>
                                {achievementJar.length}
                            </span>
                        </div>
                    </div>
                )}

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
