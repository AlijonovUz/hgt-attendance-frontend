import { useSelector } from "react-redux"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/Context/LanguageContext"
import { Modal } from "@/components/ui/modal"

// Shaxsiy kabinet / Mening profilim — umumiy Modal komponenti ustiga qurilgan
// (filter modallari bilan bir xil ko'rinish, animatsiya va portal).
export const ProfileModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  const currentUser = useSelector((state) => state.references.currentUser)

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
    <Modal isOpen={isOpen} onClose={onClose} width={540} height="auto">
      {/* Sarlavha */}
      <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white mb-5">
        {t("profile_title")}
      </h2>

      {/* Avatar + ism + lavozim */}
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
  )
}

export default ProfileModal
