import { useEffect, useMemo, useRef, useState } from "react"
import { useLanguage } from "@/Context/LanguageContext"
import { useTheme } from "@/Context/ThemeContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { MapPin, MapPinned, Trash2, X, Crosshair, AlertTriangle } from "lucide-react"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/Toast"

const RADIUS_MIN = 50
const RADIUS_MAX = 500

// zone_type enum -> tarjima kaliti
const ZONE_TYPES = [
  { value: "main_office", key: "zt_main_office" },
  { value: "region_branch", key: "zt_region_branch" },
  { value: "district_branch", key: "zt_district_branch" },
  { value: "special_object", key: "zt_special_object" },
  { value: "temp_object", key: "zt_temp_object" },
]

// Backend koordinata patterni: ≤3 butun, ≤7 kasr (vergul ham qabul qilamiz)
const COORD_RE = /^-?\d{1,3}(?:\.\d{1,7})?$/

// Backend xato javobidan o'qiladigan xabarni ajratib olish
// API javob shakli: { success, data, error: { errorMsg, details } }
const getErrMsg = (err, fallback) => {
  const e = err?.response?.data?.error
  const d = e?.details
  if (d && typeof d === "object") {
    const first = Object.values(d)[0]
    if (Array.isArray(first) && first.length) return String(first[0])
    if (typeof first === "string") return first
  }
  return e?.errorMsg || fallback
}

// Koordinatani 4 xona aniqlikda formatlash
const fmtCoord = (lat, lng) => {
  const a = Number(lat)
  const b = Number(lng)
  if (Number.isNaN(a) || Number.isNaN(b)) return "—"
  return `${a.toFixed(4)}, ${b.toFixed(4)}`
}

// ─── Radius slider (detail + modal'da qayta ishlatiladi) ───
const RadiusSlider = ({ value, onChange, theme }) => {
  const percent = ((value - RADIUS_MIN) / (RADIUS_MAX - RADIUS_MIN)) * 100
  const fill = theme === "dark" ? "#F5F5F5" : "#171717"
  const track = theme === "dark" ? "#404040" : "#E5E5E5"
  return (
    <input
      type="range"
      min={RADIUS_MIN}
      max={RADIUS_MAX}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        background: `linear-gradient(to right, ${fill} 0%, ${fill} ${percent}%, ${track} ${percent}%, ${track} 100%)`,
      }}
      className={cn(
        "w-full h-1.5 appearance-none cursor-pointer rounded-full outline-none",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#171717] dark:[&::-webkit-slider-thumb]:border-[#F5F5F5] [&::-webkit-slider-thumb]:shadow-sm",
        "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#171717] dark:[&::-moz-range-thumb]:border-[#F5F5F5]"
      )}
    />
  )
}

// ─── Markaz + radius doirasi vizualizatsiyasi ───
const ZoneCircle = ({ lat, lng, radius, theme, t }) => {
  // 50m -> 90px, 500m -> 250px
  const diameter = Math.round(90 + ((radius - RADIUS_MIN) / (RADIUS_MAX - RADIUS_MIN)) * 160)
  const gridStyle =
    theme === "dark"
      ? {
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }
      : {}

  return (
    <div
      className="relative w-full h-[300px] rounded-2xl overflow-hidden bg-[#F5F5F5] dark:bg-[#1F1F1F] flex items-center justify-center"
      style={gridStyle}
    >
      {/* Koordinata pill */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1.5 text-[13px] font-medium text-[#0A0A0A] dark:text-white shadow-sm">
        <Crosshair size={14} className="text-[#0090FF]" />
        {fmtCoord(lat, lng)}
      </div>

      {/* Doira */}
      <div
        className="rounded-full flex items-center justify-center border-2 border-[#0090FF] bg-[#0090FF]/10 dark:bg-[#5EB1EF]/15 transition-all duration-200"
        style={{ width: diameter, height: diameter }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#0090FF]" />
      </div>

      {/* Radius label */}
      <div className="absolute bottom-3 right-3 rounded-lg bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1.5 text-[13px] font-medium text-[#0A0A0A] dark:text-white shadow-sm">
        {radius} {t("gz_meter")}
      </div>
    </div>
  )
}

const Geozones = () => {
  const { t } = useLanguage()
  const { theme } = useTheme()

  const [geozones, setGeozones] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const [branches, setBranches] = useState([])

  const [detailRadius, setDetailRadius] = useState(RADIUS_MIN)
  const [saving, setSaving] = useState(false)

  const [addModal, setAddModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: "",
    zone_type: null,
    latitude: "",
    longitude: "",
    radius: RADIUS_MIN,
    branch: null,
  })

  const [deleteTarget, setDeleteTarget] = useState(null) // o'chiriladigan geozona obyekti
  const [deleting, setDeleting] = useState(false)

  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) =>
    setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

  // Filial id -> nom
  const branchMap = useMemo(() => {
    const m = {}
    branches.forEach((b) => { m[b.value] = b.label })
    return m
  }, [branches])

  const zoneTypeOptions = useMemo(
    () => ZONE_TYPES.map((z) => ({ value: z.value, label: t(z.key) })),
    [t]
  )
  const ztLabel = (val) => {
    const found = ZONE_TYPES.find((z) => z.value === val)
    return found ? t(found.key) : "—"
  }

  const selected = useMemo(
    () => geozones.find((g) => g.id === selectedId) || null,
    [geozones, selectedId]
  )

  // ─── Yuklashlar ───
  const fetchGeozones = async (selectId) => {
    setLoading(true)
    try {
      const res = await axiosAPI.get("attendance/geozones/")
      if (res.status === 200) {
        const list = res.data?.data?.results || []
        setGeozones(list)
        // tanlovni o'rnatish
        setSelectedId((prev) => {
          if (selectId && list.some((g) => g.id === selectId)) return selectId
          if (prev && list.some((g) => g.id === prev)) return prev
          return list[0]?.id ?? null
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const res = await axiosAPI.get("users/branches/")
      if (res.status === 200) {
        setBranches(
          (res.data?.data?.results || res.data?.results || []).map((b) => ({
            value: b.id,
            label: b.name,
          }))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchGeozones()
    fetchBranches()
  }, [])

  // Tanlov o'zgarganda radiusni sinxronlash
  const lastSyncedId = useRef(null)
  useEffect(() => {
    if (selected && selected.id !== lastSyncedId.current) {
      setDetailRadius(selected.radius ?? RADIUS_MIN)
      lastSyncedId.current = selected.id
    }
  }, [selected])

  // ─── Saqlash (radius PATCH) ───
  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await axiosAPI.patch(`attendance/geozones/${selected.id}/`, {
        radius: detailRadius,
      })
      if (res.status === 200) {
        setGeozones((prev) =>
          prev.map((g) => (g.id === selected.id ? { ...g, radius: detailRadius } : g))
        )
        showToast(t("gz_updated"))
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setSaving(false)
    }
  }

  // ─── Yangi geozona qo'shish ───
  const resetForm = () =>
    setForm({ name: "", zone_type: null, latitude: "", longitude: "", radius: RADIUS_MIN, branch: null })

  const handleCreate = async () => {
    // vergulni nuqtaga almashtirib, bo'sh joylarni olib tashlaymiz
    const lat = String(form.latitude).trim().replace(",", ".")
    const lng = String(form.longitude).trim().replace(",", ".")

    if (!form.name.trim() || !form.zone_type || !lat || !lng) {
      showToast(t("gz_validation"))
      return
    }
    // Backend pattern: ≤3 butun raqam, ≤7 kasr
    if (!COORD_RE.test(lat) || !COORD_RE.test(lng)) {
      showToast(t("gz_coord_invalid"))
      return
    }

    setCreating(true)
    try {
      const payload = {
        name: form.name.trim(),
        zone_type: form.zone_type,
        latitude: lat,
        longitude: lng,
        radius: Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, Number(form.radius) || RADIUS_MIN)),
      }
      // branch faqat tanlangan bo'lsa yuboriladi (null yubormaymiz)
      if (form.branch) payload.branch = form.branch

      const res = await axiosAPI.post("attendance/geozones/", payload)
      if (res.status === 201 || res.status === 200) {
        const newId = res.data?.data?.id
        setAddModal(false)
        resetForm()
        await fetchGeozones(newId)
        showToast(t("gz_created"))
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setCreating(false)
    }
  }

  // ─── O'chirish ───
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await axiosAPI.delete(`attendance/geozones/${deleteTarget.id}/`)
      if (res.status === 204 || res.status === 200) {
        setGeozones((prev) => {
          const next = prev.filter((g) => g.id !== deleteTarget.id)
          setSelectedId((cur) => (cur === deleteTarget.id ? next[0]?.id ?? null : cur))
          return next
        })
        setDeleteTarget(null)
        showToast(t("gz_deleted"))
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setDeleting(false)
    }
  }

  const radiusDirty = selected && detailRadius !== (selected.radius ?? RADIUS_MIN)

  return (
    <div className="p-4 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between w-full gap-4 flex-wrap">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t("geozone")}</h1>
          <span className="text-[#737373] text-sm">{t("gz_subtitle")}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#262626] px-4 py-2 text-sm font-medium text-[#0A0A0A] dark:text-white shadow-xs cursor-pointer hover:bg-[#EFEFEF] dark:hover:bg-[#2E2E2E]"
          >
            {t("gz_new")}
          </button>
          <button
            type="button"
            onClick={() => setAddModal(true)}
            title={t("gz_new")}
            className="p-2.5 shadow-xs rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center cursor-pointer hover:bg-[#EFEFEF] dark:hover:bg-[#2E2E2E]"
          >
            <MapPinned size={16} />
          </button>
        </div>
      </div>

      {/* ─── Body: list + detail ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">

        {/* ── Chap: ro'yxat ── */}
        <div className="flex flex-col gap-2.5 h-[calc(100vh-180px)] overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[74px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse border border-[#E5E7EB] dark:border-[#2E2E2E] flex-shrink-0"
              />
            ))
          ) : geozones.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-full text-[#737373]">
              <MapPin size={28} strokeWidth={1.5} />
              <span className="text-sm">{t("gz_empty")}</span>
            </div>
          ) : (
            geozones.map((g) => {
              const active = g.id === selectedId
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedId(g.id)}
                  className={cn(
                    "group flex items-center gap-3 w-full text-left rounded-2xl border p-3.5 transition-colors flex-shrink-0 cursor-pointer",
                    active
                      ? "border-[#D4D4D4] dark:border-[#525252] bg-[#FAFAFA] dark:bg-[#1A1A1A] shadow-sm"
                      : "border-[#E5E7EB] dark:border-[#2E2E2E] hover:bg-[#FAFAFA] dark:hover:bg-[#141414]"
                  )}
                >
                  {/* Ikona */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      active ? "bg-white dark:bg-[#262626] shadow-sm" : "bg-[#F5F5F5] dark:bg-[#1F1F1F]"
                    )}
                  >
                    <MapPin size={18} className="text-[#0A0A0A] dark:text-white" />
                  </div>

                  {/* Nom + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#0A0A0A] dark:text-white truncate">
                      {g.name}
                    </p>
                    <p className="text-[13px] text-[#737373] truncate">
                      {ztLabel(g.zone_type)} - {g.radius} {t("gz_meter_short")}
                    </p>
                  </div>

                  {/* Radio */}
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      active ? "border-[#0090FF]" : "border-[#D4D4D4] dark:border-[#525252]"
                    )}
                  >
                    {active && <span className="w-2.5 h-2.5 rounded-full bg-[#0090FF]" />}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* ── O'ng: detail ── */}
        <div className="lg:sticky lg:top-0 h-fit">
          {!selected ? (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#2E2E2E] p-10 flex flex-col items-center justify-center gap-2 text-[#737373] min-h-[400px]">
              <MapPin size={28} strokeWidth={1.5} />
              <span className="text-sm">{t("gz_select_hint")}</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#2E2E2E] p-5 flex flex-col gap-5 bg-white dark:bg-[#0F0F0F]">

              {/* Header: nom + o'chirish */}
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-white truncate">
                  {selected.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selected)}
                  title={t("gz_delete")}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[#737373] hover:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#2A1416] transition-colors cursor-pointer flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Circle */}
              <ZoneCircle
                lat={selected.latitude}
                lng={selected.longitude}
                radius={detailRadius}
                theme={theme}
                t={t}
              />

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <p className="text-[13px] text-[#737373] mb-1">{t("gz_field_name")}</p>
                  <p className="text-[15px] font-medium text-[#0A0A0A] dark:text-white truncate">
                    {selected.name}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-[#737373] mb-1">{t("gz_attached_branch")}</p>
                  <p className="text-[15px] font-medium text-[#0A0A0A] dark:text-white truncate">
                    {branchMap[selected.branch] || t("gz_no_branch")}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-[#737373] mb-1">{t("gz_center_coord")}</p>
                  <p className="text-[15px] font-medium text-[#0A0A0A] dark:text-white tabular-nums">
                    {fmtCoord(selected.latitude, selected.longitude)}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-[#737373] mb-1">{t("gz_attached_workers")}</p>
                  <p className="text-[15px] font-medium text-[#0A0A0A] dark:text-white">
                    {selected.workers_count ?? 0} {t("gz_workers_unit")}
                  </p>
                </div>
              </div>

              {/* Radius slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#0A0A0A] dark:text-white">Radius</span>
                  <span className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white tabular-nums">
                    {detailRadius} {t("gz_meter")}
                  </span>
                </div>
                <RadiusSlider value={detailRadius} onChange={setDetailRadius} theme={theme} />
                <div className="flex items-center justify-between text-[13px] text-[#737373]">
                  <span>{RADIUS_MIN} {t("gz_meter_short")}</span>
                  <span>{RADIUS_MAX} {t("gz_meter_short")}</span>
                </div>
              </div>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !radiusDirty}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-semibold text-white transition-colors",
                  saving || !radiusDirty
                    ? "bg-[#7EC0FF] cursor-default"
                    : "bg-[#0090FF] hover:bg-[#007BE0] cursor-pointer"
                )}
              >
                <HugeIcon icon={CheckmarkSquare01Icon} size={18} />
                {t("gz_save")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Yangi geozona modali ─── */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        height={640}
        header={
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t("gz_new")}</h2>
            <button
              type="button"
              onClick={() => setAddModal(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer text-[#0A0A0A] dark:text-white"
            >
              <X size={20} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            {/* Nomi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("gz_name")}</label>
              <Input
                type="text"
                placeholder={t("gz_name")}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-11 rounded-lg dark:bg-[#171717]"
              />
            </div>

            {/* Turi */}
            <Select
              label={`${t("gz_type")}*`}
              placeholder={t("gz_type_ph")}
              options={zoneTypeOptions}
              value={form.zone_type}
              onChange={(opt) => setForm((p) => ({ ...p, zone_type: opt?.value ?? null }))}
            />

            {/* Koordinatalar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("gz_lat")}</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="41.48258"
                  value={form.latitude}
                  onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                  className="w-full h-11 rounded-lg dark:bg-[#171717]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("gz_lng")}</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="69.00420"
                  value={form.longitude}
                  onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                  className="w-full h-11 rounded-lg dark:bg-[#171717]"
                />
              </div>
            </div>

            {/* Radius */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("gz_radius")}</label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={RADIUS_MIN}
                  max={RADIUS_MAX}
                  value={form.radius}
                  onChange={(e) => {
                    let v = Number(e.target.value)
                    if (Number.isNaN(v)) v = RADIUS_MIN
                    v = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, v))
                    setForm((p) => ({ ...p, radius: v }))
                  }}
                  className="w-20 h-11 rounded-lg dark:bg-[#171717] text-center"
                />
                <div className="flex-1">
                  <RadiusSlider
                    value={form.radius}
                    onChange={(v) => setForm((p) => ({ ...p, radius: v }))}
                    theme={theme}
                  />
                </div>
                <span className="text-[13px] text-[#737373]">{t("gz_meter")}</span>
              </div>
            </div>

            {/* Filial */}
            <Select
              label={t("col_branch")}
              placeholder={t("select_branch")}
              options={branches}
              value={form.branch}
              onChange={(opt) => setForm((p) => ({ ...p, branch: opt?.value ?? null }))}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-4">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className={cn(
                "px-5 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                creating ? "bg-[#7EC0FF] cursor-default" : "bg-[#0090FF] hover:bg-[#007BE0] cursor-pointer"
              )}
            >
              <HugeIcon icon={CheckmarkSquare01Icon} size={18} />
              {t("gz_add_btn")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── O'chirishni tasdiqlash ─── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        width={420}
        height="auto"
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] dark:bg-[#2A1416] flex items-center justify-center">
            <AlertTriangle size={22} className="text-[#EF4444]" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-white">{t("gz_delete_title")}</h3>
            <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">{t("gz_delete_confirm")}</p>
            {deleteTarget && (
              <p className="text-sm font-medium text-[#0A0A0A] dark:text-white mt-1 truncate">
                {deleteTarget.name}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#0A0A0A] dark:text-white border border-[#E5E7EB] dark:border-[#2E2E2E] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] cursor-pointer disabled:opacity-60"
            >
              {t("gz_cancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 flex items-center gap-2 rounded-lg text-sm font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] cursor-pointer disabled:opacity-70"
            >
              <Trash2 size={16} />
              {t("gz_delete")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Toast ─── */}
      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}

export default Geozones
