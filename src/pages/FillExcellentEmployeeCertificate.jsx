import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Eye, Award, Printer, Download, FileImage, FileText, Upload } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function FillExcellentEmployeeCertificate() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee_record_id: '',
    employee_name: '',
    employee_number: '',
    work_place: '',
    administration_name: 'إدارة شؤون المراكز الصحية بالحناكية',
    achievement_description: 'حقق بنجاح كل أهدافة خلال العام وتخطى أكثر من ( ١٠٠٪ ) من المستهدف المحدد وإظهار كافة الكفاءات / القدرات في المستويات أعلى من تلك المطلوبة في ميثاق الأداء الوظيفي .',
    supervisor_name: 'عبدالمجيد سعود الربيقي',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    hijri_date: '',
    show_stamp: true,
    show_signature: true,
    fonts: {
      title: 'Cairo',
      table: 'Cairo',
      greeting: 'Cairo',
      text: 'Cairo',
      manager: 'Cairo'
    },
    weights: {
      title: 'bold',
      tableHeader: 'bold',
      tableData: 'bold',
      greeting: '900',
      text: 'bold',
      manager: 'bold'
    }
  });

  const fontOptions = [
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Tajawal', label: 'Tajawal' },
    { value: 'Almarai', label: 'Almarai' },
    { value: 'Arial', label: 'Arial' },
  ];

  const weightOptions = [
    { value: 'normal', label: 'عادي' },
    { value: '500', label: 'متوسط' },
    { value: 'bold', label: 'عريض' },
    { value: '900', label: 'عريض جداً' },
  ];

  useEffect(() => {
    loadEmployees();
    calculateHijriDate();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await base44.entities.Employee.list();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    }
  };

  const calculateHijriDate = () => {
    try {
      const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date());
      setFormData(prev => ({ ...prev, hijri_date: hijriDate }));
    } catch (error) {
      console.error('Error calculating Hijri date:', error);
    }
  };

  const handleEmployeeSelect = async (employee) => {
    const healthCenterName = employee.المركز_الصحي || '';
    
    setFormData(prev => ({
      ...prev,
      employee_record_id: employee.id,
      employee_name: employee.full_name_arabic || '',
      employee_number: employee.رقم_الموظف || '',
      work_place: healthCenterName,
      administration_name: healthCenterName
    }));
    setSearchQuery('');

    if (healthCenterName) {
      try {
        const centers = await base44.entities.HealthCenter.filter({ 'اسم_المركز': healthCenterName });
        if (centers && centers.length > 0) {
          const center = centers[0];
          if (center.المدير) {
            const manager = employees.find(emp => emp.id === center.المدير);
            if (manager) {
              setFormData(prev => ({ ...prev, supervisor_name: manager.full_name_arabic }));
            } else {
              const fetchedManager = await base44.entities.Employee.get(center.المدير);
              if (fetchedManager) {
                setFormData(prev => ({ ...prev, supervisor_name: fetchedManager.full_name_arabic }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching center details:', error);
      }
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const searchLower = searchQuery.toLowerCase();
    return employees.filter(emp =>
      emp.full_name_arabic && emp.full_name_arabic.toLowerCase().includes(searchLower)
    );
  }, [searchQuery, employees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_name || !formData.employee_number || !formData.work_place) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const certificate = await base44.entities.ExcellentEmployeeCertificate.create({
        ...formData,
        status: 'issued'
      });

      alert('تم حفظ الشهادة بنجاح');
      navigate(createPageUrl(`ViewExcellentEmployeeCertificate?id=${certificate.id}`));
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('حدث خطأ في حفظ الشهادة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Forms?type=interactive'))} size="icon" className="touch-target">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 md:w-8 md:h-8 text-yellow-500" />
              <span className="mobile-title">شهادة تقييم ممتاز</span>
            </h1>
            <p className="text-gray-600 mt-1 text-xs md:text-base hidden md:block">تعبئة شهادة تقييم موظف ممتاز</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">بيانات الشهادة</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="relative">
                <Label htmlFor="employee_search" className="text-sm md:text-base">البحث عن موظف (بالاسم)</Label>
                <Input
                  id="employee_search"
                  placeholder="ابحث بالاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 md:h-10 text-base"
                />
                {filteredEmployees.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="px-3 py-3 md:px-4 md:py-2 hover:bg-gray-100 cursor-pointer text-sm md:text-base border-b last:border-0 touch-target"
                        onClick={() => handleEmployeeSelect(emp)}
                      >
                        <div className="font-semibold">{emp.full_name_arabic}</div>
                        <div className="text-xs text-gray-500">{emp.رقم_الموظف}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="employee_name" className="text-sm md:text-base">اسم الموظف *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                    required
                    className="bg-gray-100 h-11 md:h-10 text-base"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="employee_number" className="text-sm md:text-base">رقم الموظف *</Label>
                  <Input
                    id="employee_number"
                    value={formData.employee_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_number: e.target.value }))}
                    required
                    className="bg-gray-100 h-11 md:h-10 text-base"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="work_place" className="text-sm md:text-base">جهة العمل *</Label>
                  <Input
                    id="work_place"
                    value={formData.work_place}
                    onChange={(e) => setFormData(prev => ({ ...prev, work_place: e.target.value }))}
                    required
                    className="bg-gray-100 h-11 md:h-10 text-base"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="administration_name" className="text-sm md:text-base">مسمى الإدارة</Label>
                  <Input
                    id="administration_name"
                    value={formData.administration_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, administration_name: e.target.value }))}
                    className="h-11 md:h-10 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="achievement_description" className="text-sm md:text-base">وصف الإنجاز</Label>
                <Textarea
                  id="achievement_description"
                  value={formData.achievement_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievement_description: e.target.value }))}
                  rows={4}
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="supervisor_name" className="text-sm md:text-base">اسم الرئيس المباشر</Label>
                  <Input
                    id="supervisor_name"
                    value={formData.supervisor_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisor_name: e.target.value }))}
                    className="h-11 md:h-10 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="hijri_date" className="text-sm md:text-base">التاريخ الهجري</Label>
                  <Input
                    id="hijri_date"
                    value={formData.hijri_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hijri_date: e.target.value }))}
                    className="h-11 md:h-10 text-base"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">إعدادات العرض والتنسيق</h3>
                
                <div className="flex gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.show_stamp}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_stamp: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span>إظهار الختم</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.show_signature}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_signature: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span>إظهار التوقيع</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">أنواع الخطوط</h4>
                    {[
                      { key: 'title', label: 'العنوان' },
                      { key: 'table', label: 'الجدول' },
                      { key: 'greeting', label: 'السلام' },
                      { key: 'text', label: 'النص' },
                      { key: 'manager', label: 'المدير' }
                    ].map(item => (
                      <div key={`font-${item.key}`} className="flex items-center gap-2">
                        <Label className="w-20">{item.label}</Label>
                        <Select 
                          value={formData.fonts[item.key]} 
                          onValueChange={(val) => setFormData(prev => ({...prev, fonts: {...prev.fonts, [item.key]: val}}))}
                        >
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {fontOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">سماكة الخطوط</h4>
                    {[
                      { key: 'title', label: 'العنوان' },
                      { key: 'tableHeader', label: 'رأس الجدول' },
                      { key: 'tableData', label: 'بيانات الجدول' },
                      { key: 'greeting', label: 'السلام' },
                      { key: 'text', label: 'النص' },
                      { key: 'manager', label: 'المدير' }
                    ].map(item => (
                      <div key={`weight-${item.key}`} className="flex items-center gap-2">
                        <Label className="w-24">{item.label}</Label>
                        <Select 
                          value={formData.weights[item.key]} 
                          onValueChange={(val) => setFormData(prev => ({...prev, weights: {...prev.weights, [item.key]: val}}))}
                        >
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {weightOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                <Button type="button" variant="outline" onClick={() => setShowPreview(true)} className="w-full sm:w-auto touch-target">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة الشهادة
                </Button>
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                  <Button type="button" variant="ghost" onClick={() => navigate(createPageUrl('Forms?type=interactive'))} className="flex-1 sm:flex-initial touch-target">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-initial touch-target">
                    <Save className="w-4 h-4 ml-2" />
                    {isSubmitting ? 'جاري...' : 'حفظ'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {showPreview && (
          <CertificatePreview formData={formData} onClose={() => setShowPreview(false)} />
        )}
      </div>
    </div>
  );
}

const CertificatePreview = ({ formData, onClose }) => {
  const [positions, setPositions] = useState({
    signature: { x: 420, y: 520 },
    stamp: { x: 350, y: 600 },
    supervisor: { x: 300, y: 480 }
  });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [showBorder, setShowBorder] = useState(false);

  const handleMouseDown = (e, element) => {
    // Prevent drag-and-drop on images inside the draggable elements from registering as a drag for the image
    if (e.target.tagName === 'IMG') return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragging(element);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const container = document.getElementById('certificate-content');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    // Use data-draggable-id to find the correct element and its dimensions
    const draggedElement = document.querySelector(`[data-draggable-id="${dragging}"]`);
    const elementRect = draggedElement ? draggedElement.getBoundingClientRect() : { width: 0, height: 0 };

    // Constrain positions within the certificate-content div
    const minX = 0;
    const minY = 0;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const maxX = containerWidth - elementRect.width;
    const maxY = containerHeight - elementRect.height;

    setPositions(prev => ({
      ...prev,
      [dragging]: {
        x: Math.max(minX, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY))
      }
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset, positions]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!window.html2canvas || !window.jspdf) {
      alert('جاري تحميل المكتبات المطلوبة، الرجاء المحاولة مرة أخرى بعد ثانية');
      return;
    }

    setIsExporting(true);
    try {
      const element = document.getElementById('certificate-content');
      
      // إخفاء العناصر القابلة للسحب مؤقتاً
      const draggableElements = element.querySelectorAll('.draggable-element');
      draggableElements.forEach(el => el.style.display = 'none');
      
      // إظهار عناصر الطباعة
      const printElements = element.querySelectorAll('.print-only');
      printElements.forEach(el => el.style.display = 'block');
      
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`شهادة_${formData.employee_name}.pdf`);
      
      // إعادة إظهار العناصر القابلة للسحب
      draggableElements.forEach(el => el.style.display = '');
      printElements.forEach(el => el.style.display = 'none');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!window.html2canvas) {
      alert('جاري تحميل المكتبات المطلوبة، الرجاء المحاولة مرة أخرى بعد ثانية');
      return;
    }

    setIsExporting(true);
    try {
      const element = document.getElementById('certificate-content');
      
      // إخفاء العناصر القابلة للسحب مؤقتاً
      const draggableElements = element.querySelectorAll('.draggable-element');
      draggableElements.forEach(el => el.style.display = 'none');
      
      // إظهار عناصر الطباعة
      const printElements = element.querySelectorAll('.print-only');
      printElements.forEach(el => el.style.display = 'block');
      
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `شهادة_${formData.employee_name}.png`;
        link.click();
        URL.revokeObjectURL(url);
        
        // إعادة إظهار العناصر القابلة للسحب
        draggableElements.forEach(el => el.style.display = '');
        printElements.forEach(el => el.style.display = 'none');
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToEmployeeFile = async () => {
    if (!formData.employee_record_id) {
      alert('لم يتم تحديد موظف');
      return;
    }

    if (!window.html2canvas) {
      alert('جاري تحميل المكتبات المطلوبة، الرجاء المحاولة مرة أخرى بعد ثانية');
      return;
    }

    setIsExporting(true);
    try {
      const element = document.getElementById('certificate-content');
      
      // إخفاء العناصر القابلة للسحب مؤقتاً
      const draggableElements = element.querySelectorAll('.draggable-element');
      draggableElements.forEach(el => el.style.display = 'none');
      
      // إظهار عناصر الطباعة
      const printElements = element.querySelectorAll('.print-only');
      printElements.forEach(el => el.style.display = 'block');
      
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], `شهادة_تقييم_ممتاز_${formData.employee_name}.png`, { type: 'image/png' });
          
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          
          await base44.entities.EmployeeDocument.create({
            employee_id: formData.employee_record_id,
            employee_name: formData.employee_name,
            document_title: 'شهادة تقييم ممتاز',
            document_type: 'certificate',
            description: `شهادة تقييم ممتاز - ${formData.hijri_date}`,
            file_url: file_url,
            file_name: file.name
          });

          alert('تم حفظ الشهادة في ملف الموظف بنجاح');
          
          // إعادة إظهار العناصر القابلة للسحب
          draggableElements.forEach(el => el.style.display = '');
          printElements.forEach(el => el.style.display = 'none');
        } catch (error) {
          console.error('Error saving to employee file:', error);
          alert('حدث خطأ أثناء الحفظ');
          
          // إعادة إظهار العناصر حتى في حالة الخطأ
          draggableElements.forEach(el => el.style.display = '');
          printElements.forEach(el => el.style.display = 'none');
        } finally {
          setIsExporting(false);
        }
      });
    } catch (error) {
      console.error('Error creating image:', error);
      alert('حدث خطأ أثناء إنشاء الصورة');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto safe-area-inset">
      <style>{`
        .touch-target {
          min-width: 44px;
          min-height: 44px;
        }
        @media print {
          body * { visibility: hidden; }
          #certificate-content, #certificate-content * { visibility: visible; }
          #certificate-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page {
            size: A4;
            margin: 0;
          }
        }
        
        .draggable-element {
          cursor: grab;
          user-select: none;
          position: absolute;
        }
        .draggable-element:active {
          cursor: grabbing;
          z-index: 1000;
        }
        .watermark-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          opacity: 0.08;
          z-index: 2;
          pointer-events: none;
        }
        .watermark-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .print-only {
          position: absolute;
          display: none;
        }
        .certificate-border {
          position: absolute;
          top: 10mm;
          left: 7.5mm;
          right: 7.5mm;
          bottom: 7.5mm;
          border: 0.3pt solid #444;
          pointer-events: none;
          z-index: 5;
        }
      `}</style>
      
      {/* شريط الأدوات */}
      <div className="sticky top-0 bg-white border-b shadow-sm p-2 md:p-4 z-50 no-print safe-top">
        <h2 className="text-base md:text-xl font-bold mb-2 md:mb-3">معاينة وتعديل الشهادة</h2>
        <div className="grid grid-cols-3 md:flex gap-1 md:gap-2 items-center">
          <Button 
            onClick={() => setShowBorder(!showBorder)} 
            variant={showBorder ? "default" : "outline"}
            size="sm"
            className="text-xs md:text-sm touch-target col-span-1"
          >
            {showBorder ? '✓' : 'إطار'}
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm touch-target col-span-1" disabled={isExporting}>
            <Printer className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            <span className="hidden md:inline">طباعة</span>
          </Button>
          <Button onClick={handleExportPDF} variant="outline" disabled={isExporting} size="sm" className="text-xs md:text-sm touch-target col-span-1">
            <FileText className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            {isExporting ? '...' : 'PDF'}
          </Button>
          <Button onClick={handleExportImage} variant="outline" disabled={isExporting} size="sm" className="text-xs md:text-sm touch-target col-span-1">
            <FileImage className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            {isExporting ? '...' : 'صورة'}
          </Button>
          <Button onClick={handleSaveToEmployeeFile} className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm touch-target col-span-2" disabled={isExporting}>
            <Upload className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            {isExporting ? 'جاري...' : 'حفظ في الملف'}
          </Button>
          <Button onClick={onClose} variant="outline" disabled={isExporting} size="sm" className="touch-target col-span-1">إغلاق</Button>
        </div>
      </div>

      {/* تعليمات */}
      <div className="bg-blue-50 border-b border-blue-200 p-2 md:p-3 text-center text-xs md:text-sm text-blue-800 no-print">
        💡 اسحب العناصر لتغيير موضعها
      </div>

      {/* صفحة A4 */}
      <div className="flex justify-center py-2 md:py-8 bg-gray-200">
        <div 
          id="certificate-content" 
          className="relative bg-white shadow-2xl mx-2 md:mx-0"
          style={{
            width: '100%',
            maxWidth: '210mm',
            height: 'auto',
            minHeight: '297mm',
            aspectRatio: '210/297',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          {/* الخلفية */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/fd38b6c13_image.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 1
          }} />

          {/* الإطار الاختياري */}
          {showBorder && <div className="certificate-border" />}

          {/* الصورة المائية */}
          <div className="watermark-logo">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/040ed9ff1_image.png"
              alt=""
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>

          {/* المحتوى الثابت */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            padding: '60px 40px'
          }}>
            {/* العنوان */}
            <h1 style={{
              fontFamily: formData.fonts?.title || 'Cairo',
              fontSize: '28px',
              fontWeight: formData.weights?.title || 'bold',
              textAlign: 'center',
              marginBottom: '60px',
              marginTop: '100px',
              color: '#000'
            }}>
              مشهد إنجاز موظف حاصل تقييم ممتاز
            </h1>

            {/* الجدول */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', fontFamily: formData.fonts?.table || 'Cairo' }}>
              <table style={{
                border: '2px solid black',
                width: '85%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid black' }}>
                    <th style={{
                      borderLeft: '2px solid black',
                      padding: '15px',
                      fontWeight: formData.weights?.tableHeader || 'bold',
                      textAlign: 'center',
                      backgroundColor: '#7dd3fc',
                      fontSize: '18px'
                    }}>اسم الموظف</th>
                    <th style={{
                      borderLeft: '2px solid black',
                      padding: '15px',
                      fontWeight: formData.weights?.tableHeader || 'bold',
                      textAlign: 'center',
                      backgroundColor: '#7dd3fc',
                      fontSize: '18px'
                    }}>رقم الموظف</th>
                    <th style={{
                      padding: '15px',
                      fontWeight: formData.weights?.tableHeader || 'bold',
                      textAlign: 'center',
                      backgroundColor: '#7dd3fc',
                      fontSize: '18px'
                    }}>جهة العمل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{
                      borderLeft: '2px solid black',
                      padding: '15px',
                      textAlign: 'center',
                      fontSize: '17px',
                      fontWeight: formData.weights?.tableData || 'bold'
                    }}>{formData.employee_name}</td>
                    <td style={{
                      borderLeft: '2px solid black',
                      padding: '15px',
                      textAlign: 'center',
                      fontSize: '17px',
                      fontWeight: formData.weights?.tableData || 'bold'
                    }}>{formData.employee_number}</td>
                    <td style={{
                      padding: '15px',
                      textAlign: 'center',
                      fontSize: '17px',
                      fontWeight: formData.weights?.tableData || 'bold'
                    }}>{formData.work_place}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* النص */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ 
                marginBottom: '30px', 
                fontSize: '20px',
                fontWeight: formData.weights?.greeting || '900',
                fontFamily: formData.fonts?.greeting || 'Cairo'
              }}>
                السلام عليكم ورحمة الله وبركاته <span style={{ display: 'inline-block', width: '40px' }}></span> وبعد
              </p>
              <p style={{
                fontSize: '18px',
                fontWeight: formData.weights?.text || 'bold',
                fontFamily: formData.fonts?.text || 'Cairo',
                lineHeight: '2.2',
                textAlign: 'justify',
                padding: '0 50px'
              }}>
                تشهد {formData.administration_name.trim().startsWith('إدارة') ? formData.administration_name : `إدارة ${formData.administration_name}`} بأن الموضح اسمه وبياناته أعلاه {formData.achievement_description}
              </p>
            </div>
          </div>

          {/* العناصر القابلة للسحب */}
          {/* كتلة المدير (منصب + اسم) */}
          <div
            className="draggable-element no-print"
            data-draggable-id="supervisor"
            style={{
              left: `${positions.supervisor.x}px`,
              top: `${positions.supervisor.y}px`,
              zIndex: 10,
              padding: '12px',
              border: '2px dashed #3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              fontFamily: formData.fonts?.manager || 'Cairo'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'supervisor')}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                fontSize: '17px', 
                fontWeight: formData.weights?.manager || 'bold',
                marginBottom: '8px'
              }}>
                مدير {formData.administration_name}
              </p>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: formData.weights?.manager || 'bold',
                color: '#1f2937'
              }}>
                {formData.supervisor_name}
              </p>
            </div>
          </div>

          {/* النسخة للطباعة - كتلة المدير */}
          <div
            className="print-only"
            style={{
              left: `${positions.supervisor.x}px`,
              top: `${positions.supervisor.y}px`,
              zIndex: 10,
              fontFamily: formData.fonts?.manager || 'Cairo'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                fontSize: '17px', 
                fontWeight: formData.weights?.manager || 'bold',
                marginBottom: '8px'
              }}>
                مدير {formData.administration_name}
              </p>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: formData.weights?.manager || 'bold',
                color: '#1f2937'
              }}>
                {formData.supervisor_name}
              </p>
            </div>
          </div>

          {/* التوقيع */}
          {String(formData.show_signature) !== 'false' && (
            <>
              <div
                className="draggable-element no-print"
                data-draggable-id="signature"
                style={{
                  left: `${positions.signature.x}px`,
                  top: `${positions.signature.y}px`,
                  zIndex: 11,
                  border: '2px dashed #10b981',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '4px',
                  padding: '8px'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'signature')}
              >
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: '16px', marginBottom: '5px' }}>
                    التوقيع........................
                  </p>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
                    alt="التوقيع"
                    style={{
                      position: 'absolute',
                      right: '40px',
                      top: '-30px',
                      width: '130px',
                      mixBlendMode: 'darken'
                    }}
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              </div>

              {/* النسخة للطباعة - التوقيع */}
              <div
                className="print-only"
                style={{
                  left: `${positions.signature.x}px`,
                  top: `${positions.signature.y}px`,
                  zIndex: 11
                }}
              >
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: '16px', marginBottom: '5px' }}>
                    التوقيع........................
                  </p>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
                    alt="التوقيع"
                    style={{
                      position: 'absolute',
                      right: '40px',
                      top: '-30px',
                      width: '130px',
                      mixBlendMode: 'darken'
                    }}
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              </div>
            </>
          )}

          {/* الختم */}
          {String(formData.show_stamp) !== 'false' && (
            <>
              <div
                className="draggable-element no-print"
                data-draggable-id="stamp"
                style={{
                  left: `${positions.stamp.x}px`,
                  top: `${positions.stamp.y}px`,
                  zIndex: 12,
                  border: '2px dashed #ef4444',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '4px',
                  padding: '8px'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'stamp')}
              >
                <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>الختم الجهة</p>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
                  alt="الختم"
                  style={{
                    width: '150px',
                    opacity: 0.8,
                    marginTop: '-55px'
                  }}
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>

              {/* النسخة للطباعة - الختم */}
              <div
                className="print-only"
                style={{
                  left: `${positions.stamp.x}px`,
                  top: `${positions.stamp.y}px`,
                  zIndex: 12
                }}
              >
                <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>الختم الجهة</p>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
                  alt="الختم"
                  style={{
                    width: '150px',
                    opacity: 0.8,
                    marginTop: '-55px'
                  }}
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
            </>
          )}

          {/* التاريخ */}
          <p style={{
            position: 'absolute',
            left: '80px',
            bottom: '80px',
            fontSize: '17px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            حررت في تاريخ: {formData.hijri_date} هـ
          </p>
        </div>
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  const script1 = document.createElement('script');
  script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  document.head.appendChild(script2);
}