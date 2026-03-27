import React, { useState, useMemo } from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Settings2,
  Eye,
  CheckSquare,
  Square,
  PenLine,
  Building2,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CustomExportManager({ 
  data,
  employees, // إضافة دعم لكلا الاسمين
  allEmployees, // قائمة كل الموظفين لربط المعرفات بالأسماء
  defaultFilename = "تقرير", 
  availableFields,
  type = "employees", // employees, departments, healthcenters
  selectedCount = 0 // عدد المحددين
}) {
  // استخدام data أو employees أيهما متوفر
  const rawData = data || employees || [];

  // دالة للحصول على اسم الموظف من المعرف
  const getEmployeeName = (employeeId) => {
    if (!employeeId || !allEmployees) return '';
    const emp = allEmployees.find(e => e.id === employeeId);
    return emp ? emp.full_name_arabic : employeeId;
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [filename, setFilename] = useState(defaultFilename);
  const [isExporting, setIsExporting] = useState(false);

  // States for custom text
  const [exportTitle, setExportTitle] = useState(defaultFilename);
  const [preambleText, setPreambleText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [dateFormat, setDateFormat] = useState("hijri"); // hijri or gregorian

  // State for selected centers (healthcenters type)
  const [selectedCenterIds, setSelectedCenterIds] = useState([]);
  const [centerSearchQuery, setCenterSearchQuery] = useState("");

  // Get unique centers list for healthcenters type
  const availableCenters = useMemo(() => {
    if (type !== 'healthcenters' || !Array.isArray(rawData)) return [];
    return rawData.map(c => ({ id: c.id, name: c.اسم_المركز || 'غير محدد' }));
  }, [rawData, type]);

  // Filter centers by search
  const filteredCenters = useMemo(() => {
    if (!centerSearchQuery) return availableCenters;
    return availableCenters.filter(c => 
      c.name.toLowerCase().includes(centerSearchQuery.toLowerCase())
    );
  }, [availableCenters, centerSearchQuery]);

  // Filtered export data based on selected centers
  const exportData = useMemo(() => {
    if (type !== 'healthcenters' || selectedCenterIds.length === 0) return rawData;
    return rawData.filter(item => selectedCenterIds.includes(item.id));
  }, [rawData, selectedCenterIds, type]);

  // تعريف الحقول المتاحة حسب النوع
  const fieldDefinitions = useMemo(() => {
    switch(type) {
      case 'employees':
        return {
          'full_name_arabic': 'الاسم بالعربية',
          'full_name_english': 'الاسم بالإنجليزية',
          'رقم_الموظف': 'الرقم الوظيفي',
          'رقم_الهوية': 'رقم الهوية',
          'age': 'العمر',
          'email': 'البريد الإلكتروني',
          'phone': 'رقم الجوال',
          'المركز_الصحي': 'المركز الصحي',
          'position': 'التخصص',
          'department': 'القسم',
          'job_category': 'ملاك الوظيفة',
          'job_category_type': 'فئة الوظيفة',
          'scfhs_classification': 'تصنيف الهيئة',
          'qualification': 'المؤهل',
          'rank': 'المرتبة',
          'sequence': 'التسلسل',
          'contract_type': 'نوع العقد',
          'contract_end_date': 'تاريخ نهاية العقد (ميلادي)',
          'contract_end_date_hijri': 'تاريخ نهاية العقد (هجري)',
          'gender': 'الجنس',
          'nationality': 'الجنسية',
          'hire_date': 'تاريخ التعيين',
          'start_work_date': 'تاريخ المباشرة',
          'birth_date': 'تاريخ الميلاد',
          'special_roles': 'الأدوار الإشرافية والقيادية',
          'assigned_tasks': 'المهام المكلف بها'
        };
      case 'departments':
        return {
          'name': 'اسم القسم',
          'total': 'إجمالي الموظفين',
          'employees': 'قائمة الموظفين',
          'positions': 'المناصب المتوفرة'
        };
      case 'healthcenters':
        return {
          'اسم_المركز': 'اسم المركز',
          'الموقع': 'الموقع',
          'seha_id': 'SEHA ID',
          'center_code': 'كود المركز',
          'organization_code': 'الرقم الوزاري',
          'خط_الطول': 'خط الطول',
          'خط_العرض': 'خط العرض',
          'موقع_الخريطة': 'رابط الخريطة',
          'حالة_التشغيل': 'حالة التشغيل',
          'حالة_المركز': 'نوع الملكية',
          'اسم_المؤجر': 'اسم المؤجر',
          'هاتف_المؤجر': 'هاتف المؤجر',
          'رقم_العقد': 'رقم العقد',
          'تاريخ_بداية_العقد': 'تاريخ بداية العقد',
          'تاريخ_انتهاء_العقد': 'تاريخ انتهاء العقد',
          'قيمة_عقد_الايجار': 'قيمة عقد الإيجار',
          'مركز_نائي': 'مركز نائي',
          'هاتف_المركز': 'الهاتف الأرضي',
          'رقم_الشريحة': 'رقم الشريحة',
          'رقم_الجوال': 'رقم الجوال',
          'رقم_الهاتف_الثابت': 'الهاتف الثابت الإضافي',
          'ايميل_المركز': 'البريد الإلكتروني',
          'فاكس_المركز': 'الفاكس',
          'المدير': 'المدير',
          'نائب_المدير': 'نائب المدير',
          'المشرف_الفني': 'المشرف الفني',
          'employee_count': 'عدد الموظفين',
          'سيارة_خدمات_متوفرة': 'سيارة الخدمات',
          'لوحة_سيارة_الخدمات': 'لوحة سيارة الخدمات',
          'موديل_سيارة_الخدمات': 'موديل سيارة الخدمات',
          'نوع_وقود_سيارة_الخدمات': 'نوع وقود سيارة الخدمات',


          'سيارة_اسعاف_متوفرة': 'سيارة الإسعاف',
          'لوحة_سيارة_الاسعاف': 'لوحة سيارة الإسعاف',
          'موديل_سيارة_الاسعاف': 'موديل سيارة الإسعاف',
          'نوع_وقود_سيارة_الاسعاف': 'نوع وقود سيارة الإسعاف',
          'شريحة_وقود_عام': 'شريحة الوقود (عام)',
          'محطة_وقود_عام': 'تبعية محطة الوقود (عام)',


          'الوصف': 'الوصف'
        };
      default:
        return {};
    }
  }, [type]);

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(Object.keys(fieldDefinitions));
  };

  const clearAllFields = () => {
    setSelectedFields([]);
  };

  // ترتيب البيانات حسب المركز الصحي
  const sortedExportData = useMemo(() => {
    if (!exportData || !Array.isArray(exportData)) return [];
    
    return [...exportData].sort((a, b) => {
      const centerA = (a.المركز_الصحي || '').trim();
      const centerB = (b.المركز_الصحي || '').trim();
      return centerA.localeCompare(centerB, 'ar');
    });
  }, [exportData]);

  // حساب العمر
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // دالة تنسيق التواريخ حسب الاختيار
  const formatDate = (dateValue, isHijriField = false) => {
    if (!dateValue) return '';
    // إذا كان الحقل هجري أصلاً (مثل contract_end_date_hijri) نعرضه كما هو
    if (isHijriField) return dateValue;
    // للتواريخ الميلادية
    if (dateFormat === 'hijri') {
      return new Date(dateValue).toLocaleDateString('ar-SA-u-ca-islamic', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(dateValue).toLocaleDateString('ar-SA');
  };

  // معاينة البيانات المختارة
  const previewData = useMemo(() => {
    if (!sortedExportData || sortedExportData.length === 0 || !selectedFields.length) return [];
    
    return sortedExportData.slice(0, 3).map(item => {
      const filteredItem = {};
      selectedFields.forEach(field => {
        if (field === 'special_roles' && Array.isArray(item[field])) {
          filteredItem[field] = item[field].join(', ');
        } else if (field === 'assigned_tasks' && Array.isArray(item[field])) {
          filteredItem[field] = item[field].join(', ');
        } else if (field === 'employee_count' && type === 'healthcenters') {
          filteredItem[field] = item.employees ? item.employees.length : 0;
        } else if (field === 'age') {
          filteredItem[field] = calculateAge(item.birth_date);
        } else if (field === 'contract_end_date_hijri' || field === 'hire_date_hijri' || field === 'birth_date_hijri' || field === 'start_work_date_hijri') {
          filteredItem[field] = item[field] || '';
        } else if (field === 'hire_date' || field === 'birth_date' || field === 'contract_end_date' || field === 'start_work_date' || field === 'تاريخ_بداية_العقد' || field === 'تاريخ_انتهاء_العقد') {
          filteredItem[field] = formatDate(item[field]);
        } else if (type === 'healthcenters' && field === 'شريحة_وقود_عام') {
          const s = (typeof item.سيارة_خدمات?.شريحة_تعبئة_وقود === 'boolean') ? item.سيارة_خدمات.شريحة_تعبئة_وقود : null;
          const a = (typeof item.سيارة_اسعاف?.شريحة_تعبئة_وقود === 'boolean') ? item.سيارة_اسعاف.شريحة_تعبئة_وقود : null;
          const hasInfo = (s !== null) || (a !== null);
          const anyOn = (s === true) || (a === true);
          filteredItem[field] = hasInfo ? (anyOn ? 'متوفرة' : 'غير متوفرة') : '';
        } else if (type === 'healthcenters' && field === 'محطة_وقود_عام') {
          const stations = [item.سيارة_خدمات?.تبعية_المحطة, item.سيارة_اسعاف?.تبعية_المحطة].filter(Boolean);
          filteredItem[field] = Array.from(new Set(stations)).join(' / ');
        } else {
          filteredItem[field] = item[field] || '';
        }
      });
      return filteredItem;
    });
  }, [exportData, selectedFields, type, dateFormat]);

  const getExportValue = (item, field) => {
    if (field === 'special_roles' && Array.isArray(item[field])) {
      return item[field].join(', ');
    } else if (field === 'assigned_tasks' && Array.isArray(item[field])) {
      return item[field].join(', ');
    } else if (field === 'employee_count' && type === 'healthcenters') {
      return item.employees ? item.employees.length : 0;
    } else if (field === 'age') {
      return calculateAge(item.birth_date);
    } else if (field === 'contract_end_date_hijri' || field === 'hire_date_hijri' || field === 'birth_date_hijri' || field === 'start_work_date_hijri') {
      return item[field] || '';
    } else if (field === 'hire_date' || field === 'birth_date' || field === 'contract_end_date' || field === 'start_work_date' || field === 'تاريخ_بداية_العقد' || field === 'تاريخ_انتهاء_العقد') {
      return formatDate(item[field]);
    } else if ((field === 'المدير' || field === 'نائب_المدير' || field === 'المشرف_الفني') && type === 'healthcenters') {
      return getEmployeeName(item[field]);
    } else if (type === 'healthcenters') {
      if (field === 'سيارة_خدمات_متوفرة') {
        return item.سيارة_خدمات?.متوفرة ? 'متوفرة' : 'غير متوفرة';
      } else if (field === 'لوحة_سيارة_الخدمات') {
        return item.سيارة_خدمات?.رقم_اللوحة_عربي || item.سيارة_خدمات?.رقم_اللوحة_انجليزي || '';
      } else if (field === 'موديل_سيارة_الخدمات') {
        return item.سيارة_خدمات?.موديل || '';
      } else if (field === 'نوع_وقود_سيارة_الخدمات') {
        return item.سيارة_خدمات?.نوع_الوقود || '';
      } else if (field === 'شريحة_وقود_سيارة_الخدمات') {
        return (typeof item.سيارة_خدمات?.شريحة_تعبئة_وقود === 'boolean') ? (item.سيارة_خدمات.شريحة_تعبئة_وقود ? 'متوفرة' : 'غير متوفرة') : '';
      } else if (field === 'محطة_وقود_سيارة_الخدمات') {
        return item.سيارة_خدمات?.تبعية_المحطة || '';
      } else if (field === 'سيارة_اسعاف_متوفرة') {
        return item.سيارة_اسعاف?.متوفرة ? 'متوفرة' : 'غير متوفرة';
      } else if (field === 'لوحة_سيارة_الاسعاف') {
        return item.سيارة_اسعاف?.رقم_اللوحة_عربي || item.سيارة_اسعاف?.رقم_اللوحة_انجليزي || '';
      } else if (field === 'موديل_سيارة_الاسعاف') {
        return item.سيارة_اسعاف?.موديل || '';
      } else if (field === 'نوع_وقود_سيارة_الاسعاف') {
        return item.سيارة_اسعاف?.نوع_الوقود || '';
      } else if (field === 'شريحة_وقود_سيارة_الاسعاف') {
        return (typeof item.سيارة_اسعاف?.شريحة_تعبئة_وقود === 'boolean') ? (item.سيارة_اسعاف.شريحة_تعبئة_وقود ? 'متوفرة' : 'غير متوفرة') : '';
      } else if (field === 'محطة_وقود_سيارة_الاسعاف') {
        return item.سيارة_اسعاف?.تبعية_المحطة || '';
      } else if (field === 'شريحة_وقود_عام') {
        const s = (typeof item.سيارة_خدمات?.شريحة_تعبئة_وقود === 'boolean') ? item.سيارة_خدمات.شريحة_تعبئة_وقود : null;
        const a = (typeof item.سيارة_اسعاف?.شريحة_تعبئة_وقود === 'boolean') ? item.سيارة_اسعاف.شريحة_تعبئة_وقود : null;
        const hasInfo = (s !== null) || (a !== null);
        const anyOn = (s === true) || (a === true);
        return hasInfo ? (anyOn ? 'متوفرة' : 'غير متوفرة') : '';
      } else if (field === 'محطة_وقود_عام') {
        const stations = [item.سيارة_خدمات?.تبعية_المحطة, item.سيارة_اسعاف?.تبعية_المحطة].filter(Boolean);
        return Array.from(new Set(stations)).join(' / ');
      }
    }

    return item[field] || '';
  };

  const generateHTML = () => {
    if (!selectedFields.length && !preambleText && !footerText) return '';

    const headers = selectedFields.map(field => fieldDefinitions[field]);
    
    // تجميع البيانات حسب المركز الصحي للموظفين
    const groupedByCenter = type === 'employees' ? (sortedExportData || []).reduce((acc, item) => {
      const center = item.المركز_الصحي || 'غير محدد';
      if (!acc[center]) acc[center] = [];
      acc[center].push(item);
      return acc;
    }, {}) : null;

    const formatValue = (item, field) => {
      if (field === 'special_roles' && Array.isArray(item[field])) {
        return item[field].join('، ');
      } else if (field === 'assigned_tasks' && Array.isArray(item[field])) {
        return item[field].join('، ');
      } else if (field === 'employee_count' && type === 'healthcenters') {
        return item.employees ? item.employees.length : 0;
      } else if (field === 'age') {
        return calculateAge(item.birth_date);
      } else if (field === 'contract_end_date_hijri' || field === 'hire_date_hijri' || field === 'birth_date_hijri' || field === 'start_work_date_hijri') {
        return item[field] || '';
      } else if (field === 'hire_date' || field === 'birth_date' || field === 'contract_end_date' || field === 'start_work_date' || field === 'تاريخ_بداية_العقد' || field === 'تاريخ_انتهاء_العقد') {
        return formatDate(item[field]);
      } else if ((field === 'المدير' || field === 'نائب_المدير' || field === 'المشرف_الفني') && type === 'healthcenters') {
        // تحويل معرف الموظف إلى اسمه
        return getEmployeeName(item[field]);
      } else if (type === 'healthcenters') {
        // حقول المركبات المحسوبة
        if (field === 'سيارة_خدمات_متوفرة') {
          return item.سيارة_خدمات?.متوفرة ? 'متوفرة' : 'غير متوفرة';
        } else if (field === 'لوحة_سيارة_الخدمات') {
          return item.سيارة_خدمات?.رقم_اللوحة_عربي || item.سيارة_خدمات?.رقم_اللوحة_انجليزي || '';
        } else if (field === 'موديل_سيارة_الخدمات') {
          return item.سيارة_خدمات?.موديل || '';
        } else if (field === 'نوع_وقود_سيارة_الخدمات') {
          return item.سيارة_خدمات?.نوع_الوقود || '';
        } else if (field === 'شريحة_وقود_سيارة_الخدمات') {
          return (typeof item.سيارة_خدمات?.شريحة_تعبئة_وقود === 'boolean') ? (item.سيارة_خدمات.شريحة_تعبئة_وقود ? 'متوفرة' : 'غير متوفرة') : '';
        } else if (field === 'محطة_وقود_سيارة_الخدمات') {
          return item.سيارة_خدمات?.تبعية_المحطة || '';
        } else if (field === 'سيارة_اسعاف_متوفرة') {
          return item.سيارة_اسعاف?.متوفرة ? 'متوفرة' : 'غير متوفرة';
        } else if (field === 'لوحة_سيارة_الاسعاف') {
          return item.سيارة_اسعاف?.رقم_اللوحة_عربي || item.سيارة_اسعاف?.رقم_اللوحة_انجليزي || '';
        } else if (field === 'موديل_سيارة_الاسعاف') {
          return item.سيارة_اسعاف?.موديل || '';
        } else if (field === 'نوع_وقود_سيارة_الاسعاف') {
          return item.سيارة_اسعاف?.نوع_الوقود || '';
        } else if (field === 'شريحة_وقود_سيارة_الاسعاف') {
          return (typeof item.سيارة_اسعاف?.شريحة_تعبئة_وقود === 'boolean') ? (item.سيارة_اسعاف.شريحة_تعبئة_وقود ? 'متوفرة' : 'غير متوفرة') : '';
        } else if (field === 'محطة_وقود_سيارة_الاسعاف') {
          return item.سيارة_اسعاف?.تبعية_المحطة || '';
        } else if (field === 'شريحة_وقود_عام') {
          const s = (typeof item.سيارة_خدمات?.شريحة_تعبئة_وقود === 'boolean') ? item.سيارة_خدمات.شريحة_تعبئة_وقود : null;
          const a = (typeof item.سيارة_اسعاف?.شريحة_تعبئة_وقود === 'boolean') ? item.سيارة_اسعاف.شريحة_تعبئة_وقود : null;
          const hasInfo = (s !== null) || (a !== null);
          const anyOn = (s === true) || (a === true);
          return hasInfo ? (anyOn ? 'متوفرة' : 'غير متوفرة') : '';
        } else if (field === 'محطة_وقود_عام') {
          const stations = [item.سيارة_خدمات?.تبعية_المحطة, item.سيارة_اسعاف?.تبعية_المحطة].filter(Boolean);
          return Array.from(new Set(stations)).join(' / ');
        } else {
          return item[field] || '';
        }
      } else {
        return item[field] || '';
      }
    };

    const generateTableRows = (items, startIndex = 1) => {
      return items.map((item, idx) => {
        const cells = selectedFields.map(field => {
          const value = formatValue(item, field);
          return `<td>${value}</td>`;
        }).join('');
        return `<tr><td class="row-num">${startIndex + idx}</td>${cells}</tr>`;
      }).join('');
    };

    const signatureBlock = `
      <div class="signature-block">
        <p class="signature-title">المساعد لشؤون المراكز الصحية بالحسو</p>
        <p class="signature-name">أ/ عبدالمجيد سعود الربيقي</p>
        <div class="signature-images">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png" alt="Signature" class="signature-img">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png" alt="Stamp" class="stamp-img">
        </div>
      </div>
    `;

    // إحصائيات للموظفين
    const stats = type === 'employees' ? {
      total: sortedExportData.length,
      centers: Object.keys(groupedByCenter || {}).length,
      positions: [...new Set(sortedExportData.map(e => e.position).filter(Boolean))].length
    } : null;

    const tableContent = type === 'employees' && groupedByCenter ? 
      Object.entries(groupedByCenter).map(([center, items], groupIdx) => `
        <div class="center-section">
          <div class="center-header">
            <span class="center-icon">🏥</span>
            <span class="center-name">${center}</span>
            <span class="center-count">(${items.length} موظف)</span>
          </div>
          <table>
            <thead>
              <tr>
                <th class="row-num-header">م</th>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${generateTableRows(items)}
            </tbody>
          </table>
        </div>
      `).join('') :
      `<table>
        <thead>
          <tr>
            <th class="row-num-header">م</th>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${generateTableRows(sortedExportData)}
        </tbody>
      </table>`;

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>${exportTitle}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: 'Cairo', 'Times New Roman', Arial, sans-serif; 
              direction: rtl; 
              margin: 0;
              padding: 6px 24px 20px 24px;
              font-size: 12pt; 
              background: #f8fafc;
              color: #1e293b;
            }
            
            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              overflow: hidden;
            }
            
            .report-logo-header {
              text-align: center;
              padding: 0 40px 8px;
              border-bottom: 2px solid #0d9488;
              overflow: hidden;
            }
            
            .report-logo-header img {
              max-height: 120px;
              margin: 0 auto;
              display: block;
            }
            
            .report-header {
              background: #fff;
              color: #1e293b;
              padding: 20px 40px 10px;
              text-align: center;
              position: relative;
            }
            
            .report-header h1 {
              margin: 0 0 8px 0;
              font-size: 22pt;
              font-weight: 800;
              color: #0f766e;
            }
            
            .report-header .subtitle {
              display: none;
            }
            
            .report-header .export-date {
              display: none;
            }
            
            .stats-bar {
              display: flex;
              justify-content: center;
              gap: 40px;
              padding: 20px 40px;
              background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
              border-bottom: 2px solid #d1fae5;
            }
            
            .stat-item {
              text-align: center;
            }
            
            .stat-value {
              font-size: 28pt;
              font-weight: 800;
              color: #059669;
              display: block;
            }
            
            .stat-label {
              font-size: 10pt;
              color: #6b7280;
              font-weight: 600;
            }
            
            .report-body {
              padding: 30px 40px;
            }
            
            .preamble {
              background: #f8fafc;
              border-right: 4px solid #059669;
              padding: 20px;
              margin-bottom: 30px;
              border-radius: 0 8px 8px 0;
              line-height: 1.8;
              font-size: 13pt;
            }
            
            .center-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .center-header {
              background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
              color: white;
              padding: 12px 20px;
              border-radius: 10px 10px 0 0;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .center-icon {
              font-size: 18pt;
            }
            
            .center-name {
              font-size: 14pt;
              font-weight: 700;
            }
            
            .center-count {
              font-size: 10pt;
              opacity: 0.9;
              margin-right: auto;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              table-layout: fixed;
              font-size: 10pt;
              background: white;
              border-radius: 0 0 10px 10px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
              word-break: break-word;
              overflow-wrap: anywhere;
            }
            
            th { 
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              font-weight: 700;
              font-size: 9pt;
              line-height: 1.35;
              padding: 8px 8px;
              border: 1px solid #cbd5e1;
              color: #334155;
              white-space: normal;
              word-break: break-word;
              overflow-wrap: anywhere;
            }
            
            td { 
              padding: 6px 8px;
              border: 1px solid #e2e8f0;
              text-align: center;
              line-height: 1.35;
              vertical-align: middle;
            }
            
            tbody tr:nth-child(even) {
              background: #f8fafc;
            }
            
            tbody tr:hover {
              background: #f0fdf4;
            }
            
            .row-num-header, .row-num {
              width: 40px;
              background: #f1f5f9;
              font-weight: 700;
              color: #64748b;
            }
            
            .footer-text {
              background: #fffbeb;
              border-right: 4px solid #f59e0b;
              padding: 20px;
              margin-top: 30px;
              border-radius: 0 8px 8px 0;
              line-height: 1.8;
              font-size: 12pt;
            }
            
            .signature-block {
              text-align: center;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px dashed #e2e8f0;
              page-break-inside: avoid;
            }
            
            .signature-title {
              margin: 0;
              font-weight: 700;
              font-size: 14pt;
              color: #1e293b;
            }
            
            .signature-name {
              margin: 8px 0 0 0;
              font-weight: 800;
              font-size: 16pt;
              color: #059669;
            }
            
            .signature-images {
              position: relative;
              width: 280px;
              height: 110px;
              margin: -15px auto 0 auto;
            }
            
            .signature-img {
              position: absolute;
              left: 0;
              top: 0;
              width: 160px;
              mix-blend-mode: darken;
            }
            
            .stamp-img {
              position: absolute;
              right: 0;
              top: 15px;
              width: 110px;
              opacity: 0.9;
            }
            
            .report-footer {
              background: #f8fafc;
              padding: 20px 40px;
              text-align: center;
              color: #6b7280;
              font-size: 9pt;
              border-top: 1px solid #e2e8f0;
            }
            
            @page { 
              size: A4 landscape; 
              margin: 5mm 15mm 15mm 15mm; 
            }
            
            @media print { 
              body { 
                background: white;
                padding: 0;
              }
              .report-container {
                box-shadow: none;
                border-radius: 0;
              }
              .center-section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">

            <div class="report-logo-header">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png" alt="تجمع المدينة المنورة الصحي" />
            </div>
            <div class="report-header">
              <h1>${exportTitle}</h1>
              <div class="subtitle">شؤون المراكز الصحية بالحسو - مستشفى الحسو العام</div>
              <div class="export-date">📅 تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            
            ${stats ? `
            <div class="stats-bar">
              <div class="stat-item">
                <span class="stat-value">${stats.total}</span>
                <span class="stat-label">إجمالي الموظفين</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${stats.centers}</span>
                <span class="stat-label">عدد المراكز</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${stats.positions}</span>
                <span class="stat-label">التخصصات</span>
              </div>
            </div>
            ` : ''}
            
            <div class="report-body">
              ${preambleText ? `<div class="preamble">${preambleText.replace(/\n/g, '<br/>')}</div>` : ''}
              ${selectedFields.length > 0 ? tableContent : ''}
              ${footerText ? `<div class="footer-text">${footerText.replace(/\n/g, '<br/>')}</div>` : ''}
              ${includeSignature ? signatureBlock : ''}
            </div>
            
            <div class="report-footer" style="border-top: 2px solid #0d9488; text-align: center; padding: 15px 40px;">
              <p style="margin: 0 0 3px 0; font-weight: bold; color: #0d9488;">شؤون المراكز الصحية بالحسو - مستشفى الحسو العام</p>
              <p style="margin: 0;">تجمع المدينة المنورة الصحي - وزارة الصحة</p>
              <p style="margin: 8px 0 0 0; font-size: 8pt; color: #94a3b8;">${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const downloadFile = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (!selectedFields.length && !preambleText && !footerText) {
      alert("يرجى اختيار بعض الحقول أو كتابة نص للتقرير");
      return;
    }

    setIsExporting(true);
    
    try {
      switch(format) {
        case 'excel': {
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet(exportTitle || filename);
          const headerLabels = selectedFields.map(field => fieldDefinitions[field]);
          const headerRow = worksheet.addRow(headerLabels);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '166534' } };
          headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

          sortedExportData.forEach((item) => {
            worksheet.addRow(selectedFields.map((field) => getExportValue(item, field)));
          });

          worksheet.columns = selectedFields.map((field) => ({
            key: field,
            width: Math.min(Math.max(String(fieldDefinitions[field] || field).length + 6, 16), 40),
          }));

          worksheet.eachRow((row, rowNumber) => {
            row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            row.eachCell((cell) => {
              cell.border = {
                top: { style: 'thin', color: { argb: 'D1D5DB' } },
                left: { style: 'thin', color: { argb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
                right: { style: 'thin', color: { argb: 'D1D5DB' } },
              };
              if (rowNumber > 1) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: rowNumber % 2 === 0 ? 'F9FAFB' : 'FFFFFFFF' },
                };
              }
            });
          });

          const buffer = await workbook.xlsx.writeBuffer();
          downloadFile(buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
        }
          
        case 'word':
          const htmlContentWord = generateHTML();
          downloadFile(htmlContentWord, `${filename}.doc`, 'application/msword');
          break;
          
        case 'html':
          const htmlFileContent = generateHTML();
          downloadFile(htmlFileContent, `${filename}.html`, 'text/html;charset=utf-8;');
          break;
          
        default:
          break;
      }
      
      setIsOpen(false);
    } catch (error) {
      alert("حدث خطأ أثناء التصدير");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // التحقق من وجود البيانات
  if (!exportData || !Array.isArray(exportData) || exportData.length === 0) {
    return (
      <Button disabled className="bg-gray-400">
        <Settings2 className="w-4 h-4 ml-2" />
        تصدير مخصص (لا توجد بيانات)
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Settings2 className="w-4 h-4 ml-2" />
          تصدير مخصص {selectedCount > 0 ? `(${selectedCount})` : ''}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>تخصيص التصدير الرسمي</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="fields" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fields">خيارات التقرير</TabsTrigger>
            <TabsTrigger value="preview" disabled={selectedFields.length === 0}>
              <Eye className="w-4 h-4 ml-2" />
              معاينة الجدول ({selectedFields.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fields" className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* اختيار المراكز للتصدير - يظهر فقط للمراكز الصحية */}
              {type === 'healthcenters' && (
                <Card className="border-green-200 bg-green-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                      <Building2 className="w-5 h-5" /> 
                      تحديد المراكز للتصدير
                      {selectedCenterIds.length > 0 && (
                        <Badge className="bg-green-600">{selectedCenterIds.length} مركز محدد</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="بحث في المراكز..."
                        value={centerSearchQuery}
                        onChange={(e) => setCenterSearchQuery(e.target.value)}
                        className="pr-9"
                      />
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedCenterIds(availableCenters.map(c => c.id))}
                      >
                        <CheckSquare className="w-4 h-4 ml-1" />
                        تحديد الكل ({availableCenters.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedCenterIds([])}
                      >
                        <Square className="w-4 h-4 ml-1" />
                        إلغاء الكل
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-white space-y-1">
                      {filteredCenters.map(center => (
                        <div key={center.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded">
                          <Checkbox
                            id={`center-${center.id}`}
                            checked={selectedCenterIds.includes(center.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCenterIds(prev => [...prev, center.id]);
                              } else {
                                setSelectedCenterIds(prev => prev.filter(id => id !== center.id));
                              }
                            }}
                          />
                          <Label htmlFor={`center-${center.id}`} className="cursor-pointer flex-1 text-sm">
                            {center.name}
                          </Label>
                        </div>
                      ))}
                      {filteredCenters.length === 0 && (
                        <p className="text-center text-gray-500 py-3 text-sm">لا توجد نتائج</p>
                      )}
                    </div>
                    {selectedCenterIds.length === 0 && (
                      <p className="text-xs text-amber-600">💡 إذا لم تحدد أي مركز، سيتم تصدير جميع المراكز</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><PenLine className="w-5 h-5" /> محتوى التقرير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="exportTitle">عنوان التقرير</Label>
                    <Input 
                      id="exportTitle" 
                      value={exportTitle} 
                      onChange={(e) => setExportTitle(e.target.value)} 
                      placeholder="أدخل عنوان التقرير" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="filename">اسم الملف (للتصدير)</Label>
                    <Input
                      id="filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="أدخل اسم الملف"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preambleText">بيان أعلى الجدول (اختياري)</Label>
                    <Textarea 
                      id="preambleText" 
                      value={preambleText} 
                      onChange={(e) => setPreambleText(e.target.value)} 
                      placeholder="اكتب هنا البيان أو المقدمة..." 
                      rows={3} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="footerText">نص أسفل الجدول (اختياري)</Label>
                    <Textarea 
                      id="footerText" 
                      value={footerText} 
                      onChange={(e) => setFooterText(e.target.value)} 
                      placeholder="اكتب هنا النص الختامي..." 
                      rows={2} 
                    />
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse pt-2">
                    <Checkbox id="includeSignature" checked={includeSignature} onCheckedChange={setIncludeSignature} />
                    <Label htmlFor="includeSignature" className="cursor-pointer">إدراج التوقيع والختم الرسمي</Label>
                  </div>

                  <div className="pt-4 border-t mt-4">
                    <Label className="mb-3 block font-semibold">تنسيق التواريخ في التصدير</Label>
                    <RadioGroup value={dateFormat} onValueChange={setDateFormat} className="flex gap-6">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="hijri" id="hijri" />
                        <Label htmlFor="hijri" className="cursor-pointer">هجري</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="gregorian" id="gregorian" />
                        <Label htmlFor="gregorian" className="cursor-pointer">ميلادي</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  <CheckSquare className="w-4 h-4 ml-2" />
                  تحديد كل الحقول ({Object.keys(fieldDefinitions).length})
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllFields}>
                  <Square className="w-4 h-4 ml-2" />
                  إلغاء تحديد الحقول
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">حقول الجدول المتاحة للتصدير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(fieldDefinitions).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={key}
                          checked={selectedFields.includes(key)}
                          onCheckedChange={() => handleFieldToggle(key)}
                        />
                        <Label htmlFor={key} className="cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 overflow-auto p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  معاينة البيانات المختارة
                  <Badge variant="secondary">{selectedFields.length} حقل</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {selectedFields.map(field => (
                            <th key={field} className="border border-gray-200 p-2 font-medium">
                              {fieldDefinitions[field]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {selectedFields.map(field => (
                              <td key={field} className="border border-gray-200 p-2">
                                {item[field] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">لا توجد بيانات للمعاينة</p>
                )}
                
                {sortedExportData.length > 3 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    معاينة أول 3 سجلات من إجمالي {sortedExportData.length} سجل (مرتبة حسب المركز الصحي)
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            إغلاق
          </Button>
          <Button 
            onClick={() => handleExport('excel')} 
            disabled={(!selectedFields.length && !preambleText && !footerText) || isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button 
            onClick={() => handleExport('word')} 
            disabled={(!selectedFields.length && !preambleText && !footerText) || isExporting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 ml-2" />
            تصدير Word
          </Button>
          <Button 
            onClick={() => handleExport('html')} 
            disabled={(!selectedFields.length && !preambleText && !footerText) || isExporting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير HTML
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}