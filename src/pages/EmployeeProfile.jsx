import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, FileText, Calendar, Briefcase, Plus, AlertCircle, RefreshCw, FileClock, Save, MessageCircle, Printer, Edit, Shield, CreditCard } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import SmartDateInput from "../components/ui/smart-date-input";
import EmployeeFullDetails from "@/components/employee_profile/EmployeeFullDetails";
import EmployeeProfileExporter from "@/components/export/EmployeeProfileExporter";
import EmployeeProfileCustomExport from "@/components/export/EmployeeProfileCustomExport";
import HolidayWorkManager from "@/components/employee_profile/HolidayWorkManager";
import EmployeeIDCard from "@/components/employees/EmployeeIDCard";

// Lazy load components for better performance
const EmployeeDocumentUpload = React.lazy(() => import('../components/employee_profile/EmployeeDocumentUpload'));
const EmployeeDocumentList = React.lazy(() => import('../components/employee_profile/EmployeeDocumentList'));
const EmployeeLeaveHistory = React.lazy(() => import('../components/employee_profile/EmployeeLeaveHistory'));
const EmployeeAssignmentHistory = React.lazy(() => import('../components/employee_profile/EmployeeAssignmentHistory'));

import { getAllEmployeeRoles } from '@/components/utils/employeeRoles';

export default function EmployeeProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  const [externalAssignment, setExternalAssignment] = useState({
      is_externally_assigned: false,
      external_assignment_center: '',
      external_assignment_end_date: null,
      external_assignment_indefinite: false,
      external_assignment_reason: '',
      external_assignment_reason_other: ''
  });

  const [healthCenters, setHealthCenters] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [showIDCard, setShowIDCard] = useState(false);

  // دالة مساعدة للإعادة مع تأخير متزايد
  const retryWithDelay = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.error(`محاولة ${attempt} فشلت:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // تأخير متزايد: 1 ثانية، ثم 2 ثانية، ثم 4 ثواني
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // دالة لتطبيع رقم الجوال إلى صيغة دولية مناسبة لواتساب
  const normalizePhoneForWhatsApp = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    
    // If it already starts with 966, assume it's correct
    if (digits.startsWith('966')) return digits;
    
    // If it starts with 00, remove 00
    if (digits.startsWith('00')) return digits.slice(2);
    
    // If it starts with 0, replace with 966 (Saudi local format)
    if (digits.startsWith('0') && digits.length >= 9) return '966' + digits.slice(1);
    
    // If it's 9 digits, assume it's a local Saudi number without 0 prefix, add 966
    if (digits.length === 9) return '966' + digits; // e.g., 5XXXXXXXX

    // For any other case, return as is (might be international number or incorrect format)
    return digits;
  };

  const loadEmployeeData = useCallback(async (employeeId) => {
    setIsLoading(true);
    setError(null);
    setLoadingStatus('جاري تحميل بيانات الموظف...');
    
    try {
      // تحميل بيانات الموظف مع إعادة المحاولة
      setLoadingStatus('جاري تحميل بيانات الموظف الأساسية...');
      const employeeData = await retryWithDelay(async () => {
        return await base44.entities.Employee.get(employeeId);
      }, 3, 1500);
      
      if (!employeeData) {
        setError('لم يتم العثور على الموظف بالمعرف المحدد. يرجى التأكد من صحة الرابط.');
        setIsLoading(false);
        return;
      }
      
      setEmployee(employeeData);

      // تحميل بيانات المراكز الصحية (list بدلاً من get)
      setLoadingStatus('جاري تحميل بيانات المراكز الصحية...');
      try {
        const centers = await retryWithDelay(async () => {
          return await base44.entities.HealthCenter.list(); // استخدام list للحصول على جميع المراكز
        }, 2, 1000);
        setHealthCenters(Array.isArray(centers) ? centers : []);
      } catch (centersError) {
        console.warn('تحذير: فشل تحميل المراكز الصحية:', centersError);
        // لا نوقف التحميل إذا فشل تحميل المراكز
        setHealthCenters([]);
      }
      
      setLoadingStatus('تم تحميل بيانات الموظف والمراكز. جاري تحميل البيانات الإضافية...');

      // تحميل البيانات المرتبطة مع معالجة أفضل للأخطاء
      const loadRelatedData = async () => {
        const results = await Promise.allSettled([
          retryWithDelay(async () => {
            setLoadingStatus('جاري تحميل المستندات...');
            return await base44.entities.EmployeeDocument.filter({ employee_id: employeeId });
          }, 2, 1000),
          retryWithDelay(async () => {
            setLoadingStatus('جاري تحميل الإجازات...');
            return await base44.entities.Leave.filter({ employee_id: employeeData.رقم_الموظف });
          }, 2, 1000),
          retryWithDelay(async () => {
            setLoadingStatus('جاري تحميل التكاليف...');
            return await base44.entities.Assignment.filter({ employee_record_id: employeeId });
          }, 2, 1000)
        ]);

        // معالجة النتائج
        const [documentsResult, leavesResult, assignmentsResult] = results;
        
        setDocuments(
          documentsResult.status === 'fulfilled' && Array.isArray(documentsResult.value) 
            ? documentsResult.value 
            : []
        );
        setLeaves(
          leavesResult.status === 'fulfilled' && Array.isArray(leavesResult.value) 
            ? leavesResult.value 
            : []
        );
        setAssignments(
          assignmentsResult.status === 'fulfilled' && Array.isArray(assignmentsResult.value) 
            ? assignmentsResult.value 
            : []
        );

        // تسجيل الأخطاء الجزئية
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const entityNames = ['المستندات', 'الإجازات', 'التكاليف'];
            console.warn(`فشل تحميل ${entityNames[index]}:`, result.reason);
          }
        });
      };

      await loadRelatedData();
      setLoadingStatus('تم تحميل جميع البيانات بنجاح');
      
    } catch (err) {
      console.error('Error loading employee data:', err);
      setRetryCount(prev => prev + 1);
      
      // رسائل خطأ محددة حسب نوع الخطأ
      if (err.message?.includes('Network Error') || err.message?.includes('timeout')) {
        setError(`فشل الاتصال بالخادم (محاولة ${retryCount + 1}). يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.`);
      } else if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('الموظف غير موجود في النظام. يرجى التأكد من صحة المعرف.');
      } else if (err.message?.includes('500')) {
        setError('خطأ في السيرفر. يرجى المحاولة مرة أخرى بعد قليل أو الاتصال بالدعم الفني.');
      } else {
        setError(`حدث خطأ في تحميل بيانات الموظف: ${err.message || 'خطأ غير معروف'}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  }, [retryCount]);

  // Effect to load initial employee data on URL change
  useEffect(() => {
    const getEmployeeId = () => {
      const params = new URLSearchParams(location.search);
      return params.get('id');
    };

    const employeeId = getEmployeeId();
    if (!employeeId) {
      setError('معرف الموظف غير موجود في الرابط');
      setIsLoading(false);
      return;
    }
    loadEmployeeData(employeeId);
  }, [location.search, loadEmployeeData]);

  // Effect to update external assignment state when employee data changes
  useEffect(() => {
    if (employee) {
        setExternalAssignment({
            is_externally_assigned: employee.is_externally_assigned || false,
            external_assignment_center: employee.external_assignment_center || '',
            external_assignment_end_date: employee.external_assignment_end_date ? new Date(employee.external_assignment_end_date) : null,
            external_assignment_indefinite: employee.external_assignment_indefinite || false,
            external_assignment_reason: employee.external_assignment_reason || '',
            external_assignment_reason_other: employee.external_assignment_reason_other || ''
        });
    }
  }, [employee]);

  // Effect to update employee roles when employee or healthCenters data changes
  useEffect(() => {
    if (employee && healthCenters.length > 0) {
      const roles = getAllEmployeeRoles(employee, healthCenters);
      setEmployeeRoles(roles);
    }
  }, [employee, healthCenters]);

  const handleDocumentUploaded = () => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('id');
    if (employeeId) {
      loadEmployeeData(employeeId);
    }
    setShowUpload(false);
  };

  const handleDocumentDeleted = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleRefreshDocuments = async () => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('id');
    if (employeeId) {
      try {
        const docs = await base44.entities.EmployeeDocument.filter({ employee_id: employeeId });
        setDocuments(Array.isArray(docs) ? docs : []);
      } catch (error) {
        console.error("Failed to refresh documents:", error);
      }
    }
  };

  const handleRetry = () => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('id');
    if (employeeId) {
      setError(null);
      setRetryCount(0);
      loadEmployeeData(employeeId);
    }
  };

  const handleExternalAssignmentChange = (field, value) => {
      setExternalAssignment(prev => ({...prev, [field]: value}));
  };

  const handleSaveExternalAssignment = async () => {
      if (!employee || !employee.id) {
          alert("خطأ: لا يمكن حفظ التكليف الخارجي. بيانات الموظف غير مكتملة.");
          return;
      }
      setIsLoading(true);
      setLoadingStatus('جاري حفظ حالة التكليف الخارجي...');
      setError(null);
      try {
          // Convert date to ISO string if it's a Date object, or null if indefinite
          const payload = {
              ...externalAssignment,
              external_assignment_end_date: externalAssignment.is_externally_assigned && !externalAssignment.external_assignment_indefinite && externalAssignment.external_assignment_end_date 
                  ? format(externalAssignment.external_assignment_end_date, 'yyyy-MM-dd') 
                  : null
          };

          // If not externally assigned, clear all related fields
          if (!payload.is_externally_assigned) {
            payload.external_assignment_center = null;
            payload.external_assignment_end_date = null;
            payload.external_assignment_indefinite = false;
            payload.external_assignment_reason = null;
            payload.external_assignment_reason_other = null;
          } else {
            // If assigned, but indefinite, ensure end_date is null
            if (payload.external_assignment_indefinite) {
              payload.external_assignment_end_date = null;
            }
            // If reason is not 'أخرى', clear 'external_assignment_reason_other'
            if (payload.external_assignment_reason !== 'أخرى') {
              payload.external_assignment_reason_other = null;
            }
          }

          await base44.entities.Employee.update(employee.id, payload);
          alert("تم تحديث حالة التكليف الخارجي بنجاح.");
          // No need to get ID from search params, employee object already has it.
          await loadEmployeeData(employee.id); // Reload employee data to reflect changes
      } catch (err) {
          console.error("Failed to update external assignment:", err);
          setError(`فشل تحديث حالة التكليف الخارجي: ${err.message || 'خطأ غير معروف'}`);
          alert(`فشل تحديث حالة التكليف الخارجي: ${err.message || 'خطأ غير معروف'}`);
      } finally {
          setIsLoading(false);
          setLoadingStatus('');
      }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate(createPageUrl('HumanResources'))} size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div>
              <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* مؤشر التحميل مع الحالة */}
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg text-gray-700 mb-2">جاري التحميل...</p>
            {loadingStatus && (
              <p className="text-sm text-gray-500">{loadingStatus}</p>
            )}
            {retryCount > 0 && (
              <p className="text-xs text-orange-500 mt-2">
                محاولة إعادة الاتصال رقم {retryCount}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="lg:col-span-2 w-full h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate(createPageUrl('HumanResources'))} size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">خطأ في تحميل ملف الموظف</h1>
            </div>
          </div>
          
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-base">
              {error}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
            <Button variant="outline" onClick={() => navigate(createPageUrl('HumanResources'))}>
              العودة إلى قائمة الموظفين
            </Button>
          </div>

          {retryCount > 2 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">نصائح لحل المشكلة:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• تأكد من اتصالك بالإنترنت</li>
                <li>• جرب تحديث الصفحة (F5)</li>
                <li>• امسح cache المتصفح</li>
                <li>• جرب باستخدام متصفح آخر</li>
                <li>• تواصل مع الدعم الفني إذا استمرت المشكلة</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate(createPageUrl('HumanResources'))} size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-gray-600 text-lg">لم يتم العثور على بيانات الموظف</div>
          <Button onClick={handleRetry} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header احترافي */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl('HumanResources'))} 
            size="icon"
            className="border-white/20 text-white hover:bg-white/10 rounded-xl backdrop-blur-md"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <User className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200 tracking-tight">
                  ملف الموظف
                </h1>
                <p className="text-indigo-200/70 text-sm md:text-base mt-1">عرض شامل ومفصّل</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 no-print">
            <Button 
              variant="outline" 
              onClick={() => setShowIDCard(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 rounded-xl backdrop-blur-md"
            >
              <CreditCard className="w-4 h-4 ml-2" />
              البطاقة
            </Button>
            <EmployeeProfileExporter employee={employee} />
            <EmployeeProfileCustomExport employee={employee} />
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="border-white/20 text-white hover:bg-white/10 rounded-xl backdrop-blur-md"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </motion.div>

        {/* Employee Full Details with Integrated Roles - محسّن */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {employee.profile_image_url ? (
                    <img 
                      src={employee.profile_image_url} 
                      alt={employee.full_name_arabic} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {employee.full_name_arabic}
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </h2>
                    <p className="text-indigo-200/80 text-sm">{employee.position}</p>
                  </div>
                </div>
                <Link to={createPageUrl(`HumanResources?id=${employee.id}`)}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl backdrop-blur-md"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {/* الأدوار الوظيفية المتكاملة */}
              {employeeRoles.length > 0 && (
                <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    الأدوار الوظيفية والقيادية
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {employeeRoles.map((roleObj, index) => {
                      const isAutoRole = roleObj.source === 'auto';
                      const isManagerRole = roleObj.roleType === 'manager';
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <Badge
                            className={`${
                              isManagerRole
                                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md'
                                : roleObj.roleType === 'deputy'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                                : roleObj.roleType === 'supervisor'
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                : 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-md'
                            }`}
                          >
                            {roleObj.role}
                            {roleObj.centerName && (
                              <span className="mr-1">- {roleObj.centerName}</span>
                            )}
                          </Badge>
                          {isAutoRole && (
                            <span className="text-xs text-white/40">(تلقائي)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <EmployeeFullDetails employee={employee} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* معلومات الموظف السريعة */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="p-6 text-center border-b border-white/10">
                {employee.profile_image_url ? (
                  <img 
                    src={employee.profile_image_url} 
                    alt={employee.full_name_arabic} 
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-white mb-1">{employee.full_name_arabic}</h2>
                <p className="text-indigo-200/70">{employee.position}</p>
                {employee.is_externally_assigned && (
                  <Badge className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                    <FileClock className="w-3 h-3 ml-1" />
                    مكلف خارجي
                    {employee.external_assignment_center && ` - ${employee.external_assignment_center}`}
                  </Badge>
                )}
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { label: 'رقم الموظف', value: employee.رقم_الموظف },
                    { label: 'المركز الصحي', value: employee.المركز_الصحي || 'غير محدد' },
                    { label: 'نوع العقد', value: employee.contract_type },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-white/60 text-sm">{item.label}:</span>
                      <span className="font-medium text-white text-sm">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">الهاتف:</span>
                    <span className="font-medium">
                      {employee.phone ? (
                        <a
                          href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{employee.phone}</span>
                        </a>
                      ) : (
                        <span className="text-white/40 text-sm">غير محدد</span>
                      )}
                    </span>
                  </div>
                  {employee.email && (
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-white/60 text-sm">البريد:</span>
                      <span className="font-medium text-white text-xs break-all">{employee.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* محتوى ملف الموظف */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/10">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  السجلات والمستندات
                </h3>
              </div>
              <div className="p-6">
                <Tabs defaultValue="documents" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl border border-white/10">
                    <TabsTrigger 
                      value="documents" 
                      className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden md:inline">المستندات</span>
                      <Badge variant="secondary" className="text-xs bg-white/20">{documents.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="leaves" 
                      className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden md:inline">الإجازات</span>
                      <Badge variant="secondary" className="text-xs bg-white/20">{leaves.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assignments" 
                      className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span className="hidden md:inline">التكاليف</span>
                      <Badge variant="secondary" className="text-xs bg-white/20">{assignments.length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="mt-6">
                    <div className="mb-4 flex justify-end">
                      <Button 
                        onClick={() => setShowUpload(true)}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg rounded-xl"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        رفع مستند
                      </Button>
                    </div>
                    <Suspense fallback={
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-white/40" />
                      </div>
                    }>
                      <EmployeeDocumentList 
                          documents={documents} 
                          onDocumentDeleted={handleDocumentDeleted}
                          onRefresh={handleRefreshDocuments}
                          currentEmployeeId={employee?.id}
                      />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="leaves" className="mt-6">
                    <Suspense fallback={<div>جاري تحميل سجل الإجازات...</div>}>
                      <EmployeeLeaveHistory leaves={leaves} />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="assignments" className="mt-6">
                    <Suspense fallback={<div>جاري تحميل سجل التكاليف...</div>}>
                      <EmployeeAssignmentHistory assignments={assignments} />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>

          {/* التكليف الخارجي */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/10">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileClock className="w-5 h-5 text-amber-400" />
                  التكليف الخارجي
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <Label htmlFor="is_externally_assigned" className="font-semibold text-white">
                    مكلف خارج المنطقة؟
                  </Label>
                  <Switch
                      id="is_externally_assigned"
                      checked={externalAssignment.is_externally_assigned}
                      onCheckedChange={(checked) => handleExternalAssignmentChange('is_externally_assigned', checked)}
                  />
                </div>
                {externalAssignment.is_externally_assigned && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div>
                            <Label htmlFor="external_assignment_center" className="mb-2 block text-sm font-medium text-white/80">الجهة المكلف بها</Label>
                            <Input
                                id="external_assignment_center"
                                placeholder="اسم الجهة أو المركز"
                                value={externalAssignment.external_assignment_center}
                                onChange={(e) => handleExternalAssignmentChange('external_assignment_center', e.target.value)}
                                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                            />
                        </div>
                        
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-gray-700">سبب التكليف</Label>
                            <Select
                                value={externalAssignment.external_assignment_reason}
                                onValueChange={(value) => handleExternalAssignmentChange('external_assignment_reason', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر سبب التكليف" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="حتى افتتاح مركز">حتى افتتاح مركز</SelectItem>
                                    <SelectItem value="لتعزيز الكوادر">لتعزيز الكوادر</SelectItem>
                                    <SelectItem value="لسد العجز">لسد العجز</SelectItem>
                                    <SelectItem value="بناء على طلب الجهة">بناء على طلب الجهة</SelectItem>
                                    <SelectItem value="حتى إشعار آخر">حتى إشعار آخر</SelectItem>
                                    <SelectItem value="أخرى">أخرى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {externalAssignment.external_assignment_reason === 'أخرى' && (
                            <div>
                                <Label htmlFor="external_assignment_reason_other" className="mb-1 block text-sm font-medium text-gray-700">حدد السبب</Label>
                                <Input
                                    id="external_assignment_reason_other"
                                    placeholder="اكتب السبب..."
                                    value={externalAssignment.external_assignment_reason_other}
                                    onChange={(e) => handleExternalAssignmentChange('external_assignment_reason_other', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        )}

                        <div className="flex items-center space-x-2 space-x-reverse p-3 bg-blue-50 rounded-lg">
                            <Checkbox 
                                id="external_assignment_indefinite"
                                checked={externalAssignment.external_assignment_indefinite}
                                onCheckedChange={(checked) => {
                                    handleExternalAssignmentChange('external_assignment_indefinite', checked);
                                    if (checked) {
                                        handleExternalAssignmentChange('external_assignment_end_date', null);
                                    }
                                }}
                            />
                            <Label htmlFor="external_assignment_indefinite" className="cursor-pointer">
                                حتى إشعار آخر (بدون تاريخ محدد)
                            </Label>
                        </div>

                        {!externalAssignment.external_assignment_indefinite && (
                            <div>
                                <SmartDateInput
                                    label="تاريخ نهاية التكليف"
                                    value={externalAssignment.external_assignment_end_date}
                                    onChange={(date) => handleExternalAssignmentChange('external_assignment_end_date', date)}
                                />
                            </div>
                        )}
                    </div>
                )}
                <Button onClick={handleSaveExternalAssignment} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ حالة التكليف
                </Button>
              </CardContent>
            </Card>
            
            {/* صندوق العمل في الإجازات الرسمية - جديد */}
            <HolidayWorkManager 
              employee={employee}
              onUpdate={() => loadEmployeeData(employee.id)}
            />
          </div>
        </div>

        {/* نسخة طباعة احترافية (تظهر فقط عند الطباعة) */}
        <div className="print-only print-area p-6 mt-6 bg-white border border-gray-200 rounded-lg">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">بيانات الموظف التفصيلية</h2>
            <div className="text-sm text-gray-600">تاريخ الطباعة: {new Date().toLocaleDateString("ar-SA")}</div>
          </div>
          <table className="w-full border border-gray-300">
            <tbody>
              {Object.entries(employee).filter(([k]) => {
                const hidden = new Set(["id","created_date","updated_date","created_by","salary","emergency_contact","emergency_phone","notes","is_sample","isSample","تم_انشاؤه_بواسطة","الراتب","الاتصال_في_حالة_الطارئة","ملاحظات"]);
                return !hidden.has(k);
              }).map(([k,v]) => {
                let val = v;
                if (Array.isArray(val)) val = val.join(", ");
                if (typeof val === "boolean") val = val ? "نعم" : "لا";
                if ((k.toLowerCase().includes("date") || k.includes("تاريخ")) && v) {
                  try { 
                    const date = new Date(v);
                    if (!isNaN(date.getTime())) { // Check if date is valid
                      val = date.toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }); 
                    } else {
                      val = v; // Keep original if invalid date
                    }
                  } catch (e) {
                    val = v; // Keep original if error parsing
                  }
                }
                return (
                  <tr key={k}>
                    <th className="text-right border border-gray-300 p-2 bg-gray-100 font-medium text-gray-700">{k}</th>
                    <td className="border border-gray-300 p-2 text-gray-800">{String(val ?? "—")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showUpload && (
          <Suspense fallback={<div>جاري تحميل أداة رفع المستندات...</div>}>
            <EmployeeDocumentUpload
              employee={employee}
              onClose={() => setShowUpload(false)}
              onDocumentUploaded={handleDocumentUploaded}
            />
          </Suspense>
        )}

        {/* ID Card Dialog */}
        {showIDCard && (
          <EmployeeIDCard employee={employee} onClose={() => setShowIDCard(false)} />
        )}
      </div>
    </div>
  );
}