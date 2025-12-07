import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Image as ImageIcon, 
  Save, 
  Edit, 
  Plus, 
  Trash2, 
  Copy,
  FileSpreadsheet,
  Printer,
  Eye
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StatementEditor({ 
  extractedData, 
  holidayType, 
  year, 
  yearType, 
  onClose,
  initialStatement = null 
}) {
  const contentRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  const [statementData, setStatementData] = useState({
    title: initialStatement?.title || `بيان تكليف ${holidayType} ${year} ${yearType === 'hijri' ? 'هـ' : 'م'}`,
    holiday_type: holidayType,
    year: year,
    year_type: yearType,
    start_date: initialStatement?.start_date || '',
    end_date: initialStatement?.end_date || '',
    department: initialStatement?.department || 'إدارة المراكز الصحية بالحناكية',
    header_text: initialStatement?.header_text || '',
    footer_text: initialStatement?.footer_text || '',
    employees_data: initialStatement?.employees_data || (extractedData || []).map(emp => ({
      employee_id: '',
      full_name: emp.full_name || '',
      employee_number: emp.employee_number || '',
      national_id: emp.national_id || '',
      position: emp.position || '',
      health_center: emp.health_center || '',
      phone: '',
      department: '',
      notes: ''
    }))
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await base44.entities.Employee.list('-full_name_arabic', 1000);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const enrichEmployeeData = (rowIndex) => {
    const empData = statementData.employees_data[rowIndex];
    if (!empData.employee_number && !empData.national_id) {
      alert('يرجى إدخال رقم الموظف أو رقم الهوية أولاً');
      return;
    }

    const employee = employees.find(e => 
      e.رقم_الموظف === empData.employee_number || 
      e.رقم_الهوية === empData.national_id
    );

    if (employee) {
      const updatedEmployees = [...statementData.employees_data];
      updatedEmployees[rowIndex] = {
        ...empData,
        employee_id: employee.id,
        full_name: employee.full_name_arabic || empData.full_name,
        employee_number: employee.رقم_الموظف || empData.employee_number,
        national_id: employee.رقم_الهوية || empData.national_id,
        position: employee.position || empData.position,
        health_center: employee.المركز_الصحي || empData.health_center,
        phone: employee.phone || empData.phone,
        department: employee.department || empData.department
      };
      setStatementData(prev => ({ ...prev, employees_data: updatedEmployees }));
      alert('تم تعبئة البيانات من النظام');
    } else {
      alert('لم يتم العثور على الموظف في النظام');
    }
  };

  const handleAddRow = () => {
    setStatementData(prev => ({
      ...prev,
      employees_data: [...prev.employees_data, {
        employee_id: '',
        full_name: '',
        employee_number: '',
        national_id: '',
        position: '',
        health_center: '',
        phone: '',
        department: '',
        notes: ''
      }]
    }));
  };

  const handleDeleteRow = (index) => {
    if (confirm('هل أنت متأكد من حذف هذا السطر؟')) {
      setStatementData(prev => ({
        ...prev,
        employees_data: prev.employees_data.filter((_, i) => i !== index)
      }));
    }
  };

  const handleUpdateRow = (index, field, value) => {
    const updatedEmployees = [...statementData.employees_data];
    updatedEmployees[index] = {
      ...updatedEmployees[index],
      [field]: value
    };
    setStatementData(prev => ({ ...prev, employees_data: updatedEmployees }));
  };

  const handleSave = async () => {
    if (!statementData.title || statementData.employees_data.length === 0) {
      alert('يرجى إدخال العنوان وإضافة موظف واحد على الأقل');
      return;
    }

    setIsSaving(true);
    try {
      if (initialStatement?.id) {
        await base44.entities.HolidayAssignmentStatement.update(initialStatement.id, statementData);
        alert('✅ تم تحديث البيان بنجاح');
      } else {
        await base44.entities.HolidayAssignmentStatement.create({
          ...statementData,
          status: 'draft'
        });
        alert('✅ تم حفظ البيان بنجاح');
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportToImage = async () => {
    if (!window.html2canvas) {
      alert('جاري تحميل المكتبات المطلوبة، الرجاء المحاولة مرة أخرى بعد ثانية');
      return;
    }

    try {
      const element = contentRef.current;
      const canvas = await window.html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `${statementData.title}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      alert('✅ تم تصدير البيان كصورة');
    } catch (error) {
      console.error('Export error:', error);
      alert('حدث خطأ أثناء التصدير');
    }
  };

  const handleExportToExcel = () => {
    const headers = ['#', 'الاسم', 'رقم الموظف', 'رقم الهوية', 'الوظيفة', 'المركز الصحي', 'الجوال', 'القسم', 'ملاحظات'];
    const rows = statementData.employees_data.map((emp, idx) => [
      idx + 1,
      emp.full_name,
      emp.employee_number,
      emp.national_id,
      emp.position,
      emp.health_center,
      emp.phone,
      emp.department,
      emp.notes
    ]);

    let csvContent = '\ufeff';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell || ''}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${statementData.title}.csv`;
    link.click();
    
    alert('✅ تم تصدير البيان كملف Excel');
  };

  const handleExportToWord = () => {
    const htmlContent = contentRef.current.innerHTML;
    const blob = new Blob([`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `], { type: 'application/msword' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${statementData.title}.doc`;
    link.click();
    
    alert('✅ تم تصدير البيان كملف Word');
  };

  const handleCopyTable = () => {
    const table = contentRef.current;
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('✅ تم نسخ الجدول');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>محرر بيان التكليف</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyTable}>
                <Copy className="w-4 h-4 ml-1" />
                نسخ
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 ml-1" />
                طباعة
              </Button>
              <Button size="sm" onClick={() => setShowExportMenu(true)} className="bg-blue-600">
                <Download className="w-4 h-4 ml-1" />
                تصدير
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-green-600">
                <Save className="w-4 h-4 ml-1" />
                حفظ
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات البيان</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>العنوان</Label>
                <Input
                  value={statementData.title}
                  onChange={(e) => setStatementData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>الإدارة/الجهة</Label>
                <Input
                  value={statementData.department}
                  onChange={(e) => setStatementData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div>
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={statementData.start_date}
                  onChange={(e) => setStatementData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={statementData.end_date}
                  onChange={(e) => setStatementData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>نص المقدمة (اختياري)</Label>
                <Textarea
                  value={statementData.header_text}
                  onChange={(e) => setStatementData(prev => ({ ...prev, header_text: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Label>نص الختام (اختياري)</Label>
                <Textarea
                  value={statementData.footer_text}
                  onChange={(e) => setStatementData(prev => ({ ...prev, footer_text: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">معاينة البيان</CardTitle>
              <Button size="sm" onClick={handleAddRow}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة صف
              </Button>
            </CardHeader>
            <CardContent>
              <div ref={contentRef} className="p-6 bg-white border rounded-lg print-area">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">{statementData.title}</h2>
                  <p className="text-lg">{statementData.department}</p>
                  {(statementData.start_date || statementData.end_date) && (
                    <p className="text-gray-600 mt-2">
                      المدة: من {statementData.start_date || '___'} إلى {statementData.end_date || '___'}
                    </p>
                  )}
                </div>

                {statementData.header_text && (
                  <div className="mb-4 text-right">
                    <p className="whitespace-pre-wrap">{statementData.header_text}</p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-center border">#</TableHead>
                        <TableHead className="text-center border">الاسم</TableHead>
                        <TableHead className="text-center border">رقم الموظف</TableHead>
                        <TableHead className="text-center border">رقم الهوية</TableHead>
                        <TableHead className="text-center border">الوظيفة</TableHead>
                        <TableHead className="text-center border">المركز الصحي</TableHead>
                        <TableHead className="text-center border">الجوال</TableHead>
                        <TableHead className="text-center border">القسم</TableHead>
                        <TableHead className="text-center border no-print">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statementData.employees_data.map((emp, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center border">{index + 1}</TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.full_name}
                                onChange={(e) => handleUpdateRow(index, 'full_name', e.target.value)}
                                className="min-w-[150px]"
                              />
                            ) : (
                              emp.full_name
                            )}
                          </TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.employee_number}
                                onChange={(e) => handleUpdateRow(index, 'employee_number', e.target.value)}
                              />
                            ) : (
                              emp.employee_number
                            )}
                          </TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.national_id}
                                onChange={(e) => handleUpdateRow(index, 'national_id', e.target.value)}
                              />
                            ) : (
                              emp.national_id
                            )}
                          </TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.position}
                                onChange={(e) => handleUpdateRow(index, 'position', e.target.value)}
                              />
                            ) : (
                              emp.position
                            )}
                          </TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.health_center}
                                onChange={(e) => handleUpdateRow(index, 'health_center', e.target.value)}
                              />
                            ) : (
                              emp.health_center
                            )}
                          </TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.phone}
                                onChange={(e) => handleUpdateRow(index, 'phone', e.target.value)}
                              />
                            ) : (
                              emp.phone
                            )}
                          </TableCell>
                          <TableCell className="border">
                            {editingRowIndex === index ? (
                              <Input
                                value={emp.department}
                                onChange={(e) => handleUpdateRow(index, 'department', e.target.value)}
                              />
                            ) : (
                              emp.department
                            )}
                          </TableCell>
                          <TableCell className="border no-print">
                            <div className="flex gap-1 justify-center">
                              {editingRowIndex === index ? (
                                <Button size="sm" variant="ghost" onClick={() => setEditingRowIndex(null)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => setEditingRowIndex(index)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => enrichEmployeeData(index)}>
                                <Plus className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteRow(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {statementData.footer_text && (
                  <div className="mt-4 text-right">
                    <p className="whitespace-pre-wrap">{statementData.footer_text}</p>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="font-bold">مدير إدارة المراكز الصحية بالحناكية</p>
                  <p className="font-bold">أ/ عبدالمجيد سعود الربيقي</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      <Dialog open={showExportMenu} onOpenChange={setShowExportMenu}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تصدير البيان</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleExportToImage} className="flex-col h-24">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span>صورة (PNG)</span>
            </Button>
            <Button onClick={handleExportToExcel} className="flex-col h-24 bg-green-600">
              <FileSpreadsheet className="w-8 h-8 mb-2" />
              <span>Excel (CSV)</span>
            </Button>
            <Button onClick={handleExportToWord} className="flex-col h-24 bg-blue-600">
              <FileText className="w-8 h-8 mb-2" />
              <span>Word (DOC)</span>
            </Button>
            <Button onClick={handlePrint} className="flex-col h-24 bg-gray-600">
              <Printer className="w-8 h-8 mb-2" />
              <span>طباعة (PDF)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// تحميل html2canvas من CDN
if (typeof window !== 'undefined') {
  const script1 = document.createElement('script');
  script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  document.head.appendChild(script1);
}