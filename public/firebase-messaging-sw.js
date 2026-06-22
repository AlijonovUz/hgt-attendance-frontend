/* global importScripts, firebase */
// Background push (sayt yopiq yoki boshqa tabda) uchun service worker.
// MUHIM: bu fayl public/ ildizida shu nom bilan turishi shart — Firebase uni
// /firebase-messaging-sw.js manzilidan avtomatik qidiradi. Bu yerda import.meta.env
// ishlamaydi, shuning uchun config hard-code qilingan.
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCZ2maEb62SAO2l2OeEfsULUjlT0bvNa4A",
  authDomain: "hgt-attendance.firebaseapp.com",
  projectId: "hgt-attendance",
  storageBucket: "hgt-attendance.firebasestorage.app",
  messagingSenderId: "981189585778",
  appId: "1:981189585778:web:165c0fc5fdd516e6878beb",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    (payload && payload.notification && payload.notification.title) || "Yangi bildirishnoma";
  const notificationOptions = {
    body: (payload && payload.notification && payload.notification.body) || "",
    icon: "/logo.svg",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Bildirishnoma bosilganda saytni ochish/fokus qilish
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
