import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataProvider';
import { getStoicQuote } from '../services/gemini';
import { getDailyLesson } from '../services/youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteRight, faSpinner, faRefresh, faCheckCircle, faPlayCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';

// Fallback quotes in case API fails
const fallbackQuotes = [
    { quote: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", lesson: "Transform obstacles into opportunities for growth." },
    { quote: "We suffer more in imagination than in reality.", author: "Seneca", lesson: "Most fears never materialize. Focus on what's actually happening." },
    { quote: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus", lesson: "Your response is always within your control." },
    { quote: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", lesson: "Action speaks louder than philosophy." },
    { quote: "He who fears death will never do anything worthy of a living man.", author: "Seneca", lesson: "Live boldly without fear of the end." },
    { quote: "No man is free who is not master of himself.", author: "Epictetus", lesson: "Self-discipline is the foundation of freedom." },
    { quote: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius", lesson: "Guard your thoughts carefully—they shape your character." },
    { quote: "Luck is what happens when preparation meets opportunity.", author: "Seneca", lesson: "Stay ready so you don't have to get ready." },
    { quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", lesson: "Define your vision, then execute relentlessly." },
    { quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", lesson: "Internal power is the only true power." },
];

export default function DynamicQuote() {
    const { dailyQuote, setDailyQuote, dailyLesson, setDailyLesson, loadingData } = useData();
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [usedFallback, setUsedFallback] = useState(false);
    const [videoError, setVideoError] = useState(null);

    const getRandomFallbackQuote = () => {
        const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        return { ...quote, fetchedAt: Date.now(), isFallback: true };
    };

    const fetchNewQuote = async () => {
        setLoadingQuote(true);
        setUsedFallback(false);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setDailyQuote(getRandomFallbackQuote());
            setUsedFallback(true);
            setLoadingQuote(false);
            return;
        }

        try {
            const quoteData = await getStoicQuote();
            setDailyQuote({ ...quoteData, fetchedAt: Date.now() });
        } catch (err) {
            console.error('Gemini Quote API error:', err);
            setDailyQuote(getRandomFallbackQuote());
            setUsedFallback(true);
        } finally {
            setLoadingQuote(false);
        }
    };

    const fetchNewVideo = async () => {
        setLoadingVideo(true);
        setVideoError(null);
        try {
            const videoData = await getDailyLesson();
            setDailyLesson(videoData);
        } catch (err) {
            console.error(err);
            setVideoError(err.message);
        } finally {
            setLoadingVideo(false);
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (!loadingData) {
            if (!dailyQuote) fetchNewQuote();
            if (!dailyLesson) fetchNewVideo();
        }
        if (dailyQuote?.isFallback) setUsedFallback(true);
    }, [loadingData, dailyQuote, dailyLesson]);

    if (loadingData && !dailyQuote && !dailyLesson) {
        return (
            <div className="glass-panel p-10 text-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-fire-orange mb-4" />
                <p className="text-gray-400">Consulting the Stoics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h2 className="header-font text-3xl md:text-4xl text-white mb-2">Daily Wisdom</h2>
                <p className="text-gray-400">Fuel for your mind and soul</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* 1. Stoic Quote Section */}
                <div className="glass-panel p-8 md:p-10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FontAwesomeIcon icon={faQuoteRight} className="text-8xl text-white" />
                    </div>

                    {dailyQuote ? (
                        <div className="relative z-10 space-y-6">
                            <blockquote className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
                                "{dailyQuote.quote}"
                            </blockquote>

                            <p className="text-fire-orange header-font text-xl">— {dailyQuote.author}</p>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-w-2xl mx-auto">
                                <p className="text-sm text-gray-300">
                                    <span className="text-fire-yellow font-semibold"><FontAwesomeIcon icon={faPlayCircle} className="mr-2" />Action:</span> {dailyQuote.lesson}
                                </p>
                            </div>

                            <div className="flex justify-center gap-4 pt-4">
                                <button
                                    onClick={fetchNewQuote}
                                    disabled={loadingQuote}
                                    className="text-xs text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <FontAwesomeIcon icon={loadingQuote ? faSpinner : faRefresh} spin={loadingQuote} />
                                    New Quote
                                </button>
                                {usedFallback && <span className="text-xs text-gray-600">(Using offline library)</span>}
                            </div>
                        </div>
                    ) : (
                        <div className="py-10"><FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-gray-500" /></div>
                    )}
                </div>

                {/* 2. Daily Lesson Video Section */}
                <div className="glass-panel p-0 overflow-hidden relative">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faYoutube} className="text-red-500" /> Daily Lesson
                        </h3>
                        <button
                            onClick={fetchNewVideo}
                            disabled={loadingVideo}
                            className="text-gray-400 hover:text-white text-xs flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={loadingVideo ? faSpinner : faRefresh} spin={loadingVideo} /> Refresh
                        </button>
                    </div>

                    {dailyLesson ? (
                        <div>
                            <div className="aspect-video w-full bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${dailyLesson.videoId}?autoplay=0&rel=0`}
                                    title={dailyLesson.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-4 bg-white/5">
                                <h4 className="text-white font-medium line-clamp-1">{dailyLesson.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">{dailyLesson.channel}</p>
                            </div>
                        </div>
                    ) : videoError ? (
                        <div className="p-10 text-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-2xl mb-2" />
                            <p className="text-gray-400 mb-2">Video unavailable</p>
                            <button onClick={fetchNewVideo} className="text-xs text-white underline">Try Again</button>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Loading lesson...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
