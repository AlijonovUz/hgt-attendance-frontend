import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff, Check, Loader2 } from "lucide-react"
import { cn, apiErrorMessage } from "@/lib/utils"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/Toast"

// Parol talablari — har biri test funksiyasi bilan.
const RULES = [
  { key: "pwd_req_len", test: (v) => v.length >= 8 },
  { key: "pwd_req_upper", test: (v) => /[A-Z]/.test(v) },
  { key: "pwd_req_lower", test: (v) => /[a-z]/.test(v) },
  { key: "pwd_req_digit", test: (v) => /[0-9]/.test(v) },
  { key: "pwd_req_special", test: (v) => /[^A-Za-z0-9]/.test(v) },
]

const emptyForm = { old_password: "", new_password: "", confirm_new_password: "" }

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage()

  const [form, setForm] = useState(emptyForm)
  const [show, setShow] = useState({ old: false, new1: false, new2: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  // Modal yopilganda formani tozalaymiz
  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm)
      setShow({ old: false, new1: false, new2: false })
      setError("")
      setSubmitting(false)
    }
  }, [isOpen])

  const ruleState = useMemo(
    () => RULES.map((r) => ({ ...r, ok: r.test(form.new_password) })),
    [form.new_password]
  )
  const allRulesOk = ruleState.every((r) => r.ok)
  const passwordsMatch =
    form.confirm_new_password.length > 0 && form.new_password === form.confirm_new_password

  const canSubmit =
    !submitting &&
    form.old_password.trim().length > 0 &&
    allRulesOk &&
    passwordsMatch

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
    if (error) setError("")
  }

  const handleSubmit = async () => {
    if (!form.old_password.trim()) return setError(t("pwd_old_required"))
    if (!allRulesOk) return setError(t("pwd_weak"))
    if (!passwordsMatch) return setError(t("pwd_mismatch"))

    setSubmitting(true)
    setError("")
    try {
      await axiosAPI.put("users/auth/change-password/", {
        old_password: form.old_password,
        new_password: form.new_password,
        confirm_new_password: form.confirm_new_password,
      })
      setToast({ open: true, message: t("pwd_success"), seq: Date.now() })
      // Modalni biroz kechikib yopamiz — toast ko'rinishi uchun
      setTimeout(() => onClose?.(), 400)
    } catch (err) {
      setError(apiErrorMessage(err, t("pwd_error")))
    } finally {
      setSubmitting(false)
    }
  }

  // Bitta parol input qatori (label + eye toggle).
  // DIQQAT: bu komponent EMAS, balki funksiya — `<Field/>` sifatida ishlatilsa
  // har render'da remount bo'lib, input fokusi yo'qoladi. Shuning uchun {renderField(...)} chaqiramiz.
  const renderField = ({ label, valueKey, showKey }) => (
    <div key={valueKey} className="flex flex-col gap-2">
      <label className="text-[15px] font-medium text-[#0A0A0A] dark:text-white">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[valueKey]}
          onChange={(e) => setField(valueKey, e.target.value)}
          autoComplete="new-password"
          className={cn(
            "w-full h-[52px] rounded-xl bg-white dark:bg-[#0A0A0A] border px-4 pr-12 text-[15px] outline-none transition-colors",
            "text-[#0A0A0A] dark:text-white placeholder:text-[#A3A3A3]",
            "border-[#EDEDED] dark:border-[#2E2E2E] focus:border-[#0066FF] dark:focus:border-[#0066FF]"
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute top-1/2 right-3 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-[#737373] dark:text-[#A3A3A3] hover:text-[#0A0A0A] dark:hover:text-white cursor-pointer"
        >
          {show[showKey] ? <EyeOff size={19} strokeWidth={1.8} /> : <Eye size={19} strokeWidth={1.8} />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width={560} height="auto">
        {/* Sarlavha */}
        <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white mb-6">
          {t("pwd_modal_title")}
        </h2>

        {/* Inputlar */}
        <div className="flex flex-col gap-4">
          {renderField({ label: t("pwd_old"), valueKey: "old_password", showKey: "old" })}
          {renderField({ label: t("pwd_new"), valueKey: "new_password", showKey: "new1" })}
          {renderField({ label: t("pwd_confirm"), valueKey: "confirm_new_password", showKey: "new2" })}
        </div>

        {/* Talablar ro'yxati */}
        <div className="flex flex-col gap-2.5 mt-5">
          {ruleState.map((r) => (
            <div key={r.key} className="flex items-center gap-3">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors",
                  r.ok ? "bg-[#22C55E]" : "bg-[#D4D4D4] dark:bg-[#404040]"
                )}
              />
              <span
                className={cn(
                  "text-[15px] transition-colors",
                  r.ok ? "text-[#0A0A0A] dark:text-white" : "text-[#737373] dark:text-[#A3A3A3]"
                )}
              >
                {t(r.key)}
              </span>
            </div>
          ))}
        </div>

        {/* Xatolik */}
        {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}

        {/* Saqlash tugmasi */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "flex items-center gap-2 h-[52px] px-7 rounded-xl text-[15px] font-semibold text-white transition-colors",
              canSubmit
                ? "bg-[#0066FF] hover:bg-[#0052CC] cursor-pointer"
                : "bg-[#0066FF]/50 cursor-not-allowed"
            )}
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} strokeWidth={2.5} />
            )}
            {submitting ? t("pwd_saving") : t("pwd_save")}
          </button>
        </div>
      </Modal>

      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      />
    </>
  )
}

export default ChangePasswordModal
