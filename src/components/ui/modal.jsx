import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export const Modal = ({ className, width, height, isOpen, onClose, children, header }) => {
     const [shouldRender, setShouldRender] = useState(isOpen)
     const [isAnimating, setIsAnimating] = useState(false)

     useEffect(() => {
          if (isOpen) {
               setShouldRender(true)
               const timer = setTimeout(() => setIsAnimating(true), 10)
               return () => clearTimeout(timer)
          } else {
               setIsAnimating(false)
               const timer = setTimeout(() => setShouldRender(false), 300)
               return () => clearTimeout(timer)
          }
     }, [isOpen])

     if (!shouldRender) return null

     return (
          <>
               <div
                    className={cn(
                         "w-full h-screen inset-0 fixed top-0 left-0 bg-black/75 z-40 transition-opacity duration-300 ease-out",
                         isAnimating ? "opacity-100" : "opacity-0"
                    )}
                    onClick={onClose}
               />

               {/* Modal oynasi */}
               <div
                    style={{ width: width, height: height }}
                    className={cn(
                         "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                         "w-[600px] rounded-[24px] shadow-lg bg-[#FAFAFA] dark:bg-[#171717]",
                         "transition-all duration-300 ease-out transform origin-center",
                         "flex flex-col overflow-hidden",
                         isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
                         className,
                    )}
               >
                    {/* ── Sticky header ── */}
                    {header && (
                         <div className="flex-shrink-0 px-6 pt-6 bg-[#FAFAFA] dark:bg-[#171717] sticky top-0 z-10">
                              {header}
                         </div>
                    )}

                    {/* ── Scrollable content ── */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                         {children}
                    </div>
               </div>

               <span
                    className={cn(
                         "flex items-center justify-center rounded-full cursor-pointer p-2 bg-[#FFFFFF29] text-white fixed z-50 top-6 right-5",
                         "transition-opacity duration-300 ease-out",
                         isAnimating ? "opacity-100" : "opacity-0"
                    )}
                    onClick={onClose}
               >
                    <X size={16} />
               </span>
          </>
     )
}