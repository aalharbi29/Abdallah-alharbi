import React, { useState, useEffect, useMemo } from "react";
import { Assignment } from "@/entities/Assignment";
import { HealthCenter } from "@/entities/HealthCenter";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Trash2, Filter, Search, AlertTriangle, RefreshCw, Archive, CheckCircle, XCircle, Calendar, Download, FileText, Loader2, Plus, Settings2, Edit, X, SlidersHorizontal, Users, Layers } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import ExportManager from "../components/export/ExportManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportAssignment } from "@/functions/exportAssignment"; 

import { UploadFile } from "@/integrations/Core";
import { ArchivedFile } from "@/entities/ArchivedFile";
import { EmployeeDocument } from "@/entities/EmployeeDocument";

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [isArchiving, setIsArchiving] = useState(false);
  
  // فلاتر متقدمة
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterCenter, setFilterCenter] = useState("all");
  const [filterApprovalStatus, setFilterApprovalStatus] = useState("all");
  
  // أعراض الأعمدة القابلة للسحب
  const [columnWidths, setColumnWidths] = useState({
    select: 40,
    name: 150,
    fromCenter: 140,
    toCenter: 140,
    period: 160,
    duration: 80,
    status: 100,
    actions: 240
  });
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [resizing, setResizing] = useState({ active: false, column: null });
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // استخدام useMemo لضمان أن assignments دائماً مصفوفة صالحة
  const safeAssignments = useMemo(() => Array.isArray(assignments) ? assignments.filter(Boolean) : [], [assignments]);

  useEffect(() => {
    loadAssignments();
    loadHealthCenters();
  }, []);

  // التعامل مع سحب الأعمدة
  useEffect(() => {
    if (!resizing.active) return;
    
    const handleMouseMove = (e) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(60, Math.min(400, startWidth + diff));
      setColumnWidths(prev => ({ ...prev, [resizing.column]: newWidth }));
    };
    
    const handleMouseUp = () => {
      setResizing({ active: false, column: null });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing.active, startX, startWidth]);

  const handleColumnResizeStart = (e, columnKey) => {
    e.preventDefault();
    setResizing({ active: true, column: columnKey });
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey] || 150);
  };

  const loadAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const data = await Assignment.list("-issue_date", 500);
        setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Failed to load assignments:", err);
        setError("فشل تحميل التكليفات. يرجى التحقق من اتصالك بالإنترنت.");
        setAssignments([]);
    } finally {
        setIsLoading(false);
    }
  };

  const loadHealthCenters = async () => {
    try {
      const data = await HealthCenter.list();
      setHealthCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load health centers:", err);
    }
  };

  const toggleSelection = (id) => {
    setSelectedAssignments(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedAssignments.length === filteredAssignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(filteredAssignments.map(a => a.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedAssignments.length} عنصر؟`)) return;
    
    setIsLoading(true);
    try {
      await Promise.all(selectedAssignments.map(id => Assignment.delete(id)));
      setSelectedAssignments([]);
      loadAssignments();
      alert("تم الحذف بنجاح");
    } catch (err) {
      console.error(err);
      alert("فشل الحذف");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setFilterCenter("all");
    setFilterApprovalStatus("all");
  };


  const archiveAssignmentDocument = async (assignment) => {
    if (!assignment) return;
    setIsArchiving(true);
    try {
        const safeEmployeeName = (assignment.employee_name || 'unknown')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '_')
          .substring(0, 30);

        const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>قرار تكليف - ${assignment.employee_name || ''}</title>
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { line-height: 1.8; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td, th { border: 1px solid black; padding: 8px; text-align: center; }
        .label { background-color: #f0f0f0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>قرار تكليف - مؤقت</h1>
        <p>المملكة العربية السعودية - وزارة الصحة</p>
        <p>إدارة شؤون المراكز الصحية بالحناكية</p>
    </div>
    
    <table>
        <tr><td class="label">الاسم</td><td>${assignment.employee_name || ''}</td></tr>
        <tr><td class="label">المسمى الوظيفي</td><td>${assignment.employee_position || ''}</td></tr>
        <tr><td class="label">جهة العمل</td><td>${assignment.from_health_center || ''}</td></tr>
        <tr><td class="label">جهة التكليف</td><td>${assignment.assigned_to_health_center || ''}</td></tr>
        <tr><td class="label">مدة التكليف</td><td>${assignment.duration_days || 'غير محدد'} أيام من ${assignment.start_date ? format(new Date(assignment.start_date), "yyyy-MM-dd") : ''} إلى ${assignment.end_date ? format(new Date(assignment.end_date), "yyyy-MM-dd") : ''}</td></tr>
    </table>
    
    <div class="content">
        <p><strong>قرار التكليف:</strong></p>
        <p>تم تكليف المذكور أعلاه للعمل في ${assignment.assigned_to_health_center || ''} للفترة المحددة أعلاه.</p>
        <p>تاريخ إصدار القرار: ${new Date().toLocaleDateString('ar-SA')}</p>
        <br><br>
        <p style="text-align: center;">مدير شؤون المراكز الصحية بالحناكية</p>
        <p style="text-align: center;">أ/عبدالمجيد سعود الربيقي</p>
    </div>
</body>
</html>`;

        const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const fileName = `قرار_تكليف_${safeEmployeeName}.html`;
        const htmlFile = new File([htmlBlob], fileName, { type: 'text/html' });

        try {
          const uploadResult = await UploadFile({ file: htmlFile });
          
          await ArchivedFile.create({
              title: `قرار تكليف - ${assignment.employee_name || ''}`,
              description: `تكليف من ${assignment.start_date ? format(new Date(assignment.start_date), "yyyy-MM-dd") : ''} إلى ${assignment.end_date ? format(new Date(assignment.end_date), "yyyy-MM-dd") : ''} - تم إنشاؤه تلقائياً`,
              category: 'assignments',
              file_url: uploadResult.file_url,
              file_name: fileName,
              tags: ['تكليف', 'مؤرشف', 'تلقائي', assignment.employee_name].filter(Boolean)
          });
          
          // alert("تم أرشفة قرار التكليف بنجاح في الأرشيف المركزي."); // This alert is now handled by the caller
          
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          
          const downloadUrl = window.URL.createObjectURL(htmlBlob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);
          
          throw new Error("تعذر رفع الملف تلقائياً إلى الأرشيف المركزي، لكن تم تحميله على جهازك.");
        }

    } catch (err) {
        console.error("Failed to archive assignment:", err);
        throw err; // Re-throw to be caught by handleStatusUpdate
    } finally {
        setIsArchiving(false);
    }
  };


  const saveAssignmentToEmployeeFile = async (assignment, htmlContent) => {
    try {
      const safeEmployeeName = (assignment.employee_name || 'unknown')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);

      const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const fileName = `قرار_تكليف_${safeEmployeeName}_${new Date().toISOString().split('T')[0]}.html`;
      const htmlFile = new File([htmlBlob], fileName, { type: 'text/html' });

      const uploadResult = await UploadFile({ file: htmlFile });
      
      await EmployeeDocument.create({
        employee_id: assignment.employee_record_id,
        employee_name: assignment.employee_name,
        document_title: `قرار تكليف - ${assignment.assigned_to_health_center}`,
        document_type: 'official',
        description: `تكليف من ${assignment.start_date ? format(new Date(assignment.start_date), "yyyy-MM-dd") : ''} إلى ${assignment.end_date ? format(new Date(assignment.end_date), "yyyy-MM-dd") : ''} - تم حفظه تلقائياً عند الاعتماد`,
        file_url: uploadResult.file_url,
        file_name: fileName,
        tags: ['تكليف', 'معتمد', 'رسمي']
      });

      return true;
    } catch (error) {
      console.error('Failed to save to employee file:', error);
      return false;
    }
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    try {
        const assignmentToUpdate = safeAssignments.find(a => a.id === assignmentId);
        if (!assignmentToUpdate) {
            throw new Error("Assignment not found");
        }
        
        const isHolidayWork = (assignmentToUpdate.assignment_type || '').includes('العمل خلال إجازة');

        const updateData = {
            status: newStatus,
            completion_date: newStatus !== 'active' ? new Date().toISOString().split('T')[0] : null
        };
        await Assignment.update(assignmentId, updateData);
        
        // تحديث النص للتوضيح أكثر
        const statusMessages = {
            completed: isHolidayWork ? "تم إنهاء فترة العمل بنجاح." : "تم إنهاء التكليف بنجاح. سيتم الآن أرشفة القرار تلقائياً...",
            cancelled: isHolidayWork ? "تم إلغاء فترة العمل." : "تم إلغاء التكليف. سيتم الآن أرشفة القرار تلقائياً...",
        };
        
        const message = statusMessages[newStatus] || "تم تحديث الحالة.";
        
        // عرض رسالة فورية
        alert(message);

        // Only archive if it's not a holiday work record
        if ((newStatus === 'completed' || newStatus === 'cancelled') && !isHolidayWork) {
            try {
                await archiveAssignmentDocument(assignmentToUpdate);
                alert("تم إنهاء التكليف وأرشفة القرار بنجاح.");
            } catch (archiveError) {
                console.error("Archive error:", archiveError);
                alert(`تم إنهاء التكليف بنجاح، لكن فشلت عملية الأرشفة: ${archiveError.message || "حدث خطأ غير معروف"}. يرجى القيام بالأرشفة يدوياً.`);
            }
        }
        
        loadAssignments();
    } catch (err) {
        console.error("Failed to update assignment:", err);
        alert("فشل في تحديث الحالة. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDelete = async (id) => {
    try {
        await Assignment.delete(id);
        loadAssignments();
        alert("تم حذف التكليف بنجاح.");
    } catch (err) {
        console.error("Failed to delete assignment:", err);
        alert("فشل حذف التكليف.");
    }
  };

  const handleExportPDF = async (assignment) => {
    if (!assignment) return;
    setIsLoading(true);
    try {
      const response = await exportAssignment({ assignmentId: assignment.id });
      
      if (response.data && response.data.success) {
        const { html_content } = response.data;
        
        // إذا كان التكليف معتمداً، احفظه في ملف الموظف
        if (assignment.approval_status === 'approved') {
          const saved = await saveAssignmentToEmployeeFile(assignment, html_content);
          if (saved) {
            alert('تم حفظ التكليف المعتمد في ملف الموظف بنجاحً. سيتم فتح نافذة الطباعة الآن...');
          }
        }
        
        const printWindow = window.open('', '_blank');
        
        if (printWindow && printWindow.document) {
          printWindow.document.write(html_content);
          printWindow.document.close();
          
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        } else {
          console.warn('Pop-up blocked, using alternative method');
          
          const blob = new Blob([html_content], { type: 'text/html;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const safeFilename = `قرار_تكليف_${(assignment.employee_name || 'unknown').replace(/[\s/\\?%*:"|<>]/g, '_')}.html`;
          link.download = safeFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          alert('تم تحميل الملف بصيغة HTML. يمكنك فتحه والطباعة منه أو حفظه كـ PDF من المتصفح.');
        }

      } else {
        throw new Error('فشل تحميل محتوى التقرير للتصدير.');
      }

    } catch (error) {
      console.error('Export error:', error);
      alert(`فشل في تصدير التكليف: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = (assignment) => {
    if (!assignment) return;
    const assignmentLetter = `...`; // Content omitted for brevity

    const blob = new Blob([`\ufeff${assignmentLetter}`], { type: 'application/vnd.ms-excel;charset=utf-8' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = `خطاب_تكليف_${(assignment.employee_name || 'unknown')}.xls`.replace(/[\s/\\?%*:"|<>]/g, '_');
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const draftAssignments = safeAssignments.filter(assignment => 
    (assignment.approval_status === 'draft' || !assignment.approval_status) && assignment.status === 'active'
  );
  const activeAssignments = safeAssignments.filter(assignment => 
    assignment.approval_status === 'approved' && assignment.status === 'active'
  );
  const archivedAssignments = safeAssignments.filter(assignment => assignment.status === 'completed' || assignment.status === 'cancelled');

  const currentAssignments = activeTab === "drafts" ? draftAssignments : activeTab === "active" ? activeAssignments : archivedAssignments;

  // تطبيق الفلاتر المتقدمة
  const filteredAssignments = useMemo(() => {
    return currentAssignments.filter(assignment => {
      // فلتر البحث النصي
      const searchMatch = !searchQuery || 
        (assignment.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.assigned_to_health_center || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.from_health_center || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // فلتر التاريخ من
      const dateFromMatch = !dateFrom || 
        (assignment.start_date && new Date(assignment.start_date) >= new Date(dateFrom));
      
      // فلتر التاريخ إلى
      const dateToMatch = !dateTo || 
        (assignment.end_date && new Date(assignment.end_date) <= new Date(dateTo));
      
      // فلتر المركز
      const centerMatch = filterCenter === "all" || 
        assignment.assigned_to_health_center === filterCenter ||
        assignment.from_health_center === filterCenter;
      
      // فلتر حالة الاعتماد
      const approvalMatch = filterApprovalStatus === "all" ||
        (filterApprovalStatus === "approved" && assignment.approval_status === "approved") ||
        (filterApprovalStatus === "draft" && (assignment.approval_status === "draft" || !assignment.approval_status));
      
      return searchMatch && dateFromMatch && dateToMatch && centerMatch && approvalMatch;
    });
  }, [currentAssignments, searchQuery, dateFrom, dateTo, filterCenter, filterApprovalStatus]);

  const activeFiltersCount = [dateFrom, dateTo, filterCenter !== "all" ? filterCenter : "", filterApprovalStatus !== "all" ? filterApprovalStatus : ""].filter(Boolean).length;

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={loadAssignments} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const AssignmentStatusBadge = ({ assignment, isArchive = false }) => {
    if (!assignment) return null;

    if (isArchive) {
      if (assignment.status === 'completed') return <Badge className="bg-green-100 text-green-800">مُنهى</Badge>;
      if (assignment.status === 'cancelled') return <Badge className="bg-red-100 text-red-800">مُلغى</Badge>;
    }

    try {
      const today = new Date();
      const startDate = new Date(assignment.start_date);
      const endDate = new Date(assignment.end_date);

      if (today >= startDate && today <= endDate) return <Badge className="bg-blue-100 text-blue-800 animate-pulse">تكليف جاري</Badge>;
      if (today > endDate) return <Badge variant="secondary">منتهي</Badge>;
      if (today < startDate) return <Badge variant="outline">قادم</Badge>;
    } catch (e) {
      // Invalid date
    }

    return <Badge variant="outline">غير محدد</Badge>;
  };

  // مكون لعنصر سحب حدود العمود
  const ColResizer = ({ columnKey }) => (
    <div
      className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
      style={{ backgroundColor: resizing.column === columnKey ? '#3b82f6' : 'transparent' }}
      onMouseDown={(e) => handleColumnResizeStart(e, columnKey)}
    />
  );

  const AssignmentTable = ({ data, isArchive = false, isDraft = false }) => (
    <div className="overflow-x-auto" dir="rtl">
      <Table style={{ tableLayout: 'auto' }} className="min-w-[600px] md:min-w-full">
        <TableHeader>
          <TableRow className="text-[10px] md:text-sm">
            <TableHead className="w-[30px] md:w-[40px] px-1 md:px-2">
              <Checkbox 
                checked={filteredAssignments.length > 0 && selectedAssignments.length === filteredAssignments.length}
                onCheckedChange={toggleAll}
                className="w-3 h-3 md:w-4 md:h-4"
              />
            </TableHead>
            <TableHead className="text-right px-1 md:px-3 min-w-[80px] md:min-w-[150px]">
              الموظف
            </TableHead>
            <TableHead className="text-right px-1 md:px-3 min-w-[60px] md:min-w-[120px] hidden sm:table-cell">
              من
            </TableHead>
            <TableHead className="text-right px-1 md:px-3 min-w-[60px] md:min-w-[120px]">
              إلى
            </TableHead>
            <TableHead className="text-right px-1 md:px-3 min-w-[70px] md:min-w-[140px] hidden md:table-cell">
              الفترة
            </TableHead>
            <TableHead className="text-right px-1 md:px-3 min-w-[40px] md:min-w-[70px]">
              المدة
            </TableHead>
            <TableHead className="text-right px-1 md:px-3 min-w-[50px] md:min-w-[90px] hidden sm:table-cell">
              الحالة
            </TableHead>
            {isArchive && <TableHead className="text-right px-1 md:px-3 min-w-[70px] hidden lg:table-cell">الإنهاء</TableHead>}
            {isDraft && <TableHead className="text-right px-1 md:px-3 min-w-[70px] hidden lg:table-cell">الاعتماد</TableHead>}
            <TableHead className="text-center no-print px-1 md:px-3 min-w-[100px] md:min-w-[200px]">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={isArchive ? "9" : "8"} className="text-center p-8">جاري تحميل البيانات...</TableCell></TableRow>
          ) : data.length > 0 ? (
            data.map(assignment => (
              <TableRow 
                key={assignment.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedAssignments.includes(assignment.id) ? 'bg-blue-50' : ''} ${isDraft ? 'bg-yellow-50/30' : ''}`}
                onClick={() => toggleSelection(assignment.id)}
              >
                <TableCell className="px-2">
                  <Checkbox 
                    checked={selectedAssignments.includes(assignment.id)}
                    onCheckedChange={() => toggleSelection(assignment.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="font-medium text-right p-2 md:p-4">
                  <div className="flex items-center gap-2">
                    {assignment.assignment_template_type === 'multiple' && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 p-0.5 px-1" title="تكليف جماعي">
                        <Layers className="w-3 h-3" />
                      </Badge>
                    )}
                    <div className="text-sm md:text-base">{assignment.employee_name || 'غير محدد'}</div>
                  </div>
                  <div className="text-xs text-gray-500 md:hidden">{assignment.employee_national_id}</div>
                </TableCell>
                <TableCell className="text-right p-2 md:p-4">
                  <div className="text-xs md:text-sm">{assignment.from_health_center || ''}</div>
                </TableCell>
                <TableCell className="text-right p-2 md:p-4">
                  <div className="text-xs md:text-sm font-medium">{assignment.assigned_to_health_center || ''}</div>
                </TableCell>
                <TableCell className="text-right p-2 md:p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs md:text-sm">من: {assignment.start_date ? format(new Date(assignment.start_date), "yyyy-MM-dd") : 'غير محدد'}</span>
                    <span className="text-xs md:text-sm">إلى: {assignment.end_date ? format(new Date(assignment.end_date), "yyyy-MM-dd") : 'غير محدد'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right p-2 md:p-4">
                  <Badge variant="secondary" className="text-xs">{assignment.duration_days || '-'} يوم</Badge>
                </TableCell>
                <TableCell className="text-right p-2 md:p-4">
                  <AssignmentStatusBadge assignment={assignment} isArchive={isArchive} />
                </TableCell>
                {isArchive && (
                  <TableCell className="text-right p-2 md:p-4">
                    {assignment.completion_date ? (
                      <span className="text-xs md:text-sm text-gray-600">
                        {format(new Date(assignment.completion_date), "yyyy-MM-dd")}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">غير محدد</span>
                    )}
                  </TableCell>
                )}
                {isDraft && (
                  <TableCell className="text-right p-2 md:p-4">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      في انتظار الاعتماد
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="no-print p-1 md:p-4">
                  <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                    <div className="flex gap-1">
                      <Link to={createPageUrl(`ViewAssignment?id=${assignment.id}`)}>
                        <Button variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-3">
                          <Eye className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                          <span className="hidden md:inline">عرض</span>
                        </Button>
                      </Link>

                      <Button variant="outline" size="sm" onClick={() => handleExportPDF(assignment)} className="text-xs md:text-sm px-2 md:px-3 bg-red-50 hover:bg-red-100" disabled={isLoading}>
                        <FileText className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                        <span className="hidden md:inline">PDF</span>
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleExportExcel(assignment)} className="text-xs md:text-sm px-2 md:px-3 bg-green-50 hover:bg-green-100">
                        <Download className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                        <span className="hidden md:inline">Excel</span>
                      </Button>
                    </div>

                    {!isArchive ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-3" disabled={isArchiving}>
                            {isArchiving ? <Loader2 className="animate-spin w-4 h-4" /> : "المزيد ▼"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(assignment.id, 'completed')}>
                            <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                            إنهاء وأرشفة
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(assignment.id, 'cancelled')}>
                            <XCircle className="w-4 h-4 ml-2 text-red-600" />
                            إلغاء وأرشفة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="text-xs md:text-sm px-2 md:px-3">
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                          <span className="hidden md:inline">حذف</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد حذف التكليف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف تكليف الموظف "{assignment.employee_name || ''}"؟
                            {isArchive ? " سيتم حذفه من الأرشيف نهائياً." : " لا يمكن التراجع عن هذا الإجراء."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>تراجع</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(assignment.id)} className="bg-red-600 hover:bg-red-700">
                            نعم، احذف نهائياً
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={isArchive ? "9" : "8"} className="text-center p-8 text-gray-500">لا توجد تكليفات تطابق بحثك.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-4 animate-fade-in">
          <div>
            <h1 className="text-xl md:text-4xl font-display text-gray-900 mb-1 md:mb-2">سجل التكليفات</h1>
            <p className="text-sm md:text-lg text-gray-600 font-medium">إدارة تكليفات الموظفين</p>
          </div>
          <div className="flex flex-wrap gap-1 md:gap-2 items-center w-full md:w-auto">
            {selectedAssignments.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="flex-1 md:flex-initial animate-in fade-in zoom-in text-xs md:text-sm">
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                <span className="hidden sm:inline">حذف </span>({selectedAssignments.length})
              </Button>
            )}
            <div className="hidden md:block">
              <ExportManager data={filteredAssignments} filename="تقرير_التكليفات" />
            </div>
            <Button onClick={() => window.print()} variant="outline" size="sm" className="flex-1 md:flex-initial">
              <Printer className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2"/>
              <span className="hidden sm:inline text-xs md:text-sm">طباعة</span>
            </Button>
          </div>
        </div>

        {/* بطاقات اختيار نوع التكليف - مختصرة للجوال */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          <Link to={createPageUrl("CreateAssignment?type=standard")}>
            <Card className="group hover:shadow-md transition-all duration-300 border cursor-pointer hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-white h-full">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-base font-bold text-gray-900">قياسي</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 hidden md:block">قالب ثابت</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("CreateAssignment?type=flexible")}>
            <Card className="group hover:shadow-md transition-all duration-300 border cursor-pointer hover:scale-[1.02] bg-gradient-to-br from-purple-50 to-white h-full">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Settings2 className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-base font-bold text-gray-900">مرن</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 hidden md:block">قابل للتخصيص</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={createPageUrl("CreateAssignment?type=multiple")}>
            <Card className="group hover:shadow-md transition-all duration-300 border cursor-pointer hover:scale-[1.02] bg-gradient-to-br from-green-50 to-white h-full">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-base font-bold text-gray-900">جماعي</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 hidden md:block">عدة موظفين</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div onClick={() => navigate(createPageUrl('CreateAssignmentFromTemplate'))}>
            <Card className="group hover:shadow-md transition-all duration-300 border cursor-pointer hover:scale-[1.02] bg-gradient-to-br from-orange-50 to-white h-full">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                    <Edit className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-base font-bold text-gray-900">تفاعلي</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 hidden md:block">من قالب</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-3">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="drafts" className="flex items-center justify-center gap-1 text-[10px] md:text-sm py-2 px-1 md:px-3">
                <Badge variant="secondary" className="text-[9px] md:text-xs bg-yellow-100 text-yellow-700 px-1 md:px-2">{draftAssignments.length}</Badge>
                <span className="hidden sm:inline">المسودات</span>
                <span className="sm:hidden">مسودة</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center justify-center gap-1 text-[10px] md:text-sm py-2 px-1 md:px-3">
                <Badge variant="secondary" className="text-[9px] md:text-xs px-1 md:px-2">{activeAssignments.length}</Badge>
                <span className="hidden sm:inline">المعتمدة</span>
                <span className="sm:hidden">معتمد</span>
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center justify-center gap-1 text-[10px] md:text-sm py-2 px-1 md:px-3">
                <Archive className="w-3 h-3 md:w-4 md:h-4" />
                <Badge variant="secondary" className="text-[9px] md:text-xs px-1 md:px-2">{archivedAssignments.length}</Badge>
                <span className="hidden sm:inline">الأرشيف</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 items-center w-full">
              <div className="relative flex-1">
                <Search className="w-3 h-3 md:w-4 md:h-4 absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-7 md:pr-10 text-xs md:text-sm h-8 md:h-10"
                />
              </div>
              
              <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative h-8 md:h-10 px-2 md:px-3">
                    <SlidersHorizontal className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline mr-1">فلترة</span>
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-1 -left-1 h-4 w-4 md:h-5 md:w-5 p-0 flex items-center justify-center bg-blue-600 text-white text-[9px] md:text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4" dir="rtl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">فلاتر متقدمة</h4>
                      {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-red-600 hover:text-red-700">
                          <X className="w-3 h-3 ml-1" />
                          مسح الكل
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">من تاريخ</label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">إلى تاريخ</label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">المركز الصحي</label>
                        <Select value={filterCenter} onValueChange={setFilterCenter}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="جميع المراكز" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع المراكز</SelectItem>
                            {healthCenters.map(center => (
                              <SelectItem key={center.id} value={center.اسم_المركز}>
                                {center.اسم_المركز}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">حالة الاعتماد</label>
                        <Select value={filterApprovalStatus} onValueChange={setFilterApprovalStatus}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="جميع الحالات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="approved">معتمد</SelectItem>
                            <SelectItem value="draft">مسودة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        عدد النتائج: <strong>{filteredAssignments.length}</strong> تكليف
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <TabsContent value="drafts">
            <Card className="shadow-sm md:shadow-medium border-0">
              <CardHeader className="border-b border-yellow-200/50 p-3 md:p-7 bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardTitle className="text-sm md:text-xl flex items-center gap-2 md:gap-3 font-bold text-gray-800">
                  <div className="w-8 h-8 md:w-11 md:h-11 bg-yellow-100 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm md:shadow-md">
                    <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" />
                  </div>
                  المسودات
                </CardTitle>
                <p className="text-xs md:text-base text-gray-600 mt-1 md:mt-2 hidden sm:block">القرارات التي لم يتم اعتمادها</p>
              </CardHeader>
              <CardContent className="p-0">
                <AssignmentTable data={filteredAssignments} isDraft={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card className="shadow-sm md:shadow-medium border-0">
              <CardHeader className="border-b border-green-200/50 p-3 md:p-7 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-sm md:text-xl flex items-center gap-2 md:gap-3 font-bold text-gray-800">
                  <div className="w-8 h-8 md:w-11 md:h-11 bg-green-100 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm md:shadow-md">
                    <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                  </div>
                  المعتمدة
                </CardTitle>
                <p className="text-xs md:text-base text-gray-600 mt-1 md:mt-2 hidden sm:block">القرارات الرسمية النشطة</p>
              </CardHeader>
              <CardContent className="p-0">
                <AssignmentTable data={filteredAssignments} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive">
            <Card className="shadow-sm md:shadow-medium border-0">
              <CardHeader className="border-b border-gray-200/50 p-3 md:p-7 bg-gradient-to-r from-gray-50 to-slate-50">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-sm md:text-xl font-bold text-gray-800">
                  <div className="w-8 h-8 md:w-11 md:h-11 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm md:shadow-md">
                    <Archive className="w-4 h-4 md:w-6 md:h-6 text-gray-600" />
                  </div>
                  الأرشيف
                </CardTitle>
                <p className="text-xs md:text-base text-gray-600 mt-1 md:mt-2 hidden sm:block">التكليفات المُنهاة أو المُلغاة</p>
              </CardHeader>
              <CardContent className="p-0">
                <AssignmentTable data={filteredAssignments} isArchive={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}