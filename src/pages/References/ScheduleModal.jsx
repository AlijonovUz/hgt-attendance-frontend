import { useEffect, useState } from "react"
import { Check, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { axiosAPI } from "@/services/axiosAPI"
import { useLanguage } from "@/Context/LanguageContext"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"

const WEEK_DAYS = [
  { label: "Du", day_number: 0 },
  { label: "Se", day_number: 1 },
  { label: "Ch", day_number: 2 },
  { label: "Pa", day_number: 3 },
  { label: "Ju", day_number: 4 },
  { label: "Sh", day_number: 5 },
  { label: "Ya", day_number: 6 },
]

const toApiTime = (v) => {
  if (!v) return null
  return v.length === 5 ? `${v}:00` : v
}

// "09:00:00" → "09:00"
const toInputTime = (v) => {
  if (!v) return ""
  return String(v).slice(0, 5)
}

export const ScheduleModal = ({
  isOpen,
  onClose,
  onCreated,
  scheduleData = null,
  canEdit,
  canDelete,
  onDelete,
  deleteLoading,
}) => {
  const { t } = useLanguage()
  const isEdit = !!scheduleData

  const [name, setName] = useState("")
  const [workStart, setWorkStart] = useState("09:00")
  const [workEnd, setWorkEnd] = useState("18:00")
  const [noLunch, setNoLunch] = useState(false)
  const [lunchStart, setLunchStart] = useState("13:00")
  const [lunchEnd, setLunchEnd] = useState("14:00")
  const [days, setDays] = useState(() => new Set())
  const [weekdayMap, setWeekdayMap] = useState(null)
  const [nameError, setNameError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) => setToast((p) => ({ open: true, message, seq: p.seq + 1 }))

  useEffect(() => {
    if (!isOpen) return

    if (isEdit && scheduleData) {
      setName(scheduleData.name || "")
      setWorkStart(toInputTime(scheduleData.work_start_time) || "09:00")
      setWorkEnd(toInputTime(scheduleData.work_end_time) || "18:00")

      const hasLunch = !!scheduleData.lunch_start_time
      setNoLunch(!hasLunch)
      setLunchStart(toInputTime(scheduleData.lunch_start_time) || "13:00")
      setLunchEnd(toInputTime(scheduleData.lunch_end_time) || "14:00")

      // mandatory_days_info dan day_number larni olamiz
      const mandatoryDayNumbers = new Set(
        (scheduleData.mandatory_days_info || []).map((d) => d.day_number)
      )
      setDays(mandatoryDayNumbers)
    } else {
      setName("")
      setWorkStart("09:00")
      setWorkEnd("18:00")
      setNoLunch(false)
      setLunchStart("13:00")
      setLunchEnd("14:00")
      setDays(new Set())
    }
    setNameError(false)

    const loadWeekdays = async () => {
      try {
        const res = await axiosAPI.get("users/weekdays/")
        if (res.status === 200) {
          const list = res.data?.data?.results || res.data?.data || []
          if (Array.isArray(list) && list.length) {
            const map = {}
            list
              .slice()
              .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
              .forEach((w, i) => {
                const dn = w.day_number ?? i
                map[dn] = w.id
              })
            setWeekdayMap(map)
          }
        }
      } catch (err) {
        console.error(err)
        setWeekdayMap(null)
      }
    }
    loadWeekdays()
  }, [isOpen, isEdit, scheduleData])

  const toggleDay = (dn) =>
    setDays((prev) => {
      const next = new Set(prev)
      if (next.has(dn)) next.delete(dn)
      else next.add(dn)
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
      const selectedDays = [...days].sort((a, b) => a - b)
      const mandatoryDays = weekdayMap
        ? selectedDays.map((dn) => weekdayMap[dn]).filter((v) => v != null)
        : selectedDays

      const payload = {
        name: name.trim(),
        work_start_time: toApiTime(workStart),
        work_end_time: toApiTime(workEnd),
        lunch_start_time: noLunch ? null : toApiTime(lunchStart),
        lunch_end_time: noLunch ? null : toApiTime(lunchEnd),
        mandatory_days: mandatoryDays,
      }

      let res
      if (isEdit) {
        res = await axiosAPI.put(`users/schedules/${scheduleData.id}/`, payload)
      } else {
        res = await axiosAPI.post("users/schedules/", payload)
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

  const timeInputClass =
    "w-full h-12 rounded-xl border-2 border-[#E5E5E5] dark:border-[#404040] bg-white dark:bg-[#171717] px-3.5 text-sm text-[#0A0A0A] dark:text-white outline-none focus:border-gray-300 dark:focus:border-[#707070]"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      height={600}
      header={
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
            {isEdit ? t("edit") : t("ref_add_schedule")}
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
          {/* Jadval nomi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("ref_name_schedule")}</label>
            <input
              type="text"
              placeholder={t("ref_ph_schedule")}
              value={name}
              disabled={isEdit && !canEdit}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(false)
              }}
              className={cn(
                "w-full h-12 rounded-xl border-2 bg-white dark:bg-[#171717] px-3.5 text-sm text-[#0A0A0A] dark:text-white outline-none placeholder:text-[#737373] dark:placeholder:text-[#A3A3A3]",
                nameError
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5] dark:border-[#404040] focus:border-gray-300 dark:focus:border-[#707070]",
                isEdit && !canEdit && "opacity-60 cursor-not-allowed"
              )}
            />
            {nameError && <span className="text-xs text-red-500">{t("field_required")}</span>}
          </div>

          {/* Ish jadvali */}
          <div className="flex flex-col gap-3">
            <span className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">{t("ref_t_schedule")}</span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("work_start_time")}</label>
                <input
                  type="time"
                  value={workStart}
                  disabled={isEdit && !canEdit}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className={cn(timeInputClass, isEdit && !canEdit && "opacity-60 cursor-not-allowed")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("work_end_time")}</label>
                <input
                  type="time"
                  value={workEnd}
                  disabled={isEdit && !canEdit}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className={cn(timeInputClass, isEdit && !canEdit && "opacity-60 cursor-not-allowed")}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isEdit && !canEdit}
              onClick={() => setNoLunch((p) => !p)}
              className={cn(
                "flex items-center justify-end gap-2 cursor-pointer self-end",
                isEdit && !canEdit && "opacity-60 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center border transition-colors",
                  noLunch
                    ? "bg-[#171717] dark:bg-white border-[#171717] dark:border-white"
                    : "border-[#D4D4D4] dark:border-[#525252]"
                )}
              >
                {noLunch && <Check size={14} className="text-white dark:text-[#171717]" strokeWidth={3} />}
              </span>
              <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">{t("sch_no_lunch")}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("lunch_start_time")}</label>
                <input
                  type="time"
                  value={noLunch ? "" : lunchStart}
                  disabled={noLunch || (isEdit && !canEdit)}
                  onChange={(e) => setLunchStart(e.target.value)}
                  className={cn(timeInputClass, (noLunch || (isEdit && !canEdit)) && "opacity-50 cursor-not-allowed")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("lunch_end_time")}</label>
                <input
                  type="time"
                  value={noLunch ? "" : lunchEnd}
                  disabled={noLunch || (isEdit && !canEdit)}
                  onChange={(e) => setLunchEnd(e.target.value)}
                  className={cn(timeInputClass, (noLunch || (isEdit && !canEdit)) && "opacity-50 cursor-not-allowed")}
                />
              </div>
            </div>

            {/* Ish kunlari */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("work_days")}</label>
              <div className="flex items-center justify-between bg-[#F0F0F0] dark:bg-[#404040] p-1 rounded-lg w-full gap-1">
                {WEEK_DAYS.map((d) => {
                  const active = days.has(d.day_number)
                  const disabled = isEdit && !canEdit
                  return (
                    <button
                      key={d.day_number}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && toggleDay(d.day_number)}
                      className={cn(
                        "flex-1 py-2.5 text-[13px] font-medium text-center rounded-md transition-all",
                        active
                          ? "bg-white dark:bg-[#171717] text-[#0A0A0A] dark:text-white shadow-sm"
                          : "text-[#737373] dark:text-[#A3A3A3]",
                        disabled ? "cursor-not-allowed" : "cursor-pointer hover:text-[#0A0A0A] dark:hover:text-white"
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 sticky bottom-0 bg-white dark:bg-[#171717] border-t border-[#F0F0F0] dark:border-[#1F1F1F]">
          {canDelete && isEdit && (
            <button
              type="button"
              onClick={() => onDelete(scheduleData)}
              disabled={deleteLoading}
              className={cn(
                "px-5 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                deleteLoading ? "bg-red-300 cursor-default" : "bg-red-500 hover:bg-red-600 cursor-pointer"
              )}
            >
              <Trash2 size={18} />
              {t("delete") || "O'chirish"}
            </button>
          )}

          {(!isEdit || canEdit) && (
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
              {isEdit ? t("save") : t("ref_add_schedule")}
            </button>
          )}
        </div>
      </div>

      <Toast key={toast.seq} open={toast.open} message={toast.message} onClose={() => setToast((p) => ({ ...p, open: false }))} />
    </Modal>
  )
}