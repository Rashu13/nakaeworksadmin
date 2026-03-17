import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('dark');
        document.body.classList.remove('dark', 'bg-[#0a0f1c]');
        document.body.classList.add('bg-gray-50');
        localStorage.setItem('theme', 'light');
    }, []);

    const toggleTheme = () => {
        console.log('Theme toggle disabled temporarily');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode: false, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
