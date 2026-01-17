import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Printer, Download, Search, User, Building2, Calendar,
  FileText, Loader2, CheckCircle2, Save, FolderOpen
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SaveToLocationDialog from '@/components/pdf_editor/SaveToLocationDialog';

export default function FillOfficialAssignmentForm() {
  const location = useLocation();
  const formRef = useRef(null);
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    employeeNumber: '',
    employeeName: '',
    rank: '',
    assignmentDestination: '',
    assignmentValue: '',
    assignmentDuration: '',
    assignmentDate: '',
    assignmentReasons: '',
    daysNotExceeded: '60',
    fiscalYear: new Date().getFullYear().toString(),
    supervisorName: '',
    // شهادة جهة التكليف
    certifyingAuthority: '',
    certifyingName: '',
    startDateDay: '',
    startDateMonth: '',
    startDateYear: '14',
    endDateDay: '',
    endDateMonth: '',
    endDateYear: '14',
  });

  useEffect(() => {
    loadEmployees();
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('employeeId');
    if (employeeId) {
      loadEmployeeById(employeeId);
    }
  }, [location.search]);

  const loadEmployees = async () => {
    try {
      const data = await base44.entities.Employee.list();
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadEmployeeById = async (id) => {
    setIsLoading(true);
    try {
      const employee = await base44.entities.Employee.get(id);
      if (employee) {
        selectEmployee(employee);
      }
    } catch (error) {
      console.error('Error loading employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({
      ...prev,
      employeeNumber: employee.رقم_الموظف || '',
      employeeName: employee.full_name_arabic || '',
      rank: employee.rank || employee.level || '',
    }));
    setSearchTerm('');
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name_arabic?.includes(searchTerm) || 
    emp.رقم_الموظف?.includes(searchTerm)
  ).slice(0, 10);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!formRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('نموذج_تكليف_مهمة_رسمية.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-6"
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
            <div className="flex gap-2 no-print">
              <Button 
                onClick={handlePrint}
                variant="secondary"
                className="rounded-xl"
              >
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

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* بحث الموظف */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 no-print"
        >
          <Card className="shadow-xl border-0 sticky top-4">
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
                      <p className="text-xs text-gray-500">{emp.رقم_الموظف} - {emp.position}</p>
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
                  <p className="text-xs text-gray-600">{selectedEmployee.رقم_الموظف}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* النموذج */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div 
            ref={formRef}
            className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
            style={{ direction: 'rtl' }}
          >
            {/* Header with Logo */}
            <div className="relative bg-gradient-to-r from-[#00796B] to-[#009688] p-6">
              {/* الشريط الجانبي */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#00695C] flex flex-col items-center justify-center gap-1 text-white/60 text-xs">
                <span>ح</span><span>ص</span><span>ت</span><span>ك</span><span>م</span>
                <span className="my-2">...</span>
                <span>غ</span><span>ا</span><span>ي</span><span>ت</span><span>ن</span><span>ا</span>
              </div>
              
              <div className="flex items-center justify-between mr-4">
                <div className="text-white">
                  <h2 className="text-lg font-bold">تجمع المدينة المنورة الصحي | إدارة رأس المال البشري</h2>
                  <p className="text-teal-100 text-sm">Human capital management | Madinah Health Cluster</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/ar/thumb/4/4c/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%88%D8%B2%D8%A7%D8%B1%D8%A9_%D8%A7%D9%84%D8%B5%D8%AD%D8%A9_%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9.svg/1200px-%D8%B4%D8%B9%D8%A7%D8%B1_%D9%88%D8%B2%D8%A7%D8%B1%D8%A9_%D8%A7%D9%84%D8%B5%D8%AD%D8%A9_%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9.svg.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 mr-12">
              <h3 className="text-xl font-bold text-center text-gray-800 mb-6 py-3 bg-gray-50 rounded-xl">
                نموذج تكليف مهمه رسمية
              </h3>

              {/* جدول البيانات الأساسية */}
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#E0F2F1]">
                      <th className="border-l border-gray-300 p-3 text-sm font-bold text-gray-700">رقم الموظف</th>
                      <th className="border-l border-gray-300 p-3 text-sm font-bold text-gray-700">الاســــم</th>
                      <th className="border-l border-gray-300 p-3 text-sm font-bold text-gray-700">م/ت الدرجة</th>
                      <th className="border-l border-gray-300 p-3 text-sm font-bold text-gray-700">جهة الانتداب</th>
                      <th className="border-l border-gray-300 p-3 text-sm font-bold text-gray-700">قيمة الانتداب</th>
                      <th className="border-l border-gray-300 p-3 text-sm font-bold text-gray-700">مدة الانتداب</th>
                      <th className="p-3 text-sm font-bold text-gray-700">تاريخ الانتداب</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-l border-t border-gray-300 p-2">
                        <Input
                          value={formData.employeeNumber}
                          onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                      <td className="border-l border-t border-gray-300 p-2">
                        <Input
                          value={formData.employeeName}
                          onChange={(e) => handleInputChange('employeeName', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                      <td className="border-l border-t border-gray-300 p-2">
                        <Input
                          value={formData.rank}
                          onChange={(e) => handleInputChange('rank', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                      <td className="border-l border-t border-gray-300 p-2">
                        <Input
                          value={formData.assignmentDestination}
                          onChange={(e) => handleInputChange('assignmentDestination', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                      <td className="border-l border-t border-gray-300 p-2">
                        <Input
                          value={formData.assignmentValue}
                          onChange={(e) => handleInputChange('assignmentValue', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                      <td className="border-l border-t border-gray-300 p-2">
                        <Input
                          value={formData.assignmentDuration}
                          onChange={(e) => handleInputChange('assignmentDuration', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                      <td className="border-t border-gray-300 p-2">
                        <Input
                          type="date"
                          value={formData.assignmentDate}
                          onChange={(e) => handleInputChange('assignmentDate', e.target.value)}
                          className="border-0 bg-transparent text-center h-10 print:bg-transparent"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* شرح أسباب التكليف */}
              <div className="mb-6">
                <Label className="block mb-2 font-bold text-gray-700">شرح أسباب التكليف :</Label>
                <Textarea
                  value={formData.assignmentReasons}
                  onChange={(e) => handleInputChange('assignmentReasons', e.target.value)}
                  placeholder="اكتب أسباب التكليف هنا..."
                  className="min-h-[100px] rounded-xl border-gray-300"
                />
              </div>

              {/* التأكيد على عدد الأيام */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">
                  علما بان انتدابات المذكور لم تتجاوز ( 
                  <Input
                    value={formData.daysNotExceeded}
                    onChange={(e) => handleInputChange('daysNotExceeded', e.target.value)}
                    className="w-16 inline-block mx-2 text-center border-gray-300 h-8"
                  />
                  ) ستون يوما في السنة المالية الحالية (
                  <Input
                    value={formData.fiscalYear}
                    onChange={(e) => handleInputChange('fiscalYear', e.target.value)}
                    className="w-20 inline-block mx-2 text-center border-gray-300 h-8"
                  />
                  ) وعلي مسئوليتنا.
                </p>
              </div>

              {/* توقيع الرئيس المباشر */}
              <div className="mb-8 flex justify-between items-center p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <Label className="font-bold text-gray-700">الرئيس المباشر:</Label>
                  <Input
                    value={formData.supervisorName}
                    onChange={(e) => handleInputChange('supervisorName', e.target.value)}
                    placeholder="الاسم"
                    className="w-48 border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="font-bold text-gray-700">التوقيع:</Label>
                  <div className="w-40 h-12 border-b-2 border-gray-400"></div>
                </div>
              </div>

              {/* شهادة جهة التكليف */}
              <div className="border-2 border-[#00796B] rounded-xl overflow-hidden">
                <div className="bg-[#00796B] p-3">
                  <h4 className="text-lg font-bold text-white text-center">شهادة جهة التكليف</h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-bold text-gray-700">تشهد ادارة</span>
                    <Input
                      value={formData.certifyingAuthority}
                      onChange={(e) => handleInputChange('certifyingAuthority', e.target.value)}
                      placeholder="اسم الإدارة"
                      className="flex-1 min-w-[200px] border-gray-300"
                    />
                    <span className="text-gray-700">بأن الموضح أسمه بعالية قد انجز المهمة المكلف بها</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-gray-700">من تاريخ</span>
                    <div className="flex items-center gap-1">
                      <Input
                        value={formData.startDateDay}
                        onChange={(e) => handleInputChange('startDateDay', e.target.value)}
                        placeholder="يوم"
                        className="w-14 text-center border-gray-300"
                      />
                      <span>/</span>
                      <Input
                        value={formData.startDateMonth}
                        onChange={(e) => handleInputChange('startDateMonth', e.target.value)}
                        placeholder="شهر"
                        className="w-14 text-center border-gray-300"
                      />
                      <span>/</span>
                      <Input
                        value={formData.startDateYear}
                        onChange={(e) => handleInputChange('startDateYear', e.target.value)}
                        className="w-14 text-center border-gray-300"
                      />
                      <span className="text-sm text-gray-500">هـ</span>
                    </div>
                    
                    <span className="text-gray-700">وغادر بتاريخ</span>
                    <div className="flex items-center gap-1">
                      <Input
                        value={formData.endDateDay}
                        onChange={(e) => handleInputChange('endDateDay', e.target.value)}
                        placeholder="يوم"
                        className="w-14 text-center border-gray-300"
                      />
                      <span>/</span>
                      <Input
                        value={formData.endDateMonth}
                        onChange={(e) => handleInputChange('endDateMonth', e.target.value)}
                        placeholder="شهر"
                        className="w-14 text-center border-gray-300"
                      />
                      <span>/</span>
                      <Input
                        value={formData.endDateYear}
                        onChange={(e) => handleInputChange('endDateYear', e.target.value)}
                        className="w-14 text-center border-gray-300"
                      />
                      <span className="text-sm text-gray-500">هـ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200 mt-4">
                    <div className="text-center">
                      <Label className="font-bold text-gray-700 mb-2 block">الاســــم :</Label>
                      <Input
                        value={formData.certifyingName}
                        onChange={(e) => handleInputChange('certifyingName', e.target.value)}
                        className="border-gray-300 text-center"
                      />
                    </div>
                    <div className="text-center">
                      <Label className="font-bold text-gray-700 mb-2 block">التوقيع</Label>
                      <div className="h-12 border-b-2 border-gray-400"></div>
                    </div>
                    <div className="text-center">
                      <Label className="font-bold text-gray-700 mb-2 block">الختم</Label>
                      <div className="h-16 w-16 mx-auto border-2 border-dashed border-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#00796B] p-4 mt-6 mr-12">
              <div className="flex justify-center items-center gap-6 text-white/80 text-sm">
                <span className="flex items-center gap-2">
                  <span>f</span>
                  <span>Madinah.Cluster</span>
                </span>
                <span>Med_Cluster</span>
                <span>Med-Cluster@moh.gov.sa</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}