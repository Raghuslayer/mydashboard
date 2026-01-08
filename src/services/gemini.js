const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-preview-09-2025"; // Updated to latest preview model

/**
 * Retry logic for API calls
 */
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 429) { // Too Many Requests
                    throw new Error(`Rate limit exceeded. Retrying...`);
                }
                const errorData = await response.json().catch(() => ({}));
                const backendMsg = typeof errorData.error === 'string' ? errorData.error : errorData.error?.message;
                throw new Error(backendMsg || `HTTP Error: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
        }
    }
}

/**
 * Generic helper to call Gemini API via Backend Proxy
 */
async function callGemini(prompt, systemInstruction = "") {
    // Note: We no longer need the API Key here! It's safe on the server.
    const url = `/api/gemini`;

    // Construct body
    const body = {
        prompt,
        systemInstruction
    };

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("No response content from Gemini");
        }
    } catch (error) {
        console.error("Gemini API Error:", error);

        // Mock fallback for localhost if not running via 'vercel dev'
        if (error.message.includes("404") || error.message.includes("Unexpected token")) {
            return "**[Dev Mode]** API endpoint not found. Make sure to run 'vercel dev' to enable the backend functions.";
        }
        throw error;
    }
}

/**
 * Generates an AI analysis of the user's habit performance
 */
export async function getHabitAnalysis(stats, history) {
    const recentDays = history.slice(-7).map(h =>
        `${h.date}: ${h.completed}/${h.total}`
    ).join('\n');

    const prompt = `
    Analyze my recent habit performance:
    
    Stats:
    - Average Tasks/Day: ${stats.avgCompleted}
    - Total Completed (Month): ${stats.totalCompleted}
    - Best Streak: ${stats.maxStreak} days
    - Best Day: ${stats.bestDay ? stats.bestDay.date : 'N/A'}
    
    Recent History (Last 7 Days):
    ${recentDays}
    
    Provide a brief, impactful analysis (max 3 sentences) and 3 bullet points of specific, actionable advice to improve my consistency. 
    Be encouraging but firm. Focus on discipline and momentum.
    `;

    const systemPrompt = "Act as a wise, Stoic productivity coach (like Marcus Aurelius).";

    try {
        return await callGemini(prompt, systemPrompt);
    } catch (error) {
        return "The Oracle is silent today. (API Error)";
    }
}

/**
 * Generates sub-tasks for a given task
 */
export async function getTaskBreakdown(taskText) {
    const prompt = `
    I have a task: "${taskText}".
    Break this down into 3-5 smaller, actionable sub-tasks to make it less overwhelming.
    Return ONLY a raw JSON array of strings, e.g. ["Step 1", "Step 2"]. 
    Do not markdown format the JSON.
    `;

    try {
        const text = await callGemini(prompt);
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Breakdown Error:", error);
        return ["Start with 5 minutes", "Clarify the next step", "Prepare your workspace"];
    }
}

/**
 * Generates a Stoic quote and lesson
 */
export async function getStoicQuote() {
    const prompt = `Give me one powerful Stoic quote from Marcus Aurelius, Seneca, or Epictetus. 
    Format response as JSON: {"quote": "text", "author": "name", "lesson": "brief practical application"}. 
    Return ONLY JSON.`;

    try {
        const text = await callGemini(prompt);
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Quote Error:", error);
        throw error;
    }
}

/**
 * Generic function to generate content
 */
export async function generateText(prompt) {
    return await callGemini(prompt);
}
