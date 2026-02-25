import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

// Parse JWT token to get expiry
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;
    // Consider expired if less than 5 minutes remaining
    return decoded.exp * 1000 < Date.now() + 5 * 60 * 1000;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshTimerRef = useRef(null);

    // Clear all auth data
    const clearAuth = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        setUser(null);
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    // Setup token refresh timer
    const setupRefreshTimer = useCallback((expiresIn) => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

        // Refresh 5 minutes before expiry (or at 80% of lifetime)
        const refreshIn = Math.max((expiresIn * 0.8) * 1000, 60000); // minimum 1 minute

        refreshTimerRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || isTokenExpired(token)) {
                    clearAuth();
                    return;
                }

                const response = await authService.refreshToken();
                if (response.token) {
                    saveAuth(response);
                }
            } catch {
                // Token refresh failed, user needs to re-login
                clearAuth();
            }
        }, refreshIn);
    }, [clearAuth]);

    // Save auth data to localStorage
    const saveAuth = useCallback((response) => {
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.user));

        const expiresIn = response.expiresIn || 7 * 24 * 60 * 60;
        localStorage.setItem('tokenExpiry', String(Date.now() + expiresIn * 1000));

        setUser(response.user);
        setupRefreshTimer(expiresIn);
    }, [setupRefreshTimer]);

    // Initialize - check existing session
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            if (isTokenExpired(token)) {
                // Token expired, clear session
                clearAuth();
            } else {
                setUser(JSON.parse(savedUser));
                // Calculate remaining time for refresh
                const decoded = parseJwt(token);
                if (decoded?.exp) {
                    const remaining = Math.max(0, (decoded.exp * 1000 - Date.now()) / 1000);
                    setupRefreshTimer(remaining);
                }
            }
        }
        setLoading(false);

        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [clearAuth, setupRefreshTimer]);

    // Listen for storage changes (multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    // Logged out in another tab
                    setUser(null);
                } else {
                    // Logged in from another tab
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) setUser(JSON.parse(savedUser));
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (email, password) => {
        const response = await authService.login({ email, password });
        saveAuth(response);
        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        saveAuth(response);
        return response;
    };

    const loginWithOtp = (response) => {
        saveAuth(response);
        return response;
    };

    const logout = () => {
        // Call backend logout (optional, JWT is stateless)
        try { authService.logout(); } catch { }
        clearAuth();
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        login,
        register,
        logout,
        loginWithOtp,
        updateUser,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
