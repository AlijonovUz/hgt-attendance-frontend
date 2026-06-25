import { useEffect, useRef, useState, useCallback } from "react"
import dayjs from "dayjs"
import * as XLSX from "xlsx-js-style"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { ArrowLeft, X } from "lucide-react"

import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { ExportMenu } from "@/components/ui/ExportMenu"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { FilterVerticalIcon, Search01Icon, Calendar02Icon } from "@hugeicons/core-free-icons"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/DatePicker"

// Backend event_type enum → tarjima kaliti
const EVENT_KEY = {
  check_in: "event_check_in",
  lunch_start: "event_lunch_start",
  lunch_end: "event_lunch_end",
  check_out: "event_check_out",
}

const COL_COUNT = 8

const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-[#F0F0F0] dark:border-[#1F1F1F]">
    {Array.from({ length: cols }).map((_, j) => (
      <td key={j} className="px-4 py-3.5">
        <div className="h-6 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
      </td>
    ))}
  </tr>
)

const ReportsEvents = () => {
  const { t, language } = useLanguage()

  // ── Data state ──
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // ── Search ──
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  const [searchRegion, setSearchRegion] = useState("")

  const searchTimer = useRef(null)

  // ── Filter modal ──
  const [openFilterModal, setOpenFilterModal] = useState(false)

  // ── Filter values ──
  const [filterUser, setFilterUser] = useState(null)
  const [filterEvent, setFilterEvent] = useState(null)
  const [filterRegion, setFilterRegion] = useState(null)
  const [filterDistrict, setFilterDistrict] = useState(null)
  const [filterBranch, setFilterBranch] = useState(null)
  const [filterDepartment, setFilterDepartment] = useState(null)
  const [filterStartDate, setFilterStartDate] = useState(null)
  const [filterEndDate, setFilterEndDate] = useState(null)

  // ── Filter options ──
  const [users, setUsers] = useState([])
  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])

  // ── Filter options pagination ──
  const [userPag, setUserPag] = useState({ page: 1, hasMore: true, loading: false })
  const [districtPag, setDistrictPag] = useState({ page: 1, hasMore: true, loading: false })
  const [branchPag, setBranchPag] = useState({ page: 1, hasMore: true, loading: false })
  const [deptPag, setDeptPag] = useState({ page: 1, hasMore: true, loading: false })

  // ── Active filters ref (survives re-renders) ──
  const activeFiltersRef = useRef({})

  // ── Toast ──
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) =>
    setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

  // ── Scroll sentinel ──
  const sentinelRef = useRef(null)
  const tableWrapRef = useRef(null)

  // ── Hodisa turi tanlovlari ──
  const EVENT_OPTIONS = Object.entries(EVENT_KEY).map(([value, key]) => ({
    value,
    label: t(key),
  }))

  const eventLabel = (type) => (EVENT_KEY[type] ? t(EVENT_KEY[type]) : type || "")

  // region/district/branch/department obyekt yoki string bo'lishi mumkin
  const refName = (v) => (v && typeof v === "object" ? v.name : v) || ""

  // ── Build query params ──
  const buildParams = useCallback(
    (pageNum = 1, extra = {}) => {
      const params = { page: pageNum, ...extra }
      if (search) params.search = search
      return params
    },
    [search]
  )

  // ── Fetch page 1 (reset) ──
  const fetchData = useCallback(
    async (extra = {}) => {
      setLoading(true)
      setPage(1)
      setResults([])
      setHasMore(true)
      try {
        const res = await axiosAPI.get("attendance/attendance/", {
          params: buildParams(1, extra),
        })
        if (res.status === 200) {
          const data = res.data?.data || {}
          setResults(data.results || [])
          setHasMore(!!data.next)
          setPage(1)
        }
      } catch (err) {
        console.error(err)
        setResults([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    },
    [buildParams]
  )

  // ── Fetch next page ──
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await axiosAPI.get("attendance/attendance/", {
        params: buildParams(nextPage, activeFiltersRef.current),
      })
      if (res.status === 200) {
        const data = res.data?.data || {}
        setResults((prev) => [...prev, ...(data.results || [])])
        setHasMore(!!data.next)
        setPage(nextPage)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, buildParams])

  // ── IntersectionObserver for infinite scroll ──
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          fetchMore()
        }
      },
      { root: tableWrapRef.current, threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, loadingMore, fetchMore])

  // ── Initial load & search change ──
  useEffect(() => {
    fetchData(activeFiltersRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // ── Qidiruv (debounce) ──
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(e.target.value), 400)
  }

  // ── Load filter options when modal opens ──
  useEffect(() => {
    if (!openFilterModal) return
    fetchUsers(1, "")
    fetchRegions()
    fetchBranches(1, "", null, null)
    fetchDepartments(1, "", null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFilterModal])

  // ── Option loaders (sahifalanadigan) ──
  const fetchUsers = async (pageNum = 1, q = "") => {
    setUserPag((p) => ({ ...p, loading: true }))
    if (pageNum === 1) setUsers([])
    try {
      const res = await axiosAPI.get("users/employees/", { params: { search: q, page: pageNum } })
      if (res.status === 200) {
        const list = (res.data?.data?.results || []).map((u) => ({ value: u.id, label: u.full_name }))
        setUsers((prev) => (pageNum === 1 ? list : [...prev, ...list]))
        setUserPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) {
      console.error(err)
      setUserPag((p) => ({ ...p, loading: false }))
    }
  }

  const fetchRegions = async () => {
    try {
      const res = await axiosAPI.get("users/regions/")
      if (res.status === 200)
        setRegions((res.data?.data?.results || []).map((r) => ({ value: r.id, label: r.name })))
    } catch (err) { console.error(err) }
  }

  const fetchDistricts = async (regionId, pageNum = 1, q = "") => {
    setDistrictPag((p) => ({ ...p, loading: true }))
    if (pageNum === 1) setDistricts([])
    try {
      const params = { page: pageNum, region: regionId }
      if (q?.trim()) params.search = q
      const res = await axiosAPI.get("users/districts/", { params })
      if (res.status === 200) {
        const list = (res.data?.data?.results || []).map((d) => ({ value: d.id, label: d.name }))
        setDistricts((prev) => (pageNum === 1 ? list : [...prev, ...list]))
        setDistrictPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) {
      console.error(err)
      setDistrictPag((p) => ({ ...p, loading: false }))
    }
  }

  const fetchBranches = async (pageNum = 1, q = "", regionId = null, districtId = null) => {
    setBranchPag((p) => ({ ...p, loading: true }))
    if (pageNum === 1) setBranches([])
    try {
      const params = { page: pageNum }
      if (q?.trim()) params.search = q
      if (regionId) params.region = regionId
      if (districtId) params.district = districtId
      const res = await axiosAPI.get("users/branches/", { params })
      if (res.status === 200) {
        const list = (res.data?.data?.results || []).map((b) => ({ value: b.id, label: b.name }))
        setBranches((prev) => (pageNum === 1 ? list : [...prev, ...list]))
        setBranchPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) {
      console.error(err)
      setBranchPag((p) => ({ ...p, loading: false }))
    }
  }

  const fetchDepartments = async (pageNum = 1, q = "", branchId = null) => {
    setDeptPag((p) => ({ ...p, loading: true }))
    if (pageNum === 1) setDepartments([])
    try {
      const params = { page: pageNum }
      if (q?.trim()) params.search = q
      if (branchId) params.branch = branchId
      const res = await axiosAPI.get("users/departments/", { params })
      if (res.status === 200) {
        const list = (res.data?.data?.results || []).map((d) => ({ value: d.id, label: d.name }))
        setDepartments((prev) => (pageNum === 1 ? list : [...prev, ...list]))
        setDeptPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) {
      console.error(err)
      setDeptPag((p) => ({ ...p, loading: false }))
    }
  }

  // ── Kaskad handler'lar ──

  // 1. Viloyat o'zgarganda → tuman reset, filial qayta load (region bo'yicha)
  const handleRegionChange = (opt) => {
    setFilterRegion(opt)
    setFilterDistrict(null)
    setFilterBranch(null)
    setFilterDepartment(null)
    setDistricts([])
    setDistrictPag({ page: 1, hasMore: true, loading: false })
    setBranches([])
    setDepartments([])

    if (opt?.value) {
      fetchDistricts(opt.value, 1, "")
      fetchBranches(1, "", opt.value, null)
    } else {
      fetchBranches(1, "", null, null)
      fetchDepartments(1, "", null)
    }
  }

  // 2. Tuman o'zgarganda → filial qayta load (region + district bo'yicha)
  const handleDistrictChange = (opt) => {
    setFilterDistrict(opt)
    setFilterBranch(null)
    setFilterDepartment(null)
    setBranches([])
    setDepartments([])

    const regionId = filterRegion?.value || null
    fetchBranches(1, "", regionId, opt?.value || null)
  }

  // 3. Filial o'zgarganda → bo'lim qayta load (branch bo'yicha)
  const handleBranchChange = (opt) => {
    setFilterBranch(opt)
    setFilterDepartment(null)
    setDepartments([])
    fetchDepartments(1, "", opt?.value || null)
  }

  // ── Filter handlers ──
  const handleFilterSearch = () => {
    const extra = {}
    if (filterUser?.value) extra.user = filterUser.value
    if (filterEvent?.value) extra.event_type = filterEvent.value
    if (filterRegion?.value) extra.region = filterRegion.value
    if (filterDistrict?.value) extra.district = filterDistrict.value
    if (filterBranch?.value) extra.branch = filterBranch.value
    if (filterDepartment?.value) extra.department = filterDepartment.value
    if (filterStartDate) extra.start_date = dayjs(filterStartDate).format("YYYY-MM-DD")
    if (filterEndDate) extra.end_date = dayjs(filterEndDate).format("YYYY-MM-DD")
    activeFiltersRef.current = extra
    setOpenFilterModal(false)
    fetchData(extra)
  }

  const handleFilterClear = () => {
    setFilterUser(null)
    setFilterEvent(null)
    setFilterRegion(null)
    setFilterDistrict(null)
    setFilterBranch(null)
    setFilterDepartment(null)
    setFilterStartDate(null)
    setFilterEndDate(null)
    setDistricts([])
    setBranches([])
    setDepartments([])
    setDistrictPag({ page: 1, hasMore: true, loading: false })
    setBranchPag({ page: 1, hasMore: true, loading: false })
    setDeptPag({ page: 1, hasMore: true, loading: false })
    activeFiltersRef.current = {}
    fetchBranches(1, "", null, null)
    fetchDepartments(1, "", null)
  }

  const hasActiveFilter =
    filterUser || filterEvent || filterRegion || filterDistrict || filterBranch || filterDepartment || filterStartDate || filterEndDate

  // ── Export helpers ──
  const buildExport = () => {
    const headers = [
      "#",
      t("col_employee") || "Xodim",
      t("region") || "Viloyat",
      t("district") || "Tuman",
      t("branch") || "Filial",
      t("department") || "Bo'lim",
      t("event_type") || "Hodisa turi",
      t("created_at") || "Yaratilgan vaqti",
    ]
    const body = results.map((r, i) => [
      i + 1,
      r.user_info?.full_name || "",
      refName(r.region),
      refName(r.district),
      refName(r.branch),
      refName(r.department),
      eventLabel(r.event_type),
      r.created_at ? dayjs(r.created_at).format("DD.MM.YYYY HH:mm") : "",
    ])
    return { headers, body }
  }

  const exportExcel = () => {
    if (!results.length) return showToast(t("export_empty_warning") || "Ma'lumot yo'q")
    try {
      const { headers, body } = buildExport()
      const ws = XLSX.utils.aoa_to_sheet([headers, ...body])
      ws["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 20 }]
      ws["!rows"] = [{ hpt: 28 }, ...body.map(() => ({ hpt: 22 }))]
      const border = {
        top: { style: "thin", color: { rgb: "D4D4D4" } },
        bottom: { style: "thin", color: { rgb: "D4D4D4" } },
        left: { style: "thin", color: { rgb: "D4D4D4" } },
        right: { style: "thin", color: { rgb: "D4D4D4" } },
      }
      headers.forEach((_, c) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c })
        if (!ws[ref]) ws[ref] = { t: "s", v: headers[c] }
        ws[ref].s = {
          fill: { patternType: "solid", fgColor: { rgb: "3c83f6" } },
          font: { bold: true, sz: 10, color: { rgb: "ffffff" }, name: "Calibri" },
          alignment: { vertical: "center", horizontal: c === 0 ? "center" : "left" },
          border,
        }
      })
      body.forEach((_, rowIdx) => {
        const isEven = rowIdx % 2 === 1
        headers.forEach((__, c) => {
          const ref = XLSX.utils.encode_cell({ r: rowIdx + 1, c })
          if (!ws[ref]) ws[ref] = { t: "s", v: "" }
          ws[ref].s = {
            fill: { patternType: "solid", fgColor: { rgb: isEven ? "FAFAFA" : "FFFFFF" } },
            font: { sz: 10, color: { rgb: "1A1A1A" }, name: "Calibri" },
            alignment: { vertical: "center", horizontal: c === 0 ? "center" : "left" },
            border,
          }
        })
      })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Davomat hodisalari")
      XLSX.writeFile(wb, `davomat-hodisalari-${dayjs().format("YYYY-MM-DD")}.xlsx`, {
        bookType: "xlsx",
        cellStyles: true,
      })
      showToast(t("export_excel_success") || "Excel yuklandi")
    } catch (err) {
      console.error(err)
      showToast(t("export_error") || "Xatolik")
    }
  }

  const exportPDF = () => {
    if (!results.length) return showToast(t("export_empty_warning") || "Ma'lumot yo'q")
    try {
      const { headers, body } = buildExport()
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(10, 10, 10)
      doc.text(t("report_m_events") || "Davomat hodisalari", 14, 14)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(115, 115, 115)
      doc.text(dayjs().format("DD.MM.YYYY HH:mm"), 14, 21)
      autoTable(doc, {
        head: [headers],
        body,
        startY: 27,
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
          lineColor: [212, 212, 212],
          lineWidth: 0.2,
          font: "helvetica",
          textColor: [26, 26, 26],
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        bodyStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
          0: { halign: "center", cellWidth: "auto" },
          1: { cellWidth: 40 },
        },
      })
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7.5)
        doc.setTextColor(160, 160, 160)
        doc.text(
          `${i} / ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: "center" }
        )
      }
      doc.save(`davomat-hodisalari-${dayjs().format("YYYY-MM-DD")}.pdf`)
      showToast(t("export_pdf_success") || "PDF yuklandi")
    } catch (err) {
      console.error(err)
      showToast(t("export_error") || "Xatolik")
    }
  }

  const exportCSV = () => {
    if (!results.length) return showToast(t("export_empty_warning") || "Ma'lumot yo'q")
    try {
      const { headers, body } = buildExport()
      const escape = (v) => {
        const s = String(v ?? "")
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s
      }
      const csv = "﻿" + [headers, ...body].map((row) => row.map(escape).join(",")).join("\r\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `davomat-hodisalari-${dayjs().format("YYYY-MM-DD")}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast(t("export_csv_success") || "CSV yuklandi")
    } catch (err) {
      console.error(err)
      showToast(t("export_error") || "Xatolik")
    }
  }

  return (
    <div className="px-4 pt-3 flex flex-col items-start gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

      {/* ─── Toolbar: Search + Filter ─── */}
      <div className="flex items-center justify-between w-full flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder={t("search") || "Qidirish..."}
            className="w-[384px]"
          />

          {/* Filter button */}
          <button
            className="flex items-center gap-1.5 cursor-pointer relative border shadow-xs text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3"
            onClick={() => setOpenFilterModal(true)}
          >
            {hasActiveFilter && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
            <HugeIcon icon={FilterVerticalIcon} size={16} />
            {t("filter") || "Filter"}
          </button>
        </div>

        <ExportMenu onExcel={exportExcel} onPDF={exportPDF} onCSV={exportCSV} label={t("download") || "Yuklash"} />
      </div>

      {/* ─── Table ─── */}
      <div
        ref={tableWrapRef}
        className="w-full h-[calc(100vh-130px)] bg-white dark:bg-[#0A0A0A] flex flex-col overflow-y-auto"
      >
        <table className="w-full border-collapse text-left table-fixed">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[18%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFA] dark:bg-[#171717] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
              {[
                "#",
                t("col_employee") || "Xodim",
                t("region") || "Viloyat",
                t("district") || "Tuman",
                t("branch") || "Filial",
                t("department") || "Bo'lim",
                t("event_type") || "Hodisa turi",
                t("created_at") || "Yaratilgan vaqti",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[13px] font-medium text-[#6B7280] dark:text-[#fafafa] whitespace-nowrap truncate"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <SkeletonRow key={i} cols={COL_COUNT} />
              ))
            ) : results.length === 0 ? (
              <tr>
                <td
                  colSpan={COL_COUNT}
                  className="px-4 py-16 text-center text-sm text-[#737373]"
                >
                  {t("no_data_found") || "Ma'lumot topilmadi"}
                </td>
              </tr>
            ) : (
              <>
                {results.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className="border-b border-[#F0F0F0] dark:border-[#1F1F1F] hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#737373] dark:text-[#666]">
                      {i + 1}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-white truncate"
                      title={r.user_info?.full_name}
                    >
                      {r.user_info?.full_name || ""}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white" title={refName(r.region)}>
                      {refName(r.region)}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white" title={refName(r.district)}>
                      {refName(r.district)}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white" title={refName(r.branch)}>
                      {refName(r.branch)}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white" title={refName(r.department)}>
                      {refName(r.department)}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white">
                      {eventLabel(r.event_type)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1A1A1A] dark:text-white whitespace-nowrap tabular-nums">
                      {r.created_at ? dayjs(r.created_at).format("DD.MM.YYYY HH:mm") : "—"}
                    </td>
                  </tr>
                ))}

                {/* Loading more */}
                {loadingMore &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonRow key={`more-${i}`} cols={COL_COUNT} />
                  ))}

                {/* Infinite scroll sentinel */}
                <tr>
                  <td colSpan={COL_COUNT}>
                    <div ref={sentinelRef} className="h-1" />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Toast ─── */}
      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* ─── Filter Modal ─── */}
      <Modal isOpen={openFilterModal} onClose={() => setOpenFilterModal(false)} height={600}>
        <div className="flex flex-col justify-between h-full">
          {/* Top */}
          <div className="flex flex-col gap-3">
            {/* Nav */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="w-11 h-11 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition dark:hover:bg-[#0a0a0a]"
                  onClick={() => setOpenFilterModal(false)}
                >
                  <ArrowLeft size={24} />
                </span>
                <h1 className="text-2xl font-semibold">
                  {t("filter_title") || "Filtrlash"}
                </h1>
              </div>
              <span className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                {t("filter_subtitle") ||
                  "Kerakli filtrlarni tanlang, natijalar shunga qarab saralanadi"}
              </span>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-2 gap-3">
              {/* Xodim */}
              <Select
                label={t("col_employee") || "Xodim"}
                placeholder={t("select_employee") || "Xodim tanlang"}
                options={users}
                value={filterUser?.value ?? null}
                onChange={(opt) => setFilterUser(opt)}
                searchable
                loadingMore={userPag.loading}
                onScrollEnd={() => {
                  if (!userPag.hasMore || userPag.loading) return
                  fetchUsers(userPag.page + 1, "")
                }}
                onSearch={(s) => fetchUsers(1, s)}
              />

              {/* Hodisa turi */}
              <Select
                label={t("event_type") || "Hodisa turi"}
                placeholder={t("select_event") || "Hodisa tanlang"}
                options={EVENT_OPTIONS}
                value={filterEvent?.value ?? null}
                onChange={(opt) => setFilterEvent(opt)}
              />

              {/* Viloyat → handleRegionChange */}
              <Select
                label={t("region") || "Viloyat"}
                placeholder={t("region_branch_placeholder") || "Viloyat tanlang"}
                options={regions.filter(r => r.label.toLowerCase().includes(searchRegion.toLowerCase()))}
                value={filterRegion?.value ?? null}
                onChange={handleRegionChange}
                searchable={true}
                onSearch={(s) => setSearchRegion(s)}
              />

              {/* Tuman → handleDistrictChange (viloyat tanlanmasa disabled) */}
              <Select
                label={t("district") || "Tuman"}
                placeholder={
                  !filterRegion
                    ? t("select_region_first") || "Avval viloyat tanlang"
                    : t("district_branch_placeholder") || "Tuman tanlang"
                }
                options={districts}
                value={filterDistrict?.value ?? null}
                onChange={handleDistrictChange}
                disabled={!filterRegion}
                searchable
                loadingMore={districtPag.loading}
                onScrollEnd={() => {
                  if (!districtPag.hasMore || districtPag.loading || !filterRegion?.value) return
                  fetchDistricts(filterRegion.value, districtPag.page + 1, "")
                }}
                onSearch={(s) => {
                  if (filterRegion?.value) fetchDistricts(filterRegion.value, 1, s)
                }}
              />

              {/* Filial → handleBranchChange */}
              <Select
                label={t("branch") || "Filial"}
                placeholder={t("select_branch") || "Filial tanlang"}
                options={branches}
                value={filterBranch?.value ?? null}
                onChange={handleBranchChange}
                searchable
                loadingMore={branchPag.loading}
                onScrollEnd={() => {
                  if (!branchPag.hasMore || branchPag.loading) return
                  fetchBranches(
                    branchPag.page + 1, "",
                    filterRegion?.value || null,
                    filterDistrict?.value || null
                  )
                }}
                onSearch={(s) =>
                  fetchBranches(1, s, filterRegion?.value || null, filterDistrict?.value || null)
                }
              />

              {/* Bo'lim → filial bo'yicha filterlanadi */}
              <Select
                label={t("department") || "Bo'lim"}
                placeholder={t("select_department") || "Bo'lim tanlang"}
                options={departments}
                value={filterDepartment?.value ?? null}
                onChange={(opt) => setFilterDepartment(opt)}
                searchable
                loadingMore={deptPag.loading}
                onScrollEnd={() => {
                  if (!deptPag.hasMore || deptPag.loading) return
                  fetchDepartments(deptPag.page + 1, "", filterBranch?.value || null)
                }}
                onSearch={(s) => fetchDepartments(1, s, filterBranch?.value || null)}
              />

              {/* Sana oralig'i */}
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-sm font-normal text-[#737373] dark:text-[#A3A3A3]">
                  {t("date_range")}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    currentLang={language}
                    label=" "
                    placeholder={t("date_from")}
                    widthClass="w-full"
                    className="w-full"
                    inputClassName="h-11! bg-white dark:bg-transparent!"
                    value={filterStartDate}
                    onChange={(d) => setFilterStartDate(d)}
                    labelClassName="hidden"
                    calendarIcon={filterStartDate ? <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setFilterStartDate(null) }}><X size={18} /></span> : <HugeIcon icon={Calendar02Icon} size={18} />}
                  />
                  <DatePicker
                    currentLang={language}
                    label=" "
                    placeholder={t("date_to")}
                    widthClass="w-full"
                    className="w-full"
                    inputClassName="h-11! bg-white dark:bg-transparent!"
                    value={filterEndDate}
                    onChange={(d) => setFilterEndDate(d)}
                    labelClassName="hidden"
                    calendarIcon={filterEndDate ? <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setFilterEndDate(null) }}><X size={18} /></span> : <HugeIcon icon={Calendar02Icon} size={18} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer"
              onClick={handleFilterClear}
            >
              <X size={14} />
              {t("clear") || "Tozalash"}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg"
              onClick={handleFilterSearch}
            >
              <HugeIcon size={14} icon={Search01Icon} />
              {t("search") || "Qidirish"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReportsEvents
