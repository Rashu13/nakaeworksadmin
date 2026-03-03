importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBmOQvH7EJE8KORO_mwqdu9b_sD58fhQu4",
    authDomain: "babylon-5adb4.firebaseapp.com",
    databaseURL: "https://babylon-5adb4-default-rtdb.firebaseio.com",
    projectId: "babylon-5adb4",
    storageBucket: "babylon-5adb4.firebasestorage.app",
    messagingSenderId: "660614618791",
    appId: "1:660614618791:web:42bbcda0ff5641dc0a8582",
    measurementId: "G-WC9GDKJYL0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
