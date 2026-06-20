import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Backend xato javobidan eng aniq, foydalanuvchiga ko'rsatish mumkin bo'lgan xabarni oladi.
// Javob shakli: { data, error: { errorMsg, details: { field: [msg] } }, success }.
// details (maydon-darajadagi xato) eng aniq bo'lgani uchun u birinchi tekshiriladi.
export function apiErrorMessage(err, fallback = "Xatolik yuz berdi") {
  const error = err?.response?.data?.error;
  const details = error?.details;
  if (details && typeof details === "object") {
    const first = Object.values(details)[0];
    const msg = Array.isArray(first) ? first[0] : first;
    if (msg) return String(msg);
  }
  return error?.errorMsg || err?.message || fallback;
}
