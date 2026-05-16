import { getGogginsPushMessage } from './gemini';

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
];

// ─── Permission ─────────────────────────────────────────────────────────────
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
}

export function getNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
}

// ─── Fire a notification ─────────────────────────────────────────────────────
async function fireNotification(message, title = "⚡ WARRIOR DASHBOARD") {
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

// ─── Build and send a dynamic notification ───────────────────────────────────
export async function sendDynamicNotification(tasksCompleted, tasksTotal, taskNames = []) {
    const timeOfDay = getTimeOfDay();
    const context = { timeOfDay, tasksCompleted, tasksTotal, taskNames };

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
let _lastFiredHour = -1; // prevent duplicate fires in same minute

/**
 * Starts the notification scheduler.
 * Checks every minute whether it's time to fire a notification.
 * @param {Function} getTaskStats - callback that returns { completed, total, taskNames }
 */
export function startNotificationScheduler(getTaskStats) {
    stopNotificationScheduler(); // ensure no duplicates

    const check = async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        const shouldFire = NOTIFICATION_SCHEDULE.some(
            s => s.hour === hour && s.minute === minute
        );

        // Only fire once per scheduled slot
        const slotKey = `${hour}:${minute}`;
        const lastKey = localStorage.getItem('notif_last_slot');

        if (shouldFire && lastKey !== slotKey) {
            localStorage.setItem('notif_last_slot', slotKey);
            const stats = getTaskStats();
            await sendDynamicNotification(stats.completed, stats.total, stats.taskNames);
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
