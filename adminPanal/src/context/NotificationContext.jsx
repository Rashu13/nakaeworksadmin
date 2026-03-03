import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '../utils/firebase';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Request permission and get token on mount
        requestNotificationPermission().then(token => {
            if (token) {
                console.log('Notification permission granted. Token:', token);
                // Send token to backend
                import('../services/api').then(({ authService }) => {
                    if (authService.isAuthenticated()) {
                        authService.updateFcmToken(token).catch(console.error);
                    }
                });
            }
        });

        // Listen for foreground messages
        const unsubscribe = onMessageListener().then((payload) => {
            console.log('Foreground message received:', payload);
            setNotification({
                title: payload.notification.title,
                body: payload.notification.body
            });
        });

        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ notification }}>
            {children}
            {notification && (
                <Toast
                    message={`${notification.title}: ${notification.body}`}
                    type="info"
                    onClose={() => setNotification(null)}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
