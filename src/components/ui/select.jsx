import { useState, useRef, useEffect, useMemo } from "react";
import { Check, Search } from "lucide-react";
import { useLanguage } from "@/Context/LanguageContext";
import { HugeIcon } from "./HugeIcon";
import { ArrowDown01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

export const Select = ({
     label,
     placeholder = "Tanlang",
     options = [],
     value,
     onChange,
     disabled = false,
     className = "",
     contanierClassName,
     searchable,
}) => {
     const { t } = useLanguage()

     const [open, setOpen] = useState(false);
     const [query, setQuery] = useState("");
     const [selected, setSelected] = useState(
          value !== undefined ? (options.find((o) => o.value === value) ?? null) : null
     );
     const wrapperRef = useRef(null);
     const searchRef = useRef(null);

     // Qidiruv: aniq `searchable` berilsa o'sha, aks holda ro'yxat uzun bo'lsa avtomatik
     const showSearch = searchable ?? options.length > 6;

     // Qidiruvga mos variantlar
     const filteredOptions = useMemo(() => {
          if (!showSearch || !query.trim()) return options;
          const q = query.trim().toLowerCase();
          return options.filter((o) => String(o.label).toLowerCase().includes(q));
     }, [options, query, showSearch]);

     // Sync controlled value
     useEffect(() => {
          if (value !== undefined) {
               setSelected(options.find((o) => o.value === value) ?? null);
          }
     }, [value, options]);

     // Close on outside click
     useEffect(() => {
          const handleClickOutside = (e) => {
               if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                    setOpen(false);
               }
          }
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
     }, []);

     // Ochilganda qidiruvni tozalab, inputga fokus beramiz; yopilganda tozalaymiz
     useEffect(() => {
          if (open) {
               setQuery("");
               if (showSearch) {
                    const id = setTimeout(() => searchRef.current?.focus(), 0);
                    return () => clearTimeout(id);
               }
          } else {
               setQuery("");
          }
     }, [open, showSearch]);

     const handleSelect = (option) => {
          setSelected(option);
          setOpen(false);
          onChange?.(option);
     }

     const handleClear = (e) => {
          e.stopPropagation();
          setSelected(null);
          setOpen(false);
          onChange?.(null);
     }

     const handleKeyDown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
               e.preventDefault();
               if (!disabled) setOpen((prev) => !prev);
          }
          if (e.key === "Escape") setOpen(false);
     }

     return (
          <div ref={wrapperRef} className={`relative w-full font-sans ${contanierClassName}`}>
               {/* Label */}
               {label && (
                    <label className="block mb-1.5 text-sm text-[#737373] dark:text-[#A3A3A3]">
                         {label}
                    </label>
               )}

               {/* Trigger */}
               <div
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && setOpen((prev) => !prev)}
                    onKeyDown={handleKeyDown}
                    className={[
                         "flex items-center justify-between w-full px-3.5 py-3 rounded-xl border-2 text-sm cursor-pointer select-none outline-none",
                         "bg-white dark:bg-[#171717]",
                         open
                              ? "border-gray-300 ring-2 ring-gray-400/30 dark:border-[#707070] dark:ring-[#303030]/50"
                              : "border-gray-200 dark:border-[#404040]",
                         disabled
                              ? "bg-gray-100 dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed pointer-events-none"
                              : "",
                         className
                    ]
                         .filter(Boolean)
                         .join(" ")}
               >
                    <span
                         className={
                              selected
                                   ? "text-[#0a0a0a] dark:text-[#fafafa]"
                                   : "text-[#737373] dark:text-[#A3A3A3]"
                         }
                    >
                         {selected ? selected.label : placeholder}
                    </span>

                    {/* Icon: X when selected, ArrowDown when not */}
                    {selected && !disabled ? (
                         <button
                              type="button"
                              onClick={handleClear}
                              className="flex items-center cursor-pointer justify-center flex-shrink-0 w-5 h-5 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-gray-100 dark:text-[#A3A3A3] dark:hover:text-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors duration-150"
                              aria-label="Tozalash"
                         >
                              <HugeIcon icon={Cancel01Icon} size={14} />
                         </button>
                    ) : (
                         <HugeIcon
                              icon={ArrowDown01Icon}
                              size={18}
                              className={`text-[#0a0a0a] dark:text-[#fafafa] flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                         />
                    )}
               </div>

               {/* Dropdown */}
               {open && (
                    <div
                         role="listbox"
                         className="absolute top-[calc(100%+6px)] left-0 w-full z-50 bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#404040] rounded-xl p-1 shadow-lg max-h-[200px] overflow-y-auto animate-[fadeSlide_0.15s_ease]"
                         style={{
                              animation: "fadeSlide 0.15s ease",
                         }}
                    >
                         <style>{`
                           @keyframes fadeSlide {
                             from { opacity: 0; transform: translateY(-6px); }
                             to   { opacity: 1; transform: translateY(0); }
                           }
                         `}</style>

                         {/* Qidiruv */}
                         {showSearch && (
                              <div className="sticky top-0 z-10 bg-white dark:bg-[#171717] p-1 mb-1">
                                   <div className="relative">
                                        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                                        <input
                                             ref={searchRef}
                                             type="text"
                                             value={query}
                                             onChange={(e) => setQuery(e.target.value)}
                                             onKeyDown={(e) => e.stopPropagation()}
                                             placeholder={t("search") || "Qidirish..."}
                                             className="w-full h-9 rounded-lg border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#0F0F0F] pl-8 pr-2.5 text-sm text-[#0a0a0a] dark:text-white placeholder:text-[#737373] outline-none focus:border-gray-300 dark:focus:border-[#707070]"
                                        />
                                   </div>
                              </div>
                         )}

                         {filteredOptions.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                                   {t("no_data_found")}
                              </div>
                         ) : (
                              filteredOptions.map((option) => {
                                   const isSelected = selected?.value === option.value;
                                   return (
                                        <div
                                             key={option.value}
                                             role="option"
                                             aria-selected={isSelected}
                                             onClick={() => handleSelect(option)}
                                             className={[
                                                  "flex items-center justify-between px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors duration-100",
                                                  isSelected
                                                       ? "bg-[#F5F5F5] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-white font-medium"
                                                       : "text-[#737373] dark:text-[#A3A3A3] hover:bg-gray-50 dark:hover:bg-[#0a0a0a]",
                                             ]
                                                  .filter(Boolean)
                                                  .join(" ")}
                                        >
                                             {option.label}
                                             {isSelected && (
                                                  <Check size={16} className="text-[#0a0a0a] dark:text-white flex-shrink-0" />
                                             )}
                                        </div>
                                   );
                              })
                         )}
                    </div>
               )}
          </div>
     );
}