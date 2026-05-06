import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Download, Save, ArrowRight, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeSearchCombobox from '@/components/employees/EmployeeSearchCombobox';
import HijriDatePicker from '@/components/ui/HijriDatePicker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';

const EID_OPTIONS = [
  'عيد الفطر المبارك',
  'عيد الأضحى المبارك',
  'إجازة اليوم الوطني',
  'إجازة يوم التأسيس',
  'إجازة أخرى',
];

// تحويل الأرقام اللاتينية إلى عربية هندية (مطابقة للـ PDF الأصلي)
const toArabicDigits = (str) => {
  if (str === null || str === undefined || str === '') return '';
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (d) => map[+d]);
};

const thStyle = {
  border: '1px solid #000',
  padding: '10px 8px',
  fontSize: '12pt',
  fontWeight: 700,
  textAlign: 'center',
  background: '#FFFFFF',
  color: '#000',
};
const tdStyle = {
  border: '1px solid #000',
  padding: '14px 8px',
  fontSize: '11pt',
  textAlign: 'center',
  background: '#FFFFFF',
  color: '#000',
  height: '40px',
};

export default function FillEidAchievementForm() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // بيانات النموذج
  const [eidName, setEidName] = useState('عيد الفطر المبارك');
  const [customEidName, setCustomEidName] = useState('');
  const [year, setYear] = useState('1447');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [workDays, setWorkDays] = useState('');
  const [compensationDays, setCompensationDays] = useState('');

  // معتمد
  const [managerName, setManagerName] = useState('صهيب محمد تجار الشاهي');
  const [managerTitle, setManagerTitle] = useState('اعتماد مدير الموارد البشرية بمستشفى الحسو العام');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [stampUrl, setStampUrl] = useState('');

  const printRef = useRef(null);
  const scalerRef = useRef(null);
  const sigInputRef = useRef(null);
  const stampInputRef = useRef(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // حساب scale تلقائياً ليتسع A4 داخل حاوية المعاينة (للعرض فقط)
  const [previewScale, setPreviewScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      if (!scalerRef.current) return;
      const containerWidth = scalerRef.current.offsetWidth;
      const A4_WIDTH_PX = 794; // 210mm ≈ 794px @ 96dpi
      setPreviewScale(containerWidth / A4_WIDTH_PX);
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

  const isFemale = useMemo(() => {
    return selectedEmployee?.gender === 'أنثى';
  }, [selectedEmployee]);

  // النصوص حسب التذكير/التأنيث
  const text = useMemo(() => {
    const finalEidName = eidName === 'إجازة أخرى' ? (customEidName || '...') : eidName;
    if (isFemale) {
      return {
        title: `مشهد إنجاز ${finalEidName} لعام ${year}هـ`,
        body: `تشهد إدارة الموارد البشرية بأن الموظفة المذكورة بياناتها بعاليه بأنها قد أتمت إنجاز مهمة تكليف ${finalEidName}.`,
        eidName: finalEidName,
      };
    }
    return {
      title: `مشهد إنجاز ${finalEidName} لعام ${year}هـ`,
      body: `تشهد إدارة الموارد البشرية بأن الموظف المذكور بياناته بعاليه بأنه قد أتم إنجاز مهمة تكليف ${finalEidName}.`,
      eidName: finalEidName,
    };
  }, [eidName, customEidName, year, isFemale]);

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
      const fileName = `مشهد_إنجاز_${selectedEmployee?.full_name_arabic || 'موظف'}_${text.eidName}.pdf`;
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
      const file = new File([blob], `مشهد_إنجاز_${text.eidName}.pdf`, { type: 'application/pdf' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.EmployeeDocument.create({
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.full_name_arabic,
        document_title: `مشهد إنجاز ${text.eidName} لعام ${year}هـ`,
        document_type: 'official',
        file_url,
        file_name: file.name,
        tags: ['مشهد إنجاز', text.eidName, year],
        start_date: fromDate || undefined,
        end_date: toDate || undefined,
      });
      toast.success('تم حفظ المشهد في ملف الموظف');
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

          /* إخفاء كل الـ wrappers بحيث صفحة A4 وحدها هي اللي تطبع */
          .print-area,
          .preview-scaler {
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
          /* صفحة A4 الفعلية - تصبح هي الأساس */
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
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="no-print flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-emerald-600" />
              مشهد إنجاز - الأعياد
            </h1>
            <p className="text-sm text-gray-600 mt-1">إصدار مشهد إنجاز لتكليف عيد الفطر / عيد الأضحى مع التعبئة التلقائية</p>
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
                <Calendar className="w-5 h-5 text-emerald-600" />
                بيانات المشهد
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
                    <div><strong>السجل:</strong> {selectedEmployee['رقم_الهوية'] || '-'}</div>
                    <div><strong>الجنسية:</strong> {selectedEmployee.nationality || '-'}</div>
                    <div><strong>الجنس:</strong> {selectedEmployee.gender || '-'} {isFemale ? '(صيغة مؤنثة)' : '(صيغة مذكرة)'}</div>
                  </div>
                )}
              </div>

              {/* المناسبة */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">المناسبة</Label>
                  <Select value={eidName} onValueChange={setEidName}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EID_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">السنة (هجري)</Label>
                  <Input value={year} onChange={e => setYear(e.target.value)} className="mt-1" />
                </div>
              </div>

              {eidName === 'إجازة أخرى' && (
                <div>
                  <Label className="text-sm">اسم المناسبة المخصص</Label>
                  <Input value={customEidName} onChange={e => setCustomEidName(e.target.value)} className="mt-1" placeholder="مثال: إجازة اليوم الوطني" />
                </div>
              )}

              {/* التواريخ */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">من تاريخ (هجري)</Label>
                  <HijriDatePicker
                    value={fromDate}
                    onChange={setFromDate}
                    placeholder="1447/09/24"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center"
                  />
                </div>
                <div>
                  <Label className="text-sm">إلى تاريخ (هجري)</Label>
                  <HijriDatePicker
                    value={toDate}
                    onChange={setToDate}
                    placeholder="1447/10/05"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">عدد أيام العمل</Label>
                  <Input type="number" value={workDays} onChange={e => setWorkDays(e.target.value)} className="mt-1" placeholder="12" />
                </div>
                <div>
                  <Label className="text-sm">عدد الأيام التعويضية</Label>
                  <Input type="number" value={compensationDays} onChange={e => setCompensationDays(e.target.value)} className="mt-1" placeholder="15" />
                </div>
              </div>

              {/* المعتمد */}
              <div className="border-t pt-3 mt-3 space-y-2">
                <Label className="text-sm font-bold">بيانات المعتمد</Label>
                <div>
                  <Label className="text-xs text-gray-600">المسمى الوظيفي / الإدارة</Label>
                  <Textarea value={managerTitle} onChange={e => setManagerTitle(e.target.value)} rows={2} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">اسم المدير</Label>
                  <Input value={managerName} onChange={e => setManagerName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">التوقيع (صورة)</Label>
                    <input type="file" accept="image/*" ref={sigInputRef} onChange={e => handleUpload(e.target.files[0], setSignatureUrl)} className="hidden" />
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => sigInputRef.current?.click()}>
                      {signatureUrl ? '✓ تم الرفع' : 'رفع التوقيع'}
                    </Button>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">الختم (صورة)</Label>
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
              <CardTitle className="text-base">معاينة المشهد</CardTitle>
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
                  {/* طبقة المحتوى - مع هوامش مطابقة للأصل */}
                  <div style={{ position: 'absolute', top: '170px', right: '70px', left: '70px', bottom: '180px' }}>

                    {/* 1) العنوان في إطار رمادي بحدود وشريط أخضر سفلي - عرض ~70% ومتوسّط */}
                    <div style={{
                      width: '75%',
                      margin: '0 auto',
                      border: '1px solid #BFBFBF',
                      background: '#FFFFFF',
                    }}>
                      <div style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '15pt', fontWeight: 700, color: '#000' }}>
                          مشهد إنجاز {text.eidName} لعام {toArabicDigits(year)}هـ
                        </span>
                      </div>
                      <div style={{ height: '14px', background: '#9DB99D' }} />
                    </div>

                    {/* 2) الجدول - 5 أعمدة بحدود سوداء رفيعة */}
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginTop: '50px',
                    }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>الاسم</th>
                          <th style={thStyle}>الرقم الوظيفي</th>
                          <th style={thStyle}>السجل</th>
                          <th style={thStyle}>خدمة/تشغيل</th>
                          <th style={thStyle}>الجنسية</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={tdStyle}>{selectedEmployee?.full_name_arabic || ''}</td>
                          <td style={tdStyle}>{toArabicDigits(selectedEmployee?.['رقم_الموظف']) || ''}</td>
                          <td style={tdStyle}>{toArabicDigits(selectedEmployee?.['رقم_الهوية']) || ''}</td>
                          <td style={tdStyle}>{selectedEmployee?.contract_type || ''}</td>
                          <td style={tdStyle}>{selectedEmployee?.nationality || ''}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 3) النص الرئيسي - bold كامل */}
                    <div style={{ marginTop: '32px', fontSize: '12pt', fontWeight: 700, lineHeight: 2, color: '#000' }}>
                      <p style={{ margin: 0 }}>{text.body}</p>

                      <ul style={{ marginTop: '16px', marginBottom: '16px', paddingRight: '24px', listStyleType: 'disc' }}>
                        <li>
                          للفترة من تاريخ {toArabicDigits(fromDate) || '...'}هـ وحتى تاريخ {toArabicDigits(toDate) || '...'}هـ. بما مجموعه عدد ({toArabicDigits(workDays) || '...'}) أيام عمل ومجموع ({toArabicDigits(compensationDays) || '...'}) أيام تعويضية.
                        </li>
                      </ul>

                      <p style={{ margin: 0, marginTop: '20px' }}>
                        وبنا<span style={{ fontFamily: 'inherit' }}>ً</span>ء عليه نصادق على ما هو مذكور أعلاه من معلومات ونتحمل مسؤولية خلاف ما هو مذكور.
                      </p>
                    </div>

                    {/* 4) قسم الاعتماد - الاسم/التوقيع يمين-وسط، والختم في أقصى اليسار */}
                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, fontSize: '14pt', fontWeight: 700, color: '#000', lineHeight: 1.9 }}>
                        <p style={{ margin: 0, marginBottom: '24px' }}>{managerTitle}</p>
                        <p style={{ margin: 0, marginRight: '20px' }}>الاسم:{managerName}</p>
                        <p style={{ margin: 0, marginTop: '8px', marginRight: '20px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                          <span>التوقيع:</span>
                          {signatureUrl && <img src={signatureUrl} alt="توقيع" style={{ maxHeight: '50px', maxWidth: '150px' }} crossOrigin="anonymous" />}
                        </p>
                      </div>
                      <div style={{ minWidth: '120px', textAlign: 'center', fontSize: '12pt', fontWeight: 700, marginTop: '40px' }}>
                        <p style={{ margin: 0, marginBottom: '8px' }}>الختم</p>
                        {stampUrl && <img src={stampUrl} alt="ختم" style={{ maxHeight: '90px', maxWidth: '120px', display: 'inline-block' }} crossOrigin="anonymous" />}
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