import { useEffect, useState } from "react"
import dayjs from "dayjs"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  ChevronDownIcon,
  FileSpreadsheet,
  FileText,
  Download,
  ArrowLeft,
  X,
} from "lucide-react"
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { TbXboxXFilled } from "react-icons/tb"
import { uz, ru, enUS, uzCyrl } from "date-fns/locale"

import { useLanguage } from "../../Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn, exportAoaToCsv } from "@/lib/utils"
import { ExportMenu } from "@/components/ui/ExportMenu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { Calendar02Icon, Download01Icon, FilterVerticalIcon, Logout01Icon, Pdf02Icon, Search01Icon, TimeQuarter02Icon } from "@hugeicons/core-free-icons"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"

const calendarLocales = { uz, cy: uzCyrl, ru, en: enUS }

// Davr tugmalari — API `period` qiymatlariga bog'langan
const PERIODS = [
  { value: "daily", labelKey: "period_daily" },
  { value: "weekly", labelKey: "period_weekly" },
  { value: "monthly", labelKey: "period_monthly" },
  { value: "quarterly", labelKey: "period_quarterly" },
  { value: "yearly", labelKey: "period_yearly" },
]

// Raqamlarni "1 200" ko'rinishida formatlash
const fmt = (n) =>
  Number(n ?? 0)
    .toLocaleString("ru-RU")
    .replace(/ /g, " ")
    .replace(/,/g, " ")

const Reports = () => {
  const { t, language } = useLanguage()
  const locale = calendarLocales[language] || uz

  const [reportType, setReportType] = useState("branch") // 'branch' | 'employee'
  const [period, setPeriod] = useState("daily")
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [data, setData] = useState({ results: [], summary: null })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  const [openFilterModal, setOpenFilterModal] = useState(false)

  const isBranch = reportType === "branch"
  const results = data?.results || []
  const summary = data?.summary || null

  const [districtPag, setDistrictPag] = useState({ page: 1, hasMore: true, loading: false })

  const showToast = (message) =>
    setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))


  // 1. State'lar qo'shiladi (mavjud state'lar tagiga)
  const [regions, setRegions] = useState([])
  const [districts, setDistricts] = useState([])
  const [regionsLoading, setRegionsLoading] = useState(false)
  const [districtsLoading, setDistrictsLoading] = useState(false)

  const [filterRegion, setFilterRegion] = useState(null)      // { value, label }
  const [filterDistrict, setFilterDistrict] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [filterPosition, setFilterPosition] = useState(null)


  const [positions, setPositions] = useState([])

  const [positionPag, setPositionPag] = useState({ page: 1, hasMore: true, loading: false })

  // 2. Region'larni yuklash
  const fetchRegions = async () => {
    setRegionsLoading(true)
    try {
      const res = await axiosAPI.get("users/regions/")
      if (res.status === 200) {
        setRegions(
          (res.data?.data?.results || []).map((r) => ({ value: r.id, label: r.name }))
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRegionsLoading(false)
    }
  }

  const fetchPositions = async (pageNum = 1, search = "") => {
    setPositionPag(p => ({ ...p, loading: true }))
    if (pageNum === 1 && !search) {
      // faqat boshlang'ich yuklashda tozalamaymiz, lekin yangi qidiruvda ro'yxat almashadi
    }
    try {
      const params = { page: pageNum }
      if (search?.trim()) params.search = search
      const res = await axiosAPI.get("users/positions/", { params })
      if (res.status === 200) {
        const results = (res.data?.data?.results || []).map((r) => ({ value: r.id, label: r.name }))
        setPositions(prev => pageNum === 1 ? results : [...prev, ...results])
        setPositionPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) {
      console.error(err)
      setPositionPag(p => ({ ...p, loading: false }))
    }
  }

  // 3. District'larni yuklash (region tanlanganda)
  const fetchDistricts = async (regionId, pageNum = 1, search = "") => {
    setDistrictPag(p => ({ ...p, loading: true }))
    if (pageNum === 1) {
      setFilterDistrict(null)
      setDistricts([])
    }
    try {
      const params = { page: pageNum, region: regionId }
      if (search?.trim()) params.search = search
      const res = await axiosAPI.get("users/districts/", { params })
      if (res.status === 200) {
        const results = (res.data?.data?.results || []).map(d => ({ value: d.id, label: d.name }))
        setDistricts(prev => pageNum === 1 ? results : [...prev, ...results])
        setDistrictPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
      }
    } catch (err) {
      console.error(err)
      setDistrictPag(p => ({ ...p, loading: false }))
    }
  }

  // 4. Modal ochilganda region'larni yuklash
  useEffect(() => {
    if (openFilterModal) { fetchRegions(); fetchPositions(1, ""); }
  }, [openFilterModal])

  // 5. Region o'zgarganda district'larni yuklash
  const handleRegionChange = (opt) => {
    setFilterRegion(opt)
    setDistricts([])
    setFilterDistrict(null)
    setDistrictPag({ page: 1, hasMore: true, loading: false })
    if (opt?.value) fetchDistricts(opt.value, 1, "")
  }

  // 6. fetchReports — filter param'larini qo'shish
  const fetchReports = async (extraParams = {}) => {
    setLoading(true)
    try {
      const endpoint = isBranch
        ? "analytics/reports/by-branch/"
        : "analytics/reports/by-employee/"

      const params = { ...extraParams }

      // Custom date bo'lsa, period qo'shmaymiz
      if (period !== "custom") {
        params.period = period
      }

      if (period === "custom" && selectedDate) {
        if (selectedDate.from) {
          params.start_date = dayjs(selectedDate.from).format("YYYY-MM-DD")
          params.end_date = selectedDate.to
            ? dayjs(selectedDate.to).format("YYYY-MM-DD")
            : dayjs(selectedDate.from).format("YYYY-MM-DD")
        } else {
          const d = dayjs(selectedDate).format("YYYY-MM-DD")
          params.start_date = d
          params.end_date = d
        }
      }

      const res = await axiosAPI.get(endpoint, { params })
      if (res.status === 200) {
        setData(res.data?.data || { results: [], summary: null })
      }
    } catch (err) {
      console.error(err)
      setData({ results: [], summary: null })
    } finally {
      setLoading(false)
    }
  }

  // 7. Search tugmasi bosilganda
  const handleFilterSearch = () => {
    const extraParams = {}
    if (filterRegion?.value) extraParams.region_id = filterRegion.value
    if (filterDistrict?.value) extraParams.district_id = filterDistrict.value
    if (filterStatus?.value) extraParams.status = filterStatus.value
    if (filterPosition?.value) extraParams.position_id = filterPosition.value   // YANGI
    setOpenFilterModal(false)
    fetchReports(extraParams)
  }

  // 8. Tozalash
  const handleFilterClear = () => {
    setFilterRegion(null)
    setFilterDistrict(null)
    setFilterStatus(null)
    setFilterPosition(null)              // YANGI
    setDistricts([])
    setPositionPag({ page: 1, hasMore: true, loading: false })   // YANGI
  }


  // 9. Status options — tarjima orqali
  const STATUS_OPTIONS = [
    { value: "present", label: t("status_present") },
    { value: "absent", label: t("status_absent") },
    { value: "late", label: t("status_late") },
  ]

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, period, selectedDate])

  const handlePeriodChange = (value) => {
    setSelectedDate(null)
    setPeriod(value)
  }

  const handleSelectDate = (date) => {
    if (!date) return
    setSelectedDate(date)
    setPeriod("custom")
    if (!date.from) {
      setCalendarOpen(false)
    }
  }

  const clearDate = (e) => {
    e.stopPropagation()
    setSelectedDate(null)
    setPeriod("daily")
  }

  const dateLabel = selectedDate
    ? selectedDate.from
      ? `${dayjs(selectedDate.from).format("DD.MM.YYYY")}${selectedDate.to ? ` \u00bb ${dayjs(selectedDate.to).format("DD.MM.YYYY")}` : ""}`
      : dayjs(selectedDate).format("DD.MM.YYYY")
    : t("byDate")

  // ─── Eksport ───
  const nameOf = (r) => (isBranch ? r.branch : r.full_name) || "—"

  const buildExport = () => {
    const headers = [
      "#",
      t(isBranch ? "col_branch" : "col_employee"),
      t("col_total"),
      t("col_arrived"),
      t("col_late"),
      t("col_absent"),
      t("col_early"),
      t("col_discipline_kpi"),
    ]
    const body = results.map((r, i) => [
      i + 1,
      nameOf(r),
      r.total_expected ?? 0,
      r.present ?? 0,
      r.late ?? 0,
      r.absent ?? 0,
      r.left_early ?? 0,
      r.discipline_kpi ?? "—",
    ])
    const totalRow = summary
      ? [
        "",
        t("total_row"),
        summary.total_expected ?? 0,
        summary.present ?? 0,
        summary.late ?? 0,
        summary.absent ?? 0,
        summary.left_early ?? 0,
        summary.discipline_kpi ?? "—",
      ]
      : null
    return { headers, body, totalRow }
  }

  const exportExcel = () => {
    if (!results.length) return showToast(t("export_empty_warning"))
    const { headers, body, totalRow } = buildExport()
    const aoa = [headers, ...body]
    if (totalRow) aoa.push(totalRow)
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws["!cols"] = headers.map((_, i) => ({ wch: i === 1 ? 26 : 14 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Hisobot")
    XLSX.writeFile(wb, `davomat-hisoboti-${period}.xlsx`)
    showToast(t("export_excel_success"))
  }

  const exportPDF = () => {
    if (!results.length) return showToast(t("export_empty_warning"))
    const { headers, body, totalRow } = buildExport()
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(t("reports"), 14, 16)
    autoTable(doc, {
      head: [headers],
      body: totalRow ? [...body, totalRow] : body,
      startY: 22,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      footStyles: { fillColor: [239, 244, 255] },
    })
    doc.save(`davomat-hisoboti-${period}.pdf`)
    showToast(t("export_pdf_success"))
  }

  const exportCSV = () => {
    if (!results.length) return showToast(t("export_empty_warning"))
    const { headers, body, totalRow } = buildExport()
    const aoa = [headers, ...body]
    if (totalRow) aoa.push(totalRow)
    exportAoaToCsv(`davomat-hisoboti-${period}.csv`, aoa)
    showToast(t("export_csv_success"))
  }

  const Pill = ({ icon: Icon, iconClass, children, iconType }) => (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2E2E2E] px-2.5 py-1 text-sm text-[#1A1A1A] dark:text-white">
      {Icon && (iconType === "huge" ?
        <HugeIcon icon={Icon} size={14} className={cn("flex-shrink-0", iconClass)} /> :
        <Icon size={14} className={cn("flex-shrink-0", iconClass)} />
      )}
      <span className="tabular-nums">{children}</span>
    </span>
  )

  const colCount = 8
  const hasFilter = filterDistrict || filterRegion || filterStatus

  return (
    <div className="p-4 pb-0! flex flex-col items-start gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between w-full gap-4 flex-wrap">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
            {t("reports")}
          </h1>
          <span className="text-[#737373] text-sm">{t("reports_subtitle")}</span>
        </div>

        {/* Davr filtri + sana */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-md bg-[#F5F5F5] dark:bg-[#262626] p-1">
            {PERIODS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePeriodChange(opt.value)}
                className={cn(
                  "rounded-sm px-3 py-1 text-[13px] font-medium text-[#0A0A0A] dark:text-white cursor-pointer transition-colors",
                  opt.value === period
                    ? "bg-white dark:bg-[#0A0A0A] shadow-sm"
                    : "hover:bg-[#f4f4f4] dark:hover:bg-[#262626]"
                )}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg shadow-xs border-2 border-[#f5f5f5] dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] px-3 py-1.5 text-[13px] font-medium cursor-pointer text-[#0A0A0A] dark:text-white",
                    period === "custom"
                      ? "bg-[#F5F5F5] dark:bg-[#2E2E2E]"
                      : ""
                  )}
                >
                  {dateLabel}
                  {selectedDate ? (
                    <TbXboxXFilled
                      className="size-3.5 text-gray-400 cursor-pointer mb-0.5"
                      onClick={clearDate}
                    />
                  ) : (
                    <HugeIcon icon={Calendar02Icon} />
                  )}
                </button>
              }
            />
            <PopoverContent className="w-auto overflow-hidden p-0" align="end" sideOffset={8}>
              <Calendar
                daterange={true}
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(new Date().getFullYear() - 5, 0)}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                selected={selectedDate}
                onSelect={handleSelectDate}
                locale={locale}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ─── Tab + Eksport ─── */}
      <div className="flex items-center justify-between w-full gap-4 flex-wrap">
        {/* Tab toggle */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-lg bg-[#f5f5f5] dark:bg-[#171717] p-0.5 shadow-sm">
            {[
              { value: "branch", labelKey: "tab_by_branch" },
              { value: "employee", labelKey: "tab_by_employee" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setReportType(tab.value)}
                className={cn(
                  "rounded-md px-2 py-[3px] text-[13px] font-semibold text-[#0A0A0A] dark:text-white cursor-pointer transition-colors",
                  reportType === tab.value
                    ? "bg-white dark:bg-[#0A0A0A] shadow-sm border-2"
                    : ""
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <button
            className="flex items-center gap-1 cursor-pointer relative border-[1.7px] text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3"
            onClick={() => setOpenFilterModal(true)}
          >
            {hasFilter && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]"></span>}
            <HugeIcon icon={FilterVerticalIcon} size={16} />
            {t("filter")}
          </button>
        </div>

        {/* Yuklash: Excel / PDF / CSV */}
        <ExportMenu
          onExcel={exportExcel}
          onPDF={exportPDF}
          onCSV={exportCSV}
          label={t("download")}
        />
      </div>

      {/* ─── Jadval ─── */}
      <div className="w-full h-[calc(100vh-200px)] bg-white dark:bg-[#0A0A0A] flex flex-col overflow-hidden">

        {/* Scrollable area: faqat thead + tbody */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse text-left table-fixed">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[18%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#FAFAFA] dark:bg-[#171717] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                {[
                  "#",
                  t(isBranch ? "col_branch" : "col_employee"),
                  t("region"),
                  t("district"),
                  t("col_total"),
                  t("come"),
                  t("latecomers"),
                  t("absent"),
                  t("early_leavers"),
                  t("col_discipline_kpi"),
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
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F0F0F0] dark:border-[#1F1F1F]">
                    {Array.from({ length: colCount }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-6 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-16 text-center text-sm text-[#737373]">
                    {t("reports_empty")}
                  </td>
                </tr>
              ) : (
                results.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className="border-b border-[#F0F0F0] dark:border-[#1F1F1F] hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#737373] dark:text-[#444444]">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-white truncate" title={nameOf(r)}>
                      {nameOf(r)}
                    </td>
                    <td className="px-4 py-3 text-sm truncate">{r.region}</td>
                    <td className="px-4 py-3 text-sm truncate">{r.district}</td>
                    <td className="px-4 py-3">
                      <Pill>{fmt(r.total_expected)}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={CheckCircle2} iconClass="text-[#22A565]">{fmt(r.present)}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={TimeQuarter02Icon} iconType="huge" iconClass="text-[#F97316]">{fmt(r.late)}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={XCircle} iconClass="text-[#EF4444]">{fmt(r.absent)}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <Pill icon={Logout01Icon} iconType="huge" iconClass="text-[#9CA3AF]">{fmt(r.left_early)}</Pill>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1A1A1A] dark:text-white">
                      {r.discipline_kpi ?? ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary — scroll'dan tashqarida, flex-shrink-0, har doim eng pastda */}
        {!loading && results.length > 0 && summary && (
          <div className="flex-shrink-0 border-t border-[#E5E7EB] dark:border-[#2E2E2E]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[18%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[8%]" />
              </colgroup>
              <tbody>
                <tr className="bg-[#EFF4FF] dark:bg-[#1D2A52]">
                  <td colSpan={4} className="px-4 py-3.5 text-sm font-medium text-[#1A1A1A] dark:text-white">
                    {t("total_row")}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#1A1A1A] dark:text-white tabular-nums">
                    {fmt(summary.total_expected)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#22A565] tabular-nums">
                    {fmt(summary.present)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#F97316] tabular-nums">
                    {fmt(summary.late)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#EF4444] tabular-nums">
                    {fmt(summary.absent)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#1A1A1A] dark:text-white tabular-nums">
                    {fmt(summary.left_early)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#0066FF] dark:text-[#5EB1EF]">
                    {summary.discipline_kpi ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Toast ─── */}
      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <Modal
        isOpen={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
        height={600}
      >
        <div className="flex flex-col justify-between h-full">
          {/* top section */}
          <div className="flex flex-col gap-3">
            {/* nav */}
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

            {/* main section */}
            <div className="grid grid-cols-2 gap-3">
              {/* Region */}
              <Select
                label={t("region_branch_title")}
                placeholder={t("region_branch_placeholder")}
                options={regions}
                value={filterRegion?.value ?? null}
                onChange={handleRegionChange}
              />

              {/* District — region tanlanmasa disabled */}
              <Select
                label={t("district_branch_title")}
                placeholder={!filterRegion ? t("select_region_first") : t("district_branch_placeholder")}
                options={districts}
                value={filterDistrict?.value ?? null}
                onChange={(opt) => setFilterDistrict(opt)}
                disabled={!filterRegion}
                loadingMore={districtPag.loading}
                onScrollEnd={() => {
                  if (!districtPag.hasMore || districtPag.loading || !filterRegion?.value) return
                  fetchDistricts(filterRegion.value, districtPag.page + 1, "")
                }}
                onSearch={(s) => {
                  if (filterRegion?.value) fetchDistricts(filterRegion.value, 1, s)
                }}
                searchable={true}
              />
              {/* Status — faqat employee uchun */}
              {reportType === "employee" && (
                <Select
                  label={t("status")}
                  placeholder={t("select_status")}
                  options={STATUS_OPTIONS}
                  value={filterStatus?.value ?? null}
                  onChange={(opt) => setFilterStatus(opt)}
                />
              )}
              {reportType === "employee" && (
                <Select
                  label={t("position")}
                  placeholder={t("select_position")}
                  options={positions}
                  value={filterPosition?.value ?? null}
                  onChange={(opt) => setFilterPosition(opt)}
                  loadingMore={positionPag.loading}
                  onScrollEnd={() => {
                    if (!positionPag.hasMore || positionPag.loading) return
                    fetchPositions(positionPag.page + 1, "")
                  }}
                  onSearch={(s) => fetchPositions(1, s)}
                  searchable={true}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer"
              onClick={handleFilterClear}
            >
              <X size={14} />
              {t("clear")}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg"
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

export default Reports
