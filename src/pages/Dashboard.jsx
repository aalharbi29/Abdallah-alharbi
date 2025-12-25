import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Employee } from "@/entities/Employee";
import { HealthCenter } from "@/entities/HealthCenter";
import { Leave } from "@/entities/Leave";
import { Assignment } from "@/entities/Assignment";
import { Notification } from "@/entities/Notification";
import { Users, Building2, UserX, Briefcase, AlertTriangle, RefreshCw, TrendingUp, Calendar, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import StatsCard from "../components/dashboard/StatsCard";
import CurrentLeaves from "../components/dashboard/CurrentLeaves";
import CurrentAssignments from "../components/dashboard/CurrentAssignments";
import GoalsWidget from "../components/dashboard/GoalsWidget";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* خلفية متحركة احترافية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        {/* Header احترافي */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Activity className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-200 tracking-tight">
                لوحة التحكم
              </h1>
              <p className="text-blue-200/70 text-sm md:text-lg font-medium mt-1">
                نظرة شاملة على النظام والمهام اليومية
              </p>
            </div>
          </div>
          
          {/* شريط معلومات سريع */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: Calendar, label: new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), color: 'from-blue-500 to-cyan-500' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/80 text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {endedAssignmentsAlert.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/50 backdrop-blur-md">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-200">
                <p className="font-bold mb-2 text-red-100">تنبيهات هامة:</p>
                <ul className="list-disc pr-4 space-y-1">
                  {endedAssignmentsAlert.map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* بطاقات الإحصائيات المحسّنة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { title: "إجمالي الموظفين", value: stats.totalEmployees, icon: Users, gradient: "from-blue-500 to-blue-600", bgGlow: "blue" },
            { title: "المراكز الصحية", value: stats.totalDepartments, icon: Building2, gradient: "from-emerald-500 to-green-600", bgGlow: "green" },
            { title: "في إجازة", value: stats.onLeaveEmployees, icon: UserX, gradient: "from-amber-500 to-orange-600", bgGlow: "orange" },
            { title: "مكلفون حالياً", value: stats.onAssignmentEmployees, icon: Briefcase, gradient: "from-purple-500 to-violet-600", bgGlow: "purple" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-${stat.bgGlow}-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 md:p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-xs md:text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-2xl md:text-4xl font-black text-white">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString('ar-SA') : stat.value || 0}
                    </p>
                  </div>
                  <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br ${stat.gradient} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">نشط</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* المحتوى الرئيسي */}
        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                <CurrentLeaves leaves={employeesOnLeave || []} />
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                <CurrentAssignments assignments={currentAssignments || []} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
              <GoalsWidget />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden h-full">
              <MonthlyStatistics />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}