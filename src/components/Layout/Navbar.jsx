import { useLocation } from "react-router-dom"
import { ChevronRight, PanelLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { useLanguage } from "@/Context/LanguageContext"

// Route → translation key xaritasi
const routeMap = {
     "": "mainPage",
     "employee-register": "employeeRestr",
     "reports": "reports",
     "geozones": "geozone",
     "settings": "settings",
     "references": "ref_menu_title",
     "regions": "ref_m_region",
     "districts": "ref_m_district",
     "branches": "ref_m_branch",
     "departments": "ref_m_dept",
     "positions": "ref_m_position",
     "roles": "ref_m_role",
     "holidays": "ref_m_holiday",
     "schedule": "ref_m_schedule",
     "history": "history_menu_title",
     "actions": "history_m_actions",
     "faceid": "history_m_faceid",
     "location": "history_m_location",
     "signature": "history_m_signature",
}

const Navbar = ({ setSidebarCollapsed }) => {
     const { t } = useLanguage()
     const { pathname } = useLocation()

     // Breadcrumb hisoblash
     const segments = pathname.split("/").filter(Boolean)  // ['employee-register'] yoki []
     const isHome = segments.length === 0

     // Faqat joriy sahifa nomi — "Asosiy sahifa" boshqa sahifalarda ko'rinmaydi
     const breadcrumbs = isHome
          ? [{ label: t("mainPage"), path: "/" }]
          : segments.map((seg, i) => ({
               label: t(routeMap[seg] ?? seg),
               path: "/" + segments.slice(0, i + 1).join("/"),
          }))

     return (
          <header className="sticky top-0 z-10 h-14 flex items-center bg-white dark:bg-[#0A0A0A] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
               <div className="flex items-center w-full px-4 gap-3">

                    {/* Sidebar toggle */}
                    <button
                         onClick={() => setSidebarCollapsed(prev => !prev)}
                         className="flex-shrink-0 dark:text-[#fff] text-[#1A1A1A] cursor-pointer"
                    >
                         <PanelLeft size={18} strokeWidth={1.7} />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-5 bg-[#E5E7EB] dark:bg-[#2E2E2E] flex-shrink-0" />

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 flex-1 min-w-0" aria-label="breadcrumb">
                         {breadcrumbs.map((crumb, idx) => {
                              const isLast = idx === breadcrumbs.length - 1
                              return (
                                   <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                                        {idx > 0 && (
                                             <ChevronRight
                                                  size={14}
                                                  strokeWidth={1.8}
                                                  className="flex-shrink-0 text-[#9CA3AF] dark:text-[#6B7280]"
                                             />
                                        )}
                                        <span
                                             className={`text-sm truncate ${isLast
                                                  ? "text-[#1A1A1A] dark:text-white"
                                                  : "text-[#6B7280] dark:text-[#9CA3AF]"
                                                  }`}
                                        >
                                             {crumb.label}
                                        </span>
                                   </span>
                              )
                         })}
                    </nav>

                    {/* Language Switcher + Bildirishnomalar */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                         <LanguageSwitcher />
                         <NotificationBell />
                    </div>

               </div>
          </header>
     )
}

export default Navbar
