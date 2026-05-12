const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

/**
 * Curated motivational / hard-work theme keywords.
 * Covers David Goggins, Bruce Lee, Stoicism, elite performance, discipline, etc.
 * Each query is crafted to surface Shorts-friendly content.
 */
const MOTIVATIONAL_QUERIES = [
    'David Goggins motivation shorts',
    'David Goggins hard work discipline',
    'Bruce Lee philosophy motivation shorts',
    'Bruce Lee wisdom mindset',
    'Kobe Bryant mamba mentality shorts',
    'discipline beats talent motivation',
    'hard work success mindset shorts',
    'stoicism daily discipline shorts',
    'Marcus Aurelius stoic motivation',
    'Jocko Willink discipline motivation shorts',
    'Arnold Schwarzenegger success mindset',
    'Navy SEAL mental toughness shorts',
    'elite mindset no excuses motivation',
    'Andrew Huberman focus discipline',
    'work hard in silence success shorts',
    'Tom Bilyeu motivation shorts',
    'Eric Thomas motivation ET shorts',
    'Les Brown motivation discipline shorts',
    'Goggins cant hurt me mindset',
    'becoming 1% better every day shorts',
];

/**
 * Fetches a random motivational YouTube Short using keyword search.
 * Rotates through the curated query list for variety.
 */
export async function getDailyLesson() {
    if (!API_KEY) {
        throw new Error('VITE_YOUTUBE_API_KEY not configured in .env.local');
    }

    try {
        // Pick a random query from the curated list
        const query = MOTIVATIONAL_QUERIES[Math.floor(Math.random() * MOTIVATIONAL_QUERIES.length)];

        // YouTube Data API v3 — keyword search, Shorts-friendly (≤60s videos, portrait)
        const params = new URLSearchParams({
            key: API_KEY,
            q: query,
            part: 'snippet',
            type: 'video',
            videoDuration: 'short',       // ≤4 min — catches Shorts
            videoEmbeddable: 'true',
            order: 'relevance',
            maxResults: 15,
            relevanceLanguage: 'en',
            safeSearch: 'moderate',
        });

        const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
        const response = await fetch(url);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to fetch video');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            // Filter out items without a videoId (playlists/channels can sneak in)
            const videos = data.items.filter(item => item.id?.videoId);

            if (videos.length === 0) throw new Error('No embeddable videos found');

            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            return {
                videoId: randomVideo.id.videoId,
                title: randomVideo.snippet.title,
                thumbnail: randomVideo.snippet.thumbnails.high?.url,
                channel: randomVideo.snippet.channelTitle,
                query,                           // for debugging / display
                fetchedAt: Date.now(),
            };
        } else {
            throw new Error('No videos found for query: ' + query);
        }
    } catch (error) {
        console.error('YouTube Service Error:', error);
        throw error;
    }
}
