import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react"
import { axiosAPI } from "@/services/axiosAPI"
import { useLanguage } from "@/Context/LanguageContext"
import { cn } from "@/lib/utils"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { Calendar02Icon, PartyIcon } from "@hugeicons/core-free-icons"
import { useNavigate } from "react-router-dom"

const WEEKDAYS = {
  uz: ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"],
  cy: ["Як", "Ду", "Се", "Чо", "Па", "Жу", "Ша"],
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
}

const MONTHS = {
  uz: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
  cy: ["Январ", "Феврал", "Март", "Апрел", "Май", "Июн", "Июл", "Август", "Сентябр", "Октябр", "Ноябр", "Декабр"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
}

const COLOR_CLASSES = [
  {
    day: "bg-[#E92429] text-white hover:bg-[#E92429]",
    icon: "bg-[#E92429] text-white",
    soft: "bg-[#F5F5F5] dark:bg-[#262626]",
  },
  {
    day: "bg-[#55B6F2] text-white hover:bg-[#55B6F2]",
    icon: "bg-[#55B6F2] text-white",
    soft: "bg-[#F5F5F5] dark:bg-[#262626]",
  },
  {
    day: "bg-[#22C55E] text-white hover:bg-[#22C55E]",
    icon: "bg-[#22C55E] text-white",
    soft: "bg-[#F5F5F5] dark:bg-[#262626]",
  },
]

const INITIAL_YEAR = new Date().getFullYear()

const pad = (value) => String(value).padStart(2, "0")

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDate = (value) => {
  if (!value) return null
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const formatHolidayDate = (holiday, language) => {
  const start = parseDate(holiday.start_date)
  const end = parseDate(holiday.end_date)
  if (!start) return ""

  const months = MONTHS[language] || MONTHS.uz
  const startText = `${start.getDate()} ${months[start.getMonth()]}`

  if (!end || toDateKey(start) === toDateKey(end)) return startText

  const endText = `${end.getDate()} ${months[end.getMonth()]}`
  return `${startText} — ${endText}`
}

const buildCalendarDays = (year, month) => {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days = []

  const prevMonthLast = new Date(year, month, 0).getDate()
  for (let i = first.getDay() - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthLast - i), outside: true })
  }

  for (let day = 1; day <= last.getDate(); day++) {
    days.push({ date: new Date(year, month, day), outside: false })
  }

  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    days.push({ date: new Date(year, month + 1, day), outside: true })
  }

  return days
}

const normalizeHoliday = (holiday) => ({
  ...holiday,
  title: holiday.title || holiday.name || "",
  start_date: holiday.start_date || holiday.date || holiday.day,
  end_date: holiday.end_date || holiday.start_date || holiday.date || holiday.day,
})

const HolidayCalendar = () => {
  const { t, language } = useLanguage()

  const navigate = useNavigate()

  const [visibleDate, setVisibleDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const currentYear = visibleDate.getFullYear()
  const currentMonth = visibleDate.getMonth()
  const months = MONTHS[language] || MONTHS.uz
  const weekdays = WEEKDAYS[language] || WEEKDAYS.uz

  const yearOptions = useMemo(() => {
    return Array.from({ length: 35 }, (_, index) => INITIAL_YEAR - 10 + index)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchHolidays = async () => {
      setLoading(true)
      setError("")

      try {
        const all = []
        let page = 1
        let next = true

        while (next) {
          const res = await axiosAPI.get("users/holidays/", { params: { page } })
          const data = res.data?.data || res.data || {}
          const results = Array.isArray(data) ? data : data.results || []
          all.push(...results.map(normalizeHoliday))
          next = !!data.next
          page += 1
        }

        if (!cancelled) setHolidays(all)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setHolidays([])
          setError(t("holiday_calendar_error") || "Bayramlarni yuklab bo'lmadi")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchHolidays()

    return () => {
      cancelled = true
    }
  }, [t])

  const holidayByDate = useMemo(() => {
    const map = new Map()

    holidays.forEach((holiday, index) => {
      const start = parseDate(holiday.start_date)
      const end = parseDate(holiday.end_date) || start
      if (!start || !end) return

      const cursor = new Date(start)
      while (cursor <= end) {
        map.set(toDateKey(cursor), { holiday, color: COLOR_CLASSES[index % COLOR_CLASSES.length] })
        cursor.setDate(cursor.getDate() + 1)
      }
    })

    return map
  }, [holidays])

  const monthHolidays = useMemo(() => {
    return holidays
      .map((holiday, index) => ({ holiday, color: COLOR_CLASSES[index % COLOR_CLASSES.length] }))
      .filter(({ holiday }) => {
        const start = parseDate(holiday.start_date)
        const end = parseDate(holiday.end_date) || start
        if (!start || !end) return false

        const monthStart = new Date(currentYear, currentMonth, 1)
        const monthEnd = new Date(currentYear, currentMonth + 1, 0)
        return start <= monthEnd && end >= monthStart
      })
  }, [currentMonth, currentYear, holidays])

  const [yearOpen, setYearOpen] = useState(false)
  const yearRef = useRef(null)

  const [monthOpen, setMonthOpen] = useState(false)
  const monthRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (yearRef.current && !yearRef.current.contains(e.target)) {
        setYearOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setMonthOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const calendarDays = useMemo(
    () => buildCalendarDays(currentYear, currentMonth),
    [currentMonth, currentYear]
  )

  const changeMonth = (step) => {
    setVisibleDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + step, 1))
  }

  const changeYear = (year) => {
    setVisibleDate((prev) => new Date(Number(year), prev.getMonth(), 1))
  }

  return (
    <div className="p-6 pb-0 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("holiday_calendar_title") || "Bayramlar va dam olish kunlari"}
          </h1>
          <p className="text-sm text-[#737373] dark:text-[#A3A3A3]">
            {t("holiday_calendar_subtitle") || "O'zbekiston Respublikasi rasmiy bayramlari — kalendarga biriktirilgan (dam olish kunlari)"}
          </p>
        </div>

        <div ref={yearRef} className="relative">
          <button
            type="button"
            onClick={() => setYearOpen((prev) => !prev)}
            className="h-9 px-3 cursor-pointer rounded-xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] flex items-center gap-2 text-sm font-medium shadow-sm hover:border-[#D1D5DB] dark:hover:border-[#525252]"
          >
            <span className="text-[#0A0A0A] dark:text-[#FAFAFA]">
              {currentYear} {t("year_short") || "yil"}
            </span>
            <HugeIcon icon={Calendar02Icon} size={16} className="text-[#0a0a0a] dark:text-[#fafafa]" />
          </button>

          {yearOpen && (
            <div className="absolute right-0 z-50 mt-2 w-36 rounded-xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] shadow-lg overflow-hidden">
              <div className="max-h-56 overflow-y-auto pl-1 py-1 scrollbar-thin scrollbar-thumb-[#E5E7EB] dark:scrollbar-thumb-[#404040]">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      changeYear(year)
                      setYearOpen(false)
                    }}
                    className={cn(
                      "w-full rounded-sm px-4 py-2 text-left text-sm transition-colors",
                      year === currentYear
                        ? "bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] font-medium"
                        : "text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                    )}
                  >
                    {year} {t("year_short") || "yil"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 min-w-0">
        <section className="w-[450px] shrink-0 h-[485px] rounded-2xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] shadow-sm py-4 px-4">

          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] cursor-pointer"
              aria-label={t("previous_month") || "Oldingi oy"}
            >
              <ChevronLeft size={16} />
            </button>

            <div ref={monthRef} className="relative">
              <button
                type="button"
                onClick={() => setMonthOpen((prev) => !prev)}
                className="h-8 px-3 rounded-md border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] flex items-center gap-1.5 text-sm font-medium hover:border-[#D1D5DB] dark:hover:border-[#525252] cursor-pointer"
              >
                <span className="text-[#0A0A0A] dark:text-[#FAFAFA]">
                  {months[currentMonth]} {currentYear}
                </span>
                <ChevronDown
                  size={13}
                  className={cn(
                    "text-[#737373] dark:text-[#A3A3A3] transition-transform duration-200",
                    monthOpen && "rotate-180"
                  )}
                />
              </button>

              {monthOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 z-50 mt-2 w-40 rounded-xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] shadow-lg overflow-hidden">
                  <div className="max-h-56 overflow-y-auto pl-1 py-1">
                    {months.map((monthName, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setVisibleDate(new Date(currentYear, index, 1))
                          setMonthOpen(false)
                        }}
                        className={cn(
                          "w-full rounded-sm px-4 py-2 text-left text-sm",
                          index === currentMonth
                            ? "bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] font-medium"
                            : "text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                        )}
                      >
                        {monthName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] cursor-pointer"
              aria-label={t("next_month") || "Keyingi oy"}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {weekdays.map((weekday) => (
              <div key={weekday} className="text-sm mb-1 text-[#737373] dark:text-[#A3A3A3]">
                {weekday}
              </div>
            ))}

            {calendarDays.map(({ date, outside }) => {
              const match = holidayByDate.get(toDateKey(date))

              return (
                <button
                  key={toDateKey(date)}
                  type="button"
                  title={match?.holiday?.title || undefined}
                  onClick={() => {
                    if (match?.holiday) {
                      navigate("/references/holidays", {
                        state: { holidayId: match.holiday.id },
                      })
                    }
                  }}
                  className={cn(
                    "mx-auto w-12 h-12 my-1.5 rounded-md text-sm font-medium flex items-center justify-center",
                    outside
                      ? "text-[#A3A3A3]"
                      : "text-[#0A0A0A] dark:text-[#FAFAFA]",
                    match?.color?.day,
                    !match && !outside && "hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]",
                    match && "cursor-pointer"
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex-1 min-w-0 rounded-2xl border border-[#E5E5E5] dark:border-[#404040] bg-[#FAFAFA] dark:bg-[#171717] p-5 pb-0">
          <h2 className="text-base font-semibold mb-5">
            {t("holiday_calendar_month_title") || "Shu oydagi bayramlar"}
          </h2>


          {loading ? (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-[90px] rounded-3xl bg-[#F5F5F5] dark:bg-[#262626] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-[#DC2626]">{error}</div>
          ) : monthHolidays.length ? (
            <div className="grid grid-cols-2 max-h-[calc(100vh-240px)] overflow-y-auto gap-5">
              {monthHolidays.map(({ holiday, color }) => (
                <div
                  key={holiday.id || `${holiday.title}-${holiday.start_date}`}
                  onClick={() =>
                    navigate("/references/holidays", {
                      state: { holidayId: holiday.id },
                    })
                  }
                  className={cn(
                    "rounded-3xl h-19 p-4 flex items-center gap-4 cursor-pointer",
                    color.soft
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-md flex items-center justify-center shrink-0", color.icon)}>
                    <HugeIcon icon={PartyIcon} size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">{holiday.title || ""}</h3>
                    <p className="text-sm text-[#737373] dark:text-[#A3A3A3] mt-1">
                      {formatHolidayDate(holiday, language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[160px] rounded-3xl bg-[#F7F7F7] dark:bg-[#262626] flex items-center justify-center text-[#737373] dark:text-[#A3A3A3]">
              {t("holiday_calendar_empty") || "Bu oyda bayramlar yo'q"}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default HolidayCalendar
