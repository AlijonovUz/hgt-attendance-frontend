import dayjs from "dayjs";
import { useLanguage } from "../../Context/LanguageContext";
import { useTheme } from "../../Context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { TbXboxXFilled } from "react-icons/tb";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RegionDistrictFilter } from "@/components/ui/Regiondistrictfilter";
import { uz, ru, enUS, uzCyrl } from "date-fns/locale";
import {
  Login02Icon,
  IdIcon,
  BubbleChatDoneIcon,
  TimeQuarter02Icon,
  PassportExpiredIcon,
  TradeUpIcon,
  TradeDownIcon,
} from "@hugeicons/core-free-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { axiosAPI } from "@/services/axiosAPI";
import { HugeIcon } from "@/components/ui/HugeIcon";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const calendarLocales = { uz, cy: uzCyrl, ru, en: enUS, };

const HomePage = () => {
  const navigate = useNavigate()

  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const locale = calendarLocales[language] || uz;

  const regions = useSelector((state) => state.references.regions)

  const [loadingData, setLoadingData] = useState(false)

  // Har bir API uchun alohida state
  const [summary, setSummary] = useState(null)
  const [branchRatingsData, setBranchRatingsData] = useState(null)
  const [todayStatusData, setTodayStatusData] = useState(null)
  const [weeklyDynamicsData, setWeeklyDynamicsData] = useState(null)

  const isInitialLoad = useRef(true)

  const [timeRange, setTimeRange] = useState("daily");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [dateParams, setDateParams] = useState({ period: "daily" })

  const [weeklyParams, setWeeklyParams] = useState({})
  const [statusParams, setStatusParams] = useState({})


  const fetchSummary = async (params = {}) => {
    try {
      const res = await axiosAPI.get("analytics/dashboard/summary/", { params })
      if (res.status == 200) {
        setSummary(res.data?.data)
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fetchBranchRatings = async (params = {}) => {
    try {
      const res = await axiosAPI.get("analytics/dashboard/branch-ratings/", { params })
      if (res.status == 200) {
        setBranchRatingsData(res.data?.data)
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fetchTodayStatus = async (params = {}) => {
    try {
      const res = await axiosAPI.get("analytics/dashboard/today-status/", { params })
      if (res.status == 200) {
        setTodayStatusData(res.data?.data)
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fetchWeeklyDynamics = async (params = {}) => {
    try {
      const res = await axiosAPI.get("analytics/dashboard/weekly-dynamics/", { params })
      if (res.status == 200) {
        setWeeklyDynamicsData(res.data?.data)
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fetchAllDashboardData = async (dateP = dateParams, weeklyP = weeklyParams, statusP = statusParams) => {
    setLoadingData(true)
    try {
      await Promise.all([
        fetchSummary({ ...dateP }),
        fetchBranchRatings({ ...dateP }),
        fetchTodayStatus({ ...statusP }),
        fetchWeeklyDynamics({ ...weeklyP }),
      ])
    } finally {
      setLoadingData(false)
      isInitialLoad.current = false
    }
  }

  const fetchDateFilteredData = async (dateP) => {
    await Promise.all([
      fetchSummary({ ...dateP }),
      fetchBranchRatings({ ...dateP }),
    ])
  }

  useEffect(() => {
    fetchAllDashboardData()
  }, [])

  const handleChangeDate = (value) => {
    setTimeRange(value);
    setSelectedDate(null);

    const newDateParams = {};
    if (value !== "") newDateParams.period = value

    setDateParams(newDateParams)
    fetchDateFilteredData(newDateParams)
  };

  const handleSelectDate = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setTimeRange("sana");

    const newDateParams = {};
    if (date.from) {
      newDateParams.start_date = dayjs(date.from).format("YYYY-MM-DD")
      newDateParams.end_date = date.to ? dayjs(date.to).format("YYYY-MM-DD") : dayjs(date.from).format("YYYY-MM-DD")
    } else {
      newDateParams.start_date = dayjs(date).format("YYYY-MM-DD")
    }

    setDateParams(newDateParams)
    fetchDateFilteredData(newDateParams)

    if (!date.from) {
      setCalendarOpen(false);
    }
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setTimeRange("");
    setDateParams({})
    fetchDateFilteredData({})
  };

  const handleWeeklyFilter = (regionId, districtId) => {
    setWeeklyParams(prev => {
      const params = { ...prev }
      if (regionId !== undefined) params.region = regionId || undefined
      if (districtId !== undefined) params.district = districtId || undefined
      fetchWeeklyDynamics(params)
      return params
    })
  }

  const handleStatusFilter = (regionId, districtId) => {
    setStatusParams(prev => {
      const params = { ...prev }
      if (regionId !== undefined) params.region = regionId || undefined
      if (districtId !== undefined) params.district = districtId || undefined
      fetchTodayStatus(params)
      return params
    })
  }

  if (loadingData && isInitialLoad.current) {
    return (
      <div className="p-4 flex flex-col gap-4 w-full min-h-[calc(100vh-3.5rem)] bg-white dark:bg-[#0A0A0A]">
        {/* Top 3 skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="h-[148px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse border border-[#E5E7EB] dark:border-zinc-800" />
          <div className="h-[148px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse border border-[#E5E7EB] dark:border-zinc-800" />
          <div className="h-[148px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse border border-[#E5E7EB] dark:border-zinc-800" />
        </div>

        {/* Large bottom skeleton card */}
        <div className="w-full flex-1 min-h-[400px] rounded-2xl bg-[#F5F5F5] dark:bg-[#171717] animate-pulse border border-[#E5E7EB] dark:border-zinc-800" />
      </div>
    );
  }

  const getTrendTextKey = (range) => {
    switch (range) {
      case "daily": return "trend_vs_yesterday";
      case "weekly": return "trend_vs_last_week";
      case "monthly": return "trend_vs_last_month";
      case "quarterly": return "trend_vs_last_quarter";
      case "yearly": return "trend_vs_last_year";
      case "sana": return "trend_vs_period";
      default: return "trend_vs_yesterday";
    }
  }

  const statsData = [
    {
      key: "total",
      labelKey: "total_employees",
      value: summary?.total_employees || 0,
      trendVal: `${summary?.total_employees_trend || 0}`,
      trendTextKey: getTrendTextKey(timeRange),
      trendUp: (summary?.total_employees_trend || 0) >= 0,
      icon: IdIcon,
      bg: "bg-[#F5F5F5] dark:bg-[#262626]",
      iconBg: "bg-white",
      navigate: "/employee-register",
    },
    {
      key: "present",
      labelKey: "come",
      value: summary?.period_arrived || 0,
      trendVal: `${summary?.attendance_percent || 0}%`,
      trendTextKey: getTrendTextKey(timeRange),
      trendUp: (summary?.attendance_percent || 0) >= 0,
      icon: BubbleChatDoneIcon,
      bg: "bg-[#ADDDC0]",
      iconBg: "bg-white",
      navigate: "/reports/general",
      filter_key: "present",
      page: "employee"
    },
    {
      key: "late",
      labelKey: "latecomers",
      value: summary?.lates || 0,
      trendVal: `${summary?.lates_trend || 0}%`,
      trendTextKey: getTrendTextKey(timeRange),
      trendUp: (summary?.lates_trend || 0) >= 0,
      icon: TimeQuarter02Icon,
      bg: "bg-[#FFC182]",
      iconBg: "bg-white",
      navigate: "/reports/general",
      filter_key: "late",
      page: "employee"
    },
    {
      key: "early",
      labelKey: "early_leavers",
      value: summary?.early_leaves || 0,
      trendVal: `${summary?.early_leaves_trend || 0}%`,
      trendTextKey: getTrendTextKey(timeRange),
      trendUp: (summary?.early_leaves_trend || 0) >= 0,
      icon: Login02Icon,
      bg: "bg-[#ACD8FC]",
      iconBg: "bg-white",
      navigate: "/reports/general",
      filter_key: "left_early",
      page: "employee"
    },
    {
      key: "absent",
      labelKey: "absent",
      value: summary?.absent || 0,
      trendVal: `${summary?.absent_trend || 0}%`,
      trendTextKey: getTrendTextKey(timeRange),
      trendUp: (summary?.absent_trend || 0) >= 0,
      icon: PassportExpiredIcon,
      bg: "bg-[#FDBDBE]",
      iconBg: "bg-white",
      navigate: "/reports/general",
      filter_key: "absent",
      page: "employee"
    },
  ];

  const PERIODS = [
    { value: "daily", labelKey: "period_daily" },
    { value: "weekly", labelKey: "period_weekly" },
    { value: "monthly", labelKey: "period_monthly" },
    { value: "quarterly", labelKey: "period_quarterly" },
    { value: "yearly", labelKey: "period_yearly" },
  ]

  const weeklyData = weeklyDynamicsData?.weekly_dynamics?.map(d => ({
    name: d.day_name,
    onTime: d.on_time,
    late: d.late
  })) || weeklyDynamicsData?.map?.(d => ({
    name: d.day_name,
    onTime: d.on_time,
    late: d.late
  })) || [];

  // Y o'qi uchun ma'lumotga qarab o'sadigan "chiroyli" yuqori chegara.
  // Eng katta qiymatga ~20% bo'sh joy qo'shib, yumaloq songa yaxlitlaydi
  // (masalan max 150 -> 200, max 80 -> 100).
  const weeklyMax = Math.max(0, ...weeklyData.map(d => Math.max(d.onTime || 0, d.late || 0)));
  const niceCeil = (v) => {
    if (v <= 0) return 5;
    const pow = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / pow;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return nice * pow;
  };
  const weeklyYMax = Math.max(10, niceCeil(weeklyMax * 1.2));

  const todayStatus = todayStatusData?.today_status || todayStatusData;

  const isTodayDataEmpty = !todayStatus || (todayStatus.on_time === 0 && todayStatus.late === 0 && todayStatus.early_left === 0 && todayStatus.absent === 0);

  const todayData = todayStatus ? [
    { name: t("on_time"), value: todayStatus.on_time, color: "#5BB98B" },
    { name: t("late"), value: todayStatus.late, color: "#F3D768" },
    { name: t("early_left"), value: todayStatus.early_left, color: "#5EB1EF" },
    { name: t("absent"), value: todayStatus.absent, color: "#EB8E90" },
  ] : [];

  const todayTotalPercent = todayStatus?.total_percent || 0;

  const branchRatingsList = branchRatingsData?.branch_ratings || branchRatingsData || [];

  const branchRatings = branchRatingsList?.map((b, i) => {
    let color = "bg-[#2B9A66]";
    let bg = "bg-[#2B9A66]/20";
    if (b.rating < 90 && b.rating >= 80) { color = "bg-[#007AFF]"; bg = "bg-[#007AFF]/20"; }
    else if (b.rating < 80 && b.rating >= 70) { color = "bg-[#F97316]"; bg = "bg-[#F97316]/20"; }
    else if (b.rating < 70) { color = "bg-[#EF4444]"; bg = "bg-[#EF4444]/20"; }
    return {
      id: i + 1,
      name: b.name || `${t("branch_fallback")} ${i + 1}`,
      rating: b.rating,
      color,
      bg
    };
  }) || [];


  const dateLabel = selectedDate
    ? selectedDate.from
      ? `${dayjs(selectedDate.from).format("DD.MM.YYYY")}${selectedDate.to ? ` \u00bb ${dayjs(selectedDate.to).format("DD.MM.YYYY")}` : ""}`
      : dayjs(selectedDate).format("DD.MM.YYYY")
    : t("byDate") || "Sana bo'yicha";

  return (
    <div className="p-4 flex flex-col items-start gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

      {/* Header row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
            {t("home_page_title")}
          </h1>
          <span className="text-[#737373] text-sm">
            {t("home_page_subtitle")}
          </span>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">

          {/* Period buttons */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-[#F5F5F5] dark:bg-[#262626] p-1 shadow-sm">
            {PERIODS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChangeDate(opt.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-[13px] font-medium text-[#0A0A0A] dark:text-white cursor-pointer ",
                  opt.value === timeRange
                    ? "bg-white dark:bg-[#0A0A0A] border-2 border-[#E5E5E5] dark:border-[#404040] shadow-sm"
                    : "hover:bg-[#f4f4f4] dark:hover:bg-[#262626]"
                )}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>

          {/* Date picker button */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#171717] px-4 py-2 text-[13px] font-semibold shadow-sm cursor-pointer hover:bg-[#f4f4f4] dark:hover:bg-[#262626]",
                    timeRange === "sana" ? "bg-[#F5F5F5] dark:bg-[#2E2E2E] text-[#0A0A0A] dark:text-white" : ""
                  )}
                >
                  {dateLabel}
                  {selectedDate ? (
                    <TbXboxXFilled
                      className="size-3.5 text-gray-400 cursor-pointer mb-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDate();
                      }}
                    />
                  ) : (
                    <ChevronDownIcon className="size-4 opacity-60 text-current" />
                  )}
                </button>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              sideOffset={8}
            >
              <Calendar
                daterange={true}
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(new Date().getFullYear() - 5, 0)}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                selected={selectedDate}
                onSelect={handleSelectDate}
                locale={locale}
                initialFocus
              />
            </PopoverContent>
          </Popover>

        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {statsData.map((stat) => {
          return (
            <div
              key={stat.key}
              className={cn(
                "rounded-2xl p-4 flex flex-col gap-3 shadow-sm border cursor-pointer border-black/5", stat.bg
              )}
              onClick={() => navigate(stat.navigate, { state: {page: stat?.page, filter: stat?.filter_key } })}
            >
              {/* Top row: label + icon */}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
                  {t(stat.labelKey)}
                </span>
                <div className="rounded-xl w-9 h-9 flex items-center justify-center bg-white dark:bg-black">
                  <HugeIcon
                    icon={stat.icon}
                    size={20}
                    className="text-[#0A0A0A] dark:text-white"
                  />
                </div>
              </div>

              {/* Value */}
              <span className={cn(
                "text-[28px] font-bold leading-none tracking-tight text-[#0a0a0a] dark:text-white"
              )}>
                {stat.value}
              </span>

              {/* Trend */}
              <div className="flex items-center gap-1">
                <HugeIcon
                  icon={stat.trendUp ? TradeUpIcon : TradeDownIcon}
                  size={16}
                  className={stat.trendUp ? "text-[#2B9A66]" : "text-[#DC2626]"}
                />
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    stat.trendUp ? "text-[#2B9A66]" : "text-[#DC2626]"
                  )}
                >
                  {stat.trendVal} {stat.trendTextKey ? t(stat.trendTextKey) : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 w-full">
        {/* Weekly dynamics */}
        <div className="lg:col-span-7 rounded-2xl p-5 flex flex-col gap-4 bg-[#FBFBFB] dark:bg-[#171717] dark:border dark:border-zinc-800 dark:shadow-sm">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">
                {t("weekly_dynamics")}
              </h2>
              <span className="text-[13px] text-[#737373]">
                {t("weekly_dynamics_subtitle")}
              </span>
            </div>

            <RegionDistrictFilter
              regions={regions}
              onRegionChange={(regionId) => handleWeeklyFilter(regionId, null)}
              onDistrictChange={(districtId) => handleWeeklyFilter(undefined, districtId)}
            />
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={3}>
                <CartesianGrid vertical={false} stroke={theme === "dark" ? "#2E2E2E" : "#E5E7EB"} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#737373" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#737373" }}
                  domain={[0, weeklyYMax]}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={theme === "dark" ? { backgroundColor: "#171717", borderColor: "#2E2E2E", borderRadius: "8px" } : { borderRadius: "8px" }}
                  itemStyle={theme === "dark" ? { color: "#fff" } : undefined}
                  labelStyle={theme === "dark" ? { color: "#a3a3a3" } : undefined}
                />
                <Bar dataKey="onTime" name={t("on_time")} fill="#5BB98B" radius={[4, 4, 4, 4]} barSize={25} />
                <Bar dataKey="late" name={t("late")} fill="#F3D768" radius={[4, 4, 4, 4]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-[3px] bg-[#5BB98B]" />
              <span className="text-[13px] font-medium text-[#737373]">{t("on_time")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-[3px] bg-[#F3D768]" />
              <span className="text-[13px] font-medium text-[#737373]">{t("late")}</span>
            </div>
          </div>
        </div>

        {/* Today's status */}
        <div className="col-span-4 rounded-2xl p-5 flex flex-col gap-4 bg-[#FBFBFB] dark:bg-[#171717] dark:border dark:border-zinc-800 dark:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-1">
                <h2 className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">
                  {t("today_status")}
                </h2>
                <span className="text-[13px] text-[#737373]">
                  {t("today_status_subtitle")}
                </span>
              </div>
            </div>
            <RegionDistrictFilter
              regions={regions}
              onRegionChange={(regionId) => handleStatusFilter(regionId, null)}
              onDistrictChange={(districtId) => handleStatusFilter(undefined, districtId)}
            />
          </div>


          <div className="flex flex-row items-center gap-6 mt-4">
            {/* Donut */}
            <div className="relative w-[220px] h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={isTodayDataEmpty ? [{ value: 1, color: theme === "dark" ? "#262626" : "#F5F5F5" }] : todayData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {(isTodayDataEmpty ? [{ value: 1, color: theme === "dark" ? "#262626" : "#F5F5F5" }] : todayData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-[#0A0A0A] dark:text-white">{todayTotalPercent}%</span>
                <span className="text-xs font-medium text-[#737373] -mt-1">{t("at_workplace")}</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-col gap-3">
              {todayData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-[3px]" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#0A0A0A] dark:text-[#FAFAFA] w-auto">{item.name}</span>
                  <span className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{item.value?.toLocaleString('ru-RU').replace(/,/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Branch Ratings */}
      {branchRatings.length > 0 && (
        <div className="w-full rounded-2xl p-5 flex flex-col gap-4 bg-white dark:bg-[#171717] dark:border dark:border-zinc-800 dark:shadow-sm">
          <h2 className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">
            {t("discipline_rating_branches")}
          </h2>
          <div className="flex flex-col gap-4 mt-2">
            {branchRatings.map((branch, i) => (
              <div key={i + 1} className="flex items-center gap-4">
                <span className="text-[13px] font-medium text-[#0A0A0A] dark:text-white/80 w-4">{i + 1}</span>
                <span className="text-[13px] font-medium text-[#3a3a3a] dark:text-white/90 w-[180px]">{branch.name}</span>
                <div className={`flex-1 h-3.5 rounded-full flex overflow-hidden ${branch.rating >= 90 ? "bg-[#30A46C]/20" : branch.rating >= 80 ? "bg-[#0090FF]/20" : branch.rating >= 70 ? "bg-[#F76B15]/20" : "bg-[#E5484D]/20"}`}>
                  <div
                    className={`h-full rounded-full ${branch.rating >= 90 ? "bg-[#30A46C]" : branch.rating >= 80 ? "bg-[#0090FF]" : branch.rating >= 70 ? "bg-[#F76B15]" : "bg-[#E5484D]"}`}
                    style={{ width: `${branch.rating}%` }}
                  />
                </div>
                <span className="text-[14px] font-bold text-[#0A0A0A] dark:text-white w-10 text-right">{branch.rating}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;