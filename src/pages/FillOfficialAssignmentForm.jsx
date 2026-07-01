import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Printer, Download, Search, User,
  FileText, Loader2, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AssignmentFormPreview from '@/components/assignment_form/AssignmentFormPreview';

export default function FillOfficialAssignmentForm() {
  const location = useLocation();
  const printRef = useRef(null);
  const scalerRef = useRef(null);
  const supSigRef = useRef(null);
  const certSigRef = useRef(null);
  const stampInputRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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

  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    loadEmployees();
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('employeeId');
    if (employeeId) {
      loadEmployeeById(employeeId);
    }
  }, [location.search]);

  useEffect(() => {
    const updateScale = () => {
      if (!scalerRef.current) return;
      const containerWidth = scalerRef.current.offsetWidth;
      const A4_WIDTH_PX = 794;
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
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadEmployeeById = async (id) => {
    try {
      const employee = await base44.entities.Employee.get(id);
      if (employee) selectEmployee(employee);
    } catch (error) {
      console.error('Error loading employee:', error);
    }
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setGrade(employee.grade || '');
    setEmployeeNameInCertificate(employee.full_name_arabic || '');
    setSearchTerm('');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name_arabic?.includes(searchTerm) ||
    emp['رقم_الموظف']?.includes(searchTerm)
  ).slice(0, 10);

  const handleUpload = async (file, setter) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setter(file_url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('نموذج_تكليف_مهمة_رسمية.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
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
            overflow: hidden !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-6 no-print"
      >
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">نموذج تكليف مهمة رسمية</h1>
                <p className="text-teal-100 mt-1">تجمع المدينة المنورة الصحي - إدارة رأس المال البشري</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="secondary" className="rounded-xl">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl"
              >
                {isExporting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Download className="w-4 h-4 ml-2" />}
                تصدير PDF
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* بحث الموظف وبيانات النموذج */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 no-print space-y-4"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                بحث عن موظف
              </h3>
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="اسم أو رقم الموظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 rounded-xl"
                />
              </div>
              {searchTerm && filteredEmployees.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => selectEmployee(emp)}
                      className="w-full p-3 text-right bg-gray-50 hover:bg-teal-50 rounded-xl transition-colors border border-transparent hover:border-teal-200"
                    >
                      <p className="font-medium text-gray-800">{emp.full_name_arabic}</p>
                      <p className="text-xs text-gray-500">{emp['رقم_الموظف']} - {emp.position}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedEmployee && (
                <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-800">تم اختيار الموظف</span>
                  </div>
                  <p className="font-bold text-gray-800">{selectedEmployee.full_name_arabic}</p>
                  <p className="text-xs text-gray-600">{selectedEmployee['رقم_الموظف']}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-gray-800">بيانات الجدول</h3>
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
              <div>
                <Label className="text-xs text-gray-600">تاريخ الانتداب</Label>
                <Input value={assignmentDate} onChange={e => setAssignmentDate(e.target.value)} className="mt-1" placeholder="1447/01/01" />
              </div>

              <div className="border-t pt-3">
                <Label className="text-xs text-gray-600">شرح أسباب التكليف</Label>
                <Textarea value={reasons} onChange={e => setReasons(e.target.value)} rows={3} className="mt-1 text-sm" placeholder="اكتب أسباب التكليف..." />
              </div>

              <div className="border-t pt-3">
                <Label className="text-xs text-gray-600">توقيع الرئيس المباشر</Label>
                <input type="file" accept="image/*" ref={supSigRef} onChange={e => handleUpload(e.target.files[0], setSupervisorSignatureUrl)} className="hidden" />
                <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => supSigRef.current?.click()}>
                  {supervisorSignatureUrl ? '✓ تم الرفع' : 'رفع التوقيع'}
                </Button>
              </div>

              <div className="border-t pt-3 space-y-2">
                <Label className="text-sm font-bold">شهادة جهة التكليف</Label>
                <div>
                  <Label className="text-xs text-gray-600">تشهد إدارة</Label>
                  <Input value={certifyingAdministration} onChange={e => setCertifyingAdministration(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">اسم الموظف</Label>
                  <Input value={employeeNameInCertificate} onChange={e => setEmployeeNameInCertificate(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={fromDay} onChange={e => setFromDay(e.target.value)} placeholder="يوم" />
                  <Input value={fromMonth} onChange={e => setFromMonth(e.target.value)} placeholder="شهر" />
                  <Input value={fromYear} onChange={e => setFromYear(e.target.value)} placeholder="سنة" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={toDay} onChange={e => setToDay(e.target.value)} placeholder="يوم" />
                  <Input value={toMonth} onChange={e => setToMonth(e.target.value)} placeholder="شهر" />
                  <Input value={toYear} onChange={e => setToYear(e.target.value)} placeholder="سنة" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">اسم المعتمد</Label>
                  <Input value={certifierName} onChange={e => setCertifierName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input type="file" accept="image/*" ref={certSigRef} onChange={e => handleUpload(e.target.files[0], setCertifierSignatureUrl)} className="hidden" />
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => certSigRef.current?.click()}>
                      {certifierSignatureUrl ? '✓ التوقيع' : 'رفع التوقيع'}
                    </Button>
                  </div>
                  <div>
                    <input type="file" accept="image/*" ref={stampInputRef} onChange={e => handleUpload(e.target.files[0], setStampUrl)} className="hidden" />
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => stampInputRef.current?.click()}>
                      {stampUrl ? '✓ الختم' : 'رفع الختم'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* المعاينة - النموذج الرسمي طبق الأصل */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <AssignmentFormPreview
            printRef={printRef}
            scalerRef={scalerRef}
            previewScale={previewScale}
            data={{
              selectedEmployee,
              grade,
              assignmentEntity,
              assignmentValue,
              duration,
              assignmentDate,
              reasons,
              supervisorSignatureUrl,
              certifyingAdministration,
              employeeNameInCertificate,
              fromDay, fromMonth, fromYear,
              toDay, toMonth, toYear,
              certifierName,
              certifierSignatureUrl,
              stampUrl,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}