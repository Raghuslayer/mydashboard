export default async function handler(request, response) {
    // Enable CORS
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    const { prompt, systemInstruction } = request.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash";

    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const bodyValue = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        if (systemInstruction) {
            bodyValue.system_instruction = { parts: [{ text: systemInstruction }] };
        }

        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyValue)
        });

        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            throw new Error(data.error?.message || fetchResponse.statusText);
        }

        return response.status(200).json(data);
    } catch (error) {
        console.error('Gemini Proxy Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
