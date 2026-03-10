import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Search, Copy, Printer, X, UserPlus, Download, User, Sparkles, Loader2, FileText, Send, FileCode, FileOutput, Stamp, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllEmployeeRoles } from '@/components/utils/employeeRoles';
import useLogoSettings from '@/components/settings/useLogoSettings';
import ReportPreviewDialog from '@/components/employee_data/ReportPreviewDialog';

const availableFields = [
  { key: 'full_name_arabic', label: 'الاسم الكامل', default: true },
  { key: 'رقم_الهوية', label: 'رقم الهوية', default: true },
  { key: 'رقم_الموظف', label: 'الرقم الوظيفي', default: true },
  { key: 'position', label: 'التخصص', default: true },
  { key: 'المركز_الصحي', label: 'جهة العمل', default: true },
  { key: 'phone', label: 'رقم الجوال', default: false },
  { key: 'email', label: 'البريد الإلكتروني', default: false },
  { key: 'nationality', label: 'الجنسية', default: false },
  { key: 'gender', label: 'الجنس', default: false },
  { key: 'birth_date', label: 'تاريخ الميلاد', default: false },
  { key: 'hire_date', label: 'تاريخ التوظيف', default: false },
  { key: 'contract_type', label: 'نوع العقد', default: false },
  { key: 'qualification', label: 'المؤهل', default: false },
  { key: 'job_category', label: 'ملاك الوظيفة', default: false },
  { key: 'الأدوار', label: 'الأدوار', default: false },
  { key: 'جهة_التكليف', label: 'جهة التكليف', default: false },
  { key: 'فترة_التكليف', label: 'فترة التكليف', default: false },
];

const HEALTH_CENTERS_OPTIONS = [
  'الحسو', 'هدبان', 'صخيبرة', 'طلال', 'الماوية', 'بلغة', 'الهميج', 'بطحي'
];

export default function EmployeeDataRequest() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeManagers, setEmployeeManagers] = useState({});
  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter(f => f.default).map(f => f.key)
  );
  const [displayMode, setDisplayMode] = useState('normal');
  const [open, setOpen] = useState(false);
  const [managerSelectOpen, setManagerSelectOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyManagers, setShowOnlyManagers] = useState(true);
  const [healthCenters, setHealthCenters] = useState([]);

  // حالة الذكاء الاصطناعي
  const [aiMode, setAiMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [finalRequest, setFinalRequest] = useState('');
  const [reportNarrative, setReportNarrative] = useState('');
  const [reportTitle, setReportTitle] = useState('تقرير بيانات الموظفين');
  const [narrativePosition, setNarrativePosition] = useState('before'); // before or after
  const [showSignature, setShowSignature] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState('');
  const [assignmentCenters, setAssignmentCenters] = useState({});
  // مجموعات التكليف - كل مجموعة لها فترة وموظفين
  const [assignmentGroups, setAssignmentGroups] = useState([
    { id: 1, fromDate: '', toDate: '', dateType: 'hijri', employeeIds: [] }
  ]);
  const [logoPosition, setLogoPosition] = useState('center');
  const [signaturePosition, setSignaturePosition] = useState('center');
  const [signerName, setSignerName] = useState('عبدالمجيد سعود الربيقي');
  const [signerTitle, setSignerTitle] = useState('المساعد لشؤون المراكز الصحية بالحسو');
  const [showPreview, setShowPreview] = useState(false);
  const { logoSettings } = useLogoSettings();

  useEffect(() => {
    loadEmployees();
    loadHealthCenters();
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    const sigs = await base44.entities.StampSignature.filter({ is_active: true });
    setSignatures(Array.isArray(sigs) ? sigs : []);
  };

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Employee.list('-updated_date', 1000);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealthCenters = async () => {
    try {
      const centers = await base44.entities.HealthCenter.list();
      setHealthCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading health centers:', error);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(emp =>
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.includes(query) ||
      emp.رقم_الهوية?.includes(query)
    );
  }, [employees, searchQuery]);

  const filteredManagerEmployees = useMemo(() => {
    let managersList = employees;
    
    if (showOnlyManagers) {
      managersList = employees.filter(emp => {
        const hasManagerRole = emp.special_roles && 
                              Array.isArray(emp.special_roles) && 
                              emp.special_roles.some(role => 
                                role && role.includes('مدير')
                              );
        
        const hasManagerInPosition = emp.position && 
                                     emp.position.includes('مدير');
        
        const hasRoleInCenter = healthCenters.some(center => 
          center.المدير === emp.id || 
          center.نائب_المدير === emp.id ||
          center.المشرف_الفني === emp.id
        );
        
        return hasManagerRole || hasManagerInPosition || hasRoleInCenter;
      });
    }
    
    if (!managerSearchQuery) return managersList;
    
    const query = managerSearchQuery.toLowerCase();
    return managersList.filter(emp =>
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.includes(query) ||
      emp.رقم_الهوية?.includes(query) ||
      emp.المركز_الصحي?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query)
    );
  }, [employees, managerSearchQuery, showOnlyManagers, healthCenters]);

  const handleAnalyzeText = async () => {
    if (!rawText.trim()) {
      alert('الرجاء إدخال النص المراد تحليله');
      return;
    }

    setIsAnalyzing(true);
    setExtractedData(null);
    setFinalRequest('');
    setSelectedEmployees([]);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لاستخلاص البيانات من النصوص العربية.
        
النص التالي يحتوي على طلب متعلق بموظف أو عدة موظفين:
"${rawText}"

يرجى استخلاص وإرجاع البيانات التالية بتنسيق JSON:
1. أسماء الموظفين المذكورين (إن وجدوا)
2. ملخص واضح ومختصر للطلب
3. نوع الطلب (مثل: تحديث بيانات، إضافة لدورة، نقل، إجازة، إلخ)
4. أي تفاصيل إضافية مهمة

مثال للإخراج المطلوب:
{
  "employee_names": ["اسم الموظف"],
  "request_summary": "ملخص الطلب بشكل واضح ومهني",
  "request_type": "نوع الطلب",
  "details": "تفاصيل إضافية مهمة"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            employee_names: {
              type: "array",
              items: { type: "string" },
              description: "قائمة بأسماء الموظفين المذكورين"
            },
            request_summary: {
              type: "string",
              description: "ملخص واضح ومختصر للطلب"
            },
            request_type: {
              type: "string",
              description: "نوع الطلب"
            },
            details: {
              type: "string",
              description: "تفاصيل إضافية"
            }
          }
        }
      });

      const data = response;
      setExtractedData(data);

      // البحث عن الموظفين المذكورين تلقائياً
      if (data.employee_names && data.employee_names.length > 0) {
        const foundEmployees = [];
        data.employee_names.forEach(name => {
          const employee = employees.find(emp => 
            emp.full_name_arabic?.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(emp.full_name_arabic?.toLowerCase())
          );
          if (employee && !foundEmployees.find(e => e.id === employee.id)) {
            foundEmployees.push(employee);
          }
        });
        
        if (foundEmployees.length > 0) {
          setSelectedEmployees(foundEmployees);
        }
      }

      // إنشاء نص الطلب النهائي
      setFinalRequest(data.request_summary || '');

    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('حدث خطأ أثناء تحليل النص. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddEmployee = (employee) => {
    if (!selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
    setOpen(false);
    setSearchQuery('');
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(selectedEmployees.filter(e => e.id !== employeeId));
    const newManagers = { ...employeeManagers };
    delete newManagers[employeeId];
    setEmployeeManagers(newManagers);
  };

  const handleSelectManager = (employeeId, managerId) => {
    setEmployeeManagers(prev => ({
      ...prev,
      [employeeId]: managerId
    }));
    setManagerSelectOpen(null);
    setManagerSearchQuery('');
  };

  const toggleField = (fieldKey) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(k => k !== fieldKey));
    } else {
      setSelectedFields([...selectedFields, fieldKey]);
    }
  };

  const getManagerWithCenters = (managerId, employeeIds) => {
    const manager = employees.find(e => e.id === managerId);
    if (!manager) return null;

    const centers = employeeIds
      .map(empId => {
        const emp = selectedEmployees.find(e => e.id === empId);
        return emp?.المركز_الصحي;
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

    const centersWithTitle = centers.map(center => `مدير ${center}`).join(' - ');
    const managerRoles = getAllEmployeeRoles(manager, healthCenters);
    const rolesList = managerRoles.map(r => r.role).join(', ');

    return {
      ...manager,
      المركز_الصحي: centersWithTitle,
      الأدوار: rolesList
    };
  };

  const groupedByManager = useMemo(() => {
    const groups = {};
    selectedEmployees.forEach(emp => {
      const managerId = employeeManagers[emp.id];
      if (managerId) {
        if (!groups[managerId]) {
          groups[managerId] = [];
        }
        groups[managerId].push(emp.id);
      }
    });
    return groups;
  }, [selectedEmployees, employeeManagers]);

  const copyTableToClipboard = async () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    );

    // إنشاء الجدول كـ HTML للنسخ بشكل أفضل
    let htmlTable = '<table dir="rtl" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">';
    htmlTable += '<thead><tr style="background-color: #f3f4f6;">';
    headers.forEach(header => {
      htmlTable += `<th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${header}</th>`;
    });
    htmlTable += '</tr></thead><tbody>';

    if (displayMode === 'normal') {
      selectedEmployees.forEach((emp, idx) => {
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9fafb';
        htmlTable += `<tr style="background-color: ${bgColor};">`;
        selectedFields.forEach(key => {
          htmlTable += `<td style="border: 1px solid #000; padding: 8px; text-align: center;">${emp[key] || '-'}</td>`;
        });
        htmlTable += '</tr>';
      });
    } else {
      selectedEmployees.forEach(emp => {
        htmlTable += '<tr style="background-color: #dbeafe;">';
        selectedFields.forEach(key => {
          htmlTable += `<td style="border: 1px solid #000; padding: 8px; text-align: center;">${emp[key] || '-'}</td>`;
        });
        htmlTable += '</tr>';
      });

      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            htmlTable += `<tr style="background-color: #d1fae5;"><td colspan="${selectedFields.length}" style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">بيانات المدير المباشر</td></tr>`;
            htmlTable += '<tr style="background-color: #ecfdf5;">';
            selectedFields.forEach(key => {
              htmlTable += `<td style="border: 1px solid #000; padding: 8px; text-align: center;">${manager[key] || '-'}</td>`;
            });
            htmlTable += '</tr>';
            processedManagers.add(managerId);
          }
        }
      });
    }

    htmlTable += '</tbody></table>';

    // النص العادي للنسخ كبديل
    let plainText = headers.join('\t') + '\n';
    if (displayMode === 'normal') {
      plainText += selectedEmployees.map(emp =>
        selectedFields.map(key => emp[key] || '-').join('\t')
      ).join('\n');
    } else {
      selectedEmployees.forEach(emp => {
        plainText += selectedFields.map(key => emp[key] || '-').join('\t') + '\n';
      });
      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            plainText += 'بيانات المدير المباشر\n';
            plainText += selectedFields.map(key => manager[key] || '-').join('\t') + '\n';
            processedManagers.add(managerId);
          }
        }
      });
    }

    // تنسيق الطلب النهائي
    const requestText = finalRequest ? `\n\n${finalRequest}` : '';
    const fullPlainText = `بعد التحية\n\n${plainText}${requestText}`;
    const fullHtml = `<div dir="rtl" style="font-family: Arial, sans-serif;"><p style="font-weight: bold;">بعد التحية</p><br/>${htmlTable}<br/>${finalRequest ? `<p>${finalRequest}</p><br/>` : ''}</div>`;

    try {
      // محاولة نسخ كـ HTML و نص عادي معاً
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([fullHtml], { type: 'text/html' }),
        'text/plain': new Blob([fullPlainText], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
      alert('تم نسخ الطلب والجدول بنجاح! يمكنك الآن لصقها في Word أو Excel وسيظهر الجدول بشكل صحيح.');
    } catch (err) {
      // في حال فشل نسخ HTML، نستخدم النص العادي فقط
      try {
        await navigator.clipboard.writeText(fullPlainText);
        alert('تم نسخ النص! (استخدم التصدير لـ Excel للحصول على جدول منسق)');
      } catch (e) {
        console.error('Failed to copy:', e);
        alert('فشل النسخ. يرجى المحاولة مرة أخرى');
      }
    }
  };

  const exportToCSV = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    ).join(',');

    let csvContent = "\ufeff" + headers + '\n';

    if (displayMode === 'normal') {
      const rows = selectedEmployees.map(emp =>
        selectedFields.map(key => `"${emp[key] || ''}"`.replace(/"/g, '""')).join(',')
      ).join('\n');
      csvContent += rows;
    } else {
      const rows = [];
      selectedEmployees.forEach(emp => {
        rows.push(selectedFields.map(key => `"${emp[key] || ''}"`.replace(/"/g, '""')).join(','));
      });

      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            rows.push('"بيانات المدير المباشر"' + ','.repeat(selectedFields.length - 1));
            rows.push(selectedFields.map(key => `"${manager[key] || ''}"`.replace(/"/g, '""')).join(','));
            processedManagers.add(managerId);
          }
        }
      });

      csvContent += rows.join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `بيانات_الموظفين_${new Date().toLocaleDateString('ar-SA')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToHTML = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    );

    let tableRows = '';
    if (displayMode === 'normal') {
      selectedEmployees.forEach((emp, idx) => {
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9fafb';
        tableRows += `<tr style="background-color: ${bgColor};">`;
        selectedFields.forEach(key => {
          tableRows += `<td style="border: 1px solid #000; padding: 8px 16px; text-align: center;">${emp[key] || '-'}</td>`;
        });
        tableRows += '</tr>';
      });
    } else {
      selectedEmployees.forEach(emp => {
        tableRows += '<tr style="background-color: #dbeafe;">';
        selectedFields.forEach(key => {
          tableRows += `<td style="border: 1px solid #000; padding: 8px 16px; text-align: center;">${emp[key] || '-'}</td>`;
        });
        tableRows += '</tr>';
      });

      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            tableRows += `<tr style="background-color: #d1fae5;"><td colspan="${selectedFields.length}" style="border: 1px solid #000; padding: 8px 16px; text-align: center; font-weight: bold;">بيانات المدير المباشر</td></tr>`;
            tableRows += '<tr style="background-color: #ecfdf5;">';
            selectedFields.forEach(key => {
              tableRows += `<td style="border: 1px solid #000; padding: 8px 16px; text-align: center;">${manager[key] || '-'}</td>`;
            });
            tableRows += '</tr>';
            processedManagers.add(managerId);
          }
        }
      });
    }

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب بيانات الموظفين</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    body { font-family: 'Cairo', sans-serif; padding: 30px; background: #f8fafc; color: #000; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h2 { text-align: center; color: #1e40af; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background-color: #f3f4f6; border: 1px solid #000; padding: 12px 16px; text-align: center; font-weight: bold; }
    td { border: 1px solid #000; padding: 8px 16px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .request-text { background: #fef3c7; border: 2px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
    .closing { margin-top: 30px; }
    .closing p { margin: 10px 0; font-size: 16px; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <p class="greeting">بعد التحية</p>
    
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    
    ${finalRequest ? `<div class="request-text">${finalRequest}</div>` : ''}
    
    <div class="closing">
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `طلب_بيانات_الموظفين_${new Date().toLocaleDateString('ar-SA')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getFieldValue = (emp, key) => {
    if (key === 'جهة_التكليف') {
      const center = assignmentCenters[emp.id];
      return center ? `مركز ${center}` : '-';
    }
    if (key === 'فترة_التكليف') {
      // إذا مجموعة واحدة بدون تحديد موظفين → تشمل الجميع
      const group = assignmentGroups.find(g => {
        if (g.employeeIds.length > 0) return g.employeeIds.includes(emp.id);
        if (assignmentGroups.length === 1) return true;
        return false;
      });
      if (!group || (!group.fromDate && !group.toDate)) return '-';
      const suffix = group.dateType === 'hijri' ? 'هـ' : 'م';
      return `من ${group.fromDate || '...'} إلى ${group.toDate || '...'} ${suffix}`;
    }
    if (key === 'المركز_الصحي') {
      const val = emp[key] || '-';
      return val !== '-' ? val.replace(/\s*صحي\s*/g, ' ').trim() : '-';
    }
    return emp[key] || '-';
  };

  const exportAsReport = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    );

    const hasAssignmentCol = selectedFields.includes('فترة_التكليف');
    const otherFieldsExport = selectedFields.filter(k => k !== 'فترة_التكليف');

    const buildMergedRows = (empList, bgFn) => {
      let html = '';
      if (!hasAssignmentCol || !assignmentGroups || assignmentGroups.length === 0) {
        empList.forEach((emp, idx) => {
          const bg = bgFn ? bgFn(idx) : (idx % 2 === 0 ? '#fff' : '#f9fafb');
          html += `<tr style="background-color: ${bg};">`;
          selectedFields.forEach(key => {
            html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(emp, key)}</td>`;
          });
          html += '</tr>';
        });
        return html;
      }

      const grouped = [];
      const usedIds = new Set();
      assignmentGroups.forEach(group => {
        const ids = group.employeeIds.length > 0 ? group.employeeIds : (assignmentGroups.length === 1 ? empList.map(e => e.id) : []);
        const grpEmps = empList.filter(e => ids.includes(e.id));
        if (grpEmps.length > 0) {
          grouped.push({ group, employees: grpEmps });
          grpEmps.forEach(e => usedIds.add(e.id));
        }
      });
      const ungrouped = empList.filter(e => !usedIds.has(e.id));
      if (ungrouped.length > 0) grouped.push({ group: null, employees: ungrouped });

      let globalIdx = 0;
      grouped.forEach(({ group, employees: grpEmps }) => {
        grpEmps.forEach((emp, localIdx) => {
          const bg = bgFn ? bgFn(globalIdx) : (globalIdx % 2 === 0 ? '#fff' : '#f9fafb');
          html += `<tr style="background-color: ${bg};">`;
          otherFieldsExport.forEach(key => {
            html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(emp, key)}</td>`;
          });
          if (localIdx === 0) {
            const periodText = group && (group.fromDate || group.toDate)
              ? `من ${group.fromDate || '...'} إلى ${group.toDate || '...'} ${group.dateType === 'hijri' ? 'هـ' : 'م'}`
              : '-';
            html += `<td rowspan="${grpEmps.length}" style="border: 1px solid #d1d5db; padding: 4px; text-align: center; font-size: 12px; font-weight: bold; writing-mode: vertical-lr; text-orientation: mixed; white-space: nowrap; background-color: #fff; min-width: 30px; letter-spacing: 1px;">${periodText}</td>`;
          }
          html += '</tr>';
          globalIdx++;
        });
      });
      return html;
    };

    let tableRows = '';
    if (displayMode === 'normal') {
      tableRows = buildMergedRows(selectedEmployees);
    } else {
      tableRows = buildMergedRows(selectedEmployees, () => '#dbeafe');
      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            tableRows += `<tr style="background-color: #d1fae5;"><td colspan="${selectedFields.length}" style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-weight: bold;">بيانات المدير المباشر</td></tr>`;
            tableRows += '<tr style="background-color: #ecfdf5;">';
            selectedFields.forEach(key => {
              tableRows += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px;">${getFieldValue(manager, key)}</td>`;
            });
            tableRows += '</tr>';
            processedManagers.add(managerId);
          }
        }
      });
    }

    const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const selectedSig = showSignature && selectedSignatureId ? signatures.find(s => s.id === selectedSignatureId) : null;

    const processNarrativeHtml = (text) => {
      if (!text) return '';
      const lines = text.split('\n');
      const processedLines = lines.map(line => {
        const keywords = ['سعادة', 'المكرم', 'المكرمة', 'مدير', 'إدارة', 'الإدارة', 'دائرة', 'الدائرة', 'قسم', 'القسم'];
        const hasKeyword = keywords.some(kw => line.includes(kw));
        if (hasKeyword) {
          return `<span class="narrative-bold">${line}</span>`;
        }
        return line;
      });
      return processedLines.join('\n');
    };
    const narrativeHtml = reportNarrative ? `<div class="narrative-box">${processNarrativeHtml(reportNarrative)}</div>` : '';

    const logoJustify = logoPosition === 'right' ? 'flex-end' : logoPosition === 'left' ? 'flex-start' : 'center';
    const sigAlign = signaturePosition === 'right' ? 'right' : signaturePosition === 'left' ? 'left' : 'center';

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=PT+Sans+Caption:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', sans-serif; background: #fff; color: #000; }
    @page { size: A4; margin: 5mm 15mm 15mm 15mm; }
    .page-container { max-width: 210mm; margin: 0 auto; padding: 0 10px; min-height: 100vh; display: flex; flex-direction: column; }
    .page-content { flex: 1; padding-top: 15px; }
    .header-banner { border-bottom: 2px solid #0284c7; padding: 0 0 8px; margin-bottom: 15px; overflow: hidden; display: flex; justify-content: ${logoJustify}; align-items: center; }
    .header-banner img { max-height: ${logoSettings.max_height}px; margin: ${logoSettings.margin_top}px 0 ${logoSettings.margin_bottom}px 0; display: block; }
    .report-title { text-align: center; margin-bottom: 20px; margin-top: 10px; }
    .report-title h1 { font-size: 22px; color: #0d9488; font-weight: 700; margin-bottom: 6px; }
    .narrative-box { background: #fff; border: none; border-radius: 0; padding: 10px 0; margin-bottom: 20px; font-size: 15px; line-height: 1.9; white-space: pre-wrap; font-weight: 600; }
    .narrative-bold { font-family: 'PT Sans Caption', 'Cairo', sans-serif; font-weight: 900; font-size: 16px; display: block; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #bae6fd; color: #000; border: 1px solid #d1d5db; padding: 10px 12px; text-align: center; font-weight: 700; font-size: 13px; }
    td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: center; font-size: 13px; }
    .request-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
    .signature-section { text-align: ${sigAlign}; margin-top: 30px; padding: 15px 0; }
    .signature-section .sig-name { font-weight: 900; font-size: 18px; margin-top: 8px; color: #000; }
    .signature-section .sig-title { font-weight: 700; font-size: 15px; color: #000; margin-top: 0; }
    .signature-section img { max-height: 120px; ${sigAlign === 'center' ? 'margin: 0 auto;' : ''} display: block; margin-top: -2px; mix-blend-mode: multiply; }
    .footer-banner { text-align: center; padding-top: 15px; border-top: 2px solid #0284c7; margin-top: auto; }
    .footer-banner p { margin: 4px 0; font-size: 14px; color: #0d9488; }
    .footer-banner .main-text { font-weight: bold; color: #0d9488; font-size: 15px; }
    .footer-banner .date-text { font-size: 11px; color: #0d9488; margin-top: 8px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-container { min-height: 100vh; }
      .footer-banner { margin-top: auto; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    ${logoSettings.show_logo && logoSettings.logo_url ? `<div class="header-banner">
      <img src="${logoSettings.logo_url}" alt="شعار المؤسسة" />
    </div>` : ''}

    <div class="page-content">
      <div class="report-title">
        <h1>${reportTitle}</h1>
      </div>

      ${narrativePosition === 'before' ? narrativeHtml : ''}

      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      ${narrativePosition === 'after' ? narrativeHtml : ''}

      ${finalRequest ? `<div class="request-box">${finalRequest}</div>` : ''}

      ${showSignature ? `<div class="signature-section">
        ${signerName ? `<p class="sig-name">${signerName}</p>` : ''}
        ${signerTitle ? `<p class="sig-title">${signerTitle}</p>` : ''}
        ${selectedSig ? `<img src="${selectedSig.image_url}" alt="${selectedSig.name}" />` : ''}
      </div>` : ''}
    </div>

    ${logoSettings.show_footer ? `<div class="footer-banner">
      ${logoSettings.footer_text_1 ? `<p class="main-text">${logoSettings.footer_text_1}</p>` : ''}
      ${logoSettings.footer_text_2 ? `<p>${logoSettings.footer_text_2}</p>` : ''}
      <p class="date-text">${dateStr}</p>
    </div>` : ''}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    // فتح في نافذة جديدة للطباعة/حفظ PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
      };
    }
    
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">طلب بيانات الموظفين الذكي</h1>
          <p className="text-gray-600">استخراج وعرض بيانات الموظفين باستخدام الذكاء الاصطناعي</p>
        </div>

        <Tabs defaultValue={aiMode ? "ai" : "manual"} onValueChange={(v) => setAiMode(v === 'ai')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Search className="w-4 h-4 ml-2" />
              البحث اليدوي
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 ml-2" />
              الاستخلاص الذكي
            </TabsTrigger>
          </TabsList>

          {/* AI Mode */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  الاستخلاص الذكي للبيانات
                </CardTitle>
                <CardDescription>
                  الصق النص الخام وسيقوم الذكاء الاصطناعي باستخلاص المعلومات وإنشاء طلب واضح
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>النص الخام</Label>
                  <Textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="مثال: الرجاء من سعادتكم الرفع لمن يلزم بادراج الممرضة ميجا ناريكال ضمن خطة دورة تقييم الاداء الوظيفي لعام 2025..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleAnalyzeText}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      تحليل واستخلاص البيانات
                    </>
                  )}
                </Button>

                {extractedData && (
                  <div className="space-y-4 mt-6">
                    <Alert className="bg-green-50 border-green-200">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>نوع الطلب:</strong> {extractedData.request_type}
                      </AlertDescription>
                    </Alert>

                    {extractedData.employee_names && extractedData.employee_names.length > 0 && (
                      <div>
                        <Label>الموظفون المستخلصون</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {extractedData.employee_names.map((name, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {finalRequest && (
                      <div>
                        <Label>نص الطلب النهائي</Label>
                        <Textarea
                          value={finalRequest}
                          onChange={(e) => setFinalRequest(e.target.value)}
                          rows={4}
                          className="mt-2 bg-yellow-50 border-yellow-200"
                        />
                      </div>
                    )}

                    {extractedData.details && (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          <strong>تفاصيل إضافية:</strong> {extractedData.details}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Mode */}
          <TabsContent value="manual">
            <Card className="no-print">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  البحث عن الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اختر الموظفين</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {selectedEmployees.length > 0
                            ? `تم اختيار ${selectedEmployees.length} موظف`
                            : "ابحث عن موظف..."}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="ابحث بالاسم أو الرقم الوظيفي..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandEmpty>لا يوجد موظفين.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {filteredEmployees.map((emp) => (
                            <CommandItem
                              key={emp.id}
                              onSelect={() => handleAddEmployee(emp)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{emp.full_name_arabic}</div>
                                <div className="text-xs text-gray-500">
                                  {emp.رقم_الموظف} • {emp.position}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Employees & Rest of the UI */}
        {selectedEmployees.length > 0 && (
          <Card className="no-print">
            <CardHeader>
              <CardTitle>الموظفون المختارون ({selectedEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.map(emp => (
                  <Badge key={emp.id} variant="secondary" className="gap-1">
                    {emp.full_name_arabic}
                    <button
                      onClick={() => handleRemoveEmployee(emp.id)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Display Mode Selection */}
              <div>
                <Label>نمط العرض</Label>
                <RadioGroup value={displayMode} onValueChange={setDisplayMode} className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer">عرض عادي</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="with-manager" id="with-manager" />
                    <Label htmlFor="with-manager" className="cursor-pointer">عرض الموظف مع مديره المباشر</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Manager Selection */}
              {displayMode === 'with-manager' && selectedEmployees.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>تحديد المدير المباشر لكل موظف</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id="showOnlyManagers"
                        checked={showOnlyManagers}
                        onCheckedChange={() => setShowOnlyManagers(!showOnlyManagers)}
                      />
                      <Label htmlFor="showOnlyManagers" className="cursor-pointer text-xs text-gray-600">
                        إظهار المدراء فقط ({filteredManagerEmployees.length})
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    {selectedEmployees.map(emp => {
                      const managerId = employeeManagers[emp.id];
                      const manager = managerId ? employees.find(e => e.id === managerId) : null;

                      return (
                        <div key={emp.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <span className="text-sm flex-1">{emp.full_name_arabic}</span>
                          <Popover open={managerSelectOpen === emp.id} onOpenChange={(isOpen) => setManagerSelectOpen(isOpen ? emp.id : null)}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="w-[200px] justify-start">
                                <User className="w-3 h-3 ml-1" />
                                {manager ? manager.full_name_arabic : 'اختر المدير'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="ابحث عن المدير..."
                                  value={managerSearchQuery}
                                  onValueChange={setManagerSearchQuery}
                                />
                                <CommandEmpty>
                                  <div className="p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-2">لا يوجد نتائج</p>
                                    {showOnlyManagers && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setShowOnlyManagers(false)}
                                      >
                                        إظهار جميع الموظفين
                                      </Button>
                                    )}
                                  </div>
                                </CommandEmpty>
                                <CommandGroup className="max-h-[250px] overflow-y-auto">
                                  {filteredManagerEmployees.filter(e => e.id !== emp.id).map((mgr) => (
                                    <CommandItem
                                      key={mgr.id}
                                      onSelect={() => handleSelectManager(emp.id, mgr.id)}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{mgr.full_name_arabic}</div>
                                        <div className="text-xs text-gray-500">
                                          {mgr.position} • {mgr.المركز_الصحي}
                                        </div>
                                        {mgr.special_roles && mgr.special_roles.length > 0 && (
                                          <div className="flex gap-1 mt-1">
                                            {mgr.special_roles.filter(r => r && r.includes('مدير')).map((role, idx) => (
                                              <Badge key={idx} variant="secondary" className="text-xs py-0">
                                                {role}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Field Selection */}
              <div>
                <Label>البيانات المراد عرضها</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableFields.map(field => (
                    <div key={field.key} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={field.key}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={() => toggleField(field.key)}
                      />
                      <Label htmlFor={field.key} className="cursor-pointer text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* عنوان التقرير */}
              <div>
                <Label>عنوان التقرير الرسمي</Label>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="تقرير بيانات الموظفين"
                  className="mt-2 font-bold"
                />
              </div>

              {/* نص تعبيري للتقرير */}
              <div>
                <Label>نص تعبيري للتقرير (اختياري)</Label>
                <Textarea
                  value={reportNarrative}
                  onChange={(e) => setReportNarrative(e.target.value)}
                  placeholder="مثال: بيان بأسماء الموظفين المكلفين خلال إجازة عيد الفطر المبارك لعام 1446هـ..."
                  rows={3}
                  className="mt-2"
                />
                <div className="flex items-center gap-4 mt-2">
                  <Label className="text-xs text-gray-500">موقع النص:</Label>
                  <RadioGroup value={narrativePosition} onValueChange={setNarrativePosition} className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="before" id="narr-before" />
                      <Label htmlFor="narr-before" className="cursor-pointer text-xs">قبل الجدول</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="after" id="narr-after" />
                      <Label htmlFor="narr-after" className="cursor-pointer text-xs">بعد الجدول</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* جهة التكليف لكل موظف */}
              {selectedFields.includes('جهة_التكليف') && (
                <div className="space-y-3">
                  <Label>تحديد جهة التكليف لكل موظف</Label>
                  <div className="space-y-2">
                    {selectedEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <span className="text-sm flex-1">{emp.full_name_arabic}</span>
                        <Select
                          value={assignmentCenters[emp.id] || ''}
                          onValueChange={(val) => setAssignmentCenters(prev => ({ ...prev, [emp.id]: val }))}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="اختر المركز" />
                          </SelectTrigger>
                          <SelectContent>
                            {HEALTH_CENTERS_OPTIONS.map(center => (
                              <SelectItem key={center} value={`${center}`}>مركز {center}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* مجموعات فترة التكليف */}
              {selectedFields.includes('فترة_التكليف') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>مجموعات فترة التكليف</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAssignmentGroups(prev => [...prev, { id: Date.now(), fromDate: '', toDate: '', dateType: 'hijri', employeeIds: [] }])}
                    >
                      + إضافة مجموعة
                    </Button>
                  </div>
                  {assignmentGroups.map((group, gIdx) => (
                    <div key={group.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">المجموعة {gIdx + 1}</span>
                        {assignmentGroups.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-500 h-6 px-2"
                            onClick={() => setAssignmentGroups(prev => prev.filter(g => g.id !== group.id))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <Select
                          value={group.dateType}
                          onValueChange={(val) => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, dateType: val } : g))}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hijri">هجري</SelectItem>
                            <SelectItem value="gregorian">ميلادي</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-bold">من:</Label>
                          {group.dateType === 'gregorian' ? (
                            <Input type="date" value={group.fromDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, fromDate: e.target.value } : g))} className="w-40" />
                          ) : (
                            <Input type="text" placeholder="مثال: 1446/10/01" value={group.fromDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, fromDate: e.target.value } : g))} className="w-40" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-bold">إلى:</Label>
                          {group.dateType === 'gregorian' ? (
                            <Input type="date" value={group.toDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, toDate: e.target.value } : g))} className="w-40" />
                          ) : (
                            <Input type="text" placeholder="مثال: 1446/10/15" value={group.toDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, toDate: e.target.value } : g))} className="w-40" />
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">اختر الموظفين لهذه المجموعة:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployees.map(emp => {
                            const isInGroup = group.employeeIds.includes(emp.id);
                            const isInOtherGroup = assignmentGroups.some(g => g.id !== group.id && g.employeeIds.includes(emp.id));
                            return (
                              <Badge
                                key={emp.id}
                                variant={isInGroup ? "default" : "outline"}
                                className={`cursor-pointer text-xs ${isInGroup ? 'bg-blue-600' : isInOtherGroup ? 'opacity-40' : 'hover:bg-blue-50'}`}
                                onClick={() => {
                                  if (isInOtherGroup) return;
                                  setAssignmentGroups(prev => prev.map(g => {
                                    if (g.id !== group.id) return g;
                                    return {
                                      ...g,
                                      employeeIds: isInGroup
                                        ? g.employeeIds.filter(id => id !== emp.id)
                                        : [...g.employeeIds, emp.id]
                                    };
                                  }));
                                }}
                              >
                                {emp.full_name_arabic}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* إعدادات الشعار */}
              <div>
                <Label className="text-xs text-gray-500">موقع الشعار:</Label>
                <RadioGroup value={logoPosition} onValueChange={setLogoPosition} className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="right" id="logo-right" />
                    <Label htmlFor="logo-right" className="cursor-pointer text-xs">يمين</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="center" id="logo-center" />
                    <Label htmlFor="logo-center" className="cursor-pointer text-xs">وسط</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="left" id="logo-left" />
                    <Label htmlFor="logo-left" className="cursor-pointer text-xs">يسار</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* التوقيع الرسمي */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showSignature"
                    checked={showSignature}
                    onCheckedChange={setShowSignature}
                  />
                  <Label htmlFor="showSignature" className="cursor-pointer flex items-center gap-1 font-bold">
                    <Stamp className="w-4 h-4" />
                    إضافة التوقيع الرسمي
                  </Label>
                </div>
                {showSignature && (
                  <>
                    {signatures.length > 0 && (
                      <Select value={selectedSignatureId} onValueChange={setSelectedSignatureId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر التوقيع / الختم" />
                        </SelectTrigger>
                        <SelectContent>
                          {signatures.map(sig => (
                            <SelectItem key={sig.id} value={sig.id}>
                              {sig.name} - {sig.owner_name || ''} ({sig.type === 'stamp' ? 'ختم' : 'توقيع'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {signatures.length === 0 && (
                      <p className="text-xs text-gray-500">لا توجد أختام مسجلة. سيظهر الاسم فقط.</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">اسم الموقع</Label>
                        <Input value={signerName} onChange={e => setSignerName(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">المسمى الوظيفي</Label>
                        <Input value={signerTitle} onChange={e => setSignerTitle(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">موقع التوقيع:</Label>
                      <RadioGroup value={signaturePosition} onValueChange={setSignaturePosition} className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="right" id="sig-right" />
                          <Label htmlFor="sig-right" className="cursor-pointer text-xs">يمين</Label>
                        </div>
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="center" id="sig-center" />
                          <Label htmlFor="sig-center" className="cursor-pointer text-xs">وسط</Label>
                        </div>
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="left" id="sig-left" />
                          <Label htmlFor="sig-left" className="cursor-pointer text-xs">يسار</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowPreview(true)}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة التقرير
                </Button>
                <Button
                  onClick={exportAsReport}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <FileOutput className="w-4 h-4 ml-2" />
                  تصدير PDF
                </Button>
                <Button
                  onClick={copyTableToClipboard}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ الطلب والجدول
                </Button>
                <Button
                  onClick={exportToCSV}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير Excel
                </Button>
                <Button
                  onClick={exportToHTML}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FileCode className="w-4 h-4 ml-2" />
                  تصدير HTML
                </Button>
                <Button
                  onClick={handlePrint}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  variant="outline"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {selectedEmployees.length > 0 && selectedFields.length > 0 && (
          <Card className="print-area">
            <CardHeader className="print-hide">
              <CardTitle>النتيجة النهائية</CardTitle>
            </CardHeader>
            <CardContent>
              {/* تنسيق الطلب النهائي */}
              <div className="space-y-6">
                {/* بعد التحية */}
                <div className="text-right">
                  <p style={{ color: '#000', fontSize: '18px', fontWeight: '600' }}>بعد التحية</p>
                </div>

                {/* الجدول */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ border: '1px solid #000' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        {selectedFields.map(key => {
                          const field = availableFields.find(f => f.key === key);
                          return (
                            <th
                              key={key}
                              style={{ 
                                border: '1px solid #000',
                                padding: '8px 16px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#000'
                              }}
                            >
                              {field?.label || key}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const hasAssignCol = selectedFields.includes('فترة_التكليف');
                        const otherCols = selectedFields.filter(k => k !== 'فترة_التكليف');

                        const renderMergedRows = (empList, bgFn) => {
                          if (!hasAssignCol || !assignmentGroups || assignmentGroups.length === 0) {
                            return empList.map((emp, idx) => (
                              <tr key={emp.id} style={{ backgroundColor: bgFn ? bgFn(idx) : (idx % 2 === 0 ? '#fff' : '#f9fafb') }}>
                                {selectedFields.map(key => (
                                  <td key={key} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000' }}>
                                    {getFieldValue(emp, key)}
                                  </td>
                                ))}
                              </tr>
                            ));
                          }
                          const grouped = [];
                          const usedIds = new Set();
                          assignmentGroups.forEach(group => {
                            const ids = group.employeeIds.length > 0 ? group.employeeIds : (assignmentGroups.length === 1 ? empList.map(e => e.id) : []);
                            const grpEmps = empList.filter(e => ids.includes(e.id));
                            if (grpEmps.length > 0) { grouped.push({ group, employees: grpEmps }); grpEmps.forEach(e => usedIds.add(e.id)); }
                          });
                          const ungrouped = empList.filter(e => !usedIds.has(e.id));
                          if (ungrouped.length > 0) grouped.push({ group: null, employees: ungrouped });

                          const rows = [];
                          let gi = 0;
                          grouped.forEach(({ group, employees: grpEmps }) => {
                            grpEmps.forEach((emp, li) => {
                              const bg = bgFn ? bgFn(gi) : (gi % 2 === 0 ? '#fff' : '#f9fafb');
                              rows.push(
                                <tr key={emp.id} style={{ backgroundColor: bg }}>
                                  {otherCols.map(key => (
                                    <td key={key} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000' }}>
                                      {getFieldValue(emp, key)}
                                    </td>
                                  ))}
                                  {li === 0 && (
                                    <td
                                      key="فترة_التكليف"
                                      rowSpan={grpEmps.length}
                                      style={{
                                        border: '1px solid #000', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px',
                                        writingMode: 'vertical-lr', textOrientation: 'mixed', whiteSpace: 'nowrap',
                                        backgroundColor: '#fff', minWidth: '32px', letterSpacing: '1px', color: '#000'
                                      }}
                                    >
                                      {group && (group.fromDate || group.toDate)
                                        ? `من ${group.fromDate || '...'} إلى ${group.toDate || '...'} ${group.dateType === 'hijri' ? 'هـ' : 'م'}`
                                        : '-'}
                                    </td>
                                  )}
                                </tr>
                              );
                              gi++;
                            });
                          });
                          return rows;
                        };

                        if (displayMode === 'normal') {
                          return renderMergedRows(selectedEmployees);
                        } else {
                          const empRows = renderMergedRows(selectedEmployees, () => '#dbeafe');
                          const managerRows = [];
                          const processedManagers = new Set();
                          Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
                            if (!processedManagers.has(managerId)) {
                              const manager = getManagerWithCenters(managerId, employeeIds);
                              if (manager) {
                                managerRows.push(
                                  <tr key={`mh-${managerId}`} style={{ backgroundColor: '#d1fae5' }}>
                                    <td colSpan={selectedFields.length} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                                      بيانات المدير المباشر
                                    </td>
                                  </tr>
                                );
                                managerRows.push(
                                  <tr key={`md-${managerId}`} style={{ backgroundColor: '#ecfdf5' }}>
                                    {selectedFields.map(key => (
                                      <td key={key} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000' }}>
                                        {manager[key] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                );
                                processedManagers.add(managerId);
                              }
                            }
                          });
                          return [...empRows, ...managerRows];
                        }
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* نص الطلب */}
                {finalRequest && (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p style={{ color: '#000' }} className="whitespace-pre-wrap leading-relaxed text-right">
                      {finalRequest}
                    </p>
                  </div>
                )}


              </div>
            </CardContent>
          </Card>
        )}

        {selectedEmployees.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {aiMode ? (
                <>
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                  <p className="text-lg">الصق النص المراد تحليله أعلاه واضغط على زر "تحليل واستخلاص البيانات"</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">ابدأ بالبحث واختيار الموظفين لعرض بياناتهم</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* شاشة المعاينة */}
        <ReportPreviewDialog
          open={showPreview}
          onClose={() => setShowPreview(false)}
          onExport={() => { setShowPreview(false); exportAsReport(); }}
          logoSettings={logoSettings}
          logoPosition={logoPosition}
          reportTitle={reportTitle}
          reportNarrative={reportNarrative}
          narrativePosition={narrativePosition}
          headers={selectedFields.map(key => availableFields.find(f => f.key === key)?.label || key)}
          selectedFields={selectedFields}
          selectedEmployees={selectedEmployees}
          displayMode={displayMode}
          getFieldValue={getFieldValue}
          groupedByManager={groupedByManager}
          getManagerWithCenters={getManagerWithCenters}
          finalRequest={finalRequest}
          showSignature={showSignature}
          selectedSig={showSignature && selectedSignatureId ? signatures.find(s => s.id === selectedSignatureId) : null}
          signerName={signerName}
          signerTitle={signerTitle}
          signaturePosition={signaturePosition}
          assignmentGroups={assignmentGroups}
        />
      </div>
    </div>
  );
}