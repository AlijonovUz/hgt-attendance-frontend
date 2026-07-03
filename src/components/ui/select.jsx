import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Search, Loader2 } from "lucide-react";
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
     onScrollEnd,
     loadingMore = false,
     onSearch,
     onOpen,
}) => {
     const { t } = useLanguage();

     const userTyped = useRef(false);

     const [open, setOpen] = useState(false);
     const [query, setQuery] = useState("");
     const [selected, setSelected] = useState(
          value !== undefined ? (options.find((o) => o.value === value) ?? null) : null
     );
     const wrapperRef = useRef(null);
     const searchRef = useRef(null);
     const dropdownRef = useRef(null);
     const scrollTriggeredRef = useRef(false);

     // Qidiruv inputini ko'rsatish sharti
     const showSearch = searchable;
     const filteredOptions = options;

     // Controlled valuelarni sinxronlash
     useEffect(() => {
          if (value !== undefined) {
               const timer = setTimeout(() => {
                    setSelected(options.find((o) => o.value === value) ?? null);
               }, 0);
               return () => clearTimeout(timer);
          }
     }, [value, options]);

     // Tashqariga bosganda dropdownni yopish
     useEffect(() => {
          const handleClickOutside = (e) => {
               if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                    setOpen(false);
               }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
     }, []);

     // Dropdown holati o'zgarganda mantiq
     useEffect(() => {
          if (open) {
               const resetTimer = setTimeout(() => {
                    setQuery("");
                    userTyped.current = false;
                    scrollTriggeredRef.current = false;
               }, 0);
               if (showSearch) {
                    const id = setTimeout(() => searchRef.current?.focus(), 0);
                    return () => {
                         clearTimeout(resetTimer);
                         clearTimeout(id);
                    };
               }
               return () => clearTimeout(resetTimer);
          } else {
               const timer = setTimeout(() => {
                    setQuery("");
                    userTyped.current = false;
               }, 0);
               return () => clearTimeout(timer);
          }
     }, [open, showSearch]);

     // Dropdown ochilgandagina (foydalanuvchi bosganda) onOpen chaqiriladi —
     // shu orqali variantlar faqat kerak bo'lganda (lazy) yuklanadi.
     useEffect(() => {
          if (open) onOpen?.();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [open]);

     // Foydalanuvchi inputga yozgandagina backendga so'rov yuborish (Debounce mantiq)
     useEffect(() => {
          if (!open) return;
          if (!userTyped.current) return;  // ← qo'shing (avtomatik reset'ni bloklaydi)

          const timeout = setTimeout(() => {
               onSearch?.(query);
          }, 400);

          return () => clearTimeout(timeout);
     }, [query, open, onSearch]);

     // ─── Scroll pagination (Cheksiz so'rov xatosi tuzatilgan qismi) ───
     const handleDropdownScroll = useCallback(() => {
          if (!onScrollEnd || loadingMore) return;
          const el = dropdownRef.current;
          if (!el) return;

          const { scrollTop, scrollHeight, clientHeight } = el;

          // CRITICAL FIX: scrollHeight va clientHeight teng bo'lsa (ya'ni scroll bo'lmasa) umuman ishlamaydi.
          // Kontent haqiqatda scroll bo'la oladigan darajada uzun bo'lsagina pastga yetganini tekshiramiz.
          if (scrollHeight > clientHeight && scrollTop + clientHeight >= scrollHeight - 40) {
               if (!scrollTriggeredRef.current) {
                    scrollTriggeredRef.current = true;
                    onScrollEnd();

                    // Qayta-qayta trigger bo'lishining oldini olish uchun 500ms kutadi
                    setTimeout(() => {
                         scrollTriggeredRef.current = false;
                    }, 500);
               }
          }
     }, [onScrollEnd, loadingMore]);

     const handleSelect = (option) => {
          setSelected(option);
          setOpen(false);
          onChange?.(option);
     };

     const handleClear = (e) => {
          e.stopPropagation();
          setSelected(null);
          setOpen(false);
          onChange?.(null);
          onSearch?.(""); // Tozalangan paytda qidiruvni ham bo'shatamiz
     };

     const handleKeyDown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
               e.preventDefault();
               if (!disabled) setOpen((prev) => !prev);
          }
          if (e.key === "Escape") setOpen(false);
     };

     return (
          <div ref={wrapperRef} className={`relative w-full font-sans ${open ? "z-[99999]" : ""} ${contanierClassName}`}>
               {label && (
                    <label className="block mb-1.5 text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                         {label}
                    </label>
               )}

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
                    <span className={selected ? "text-[#0a0a0a] dark:text-[#fafafa]" : "text-[#737373] dark:text-[#A3A3A3]"}>
                         {selected ? selected.label : placeholder}
                    </span>

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

               {open && (
                    <div
                         ref={dropdownRef}
                         onScroll={handleDropdownScroll}
                         role="listbox"
                         className="absolute top-[calc(100%+6px)] left-0 w-full z-[99999] bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#404040] rounded-xl p-1 shadow-lg max-h-[240px] overflow-y-auto"
                         style={{ animation: "fadeSlide 0.15s ease" }}
                    >
                         <style>{`
                           @keyframes fadeSlide {
                             from { opacity: 0; transform: translateY(-6px); }
                             to   { opacity: 1; transform: translateY(0); }
                           }
                         `}</style>

                         {showSearch && (
                              <div className="sticky top-0 z-10 bg-white dark:bg-[#171717] p-1 mb-1">
                                   <div className="relative">
                                        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                                        <input
                                             ref={searchRef}
                                             type="text"
                                             value={query}
                                             onChange={(e) => {
                                                  userTyped.current = true;
                                                  setQuery(e.target.value);
                                             }}
                                             onKeyDown={(e) => e.stopPropagation()}
                                             placeholder={t("search") || "Qidirish..."}
                                             className="w-full h-9 rounded-lg border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#0F0F0F] pl-8 pr-2.5 text-sm text-[#0a0a0a] dark:text-white placeholder:text-[#737373] outline-none focus:border-gray-300 dark:focus:border-[#707070]"
                                        />
                                   </div>
                              </div>
                         )}

                         {filteredOptions.length === 0 && !loadingMore ? (
                              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                                   {t("no_data_found")}
                              </div>
                         ) : (
                              <>
                                   {filteredOptions.map((option) => {
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
                                                            : "text-[#737373] dark:text-[#A3A3A3] hover:bg-gray-50 dark:hover:bg-[#0a0a0a]"
                                                  ]
                                                       .filter(Boolean)
                                                       .join(" ")}
                                             >
                                                  {option.label}
                                                  {isSelected && <Check size={16} className="text-[#0a0a0a] dark:text-white flex-shrink-0" />}
                                             </div>
                                        );
                                   })}
                                   {loadingMore && (
                                        <div className="flex items-center justify-center gap-2 px-2 py-3 text-sm text-[#737373] dark:text-[#A3A3A3]">
                                             <Loader2 size={14} className="animate-spin" />
                                             {t("loading") || "Yuklanmoqda..."}
                                        </div>
                                   )}
                              </>
                         )}
                    </div>
               )}
          </div>
     );
};

