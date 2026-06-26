import { useState } from "react"
import { useSelector } from "react-redux"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/Context/LanguageContext"
import { Modal } from "@/components/ui/modal"
import { createPortal } from "react-dom"

export const ProfileModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  const currentUser = useSelector((state) => state.references.currentUser)
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false)

  const name = currentUser?.full_name || ""
  const role = currentUser?.role_info?.name || ""
  const avatar = currentUser?.face_image
  const branch = currentUser?.branch_info

  const initials = name && name !== ""
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
      <Modal isOpen={isOpen} onClose={onClose} width={540} height="auto">
        {/* Sarlavha */}
        <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white mb-5">
          {t("profile_title")}
        </h2>

        {/* Avatar + ism + lavozim */}
        <div className="flex items-center gap-4 mb-5">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              onClick={() => setPhotoPreviewOpen(true)}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            />
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

        {/* Ma'lumot qatorlari */}
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
      </Modal>

      {/* Rasm preview — body portaliga chiqariladi, barcha modallardan ustida */}
      {photoPreviewOpen && avatar && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4"
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
        </div>,
        document.body
      )}
    </>
  )
}

export default ProfileModal