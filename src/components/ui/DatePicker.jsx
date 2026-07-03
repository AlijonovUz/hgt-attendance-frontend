"use client"

import * as React from "react"
import { useState, useEffect, useId } from "react"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

import "dayjs/locale/uz"
import "dayjs/locale/uz-latn"
import "dayjs/locale/ru"
import "dayjs/locale/en"
import "dayjs/locale/tr"

dayjs.extend(customParseFormat)

import { uz, uzCyrl, ru, enUS } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
     InputGroup,
     InputGroupAddon,
     InputGroupInput,
} from "@/components/ui/input-group"
import {
     Popover,
     PopoverContent,
     PopoverTrigger,
} from "./popover"
import { LuCalendar } from "react-icons/lu"
import { useLanguage } from "../../Context/LanguageContext"
import { cn } from "@/lib/utils"

const calendarLocales = {
     uz: uz,
     cy: uzCyrl,
     ru: ru,
     en: enUS,
}

// Date | string | null -> JS Date | null
const toDateObj = (v) => {
     if (!v) return null
     const d = v instanceof Date ? v : new Date(v)
     return isNaN(d.getTime()) ? null : d
}

export const DatePicker = ({
     currentLang = "uz",
     label,
     placeholder,
     srText,
     showTime = false,
     className = "",
     inputClassName = "",
     widthClass = "w-52",
     labelClassName = "",
     calendarIcon,
     // ─── Controlled qo'llab-quvvatlash (forma bilan ishlash uchun) ───
     value, // Date | string | null — beriladigan tashqi qiymat (ixtiyoriy)
     onChange, // (date: Date | null) => void — sana o'zgarganda chaqiriladi (ixtiyoriy)
     error = false, // true bo'lsa, qizil border chiqadi
     errorText, // xato matni (masalan "Bu maydon majburiy")
     id, // bir nechta DatePicker bir sahifada bo'lsa, har biriga noyob id bering
     ...props
}) => {
     const { t } = useLanguage()
     const autoId = useId()
     const fieldId = id || `date-${autoId}`

     const [open, setOpen] = useState(false)
     const [date, setDate] = useState(() => toDateObj(value))
     const [month, setMonth] = useState(toDateObj(value) || new Date())

     const currentFormat = showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY"
     const maxChars = showTime ? 16 : 10

     const formatDate = (selectedDate) => {
          if (!selectedDate) return ""
          return dayjs(selectedDate).locale(currentLang).format(currentFormat)
     }

     const [inputValue, setInputValue] = useState(() => formatDate(toDateObj(value)))

     // Tashqi `value` o'zgarsa (masalan forma tozalanganda), ichki state'ni sinxronlaymiz
     useEffect(() => {
          if (value === undefined) return // controlled emas — e'tiborsiz qoldiramiz
          const next = toDateObj(value)
          setDate(next)
          if (next) setMonth(next)
     }, [value])

     useEffect(() => {
          setInputValue(formatDate(date))
     }, [currentLang, date])

     // Sanani yangilab, tashqariga ham xabar beradi
     const updateDate = (newDate) => {
          setDate(newDate)
          onChange?.(newDate)
     }

     const displayLabel = label || t("date")
     const displayPlaceholder = placeholder || (showTime ? "DD.MM.YYYY HH:mm" : t("selectDate"))
     const displaySrText = srText || t("selectDate")

     const handleChange = (e) => {
          let val = e.target.value
          const isDeleting = val.length < inputValue.length

          val = val.replace(/\D/g, "")

          if (!isDeleting) {
               if (val.length > 2 && val.length <= 4) {
                    val = `${val.slice(0, 2)}.${val.slice(2)}`
               } else if (val.length > 4 && val.length <= 8) {
                    val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4)}`
               } else if (showTime && val.length > 8 && val.length <= 10) {
                    val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4, 8)} ${val.slice(8)}`
               } else if (showTime && val.length > 10) {
                    val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4, 8)} ${val.slice(8, 10)}:${val.slice(10, 12)}`
               }
          } else {
               if (val.length > 2 && val.length <= 4) {
                    val = `${val.slice(0, 2)}.${val.slice(2)}`
               } else if (val.length > 4 && val.length <= 8) {
                    val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4)}`
               } else if (showTime && val.length > 8 && val.length <= 10) {
                    val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4, 8)} ${val.slice(8)}`
               } else if (showTime && val.length > 10) {
                    val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4, 8)} ${val.slice(8, 10)}:${val.slice(10)}`
               }
          }

          setInputValue(val)

          if (val === "") {
               updateDate(null)
               return
          }

          if (val.length === maxChars) {
               const parsedDate = dayjs(val, currentFormat, true).toDate()
               if (!isNaN(parsedDate.getTime())) {
                    updateDate(parsedDate)
                    setMonth(parsedDate)
               }
          }
     }

     return (
          <Field className={cn("mx-auto", widthClass, className)}>
               <FieldLabel className={labelClassName} htmlFor={fieldId}>{displayLabel}</FieldLabel>

               <InputGroup className={cn(inputClassName, error && "border-red-500 focus-within:border-red-500")}>
                    <InputGroupInput
                         id={fieldId}
                         value={inputValue}
                         placeholder={displayPlaceholder}
                         maxLength={maxChars}
                         onChange={handleChange}
                         className="focus-visible:ring-0 focus-visible:outline-none"
                         onBlur={() => {
                              if (inputValue.length < maxChars || isNaN(dayjs(inputValue, currentFormat, true).toDate().getTime())) {
                                   setInputValue(formatDate(date))
                              }
                         }}
                         onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                   e.preventDefault()
                                   setOpen(true)
                              }
                         }}
                         {...props}
                    />
                    <InputGroupAddon align="inline-end">
                         <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger
                                   render={
                                        <button
                                             id={`${fieldId}-trigger`}
                                             type="button"
                                             className="cursor-pointer flex items-center justify-center size-6 rounded-md hover:bg-muted hover:text-foreground"
                                             aria-label="Select date"
                                        >
                                             {calendarIcon || <LuCalendar className="size-3.5" />}
                                        </button>
                                   }
                              />

                              <PopoverContent
                                   className="w-auto overflow-hidden p-0"
                                   align="end"
                                   alignOffset={-8}
                                   sideOffset={10}
                              >
                                   <Calendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        startMonth={new Date(new Date().getFullYear() - 5, 0)}
                                        endMonth={new Date(new Date().getFullYear() + 5, 11)}
                                        selected={date}
                                        month={month}
                                        onMonthChange={setMonth}
                                        locale={calendarLocales[currentLang] || uz}
                                        onSelect={(selectedDate) => {
                                             if (!selectedDate) return

                                             if (showTime) {
                                                  let baseDate = dayjs(selectedDate)
                                                  if (inputValue.length === 16) {
                                                       const timePart = inputValue.slice(11)
                                                       const [hours, minutes] = timePart.split(":")
                                                       baseDate = baseDate.hour(parseInt(hours)).minute(parseInt(minutes))
                                                  } else {
                                                       baseDate = baseDate.hour(dayjs().hour()).minute(dayjs().minute())
                                                  }
                                                  updateDate(baseDate.toDate())
                                             } else {
                                                  updateDate(selectedDate)
                                             }
                                             setOpen(false)
                                        }}
                                   />
                              </PopoverContent>
                         </Popover>
                    </InputGroupAddon>
               </InputGroup>
               {errorText && <span className="text-xs text-red-500">{errorText}</span>}
          </Field>
     )
}