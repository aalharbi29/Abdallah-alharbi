import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Settings2,
  Eye,
  CheckSquare,
  Square,
  PenLine
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

export default function CustomExportManager({ 
  data,
  employees, // إضافة دعم لكلا الاسمين
  defaultFilename = "تقرير", 
  availableFields,
  type = "employees" // employees, departments, healthcenters
}) {
  // استخدام data أو employees أيهما متوفر
  const exportData = data || employees || [];
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [filename, setFilename] = useState(defaultFilename);
  const [isExporting, setIsExporting] = useState(false);

  // States for custom text
  const [exportTitle, setExportTitle] = useState(defaultFilename);
  const [preambleText, setPreambleText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);

  // تعريف الحقول المتاحة حسب النوع
  const fieldDefinitions = useMemo(() => {
    switch(type) {
      case 'employees':
        return {
          'full_name_arabic': 'الاسم الكامل',
          'رقم_الموظف': 'الرقم الوظيفي',
          'رقم_الهوية': 'رقم الهوية',
          'email': 'البريد الإلكتروني',
          'phone': 'رقم الجوال',
          'المركز_الصحي': 'المركز الصحي',
          'position': 'التخصص',
          'department': 'القسم',
          'job_category': 'ملاك الوظيفة',
          'job_category_type': 'فئة الوظيفة',
          'qualification': 'المؤهل',
          'rank': 'المرتبة',
          'sequence': 'التسلسل',
          'contract_type': 'نوع العقد',
          'contract_end_date': 'تاريخ نهاية العقد',
          'gender': 'الجنس',
          'nationality': 'الجنسية',
          'hire_date': 'تاريخ التوظيف',
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
          'center_code': 'كود المركز',
          'organization_code': 'الرقم الوزاري',
          'خط_الطول': 'خط الطول',
          'خط_العرض': 'خط العرض',
          'موقع_الخريطة': 'رابط الخريطة',
          'حالة_التشغيل': 'حالة التشغيل',
          'حالة_المركز': 'نوع الملكية',
          'مركز_نائي': 'مركز نائي',
          'هاتف_المركز': 'الهاتف الرئيسي',
          'رقم_الشريحة': 'رقم الشريحة',
          'رقم_الجوال': 'رقم الجوال',
          'رقم_الهاتف_الثابت': 'الهاتف الثابت الإضافي',
          'ايميل_المركز': 'البريد الإلكتروني',
          'فاكس_المركز': 'الفاكس',
          'المدير': 'المدير',
          'نائب_المدير': 'نائب المدير',
          'المشرف_الفني': 'المشرف الفني',
          'employee_count': 'عدد الموظفين',
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
        } else if (field === 'hire_date' || field === 'birth_date' || field === 'contract_end_date') {
                        filteredItem[field] = item[field] ? new Date(item[field]).toLocaleDateString('ar-SA') : '';
        } else {
          filteredItem[field] = item[field] || '';
        }
      });
      return filteredItem;
    });
  }, [exportData, selectedFields, type]);

  const generateCSV = () => {
    if (!selectedFields.length || !sortedExportData || sortedExportData.length === 0) return '';
    
    const headers = selectedFields.map(field => fieldDefinitions[field]);
    const csvRows = [headers.join(',')];
    
    sortedExportData.forEach(item => {
      const values = selectedFields.map(field => {
        let value = '';
        if (field === 'special_roles' && Array.isArray(item[field])) {
          value = item[field].join(', ');
        } else if (field === 'assigned_tasks' && Array.isArray(item[field])) {
          value = item[field].join(', ');
        } else if (field === 'employee_count' && type === 'healthcenters') {
          value = item.employees ? item.employees.length : 0;
        } else if (field === 'hire_date' || field === 'birth_date' || field === 'contract_end_date') {
          value = item[field] ? new Date(item[field]).toLocaleDateString('ar-SA') : '';
        } else {
          value = item[field] || '';
        }
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const generateHTML = () => {
    if (!selectedFields.length && !preambleText && !footerText) return '';

    const headers = selectedFields.map(field => fieldDefinitions[field]);
    const headerRow = headers.map(h => `<th style="background-color: #f5f5f5; padding: 12px; border: 1px solid #ddd; font-weight: bold; text-align: center;">${h}</th>`).join('');
    
    const dataRows = (sortedExportData || []).map(item => {
      const cells = selectedFields.map(field => {
        let value = '';
        if (field === 'special_roles' && Array.isArray(item[field])) {
          value = item[field].join(', ');
        } else if (field === 'assigned_tasks' && Array.isArray(item[field])) {
          value = item[field].join(', ');
        } else if (field === 'employee_count' && type === 'healthcenters') {
          value = item.employees ? item.employees.length : 0;
        } else if (field === 'hire_date' || field === 'birth_date' || field === 'contract_end_date') {
          value = item[field] ? new Date(item[field]).toLocaleDateString('ar-SA') : '';
        } else {
          value = item[field] || '';
        }
        return `<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${value}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const signatureBlock = `
      <div style="text-align: center; margin-top: 50px; page-break-inside: avoid;">
        <p style="margin: 0; font-weight: bold;">مدير ادارة المراكز الصحية بالحناكية</p>
        <p style="margin: 5px 0 0 0; font-weight: bold;">أ/ عبدالمجيد سعود الربيقي</p>
        <div style="position: relative; width: 250px; height: 100px; margin: -20px auto 0 auto;">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png" alt="Signature" style="position: absolute; left: 0; top: 0; width: 150px; mix-blend-mode: darken;">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png" alt="Stamp" style="position: absolute; right: 0; top: 10px; width: 100px; opacity: 0.9;">
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>${exportTitle}</title>
          <style>
            body { font-family: 'Times New Roman', Arial, sans-serif; direction: rtl; margin: 1in; font-size: 12pt; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11pt; }
            th, td { border: 1px solid #000; text-align: center; padding: 8px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            h1 { text-align: center; color: #000; margin-bottom: 20px; font-size: 16pt; font-weight: bold; }
            .preamble { text-align: right; margin-bottom: 20px; line-height: 1.6; }
            .footer-text { text-align: right; margin-top: 20px; line-height: 1.6; }
            @page { size: A4; margin: 1in; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${exportTitle}</h1>
          <p class="export-date" style="text-align: center; color: #666; font-size: 10pt; margin-bottom: 20px;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</p>
          ${preambleText ? `<div class="preamble">${preambleText.replace(/\n/g, '<br/>')}</div>` : ''}
          ${selectedFields.length > 0 ? `
            <table>
              <thead><tr>${headerRow}</tr></thead>
              <tbody>${dataRows}</tbody>
            </table>
          ` : ''}
          ${footerText ? `<div class="footer-text">${footerText.replace(/\n/g, '<br/>')}</div>` : ''}
          ${includeSignature ? signatureBlock : ''}
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
        case 'excel':
          const csvContent = "\ufeff" + generateCSV();
          downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
          break;
          
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
          تصدير مخصص
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