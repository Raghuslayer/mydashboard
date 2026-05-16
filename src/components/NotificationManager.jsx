import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBellSlash, faFire } from '@fortawesome/free-solid-svg-icons';
import { useData } from '../contexts/DataProvider';
import {
    requestNotificationPermission,
    getNotificationPermission,
    startNotificationScheduler,
    stopNotificationScheduler,
    sendTestNotification,
} from '../services/notifications';
import { staticData, routineTabs } from '../data/staticData';

export default function NotificationManager() {
    const { checkedStates, dailyTasks, customRoutineTasks, editableRoutineTabs } = useData();
    const [permission, setPermission] = useState(getNotificationPermission());
    const [showBanner, setShowBanner] = useState(false);
    const [lastMessage, setLastMessage] = useState('');
    const [testing, setTesting] = useState(false);

    // Build current task stats from all sources
    const getTaskStats = useCallback(() => {
        let completed = 0;
        let total = 0;
        const taskNames = [];

        // Routine tasks
        routineTabs.forEach(tabId => {
            const isEditable = editableRoutineTabs?.includes(tabId);
            const items = isEditable
                ? (customRoutineTasks?.[tabId] || [])
                : (staticData[tabId] || []);
            total += items.length;

            const tabState = checkedStates[tabId] || {};
            if (isEditable && typeof tabState === 'object' && !Array.isArray(tabState)) {
                completed += Object.values(tabState).filter(Boolean).length;
            } else {
                const states = Array.isArray(tabState) ? tabState : Object.values(tabState);
                completed += states.filter(Boolean).length;
            }

            // Collect uncompleted task names for context
            items.forEach((item, idx) => {
                const isDone = isEditable
                    ? !!tabState[item.id]
                    : !!states[idx];
                if (!isDone && item.title) taskNames.push(item.title);
            });
        });

        // Daily tasks
        if (dailyTasks) {
            total += dailyTasks.length;
            completed += dailyTasks.filter(t => t.done).length;
            dailyTasks.filter(t => !t.done).forEach(t => taskNames.push(t.text));
        }

        return { completed, total, taskNames: taskNames.slice(0, 5) };
    }, [checkedStates, dailyTasks, customRoutineTasks, editableRoutineTabs]);

    // Start scheduler when permission is granted
    useEffect(() => {
        if (permission === 'granted') {
            startNotificationScheduler(getTaskStats);
        } else {
            stopNotificationScheduler();
        }

        return () => stopNotificationScheduler();
    }, [permission, getTaskStats]);

    // Show permission request banner once (if not decided)
    useEffect(() => {
        const dismissed = localStorage.getItem('notif_banner_dismissed');
        if (permission === 'default' && !dismissed) {
            // Delay slightly so app loads first
            const t = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(t);
        }
    }, [permission]);

    const handleEnable = async () => {
        const granted = await requestNotificationPermission();
        setPermission(getNotificationPermission());
        setShowBanner(false);
        if (granted) {
            localStorage.setItem('notif_banner_dismissed', '1');
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('notif_banner_dismissed', '1');
        setShowBanner(false);
    };

    const handleTest = async () => {
        setTesting(true);
        const stats = getTaskStats();
        const msg = await sendTestNotification(stats.completed, stats.total, stats.taskNames);
        setPermission(getNotificationPermission());
        if (msg && typeof msg === 'string') setLastMessage(msg);
        setTesting(false);
    };

    return (
        <>
            {/* Permission Banner */}
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg px-4"
                    >
                        <div className="glass-panel border border-fire-orange/40 p-5 shadow-[0_0_40px_rgba(255,94,0,0.25)]">
                            <div className="flex items-start gap-4">
                                <div className="text-3xl mt-0.5">
                                    <FontAwesomeIcon icon={faFire} className="text-fire-orange" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white mb-1">Stay Hard — Enable Notifications</p>
                                    <p className="text-sm text-gray-400 leading-snug">
                                        Get David Goggins-style push notifications throughout the day to keep you accountable and on track.
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={handleEnable}
                                            className="px-4 py-2 bg-gradient-to-r from-fire-orange to-fire-red text-white text-sm font-semibold rounded-lg hover:shadow-[0_0_15px_rgba(255,94,0,0.5)] transition-all"
                                        >
                                            <FontAwesomeIcon icon={faBell} className="mr-2" />
                                            Enable
                                        </button>
                                        <button
                                            onClick={handleDismiss}
                                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            Maybe later
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Status Button (in corner) */}
            {permission === 'granted' && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                    {/* Last message preview */}
                    <AnimatePresence>
                        {lastMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="glass-panel border border-fire-orange/30 p-3 max-w-xs text-xs text-gray-300 leading-snug shadow-xl"
                            >
                                <p className="text-fire-orange font-semibold text-xs mb-1">Last Notification:</p>
                                <p>"{lastMessage}"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTest}
                        disabled={testing}
                        title="Test Goggins notification"
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-fire-orange to-fire-red shadow-[0_0_20px_rgba(255,94,0,0.4)] flex items-center justify-center text-white hover:shadow-[0_0_30px_rgba(255,94,0,0.6)] transition-all disabled:opacity-60"
                    >
                        {testing ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faBell} />
                        )}
                    </motion.button>
                </div>
            )}
        </>
    );
}
