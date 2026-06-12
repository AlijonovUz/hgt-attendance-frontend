"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
     InputGroupButton,
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
     "uz-cyrl": uzCyrl,
     ru: ru,
     en: enUS,
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
     ...props
}) => {
     const { t } = useLanguage()

     const [open, setOpen] = useState(false)
     const [date, setDate] = useState(null)
     const [month, setMonth] = useState(new Date())

     const currentFormat = showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY"
     const maxChars = showTime ? 16 : 10

     const formatDate = (selectedDate) => {
          if (!selectedDate) return ""
          return dayjs(selectedDate).locale(currentLang).format(currentFormat)
     }

     const [inputValue, setInputValue] = useState("")

     useEffect(() => {
          if (date) {
               setInputValue(formatDate(date))
          } else {
               setInputValue("")
          }
     }, [currentLang, date])

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
               setDate(null)
               return
          }

          if (val.length === maxChars) {
               const parsedDate = dayjs(val, currentFormat, true).toDate()
               if (!isNaN(parsedDate.getTime())) {
                    setDate(parsedDate)
                    setMonth(parsedDate)
               }
          }
     }

     return (
          <Field className={cn("mx-auto", widthClass, className)}>
               <FieldLabel htmlFor="date-required">{displayLabel}</FieldLabel>

               <InputGroup className={inputClassName}>
                    <InputGroupInput
                         id="date-required"
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
                                        <InputGroupButton id="date-picker" className="cursor-pointer" variant="ghost" size="icon-xs" aria-label="Select date">
                                             <LuCalendar />
                                             <span className="sr-only">{displaySrText}</span>
                                        </InputGroupButton>
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
                                                  setDate(baseDate.toDate())
                                             } else {
                                                  setDate(selectedDate)
                                             }
                                             setOpen(false)
                                        }}
                                   />
                              </PopoverContent>
                         </Popover>
                    </InputGroupAddon>
               </InputGroup>
          </Field>
     )
}