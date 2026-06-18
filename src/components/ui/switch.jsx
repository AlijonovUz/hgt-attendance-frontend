export const Switch = ({
     checked = false,
     onChange,
     containerClassName = "h-6 w-11",
     thumbClassName = "h-5 w-5",
     checkedThumbClassName = "translate-x-5",
     uncheckedThumbClassName = "translate-x-0.5",
     ...props
}) => {
     return (
          <button
               type="button"
               role="switch"
               aria-checked={checked}
               onClick={() => onChange?.(!checked)}
               className={[
                    "relative inline-flex flex-shrink-0 cursor-pointer rounded-xl ease-in-out disabled:cursor-default",
                    checked
                         ? "bg-[#171717] dark:bg-[#E5E5E5]"
                         : "bg-[#E5E5E5] dark:bg-[#404040]",
                    containerClassName,
               ]
                    .filter(Boolean)
                    .join(" ")}
               {...props}
          >
               <span
                    className={[
                         "pointer-events-none inline-block rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm transform transition-transform duration-200 ease-in-out mt-0.5",
                         thumbClassName,
                         checked ? checkedThumbClassName : uncheckedThumbClassName,
                    ]
                         .filter(Boolean)
                         .join(" ")}
               />
          </button>
     );
};