import { CheckCircle2, Send, X } from "lucide-react"
import { useSelector } from "react-redux"
import { useLanguage } from "@/Context/LanguageContext"

export const HelpModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  const currentUser = useSelector((state) => state.references.currentUser)
  const telegramUrl = currentUser?.telegram_url

  if (!isOpen) return null

  return (
    <div className="mx-5 mb-5 rounded-[22px] bg-[#FAFAFA] dark:bg-[#262626] shadow-sm border border-[#E5E7EB] dark:border-[#333] px-5 py-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#0090FF] text-white flex items-center justify-center flex-shrink-0">
          <Send size={21} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1 pr-5">
          <h2 className="text-[18px] leading-[23px] font-semibold text-[#0A0A0A] dark:text-white">
            Telegram bildirishnomalari
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-[#737373] dark:text-[#A3A3A3] hover:text-[#0A0A0A] dark:hover:text-white cursor-pointer flex-shrink-0"
          aria-label="Yopish"
        >
          <X size={24} strokeWidth={1.8} />
        </button>
      </div>

      <p className="mt-3 text-[14px] leading-[20px] text-[#737373] dark:text-[#A3A3A3]">
        Botni ulang - kelish, kechikish, ketish va shunga o'xshash muhim xabarlarni Telegram orqali oling.
      </p>

      <a
        href={telegramUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 h-9 w-full rounded-xl text-[14px] font-semibold flex items-center justify-center gap-1.5 ${
          telegramUrl
            ? "bg-[#1A1A1A] dark:bg-white text-white dark:text-[#0A0A0A]"
            : "bg-[#1A1A1A]/50 dark:bg-white/50 text-white dark:text-[#0A0A0A] pointer-events-none"
        }`}
      >
        <CheckCircle2 size={16} strokeWidth={2} />
        {t("telegram_connect") || "Ulash"}
      </a>
    </div>
  )
}

export default HelpModal
