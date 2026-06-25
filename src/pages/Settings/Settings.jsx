import { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CheckCircle2, Languages, Palette, Send, Settings as SettingsIcon, Sun, Moon, Upload, KeyRound, Lock, Loader2, X } from "lucide-react"
import { cn, apiErrorMessage } from "@/lib/utils"
import { useLanguage } from "@/Context/LanguageContext"
import { useTheme } from "@/Context/ThemeContext"
import { axiosAPI } from "@/services/axiosAPI"
import { setCurrentUser } from "@/store/slices/referencesSlice"
import { ChangePasswordModal } from "@/components/ui/ChangePasswordModal"
import { Toast } from "@/components/ui/Toast"

const APP_VERSION = "v1.0.0"
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

// Til segment tugmasi (Lotin / Кирил / Русский -> uz / cy / ru)
const LANG_OPTIONS = [
  { value: "uz", labelKey: "set_lang_latin" },
  { value: "cy", labelKey: "set_lang_cyrillic" },
  { value: "ru", labelKey: "set_lang_russian" },
]

// Bitta sozlama qatori. `leading` berilsa — ikonka qutisi o'rniga shu element ko'rsatiladi.
const Row = ({ icon: Icon, leading, title, subtitle, control, last }) => (
  <div className={cn("flex items-center justify-between gap-4 py-5", !last && "border-b border-[#EDEDED] dark:border-[#262626]")}>
    <div className="flex items-center gap-4 min-w-0">
      {leading ?? (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-[#262626] border border-[#EDEDED] dark:border-[#333] flex items-center justify-center">
          <Icon size={18} strokeWidth={1.8} className="text-[#0A0A0A] dark:text-white" />
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-[15px] font-medium text-[#0A0A0A] dark:text-white truncate">{title}</span>
        {subtitle && <span className="text-[13px] text-[#737373] dark:text-[#A3A3A3] truncate">{subtitle}</span>}
      </div>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
)

// Kulrang "O'zgartirish" tugmasi (foto va parol uchun bir xil). `loading` berilsa spinner ko'rsatadi.
const ChangeButton = ({ icon: Icon, label, onClick, disabled, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "flex items-center gap-2 h-10 px-4 rounded-xl text-[15px] font-medium transition-colors",
      "bg-white dark:bg-[#262626] border border-[#EDEDED] dark:border-[#333] text-[#0A0A0A] dark:text-white",
      "hover:bg-[#F4F4F5] dark:hover:bg-[#333] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    )}
  >
    {loading ? <Loader2 size={17} strokeWidth={1.8} className="animate-spin" /> : <Icon size={17} strokeWidth={1.8} />}
    {label}
  </button>
)

const TelegramButton = ({ href, t }) => (
  <a
    href={href || undefined}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "flex items-center justify-center gap-2 h-11 min-w-[170px] px-5 rounded-xl text-[15px] font-semibold transition-colors cursor-pointer",
      href
        ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#0A0A0A] hover:opacity-90"
        : "bg-[#F5F5F5] dark:bg-[#404040] text-[#737373] dark:text-[#D4D4D4] pointer-events-none"
    )}
  >
    <CheckCircle2 size={18} strokeWidth={2} />
    {t("telegram_connect")}
  </a>
)

const Settings = () => {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.references.currentUser)

  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)

  const showToast = (message) => setToast({ open: true, message, seq: Date.now() })

  const avatar = currentUser?.face_image
  const telegramId = currentUser?.telegram_id
  const telegramUrl = currentUser?.telegram_url
  const name = currentUser?.full_name || ""
  const initials = name
    ? name.split(" ").slice(0, 2).map((n) => n.charAt(0)).join("").toUpperCase()
    : "?"

  const handlePhotoPick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = "" // bir xil faylni qayta tanlash mumkin bo'lishi uchun
    if (!file) return

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return showToast(t("photo_invalid"))
    if (file.size > MAX_PHOTO_BYTES) return showToast(t("photo_too_large"))

    const fd = new FormData()
    fd.append("face_image", file)

    setUploading(true)
    try {
      const res = await axiosAPI.patch("users/auth/profile/", fd)
      const updated = res.data?.data
      if (updated) {
        dispatch(setCurrentUser(updated))
        localStorage.setItem("currentUser", JSON.stringify(updated))
      }
      showToast(t("photo_updated"))
    } catch (err) {
      console.error(err)
      showToast(apiErrorMessage(err, t("photo_error")))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">

      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-semibold text-[#0A0A0A] dark:text-white">{t("settings")}</h1>
        <span className="text-[#737373] dark:text-[#A3A3A3] text-sm">{t("settings_subtitle")}</span>
      </div>

      {!telegramId && (
        <div className="w-full rounded-3xl bg-[#FAFAFA] dark:bg-[#171717] px-7 py-7 flex items-center justify-between gap-5 border-2 border-[#0090FF]">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-[#0090FF] text-white flex items-center justify-center flex-shrink-0">
              <Send size={25} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-white">
                {t("telegram_settings_title")}
              </h2>
              <p className="mt-1 text-[15px] leading-6 text-[#737373] dark:text-[#A3A3A3] max-w-[720px]">
                {t("telegram_settings_subtitle")}
              </p>
            </div>
          </div>
          <TelegramButton href={telegramUrl} t={t} />
        </div>
      )}

      {/* ─── Karta 1: Hisob (foto + parol) ─── */}
      <div className="w-full rounded-3xl bg-[#FAFAFA] dark:bg-[#171717] px-7">

        {/* Profil fotosurati */}
        <Row
          leading={
            avatar ? (
              <img
                src={avatar}
                alt={name}
                onClick={() => setPhotoPreviewOpen(true)}
                className="flex-shrink-0 w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#85a6db] to-[#bfadea] flex items-center justify-center text-white text-sm font-semibold select-none">
                {initials}
              </div>
            )
          }
          title={t("set_photo_title")}
          subtitle={t("set_photo_sub")}
          control={
            <ChangeButton
              icon={Upload}
              label={uploading ? t("photo_uploading") : t("set_change")}
              onClick={handlePhotoPick}
              loading={uploading}
            />
          }
        />

        {/* Parolni o'zgartirish */}
        <Row
          icon={Lock}
          title={t("set_password_title")}
          subtitle={t("set_password_sub")}
          control={
            <ChangeButton icon={KeyRound} label={t("set_change")} onClick={() => setPwdOpen(true)} />
          }
          last
        />
      </div>

      {/* ─── Karta 2: Interfeys sozlamalari ─── */}
      <div className="w-full rounded-3xl bg-[#FAFAFA] dark:bg-[#171717] px-7">

        {/* Interfeys tili */}
        <Row
          icon={Languages}
          title={t("set_lang_title")}
          subtitle={t("set_lang_sub")}
          control={
            <div className="flex items-center bg-[#EFEFEF] dark:bg-[#0A0A0A] rounded-lg p-0.5">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLanguage(opt.value)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    language === opt.value
                      ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-sm"
                      : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#0A0A0A] dark:hover:text-white"
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          }
        />

        {/* Rang rejimi */}
        <Row
          icon={Palette}
          title={t("set_theme_title")}
          subtitle={t("set_theme_sub")}
          control={
            <div className="flex items-center bg-[#EFEFEF] dark:bg-[#0A0A0A] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  theme === "light"
                    ? "bg-white text-[#0A0A0A] shadow-sm"
                    : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#0A0A0A] dark:hover:text-white"
                )}
              >
                {t("light_theme")}
                <Sun size={15} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  theme === "dark"
                    ? "bg-[#262626] text-white shadow-sm"
                    : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#0A0A0A] dark:hover:text-white"
                )}
              >
                {t("dark_theme")}
                <Moon size={15} strokeWidth={1.8} />
              </button>
            </div>
          }
        />

        {/* Tizim versiyasi */}
        <Row
          icon={SettingsIcon}
          title={t("set_version_title")}
          control={<span className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">{APP_VERSION}</span>}
          last
        />
      </div>

      {/* Yashirin fayl input — foto yuklash uchun */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Parolni o'zgartirish modali */}
      <ChangePasswordModal isOpen={pwdOpen} onClose={() => setPwdOpen(false)} />

      {/* Toast */}
      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      />

      {/* Profil rasmi — katta ko'rinish (lightbox) */}
      {photoPreviewOpen && avatar && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPhotoPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPhotoPreviewOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <img
            src={avatar}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}

export default Settings
