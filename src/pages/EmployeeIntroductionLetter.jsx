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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  PenTool,
  Plus,
  Upload,
  Loader2,
  Pencil,
  Trash2,
  Send,
  Clock
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function EmployeeIntroductionLetter() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // قوالب الخطابات المتاحة
  const letterTemplates = {
    'خطاب تعريف بالراتب': {
      title: 'خطاب تعريف بالراتب',
      getText: (emp) => `نفيدكم بأن المذكور أعلاه / ${emp?.full_name_arabic || '...............'} يعمل لدى وزارة الصحة - إدارة المراكز الصحية بالحناكية بوظيفة (${emp?.position || 'غير محدد'}) وذلك اعتباراً من تاريخ تعيينه ولا يزال على رأس العمل حتى تاريخه.

أُعطي هذا الخطاب بناءً على طلبه دون أدنى مسؤولية على الجهة المصدرة.`
    },
    'خطاب تعريف بالعمل': {
      title: 'خطاب تعريف بالعمل',
      getText: (emp) => `نفيدكم بأن المذكور أعلاه / ${emp?.full_name_arabic || '...............'} يعمل لدى وزارة الصحة - إدارة المراكز الصحية بالحناكية بوظيفة (${emp?.position || 'غير محدد'}) منذ تاريخ ${emp?.hire_date ? new Date(emp.hire_date).toLocaleDateString('ar-SA') : '...............'} ولا يزال على رأس العمل حتى تاريخه.

أُعطي هذا الخطاب بناءً على طلبه لتقديمه لمن يهمه الأمر.`
    },
    'خطاب مباشرة عمل': {
      title: 'خطاب مباشرة عمل',
      getText: (emp) => `نفيدكم بأن المذكور أعلاه / ${emp?.full_name_arabic || '...............'} قد باشر عمله لدى وزارة الصحة - إدارة المراكز الصحية بالحناكية بوظيفة (${emp?.position || 'غير محدد'}) اعتباراً من تاريخ اليوم.

أُعطي هذا الخطاب بناءً على طلبه لتقديمه للجهات المختصة.`
    },
    'شهادة خبرة': {
      title: 'شهادة خبرة',
      getText: (emp) => `نشهد بأن المذكور أعلاه / ${emp?.full_name_arabic || '...............'} قد عمل لدى وزارة الصحة - إدارة المراكز الصحية بالحناكية بوظيفة (${emp?.position || 'غير محدد'}) خلال الفترة من ${emp?.hire_date ? new Date(emp.hire_date).toLocaleDateString('ar-SA') : '...............'} وحتى تاريخه.

وقد أثبت خلال فترة عمله كفاءة وإخلاصاً في أداء مهامه الوظيفية.

أُعطيت هذه الشهادة بناءً على طلبه دون أدنى مسؤولية على الجهة المصدرة.`
    },
    'خطاب مخصص': {
      title: 'خطاب مخصص',
      getText: () => ''
    }
  };

  const [letterSettings, setLetterSettings] = useState({
    letterNumber: '',
    letterDate: new Date().toISOString().split('T')[0],
    recipient: 'من يهمه الأمر',
    letterType: 'خطاب تعريف بالراتب',
    customText: '',
    directorName: 'مدير إدارة المراكز الصحية بالحناكية',
    directorTitle: 'المشرف على المراكز الصحية',
    workStartDate: ''
  });

  // حقول إضافية
  const [additionalFields, setAdditionalFields] = useState([]);
  const [isSendingForApproval, setIsSendingForApproval] = useState(false);
  
  // الأختام والتوقيعات من النظام
  const [systemStamps, setSystemStamps] = useState([]);
  const [systemSignatures, setSystemSignatures] = useState([]);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [showAddStampDialog, setShowAddStampDialog] = useState(false);
  const [showAddSignatureDialog, setShowAddSignatureDialog] = useState(false);
  const [newStampData, setNewStampData] = useState({ name: '', owner_name: '', owner_title: '' });
  const [newSignatureData, setNewSignatureData] = useState({ name: '', owner_name: '', owner_title: '' });
  const [editingStamp, setEditingStamp] = useState(null);
  const [editingSignature, setEditingSignature] = useState(null);
  
  // إعدادات الختم والتوقيع - القيم الافتراضية المحفوظة
  const [stampSettings, setStampSettings] = useState({
    showStamp: true,
    selectedStamp: null,
    stampPosition: { x: 120, y: 700 },
    stampSize: 100
  });
  
  const [signatureSettings, setSignatureSettings] = useState({
    showSignature: true,
    selectedSignature: null,
    signaturePosition: { x: 170, y: 620 },
    signatureSize: 120
  });

  // موضع اسم المدير - القيم الافتراضية المحفوظة
  const [directorPosition, setDirectorPosition] = useState({ x: 100, y: 20 });

  // حالة السحب
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const letterRef = useRef(null);
  const signatureAreaRef = useRef(null);

  useEffect(() => {
    loadEmployees();
    loadStampsAndSignatures();
  }, []);

  // دوال السحب والإفلات
  const handleMouseDown = (e, type) => {
    e.preventDefault();
    const rect = signatureAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    let elementX, elementY;
    if (type === 'stamp') {
      elementX = stampSettings.stampPosition.x;
      elementY = stampSettings.stampPosition.y - 600;
    } else if (type === 'signature') {
      elementX = signatureSettings.signaturePosition.x - 60;
      elementY = signatureSettings.signaturePosition.y - 530;
    } else if (type === 'director') {
      elementX = directorPosition.x;
      elementY = directorPosition.y;
    }

    setDragOffset({
      x: e.clientX - rect.left - elementX,
      y: e.clientY - rect.top - elementY
    });
    setDragging(type);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !signatureAreaRef.current) return;

    const rect = signatureAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    if (dragging === 'stamp') {
      setStampSettings(prev => ({
        ...prev,
        stampPosition: { x: Math.max(0, Math.min(x + 50, 550)), y: Math.max(0, Math.min(y + 600, 800)) }
      }));
    } else if (dragging === 'signature') {
      setSignatureSettings(prev => ({
        ...prev,
        signaturePosition: { x: Math.max(0, Math.min(x + 60, 550)), y: Math.max(0, Math.min(y + 530, 750)) }
      }));
    } else if (dragging === 'director') {
      setDirectorPosition({ x: Math.max(0, Math.min(x, 500)), y: Math.max(0, Math.min(y, 150)) });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset]);

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

  const loadStampsAndSignatures = async () => {
    try {
      const data = await base44.entities.StampSignature.list('-created_date', 50);
      const items = Array.isArray(data) ? data : [];
      setSystemStamps(items.filter(item => item.type === 'stamp' && item.is_active !== false));
      setSystemSignatures(items.filter(item => item.type === 'signature' && item.is_active !== false));
      
      // تعيين الختم والتوقيع الافتراضي
      const defaultStamp = items.find(item => item.type === 'stamp' && item.is_default);
      const defaultSignature = items.find(item => item.type === 'signature' && item.is_default);
      
      if (defaultStamp) {
        setStampSettings(prev => ({ ...prev, selectedStamp: defaultStamp }));
      }
      if (defaultSignature) {
        setSignatureSettings(prev => ({ ...prev, selectedSignature: defaultSignature }));
      }
    } catch (error) {
      console.error('Error loading stamps and signatures:', error);
    }
  };

  const handleUploadStamp = async (file) => {
    if (!file) return;
    setIsUploadingStamp(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const newStamp = await base44.entities.StampSignature.create({
        name: newStampData.name || 'ختم جديد',
        type: 'stamp',
        image_url: uploadResult.file_url,
        owner_name: newStampData.owner_name || '',
        owner_title: newStampData.owner_title || '',
        is_default: systemStamps.length === 0,
        is_active: true
      });
      setSystemStamps(prev => [...prev, newStamp]);
      setStampSettings(prev => ({ ...prev, selectedStamp: newStamp }));
      setShowAddStampDialog(false);
      setNewStampData({ name: '', owner_name: '', owner_title: '' });
    } catch (error) {
      console.error('Error uploading stamp:', error);
      alert('حدث خطأ أثناء رفع الختم');
    } finally {
      setIsUploadingStamp(false);
    }
  };

  const handleUploadSignature = async (file) => {
    if (!file) return;
    setIsUploadingSignature(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const newSignature = await base44.entities.StampSignature.create({
        name: newSignatureData.name || 'توقيع جديد',
        type: 'signature',
        image_url: uploadResult.file_url,
        owner_name: newSignatureData.owner_name || '',
        owner_title: newSignatureData.owner_title || '',
        is_default: systemSignatures.length === 0,
        is_active: true
      });
      setSystemSignatures(prev => [...prev, newSignature]);
      setSignatureSettings(prev => ({ ...prev, selectedSignature: newSignature }));
      setShowAddSignatureDialog(false);
      setNewSignatureData({ name: '', owner_name: '', owner_title: '' });
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('حدث خطأ أثناء رفع التوقيع');
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleUpdateStamp = async () => {
    if (!editingStamp) return;
    try {
      await base44.entities.StampSignature.update(editingStamp.id, {
        name: editingStamp.name,
        owner_name: editingStamp.owner_name,
        owner_title: editingStamp.owner_title
      });
      setSystemStamps(prev => prev.map(s => s.id === editingStamp.id ? editingStamp : s));
      if (stampSettings.selectedStamp?.id === editingStamp.id) {
        setStampSettings(prev => ({ ...prev, selectedStamp: editingStamp }));
      }
      setEditingStamp(null);
    } catch (error) {
      console.error('Error updating stamp:', error);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const handleDeleteStamp = async (stamp) => {
    if (!confirm('هل أنت متأكد من حذف هذا الختم؟')) return;
    try {
      await base44.entities.StampSignature.delete(stamp.id);
      setSystemStamps(prev => prev.filter(s => s.id !== stamp.id));
      if (stampSettings.selectedStamp?.id === stamp.id) {
        setStampSettings(prev => ({ ...prev, selectedStamp: null }));
      }
    } catch (error) {
      console.error('Error deleting stamp:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleUpdateSignature = async () => {
    if (!editingSignature) return;
    try {
      await base44.entities.StampSignature.update(editingSignature.id, {
        name: editingSignature.name,
        owner_name: editingSignature.owner_name,
        owner_title: editingSignature.owner_title
      });
      setSystemSignatures(prev => prev.map(s => s.id === editingSignature.id ? editingSignature : s));
      if (signatureSettings.selectedSignature?.id === editingSignature.id) {
        setSignatureSettings(prev => ({ ...prev, selectedSignature: editingSignature }));
      }
      setEditingSignature(null);
    } catch (error) {
      console.error('Error updating signature:', error);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const handleDeleteSignature = async (sig) => {
    if (!confirm('هل أنت متأكد من حذف هذا التوقيع؟')) return;
    try {
      await base44.entities.StampSignature.delete(sig.id);
      setSystemSignatures(prev => prev.filter(s => s.id !== sig.id));
      if (signatureSettings.selectedSignature?.id === sig.id) {
        setSignatureSettings(prev => ({ ...prev, selectedSignature: null }));
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      alert('حدث خطأ أثناء الحذف');
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

  // النص الافتراضي للخطاب بناءً على النوع المحدد
  const getDefaultLetterText = () => {
    const template = letterTemplates[letterSettings.letterType];
    if (template && letterSettings.letterType !== 'خطاب مخصص') {
      return template.getText(selectedEmployee);
    }
    return letterSettings.customText;
  };

  // توليد رقم مؤقت للخطاب
  const generateTempLetterNumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    return `47-${month}${year}-XXX`;
  };

  // إضافة حقل جديد
  const addAdditionalField = () => {
    setAdditionalFields([...additionalFields, { label: '', value: '' }]);
  };

  // تحديث حقل إضافي
  const updateAdditionalField = (index, key, value) => {
    const updated = [...additionalFields];
    updated[index][key] = value;
    setAdditionalFields(updated);
  };

  // حذف حقل إضافي
  const removeAdditionalField = (index) => {
    setAdditionalFields(additionalFields.filter((_, i) => i !== index));
  };

  // إرسال للاعتماد
  const handleSendForApproval = async () => {
    if (!selectedEmployee) {
      alert('يرجى اختيار موظف أولاً');
      return;
    }
    
    setIsSendingForApproval(true);
    try {
      const tempNumber = generateTempLetterNumber();
      
      await base44.entities.ApprovalRequest.create({
        request_type: 'introduction_letter',
        request_number: tempNumber,
        title: `${letterTemplates[letterSettings.letterType]?.title || 'خطاب تعريف'} - ${selectedEmployee.full_name_arabic}`,
        description: `خطاب تعريف للموظف ${selectedEmployee.full_name_arabic} - ${selectedEmployee.position || 'غير محدد'}`,
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.full_name_arabic,
        request_data: JSON.stringify({
          letterSettings,
          additionalFields,
          selectedEmployee: {
            id: selectedEmployee.id,
            full_name_arabic: selectedEmployee.full_name_arabic,
            رقم_الهوية: selectedEmployee.رقم_الهوية,
            رقم_الموظف: selectedEmployee.رقم_الموظف,
            position: selectedEmployee.position,
            المركز_الصحي: selectedEmployee.المركز_الصحي
          }
        }),
        status: 'pending',
        priority: 'medium'
      });
      
      alert(`تم إرسال الطلب للاعتماد بنجاح\nالرقم المؤقت: ${tempNumber}\n\nسيتم توليد الرقم النهائي بعد الاعتماد`);
    } catch (error) {
      console.error('Error sending for approval:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSendingForApproval(false);
    }
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
                  <Label className="text-xs">نوع الخطاب</Label>
                  <Select
                    value={letterSettings.letterType}
                    onValueChange={(value) => setLetterSettings({...letterSettings, letterType: value, customText: value === 'خطاب مخصص' ? letterSettings.customText : ''})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(letterTemplates).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">تاريخ بداية العمل (اعتباراً من)</Label>
                  <Input
                    type="date"
                    value={letterSettings.workStartDate}
                    onChange={(e) => setLetterSettings({...letterSettings, workStartDate: e.target.value})}
                  />
                </div>
                
                {letterSettings.letterType === 'خطاب مخصص' && (
                  <div>
                    <Label className="text-xs">نص الخطاب المخصص</Label>
                    <Textarea
                      value={letterSettings.customText}
                      onChange={(e) => setLetterSettings({...letterSettings, customText: e.target.value})}
                      placeholder="اكتب نص الخطاب هنا..."
                      rows={4}
                    />
                  </div>
                )}

                {/* حقول إضافية */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold">بيانات إضافية للجدول</Label>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addAdditionalField}>
                      <Plus className="w-3 h-3 ml-1" />
                      إضافة حقل
                    </Button>
                  </div>
                  {additionalFields.map((field, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="اسم الحقل"
                        value={field.label}
                        onChange={(e) => updateAdditionalField(index, 'label', e.target.value)}
                        className="flex-1 text-xs h-8"
                      />
                      <Input
                        placeholder="القيمة"
                        value={field.value}
                        onChange={(e) => updateAdditionalField(index, 'value', e.target.value)}
                        className="flex-1 text-xs h-8"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeAdditionalField(index)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* إعدادات الختم */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stamp className="w-4 h-4" />
                  الختم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">اختر الختم من النظام</Label>
                    <Dialog open={showAddStampDialog} onOpenChange={setShowAddStampDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="w-3 h-3 ml-1" />
                          إضافة ختم
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إضافة ختم جديد</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">اسم الختم</Label>
                            <Input
                              value={newStampData.name}
                              onChange={(e) => setNewStampData({...newStampData, name: e.target.value})}
                              placeholder="مثال: ختم الإدارة"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">اسم المسؤول</Label>
                            <Input
                              value={newStampData.owner_name}
                              onChange={(e) => setNewStampData({...newStampData, owner_name: e.target.value})}
                              placeholder="مثال: محمد أحمد"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">المسمى الوظيفي</Label>
                            <Input
                              value={newStampData.owner_title}
                              onChange={(e) => setNewStampData({...newStampData, owner_title: e.target.value})}
                              placeholder="مثال: مدير الإدارة"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">صورة الختم</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadStamp(e.target.files[0])}
                              disabled={isUploadingStamp}
                            />
                          </div>
                          {isUploadingStamp && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جاري الرفع...
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {systemStamps.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {systemStamps.map(stamp => (
                        <div
                          key={stamp.id}
                          className={`relative p-2 rounded-lg text-xs transition-all group ${
                            stampSettings.selectedStamp?.id === stamp.id
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => setStampSettings({...stampSettings, selectedStamp: stamp})}
                            className="w-full flex flex-col items-center gap-1"
                          >
                            <img src={stamp.image_url} alt={stamp.name} className="w-10 h-10 object-contain" />
                            <span className="truncate w-full text-center">{stamp.name}</span>
                          </button>
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingStamp(stamp); }}
                              className="p-1 bg-white rounded shadow hover:bg-blue-50"
                            >
                              <Pencil className="w-3 h-3 text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteStamp(stamp); }}
                              className="p-1 bg-white rounded shadow hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed">
                      <Stamp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">لا توجد أختام محفوظة</p>
                      <p className="text-xs text-gray-400">أضف ختم جديد من الزر أعلاه</p>
                    </div>
                  )}
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
              </CardContent>
            </Card>

            {/* إعدادات التوقيع */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  التوقيع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">اختر التوقيع من النظام</Label>
                    <Dialog open={showAddSignatureDialog} onOpenChange={setShowAddSignatureDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="w-3 h-3 ml-1" />
                          إضافة توقيع
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إضافة توقيع جديد</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">اسم التوقيع</Label>
                            <Input
                              value={newSignatureData.name}
                              onChange={(e) => setNewSignatureData({...newSignatureData, name: e.target.value})}
                              placeholder="مثال: توقيع المدير"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">اسم المسؤول</Label>
                            <Input
                              value={newSignatureData.owner_name}
                              onChange={(e) => setNewSignatureData({...newSignatureData, owner_name: e.target.value})}
                              placeholder="مثال: محمد أحمد"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">المسمى الوظيفي</Label>
                            <Input
                              value={newSignatureData.owner_title}
                              onChange={(e) => setNewSignatureData({...newSignatureData, owner_title: e.target.value})}
                              placeholder="مثال: مدير الإدارة"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">صورة التوقيع</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadSignature(e.target.files[0])}
                              disabled={isUploadingSignature}
                            />
                          </div>
                          {isUploadingSignature && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جاري الرفع...
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {systemSignatures.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {systemSignatures.map(sig => (
                        <div
                          key={sig.id}
                          className={`relative p-2 rounded-lg text-xs transition-all group ${
                            signatureSettings.selectedSignature?.id === sig.id
                              ? 'ring-2 ring-green-500 bg-green-50'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => setSignatureSettings({...signatureSettings, selectedSignature: sig})}
                            className="w-full flex flex-col items-center gap-1"
                          >
                            <img src={sig.image_url} alt={sig.name} className="w-12 h-8 object-contain" />
                            <span className="truncate w-full text-center">{sig.name}</span>
                          </button>
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingSignature(sig); }}
                              className="p-1 bg-white rounded shadow hover:bg-blue-50"
                            >
                              <Pencil className="w-3 h-3 text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSignature(sig); }}
                              className="p-1 bg-white rounded shadow hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed">
                      <PenTool className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">لا توجد توقيعات محفوظة</p>
                      <p className="text-xs text-gray-400">أضف توقيع جديد من الزر أعلاه</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label className="text-xs">حجم التوقيع: {signatureSettings.signatureSize}</Label>
                  <Slider
                    value={[signatureSettings.signatureSize]}
                    onValueChange={(v) => setSignatureSettings({...signatureSettings, signatureSize: v[0]})}
                    min={60}
                    max={200}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* نافذة تعديل الختم */}
            <Dialog open={!!editingStamp} onOpenChange={() => setEditingStamp(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تعديل الختم</DialogTitle>
                </DialogHeader>
                {editingStamp && (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <img src={editingStamp.image_url} alt={editingStamp.name} className="w-20 h-20 object-contain" />
                    </div>
                    <div>
                      <Label className="text-xs">اسم الختم</Label>
                      <Input
                        value={editingStamp.name}
                        onChange={(e) => setEditingStamp({...editingStamp, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">اسم المسؤول</Label>
                      <Input
                        value={editingStamp.owner_name || ''}
                        onChange={(e) => setEditingStamp({...editingStamp, owner_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">المسمى الوظيفي</Label>
                      <Input
                        value={editingStamp.owner_title || ''}
                        onChange={(e) => setEditingStamp({...editingStamp, owner_title: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditingStamp(null)}>إلغاء</Button>
                      <Button onClick={handleUpdateStamp}>حفظ التغييرات</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* نافذة تعديل التوقيع */}
            <Dialog open={!!editingSignature} onOpenChange={() => setEditingSignature(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تعديل التوقيع</DialogTitle>
                </DialogHeader>
                {editingSignature && (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <img src={editingSignature.image_url} alt={editingSignature.name} className="w-24 h-12 object-contain" />
                    </div>
                    <div>
                      <Label className="text-xs">اسم التوقيع</Label>
                      <Input
                        value={editingSignature.name}
                        onChange={(e) => setEditingSignature({...editingSignature, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">اسم المسؤول</Label>
                      <Input
                        value={editingSignature.owner_name || ''}
                        onChange={(e) => setEditingSignature({...editingSignature, owner_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">المسمى الوظيفي</Label>
                      <Input
                        value={editingSignature.owner_title || ''}
                        onChange={(e) => setEditingSignature({...editingSignature, owner_title: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditingSignature(null)}>إلغاء</Button>
                      <Button onClick={handleUpdateSignature}>حفظ التغييرات</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* أزرار التصدير */}
            <div className="space-y-2">
              <Button 
                onClick={handleSendForApproval} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={!selectedEmployee || isSendingForApproval}
              >
                {isSendingForApproval ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-2" />
                )}
                إرسال للاعتماد
              </Button>
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
              <p className="text-xs text-center text-gray-500">
                <Clock className="w-3 h-3 inline ml-1" />
                الرقم المؤقت: {generateTempLetterNumber()}
              </p>
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
                      {letterTemplates[letterSettings.letterType]?.title || letterSettings.letterType}
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
                            <td className="py-1.5 font-bold text-center" style={{width: '15%'}}>الاسم:</td>
                            <td className="py-1.5 text-center" style={{width: '35%'}}>{selectedEmployee.full_name_arabic}</td>
                            <td className="py-1.5 font-bold text-center" style={{width: '15%'}}>رقم الهوية:</td>
                            <td className="py-1.5 text-center" style={{width: '35%'}}>{selectedEmployee.رقم_الهوية || 'غير محدد'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1.5 font-bold text-center">الرقم الوظيفي:</td>
                            <td className="py-1.5 text-center">{selectedEmployee.رقم_الموظف || 'غير محدد'}</td>
                            <td className="py-1.5 font-bold text-center">الوظيفة:</td>
                            <td className="py-1.5 text-center">{selectedEmployee.position || 'غير محدد'}</td>
                          </tr>
                          <tr className={additionalFields.length > 0 ? "border-b" : ""}>
                            <td className="py-1.5 font-bold text-center">جهة العمل:</td>
                            <td className="py-1.5 text-center" colSpan={3}>{selectedEmployee.المركز_الصحي || 'إدارة المراكز الصحية'}</td>
                          </tr>
                          {/* حقول إضافية */}
                          {additionalFields.filter(f => f.label && f.value).map((field, index) => (
                            <tr key={index} className={index < additionalFields.filter(f => f.label && f.value).length - 1 ? "border-b" : ""}>
                              <td className="py-1.5 font-bold text-center">{field.label}:</td>
                              <td className="py-1.5 text-center" colSpan={3}>{field.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Alert className="mb-6">
                      <AlertDescription>الرجاء اختيار موظف من القائمة</AlertDescription>
                    </Alert>
                  )}

                  {/* نص الخطاب الجديد */}
                  <div className="mb-4 leading-8 text-justify">
                    <p>
                      نفيدكم بأن الموضحة بياناته أعلاه أحد منسوبي إدارة المراكز الصحية بالحناكية، ويعمل بوظيفة ({selectedEmployee?.position || '............'}) وذلك اعتباراً من ({letterSettings.workStartDate ? new Date(letterSettings.workStartDate).toLocaleDateString('ar-SA') : '............'}) ولا يزال على رأس العمل حتى تاريخه.
                    </p>
                  </div>

                  <div className="mb-4 leading-8 text-justify">
                    <p>
                      وقد أُعطي هذا الخطاب بناءً على طلبه دون أدنى مسؤولية على الجهة المصدرة.
                    </p>
                  </div>

                  {/* التحية */}
                  <div className="mb-12 text-center">
                    <p>وتقبلوا وافر التحية والتقدير،،،</p>
                  </div>

                  {/* قسم التوقيع والختم */}
                  <div 
                    ref={signatureAreaRef}
                    className="relative" 
                    style={{ height: '200px', cursor: dragging ? 'grabbing' : 'default' }}
                  >
                    {/* اسم المدير - قابل للسحب */}
                    <div 
                      className={`absolute text-center cursor-grab select-none ${dragging === 'director' ? 'ring-2 ring-blue-500 bg-blue-50/50 rounded' : 'hover:ring-2 hover:ring-gray-300 hover:bg-gray-50/50 rounded'}`}
                      style={{ 
                        left: `${directorPosition.x}px`,
                        top: `${directorPosition.y}px`,
                        padding: '4px 8px'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'director')}
                    >
                      <p className="font-bold text-lg">
                        {signatureSettings.selectedSignature?.owner_name || letterSettings.directorName}
                      </p>
                      <p className="text-gray-600">
                        {signatureSettings.selectedSignature?.owner_title || letterSettings.directorTitle}
                      </p>
                      <Move className="w-3 h-3 text-gray-400 mx-auto mt-1 no-print" />
                    </div>

                    {/* التوقيع من النظام - قابل للسحب */}
                    {signatureSettings.showSignature && signatureSettings.selectedSignature && (
                      <div
                        className={`absolute cursor-grab select-none ${dragging === 'signature' ? 'ring-2 ring-green-500 rounded' : 'hover:ring-2 hover:ring-green-300 rounded'}`}
                        style={{
                          left: `${signatureSettings.signaturePosition.x - 60}px`,
                          top: `${signatureSettings.signaturePosition.y - 530}px`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'signature')}
                      >
                        <img
                          src={signatureSettings.selectedSignature.image_url}
                          alt="التوقيع"
                          style={{
                            width: `${signatureSettings.signatureSize}px`,
                            opacity: 0.9
                          }}
                          draggable={false}
                        />
                        <Move className="w-3 h-3 text-green-400 mx-auto mt-1 no-print" />
                      </div>
                    )}

                    {/* الختم من النظام - قابل للسحب */}
                    {stampSettings.showStamp && stampSettings.selectedStamp && (
                      <div
                        className={`absolute cursor-grab select-none ${dragging === 'stamp' ? 'ring-2 ring-blue-500 rounded-full' : 'hover:ring-2 hover:ring-blue-300 rounded-full'}`}
                        style={{
                          left: `${stampSettings.stampPosition.x - 50}px`,
                          top: `${stampSettings.stampPosition.y - 600}px`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'stamp')}
                      >
                        <img
                          src={stampSettings.selectedStamp.image_url}
                          alt="الختم"
                          style={{
                            width: `${stampSettings.stampSize}px`,
                            opacity: 0.85
                          }}
                          draggable={false}
                        />
                        <Move className="w-3 h-3 text-blue-400 mx-auto mt-1 no-print" />
                      </div>
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