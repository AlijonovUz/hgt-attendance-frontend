import { useLanguage } from "@/Context/LanguageContext"
import { useTheme } from "@/Context/ThemeContext"
import {
     LayoutDashboard,
     Users,
     FileBarChart2,
     MapPin,
     Settings,
     HelpCircle,
     Sun,
     Moon,
     MoreVertical,
} from "lucide-react"
import { useSelector } from "react-redux"
import { NavLink, useNavigate } from "react-router-dom"

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
     const currentUser = useSelector((state) => state.references.currentUser)

     const { t } = useLanguage()
     const { theme, setTheme } = useTheme()
     const navigate = useNavigate()

     const sidebarItems = [
          {
               id: "home",
               icon: LayoutDashboard,
               label: t("mainPage"),
               path: "",
          },
          {
               id: "employeeRestr",
               icon: Users,
               label: t("employeeRestr"),
               path: "/employee-register",
          },
          {
               id: "reports",
               icon: FileBarChart2,
               label: t("reports"),
               path: "/reports",
          },
          {
               id: "geozone",
               img: "/bar-chart.svg",
               label: t("geozone"),
               path: "/geozones",
          },
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
               path: "/help",
          },
     ]

     return (
          <div
               className={`
               flex flex-col justify-between flex-shrink-0
               h-full
               bg-[#FAFAFA] dark:bg-[#1C1C1C]
               border-r border-[#E5E7EB] dark:border-[#2E2E2E]
               overflow-hidden
               transition-[width] duration-300 ease-in-out
               ${sidebarCollapsed ? "w-[60px]" : "w-[255px]"}`}
               onClick={() => setSidebarCollapsed(sidebarCollapsed ? false : false)}
          >

               {/* ─── TOP ─── */}
               <div className="flex flex-col gap-1">

                    {/* Logo */}
                    <div
                         className={`flex items-center gap-2.5 p-2.5 cursor-pointer min-w-0 ${sidebarCollapsed ? "ml-[3px]" : ""}`}
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
                                             `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#1A1A1A] dark:text-white font-medium overflow-hidden
                                             ${isActive
                                                  ? "bg-[#F5F5F5] dark:bg-[#2A2A2A]"
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
                    </nav>
               </div>

               {/* ─── BOTTOM ─── */}
               <div className="flex flex-col gap-1 pb-2" onClick={(e) => e.stopPropagation()}>

                    {/* Bottom nav items */}
                    <nav className="flex flex-col gap-0.5 px-2">
                         {bottomItems.map((item) => {
                              const Icon = item.icon
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
                    </nav>

                    {/* Theme Toggle */}
                    {!sidebarCollapsed &&
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
                    }

                    {/* User Profile */}
                    <div className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#252525] rounded-lg transition-colors duration-150 overflow-hidden">
                         {/* Avatar */}
                         <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-[#85a6db] to-[#bfadea] flex items-center justify-center text-white text-xs font-semibold uppercase select-none">
                              {currentUser?.full_name?.split(" ").slice(0, 2).map(n => n.charAt(0)) ?? "?"}
                         </div>

                         <div className={`
                              flex items-center gap-1 flex-1 min-w-0
                              transition-[opacity,transform] duration-300 ease-in-out
                              ${sidebarCollapsed ? "opacity-0 -translate-x-1 pointer-events-none" : "opacity-100 translate-x-0"}
                         `}>
                              <div className="flex-1 min-w-0">
                                   <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-white truncate leading-tight whitespace-nowrap">
                                        {currentUser?.role_info?.name || ""}
                                   </p>
                                   <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate leading-tight whitespace-nowrap">
                                        {currentUser?.full_name ?? ""}
                                   </p>
                              </div>
                              <button className="flex-shrink-0 p-1 rounded-md text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#2E2E2E] transition-all duration-150 cursor-pointer">
                                   <MoreVertical size={15} strokeWidth={1.8} />
                              </button>
                         </div>
                    </div>

               </div>
          </div>
     )
}

export default Sidebar