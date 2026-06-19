import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/Context/LanguageContext"

// Mustaqil (shared Modal'ga bog'liq bo'lmagan) profil modali — faqat bitta X tugma.
export const ProfileModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  const currentUser = useSelector((state) => state.references.currentUser)

  // Ochilish/yopilish animatsiyasi
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timer = setTimeout(() => setIsAnimating(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Escape bilan yopish + ochiq paytda fonni scroll qilmaslik
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!shouldRender) return null

  // Backend Profile sxemasi: full_name, role_info, branch_info, department_info, phone, face_image.
  // Viloyat/Tuman alohida maydon emas — branch_info ichidagi region_info/district_info'dan keladi.
  const name = currentUser?.full_name || "—"
  const role = currentUser?.role_info?.name || ""
  const avatar = currentUser?.face_image
  const branch = currentUser?.branch_info

  const initials = name && name !== "—"
    ? name.split(" ").slice(0, 2).map((n) => n.charAt(0)).join("").toUpperCase()
    : "?"

  const rows = [
    { label: t("prof_filial"), value: branch?.name },
    { label: t("prof_dept"), value: currentUser?.department_info?.name },
    { label: t("prof_region"), value: branch?.region_info?.name },
    { label: t("prof_district"), value: branch?.district_info?.name },
    { label: t("prof_phone"), value: currentUser?.phone },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/75 transition-opacity duration-300 ease-out",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed top-1/2 left-1/2 z-[61] -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100%-2rem)] max-w-[540px] rounded-3xl shadow-2xl",
          "bg-[#FAFAFA] dark:bg-[#171717] p-6",
          "transition-all duration-300 ease-out origin-center",
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {/* Header — yagona X tugma */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t("profile_title")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#262626] transition-colors cursor-pointer text-[#0A0A0A] dark:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar + name + role */}
        <div className="flex items-center gap-4 mb-5">
          {avatar ? (
            <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#85a6db] to-[#bfadea] flex items-center justify-center text-white text-lg font-semibold select-none">
              {initials}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-bold text-[#0A0A0A] dark:text-white truncate">{name}</span>
            {role && <span className="text-sm text-[#737373] dark:text-[#A3A3A3] truncate">{role}</span>}
          </div>
        </div>

        {/* Info rows */}
        <div className="rounded-2xl bg-[#F4F4F5] dark:bg-[#262626] px-4">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-4 py-3.5",
                i !== rows.length - 1 && "border-b border-white dark:border-[#333]"
              )}
            >
              <span className="text-sm text-[#737373] dark:text-[#A3A3A3]">{row.label}</span>
              <span className="text-sm font-medium text-[#0A0A0A] dark:text-white text-right truncate">
                {row.value || t("prof_empty")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
