import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataProvider';
import { getDailyLesson } from '../services/youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faSpinner, faExclamationTriangle, faRefresh, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function DynamicLesson() {
    const { dailyLesson, setDailyLesson, loadingData } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNewVideo = async () => {
        setLoading(true);
        setError(null);

        try {
            const videoData = await getDailyLesson();
            setDailyLesson(videoData);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Only fetch if no cached data and not loading
    useEffect(() => {
        if (!loadingData && !dailyLesson && !loading) {
            fetchNewVideo();
        }
    }, [loadingData, dailyLesson]);

    if (loadingData || loading) {
        return (
            <div className="glass-panel p-10 text-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-red-500 mb-4" />
                <p className="text-gray-400">Loading your daily lesson...</p>
            </div>
        );
    }

    if (error && !dailyLesson) {
        return (
            <div className="glass-panel p-10 text-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-yellow-500 mb-4" />
                <p className="text-gray-400">{error}</p>
                <p className="text-xs text-gray-500 mt-2">Check your VITE_YOUTUBE_API_KEY in .env.local</p>
                <button
                    onClick={fetchNewVideo}
                    className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white transition-all"
                >
                    <FontAwesomeIcon icon={faRefresh} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Cached indicator */}
            {dailyLesson && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-green-400">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Today's cached lesson</span>
                    </div>
                    <button
                        onClick={fetchNewVideo}
                        disabled={loading}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 text-sm"
                    >
                        <FontAwesomeIcon icon={loading ? faSpinner : faRefresh} spin={loading} />
                        Get New Video
                    </button>
                </div>
            )}

            {dailyLesson && (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    {/* Video Player */}
                    <div className="aspect-video w-full bg-black">
                        <iframe
                            src={`https://www.youtube.com/embed/${dailyLesson.videoId}?autoplay=0&rel=0`}
                            title={dailyLesson.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Video Info */}
                    <div className="p-6">
                        <h2 className="header-font text-2xl text-white mb-2 line-clamp-2">
                            {dailyLesson.title}
                        </h2>
                        <p className="text-gray-400 flex items-center gap-2">
                            <FontAwesomeIcon icon={faYoutube} className="text-red-500" />
                            {dailyLesson.channel}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
