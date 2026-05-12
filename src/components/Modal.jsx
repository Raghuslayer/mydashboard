import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
    // Handle Escape key and scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        
        // Lock body scroll
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center"
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999
                    }}
                >
                    {/* Overlay - Deep blur and dark layer */}
                    <motion.div
                        className="absolute inset-0 bg-[#020202]/95 backdrop-blur-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ cursor: 'zoom-out' }}
                    />

                    {/* Centered Hint */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/10 text-[11px] uppercase tracking-[0.4em] font-bold pointer-events-none z-[100000]">
                        Tap outside to exit
                    </div>

                    {/* Modal Content - Impactful Warrior Frame */}
                    <motion.div
                        className="relative z-[100001] w-full max-w-5xl px-4 md:px-10 flex items-center justify-center pointer-events-none"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ 
                            type: 'spring', 
                            damping: 30, 
                            stiffness: 400,
                            mass: 0.8
                        }}
                    >
                        <div 
                            className="bg-[#050505] border border-white/10 rounded-3xl shadow-[0_0_150px_rgba(0,0,0,1)] w-full max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto relative"
                            style={{
                                boxShadow: '0 0 100px rgba(192,36,42,0.15), 0 0 50px rgba(0,0,0,1)',
                            }}
                        >
                            {/* Inner Glow Border */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-3xl" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0 border-b border-white/5">
                                {title ? (
                                    <h2 className="header-font text-2xl md:text-3xl text-white tracking-widest border-l-4 border-[#c0242a] pl-4 uppercase font-black">
                                        {title}
                                    </h2>
                                ) : <div />}
                                
                                <button
                                    onClick={onClose}
                                    className="text-white/20 hover:text-white transition-all hover:scale-110 active:scale-95 p-2 bg-white/5 rounded-full"
                                    title="Close (Esc)"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                                </button>
                            </div>

                            {/* Content - Force vertical centering for videos */}
                            <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-grow flex flex-col bg-black/40">
                                <div className="my-auto w-full flex flex-col items-center justify-center">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
