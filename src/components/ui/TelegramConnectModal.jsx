import { CheckCircle2, Copy, ExternalLink, Send } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/Toast"
import { useLanguage } from "@/Context/LanguageContext"
import { useState } from "react"

const TELEGRAM_BOT_URL = "https://t.me/hgt_attendance_bot"

export const TelegramConnectModal = ({ isOpen, onClose, connected = false, botUrl = TELEGRAM_BOT_URL }) => {
  const { t } = useLanguage()
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  const copyBotLink = async () => {
    try {
      await navigator.clipboard.writeText(botUrl)
      setToast({ open: true, message: t("telegram_link_copied"), seq: Date.now() })
    } catch {
      setToast({ open: true, message: botUrl, seq: Date.now() })
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width={520} height="auto">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0090FF] text-white flex items-center justify-center flex-shrink-0">
              <Send size={26} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
                {t("telegram_modal_title")}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[#737373] dark:text-[#A3A3A3]">
                {t("telegram_modal_desc")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F5F5F5] dark:bg-[#262626] p-4 flex flex-col gap-3">
            {[
              t("telegram_step_1"),
              t("telegram_step_2"),
              t("telegram_step_3"),
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-white dark:bg-[#171717] text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-[#1A1A1A] dark:text-white leading-6">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] dark:border-[#333] p-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={18} className={connected ? "text-[#16A34A]" : "text-[#737373]"} />
              <span className="text-sm font-medium truncate">
                {connected ? t("telegram_connected") : t("telegram_not_connected")}
              </span>
            </div>
            <button
              type="button"
              onClick={copyBotLink}
              className="h-9 px-3 rounded-lg border border-[#E5E7EB] dark:border-[#333] text-sm font-medium hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer inline-flex items-center gap-2"
            >
              <Copy size={15} />
              {t("copy")}
            </button>
          </div>

          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold flex items-center justify-center gap-2"
          >
            {t("telegram_open_bot")}
            <ExternalLink size={17} />
          </a>
        </div>
      </Modal>

      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  )
}

export default TelegramConnectModal
