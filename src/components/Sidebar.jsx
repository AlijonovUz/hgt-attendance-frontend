import { useState } from "react"
import { useLanguage } from "@/Context/LanguageContext"
import {
     LayoutDashboard,
     Users,
     FileBarChart2,
     Settings,
     HelpCircle,
     FileText,
     ChevronDown,
} from "lucide-react"
import { useSelector } from "react-redux"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { UserDropdown } from "./ui/UserDropdown"
import { HugeIcon } from "./ui/HugeIcon"
import { TransactionHistoryIcon } from "@hugeicons/core-free-icons"
import { HelpModal } from "./ui/HelpModal"


const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
     const currentUser = useSelector((state) => state.references.currentUser)
     const userPermission = useSelector((state) => state.references.userPermission)

     const { t } = useLanguage()
     const navigate = useNavigate()
     const location = useLocation()

     const [refOpen, setRefOpen] = useState(() => location.pathname.startsWith("/references"))
     const refActive = location.pathname.startsWith("/references")

     const [historyOpen, setHistoryOpen] = useState(() => location.pathname.startsWith("/history"))
     const historyActive = location.pathname.startsWith("/history")

     const [reportsOpen, setReportsOpen] = useState(() => location.pathname.startsWith("/reports"))
     const reportsActive = location.pathname.startsWith("/reports")
     const [helpOpen, setHelpOpen] = useState(false)

     const toggleReports = () => {
          setReportsOpen((prev) => {
               const next = !prev
               if (next) {
                    setRefOpen(false)
                    setHistoryOpen(false)
               }
               return next
          })
     }

     const toggleReferences = () => {
          setRefOpen((prev) => {
               const next = !prev
               if (next) {
                    setReportsOpen(false)
                    setHistoryOpen(false)
               }
               return next
          })
     }

     const toggleHistory = () => {
          setHistoryOpen((prev) => {
               const next = !prev
               if (next) {
                    setReportsOpen(false)
                    setRefOpen(false)
               }
               return next
          })
     }

     const openHelp = () => {
          setReportsOpen(false)
          setRefOpen(false)
          setHistoryOpen(false)
          setHelpOpen(true)
     }

     const viewAULog = userPermission?.logs &&
          userPermission?.logs?.some(
               (e) => e.code === "log_view_audit"
          );
     const viewSGLog = userPermission?.logs &&
          userPermission?.logs?.some(
               (e) => e.code === "log_view_signature"
          );
     const viewGPLog = userPermission?.logs &&
          userPermission?.logs?.some(
               (e) => e.code === "log_view_gps"
          );
     const viewFCLog = userPermission?.logs &&
          userPermission?.logs?.some(
               (e) => e.code === "log_view_face"
          );


     const HISTORY_CHILDREN = [
          ...(viewAULog ? [{ key: "actions", labelKey: "history_m_actions", path: "/history/actions" }] : []),
          ...(viewFCLog ? [{ key: "faceid", labelKey: "history_m_faceid", path: "/history/faceid" }] : []),
          ...(viewGPLog ? [{ key: "location", labelKey: "history_m_location", path: "/history/location" }] : []),
          ...(viewSGLog ? [{ key: "signature", labelKey: "history_m_signature", path: "/history/signature" }] : []),
     ]

     const viewEmp = userPermission?.employees &&
          userPermission?.employees?.some(
               (e) => e.code === "employee_view_all" || e.code === "employee_view_district" || e.code === "employee_view_region" || e.code === "employee_view_branch" || e.code === "employee_view_dept"
          );

     const viewgeo = userPermission?.geozones && userPermission?.geozones.some(e => e.code === "geozone_view")

     const viewRep = userPermission?.reports && userPermission?.reports.some(e => (e.code === "report_type_employee" || e.code === "report_type_branch"))

     const viewRepGeneral = userPermission?.reports && userPermission?.reports.some(e => e.code === "report_type_employee" || e.code === "report_type_branch")
     const viewRepKPI = userPermission?.kpis
     const viewRepDaily = userPermission?.dailys
     const viewRepEvents = userPermission?.reports

     const viewhol = userPermission?.holidays && userPermission?.holidays.some(e => e.code === "holiday_view")
     const viewsch = userPermission?.schedules && userPermission?.schedules.some(e => e.code === "schedule_view")
     const viewreg = userPermission?.regions
     const viewdis = userPermission?.districts
     const viewbrs = userPermission?.branchs
     const viewdep = userPermission?.departments
     const viewpos = userPermission?.positions
     const viewrol = userPermission?.roles

     const REF_CHILDREN = [
          ...(viewreg ? [{ key: "regions", labelKey: "ref_m_region" }] : []),
          ...(viewdis ? [{ key: "districts", labelKey: "ref_m_district" }] : []),
          ...(viewbrs ? [{ key: "branchs", labelKey: "ref_m_branch" }] : []),
          ...(viewdep ? [{ key: "departments", labelKey: "ref_m_dept" }] : []),
          ...(viewpos ? [{ key: "positions", labelKey: "ref_m_position" }] : []),
          ...(viewrol ? [{ key: "roles", labelKey: "ref_m_role" }] : []),
          ...(viewhol ? [{ key: "holidays", labelKey: "ref_m_holiday" }] : []),
          ...(viewhol ? [{ key: "holiday-calendar", labelKey: "ref_m_holiday_calendar" }] : []),
          ...(viewsch ? [{ key: "schedule", labelKey: "ref_m_schedule" }] : []),
     ]

     const REPORTS_CHILDREN = [
          ...(viewRepGeneral ? [{ key: "general", labelKey: "report_m_general", path: "/reports/general" }] : []),
          ...(viewRepKPI ? [{ key: "kpi", labelKey: "report_m_kpi", path: "/reports/kpi" }] : []),
          ...(viewRepDaily ? [{ key: "daily", labelKey: "report_m_daily", path: "/reports/daily" }] : []),
          ...(viewRepEvents ? [{ key: "events", labelKey: "report_m_events", path: "/reports/events" }] : []),
     ]

     const sidebarItems = [
          {
               id: "home",
               icon: LayoutDashboard,
               label: t("mainPage"),
               path: "",
          },
          ...(viewEmp ? [{
               id: "employeeRestr",
               icon: Users,
               label: t("employeeRestr"),
               path: "/employee-register",
          }] : []),
     ]

     const bottomItems = [
          {
               id: "settings",
               icon: Settings,
               label: t("settings"),
               path: "/settings",
          },
          {
               id: "help",
               icon: HelpCircle,
               label: t("help"),
               onClick: openHelp,
          },
     ]

     return (
          <div
               className={`
               relative z-20 flex flex-col justify-between flex-shrink-0 h-full bg-[#FAFAFA] dark:bg-[#1C1C1C] border-r border-[#E5E7EB] dark:border-[#2E2E2E] transition-[width] duration-300 ease-in-out ${sidebarCollapsed ? "w-[60px]" : "w-[320px]"}`}
               onClick={() => setSidebarCollapsed(sidebarCollapsed ? false : false)}
          >

               {/* ─── TOP ─── */}
               <div className={`flex flex-col ${sidebarCollapsed ? "" : "overflow-y-auto"} gap-1`}>

                    {/* Logo */}
                    <div
                         className={`flex items-center sticky top-0 z-20 bg-[#FAFAFA] dark:bg-[#1C1C1C] gap-2.5 p-2.5 cursor-pointer min-w-0 ${sidebarCollapsed ? "ml-[3px]" : ""}`}
                         onClick={() => navigate("/")}
                    >
                         <img
                              src="/logo.svg"
                              alt="logo"
                              className="w-8 h-8 object-contain flex-shrink-0"
                         />
                         <span className={`
                              font-semibold text-[15px] text-[#1A1A1A] dark:text-white tracking-tight whitespace-nowrap
                              transition-[opacity,transform] duration-300 ease-in-out
                              ${sidebarCollapsed ? "opacity-0 -translate-x-2 pointer-events-none" : "opacity-100 translate-x-0"}
                         `}>
                              Davomat
                         </span>
                    </div>

                    {/* Nav items */}
                    <nav className="flex flex-col gap-0.5 px-2 pt-1" onClick={(e) => e.stopPropagation()}>
                         {sidebarItems.map((item) => {
                              const Icon = item?.icon
                              return (
                                   <NavLink
                                        key={item.id}
                                        to={item.path}
                                        end={item.path === ""}
                                        className={({ isActive }) =>
                                             `flex items-center gap-3 px-3 py-2.5! rounded-lg text-sm text-[#1A1A1A] dark:text-white font-medium overflow-hidden
                                             ${isActive
                                                  ? "bg-[#F5F5F5] dark:bg-[#2A2A2A] shadow-xs"
                                                  : "hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"
                                             }`
                                        }
                                        title={sidebarCollapsed ? item.label : undefined}
                                   >
                                        {Icon
                                             ? <Icon size={18} className="flex-shrink-0" strokeWidth={1.7} />
                                             : <img src={item?.img} alt="" className="w-[18px] h-[18px] flex-shrink-0 dark:invert" />
                                        }
                                        <span className={`
                                             whitespace-nowrap truncate
                                             transition-[opacity,transform] duration-300 ease-in-out
                                             ${sidebarCollapsed ? "opacity-0 -translate-x-1 w-0" : "opacity-100 translate-x-0 w-auto"}
                                        `}>
                                             {item.label}
                                        </span>
                                   </NavLink>
                              )
                         })}

                         {/* ─── Hisobotlar (ochiluvchi) ─── */}
                         {(viewRepGeneral || viewRepKPI || viewRepDaily || viewRepEvents) &&
                              <>
                                   <button
                                        type="button"
                                        onClick={toggleReports}
                                        title={sidebarCollapsed ? t("report_menu_title") : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] dark:text-white overflow-hidden cursor-pointer
        ${reportsActive ? "bg-[#F5F5F5] dark:bg-[#2A2A2A] shadow-xs" : "hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"}`}
                                   >
                                        <FileBarChart2 size={18} className="flex-shrink-0" strokeWidth={1.7} />
                                        <span className={`whitespace-nowrap truncate flex-1 text-left transition-[opacity,transform] duration-300 ease-in-out
        ${sidebarCollapsed ? "opacity-0 -translate-x-1 w-0" : "opacity-100 translate-x-0 w-auto"}`}>
                                             {t("report_menu_title")}
                                        </span>
                                        {!sidebarCollapsed && (
                                             <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ease-in-out text-[#6B7280] dark:text-[#9CA3AF] ${reportsOpen ? "rotate-180" : ""}`} />
                                        )}
                                   </button>

                                   <div
                                        className={`ml-[22px] pl-3 flex flex-col gap-0.5 border-l border-[#E5E7EB] dark:border-[#2E2E2E] overflow-hidden transition-all duration-300 ease-in-out
                                        ${reportsOpen && !sidebarCollapsed ? "max-h-60 opacity-100 mt-0.5" : "max-h-0 opacity-0 pointer-events-none"}`}
                                   >
                                        {REPORTS_CHILDREN.map((child) => (
                                             <NavLink
                                                  key={child.key}
                                                  to={child.path}
                                                  className={({ isActive }) =>
                                                       `px-3 py-2 rounded-lg text-[13px] truncate
              ${isActive
                                                            ? "text-[#0A0A0A] dark:text-white font-medium bg-[#F5F5F5] dark:bg-[#2A2A2A]"
                                                            : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"
                                                       }`
                                                  }
                                             >
                                                  {t(child.labelKey)}
                                             </NavLink>
                                        ))}
                                   </div>
                              </>
                         }

                         {/* ─── Geozone ─── */}
                         {viewgeo && (
                              <NavLink
                                   to="/geozones"
                                   className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#1A1A1A] dark:text-white font-medium overflow-hidden
      ${isActive
                                             ? "bg-[#F5F5F5] dark:bg-[#2A2A2A] shadow-xs"
                                             : "hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"
                                        }`
                                   }
                                   title={sidebarCollapsed ? t("geozone") : undefined}
                              >
                                   <img src="/bar-chart.svg" alt="" className="w-[18px] h-[18px] flex-shrink-0 dark:invert" />
                                   <span className={`whitespace-nowrap truncate transition-[opacity,transform] duration-300 ease-in-out ${sidebarCollapsed ? "opacity-0 -translate-x-1 w-0" : "opacity-100 translate-x-0 w-auto"}`}>
                                        {t("geozone")}
                                   </span>
                              </NavLink>
                         )}

                         {/* ─── Ma'lumotnomalar (ochiluvchi) ─── */}
                         {(viewgeo || viewRep || viewhol || viewsch || viewreg || viewdis || viewbrs || viewdep || viewpos || viewrol) &&
                              <>
                                   <button
                                        type="button"
                                        onClick={toggleReferences}
                                        title={sidebarCollapsed ? t("ref_menu_title") : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] dark:text-white overflow-hidden cursor-pointer
                                   ${refActive ? "bg-[#F5F5F5] dark:bg-[#2A2A2A] shadow-xs" : "hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"}`}
                                   >
                                        <FileText size={18} className="flex-shrink-0" strokeWidth={1.7} />
                                        <span className={`whitespace-nowrap truncate flex-1 text-left transition-[opacity,transform] duration-300 ease-in-out
                                   ${sidebarCollapsed ? "opacity-0 -translate-x-1 w-0" : "opacity-100 translate-x-0 w-auto"}`}>
                                             {t("ref_menu_title")}
                                        </span>
                                        {!sidebarCollapsed && (
                                             <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ease-in-out text-[#6B7280] dark:text-[#9CA3AF] ${refOpen ? "rotate-180" : ""}`} />
                                        )}
                                   </button>

                                   {/* Ichki bo'limlar */}
                                   <div
                                        className={`ml-[22px] pl-3 flex flex-col gap-0.5 border-l border-[#E5E7EB] dark:border-[#2E2E2E] overflow-hidden transition-all duration-300 ease-in-out
                                        ${refOpen && !sidebarCollapsed ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0 pointer-events-none"}`}
                                   >
                                        {REF_CHILDREN.map((child) => (
                                             <NavLink
                                                  key={child.key}
                                                  to={`/references/${child.key}`}
                                                  className={({ isActive }) =>
                                                       `px-3 py-2 rounded-lg text-[13px] truncate
                                                  ${isActive
                                                            ? "text-[#0A0A0A] dark:text-white font-medium bg-[#F5F5F5] dark:bg-[#2A2A2A]"
                                                            : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"
                                                       }`
                                                  }
                                             >
                                                  {t(child.labelKey)}
                                             </NavLink>
                                        ))}
                                   </div>
                              </>
                         }

                         {/* ─── Umumiy tarix (ochiluvchi) ─── */}
                         {(viewAULog || viewFCLog || viewGPLog || viewSGLog) &&
                              <>
                                   <button
                                        type="button"
                                        onClick={toggleHistory}
                                        title={sidebarCollapsed ? t("history_menu_title") : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] dark:text-white overflow-hidden cursor-pointer
          ${historyActive ? "bg-[#F5F5F5] dark:bg-[#2A2A2A] shadow-xs" : "hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"}`}
                                   >
                                        <HugeIcon icon={TransactionHistoryIcon} size={18} className="flex-shrink-0" />
                                        <span className={`whitespace-nowrap truncate flex-1 text-left transition-[opacity,transform] duration-300 ease-in-out
          ${sidebarCollapsed ? "opacity-0 -translate-x-1 w-0" : "opacity-100 translate-x-0 w-auto"}`}>
                                             {t("history_menu_title")}
                                        </span>
                                        {!sidebarCollapsed && (
                                             <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ease-in-out text-[#6B7280] dark:text-[#9CA3AF] ${historyOpen ? "rotate-180" : ""}`} />
                                        )}
                                   </button>

                                   {/* Ichki bo'limlar */}
                                   <div
                                        className={`ml-[22px] pl-3 flex flex-col gap-0.5 border-l border-[#E5E7EB] dark:border-[#2E2E2E] overflow-hidden transition-all duration-300 ease-in-out
                                        ${historyOpen && !sidebarCollapsed ? "max-h-60 opacity-100 mt-0.5" : "max-h-0 opacity-0 pointer-events-none"}`}
                                   >
                                        {HISTORY_CHILDREN.map((child) => (
                                             <NavLink
                                                  key={child.key}
                                                  to={child.path}
                                                  className={({ isActive }) =>
                                                       `px-3 py-2 rounded-lg text-[13px] truncate ${isActive
                                                            ? "text-[#0A0A0A] dark:text-white font-medium bg-[#F5F5F5] dark:bg-[#2A2A2A]"
                                                            : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"
                                                       }`
                                                  }
                                             >
                                                  {t(child.labelKey)}
                                             </NavLink>
                                        ))}
                                   </div>
                              </>
                         }
                    </nav>
               </div>

               {/* ─── BOTTOM ─── */}
               <div className="flex flex-col sticky bottom-0 z-20 bg-[#FAFAFA] dark:bg-[#1C1C1C] gap-1 pb-2" onClick={(e) => e.stopPropagation()}>
                    {!sidebarCollapsed && (
                         <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
                    )}

                    {/* Bottom nav items */}
                    <nav className="flex flex-col gap-0.5 px-2">
                         {bottomItems.map((item) => {
                              const Icon = item.icon
                              const label = (
                                   <span className={`
                                        whitespace-nowrap truncate
                                        transition-[opacity,transform] duration-300 ease-in-out
                                        ${sidebarCollapsed ? "opacity-0 -translate-x-1 w-0" : "opacity-100 translate-x-0 w-auto"}
                                   `}>
                                        {item.label}
                                   </span>
                              )

                              // Tashqi havola (masalan Telegram) — yangi tabda ochiladi
                              if (item.onClick) {
                                   return (
                                        <button
                                             type="button"
                                             key={item.id}
                                             onClick={item.onClick}
                                             className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] dark:text-white overflow-hidden hover:bg-[#F5F5F5] dark:hover:bg-[#252525] cursor-pointer text-left"
                                             title={sidebarCollapsed ? item.label : undefined}
                                        >
                                             <Icon size={18} className="flex-shrink-0" strokeWidth={1.7} />
                                             {label}
                                        </button>
                                   )
                              }

                              return (
                                   <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                             `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] dark:text-white overflow-hidden
                                             ${isActive
                                                  ? "bg-[#F5F5F5] dark:bg-[#2A2A2A]"
                                                  : "hover:bg-[#F5F5F5] dark:hover:bg-[#252525]"
                                             }`
                                        }
                                        title={sidebarCollapsed ? item.label : undefined}
                                   >
                                        <Icon size={18} className="flex-shrink-0" strokeWidth={1.7} />
                                        {label}
                                   </NavLink>
                              )
                         })}
                    </nav>

                    {/* Theme Toggle */}
                    {/* {!sidebarCollapsed &&
                         <div className={`
                         mx-2 mt-1 mb-1 flex items-center
                         bg-[#F5F5F5] dark:bg-[#252525] rounded-lg p-0.5
                         transition-[opacity,transform] duration-300 ease-in-out
                    `}>
                              <button
                                   onClick={() => setTheme("light")}
                                   className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium cursor-pointer
                                   ${theme === "light"
                                             ? "bg-white dark:bg-[#1C1C1C] text-[#1A1A1A] dark:text-white shadow-sm"
                                             : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white"
                                        }`}
                              >
                                   <span className="whitespace-nowrap">{t("light_theme")}</span>
                                   <Sun size={13} strokeWidth={1.8} />
                              </button>
                              <button
                                   onClick={() => setTheme("dark")}
                                   className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium cursor-pointer
                                   ${theme === "dark"
                                             ? "bg-white dark:bg-[#1C1C1C] text-[#1A1A1A] dark:text-white shadow-sm"
                                             : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white"
                                        }`}
                              >
                                   <span className="whitespace-nowrap">{t("dark_theme")}</span>
                                   <Moon size={13} strokeWidth={1.8} />
                              </button>
                         </div>
                    } */}

                    {/* User Profile */}
                    <div className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#252525] rounded-lg">
                         {/* Avatar */}
                         {currentUser?.face_image ? (
                              <img src={currentUser.face_image} alt="user avatar" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                         ) : (
                              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-[#85a6db] to-[#bfadea] flex items-center justify-center text-white text-xs font-semibold uppercase select-none">
                                   {currentUser?.full_name?.split(" ").slice(0, 2).map(n => n.charAt(0)) ?? "?"}
                              </div>
                         )}

                         <div className={`
                              flex items-center gap-1 flex-1 min-w-0
                              transition-[opacity,transform] duration-300 ease-in-out
                              ${sidebarCollapsed ? "opacity-0 -translate-x-1 pointer-events-none" : "opacity-100 translate-x-0"}
                         `}>
                              <div className="flex-1 min-w-0">
                                   <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-white truncate leading-tight whitespace-nowrap">
                                        {currentUser?.full_name ?? ""}
                                   </p>
                                   <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate leading-tight whitespace-nowrap">
                                        {currentUser?.role_info?.name || ""}
                                   </p>
                              </div>
                              {/* <button
                                   className="flex-shrink-0 p-1 rounded-md text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#2E2E2E] cursor-pointer"
                              > */}
                              <UserDropdown currentUser={currentUser} />
                              {/* </button> */}
                         </div>
                    </div>

               </div>

          </div>
     )
}

export default Sidebar
