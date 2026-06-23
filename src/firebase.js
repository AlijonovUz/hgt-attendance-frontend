// Firebase Cloud Messaging (FCM) — push xabarlar.
// Foreground (sayt ochiq) xabarlar shu yerdan, background xabarlar esa
// public/firebase-messaging-sw.js service worker orqali keladi.
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { axiosAPI } from "@/services/axiosAPI";

const firebaseConfig = {
  apiKey: "AIzaSyCZ2maEb62SAO2l2OeEfsULUjlT0bvNa4A",
  authDomain: "hgt-attendance.firebaseapp.com",
  projectId: "hgt-attendance",
  storageBucket: "hgt-attendance.firebasestorage.app",
  messagingSenderId: "981189585778",
  appId: "1:981189585778:web:165c0fc5fdd516e6878beb",
  measurementId: "G-DZZWRFBTPP",
};

export const app = initializeApp(firebaseConfig);

// Web Push sertifikat kaliti (Firebase Console → Cloud Messaging → Web Push certificates).
// .env'dagi VITE_FIREBASE_VAPID_KEY birinchi o'rinda; deploy'da env bo'lmasa ham push
// ishlashi uchun hardcoded fallback (bu OCHIQ public kalit, maxfiy emas).
const VAPID_KEY = "BCxHjPAihune7sXNLozVcPXnJsq5Xdy46jMD-DD2B-74L0Z3ymJsjWTfPyvXhYzASWCea8L3KzIXYFH5HWTxYQw";

// Messaging faqat qo'llab-quvvatlanadigan brauzerlarda (HTTPS/localhost) ishlaydi
let messagingPromise = null;
const getMessagingInstance = async () => {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        if (await isSupported()) return getMessaging(app);
      } catch (err) {
        console.error("FCM qo'llab-quvvatlanmaydi:", err);
      }
      return null;
    })();
  }
  return messagingPromise;
};

// localStorage'dagi currentUser'dan id ni olish (devices/register `user` maydoni uchun)
const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("currentUser") || "null");
    return u?.id ?? null;
  } catch {
    return null;
  }
};

// Backendga FCM tokenni yuborish (barqaror device_id bilan).
// MUHIM: aynan shu token allaqachon ro'yxatdan o'tgan bo'lsa — qayta YUBORMAYMIZ.
// Shu sabab register har mount'da emas, faqat token birinchi marta olinganda / o'zgarganda
// (amalda — login qilingandan keyin) bir marta ketadi.
const sendTokenToBackend = async (token) => {
  // Bir xil token allaqachon yuborilgan bo'lsa — hech narsa qilmaymiz (spam ham, 400 ham bo'lmaydi)
  if (localStorage.getItem("registered_fcm_token") === token) return;

  try {
    let deviceId = localStorage.getItem("unique_device_id");
    if (!deviceId) {
      deviceId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `web-${Date.now()}`;
      localStorage.setItem("unique_device_id", deviceId);
    }
    const payload = {
      fcm_token: token,
      device_type: "web",
      device_id: deviceId,
    };
    const userId = getCurrentUserId();
    if (userId) payload.user = userId; // kontrakt bo'yicha user (uuid) talab qilinadi
    await axiosAPI.post("notifications/devices/register/", payload);
    localStorage.setItem("registered_fcm_token", token); // muvaffaqiyatli — eslab qolamiz
  } catch (err) {
    // Backend "fcm_token / device_id allaqachon mavjud" deb 400 qaytarsa — bu XATO emas:
    // qurilma allaqachon ro'yxatda, demak maqsadga erishilgan. Qayta urinmaymiz.
    if (err?.response?.status === 400) {
      localStorage.setItem("registered_fcm_token", token);
      return;
    }
    console.error("❌ Token yuborishda backend xatosi:", err);
  }
};

// Ruxsat so'rab, tokenni olib, backendga yuborish
export const requestForToken = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;
    if (!VAPID_KEY) {
      // VAPID kalit yo'q — FCM push o'chiq (polling/WS bilan ishlaymiz). Jim o'tkazamiz.
      return null;
    }
    if (typeof Notification === "undefined") return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      await sendTokenToBackend(currentToken);
      localStorage.setItem("fcm_token", currentToken);
      return currentToken;
    }
  } catch (err) {
    console.error("❌ Token olishda xato:", err);
  }
  return null;
};

// Sayt ochiq turganda keladigan FCM xabarlarni eshitish.
// cb — har xabar uchun chaqiriladigan callback. Tozalash uchun unsubscribe qaytaradi.
export const onForegroundMessage = (cb) => {
  let active = true;
  let unsub = null;
  getMessagingInstance().then((messaging) => {
    if (messaging && active) {
      unsub = onMessage(messaging, (payload) => {
        console.log("📨 Foreground xabar keldi:", payload);
        cb?.(payload);
      });
    }
  });
  return () => {
    active = false;
    if (unsub) unsub();
  };
};
