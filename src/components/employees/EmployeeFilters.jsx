import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EmployeeFilters({ onFiltersChange, healthCenters, employees, assignments }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    healthCenters: [],
    positions: [],
    departments: [],
    jobCategories: [],
    jobCategoryTypes: [],
    qualifications: [],
    ranks: [],
    sequences: [],
    contractTypes: [],
    specialRoles: [],
    statuses: [],
    holidays: [],
    nationalities: [],
    holidayWorks: [] // فلتر جديد للعمل في الإجازات
  });
  
  const safeHealthCenters = useMemo(() => Array.isArray(healthCenters) ? healthCenters.filter(Boolean) : [], [healthCenters]);
  const safeEmployees = useMemo(() => Array.isArray(employees) ? employees.filter(Boolean) : [], [employees]);
  const safeAssignments = useMemo(() => Array.isArray(assignments) ? assignments.filter(Boolean) : [], [assignments]);

  const positions = useMemo(() => [...new Set(safeEmployees.map(e => e.position).filter(Boolean))].sort(), [safeEmployees]);
  const departments = useMemo(() => [...new Set(safeEmployees.map(e => e.department).filter(Boolean))].sort(), [safeEmployees]);
  const jobCategories = useMemo(() => [...new Set(safeEmployees.map(e => e.job_category).filter(Boolean))].sort(), [safeEmployees]);
  const jobCategoryTypes = useMemo(() => [...new Set(safeEmployees.map(e => e.job_category_type).filter(Boolean))].sort(), [safeEmployees]);
  const qualifications = useMemo(() => [...new Set(safeEmployees.map(e => e.qualification).filter(Boolean))].sort(), [safeEmployees]);
  const ranks = useMemo(() => [...new Set(safeEmployees.map(e => e.rank).filter(Boolean))].sort(), [safeEmployees]);
  const sequences = useMemo(() => [...new Set(safeEmployees.map(e => e.sequence).filter(Boolean))].sort(), [safeEmployees]);
  const contractTypes = useMemo(() => [...new Set(safeEmployees.map(e => e.contract_type).filter(Boolean))].sort(), [safeEmployees]);
  const specialRoles = useMemo(() => [...new Set(safeEmployees.flatMap(e => e.special_roles || []).filter(Boolean))].sort(), [safeEmployees]);
  const nationalities = useMemo(() => [...new Set((safeEmployees || []).map(e => e.nationality).filter(Boolean))].sort(), [safeEmployees]);

  const holidayNames = useMemo(() => [...new Set(safeAssignments.map(a => a.holiday_name).filter(Boolean))].sort(), [safeAssignments]);

  // فلتر العمل في الإجازات مع الأسماء الكاملة
  const holidayWorkTypes = useMemo(() => {
    const types = new Set();
    safeEmployees.forEach(emp => {
      if (emp.holiday_work_records && Array.isArray(emp.holiday_work_records)) {
        emp.holiday_work_records.forEach(record => {
          if (record.holiday_type === 'أخرى' && record.custom_holiday_name) {
            types.add(record.custom_holiday_name);
          } else if (record.holiday_type) {
            const displayName = {
              'عيد_الفطر': 'إجازة عيد الفطر (رمضان)',
              'عيد_الأضحى': 'إجازة عيد الأضحى (الحج)',
              'اليوم_الوطني': 'إجازة اليوم الوطني',
              'يوم_التأسيس': 'إجازة يوم التأسيس'
            }[record.holiday_type];
            
            if (displayName) types.add(displayName);
          }
        });
      }
    });
    return [...types].sort();
  }, [safeEmployees]);

  const roleLabels = {
    "مدير مركز": "مدير مركز",
    "نائب مدير": "نائب مدير",
    "مشرف فني": "مشرف فني",
    "مشرف تمريض": "مشرف تمريض",
    "مشرف الجودة": "مشرف الجودة",
    "مشرف الأمن والسلامة": "مشرف الأمن والسلامة",
    "مشرف مكافحة العدوى": "مشرف مكافحة العدوى",
    "منسق مكافحة العدوى": "منسق مكافحة العدوى",
    "منسق الصحة المدرسية": "منسق الصحة المدرسية",
    "مشرف الصحة المدرسية": "مشرف الصحة المدرسية",
    "منسق الجودة": "منسق الجودة",
    "مراقب صحي": "مراقب صحي",
    "مدرب صحي": "مدرب صحي",
    manager: "مدير مركز",
    deputy: "نائب مدير",
    technical_supervisor: "مشرف فني",
    nursing_supervisor: "مشرف تمريض",
    quality_supervisor: "مشرف الجودة",
    safety_supervisor: "مشرف الأمن والسلامة",
    infection_control_supervisor: "مشرف مكافحة العدوى",
    infection_control_coordinator: "منسق مكافحة العدوى",
    school_health_coordinator: "منسق الصحة المدرسية",
    school_health_supervisor: "مشرف الصحة المدرسية"
  };

  const statusOptions = [
    { value: 'active', label: 'نشط' },
    { value: 'externally_assigned', label: 'مكلف خارجياً' }
  ];

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(activeFilters);
    }
  }, [activeFilters, onFiltersChange]);

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValues };
    });
  };

  const clearCategory = (category) => {
    setActiveFilters(prev => ({ ...prev, [category]: [] }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      healthCenters: [],
      positions: [],
      departments: [],
      jobCategories: [],
      jobCategoryTypes: [],
      qualifications: [],
      ranks: [],
      sequences: [],
      contractTypes: [],
      specialRoles: [],
      statuses: [],
      holidays: [],
      nationalities: [],
      holidayWorks: []
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
  const totalActiveFilters = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  const FilterPopover = ({ title, items, category, labelMap = null }) => {
    const activeCount = (activeFilters[category] || []).length;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            {title}
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-600 text-white">
                {activeCount}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{title}</h4>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearCategory(category)}
                  className="h-6 text-xs"
                >
                  مسح ({activeCount})
                </Button>
              )}
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {items.map(item => {
                  const value = typeof item === 'object' ? item.value : item;
                  const label = typeof item === 'object' ? item.label : (labelMap ? labelMap[item] || item : item);
                  const isChecked = (activeFilters[category] || []).includes(value);
                  
                  return (
                    <div key={value} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`${category}-${value}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleFilter(category, value)}
                      />
                      <Label
                        htmlFor={`${category}-${value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const getFilterLabel = (category, value) => {
    if (category === 'healthCenters') {
      const center = safeHealthCenters.find(c => c.اسم_المركز === value);
      return center?.اسم_المركز || value;
    }
    if (category === 'specialRoles') return roleLabels[value] || value;
    if (category === 'statuses') {
      const status = statusOptions.find(s => s.value === value);
      return status?.label || value;
    }
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => setShowMobileFilters(!showMobileFilters)}>
          <SlidersHorizontal className="w-4 h-4" />
          الفلاتر
          {totalActiveFilters > 0 && <Badge className="bg-blue-600 text-white">{totalActiveFilters}</Badge>}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-300 hover:text-red-200 hover:bg-red-500/10">
            مسح الكل
          </Button>
        )}
      </div>

      <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-wrap gap-2 md:gap-3 bg-white/5 md:bg-transparent border border-white/10 md:border-0 rounded-2xl p-3 md:p-0`}>
        <FilterPopover
          title="حالة الموظف"
          items={statusOptions}
          category="statuses"
        />

        <FilterPopover
          title="المركز الصحي"
          items={safeHealthCenters.map(c => c.اسم_المركز)}
          category="healthCenters"
        />

        <FilterPopover
          title="التخصص"
          items={positions}
          category="positions"
        />

        <FilterPopover
          title="القسم"
          items={departments}
          category="departments"
        />

        <FilterPopover
          title="ملاك الوظيفة"
          items={jobCategories}
          category="jobCategories"
        />

        <FilterPopover
          title="فئة الوظيفة"
          items={jobCategoryTypes}
          category="jobCategoryTypes"
        />

        <FilterPopover
          title="المؤهل"
          items={qualifications}
          category="qualifications"
        />

        <FilterPopover
          title="المرتبة"
          items={ranks}
          category="ranks"
        />

        <FilterPopover
          title="التسلسل"
          items={sequences}
          category="sequences"
        />

        <FilterPopover
          title="نوع العقد"
          items={contractTypes}
          category="contractTypes"
        />

        <FilterPopover
          title="الأدوار الإشرافية"
          items={specialRoles}
          category="specialRoles"
          labelMap={roleLabels}
        />

        <FilterPopover
          title="تكليف إجازة"
          items={holidayNames}
          category="holidays"
        />

        <FilterPopover
          title="الجنسية"
          items={nationalities}
          category="nationalities"
        />

        {/* فلتر جديد: العمل في الإجازات الرسمية */}
        {holidayWorkTypes.length > 0 && (
          <FilterPopover
            title="عمل خلال إجازة"
            items={holidayWorkTypes}
            category="holidayWorks"
          />
        )}

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-red-600 hover:bg-red-50 gap-2">
            <X className="w-4 h-4" />
            مسح الكل ({totalActiveFilters})
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 px-1 md:px-0">
          {Object.entries(activeFilters).map(([category, values]) =>
            values.map(value => (
              <Badge key={`${category}-${value}`} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[11px] md:text-xs max-w-full break-all">
                {getFilterLabel(category, value)}
                <button
                  onClick={() => toggleFilter(category, value)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  );
}