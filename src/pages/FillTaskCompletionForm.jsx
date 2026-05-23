import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Download, Save, ArrowRight, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeSearchCombobox from '@/components/employees/EmployeeSearchCombobox';
import HijriDatePicker from '@/components/ui/HijriDatePicker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';

const ASSIGNMENT_TYPE_OPTIONS = [
  'عيد الفطر المبارك',
  'عيد الأضحى المبارك',
  'يوم التأسيس',
  'اليوم الوطني',
  'أيام الراحة',
];

const cellBorder = '1px solid #000';

const labelCellStyle = {
  border: cellBorder,
  padding: '8px 10px',
  fontSize: '11pt',
  fontWeight: 700,
  background: '#F2F2F2',
  color: '#000',
  textAlign: 'right',
  width: '28%',
  verticalAlign: 'middle',
};

const valueCellStyle = {
  border: cellBorder,
  padding: '8px 10px',
  fontSize: '11pt',
  fontWeight: 600,
  background: '#FFFFFF',
  color: '#000',
  textAlign: 'right',
  verticalAlign: 'middle',
};

const sectionHeaderStyle = {
  border: cellBorder,
  padding: '8px 10px',
  fontSize: '12pt',
  fontWeight: 800,
  background: '#0B3D91',
  color: '#FFFFFF',
  textAlign: 'center',
};

export default function FillTaskCompletionForm() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // بيانات الموظف
  const [nationalId, setNationalId] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobGrade, setJobGrade] = useState('');
  const [nationality, setNationality] = useState('');

  // التكليف
  const [assignmentYear, setAssignmentYear] = useState('1447');
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [employeeSignatureDate, setEmployeeSignatureDate] = useState('');

  // الإدارة
  const [departmentName, setDepartmentName] = useState('');
  const [assignmentStart, setAssignmentStart] = useState('');
  const [assignmentEnd, setAssignmentEnd] = useState('');
  const [actualDays, setActualDays] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerDate, setManagerDate] = useState('');

  // حياك
  const [hayakOfficerName, setHayakOfficerName] = useState('');
  const [hayakDays, setHayakDays] = useState('');

  // الموارد البشرية
  const [hrManagerName, setHrManagerName] = useState('');

  const printRef = useRef(null);
  const scalerRef = useRef(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    setNationalId(selectedEmployee['رقم_الهوية'] || '');
    setJobType(selectedEmployee.position || '');
    setJobGrade(selectedEmployee.job_category || selectedEmployee.job_category_type || '');
    setNationality(selectedEmployee.nationality || '');
    setDepartmentName(selectedEmployee['المركز_الصحي'] || '');
  }, [selectedEmployee]);

  // scale
  const [previewScale, setPreviewScale] = useState(1);
  useEffect(() => {
    const update = () => {
      if (!scalerRef.current) return;
      setPreviewScale(scalerRef.current.offsetWidth / 794);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await base44.entities.Employee.list('-updated_date', 1000);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleType = (t) => {
    setAssignmentTypes((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const formStatus = useMemo(() => {
    const required = [selectedEmployee?.full_name_arabic, nationalId, jobType, assignmentYear, assignmentTypes.length, assignmentStart, assignmentEnd];
    const filled = required.filter(Boolean).length;
    if (filled === 0) return 'فارغ';
    if (filled < required.length) return 'جزئي';
    return 'مكتمل';
  }, [selectedEmployee, nationalId, jobType, assignmentYear, assignmentTypes, assignmentStart, assignmentEnd]);

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    toast.info('جاري إنشاء ملف PDF...');
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`مشهد_إنجاز_مهمة_${selectedEmployee?.full_name_arabic || 'موظف'}.pdf`);
      toast.success('تم حفظ PDF');
    } catch (e) {
      console.error(e);
      toast.error('فشل التصدير');
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedEmployee) { toast.error('اختر الموظف أولاً'); return; }
    try {
      await base44.entities.TaskCompletion.create({
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.full_name_arabic,
        national_id: nationalId,
        job_type: jobType,
        job_grade: jobGrade,
        nationality,
        assignment_year: assignmentYear,
        assignment_types: assignmentTypes,
        employee_signature_date: employeeSignatureDate,
        department_name: departmentName,
        assignment_start: assignmentStart,
        assignment_end: assignmentEnd,
        actual_days: actualDays,
        manager_name: managerName,
        manager_date: managerDate,
        hayak_officer_name: hayakOfficerName,
        hayak_days: hayakDays,
        hr_manager_name: hrManagerName,
        form_status: formStatus,
      });
      toast.success('تم حفظ المشهد');
    } catch (e) {
      console.error(e);
      toast.error('فشل الحفظ');
    }
  };

  const renderRow = (label, value) => (
    <tr>
      <td style={labelCellStyle}>{label}</td>
      <td style={valueCellStyle}>{value || ''}</td>
    </tr>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .preview-page { transform: none !important; position: static !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4">
        <div className="no-print flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-blue-700" />
              مشهد إنجاز مهمة عمل
            </h1>
            <p className="text-sm text-gray-600 mt-1">تعبئة نموذج مشهد إنجاز مهمة عمل تفاعلي مع تعبئة تلقائية من بيانات الموظف</p>
          </div>
          <Link to="/InteractiveForms">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 ml-2" /> العودة
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* نموذج الإدخال */}
          <Card className="no-print">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">بيانات النموذج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">الموظف</Label>
                <div className="mt-1">
                  <EmployeeSearchCombobox employees={employees} onSelect={setSelectedEmployee} buttonClassName="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">الهوية / الإقامة</Label>
                  <Input value={nationalId} onChange={e => setNationalId(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">الجنسية</Label>
                  <Input value={nationality} onChange={e => setNationality(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">نوع الوظيفة</Label>
                  <Input value={jobType} onChange={e => setJobType(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">الملاك الوظيفي</Label>
                  <Input value={jobGrade} onChange={e => setJobGrade(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-bold">التكليف</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">نوع التكليف لعام (هجري)</Label>
                    <Input value={assignmentYear} onChange={e => setAssignmentYear(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">تاريخ توقيع الموظف</Label>
                    <HijriDatePicker value={employeeSignatureDate} onChange={setEmployeeSignatureDate} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center" />
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-xs">نوع التكليف (اختيار متعدد)</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {ASSIGNMENT_TYPE_OPTIONS.map(t => (
                      <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={assignmentTypes.includes(t)} onCheckedChange={() => toggleType(t)} />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-bold">بيانات الإدارة / القسم</Label>
                <div>
                  <Label className="text-xs">اسم الإدارة</Label>
                  <Input value={departmentName} onChange={e => setDepartmentName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">بداية التكليف</Label>
                    <HijriDatePicker value={assignmentStart} onChange={setAssignmentStart} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center" />
                  </div>
                  <div>
                    <Label className="text-xs">نهاية التكليف</Label>
                    <HijriDatePicker value={assignmentEnd} onChange={setAssignmentEnd} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center" />
                  </div>
                  <div>
                    <Label className="text-xs">الأيام الفعلية</Label>
                    <Input value={actualDays} onChange={e => setActualDays(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">تاريخ المدير</Label>
                    <HijriDatePicker value={managerDate} onChange={setManagerDate} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center" />
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-xs">اسم مدير الإدارة / رئيس القسم</Label>
                  <Input value={managerName} onChange={e => setManagerName(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-bold">نظام حياك</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">مسؤول نظام حياك</Label>
                    <Input value={hayakOfficerName} onChange={e => setHayakOfficerName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">عدد الأيام من حياك</Label>
                    <Input value={hayakDays} onChange={e => setHayakDays(e.target.value)} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-bold">الموارد البشرية</Label>
                <Input value={hrManagerName} onChange={e => setHrManagerName(e.target.value)} className="mt-1" placeholder="اسم مدير الموارد البشرية" />
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Printer className="w-4 h-4 ml-1" /> طباعة
                </Button>
                <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700" size="sm">
                  <Download className="w-4 h-4 ml-1" /> تصدير PDF
                </Button>
                <Button onClick={handleSaveRecord} className="bg-emerald-600 hover:bg-emerald-700" size="sm" disabled={!selectedEmployee}>
                  <Save className="w-4 h-4 ml-1" /> حفظ المشهد
                </Button>
                <span className="text-xs text-gray-500 self-center mr-auto">الحالة: <strong>{formStatus}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* المعاينة */}
          <Card>
            <CardHeader className="pb-3 no-print">
              <CardTitle className="text-base">معاينة المشهد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="print-area" style={{ display: 'flex', justifyContent: 'center' }}>
                <div ref={scalerRef} style={{ width: '100%', aspectRatio: '210 / 297', position: 'relative', overflow: 'hidden' }}>
                  <div ref={printRef} className="bg-white preview-page" style={{
                    fontFamily: "'Tajawal', 'Cairo', sans-serif",
                    direction: 'rtl',
                    width: '210mm',
                    height: '297mm',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top right',
                    padding: '12mm 12mm',
                    color: '#000',
                    border: '1.5px solid #000',
                    boxSizing: 'border-box',
                  }}>
                    {/* الترويسة */}
                    <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '10px' }}>
                      <div style={{ fontSize: '20pt', fontWeight: 800, color: '#000' }}>(مشهد إنجاز مهمة)</div>
                    </div>

                    {/* جدول بيانات الموظف - 5 أعمدة */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                      <thead>
                        <tr>
                          <th style={{ border: cellBorder, padding: '8px 6px', fontSize: '11pt', fontWeight: 800, background: '#FFFFFF', textAlign: 'center' }}>الاسم</th>
                          <th style={{ border: cellBorder, padding: '8px 6px', fontSize: '11pt', fontWeight: 800, background: '#FFFFFF', textAlign: 'center' }}>الهوية الوطنية/الاقامة</th>
                          <th style={{ border: cellBorder, padding: '8px 6px', fontSize: '11pt', fontWeight: 800, background: '#FFFFFF', textAlign: 'center' }}>نوع الوظيفة</th>
                          <th style={{ border: cellBorder, padding: '8px 6px', fontSize: '11pt', fontWeight: 800, background: '#FFFFFF', textAlign: 'center' }}>الملاك الوظيفي</th>
                          <th style={{ border: cellBorder, padding: '8px 6px', fontSize: '11pt', fontWeight: 800, background: '#FFFFFF', textAlign: 'center' }}>الجنسية</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: cellBorder, padding: '10px 6px', fontSize: '10.5pt', textAlign: 'center', height: '36px' }}>{selectedEmployee?.full_name_arabic || ''}</td>
                          <td style={{ border: cellBorder, padding: '10px 6px', fontSize: '10.5pt', textAlign: 'center' }}>{nationalId}</td>
                          <td style={{ border: cellBorder, padding: '10px 6px', fontSize: '10.5pt', textAlign: 'center' }}>{jobType}</td>
                          <td style={{ border: cellBorder, padding: '10px 6px', fontSize: '10.5pt', textAlign: 'center' }}>{jobGrade}</td>
                          <td style={{ border: cellBorder, padding: '10px 6px', fontSize: '10.5pt', textAlign: 'center' }}>{nationality}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* قسم: نوع التكليف */}
                    <div style={{ border: cellBorder, padding: '10px 12px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'left', fontWeight: 800, fontSize: '11.5pt', textDecoration: 'underline', marginBottom: '8px' }}>
                        نوع التكليف: لعام ( {assignmentYear || ''} )
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '10.5pt', fontWeight: 600 }}>
                        {ASSIGNMENT_TYPE_OPTIONS.map(t => (
                          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '1.2px solid #000', textAlign: 'center', lineHeight: '11px', fontWeight: 900, fontSize: '10pt' }}>
                              {assignmentTypes.includes(t) ? '✓' : ''}
                            </span>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* قسم: إقرار التشغيل الذاتي */}
                    <div style={{ border: cellBorder, padding: '10px 12px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'left', fontWeight: 800, fontSize: '11.5pt', textDecoration: 'underline', marginBottom: '8px' }}>
                        إقــرار ( التشغيل الذاتي ):
                      </div>
                      <p style={{ margin: 0, fontSize: '10.5pt', fontWeight: 600, lineHeight: 1.9 }}>
                        أقر أنا الموظف الموضح اسمي وبياناتي أعلاه بموافقتي على أن يكون التعويض بأيام إجازة تعويضية بدلاً من التعويض المالي وبما لا يتعارض مع الأنظمة والتعليمات ذات الصلة.
                      </p>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '30px', fontSize: '10.5pt', fontWeight: 700 }}>
                        <span>التوقيع : .................................</span>
                        <span>التاريخ: {employeeSignatureDate || '   /   /   '} 144 هـ</span>
                      </div>
                    </div>

                    {/* قسم: مدير الإدارة / رئيس القسم */}
                    <div style={{ border: cellBorder, padding: '10px 12px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'left', fontWeight: 800, fontSize: '11.5pt', textDecoration: 'underline', marginBottom: '8px' }}>
                        مدير الإدارة / رئيس القسم:
                      </div>
                      <p style={{ margin: 0, fontSize: '10.5pt', fontWeight: 600, lineHeight: 1.9 }}>
                        تشهد إدارة <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '260px', textAlign: 'center', fontWeight: 700 }}>{departmentName || '....................................................'}</span> بأن الموضح اسمه وبياناته أعلاه قد أتم فترة التكليف خلال الفترة المشار لها أدناه وقد تم تحرير هذا المشهد لغرض احتساب الإجازة التعويضية المستحقة له.
                      </p>
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '10.5pt', fontWeight: 700 }}>
                        <span>بداية التكليف: {assignmentStart || '  /  /  '} 144 هـ</span>
                        <span>نهاية التكليف: {assignmentEnd || '  /  /  '} 144 هـ</span>
                        <span>الأيام الفعلية ( {actualDays || '   '} ) .</span>
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '10.5pt', fontWeight: 700 }}>
                        <span>اسم مدير الإدارة / رئيس القسم: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '160px', textAlign: 'center' }}>{managerName || ''}</span></span>
                        <span>التوقيع: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px' }}></span></span>
                        <span>التاريخ: {managerDate || '  /  /  '} 144 هـ</span>
                      </div>
                    </div>

                    {/* قسم: خاص بالموارد البشرية */}
                    <div style={{ border: cellBorder, padding: '10px 12px', marginBottom: '12px' }}>
                      <div style={{ textAlign: 'left', fontWeight: 800, fontSize: '11.5pt', textDecoration: 'underline', marginBottom: '8px' }}>
                        خاص إدارة الموارد البشرية:
                      </div>
                      <div style={{ fontSize: '10.5pt', fontWeight: 700, lineHeight: 2 }}>
                        <div>
                          مسؤول نظام حياك: الاسم: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px', textAlign: 'center' }}>{hayakOfficerName || ''}</span>
                          {' '}التوقيع: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px' }}></span>
                          {' '}عدد الأيام الفعلية من واقع نظام حياك ( {hayakDays || '   '} ) يوم
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          مدير الموارد البشرية: الاسم: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '160px', textAlign: 'center' }}>{hrManagerName || ''}</span>
                          {' '}التوقيع: <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px' }}></span>
                          {' '}الختم
                        </div>
                      </div>
                    </div>

                    {/* تعليمات */}
                    <div style={{ fontSize: '8.5pt', lineHeight: 1.6, color: '#000' }}>
                      <div style={{ fontWeight: 800, fontSize: '10pt', color: '#1565C0', textDecoration: 'underline', marginBottom: '4px' }}>تعليمات:</div>
                      <ol style={{ margin: 0, paddingRight: '18px', textAlign: 'justify', fontWeight: 700 }}>
                        <li style={{ marginBottom: '3px' }}>يشترط تعبئة جميع الحقول وعدم الالتزام بذلك يؤدي إلى إلغاء المشهد. وهذا المشهد للترصيد فقط وأي كشط أو تعديل فيه يعد لاغياً وغير معتمد نظاماً.</li>
                        <li style={{ marginBottom: '3px' }}>منسوبي التشغيل الذاتي التكليف أيام العطل الرسمية اليوم بيومين بناء على ما ورد في الفقرة (ب) من المادة 86 من لائحة تنظيم العمل لبرامج التشغيل الذاتي.</li>
                        <li style={{ marginBottom: '3px' }}>منسوبي الخدمة المدنية التكليف أيام العطل رسمية اليوم بيوم عدا يوم العيد واليومين الذي بعده فيكون التعويض على أساس اليوم بيومين بناء على المادة 129 من اللائحة التنفيذية للموارد البشرية في الخدمة المدنية.</li>
                        <li style={{ marginBottom: '3px' }}>منسوبي المدن الطبية التكليف أيام العطل الرسمية اليوم الأول من العيد بيومين وباقي الأيام بيوم ونصف بناء على المادة 5-2.5 من لائحة المدن الطبية ما عدا اليوم الوطني ويوم التأسيس اليوم بيوم.</li>
                        <li style={{ marginBottom: '3px' }}>منسوبي شركة الصحة القابضة يتم التعويض عن تكليف أيام العطل الرسمية وفقاً لما ورد بالمادة 107 من نظام العمل (اليوم بيوم ونصف).</li>
                        <li>المتعاقدين الغير سعوديين اليوم بيوم.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}