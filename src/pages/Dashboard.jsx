
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Employee } from "@/entities/Employee";
import { HealthCenter } from "@/entities/HealthCenter";
import { Leave } from "@/entities/Leave";
import { Assignment } from "@/entities/Assignment";
// Added import
import { Users, Building2, UserX, Briefcase, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StatsCard from "../components/dashboard/StatsCard";
import CurrentLeaves from "../components/dashboard/CurrentLeaves";
import CurrentAssignments from "../components/dashboard/CurrentAssignments";
import GoalsWidget from "../components/dashboard/GoalsWidget";
// REMOVED: import NotesWidget from "../components/dashboard/NotesWidget";
import MonthlyStatistics from "../components/dashboard/MonthlyStatistics";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endedAssignmentsAlert, setEndedAssignmentsAlert] = useState([]); // Added state

  // Added function and memoized it with useCallback as it's called by loadDashboardData
  const checkForEndedExternalAssignments = useCallback((allEmployees) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const alerts = (Array.isArray(allEmployees) ? allEmployees : [])
      .filter(emp => 
        emp.is_externally_assigned && 
        emp.external_assignment_end_date && 
        new Date(emp.external_assignment_end_date) < today
      )
      .map(emp => `انتهى التكليف الخارجي للموظف ${emp.full_name_arabic}. يرجى تحديث حالته.`);
    setEndedAssignmentsAlert(alerts);
  }, [setEndedAssignmentsAlert]); // setEndedAssignmentsAlert is a stable state setter, but including for completeness/linting

  // Memoize loadDashboardData to prevent unnecessary re-renders and enable it as a useEffect dependency
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // تحميل البيانات مع معالجة أفضل للأخطاء
      const results = await Promise.allSettled([
        Employee.list("-created_date", 500),
        HealthCenter.list("-created_date", 100),
        Leave.list("-created_date", 500),
        Assignment.list("-created_date", 500)
      ]);
      
      // استخراج البيانات من النتائج مع حماية ضد الأخطاء
      const [empResult, centerResult, leaveResult, assignmentResult] = results;
      
      const fetchedEmployees = empResult.status === 'fulfilled' && Array.isArray(empResult.value) ? empResult.value : [];
      setEmployees(fetchedEmployees); // Updated here
      setHealthCenters(centerResult.status === 'fulfilled' && Array.isArray(centerResult.value) ? centerResult.value : []);
      setLeaves(leaveResult.status === 'fulfilled' && Array.isArray(leaveResult.value) ? leaveResult.value : []);
      setAssignments(assignmentResult.status === 'fulfilled' && Array.isArray(assignmentResult.value) ? assignmentResult.value : []);
      
      // Check for ended external assignments
      checkForEndedExternalAssignments(fetchedEmployees); // Added call

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("فشل في تحميل بيانات لوحة التحكم. تأكد من اتصالك بالإنترنت.");
      // تعيين بيانات فارغة في حالة الخطأ
      setEmployees([]);
      setHealthCenters([]);
      setLeaves([]);
      setAssignments([]);
      setEndedAssignmentsAlert([]); // Clear alerts on error
    } finally {
      setIsLoading(false);
    }
  }, [setEmployees, setHealthCenters, setLeaves, setAssignments, setIsLoading, setError, setEndedAssignmentsAlert, checkForEndedExternalAssignments]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const { employeesOnLeave, currentAssignments } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const safeLeaves = Array.isArray(leaves) ? leaves : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];

    const onLeave = safeLeaves.filter(leave => {
        if (!leave || leave.mubashara_date) return false;
        try {
          const startDate = new Date(leave.start_date);
          const endDate = new Date(leave.end_date);
          return startDate <= today && endDate >= today;
        } catch (e) {
          return false;
        }
    });

    const onAssignment = safeAssignments.filter(assignment => {
        if (!assignment) return false;
        try {
          const startDate = new Date(assignment.start_date);
          const endDate = new Date(assignment.end_date);
          return startDate <= today && endDate >= today;
        } catch (e) {
          return false;
        }
    });

    return { employeesOnLeave: onLeave, currentAssignments: onAssignment };
  }, [leaves, assignments]);

  const stats = useMemo(() => {
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const safeHealthCenters = Array.isArray(healthCenters) ? healthCenters : [];
    const safeEmployeesOnLeave = Array.isArray(employeesOnLeave) ? employeesOnLeave : [];
    const safeCurrentAssignments = Array.isArray(currentAssignments) ? currentAssignments : [];
    
    return {
      totalEmployees: safeEmployees.length || 0,
      totalDepartments: safeHealthCenters.length || 0,
      onLeaveEmployees: safeEmployeesOnLeave.length || 0,
      onAssignmentEmployees: safeCurrentAssignments.length || 0,
    };
  }, [employees, healthCenters, employeesOnLeave, currentAssignments]);

  if (error) {
    return (
      <div className="p-2 md:p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <Button onClick={loadDashboardData} variant="outline" size="sm" className="mobile-button">
                <RefreshCw className="w-3 h-3 ml-1" />
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 mobile-card">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 mobile-title">لوحة التحكم</h1>
          <p className="text-gray-600 text-sm mobile-text">نظرة عامة على أداء النظام والمهام الشخصية</p>
        </div>

        {endedAssignmentsAlert.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-bold mb-2">تنبيهات هامة:</p>
              <ul className="list-disc pr-4 space-y-1">
                {endedAssignmentsAlert.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
          <StatsCard title="الموظفين" value={stats.totalEmployees} icon={Users} color="blue" isMobile={true} />
          <StatsCard title="المراكز" value={stats.totalDepartments} icon={Building2} color="green" isMobile={true} />
          <StatsCard title="مجازون" value={stats.onLeaveEmployees} icon={UserX} color="orange" isMobile={true} />
          <StatsCard title="مكلفون" value={stats.onAssignmentEmployees} icon={Briefcase} color="purple" isMobile={true} />
        </div>

        <div className="grid lg:grid-cols-5 gap-3 md:gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 gap-3 md:gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    <CurrentLeaves leaves={employeesOnLeave || []} />
                    <CurrentAssignments assignments={currentAssignments || []} />
                </div>
                <GoalsWidget />
                {/* REMOVED: <NotesWidget /> */}
            </div>
            <div className="lg:col-span-2">
                 <MonthlyStatistics />
            </div>
        </div>
      </div>
    </div>
  );
}
