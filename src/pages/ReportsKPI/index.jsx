import { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import { ArrowLeft, X } from "lucide-react"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { HugeIcon } from "@/components/ui/HugeIcon"
import {
  Search01Icon,
  FilterVerticalIcon,
  Calendar02Icon,
} from "@hugeicons/core-free-icons"
import { DatePicker } from "@/components/ui/DatePicker"
import { Input } from "@/components/ui/input"
import ExportMenu from "@/components/ui/ExportMenu"
import * as XLSX from "xlsx-js-style"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const index = () => {
  const { t, language } = useLanguage()

  const [results, setResults] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)

  const [searchRegion, setSearchRegion] = useState("")

  const emptyDraft = {
    user: null,
    region: null,
    district: null,
    branch: null,
    department: null,
    rating_category: "",
    start_date: "",
    end_date: "",
  }
  const [draft, setDraft] = useState(emptyDraft)
  const [applied, setApplied] = useState(emptyDraft)
  const activeFiltersRef = useRef({})

  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])

  const [districtPag, setDistrictPag] = useState({ page: 1, hasMore: true, loading: false })
  const [branchPag, setBranchPag] = useState({ page: 1, hasMore: true, loading: false })
  const [deptPag, setDeptPag] = useState({ page: 1, hasMore: true, loading: false })
  const [employeePag, setEmployeePag] = useState({ page: 1, hasMore: true, loading: false })

  const hasFilter = !!(
    applied.user || applied.region || applied.district ||
    applied.branch || applied.department || applied.rating_category ||
    applied.start_date || applied.end_date
  )

  const buildExport = () => {
    const headers = [
      "#",
      t("col_employee"),
      t("region"),
      t("district"),
      t("col_branch"),
      t("department"),
      t("report_month_title"),
      t("attendance_kpi_title"),
      t("monthly_kpi_title"),
      t("rating_title"),
      t("total_score_title"),
    ]
    const body = results.map((r, i) => [
      i + 1,
      r.user_info?.full_name || "",
      r.region?.name || "",
      r.district?.name || "",
      r.branch?.name || "",
      r.department?.name || "",
      r.month ? dayjs(r.month).format("DD.MM.YYYY") : "",
      r.attendance_kpi ?? "",
      r.monthly_kpi ?? "",
      r.rating_display ?? "",
      r.total_score ?? "",
    ])
    return { headers, body, totalRow: null }
  }

  const exportExcel = () => {
    if (!results.length) return
    try {
      const { headers, body } = buildExport()
      const aoa = [headers, ...body]
      const ws = XLSX.utils.aoa_to_sheet(aoa)

      ws["!cols"] = [
        { wch: 6 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 16 },
        { wch: 14 }, { wch: 16 }, { wch: 14 },
      ]
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
      XLSX.utils.book_append_sheet(wb, ws, "Hisobot")
      XLSX.writeFile(wb, `kpi-hisoboti.xlsx`, { bookType: "xlsx", cellStyles: true })
    } catch (err) { console.error(err) }
  }

  const exportPDF = () => {
    if (!results.length) return
    try {
      const { headers, body } = buildExport()
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(10, 10, 10)
      doc.text(t("attendance_kpi"), 14, 14)

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
          1: { cellWidth: 36 },
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

      doc.save(`kpi-hisoboti.pdf`)
    } catch (err) { console.error(err) }
  }

  const exportCSV = () => {
    if (!results.length) return
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
      a.download = `kpi-hisoboti.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err) }
  }

  // ── Fetch: asosiy data ──

  const fetchData = async (pageNum = 1, filters = activeFiltersRef.current, q = search) => {
    setLoading(true)
    try {
      const params = { page: pageNum }
      if (q) params.search = q
      if (filters.user) params.user = filters.user
      if (filters.region) params.region = filters.region
      if (filters.district) params.district = filters.district
      if (filters.branch) params.branch = filters.branch
      if (filters.department) params.department = filters.department
      if (filters.rating_category) params.rating_category = filters.rating_category
      if (filters.start_date) params.start_date = dayjs(filters.start_date).format("YYYY-MM-DD")
      if (filters.end_date) params.end_date = dayjs(filters.end_date).format("YYYY-MM-DD")

      const res = await axiosAPI.get("analytics/kpi/", { params })
      if (res.status === 200) {
        const data = res.data?.data || {}
        const list = data.results || []
        setResults((prev) => (pageNum === 1 ? list : [...prev, ...list]))
        setCount(data.count || 0)
        setHasMore(!!data.next)
        setPage(pageNum)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch: filter options (kaskad) ──

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
    } catch (err) { console.error(err); setDistrictPag((p) => ({ ...p, loading: false })) }
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
    } catch (err) { console.error(err); setBranchPag((p) => ({ ...p, loading: false })) }
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
    } catch (err) { console.error(err); setDeptPag((p) => ({ ...p, loading: false })) }
  }
  const fetchEmployees = async (pageNum = 1, q = "") => {
    setEmployeePag((p) => ({ ...p, loading: true }))
    try {
      const params = { page: pageNum }
      if (q?.trim()) params.search = q
      const res = await axiosAPI.get("users/employees/", { params })
      if (res.status === 200) {
        const list = (res.data?.data?.results || []).map((e) => ({ value: e.id, label: e.full_name }))
        setEmployees((prev) => (pageNum === 1 ? list : [...prev, ...list]))
        setEmployeePag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) { console.error(err); setEmployeePag((p) => ({ ...p, loading: false })) }
  }

  // ── Effects ──

  useEffect(() => {
    fetchData(1, activeFiltersRef.current, search)
  }, [search])

  useEffect(() => {
    if (filterOpen) {
      fetchRegions()
      fetchBranches(1, "", null, null)   // filial — hech narsa tanlanmagan
      fetchDepartments(1, "", null)       // bo'lim — hech narsa tanlanmagan
      fetchEmployees(1, "")
    }
  }, [filterOpen])

  // ── Kaskad handler'lar ──

  // 1. Viloyat o'zgarganda → tuman reset, filial qayta load (region bo'yicha)
  const handleRegionChange = (opt) => {
    setDraft((p) => ({ ...p, region: opt, district: null, branch: null, department: null }))
    setDistricts([])
    setDistrictPag({ page: 1, hasMore: true, loading: false })
    setBranches([])
    setDepartments([])

    if (opt?.value) {
      fetchDistricts(opt.value, 1, "")
      fetchBranches(1, "", opt.value, null)
    } else {
      // Viloyat tozalandi — filiallarni hammasi ko'rsin
      fetchBranches(1, "", null, null)
      fetchDepartments(1, "", null)
    }
  }

  // 2. Tuman o'zgarganda → filial qayta load (region + district bo'yicha)
  const handleDistrictChange = (opt) => {
    setDraft((p) => ({ ...p, district: opt, branch: null, department: null }))
    setBranches([])
    setDepartments([])

    const regionId = draft.region?.value || null
    if (opt?.value) {
      fetchBranches(1, "", regionId, opt.value)
    } else {
      // Tuman tozalandi — faqat region bo'yicha filter
      fetchBranches(1, "", regionId, null)
    }
  }

  // 3. Filial o'zgarganda → bo'lim qayta load (branch bo'yicha)
  const handleBranchChange = (opt) => {
    setDraft((p) => ({ ...p, branch: opt, department: null }))
    setDepartments([])

    if (opt?.value) {
      fetchDepartments(1, "", opt.value)
    } else {
      fetchDepartments(1, "", null)
    }
  }

  // ── Filter apply / clear ──

  const handleFilterSearch = () => {
    const extraParams = {}
    if (draft.user?.value) extraParams.user = draft.user.value
    if (draft.region?.value) extraParams.region = draft.region.value
    if (draft.district?.value) extraParams.district = draft.district.value
    if (draft.branch?.value) extraParams.branch = draft.branch.value
    if (draft.department?.value) extraParams.department = draft.department.value
    if (draft.rating_category?.value) extraParams.rating_category = draft.rating_category.value
    if (draft.start_date) extraParams.start_date = draft.start_date
    if (draft.end_date) extraParams.end_date = draft.end_date

    activeFiltersRef.current = extraParams
    setApplied({ ...draft })
    setFilterOpen(false)
    fetchData(1, extraParams, search)
  }

  const handleFilterClear = () => {
    activeFiltersRef.current = {}
    setDraft(emptyDraft)
    setApplied(emptyDraft)
    setDistricts([])
    setBranches([])
    setDepartments([])
    setDistrictPag({ page: 1, hasMore: true, loading: false })
    setBranchPag({ page: 1, hasMore: true, loading: false })
    setDeptPag({ page: 1, hasMore: true, loading: false })
    // Hammasini qayta load qilamiz
    fetchBranches(1, "", null, null)
    fetchDepartments(1, "", null)
  }

  const colCount = 11

  return (
    <div className="px-4 pt-3 pb-0! flex flex-col items-start gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between w-full gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder={t("search")}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (e.target.value === "") {
                setSearch("");
              }
            }}
            onKeyDown={(e) => { if (e.key === "Enter") setSearch(searchInput) }}
            className="flex-1 w-[384px] rounded-md! shadow-xs"
          />
          <button
            className="flex items-center gap-1 cursor-pointer relative border shadow-xs text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3"
            onClick={() => setFilterOpen(true)}
          >
            {hasFilter && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
            <HugeIcon icon={FilterVerticalIcon} size={16} />
            {t("filter")}
          </button>
        </div>
        <ExportMenu
          onExcel={exportExcel}
          onPDF={exportPDF}
          onCSV={exportCSV}
          label={t("download")}
        />
      </div>

      {/* ─── Table ─── */}
      <div
        className="w-full h-[calc(100vh-130px)] bg-white dark:bg-[#0A0A0A] flex flex-col overflow-hidden"
      >
        <div
          className="flex-1 overflow-y-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            if (!loading && hasMore && el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
              fetchData(page + 1)
            }
          }}
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#FAFAFA] dark:bg-[#171717] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                {[
                  "#",
                  t("col_employee"),
                  t("region"),
                  t("district"),
                  t("col_branch"),
                  t("department"),
                  t("report_month_title"),
                  t("attendance_kpi_title"),
                  t("monthly_kpi_title"),
                  t("rating_title"),
                  t("total_score_title"),
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-[13px] font-medium text-[#0A0A0A] dark:text-[#f5f5f5] whitespace-nowrap truncate"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && results.length === 0
                ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F0F0F0] dark:border-[#1F1F1F]">
                    {Array.from({ length: colCount }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div
                          className="h-6 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse"
                          style={{ width: j === 1 ? 120 : 60 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
                : results.length === 0
                  ? (
                    <tr>
                      <td colSpan={colCount} className="px-4 py-16 text-center text-sm text-[#737373]">
                        {t("reports_empty")}
                      </td>
                    </tr>
                  )
                  : results.map((r, i) => (
                    <tr
                      key={r.id ?? i}
                      className="border-b border-[#F0F0F0] dark:border-[#1F1F1F] hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5]">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] whitespace-nowrap">{r.user_info?.full_name || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] whitespace-nowrap">{r.region?.name || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] whitespace-nowrap">{r.district?.name || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] whitespace-nowrap">{r.branch?.name || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] whitespace-nowrap">{r.department?.name || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] tabular-nums whitespace-nowrap">
                        {r.month ? dayjs(r.month).format("DD.MM.YYYY") : ""}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5] whitespace-nowrap">{r.attendance_kpi || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5]">{r.monthly_kpi || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5]">{r.rating_display || ""}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-[#f5f5f5]">{r.total_score || ""}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>

          {loading && results.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Filter Modal ─── */}
      <Modal isOpen={filterOpen} onClose={() => setFilterOpen(false)} height={600}>
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="w-11 h-11 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition dark:hover:bg-[#0a0a0a]"
                  onClick={() => setFilterOpen(false)}
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
              {/* Xodim */}
              <Select
                label={t("col_employee")}
                placeholder={t("select_employee")}
                options={employees}
                value={draft.user?.value ?? null}
                onChange={(opt) => setDraft((p) => ({ ...p, user: opt }))}
                searchable
                loadingMore={employeePag.loading}
                onScrollEnd={() => {
                  if (!employeePag.hasMore || employeePag.loading) return
                  fetchEmployees(employeePag.page + 1, "")
                }}
                onSearch={(s) => fetchEmployees(1, s)}
              />

              {/* Reyting */}
              <Select
                label={t("rating_title")}
                placeholder={t("select_rating")}
                options={[
                  { value: "excellent", label: t("excellent") },
                  { value: "good", label: t("good") },
                  { value: "satisfactory", label: t("satisfactory") },
                  { value: "unsatisfactory", label: t("unsatisfactory") },
                ]}
                value={draft.rating_category?.value || null}
                onChange={(opt) => setDraft((p) => ({ ...p, rating_category: opt ?? "" }))}
              />

              {/* Viloyat → handleRegionChange */}
              <Select
                label={t("region")}
                placeholder={t("region_branch_placeholder")}
                options={regions.filter(r => r.label.toLowerCase().includes(searchRegion.toLowerCase()))}
                value={draft.region?.value ?? null}
                onChange={handleRegionChange}
                searchable={true}
                onSearch={(s) => setSearchRegion(s)}
              />

              {/* Tuman → handleDistrictChange (viloyat tanlanmasa disabled) */}
              <Select
                label={t("district_branch_title")}
                placeholder={!draft.region ? t("select_region_first") : t("district_branch_placeholder")}
                options={districts}
                value={draft.district?.value ?? null}
                onChange={handleDistrictChange}
                disabled={!draft.region}
                searchable
                loadingMore={districtPag.loading}
                onScrollEnd={() => {
                  if (!districtPag.hasMore || districtPag.loading || !draft.region?.value) return
                  fetchDistricts(draft.region.value, districtPag.page + 1, "")
                }}
                onSearch={(s) => {
                  if (draft.region?.value) fetchDistricts(draft.region.value, 1, s)
                }}
              />

              {/* Filial → handleBranchChange */}
              <Select
                label={t("col_branch")}
                placeholder={t("select_branch")}
                options={branches}
                value={draft.branch?.value ?? null}
                onChange={handleBranchChange}
                searchable
                loadingMore={branchPag.loading}
                onScrollEnd={() => {
                  if (!branchPag.hasMore || branchPag.loading) return
                  fetchBranches(
                    branchPag.page + 1, "",
                    draft.region?.value || null,
                    draft.district?.value || null
                  )
                }}
                onSearch={(s) =>
                  fetchBranches(1, s, draft.region?.value || null, draft.district?.value || null)
                }
              />

              {/* Bo'lim — faqat filial tanlanganda to'liq list, aks holda ham ko'rsatiladi */}
              <Select
                label={t("department")}
                placeholder={t("select_department")}
                options={departments}
                value={draft.department?.value ?? null}
                onChange={(opt) => setDraft((p) => ({ ...p, department: opt }))}
                searchable
                loadingMore={deptPag.loading}
                onScrollEnd={() => {
                  if (!deptPag.hasMore || deptPag.loading) return
                  fetchDepartments(deptPag.page + 1, "", draft.branch?.value || null)
                }}
                onSearch={(s) => fetchDepartments(1, s, draft.branch?.value || null)}
              />

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
                    value={draft.start_date}
                    onChange={(d) => setDraft((p) => ({ ...p, start_date: d }))}
                    labelClassName="hidden"
                    calendarIcon={draft.start_date ? <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setDraft((p) => ({ ...p, start_date: "" })) }}><X size={18} /></span> : <HugeIcon icon={Calendar02Icon} size={18} />}
                  />
                  <DatePicker
                    currentLang={language}
                    label=" "
                    placeholder={t("date_to")}
                    widthClass="w-full"
                    className="w-full"
                    inputClassName="h-11! bg-white dark:bg-transparent!"
                    value={draft.end_date}
                    onChange={(d) => setDraft((p) => ({ ...p, end_date: d }))}
                    labelClassName="hidden"
                    calendarIcon={draft.end_date ? <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setDraft((p) => ({ ...p, end_date: "" })) }}><X size={18} /></span> : <HugeIcon icon={Calendar02Icon} size={18} />}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer text-[#6B7280] dark:text-[#A3A3A3] hover:text-[#374151] dark:hover:text-white transition-colors"
              onClick={handleFilterClear}
            >
              <X size={14} />
              {t("clear")}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg hover:bg-[#0077DD] transition-colors"
              onClick={handleFilterSearch}
            >
              <HugeIcon size={14} icon={Search01Icon} />
              {t("search")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default index