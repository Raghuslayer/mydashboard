// ─── Configuration ───────────────────────────────────────────────────────────
const API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY, // Primary key from .env.local
].filter(Boolean);

// Model fallback chain — try each in order until one works
const MODEL_CHAIN = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
];

// ─── Dual-layer Cache ─────────────────────────────────────────────────────────
const _mem = new Map();
const CACHE_PREFIX = 'gc_';
const TTL_6H = 6 * 60 * 60 * 1000;
const TTL_24H = 24 * 60 * 60 * 1000;

function cacheGet(key) {
    if (_mem.has(key)) return _mem.get(key);
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (raw) {
            const { v, exp } = JSON.parse(raw);
            if (Date.now() < exp) { _mem.set(key, v); return v; }
            localStorage.removeItem(CACHE_PREFIX + key);
        }
    } catch (_) {}
    return null;
}

function cacheSet(key, value, ttl = TTL_6H) {
    _mem.set(key, value);
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: value, exp: Date.now() + ttl }));
    } catch (_) {}
}

// ─── Rate-limit tracking (per key+model) ─────────────────────────────────────
function markRateLimited(key, model) {
    const rlKey = `rl_${key.slice(-8)}_${model}`;
    // Back off 1 hour
    cacheSet(rlKey, true, 60 * 60 * 1000);
}
function isRateLimited(key, model) {
    return !!cacheGet(`rl_${key.slice(-8)}_${model}`);
}

// ─── Core API call ────────────────────────────────────────────────────────────
async function tryGemini(prompt, systemInstruction, model, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 400 },
    };
    if (systemInstruction) {
        body.system_instruction = { parts: [{ text: systemInstruction }] };
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (res.status === 429 || res.status === 503) {
        markRateLimited(apiKey, model);
        throw new Error(`RATE_LIMITED:${res.status}`);
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');
    return text;
}

/**
 * Main entry: tries every model/key combination, returns text or throws.
 */
async function callGemini(prompt, systemInstruction = '', cacheKey = null, ttl = TTL_6H) {
    if (!API_KEYS.length) throw new Error('No API key configured');

    // Cache hit?
    if (cacheKey) {
        const hit = cacheGet(cacheKey);
        if (hit) return hit;
    }

    // Try each model with each key
    for (const model of MODEL_CHAIN) {
        for (const key of API_KEYS) {
            if (isRateLimited(key, model)) continue;
            try {
                const text = await tryGemini(prompt, systemInstruction, model, key);
                if (cacheKey) cacheSet(cacheKey, text, ttl);
                console.log(`[Gemini] ✅ ${model}`);
                return text;
            } catch (err) {
                console.warn(`[Gemini] ❌ ${model}: ${err.message}`);
            }
        }
    }

    throw new Error('All Gemini models rate-limited or unavailable');
}

// ─── Rich Local Fallback Data ─────────────────────────────────────────────────
const GOGGINS_LINES = [
    "You completed {done} out of {total} tasks. {left} more to go — most people would have quit by now. You're not most people. Stay Hard.",
    "{left} tasks still waiting for you. Every minute you sit on your ass, someone else is out there grinding. Stop making excuses. Stay Hard.",
    "Listen up — {done} tasks down, {left} to go. You think this is hard? You have no idea what hard is. Get back to work. Stay Hard.",
    "It's {time}. You've done {done} tasks. Solid, but {left} left means you're not done yet. Who's going to do it if not you? Stay Hard.",
    "{done}/{total} done. That's {pct}%. The average person would call it a day. Are you average? Get after those {left} remaining tasks. Stay Hard.",
    "The grind doesn't stop at {done}. You've got {left} tasks that need your blood, sweat, and discipline. Stop comfort-seeking. Stay Hard.",
    "Check yourself — {left} tasks undone. Champions don't leave the battlefield until the job is finished. Back to work. Stay Hard.",
    "You've knocked out {done} today. Good start. But {left} tasks are still out there mocking you. Silence them. Stay Hard.",
    "{done} tasks completed like a warrior. Now {left} more are calling your name. Answer the call or regret it tonight. Stay Hard.",
    "Real accountability: {done} done, {left} remaining. The calluses on your mind aren't built in comfort zones. Finish it. Stay Hard.",
];

const GOGGINS_MORNING = [
    "It's morning. The day is fresh and your enemies are already sleeping in. {left} tasks on the board — attack them before they attack your discipline. Stay Hard.",
    "0600. Most people are hitting snooze. You've got {left} tasks waiting. The morning belongs to those who take it. Own it. Stay Hard.",
    "Morning check-in: {done} done, {left} to crush. Every morning is a second chance. Don't waste it. Stay Hard.",
    "The sun is up and so is your mission. {left} tasks — handle them before the world wakes up and distracts you. Stay Hard.",
];

const GOGGINS_EVENING = [
    "Evening. The day is slipping away. {left} tasks still on the board — are you okay with leaving them undone? I didn't think so. Stay Hard.",
    "Most people are watching TV right now. You should be completing those {left} tasks. Discipline = freedom. Stay Hard.",
    "It's evening. {done} tasks crushed today — respect. But {left} still remain. Finish what you started. Stay Hard.",
];

const GOGGINS_DONE = [
    "ALL {total} tasks completed. You think that's enough? The greats always find one more thing to improve. Stay Hard.",
    "You finished all {total} tasks. Most people never even start. Now raise the bar tomorrow. Stay Hard.",
    "{total}/{total} done. You earned it today. But remember — tomorrow is a new war. Rest. Then attack. Stay Hard.",
];

const STOIC_QUOTES = [
    { quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", lesson: "Control what you can — your effort, attitude, and focus." },
    { quote: "We suffer more in imagination than in reality.", author: "Seneca", lesson: "Stop catastrophizing. Take action on what's in front of you." },
    { quote: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus", lesson: "Do your part fully, then release attachment to outcomes." },
    { quote: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", lesson: "Stop planning and theorizing — just act with virtue right now." },
    { quote: "It is not that things are difficult that we do not dare; it is because we do not dare that they are difficult.", author: "Seneca", lesson: "Fear is the barrier. Courage is the first step, not the last." },
    { quote: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", lesson: "Obstacles are your training. Embrace resistance, don't avoid it." },
    { quote: "Man is not disturbed by events, but by the opinions about events.", author: "Epictetus", lesson: "Change your interpretation, change your reality." },
    { quote: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca", lesson: "This day is complete in itself. Attack it with full intensity." },
    { quote: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius", lesson: "Guard your mind fiercely — what you think, you become." },
    { quote: "No man is free who is not master of himself.", author: "Epictetus", lesson: "Self-discipline is the only true freedom. Practice it today." },
    { quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", lesson: "Identity before action — decide who you are, then live it." },
    { quote: "Confine yourself to the present.", author: "Marcus Aurelius", lesson: "Stop living in past regrets or future anxieties. This moment is all you have." },
];

const ANALYSIS_TEMPLATES = [
    "Your data reveals {pct}% task completion — {judgment}. The last 7 days show {trend}. \n• Focus your energy on your top 3 tasks each morning before anything else\n• Track which time of day you're most productive and protect those hours\n• A 1% daily improvement compounds — don't chase perfection, chase consistency",
    "You're averaging {avg} tasks per day. {judgment}. Your best day was {bestDay}. \n• Anchor your routine with non-negotiable morning habits\n• When motivation drops, rely on your systems not your feelings\n• Accountability is momentum — review your progress every evening",
    "Total completed this month: {total}. That's {judgment}. Your streak speaks to your character. \n• Close each day by preparing tomorrow's top priorities\n• Eliminate one time-waster from your daily routine this week\n• The gap between who you are and who you want to be is closed by daily action",
];

// ─── Helper: fill template ────────────────────────────────────────────────────
function fillTemplate(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

function getTimeLabel() {
    const h = new Date().getHours();
    if (h < 9) return 'morning';
    if (h < 12) return 'mid-morning';
    if (h < 17) return 'afternoon';
    if (h < 21) return 'evening';
    return 'night';
}

// ─── Public Exports ───────────────────────────────────────────────────────────

/**
 * Habit analysis — cached per day, rich fallback
 */
export async function getHabitAnalysis(stats, history) {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `analysis_${today}`;

    const recentDays = history.slice(-7).map(h => `${h.date}: ${h.completed}/${h.total}`).join('\n');
    const prompt = `Analyze my habit performance in 3 sentences max plus 3 bullet points:
Stats: avg ${stats.avgCompleted}/day, ${stats.totalCompleted} total this month, best streak ${stats.maxStreak} days.
Last 7 days:\n${recentDays}
Be brief, firm, Stoic-coach style. Format: analysis paragraph then bullet points.`;

    try {
        return await callGemini(prompt, 'You are a Stoic productivity coach like Marcus Aurelius. Be direct and firm.', cacheKey, TTL_24H);
    } catch (_) {
        // Rich local fallback
        const pct = stats.totalCompleted > 0 ? Math.round((stats.avgCompleted / (stats.avgCompleted || 1)) * 100) : 0;
        const judgment = stats.avgCompleted >= 8 ? 'exceptional discipline' : stats.avgCompleted >= 5 ? 'solid progress' : 'room to grow';
        const trend = history.slice(-3).every((d, i, a) => i === 0 || d.completed >= a[i-1].completed) ? 'an upward trajectory' : 'some inconsistency worth addressing';
        const tpl = ANALYSIS_TEMPLATES[Math.floor(Math.random() * ANALYSIS_TEMPLATES.length)];
        return fillTemplate(tpl, { pct, avg: stats.avgCompleted, judgment, trend, total: stats.totalCompleted, bestDay: stats.bestDay?.date || 'your best day' });
    }
}

/**
 * Task breakdown — cached by task text, rich fallback
 */
export async function getTaskBreakdown(taskText) {
    const safeKey = taskText.slice(0, 60).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cacheKey = `breakdown_${safeKey}`;

    const cached = cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const prompt = `Break down this task into 3-5 actionable sub-tasks: "${taskText}".
Return ONLY a raw JSON array of strings. No markdown. No explanation.`;

    try {
        const text = await callGemini(prompt, '', null, TTL_24H);
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonStr);
        cacheSet(cacheKey, JSON.stringify(result), TTL_24H);
        return result;
    } catch (_) {
        return [
            `Research and plan your approach to: ${taskText}`,
            'Set a 25-minute focused work session (Pomodoro)',
            'Execute the first concrete action step',
            'Review progress and adjust if needed',
            'Complete final checks and mark done',
        ];
    }
}

/**
 * Stoic quote — cached per day, rich local fallback pool
 */
export async function getStoicQuote() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `stoic_${today}`;

    const cached = cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const prompt = `Give ONE powerful Stoic quote. Return ONLY JSON (no markdown):
{"quote":"text","author":"name","lesson":"one sentence practical application"}`;

    try {
        const text = await callGemini(prompt, '', null, TTL_24H);
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonStr);
        cacheSet(cacheKey, JSON.stringify(result), TTL_24H);
        return result;
    } catch (_) {
        // Rotate through local quotes by day-of-year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const quote = STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length];
        cacheSet(cacheKey, JSON.stringify(quote), TTL_24H);
        return quote;
    }
}

/**
 * Goggins push notification — dynamic, time-relevant, cached per hour slot
 */
export async function getGogginsPushMessage(context) {
    const { timeOfDay, tasksCompleted, tasksTotal, taskNames = [] } = context;
    const tasksLeft = tasksTotal - tasksCompleted;
    const pct = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    const hourSlot = new Date().toISOString().slice(0, 13);
    const cacheKey = `goggins_${hourSlot}_${tasksCompleted}_${tasksTotal}`;

    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const timeCtx = {
        morning: "It's early morning — the day is fresh, excuses aren't born yet.",
        midMorning: "Mid-morning — the window for peak output is NOW.",
        afternoon: "Afternoon — the post-lunch dip hits the weak. Not you.",
        evening: "Evening — the day is almost gone. What did you actually do?",
        night: "Night — final accountability. No more chances today.",
    }[timeOfDay] || 'The clock is running.';

    const taskList = taskNames.slice(0, 3).join(', ') || 'your tasks';

    const prompt = `You are David Goggins. Write ONE brutal, raw motivational push notification (1-2 sentences max).
${timeCtx}
Tasks done: ${tasksCompleted}/${tasksTotal} (${pct}%)
${tasksLeft > 0 ? `Still remaining: ${taskList}` : 'ALL TASKS COMPLETED'}
Rules: Sound exactly like Goggins. Raw, masculine, no fluff. Reference the numbers. End with "Stay Hard."
Return ONLY the notification text.`;

    try {
        const text = await callGemini(prompt, 'You are David Goggins.', cacheKey, 60 * 60 * 1000);
        return text.trim();
    } catch (_) {
        // Rich local fallback
        const vars = { done: tasksCompleted, total: tasksTotal, left: tasksLeft, pct, time: getTimeLabel() };

        if (tasksLeft === 0) {
            return fillTemplate(GOGGINS_DONE[Math.floor(Math.random() * GOGGINS_DONE.length)], vars);
        }
        if (timeOfDay === 'morning' || timeOfDay === 'midMorning') {
            return fillTemplate(GOGGINS_MORNING[Math.floor(Math.random() * GOGGINS_MORNING.length)], vars);
        }
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
            return fillTemplate(GOGGINS_EVENING[Math.floor(Math.random() * GOGGINS_EVENING.length)], vars);
        }
        return fillTemplate(GOGGINS_LINES[Math.floor(Math.random() * GOGGINS_LINES.length)], vars);
    }
}

/**
 * Generic generate — no cache, no fallback
 */
export async function generateText(prompt) {
    return await callGemini(prompt);
}
