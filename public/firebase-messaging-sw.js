importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCGy_Xsp2srOVrHCnSs4fihum5J61iLzvc",
  authDomain: "savora-74127.firebaseapp.com",
  projectId: "savora-74127",
  storageBucket: "savora-74127.firebasestorage.app",
  messagingSenderId: "82705595303",
  appId: "1:82705595303:web:a35d7605b018ebaa489482"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Push reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'Savora';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/savora.logo.png',
    badge: '/savora.logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});