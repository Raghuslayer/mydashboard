import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const motivationalQuotes = [
    "THE ONLY WAY TO FAIL IS TO QUIT.",
    "STAY HARD.",
    "YOU DON'T GET WHAT YOU WISH FOR, YOU GET WHAT YOU WORK FOR.",
    "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT.",
    "SUFFER THE PAIN OF DISCIPLINE OR SUFFER THE PAIN OF REGRET.",
    "WINNERS FOCUS ON WINNING. LOSERS FOCUS ON WINNERS.",
    "YOUR ONLY LIMIT IS YOU.",
    "FORGE YOURSELF IN THE FIRE.",
    "THE HERO AND THE COWARD BOTH FEEL THE SAME FEAR. THE HERO USES IT.",
    "DON'T STOP WHEN YOU'RE TIRED. STOP WHEN YOU'RE DONE."
];

export default function LoadingScreen({ fullPage = true }) {
    const [quote, setQuote] = useState("");
    
    useEffect(() => {
        setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, []);

    const containerStyle = fullPage ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#050505',
    } : {
        position: 'relative',
        width: '100%',
        minHeight: '400px',
        background: 'transparent',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(192,36,42,0.1)'
    };

    return (
        <div style={{
            ...containerStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Background Texture/Grain */}
            {fullPage && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
                    opacity: 0.05,
                    pointerEvents: 'none'
                }} />
            )}

            {/* Pulsing Ember Glow */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    width: fullPage ? '60vw' : '100%',
                    height: fullPage ? '60vw' : '100%',
                    background: 'radial-gradient(circle, rgba(192,36,42,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    zIndex: 0
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
                {/* Logo or Icon Placeholder */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: fullPage ? 40 : 20 }}
                >
                    <div style={{
                        width: fullPage ? 80 : 50,
                        height: fullPage ? 80 : 50,
                        margin: '0 auto',
                        border: '2px solid #c0242a',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(192,36,42,0.3)',
                        background: 'rgba(192,36,42,0.05)'
                    }}>
                        <div style={{
                            width: fullPage ? 40 : 24,
                            height: fullPage ? 40 : 24,
                            background: '#c0242a',
                            clipPath: 'polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)',
                            filter: 'drop-shadow(0 0 10px rgba(192,36,42,0.8))'
                        }} />
                    </div>
                </motion.div>

                {/* Progress Bar */}
                <div style={{
                    width: fullPage ? 240 : 160,
                    height: 2,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    margin: '0 auto 30px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(90deg, transparent, #c0242a, transparent)',
                        }}
                    />
                </div>

                {/* Motivational Quote */}
                <motion.h2
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{
                        fontFamily: "'Teko', sans-serif",
                        fontSize: fullPage ? '2rem' : '1.4rem',
                        fontWeight: 700,
                        color: '#f0f0f0',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: 0,
                        textShadow: '0 0 15px rgba(255,255,255,0.1)'
                    }}
                >
                    {quote}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        fontSize: fullPage ? '12px' : '9px',
                        color: 'rgba(192,36,42,0.6)',
                        marginTop: 10,
                        letterSpacing: '0.25em',
                        fontWeight: 700
                    }}
                >
                    {fullPage ? 'PREPARING FOR BATTLE...' : 'PREPARING TAB...'}
                </motion.p>
            </div>
        </div>
    );
}
