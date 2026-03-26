import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, Copy, FileText, FileSpreadsheet, CheckCircle2, Users, ChevronUp, ChevronDown, GripVertical, Building2 } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function CenterEmployeeExporter({ 
  open, 
  onOpenChange, 
  employees = [],
  centerName = "",
  manager = null,
  center = null,
  deputyManager = null,
  technicalSupervisor = null
}) {
  const [orderedEmployees, setOrderedEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set([
    "full_name_arabic", "رقم_الموظف", "position", "contract_type"
  ]));
  const [administrationName, setAdministrationName] = useState("إدارة الشؤون الصحية - الحناكية");
  const [managerName, setManagerName] = useState(manager?.full_name_arabic || "");
  const [managerTitle, setManagerTitle] = useState("مدير إدارة شؤون المراكز الصحية بالحناكية");
  const [isExporting, setIsExporting] = useState(false);
  const [includeCenterInfo, setIncludeCenterInfo] = useState(false);
  const [selectedCenterSections, setSelectedCenterSections] = useState(new Set([
    "basic", "contact", "leadership", "stats"
  ]));

  const centerSectionOptions = [
    { key: "basic", label: "المعلومات الأساسية" },
    { key: "contact", label: "بيانات التواصل" },
    { key: "leadership", label: "القيادة والإدارة" },
    { key: "ownership", label: "بيانات الملكية والعقود" },
    { key: "clinics", label: "العيادات والخدمات" },
    { key: "vehicles", label: "المركبات" },
    { key: "stats", label: "إحصائيات الموظفين" },
  ];

  const toggleCenterSection = (key) => {
    const newSet = new Set(selectedCenterSections);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setSelectedCenterSections(newSet);
  };

  useEffect(() => {
    if (employees.length > 0) {
      setOrderedEmployees([...employees]);
    }
  }, [employees]);

  const fieldDefinitions = [
    { key: "full_name_arabic", label: "الاسم الكامل" },
    { key: "رقم_الموظف", label: "رقم الموظف" },
    { key: "seha_id", label: "SEHA ID" },
    { key: "رقم_الهوية", label: "رقم الهوية" },
    { key: "birth_date", label: "تاريخ الميلاد" },
    { key: "gender", label: "الجنس" },
    { key: "nationality", label: "الجنسية" },
    { key: "phone", label: "الجوال" },
    { key: "email", label: "البريد الإلكتروني" },
    { key: "position", label: "التخصص" },
    { key: "department", label: "القسم" },
    { key: "job_category", label: "ملاك الوظيفة" },
    { key: "job_category_type", label: "فئة الوظيفة" },
    { key: "qualification", label: "المؤهل" },
    { key: "rank", label: "المرتبة" },
    { key: "sequence", label: "التسلسل" },
    { key: "level", label: "المستوى" },
    { key: "grade", label: "الدرجة" },
    { key: "hire_date", label: "تاريخ التوظيف" },
    { key: "contract_type", label: "نوع العقد" },
    { key: "contract_end_date", label: "تاريخ انتهاء العقد" },
  ];

  const handleToggleEmployee = (employeeId) => {
    const newSelected = new Set(selectedEmployeeIds);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployeeIds(newSelected);
  };

  const handleToggleField = (fieldKey) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldKey)) {
      newSelected.delete(fieldKey);
    } else {
      newSelected.add(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployeeIds.size === orderedEmployees.length) {
      setSelectedEmployeeIds(new Set());
    } else {
      setSelectedEmployeeIds(new Set(orderedEmployees.map(e => e.id)));
    }
  };

  const getSelectedEmployees = () => {
    return orderedEmployees.filter(e => selectedEmployeeIds.has(e.id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedEmployees);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedEmployees(items);
  };

  const moveEmployee = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === orderedEmployees.length - 1)
    ) {
      return;
    }

    const newOrder = [...orderedEmployees];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrderedEmployees(newOrder);
  };

  const generateCenterInfoHTML = () => {
    if (!center || !includeCenterInfo) return '';
    let html = '';

    if (selectedCenterSections.has("basic")) {
      html += `
      <div class="center-section">
        <div class="center-section-title">المعلومات الأساسية</div>
        <div class="center-grid">
          <div class="center-item"><span class="ci-label">اسم المركز:</span> <span class="ci-value">${center.اسم_المركز || ''}</span></div>
          ${center.seha_id ? `<div class="center-item"><span class="ci-label">SEHA ID:</span> <span class="ci-value" style="color:#16a34a;font-weight:bold;">${center.seha_id}</span></div>` : ''}
          <div class="center-item"><span class="ci-label">كود المركز:</span> <span class="ci-value">${center.center_code || 'غير محدد'}</span></div>
          <div class="center-item"><span class="ci-label">الرقم الوزاري:</span> <span class="ci-value">${center.organization_code || 'غير محدد'}</span></div>
          <div class="center-item"><span class="ci-label">حالة التشغيل:</span> <span class="ci-value">${center.حالة_التشغيل || 'نشط'}</span></div>
          <div class="center-item"><span class="ci-label">الموقع:</span> <span class="ci-value">${center.الموقع || 'غير محدد'}</span></div>
          <div class="center-item"><span class="ci-label">نوع الملكية:</span> <span class="ci-value">${center.حالة_المركز || 'حكومي'}</span></div>
          ${center.ساعات_الدوام ? `<div class="center-item"><span class="ci-label">ساعات الدوام:</span> <span class="ci-value">${center.ساعات_الدوام}</span></div>` : ''}
          ${center.مركز_نائي ? `<div class="center-item"><span class="ci-label">تصنيف:</span> <span class="ci-value">مركز نائي ${center.بدل_نأي ? `(بدل: ${center.بدل_نأي} ر.س)` : ''}</span></div>` : ''}
          ${center.معتمد_سباهي ? `<div class="center-item"><span class="ci-label">اعتماد سباهي:</span> <span class="ci-value" style="color:#16a34a;">✓ حاصل على الاعتماد</span></div>` : ''}
        </div>
      </div>`;
    }

    if (selectedCenterSections.has("contact")) {
      html += `
      <div class="center-section">
        <div class="center-section-title">بيانات التواصل</div>
        <div class="center-grid">
          ${center.هاتف_المركز ? `<div class="center-item"><span class="ci-label">الهاتف:</span> <span class="ci-value">${center.هاتف_المركز}</span></div>` : ''}
          ${center.رقم_الشريحة ? `<div class="center-item"><span class="ci-label">رقم الشريحة:</span> <span class="ci-value">${center.رقم_الشريحة}</span></div>` : ''}
          ${center.رقم_الجوال ? `<div class="center-item"><span class="ci-label">الجوال:</span> <span class="ci-value">${center.رقم_الجوال}</span></div>` : ''}
          ${center.رقم_الهاتف_الثابت ? `<div class="center-item"><span class="ci-label">هاتف إضافي:</span> <span class="ci-value">${center.رقم_الهاتف_الثابت}</span></div>` : ''}
          ${center.فاكس_المركز ? `<div class="center-item"><span class="ci-label">الفاكس:</span> <span class="ci-value">${center.فاكس_المركز}</span></div>` : ''}
          ${center.ايميل_المركز ? `<div class="center-item" style="grid-column:1/-1;"><span class="ci-label">البريد:</span> <span class="ci-value">${center.ايميل_المركز}</span></div>` : ''}
        </div>
      </div>`;
    }

    if (selectedCenterSections.has("leadership")) {
      html += `
      <div class="center-section">
        <div class="center-section-title">القيادة والإدارة</div>
        <div class="center-grid">
          <div class="center-item"><span class="ci-label">مدير المركز:</span> <span class="ci-value">${manager?.full_name_arabic || 'غير محدد'}</span></div>
          ${manager?.phone ? `<div class="center-item"><span class="ci-label">هاتف المدير:</span> <span class="ci-value">${manager.phone}</span></div>` : ''}
          ${deputyManager ? `<div class="center-item"><span class="ci-label">نائب المدير:</span> <span class="ci-value">${deputyManager.full_name_arabic}</span></div>` : ''}
          ${technicalSupervisor ? `<div class="center-item"><span class="ci-label">المشرف الفني:</span> <span class="ci-value">${technicalSupervisor.full_name_arabic}</span></div>` : ''}
        </div>
      </div>`;
    }

    if (selectedCenterSections.has("ownership") && (center.حالة_المركز === 'مستأجر' || center.قيمة_عقد_الايجار)) {
      html += `
      <div class="center-section">
        <div class="center-section-title" style="background:linear-gradient(135deg,#f97316,#fb923c);">بيانات الملكية والعقود</div>
        <div class="center-grid">
          <div class="center-item"><span class="ci-label">حالة الملكية:</span> <span class="ci-value">${center.حالة_المركز || 'غير محدد'}</span></div>
          ${center.قيمة_عقد_الايجار ? `<div class="center-item"><span class="ci-label">الإيجار السنوي:</span> <span class="ci-value">${center.قيمة_عقد_الايجار.toLocaleString('ar-SA')} ر.س</span></div>` : ''}
          ${center.رقم_العقد ? `<div class="center-item"><span class="ci-label">رقم العقد:</span> <span class="ci-value">${center.رقم_العقد}</span></div>` : ''}
          ${center.تاريخ_بداية_العقد ? `<div class="center-item"><span class="ci-label">بداية العقد:</span> <span class="ci-value">${new Date(center.تاريخ_بداية_العقد).toLocaleDateString('ar-SA')}</span></div>` : ''}
          ${center.تاريخ_انتهاء_العقد ? `<div class="center-item"><span class="ci-label">انتهاء العقد:</span> <span class="ci-value" style="color:#dc2626;">${new Date(center.تاريخ_انتهاء_العقد).toLocaleDateString('ar-SA')}</span></div>` : ''}
          ${center.اسم_المؤجر ? `<div class="center-item"><span class="ci-label">المؤجر:</span> <span class="ci-value">${center.اسم_المؤجر}</span></div>` : ''}
        </div>
      </div>`;
    }

    if (selectedCenterSections.has("clinics") && center.العيادات_المتوفرة?.length > 0) {
      html += `
      <div class="center-section">
        <div class="center-section-title" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);">العيادات والخدمات</div>
        <div class="center-grid">
          ${center.العيادات_المتوفرة.map(c => `
            <div class="center-item"><span class="ci-label">${c.اسم_العيادة || 'عيادة'}:</span> <span class="ci-value">${c.نوع_العيادة || ''} ${c.الطبيب_المسؤول ? '- ' + c.الطبيب_المسؤول : ''}</span></div>
          `).join('')}
        </div>
      </div>`;
    }

    if (selectedCenterSections.has("vehicles")) {
      html += `
      <div class="center-section">
        <div class="center-section-title" style="background:linear-gradient(135deg,#0891b2,#22d3ee);">المركبات</div>
        <div class="center-grid">
          <div class="center-item"><span class="ci-label">سيارة خدمات:</span> <span class="ci-value">${center.سيارة_خدمات?.متوفرة ? '✓ متوفرة' : '✗ غير متوفرة'} ${center.سيارة_خدمات?.نوع_السيارة ? '- ' + center.سيارة_خدمات.نوع_السيارة : ''}</span></div>
          <div class="center-item"><span class="ci-label">سيارة إسعاف:</span> <span class="ci-value">${center.سيارة_اسعاف?.متوفرة ? '✓ متوفرة' : '✗ غير متوفرة'} ${center.سيارة_اسعاف?.نوع_السيارة ? '- ' + center.سيارة_اسعاف.نوع_السيارة : ''}</span></div>
        </div>
      </div>`;
    }

    if (selectedCenterSections.has("stats")) {
      const jobCategoryCounts = employees.reduce((acc, emp) => {
        const cat = emp.job_category || 'غير محدد';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      const contractCounts = employees.reduce((acc, emp) => {
        const ct = emp.contract_type || 'غير محدد';
        acc[ct] = (acc[ct] || 0) + 1;
        return acc;
      }, {});
      
      const annualPatientsHtml = center.annual_patients && center.annual_patients.length > 0 
        ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
            <div style="font-weight:bold;font-size:11px;margin-bottom:5px;color:#374151;">عدد المراجعين السنوي:</div>
            <div class="center-grid">
              ${center.annual_patients.map(p => `<div class="center-item"><span class="ci-label">${p.year}:</span> <span class="ci-value" style="font-weight:bold;">${p.count}</span></div>`).join('')}
            </div>
          </div>`
        : '';

      html += `
      <div class="center-section">
        <div class="center-section-title" style="background:linear-gradient(135deg,#059669,#34d399);">إحصائيات الموظفين والمراجعين</div>
        <div style="text-align:center;padding:10px;font-size:18px;font-weight:bold;color:#0369a1;">إجمالي الموظفين: ${employees.length}</div>
        <div class="center-grid">
          ${Object.entries(jobCategoryCounts).map(([k,v]) => `<div class="center-item"><span class="ci-label">${k}:</span> <span class="ci-value" style="font-weight:bold;">${v}</span></div>`).join('')}
        </div>
        ${Object.keys(contractCounts).length > 0 ? `
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
          <div style="font-weight:bold;font-size:11px;margin-bottom:5px;color:#374151;">حسب نوع العقد:</div>
          <div class="center-grid">
            ${Object.entries(contractCounts).map(([k,v]) => `<div class="center-item"><span class="ci-label">${k}:</span> <span class="ci-value" style="font-weight:bold;">${v}</span></div>`).join('')}
          </div>
        </div>` : ''}
        ${annualPatientsHtml}
      </div>`;
    }

    return html;
  };

  const generateTableHTML = () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0 && !includeCenterInfo) return "";

    const fieldsArray = Array.from(selectedFields);
    const headers = fieldsArray.map(key => 
      fieldDefinitions.find(f => f.key === key)?.label || key
    );

    const centerInfoHTML = generateCenterInfoHTML();

    let html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${includeCenterInfo ? 'تقرير المركز والموظفين' : 'بيان موظفي'} - ${centerName}</title>
  <style>
    * { font-family: 'Arial', 'Times New Roman', serif; }
    body { direction: rtl; margin: 20mm; font-size: 12px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #1e40af; margin: 10px 0; }
    .header h2 { font-size: 16px; color: #374151; margin: 5px 0; }
    .meta { text-align: right; margin-bottom: 20px; font-size: 11px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #374151; padding: 8px; text-align: center; }
    th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; font-weight: bold; font-size: 11px; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 40px; text-align: center; border-top: 2px solid #e5e7eb; padding-top: 20px; }
    .signature { display: inline-block; text-align: center; margin: 0 30px; }
    .signature-line { border-top: 1px solid #000; width: 200px; margin: 40px auto 10px; }
    .center-section { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
    .center-section-title { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 10px 15px; font-weight: bold; font-size: 13px; text-align: center; }
    .center-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; }
    .center-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 10px; font-size: 11px; }
    .ci-label { font-weight: bold; color: #374151; margin-left: 5px; }
    .ci-value { color: #1f2937; }
    .section-divider { border-top: 3px solid #1e40af; margin: 30px 0; padding-top: 15px; }
    .section-divider h2 { font-size: 20px; color: #1e40af; text-align: center; margin: 0; }
    @page { size: A4; margin: 15mm; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${includeCenterInfo ? `تقرير شامل - ${centerName}` : `بيان موظفي ${centerName}`}</h1>
    <h2 style="font-size: 26px; font-weight: bold; color: #1e40af;">${administrationName}</h2>
  </div>

  ${centerInfoHTML}

  ${selectedEmps.length > 0 ? `
  ${includeCenterInfo ? '<div class="section-divider"><h2>قائمة الموظفين</h2></div>' : ''}
  
  <div class="meta">
    <div>عدد الموظفين: ${selectedEmps.length}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>م</th>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${selectedEmps.map((emp, idx) => `
        <tr>
          <td>${idx + 1}</td>
          ${fieldsArray.map(key => {
            let val = emp[key] || 'غير محدد';
            if (key === 'birth_date' || key === 'hire_date' || key === 'contract_end_date') {
              if (val && val !== 'غير محدد') {
                try {
                  val = new Date(val).toLocaleDateString('ar-SA');
                } catch (e) {}
              }
            }
            if (Array.isArray(val)) val = val.join(', ');
            return `<td>${val}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <div class="signature">
      <div class="signature-line"></div>
      <div style="font-weight: bold; font-size: 22px; color: #1e40af;">${managerName}</div>
      <div style="font-size: 16px; color: #374151; font-weight: bold; margin-top: 5px;">${managerTitle}</div>
    </div>
  </div>
</body>
</html>`;

    return html;
  };

  const generateCSV = () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0) return "";

    const fieldsArray = Array.from(selectedFields);
    const headers = ["م", ...fieldsArray.map(key => 
      fieldDefinitions.find(f => f.key === key)?.label || key
    )];

    let csv = headers.join(',') + '\n';
    
    selectedEmps.forEach((emp, idx) => {
      const row = [
        idx + 1,
        ...fieldsArray.map(key => {
          let val = emp[key] || '';
          if (key === 'birth_date' || key === 'hire_date' || key === 'contract_end_date') {
            if (val) {
              try {
                val = new Date(val).toLocaleDateString('ar-SA');
              } catch (e) {}
            }
          }
          if (Array.isArray(val)) val = val.join(' - ');
          return `"${val}"`;
        })
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  };

  const handleCopyTable = async () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0 && !includeCenterInfo) {
      toast.error("لم يتم اختيار أي موظفين");
      return;
    }

    const fieldsArray = Array.from(selectedFields);
    const headers = ["م", ...fieldsArray.map(key => 
      fieldDefinitions.find(f => f.key === key)?.label || key
    )];

    let tableText = headers.join('\t') + '\n';
    
    selectedEmps.forEach((emp, idx) => {
      const row = [
        idx + 1,
        ...fieldsArray.map(key => {
          let val = emp[key] || '';
          if (key === 'birth_date' || key === 'hire_date' || key === 'contract_end_date') {
            if (val) {
              try {
                val = new Date(val).toLocaleDateString('ar-SA');
              } catch (e) {}
            }
          }
          if (Array.isArray(val)) val = val.join(', ');
          return val;
        })
      ];
      tableText += row.join('\t') + '\n';
    });

    await navigator.clipboard.writeText(tableText);
    toast.success("تم نسخ البيانات للحافظة");
  };

  const handleExport = (format) => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0 && !includeCenterInfo) {
      toast.error("لم يتم اختيار أي موظفين أو بيانات مركز");
      return;
    }

    setIsExporting(true);

    try {
      if (format === 'excel') {
        const csv = generateCSV();
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `موظفي_${centerName}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success("تم تصدير البيانات إلى Excel");
      } else if (format === 'word' || format === 'html') {
        const html = generateTableHTML();
        const blob = new Blob([html], { type: format === 'word' ? 'application/msword' : 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `موظفي_${centerName}_${new Date().toISOString().split('T')[0]}.${format === 'word' ? 'doc' : 'html'}`;
        link.click();
        toast.success(`تم تصدير البيانات إلى ${format === 'word' ? 'Word' : 'HTML'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("فشل التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0 && !includeCenterInfo) {
      toast.error("لم يتم اختيار أي موظفين أو بيانات مركز");
      return;
    }

    const html = generateTableHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="text-blue-600" />
            استخراج بيان موظفي {centerName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees">الموظفين ({selectedEmployeeIds.size})</TabsTrigger>
            <TabsTrigger value="centerInfo" className="gap-1">
              <Building2 className="w-3 h-3" />
              بيانات المركز
            </TabsTrigger>
            <TabsTrigger value="fields">الحقول ({selectedFields.size})</TabsTrigger>
            <TabsTrigger value="header">الترويسة</TabsTrigger>
          </TabsList>

          {/* اختيار الموظفين */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">تحديد الكل ({orderedEmployees.length} موظف)</span>
              <Checkbox
                checked={selectedEmployeeIds.size === orderedEmployees.length && orderedEmployees.length > 0}
                onCheckedChange={handleSelectAllEmployees}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">
                💡 يمكنك سحب وإفلات الموظفين لتغيير الترتيب، أو استخدام الأسهم
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="employees">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-3"
                  >
                    {orderedEmployees.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        لا يوجد موظفون في هذا المركز
                      </div>
                    ) : (
                      orderedEmployees.map((emp, index) => (
                        <Draggable key={emp.id} draggableId={emp.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                selectedEmployeeIds.has(emp.id) 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-white hover:bg-gray-50'
                              } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>

                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{emp.full_name_arabic}</div>
                                <div className="text-sm text-gray-600">
                                  {emp.position} • {emp.رقم_الموظف}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEmployee(index, 'up')}
                                  disabled={index === 0}
                                  className="h-8 w-8"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEmployee(index, 'down')}
                                  disabled={index === orderedEmployees.length - 1}
                                  className="h-8 w-8"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </div>

                              <Checkbox
                                checked={selectedEmployeeIds.has(emp.id)}
                                onCheckedChange={() => handleToggleEmployee(emp.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>

          {/* بيانات المركز */}
          <TabsContent value="centerInfo" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-900">تضمين بيانات المركز الصحي</p>
                  <p className="text-sm text-blue-700">إضافة معلومات المركز مع بيانات الموظفين في تقرير واحد</p>
                </div>
              </div>
              <Checkbox
                checked={includeCenterInfo}
                onCheckedChange={(checked) => setIncludeCenterInfo(checked)}
              />
            </div>

            {includeCenterInfo && (
              <div className="grid grid-cols-2 gap-3">
                {centerSectionOptions.map(section => (
                  <div
                    key={section.key}
                    className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedCenterSections.has(section.key)
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => toggleCenterSection(section.key)}
                  >
                    <Checkbox
                      checked={selectedCenterSections.has(section.key)}
                      onCheckedChange={() => toggleCenterSection(section.key)}
                    />
                    <Label className="cursor-pointer flex-1">{section.label}</Label>
                  </div>
                ))}
              </div>
            )}

            {!center && (
              <div className="text-center py-8 text-gray-400">
                بيانات المركز غير متاحة
              </div>
            )}
          </TabsContent>

          {/* اختيار الحقول */}
          <TabsContent value="fields" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {fieldDefinitions.map(field => (
                <div
                  key={field.key}
                  className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border transition-all ${
                    selectedFields.has(field.key)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.has(field.key)}
                    onCheckedChange={() => handleToggleField(field.key)}
                  />
                  <Label htmlFor={field.key} className="cursor-pointer flex-1">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* معلومات الترويسة */}
          <TabsContent value="header" className="space-y-4">
            <div>
              <Label htmlFor="centerName" className="mb-2 block">اسم المركز</Label>
              <Input
                id="centerName"
                value={centerName}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="administrationName" className="mb-2 block">اسم الإدارة</Label>
              <Input
                id="administrationName"
                value={administrationName}
                onChange={(e) => setAdministrationName(e.target.value)}
                placeholder="مثال: إدارة الشؤون الصحية - الحناكية"
              />
            </div>

            <div>
              <Label htmlFor="managerName" className="mb-2 block">اسم المدير</Label>
              <Input
                id="managerName"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="اسم المدير الذي سيظهر في التوقيع"
              />
              {manager && (
                <p className="text-xs text-gray-500 mt-1">
                  المدير الحالي: {manager.full_name_arabic}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="managerTitle" className="mb-2 block">المسمى الوظيفي للمدير</Label>
              <Input
                id="managerTitle"
                value={managerTitle}
                onChange={(e) => setManagerTitle(e.target.value)}
                placeholder="مثال: مدير إدارة شؤون المراكز الصحية بالحناكية"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* معاينة */}
        {(selectedEmployeeIds.size > 0 || includeCenterInfo) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">
                {includeCenterInfo && selectedEmployeeIds.size > 0
                  ? `سيتم تصدير بيانات المركز + ${selectedEmployeeIds.size} موظف مع ${selectedFields.size} حقل`
                  : includeCenterInfo
                  ? `سيتم تصدير بيانات المركز (${selectedCenterSections.size} قسم)`
                  : `سيتم تصدير ${selectedEmployeeIds.size} موظف مع ${selectedFields.size} حقل بيانات`
                }
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyTable}
            disabled={isExporting || (selectedEmployeeIds.size === 0 && !includeCenterInfo)}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            نسخ الجدول
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isExporting || (selectedEmployeeIds.size === 0 && !includeCenterInfo)}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            طباعة
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting || selectedEmployeeIds.size === 0}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>

          <Button
            onClick={() => handleExport('word')}
            disabled={isExporting || (selectedEmployeeIds.size === 0 && !includeCenterInfo)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FileDown className="w-4 h-4" />
            Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}