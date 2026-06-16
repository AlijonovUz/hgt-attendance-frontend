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
} from "lucide-react"
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { TbXboxXFilled } from "react-icons/tb"
import { uz, ru, enUS, uzCyrl } from "date-fns/locale"

import { useLanguage } from "../../Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toast } from "@/components/ui/Toast"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { Calendar02Icon, Download01Icon, Logout01Icon, Pdf02Icon, TimeQuarter02Icon } from "@hugeicons/core-free-icons"

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

  const isBranch = reportType === "branch"
  const results = data?.results || []
  const summary = data?.summary || null

  const showToast = (message) =>
    setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

  const fetchReports = async () => {
    setLoading(true)
    try {
      const endpoint = isBranch
        ? "analytics/reports/by-branch/"
        : "analytics/reports/by-employee/"

      const params = { period }
      if (period === "custom" && selectedDate) {
        if (selectedDate.from) {
          params.start_date = dayjs(selectedDate.from).format("YYYY-MM-DD")
          params.end_date = selectedDate.to ? dayjs(selectedDate.to).format("YYYY-MM-DD") : dayjs(selectedDate.from).format("YYYY-MM-DD")
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
    if (!date.from || (date.from && date.to)) {
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

  return (
    <div className="p-4 flex flex-col items-start gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

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
        <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-[#f5f5f5] dark:bg-[#171717] p-1 shadow-sm">
          {[
            { value: "branch", labelKey: "tab_by_branch" },
            { value: "employee", labelKey: "tab_by_employee" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setReportType(tab.value)}
              className={cn(
                "rounded-md px-2 py-1.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white cursor-pointer transition-colors",
                reportType === tab.value
                  ? "bg-white dark:bg-[#0A0A0A] shadow-sm"
                  : ""
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Excel / PDF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] px-4 py-1.5 text-[13px] font-semibold text-[#1A1A1A] dark:text-white shadow-sm cursor-pointer hover:bg-[#f4f4f4] dark:hover:bg-[#262626]"
          >
            <PiMicrosoftExcelLogo size={18} className="text-[#22A565]" />
            Excel
            <HugeIcon icon={Download01Icon} size={16} />
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] px-4 py-1.5 text-[13px] font-semibold text-[#1A1A1A] dark:text-white shadow-sm cursor-pointer hover:bg-[#f4f4f4] dark:hover:bg-[#262626]"
          >
            <HugeIcon icon={Pdf02Icon} size={16} className="text-[#0588F0]" />
            PDF
            <HugeIcon icon={Download01Icon} size={16} />
          </button>
        </div>
      </div>

      {/* ─── Jadval ─── */}
      <div className="w-full rounded-2xl max-h-[calc(100vh-215px)] border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#0A0A0A] flex flex-col overflow-hidden">

        {/* Scrollable area: thead + tbody */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#FAFAFA] dark:bg-[#171717] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                {[
                  "#",
                  t(isBranch ? "col_branch" : "col_employee"),
                  t("col_total"),
                  t("col_arrived"),
                  t("col_late"),
                  t("col_absent"),
                  t("col_early"),
                  t("col_discipline_kpi"),
                ].map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-4 py-3 text-[13px] font-medium text-[#6B7280] dark:text-[#fafafa] whitespace-nowrap",
                      i === 0 && "w-12 dark:text-[#444444]"
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
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
                    <td className="px-4 py-3 text-sm font-medium text-[#1A1A1A] dark:text-white max-w-[220px] truncate" title={nameOf(r)}>
                      {nameOf(r)}
                    </td>
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
              {/* Jami qatori — har doim pastda qotib turadi */}
              {!loading && results.length > 0 && summary && (
                <tr className="bg-[#EFF4FF] sticky bottom-0 z-10 dark:bg-[#1D2A52]">
                  <td className="w-12 px-4 py-3.5" />
                  <td className="px-4 py-3.5 text-sm font-medium text-[#1A1A1A] dark:text-white">
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
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default Reports
