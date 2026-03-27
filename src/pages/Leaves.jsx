import React, { useState, useEffect } from "react";
import { Leave } from "@/entities/Leave";
import { Employee } from "@/entities/Employee";
import { Button } from "@/components/ui/button";
import { Plus, Printer, PlayCircle, Trash2, Filter, AlertTriangle, RefreshCw, Archive, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LeaveList from "../components/leaves/LeaveList";
import LeaveForm from "../components/leaves/LeaveForm";
import ExportManager from "../components/export/ExportManager";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import QuickLeaveForm from "../components/leaves/QuickLeaveForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ searchQuery: "", center: "all", type: "all", status: "all" });
  const [activeTab, setActiveTab] = useState("active"); // Added tab state

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leavesData, employeesData] = await Promise.allSettled([
        Leave.list("-created_date", 1000), // Increased limit for archive
        Employee.list()
      ]);
      
      setLeaves(leavesData.status === 'fulfilled' && Array.isArray(leavesData.value) ? leavesData.value : []);
      setEmployees(employeesData.status === 'fulfilled' && Array.isArray(employeesData.value) ? employeesData.value : []);
      
    } catch (error) {
      console.error("Failed to load leaves data:", error);
      setError("فشل في تحميل بيانات الإجازات. تأكد من اتصالك بالإنترنت.");
      setLeaves([]);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (leaveData) => {
    try {
      if (editingLeave) {
        await Leave.update(editingLeave.id, leaveData);
      } else {
        await Leave.create({...leaveData, status: 'active'}); // Set default status
      }
      setShowForm(false);
      setEditingLeave(null);
      loadData();
    } catch (error) {
      console.error("Failed to save leave:", error);
      alert("فشل في حفظ الإجازة. تأكد من أن الموظف موجود.");
    }
  };

  const handleMubashara = async (leaveId) => {
    try {
      await Leave.update(leaveId, { 
        mubashara_date: new Date().toISOString().split('T')[0],
        status: 'completed' // Mark as completed when mubashara is done
      });
      loadData();
      alert("تم تسجيل المباشرة ونقل الإجازة للأرشيف.");
    } catch (error) {
      console.error("Failed to update leave:", error);
      alert("فشل في تحديث حالة المباشرة.");
    }
  };

  const handleStatusUpdate = async (leaveId, newStatus) => {
    try {
      await Leave.update(leaveId, { status: newStatus });
      loadData();
      const statusMessages = {
        completed: "تم إنهاء الإجازة ونقلها للأرشيف.",
        cancelled: "تم إلغاء الإجازة ونقلها للأرشيف.",
      };
      alert(statusMessages[newStatus] || "تم تحديث حالة الإجازة.");
    } catch (error) {
      console.error("Failed to update leave status:", error);
      alert("فشل في تحديث حالة الإجازة.");
    }
  };

  const handleDelete = async (leaveId) => {
    try {
      await Leave.delete(leaveId);
      loadData();
    } catch (error) {
      console.error("Failed to delete leave:", error);
      alert("فشل في حذف الإجازة.");
    }
  };

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeLeaves = Array.isArray(leaves) ? leaves : [];

  const healthCenters = [...new Set(safeEmployees.map(e => e.المركز_الصحي).filter(Boolean))];
  const leaveTypes = [...new Set(safeLeaves.map(l => l.leave_type).filter(Boolean))];
  
  const getLeaveStatus = (leave) => {
      if (!leave) return null;
      if (leave.mubashara_date) return "completed";
      try {
        const today = new Date();
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        if (today >= startDate && today <= endDate) return "active";
        if (today > endDate) return "ended";
        if (today < startDate) return "upcoming";
      } catch (e) {
        return null;
      }
      return null;
  };

  // Separate active and archived leaves
  // Updated leave filtering logic
  const activeLeaves = safeLeaves.filter(leave => {
    if (!leave) return false;
    return leave.status === 'active' || !leave.status; // Include leaves without status for backward compatibility
  });

  const archivedLeaves = safeLeaves.filter(leave => {
    if (!leave) return false;
    return leave.status === 'completed' || leave.status === 'cancelled' || leave.mubashara_date;
  });

  const currentLeaves = activeTab === "active" ? activeLeaves : archivedLeaves;

  const filteredLeaves = currentLeaves.filter(leave => {
    if (!leave) return false;
    const employee = safeEmployees.find(e => e.رقم_الموظف === leave.employee_id);
    const searchMatch = !filters.searchQuery || 
        (leave.employee_name && leave.employee_name.toLowerCase().includes(filters.searchQuery.toLowerCase())) || 
        (leave.employee_id && leave.employee_id.includes(filters.searchQuery));
    const centerMatch = filters.center === "all" || (employee && employee.المركز_الصحي === filters.center);
    const typeMatch = filters.type === "all" || leave.leave_type === filters.type;
    const statusMatch = filters.status === "all" || getLeaveStatus(leave) === filters.status;
    return searchMatch && centerMatch && typeMatch && statusMatch;
  });

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (showForm) return <LeaveForm leave={editingLeave} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditingLeave(null); }} employees={employees} />;

  return (
    <div className="p-3 md:p-6 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 min-h-screen mobile-page-shell">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 md:mb-8 gap-3 md:gap-4 print-hide animate-fade-in mobile-stack-section">
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-gray-900 mb-2">سجل الإجازات</h1>
            <p className="text-gray-600 text-base md:text-lg font-medium">إدارة وتتبع جميع إجازات الموظفين والأرشيف</p>
          </div>
          <div className="flex gap-2">
            <ExportManager data={filteredLeaves} filename="تقرير_الإجازات" />
            <Button onClick={() => window.print()} variant="outline"><Printer className="w-4 h-4 ml-2"/>طباعة</Button>
            <Button
              onClick={() => {
                setEditingLeave(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة إجازة
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Badge variant="secondary">{activeLeaves.length}</Badge>
                الإجازات النشطة
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <Badge variant="secondary">{archivedLeaves.length}</Badge>
                الأرشيف
              </TabsTrigger>
            </TabsList>
          </div>

          <Card className="p-5 md:p-6 mb-6 bg-white no-print print-hide shadow-medium border-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-xl flex items-center gap-3 font-bold text-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <Filter className="w-5 h-5 text-gray-600"/>
                </div>
                خيارات الفلترة والبحث
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-4">
                  <Input placeholder="بحث بالاسم أو الرقم..." value={filters.searchQuery} onChange={e => setFilters({...filters, searchQuery: e.target.value})} className="flex-1 min-w-[200px] max-w-md h-11 text-base border-gray-200 focus:border-orange-500 focus:ring-orange-500"/>
                  <Select value={filters.center} onValueChange={val => setFilters({...filters, center: val})}><SelectTrigger className="flex-1 min-w-[150px]"><SelectValue placeholder="المركز الصحي"/></SelectTrigger><SelectContent><SelectItem value="all">كل المراكز</SelectItem>{healthCenters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  <Select value={filters.type} onValueChange={val => setFilters({...filters, type: val})}><SelectTrigger className="flex-1 min-w-[150px]"><SelectValue placeholder="نوع الإجازة"/></SelectTrigger><SelectContent><SelectItem value="all">كل الأنواع</SelectItem>{leaveTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                  {activeTab === "active" && (
                    <Select value={filters.status} onValueChange={val => setFilters({...filters, status: val})}><SelectTrigger className="flex-1 min-w-[150px]"><SelectValue placeholder="الحالة"/></SelectTrigger><SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="active">جارية</SelectItem>
                        <SelectItem value="upcoming">قادمة</SelectItem>
                        <SelectItem value="ended">منتهية (بدون مباشرة)</SelectItem>
                    </SelectContent></Select>
                  )}
              </div>
            </CardContent>
          </Card>

          <TabsContent value="active">
            <Card className="shadow-medium border-0">
              <CardHeader className="border-b border-blue-200/50 p-5 md:p-7 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-lg md:text-xl flex items-center gap-3 font-bold text-gray-800">
                  <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                    <PlayCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  الإجازات النشطة
                </CardTitle>
                <p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">عرض جميع الإجازات الجارية والقادمة</p>
              </CardHeader>
              <CardContent className="p-0">
                <LeaveList 
                  leaves={filteredLeaves} 
                  onMubashara={handleMubashara} 
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete} 
                  isLoading={isLoading} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive">
            <Card className="shadow-medium border-0">
              <CardHeader className="border-b border-gray-200/50 p-5 md:p-7 bg-gradient-to-r from-gray-50 to-slate-50">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl font-bold text-gray-800">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shadow-md">
                    <Archive className="w-6 h-6 text-gray-600" />
                  </div>
                  أرشيف الإجازات
                </CardTitle>
                <p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed">عرض جميع الإجازات المكتملة والمُلغاة</p>
              </CardHeader>
              <CardContent className="p-0">
                <LeaveList 
                  leaves={filteredLeaves} 
                  onMubashara={handleMubashara} 
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete} 
                  isLoading={isLoading} 
                  isArchive={true} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}