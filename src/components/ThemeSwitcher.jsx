import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, themes } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function ThemeSwitcher({ compact = false }) {
    const { currentTheme, changeTheme, availableThemes } = useTheme();

    // Always use compact grid layout for better UX
    return (
        <div className="grid grid-cols-3 gap-2">
            {availableThemes.map(themeName => {
                const theme = themes[themeName];
                const isActive = currentTheme === themeName;
                
                return (
                    <button
                        key={themeName}
                        onClick={() => changeTheme(themeName)}
                        className={`p-3 border transition-all relative overflow-hidden ${
                            isActive
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20 shadow-[0_0_15px_var(--color-glow)]'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                        title={theme.name}
                    >
                        <ThemeIcon themeName={themeName} active={isActive} />
                        <p className="text-xs font-bold mt-2 uppercase tracking-wider">{theme.name}</p>
                        {isActive && (
                            <div className="absolute top-1 right-1">
                                <FontAwesomeIcon icon={faCheck} className="text-[var(--color-primary)] text-xs" />
                            </div>
                        )}
                    </button>
                );
            })}
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
        <div className={`w-full aspect-square ${iconStyles[themeName]} ${active ? 'ring-2 ring-[var(--color-primary)]' : ''}`}>
        </div>
    );
}
