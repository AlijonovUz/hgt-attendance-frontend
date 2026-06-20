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

// Jadval (array-of-arrays) ni CSV faylga aylantirib yuklab beradi.
// BOM (﻿) — Excel UTF-8 (kirill/o'zbek) ni to'g'ri ochishi uchun.
export function exportAoaToCsv(filename, aoa) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + aoa.map((row) => row.map(esc).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
