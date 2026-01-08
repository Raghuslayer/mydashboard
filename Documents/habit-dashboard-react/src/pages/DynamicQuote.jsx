import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataProvider';
import { getStoicQuote } from '../services/gemini';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteRight, faSpinner, faRefresh, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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
    const { dailyQuote, setDailyQuote, loadingData } = useData();
    const [loading, setLoading] = useState(false);
    const [usedFallback, setUsedFallback] = useState(false);

    const getRandomFallbackQuote = () => {
        const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        return { ...quote, fetchedAt: Date.now(), isFallback: true };
    };

    const fetchNewQuote = async () => {
        setLoading(true);
        setUsedFallback(false);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setDailyQuote(getRandomFallbackQuote());
            setUsedFallback(true);
            setLoading(false);
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
            setLoading(false);
        }
    };

    // Only fetch if no cached data and not loading
    useEffect(() => {
        if (!loadingData && !dailyQuote && !loading) {
            fetchNewQuote();
        }
        // Check if cached quote is a fallback
        if (dailyQuote?.isFallback) {
            setUsedFallback(true);
        }
    }, [loadingData, dailyQuote]);

    if (loadingData || loading) {
        return (
            <div className="glass-panel p-10 text-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-fire-orange mb-4" />
                <p className="text-gray-400">Consulting the Stoics...</p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8 md:p-12 max-w-3xl mx-auto text-center">
            {/* Cached indicator */}
            {dailyQuote && (
                <div className="flex items-center justify-center gap-2 text-xs text-green-400 mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Today's cached quote</span>
                </div>
            )}

            <FontAwesomeIcon icon={faQuoteRight} className="text-5xl text-fire-orange/50 mb-6" />

            {dailyQuote && (
                <div className="space-y-6">
                    <blockquote className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
                        "{dailyQuote.quote}"
                    </blockquote>

                    <p className="text-fire-orange header-font text-xl">— {dailyQuote.author}</p>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-gray-300">
                            <span className="text-fire-yellow font-semibold">Today's Lesson:</span> {dailyQuote.lesson}
                        </p>
                    </div>

                    <button
                        onClick={fetchNewQuote}
                        disabled={loading}
                        className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-white transition-all flex items-center gap-2 mx-auto"
                    >
                        <FontAwesomeIcon icon={loading ? faSpinner : faRefresh} spin={loading} />
                        New Quote
                    </button>

                    {usedFallback && (
                        <p className="text-xs text-gray-500">Using curated quotes library</p>
                    )}
                </div>
            )}
        </div>
    );
}
