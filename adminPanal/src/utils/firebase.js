import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

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

// Initialize messaging only if supported (requires HTTPS)
let messagingInstance = null;
const getMessagingInstance = async () => {
    if (messagingInstance) return messagingInstance;
    try {
        const supported = await isSupported();
        if (supported) {
            messagingInstance = getMessaging(app);
            return messagingInstance;
        }
    } catch (e) {
        console.warn('Firebase Messaging not supported in this browser/environment:', e.message);
    }
    return null;
};

export const requestNotificationPermission = async () => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) {
            console.warn('Push notifications not available (requires HTTPS).');
            return null;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'BIY1CT_a9tL4hYo2L4PpV-sQnfPue6U0b9h2rkzralBgSv5tENf4qtdfq24KQkQ0tRHkFZmJkT2VrkKhDuE-6rw'
            });
            console.log('FCM Token:', token);
            return token;
        }
    } catch (error) {
        console.warn('Notifications not available:', error.message);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        getMessagingInstance().then(messaging => {
            if (!messaging) return;
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        });
    });

export default app;
