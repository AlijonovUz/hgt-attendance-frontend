import { Plus } from "lucide-react"

export const AddButton = ({ title, onOpen }) => {
     return (
          <div className="flex items-center" onClick={onOpen}>
               <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#404040] px-4 py-2 text-sm font-medium text-[#0A0A0A] dark:text-white shadow-xs cursor-pointer"
               >
                    <Plus size={16} />
                    {title}
               </button>
          </div>
     )
}