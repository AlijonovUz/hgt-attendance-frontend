// src/pages/ActionHistory.jsx
import { useEffect, useRef, useState, useCallback } from "react"
import dayjs from "dayjs"
import { ArrowLeft, ChevronDownIcon, X } from "lucide-react"
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

const PAGE_SIZE_FALLBACK = 20

// Backend'dagi `action` qiymatlari — tarjima orqali
const ACTION_OPTIONS_KEYS = [
     { value: "create", labelKey: "action_create" },
     { value: "update", labelKey: "action_update" },
     { value: "delete", labelKey: "action_delete" },
]

const ActionHistory = () => {
     const { t, language } = useLanguage()

     const [logs, setLogs] = useState([])
     const [count, setCount] = useState(0)
     const [loading, setLoading] = useState(true)     // birinchi yuklash
     const [loadingMore, setLoadingMore] = useState(false) // scroll pagination
     const [hasMore, setHasMore] = useState(true)
     const [page, setPage] = useState(1)

     const [search, setSearch] = useState("")
     const [searchInput, setSearchInput] = useState("")
     const searchTimer = useRef(null)

     const tableContainerRef = useRef(null)

     // Committed filtrlar
     const [filterUser, setFilterUser] = useState(null)     // { value, label }
     const [filterAction, setFilterAction] = useState(null)
     const [filterTable, setFilterTable] = useState(null)

     // Modal ichidagi vaqtinchalik filtrlar
     const [openFilterModal, setOpenFilterModal] = useState(false)
     const [tmpUser, setTmpUser] = useState(null)
     const [tmpAction, setTmpAction] = useState(null)
     const [tmpTable, setTmpTable] = useState(null)

     const [TABLE_OPTIONS_KEYS, setTABLE_OPTIONS_KEYS] = useState([])

     // Foydalanuvchi select uchun ro'yxat + pagination
     const [users, setUsers] = useState([])
     const [userPag, setUserPag] = useState({ page: 1, hasMore: true, loading: false })

     // Sana filtrlari
     const [startDate, setStartDate] = useState("")
     const [endDate, setEndDate] = useState("")

     const [filterStartDate, setFilterStartDate] = useState("")
     const [filterEndDate, setFilterEndDate] = useState("")

     const hasFilter = !!(filterUser || filterAction || filterTable || filterStartDate || filterEndDate)

     const ACTION_OPTIONS = ACTION_OPTIONS_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }))
     const TABLE_OPTIONS = TABLE_OPTIONS_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }))

     // ─── Foydalanuvchilarni qidiruv bilan yuklash (filter modal uchun) ───
     const fetchUsers = async (pageNum = 1, searchTerm = "") => {
          setUserPag((p) => ({ ...p, loading: true }))
          try {
               const params = { page: pageNum }
               if (searchTerm?.trim()) params.search = searchTerm
               const res = await axiosAPI.get("users/employees/", { params })
               if (res.status === 200) {
                    const results = (res.data?.data?.results || []).map((u) => ({ value: u.id, label: u.full_name }))
                    setUsers((prev) => (pageNum === 1 ? results : [...prev, ...results]))
                    setUserPag({ page: pageNum, hasMore: !!res.data?.data?.next, loading: false })
               }
          } catch (err) {
               console.error(err)
               setUserPag((p) => ({ ...p, loading: false }))
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
                    user: filterUser?.value || undefined,
                    action: filterAction?.value || undefined,
                    table_name: filterTable?.value || undefined,
                    start_date: filterStartDate ? dayjs(filterStartDate).format("YYYY-MM-DD") : undefined,
                    end_date: filterEndDate ? dayjs(filterEndDate).format("YYYY-MM-DD") : undefined,
                    ...extraParams,
               }
               const res = await axiosAPI.get("audit/logs/", { params })
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
     }, [search, filterUser, filterAction, filterTable, filterStartDate, filterEndDate])

     // ─── Scroll pagination ───
     const handleScroll = useCallback(() => {
          const el = tableContainerRef.current
          if (!el || loading || loadingMore || !hasMore) return
          const { scrollTop, scrollHeight, clientHeight } = el
          if (scrollTop + clientHeight >= scrollHeight - 80) {
               fetchLogs(page + 1)
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [loading, loadingMore, hasMore, page, search, filterUser, filterAction, filterTable, filterStartDate, filterEndDate])

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
          setTmpUser(filterUser)
          setTmpAction(filterAction)
          setTmpTable(filterTable)
          setUsers(filterUser ? [filterUser] : [])
          setUserPag({ page: 1, hasMore: true, loading: false })
          fetchUsers(1, "")
          setOpenFilterModal(true)
     }

     const applyFilter = () => {
          setFilterUser(tmpUser)
          setFilterAction(tmpAction)
          setFilterTable(tmpTable)
          setFilterStartDate(startDate)
          setFilterEndDate(endDate)
          setOpenFilterModal(false)
     }

     const clearFilter = () => {
          setTmpUser(null)
          setTmpAction(null)
          setTmpTable(null)
          setFilterUser(null)
          setFilterAction(null)
          setFilterTable(null)
          setStartDate("")
          setEndDate("")
          setFilterStartDate("")
          setFilterEndDate("")
     }

     useEffect(() => {
          const tableNames = [...new Set(logs.map(l => l.table_name))].map(n => ({ value: n, label: n }))

          console.log(tableNames);


          setTABLE_OPTIONS_KEYS(tableNames)
     }, [logs])


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
               t("col_user") || "Foydalanuvchi",
               t("region") || "Viloyat",
               t("district") || "Tuman",
               t("branch") || "Filial",
               t("action_type") || "Harakat turi",
               t("table_name_col") || "Jadval nomi",
               t("object_name_col") || "Obyekt nomi",
               t("col_time") || "Vaqti",
          ]
          const body = logs.map((r, i) => [
               i + 1,
               r.user_full_name || "—",
               r.region?.name || r?.region || "",
               r.district?.name || r?.district || "",
               r.branch?.name || r?.branch || "",
               r.action_display || "",
               r.table_name || "",
               r.object_name || "",
               r.created_at ? dayjs(r.created_at).format("DD.MM.YYYY HH:mm") : "",
          ])
          return { headers, body }
     }

     const exportExcel = () => {
          if (!logs.length) return
          const { headers, body } = buildExport()
          const ws = XLSX.utils.aoa_to_sheet([headers, ...body])
          ws["!cols"] = [{ wch: 6 }, { wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 30 }, { wch: 18 }]
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
          XLSX.utils.book_append_sheet(wb, ws, "Harakatlar")
          XLSX.writeFile(wb, "harakatlar-tarixi.xlsx", { bookType: "xlsx", cellStyles: true })
     }

     const exportPDF = () => {
          if (!logs.length) return
          const { headers, body } = buildExport()
          const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
          doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(10, 10, 10)
          doc.text(t("history_m_actions") || "Harakatlar Tarixi", 14, 14)
          doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(115, 115, 115)
          doc.text(dayjs().format("DD.MM.YYYY HH:mm"), 14, 21)
          autoTable(doc, {
               head: [headers], body,
               startY: 27, margin: { left: 14, right: 14 },
               styles: { fontSize: 8, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }, lineColor: [212, 212, 212], lineWidth: 0.2, font: "helvetica", textColor: [26, 26, 26], overflow: "ellipsize" },
               headStyles: { fillColor: [240, 240, 240], textColor: [10, 10, 10], fontStyle: "bold", fontSize: 8 },
               alternateRowStyles: { fillColor: [250, 250, 250] },
               bodyStyles: { fillColor: [255, 255, 255] },
               columnStyles: { 0: { halign: "center", cellWidth: 10 }, 1: { cellWidth: 32 }, 7: { cellWidth: 44 } },
          })
          const pc = doc.internal.getNumberOfPages()
          for (let i = 1; i <= pc; i++) {
               doc.setPage(i)
               doc.setFontSize(7.5).setTextColor(160, 160, 160)
               doc.text(`${i} / ${pc}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" })
          }
          doc.save("harakatlar-tarixi.pdf")
     }

     const exportCSV = () => {
          if (!logs.length) return
          const { headers, body } = buildExport()
          const escape = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s }
          const csv = "\uFEFF" + [headers, ...body].map(r => r.map(escape).join(",")).join("\r\n")
          const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })), download: "harakatlar-tarixi.csv" })
          a.click(); URL.revokeObjectURL(a.href)
     }

     const COLS = 8

     return (
          <div className="p-4 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

               {/* ─── Filters row ─── */}
               <div className="flex items-center justify-between w-full gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                         <Input
                              type="text"
                              value={searchInput}
                              onChange={handleSearchChange}
                              placeholder={t("search_action_history") || "Qidirish..."}
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
                    <div ref={tableContainerRef} className="h-[calc(100vh-140px)] overflow-auto">
                         <table className="w-full border-collapse text-left">
                              <thead className="sticky top-0 z-[1]">
                                   <tr className="bg-[#FAFAFA] dark:bg-[#262626] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                                        {[
                                             { label: "#", cls: "w-12" },
                                             { label: t("col_user") || "Foydalanuvchi" },
                                             { label: t("region") || "Foydalanuvchi" },
                                             { label: t("district") || "Foydalanuvchi" },
                                             { label: t("branch") || "Foydalanuvchi" },
                                             { label: t("action_type") || "Harakat turi" },
                                             { label: t("table_name_col") || "Jadval nomi" },
                                             { label: t("object_name_col") || "Obyekt nomi" },
                                             { label: t("col_time") || "Vaqti", cls: "text-end" },
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
                                                       className="border-b border-[#F0F0F0] dark:border-[#1A1A1A] hover:bg-[#FAFAFA] dark:hover:bg-[#111]"
                                                  >
                                                       <td className="px-4 py-3.5 text-sm font-medium dark:text-[#f5f5f5]">{i + 1}</td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                                                            {log.user_full_name || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                                                            {log.region?.name || log?.region || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                                                            {log.district?.name || log?.district || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                                                            {log.branch?.name || log?.branch || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                                                            {log.action_display}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5] truncate max-w-[160px]">
                                                            {log.table_name}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm text-[#0A0A0A] dark:text-[#f5f5f5] truncate max-w-[260px]" title={log.object_name}>
                                                            {log.object_name}
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

                                   {/* Foydalanuvchi */}
                                   <Select
                                        label={t("col_user") || "Foydalanuvchi"}
                                        placeholder={t("select_user") || "Foydalanuvchi tanlang"}
                                        options={users}
                                        value={tmpUser?.value ?? null}
                                        onChange={(opt) => setTmpUser(opt)}
                                        loadingMore={userPag.loading}
                                        onScrollEnd={() => {
                                             if (!userPag.hasMore || userPag.loading) return
                                             fetchUsers(userPag.page + 1, "")
                                        }}
                                        onSearch={(s) => fetchUsers(1, s)}
                                        searchable={true}
                                   />

                                   {/* Harakat turi */}
                                   <Select
                                        label={t("action_type") || "Harakat turi"}
                                        placeholder={t("select_action_type") || "Harakat turini tanlang"}
                                        options={ACTION_OPTIONS}
                                        value={tmpAction?.value ?? null}
                                        onChange={(opt) => setTmpAction(opt)}
                                   />

                                   {/* Jadval nomi */}
                                   <Select
                                        label={t("table_name_col") || "Jadval nomi"}
                                        placeholder={t("select_table_name") || "Jadval nomini tanlang"}
                                        options={TABLE_OPTIONS_KEYS}
                                        value={tmpTable?.value ?? null}
                                        onChange={(opt) => setTmpTable(opt)}
                                        contanierClassName="col-span-2"
                                        searchable={true}
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
          </div>
     )
}

export default ActionHistory