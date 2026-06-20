import { useEffect, useState } from "react"
import { ChevronDown, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { axiosAPI } from "@/services/axiosAPI"
import { useLanguage } from "@/Context/LanguageContext"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"

const normalizePermissions = (data) => {
  if (!data) return {}

  const rawObject = data.data || data
  const grouped = {}

  // Backenddan kelgan tayyor guruh kalitlaridan foydalanamiz (masalan: "reports", "positions")
  Object.keys(rawObject).forEach((groupKey) => {
    const list = rawObject[groupKey]

    if (Array.isArray(list)) {
      list.forEach((p) => {
        // Avtomatik ravishda backenddagi guruh kalitini saqlab qolamiz
        const key = groupKey

        if (!grouped[key]) {
          grouped[key] = []
        }

        grouped[key].push({
          id: p.id,
          name: p.name || p.code || String(p.id),
          code: p.code,
        })
      })
    }
  })

  return grouped
}

export const RoleModal = ({ isOpen, onClose, onCreated, roleData = null, canDelete, canEdit, onDelete, deleteLoading, setEditModal }) => {
  const { t } = useLanguage()
  const isEdit = !!roleData

  const [name, setName] = useState("")
  const [permGroups, setPermGroups] = useState({})
  const [selected, setSelected] = useState(() => new Set())
  const [openGroups, setOpenGroups] = useState({})
  const [nameError, setNameError] = useState(false)
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  const GROUP_LABELS = {
    regions: t("regions") || "Viloyatlar",
    districts: t("districts") || "Tumanlar",
    analytics: t("analytics") || "Analitika",
    holidays: t("holidays") || "Bayramlar",
    schedules: t("schedules") || "Ish grafiklari",
    audits: t("audits") || "Audit",
    roles: t("role") || "Rollar",
    positions: t("positions") || "Lavozimlar",
    departments: t("departments") || "Bo'limlar",
    branchs: t("branchs") || "Filiallar",
    reports: t("reports") || "Hisobotlar",
    kpis: t("kpis") || "KPI",
    gps: t("gps") || "GPS",
    geozones: t("geozones") || "Geozonalar",
    attendances: t("attendances") || "Davomat",
    employees: t("employees") || "Xodimlar",
    logs: t("logs") || "Xodimlar",
    dailys: t("dailys") || "Xodimlar",
  }

  const showToast = (message) => setToast((p) => ({ open: true, message, seq: p.seq + 1 }))
  const groupLabel = (key) => GROUP_LABELS[key] || key

  useEffect(() => {
    if (!isOpen) return

    if (isEdit && roleData) {
      setName(roleData.name || "")
      if (isEdit && roleData) {
        setName(roleData.name || "")

        // permissions_info dan barcha id larni yig'ish
        const permissionsInfo = roleData.permissions_info || {}
        const allSelectedIds = new Set(
          Object.values(permissionsInfo)
            .flat()
            .map(p => p.id)
        )
        setSelected(allSelectedIds)
      }
    } else {
      setName("")
      setSelected(new Set())
    }
    setNameError(false)

    const loadPermissions = async () => {
      setLoadingPerms(true)
      try {
        const res = await axiosAPI.get("users/permissions/")
        if (res.status === 200) {
          const rawData = res.data?.data || res.data
          const groups = normalizePermissions(rawData)
          setPermGroups(groups)

          const firstKey = Object.keys(groups)[0]
          setOpenGroups(firstKey ? { [firstKey]: true } : {})
        }
      } catch (err) {
        console.error("Ruxsatlarni yuklashda xatolik:", err)
        setPermGroups({})
      } finally {
        setLoadingPerms(false)
      }
    }

    loadPermissions()
  }, [isOpen, isEdit, roleData])

  const toggleGroup = (key) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }))

  const togglePerm = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError(true)
      showToast(t("gz_validation"))
      return
    }
    setSaving(true)
    try {
      const payload = { name: name.trim(), permissions: [...selected] }

      let res
      if (isEdit) {
        res = await axiosAPI.put(`users/roles/${roleData.id}/`, payload)
      } else {
        res = await axiosAPI.post("users/roles/", payload)
      }

      if (res.status === 201 || res.status === 200) {
        onCreated?.()
        onClose()
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      const msg = err?.response?.data?.error?.errorMsg || t("gz_error")
      showToast(msg)
    } finally {
      setSaving(false)
    }
  }

  const groupKeys = Object.keys(permGroups)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      height={600}
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
            {isEdit ? t("edit") : t("ref_add_role")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer text-[#0A0A0A] dark:text-white"
          >
            <X size={20} />
          </button>
        </div>
      }
    >
      <div className="flex flex-col justify-between h-full gap-4 pb-2">
        <div className="flex flex-col gap-4">
          {/* Rol nomi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("ref_name_role")}</label>
            <Input
              type="text"
              placeholder={t("ref_ph_role")}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(false)
              }}
              className={cn(
                "w-full h-11 rounded-lg dark:bg-[#171717]",
                nameError && "border-red-500 focus:border-red-500 dark:border-red-500"
              )}
              disabled={!canEdit}
            />
            {nameError && <span className="text-xs text-red-500">{t("field_required")}</span>}
          </div>

          {/* Ruxsatlar */}
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white mb-1">{t("ref_permissions")}</span>

            {loadingPerms ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                ))}
              </div>
            ) : groupKeys.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#737373]">{t("ref_no_permissions")}</div>
            ) : (
              <div className="flex flex-col divide-y divide-[#F0F0F0] dark:divide-[#1F1F1F]">
                {groupKeys.map((key) => {
                  const items = permGroups[key] || []
                  const isOpenGroup = !!openGroups[key]

                  // SHART 1: Guruhda faqat 1 ta ruxsat bo'lsa (Masalan: audits yoki gps)
                  if (items.length === 1) {
                    const perm = items[0]
                    return (
                      <div key={key} className="flex items-center justify-between py-3">
                        {/* Oldingi guruh kodi olib tashlandi, faqat obyekt nomi qoldi */}
                        <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                          {perm.name}
                        </span>
                        <Switch
                          checked={selected.has(perm.id)}
                          onChange={() => togglePerm(perm.id)}
                          containerClassName="w-[40px] h-[21px]"
                          thumbClassName="w-[17px] h-[17px]"
                          checkedThumbClassName="translate-x-5"
                          uncheckedThumbClassName="translate-x-0.5"
                          disabled={!canEdit}
                        />
                      </div>
                    )
                  }

                  // SHART 2: Guruhda 1 dan ko'p ruxsat bo'lsa (Masalan: reports, employees)
                  return (
                    <div key={key} className="py-1">
                      <button
                        type="button"
                        onClick={() => toggleGroup(key)}
                        className="flex items-center justify-between w-full py-2.5 cursor-pointer"
                      >
                        <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">{groupLabel(key)}</span>
                        <ChevronDown
                          size={18}
                          className={cn("text-[#737373] transition-transform duration-300", isOpenGroup && "rotate-180")}
                        />
                      </button>

                      <div
                        className={cn(
                          "flex flex-wrap gap-x-6 gap-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                          isOpenGroup ? "max-h-[600px] opacity-100 pb-2" : "max-h-0 opacity-0"
                        )}
                      >
                        {items.map((perm) => (
                          <div key={perm.id} className="flex items-center gap-2.5 py-1.5">
                            <Switch
                              checked={selected.has(perm.id)}
                              onChange={() => togglePerm(perm.id)}
                              containerClassName="w-[40px] h-[21px]"
                              thumbClassName="w-[17px] h-[17px]"
                              checkedThumbClassName="translate-x-5"
                              uncheckedThumbClassName="translate-x-0.5"
                              disabled={!canEdit}
                            />
                            <span className="text-sm text-[#0A0A0A] dark:text-white">{perm.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {(canDelete || canEdit) &&
          <div className="flex items-center justify-end gap-3 sticky bottom-0 z-10 ">
            {/* Delete tugmasi — faqat canDelete bo'lsa */}
            <div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setEditModal(false)
                    onDelete(roleData)
                  }}
                  disabled={deleteLoading}
                  className={cn(
                    "px-5 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                    deleteLoading
                      ? "bg-red-300 cursor-default"
                      : "bg-red-500 hover:bg-red-600 cursor-pointer"
                  )}
                >
                  <Trash2 size={18} />
                  {t("delete") || "O'chirish"}
                </button>
              )}
            </div>

            {/* Save tugmasi — canEdit bo'lsa aktiv, bo'lmasa disabled */}
            {canEdit &&
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "px-6 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                  saving ? "bg-[#7EC0FF] cursor-default" : "bg-[#0090FF] hover:bg-[#007BE0] cursor-pointer"
                )}
              >
                <HugeIcon icon={CheckmarkSquare01Icon} size={18} />
                {isEdit ? t("edit") : t("ref_add_role")}
              </button>
            }
          </div>
        }
      </div>

      <Toast key={toast.seq} open={toast.open} message={toast.message} onClose={() => setToast((p) => ({ ...p, open: false }))} />
    </Modal>
  )
}