import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { Plus, X, FileText } from "lucide-react"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/Toast"

// ─── Har bir ma'lumotnoma sahifasi uchun konfiguratsiya ───
// text: oddiy input | select: ro'yxatdan tanlash (optionsEndpoint dan yuklanadi)
// dependsOn + param: ota maydon o'zgarganda qayta yuklanadigan bog'liq select
const REF_CONFIGS = {
  regions: {
    endpoint: "users/regions/",
    titleKey: "ref_t_region",
    addKey: "ref_add_region",
    subKey: "ref_sub_region",
    columns: [{ headerKey: "gz_region", accessor: (r) => r.name }],
    fields: [{ type: "text", name: "name", labelKey: "ref_name_region", phKey: "ref_ph_region", required: true }],
  },
  districts: {
    endpoint: "users/districts/",
    titleKey: "ref_t_district",
    addKey: "ref_add_district",
    subKey: "ref_sub_district",
    columns: [
      { headerKey: "gz_district", accessor: (r) => r.name },
      { headerKey: "gz_region", accessor: (r) => r.region_info?.name || "—" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_district", phKey: "ref_ph_district", required: true },
      { type: "select", name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/", required: true },
    ],
  },
  branches: {
    endpoint: "users/branches/",
    titleKey: "ref_t_branch",
    addKey: "ref_add_branch",
    subKey: "ref_sub_branch",
    columns: [
      { headerKey: "gz_filial", accessor: (r) => r.name },
      { headerKey: "gz_region", accessor: (r) => r.region_info?.name || "—" },
      { headerKey: "gz_district", accessor: (r) => r.district_info?.name || "—" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_branch", phKey: "ref_ph_branch", required: true },
      { type: "select", name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/" },
      { type: "select", name: "district", labelKey: "gz_district", phKey: "gz_district_ph", optionsEndpoint: "users/districts/", dependsOn: "region", param: "region" },
    ],
  },
  departments: {
    endpoint: "users/departments/",
    titleKey: "ref_t_dept",
    addKey: "ref_add_dept",
    subKey: "ref_sub_dept",
    columns: [
      { headerKey: "ref_col_dept", accessor: (r) => r.name },
      { headerKey: "gz_filial", accessor: (r) => r.branch_info?.name || "—" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_dept", phKey: "ref_ph_dept", required: true },
      { type: "select", name: "branch", labelKey: "gz_filial", phKey: "gz_branch_ph", optionsEndpoint: "users/branches/", required: true },
    ],
  },
  positions: {
    endpoint: "users/positions/",
    titleKey: "ref_t_position",
    addKey: "ref_add_position",
    subKey: "ref_sub_position",
    columns: [
      { headerKey: "ref_col_position", accessor: (r) => r.name },
      { headerKey: "ref_col_dept", accessor: (r) => r.department_info?.name || "—" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_position", phKey: "ref_ph_position", required: true },
      { type: "select", name: "department", labelKey: "ref_col_dept", phKey: "ref_dept_ph", optionsEndpoint: "users/departments/", required: true },
    ],
  },
}

const emptyForm = (cfg) => Object.fromEntries(cfg.fields.map((f) => [f.name, f.type === "select" ? null : ""]))

const ReferencePage = () => {
  const { t } = useLanguage()
  const { type } = useParams()
  const config = REF_CONFIGS[type]

  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [addModal, setAddModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({})

  // Select maydonlari uchun variantlar: { fieldName: [{value,label}] }
  const [options, setOptions] = useState({})

  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) => setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

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

  // ─── Ro'yxatni yuklash ───
  const fetchList = async (cfg) => {
    setLoading(true)
    try {
      const res = await axiosAPI.get(cfg.endpoint)
      if (res.status === 200) {
        setRows(res.data?.data?.results || [])
        setCount(res.data?.data?.count ?? (res.data?.data?.results || []).length)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ─── Select variantlarini yuklash ───
  const loadOptions = async (field, parentValue) => {
    try {
      const params = field.dependsOn && parentValue ? { [field.param]: parentValue } : {}
      const res = await axiosAPI.get(field.optionsEndpoint, { params })
      if (res.status === 200) {
        const opts = (res.data?.data?.results || res.data?.results || []).map((o) => ({ value: o.id, label: o.name }))
        setOptions((prev) => ({ ...prev, [field.name]: opts }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Sahifa (type) o'zgarganda hammasini qayta sozlash
  useEffect(() => {
    if (!config) return
    setForm(emptyForm(config))
    setOptions({})
    setRows([])
    fetchList(config)
    // Bog'liq bo'lmagan select'lar variantlarini darhol yuklaymiz
    config.fields
      .filter((f) => f.type === "select" && !f.dependsOn)
      .forEach((f) => loadOptions(f))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  if (!config) {
    // Dizayni hali yo'q bo'limlar (Rollar, Bayramlar, Ish jadvali)
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 w-full min-h-[calc(100vh-3.5rem)] bg-white dark:bg-[#0A0A0A] text-[#737373]">
        <FileText size={32} strokeWidth={1.5} />
        <span className="text-sm">{t("ref_coming_soon")}</span>
      </div>
    )
  }

  const handleFieldChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field.name]: value }
      // Bog'liq select'larni tozalab, qayta yuklaymiz
      config.fields
        .filter((f) => f.dependsOn === field.name)
        .forEach((dep) => {
          next[dep.name] = null
          setOptions((o) => ({ ...o, [dep.name]: [] }))
          if (value) loadOptions(dep, value)
        })
      return next
    })
  }

  const handleCreate = async () => {
    // Majburiy maydonlarni tekshirish
    for (const f of config.fields) {
      if (f.required) {
        const v = form[f.name]
        if (v === null || v === undefined || (typeof v === "string" && !v.trim())) {
          showToast(t("gz_validation"))
          return
        }
      }
    }

    // Payload — bo'sh select'larni yubormaymiz
    const payload = {}
    config.fields.forEach((f) => {
      const v = form[f.name]
      if (f.type === "text") payload[f.name] = String(v).trim()
      else if (v) payload[f.name] = v
    })

    setCreating(true)
    try {
      const res = await axiosAPI.post(config.endpoint, payload)
      if (res.status === 201 || res.status === 200) {
        setAddModal(false)
        setForm(emptyForm(config))
        await fetchList(config)
        showToast(t("ref_created"))
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setCreating(false)
    }
  }

  const colCount = config.columns.length + 1

  return (
    <div className="p-4 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between w-full gap-4 flex-wrap">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t(config.titleKey)}</h1>
          <span className="text-[#737373] text-sm">{t(config.subKey).replace("{n}", count)}</span>
        </div>

        {/* Birlashgan "qo'shish" tugmasi */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="inline-flex items-center h-[38px] rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#262626] px-4 text-sm font-medium text-[#0A0A0A] dark:text-white shadow-xs cursor-pointer hover:bg-[#EFEFEF] dark:hover:bg-[#2E2E2E] transition-colors"
          >
            {t(config.addKey)}
          </button>
          <button
            type="button"
            onClick={() => setAddModal(true)}
            title={t(config.addKey)}
            className="inline-flex items-center justify-center h-[38px] w-[38px] rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#262626] shadow-xs cursor-pointer hover:bg-[#EFEFEF] dark:hover:bg-[#2E2E2E] transition-colors text-[#0A0A0A] dark:text-white"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* ── Jadval ── */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg">
              <th className="px-4 py-3 text-[13px] font-medium text-[#6B7280] dark:text-[#737373] w-16">#</th>
              {config.columns.map((c, i) => (
                <th key={i} className="px-4 py-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white whitespace-nowrap">
                  {t(c.headerKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#F0F0F0] dark:border-[#1F1F1F]">
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-5 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center text-sm text-[#737373]">
                  {t("no_data_found")}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id ?? i} className="border-b border-[#F0F0F0] dark:border-[#1F1F1F] hover:bg-[#FAFAFA] dark:hover:bg-[#111] transition-colors">
                  <td className="px-4 py-3.5 text-sm text-[#737373]">{i + 1}</td>
                  {config.columns.map((c, j) => (
                    <td key={j} className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white">
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Qo'shish modali ── */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        height="auto"
        header={
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t(config.addKey)}</h2>
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
        <div className="flex flex-col gap-4 pb-2">
          {config.fields.map((f, i) => {
            // Maxsus joylashuv: region + district yonma-yon (faqat branches'da)
            if (f.type === "select" && f.dependsOn) return null // pastda juftlikda chiqadi
            const pairDep = config.fields.find((x) => x.dependsOn === f.name)
            if (f.type === "select" && pairDep) {
              return (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <Select
                    label={t(f.labelKey)}
                    placeholder={t(f.phKey)}
                    options={options[f.name] || []}
                    value={form[f.name] ?? null}
                    onChange={(opt) => handleFieldChange(f, opt?.value ?? null)}
                  />
                  <Select
                    label={t(pairDep.labelKey)}
                    placeholder={!form[f.name] ? t("gz_select_region_first") : t(pairDep.phKey)}
                    options={options[pairDep.name] || []}
                    value={form[pairDep.name] ?? null}
                    onChange={(opt) => handleFieldChange(pairDep, opt?.value ?? null)}
                    disabled={!form[f.name]}
                  />
                </div>
              )
            }

            if (f.type === "select") {
              return (
                <Select
                  key={i}
                  label={t(f.labelKey)}
                  placeholder={t(f.phKey)}
                  options={options[f.name] || []}
                  value={form[f.name] ?? null}
                  onChange={(opt) => handleFieldChange(f, opt?.value ?? null)}
                />
              )
            }

            // text
            return (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t(f.labelKey)}</label>
                <Input
                  type="text"
                  placeholder={t(f.phKey)}
                  value={form[f.name] ?? ""}
                  onChange={(e) => handleFieldChange(f, e.target.value)}
                  className="w-full h-11 rounded-lg dark:bg-[#171717]"
                />
              </div>
            )
          })}

          {/* Footer */}
          <div className="flex items-center justify-end pt-2">
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
              {t(config.addKey)}
            </button>
          </div>
        </div>
      </Modal>

      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}

export default ReferencePage
