import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar, faChartLine, faLightbulb,
    faExclamationTriangle, faCheckCircle, faBolt
} from '@fortawesome/free-solid-svg-icons';

export default function DailySummary({ entry }) {
    const { analysis, responses, date } = entry;
    const { overallMood, feeling, emoji, color, insights, warnings, scores } = analysis;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Mood Header */}
            <div className="glass-panel p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }}></div>
                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-8xl mb-4"
                    >
                        {emoji}
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color }}>{feeling}</h2>
                    <p className="text-gray-400">
                        {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-500">Overall Mood:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 + (i * 0.05) }}
                                    className={`w-3 h-3 rounded-full ${i <= overallMood ? 'bg-fire-orange' : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warnings (if any) */}
            {warnings && warnings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    {warnings.map((warning, index) => (
                        <div
                            key={index}
                            className={`glass-panel p-4 border-2 ${warning.level === 'high'
                                    ? 'border-red-500/50 bg-red-500/10'
                                    : 'border-yellow-500/50 bg-yellow-500/10'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className={warning.level === 'high' ? 'text-red-500' : 'text-yellow-500'}
                                />
                                <div className="flex-1">
                                    <p className="font-semibold mb-1">{warning.text}</p>
                                    <p className="text-sm text-gray-400">{warning.advice}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Insights */}
            {insights && insights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faLightbulb} className="text-fire-orange" />
                        <h3 className="text-lg font-semibold">Insights</h3>
                    </div>
                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                            >
                                <span className="text-2xl">{insight.icon}</span>
                                <p className="flex-1 text-sm">{insight.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Category Scores */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faChartLine} className="text-fire-orange" />
                    <h3 className="text-lg font-semibold">Detailed Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(scores).map(([category, score], index) => {
                        if (score === 0) return null;
                        return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + (index * 0.05) }}
                                className="text-center"
                            >
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                    {category}
                                </p>
                                <div className="relative w-16 h-16 mx-auto mb-2">
                                    <svg className="transform -rotate-90 w-16 h-16">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            className="text-white/10"
                                        />
                                        <motion.circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 28}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                            animate={{
                                                strokeDashoffset: 2 * Math.PI * 28 * (1 - score / 5)
                                            }}
                                            transition={{ duration: 1, delay: 0.7 + (index * 0.05) }}
                                            className="text-fire-orange"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold">{score.toFixed(1)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Manual Notes (if any) */}
            {entry.text && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-panel p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-fire-orange" />
                        <h3 className="text-lg font-semibold">Additional Notes</h3>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{entry.text}</p>
                </motion.div>
            )}
        </motion.div>
    );
}
