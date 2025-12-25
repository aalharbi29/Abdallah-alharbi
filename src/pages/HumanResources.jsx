import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Printer, AlertTriangle, RefreshCw, Loader2, Users, UserPlus, Calendar, FileText, Filter, Award, CheckSquare, Square, Pin, X, WifiOff, MessageCircle, User, Sparkles, Building2, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import EmployeeList from "../components/employees/EmployeeList";
import EmployeeForm from "../components/employees/EmployeeForm";
import EmployeeFilters from "../components/employees/EmployeeFilters";
import ExportManager from "../components/export/ExportManager";
import CustomExportManager from "../components/export/CustomExportManager";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuickLeaveForm from "../components/leaves/QuickLeaveForm";
import QuickAssignmentForm from "../components/assignments/QuickAssignmentForm";
import HolidayAssignmentForm from "../components/assignments/HolidayAssignmentForm";
import BulkHolidayAssignmentDialog from "../components/assignments/BulkHolidayAssignmentDialog";
import BulkWhatsAppDialog from "../components/employees/BulkWhatsAppDialog";



export default function HumanResources() {
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
    holidayWorks: [] // فلتر جديد
  }); 

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [showBulkAssignmentDialog, setShowBulkAssignmentDialog] = useState(false);
  const [showBulkWhatsAppDialog, setShowBulkWhatsAppDialog] = useState(false); // جديد

  const [pinnedEmployees, setPinnedEmployees] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // تحميل البيانات بالتوازي
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

  const handleCreateEmployee = async (employeeData) => {
    createEmployeeMutation.mutate(employeeData);
  };

  const handleUpdateEmployee = async (employeeData) => {
    updateEmployeeMutation.mutate({ id: editingEmployee.id, employeeData });
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (employee) => {
    deleteEmployeeMutation.mutate(employee.id);
  };

  const handleAddLeave = (employee) => {
    setSelectedEmployee(employee);
    setShowLeaveForm(true);
  };

  const handleAddAssignment = (employee) => {
    setSelectedEmployee(employee);
    setShowAssignmentForm(true);
  };

  const handleAddHolidayAssignment = (employee) => {
    setSelectedEmployee(employee);
    setShowHolidayForm(true);
  };

  const handleToggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handlePinEmployee = (employeeId) => {
    setPinnedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const filteredEmployees = useMemo(() => {
    let result = employees;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp =>
        emp.full_name_arabic?.toLowerCase().includes(query) ||
        emp.رقم_الموظف?.includes(query) ||
        emp.رقم_الهوية?.includes(query) ||
        emp.phone?.includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.position?.toLowerCase().includes(query) ||
        emp.المركز_الصحي?.toLowerCase().includes(query)
      );
    }

    if (filters.healthCenters?.length > 0) {
      result = result.filter(emp => filters.healthCenters.includes(emp.المركز_الصحي));
    }

    if (filters.positions?.length > 0) {
      result = result.filter(emp => filters.positions.includes(emp.position));
    }

    if (filters.departments?.length > 0) {
      result = result.filter(emp => filters.departments.includes(emp.department));
    }

    if (filters.jobCategories?.length > 0) {
      result = result.filter(emp => filters.jobCategories.includes(emp.job_category));
    }

    if (filters.jobCategoryTypes?.length > 0) {
      result = result.filter(emp => filters.jobCategoryTypes.includes(emp.job_category_type));
    }

    if (filters.qualifications?.length > 0) {
      result = result.filter(emp => filters.qualifications.includes(emp.qualification));
    }

    if (filters.ranks?.length > 0) {
      result = result.filter(emp => filters.ranks.includes(emp.rank));
    }

    if (filters.sequences?.length > 0) {
      result = result.filter(emp => filters.sequences.includes(emp.sequence));
    }

    if (filters.contractTypes?.length > 0) {
      result = result.filter(emp => filters.contractTypes.includes(emp.contract_type));
    }

    if (filters.specialRoles?.length > 0) {
      result = result.filter(emp => {
        if (!emp.special_roles) return false;
        return emp.special_roles.some(role => filters.specialRoles.includes(role));
      });
    }

    if (filters.statuses?.length > 0) {
      if (filters.statuses.includes('externally_assigned')) {
        result = result.filter(emp => emp.is_externally_assigned === true);
      }
    }

    if (filters.holidays?.length > 0) {
      const employeeIdsWithHolidays = new Set();
      assignments.forEach(a => {
        if (a.holiday_name && filters.holidays.includes(a.holiday_name)) {
          employeeIdsWithHolidays.add(a.employee_record_id);
        }
      });
      result = result.filter(emp => employeeIdsWithHolidays.has(emp.id));
    }

    if (filters.nationalities?.length > 0) {
      result = result.filter(emp => filters.nationalities.includes(emp.nationality));
    }

    // فلتر العمل في الإجازات الرسمية - محسّن
    if (filters.holidayWorks?.length > 0) {
      result = result.filter(emp => {
        if (!emp.holiday_work_records || !Array.isArray(emp.holiday_work_records)) return false;
        
        return emp.holiday_work_records.some(record => {
          // تحويل القيمة المخزنة إلى الاسم المعروض
          let displayName;
          
          if (record.holiday_type === 'أخرى') {
            displayName = record.custom_holiday_name;
          } else {
            displayName = {
              'عيد_الفطر': 'إجازة عيد الفطر (رمضان)',
              'عيد_الأضحى': 'إجازة عيد الأضحى (الحج)',
              'اليوم_الوطني': 'إجازة اليوم الوطني',
              'يوم_التأسيس': 'إجازة يوم التأسيس'
            }[record.holiday_type];
          }
          
          return displayName && filters.holidayWorks.includes(displayName);
        });
      });
    }

    // ترتيب: المثبتون أولاً
    result.sort((a, b) => {
      const aPinned = pinnedEmployees.has(a.id);
      const bPinned = pinnedEmployees.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

    return result;
  }, [employees, searchQuery, filters, assignments, pinnedEmployees]);

  // تحميل أولي مع Skeleton
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

  // خطأ في التحميل
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
                <Button variant="outline" onClick={() => window.location.reload()}>
                  تحديث الصفحة
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* نصائح */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">نصائح لحل المشكلة</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• تأكد من اتصالك بالإنترنت</li>
                <li>• انتظر دقيقة ثم حاول مرة أخرى</li>
                <li>• جرب تحديث الصفحة (F5)</li>
                <li>• امسح cache المتصفح</li>
                <li>• تواصل مع الدعم الفني إذا استمرت المشكلة</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // العرض الرئيسي
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header احترافي */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-blue-200 tracking-tight">
                  الموارد البشرية
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-white/80 text-sm font-medium">{employees.length} موظف</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/30">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">{filteredEmployees.length} معروض</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 no-print">
              <Button 
                onClick={loadData} 
                variant="outline" 
                size="sm" 
                disabled={isLoading}
                className="border-white/20 text-white hover:bg-white/10 rounded-xl backdrop-blur-md"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button 
                onClick={() => {
                  setEditingEmployee(null);
                  setShowEmployeeForm(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg rounded-xl"
              >
                <UserPlus className="w-4 h-4 ml-2" />
                إضافة موظف
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Actions - محسّن */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 md:p-6 mb-6 no-print shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <Input
                  placeholder="ابحث بالاسم، رقم الهوية، رقم الموظف، الجوال..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {selectedEmployees.size > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkWhatsAppDialog(true)}
                      className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب ({selectedEmployees.size})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkAssignmentDialog(true)}
                      className="gap-2"
                    >
                      <Award className="w-4 h-4" />
                      تكليف مجموعة ({selectedEmployees.size})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedEmployees(new Set())}
                      size="icon"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                <ExportManager employees={filteredEmployees} />
                <CustomExportManager employees={filteredEmployees} />
                
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <EmployeeFilters
          employees={employees}
          filters={filters}
          onFiltersChange={setFilters}
          healthCenters={healthCenters}
          departments={departments}
          assignments={assignments}
        />

        {/* Employee List */}
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
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد نتائج</p>
              <p className="text-gray-400 text-sm mt-2">جرب تعديل معايير البحث أو الفلترة</p>
              {(searchQuery || Object.values(filters).some(f => f.length > 0)) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
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
                  }}
                >
                  مسح جميع الفلاتر
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}
            healthCenters={healthCenters}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة إجازة</DialogTitle>
          </DialogHeader>
          <QuickLeaveForm
            employee={selectedEmployee}
            onClose={() => {
              setShowLeaveForm(false);
              setSelectedEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignmentForm} onOpenChange={setShowAssignmentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة تكليف</DialogTitle>
          </DialogHeader>
          <QuickAssignmentForm
            employee={selectedEmployee}
            healthCenters={healthCenters}
            onClose={() => {
              setShowAssignmentForm(false);
              setSelectedEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showHolidayForm} onOpenChange={setShowHolidayForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تكليف العمل خلال إجازة</DialogTitle>
          </DialogHeader>
          <HolidayAssignmentForm
            employee={selectedEmployee}
            healthCenters={healthCenters}
            onClose={() => {
              setShowHolidayForm(false);
              setSelectedEmployee(null);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>

      <BulkHolidayAssignmentDialog
        open={showBulkAssignmentDialog}
        onOpenChange={setShowBulkAssignmentDialog}
        selectedEmployeeIds={Array.from(selectedEmployees)}
        employees={employees}
        healthCenters={healthCenters}
        onComplete={() => {
          setShowBulkAssignmentDialog(false);
          setSelectedEmployees(new Set());
          loadData();
        }}
      />

      {/* حوار واتساب الجماعي - جديد */}
      <BulkWhatsAppDialog
        open={showBulkWhatsAppDialog}
        onOpenChange={setShowBulkWhatsAppDialog}
        selectedEmployees={Array.from(selectedEmployees)}
        employees={employees}
      />
    </div>
  );
}