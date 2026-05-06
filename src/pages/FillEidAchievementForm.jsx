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
  const sigInputRef = useRef(null);
  const stampInputRef = useRef(null);

  useEffect(() => {
    loadEmployees();
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
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-area > div {
            width: 210mm !important;
            height: 297mm !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
              <div className="print-area">
                <div ref={printRef} className="bg-white shadow-sm" style={{
                  fontFamily: "'Tajawal', 'Cairo', sans-serif",
                  direction: 'rtl',
                  width: '100%',
                  aspectRatio: '725 / 1024',
                  position: 'relative',
                  backgroundImage: "url('https://media.base44.com/images/public/68af5003813e47bd07947b30/ec052b844_image.jpg')",
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  overflow: 'hidden',
                }}>
                  {/* طبقة المحتوى مع الهوامش - الخلفية تبقى مغطية كامل النموذج */}
                  <div style={{ position: 'absolute', inset: 0, padding: '110px 30px 100px 30px' }}>
                  {/* العنوان - مطابق للنموذج الأصلي (شريط رمادي مع خط سفلي أخضر) */}
                  <div className="mb-6" style={{ background: '#E8E8E8', borderBottom: '4px solid #8FA88F', padding: '10px 20px' }}>
                    <h2 className="text-base md:text-lg font-bold text-gray-800 text-center">{text.title}</h2>
                  </div>

                  {/* جدول البيانات */}
                  <table className="w-full border-collapse mb-6" style={{ border: '1px solid #000' }}>
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-black p-2 text-sm font-bold">الاسم</th>
                        <th className="border border-black p-2 text-sm font-bold">الرقم الوظيفي</th>
                        <th className="border border-black p-2 text-sm font-bold">السجل</th>
                        <th className="border border-black p-2 text-sm font-bold">خدمة/تشغيل</th>
                        <th className="border border-black p-2 text-sm font-bold">الجنسية</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 text-sm text-center">{selectedEmployee?.full_name_arabic || '-'}</td>
                        <td className="border border-black p-2 text-sm text-center">{selectedEmployee?.['رقم_الموظف'] || '-'}</td>
                        <td className="border border-black p-2 text-sm text-center">{selectedEmployee?.['رقم_الهوية'] || '-'}</td>
                        <td className="border border-black p-2 text-sm text-center">{selectedEmployee?.contract_type || '-'}</td>
                        <td className="border border-black p-2 text-sm text-center">{selectedEmployee?.nationality || '-'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* النص */}
                  <div className="space-y-4 text-sm md:text-base leading-loose text-gray-900">
                    <p className="font-semibold">{text.body}</p>

                    <ul className="list-disc pr-6 space-y-1">
                      <li>
                        للفترة من تاريخ <strong>{fromDate || '...'}</strong>هـ وحتى تاريخ <strong>{toDate || '...'}</strong>هـ.
                        بما مجموعه عدد <strong>({workDays || '...'})</strong> أيام عمل ومجموع <strong>({compensationDays || '...'})</strong> أيام تعويضية.
                      </li>
                    </ul>

                    <p className="pt-2">وبناءً عليه نصادق على ما هو مذكور أعلاه من معلومات ونتحمل مسؤولية خلاف ما هو مذكور.</p>
                  </div>

                  {/* المعتمد - الاسم/التوقيع يمين والختم يسار */}
                  <div className="mt-12 flex items-start justify-between gap-8">
                    <div className="flex-1 space-y-2">
                      <p className="font-bold text-base">{managerTitle}</p>
                      <p className="font-bold">الاسم: <span className="font-normal">{managerName}</span></p>
                      <div>
                        <p className="font-bold mb-1">التوقيع:</p>
                        {signatureUrl && <img src={signatureUrl} alt="توقيع" style={{ maxHeight: '70px', maxWidth: '180px' }} crossOrigin="anonymous" />}
                      </div>
                    </div>
                    <div className="text-center" style={{ minWidth: '160px' }}>
                      <p className="font-bold mb-1">الختم</p>
                      {stampUrl && <img src={stampUrl} alt="ختم" style={{ maxHeight: '90px', maxWidth: '150px', display: 'inline-block' }} crossOrigin="anonymous" />}
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