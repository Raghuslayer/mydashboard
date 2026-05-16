import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
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
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ cursor: 'zoom-out' }}
                    />

                    {/* Hint */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/10 text-[10px] uppercase tracking-[0.4em] pointer-events-none z-[100000]">
                        Tap outside to close
                    </div>

                    {/* Modal Panel */}
                    <motion.div
                        className="relative z-[100001] w-full max-w-sm md:max-w-xl lg:max-w-2xl"
                        initial={{ scale: 0.92, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 24 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.8 }}
                    >
                        <div
                            className="bg-[#050505] border border-white/10 rounded-2xl w-full max-h-[88vh] flex flex-col overflow-hidden"
                            style={{ boxShadow: '0 0 80px rgba(192,36,42,0.12), 0 0 40px rgba(0,0,0,1)' }}
                        >
                            {/* Inner border glow */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0 border-b border-white/5">
                                {title ? (
                                    <h2 className="header-font text-xl md:text-2xl text-white tracking-widest border-l-4 border-[#c0242a] pl-4 uppercase font-black">
                                        {title}
                                    </h2>
                                ) : <div />}
                                <button
                                    onClick={onClose}
                                    className="text-white/30 hover:text-white transition-all p-2 bg-white/5 hover:bg-white/10 rounded-xl"
                                    title="Close (Esc)"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-lg" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-7 overflow-y-auto custom-scrollbar flex-grow">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
