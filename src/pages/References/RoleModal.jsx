import { useEffect, useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { axiosAPI } from "@/services/axiosAPI"
import { useLanguage } from "@/Context/LanguageContext"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"

// Amal (action) so'zlari — guruh kalitini aniqlashda code'dan olib tashlanadi
const ACTION_TOKENS = new Set([
  "view", "list", "retrieve", "read", "create", "add", "new",
  "edit", "update", "change", "delete", "remove", "destroy", "export", "import", "manage",
])

// code'dan guruh (entity) kalitini ajratib olamiz, masalan:
//  "region_view" -> "region", "view_branch_analytics" -> "branch_analytics"
const deriveGroup = (code) => {
  if (!code) return "permissions"
  const parts = String(code).toLowerCase().split(/[_.\-:\s]+/).filter(Boolean)
  const entity = parts.filter((p) => !ACTION_TOKENS.has(p))
  return entity.length ? entity.join("_") : "permissions"
}

// Backend Permission sxemasi: { id, name, code } (tekis massiv, alohida guruh maydoni yo'q).
// Shuning uchun `code` asosida guruhlaymiz -> { groupKey: [{id, name, code}] }
const normalizePermissions = (data) => {
  if (!data) return {}
  const list = Array.isArray(data) ? data : data.results || []
  const grouped = {}
  list.forEach((p) => {
    const key = deriveGroup(p.code)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push({ id: p.id, name: p.name || p.code || String(p.id), code: p.code })
  })
  return grouped
}

export const RoleModal = ({ isOpen, onClose, onCreated }) => {
  const { t } = useLanguage()

  const [name, setName] = useState("")
  const [permGroups, setPermGroups] = useState({}) // { groupKey: [{id,name}] }
  const [selected, setSelected] = useState(() => new Set()) // tanlangan permission id'lar
  const [openGroups, setOpenGroups] = useState({})
  const [nameError, setNameError] = useState(false)
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) => setToast((p) => ({ open: true, message, seq: p.seq + 1 }))

  const groupLabel = (key) => {
    const tr = t(key)
    return tr !== key ? tr : key
  }

  // Modal ochilganda ruxsatlarni yuklab, formani tozalaymiz
  useEffect(() => {
    if (!isOpen) return
    setName("")
    setSelected(new Set())
    setNameError(false)

    const loadPermissions = async () => {
      setLoadingPerms(true)
      try {
        const res = await axiosAPI.get("users/permissions/")
        if (res.status === 200) {
          const groups = normalizePermissions(res.data?.data)
          setPermGroups(groups)
          // Birinchi guruh ochiq holatda
          const firstKey = Object.keys(groups)[0]
          setOpenGroups(firstKey ? { [firstKey]: true } : {})
        }
      } catch (err) {
        console.error(err)
        setPermGroups({})
      } finally {
        setLoadingPerms(false)
      }
    }
    loadPermissions()
  }, [isOpen])

  const toggleGroup = (key) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }))

  const togglePerm = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleCreate = async () => {
    if (!name.trim()) {
      setNameError(true)
      showToast(t("gz_validation"))
      return
    }
    setCreating(true)
    try {
      const payload = { name: name.trim(), permissions: [...selected] }
      const res = await axiosAPI.post("users/roles/", payload)
      if (res.status === 201 || res.status === 200) {
        onCreated?.()
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      const msg = err?.response?.data?.error?.errorMsg || t("gz_error")
      showToast(msg)
    } finally {
      setCreating(false)
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
          <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t("ref_add_role")}</h2>
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
                  const items = permGroups[key]
                  const isMulti = items.length > 1
                  const isOpenGroup = !!openGroups[key]

                  // Bitta ruxsatli guruh: nom + bitta toggle
                  if (!isMulti) {
                    const perm = items[0]
                    return (
                      <div key={key} className="flex items-center justify-between py-3">
                        <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">{perm?.name || groupLabel(key)}</span>
                        <Switch
                          checked={selected.has(perm.id)}
                          onChange={() => togglePerm(perm.id)}
                          containerClassName="w-[40px] h-[21px]"
                          thumbClassName="w-[17px] h-[17px]"
                          checkedThumbClassName="translate-x-5"
                          uncheckedThumbClassName="translate-x-0.5"
                        />
                      </div>
                    )
                  }

                  // Ko'p ruxsatli guruh: ochiluvchi (akkordeon) + har bir ruxsat toggle
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

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 sticky bottom-0">
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className={cn(
              "px-6 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
              creating ? "bg-[#7EC0FF] cursor-default" : "bg-[#0090FF] hover:bg-[#007BE0] cursor-pointer"
            )}
          >
            <HugeIcon icon={CheckmarkSquare01Icon} size={18} />
            {t("ref_add_role")}
          </button>
        </div>
      </div>

      <Toast key={toast.seq} open={toast.open} message={toast.message} onClose={() => setToast((p) => ({ ...p, open: false }))} />
    </Modal>
  )
}
