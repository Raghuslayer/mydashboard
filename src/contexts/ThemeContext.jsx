import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

// Theme configurations
export const themes = {
    intense: {
        name: 'Intense',
        description: 'Fire and passion',
        colors: {
            primary: '#ff5e00',
            secondary: '#ff2a00',
            accent: '#ff9d00',
            bgGradientFrom: 'from-gray-900',
            bgGradientTo: 'to-black',
            textGradient: 'from-fire-yellow via-fire-orange to-fire-red',
            glowColor: 'rgba(255, 94, 0, 0.3)',
            borderColor: 'rgba(255, 94, 0, 0.3)',
        }
    },
    cool: {
        name: 'Cool',
        description: 'Calm and focused',
        colors: {
            primary: '#00d4ff',
            secondary: '#0099ff',
            accent: '#00ffff',
            bgGradientFrom: 'from-slate-900',
            bgGradientTo: 'to-blue-950',
            textGradient: 'from-cyan-300 via-blue-400 to-blue-500',
            glowColor: 'rgba(0, 212, 255, 0.3)',
            borderColor: 'rgba(0, 153, 255, 0.3)',
        }
    },
    spiritual: {
        name: 'Spiritual',
        description: 'Peaceful and enlightened',
        colors: {
            primary: '#b794f6',
            secondary: '#9333ea',
            accent: '#fbbf24',
            bgGradientFrom: 'from-purple-950',
            bgGradientTo: 'to-indigo-950',
            textGradient: 'from-purple-300 via-purple-400 to-purple-500',
            glowColor: 'rgba(183, 148, 246, 0.3)',
            borderColor: 'rgba(147, 51, 234, 0.3)',
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
