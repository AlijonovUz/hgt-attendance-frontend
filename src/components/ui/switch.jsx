export const Switch = ({ checked = false, onChange }) => {
     return (
          <button
               type="button"
               role="switch"
               aria-checked={checked}
               onClick={() => onChange?.(!checked)}
               className={[
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-xl ease-in-out",
                    checked
                         ? "bg-[#171717] dark:bg-[#E5E5E5]"
                         : "bg-[#E5E5E5] dark:bg-[#404040]",
               ].join(" ")}
          >
               <span
                    className={[
                         "pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm transform transition-transform duration-200 ease-in-out mt-0.5",
                         checked ? "translate-x-5" : "translate-x-0.5",
                    ].join(" ")}
               />
          </button>
     );
};