// src/pages/FaceIdHistory.jsx
import { useEffect, useRef, useState, useCallback } from "react"

// import qo'shish
import * as XLSX from "xlsx-js-style"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { ExportMenu } from "@/components/ui/ExportMenu"

import dayjs from "dayjs"
import { ArrowLeft, ChevronDownIcon, X, CheckCircle2, XCircle } from "lucide-react"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { Calendar02Icon, Download01Icon, FilterVerticalIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { DatePicker } from "@/components/ui/DatePicker"
import Toast from "@/components/ui/Toast"

// NOTE: bu endpoint nomlarini loyihadagi haqiqiy region/district/branch
// ro'yxat endpointlariga moslab o'zgartiring (hozircha taxminiy nomlar)
const REGION_ENDPOINT = "users/regions/"
const DISTRICT_ENDPOINT = "users/districts/"
const BRANCH_ENDPOINT = "users/branches/"

// Backend'dagi `is_success` qiymatlari — tarjima orqali
const STATUS_OPTIONS_KEYS = [
  { value: "true", labelKey: "status_success" },   // Ishonchli
  { value: "false", labelKey: "status_failed" },    // Shubhali
]

// ─── Detail modal uchun ko'rsatish maydonlari (disabled ko'rinishda) ───
const DetailField = ({ label, value, className }) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <span className="text-sm text-[#0A0A0A] dark:text-white">{label}</span>
    <div title={value} className="h-11 px-3.5 flex items-center rounded-lg border border-[#E5E5E5] dark:border-[#404040] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-sm text-[#737373] dark:text-[#A3A3A3] truncate">
      {value ?? "—"}
    </div>
  </div>
)

const FaceIdHistory = () => {
  const { t, language } = useLanguage()

  const [logs, setLogs] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)       // birinchi yuklash
  const [loadingMore, setLoadingMore] = useState(false) // scroll pagination
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const searchTimer = useRef(null)

  const tableContainerRef = useRef(null)

  // Committed filtrlar
  const [filterRegion, setFilterRegion] = useState(null)   // { value, label }
  const [filterDistrict, setFilterDistrict] = useState(null)
  const [filterBranch, setFilterBranch] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)

  // Modal ichidagi vaqtinchalik filtrlar
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [tmpRegion, setTmpRegion] = useState(null)
  const [tmpDistrict, setTmpDistrict] = useState(null)
  const [tmpBranch, setTmpBranch] = useState(null)
  const [tmpStatus, setTmpStatus] = useState(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")

  const hasFilter = !!(filterRegion || filterDistrict || filterBranch || filterStatus || filterStartDate || filterEndDate)

  const STATUS_OPTIONS = STATUS_OPTIONS_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }))

  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  // ─── Viloyat / Tuman / Filial ro'yxatlari (filter modal uchun) ───
  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [branches, setBranches] = useState([])

  const showToast = (message) =>
    setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

  // ─── Qator tafsiloti (detail) modal ───
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState(null)

  const openDetail = async (id) => {
    setDetailOpen(true)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await axiosAPI.get(`attendance/face-logs/${id}/`)
      if (res.status === 200) {
        setDetail(res.data?.data || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setDetail(null)
  }

  const fetchRegions = async () => {
    try {
      const res = await axiosAPI.get(REGION_ENDPOINT)
      if (res.status === 200) {
        const results = res.data?.data?.results || res.data?.data || []
        setRegions(results.map((r) => ({ value: r.id, label: r.name })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDistricts = async (regionId) => {
    try {
      const params = regionId ? { region: regionId } : {}
      const res = await axiosAPI.get(DISTRICT_ENDPOINT, { params })
      if (res.status === 200) {
        const results = res.data?.data?.results || res.data?.data || []
        setDistricts(results.map((d) => ({ value: d.id, label: d.name })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBranches = async (districtId) => {
    try {
      const params = districtId ? { district: districtId } : {}
      const res = await axiosAPI.get(BRANCH_ENDPOINT, { params })
      if (res.status === 200) {
        const results = res.data?.data?.results || res.data?.data || []
        setBranches(results.map((b) => ({ value: b.id, label: b.name })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ─── Loglarni yuklash ───
  const fetchLogs = async (pageNum = 1, extraParams = {}) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = {
        page: pageNum,
        search: search || undefined,
        region: filterRegion?.value || undefined,
        district: filterDistrict?.value || undefined,
        branch: filterBranch?.value || undefined,
        is_success: filterStatus?.value || undefined,
        start_date: filterStartDate || undefined,
        end_date: filterEndDate || undefined,
        ...extraParams,
      }
      const res = await axiosAPI.get("attendance/face-logs/", { params })
      if (res.status === 200) {
        const data = res.data?.data || {}
        const results = data.results || []
        setLogs((prev) => (pageNum === 1 ? results : [...prev, ...results]))
        setCount(data.count || 0)
        setHasMore(!!data.next)
        setPage(pageNum)
      }
    } catch (err) {
      console.error(err)
      if (pageNum === 1) {
        setLogs([])
        setCount(0)
        setHasMore(false)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterRegion, filterDistrict, filterBranch, filterStatus, filterStartDate, filterEndDate])

  // ─── Scroll pagination ───
  const handleScroll = useCallback(() => {
    const el = tableContainerRef.current
    if (!el || loading || loadingMore || !hasMore) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      fetchLogs(page + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore, hasMore, page, search, filterRegion, filterDistrict, filterBranch, filterStatus, filterStartDate, filterEndDate])

  useEffect(() => {
    const el = tableContainerRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll)
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // ─── Qidiruv (debounce) ───
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(e.target.value)
    }, 400)
  }

  // ─── Filter modal ───
  const openFilter = () => {
    setTmpRegion(filterRegion)
    setTmpDistrict(filterDistrict)
    setTmpBranch(filterBranch)
    setTmpStatus(filterStatus)
    fetchRegions()
    fetchDistricts(filterRegion?.value)
    fetchBranches(filterDistrict?.value)
    setOpenFilterModal(true)
  }

  const applyFilter = () => {
    setFilterRegion(tmpRegion)
    setFilterDistrict(tmpDistrict)
    setFilterBranch(tmpBranch)
    setFilterStatus(tmpStatus)
    setFilterStartDate(startDate)
    setFilterEndDate(endDate)
    setOpenFilterModal(false)
  }

  const clearFilter = () => {
    setTmpRegion(null)
    setTmpDistrict(null)
    setTmpBranch(null)
    setTmpStatus(null)
    setFilterRegion(null)
    setFilterDistrict(null)
    setFilterBranch(null)
    setStartDate("")
    setEndDate("")
    setFilterStartDate("")
    setFilterEndDate("")
  }

  // Viloyat o'zgarganda tumanlarni qayta yuklash
  const handleRegionChange = (opt) => {
    setTmpRegion(opt)
    setTmpDistrict(null)
    setTmpBranch(null)
    setDistricts([])
    setBranches([])
    fetchDistricts(opt?.value)
  }

  // Tuman o'zgarganda filiallarni qayta yuklash
  const handleDistrictChange = (opt) => {
    setTmpDistrict(opt)
    setTmpBranch(null)
    setBranches([])
    fetchBranches(opt?.value)
  }

  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)
  useEffect(() => {
    const fn = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  // ── konstantalar (komponent tashqarisida) ──
  const BORDER = { top: { style: "thin", color: { rgb: "D4D4D4" } }, bottom: { style: "thin", color: { rgb: "D4D4D4" } }, left: { style: "thin", color: { rgb: "D4D4D4" } }, right: { style: "thin", color: { rgb: "D4D4D4" } } }

  // ── komponent ichida ──
  const buildExport = () => {
    const headers = [
      "#",
      t("col_employee") || "Xodim",
      t("region") || "Viloyat",
      t("district") || "Tuman",
      t("branch") || "Filial",
      t("status") || "Holat",
      t("col_time") || "Yaratilgan vaqti",
    ]
    const body = logs.map((r, i) => [
      i + 1,
      r.user_info?.full_name || "—",
      r.region_info?.name || r?.region || "",
      r.district_info?.name || r?.district || "",
      r.branch_info?.name || r?.branch || "",
      r.is_success ? (t("status_success") || "Ishonchli") : (t("status_failed") || "Shubhali"),
      r.created_at ? dayjs(r.created_at).format("DD.MM.YYYY HH:mm") : "",
    ])
    return { headers, body }
  }

  const exportExcel = () => {
    if (!logs.length) return showToast(t("export_empty_warning"))
    const { headers, body } = buildExport()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...body])
    ws["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }]
    ws["!rows"] = [{ hpt: 28 }, ...body.map(() => ({ hpt: 22 }))]
    headers.forEach((_, c) => {
      const ref = XLSX.utils.encode_cell({ r: 0, c })
      if (!ws[ref]) ws[ref] = { t: "s", v: headers[c] }
      ws[ref].s = { fill: { patternType: "solid", fgColor: { rgb: "F0F0F0" } }, font: { bold: true, sz: 10, color: { rgb: "0A0A0A" }, name: "Calibri" }, alignment: { vertical: "center", horizontal: c === 0 ? "center" : "left" }, border: BORDER }
    })
    body.forEach((_, rowIdx) => {
      headers.forEach((__, c) => {
        const ref = XLSX.utils.encode_cell({ r: rowIdx + 1, c })
        if (!ws[ref]) ws[ref] = { t: "s", v: "" }
        ws[ref].s = { fill: { patternType: "solid", fgColor: { rgb: rowIdx % 2 === 1 ? "FAFAFA" : "FFFFFF" } }, font: { sz: 10, color: { rgb: "1A1A1A" }, name: "Calibri" }, alignment: { vertical: "center", horizontal: c === 0 ? "center" : "left" }, border: BORDER }
      })
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "FaceID")
    XLSX.writeFile(wb, "faceid-tarixi.xlsx", { bookType: "xlsx", cellStyles: true })
    showToast(t("export_excel_success"))
  }

  const exportPDF = () => {
    if (!logs.length) return showToast(t("export_empty_warning"))
    const { headers, body } = buildExport()
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(10, 10, 10)
    doc.text(t("face_id_history") || "FaceID Tarixi", 14, 14)
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(115, 115, 115)
    doc.text(dayjs().format("DD.MM.YYYY HH:mm"), 14, 21)
    autoTable(doc, {
      head: [headers], body,
      startY: 27, margin: { left: 14, right: 14 },
      styles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, lineColor: [212, 212, 212], lineWidth: 0.2, font: "helvetica", textColor: [26, 26, 26] },
      headStyles: { fillColor: [240, 240, 240], textColor: [10, 10, 10], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      bodyStyles: { fillColor: [255, 255, 255] },
      columnStyles: { 0: { halign: "center", cellWidth: 10 }, 1: { cellWidth: 40 } },
    })
    const pc = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pc; i++) {
      doc.setPage(i)
      doc.setFontSize(7.5).setTextColor(160, 160, 160)
      doc.text(`${i} / ${pc}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" })
    }
    doc.save("faceid-tarixi.pdf")
    showToast(t("export_pdf_success"))
  }

  const exportCSV = () => {
    if (!logs.length) return showToast(t("export_empty_warning"))
    const { headers, body } = buildExport()
    const escape = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s }
    const csv = "\uFEFF" + [headers, ...body].map(r => r.map(escape).join(",")).join("\r\n")
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })), download: "faceid-tarixi.csv" })
    a.click(); URL.revokeObjectURL(a.href)
    showToast(t("export_csv_success"))
  }

  const COLS = 7

  return (
    <div className="p-4 flex flex-col gap-5 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">
      {/* ─── Filters row ─── */}
      <div className="flex items-center justify-between w-full gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder={t("search") || "Qidirish..."}
            className="h-8.5! rounded-md w-[320px] shadow-sm border-[#e5e5e5] dark:border-[#404040]! dark:bg-[#0a0a0a]!"
          />

          <button
            type="button"
            className="flex items-center gap-1 cursor-pointer relative border-[1.7px] text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3 text-[#0A0A0A] dark:text-white"
            onClick={openFilter}
          >
            {hasFilter && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]"></span>}
            <HugeIcon icon={FilterVerticalIcon} size={16} />
            {t("filter")}
          </button>
        </div>

        {/* Yuklash (eksport) */}
        <ExportMenu onExcel={exportExcel} onPDF={exportPDF} onCSV={exportCSV} label={t("upload") || "Yuklash"} />
      </div>

      {/* ─── Jadval ─── */}
      <div className="w-full overflow-hidden">
        <div ref={tableContainerRef} className="h-[calc(100vh-145px)] overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#FAFAFA] dark:bg-[#262626] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                {[
                  { label: "#", cls: "w-12" },
                  { label: t("col_employee") || "Xodim" },
                  { label: t("region") || "Viloyat" },
                  { label: t("district") || "Tuman" },
                  { label: t("branch") || "Filial" },
                  { label: t("status") || "Holat" },
                  { label: t("col_time") || "Yaratilgan vaqti", cls: "text-end" },
                ].map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-4 py-3.5 text-[13px] font-medium text-[#0A0A0A] dark:text-[#f5f5f5] whitespace-nowrap",
                      h.cls
                    )}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F0F0F0] dark:border-[#1A1A1A]">
                    {Array.from({ length: COLS }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-5 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={COLS} className="px-4 py-16 text-center text-sm text-[#737373]">
                    {t("no_data_found") || "Ma'lumot topilmadi"}
                  </td>
                </tr>
              ) : (
                <>
                  {logs.map((log, i) => (
                    <tr
                      key={log.id}
                      onClick={() => openDetail(log.id)}
                      className={cn(
                        "border-b border-[#F0F0F0] dark:border-[#1A1A1A] hover:opacity-90 cursor-pointer",
                        log.is_success
                          ? "hover:bg-[#FAFAFA] dark:hover:bg-[#111]"
                          : "bg-[#FFDBDC] dark:bg-[#2A1414] hover:bg-[#FEE2E2] dark:hover:bg-[#321818]"
                      )}
                    >
                      <td className="px-4 py-3.5 text-sm font-medium dark:text-[#f5f5f5]">{i + 1}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                        {log.user_info?.full_name || ""}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                        {log.region?.name || log?.region || ""}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                        {log.district?.name || log?.district || ""}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                        {log.branch?.name || log?.branch || ""}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium">
                        {log.is_success ? (
                          <span className="inline-flex items-center gap-1 text-[#16A34A]">
                            <CheckCircle2 size={15} />
                            {t("status_success") || "Ishonchli"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#DC2626]" title={log.message}>
                            <XCircle size={15} />
                            {t("status_failed") || "Shubhali"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-end font-medium text-[#0A0A0A] dark:text-[#f5f5f5] tabular-nums whitespace-nowrap">
                        {log.created_at ? dayjs(log.created_at).format("DD.MM.YYYY HH:mm") : ""}
                      </td>
                    </tr>
                  ))}

                  {/* Scroll pagination loading indikatori */}
                  {loadingMore && (
                    <tr>
                      <td colSpan={COLS} className="px-4 py-4 text-center">
                        <div className="w-6 h-6 mx-auto border-3 border-[#0090FF] border-t-transparent rounded-full animate-spin" />
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Filter modal ─── */}
      <Modal
        isOpen={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
        height={600}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="w-11 h-11 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition dark:hover:bg-[#0a0a0a]"
                  onClick={() => setOpenFilterModal(false)}
                >
                  <ArrowLeft size={24} />
                </span>
                <h1 className="text-2xl font-semibold">{t("filter_title")}</h1>
              </div>
              <span className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                {t("filter_subtitle")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <DatePicker
                currentLang={language}
                label={t("start_date")}
                placeholder={t("gz_date_time_ph")}
                widthClass="w-full"
                className="w-full"
                inputClassName="h-11! dark:bg-transparent!"
                value={startDate}
                onChange={(d) => setStartDate(d)}
                labelClassName="text-[#737373]! dark:text-[#A3A3A3]! font-normal"
                calendarIcon={startDate ? <span className=" cursor-pointer" onClick={(e) => { e.stopPropagation(); setStartDate("") }}><X size={18} /></span> : <HugeIcon icon={Calendar02Icon} size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />}
                showTime
              />

              <DatePicker
                currentLang={language}
                label={t("end_date")}
                placeholder={t("gz_date_time_ph")}
                widthClass="w-full"
                className="w-full"
                inputClassName="h-11! dark:bg-transparent!"
                value={endDate}
                onChange={(d) => setEndDate(d)}
                labelClassName="text-[#737373]! dark:text-[#A3A3A3]! font-normal"
                calendarIcon={endDate ? <span className=" cursor-pointer" onClick={(e) => { e.stopPropagation(); setEndDate("") }}><X size={18} /></span> : <HugeIcon icon={Calendar02Icon} size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />}
                showTime
              />

              {/* Viloyat */}
              <Select
                label={t("region") || "Viloyat"}
                placeholder={t("gz_region_ph") || "Viloyat tanlang"}
                options={regions}
                value={tmpRegion?.value ?? null}
                onChange={handleRegionChange}
                searchable={true}
              />

              {/* Tuman */}
              <Select
                label={t("district") || "Tuman"}
                placeholder={t("gz_district_ph") || "Tuman tanlang"}
                options={districts}
                value={tmpDistrict?.value ?? null}
                onChange={handleDistrictChange}
                searchable={true}
                disabled={!tmpRegion}
              />

              {/* Filial */}
              <Select
                label={t("branch") || "Filial"}
                placeholder={t("select_branch") || "Filial tanlang"}
                options={branches}
                value={tmpBranch?.value ?? null}
                onChange={(opt) => setTmpBranch(opt)}
                searchable={true}
                disabled={!tmpDistrict}
              />

              {/* Xabar (holat) */}
              <Select
                label={t("status") || "Xabar"}
                placeholder={t("select_status") || "Xabar tanlang"}
                options={STATUS_OPTIONS}
                value={tmpStatus?.value ?? null}
                onChange={(opt) => setTmpStatus(opt)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer"
              onClick={clearFilter}
            >
              <X size={14} />
              {t("clear")}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg"
              onClick={applyFilter}
            >
              <HugeIcon size={14} icon={Search01Icon} />
              {t("search")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Tafsilot (detail) modal ─── */}
      <Modal
        isOpen={detailOpen}
        onClose={closeDetail}
        height={600}
        header={
          <div className="flex items-center gap-1">
            <span
              className="w-11 h-11 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition dark:hover:bg-[#0a0a0a]"
              onClick={closeDetail}
            >
              <ArrowLeft size={24} />
            </span>
            <h1 className="text-2xl font-semibold">{t("detail_title") || "Foydalanuvchi va so'rov haqida ma'lumot"}</h1>
          </div>
        }
      >
        <div className="flex flex-col justify-between h-full pb-2">
          <div className="flex flex-col gap-4 overflow-y-auto">

            {detailLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-11 rounded-lg bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                ))}
              </div>
            ) : detail && (
              <div className="flex flex-col gap-3">
                <DetailField label={t("col_employee") || "Xodim"} value={detail.user_info?.full_name} />

                <div className="grid grid-cols-2 gap-3">
                  <DetailField label={t("created_at") || "Yaratilgan vaqti"} value={detail.created_at ? dayjs(detail.created_at).format("DD.MM.YYYY HH:mm") : null} />
                  <DetailField label={t("updated_at") || "Yangilangan vaqti"} value={(detail.updated_at || detail.created_at) ? dayjs(detail.updated_at || detail.created_at).format("DD.MM.YYYY HH:mm") : null} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DetailField label={t("status") || "Xolat"} value={detail.is_success ? (t("status_success") || "Ishonchli") : (t("status_failed") || "Shubhali")} />
                  <DetailField label={t("message") || "Xabar"} value={detail.message} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer text-[#0090FF]"
              onClick={closeDetail}
            >
              <X size={14} />
              {t("close") || "Yopish"}
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

export default FaceIdHistory