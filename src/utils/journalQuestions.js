// Psychology-based daily check-in questions
// Based on research from positive psychology, cognitive behavioral therapy, and wellbeing science

export const dailyCheckInQuestions = [
    {
        id: 'morning_mood',
        category: 'mood',
        question: "How did you feel when you woke up this morning?",
        type: 'single',
        options: [
            { value: 5, label: '🌟 Energized & Ready', mood: 'excellent' },
            { value: 4, label: '😊 Good & Positive', mood: 'good' },
            { value: 3, label: '😐 Neutral', mood: 'neutral' },
            { value: 2, label: '😔 Tired or Low', mood: 'low' },
            { value: 1, label: '😞 Exhausted or Distressed', mood: 'poor' }
        ]
    },
    {
        id: 'energy_level',
        category: 'energy',
        question: "What was your energy level throughout the day?",
        type: 'single',
        options: [
            { value: 5, label: '⚡ High energy all day', mood: 'excellent' },
            { value: 4, label: '💪 Good energy, occasional dips', mood: 'good' },
            { value: 3, label: '🔋 Moderate, managed tasks', mood: 'neutral' },
            { value: 2, label: '😴 Low energy, struggled', mood: 'low' },
            { value: 1, label: '🛌 Drained, could barely function', mood: 'poor' }
        ]
    },
    {
        id: 'productivity',
        category: 'achievement',
        question: "How productive were you today?",
        type: 'single',
        options: [
            { value: 5, label: '🚀 Crushed my goals', mood: 'excellent' },
            { value: 4, label: '✅ Got important things done', mood: 'good' },
            { value: 3, label: '📋 Made some progress', mood: 'neutral' },
            { value: 2, label: '😕 Struggled to focus', mood: 'low' },
            { value: 1, label: '😣 Couldn\'t get anything done', mood: 'poor' }
        ]
    },
    {
        id: 'stress_level',
        category: 'stress',
        question: "How stressed did you feel today?",
        type: 'single',
        options: [
            { value: 5, label: '😌 Calm & relaxed', mood: 'excellent' },
            { value: 4, label: '🙂 Mostly calm, minor stress', mood: 'good' },
            { value: 3, label: '😐 Moderate stress', mood: 'neutral' },
            { value: 2, label: '😰 High stress', mood: 'low' },
            { value: 1, label: '😫 Overwhelmed', mood: 'poor' }
        ]
    },
    {
        id: 'social_connection',
        category: 'social',
        question: "How connected did you feel with others today?",
        type: 'single',
        options: [
            { value: 5, label: '❤️ Great conversations & connections', mood: 'excellent' },
            { value: 4, label: '😊 Positive interactions', mood: 'good' },
            { value: 3, label: '🤝 Normal social day', mood: 'neutral' },
            { value: 2, label: '😶 Felt isolated', mood: 'low' },
            { value: 1, label: '😞 Lonely or disconnected', mood: 'poor' }
        ]
    },
    {
        id: 'gratitude',
        category: 'positivity',
        question: "Did you experience moments of gratitude or joy today?",
        type: 'single',
        options: [
            { value: 5, label: '🌈 Multiple joyful moments', mood: 'excellent' },
            { value: 4, label: '✨ Few good moments', mood: 'good' },
            { value: 3, label: '🙂 A couple small positives', mood: 'neutral' },
            { value: 2, label: '😕 Struggled to find positives', mood: 'low' },
            { value: 1, label: '😢 Couldn\'t find anything', mood: 'poor' }
        ]
    },
    {
        id: 'challenges',
        category: 'resilience',
        question: "How well did you handle challenges today?",
        type: 'single',
        options: [
            { value: 5, label: '💪 Tackled them head-on', mood: 'excellent' },
            { value: 4, label: '👍 Managed well', mood: 'good' },
            { value: 3, label: '🤷 Got through them', mood: 'neutral' },
            { value: 2, label: '😓 Struggled significantly', mood: 'low' },
            { value: 1, label: '😞 Felt defeated', mood: 'poor' }
        ]
    },
    {
        id: 'self_care',
        category: 'wellbeing',
        question: "Did you take care of yourself today?",
        type: 'multiple',
        options: [
            { value: 1, label: '🍎 Ate well' },
            { value: 1, label: '💧 Stayed hydrated' },
            { value: 1, label: '🏃 Exercised' },
            { value: 1, label: '😴 Got good sleep last night' },
            { value: 1, label: '🧘 Took breaks/relaxed' },
            { value: 0, label: '❌ None of the above' }
        ]
    }
];

/**
 * Analyze daily check-in responses and generate insights
 * @param {Object} responses - User's responses to questions
 * @returns {Object} Analysis results with mood, insights, warnings
 */
export function analyzeDailyCheckIn(responses) {
    const scores = {
        mood: 0,
        energy: 0,
        achievement: 0,
        stress: 0,
        social: 0,
        positivity: 0,
        resilience: 0,
        wellbeing: 0
    };

    let totalQuestions = 0;

    // Calculate category scores
    dailyCheckInQuestions.forEach(question => {
        const response = responses[question.id];
        if (response !== undefined) {
            if (question.type === 'single') {
                scores[question.category] = response;
                totalQuestions++;
            } else if (question.type === 'multiple' && Array.isArray(response)) {
                const selfCareScore = response.reduce((sum, val) => sum + val, 0);
                scores[question.category] = (selfCareScore / 5) * 5; // Normalize to 1-5
                totalQuestions++;
            }
        }
    });

    // Calculate overall mood rating (1-5)
    const overallMood = totalQuestions ?
        Math.round(Object.values(scores).reduce((sum, val) => sum + val, 0) / totalQuestions) : 3;

    // Determine primary feeling
    const feeling = determinePrimaryFeeling(scores, overallMood);

    // Generate insights
    const insights = generateInsights(scores, responses);

    // Detect warnings
    const warnings = detectWarnings(scores);

    // Get emoji and color
    const { emoji, color } = getMoodIndicator(overallMood);

    return {
        overallMood,
        feeling,
        emoji,
        color,
        scores,
        insights,
        warnings,
        timestamp: new Date().toISOString()
    };
}

function determinePrimaryFeeling(scores, overallMood) {
    if (overallMood >= 4.5) return '🌟 Thriving';
    if (overallMood >= 4) return '😊 Happy & Content';
    if (overallMood >= 3.5) return '🙂 Good';
    if (overallMood >= 3) return '😐 Okay';
    if (overallMood >= 2.5) return '😔 Struggling';
    if (overallMood >= 2) return '😞 Down';
    return '😢 Distressed';
}

function generateInsights(scores, responses) {
    const insights = [];

    // High energy + high productivity = peak performance
    if (scores.energy >= 4 && scores.achievement >= 4) {
        insights.push({
            type: 'success',
            icon: '🚀',
            text: 'You\'re in a flow state! High energy and productivity.'
        });
    }

    // High stress warning
    if (scores.stress <= 2) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            text: 'High stress detected. Consider relaxation techniques.'
        });
    }

    // Low social connection
    if (scores.social <= 2) {
        insights.push({
            type: 'tip',
            icon: '💬',
            text: 'Feeling isolated? Reach out to a friend or loved one.'
        });
    }

    // Low self-care
    if (scores.wellbeing <= 2) {
        insights.push({
            type: 'reminder',
            icon: '🧘',
            text: 'Remember to take care of yourself - body and mind.'
        });
    }

    // Gratitude positive
    if (scores.positivity >= 4) {
        insights.push({
            type: 'celebration',
            icon: '✨',
            text: 'Great job finding moments of joy and gratitude!'
        });
    }

    // Resilience
    if (scores.resilience >= 4) {
        insights.push({
            type: 'strength',
            icon: '💪',
            text: 'You handled challenges like a champion today!'
        });
    }

    return insights;
}

function detectWarnings(scores) {
    const warnings = [];

    // Burnout risk (low energy + high stress + low wellbeing)
    if (scores.energy <= 2 && scores.stress <= 2 && scores.wellbeing <= 2) {
        warnings.push({
            level: 'high',
            icon: '🚨',
            text: 'Burnout risk detected',
            advice: 'Take a break, rest, and prioritize self-care. Consider talking to someone.'
        });
    }

    // Consistent low mood pattern would be detected over multiple days
    if (scores.mood <= 2 && scores.positivity <= 2) {
        warnings.push({
            level: 'medium',
            icon: '⚠️',
            text: 'Low mood detected',
            advice: 'If this persists, consider reaching out for support.'
        });
    }

    return warnings;
}

function getMoodIndicator(mood) {
    if (mood >= 4.5) return { emoji: '🌟', color: '#10b981' }; // Green
    if (mood >= 4) return { emoji: '😊', color: '#22c55e' };
    if (mood >= 3.5) return { emoji: '🙂', color: '#84cc16' };
    if (mood >= 3) return { emoji: '😐', color: '#eab308' }; // Yellow
    if (mood >= 2.5) return { emoji: '😔', color: '#f59e0b' }; // Orange
    if (mood >= 2) return { emoji: '😞', color: '#ef4444' }; // Red
    return { emoji: '😢', color: '#dc2626' };
}

/**
 * Get check-in status (always available now)
 * @returns {Object} check-in availability status
 */
export function getCheckInStatus() {
    return {
        isAvailable: true,
        message: '✨ Your daily check-in is ready!'
    };
}
