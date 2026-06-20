// src/pages/SignatureHistory.jsx
import { useEffect, useRef, useState, useCallback } from "react"
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

const REGION_ENDPOINT = "users/regions/"
const DISTRICT_ENDPOINT = "users/districts/"
const BRANCH_ENDPOINT = "users/branches/"

const STATUS_OPTIONS_KEYS = [
     { value: "true", labelKey: "status_success" },
     { value: "false", labelKey: "status_failed" },
]

const COLS = 7

const SignatureHistory = () => {
     const { t, language } = useLanguage()

     // ─── Data ───
     const [logs, setLogs] = useState([])
     const [loading, setLoading] = useState(true)
     const [loadingMore, setLoadingMore] = useState(false)
     const [hasMore, setHasMore] = useState(true)
     const [page, setPage] = useState(1)

     // ─── Search ───
     const [search, setSearch] = useState("")
     const [searchInput, setSearchInput] = useState("")
     const searchTimer = useRef(null)

     const tableContainerRef = useRef(null)

     // ─── Committed filters ───
     const [filterRegion, setFilterRegion] = useState(null)
     const [filterDistrict, setFilterDistrict] = useState(null)
     const [filterBranch, setFilterBranch] = useState(null)
     const [filterStatus, setFilterStatus] = useState(null)
     const [filterStartDate, setFilterStartDate] = useState("")
     const [filterEndDate, setFilterEndDate] = useState("")

     // ─── Modal temp filters ───
     const [openFilterModal, setOpenFilterModal] = useState(false)
     const [tmpRegion, setTmpRegion] = useState(null)
     const [tmpDistrict, setTmpDistrict] = useState(null)
     const [tmpBranch, setTmpBranch] = useState(null)
     const [tmpStatus, setTmpStatus] = useState(null)
     const [startDate, setStartDate] = useState("")
     const [endDate, setEndDate] = useState("")

     const hasFilter = !!(filterRegion || filterDistrict || filterBranch || filterStatus || filterStartDate || filterEndDate)

     const STATUS_OPTIONS = STATUS_OPTIONS_KEYS.map((o) => ({ value: o.value, label: t(o.labelKey) }))

     // ─── Dropdown lists ───
     const [regions, setRegions] = useState([])
     const [districts, setDistricts] = useState([])
     const [branches, setBranches] = useState([])

     const fetchRegions = async () => {
          try {
               const res = await axiosAPI.get(REGION_ENDPOINT)
               if (res.status === 200) {
                    const results = res.data?.data?.results || res.data?.data || []
                    setRegions(results.map((r) => ({ value: r.id, label: r.name_uz || r.name })))
               }
          } catch (err) { console.error(err) }
     }

     const fetchDistricts = async (regionId) => {
          try {
               const res = await axiosAPI.get(DISTRICT_ENDPOINT, { params: regionId ? { region: regionId } : {} })
               if (res.status === 200) {
                    const results = res.data?.data?.results || res.data?.data || []
                    setDistricts(results.map((d) => ({ value: d.id, label: d.name_uz || d.name })))
               }
          } catch (err) { console.error(err) }
     }

     const fetchBranches = async (districtId) => {
          try {
               const res = await axiosAPI.get(BRANCH_ENDPOINT, { params: districtId ? { district: districtId } : {} })
               if (res.status === 200) {
                    const results = res.data?.data?.results || res.data?.data || []
                    setBranches(results.map((b) => ({ value: b.id, label: b.name })))
               }
          } catch (err) { console.error(err) }
     }

     // ─── Fetch logs ───
     const fetchLogs = async (pageNum = 1) => {
          if (pageNum === 1) setLoading(true)
          else setLoadingMore(true)

          try {
               const params = {
                    page: pageNum,
                    search: search || undefined,
                    region: filterRegion?.value || undefined,
                    district: filterDistrict?.value || undefined,
                    branch: filterBranch?.value || undefined,
                    is_valid: filterStatus?.value || undefined,
                    start_date: filterStartDate || undefined,
                    end_date: filterEndDate || undefined,
               }
               const res = await axiosAPI.get("attendance/signature-logs/", { params })
               if (res.status === 200) {
                    const data = res.data?.data || res.data || {}
                    const results = data.results || []
                    setLogs((prev) => (pageNum === 1 ? results : [...prev, ...results]))
                    setHasMore(!!data.next)
                    setPage(pageNum)
               }
          } catch (err) {
               console.error(err)
               if (pageNum === 1) { setLogs([]); setHasMore(false) }
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
          if (scrollTop + clientHeight >= scrollHeight - 80) fetchLogs(page + 1)
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [loading, loadingMore, hasMore, page, search, filterRegion, filterDistrict, filterBranch, filterStatus, filterStartDate, filterEndDate])

     useEffect(() => {
          const el = tableContainerRef.current
          if (!el) return
          el.addEventListener("scroll", handleScroll)
          return () => el.removeEventListener("scroll", handleScroll)
     }, [handleScroll])

     // ─── Search debounce ───
     const handleSearchChange = (e) => {
          setSearchInput(e.target.value)
          clearTimeout(searchTimer.current)
          searchTimer.current = setTimeout(() => setSearch(e.target.value), 400)
     }

     // ─── Filter modal ───
     const openFilter = () => {
          setTmpRegion(filterRegion)
          setTmpDistrict(filterDistrict)
          setTmpBranch(filterBranch)
          setTmpStatus(filterStatus)
          setStartDate(filterStartDate)
          setEndDate(filterEndDate)
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
          setTmpRegion(null); setTmpDistrict(null); setTmpBranch(null); setTmpStatus(null)
          setFilterRegion(null); setFilterDistrict(null); setFilterBranch(null); setFilterStatus(null)
          setStartDate(""); setEndDate("")
          setFilterStartDate(""); setFilterEndDate("")
     }

     const handleRegionChange = (opt) => {
          setTmpRegion(opt); setTmpDistrict(null); setTmpBranch(null)
          setDistricts([]); setBranches([])
          fetchDistricts(opt?.value)
     }

     const handleDistrictChange = (opt) => {
          setTmpDistrict(opt); setTmpBranch(null); setBranches([])
          fetchBranches(opt?.value)
     }

     // ─── Status badge helper ───
     // message matniga qarab turlicha badge qaytaradi
     const StatusBadge = ({ log }) => {
          if (log.is_valid) {
               return (
                    <span className="inline-flex items-center gap-1 text-[#16A34A]">
                         <CheckCircle2 size={15} />
                         {t("status_success") || "Muvaffaqiyatli"}
                    </span>
               )
          }
          // is_valid === false bo'lganda message'ga qarab label
          const msg = (log.message || "").toLowerCase()
          let label = t("status_failed") || "Yaroqsiz"
          if (msg.includes("kelajak") || msg.includes("future")) label = t("status_future") || "Kelajdagi vaqt"
          if (msg.includes("eskirgan") || msg.includes("expired")) label = t("status_expired") || "24 soatdan eskirgan vaqt"

          return (
               <span className="inline-flex items-center gap-1 text-[#DC2626]" title={log.message}>
                    <XCircle size={15} />
                    {label}
               </span>
          )
     }

     // ─── Excel export ───
     const exportExcel = async () => {
          const XLSX = await import("xlsx")
          const headers = [
               "#",
               t("col_employee") || "Xodim",
               t("region") || "Viloyat",
               t("district") || "Tuman",
               t("branch") || "Filial",
               t("status") || "Holat",
               t("col_time") || "Yaratilgan vaqti",
          ]
          const rows = logs.map((r, i) => [
               i + 1,
               r.user_info?.full_name || "—",
               r.region?.name_uz || r.region?.name || "",
               r.district?.name_uz || r.district?.name || "",
               r.branch?.name || "",
               r.is_valid ? (t("status_success") || "Muvaffaqiyatli") : (t("status_failed") || "Yaroqsiz"),
               r.created_at ? dayjs(r.created_at).format("DD.MM.YYYY HH:mm") : "",
          ])
          const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
          ws["!cols"] = headers.map((_, i) => ({ wch: i === 1 ? 26 : 18 }))
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, "Imzo tarixi")
          XLSX.writeFile(wb, "imzo-tarixi.xlsx")
     }

     const [exportOpen, setExportOpen] = useState(false)
     const exportRef = useRef(null)
     useEffect(() => {
          const fn = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false) }
          document.addEventListener("mousedown", fn)
          return () => document.removeEventListener("mousedown", fn)
     }, [])

     // ─── Render ───
     return (
          <div className="p-4 flex flex-col gap-5 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">

               {/* ── Toolbar ── */}
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
                              onClick={openFilter}
                              className="flex items-center gap-1 cursor-pointer relative border-[1.7px] text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3 text-[#0A0A0A] dark:text-white"
                         >
                              {hasFilter && (
                                   <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]" />
                              )}
                              <HugeIcon icon={FilterVerticalIcon} size={16} />
                              {t("filter")}
                         </button>
                    </div>

                    {/* Export */}
                    <div ref={exportRef} className="relative">
                         <button
                              type="button"
                              onClick={() => setExportOpen((p) => !p)}
                              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#0a0a0a] px-3 py-1.5 text-sm font-semibold text-[#0A0A0A] dark:text-white shadow-sm hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
                         >
                              <HugeIcon icon={Download01Icon} size={15} />
                              {t("upload") || "Yuklash"}
                              <ChevronDownIcon size={15} className={cn("transition-transform", exportOpen && "rotate-180")} />
                         </button>

                         {exportOpen && (
                              <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] rounded-xl shadow-lg overflow-hidden min-w-[150px] py-1">
                                   <button
                                        type="button"
                                        onClick={() => { exportExcel(); setExportOpen(false) }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#0a0a0a] dark:text-[#f5f5f5] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                                   >
                                        Excel
                                   </button>
                              </div>
                         )}
                    </div>
               </div>

               {/* ── Table ── */}
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
                                             { label: t("col_time") || "Yuborilgan vaqti", cls: "text-end" },
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
                                                       className={cn(
                                                            "border-b border-[#F0F0F0] dark:border-[#1A1A1A]",
                                                            log.is_valid
                                                                 ? "hover:bg-[#FAFAFA] dark:hover:bg-[#111]"
                                                                 : "bg-[#FFDBDC] dark:bg-[#1C0A0A] hover:bg-[#FEE2E2] dark:hover:bg-[#321818]"
                                                       )}
                                                  >
                                                       <td className="px-4 py-3.5 text-sm font-medium dark:text-[#f5f5f5]">
                                                            {i + 1}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[200px]">
                                                            {log.user_info?.full_name || "—"}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                                                            {og.region?.name || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                                                            {log.district?.name || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[160px]">
                                                            {log.branch?.name || ""}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm font-medium">
                                                            {log.message}
                                                       </td>
                                                       <td className="px-4 py-3.5 text-sm text-end font-medium text-[#0A0A0A] dark:text-[#f5f5f5] tabular-nums whitespace-nowrap">
                                                            {log.created_at ? dayjs(log.created_at).format("DD.MM.YYYY HH:mm") : ""}
                                                       </td>
                                                  </tr>
                                             ))}

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

               {/* ── Filter modal ── */}
               <Modal isOpen={openFilterModal} onClose={() => setOpenFilterModal(false)} height={600}>
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
                                   {/* Start date */}
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
                                        calendarIcon={
                                             startDate
                                                  ? <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setStartDate("") }}><X size={18} /></span>
                                                  : <HugeIcon icon={Calendar02Icon} size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                                        }
                                        showTime
                                   />

                                   {/* End date */}
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
                                        calendarIcon={
                                             endDate
                                                  ? <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setEndDate("") }}><X size={18} /></span>
                                                  : <HugeIcon icon={Calendar02Icon} size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                                        }
                                        showTime
                                   />

                                   {/* Region */}
                                   <Select
                                        label={t("region") || "Viloyat"}
                                        placeholder={t("gz_region_ph") || "Viloyat tanlang"}
                                        options={regions}
                                        value={tmpRegion?.value ?? null}
                                        onChange={handleRegionChange}
                                        searchable
                                   />

                                   {/* District */}
                                   <Select
                                        label={t("district") || "Tuman"}
                                        placeholder={t("gz_district_ph") || "Tuman tanlang"}
                                        options={districts}
                                        value={tmpDistrict?.value ?? null}
                                        onChange={handleDistrictChange}
                                        searchable
                                        disabled={!tmpRegion}
                                   />

                                   {/* Branch */}
                                   <Select
                                        label={t("branch") || "Filial"}
                                        placeholder={t("select_branch") || "Filial tanlang"}
                                        options={branches}
                                        value={tmpBranch?.value ?? null}
                                        onChange={(opt) => setTmpBranch(opt)}
                                        searchable
                                        disabled={!tmpDistrict}
                                   />

                                   {/* Status */}
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
          </div>
     )
}

export default SignatureHistory