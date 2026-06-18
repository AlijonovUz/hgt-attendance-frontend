import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { ArrowDown01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/HugeIcon";
import { cn } from "@/lib/utils";
import { axiosAPI } from "@/services/axiosAPI";
import { useLanguage } from "@/Context/LanguageContext";

const CompactSelect = ({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  dropdownWidth = "240px",
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange?.(opt);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(null);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      {/* ── Trigger — kichik ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg border text-[12px] font-medium px-2.5 py-1.5 cursor-pointer! select-none truncate",
          "bg-white dark:bg-[#0a0a0a]",
          "border-[#E5E7EB] dark:border-[#2E2E2E]",
          "text-[#0A0A0A] dark:text-white",
          open && "border-gray-300 dark:border-[#555]",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none"
        )}
      >
        <span className={`truncate max-w-[100px]! ${value ? "text-[#0A0A0A] dark:text-[#f5f5f5]" : ""}`}>
          {value ? value.label : label}
        </span>

        {value ? (
          <span
            onClick={handleClear}
            className="flex items-center justify-center w-3.5 h-3.5 cursor-pointer text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
          >
            <HugeIcon icon={Cancel01Icon} size={11} />
          </span>
        ) : (
          <HugeIcon
            icon={ArrowDown01Icon}
            size={13}
            className={cn(
              "text-[#737373] dark:text-[#A3A3A3] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      {/* ── Dropdown — keng ── */}
      {open && (
        <div
          className="absolute top-[calc(100%+5px)] right-0 z-50 bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2E2E2E] rounded-xl p-1 shadow-xl overflow-y-auto max-h-[260px]"
          style={{
            minWidth: dropdownWidth,
            animation: "fadeSlideDown 0.12s ease",
          }}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-5px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-[#737373]">
              {t("no_data_found") || "Ma'lumot yo'q"}
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = value?.value === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors",
                    isSelected
                      ? "bg-[#F5F5F5] dark:bg-[#262626] text-[#0A0A0A] dark:text-white font-medium"
                      : "text-[#3a3a3a] dark:text-[#D4D4D4] hover:bg-[#F9F9F9] dark:hover:bg-[#222]"
                  )}
                >
                  {opt.label}
                  {isSelected && (
                    <Check size={14} className="text-[#0A0A0A] dark:text-white flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const RegionDistrictFilter = ({
  onRegionChange,
  onDistrictChange,
  regions = [],
}) => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));

  const fetchDistricts = async (regionId) => {
    setDistrictsLoading(true);
    try {
      const res = await axiosAPI.get("users/districts/", {
        params: { region: regionId },
      });
      if (res.status === 200) {
        setDistricts(
          (res.data?.results || res.data?.data?.results || []).map((d) => ({
            value: d.id,
            label: d.name,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDistrictsLoading(false);
    }
  };

  const handleRegionChange = (opt) => {
    setSelectedRegion(opt);
    setSelectedDistrict(null);
    setDistricts([]);
    onRegionChange?.(opt?.value ?? null);
    onDistrictChange?.(null);
    if (opt?.value) fetchDistricts(opt.value);
  };

  const handleDistrictChange = (opt) => {
    setSelectedDistrict(opt);
    onDistrictChange?.(opt?.value ?? null);
  };

  return (
    <div className="flex items-center gap-2">
      <CompactSelect
        label={t("region") || "Viloyat"}
        options={regionOptions}
        value={selectedRegion}
        onChange={handleRegionChange}
        dropdownWidth="220px"
      />
      <CompactSelect
        label={t("district")}
        options={districts}
        value={selectedDistrict}
        onChange={handleDistrictChange}
        disabled={!selectedRegion}
        dropdownWidth="220px"
      />
    </div>
  );
};