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

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    // List of queries from the frontend logic
    const queries = [
        'david goggins motivation #shorts',
        'bruce lee mindset #shorts',
        'tough mindset motivation #shorts',
        'stoic wisdom daily #shorts',
        'life lessons motivation #shorts',
        'successful people habits #shorts',
        'andrew tate motivation #shorts',
        'jocko willink discipline #shorts',
        'navy seal mindset #shorts',
        'never give up motivation #shorts',
        'self improvement daily #shorts',
        'millionaire mindset #shorts',
        'entrepreneur motivation #shorts',
        'grind mindset success #shorts',
        'gary vee motivation #shorts',
        'elon musk advice #shorts',
        'hard work motivation #shorts',
        'mental toughness #shorts',
        'discipline equals freedom #shorts',
        'morning motivation #shorts',
        'stay hard goggins #shorts',
        'be uncommon #shorts',
        'conor mcgregor mindset #shorts'
    ];

    try {
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(randomQuery)}&type=video&videoDuration=short&key=${apiKey}`;

        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            throw new Error(data.error?.message || fetchResponse.statusText);
        }

        return response.status(200).json(data);
    } catch (error) {
        console.error('YouTube Proxy Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
