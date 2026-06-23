/* global importScripts, firebase */
// Background push (sayt yopiq yoki boshqa tabda) uchun service worker.
// MUHIM: bu fayl public/ ildizida shu nom bilan turishi shart — Firebase uni
// /firebase-messaging-sw.js manzilidan avtomatik qidiradi. Bu yerda import.meta.env
// ishlamaydi, shuning uchun config hard-code qilingan.

// FCM avtomatik bildirishnomalarini va dublikatlarni to'xtatish uchun push voqeasini intercept qilamiz.
// Bu bizga bildirishnomani har doim logotip (/logo.svg) bilan va faqat 1 marta ko'rsatish imkonini beradi.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    // console.log("[SW] Push xabari keldi (intercept):", payload);

    // Xabardagi ma'lumotlarni aniqlaymiz
    const fcmNotification = payload?.notification;
    const fcmData = payload?.data;

    if (fcmNotification || fcmData) {
      // Til maydonlaridan yoki umumiy maydonlardan sarlavha va matnni aniqlaymiz
      const title =
        fcmData?.title_uz_latn ||
        fcmData?.title ||
        fcmNotification?.title ||
        "Yangi bildirishnoma";

      const body =
        fcmData?.message_uz_latn ||
        fcmData?.message ||
        fcmData?.body ||
        fcmNotification?.body ||
        "";

      // Ochiq bo'lgan barcha sayt tablarini (clients) qidiramiz
      const promise = self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // console.log("[SW] Topilgan tablar batafsil:", clientList.length, clientList.map(c => ({ url: c.url, visibility: c.visibilityState, focused: c.focused })));
        
        // Tablardan birortasi visible (ko'rinadigan) yoki focused (faol) ekanligini tekshiramiz
        const hasVisibleClients = clientList.some(client => client.visibilityState === "visible" || client.focused);

        if (hasVisibleClients) {
          // Sayt faol/ochiq oynada turganda SW orqali desktop bildirishnoma chiqarmaymiz.
          // Buning o'rniga xabarni faol tabga postMessage orqali yuboramiz.
          // O'sha faol tab o'zi UI sonlarni oshiradi va bildirishnomani 1 marta logotip bilan chiqaradi.
          // console.log("[SW] Faol tab aniqlandi, xabar tabga yuborilmoqda...");
          for (const client of clientList) {
            client.postMessage({
              type: "FCM_FOREGROUND_EVENT",
              payload: payload,
            });
          }
        } else {
          // Agar sayt butunlay yopiq yoki fon rejimida bo'lsa, SW orqali qo'lda logotip bilan bildirishnoma chiqaramiz.
          console.log("[SW] Faol tab topilmadi, bildirishnoma fonda ko'rsatilmoqda...");
          const options = {
            body,
            icon: "/logo.svg",
            tag: fcmData?.id || fcmNotification?.tag || "fcm-notif",
          };
          return self.registration.showNotification(title, options);
        }
      });

      event.waitUntil(promise);

      // FCM SDK'ning o'zining push listeneriga va avtomatik duplicate xabar ko'rsatishiga to'liq to'sqinlik qilamiz
      event.stopImmediatePropagation();
    }
  } catch (err) {
    console.error("[SW] Push intercept qilishda xatolik:", err);
  }
});

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
  console.log("[SW] Background push xabar keldi:", payload);

  // Agar xabarda notification bloki bo'lsa, FCM SDK uni o'zi avtomatik ravishda ko'rsatadi.
  // Qo'lda qayta showNotification chaqirsak, u holda 2 ta bir xil bildirishnoma chiqib qoladi (logo bilan va logosiz).
  if (payload && payload.notification) {
    console.log("[SW] FCM SDK avtomatik bildirishnoma ko'rsatadi, duplicate bo'lmasligi uchun qo'lda ko'rsatish bekor qilindi.");
    return;
  }

  const notificationTitle =
    (payload && payload.data && payload.data.title) || "Yangi bildirishnoma";
  const notificationOptions = {
    body: (payload && payload.data && (payload.data.body || payload.data.message)) || "",
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
