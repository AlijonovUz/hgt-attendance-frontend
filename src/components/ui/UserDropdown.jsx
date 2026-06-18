import { useRef, useState, useEffect } from "react"
import { MoreVertical } from "lucide-react"
import { useTheme } from "@/Context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { HugeIcon } from "./HugeIcon"
import { LogoutCircle02Icon, Male02Icon, Moon02Icon, Spinner, Sun03Icon } from "@hugeicons/core-free-icons"
import { useLanguage } from "@/Context/LanguageContext"

export const UserDropdown = ({ currentUser }) => {
     const [open, setOpen] = useState(false)
     const [isLoggingOut, setIsLoggingOut] = useState(false)
     const { t } = useLanguage() // useLanguage funksiya sifatida chaqirildi ()
     const { theme, setTheme } = useTheme()
     const navigate = useNavigate()
     const dropdownRef = useRef(null)

     useEffect(() => {
          const handleClickOutside = (e) => {
               if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    setOpen(false)
               }
          }
          document.addEventListener("mousedown", handleClickOutside)
          return () => document.removeEventListener("mousedown", handleClickOutside)
     }, [])

     const handleLogout = () => {
          setIsLoggingOut(true)

          setTimeout(() => {
               localStorage.removeItem("currentUser")
               localStorage.removeItem("access")
               localStorage.removeItem("refresh")

               navigate("/login", { replace: true })
          }, 1000)
     }

     return (
          <div className="relative !z-50" ref={dropdownRef}>
               <button
                    onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
                    className="flex-shrink-0 p-1 rounded-md text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#2E2E2E] cursor-pointer"
               >
                    <MoreVertical size={15} strokeWidth={1.8} />
               </button>

               {open && (
                    <div className="absolute -bottom-2 left-7 !z-[9999] w-[220px] bg-white dark:bg-[#1C1C1C] border border-[#E5E7EB] dark:border-[#2E2E2E] rounded-xl shadow-lg p-1.5">

                         {/* Theme toggle */}
                         <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
                              <div className="flex items-center gap-2.5">
                                   {theme === "dark"
                                        ? <HugeIcon icon={Sun03Icon} size={17} className="text-[#F5f5f5]" />
                                        : <HugeIcon icon={Moon02Icon} size={17} className="text-[#0a0a0a]" />
                                   }
                                   <span className="text-sm text-[#1A1A1A] dark:text-white">{theme === "dark" ? t("light_theme") : t("dark_theme")}</span>
                              </div>
                              <button
                                   onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                   className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer bg-[#e5e5e5]`}
                              >
                                   <span className={`absolute top-0.5 w-4 h-4 ${theme === "dark" ? "bg-[#171717]" : "bg-white"} rounded-full shadow transition-transform duration-200
                ${theme !== "dark" ? "-translate-x-3.5" : "translate-x-0"}`}
                                   />
                              </button>
                         </div>

                         <div className="h-px bg-[#E5E7EB] dark:bg-[#2E2E2E] mx-2 my-0.5" />

                         {/* Profile */}
                         <button
                              onClick={() => { navigate("/profile"); setOpen(false) }}
                              disabled={isLoggingOut}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#0a0a0a] dark:text-[#f5f5f5] hover:bg-[#F5F5F5] dark:hover:bg-[#252525] cursor-pointer disabled:opacity-50"
                         >
                              <HugeIcon icon={Male02Icon} size={17} className="text-[#0a0a0a] dark:text-[#f5f5f5]" />
                              {t("profile")}
                         </button>

                         <div className="h-px bg-[#E5E7EB] dark:bg-[#2E2E2E] mx-2 my-0.5" />

                         {/* Logout */}
                         <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-[#F5F5F5] dark:hover:bg-[#252525] cursor-pointer disabled:opacity-70"
                         >
                              {isLoggingOut ? (
                                   <HugeIcon icon={Spinner} size={17} className="animate-spin" />
                              ) : (
                                   <HugeIcon icon={LogoutCircle02Icon} size={17} />
                              )}
                              {isLoggingOut ? t("logging_out") : t("logout")}
                         </button>

                    </div>
               )}
          </div>
     )
}