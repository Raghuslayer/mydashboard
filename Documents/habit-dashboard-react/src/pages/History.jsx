import React from 'react';
import { useData } from '../contexts/DataProvider';

export default function History() {
    const { historyData, loadingData } = useData();

    if (loadingData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="rounded-xl h-32 skeleton" />
                ))}
            </div>
        );
    }

    if (!historyData || historyData.length === 0) {
        return (
            <div className="glass-panel p-10 text-center">
                <div className="text-6xl text-gray-600 mb-4">📅</div>
                <h2 className="header-font text-3xl text-white mb-2">No History Yet</h2>
                <p className="text-gray-400">Complete tasks to see your progress history!</p>
            </div>
        );
    }

    // Sort by date descending for display
    const sortedData = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="header-font text-3xl text-white">Progress History</h2>
                <span className="text-sm text-gray-400">{sortedData.length} days tracked</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedData.map((day, i) => {
                    const percent = day.total ? Math.round((day.completed / day.total) * 100) : 0;
                    const circumference = 2 * Math.PI * 28; // r=28
                    const strokeDashoffset = circumference - (circumference * percent / 100);

                    return (
                        <div
                            key={day.date || i}
                            className="tile p-5 rounded-xl flex items-center justify-between"
                            style={{ animationDelay: `${i * 0.03}s` }}
                        >
                            <div>
                                <div className="header-font text-2xl text-white">
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {day.completed || 0} / {day.total || 0} Tasks
                                </div>
                            </div>

                            {/* Circular Progress */}
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="#333"
                                        strokeWidth="4"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke={percent === 100 ? '#10b981' : '#ff5e00'}
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <span className={`absolute text-xs font-bold ${percent === 100 ? 'text-green-400' : 'text-white'}`}>
                                    {percent}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
