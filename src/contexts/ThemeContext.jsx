import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

// Theme configurations - MASCULINE & POWERFUL
export const themes = {
    intense: {
        name: 'Intense',
        description: 'Battle red - For warriors',
        colors: {
            primary: '#dc2626',
            secondary: '#991b1b',
            accent: '#f59e0b',
            bgGradientFrom: 'from-[#0a0e17]',
            bgGradientTo: 'to-[#111827]',
            textGradient: 'from-[#dc2626] via-[#991b1b] to-[#7f1d1d]',
            glowColor: 'rgba(220, 38, 38, 0.4)',
            borderColor: 'rgba(220, 38, 38, 0.2)',
        }
    },
    cool: {
        name: 'Cool',
        description: 'Steel blue - Tactical precision',
        colors: {
            primary: '#00d9ff',
            secondary: '#1e3a5f',
            accent: '#10b981',
            bgGradientFrom: 'from-[#0a0e17]',
            bgGradientTo: 'to-[#111827]',
            textGradient: 'from-[#00d9ff] via-[#1e3a5f] to-[#0f172a]',
            glowColor: 'rgba(0, 217, 255, 0.4)',
            borderColor: 'rgba(0, 217, 255, 0.2)',
        }
    },
    spiritual: {
        name: 'Spiritual',
        description: 'Deep purple - Inner strength',
        colors: {
            primary: '#8b5cf6',
            secondary: '#4c1d95',
            accent: '#f59e0b',
            bgGradientFrom: 'from-[#0a0e17]',
            bgGradientTo: 'to-[#111827]',
            textGradient: 'from-[#8b5cf6] via-[#4c1d95] to-[#1e1b4b]',
            glowColor: 'rgba(139, 92, 246, 0.4)',
            borderColor: 'rgba(139, 92, 246, 0.2)',
        }
    }
};

export function ThemeProvider({ children, initialTheme, onThemeChange }) {
    const [currentTheme, setCurrentTheme] = useState(initialTheme || 'intense');

    useEffect(() => {
        // Apply theme class to document root
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    const changeTheme = (themeName) => {
        if (themes[themeName]) {
            setCurrentTheme(themeName);
            if (onThemeChange) {
                onThemeChange(themeName);
            }
        }
    };

    const value = {
        currentTheme,
        themeConfig: themes[currentTheme],
        changeTheme,
        availableThemes: Object.keys(themes)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
