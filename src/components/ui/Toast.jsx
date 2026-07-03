import { useEffect, useState } from "react"
import { BadgeCheck } from "lucide-react"

/**
 * Pastda markazda chiqadigan oddiy toast.
 * open=true bo'lganda ko'rinadi, `duration` (ms) dan keyin onClose chaqiriladi.
 */
export const Toast = ({ open, message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      // mount -> animatsiya uchun keyingi frame'da ko'rsatamiz
      requestAnimationFrame(() => setVisible(true))
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onClose?.(), 200)
      }, duration)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [open, duration, onClose])

  if (!open) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000000] pointer-events-none">
      <div
        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 bg-white dark:bg-[#1C1C1C] border border-[#E5E7EB] dark:border-[#2E2E2E] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <BadgeCheck size={20} className="text-[#0066FF] fill-[#0066FF]/15 flex-shrink-0" strokeWidth={2} />
        <span className="text-sm font-medium text-[#1A1A1A] dark:text-white whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  )
}

export default Toast
