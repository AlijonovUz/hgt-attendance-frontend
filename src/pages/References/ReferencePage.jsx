import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { useLanguage } from "@/Context/LanguageContext"
import { axiosAPI } from "@/services/axiosAPI"
import { cn } from "@/lib/utils"
import { Pencil, Trash2, Plus, X, FileText, ArrowLeft, Trash2Icon } from "lucide-react"
import { HugeIcon } from "@/components/ui/HugeIcon"
import { Calendar02Icon, CancelCircleHalfDotIcon, CheckmarkSquare01Icon, FilterVerticalIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/Toast"
import { DatePicker } from "@/components/ui/DatePicker"
import { AddButton } from "@/components/ui/customAddButton"
import { RoleModal } from "./RoleModal"
import { ScheduleModal } from "./ScheduleModal"
import { useSelector } from "react-redux"
import { AlertModal } from "@/components/ui/ComfirmAlert"

// "yyyy-mm-dd" (API'dan kelgan) -> "dd.mm.yyyy" (jadvalda ko'rsatish uchun)
const formatDate = (value) => {
  if (!value) return ""
  const [y, m, d] = String(value).split("-")
  if (!y || !m || !d) return value
  return `${d}.${m}.${y}`
}

// "HH:MM:SS" yoki "HH:MM" -> "HH:MM" (jadvalda ko'rsatish uchun)
const formatTime = (value) => {
  if (!value) return ""
  return String(value).slice(0, 5)
}

// Date obyekti -> "yyyy-mm-dd" (backendga yuborish uchun, mahalliy vaqt bo'yicha)
const toISODate = (d) => {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// ─── Har bir ma'lumotnoma sahifasi uchun konfiguratsiya ───
// text: oddiy input | select: ro'yxatdan tanlash (optionsEndpoint dan yuklanadi) | date: sana inputi
// dependsOn + param: ota maydon o'zgarganda qayta yuklanadigan bog'liq select
// pairWith: shu maydonni boshqa maydon bilan modalda yonma-yon joylashtirish (masalan boshlanish/tugash sanasi)
const REF_CONFIGS = {
  regions: {
    endpoint: "users/regions/",
    titleKey: "ref_t_region",
    permKey: "regions",
    permPrefix: "region",
    addKey: "ref_add_region",
    subKey: "ref_sub_region",
    columns: [{ headerKey: "gz_region", accessor: (r) => r.name }],
    fields: [{ type: "text", name: "name", labelKey: "ref_name_region", phKey: "ref_ph_region", required: true }],
  },
  districts: {
    endpoint: "users/districts/",
    titleKey: "ref_t_district",
    addKey: "ref_add_district",
    permKey: "districts",
    permPrefix: "district",
    subKey: "ref_sub_district",
    columns: [
      { headerKey: "gz_district", accessor: (r) => r.name },
      { headerKey: "gz_region", accessor: (r) => r.region_info?.name || "" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_district", phKey: "ref_ph_district", required: true },
      { type: "select", name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/", required: true },
    ],
    filters: [
      { name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/" },
    ],
  },
  branchs: {
    endpoint: "users/branches/",
    titleKey: "ref_t_branch",
    addKey: "ref_add_branch",
    permKey: "branchs",
    permPrefix: "branch",
    subKey: "ref_sub_branch",
    columns: [
      { headerKey: "gz_filial", accessor: (r) => r.name },
      { headerKey: "gz_region", accessor: (r) => r.region_info?.name || "" },
      { headerKey: "gz_district", accessor: (r) => r.district_info?.name || "" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_branch", phKey: "ref_ph_branch", required: true },
      { type: "select", name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/" },
      { type: "select", name: "district", labelKey: "gz_district", phKey: "gz_district_ph", optionsEndpoint: "users/districts/", dependsOn: "region", param: "region" },
    ],
    filters: [
      { name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/" },
      { name: "district", labelKey: "gz_district", phKey: "gz_district_ph", optionsEndpoint: "users/districts/", dependsOn: "region", param: "region" },
    ],
  },
  departments: {
    endpoint: "users/departments/",
    titleKey: "ref_t_dept",
    addKey: "ref_add_dept",
    subKey: "ref_sub_dept",
    permKey: "departments",
    permPrefix: "department",
    columns: [
      { headerKey: "ref_col_dept", accessor: (r) => r.name },
      { headerKey: "gz_filial", accessor: (r) => r.branch_info?.name || "" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_dept", phKey: "ref_ph_dept", required: true },
      { type: "select", name: "branch", labelKey: "gz_filial", phKey: "gz_branch_ph", optionsEndpoint: "users/branches/", required: true },
    ],
    filters: [
      { name: "region", labelKey: "gz_region", phKey: "gz_region_ph", optionsEndpoint: "users/regions/" },
      { name: "district", labelKey: "gz_district", phKey: "gz_district_ph", optionsEndpoint: "users/districts/", dependsOn: "region", param: "region" },
      { name: "branch", labelKey: "gz_filial", phKey: "gz_branch_ph", optionsEndpoint: "users/branches/", dependsOn: "district", param: "district" },
    ],
  },
  positions: {
    endpoint: "users/positions/",
    titleKey: "ref_t_position",
    addKey: "ref_add_position",
    permKey: "positions",
    permPrefix: "position",
    subKey: "ref_sub_position",
    columns: [
      { headerKey: "ref_col_position", accessor: (r) => r.name },
      { headerKey: "ref_col_dept", accessor: (r) => r.department_info?.name || "" },
    ],
    fields: [
      { type: "text", name: "name", labelKey: "ref_name_position", phKey: "ref_ph_position", required: true },
      { type: "select", name: "department", labelKey: "ref_col_dept", phKey: "ref_dept_ph", optionsEndpoint: "users/departments/", required: true },
    ],
    filters: [
      { name: "branch", labelKey: "gz_filial", phKey: "gz_branch_ph", optionsEndpoint: "users/branches/" },
      { name: "department", labelKey: "ref_col_dept", phKey: "ref_dept_ph", optionsEndpoint: "users/departments/", dependsOn: "branch", param: "branch" },
    ],
  },
  holidays: {
    endpoint: "users/holidays/",
    titleKey: "ref_t_holiday",
    addKey: "ref_add_holiday",
    permKey: "holidays",
    permPrefix: "holiday",
    subKey: "ref_sub_holiday",
    columns: [
      { headerKey: "ref_col_holiday_name", accessor: (r) => r.title || "" },
      { headerKey: "ref_col_holiday_start", accessor: (r) => formatDate(r.start_date) },
      { headerKey: "ref_col_holiday_end", accessor: (r) => formatDate(r.end_date) },
    ],
    fields: [
      { type: "text", name: "title", labelKey: "ref_name_holiday", phKey: "ref_ph_holiday", required: true },
      { type: "date", name: "start_date", labelKey: "ref_name_holiday_start", phKey: "gz_date_ph", required: true },
      { type: "date", name: "end_date", labelKey: "ref_name_holiday_end", phKey: "gz_date_ph", required: true, pairWith: "start_date" },
    ],
  },
  roles: {
    endpoint: "users/roles/",
    titleKey: "ref_t_role",
    addKey: "ref_add_role",
    permKey: "roles",
    permPrefix: "role",
    subKey: "ref_sub_role",
    custom: "roles",
    columns: [{ headerKey: "ref_col_role", accessor: (r) => r.name }],
  },
  schedule: {
    endpoint: "users/schedules/",
    titleKey: "ref_t_schedule",
    addKey: "ref_add_schedule",
    permKey: "schedules",
    permPrefix: "schedule",
    subKey: "ref_sub_schedule",
    custom: "schedule",
    columns: [
      { headerKey: "ref_col_schedule", accessor: (r) => r.name },
      { headerKey: "ref_col_work_start", accessor: (r) => formatTime(r.work_start_time) },
      { headerKey: "ref_col_work_end", accessor: (r) => formatTime(r.work_end_time) },
      { headerKey: "ref_col_lunch_start", accessor: (r) => formatTime(r.lunch_start_time) },
      { headerKey: "ref_col_lunch_end", accessor: (r) => formatTime(r.lunch_end_time) },
    ],
  },
}

const emptyForm = (cfg) =>
  Object.fromEntries((cfg.fields || []).map((f) => [f.name, f.type === "select" || f.type === "date" ? null : ""]))

const errorInputClass = "border-red-500 focus:border-red-500 dark:border-red-500"

const ReferencePage = () => {
  const { t, language } = useLanguage()
  const location = useLocation()

  const currentLang = language || "uz"
  const { type } = useParams()
  const config = REF_CONFIGS[type]

  const userPermission = useSelector((state) => state.references.userPermission)

  const permKey = config?.permKey
  const permPrefix = config?.permPrefix

  const canCreate = userPermission?.[permKey]?.some(e => e.code === `${permPrefix}_create`) ?? false
  const canEdit = userPermission?.[permKey]?.some(e => e.code === `${permPrefix}_edit`) ?? false
  const canDelete = userPermission?.[permKey]?.some(e => e.code === `${permPrefix}_delete`) ?? false

  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Infinite scroll holati
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadingMoreRef = useRef(false) // scroll'da takroriy so'rovni sinxron bloklash uchun
  const scrollRef = useRef(null)

  const [addModal, setAddModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({})

  // Select maydonlari uchun variantlar
  const [options, setOptions] = useState({})
  const [optionsPag, setOptionsPag] = useState({})

  // Majburiy/yaroqsiz maydonlar
  const [errors, setErrors] = useState({})

  // ─── Qidiruv va filtrlar ───
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [filterValues, setFilterValues] = useState({})
  const [tmpFilters, setTmpFilters] = useState({})
  // Filter pagination state: { filterName: { page, hasMore, loading, options } }
  const [filterPagination, setFilterPagination] = useState({})

  const [editModal, setEditModal] = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [showDeleleModal, setShowDeleleModal] = useState(null)
  const [showDeleleScheModal, setShowDeleleScheModal] = useState(null)
  const [showDeleleRolModal, setShowDeleleRolModal] = useState(null)

  const [filterSearch, setFilterSearch] = useState({})

  const activeParamsRef = useRef({})

  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })
  const showToast = (message) => setToast((prev) => ({ open: true, message, seq: prev.seq + 1 }))

  const getErrMsg = (err, fallback) => {
    const e = err?.response?.data?.error
    const d = e?.details
    if (d && typeof d === "object") {
      const first = Object.values(d)[0]
      if (Array.isArray(first) && first.length) return String(first[0])
      if (typeof first === "string") return first
    }
    return e?.errorMsg || fallback
  }

  // ─── Filter options pagination bilan yuklash ───
  const loadFilterOptions = async (
    filter,
    parentValue,
    pageNum = 1,
    search = ""
  ) => {
    const pagKey = filter.name
    if (pageNum === 1) {
      setFilterPagination((prev) => ({
        ...prev,
        [pagKey]: { page: 1, hasMore: true, loading: true, options: [] },
      }))
    } else {
      setFilterPagination((prev) => ({
        ...prev,
        [pagKey]: { ...prev[pagKey], loading: true },
      }))
    }

    try {
      const params = { page: pageNum }

      if (search?.trim()) {
        params.search = search
      }

      if (filter.dependsOn && parentValue) {
        params[filter.param] = parentValue
      }

      const res = await axiosAPI.get(filter.optionsEndpoint, { params })
      if (res.status === 200) {
        const data = res.data?.data || res.data || {}
        const newOpts = (data.results || []).map((o) => ({ value: o.id, label: o.name }))
        const hasMorePage = !!data.next

        setFilterPagination((prev) => {
          const existing = pageNum === 1 ? [] : (prev[pagKey]?.options || [])
          const merged = [...existing, ...newOpts]
          return {
            ...prev,
            [pagKey]: {
              page: pageNum,
              hasMore: hasMorePage,
              loading: false,
              options: merged,
              loaded: true,
              parentValue: parentValue ?? null,
            },
          }
        })
      }
    } catch (err) {
      console.error(err)
      setFilterPagination((prev) => ({
        ...prev,
        [pagKey]: { ...prev[pagKey], loading: false },
      }))
    }
  }

  // Filter dropdown oxiriga yetganda keyingi sahifani yuklash
  const handleFilterScrollEnd = useCallback((filter) => {
    const pag = filterPagination[filter.name]
    if (!pag || pag.loading || !pag.hasMore) return
    const parentValue = filter.dependsOn ? tmpFilters[filter.dependsOn]?.value : null
    loadFilterOptions(
      filter,
      parentValue,
      pag.page + 1,
      filterSearch[filter.name] || ""
    )
  }, [filterPagination, tmpFilters, filterSearch])

  // Filter dropdown ochilganda (foydalanuvchi bosganda) variantlarni lazy yuklash.
  // Allaqachon shu ota-qiymat uchun yuklangan bo'lsa — qayta so'rov yubormaydi.
  const handleFilterOpen = (filter) => {
    const parentValue = filter.dependsOn ? (tmpFilters[filter.dependsOn]?.value ?? null) : null
    if (filter.dependsOn && !parentValue) return // bog'liq filter ota tanlanmagan bo'lsa — o'chirilgan
    const pag = filterPagination[filter.name]
    if (pag?.loading) return
    if (pag?.loaded && pag.parentValue === parentValue) return // cache mavjud — so'rov shart emas
    loadFilterOptions(filter, parentValue, 1, filterSearch[filter.name] || "")
  }

  // ─── Qolgan funksiyalar ───
  const buildFilterParams = (searchVal, filtersVal) => {
    const p = {}
    if (searchVal?.trim()) p.search = searchVal.trim()
    Object.entries(filtersVal || {}).forEach(([key, opt]) => {
      if (opt?.value) p[key] = opt.value
    })
    return p
  }

  const fetchList = async (cfg, pageNum = 1, extraParams = activeParamsRef.current) => {
    if (pageNum === 1) setLoading(true)
    else { setLoadingMore(true); loadingMoreRef.current = true }
    try {
      const res = await axiosAPI.get(cfg.endpoint, { params: { page: pageNum, ...(extraParams || {}) } })
      if (res.status === 200) {
        const data = res.data?.data || {}
        const newRows = data.results || []
        setRows((prev) => (pageNum === 1 ? newRows : [...prev, ...newRows]))
        setCount(data.count ?? newRows.length)
        setHasMore(!!data.next)
        setPage(pageNum)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      loadingMoreRef.current = false
    }
  }

  // 2. Qidiruv va filtrni qo'llash
  const applyQuery = (searchVal, filtersVal) => {
    const params = buildFilterParams(searchVal, filtersVal)
    activeParamsRef.current = params
    setPage(1)
    setHasMore(true)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    fetchList(config, 1, params)
  }

  // 3. Cheksiz scroll (Infinite scroll)
  // fetchList setState updater ICHIDA chaqirilmaydi (bu StrictMode'da ikki marta
  // yuklanishga sabab bo'lardi). loadingMoreRef sinxron guard takroriy so'rovni bloklaydi.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading || loadingMoreRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;

    if (scrollTop + clientHeight >= scrollHeight - 80) {
      fetchList(config, page + 1, activeParamsRef.current);
    }
  }, [loading, hasMore, config, page]);


  const loadOptions = async (field, parentValue, pageNum = 1, search = "") => {
    const key = field.name
    setOptionsPag(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true }
    }))
    try {
      const params = { page: pageNum }
      if (search?.trim()) params.search = search
      if (field.dependsOn && parentValue) params[field.param] = parentValue
      const res = await axiosAPI.get(field.optionsEndpoint, { params })
      if (res.status === 200) {
        const data = res.data?.data || res.data || {}
        const newOpts = (data.results || []).map(o => ({ value: o.id, label: o.name }))
        setOptions(prev => ({
          ...prev,
          [key]: pageNum === 1 ? newOpts : [...(prev[key] || []), ...newOpts]
        }))
        setOptionsPag(prev => ({
          ...prev,
          [key]: { page: pageNum, hasMore: !!data.next, loading: false }
        }))
      }
    } catch (err) {
      console.error(err)
      setOptionsPag(prev => ({ ...prev, [key]: { ...prev[key], loading: false } }))
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInput(val)
    if (val === "") {
      setSearch("")
      applyQuery("", filterValues)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearch(searchInput)
      applyQuery(searchInput, filterValues)
    }
  }

  // Filter modalini ochish — variantlar bu yerda YUKLANMAYDI.
  // Har bir filter variantlari faqat o'sha dropdown bosilganda (handleFilterOpen) yuklanadi.
  // Cache (filterPagination) saqlanadi, shuning uchun qayta ochilganda takroriy so'rov ketmaydi.
  const openFilters = () => {
    setTmpFilters(filterValues)
    setOpenFilterModal(true)
  }

  const handleFilterChange = (filter, opt) => {
    setTmpFilters((prev) => {
      const next = { ...prev, [filter.name]: opt }
        ; (config.filters || [])
          .filter((f) => f.dependsOn === filter.name)
          .forEach((dep) => {
            // Ota o'zgardi — bog'liq filter tanlovi va cache'i bekor qilinadi.
            // Yangi variantlar dropdown ochilganda (handleFilterOpen) yuklanadi.
            next[dep.name] = null
            setFilterPagination((p) => ({ ...p, [dep.name]: { page: 1, hasMore: true, loading: false, options: [], loaded: false, parentValue: null } }))
            setFilterSearch((s) => ({ ...s, [dep.name]: "" }))
          })
      return next
    })
  }


  const applyFilters = () => {
    setFilterValues(tmpFilters)
    setOpenFilterModal(false)
    applyQuery(search, tmpFilters)
  }
  const clearFilters = () => {
    setTmpFilters({})
    setFilterPagination({})
    setFilterValues({})
    applyQuery(search, {})
  }
  const hasFilter = Object.values(filterValues).some((v) => v?.value)

  useEffect(() => {
    if (!config) return;

    // Statelarni tozalash
    setForm(emptyForm(config));
    setOptions({});
    setErrors({});
    setRows([]);
    setPage(1);
    setHasMore(true);
    setSearchInput("");
    setSearch("");
    setFilterValues({});
    setTmpFilters({});
    setFilterPagination({});
    setOptionsPag({})
    activeParamsRef.current = {};
    if (scrollRef.current) scrollRef.current.scrollTop = 0;

    // 1-sahifani yuklash
    fetchList(config, 1, {});

    // Select variantlarini yuklash
    (config.fields || [])
      .filter((f) => f.type === "select" && !f.dependsOn)
      .forEach((f) => loadOptions(f));
  }, [type]);


  if (!config) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 w-full min-h-[calc(100vh-3.5rem)] bg-white dark:bg-[#0A0A0A] text-[#737373]">
        <FileText size={32} strokeWidth={1.5} />
        <span className="text-sm">{t("ref_coming_soon")}</span>
      </div>
    )
  }

  const handleFieldChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field.name]: value }
      config.fields
        .filter((f) => f.dependsOn === field.name)
        .forEach((dep) => {
          next[dep.name] = null
          setOptions(o => ({ ...o, [dep.name]: [] }))
          setOptionsPag(p => ({ ...p, [dep.name]: { page: 1, hasMore: true, loading: false } }))
          if (value) loadOptions(dep, value, 1, "")
        })
      return next
    })
    if (errors[field.name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field.name]; return next })
    }
  }

  const handleDelete = async (row) => {
    setDeleteLoading(true)
    try {
      await axiosAPI.delete(`${config.endpoint}${row.id}/`)
      setShowDeleleModal(null)
      setEditModal(false)
      showToast(t("action_delete") || "O'chirildi")
      setPage(1)
      setHasMore(true)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      fetchList(config, 1)
    } catch (err) {
      console.error(err);
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setDeleteLoading(false)
      setShowDeleleModal(null)
    }
  }

  const handleDeleteRol = async (row) => {
    setDeleteLoading(true)
    try {
      await axiosAPI.delete(`users/roles/${row.id}/`)
      setShowDeleleRolModal(null)
      setEditModal(false)
      showToast(t("action_delete") || "O'chirildi")
      setPage(1)
      setHasMore(true)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      fetchList(config, 1, activeParamsRef.current)
    } catch (err) {
      console.error(err);
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setDeleteLoading(false)
      setShowDeleleRolModal(false)
    }
  }

  const handleDeleteSche = async (row) => {
    setDeleteLoading(true)
    try {
      await axiosAPI.delete(`users/schedules/${row.id}/`)
      setShowDeleleScheModal(null)
      setEditModal(false)
      showToast(t("action_delete") || "O'chirildi")
      setPage(1)
      setHasMore(true)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      fetchList(config, 1, activeParamsRef.current)
    } catch (err) {
      console.error(err);
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setDeleteLoading(false)
      setShowDeleleScheModal(null)
    }
  }

  const handleCreate = async () => {
    const newErrors = {}
    config.fields.forEach((f) => {
      if (f.required) {
        const v = form[f.name]
        if (v === null || v === undefined || (typeof v === "string" && !v.trim())) {
          newErrors[f.name] = true
        }
      }
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast(t("gz_validation"))
      return
    }
    setErrors({})

    const payload = {}
    config.fields.forEach((f) => {
      const v = form[f.name]
      if (f.type === "text") payload[f.name] = String(v).trim()
      else if (f.type === "date") {
        if (v) payload[f.name] = toISODate(v)
      } else if (v) payload[f.name] = v
    })

    setCreating(true)
    try {
      const res = await axiosAPI.post(config.endpoint, payload)
      if (res.status === 201 || res.status === 200) {
        setAddModal(false)
        setForm(emptyForm(config))
        setErrors({})
        setPage(1)
        setHasMore(true)
        if (scrollRef.current) scrollRef.current.scrollTop = 0
        await fetchList(config, 1)
        showToast(t("ref_created"))
      }
    } catch (err) {
      console.error(err?.response?.data || err)
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (row) => {
    setEditRow(row)
    const initial = {}
    config.fields?.forEach((f) => {
      if (f.type === "select") {
        initial[f.name] = row[f.name] ?? row[`${f.name}_info`]?.id ?? null
      } else if (f.type === "date") {
        initial[f.name] = row[f.name] ? new Date(row[f.name]) : null
      } else {
        initial[f.name] = row[f.name] ?? ""
      }
    })
    setEditForm(initial)
    setEditErrors({})
    setEditModal(true)
  }

  useEffect(() => {
    const { holidayId } = location.state || {}
    if (!holidayId || type !== "holidays" || loading) return

    const target = rows.find((r) => r.id === holidayId)
    if (target) {
      handleEdit(target)
      window.history.replaceState({}, "")
    }
  }, [rows, location.state, type, loading])

  const handleUpdate = async () => {
    const newErrors = {}
    config.fields?.forEach((f) => {
      if (f.required) {
        const v = editForm[f.name]
        if (v === null || v === undefined || (typeof v === "string" && !v.trim())) {
          newErrors[f.name] = true
        }
      }
    })
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors)
      showToast(t("gz_validation"))
      return
    }

    const payload = {}
    config.fields?.forEach((f) => {
      const v = editForm[f.name]
      if (f.type === "text") payload[f.name] = String(v).trim()
      else if (f.type === "date") { if (v) payload[f.name] = toISODate(v) }
      else if (v) payload[f.name] = v
    })

    setEditSaving(true)
    try {
      const res = await axiosAPI.patch(`${config.endpoint}${editRow.id}/`, payload)
      if (res.status === 200) {
        setEditModal(false)
        showToast(t("update") || "Yangilandi")
        setPage(1)
        setHasMore(true)
        if (scrollRef.current) scrollRef.current.scrollTop = 0
        fetchList(config, 1)
      }
    } catch (err) {
      showToast(getErrMsg(err, t("gz_error")))
    } finally {
      setEditSaving(false)
    }
  }

  const handleAfterCreate = () => {
    setAddModal(false)
    setPage(1)
    setHasMore(true)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    fetchList(config, 1)
    showToast(t("ref_created"))
  }

  const renderDateInput = (f) => (
    <DatePicker
      key={f.name}
      currentLang={currentLang}
      label={t(f.labelKey)}
      placeholder={t(f.phKey)}
      id={`ref-date-${f.name}`}
      widthClass="w-full"
      className="w-full"
      inputClassName="h-11! dark:bg-transparent!"
      value={form[f.name]}
      onChange={(d) => handleFieldChange(f, d)}
      error={!!errors[f.name]}
      errorText={errors[f.name] ? t("field_required") : null}
      labelClassName="text-[#737373]! dark:text-[#A3A3A3]! font-normal"
      calendarIcon={<HugeIcon icon={Calendar02Icon} size={18} />}
    />
  )

  const colCount = config.columns.length + 1

  return (
    <div className="p-4 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Qidiruv + Filter ── */}
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("search") || "Qidirish..."}
            className="h-9! rounded-md w-[320px] shadow-sm border-[#e5e5e5] dark:border-[#404040]! dark:bg-[#0a0a0a]!"
          />

          {config.filters?.length > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer relative border-[1.7px] text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3 text-[#0A0A0A] dark:text-white"
              onClick={openFilters}
            >
              {hasFilter && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]"></span>}
              <HugeIcon icon={FilterVerticalIcon} size={16} />
              {t("filter")}
            </button>
          )}
        </div>
        {canCreate && (
          <AddButton
            onOpen={() => setAddModal(true)}
            title={t("add")}
          />
        )}
      </div>

      {/* ── Jadval ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="w-full flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-lg">
              <th className="px-4 py-3 text-[13px] font-medium text-[#6B7280] dark:text-[#737373] w-16 bg-[#FAFAFA] dark:bg-[#1A1A1A]">#</th>
              {config.columns.map((c, i) => (
                <th key={i} className="px-4 py-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white whitespace-nowrap bg-[#FAFAFA] dark:bg-[#1A1A1A]">
                  {t(c.headerKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#F0F0F0] dark:border-[#1F1F1F]">
                  {Array.from({ length: colCount }).map((__, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-5 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center text-sm text-[#737373]">
                  {t("no_data_found")}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={cn(
                    "border-b border-[#F0F0F0] dark:border-[#1F1F1F] transition-colors",
                    (canEdit || canDelete) && "hover:bg-[#FAFAFA] dark:hover:bg-[#111] cursor-pointer"
                  )}
                  onClick={() => (canEdit || canDelete) && handleEdit(row)}
                >
                  <td className="px-4 py-3.5 text-sm text-[#737373]">{i + 1}</td>
                  {config.columns.map((c, j) => (
                    <td key={j} className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-white">
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
            {loadingMore && (
              <tr>
                <td colSpan={colCount} className="px-4 py-4 text-center text-sm text-[#737373]">
                  {t("loading") || "..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Qo'shish modali ── */}
      {config.custom === "roles" ? (
        <RoleModal isOpen={addModal} onClose={() => setAddModal(false)} onCreated={handleAfterCreate} canEdit={true} />
      ) : config.custom === "schedule" ? (
        <ScheduleModal isOpen={addModal} onClose={() => setAddModal(false)} onCreated={handleAfterCreate} />
      ) : (
        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          height={600}
          header={
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">{t(config.addKey)}</h2>
              <button
                type="button"
                onClick={() => setAddModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer text-[#0A0A0A] dark:text-white"
              >
                <X size={20} />
              </button>
            </div>
          }
        >
          <div className="flex flex-col justify-between h-full gap-4 pb-2">
            <div className="flex flex-col gap-4">
              {config.fields.map((f, i) => {
                if (f.pairWith) return null
                const datePair = f.type === "date" ? config.fields.find((x) => x.pairWith === f.name) : null
                if (f.type === "date" && datePair) {
                  return (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      {renderDateInput(f)}
                      {renderDateInput(datePair)}
                    </div>
                  )
                }
                if (f.type === "date") {
                  return renderDateInput(f)
                }
                if (f.type === "select" && f.dependsOn) return null
                const pairDep = config.fields.find((x) => x.dependsOn === f.name)
                if (f.type === "select" && pairDep) {
                  return (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Select
                          label={t(f.labelKey)}
                          placeholder={t(f.phKey)}
                          options={options[f.name] || []}
                          value={form[f.name] ?? null}
                          onChange={(opt) => handleFieldChange(f, opt?.value ?? null)}
                          className={cn(errors[f.name] && errorInputClass)}
                          searchable={true}
                          loadingMore={optionsPag[f.name]?.loading || false}
                          onScrollEnd={() => {
                            const pag = optionsPag[f.name]
                            if (!pag?.hasMore || pag?.loading) return
                            loadOptions(f, null, pag.page + 1, "")
                          }}
                          onSearch={(s) => loadOptions(f, null, 1, s)}
                        />
                        {errors[f.name] && <span className="text-xs text-red-500">{t("field_required")}</span>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Select
                          label={t(pairDep.labelKey)}
                          placeholder={!form[f.name] ? t("gz_select_region_first") : t(pairDep.phKey)}
                          options={options[pairDep.name] || []}
                          value={form[pairDep.name] ?? null}
                          onChange={(opt) => handleFieldChange(pairDep, opt?.value ?? null)}
                          disabled={!form[f.name]}
                          className={cn(errors[pairDep.name] && errorInputClass)}
                          searchable={true}
                          loadingMore={optionsPag[pairDep.name]?.loading || false}
                          onScrollEnd={() => {
                            const pag = optionsPag[pairDep.name]
                            if (!pag?.hasMore || pag?.loading) return
                            loadOptions(pairDep, form[f.name], pag.page + 1, "")
                          }}
                          onSearch={(s) => loadOptions(pairDep, form[f.name], 1, s)}
                        />
                        {errors[pairDep.name] && <span className="text-xs text-red-500">{t("field_required")}</span>}
                      </div>
                    </div>
                  )
                }
                if (f.type === "select") {
                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <Select
                        label={t(f.labelKey)}
                        placeholder={t(f.phKey)}
                        options={options[f.name] || []}
                        value={form[f.name] ?? null}
                        onChange={(opt) => handleFieldChange(f, opt?.value ?? null)}
                        className={cn(errors[f.name] && errorInputClass)}
                        searchable={true}
                        loadingMore={optionsPag[f.name]?.loading || false}
                        onScrollEnd={() => {
                          const pag = optionsPag[f.name]
                          if (!pag?.hasMore || pag?.loading) return
                          loadOptions(f, null, pag.page + 1, "")
                        }}
                        onSearch={(s) => loadOptions(f, null, 1, s)}
                      />
                      {errors[f.name] && <span className="text-xs text-red-500">{t("field_required")}</span>}
                    </div>
                  )
                }
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t(f.labelKey)}</label>
                    <Input
                      type="text"
                      placeholder={t(f.phKey)}
                      value={form[f.name] ?? ""}
                      onChange={(e) => handleFieldChange(f, e.target.value)}
                      className={cn("w-full h-11 rounded-lg dark:bg-[#171717]", errors[f.name] && errorInputClass)}
                    />
                    {errors[f.name] && <span className="text-xs text-red-500">{t("field_required")}</span>}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className={cn(
                  "px-5 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                  creating ? "bg-[#7EC0FF] cursor-default" : "bg-[#0090FF] hover:bg-[#007BE0] cursor-pointer"
                )}
              >
                <HugeIcon icon={CheckmarkSquare01Icon} size={18} />
                {t(config.addKey)}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Filter modali (pagination bilan) ── */}
      <Modal
        isOpen={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
        height={600}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-3">
            {/* nav */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="w-11 h-11 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition dark:hover:bg-[#0a0a0a]"
                  onClick={() => setOpenFilterModal(false)}
                >
                  <ArrowLeft size={24} />
                </span>
                <h1 className="text-2xl font-semibold">{t("filter_title")}</h1>
              </div>
              <span className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                {t("filter_subtitle")}
              </span>
            </div>

            {/* filter select'lari — scroll pagination bilan */}
            <div className="grid grid-cols-2 gap-3">
              {(config.filters || []).map((f) => {
                const parentVal = f.dependsOn ? tmpFilters[f.dependsOn]?.value : null
                const isDisabled = !!f.dependsOn && !parentVal
                const pag = filterPagination[f.name]
                const opts = pag?.options || []
                const loading = pag?.loading || false

                return (
                  <Select
                    key={f.name}
                    label={t(f.labelKey)}
                    placeholder={isDisabled ? t("gz_select_region_first") : t(f.phKey)}
                    options={opts}
                    value={tmpFilters[f.name]?.value ?? null}
                    onChange={(opt) => handleFilterChange(f, opt)}
                    disabled={isDisabled}
                    loadingMore={loading}
                    searchable={true}
                    onOpen={() => handleFilterOpen(f)}
                    onScrollEnd={() => handleFilterScrollEnd(f)}
                    onSearch={(searchText) => {
                      setFilterSearch(prev => ({
                        ...prev,
                        [f.name]: searchText,
                      }));

                      loadFilterOptions(
                        f,
                        parentVal,
                        1,
                        searchText
                      );
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer"
              onClick={clearFilters}
            >
              <X size={14} />
              {t("clear")}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg"
              onClick={applyFilters}
            >
              <HugeIcon size={14} icon={Search01Icon} />
              {t("search")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Tahrirlash modali ── */}
      {config.custom === "roles" ? (
        <RoleModal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          roleData={editRow}
          canDelete={canDelete}
          canEdit={canEdit}
          fetchList={fetchList}
          setDeleteLoading={setDeleteLoading}
          getErrMsg={getErrMsg}
          deleteLoading={deleteLoading}
          setEditModal={setEditModal}
          onDelete={() => setShowDeleleRolModal(editRow)}
        />
      ) : config.custom === "schedule" ? (
        <ScheduleModal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          scheduleData={editRow}
          canEdit={canEdit}
          canDelete={canDelete}
          onDelete={() => setShowDeleleScheModal(editRow)}
          deleteLoading={deleteLoading}
        />
      ) : (<Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        height={600}
        header={
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
              {t("edit") || "Tahrirlash"}
            </h2>
            <button
              type="button"
              onClick={() => setEditModal(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer text-[#0A0A0A] dark:text-white"
            >
              <X size={20} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col justify-between h-full gap-4 pb-3">
          <div className="flex flex-col gap-4">
            {(config.fields || []).map((f, i) => {
              if (f.pairWith) return null
              const datePair = f.type === "date" ? config.fields.find((x) => x.pairWith === f.name) : null

              if (f.type === "date" && datePair) {
                return (
                  <div key={i} className="grid grid-cols-2 gap-3">
                    <DatePicker
                      className="w-full"
                      inputClassName="h-11"
                      currentLang={currentLang}
                      label={t(f.labelKey)}
                      placeholder={t(f.phKey)}
                      value={editForm[f.name]}
                      onChange={(d) => setEditForm(p => ({ ...p, [f.name]: d }))}
                      error={!!editErrors[f.name]}
                      calendarIcon={<HugeIcon icon={Calendar02Icon} size={18} />}
                    />
                    <DatePicker
                      className="w-full"
                      inputClassName="h-11"
                      currentLang={currentLang}
                      label={t(datePair.labelKey)}
                      placeholder={t(datePair.phKey)}
                      value={editForm[datePair.name]}
                      onChange={(d) => setEditForm(p => ({ ...p, [datePair.name]: d }))}
                      error={!!editErrors[datePair.name]}
                      calendarIcon={<HugeIcon icon={Calendar02Icon} size={18} />}
                    />
                  </div>
                )
              }
              if (f.type === "date") {
                return <DatePicker
                  key={i}
                  currentLang={currentLang}
                  label={t(f.labelKey)}
                  placeholder={t(f.phKey)}
                  value={editForm[f.name]}
                  onChange={(d) => setEditForm(p => ({ ...p, [f.name]: d }))}
                  error={!!editErrors[f.name]}
                  calendarIcon={<HugeIcon icon={Calendar02Icon} size={18} />}
                />
              }
              if (f.type === "select") {
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Select
                      label={t(f.labelKey)}
                      placeholder={t(f.phKey)}
                      options={options[f.name] || []}
                      value={editForm[f.name] ?? null}
                      onChange={(opt) => setEditForm(p => ({ ...p, [f.name]: opt?.value ?? null }))}
                      className={cn(editErrors[f.name] && errorInputClass)}
                      searchable={true}
                      loadingMore={optionsPag[f.name]?.loading || false}
                      onScrollEnd={() => {
                        const pag = optionsPag[f.name]
                        if (!pag?.hasMore || pag?.loading) return
                        loadOptions(f, null, pag.page + 1, "")
                      }}
                      onSearch={(s) => loadOptions(f, null, 1, s)}
                    />
                    {editErrors[f.name] && <span className="text-xs text-red-500">{t("field_required")}</span>}
                  </div>
                )
              }
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t(f.labelKey)}</label>
                  <Input
                    type="text"
                    placeholder={t(f.phKey)}
                    value={editForm[f.name] ?? ""}
                    onChange={(e) => setEditForm(p => ({ ...p, [f.name]: e.target.value }))}
                    className={cn("w-full h-11 rounded-lg dark:bg-[#171717]", editErrors[f.name] && errorInputClass)}
                  />
                  {editErrors[f.name] && <span className="text-xs text-red-500">{t("field_required")}</span>}
                </div>
              )
            })}
          </div>
          {(canDelete || canEdit) &&
            <div className="flex items-center justify-between gap-3 sticky bottom-0 z-10">
              {/* Delete tugmasi — faqat canDelete bo'lsa */}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleleModal(editRow)}
                  disabled={deleteLoading}
                  className={cn(
                    "px-5 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                    deleteLoading
                      ? "bg-red-300 cursor-default"
                      : "bg-red-500 hover:bg-red-600 cursor-pointer"
                  )}
                >
                  <Trash2 size={18} />
                </button>
              )}

              {/* Save tugmasi — canEdit bo'lsa aktiv, bo'lmasa disabled */}
              <button
                type="button"
                onClick={handleUpdate}
                disabled={!canEdit || editSaving}
                className={cn(
                  "px-5 py-3 flex items-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-colors",
                  !canEdit
                    ? "bg-[#7EC0FF] cursor-not-allowed opacity-60"
                    : editSaving
                      ? "bg-[#7EC0FF] cursor-default"
                      : "bg-[#0090FF] hover:bg-[#007BE0] cursor-pointer"
                )}
              >
                <HugeIcon icon={CheckmarkSquare01Icon} size={18} />
                {t("save") || "Saqlash"}
              </button>
            </div>
          }
        </div>
      </Modal>
      )}

      <AlertModal
        isOpen={showDeleleModal}
        onClose={() => setShowDeleleModal(null)}
        onConfirm={() => handleDelete(showDeleleModal)}
        title={t("confirm_delate_title")}
        description={t("confirm_delate_desc")}
        confirmText={
          <span className="flex items-center gap-2">
            <Trash2Icon size={16} />
            {t("delete")}
          </span>
        }
        cancelText={
          <span className="flex items-center gap-2">
            <HugeIcon icon={CancelCircleHalfDotIcon} size={16} />
            {t("cancel")}
          </span>
        }
        confirmVariant="delete"
        loading={deleteLoading}
      />

      <AlertModal
        isOpen={showDeleleRolModal}
        onClose={() => setShowDeleleRolModal(null)}
        onConfirm={() => handleDeleteRol(showDeleleRolModal)}
        title={t("confirm_delate_title")}
        description={t("confirm_delate_desc")}
        confirmText={
          <span className="flex items-center gap-2">
            <Trash2Icon size={16} />
            {t("delete")}
          </span>
        }
        cancelText={
          <span className="flex items-center gap-2">
            <HugeIcon icon={CancelCircleHalfDotIcon} size={16} />
            {t("cancel")}
          </span>
        }
        confirmVariant="delete"
        loading={deleteLoading}
      />

      <AlertModal
        isOpen={showDeleleScheModal}
        onClose={() => setShowDeleleScheModal(null)}
        onConfirm={() => handleDeleteSche(showDeleleScheModal)}
        title={t("confirm_delate_title")}
        description={t("confirm_delate_desc")}
        confirmText={
          <span className="flex items-center gap-2">
            <Trash2Icon size={16} />
            {t("delete")}
          </span>
        }
        cancelText={
          <span className="flex items-center gap-2">
            <HugeIcon icon={CancelCircleHalfDotIcon} size={16} />
            {t("cancel")}
          </span>
        }
        confirmVariant="delete"
        loading={deleteLoading}
      />

      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div >
  )
}

export default ReferencePage
