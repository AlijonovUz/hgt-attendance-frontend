import { cn } from "@/lib/utils";

export const AlertModal = ({
     isOpen,
     onClose,
     onConfirm,
     title,
     description,
     confirmText,
     cancelText,
     confirmVariant = "danger",
     loading = false,
     icon = null
}) => {
     if (!isOpen) return null;

     const variantColors = {
          danger: {
               confirm: "bg-[#DC2626] dark:bg-[#F87171] dark:text-[#171717]",
               cancel: "text-[#0A0A0A] dark:text-[#fff] border border-[#e5e5e5] dark:border-[#404040]"
          },
          success: {
               confirm: "bg-[#34C759] hover:bg-[#2DB84E] dark:bg-[#34C759] dark:hover:bg-[#2DB84E]",
               cancel: "text-[#34C759] hover:bg-[#F0FFF5] dark:text-[#6BFF8B] dark:hover:bg-[#1A2A1A]"
          },
          primary: {
               confirm: "bg-[#0090FF] hover:bg-[#0080E5] dark:bg-[#0090FF] dark:hover:bg-[#0080E5]",
               cancel: "text-[#0090FF] hover:bg-[#F0F8FF] dark:text-[#6BB8FF] dark:hover:bg-[#1A2A3A]"
          },
          defauld: {
               confirm: "bg-[#171717] dark:bg-[#ffffff]",
               cancel: "text-[#0A0A0A] dark:text-[#fff] border border-[#e5e5e5] dark:border-[#404040]"
          }
     };

     const colors = variantColors[confirmVariant] || variantColors.danger;

     return (
          <div
               className="fixed inset-0 z-[999] flex items-center justify-center"
               onClick={onClose}
          >
               <div
                    className="w-[520px] bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
               >
                    {/* Icon */}
                    {icon && (
                         <div className="flex justify-center mb-4">
                              {icon}
                         </div>
                    )}

                    {/* Title */}
                    <h3 className="text-start text-lg font-semibold text-[#0A0A0A] dark:text-white mb-2">
                         {title}
                    </h3>

                    {/* Description */}
                    <p className="text-start text-sm text-[#737373] dark:text-[#A3A3A3] leading-relaxed">
                         {description}
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6">
                         <button
                              type="button"
                              onClick={onClose}
                              className={cn(
                                   "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer",
                                   colors.cancel
                              )}
                         >
                              {cancelText || "Bekor qilish"}
                         </button>

                         <button
                              type="button"
                              onClick={onConfirm}
                              disabled={loading}
                              className={cn(
                                   "px-6 py-2 rounded-lg text-sm font-medium text-white dark:text-[#0a0a0a] cursor-pointer",
                                   colors.confirm,
                                   loading && "opacity-50 cursor-not-allowed"
                              )}
                         >
                              {loading ? (
                                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                   confirmText || "Tasdiqlash"
                              )}
                         </button>
                    </div>
               </div>
          </div>
     );
};