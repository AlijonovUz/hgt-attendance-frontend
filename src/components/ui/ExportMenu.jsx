import { useEffect, useRef, useState } from "react"
import { Download, ChevronDown } from "lucide-react"
import { PiMicrosoftExcelLogo, PiFilePdf, PiFileCsv } from "react-icons/pi"
import { cn } from "@/lib/utils"
import { HugeIcon } from "./HugeIcon"
import { Csv02Icon, Download05Icon, Pdf02Icon } from "@hugeicons/core-free-icons"

/**
 * Eksport (Yuklash) split-tugmasi: "Yuklash" + ochiluvchi Excel / PDF / CSV menyusi.
 * Faqat berilgan handlerlar uchun variant ko'rsatiladi.
 *
 * @param {function} [onExcel]
 * @param {function} [onPDF]
 * @param {function} [onCSV]
 * @param {string}   [label]    - asosiy tugma matni (default: "Yuklash")
 */
export const ExportMenu = ({ onExcel, onPDF, onCSV, label = "Yuklash", className = "" }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const pick = (fn) => {
    setOpen(false)
    fn?.()
  }

  const items = [
    { key: "excel", label: "Excel", icon: <PiMicrosoftExcelLogo size={18} className="text-[#2B9A66]" />, onClick: onExcel },
    { key: "pdf", label: "PDF", icon: <HugeIcon icon={Pdf02Icon} size={18} className="text-[#0090FF]" />, onClick: onPDF },
    { key: "csv", label: "CSV", icon: <HugeIcon icon={Csv02Icon} size={18} className="text-[#EA580C]" />, onClick: onCSV },
  ].filter((it) => typeof it.onClick === "function")

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      {/* Split tugma */}
      <div className="inline-flex items-center rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex rounded-lg border-2 border-[#e5e5e5] dark:border-[#404040] items-center gap-2 px-4 py-1.5 text-sm font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
        >
          <HugeIcon icon={Download05Icon} size={16} className="text-[#0090FF]" />
          {label}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={label}
          aria-expanded={open}
          className="flex rounded-lg border-2 border-[#e5e5e5] dark:border-[#404040] items-center gap-2 p-2 text-sm font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
        >
          <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 rounded-xl border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#171717] shadow-lg p-1.5">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={() => pick(it.onClick)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExportMenu
