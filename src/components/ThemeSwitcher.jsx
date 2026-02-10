import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, themes } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function ThemeSwitcher({ compact = false }) {
    const { currentTheme, changeTheme, availableThemes } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    if (compact) {
        return (
            <div className="flex gap-2">
                {availableThemes.map(themeName => (
                    <button
                        key={themeName}
                        onClick={() => changeTheme(themeName)}
                        className={`p-2 rounded-lg border transition-all ${currentTheme === themeName
                                ? 'border-fire-orange bg-fire-orange/20'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                        title={themes[themeName].name}
                    >
                        <ThemeIcon themeName={themeName} active={currentTheme === themeName} />
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-3 glass-panel hover:bg-white/5 transition-all rounded-xl w-full"
            >
                <FontAwesomeIcon icon={faPalette} className="text-fire-orange" />
                <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-gray-400">{themes[currentTheme].name}</p>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 glass-panel p-2 rounded-xl z-50"
                    >
                        {availableThemes.map(themeName => {
                            const theme = themes[themeName];
                            const isActive = currentTheme === themeName;

                            return (
                                <button
                                    key={themeName}
                                    onClick={() => {
                                        changeTheme(themeName);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                                            ? 'bg-white/10'
                                            : 'hover:bg-white/5'
                                        }`}
                                >
                                    <ThemeIcon themeName={themeName} active={isActive} />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium">{theme.name}</p>
                                        <p className="text-xs text-gray-400">{theme.description}</p>
                                    </div>
                                    {isActive && (
                                        <FontAwesomeIcon icon={faCheck} className="text-fire-orange" />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ThemeIcon({ themeName, active }) {
    const iconStyles = {
        intense: 'bg-gradient-to-br from-orange-500 to-red-600',
        cool: 'bg-gradient-to-br from-cyan-400 to-blue-600',
        spiritual: 'bg-gradient-to-br from-purple-400 to-indigo-600'
    };

    return (
        <div className={`w-8 h-8 rounded-lg ${iconStyles[themeName]} ${active ? 'ring-2 ring-white/50' : ''}`}>
        </div>
    );
}
