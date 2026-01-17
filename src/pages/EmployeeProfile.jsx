import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, FileText, Calendar, Briefcase, Plus, AlertCircle, RefreshCw, FileClock, Save, MessageCircle, Printer, Edit, Shield, CreditCard, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Hero Section مع بيانات الموظف */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl('HumanResources'))} 
              className="text-white hover:bg-white/20 rounded-xl gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="hidden sm:inline">العودة للموظفين</span>
            </Button>
            <div className="flex gap-2 no-print">
              <Button 
                variant="ghost" 
                onClick={() => setShowIDCard(true)}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <CreditCard className="w-4 h-4 ml-2" />
                <span className="hidden sm:inline">البطاقة</span>
              </Button>
              <EmployeeProfileExporter employee={employee} />
              <EmployeeProfileCustomExport employee={employee} />
              <Button 
                variant="ghost" 
                onClick={() => window.print()}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <Printer className="w-4 h-4 ml-2" />
                <span className="hidden sm:inline">طباعة</span>
              </Button>
            </div>
          </div>
          
          {/* Employee Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            {/* Profile Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-3xl blur-xl opacity-30 transform scale-110"></div>
              {employee.profile_image_url ? (
                <img 
                  src={employee.profile_image_url} 
                  alt={employee.full_name_arabic} 
                  className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
                />
              ) : (
                <div className="relative w-28 h-28 md:w-36 md:h-36 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-2xl">
                  <User className="w-14 h-14 md:w-18 md:h-18 text-white" />
                </div>
              )}
              {employee.is_externally_assigned && (
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <FileClock className="w-3 h-3" />
                  مكلف
                </div>
              )}
            </div>
            
            {/* Employee Info */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {employee.full_name_arabic}
              </h1>
              <p className="text-blue-100 text-lg mb-4">{employee.position}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <span className="text-white/70 text-sm">الرقم الوظيفي:</span>
                  <span className="text-white font-bold">{employee.رقم_الموظف}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <span className="text-white/70 text-sm">المركز:</span>
                  <span className="text-white font-bold">{employee.المركز_الصحي || 'غير محدد'}</span>
                </div>
                {employee.phone && (
                  <a
                    href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span className="text-white font-medium">تواصل واتساب</span>
                  </a>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <FileText className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{documents.length}</p>
                <p className="text-xs text-white/70">مستند</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <Calendar className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{leaves.length}</p>
                <p className="text-xs text-white/70">إجازة</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <Briefcase className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{assignments.length}</p>
                <p className="text-xs text-white/70">تكليف</p>
              </div>
            </div>
          </motion.div>
          
          {/* Employee Roles */}
          {employeeRoles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 flex flex-wrap justify-center md:justify-start gap-2"
            >
              {employeeRoles.map((roleObj, index) => (
                <Badge
                  key={index}
                  className={`${
                    roleObj.roleType === 'manager'
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                      : roleObj.roleType === 'deputy'
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                      : roleObj.roleType === 'supervisor'
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
                      : 'bg-white/30 text-white'
                  } px-4 py-2 text-sm font-semibold rounded-full shadow-lg`}
                >
                  <Shield className="w-4 h-4 ml-1 inline" />
                  {roleObj.role}
                  {roleObj.centerName && <span className="mr-1 opacity-80">- {roleObj.centerName}</span>}
                </Badge>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* البيانات التفصيلية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-indigo-500 to-blue-500 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  البيانات التفصيلية
                </h2>
                <Link to={createPageUrl(`HumanResources?id=${employee.id}`)}>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="rounded-xl"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل البيانات
                  </Button>
                </Link>
              </div>
            </div>
            <CardContent className="p-6">
              <EmployeeFullDetails employee={employee} />
            </CardContent>
          </Card>
        </motion.div>

        {/* المستندات والسجلات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <Tabs defaultValue="documents" className="w-full">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <TabsList className="grid w-full grid-cols-3 bg-white/80 p-1 rounded-xl shadow-sm h-auto">
                  <TabsTrigger 
                    value="documents" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">المستندات</span>
                    <Badge className="bg-white/20 border-0 text-inherit">{documents.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leaves" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">الإجازات</span>
                    <Badge className="bg-white/20 border-0 text-inherit">{leaves.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="assignments" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-semibold">التكاليف</span>
                    <Badge className="bg-white/20 border-0 text-inherit">{assignments.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-6">
                <TabsContent value="documents" className="mt-0">
                  <div className="mb-4 flex justify-end">
                    <Button 
                      onClick={() => setShowUpload(true)}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      رفع مستند جديد
                    </Button>
                  </div>
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
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

                <TabsContent value="leaves" className="mt-0">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                  }>
                    <EmployeeLeaveHistory leaves={leaves} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="assignments" className="mt-0">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                    </div>
                  }>
                    <EmployeeAssignmentHistory assignments={assignments} />
                  </Suspense>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* التكليف الخارجي والعمل في الإجازات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* التكليف الخارجي */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden h-full">
              <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 border-b">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileClock className="w-5 h-5" />
                  التكليف الخارجي
                </h3>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <Label htmlFor="is_externally_assigned" className="font-semibold text-amber-800">
                    مكلف خارج المنطقة؟
                  </Label>
                  <Switch
                      id="is_externally_assigned"
                      checked={externalAssignment.is_externally_assigned}
                      onCheckedChange={(checked) => handleExternalAssignmentChange('is_externally_assigned', checked)}
                  />
                </div>
                {externalAssignment.is_externally_assigned && (
                    <div className="space-y-4 pt-4 border-t">
                        <div>
                            <Label htmlFor="external_assignment_center" className="mb-2 block text-sm font-medium text-gray-700">الجهة المكلف بها</Label>
                            <Input
                                id="external_assignment_center"
                                placeholder="اسم الجهة أو المركز"
                                value={externalAssignment.external_assignment_center}
                                onChange={(e) => handleExternalAssignmentChange('external_assignment_center', e.target.value)}
                                className="w-full rounded-xl"
                            />
                        </div>
                        
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-gray-700">سبب التكليف</Label>
                            <Select
                                value={externalAssignment.external_assignment_reason}
                                onValueChange={(value) => handleExternalAssignmentChange('external_assignment_reason', value)}
                            >
                                <SelectTrigger className="rounded-xl">
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
                                <Label htmlFor="external_assignment_reason_other" className="mb-2 block text-sm font-medium text-gray-700">حدد السبب</Label>
                                <Input
                                    id="external_assignment_reason_other"
                                    placeholder="اكتب السبب..."
                                    value={externalAssignment.external_assignment_reason_other}
                                    onChange={(e) => handleExternalAssignmentChange('external_assignment_reason_other', e.target.value)}
                                    className="w-full rounded-xl"
                                />
                            </div>
                        )}

                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-blue-50 rounded-xl border border-blue-200">
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
                            <Label htmlFor="external_assignment_indefinite" className="cursor-pointer text-blue-800">
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
                <Button 
                  onClick={handleSaveExternalAssignment} 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11 rounded-xl shadow-lg"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ حالة التكليف
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* صندوق العمل في الإجازات الرسمية */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden h-full">
              <HolidayWorkManager 
                employee={employee}
                onUpdate={() => loadEmployeeData(employee.id)}
              />
            </Card>
          </motion.div>
        </div>

        {/* نسخة طباعة احترافية */}
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
                    if (!isNaN(date.getTime())) {
                      val = date.toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }); 
                    } else {
                      val = v;
                    }
                  } catch (e) {
                    val = v;
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

        {showIDCard && (
          <EmployeeIDCard employee={employee} onClose={() => setShowIDCard(false)} />
        )}
      </div>
    </div>
  );
}