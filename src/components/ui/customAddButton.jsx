import { Plus } from "lucide-react"

export const AddButton = ({title, onOpen}) => {
     return (
          <div className="flex items-center" onClick={onOpen}>
               <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#404040] px-4 py-2 text-sm font-medium text-[#0A0A0A] dark:text-white shadow-xs cursor-pointer"
               >
                    {title}
               </button>
               <span className="p-[10px] shadow-xs rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#404040] flex items-center justify-center">
                    <Plus size={16} className="dark:text-[#f5f5f5] text-[#0A0A0A]" />
               </span>
          </div>
     )
}