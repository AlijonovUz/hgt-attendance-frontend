import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/Context/LanguageContext";
import { axiosAPI } from "@/services/axiosAPI";
import { cn } from "@/lib/utils";
import { Check, ChevronDownIcon, Plus, X } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { HugeIcon } from "@/components/ui/HugeIcon";
import { CheckmarkSquare01Icon, Download01Icon, Settings05Icon, SquareArrowDown01Icon, UserAccountIcon } from "@hugeicons/core-free-icons";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";

const PAGE_SIZE = 20;

const ROLES = [
  { value: "employee", label: "Xodim" },
  { value: "manager", label: "Menejer" },
  { value: "admin", label: "Admin" },
];

const SCOPE_OPTIONS = [
  { value: "self", label: "O'zi" },
  { value: "all", label: "Barchasi" },
];



const ScopeSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const current = SCOPE_OPTIONS.find((o) => o.value === value) || SCOPE_OPTIONS[0];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#171717] text-[12px] font-medium text-[#0A0A0A] dark:text-white cursor-pointer"
      >
        {current.label}
        <ChevronDownIcon size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2E2E2E] rounded-lg shadow-lg overflow-hidden min-w-[100px]">
          {SCOPE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "px-3 py-2 text-[13px] cursor-pointer transition-colors",
                opt.value === value
                  ? "bg-[#F5F5F5] dark:bg-[#262626] font-medium text-[#0A0A0A] dark:text-white"
                  : "text-[#737373] hover:bg-[#F9F9F9] dark:hover:bg-[#222]"
              )}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmployeeRegister = () => {
  const { t } = useLanguage();

  const [employees, setEmployees] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef(null);

  const [branchFilter, setBranchFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([])
  const [roles, setRoles] = useState([])

  const [form, setForm] = useState({
    full_name: "",
    password: "",
    tabel: "",
    phone: "",
    branch: null,
    department: null,
    position: null,
    perm_attendance_mark: false,
    perm_attendance_view: "self",
    perm_kpi_view: "self",
    perm_employee_manage: false,
    perm_reports_export: false,
    perm_geozone_create: false,
    perm_roles_manage: false,
  });

  const [permOpen, setPermOpen] = useState(true);

  const [addEmployeeModal, setAddEmployeeModal] = useState(false)

  const fetchEmployees = async (params = {}) => {
    setLoading(true);
    try {
      const res = await axiosAPI.get("users/employees/", {
        params: {
          page,
          search: search || undefined,
          branch: branchFilter || undefined,
          department: departmentFilter || undefined,
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

  const fetchBranches = async () => {
    try {
      const res = await axiosAPI.get("users/branches/");
      if (res.status === 200) {
        setBranches(
          (res.data?.data?.results || res.data?.results || []).map((b) => ({
            value: b.id,
            label: b.name,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await axiosAPI.get("users/positions/");
      if (res.status === 200) {
        setPositions(
          (res.data?.data?.results || res.data?.results || []).map((b) => ({
            value: b.id,
            label: b.name,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axiosAPI.get("users/roles/");
      if (res.status === 200) {
        setRoles(
          (res.data?.data?.results || res.data?.results || []).map((b) => ({
            value: b.id,
            label: b.name,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosAPI.get("users/departments/");
      if (res.status === 200) {
        setDepartments(
          (res.data?.data?.results || res.data?.results || []).map((d) => ({
            value: d.id,
            label: d.name,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchBranches();
    fetchPositions();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, branchFilter, departmentFilter]);

  const handleAddEmployee = async () => {
    try {
      const res = await axiosAPI.post("users/employees/", {
        full_name: form.full_name,
        password: form.password,
        tabel_number: form.tabel,
        phone: form.phone,
        branch: form.branch,
        department: form.department,
        position: form.position,
      });
      if (res.status === 201 || res.status === 200) {
        setAddEmployeeModal(false);
        setForm({ full_name: "", tabel: "", phone: "", branch: null, department: null, position: null });
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  const exportExcel = () => {
    if (!employees.length) return;
    const headers = [
      "#",
      t("full_name") || "Ism familya",
      t("col_branch") || "Filial",
      t("department") || "Bo'lim",
      t("position") || "Lavozim",
      t("work_start") || "Kelgan vaqti",
      "KPI",
    ];
    const rows = employees.map((e, i) => [
      i + 1,
      e.full_name || "",
      e.branch_info?.name || "",
      e.department_info?.name || "",
      e.position_info?.name || "",
      e.schedule_info?.work_start_time.slice(0, 5) || "",
      "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Ustun kengliklarini sozlash
    ws["!cols"] = [
      { wch: 5 },   // #
      { wch: 30 },  // Ism familya
      { wch: 22 },  // Filial
      { wch: 20 },  // Bo'lim
      { wch: 20 },  // Lavozim
      { wch: 16 },  // Kelgan vaqti
      { wch: 10 },  // KPI
    ];

    // Thead balandligi
    ws["!rows"] = [{ hpt: 28 }];

    // Thead stillari — har bir ustun uchun
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!ws[cellRef]) return;
      ws[cellRef].s = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: "FAFAFA" }, // ko'k rang
        },
        font: {
          bold: true,
          sz: 12,
          color: { rgb: "000000" },
        },
        alignment: {
          vertical: "center",
          horizontal: colIdx === 0 ? "center" : "left",
          wrapText: false,
        },
        border: {
          top: { style: "thin", color: { rgb: "E5E5E5" } },
          bottom: { style: "thin", color: { rgb: "E5E5E5" } },
          right: { style: "thin", color: { rgb: "E5E5E5" } },
          left: { style: "thin", color: { rgb: "E5E5E5" } },
        },
      };
    });

    // Data qatorlari stillari
    rows.forEach((_, rowIdx) => {
      headers.forEach((__, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (!ws[cellRef]) return;
        ws[cellRef].s = {
          fill: {
            patternType: "solid",
            fgColor: { rgb: "FFFFFF" },
          },
          font: {
            sz: 11,
            color: { rgb: "1A1A1A" },
          },
          alignment: {
            vertical: "center",
            horizontal: colIdx === 0 ? "center" : "left",
          },
          border: {
            top: { style: "thin", color: { rgb: "E5E5E5" } },
            bottom: { style: "thin", color: { rgb: "E5E5E5" } },
            right: { style: "thin", color: { rgb: "E5E5E5" } },
            left: { style: "thin", color: { rgb: "E5E5E5" } },
          },
        };
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Xodimlar");
    XLSX.writeFile(wb, "Xodimlar-royxati.xlsx");
  };

  const COLS = 7;

  return (
    <>
      <div className="p-4 flex flex-col gap-4 w-full bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white">

        {/* ── Header ── */}
        <div className="flex items-start justify-between w-full gap-4 flex-wrap">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-white">
              {t("employees_title") || "Xodimlar ro'yxati"}
            </h1>
            <span className="text-[#737373] text-sm">
              {employees.length} {t("employees_count_label") || "ta xodim ko'rsatilmoqda"}
            </span>
          </div>

          <div className="flex items-center" onClick={() => setAddEmployeeModal(true)}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#404040] px-4 py-2 text-sm font-medium text-[#0A0A0A] dark:text-white shadow-xs cursor-pointer"
            >
              {t("new_employee") || "Yangi xodim"}
            </button>
            <span className="p-[10px] shadow-xs rounded-lg border-2 border-[#E5E5E5] dark:border-[#404040] bg-[#F5F5F5] dark:bg-[#404040] flex items-center justify-center">
              <Plus size={16} className="dark:text-[#f5f5f5] text-[#0A0A0A]" />
            </span>
          </div>
        </div>

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

            {/* Branch filter */}
            <div className="w-[200px]">
              <Select
                placeholder={t("all_branches") || "Barcha fililar"}
                options={branches}
                value={branchFilter}
                onChange={(opt) => {
                  setBranchFilter(opt?.value ?? null);
                  setPage(1);
                }}
                className="py-[6.5px]! rounded-md! border! dark:border-[#404040]! shadow-sm border-[#e5e5e5] dark:bg-[#0a0a0a]!"

              />
            </div>

            {/* Department filter */}
            <div className="w-[200px]">
              <Select
                placeholder={t("all_departments") || "Barcha bo'limlar"}
                options={departments}
                value={departmentFilter}
                onChange={(opt) => {
                  setDepartmentFilter(opt?.value ?? null);
                  setPage(1);
                }}
                className="py-[6.5px]! rounded-md! border! dark:border-[#404040]! shadow-sm border-[#e5e5e5] dark:bg-[#0a0a0a]!"
              />
            </div>
          </div>

          {/* Excel export */}
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#0a0a0a] px-3 py-1.5 text-sm font-semibold text-[#0A0A0A] dark:text-white shadow-sm hover:bg-[#F5F5F5] dark:hover:bg-[#262626] cursor-pointer"
          >
            <PiMicrosoftExcelLogo size={16} className="text-[#22A565]" />
            Excel
            <HugeIcon icon={Download01Icon} size={15} />
          </button>
        </div>

        {/* ── Table ── */}
        <div className="w-full overflow-hidden">
          <div className="h-[calc(100vh-215px)] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#FAFAFA] dark:bg-[#262626] border-b border-[#E5E7EB] dark:border-[#2E2E2E]">
                  {[
                    { label: "#", cls: "w-12" },
                    { label: t("full_name") || "Ism familya" },
                    { label: t("department") || "Bo'lim" },
                    { label: t("col_branch") || "Kelgan" },
                    { label: t("position") || "Lavozim" },
                    { label: t("work_start") || "Kelgan vaqti" },
                    { label: "KPI" },
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
                      className="border-b border-[#F0F0F0] dark:border-[#1A1A1A] hover:bg-[#FAFAFA] dark:hover:bg-[#111] cursor-pointer"
                    >
                      {/* # */}
                      <td className="px-4 py-3.5 text-sm font-medium dark:text-[#f5f5f5]">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>

                      {/* Ism familya + avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* {emp.face_image ? (
                          <img
                            src={emp.face_image}
                            alt={emp.full_name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB] dark:border-[#2E2E2E]"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#F0F0F0] dark:bg-[#262626] flex items-center justify-center flex-shrink-0 text-[13px] font-semibold text-[#737373]">
                            {emp.full_name?.charAt(0) || "?"}
                          </div>
                        )} */}
                          <span className="text-sm font-medium text-[#0A0A0A] dark:text-white truncate max-w-[180px]">
                            {emp.full_name || ""}
                          </span>
                        </div>
                      </td>

                      {/* Bo'lim */}
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.department_info?.name || ""}
                      </td>

                      {/* Filial */}
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.branch_info?.name || ""}
                      </td>

                      {/* Lavozim */}
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.position_info?.name || ""}
                      </td>

                      {/* Kelgan vaqti */}
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5] tabular-nums">
                        {emp.schedule_info?.work_start_time
                          ? emp.schedule_info.work_start_time.slice(0, 5)
                          : ""}
                      </td>

                      {/* KPI */}
                      <td className="px-4 py-3.5 text-sm font-medium text-[#0A0A0A] dark:text-[#f5f5f5]">
                        {emp.discipline_kpi ?? ""}
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

      <Modal
        height={680}
        isOpen={addEmployeeModal}
        onClose={() => setAddEmployeeModal(false)}
        header={
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
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer text-[#0a0a0a]"
            >
              <X size={20} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 h-full">

          {/* ── Form ── */}
          <div className="grid grid-cols-2 gap-3 flex-1">

            {/* Ism familyasi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("full_name") || "Ism familyasi"}
              </label>
              <Input
                type="text"
                placeholder={t("full_name") || "Ism familyasi"}
                value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full h-11 rounded-lg dark:bg-[#171717]"
              />
            </div>

            {/* Parol */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("password_label") || "Tabel raqami"}
              </label>
              <Input
                type="text"
                placeholder={t("create_password_placeholder") || "Parol yarating"}
                value={form.tabel}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full h-11 rounded-lg dark:bg-[#171717]"
              />
            </div>

            {/* Tabel */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("tabel_number") || "Tabel raqami"}
              </label>
              <Input
                type="text"
                placeholder={t("tabel_number") || "Tabel raqami"}
                value={form.tabel}
                onChange={(e) => setForm((p) => ({ ...p, tabel: e.target.value }))}
                className="w-full h-11 rounded-lg dark:bg-[#171717]"
              />
            </div>

            {/* Telefon */}
            <div className="flex flex-col gap-1.5">
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
                    const d = local.slice(0, 9); // max 9 ta raqam
                    if (d.length <= 2) {
                      formatted = `+998 ${d}`;
                    } else if (d.length <= 5) {
                      formatted = `+998 ${d.slice(0, 2)}-${d.slice(2)}`;
                    } else if (d.length <= 7) {
                      formatted = `+998 ${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
                    } else {
                      formatted = `+998 ${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7, 9)}`;
                    }
                  }
                  setForm((p) => ({ ...p, phone: formatted }));
                }}
                className="w-full h-11 rounded-lg dark:bg-[#171717]"
              />
            </div>

            {/* Filial */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("col_branch") || "Filial"}
              </label>
              <Select
                placeholder={t("select_branch") || "Filialni tanlang"}
                options={branches}
                value={form.branch}
                onChange={(opt) => setForm((p) => ({ ...p, branch: opt?.value ?? null }))}
                className="bg-transparent! border! border-[#e5e5e5] dark:border-[#404040]"
              />
            </div>

            {/* Bo'lim */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("department") || "Bo'lim"}
              </label>
              <Select
                placeholder={t("select_department") || "Bo'limni tanlang"}
                options={departments}
                value={form.department}
                onChange={(opt) => setForm((p) => ({ ...p, department: opt?.value ?? null }))}
                className="bg-transparent! border! border-[#e5e5e5] dark:border-[#404040]"
              />
            </div>

            {/* Role */}
            <Select
              placeholder={t("select_role") || "Rolni tanlang"}
              options={roles}
              value={form.role}
              onChange={(opt) => setForm((p) => ({ ...p, role: opt?.value ?? null }))}
              className="bg-transparent! border! border-[#e5e5e5] dark:border-[#404040]"
              label={t("role")}
            />

            {/* Lavozim */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#737373] dark:text-[#A3A3A3]">
                {t("position") || "Lavozim"}
              </label>
              <Select
                placeholder={t("select_position") || "Lavozimni tanlang"}
                options={positions}
                value={form.position}
                onChange={(opt) => setForm((p) => ({ ...p, position: opt?.value ?? null }))}
                className="bg-transparent! border! border-[#e5e5e5] dark:border-[#404040]"
              />
            </div>

            {/* Rol va Ruhsatlar */}
            <div className="flex flex-col gap-3 col-span-2">

              {/* Section header */}
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

                {/* ── Toggle tugmasi ── */}
                <button
                  type="button"
                  onClick={() => setPermOpen((p) => !p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  <HugeIcon
                    icon={SquareArrowDown01Icon}
                    size={18}
                    className="text-[#0A0A0A] dark:text-[#f5f5f5] transition-transform duration-300"
                  />
                </button>
              </div>

              {/* ── Collapsible qism ── */}
              <div
                className={cn(
                  "flex flex-col gap-3 overflow-hidden transition-all duration-500 ease-in-out",
                  permOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                )}
              >

                {/* Ruxsatlar ro'yxati */}
                <div className="flex flex-col divide-y divide-[#F0F0F0] dark:divide-[#1F1F1F]">

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      {form.perm_attendance_mark
                        ? <Check size={20} className="text-[#0090FF]" />
                        : <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      }
                      <span className={cn("text-[13px]", form.perm_attendance_mark ? "font-semibold text-[#0A0A0A] dark:text-white" : "text-[#737373]")}>
                        {t("perm_attendance_mark") || "Davomatni belgilash"}
                      </span>
                    </div>
                    <Switch checked={form.perm_attendance_mark} onChange={(v) => setForm((p) => ({ ...p, perm_attendance_mark: v }))} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      <span className="text-[13px] text-[#737373]">{t("perm_attendance_view") || "Davomatni ko'rish"}</span>
                    </div>
                    <ScopeSelect value={form.perm_attendance_view} onChange={(v) => setForm((p) => ({ ...p, perm_attendance_view: v }))} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      <span className="text-[13px] text-[#737373]">{t("perm_kpi_view") || "KPI ko'rish"}</span>
                    </div>
                    <ScopeSelect value={form.perm_kpi_view} onChange={(v) => setForm((p) => ({ ...p, perm_kpi_view: v }))} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      <span className="text-[13px] text-[#737373]">{t("perm_employee_manage") || "Xodim qo'shish / tahrirlash"}</span>
                    </div>
                    <Switch checked={form.perm_employee_manage} onChange={(v) => setForm((p) => ({ ...p, perm_employee_manage: v }))} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      <span className="text-[13px] text-[#737373]">{t("perm_reports_export") || "Hisobotlarni eksport qilish"}</span>
                    </div>
                    <Switch checked={form.perm_reports_export} onChange={(v) => setForm((p) => ({ ...p, perm_reports_export: v }))} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      <span className="text-[13px] text-[#737373]">{t("perm_geozone_create") || "Geozona yaratish"}</span>
                    </div>
                    <Switch checked={form.perm_geozone_create} onChange={(v) => setForm((p) => ({ ...p, perm_geozone_create: v }))} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-0.5 bg-[#A3A3A3] rounded-full inline-block" />
                      <span className="text-[13px] text-[#737373]">{t("perm_roles_manage") || "Rollarni boshqarish"}</span>
                    </div>
                    <Switch checked={form.perm_roles_manage} onChange={(v) => setForm((p) => ({ ...p, perm_roles_manage: v }))} />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 pb-5">
            <button
              type="button"
              onClick={handleAddEmployee}
              className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-[#0090FF] text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <HugeIcon icon={CheckmarkSquare01Icon} />
              {t("addEmployee") || "Saqlash"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployeeRegister;