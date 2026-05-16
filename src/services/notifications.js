import { getGogginsPushMessage } from './gemini';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// ─── Time of Day Helper ─────────────────────────────────────────────────────
export function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 9)  return 'morning';
    if (hour >= 9 && hour < 12) return 'midMorning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

// Notification schedule: { hour, minute } entries throughout the day
const NOTIFICATION_SCHEDULE = [
    { hour: 6,  minute: 0  },  // 6:00 AM  - morning wake-up call
    { hour: 8,  minute: 30 },  // 8:30 AM  - mid-morning check
    { hour: 11, minute: 0  },  // 11:00 AM - late-morning push
    { hour: 13, minute: 0  },  // 1:00 PM  - post-lunch motivation
    { hour: 15, minute: 30 },  // 3:30 PM  - afternoon slump buster
    { hour: 18, minute: 0  },  // 6:00 PM  - evening check-in
    { hour: 20, minute: 30 },  // 8:30 PM  - night push
    { hour: 22, minute: 0  },  // 10:00 PM - final accountability
    { hour: 23, minute: 30 },  // 11:30 PM - journal and sleep reminder
];

// ─── Permission ─────────────────────────────────────────────────────────────
export async function requestNotificationPermission() {
    if (Capacitor.isNativePlatform()) {
        const perm = await LocalNotifications.requestPermissions();
        return perm.display === 'granted';
    } else {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return false;
        }
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;

        const result = await Notification.requestPermission();
        return result === 'granted';
    }
}

export async function getNotificationPermission() {
    if (Capacitor.isNativePlatform()) {
        const perm = await LocalNotifications.checkPermissions();
        // Capacitor returns 'prompt', 'prompt-with-rationale', 'granted', or 'denied'
        if (perm.display === 'granted') return 'granted';
        if (perm.display === 'denied') return 'denied';
        return 'default'; // mapping prompt to default
    } else {
        if (!('Notification' in window)) return 'unsupported';
        return Notification.permission;
    }
}

// ─── Fire a notification ─────────────────────────────────────────────────────
async function fireNotification(message, title = "⚡ WARRIOR DASHBOARD") {
    if (Capacitor.isNativePlatform()) {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') return;

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: new Date().getTime() % 100000,
                    title: title,
                    body: message,
                    schedule: { at: new Date(Date.now() + 1000) }, // Fire almost immediately
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    } else {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const notif = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'warrior-dashboard-push', // Replace previous notifications
            requireInteraction: false,
            silent: false,
        });

        // Auto-close after 8 seconds
        setTimeout(() => notif.close(), 8000);

        notif.onclick = () => {
            window.focus();
            notif.close();
        };
    }
}

// ─── Build and send a dynamic notification ───────────────────────────────────
export async function sendDynamicNotification(tasksCompleted, tasksTotal, taskNames = [], behaviorContext = '', localMessageOverride = '') {
    if (localMessageOverride) {
        await fireNotification(localMessageOverride);
        return localMessageOverride;
    }

    const timeOfDay = getTimeOfDay();
    const context = { timeOfDay, tasksCompleted, tasksTotal, taskNames, behaviorContext };

    try {
        const message = await getGogginsPushMessage(context);
        await fireNotification(message);
        return message;
    } catch (err) {
        console.error('Failed to send notification:', err);
    }
}

// ─── Scheduler ───────────────────────────────────────────────────────────────
let _schedulerInterval = null;
let _lastStats = null;
let _lastActivityTime = Date.now();
let _milestonesHit = new Set(); // store milestones for the current session

/**
 * Starts the notification scheduler.
 * Checks every minute whether it's time to fire a notification based on time OR behavior.
 * @param {Function} getTaskStats - callback that returns { completed, total, taskNames }
 */
export function startNotificationScheduler(getTaskStats) {
    stopNotificationScheduler(); // ensure no duplicates

    // Check for long absence upon init
    const lastCheckStr = localStorage.getItem('notif_last_check');
    if (lastCheckStr) {
        const hoursAway = (Date.now() - parseInt(lastCheckStr, 10)) / (1000 * 60 * 60);
        if (hoursAway > 12) {
            // Autonomous local reminder to save API calls
            sendDynamicNotification(0, 0, [], '', "You've been gone for a while. The world didn't stop, and neither should you. Open your dashboard and get back to work. Stay Hard.");
        }
    }

    const check = async () => {
        localStorage.setItem('notif_last_check', Date.now().toString());

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const stats = getTaskStats();

        // 1. Time-based Static Schedule Check
        const shouldFireTime = NOTIFICATION_SCHEDULE.some(
            s => s.hour === hour && s.minute === minute
        );
        const slotKey = `${hour}:${minute}`;
        const lastSlot = localStorage.getItem('notif_last_slot');
        let fireTime = (shouldFireTime && lastSlot !== slotKey);

        // 2. Autonomous Behavior Check
        let fireBehavior = false;
        let behaviorContext = '';

        if (_lastStats) {
            const pct = stats.total > 0 ? (stats.completed / stats.total) : 0;
            const lastPct = _lastStats.total > 0 ? (_lastStats.completed / _lastStats.total) : 0;

            // Detect progress
            if (stats.completed > _lastStats.completed) {
                _lastActivityTime = Date.now();
                
                // 50% Milestone
                if (pct >= 0.5 && lastPct < 0.5 && !_milestonesHit.has('50')) {
                    _milestonesHit.add('50');
                    fireBehavior = true;
                    behaviorContext = "User just hit exactly 50% completion. Tell them they are halfway there but the battle isn't over.";
                }
                // 100% Milestone
                else if (pct === 1 && lastPct < 1 && !_milestonesHit.has('100')) {
                    _milestonesHit.add('100');
                    fireBehavior = true;
                    behaviorContext = "User just finished ALL tasks for the day. Tell them they did good, but tomorrow the war starts again.";
                }
            } 
            // Detect Inactivity
            else {
                const hoursSinceActivity = (Date.now() - _lastActivityTime) / (1000 * 60 * 60);
                // Inactive for 3+ hours during active daytime (9 AM - 8 PM), with tasks left
                if (hoursSinceActivity >= 3 && hour >= 9 && hour <= 20 && pct < 1) {
                    const lastInactivityPush = localStorage.getItem('notif_last_inactivity');
                    const todayStr = now.toISOString().split('T')[0];
                    if (lastInactivityPush !== todayStr) {
                        fireBehavior = true;
                        behaviorContext = "User has been completely inactive for 3+ hours and still has tasks left. Give them a brutal wake-up call to stop slacking.";
                        localStorage.setItem('notif_last_inactivity', todayStr);
                        _lastActivityTime = Date.now(); // reset so we don't spam
                    }
                }
            }
        }

        // Reset state on a new day
        const currentDay = now.getDate();
        const lastDay = parseInt(localStorage.getItem('notif_last_day') || '0', 10);
        if (currentDay !== lastDay) {
            _milestonesHit.clear();
            localStorage.setItem('notif_last_day', currentDay.toString());
        }

        _lastStats = { ...stats };

        // 3. Fire Notification
        if (fireTime || fireBehavior) {
            if (fireTime) localStorage.setItem('notif_last_slot', slotKey);

            let localOverride = '';
            
            // Late night journal reminder (Autonomous, local to save API limit)
            if (fireTime && hour === 23 && minute === 30) {
                localOverride = "It's almost midnight. Write your journal, plan tomorrow's war, and go to sleep. Don't waste the night. Stay Hard.";
            } 
            // Inactivity fallback (save API)
            else if (fireBehavior && behaviorContext.includes('inactive for 3+ hours')) {
                localOverride = "You've been slacking for 3 hours. Time is ticking. Get back to your tasks right now. Stay Hard.";
            }

            await sendDynamicNotification(stats.completed, stats.total, stats.taskNames, behaviorContext, localOverride);
        }
    };

    // Check immediately, then every 60 seconds
    check();
    _schedulerInterval = setInterval(check, 60 * 1000);
}

export function stopNotificationScheduler() {
    if (_schedulerInterval) {
        clearInterval(_schedulerInterval);
        _schedulerInterval = null;
    }
}

// ─── Test helper: fire a notification right now ──────────────────────────────
export async function sendTestNotification(tasksCompleted, tasksTotal, taskNames = []) {
    const granted = await requestNotificationPermission();
    if (!granted) return 'Permission denied';
    return await sendDynamicNotification(tasksCompleted, tasksTotal, taskNames);
}
