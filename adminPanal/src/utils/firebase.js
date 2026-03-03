import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBmOQvH7EJE8KORO_mwqdu9b_sD58fhQu4",
    authDomain: "babylon-5adb4.firebaseapp.com",
    databaseURL: "https://babylon-5adb4-default-rtdb.firebaseio.com",
    projectId: "babylon-5adb4",
    storageBucket: "babylon-5adb4.firebasestorage.app",
    messagingSenderId: "660614618791",
    appId: "1:660614618791:web:42bbcda0ff5641dc0a8582",
    measurementId: "G-WC9GDKJYL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
    if (!messaging) return;
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'BIY1CT_a9tL4hYo2L4PpV-sQnfPue6U0b9h2rkzralBgSv5tENf4qtdfq24KQkQ0tRHkFZmJkT2VrkKhDuE-6rw'
            });
            console.log('FCM Token:', token);
            return token;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export default app;
