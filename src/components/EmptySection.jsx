import notWorking from "../assets/SVGs/not_working.svg";
import { LuArrowLeft, LuConstruction } from "react-icons/lu";

export const EmptySection = () => {
     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
               <div className="w-full max-w-[500px] bg-white border border-slate-100 rounded-2xl shadow-xl p-12 text-center transform transition-all duration-500">

                    <div className="inline-block mb-8 animate-pulse">
                         <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto">
                              <img src={notWorking} alt="Xatolik" className="w-16 h-16 object-contain" />
                         </div>
                    </div>

                    <h2 className="text-xl font-medium text-slate-800 mb-4 tracking-wide">
                         Sahifa yuklashda muammo yuzaga keldi
                    </h2>

                    {/* Matn */}
                    <p className="text-[15px] text-slate-500 leading-relaxed max-w-[360px] mx-auto mb-8">
                         Ushbu bo'limni yuklashda muammo yuzaga keldi. Iltimos, keyinroq qayta urinib ko'ring yoki quyidagi tugmani bosing.
                    </p>

                    <div className="flex items-center justify-center gap-3 mb-8">
                         <div className="flex items-center animate-bounce">
                              <LuConstruction className="w-6 h-6 text-amber-500" />
                         </div>
                         <span className="text-sm font-medium text-slate-400">
                              Ishlab chiqilmoqda...
                         </span>
                    </div>

                    <button
                         onClick={() => window.history.back()}
                         className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-xs cursor-pointer mx-auto"
                    >
                         <LuArrowLeft className="w-4 h-4 text-slate-600" />
                         Orqaga qaytish
                    </button>
               </div>
          </div>
     );
}