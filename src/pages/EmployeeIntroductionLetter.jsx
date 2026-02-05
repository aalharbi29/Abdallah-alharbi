import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  User, 
  Stamp, 
  Download, 
  Printer, 
  Search,
  Settings,
  Eye,
  Move,
  CheckCircle,
  Building2,
  PenTool
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// الأختام الرسمية
const OFFICIAL_STAMPS = [
  { id: 'ministry', name: 'ختم وزارة الصحة', emoji: '🏥', color: '#047857' },
  { id: 'region', name: 'ختم المنطقة', emoji: '🏛️', color: '#1e40af' },
  { id: 'management', name: 'ختم الإدارة', emoji: '📋', color: '#7c3aed' },
  { id: 'center', name: 'ختم المركز', emoji: '🏨', color: '#0891b2' }
];

export default function EmployeeIntroductionLetter() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [letterSettings, setLetterSettings] = useState({
    letterNumber: '',
    letterDate: new Date().toISOString().split('T')[0],
    recipient: 'من يهمه الأمر',
    customText: '',
    directorName: 'مدير إدارة المراكز الصحية بالحناكية',
    directorTitle: 'المشرف على المراكز الصحية'
  });
  
  // إعدادات الختم والتوقيع
  const [stampSettings, setStampSettings] = useState({
    showStamp: true,
    selectedStamp: OFFICIAL_STAMPS[2],
    stampPosition: { x: 400, y: 680 },
    stampSize: 100
  });
  
  const [signatureSettings, setSignatureSettings] = useState({
    showSignature: true,
    signaturePosition: { x: 400, y: 600 },
    signatureSize: 120
  });

  const letterRef = useRef(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Employee.list('-created_date', 500);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // فلترة الموظفين
  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.includes(query) ||
      emp.رقم_الهوية?.includes(query)
    );
  });

  // توليد صورة الختم
  const generateStampImage = (stamp) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم دائرة الختم
    ctx.beginPath();
    ctx.arc(100, 100, 85, 0, 2 * Math.PI);
    ctx.strokeStyle = stamp.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // دائرة داخلية
    ctx.beginPath();
    ctx.arc(100, 100, 70, 0, 2 * Math.PI);
    ctx.strokeStyle = stamp.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // رسم الإيموجي
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp.emoji, 100, 70);
    
    // رسم النص
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = stamp.color;
    ctx.fillText(stamp.name, 100, 120);
    
    // التاريخ
    const hijriDate = new Date().toLocaleDateString('ar-SA-u-ca-islamic');
    ctx.font = '11px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(hijriDate, 100, 145);
    
    return canvas.toDataURL('image/png');
  };

  // توليد التوقيع
  const generateSignatureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // خط التوقيع
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // رسم خط متموج يشبه التوقيع
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.bezierCurveTo(50, 20, 80, 60, 100, 35);
    ctx.bezierCurveTo(120, 15, 140, 55, 170, 40);
    ctx.stroke();
    
    // خط تحت الاسم
    ctx.beginPath();
    ctx.moveTo(40, 65);
    ctx.lineTo(160, 65);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    return canvas.toDataURL('image/png');
  };

  // طباعة الخطاب
  const handlePrint = () => {
    window.print();
  };

  // تصدير PDF
  const handleExportPDF = async () => {
    if (!letterRef.current) return;
    
    try {
      const canvas = await html2canvas(letterRef.current, {
        scale: 2,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`خطاب_تعريف_${selectedEmployee?.full_name_arabic || 'موظف'}.pdf`);
    } catch (error) {
      console.error('Export error:', error);
      alert('حدث خطأ أثناء التصدير');
    }
  };

  // النص الافتراضي للخطاب
  const getDefaultLetterText = () => {
    if (!selectedEmployee) return '';
    return `نفيدكم بأن المذكور أعلاه / ${selectedEmployee.full_name_arabic} يعمل لدى وزارة الصحة - إدارة المراكز الصحية بالحناكية بوظيفة (${selectedEmployee.position || 'غير محدد'}) وذلك اعتباراً من تاريخ تعيينه ولا يزال على رأس العمل حتى تاريخه.

أُعطي هذا الخطاب بناءً على طلبه دون أدنى مسؤولية على الجهة المصدرة.`;
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20mm;
          }
          .no-print { display: none !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        .letter-content {
          font-family: 'Amiri', serif;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">خطاب تعريف بالموظف</h1>
            <p className="text-sm text-gray-600">إنشاء خطاب تعريف رسمي مع الختم والتوقيع</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الإعدادات */}
          <div className="lg:col-span-1 space-y-4 no-print">
            {/* اختيار الموظف */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  اختيار الموظف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث بالاسم أو الرقم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredEmployees.slice(0, 20).map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`w-full text-right p-2 rounded-lg text-sm transition-colors ${
                        selectedEmployee?.id === emp.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <p className="font-medium">{emp.full_name_arabic}</p>
                      <p className="text-xs text-gray-500">{emp.رقم_الموظف} - {emp.position}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* إعدادات الخطاب */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  إعدادات الخطاب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">رقم الخطاب</Label>
                    <Input
                      value={letterSettings.letterNumber}
                      onChange={(e) => setLetterSettings({...letterSettings, letterNumber: e.target.value})}
                      placeholder="اختياري"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">التاريخ</Label>
                    <Input
                      type="date"
                      value={letterSettings.letterDate}
                      onChange={(e) => setLetterSettings({...letterSettings, letterDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">الجهة المرسل إليها</Label>
                  <Input
                    value={letterSettings.recipient}
                    onChange={(e) => setLetterSettings({...letterSettings, recipient: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label className="text-xs">اسم المدير</Label>
                  <Input
                    value={letterSettings.directorName}
                    onChange={(e) => setLetterSettings({...letterSettings, directorName: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label className="text-xs">المسمى الوظيفي</Label>
                  <Input
                    value={letterSettings.directorTitle}
                    onChange={(e) => setLetterSettings({...letterSettings, directorTitle: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label className="text-xs">نص مخصص (اختياري)</Label>
                  <Textarea
                    value={letterSettings.customText}
                    onChange={(e) => setLetterSettings({...letterSettings, customText: e.target.value})}
                    placeholder="اترك فارغاً لاستخدام النص الافتراضي"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* إعدادات الختم */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stamp className="w-4 h-4" />
                  الختم والتوقيع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">نوع الختم</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {OFFICIAL_STAMPS.map(stamp => (
                      <button
                        key={stamp.id}
                        onClick={() => setStampSettings({...stampSettings, selectedStamp: stamp})}
                        className={`p-2 rounded-lg text-xs flex flex-col items-center gap-1 transition-all ${
                          stampSettings.selectedStamp?.id === stamp.id
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xl">{stamp.emoji}</span>
                        <span>{stamp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">موضع الختم الأفقي: {stampSettings.stampPosition.x}</Label>
                  <Slider
                    value={[stampSettings.stampPosition.x]}
                    onValueChange={(v) => setStampSettings({...stampSettings, stampPosition: {...stampSettings.stampPosition, x: v[0]}})}
                    min={50}
                    max={550}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">موضع الختم العمودي: {stampSettings.stampPosition.y}</Label>
                  <Slider
                    value={[stampSettings.stampPosition.y]}
                    onValueChange={(v) => setStampSettings({...stampSettings, stampPosition: {...stampSettings.stampPosition, y: v[0]}})}
                    min={400}
                    max={800}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">حجم الختم: {stampSettings.stampSize}</Label>
                  <Slider
                    value={[stampSettings.stampSize]}
                    onValueChange={(v) => setStampSettings({...stampSettings, stampSize: v[0]})}
                    min={60}
                    max={150}
                    step={5}
                  />
                </div>

                <div className="border-t pt-3 space-y-2">
                  <Label className="text-xs">موضع التوقيع الأفقي: {signatureSettings.signaturePosition.x}</Label>
                  <Slider
                    value={[signatureSettings.signaturePosition.x]}
                    onValueChange={(v) => setSignatureSettings({...signatureSettings, signaturePosition: {...signatureSettings.signaturePosition, x: v[0]}})}
                    min={50}
                    max={550}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">موضع التوقيع العمودي: {signatureSettings.signaturePosition.y}</Label>
                  <Slider
                    value={[signatureSettings.signaturePosition.y]}
                    onValueChange={(v) => setSignatureSettings({...signatureSettings, signaturePosition: {...signatureSettings.signaturePosition, y: v[0]}})}
                    min={400}
                    max={750}
                    step={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* أزرار التصدير */}
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" className="flex-1">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={handleExportPDF} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 ml-2" />
                تصدير PDF
              </Button>
            </div>
          </div>

          {/* معاينة الخطاب */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 no-print">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  معاينة الخطاب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  ref={letterRef}
                  className="print-area bg-white p-8 md:p-12 min-h-[1000px] relative letter-content"
                  style={{ direction: 'rtl' }}
                >
                  {/* ترويسة الخطاب */}
                  <div className="text-center mb-8 border-b-2 border-green-700 pb-6">
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">المملكة العربية السعودية</p>
                        <p className="text-sm text-gray-600">وزارة الصحة</p>
                        <p className="text-sm font-bold text-green-800">إدارة المراكز الصحية بالحناكية</p>
                      </div>
                      <div className="w-20 h-20 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-green-700" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-600">Kingdom of Saudi Arabia</p>
                        <p className="text-sm text-gray-600">Ministry of Health</p>
                        <p className="text-sm font-bold text-green-800">Al-Hanakiyah Health Centers</p>
                      </div>
                    </div>
                  </div>

                  {/* معلومات الخطاب */}
                  <div className="flex justify-between mb-6 text-sm">
                    <div>
                      <p>الرقم: {letterSettings.letterNumber || '..................'}</p>
                      <p>التاريخ: {new Date(letterSettings.letterDate).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="text-left">
                      <p>المرفقات: لا يوجد</p>
                    </div>
                  </div>

                  {/* عنوان الخطاب */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-green-800 underline decoration-2 underline-offset-8">
                      خطاب تعريف بالراتب
                    </h2>
                  </div>

                  {/* الجهة المرسل إليها */}
                  <div className="mb-6">
                    <p className="font-bold text-lg">{letterSettings.recipient}</p>
                    <p className="text-gray-600">السلام عليكم ورحمة الله وبركاته،،،</p>
                  </div>

                  {/* بيانات الموظف */}
                  {selectedEmployee ? (
                    <div className="mb-6 bg-gray-50 p-3 rounded-lg border">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1.5 font-bold" style={{width: '15%'}}>الاسم:</td>
                            <td className="py-1.5" colSpan={3}>{selectedEmployee.full_name_arabic}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1.5 font-bold">رقم الهوية:</td>
                            <td className="py-1.5" style={{width: '35%'}}>{selectedEmployee.رقم_الهوية || 'غير محدد'}</td>
                            <td className="py-1.5 font-bold" style={{width: '15%'}}>الرقم الوظيفي:</td>
                            <td className="py-1.5">{selectedEmployee.رقم_الموظف || 'غير محدد'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1.5 font-bold">الوظيفة:</td>
                            <td className="py-1.5">{selectedEmployee.position || 'غير محدد'}</td>
                            <td className="py-1.5 font-bold">نوع العقد:</td>
                            <td className="py-1.5">{selectedEmployee.contract_type || 'غير محدد'}</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 font-bold">جهة العمل:</td>
                            <td className="py-1.5" colSpan={3}>{selectedEmployee.المركز_الصحي || 'إدارة المراكز الصحية'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Alert className="mb-6">
                      <AlertDescription>الرجاء اختيار موظف من القائمة</AlertDescription>
                    </Alert>
                  )}

                  {/* نص الخطاب */}
                  <div className="mb-8 leading-8 text-justify">
                    <p className="whitespace-pre-line">
                      {letterSettings.customText || getDefaultLetterText()}
                    </p>
                  </div>

                  {/* التحية */}
                  <div className="mb-12">
                    <p>وتقبلوا وافر التحية والتقدير،،،</p>
                  </div>

                  {/* قسم التوقيع والختم */}
                  <div className="relative" style={{ height: '200px' }}>
                    {/* اسم المدير */}
                    <div 
                      className="absolute text-center"
                      style={{ 
                        left: `${signatureSettings.signaturePosition.x - 50}px`,
                        top: '20px'
                      }}
                    >
                      <p className="font-bold text-lg">{letterSettings.directorName}</p>
                      <p className="text-gray-600">{letterSettings.directorTitle}</p>
                    </div>

                    {/* التوقيع */}
                    {signatureSettings.showSignature && (
                      <img
                        src={generateSignatureImage()}
                        alt="التوقيع"
                        className="absolute"
                        style={{
                          left: `${signatureSettings.signaturePosition.x - 60}px`,
                          top: `${signatureSettings.signaturePosition.y - 530}px`,
                          width: `${signatureSettings.signatureSize}px`,
                          opacity: 0.9
                        }}
                      />
                    )}

                    {/* الختم */}
                    {stampSettings.showStamp && stampSettings.selectedStamp && (
                      <img
                        src={generateStampImage(stampSettings.selectedStamp)}
                        alt="الختم"
                        className="absolute"
                        style={{
                          left: `${stampSettings.stampPosition.x - 50}px`,
                          top: `${stampSettings.stampPosition.y - 600}px`,
                          width: `${stampSettings.stampSize}px`,
                          opacity: 0.85
                        }}
                      />
                    )}
                  </div>

                  {/* تذييل */}
                  <div className="absolute bottom-8 left-8 right-8 text-center text-xs text-gray-500 border-t pt-4">
                    <p>إدارة المراكز الصحية بالحناكية - المملكة العربية السعودية</p>
                    <p>هاتف: .............. | فاكس: .............. | بريد إلكتروني: info@moh.gov.sa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}