const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_IDS = [
    'UCsT0YIqwnpJCM-mx7-gSA4Q', // TEDx Talks
    'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie (for diverse content)
    'UCbRP3c757lWg9M-U7TyEkXA', // Veritasium
    'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
    'UCsooa4yRKGN_zEE8iknghZA'  // TED-Ed
];

/**
 * Fetches a random motivational/educational video directly from YouTube Data API
 */
export async function getDailyLesson() {
    if (!API_KEY) {
        throw new Error("VITE_YOUTUBE_API_KEY not configured in .env.local");
    }

    try {
        // Pick a random channel
        const randomChannel = CHANNEL_IDS[Math.floor(Math.random() * CHANNEL_IDS.length)];

        // YouTube Data API v3: Search endpoint
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${randomChannel}&part=snippet&order=date&maxResults=10&type=video`;

        const response = await fetch(url);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to fetch video');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const randomVideo = data.items[Math.floor(Math.random() * data.items.length)];
            return {
                videoId: randomVideo.id.videoId,
                title: randomVideo.snippet.title,
                thumbnail: randomVideo.snippet.thumbnails.high?.url,
                channel: randomVideo.snippet.channelTitle,
                fetchedAt: Date.now()
            };
        } else {
            throw new Error('No videos found');
        }
    } catch (error) {
        console.error("YouTube Service Error:", error);
        throw error;
    }
}
