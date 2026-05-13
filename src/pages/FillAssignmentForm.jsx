import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download, Save, ArrowRight, FileText, ClipboardSignature } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeSearchCombobox from '@/components/employees/EmployeeSearchCombobox';
import HijriDatePicker from '@/components/ui/HijriDatePicker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';

// تحويل الأرقام اللاتينية إلى عربية هندية (مطابقة للـ PDF الأصلي)
const toArabicDigits = (str) => {
  if (str === null || str === undefined || str === '') return '';
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (d) => map[+d]);
};

const thStyle = {
  border: '1px solid #000',
  padding: '8px 6px',
  fontSize: '11pt',
  fontWeight: 700,
  textAlign: 'center',
  background: '#FFFFFF',
  color: '#000',
};
const tdStyle = {
  border: '1px solid #000',
  padding: '12px 6px',
  fontSize: '10pt',
  fontWeight: 600,
  textAlign: 'center',
  background: '#FFFFFF',
  color: '#000',
  height: '40px',
};

export default function FillAssignmentForm() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // بيانات الجدول
  const [grade, setGrade] = useState('');
  const [assignmentEntity, setAssignmentEntity] = useState('');
  const [assignmentValue, setAssignmentValue] = useState('');
  const [duration, setDuration] = useState('');
  const [assignmentDate, setAssignmentDate] = useState('');

  // أسباب التكليف
  const [reasons, setReasons] = useState('');

  // الرئيس المباشر
  const [supervisorSignatureUrl, setSupervisorSignatureUrl] = useState('');

  // شهادة جهة التكليف
  const [certifyingAdministration, setCertifyingAdministration] = useState('');
  const [employeeNameInCertificate, setEmployeeNameInCertificate] = useState('');
  const [fromDay, setFromDay] = useState('');
  const [fromMonth, setFromMonth] = useState('');
  const [fromYear, setFromYear] = useState('14');
  const [toDay, setToDay] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [toYear, setToYear] = useState('14');
  const [certifierName, setCertifierName] = useState('');
  const [certifierSignatureUrl, setCertifierSignatureUrl] = useState('');
  const [stampUrl, setStampUrl] = useState('');

  const printRef = useRef(null);
  const scalerRef = useRef(null);
  const supSigRef = useRef(null);
  const certSigRef = useRef(null);
  const stampInputRef = useRef(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // موقع اسم التجمع - قابل للسحب اليدوي ومحفوظ في localStorage
  const CLUSTER_POS_KEY = 'assignment_form_cluster_name_pos_v1';
  const [clusterPos, setClusterPos] = useState(() => {
    try {
      const saved = localStorage.getItem(CLUSTER_POS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { top: 60, right: 160 };
  });
  const dragStateRef = useRef(null);
  const handleClusterDragStart = (e) => {
    e.preventDefault();
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTop: clusterPos.top,
      startRight: clusterPos.right,
    };
    const onMove = (ev) => {
      if (!dragStateRef.current) return;
      const scale = previewScaleRef.current || 1;
      const dx = (ev.clientX - dragStateRef.current.startX) / scale;
      const dy = (ev.clientY - dragStateRef.current.startY) / scale;
      setClusterPos({
        top: dragStateRef.current.startTop + dy,
        right: dragStateRef.current.startRight - dx,
      });
    };
    const onUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      try {
        setClusterPos((p) => {
          localStorage.setItem(CLUSTER_POS_KEY, JSON.stringify(p));
          return p;
        });
      } catch {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // حساب scale تلقائياً ليتسع A4 داخل حاوية المعاينة
  const [previewScale, setPreviewScale] = useState(1);
  const previewScaleRef = useRef(1);
  useEffect(() => {
    const updateScale = () => {
      if (!scalerRef.current) return;
      const containerWidth = scalerRef.current.offsetWidth;
      const A4_WIDTH_PX = 794;
      const s = containerWidth / A4_WIDTH_PX;
      setPreviewScale(s);
      previewScaleRef.current = s;
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await base44.entities.Employee.list('-updated_date', 1000);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  // تعبئة تلقائية لاسم الموظف في شهادة جهة التكليف عند الاختيار
  useEffect(() => {
    if (selectedEmployee?.full_name_arabic && !employeeNameInCertificate) {
      setEmployeeNameInCertificate(selectedEmployee.full_name_arabic);
    }
    if (selectedEmployee?.grade && !grade) {
      setGrade(selectedEmployee.grade);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);

  const handleUpload = async (file, setter) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setter(file_url);
      toast.success('تم رفع الصورة');
    } catch (e) {
      toast.error('فشل رفع الصورة');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    toast.info('جاري إنشاء ملف PDF...');
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `نموذج_تكليف_مهمة_رسمية_${selectedEmployee?.full_name_arabic || 'موظف'}.pdf`;
      pdf.save(fileName);
      toast.success('تم حفظ ملف PDF');
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ');
    }
  };

  const handleSaveToEmployee = async () => {
    if (!selectedEmployee) {
      toast.error('اختر الموظف أولاً');
      return;
    }
    if (!printRef.current) return;
    toast.info('جاري الحفظ في ملف الموظف...');
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const blob = pdf.output('blob');
      const file = new File([blob], `نموذج_تكليف_مهمة_رسمية.pdf`, { type: 'application/pdf' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.EmployeeDocument.create({
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.full_name_arabic,
        document_title: `نموذج تكليف مهمة رسمية (انتداب) - ${assignmentEntity || ''}`.trim(),
        document_type: 'contract',
        file_url,
        file_name: file.name,
        tags: ['تكليف مهمة رسمية', 'انتداب', assignmentEntity].filter(Boolean),
      });
      toast.success('تم حفظ النموذج في ملف الموظف');
    } catch (e) {
      console.error(e);
      toast.error('فشل الحفظ');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            width: 210mm !important;
            height: 297mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area, .preview-scaler {
            position: static !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
            background: transparent !important;
            box-shadow: none !important;
            aspect-ratio: auto !important;
          }
          .preview-page {
            transform: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            background-size: 100% 100% !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }
          .no-print { display: none !important; }
          .cluster-name-block { cursor: default !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="no-print flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardSignature className="w-7 h-7 text-emerald-600" />
              نموذج تكليف مهمة رسمية (انتداب)
            </h1>
            <p className="text-sm text-gray-600 mt-1">تعبئة نموذج الانتداب الرسمي طبق الأصل مع تعبئة تلقائية لبيانات الموظف</p>
          </div>
          <Link to="/InteractiveForms">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* نموذج الإدخال */}
          <Card className="no-print">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                بيانات الانتداب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* الموظف */}
              <div>
                <Label className="text-sm">الموظف</Label>
                <div className="mt-1">
                  <EmployeeSearchCombobox
                    employees={employees}
                    onSelect={setSelectedEmployee}
                    buttonClassName="w-full"
                  />
                </div>
                {selectedEmployee && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-0.5">
                    <div><strong>الاسم:</strong> {selectedEmployee.full_name_arabic}</div>
                    <div><strong>الرقم الوظيفي:</strong> {selectedEmployee['رقم_الموظف'] || '-'}</div>
                    <div><strong>الدرجة:</strong> {selectedEmployee.grade || '-'}</div>
                  </div>
                )}
              </div>

              {/* بيانات الجدول */}
              <div className="border-t pt-3">
                <Label className="text-sm font-bold">بيانات الجدول</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-gray-600">م/ت الدرجة</Label>
                    <Input value={grade} onChange={e => setGrade(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">جهة الانتداب</Label>
                    <Input value={assignmentEntity} onChange={e => setAssignmentEntity(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">قيمة الانتداب</Label>
                    <Input value={assignmentValue} onChange={e => setAssignmentValue(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">مدة الانتداب</Label>
                    <Input value={duration} onChange={e => setDuration(e.target.value)} className="mt-1" placeholder="مثال: ١٤ يوم" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-600">تاريخ الانتداب (هجري)</Label>
                    <HijriDatePicker
                      value={assignmentDate}
                      onChange={setAssignmentDate}
                      placeholder="1447/01/01"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* أسباب التكليف */}
              <div className="border-t pt-3">
                <Label className="text-sm font-bold">شرح أسباب التكليف</Label>
                <Textarea value={reasons} onChange={e => setReasons(e.target.value)} rows={3} className="mt-1 text-sm" placeholder="اكتب أسباب التكليف..." />
              </div>

              {/* الرئيس المباشر */}
              <div className="border-t pt-3">
                <Label className="text-sm font-bold">الرئيس المباشر</Label>
                <div className="mt-2">
                  <Label className="text-xs text-gray-600">التوقيع (صورة)</Label>
                  <input type="file" accept="image/*" ref={supSigRef} onChange={e => handleUpload(e.target.files[0], setSupervisorSignatureUrl)} className="hidden" />
                  <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => supSigRef.current?.click()}>
                    {supervisorSignatureUrl ? '✓ تم الرفع' : 'رفع توقيع الرئيس المباشر'}
                  </Button>
                </div>
              </div>

              {/* شهادة جهة التكليف */}
              <div className="border-t pt-3 space-y-2">
                <Label className="text-sm font-bold">شهادة جهة التكليف</Label>
                <div>
                  <Label className="text-xs text-gray-600">تشهد إدارة (اسم الإدارة)</Label>
                  <Input value={certifyingAdministration} onChange={e => setCertifyingAdministration(e.target.value)} className="mt-1" placeholder="مثال: الموارد البشرية" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">بأن الموظف/ة (الاسم)</Label>
                  <Input value={employeeNameInCertificate} onChange={e => setEmployeeNameInCertificate(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">من تاريخ - يوم</Label>
                    <Input value={fromDay} onChange={e => setFromDay(e.target.value)} className="mt-1" placeholder="01" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">شهر</Label>
                    <Input value={fromMonth} onChange={e => setFromMonth(e.target.value)} className="mt-1" placeholder="01" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">سنة (هـ)</Label>
                    <Input value={fromYear} onChange={e => setFromYear(e.target.value)} className="mt-1" placeholder="1447" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">إلى تاريخ - يوم</Label>
                    <Input value={toDay} onChange={e => setToDay(e.target.value)} className="mt-1" placeholder="14" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">شهر</Label>
                    <Input value={toMonth} onChange={e => setToMonth(e.target.value)} className="mt-1" placeholder="01" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">سنة (هـ)</Label>
                    <Input value={toYear} onChange={e => setToYear(e.target.value)} className="mt-1" placeholder="1447" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">اسم المعتمد</Label>
                  <Input value={certifierName} onChange={e => setCertifierName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">التوقيع</Label>
                    <input type="file" accept="image/*" ref={certSigRef} onChange={e => handleUpload(e.target.files[0], setCertifierSignatureUrl)} className="hidden" />
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => certSigRef.current?.click()}>
                      {certifierSignatureUrl ? '✓ تم الرفع' : 'رفع التوقيع'}
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">الختم</Label>
                    <input type="file" accept="image/*" ref={stampInputRef} onChange={e => handleUpload(e.target.files[0], setStampUrl)} className="hidden" />
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => stampInputRef.current?.click()}>
                      {stampUrl ? '✓ تم الرفع' : 'رفع الختم'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Printer className="w-4 h-4 ml-1" /> طباعة
                </Button>
                <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700" size="sm">
                  <Download className="w-4 h-4 ml-1" /> تصدير PDF
                </Button>
                <Button onClick={handleSaveToEmployee} className="bg-emerald-600 hover:bg-emerald-700" size="sm" disabled={!selectedEmployee}>
                  <Save className="w-4 h-4 ml-1" /> حفظ في ملف الموظف
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* المعاينة */}
          <Card>
            <CardHeader className="pb-3 no-print">
              <CardTitle className="text-base">معاينة النموذج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="print-area" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="preview-scaler" ref={scalerRef} style={{ width: '100%', aspectRatio: '210 / 297', position: 'relative', overflow: 'hidden' }}>
                  <div ref={printRef} className="bg-white shadow-sm preview-page" style={{
                    fontFamily: "'Tajawal', 'Cairo', 'Arial', sans-serif",
                    direction: 'rtl',
                    width: '210mm',
                    height: '297mm',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top right',
                    backgroundImage: "url('https://media.base44.com/images/public/68af5003813e47bd07947b30/ec052b844_image.jpg')",
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    overflow: 'hidden',
                    color: '#000',
                  }}>
                    {/* اسم التجمع بجانب الشعار - قابل للسحب اليدوي */}
                    <div
                      onMouseDown={handleClusterDragStart}
                      className="cluster-name-block"
                      style={{
                        position: 'absolute',
                        top: `${clusterPos.top}px`,
                        right: `${clusterPos.right}px`,
                        textAlign: 'right',
                        lineHeight: 1.3,
                        color: '#000',
                        cursor: 'move',
                        userSelect: 'none',
                        padding: '4px 6px',
                        fontFamily: "'Tajawal', 'Cairo', 'Amiri', 'Traditional Arabic', serif",
                      }}
                      title="اسحب لتغيير الموقع"
                    >
                      <div style={{ fontSize: '14pt', fontWeight: 800, letterSpacing: '0.5px' }}>تجمع المدينة المنورة الصحي</div>
                      <div style={{ fontSize: '10pt', fontWeight: 600, color: '#000', fontFamily: "'Tajawal', 'Arial', sans-serif" }}>Madinah Health Cluster</div>
                    </div>

                    {/* طبقة المحتوى */}
                    <div style={{ position: 'absolute', top: '210px', right: '90px', left: '90px', bottom: '180px' }}>

                      {/* 1) العنوان */}
                      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                        <span style={{ fontSize: '15pt', fontWeight: 800, color: '#000' }}>
                          نموذج تكليف مهمة رسمية
                        </span>
                      </div>

                      {/* 2) الجدول - 6 أعمدة */}
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                      }}>
                        <thead>
                          <tr>
                            <th style={thStyle}>رقم الموظف</th>
                            <th style={thStyle}>الاســـــم</th>
                            <th style={thStyle}>م/ت الدرجة</th>
                            <th style={thStyle}>جهة الانتداب</th>
                            <th style={thStyle}>قيمة الانتداب</th>
                            <th style={thStyle}>مدة الانتداب</th>
                            <th style={thStyle}>تاريخ الانتداب</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={tdStyle}>{toArabicDigits(selectedEmployee?.['رقم_الموظف']) || ''}</td>
                            <td style={tdStyle}>{selectedEmployee?.full_name_arabic || ''}</td>
                            <td style={tdStyle}>{toArabicDigits(grade)}</td>
                            <td style={tdStyle}>{assignmentEntity}</td>
                            <td style={tdStyle}>{toArabicDigits(assignmentValue)}</td>
                            <td style={tdStyle}>{toArabicDigits(duration)}</td>
                            <td style={tdStyle}>{toArabicDigits(assignmentDate)}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 3) شرح أسباب التكليف */}
                      <div style={{ marginTop: '24px', fontSize: '11pt', fontWeight: 700, color: '#000' }}>
                        <div style={{ marginBottom: '8px' }}>شرح أسباب التكليف :</div>
                        <div style={{
                          borderBottom: '1px dotted #000',
                          minHeight: '22px',
                          paddingBottom: '2px',
                          marginBottom: '6px',
                          whiteSpace: 'pre-wrap',
                          fontWeight: 500,
                        }}>
                          {reasons.split('\n')[0] || ''}
                        </div>
                        <div style={{
                          borderBottom: '1px dotted #000',
                          minHeight: '22px',
                          paddingBottom: '2px',
                          marginBottom: '6px',
                          fontWeight: 500,
                        }}>
                          {reasons.split('\n')[1] || ''}
                        </div>
                        <div style={{
                          borderBottom: '1px dotted #000',
                          minHeight: '22px',
                          paddingBottom: '2px',
                          fontWeight: 500,
                        }}>
                          {reasons.split('\n')[2] || ''}
                        </div>
                      </div>

                      {/* 4) نص الإقرار */}
                      <div style={{ marginTop: '22px', fontSize: '11pt', fontWeight: 700, lineHeight: 1.9, color: '#000', textAlign: 'center' }}>
                        علماً بأن انتدابات المذكور لم تتجاوز ( ٦٠ ) ستون يوماً في السنة المالية الحالية ( &nbsp;&nbsp;&nbsp; ) وعلى مسؤوليتنا.
                      </div>

                      {/* 5) الرئيس المباشر والتوقيع */}
                      <div style={{ marginTop: '34px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12pt', fontWeight: 700, color: '#000' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                          <span>التوقيع :</span>
                          {supervisorSignatureUrl && <img src={supervisorSignatureUrl} alt="توقيع" style={{ maxHeight: '45px', maxWidth: '130px' }} crossOrigin="anonymous" />}
                        </div>
                        <div>الرئيس المباشر</div>
                      </div>

                      {/* 6) شهادة جهة التكليف */}
                      <div style={{
                        marginTop: '40px',
                        border: '1px solid #000',
                      }}>
                        <div style={{
                          textAlign: 'center',
                          padding: '8px',
                          fontSize: '13pt',
                          fontWeight: 800,
                          borderBottom: '1px solid #000',
                          background: '#FFFFFF',
                        }}>
                          شهادة جهة التكليف
                        </div>
                        <div style={{ padding: '14px 16px', fontSize: '11pt', fontWeight: 700, color: '#000', lineHeight: 2 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'baseline' }}>
                            <span>تشهد إدارة</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '120px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{certifyingAdministration}</span>
                            <span>بأن الموظف /</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '180px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{employeeNameInCertificate}</span>
                            <span>قد أنجز المهمة المكلف بها</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'baseline', marginTop: '8px' }}>
                            <span>من تاريخ</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '30px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{toArabicDigits(fromDay)}</span>
                            <span>/</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '30px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{toArabicDigits(fromMonth)}</span>
                            <span>/</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '40px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{toArabicDigits(fromYear)}</span>
                            <span>هـ</span>
                            <span style={{ marginRight: '12px' }}>وغادر بتاريخ</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '30px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{toArabicDigits(toDay)}</span>
                            <span>/</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '30px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{toArabicDigits(toMonth)}</span>
                            <span>/</span>
                            <span style={{ borderBottom: '1px dotted #000', minWidth: '40px', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{toArabicDigits(toYear)}</span>
                            <span>هـ</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span>الاســـــم :</span>
                              <span style={{ borderBottom: '1px dotted #000', flex: 1, display: 'inline-block', textAlign: 'center', fontWeight: 500, maxWidth: '180px' }}>{certifierName}</span>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <span>التوقيع</span>
                              {certifierSignatureUrl && <img src={certifierSignatureUrl} alt="توقيع" style={{ maxHeight: '40px', maxWidth: '120px' }} crossOrigin="anonymous" />}
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <span>الختم</span>
                              {stampUrl && <img src={stampUrl} alt="ختم" style={{ maxHeight: '70px', maxWidth: '100px' }} crossOrigin="anonymous" />}
                            </div>
                          </div>
                        </div>
                      </div>

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