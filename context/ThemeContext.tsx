import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => { },
    isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const saved = localStorage.getItem('stetic-theme') as Theme;
            if (saved === 'dark' || saved === 'light') return saved;
            // Respect system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        } catch { /* ignore */ }
        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('stetic-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
