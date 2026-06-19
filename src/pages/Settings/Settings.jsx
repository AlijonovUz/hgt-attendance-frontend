import { useState } from "react"
import { Languages, Palette, Bell, Volume2, Settings as SettingsIcon, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/Context/LanguageContext"
import { useTheme } from "@/Context/ThemeContext"
import { Switch } from "@/components/ui/switch"

const APP_VERSION = "v1.0.0"

// Til segment tugmasi (Lotin / Кирил / Русский -> uz / cy / ru)
const LANG_OPTIONS = [
  { value: "uz", labelKey: "set_lang_latin" },
  { value: "cy", labelKey: "set_lang_cyrillic" },
  { value: "ru", labelKey: "set_lang_russian" },
]

const Settings = () => {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()

  const [notifications, setNotifications] = useState(() => localStorage.getItem("notifications") !== "off")
  const [sound, setSound] = useState(() => localStorage.getItem("sound") !== "off")

  const handleNotifications = (val) => {
    setNotifications(val)
    localStorage.setItem("notifications", val ? "on" : "off")
  }
  const handleSound = (val) => {
    setSound(val)
    localStorage.setItem("sound", val ? "on" : "off")
  }

  // Bitta sozlama qatori
  const Row = ({ icon: Icon, title, subtitle, control, last }) => (
    <div className={cn("flex items-center justify-between gap-4 py-5", !last && "border-b border-[#EDEDED] dark:border-[#262626]")}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-[#262626] border border-[#EDEDED] dark:border-[#333] flex items-center justify-center">
          <Icon size={18} strokeWidth={1.8} className="text-[#0A0A0A] dark:text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] font-medium text-[#0A0A0A] dark:text-white truncate">{title}</span>
          {subtitle && <span className="text-[13px] text-[#737373] dark:text-[#A3A3A3] truncate">{subtitle}</span>}
        </div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">

      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t("settings")}</h1>
        <span className="text-[#737373] dark:text-[#A3A3A3] text-sm">{t("settings_subtitle")}</span>
      </div>

      {/* Settings card */}
      <div className="w-full rounded-2xl bg-[#FAFAFA] dark:bg-[#171717] border border-[#EDEDED] dark:border-[#262626] px-5">

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

        {/* Bildirishnomalar */}
        <Row
          icon={Bell}
          title={t("set_notif_title")}
          subtitle={t("set_notif_sub")}
          control={<Switch checked={notifications} onChange={handleNotifications} />}
        />

        {/* Ovozli signal */}
        <Row
          icon={Volume2}
          title={t("set_sound_title")}
          subtitle={t("set_sound_sub")}
          control={<Switch checked={sound} onChange={handleSound} />}
        />

        {/* Tizim versiyasi */}
        <Row
          icon={SettingsIcon}
          title={t("set_version_title")}
          control={<span className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">{APP_VERSION}</span>}
          last
        />
      </div>
    </div>
  )
}

export default Settings
