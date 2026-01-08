import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative bg-[#121212] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-10"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 text-white/50 hover:text-white text-2xl w-10 h-10 flex items-center justify-center bg-black/50 rounded-full transition-all"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>

                        {/* Title */}
                        {title && (
                            <div className="p-6 pb-0">
                                <h2 className="header-font text-3xl text-white pr-12">{title}</h2>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
