import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/Context/LanguageContext";
import { axiosAPI } from "@/services/axiosAPI";
import { cn, exportAoaToCsv } from "@/lib/utils";
import { ArrowLeft, Check, ChevronDownIcon, Ellipsis, MoreVertical, Plus, X } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { HugeIcon } from "@/components/ui/HugeIcon";
import { ArrowDown01Icon, Cancel01Icon, CancelCircleHalfDotIcon, CheckmarkCircle04Icon, CheckmarkSquare01Icon, Download01Icon, FilterVerticalIcon, Search01Icon, Settings05Icon, SquareArrowDown01Icon, UserAccountIcon, UserLock01Icon, UserRemove02Icon } from "@hugeicons/core-free-icons";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { AddButton } from "@/components/ui/customAddButton";
import { useSelector } from "react-redux";
import { AlertModal } from "@/components/ui/ComfirmAlert";
import Toast from "@/components/ui/Toast";

const PAGE_SIZE = 20;

const EmployeeRegister = () => {
  const { t } = useLanguage();
  const regions = useSelector((state) => state.references.regions)
  const userPermission = useSelector((state) => state.references.userPermission)

  const viewEmpP = userPermission?.employees && userPermission?.employees.some(e => e.code === "employee_view_profile")
  const addEmp = userPermission?.employees && userPermission?.employees.some(e => e.code === "employee_add")
  const editEmp = userPermission?.employees && userPermission?.employees.some(e => e.code === "employee_edit")
  const blockEmp = userPermission?.employees && userPermission?.employees.some(e => e.code === "employee_block")
  const fireEmp = userPermission?.employees && userPermission?.employees.some(e => e.code === "employee_fire")


  const [employees, setEmployees] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef(null);

  // Committed list filters ({ value, label } | null) — drive the employee fetch
  const [regionFilter, setRegionFilter] = useState(null);
  const [districtFilter, setDistrictFilter] = useState(null);
  const [branchFilter, setBranchFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);

  // List filter modal (Reports-style) + its temporary selections
  const [openListFilter, setOpenListFilter] = useState(false);
  const [tmpRegion, setTmpRegion] = useState(null);
  const [tmpDistrict, setTmpDistrict] = useState(null);
  const [tmpBranch, setTmpBranch] = useState(null);
  const [tmpDepartment, setTmpDepartment] = useState(null);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([])
  const [roles, setRoles] = useState([])

  const [districts, setDistricts] = useState([])
  // Top filter row districts (separate from modal filter districts)
  const [filterDistricts, setFilterDistricts] = useState([])

  // Modal list pagination states
  const [modalPage, setModalPage] = useState(1)
  const [modalTotalCount, setModalTotalCount] = useState(0)
  const [modalLoading, setModalLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const listContainerRef = useRef(null)

  // Filter states for each modal type
  const [filters, setFilters] = useState({
    branch: {
      region: null,
      district: null,
      branch: null,
      hasFilter: false
    },
    department: {
      region: null,
      district: null,
      branch: null,
      hasFilter: false
    },
    position: {
      region: null,
      district: null,
      branch: null,
      hasFilter: false
    }
  });

  // Temporary filter states for modal
  const [tempFilterRegion, setTempFilterRegion] = useState(null)
  const [tempFilterDistrict, setTempFilterDistrict] = useState(null)
  const [tempFilterBranch, setTempFilterBranch] = useState(null)

  const [districtPag, setDistrictPag] = useState({ page: 1, hasMore: true, loading: false })
  const [branchPag, setBranchPag] = useState({ page: 1, hasMore: true, loading: false })
  const [departmentPag, setDepartmentPag] = useState({ page: 1, hasMore: true, loading: false })
  const [positionPag, setPositionPag] = useState({ page: 1, hasMore: true, loading: false })

  // Filter modal uchun alohida
  const [filterBranchPag, setFilterBranchPag] = useState({ page: 1, hasMore: true, loading: false })
  const [filterDistrictPag, setFilterDistrictPag] = useState({ page: 1, hasMore: true, loading: false })

  // List filter modal uchun
  const [listBranchPag, setListBranchPag] = useState({ page: 1, hasMore: true, loading: false })
  const [listDistrictPag, setListDistrictPag] = useState({ page: 1, hasMore: true, loading: false })
  const [listDepartmentPag, setListDepartmentPag] = useState({ page: 1, hasMore: true, loading: false })

  const [form, setForm] = useState({
    full_name: "",
    password: "",
    tabel: "",
    phone: "",
    branch: null,
    department: null,
    position: null,
    roles: null,
    schedule: null,
    perm_attendance_mark: false,
    perm_attendance_view: "self",
    perm_kpi_view: "self",
    perm_employee_manage: false,
    perm_reports_export: false,
    perm_geozone_create: false,
    perm_roles_manage: false,
  });

  const [selectedRolePerms, setSelectedRolePerms] = useState({})

  const [permOpen, setPermOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const [addEmployeeModal, setAddEmployeeModal] = useState(false)
  const [errors, setErrors] = useState({});
  // Refs to form field wrappers — used to scroll to the first error
  const fieldRefs = useRef({});
  const [detailEmployee, setDetailEmployee] = useState(null); // null = create mode
  const [dotMenuOpen, setDotMenuOpen] = useState(false);
  const dotMenuRef = useRef(null);

  // Close dot menu on outside click
  useEffect(() => {
    const fn = (e) => { if (dotMenuRef.current && !dotMenuRef.current.contains(e.target)) setDotMenuOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const [openModal, setOpenModal] = useState(null)

  const [openFilterModal, setOpenFilterModal] = useState(false)

  const [currentFilterModal, setCurrentFilterModal] = useState(null)

  const [openGroups, setOpenGroups] = useState({});

  const [toast, setToast] = useState({ open: false, message: "", seq: 0 })

  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [fireModalOpen, setFireModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [blockLoading, setBlockLoading] = useState(false)
  const [fireLoading, setFireLoading] = useState(false)

  // Local search state
  const [filterSearch, setFilterSearch] = useState("")

  const GROUP_LABELS = {
    regions: t("regions") || "Viloyatlar",
    districts: t("districts") || "Tumanlar",
    analytics: t("analytics") || "Analitika",
    holidays: t("holidays") || "Bayramlar",
    schedules: t("schedules") || "Ish grafiklari",
    audits: t("audits") || "Audit",
    roles: t("role") || "Rollar",
    positions: t("positions") || "Lavozimlar",
    departments: t("departments") || "Bo'limlar",
    branchs: t("branchs") || "Filiallar",
    reports: t("reports") || "Hisobotlar",
    kpis: t("kpis") || "KPI",
    gps: t("gps") || "GPS",
    geozones: t("geozones") || "Geozonalar",
    attendances: t("attendances") || "Davomat",
    employees: t("employees") || "Xodimlar",
    logs: t("logs") || "Xodimlar",
    dailys: t("dailys") || "Xodimlar",
  };

  const toggleGroup = (key) =>
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));


  useEffect(() => {
    if (!addEmployeeModal && !openModal && !openFilterModal) {
      setErrors({});
      setDotMenuOpen(false);
    }
  }, [addEmployeeModal, openModal, openFilterModal]);

  const showToast = (message, type = "success") => {
    setToast((prev) => ({
      open: true,
      message: message,
      seq: prev.seq + 1,
    }))
  }

  const fetchEmployees = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axiosAPI.get("users/employees/", {
        params: {
          page,
          search: search || undefined,
          region: regionFilter?.value || undefined,
          district: districtFilter?.value || undefined,
          branch: branchFilter?.value || undefined,
          department: departmentFilter?.value || undefined,
          ...params,
        },
      });
      if (res.status === 200) {
        setEmployees(res.data?.data?.results || []);
        setCount(res.data?.data?.count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (params = {}) => {
    try {
      const res = await axiosAPI.get("users/branches/", { params });
      if (res.status === 200) {
        setBranches(res.data?.data?.results || [])
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPositions = async (params = {}) => {
    try {
      const res = await axiosAPI.get("users/positions/", { params });
      if (res.status === 200) {
        setPositions(res.data?.data?.results || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axiosAPI.get("users/roles/");
      if (res.status === 200) {
        setRoles(res.data?.data?.results || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async (params = {}) => {
    try {
      const res = await axiosAPI.get("users/departments/", { params });
      if (res.status === 200) {
        setDepartments(res.data?.data?.results || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axiosAPI.get("users/schedules/");
      if (res.status === 200) {
        setSchedules(res.data?.data?.results || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch modal list with pagination
  const fetchModalList = async (type, pageNum = 1, searchTerm = "") => {
    setModalLoading(true)
    try {
      let res
      const params = { page: pageNum, page_size: PAGE_SIZE }

      if (searchTerm.trim()) {
        params.search = searchTerm
      }

      const filterData = filters[type]
      if (type === "branch") {
        if (filterData.region?.value) params.region = filterData.region.value
        if (filterData.district?.value) params.district = filterData.district.value
        if (filterData.branch?.value) params.id = filterData.branch.value
        res = await axiosAPI.get("users/branches/", { params })
        if (res.status === 200) {
          const newData = res.data?.data?.results || []
          if (pageNum === 1) {
            setBranches(newData)
            // Bitta natija bo'lsa avtomatik tanlash
            if (newData.length === 1) setModalSelected(newData[0].id)
          } else {
            setBranches(prev => [...prev, ...newData])
          }
          setModalTotalCount(res.data?.data?.count || 0)
          setHasMore(newData.length === PAGE_SIZE)
        }
      } else if (type === "department") {
        if (form.branch) params.branch = form.branch
        else if (filterData.branch?.value) params.branch = filterData.branch.value
        if (filterData.region?.value) params.region = filterData.region.value
        res = await axiosAPI.get("users/departments/", { params })
        if (res.status === 200) {
          const newData = res.data?.data?.results || []
          if (pageNum === 1) {
            setDepartments(newData)
            if (newData.length === 1) setModalSelected(newData[0].id)
          } else {
            setDepartments(prev => [...prev, ...newData])
          }
          setModalTotalCount(res.data?.data?.count || 0)
          setHasMore(newData.length === PAGE_SIZE)
        }
      } else if (type === "position") {
        if (form.department) params.department = form.department
        if (form.branch) params.branch = form.branch
        else if (filterData.branch?.value) params.branch = filterData.branch.value
        if (filterData.region?.value) params.region = filterData.region.value
        res = await axiosAPI.get("users/positions/", { params })
        if (res.status === 200) {
          const newData = res.data?.data?.results || []
          if (pageNum === 1) {
            setPositions(newData)
            if (newData.length === 1) setModalSelected(newData[0].id)
          } else {
            setPositions(prev => [...prev, ...newData])
          }
          setModalTotalCount(res.data?.data?.count || 0)
          setHasMore(newData.length === PAGE_SIZE)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setModalLoading(false)
    }
  }

  const fetchDistricts = async (regionId) => {
    setTempFilterDistrict(null)
    try {
      const res = await axiosAPI.get("users/districts/", { params: { region: regionId } })
      if (res.status === 200) {
        setDistricts(
          (res.data?.data?.results || []).map((d) => ({ value: d.id, label: d.name }))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Districts (filter modal ichidagi)
  const loadDistricts = async (regionId, pageNum = 1, search = "", append = false) => {
    setFilterDistrictPag(p => ({ ...p, loading: true }))
    try {
      const { results, hasMore } = await fetchPaginated("users/districts/", { region: regionId }, pageNum, search)
      const mapped = results.map(d => ({ value: d.id, label: d.name }))
      setDistricts(prev => pageNum === 1 || !append ? mapped : [...prev, ...mapped])
      setFilterDistrictPag({ page: pageNum, hasMore, loading: false })
      if (pageNum === 1 && mapped.length === 1) setTempFilterDistrict(mapped[0])
    } catch { setFilterDistrictPag(p => ({ ...p, loading: false })) }
  }

  const loadFilterBranches = async (pageNum = 1, search = "", regionId = null, districtId = null) => {
    setFilterBranchPag(p => ({ ...p, loading: true }))
    try {
      const params = {}
      if (regionId) params.region = regionId
      if (districtId) params.district = districtId
      const { results, hasMore } = await fetchPaginated("users/branches/", params, pageNum, search)
      setBranches(prev => pageNum === 1 ? results : [...prev, ...results])
      setFilterBranchPag({ page: pageNum, hasMore, loading: false })
      if (pageNum === 1 && results.length === 1) {
        setTempFilterBranch({ value: results[0].id, label: results[0].name })
      }
    } catch { setFilterBranchPag(p => ({ ...p, loading: false })) }
  }
  // List filter modal districts
  const loadListDistricts = async (regionId, pageNum = 1, search = "") => {
    setListDistrictPag(p => ({ ...p, loading: true }))
    try {
      const { results, hasMore } = await fetchPaginated("users/districts/", { region: regionId }, pageNum, search)
      const mapped = results.map(d => ({ value: d.id, label: d.name }))
      setFilterDistricts(prev => pageNum === 1 ? mapped : [...prev, ...mapped])
      setListDistrictPag({ page: pageNum, hasMore, loading: false })
      if (pageNum === 1 && mapped.length === 1) setTmpDistrict(mapped[0])
    } catch { setListDistrictPag(p => ({ ...p, loading: false })) }
  }

  // Branches — endi region/district bo'yicha filtrlanadi + auto-select
  const loadListBranches = async (pageNum = 1, search = "", regionId = null, districtId = null) => {
    setListBranchPag(p => ({ ...p, loading: true }))
    try {
      const params = {}
      if (regionId) params.region = regionId
      if (districtId) params.district = districtId
      const { results, hasMore } = await fetchPaginated("users/branches/", params, pageNum, search)
      setBranches(prev => pageNum === 1 ? results : [...prev, ...results])
      setListBranchPag({ page: pageNum, hasMore, loading: false })
      if (pageNum === 1 && results.length === 1) {
        setTmpBranch({ value: results[0].id, label: results[0].name })
      }
    } catch { setListBranchPag(p => ({ ...p, loading: false })) }
  }

  // Departments — endi branch bo'yicha filtrlanadi + auto-select
  const loadListDepartments = async (pageNum = 1, search = "", branchId = null) => {
    setListDepartmentPag(p => ({ ...p, loading: true }))
    try {
      const params = {}
      if (branchId) params.branch = branchId
      const { results, hasMore } = await fetchPaginated("users/departments/", params, pageNum, search)
      setDepartments(prev => pageNum === 1 ? results : [...prev, ...results])
      setListDepartmentPag({ page: pageNum, hasMore, loading: false })
      if (pageNum === 1 && results.length === 1) {
        setTmpDepartment({ value: results[0].id, label: results[0].name })
      }
    } catch { setListDepartmentPag(p => ({ ...p, loading: false })) }
  }

  const fetchPaginated = async (endpoint, params = {}, pageNum = 1, search = "") => {
    const p = { page: pageNum, ...params }
    if (search?.trim()) p.search = search
    const res = await axiosAPI.get(endpoint, { params: p })
    if (res.status === 200) {
      const data = res.data?.data || {}
      return {
        results: data.results || [],
        hasMore: !!data.next,
      }
    }
    return { results: [], hasMore: false }
  }

  const handleRegionChange = (opt) => {
    setTempFilterRegion(opt)
    setDistricts([])
    setTempFilterDistrict(null)
    setTempFilterBranch(null)
    setFilterDistrictPag({ page: 1, hasMore: true, loading: false })
    setFilterBranchPag({ page: 1, hasMore: true, loading: false })
    if (opt?.value) loadDistricts(opt.value, 1, "")
    loadFilterBranches(1, "", opt?.value, null)
  }

  const handleBlockEmployee = async () => {
    if (!selectedEmployee) return
    setBlockLoading(true)
    try {
      const res = await axiosAPI.post(`users/employees/${selectedEmployee.id}/block/`)
      if (res.status === 200 || res.status === 201) {
        showToast(`${selectedEmployee.full_name} ${t("employee_blocked")}`)

        setBlockModalOpen(false)
        setDotMenuOpen(false)
        setAddEmployeeModal(false)
        fetchEmployees()
        // Detail ma'lumotlarni yangilash
        if (detailEmployee && detailEmployee.id === selectedEmployee.id) {
          setDetailEmployee(prev => ({ ...prev, is_blocked: true }))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBlockLoading(false)
    }
  }

  const handleUnblockEmployee = async () => {
    if (!selectedEmployee) return
    setBlockLoading(true)
    try {
      const res = await axiosAPI.post(`users/employees/${selectedEmployee.id}/unblock/`)
      if (res.status === 200 || res.status === 201) {
        showToast(`${selectedEmployee.full_name} ${t("employee_unblocked")}`)

        setBlockModalOpen(false)
        setDotMenuOpen(false)
        setAddEmployeeModal(false)
        fetchEmployees()
        if (detailEmployee && detailEmployee.id === selectedEmployee.id) {
          setDetailEmployee(prev => ({ ...prev, is_blocked: false }))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBlockLoading(false)
    }
  }

  const handleFireEmployee = async () => {
    if (!selectedEmployee) return
    setFireLoading(true)
    try {
      const res = await axiosAPI.post(`users/employees/${selectedEmployee.id}/fire/`)
      if (res.status === 200 || res.status === 201) {
        showToast(`${selectedEmployee.full_name} ${t("employee_fired")}`)

        setFireModalOpen(false)
        setDotMenuOpen(false)
        setAddEmployeeModal(false)
        setDetailEmployee(null)
        fetchEmployees()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFireLoading(false)
    }
  }


  // Apply filter function - sends request to API
  const applyFilter = () => {
    const filterKey = currentFilterModal

    // Save filters for this modal
    setFilters(prev => ({
      ...prev,
      [filterKey]: {
        region: tempFilterRegion,
        district: tempFilterDistrict,
        branch: tempFilterBranch,
        hasFilter: !!(tempFilterRegion || tempFilterDistrict || tempFilterBranch)
      }
    }))

    // Reset page and fetch with new filters
    setModalPage(1)
    setHasMore(true)
    fetchModalList(filterKey, 1, filterSearch)

    // Close filter modal and reopen selection modal
    setOpenFilterModal(false)
    setTimeout(() => setOpenModal(currentFilterModal), 100)
  }

  // Clear filter function
  const clearFilter = () => {
    setTempFilterRegion(null)
    setTempFilterDistrict(null)
    setTempFilterBranch(null)
    setDistricts([])

    // Clear saved filters
    setFilters(prev => ({
      ...prev,
      [currentFilterModal]: {
        region: null,
        district: null,
        branch: null,
        hasFilter: false
      }
    }))

    // Reset data
    setModalPage(1)
    setHasMore(true)
    fetchModalList(currentFilterModal, 1, filterSearch)
  }

  // Open filter modal with saved filters
  const handleFilterDistrictChange = (opt) => {
    setTempFilterDistrict(opt)
    setTempFilterBranch(null)
    setFilterBranchPag({ page: 1, hasMore: true, loading: false })
    loadFilterBranches(1, "", tempFilterRegion?.value, opt?.value)
  }

  const openFilterModalWithFilters = (modalType) => {
    setCurrentFilterModal(modalType)
    const savedFilters = filters[modalType]
    setTempFilterRegion(savedFilters.region)
    setTempFilterDistrict(savedFilters.district)
    setTempFilterBranch(savedFilters.branch)
    if (savedFilters.region?.value) loadDistricts(savedFilters.region.value, 1, "")
    loadFilterBranches(1, "", savedFilters.region?.value, savedFilters.district?.value)
    setOpenFilterModal(modalType)
    setTimeout(() => setOpenModal(null), 100)
  }

  // Handle scroll for infinite scroll
  const handleScroll = useCallback(() => {
    if (!listContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current
    if (scrollTop + clientHeight >= scrollHeight - 50 && !modalLoading && hasMore) {
      const nextPage = modalPage + 1
      setModalPage(nextPage)
      fetchModalList(openModal, nextPage, filterSearch)
    }
  }, [modalLoading, hasMore, modalPage, openModal, filterSearch])

  // Attach scroll listener
  useEffect(() => {
    const container = listContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Reset pagination when modal opens or search changes
  useEffect(() => {
    if (openModal && openModal !== "roles") {
      setModalPage(1)
      setHasMore(true)
      fetchModalList(openModal, 1, filterSearch)
    }
  }, [openModal, filterSearch])

  useEffect(() => {
    fetchRoles();
    fetchBranches();
    fetchPositions();
    fetchDepartments();
    fetchSchedules();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, regionFilter, districtFilter, branchFilter, departmentFilter]);

  // Fetch districts for the list filter modal (cascades from region)
  const fetchFilterDistricts = async (regionId) => {
    try {
      const res = await axiosAPI.get("users/districts/", { params: { region: regionId } })
      if (res.status === 200) {
        setFilterDistricts(
          (res.data?.data?.results || []).map((d) => ({ value: d.id, label: d.name }))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const hasListFilter = !!(regionFilter || districtFilter || branchFilter || departmentFilter)

  // Open the list filter modal seeded with the currently applied filters
  const openListFilterModal = () => {
    setTmpRegion(regionFilter)
    setTmpDistrict(districtFilter)
    setTmpBranch(branchFilter)
    setTmpDepartment(departmentFilter)
    if (regionFilter?.value) loadListDistricts(regionFilter.value, 1, "")
    loadListBranches(1, "", regionFilter?.value, districtFilter?.value)
    loadListDepartments(1, "", branchFilter?.value)
    setOpenListFilter(true)
  }

  // Region o'zgarsa — district, branch, department reset bo'ladi va branch region bo'yicha qayta yuklanadi
  const handleListRegionChange = (opt) => {
    setTmpRegion(opt)
    setFilterDistricts([])
    setTmpDistrict(null)
    setTmpBranch(null)
    setTmpDepartment(null)
    setDepartments([])
    setListDistrictPag({ page: 1, hasMore: true, loading: false })
    setListBranchPag({ page: 1, hasMore: true, loading: false })
    setListDepartmentPag({ page: 1, hasMore: true, loading: false })
    if (opt?.value) loadListDistricts(opt.value, 1, "")
    loadListBranches(1, "", opt?.value, null)
  }

  // Tuman o'zgarsa — branch va department reset, branch tuman bo'yicha qayta yuklanadi
  const handleListDistrictChange = (opt) => {
    setTmpDistrict(opt)
    setTmpBranch(null)
    setTmpDepartment(null)
    setDepartments([])
    setListBranchPag({ page: 1, hasMore: true, loading: false })
    setListDepartmentPag({ page: 1, hasMore: true, loading: false })
    loadListBranches(1, "", tmpRegion?.value, opt?.value)
  }

  // Filial o'zgarsa — department branch bo'yicha qayta yuklanadi
  const handleListBranchChange = (opt) => {
    setTmpBranch(opt)
    setTmpDepartment(null)
    setListDepartmentPag({ page: 1, hasMore: true, loading: false })
    loadListDepartments(1, "", opt?.value)
  }

  // Apply: commit temp selections (triggers the employee fetch via deps)
  const applyListFilter = () => {
    setRegionFilter(tmpRegion)
    setDistrictFilter(tmpDistrict)
    setBranchFilter(tmpBranch)
    setDepartmentFilter(tmpDepartment)
    setPage(1)
    setOpenListFilter(false)
  }

  // Clear both temp and applied filters
  const clearListFilter = () => {
    setTmpRegion(null)
    setTmpDistrict(null)
    setTmpBranch(null)
    setTmpDepartment(null)
    setFilterDistricts([])
    setRegionFilter(null)
    setDistrictFilter(null)
    setBranchFilter(null)
    setDepartmentFilter(null)
    setPage(1)
  }

  // Order in which fields appear in the form — used to find the first error
  const FIELD_ORDER = ["full_name", "password", "tabel", "phone", "branch", "department", "position", "roles", "schedule"];

  // Day numbers that are actual work days in a schedule (mandatory + optional)
  const getScheduleWorkDays = (scheduleId) => {
    const s = schedules.find((x) => x.id === scheduleId);
    if (!s) return [];
    const set = new Set();
    (s.mandatory_days_info || []).forEach((d) => set.add(d.day_number));
    (s.optional_days_info || []).forEach((d) => set.add(d.day_number));
    return [...set].sort((a, b) => a - b);
  };

  // First work day of a schedule (so time fields show real data instead of "—")
  const getScheduleFirstWorkDay = (scheduleId) => {
    const days = getScheduleWorkDays(scheduleId);
    return days.length ? days[0] : 0;
  };

  const handleAddEmployee = async () => {
    const newErrors = {};
    if (!form.full_name?.trim()) {
      newErrors.full_name = t("field_required") || "Ushbu maydon majburiy";
    }
    if (!form.password?.trim()) {
      newErrors.password = t("field_required") || "Ushbu maydon majburiy";
    }
    if (!form.tabel?.trim()) {
      newErrors.tabel = t("field_required") || "Ushbu maydon majburiy";
    } else if (form.tabel.trim().length !== 14) {
      newErrors.tabel = t("jshshir_length_error") || "JSHSHIR 14 ta raqamdan iborat bo'lishi kerak";
    }
    if (!form.phone?.trim()) {
      newErrors.phone = t("field_required") || "Ushbu maydon majburiy";
    }
    if (!form.branch) {
      newErrors.branch = t("field_required") || "Ushbu maydon majburiy";
    }
    if (!form.department) {
      newErrors.department = t("field_required") || "Ushbu maydon majburiy";
    }
    if (!form.position) {
      newErrors.position = t("field_required") || "Ushbu maydon majburiy";
    }
    if (!form.roles) {
      newErrors.roles = t("field_required") || "Ushbu maydon majburiy";
      setPermOpen(true);
    }
    if (!form.schedule) {
      newErrors.schedule = t("field_required") || "Ushbu maydon majburiy";
      setTableOpen(true);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      return;
    }
    setErrors({});

    try {
      const res = await axiosAPI.post("users/employees/", {
        full_name: form.full_name,
        password: form.password,
        jshshir: form.tabel,
        phone: form.phone.replace(/[\s-]/g, ""),
        branch: form.branch,
        department: form.department,
        position: form.position,
        role: form.roles,
        schedule: form.schedule,
      });
      if (res.status === 201 || res.status === 200) {
        setAddEmployeeModal(false);
        showToast(`${form.full_name} ${t("employee_added")}`)
        setForm({
          full_name: "",
          password: "",
          tabel: "",
          phone: "",
          branch: null,
          department: null,
          position: null,
          roles: null,
          schedule: null,
          perm_attendance_mark: false,
          perm_attendance_view: "self",
          perm_kpi_view: "self",
          perm_employee_manage: false,
          perm_reports_export: false,
          perm_geozone_create: false,
          perm_roles_manage: false,
        });
        setSelectedDay(0);
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
      const details = err?.response?.data?.error?.details;
      if (details && typeof details === "object") {
        const fieldMap = {
          full_name: "full_name",
          password: "password",
          jshshir: "tabel",
          phone: "phone",
          branch: "branch",
          department: "department",
          position: "position",
          role: "roles",
          schedule: "schedule",
        };
        const backendErrors = {};
        Object.entries(details).forEach(([field, messages]) => {
          const key = fieldMap[field] || field;
          backendErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(backendErrors);
        scrollToFirstError(backendErrors);
      }
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await axiosAPI.get(`users/employees/${id}/`)
      if (res.status === 200) {
        const emp = res.data?.data;
        setDetailEmployee(emp);
        // Telefon raqamini formatlash
        const rawPhone = emp?.phone || "";
        const digits = rawPhone.replace(/\D/g, "");
        let formattedPhone = rawPhone;
        if (digits.length >= 11) {
          const local = digits.startsWith("998") ? digits.slice(3) : digits;
          const d = local.slice(0, 9);
          if (d.length <= 2) formattedPhone = `+998 ${d}`;
          else if (d.length <= 5) formattedPhone = `+998 ${d.slice(0, 2)} ${d.slice(2)}`;
          else if (d.length <= 7) formattedPhone = `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
          else formattedPhone = `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
        }
        setForm({
          full_name: emp?.full_name || "",
          password: "",
          tabel: emp?.jshshir || "",
          phone: formattedPhone,
          branch: emp?.branch_info?.id || null,
          department: emp?.department_info?.id || null,
          position: emp?.position_info?.id || null,
          roles: emp?.role_info?.id || null,
          schedule: emp?.schedule_info?.id || null,
          perm_attendance_mark: false,
          perm_attendance_view: "self",
          perm_kpi_view: "self",
          perm_employee_manage: false,
          perm_reports_export: false,
          perm_geozone_create: false,
          perm_roles_manage: false,
        });
        setSelectedDay(getScheduleFirstWorkDay(emp?.schedule_info?.id || null));
        setErrors({});
        setAddEmployeeModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Faqat ozgargan maydonlarni aniqlash
  const getChangedFields = (emp) => {
    const changed = {};
    const cleanPhone = form.phone.replace(/[\s-]/g, "");
    if (form.full_name !== (emp?.full_name || "")) changed.full_name = form.full_name;
    if (form.password?.trim()) changed.password = form.password;
    if (form.tabel !== (emp?.jshshir || "")) changed.jshshir = form.tabel;
    if (cleanPhone !== (emp?.phone || "")) changed.phone = cleanPhone;
    if (form.branch !== (emp?.branch_info?.id || null)) changed.branch = form.branch;
    if (form.department !== (emp?.department_info?.id || null)) changed.department = form.department;
    if (form.position !== (emp?.position_info?.id || null)) changed.position = form.position;
    if (form.roles !== (emp?.role_info?.id || null)) changed.role = form.roles;
    if (form.schedule !== (emp?.schedule_info?.id || null)) changed.schedule = form.schedule;
    return changed;
  };

  const handleUpdateEmployee = async () => {
    const changed = getChangedFields(detailEmployee);
    if (Object.keys(changed).length === 0) {
      setAddEmployeeModal(false);
      return;
    }
    try {
      const res = await axiosAPI.patch(`users/employees/${detailEmployee?.id}/`, changed);
      if (res.status === 200) {
        showToast(`${detailEmployee?.full_name} ${t("employee_updated")}`)

        setAddEmployeeModal(false);
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
      const details = err?.response?.data?.error?.details;
      if (details && typeof details === "object") {
        const fieldMap = {
          full_name: "full_name", password: "password", jshshir: "tabel",
          phone: "phone", branch: "branch", department: "department",
          position: "position", role: "roles", schedule: "schedule",
        };
        const backendErrors = {};
        Object.entries(details).forEach(([field, messages]) => {
          const key = fieldMap[field] || field;
          backendErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(backendErrors);
        scrollToFirstError(backendErrors);
      }
    }
  };

  const isCrudGroup = (items) => items.length > 1;

  useEffect(() => {
    const found = roles.find((r) => r.id === form.roles);
    setSelectedRolePerms(found?.permissions_info ?? {});
  }, [form.roles, roles]);

  // Barcha options bitta objectda
  const modalOptions = {
    branch: branches,
    department: departments,
    position: positions,
    roles,
  };

  const modalTitles = {
    branch: t("select_branch") || "Filialni tanlang",
    department: t("select_department") || "Bo'limni tanlang",
    position: t("select_position") || "Lavozimni tanlang",
    roles: t("select_role") || "Rol tanlang",
  };

  // Alohida state
  const [modalSelected, setModalSelected] = useState(null);

  // openModal o'zgarganda sync qil
  useEffect(() => {
    if (openModal) {
      setModalSelected(form[openModal]);
    }
  }, [openModal]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  // Excel / PDF / CSV uchun umumiy sarlavha + qatorlar
  const buildExportData = () => {
    const headers = [
      "#",
      t("full_name") || "Ism familya",
      t("region") || "Viloyat",
      t("district") || "Tuman",
      t("col_branch") || "Filial",
      t("department") || "Bo'lim",
      t("position") || "Lavozim",
      t("role") || "Rol",
      t("schedule") || "Kelgan vaqti",
    ];

    const rows = employees.map((e, i) => [
      (page - 1) * PAGE_SIZE + i + 1,
      e.full_name || "",
      e.branch_info?.region_info?.name || "",
      e.branch_info?.district_info?.name || "",
      e.branch_info?.name || "",
      e.department_info?.name || "",
      e.position_info?.name || "",
      e.role_info?.name || "",
      e.schedule_info?.work_start_time ? e.schedule_info.name : "",
    ]);

    return { headers, rows };
  };

  const exportExcel = () => {
    if (!employees.length) {
      showToast(t("no_data_to_export"));
      return;
    }

    try {
      const { headers, rows } = buildExportData();

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Ustun kenliklari
      ws["!cols"] = [
        { wch: 6 },   // #
        { wch: 32 },  // Ism familya
        { wch: 20 },  // Viloyat
        { wch: 20 },  // Tuman
        { wch: 24 },  // Filial
        { wch: 22 },  // Bo'lim
        { wch: 22 },  // Lavozim
        { wch: 18 },  // Rol
        { wch: 18 },  // Kelgan vaqti
      ];

      // Barcha qatorlar balandligi
      ws["!rows"] = [
        { hpt: 32 }, // header qatori
        ...rows.map(() => ({ hpt: 26 })),
      ];

      const HEADER_BG = "F0F0F0";
      const HEADER_FONT = "0A0A0A";
      const ROW_ODD_BG = "FFFFFF";
      const ROW_EVEN_BG = "FAFAFA";
      const FONT_COLOR = "1A1A1A";
      const BORDER_CLR = "D4D4D4";

      const borderStyle = {
        top: { style: "thin", color: { rgb: BORDER_CLR } },
        bottom: { style: "thin", color: { rgb: BORDER_CLR } },
        left: { style: "thin", color: { rgb: BORDER_CLR } },
        right: { style: "thin", color: { rgb: BORDER_CLR } },
      };

      // Header uslubi
      headers.forEach((_, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
        if (!ws[cellRef]) return;
        ws[cellRef].s = {
          fill: {
            patternType: "solid",
            fgColor: { rgb: HEADER_BG },
          },
          font: {
            bold: true,
            sz: 11,
            color: { rgb: HEADER_FONT },
            name: "Calibri",
          },
          alignment: {
            vertical: "center",
            horizontal: colIdx === 0 ? "center" : "left",
            wrapText: false,
          },
          border: borderStyle,
        };
      });

      // Data qatorlari uslubi
      rows.forEach((_, rowIdx) => {
        const isEven = rowIdx % 2 === 1;
        headers.forEach((__, colIdx) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
          if (!ws[cellRef]) return;
          ws[cellRef].s = {
            fill: {
              patternType: "solid",
              fgColor: { rgb: isEven ? ROW_EVEN_BG : ROW_ODD_BG },
            },
            font: {
              sz: 10,
              color: { rgb: FONT_COLOR },
              name: "Calibri",
            },
            alignment: {
              vertical: "center",
              horizontal: colIdx === 0 ? "center" : "left",
              wrapText: false,
            },
            border: borderStyle,
          };
        });
      });

      const wb = XLSX.utils.book_new();
      // xlsx styles uchun bookSST kerak
      wb.Workbook = { SheetNames: [], Sheets: {} };
      XLSX.utils.book_append_sheet(wb, ws, "Xodimlar");
      XLSX.writeFile(wb, "Xodimlar-royxati.xlsx", { bookType: "xlsx", cellStyles: true });

      showToast(t("export_success"));
    } catch (err) {
      console.error(err);
      showToast(t("export_error"));
    }
  };

  const exportPDF = () => {
    if (!employees.length) {
      showToast(t("no_data_to_export"));
      return;
    }
    try {
      const { headers, rows } = buildExportData();
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("Xodimlar ro'yxati", 14, 16);
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 22,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
      });
      doc.save("Xodimlar-royxati.pdf");
      showToast(t("export_pdf_success"));
    } catch (err) {
      console.error(err);
      showToast(t("export_error"));
    }
  };

  const exportCSV = () => {
    if (!employees.length) {
      showToast(t("no_data_to_export"));
      return;
    }
    try {
      const { headers, rows } = buildExportData();
      exportAoaToCsv("Xodimlar-royxati.csv", [headers, ...rows]);
      showToast(t("export_csv_success"));
    } catch (err) {
      console.error(err);
      showToast(t("export_error"));
    }
  };

  const scrollToFirstError = (errs) => {
    const first = FIELD_ORDER.find((k) => errs?.[k]);
    if (!first) return;

    if (first === "roles") setPermOpen(true);
    if (first === "schedule") setTableOpen(true);

    setTimeout(() => {
      const el = fieldRefs.current[first];
      const container = document.getElementById("modal-scroll-body");
      if (!el || !container) return;

      container.scrollTo({
        top: el.offsetTop - 20,
        behavior: "smooth",
      });
    }, first === "roles" || first === "schedule" ? 400 : 60);
  };

  const COLS = 9;

  const CustomButton = ({ placeholder, onclick, onClear, selected, hasError, disabled }) => {
    return (
      <button
        type="button"
        onClick={onclick}
        className={cn(
          "flex items-center justify-between w-full px-3.5 py-3 rounded-xl border text-sm cursor-pointer select-none outline-none bg-[#fafafa] dark:bg-[#171717]",
          hasError
            ? "border-red-500!"
            : "border-gray-200 dark:border-[#404040]"
        )}
        disabled={disabled}
      >
        <span
          className={
            selected
              ? "text-[#0a0a0a] dark:text-[#fafafa] truncate max-w-full"
              : "text-[#737373] dark:text-[#A3A3A3] truncate max-w-full"
          }
        >
          {selected ?? placeholder}
        </span>

        <div className="flex items-center gap-2">
          <HugeIcon
            icon={ArrowDown01Icon}
            size={18}
            className={`text-[#0a0a0a] dark:text-[#fafafa] flex-shrink-0`}
          />

          {selected && !disabled &&
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="flex items-center cursor-pointer justify-center flex-shrink-0 w-5 h-5 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-gray-100 dark:text-[#A3A3A3] dark:hover:text-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors duration-150"
              aria-label="Tozalash"
            >
              <HugeIcon icon={Cancel01Icon} size={14} />
            </button>
          }
        </div>
      </button>
    )
  }

  return (
    <>
      <div className="p-4 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">
        {/* ── Filters row ── */}
        <div className="flex items-center justify-between w-full gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <Input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t("search_employee") || "Qidirish ... (ism-familya, yoki tabel)"}
              className="h-8.5! rounded-md w-[320px] shadow-sm border-[#e5e5e5] dark:border-[#404040]! dark:bg-[#0a0a0a]!"
            />

            {/* Filter button (opens the list filter modal) */}
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer relative border-[1.7px] text-sm border-[#E5E5E5] dark:border-[#404040] rounded-lg py-1.5 px-3 text-[#0A0A0A] dark:text-white"
              onClick={openListFilterModal}
            >
              {hasListFilter && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#DC2626]"></span>}
              <HugeIcon icon={FilterVerticalIcon} size={16} />
              {t("filter")}
            </button>
          </div>

          {/* Excel export */}
          <div className="flex items-center gap-3">
            {addEmp &&
              <AddButton
                onOpen={() => {
                  setDetailEmployee(null);
                  setForm({
                    full_name: "",
                    password: "",
                    tabel: "",
                    phone: "",
                    branch: null,
                    department: null,
                    position: null,
                    roles: null,
                    schedule: null,
                    perm_attendance_mark: false,
                    perm_attendance_view: "self",
                    perm_kpi_view: "self",
                    perm_employee_manage: false,
                    perm_reports_export: false,
                    perm_geozone_create: false,
                    perm_roles_manage: false,
                  });
                  setErrors({});
                  setAddEmployeeModal(true);
                }}
                title={t("new_employee")}
                className="h-8!"
              />
            }

            <ExportMenu
              onExcel={exportExcel}
              onPDF={exportPDF}
              onCSV={exportCSV}
              label={t("download")}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="w-full overflow-hidden">
          <div className="h-[calc(100vh-140px)] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#FAFAFA] dark:bg-[#262626] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                  {[
                    { label: "#", cls: "w-12" },
                    { label: t("full_name") || "Ism familya" },
                    { label: t("region") || "Viloyat" },
                    { label: t("district") || "Tuman" },
                    { label: t("col_branch") || "Filial" },
                    { label: t("department") || "Bo'lim" },
                    { label: t("position") || "Lavozim" },
                    { label: t("role") || "Rol" },
                    { label: t("schedule") || "Kelgan vaqti" },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-4 py-3.5 text-[13px] font-medium text-[#0A0A0A] dark:text-[#f5f5f5] whitespace-nowrap",
                        h.cls
                      )}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#F0F0F0] dark:border-[#1A1A1A]">
                      {Array.from({ length: COLS }).map((__, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-5 rounded-md bg-[#F5F5F5] dark:bg-[#1A1A1A] animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLS}
                      className="px-4 py-16 text-center text-sm text-[#737373]"
                    >
                      {t("no_data_found") || "Ma'lumot topilmadi"}
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, i) => (
                    <tr
                      key={emp.id}
                      className={`border-b border-[#F0F0F0] dark:border-[#1A1A1A] hover:bg-[#FAFAFA] dark:hover:bg-[#111] ${(viewEmpP || editEmp) && "cursor-pointer"}`}
                      onClick={() => { (viewEmpP || editEmp) && handleOpenDetail(emp.id); }}
                    >
                      <td className="px-4 py-3.5 text-sm font-medium dark:text-[#f5f5f5]">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[180px]">
                            {emp.full_name || ""}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.branch_info?.region_info?.name || ""}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.branch_info?.district_info?.name || ""}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.branch_info?.name || ""}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.department_info?.name || ""}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.position_info?.name || ""}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.role_info?.name || ""}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5] tabular-nums">
                        {emp.schedule_info?.work_start_time
                          ? emp.schedule_info.name
                          : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!loading && count > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#0A0A0A]">
              <span className="text-[13px] text-[#737373]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, count)} / {count}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(count / PAGE_SIZE) }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === Math.ceil(count / PAGE_SIZE) || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1.5 text-[#A3A3A3] text-[13px]">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-[13px] font-medium transition-colors cursor-pointer",
                          p === page
                            ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]"
                            : "text-[#737373] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* create / detail modal */}
      <Modal
        height={680}
        isOpen={addEmployeeModal}
        onClose={() => {
          setAddEmployeeModal(false);
          setDetailEmployee(null);
        }}
        header={
          detailEmployee ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddEmployeeModal(false);
                      setDetailEmployee(null);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} className="text-[#0a0a0a] dark:text-white" />
                  </button>
                  <h2 className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">
                    {t("employee_details") || "Xodim ma'lumotlari"}
                  </h2>
                </div>

                {(blockEmp || fireEmp) &&
                  <div ref={dotMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setDotMenuOpen((p) => !p)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                    >
                      <Ellipsis size={18} className="text-[#0a0a0a] dark:text-white" />
                    </button>
                    {dotMenuOpen && (
                      <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-white dark:bg-[#262626] border border-[#E5E7EB] dark:border-[#2E2E2E] rounded-xl shadow-lg overflow-hidden min-w-[170px] py-1">
                        {!detailEmployee?.is_active ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(detailEmployee);
                              setDotMenuOpen(false);
                              setBlockModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#0a0a0a] dark:text-[#f5f5f5] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                          >
                            <HugeIcon icon={UserLock01Icon} size={16} />
                            {t("unblock_employee") || "Blokdan chiqarish"}
                          </button>
                        ) : (
                          blockEmp && <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(detailEmployee);
                              setDotMenuOpen(false);
                              setBlockModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#0a0a0a] dark:text-[#f5f5f5] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                          >
                            <HugeIcon icon={UserLock01Icon} size={16} />
                            {t("block_employee") || "Bloklash"}
                          </button>
                        )}
                        {fireEmp &&
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(detailEmployee);
                              setDotMenuOpen(false);
                              setFireModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-500 dark:text-[#F87171] hover:bg-[#FFF0F0] dark:hover:bg-[#2A1A1A] transition-colors cursor-pointer"
                          >
                            <HugeIcon icon={UserRemove02Icon} size={16} />
                            {t("fire_employee") || "Ishdan chetlatish"}
                          </button>
                        }
                      </div>
                    )}
                  </div>
                }
              </div>

              <div className="flex items-center gap-3">
                {detailEmployee?.face_image ? (
                  <img
                    src={detailEmployee.face_image}
                    alt={detailEmployee.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E5E7EB] dark:border-[#2E2E2E] flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0090FF] to-[#6C47FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {(detailEmployee?.full_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
                  {t("new_employee") || "Yangi xodim"}
                </h2>
                <div className="flex items-center gap-1.5 text-[#0a0a0a] dark:text-[#f5f5f5] text-sm">
                  <HugeIcon icon={UserAccountIcon} size={16} />
                  <span>{t("add_employee_subtitle") || "Xodim qo'shish"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddEmployeeModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer text-[#0a0a0a] dark:text-white"
              >
                <X size={20} />
              </button>
            </div>
          )
        }
      >
        <div className="flex flex-col justify-between gap-4 h-full">

          <div className="grid grid-cols-2 gap-3 pb-5">

            {/* Ism familyasi */}
            <div ref={el => fieldRefs.current.full_name = el} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("full_name") || "Ism familyasi"}
              </label>
              <Input
                type="text"
                placeholder={t("full_name") || "Ism familyasi"}
                value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className={cn("w-full h-11 rounded-lg dark:bg-[#171717]", errors.full_name && "border-red-500!")}
                disabled={!editEmp}
              />
              {errors.full_name && <span className="text-[11px] text-red-500 font-medium">{errors.full_name}</span>}
            </div>

            {/* Parol */}
            <div ref={el => fieldRefs.current.password = el} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("password_label") || "Parol"}
              </label>
              <Input
                type="text"
                placeholder={t("create_password_placeholder") || "Parol yarating"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className={cn("w-full h-11 rounded-lg dark:bg-[#171717]", errors.password && "border-red-500!")}
                disabled={!editEmp}
              />
              {errors.password && <span className="text-[11px] text-red-500 font-medium">{errors.password}</span>}
            </div>

            {/* JSHSHIR */}
            <div ref={el => fieldRefs.current.tabel = el} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                JSHSHIR
              </label>
              <Input
                type="text"
                placeholder={t("jshsh_number") || "JSHSHIR raqami"}
                value={form.tabel}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setForm((p) => ({ ...p, tabel: val }))
                }}
                className={cn("w-full h-11 rounded-lg dark:bg-[#171717]", errors.tabel && "border-red-500!")}
                maxLength={14}
                disabled={!editEmp}
              />
              {errors.tabel && <span className="text-[11px] text-red-500 font-medium">{errors.tabel}</span>}
            </div>

            {/* Telefon */}
            <div ref={el => fieldRefs.current.phone = el} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("phone") || "Telefon"}
              </label>
              <Input
                type="text"
                placeholder="+998"
                value={form.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  let formatted = "";
                  if (digits.length === 0) {
                    formatted = "";
                  } else {
                    const local = digits.startsWith("998") ? digits.slice(3) : digits;
                    const d = local.slice(0, 9);
                    if (d.length <= 2) formatted = `+998 ${d}`;
                    else if (d.length <= 5) formatted = `+998 ${d.slice(0, 2)} ${d.slice(2)}`;
                    else if (d.length <= 7) formatted = `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
                    else formatted = `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
                  }
                  setForm((p) => ({ ...p, phone: formatted }));
                }}
                className={cn("w-full h-11 rounded-lg dark:bg-[#171717]", errors.phone && "border-red-500!")}
                disabled={!editEmp}
              />
              {errors.phone && <span className="text-[11px] text-red-500 font-medium">{errors.phone}</span>}
            </div>

            {/* Filial */}
            <div ref={el => fieldRefs.current.branch = el} className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("col_branch") || "Filial"}
              </label>
              <CustomButton
                placeholder={t("select_branch")}
                selected={
                  branches.find(b => b.id === form.branch)?.name ||
                  (detailEmployee?.branch_info?.id === form.branch ? detailEmployee?.branch_info?.name : null)
                }
                onclick={() => { setAddEmployeeModal(false); setTimeout(() => setOpenModal("branch"), 100) }}
                onClear={() => setForm((p) => ({ ...p, branch: null }))}
                hasError={!!errors.branch}
                disabled={!editEmp}
              />
              {errors.branch && <span className="text-[11px] text-red-500 font-medium">{errors.branch}</span>}
            </div>

            {/* Bo'lim */}
            <div ref={el => fieldRefs.current.department = el} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("department") || "Bo'lim"}
              </label>
              <CustomButton
                placeholder={t("select_department")}
                selected={
                  departments.find(d => d.id === form.department)?.name ||
                  (detailEmployee?.department_info?.id === form.department ? detailEmployee?.department_info?.name : null)
                }
                onclick={() => { setAddEmployeeModal(false); setTimeout(() => setOpenModal("department"), 100) }}
                onClear={() => setForm((p) => ({ ...p, department: null }))}
                hasError={!!errors.department}
                disabled={!editEmp}
              />
              {errors.department && <span className="text-[11px] text-red-500 font-medium">{errors.department}</span>}
            </div>

            {/* Lavozim */}
            <div ref={el => fieldRefs.current.position = el} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("position") || "Lavozim"}
              </label>
              <CustomButton
                placeholder={t("select_position")}
                selected={
                  positions.find(d => d.id === form.position)?.name ||
                  (detailEmployee?.position_info?.id === form.position ? detailEmployee?.position_info?.name : null)
                }
                onclick={() => { setAddEmployeeModal(false); setTimeout(() => setOpenModal("position"), 100) }}
                onClear={() => setForm((p) => ({ ...p, position: null }))}
                hasError={!!errors.position}
                disabled={!editEmp}
              />
              {errors.position && <span className="text-[11px] text-red-500 font-medium">{errors.position}</span>}
            </div>

            {/* Rol va Ruxsatlar */}
            <div className="flex flex-col gap-3 col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#0A0A0A] dark:text-[#f5f5f5]">
                    <HugeIcon icon={Settings05Icon} size={17} />
                    {t("role_permissions") || "Rol va ruxsatlar"}
                  </div>
                  <span className="text-[12px] text-[#0A0A0A] dark:text-[#f5f5f5]">
                    {t("role_permissions_subtitle") || "Rol tanlang — ruxsatlar avtomatik moslashadi"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPermOpen((p) => !p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  <HugeIcon icon={SquareArrowDown01Icon} size={18} className={`text-[#0A0A0A] transition-transform duration-200 dark:text-[#f5f5f5] ${permOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className={cn(
                "flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
                permOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <div ref={el => fieldRefs.current.roles = el} className="flex flex-col gap-2 divide-y divide-[#F0F0F0] dark:divide-[#1F1F1F]">
                  <CustomButton
                    placeholder={t("select_role")}
                    selected={
                      roles.find(d => d.id === form.roles)?.name ||
                      (detailEmployee?.role_info?.id === form.roles ? detailEmployee?.role_info?.name : null)
                    }
                    onclick={() => { setAddEmployeeModal(false); setTimeout(() => setOpenModal("roles"), 100) }}
                    onClear={() => setForm((p) => ({ ...p, roles: null }))}
                    hasError={!!errors.roles}
                    disabled={!editEmp}
                  />
                  {errors.roles && <span className="text-[11px] text-red-500 font-medium mt-1">{errors.roles}</span>}

                  <div className="flex flex-col divide-y divide-[#F0F0F0] dark:divide-[#1F1F1F]">
                    {Object.entries(selectedRolePerms).map(([groupKey, items]) => {
                      const label = GROUP_LABELS[groupKey] || groupKey;
                      const isOpen = !!openGroups[groupKey];
                      const multi = isCrudGroup(items);

                      if (!multi) {
                        return (
                          <div key={groupKey} className="flex items-center justify-between py-2.5">
                            <span className="text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">
                              {items[0]?.name || label}
                            </span>
                            <Switch disabled checked={true} containerClassName="w-[40px] h-[21px]" thumbClassName="w-[17px] h-[17px]" checkedThumbClassName="translate-x-5" />
                          </div>
                        );
                      }

                      return (
                        <div key={groupKey} className="flex flex-col gap-2 py-1">
                          <button
                            type="button"
                            onClick={() => toggleGroup(groupKey)}
                            className="flex items-center justify-between w-full py-1.5 cursor-pointer"
                          >
                            <span className="text-sm font-medium text-[#737373] dark:text-[#A3A3A3]">{label}</span>
                            <ChevronDownIcon size={16} className={cn("text-[#737373] transition-transform duration-300", isOpen && "rotate-180")} />
                          </button>
                          <div className={cn(
                            "grid grid-cols-2 gap-x-4 gap-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                            isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                          )}>
                            {items.map((perm) => (
                              <div key={perm.id} className="flex items-center justify-between py-2 pl-2">
                                <span className="text-[13px] text-[#0a0a0a] dark:text-[#f5f5f5] truncate pr-2">{perm.name}</span>
                                <Switch disabled checked={true} containerClassName="w-[25px] h-[15px]" thumbClassName="w-[11px] h-[11px]" checkedThumbClassName="translate-x-3" />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {Object.keys(selectedRolePerms).length === 0 && (
                      <div className="py-6 text-center text-[13px] text-[#A3A3A3]">
                        {t("select_role_hint") || "Rol tanlang — ruxsatlar ko'rinadi"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ish jadvali */}
            <div ref={el => fieldRefs.current.schedule = el} className="flex flex-col gap-3 col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#0A0A0A] dark:text-[#f5f5f5]">
                    <HugeIcon icon={Settings05Icon} size={17} />
                    {t("work_schedule") || "Ish jadvali"}
                  </div>
                  <span className="text-[12px] text-[#0A0A0A] dark:text-[#f5f5f5]">
                    {t("work_schedule_subtitle") || "Xodimning ish jadvali"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTableOpen((p) => !p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  <HugeIcon icon={SquareArrowDown01Icon} size={18} className={`text-[#0A0A0A] transition-transform duration-200 dark:text-[#f5f5f5] ${tableOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className={cn(
                "flex flex-col gap-3 transition-all duration-300 ease-in-out",
                tableOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              )}>
                <div className="flex flex-col gap-1.5">
                  <Select
                    placeholder={t("select_work_schedule") || "Ish grafigini tanlash"}
                    options={[
                      ...schedules.map(sch => ({ value: sch.id, label: sch.name })),
                      ...(detailEmployee?.schedule_info?.id && !schedules.find(s => s.id === detailEmployee.schedule_info.id)
                        ? [{ value: detailEmployee.schedule_info.id, label: detailEmployee.schedule_info.name }]
                        : [])
                    ]}
                    value={form.schedule}
                    onChange={(opt) => {
                      setForm((p) => ({ ...p, schedule: opt?.value ?? null }));
                      setSelectedDay(getScheduleFirstWorkDay(opt?.value ?? null));
                    }}
                    className={cn("w-full rounded-xl border! dark:border-[#404040]!", errors.schedule && "border-red-500!")}
                    disabled={!editEmp}
                  />
                  {errors.schedule && <span className="text-[11px] text-red-500 font-medium">{errors.schedule}</span>}
                </div>

                {form.schedule && (() => {
                  const selectedSchedule =
                    schedules.find((s) => s.id === form.schedule) ||
                    (detailEmployee?.schedule_info?.id === form.schedule ? detailEmployee.schedule_info : null);
                  if (!selectedSchedule) return null;

                  const isMandatory = selectedSchedule.mandatory_days_info?.some(d => d.day_number === selectedDay);
                  const isOptional = selectedSchedule.optional_days_info?.some(d => d.day_number === selectedDay);
                  const isActiveDay = isMandatory || isOptional;
                  const formatTime = (t) => t ? t.slice(0, 5) : "—";

                  const weekDays = [
                    { label: "Du", day_number: 0 },
                    { label: "Se", day_number: 1 },
                    { label: "Ch", day_number: 2 },
                    { label: "Pa", day_number: 3 },
                    { label: "Ju", day_number: 4 },
                    { label: "Sh", day_number: 5 },
                    { label: "Ya", day_number: 6 },
                  ];

                  return (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("work_start_time") || "Ish boshlanishi"}</label>
                          <Input type="text" readOnly value={isActiveDay ? formatTime(selectedSchedule.work_start_time) : "—"} className="w-full h-11 rounded-lg bg-[#F9F9F9] dark:bg-[#1C1C1C] border-[#E5E7EB] dark:border-[#2E2E2E] px-3.5 text-[#0A0A0A] dark:text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("work_end_time") || "Ish tugashi"}</label>
                          <Input type="text" readOnly value={isActiveDay ? formatTime(selectedSchedule.work_end_time) : "—"} className="w-full h-11 rounded-lg bg-[#F9F9F9] dark:bg-[#1C1C1C] border-[#E5E7EB] dark:border-[#2E2E2E] px-3.5 text-[#0A0A0A] dark:text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("lunch_start_time") || "Tushlik boshlanishi"}</label>
                          <Input type="text" readOnly value={isActiveDay ? formatTime(selectedSchedule.lunch_start_time) : "—"} className="w-full h-11 rounded-lg bg-[#F9F9F9] dark:bg-[#1C1C1C] border-[#E5E7EB] dark:border-[#2E2E2E] px-3.5 text-[#0A0A0A] dark:text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("lunch_end_time") || "Tushlik tugashi"}</label>
                          <Input type="text" readOnly value={isActiveDay ? formatTime(selectedSchedule.lunch_end_time) : "—"} className="w-full h-11 rounded-lg bg-[#F9F9F9] dark:bg-[#1C1C1C] border-[#E5E7EB] dark:border-[#2E2E2E] px-3.5 text-[#0A0A0A] dark:text-white" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">{t("work_days") || "Ish kunlari"}</label>
                        <div className="flex items-center justify-between bg-[#F0F0F0] dark:bg-[#404040] p-1 rounded-md w-full">
                          {weekDays.map((day) => {
                            const isWorkDay =
                              selectedSchedule.mandatory_days_info?.some(d => d.day_number === day.day_number) ||
                              selectedSchedule.optional_days_info?.some(d => d.day_number === day.day_number);
                            const isViewing = selectedDay === day.day_number;
                            return (
                              <button
                                key={day.day_number}
                                type="button"
                                onClick={() => setSelectedDay(day.day_number)}
                                className={cn(
                                  "flex-1 py-2.5 text-[13px] font-medium text-center rounded-sm transition-all cursor-pointer",
                                  isWorkDay
                                    ? "bg-white dark:bg-[#171717] text-[#0A0A0A] dark:text-white shadow-sm"
                                    : "text-[#A3A3A3] dark:text-[#5c5c5c] opacity-60 hover:text-[#737373] dark:hover:text-[#A3A3A3]",
                                  isViewing && "ring-2 ring-[#e5e5e5] dark:ring-[#a3a3a3] ring-inset"
                                )}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Footer */}
          {editEmp &&
            <div className="flex items-center justify-end gap-3 sticky bottom-0 z-20">
              <button
                type="button"
                onClick={detailEmployee ? handleUpdateEmployee : handleAddEmployee}
                className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-[#0090FF] text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <HugeIcon icon={CheckmarkSquare01Icon} />
                {detailEmployee ? (t("save") || "Saqlash") : (t("addEmployee") || "Xodim qo'shish")}
              </button>
            </div>
          }
        </div>
      </Modal>

      {/* selected modal */}
      <Modal
        height={600}
        isOpen={!!openModal}
        onClose={() => {
          setOpenModal(null);
          setTimeout(() => setAddEmployeeModal(true), 100);
        }}
        header={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setOpenModal(null);
                setTimeout(() => setAddEmployeeModal(true), 100);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-[16px] font-semibold text-[#0A0A0A] dark:text-white">
              {modalTitles[openModal]}
            </span>
          </div>
        }
      >
        <div className="flex flex-col justify-between h-full gap-3">

          {/* Search */}
          <div className="flex items-center justify-between gap-2">
            <Input
              type="text"
              value={filterSearch}
              onChange={(e) => {
                setFilterSearch(e.target.value)
                setModalPage(1)
                setHasMore(true)
                fetchModalList(openModal, 1, e.target.value)
              }}
              placeholder={t("search") || "Qidirish ..."}
              className="flex-1 rounded-sm! bg-transparent dark:bg-[#0a0a0a] h-8.5 shadow-sm"
            />

            {openModal !== "roles" && (
              <button
                className="flex items-center gap-1 shadow-xs cursor-pointer relative dark:bg-[#0a0a0a] border text-sm border-[#E5E5E5] dark:border-[#404040] rounded-md py-2 px-3"
                onClick={() => openFilterModalWithFilters(openModal)}
              >
                {filters[openModal]?.hasFilter && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0090FF]"></span>
                )}
                <HugeIcon icon={FilterVerticalIcon} size={16} />
                {t("filter")}
              </button>
            )}
          </div>

          {/* List with infinite scroll */}
          <div
            ref={listContainerRef}
            className="flex flex-col gap-1.5 overflow-y-auto flex-1"
          >
            {(openModal === "roles" ? roles : modalOptions[openModal] || []).map((opt) => {
              const isSelected = modalSelected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setModalSelected(isSelected ? null : opt.id)}
                  className={cn(
                    "flex items-start justify-between w-full px-4 py-3 rounded-lg border text-left cursor-pointer",
                    isSelected
                      ? "border-[#171717] dark:border-[#e5e5e5] bg-[#F5F5F5] dark:bg-[#404040]"
                      : "border-[#E5E7EB] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#262626]"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[#0A0A0A] dark:text-white">
                      {opt.name}
                    </span>

                    <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                      {openModal === "branch" ?
                        `${opt.region_info?.name || ""} ${opt.region_info && opt.district_info ? "/" : ""} ${opt.district_info ? opt.district_info?.name : ""}` :
                        openModal === "department" ? (opt.branch_info ? opt.branch_info?.name : "") :
                          openModal === "position" ? (opt.department_info ? opt.department_info?.name : "") :
                            ""}
                    </span>
                  </div>

                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]",
                    isSelected ? "border-[#171717] dark:border-[#737373] dark:bg-transparent!" : "border-[#D4D4D4] dark:border-[#404040]"
                  )}>
                    {isSelected && <span className="w-2/5 h-2/5 rounded-full bg-[#171717] dark:bg-[#e5e5e5]" />}
                  </div>
                </button>
              );
            })}

            {/* Loading indicator */}
            {modalLoading && (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-4 border-[#0090FF] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0] dark:border-[#1F1F1F]">
            <span className="text-[13px] text-[#737373]">
              {modalSelected !== null ? `1 ${t("selected_count_label") || "ta tanlangan"}` : `0 ${t("selected_count_label") || "ta tanlangan"}`}
            </span>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setModalSelected(null)}
                className="flex items-center gap-1.5 cursor-pointer font-medium text-sm"
              >
                <X size={14} /> {t("clear") || "Tozalash"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => {
                    const next = { ...prev, [openModal]: modalSelected };
                    // Cascade resets: branch change clears department + position,
                    // department change clears position
                    if (openModal === "branch" && prev.branch !== modalSelected) {
                      next.department = null;
                      next.position = null;
                    }
                    if (openModal === "department" && prev.department !== modalSelected) {
                      next.position = null;
                    }
                    return next;
                  });
                  setOpenModal(null);
                  setTimeout(() => setAddEmployeeModal(true), 100);
                }}
                className="flex items-center gap-1.5 px-5 py-3 rounded-lg bg-[#0090FF] text-[13px] font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                <HugeIcon icon={CheckmarkCircle04Icon} size={16} />
                {t("select") || "Tanlash"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* filter for selected */}
      <Modal
        isOpen={!!openFilterModal}
        onClose={() => {
          setOpenFilterModal(false)
          setTimeout(() => setOpenModal(currentFilterModal), 100)
        }}
        height={600}
      >
        <div className="flex flex-col justify-between h-full">
          {/* top section */}
          <div className="flex flex-col gap-3">
            {/* nav */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  onClick={() => {
                    setOpenFilterModal(false)
                    setTimeout(() => setOpenModal(currentFilterModal), 100)
                  }}
                >
                  <ArrowLeft size={18} />
                </span>
                <h1 className="text-[16px] font-semibold">{t("filter_title") || "Filter"}</h1>
              </div>
              <span className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                {t("filter_subtitle") || "Ma'lumotlarni filtrlash"}
              </span>
            </div>

            {/* main section */}
            <div className="grid grid-cols-2 gap-3">
              {currentFilterModal !== "branch" && (
                <Select
                  label={t("branch_fallback") || "Filial"}
                  placeholder={t("select_branch") || "Filialni tanlang"}
                  options={branches.map(b => ({ value: b.id, label: b.name }))}
                  value={tempFilterBranch?.value ?? null}
                  onChange={(opt) => setTempFilterBranch(opt)}
                  contanierClassName="col-span-2"
                  searchable={true}
                  loadingMore={filterBranchPag.loading}
                  onScrollEnd={() => {
                    if (!filterBranchPag.hasMore || filterBranchPag.loading) return
                    loadFilterBranches(filterBranchPag.page + 1, "", tempFilterRegion?.value, tempFilterDistrict?.value)
                  }}
                  onSearch={(s) => loadFilterBranches(1, s, tempFilterRegion?.value, tempFilterDistrict?.value)}
                />
              )}

              <Select
                label={t("region_branch_title") || "Viloyat"}
                placeholder={t("region_branch_placeholder") || "Viloyatni tanlang"}
                options={regions.map(r => ({ value: r.id, label: r.name }))}
                value={tempFilterRegion?.value ?? null}
                onChange={handleRegionChange}
              />

              <Select
                label={t("district_branch_title") || "Tuman"}
                placeholder={!tempFilterRegion ? t("select_region_first") || "Avval viloyat tanlang" : t("district_branch_placeholder") || "Tuman tanlang"}
                options={districts}
                value={tempFilterDistrict?.value ?? null}
                onChange={handleFilterDistrictChange}
                disabled={!tempFilterRegion}
                loadingMore={filterDistrictPag.loading}
                onScrollEnd={() => {
                  if (!filterDistrictPag.hasMore || filterDistrictPag.loading || !tempFilterRegion?.value) return
                  loadDistricts(tempFilterRegion.value, filterDistrictPag.page + 1, "")
                }}
                searchable={true}
                onSearch={(s) => { if (tempFilterRegion?.value) loadDistricts(tempFilterRegion.value, 1, s) }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer"
              onClick={clearFilter}
            >
              <X size={14} />
              {t("clear") || "Tozalash"}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg"
              onClick={applyFilter}
            >
              <HugeIcon size={14} icon={Search01Icon} />
              {t("apply") || "Qo'llash"}
            </button>
          </div>
        </div>
      </Modal>

      {/* List filter modal (Reports-style) */}
      <Modal
        isOpen={openListFilter}
        onClose={() => setOpenListFilter(false)}
        height={600}
      >
        <div className="flex flex-col justify-between h-full">
          {/* top section */}
          <div className="flex flex-col gap-3">
            {/* nav */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span
                  className="w-11 h-11 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition dark:hover:bg-[#0a0a0a]"
                  onClick={() => setOpenListFilter(false)}
                >
                  <ArrowLeft size={24} />
                </span>
                <h1 className="text-2xl font-semibold">{t("filter_title")}</h1>
              </div>
              <span className="text-sm text-[#737373] dark:text-[#A3A3A3]">
                {t("filter_subtitle")}
              </span>
            </div>

            {/* main section */}
            <div className="grid grid-cols-2 gap-3">
              {/* Region */}
              <Select
                label={t("region_branch_title") || "Viloyat"}
                placeholder={t("region_branch_placeholder") || "Viloyatni tanlang"}
                options={regions.map((r) => ({ value: r.id, label: r.name }))}
                value={tmpRegion?.value ?? null}
                onChange={handleListRegionChange}
              />

              {/* District — region tanlanmasa disabled */}
              <Select
                label={t("district_branch_title") || "Tuman"}
                placeholder={!tmpRegion ? t("select_region_first") : t("district_branch_placeholder") || "Tumanni tanlang"}
                options={filterDistricts}
                value={tmpDistrict?.value ?? null}
                onChange={handleListDistrictChange}
                disabled={!tmpRegion}
                loadingMore={listDistrictPag.loading}
                onScrollEnd={() => {
                  if (!listDistrictPag.hasMore || listDistrictPag.loading || !tmpRegion?.value) return
                  loadListDistricts(tmpRegion.value, listDistrictPag.page + 1, "")
                }}
                searchable={true}
                onSearch={(s) => { if (tmpRegion?.value) loadListDistricts(tmpRegion.value, 1, s) }}
              />

              <Select
                label={t("col_branch") || "Filial"}
                placeholder={t("select_branch") || "Filialni tanlang"}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                value={tmpBranch?.value ?? null}
                onChange={handleListBranchChange}
                loadingMore={listBranchPag.loading}
                onScrollEnd={() => {
                  if (!listBranchPag.hasMore || listBranchPag.loading) return
                  loadListBranches(listBranchPag.page + 1, "", tmpRegion?.value, tmpDistrict?.value)
                }}
                searchable={true}
                onSearch={(s) => loadListBranches(1, s, tmpRegion?.value, tmpDistrict?.value)}
              />

              <Select
                label={t("department") || "Bo'lim"}
                placeholder={t("select_department") || "Bo'limni tanlang"}
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                value={tmpDepartment?.value ?? null}
                onChange={(opt) => setTmpDepartment(opt)}
                loadingMore={listDepartmentPag.loading}
                onScrollEnd={() => {
                  if (!listDepartmentPag.hasMore || listDepartmentPag.loading) return
                  loadListDepartments(listDepartmentPag.page + 1, "", tmpBranch?.value)
                }}
                searchable={true}
                onSearch={(s) => loadListDepartments(1, s, tmpBranch?.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-5">
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer"
              onClick={clearListFilter}
            >
              <X size={14} />
              {t("clear")}
            </button>
            <button
              className="flex items-center gap-1 text-sm font-medium cursor-pointer bg-[#0090FF] text-white px-3.5 py-2.5 rounded-lg"
              onClick={applyListFilter}
            >
              <HugeIcon size={14} icon={Search01Icon} />
              {t("search")}
            </button>
          </div>
        </div>
      </Modal>

      {/* comfirm modal */}
      <AlertModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={!selectedEmployee?.is_active ? handleUnblockEmployee : handleBlockEmployee}
        title={!selectedEmployee?.is_active
          ? t("unblock_employee_title")
          : t("block_employee_title")
        }
        description={selectedEmployee?.is_active
          ? t("block_employee_description")
          : t("unblock_employee_description")
        }
        confirmText={!selectedEmployee?.is_active ?
          t("unblock_employee") : (
            <span className="flex items-center gap-2">
              <HugeIcon icon={UserLock01Icon} size={16} />
              {t("block")}
            </span>
          )
        }
        cancelText={
          <span className="flex items-center gap-2">
            <HugeIcon icon={CancelCircleHalfDotIcon} size={16} />
            {t("cancel")}
          </span>
        }
        confirmVariant="defauld"
        loading={blockLoading}
      />

      <AlertModal
        isOpen={fireModalOpen}
        onClose={() => setFireModalOpen(false)}
        onConfirm={handleFireEmployee}
        title={t("fire_employee_title")}
        description={t("fire_employee_description")}
        confirmText={
          <span className="flex items-center gap-2">
            <HugeIcon icon={UserRemove02Icon} size={16} />
            {t("fire")}
          </span>
        }
        cancelText={
          <span className="flex items-center gap-2">
            <HugeIcon icon={CancelCircleHalfDotIcon} size={16} />
            {t("cancel")}
          </span>
        }
        confirmVariant="danger"
        loading={fireLoading}
      />

      <Toast
        key={toast.seq}
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

    </>
  );
};

export default EmployeeRegister;