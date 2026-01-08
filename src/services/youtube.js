/**
 * Fetches data from the /api/youtube proxy
 */
export async function getDailyLesson() {
    try {
        const response = await fetch('/api/youtube');

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Backend API not found. Please run 'vercel dev'.");
            }
            const err = await response.json();
            throw new Error(err.error || 'Failed to fetch video');
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
