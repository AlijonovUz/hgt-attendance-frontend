// src/pages/LocationHistory.jsx
import { useEffect, useRef, useState, useCallback } from "react"
import dayjs from "dayjs"
import { ArrowLeft, ChevronDownIcon, X, CheckCircle2, XCircle } from "lucide-react"
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { Calendar02Icon, Download01Icon, FilterVerticalIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { DatePicker } from "@/components/ui/DatePicker"
import * as XLSX from "xlsx-js-style"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { ExportMenu } from "@/components/ui/ExportMenu"

// NOTE: `react-leaflet` va `leaflet` paketlari o'rnatilgan bo'lishi kerak:
//   npm install leaflet react-leaflet
// Xarita uchun Google Maps tile'laridan foydalanilmoqda (API key talab qilmaydi).
const GOOGLE_TILE_URL = "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
const GOOGLE_TILE_SUBDOMAINS = ["mt0", "mt1", "mt2", "mt3"]

// Xodimning GPS nuqtasini ko'rsatadigan joylashuv (location pin) ikonkasi
const createPinIcon = (color = "#16A34A") => L.divIcon({
  className: "",
  html: `
          <svg width="50" height="50" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35));">
               <path d="M18 2C11.373 2 6 7.373 6 14c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="${color}" stroke="#fff" stroke-width="2"/>
               <circle cx="18" cy="14" r="5" fill="#fff"/>
          </svg>
     `,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
})

// ─── Tafsilot ko'rinishi: jadval qatorini bosganda jadval o'rniga shu chiqadi ───
const LocationDetailMap = ({ log, onBack, t }) => {
  const lat = parseFloat(log.latitude)
  const lng = parseFloat(log.longitude)
  const hasCoords = !Number.isNaN(lat) && !Number.isNaN(lng)

  const chips = [
    log.user_info?.full_name,
    log.region?.name,
    log.district?.name,
    log.branch?.name,
    log.created_at ? dayjs(log.created_at).format("DD.MM.YYYY HH:mm") : null,
  ].filter(Boolean)

  return (
    <div className="relative w-full h-[calc(100vh-90px)] rounded-xl overflow-hidden">
      {/* Header chiplar */}
      <div className="absolute top-3 left-12 right-3 z-[1000] flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#1A1A1A] shadow-md border border-[#E5E7EB] dark:border-[#2E2E2E] cursor-pointer"
        >
          <ArrowLeft size={18} className="text-[#0A0A0A] dark:text-white" />
        </button>

        {chips.map((c, i) => (
          <span
            key={i}
            className="px-3 py-1.5 text-sm font-medium rounded-full bg-white dark:bg-[#1A1A1A] shadow-md border border-[#E5E7EB] dark:border-[#2E2E2E] text-[#0A0A0A] dark:text-white whitespace-nowrap"
          >
            {c}
          </span>
        ))}

        <span
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-full bg-white dark:bg-[#1A1A1A] shadow-md border border-[#E5E7EB] dark:border-[#2E2E2E] inline-flex items-center gap-1 whitespace-nowrap",
            log.is_success ? "text-[#16A34A]" : "text-[#DC2626]"
          )}
        >
          {log.is_success ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {log.is_success ? (t("status_success") || "Ishonchli") : (t("status_failed") || "Shubhali")}
        </span>
      </div>

      {/* Xarita */}
      {hasCoords ? (
        <MapContainer
          center={[lat, lng]}
          zoom={17}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            url={GOOGLE_TILE_URL}
            subdomains={GOOGLE_TILE_SUBDOMAINS}
            maxZoom={20}
          />
          <Marker position={[lat, lng]} icon={createPinIcon(log.is_success ? "#16A34A" : "#DC2626")} />
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm text-[#737373] bg-[#FAFAFA] dark:bg-[#1A1A1A]">
          {t("no_data_found") || "Koordinata topilmadi"}
        </div>
      )}
    </div>
  )
}

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

const LocationHistory = () => {
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

  // Bosilgan qator — tanlansa jadval o'rniga xarita ko'rinishi chiqadi
  const [selectedLog, setSelectedLog] = useState(null)

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

  // ─── Viloyat / Tuman / Filial ro'yxatlari (filter modal uchun) ───
  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [branches, setBranches] = useState([])

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
      const res = await axiosAPI.get("attendance/gps-logs/", { params })
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
  }, [handleScroll, selectedLog])

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
    setFilterStatus(null)
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

  const BORDER = { top: { style: "thin", color: { rgb: "D4D4D4" } }, bottom: { style: "thin", color: { rgb: "D4D4D4" } }, left: { style: "thin", color: { rgb: "D4D4D4" } }, right: { style: "thin", color: { rgb: "D4D4D4" } } }

  const buildExport = () => {
    const headers = [
      "#",
      t("col_employee") || "Xodim",
      t("region") || "Viloyat",
      t("district") || "Tuman",
      t("branch") || "Filial",
      t("distance_m") || "Masofa (metr)",
      t("status") || "Holat",
      t("col_time") || "Yaratilgan vaqti",
    ]
    const body = logs.map((r, i) => [
      i + 1,
      r.user_info?.full_name || "—",
      r.region?.name || "",
      r.district?.name || "",
      r.branch?.name || "",
      typeof r.distance_meters === "number" ? r.distance_meters.toFixed(2) : "",
      r.is_success ? (t("status_success") || "Ishonchli") : (t("status_failed") || "Shubhali"),
      r.created_at ? dayjs(r.created_at).format("DD.MM.YYYY HH:mm") : "",
    ])
    return { headers, body }
  }

  const exportExcel = () => {
    if (!logs.length) return
    const { headers, body } = buildExport()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...body])
    ws["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 18 }]
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
    XLSX.utils.book_append_sheet(wb, ws, "Manzil tarixi")
    XLSX.writeFile(wb, "manzil-tarixi.xlsx", { bookType: "xlsx", cellStyles: true })
  }

  const exportPDF = () => {
    if (!logs.length) return
    const { headers, body } = buildExport()
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(10, 10, 10)
    doc.text(t("history_m_location") || "Manzil Tarixi", 14, 14)
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(115, 115, 115)
    doc.text(dayjs().format("DD.MM.YYYY HH:mm"), 14, 21)
    autoTable(doc, {
      head: [headers], body,
      startY: 27, margin: { left: 14, right: 14 },
      styles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, lineColor: [212, 212, 212], lineWidth: 0.2, font: "helvetica", textColor: [26, 26, 26] },
      headStyles: { fillColor: [240, 240, 240], textColor: [10, 10, 10], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      bodyStyles: { fillColor: [255, 255, 255] },
      columnStyles: { 0: { halign: "center", cellWidth: 10 }, 1: { cellWidth: 38 }, 5: { halign: "right" } },
    })
    const pc = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pc; i++) {
      doc.setPage(i)
      doc.setFontSize(7.5).setTextColor(160, 160, 160)
      doc.text(`${i} / ${pc}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" })
    }
    doc.save("manzil-tarixi.pdf")
  }

  const exportCSV = () => {
    if (!logs.length) return
    const { headers, body } = buildExport()
    const escape = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s }
    const csv = "\uFEFF" + [headers, ...body].map(r => r.map(escape).join(",")).join("\r\n")
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })), download: "manzil-tarixi.csv" })
    a.click(); URL.revokeObjectURL(a.href)
  }

  const COLS = 8

  return (
    <div className="p-4 flex flex-col gap-5 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">
      {selectedLog ? (
        <LocationDetailMap log={selectedLog} onBack={() => setSelectedLog(null)} t={t} />
      ) : (
        <>
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
                <thead className="sticky top-0 z-[1]">
                  <tr className="bg-[#FAFAFA] dark:bg-[#262626] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                    {[
                      { label: "#", cls: "w-12" },
                      { label: t("col_employee") || "Xodim" },
                      { label: t("region") || "Viloyat" },
                      { label: t("district") || "Tuman" },
                      { label: t("branch") || "Filial" },
                      { label: t("distance_m") || "Masofa (metr)" },
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
                          onClick={() => setSelectedLog(log)}
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
                            {log.region?.name || ""}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                            {log.district?.name || ""}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                            {log.branch?.name || ""}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5] tabular-nums whitespace-nowrap">
                            {typeof log.distance_meters === "number" ? log.distance_meters.toFixed(2) : ""}
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

                  {/* Sana (boshlanish) */}
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

                  {/* Sana (tugash) */}
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

                  {/* Holat */}
                  <Select
                    label={t("status") || "Holat"}
                    placeholder={t("select_status") || "Holat tanlang"}
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
        </>
      )}
    </div>
  )
}

export default LocationHistory