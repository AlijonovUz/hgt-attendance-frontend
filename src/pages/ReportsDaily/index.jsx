import { useEffect, useRef, useState, useCallback } from "react"
import dayjs from "dayjs"
import * as XLSX from "xlsx-js-style"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { CheckCircle2, XCircle, ArrowLeft, X, Search } from "lucide-react"

import { useLanguage } from "../../Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { ExportMenu } from "@/components/ui/ExportMenu"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import {
  TimeQuarter02Icon,
  Logout01Icon,
  FilterVerticalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"

const fmt = (n) =>
  Number(n ?? 0)
    .toLocaleString("ru-RU")
    .replace(/ /g, " ")
    .replace(/,/g, " ")

const Pill = ({ icon: Icon, iconClass, children, iconType }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1 text-sm text-[#1A1A1A] dark:text-white">
    {Icon &&
      (iconType === "huge" ? (
        <HugeIcon icon={Icon} size={14} className={cn("flex-shrink-0", iconClass)} />
      ) : (
        <Icon size={14} className={cn("flex-shrink-0", iconClass)} />
      ))}
    <span className="tabular-nums">{children}</span>
  </span>
)

const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-[#F0F0F0] dark:border-[#1F1F1F]">
    {Array.from({ length: cols }).map((_, j) => (
      <td key={j} className="px-4 py-3.5">
        <div className="h-6 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
      </td>
    ))}
  </tr>
)

const COL_COUNT = 11

const DailyAttendance = () => {
  const { t } = useLanguage()

  // ── Data state ──
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // ── Search ──
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // ── Filter modal ──
  const [openFilterModal, setOpenFilterModal] = useState(false)

  // ── Filter values ──
  const [filterUser, setFilterUser] = useState(null)
  const [filterSchedule, setFilterSchedule] = useState(null)
  const [filterRegion, setFilterRegion] = useState(null)
  const [filterDistrict, setFilterDistrict] = useState(null)
  const [filterBranch, setFilterBranch] = useState(null)
  const [filterDepartment, setFilterDepartment] = useState(null)

  // ── Filter options ──
  const [users, setUsers] = useState([])
  const [schedules, setSchedules] = useState([])
  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])

  // ── Active filters ref (survives re-renders) ──
  const activeFiltersRef = useRef({})

  // ── Toast ──
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) =>
    setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

  // ── Scroll sentinel ──
  const sentinelRef = useRef(null)
  const tableWrapRef = useRef(null)

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
        const res = await axiosAPI.get("analytics/daily-attendance/", {
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
      const res = await axiosAPI.get("analytics/daily-attendance/", {
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
  }, [search])

  // ── Load filter options when modal opens ──
  useEffect(() => {
    if (!openFilterModal) return
    fetchUsers()
    fetchSchedules()
    fetchRegions()
    fetchBranches()
    fetchDepartments()
  }, [openFilterModal])

  // Region → districts
  useEffect(() => {
    if (filterRegion?.value) fetchDistricts(filterRegion.value)
    else setDistricts([])
  }, [filterRegion])

  // ── Option loaders ──
  const fetchUsers = async (s = "") => {
    try {
      const res = await axiosAPI.get("users/", { params: { search: s, page: 1 } })
      if (res.status === 200)
        setUsers((res.data?.data?.results || []).map((u) => ({ value: u.id, label: u.full_name })))
    } catch { }
  }

  const fetchSchedules = async (s = "") => {
    try {
      const res = await axiosAPI.get("schedules/", { params: { search: s, page: 1 } })
      if (res.status === 200)
        setSchedules(
          (res.data?.data?.results || []).map((sc) => ({ value: sc.name, label: sc.name }))
        )
    } catch { }
  }

  const fetchRegions = async () => {
    try {
      const res = await axiosAPI.get("users/regions/")
      if (res.status === 200)
        setRegions(
          (res.data?.data?.results || []).map((r) => ({ value: r.id, label: r.name }))
        )
    } catch { }
  }

  const fetchDistricts = async (regionId, s = "") => {
    try {
      const res = await axiosAPI.get("users/districts/", {
        params: { region: regionId, search: s, page: 1 },
      })
      if (res.status === 200)
        setDistricts(
          (res.data?.data?.results || []).map((d) => ({ value: d.id, label: d.name }))
        )
    } catch { }
  }

  const fetchBranches = async (s = "") => {
    try {
      const res = await axiosAPI.get("branches/", { params: { search: s, page: 1 } })
      if (res.status === 200)
        setBranches(
          (res.data?.data?.results || []).map((b) => ({ value: b.id, label: b.name }))
        )
    } catch { }
  }

  const fetchDepartments = async (s = "") => {
    try {
      const res = await axiosAPI.get("departments/", { params: { search: s, page: 1 } })
      if (res.status === 200)
        setDepartments(
          (res.data?.data?.results || []).map((d) => ({ value: d.id, label: d.name }))
        )
    } catch { }
  }

  // ── Filter handlers ──
  const handleFilterSearch = () => {
    const extra = {}
    if (filterUser?.value) extra.user = filterUser.value
    if (filterSchedule?.value) extra.schedule_name = filterSchedule.value
    if (filterRegion?.value) extra.region = filterRegion.value
    if (filterDistrict?.value) extra.district = filterDistrict.value
    if (filterBranch?.value) extra.branch = filterBranch.value
    if (filterDepartment?.value) extra.department = filterDepartment.value
    activeFiltersRef.current = extra
    setOpenFilterModal(false)
    fetchData(extra)
  }

  const handleFilterClear = () => {
    setFilterUser(null)
    setFilterSchedule(null)
    setFilterRegion(null)
    setFilterDistrict(null)
    setFilterBranch(null)
    setFilterDepartment(null)
    setDistricts([])
  }

  const hasActiveFilter =
    filterUser || filterSchedule || filterRegion || filterDistrict || filterBranch || filterDepartment

  // ── Search submit ──
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  // ── Export helpers ──
  const buildExport = () => {
    const headers = [
      "#",
      t("col_employee") || "Xodim",
      t("region") || "Viloyat",
      t("district") || "Tuman",
      t("branch") || "Filial",
      t("department") || "Bo'lim",
      t("date") || "Sana",
      t("schedule") || "Ish grafigi",
      t("come") || "Ishga kelgan",
      t("latecomers") || "Kechikib kel...",
      t("absent") || "Ishga kelma...",
      t("early_leavers") || "Erta ketgan",
    ]
    const body = results.map((r, i) => [
      i + 1,
      r.user_info?.full_name || "—",
      r.region || "—",
      r.district || "—",
      r.branch || "—",
      r.department || "—",
      r.date ? dayjs(r.date).format("DD.MM.YYYY") : "—",
      r.schedule_name || "—",
      r.present ?? 0,
      r.late ?? 0,
      r.absent ?? 0,
      r.left_early ?? 0,
    ])
    return { headers, body }
  }

  const exportExcel = () => {
    if (!results.length) return showToast(t("export_empty_warning") || "Ma'lumot yo'q")
    try {
      const { headers, body } = buildExport()
      const aoa = [headers, ...body]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      ws["!cols"] = headers.map((_, i) => ({ wch: i === 1 ? 28 : i === 0 ? 6 : 16 }))
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
      body.forEach((row, rowIdx) => {
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
      XLSX.utils.book_append_sheet(wb, ws, "Kunlik davomat")
      XLSX.writeFile(wb, `kunlik-davomat-${dayjs().format("YYYY-MM-DD")}.xlsx`, {
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
      doc.text(t("daily_attendance") || "Kunlik davomat", 14, 14)
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
          fontSize: 8,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
          lineColor: [212, 212, 212],
          lineWidth: 0.2,
          font: "helvetica",
          textColor: [26, 26, 26],
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: { 0: { halign: "center", cellWidth: 8 } },
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
      doc.save(`kunlik-davomat-${dayjs().format("YYYY-MM-DD")}.pdf`)
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
      const aoa = [headers, ...body]
      const escape = (v) => {
        const s = String(v ?? "")
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"`
          : s
      }
      const csv = "\uFEFF" + aoa.map((row) => row.map(escape).join(",")).join("\r\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kunlik-davomat-${dayjs().format("YYYY-MM-DD")}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast(t("export_csv_success") || "CSV yuklandi")
    } catch (err) {
      console.error(err)
      showToast(t("export_error") || "Xatolik")
    }
  }

  return (
    <div className="p-4 pb-0! flex flex-col items-start gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

      {/* ─── Toolbar: Search + Filter ─── */}
      <div className="flex items-center gap-3 w-full flex-wrap">

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("search_placeholder") || "Qidirish..."}
          className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] dark:border-[#2E2E2E] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder-[#9CA3AF] outline-none focus:border-[#0090FF] transition-colors w-[220px]"
        />

        {/* Filter button */}
        <button
          className="flex items-center gap-1.5 cursor-pointer relative border-[1.7px] text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3"
          onClick={() => setOpenFilterModal(true)}
        >
          {Object.keys(activeFiltersRef.current).length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]" />
          )}
          <HugeIcon icon={FilterVerticalIcon} size={16} />
          {t("filter") || "Filter"}
        </button>

        <ExportMenu onExcel={exportExcel} onPDF={exportPDF} onCSV={exportCSV} label={t("download") || "Yuklash"} />
      </div>

      {/* ─── Table ─── */}
      <div
        ref={tableWrapRef}
        className="w-full h-[calc(100vh-200px)] bg-white dark:bg-[#0A0A0A] flex flex-col overflow-y-auto"
      >
        <table className="w-full border-collapse text-left table-fixed">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[13%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
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
                t("date") || "Sana",
                t("schedule") || "Ish grafigi",
                t("come") || "Ishga kelgan",
                t("latecomers") || "Kechikib kel...",
                t("absent") || "Ishga kelma...",
                t("early_leavers") || "Erta ketgan",
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
                  {t("reports_empty") || "Ma'lumot topilmadi"}
                </td>
              </tr>
            ) : (
              <>
                {results.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className="border-b border-[#F0F0F0] dark:border-[#1F1F1F] hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#737373] dark:text-[#444444]">
                      {i + 1}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-white truncate"
                      title={r.user_info?.full_name}
                    >
                      {r.user_info?.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white">
                      {r.region || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white">
                      {r.district || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white">
                      {r.branch || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white">
                      {r.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1A1A1A] dark:text-white whitespace-nowrap">
                      {r.date ? dayjs(r.date).format("DD.MM.YYYY") : "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm truncate text-[#1A1A1A] dark:text-white"
                      title={r.schedule_name}
                    >
                      {r.schedule_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={CheckCircle2} iconClass="text-[#22A565]">
                        {fmt(r.present)}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={TimeQuarter02Icon} iconType="huge" iconClass="text-[#F97316]">
                        {fmt(r.late)}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={XCircle} iconClass="text-[#EF4444]">
                        {fmt(r.absent)}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={Logout01Icon} iconType="huge" iconClass="text-[#9CA3AF]">
                        {fmt(r.left_early)}
                      </Pill>
                    </td>
                  </tr>
                ))}

                {/* Scroll sentinel */}
                <tr>
                  <td colSpan={COL_COUNT} className="p-0">
                    <div ref={sentinelRef} className="h-1" />
                  </td>
                </tr>

                {/* Loading more */}
                {loadingMore && (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonRow key={`more-${i}`} cols={COL_COUNT} />
                  ))
                )}
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
      <Modal isOpen={openFilterModal} onClose={() => setOpenFilterModal(false)} height={560}>
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
              <Select
                label={t("col_employee") || "Xodim"}
                placeholder={t("select_employee") || "Xodim tanlang"}
                options={users}
                value={filterUser?.value ?? null}
                onChange={(opt) => setFilterUser(opt)}
                searchable
                onSearch={(s) => fetchUsers(s)}
              />

              <Select
                label={t("schedule") || "Ish grafigi"}
                placeholder={t("select_schedule") || "Grafigini tanlang"}
                options={schedules}
                value={filterSchedule?.value ?? null}
                onChange={(opt) => setFilterSchedule(opt)}
                searchable
                onSearch={(s) => fetchSchedules(s)}
              />

              <Select
                label={t("region") || "Viloyat"}
                placeholder={t("region_branch_placeholder") || "Viloyat tanlang"}
                options={regions}
                value={filterRegion?.value ?? null}
                onChange={(opt) => {
                  setFilterRegion(opt)
                  setFilterDistrict(null)
                  setDistricts([])
                }}
              />

              <Select
                label={t("district") || "Tuman"}
                placeholder={
                  !filterRegion
                    ? t("select_region_first") || "Avval viloyat tanlang"
                    : t("district_branch_placeholder") || "Tuman tanlang"
                }
                options={districts}
                value={filterDistrict?.value ?? null}
                onChange={(opt) => setFilterDistrict(opt)}
                disabled={!filterRegion}
                searchable
                onSearch={(s) => filterRegion?.value && fetchDistricts(filterRegion.value, s)}
              />

              <Select
                label={t("branch") || "Filial"}
                placeholder={t("select_branch") || "Filial tanlang"}
                options={branches}
                value={filterBranch?.value ?? null}
                onChange={(opt) => setFilterBranch(opt)}
                searchable
                onSearch={(s) => fetchBranches(s)}
              />

              <Select
                label={t("department") || "Bo'lim"}
                placeholder={t("select_department") || "Bo'lim tanlang"}
                options={departments}
                value={filterDepartment?.value ?? null}
                onChange={(opt) => setFilterDepartment(opt)}
                searchable
                onSearch={(s) => fetchDepartments(s)}
              />
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

export default DailyAttendance