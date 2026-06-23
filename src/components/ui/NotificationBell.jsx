import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bell, BellOff, CheckCheck, X } from "lucide-react"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import notificationSocket from "@/services/NotificationSocket"
import { onForegroundMessage, requestForToken } from "@/firebase"

// App tili -> Notification model maydon qo'shimchasi
// (backend: title_uz_latn / title_uz_cyrl / title_ru, message_* ham shunday)
const LANG_SUFFIX = { uz: "uz_latn", cy: "uz_cyrl", ru: "ru" }

// Ko'p tilli maydondan joriy tilga mos matnni tanlash (fallback bilan).
// WS/FCM payload'ida tekis `title`/`message` ham bo'lishi mumkin — oxirgi fallback.
const pickText = (n, base, language) => {
  if (!n) return ""
  const suf = LANG_SUFFIX[language] || "uz_latn"
  return (
    n[`${base}_${suf}`] ||
    n[`${base}_uz_latn`] ||
    n[`${base}_ru`] ||
    n[`${base}_uz_cyrl`] ||
    n[base] ||
    ""
  )
}

// WS yoki FCM'dan kelgan turli shakldagi payloadni Notification obyektiga keltirish
const normalizeIncoming = (raw) => {
  let n = raw
  // FCM foreground: data.payload ichida JSON-string
  if (raw?.data?.payload) {
    try {
      n = JSON.parse(raw.data.payload)
    } catch {
      /* ignore */
    }
  } else if (raw?.notification && !raw?.id) {
    // FCM notification bloki
    n = { ...(raw.data || {}), title: raw.notification.title, message: raw.notification.body }
  } else if (raw?.data && (raw?.type === "notification" || raw?.event)) {
    // WS o'rab yuborgan bo'lsa: { type:'notification', data:{...} }
    n = raw.data
  }
  return n || {}
}

// VITE_BASE_URL (.../api/v1/) dan WS bazasini olish: ws(s)://host
const WS_BASE = (import.meta.env.VITE_BASE_URL || "")
  .replace(/\/api\/v1\/?$/, "")
  .replace(/^http/, "ws")

// Backend WS origin validatsiyasi (Django Channels AllowedHostsOriginValidator) localhost'ni
// rad etadi ("403 Access denied"). Shu sabab dev (localhost) da WS'ni o'tkazib yuboramiz —
// real-time o'rniga polling ishlaydi. Production domenda avtomatik yoqiladi.
// Kerak bo'lsa .env'da VITE_ENABLE_WS="true" bilan majburan yoqish mumkin.
const IS_LOCALHOST =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)
const WS_ENABLED = import.meta.env.VITE_ENABLE_WS === "true" || !IS_LOCALHOST

// ISO sana -> "01.06.2025  15:29"
const fmtDate = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const p = (x) => String(x).padStart(2, "0")
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}  ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const NotificationBell = () => {
  const { t, language } = useLanguage()

  const [open, setOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const loadingRef = useRef(false)

  // Desktop popup takrorlanmasligi uchun ko'rsatilgan id'lar
  const notifiedIdsRef = useRef(new Set())

  // ── O'qilmaganlar sonini olish (qo'ng'iroqdagi qizil nuqta) ──
  const fetchCount = useCallback(async () => {
    try {
      const res = await axiosAPI.get("notifications/count/")
      if (res.status === 200) {
        setUnread(res.data?.data?.unread ?? 0)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  // ── Ro'yxatni yuklash (sahifalab) ──
  const fetchList = useCallback(async (page) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(false)
    try {
      const res = await axiosAPI.get("notifications/", { params: { page } })
      if (res.status === 200) {
        const data = res.data?.data || {}
        const results = data.results || []
        // Keyingi sahifalarni qo'shishda dublikatlarni olib tashlaymiz
        // (poll yangi xabar qo'shsa yoki pagination oynasi siljisa — takror chiqmasin)
        setItems((prev) => {
          if (page === 1) return results
          const known = new Set(prev.map((it) => String(it.id)))
          const fresh = results.filter((r) => !known.has(String(r.id)))
          return fresh.length ? [...prev, ...fresh] : prev
        })
        hasMoreRef.current = !!data.next
        pageRef.current = page
      }
    } catch (err) {
      // Backend oxirgi sahifadan keyin 404 qaytaradi — bu "boshqa sahifa yo'q" demak,
      // qayta-qayta urinmaslik uchun hasMore'ni o'chiramiz (xato sifatida ko'rsatmaymiz).
      if (err?.response?.status === 404 && page > 1) {
        hasMoreRef.current = false
      } else {
        console.error(err)
        if (page === 1) setError(true)
      }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  // ── Desktop (OS) bildirishnoma chiqarish — id bo'yicha takrorlanmaydi ──
  const showDesktopNotification = useCallback(
    (notif) => {
      try {
        if (typeof Notification === "undefined" || Notification.permission !== "granted") return
        const key = String(notif.id)
        if (notifiedIdsRef.current.has(key)) return // allaqachon ko'rsatilgan (WS/FCM/poll dedup)
        notifiedIdsRef.current.add(key)
        const title = pickText(notif, "title", language) || "Yangi bildirishnoma"
        const body = pickText(notif, "message", language)
        const bn = new Notification(title, { body, icon: "/logo.svg", tag: key })
        bn.onclick = () => {
          window.focus()
          bn.close()
        }
      } catch (err) {
        console.error(err)
      }
    },
    [language]
  )

  // ── Yangi xabar kelganda (WS yoki FCM-foreground) ──
  const handleIncoming = useCallback(
    (raw) => {
      console.log("[NOTIF] 📥 handleIncoming chaqirildi, raw:", raw)
      const n = normalizeIncoming(raw)
      console.log("[NOTIF] 📥 normalized:", n, "| is_read:", n?.is_read)
      // Bo'sh / xizmat xabari (ping, ack va h.k.) — bildirishnoma emas, e'tiborsiz qoldiramiz
      if (!n || (n.id == null && !n.title && !n.message && !n.title_uz_latn && !n.title_ru)) {
        console.log("[NOTIF] ⏭️ Xizmat xabari / bo'sh — o'tkazib yuborildi")
        return
      }

      // Socketdan kelgan xabarda is_read bor: false bo'lsa (yoki yo'q bo'lsa) — yangi/o'qilmagan
      const isUnread = n.is_read !== true
      const notif = {
        ...n,
        id: n.id ?? `tmp-${new Date().getTime()}`,
        is_read: !!n.is_read,
        created_at: n.created_at || new Date().toISOString(),
      }
      // UI ro'yxatiga qo'shish (dublikatni o'tkazib yuborish)
      setItems((prev) => {
        if (notif.id && prev.some((it) => it.id === notif.id)) return prev
        return [notif, ...prev]
      })
      // Faqat o'qilmagan bo'lsa countni state'da +1 qilamiz
      // (sahifa yangilanganda haqiqiy son fetchCount orqali keladi)
      if (isUnread) setUnread((u) => u + 1)
      if (isUnread) showDesktopNotification(notif)
    },
    [showDesktopNotification]
  )

  // Eng so'nggi handlerni ref'da saqlaymiz — WS callback'i barqaror qoladi
  const incomingRef = useRef(handleIncoming)
  useEffect(() => {
    incomingRef.current = handleIncoming
  }, [handleIncoming])


  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
    fetchCount()
  }, [fetchCount])

  // ── WebSocket (real-time) + FCM (push) ulanishi ──
  useEffect(() => {
    let cancelled = false

    // FCM foreground listener (VAPID bo'lmasa firebase.js o'zi jim o'tkazib yuboradi)
    requestForToken()
    const unsubFcm = onForegroundMessage((payload) => incomingRef.current(payload))

    if (!WS_ENABLED) {
      console.info(
        "ℹ️ Real-time WebSocket dev (localhost) da o'chirilgan — desktop bildirishnoma polling orqali ishlaydi. Production domenda WS avtomatik yoqiladi."
      )
      return () => unsubFcm?.()
    }

    console.log("[NOTIF] 🚀 WS effekti ishga tushdi | WS_BASE:", WS_BASE)

    // Har (re)connectda yangi ticket bilan WS URL olish
    const getTicketUrl = async () => {
      const res = await axiosAPI.post("notifications/tickets/")
      const ticket = res.data?.data?.ticket
      console.log("[NOTIF] 🎟️ Ticket olindi:", ticket)
      if (!ticket) throw new Error("Ticket olinmadi")
      return `${WS_BASE}/ws/notifications/?ticket=${ticket}`
    }

    const startWs = async () => {
      try {
        const url = await getTicketUrl()
        if (cancelled) return
        notificationSocket.connect(url, (data) => incomingRef.current(data), getTicketUrl)
      } catch (err) {
        console.error("[NOTIF] ❌ WS ulanishda xato (ticket?):", err)
      }
    }
    startWs()

    return () => {
      cancelled = true
      notificationSocket.disconnect()
      unsubFcm?.()
    }
  }, [])

  // ── Ochilish/yopilish animatsiyasi ──
  useEffect(() => {
    if (open) {
      setShouldRender(true)
      const timer = setTimeout(() => setIsAnimating(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Esc bilan yopish
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  // Ochilganda ro'yxatni boshidan yuklab, sonni yangilash
  const openPanel = () => {
    // Foydalanuvchi harakati — desktop bildirishnoma ruxsatini so'rashning ishonchli payti
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
    pageRef.current = 1
    hasMoreRef.current = true
    setItems([])
    fetchList(1)
    fetchCount()
    setOpen(true)
  }

  // ── Cheksiz scroll ──
  const handleScroll = (e) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      if (hasMoreRef.current && !loadingRef.current) {
        fetchList(pageRef.current + 1)
      }
    }
  }

  // ── Bitta bildirishnomani o'qilgan deb belgilash (optimistik) ──
  const markRead = async (n) => {
    if (n.is_read) return
    // Optimistik: darhol o'qilgan ko'rinishga o'tkazamiz
    setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: true } : it)))
    setUnread((u) => Math.max(0, u - 1))

    // WS/FCM orqali hali backendda saqlanmagan (tmp-) xabarlar uchun so'rov yubormaymiz
    if (!n.id || String(n.id).startsWith("tmp-")) return

    try {
      // read/ endpointi bildirishnoma UUID id'sini qabul qiladi (200 = "o'qildi")
      await axiosAPI.patch(`notifications/${n.id}/read/`)
      // Backenddagi haqiqiy son bilan badge'ni sinxronlaymiz
      fetchCount()
    } catch (err) {
      const status = err?.response?.status
      // 400/404 — "allaqachon o'qilgan / topilmadi": yakuniy holat baribir "o'qilgan",
      // shuning uchun orqaga QAYTARMAYMIZ (foydalanuvchi bosgan — o'qilgan bo'lib qolsin).
      if (status === 400 || status === 404) {
        fetchCount()
        return
      }
      // Tarmoq yoki 5xx — qaytarib, qayta urinishga imkon beramiz
      console.error(err)
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: false } : it)))
      setUnread((u) => u + 1)
    }
  }

  // ── Hammasini o'qilgan deb belgilash ──
  const markAll = async () => {
    if (markingAll || !items.some((it) => !it.is_read)) return
    setMarkingAll(true)
    try {
      await axiosAPI.post("notifications/read-all/")
      setItems((prev) => prev.map((it) => ({ ...it, is_read: true })))
      setUnread(0)
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <>
      {/* ── Navbardagi qo'ng'iroq tugmasi ── */}
      <button
        type="button"
        onClick={openPanel}
        aria-label={t("notif_title")}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
      >
        <Bell size={18} strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white dark:ring-[#0A0A0A]" />
        )}
      </button>

      {/* ── Drawer ── */}
      {shouldRender &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className={cn(
                "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ease-out",
                isAnimating ? "opacity-100" : "opacity-0"
              )}
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <aside
              className={cn(
                "fixed top-0 right-0 z-50 h-screen w-full max-w-[400px] flex flex-col",
                "bg-white dark:bg-[#0A0A0A] border-l border-[#E5E7EB] dark:border-[#2E2E2E] shadow-2xl",
                "transition-transform duration-300 ease-out",
                isAnimating ? "translate-x-0" : "translate-x-full"
              )}
            >
              {/* Header */}
              <div className="flex-shrink-0 px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white">
                    {t("notif_title")}
                  </h2>
                  {unread > 0 && (
                    <span className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                      {unread} {t("notif_unread")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[#737373] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* "Hammasini o'qildi" — faqat o'qilmagan element bo'lsa ko'rinadi */}
              {items.some((it) => !it.is_read) && (
                <div className="flex-shrink-0 px-5 pb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={markAll}
                    disabled={markingAll}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0090FF] hover:text-[#007BE0] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={15} />
                    {t("notif_mark_all")}
                  </button>
                </div>
              )}

              {/* Ro'yxat */}
              <div onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-2.5">
                {loading && items.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[110px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse"
                    />
                  ))
                ) : error ? (
                  <div className="flex flex-col items-center justify-center gap-2 h-full text-[#737373] px-6 text-center">
                    <BellOff size={28} strokeWidth={1.5} />
                    <span className="text-sm">{t("notif_error")}</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 h-full text-[#737373] px-6 text-center">
                    <Bell size={30} strokeWidth={1.5} />
                    <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                      {t("notif_empty")}
                    </span>
                    <span className="text-[13px]">{t("notif_empty_hint")}</span>
                  </div>
                ) : (
                  <>
                    {items.map((n) => {
                      const title = pickText(n, "title", language)
                      const message = pickText(n, "message", language)
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => markRead(n)}
                          className={cn(
                            "w-full text-left rounded-2xl p-4 flex flex-col gap-1.5 transition-colors",
                            n.is_read
                              ? "bg-[#FAFAFA] dark:bg-[#141414] cursor-default"
                              : "bg-[#F5F5F5] dark:bg-[#171717] hover:bg-[#EFEFEF] dark:hover:bg-[#1C1C1C] cursor-pointer"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3
                              className={cn(
                                "text-[15px] leading-snug",
                                n.is_read
                                  ? "font-medium text-[#525252] dark:text-[#A3A3A3]"
                                  : "font-semibold text-[#0A0A0A] dark:text-white"
                              )}
                            >
                              {title || "—"}
                            </h3>
                            {!n.is_read && (
                              <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#0090FF] flex-shrink-0" />
                            )}
                          </div>
                          {message && (
                            <p className="text-[13px] leading-relaxed text-[#737373] dark:text-[#A3A3A3]">
                              {message}
                            </p>
                          )}
                          <span className="text-[12px] text-[#A3A3A3] dark:text-[#737373] tabular-nums mt-0.5">
                            {fmtDate(n.created_at)}
                          </span>
                        </button>
                      )
                    })}
                    {loading && items.length > 0 && (
                      <div className="h-[90px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse" />
                    )}
                  </>
                )}
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  )
}

export default NotificationBell
