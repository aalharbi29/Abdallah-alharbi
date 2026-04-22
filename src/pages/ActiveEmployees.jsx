import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeList from "../components/employees/EmployeeList";
import EmployeeFilters from "../components/employees/EmployeeFilters";
import HumanResourcesHeader from "../components/hr/HumanResourcesHeader";
import HumanResourcesStats from "../components/hr/HumanResourcesStats";
import HumanResourcesToolbar from "../components/hr/HumanResourcesToolbar";
import HumanResourcesEmptyState from "../components/hr/HumanResourcesEmptyState";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import HumanResourcesDialogs from "@/components/hr/HumanResourcesDialogs";
import { matchScore } from "@/components/utils/arabicSearch";

/**
 * صفحة استعراض جميع الموظفين النشطين مع الفلاتر والإجراءات الكاملة.
 * (هذه هي الصفحة القديمة HumanResources نُقلت هنا).
 */
export default function ActiveEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
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

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [showBulkAssignmentDialog, setShowBulkAssignmentDialog] = useState(false);
  const [showBulkWhatsAppDialog, setShowBulkWhatsAppDialog] = useState(false);

  const [pinnedEmployees, setPinnedEmployees] = useState(new Set());

  useEffect(() => {
    // قراءة q من URL لاستخدامه كبحث مسبق
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) setSearchQuery(q);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [employeesData, centersData, assignmentsData] = await Promise.all([
        base44.entities.Employee.list("-updated_date", 500),
        base44.entities.HealthCenter.list().catch(() => []),
        base44.entities.Assignment.list("-created_date", 200).catch(() => [])
      ]);

      const safeEmployees = Array.isArray(employeesData) ? employeesData : [];
      setEmployees(safeEmployees);

      if (Array.isArray(centersData) && centersData.length > 0) {
        setHealthCenters(centersData);
      } else {
        const centersFromEmployees = [...new Set(safeEmployees.map(e => e.المركز_الصحي).filter(Boolean))];
        setHealthCenters(centersFromEmployees.map(name => ({ اسم_المركز: name })));
      }

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

      const uniqueDepartments = [...new Set(safeEmployees.map(e => e.المركز_الصحي).filter(Boolean))];
      setDepartments(uniqueDepartments);

    } catch (err) {
      console.error('خطأ في تحميل البيانات:', err);
      setError(err.message || 'فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: (employeeData) => base44.entities.Employee.create(employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      loadData();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, employeeData }) => base44.entities.Employee.update(id, employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      loadData();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      loadData();
    },
  });

  const handleCreateEmployee = async (employeeData) => createEmployeeMutation.mutate(employeeData);
  const handleUpdateEmployee = async (employeeData) => updateEmployeeMutation.mutate({ id: editingEmployee.id, employeeData });
  const handleEditEmployee = (employee) => { setEditingEmployee(employee); setShowEmployeeForm(true); };
  const handleDeleteEmployee = async (employee) => deleteEmployeeMutation.mutate(employee.id);
  const handleAddLeave = (employee) => { setSelectedEmployee(employee); setShowLeaveForm(true); };
  const handleAddAssignment = (employee) => { setSelectedEmployee(employee); setShowAssignmentForm(true); };
  const handleAddHolidayAssignment = (employee) => { setSelectedEmployee(employee); setShowHolidayForm(true); };

  const handleToggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) newSet.delete(employeeId); else newSet.add(employeeId);
      return newSet;
    });
  };

  const handlePinEmployee = (employeeId) => {
    setPinnedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) newSet.delete(employeeId); else newSet.add(employeeId);
      return newSet;
    });
  };

  const filteredEmployees = useMemo(() => {
    let result = employees;
    let scored = null;

    if (searchQuery && searchQuery.trim()) {
      scored = result
        .map(emp => ({ emp, score: matchScore(emp, searchQuery) }))
        .filter(x => x.score > 0);
      result = scored.map(x => x.emp);
    }

    if (filters.healthCenters?.length > 0) result = result.filter(emp => filters.healthCenters.includes(emp.المركز_الصحي));
    if (filters.positions?.length > 0) result = result.filter(emp => filters.positions.includes(emp.position));
    if (filters.departments?.length > 0) result = result.filter(emp => filters.departments.includes(emp.department));
    if (filters.jobCategories?.length > 0) result = result.filter(emp => filters.jobCategories.includes(emp.job_category));
    if (filters.jobCategoryTypes?.length > 0) result = result.filter(emp => filters.jobCategoryTypes.includes(emp.job_category_type));
    if (filters.qualifications?.length > 0) result = result.filter(emp => filters.qualifications.includes(emp.qualification));
    if (filters.ranks?.length > 0) result = result.filter(emp => filters.ranks.includes(emp.rank));
    if (filters.sequences?.length > 0) result = result.filter(emp => filters.sequences.includes(emp.sequence));
    if (filters.contractTypes?.length > 0) result = result.filter(emp => filters.contractTypes.includes(emp.contract_type));
    if (filters.specialRoles?.length > 0) {
      result = result.filter(emp => emp.special_roles?.some(role => filters.specialRoles.includes(role)));
    }
    if (filters.statuses?.length > 0 && filters.statuses.includes('externally_assigned')) {
      result = result.filter(emp => emp.is_externally_assigned === true);
    }
    if (filters.holidays?.length > 0) {
      const ids = new Set();
      assignments.forEach(a => {
        if (a.holiday_name && filters.holidays.includes(a.holiday_name)) ids.add(a.employee_record_id);
      });
      result = result.filter(emp => ids.has(emp.id));
    }
    if (filters.nationalities?.length > 0) result = result.filter(emp => filters.nationalities.includes(emp.nationality));
    if (filters.holidayWorks?.length > 0) {
      result = result.filter(emp => {
        if (!Array.isArray(emp.holiday_work_records)) return false;
        return emp.holiday_work_records.some(record => {
          let displayName;
          if (record.holiday_type === 'أخرى') displayName = record.custom_holiday_name;
          else displayName = {
            'عيد_الفطر': 'إجازة عيد الفطر (رمضان)',
            'عيد_الأضحى': 'إجازة عيد الأضحى (الحج)',
            'اليوم_الوطني': 'إجازة اليوم الوطني',
            'يوم_التأسيس': 'إجازة يوم التأسيس'
          }[record.holiday_type];
          return displayName && filters.holidayWorks.includes(displayName);
        });
      });
    }

    // خريطة رتبة المطابقة للفرز حسب أولوية الاسم الأول ثم الثاني...
    const scoreMap = new Map();
    if (scored) scored.forEach(x => scoreMap.set(x.emp.id, x.score));

    result = [...result].sort((a, b) => {
      const aP = pinnedEmployees.has(a.id), bP = pinnedEmployees.has(b.id);
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      if (scoreMap.size > 0) {
        const sa = scoreMap.get(a.id) ?? 99;
        const sb = scoreMap.get(b.id) ?? 99;
        if (sa !== sb) return sa - sb;
      }
      return 0;
    });

    return result;
  }, [employees, searchQuery, filters, assignments, pinnedEmployees]);

  const orderEmployeesByCenterRoles = (list) => {
    if (!Array.isArray(list) || list.length === 0) return list;
    const centersByName = new Map();
    (healthCenters || []).forEach(c => { if (c?.اسم_المركز) centersByName.set(c.اسم_المركز, c); });
    const grouped = list.reduce((acc, emp) => {
      const name = emp?.["المركز_الصحي"] || "__NO_CENTER__";
      (acc[name] ||= []).push(emp);
      return acc;
    }, {});
    const ordered = [];
    Object.entries(grouped).forEach(([centerName, emps]) => {
      const center = centersByName.get(centerName);
      const used = new Set();
      const pushById = (id) => {
        if (!id) return;
        const emp = emps.find(e => e.id === id);
        if (emp && !used.has(emp.id)) { ordered.push(emp); used.add(emp.id); }
      };
      if (center) { pushById(center.المدير); pushById(center.نائب_المدير); pushById(center.المشرف_الفني); }
      emps.filter(e => !used.has(e.id) && String(e.position || '').includes('تمريض')).forEach(e => { ordered.push(e); used.add(e.id); });
      emps.filter(e => !used.has(e.id)).forEach(e => ordered.push(e));
    });
    return ordered;
  };

  const exportEmployees = useMemo(() => {
    const base = selectedEmployees.size > 0
      ? filteredEmployees.filter(e => selectedEmployees.has(e.id))
      : filteredEmployees;
    return orderEmployeesByCenterRoles(base);
  }, [filteredEmployees, selectedEmployees, healthCenters]);

  if (isLoading && employees.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <WifiOff className="h-5 w-5" />
            <AlertDescription className="flex flex-col gap-4">
              <div>
                <p className="font-bold text-lg mb-2">فشل تحميل البيانات</p>
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadData} className="gap-2">
                  <RefreshCw className="w-4 h-4 ml-2" />
                  إعادة المحاولة
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6 mobile-page-shell">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 gap-2"
            onClick={() => navigate(createPageUrl('HumanResources'))}
          >
            <ArrowRight className="w-4 h-4" /> العودة إلى الموارد البشرية
          </Button>
        </div>

        <HumanResourcesHeader
          employeesCount={employees.length}
          filteredCount={filteredEmployees.length}
          isLoading={isLoading}
          onRefresh={loadData}
          onAddEmployee={() => { setEditingEmployee(null); setShowEmployeeForm(true); }}
        />

        <HumanResourcesStats
          employeesCount={employees.length}
          centersCount={healthCenters.length}
          pinnedCount={pinnedEmployees.size}
          selectedCount={selectedEmployees.size}
        />

        <HumanResourcesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedEmployees.size}
          exportEmployees={exportEmployees}
          onOpenWhatsApp={() => setShowBulkWhatsAppDialog(true)}
          onOpenBulkAssignment={() => setShowBulkAssignmentDialog(true)}
          onClearSelection={() => setSelectedEmployees(new Set())}
          onPrint={() => window.print()}
        />

        <EmployeeFilters
          employees={employees}
          filters={filters}
          onFiltersChange={setFilters}
          healthCenters={healthCenters}
          departments={departments}
          assignments={assignments}
        />

        <EmployeeList
          employees={filteredEmployees}
          assignments={assignments}
          healthCenters={healthCenters}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          onAddLeave={handleAddLeave}
          onAddAssignment={handleAddAssignment}
          onAddHolidayAssignment={handleAddHolidayAssignment}
          pinnedEmployees={pinnedEmployees}
          onPinEmployee={handlePinEmployee}
          selectedEmployees={selectedEmployees}
          onToggleSelection={handleToggleEmployeeSelection}
        />

        {filteredEmployees.length === 0 && !isLoading && (
          <HumanResourcesEmptyState
            hasFilters={!!searchQuery || Object.values(filters).some(f => f.length > 0)}
            onClear={(emptyFilters) => { setSearchQuery(''); setFilters(emptyFilters); }}
          />
        )}
      </div>

      <HumanResourcesDialogs
        showEmployeeForm={showEmployeeForm}
        setShowEmployeeForm={setShowEmployeeForm}
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
        handleUpdateEmployee={handleUpdateEmployee}
        handleCreateEmployee={handleCreateEmployee}
        healthCenters={healthCenters}
        showLeaveForm={showLeaveForm}
        setShowLeaveForm={setShowLeaveForm}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        loadData={loadData}
        showAssignmentForm={showAssignmentForm}
        setShowAssignmentForm={setShowAssignmentForm}
        showHolidayForm={showHolidayForm}
        setShowHolidayForm={setShowHolidayForm}
        showBulkAssignmentDialog={showBulkAssignmentDialog}
        setShowBulkAssignmentDialog={setShowBulkAssignmentDialog}
        selectedEmployees={selectedEmployees}
        employees={employees}
        showBulkWhatsAppDialog={showBulkWhatsAppDialog}
        setShowBulkWhatsAppDialog={setShowBulkWhatsAppDialog}
      />
    </div>
  );
}