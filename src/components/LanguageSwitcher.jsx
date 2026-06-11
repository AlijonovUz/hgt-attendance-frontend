import { useLanguage } from "@/Context/LanguageContext"
import { Check, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export const LanguageSwitcher = () => {
     const { language, setLanguage } = useLanguage()
     const [langDropdownOpen, setLangDropdownOpen] = useState(false)

     const dropdownRef = useRef(null)

     const displayLang = language === 'uz' ? 'UZ' : language === 'cy' ? 'ЎЗ' : 'РУ'

     useEffect(() => {
          const handleClickOutside = (event) => {
               if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setLangDropdownOpen(false)
               }
          }
          document.addEventListener("mousedown", handleClickOutside)

          return () => {
               document.removeEventListener("mousedown", handleClickOutside)
          }
     }, [])

     return (
          <div className="relative" ref={dropdownRef}>
               <button
                    type="button"
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 cursor-pointer py-2.5 rounded-md bg-login-pill-bg hover:bg-login-pill-hover text-login-pill-text text-sm font-medium"
               >
                    {displayLang} <ChevronDown className="w-4 h-4 text-login-text-secondary" />
               </button>

               {langDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[140px] bg-login-left-bg border border-login-border rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 overflow-hidden z-20">
                         {[
                              { value: 'uz', label: 'Uzbek' },
                              { value: 'cy', label: 'Ўзбек' },
                              { value: 'ru', label: 'Русский' }
                         ].map(lang => (
                              <button
                                   key={lang.value}
                                   className="w-full text-left px-4 py-2 cursor-pointer text-[14px] hover:bg-login-pill-hover flex items-center justify-between"
                                   onClick={() => {
                                        setLanguage(lang.value)
                                        setLangDropdownOpen(false)
                                   }}
                              >
                                   <span className={language === lang.value ? "text-login-text-primary" : "text-login-text-secondary"}>{lang.label}</span>
                                   {language === lang.value && <Check className="w-4 h-4 text-login-text-secondary" />}
                              </button>
                         ))}
                    </div>
               )}
          </div>
     )
}