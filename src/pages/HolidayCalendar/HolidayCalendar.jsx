import { useEffect, useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react"
import { axiosAPI } from "@/services/axiosAPI"
import { useLanguage } from "@/Context/LanguageContext"
import { cn } from "@/lib/utils"

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
    soft: "bg-[#F7F7F7] dark:bg-[#262626]",
  },
  {
    day: "bg-[#55B6F2] text-white hover:bg-[#55B6F2]",
    icon: "bg-[#55B6F2] text-white",
    soft: "bg-[#F7F7F7] dark:bg-[#262626]",
  },
  {
    day: "bg-[#22C55E] text-white hover:bg-[#22C55E]",
    icon: "bg-[#22C55E] text-white",
    soft: "bg-[#F7F7F7] dark:bg-[#262626]",
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
    return Array.from({ length: 15 }, (_, index) => INITIAL_YEAR - 5 + index)
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
    <div className="p-6 md:p-10 flex flex-col gap-7 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-[34px] font-semibold tracking-tight">
            {t("holiday_calendar_title") || "Bayramlar va dam olish kunlari"}
          </h1>
          <p className="mt-3 text-lg text-[#737373] dark:text-[#A3A3A3]">
            {t("holiday_calendar_subtitle") || "O'zbekiston Respublikasi rasmiy bayramlari — kalendarga biriktirilgan (dam olish kunlari)"}
          </p>
        </div>

        <label className="h-[42px] px-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] flex items-center gap-2 text-lg font-medium">
          <select
            value={currentYear}
            onChange={(e) => changeYear(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
            aria-label={t("select_year") || "Yil tanlash"}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year} {t("year_short") || "yil"}
              </option>
            ))}
          </select>
          <CalendarDays size={20} className="text-[#737373] dark:text-[#A3A3A3]" />
        </label>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
        <section className="rounded-2xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#0A0A0A] shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-9">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] cursor-pointer"
              aria-label={t("previous_month") || "Oldingi oy"}
            >
              <ChevronLeft size={24} />
            </button>

            <h2 className="text-xl font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] cursor-pointer"
              aria-label={t("next_month") || "Keyingi oy"}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-6 text-center">
            {weekdays.map((weekday) => (
              <div key={weekday} className="text-base font-medium text-[#8A8A8A]">
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
                  className={cn(
                    "mx-auto w-16 h-16 rounded-lg text-xl font-medium flex items-center justify-center transition-colors",
                    outside
                      ? "text-[#A3A3A3] dark:text-[#737373]"
                      : "text-[#1A1A1A] dark:text-[#F5F5F5]",
                    match?.color?.day,
                    !match && !outside && "hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#171717] p-6 md:p-8 min-h-[300px]">
          <h2 className="text-2xl font-semibold mb-10">
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
            <div className="flex flex-col gap-5">
              {monthHolidays.map(({ holiday, color }) => (
                <div
                  key={holiday.id || `${holiday.title}-${holiday.start_date}`}
                  className={cn("rounded-3xl px-6 py-5 flex items-center gap-5", color.soft)}
                >
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0", color.icon)}>
                    <PartyPopper size={25} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold truncate">{holiday.title || "—"}</h3>
                    <p className="text-lg text-[#737373] dark:text-[#A3A3A3] mt-1">
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
