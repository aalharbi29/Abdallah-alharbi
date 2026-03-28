import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadFile } from '@/integrations/Core';
import { Loader2, Printer, Save, Image as ImageIcon, Trash2, ShieldCheck, Upload, Settings, RotateCcw, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const SECTIONS = [
{
  id: 'fire_alarm',
  title: 'نظام إنذار الحريق',
  questions: [
  { id: 'fa_1', text: 'هل يوجد نظام إنذار حريق؟' },
  { id: 'fa_2', text: 'هل نظام الإنذار يفحص بشكل دوري؟' },
  { id: 'fa_3', text: 'هل نظام الإنذار يعمل بشكل سليم؟' },
  { id: 'fa_4', text: 'هل يوجد كواشف دخان بالمركز؟' },
  { id: 'fa_5', text: 'هل توجد عوائق على الكواسر والكواشف؟' }]

},
{
  id: 'emergency_exits',
  title: 'مخارج الطوارئ',
  hasCount: true,
  questions: [
  { id: 'ee_1', text: 'هل أبواب مخارج الطوارئ مقاومة للحريق؟' },
  { id: 'ee_2', text: 'هل توجد لوحات إرشادية لمخارج الطوارئ؟' },
  { id: 'ee_3', text: 'هل توجد عوائق بالممرات تمنع الوصول لأبواب مخارج الطوارئ؟' }]

},
{
  id: 'fire_extinguishers',
  title: 'طفايات الحريق',
  questions: [
  { id: 'fe_1', text: 'هل طفايات الحريق سليمة وعددها كاف؟' },
  { id: 'fe_2', text: 'هل يوجد ملصق الفحص الشهري على الطفاية؟' },
  { id: 'fe_3', text: 'هل تقام صيانة دورية على الطفايات؟' },
  { id: 'fe_4', text: 'هل يوجد عوائق تمنع الوصول لطفايات الحريق؟' },
  { id: 'fe_5', text: 'هل يوجد ملصق للتعليمات على الطفاية؟' }]

},
{
  id: 'storage',
  title: 'التخزين',
  questions: [
  { id: 'st_1', text: 'هل يوجد تخزين عشوائي بالممرات؟' },
  { id: 'st_2', text: 'هل التخزين في الملزمة الطبية جيد؟' },
  { id: 'st_3', text: 'هل التخزين في الصيدلية جيد؟' },
  { id: 'st_4', text: 'هل يتم تخزين المواد الخطرة وفقا لسجل بيانات سلامة المواد sds؟' }]

},
{
  id: 'security',
  title: 'المعايير الأمنية بالمركز',
  questions: [
  { id: 'sec_1', text: 'هل يوجد جهاز مانع سرقة بالمركز؟' },
  { id: 'sec_2', text: 'هل توجد اعقاب سجائر بالمنشأة؟' }]

},
{
  id: 'generator',
  title: 'المولد الاحتياطي',
  questions: [
  { id: 'gen_1', text: 'هل يوجد مولد احتياطي بالمركز؟' },
  { id: 'gen_2', text: 'هل يتم فحص المولد بدون حمل بشكل اسبوعي؟' },
  { id: 'gen_3', text: 'هل يتم فحص المولد بحمل بشكل شهري؟' }]

},
{
  id: 'medical_waste',
  title: 'النفايات الطبية',
  questions: [
  { id: 'mw_1', text: 'هل غرفة النفايات الطبية مطابقة للمواصفات؟ (ارضيتها سيراميك-يوجد بها مغسلة- التهوية جيدة)' },
  { id: 'mw_2', text: 'هل يوجد علامة واضحة على غرفة النفايات الطبية؟' },
  { id: 'mw_3', text: 'هل يتم تخزين النفايات الطبية بشكل آمن؟' }]

},
{
  id: 'fire_hose',
  title: 'صناديق إطفاء الحريق',
  hasNA: true,
  questions: [
  { id: 'fh_1', text: 'هل توجد صناديق لإطفاء الحريق؟' },
  { id: 'fh_2', text: 'هل صناديق إطفاء الحريق سليمة ولا يوجد بها تسريبات؟' },
  { id: 'fh_3', text: 'هل توجد صيانة دورية لصناديق إطفاء الحريق؟' },
  { id: 'fh_4', text: 'هل ضغط المياه لصناديق إطفاء الحريق مناسب؟' },
  { id: 'fh_5', text: 'هل توجد عوائق تمنع الوصول لصناديق إطفاء الحريق؟' }]

}];


const PROOFS = [
{ id: 'proof_fire_alarm', title: 'لوحة نظام انذار الحريق:' },
{ id: 'proof_emergency_exits', title: 'جميع مخارج الطوارئ:' },
{ id: 'proof_fire_extinguishers', title: 'طفايات الحريق:' },
{ id: 'proof_storage', title: 'التخزين:' },
{ id: 'proof_security', title: 'جهاز مانع سرقة بالمركز:' },
{ id: 'proof_generator', title: 'فحص المولد الاحتياطي:' },
{ id: 'proof_medical_waste', title: 'غرفة النفايات الطبية:' },
{ id: 'proof_fire_hose', title: 'صناديق إطفاء الحريق:' }];


const TARGET_CENTERS = ["الحسو", "طلال", "بطحي", "الهميج", "بلغة", "الماوية", "هدبان", "صخيبرة"];

export default function FillSafetyEvaluationForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    health_center_name: '',
    report_date: new Date().toISOString().split('T')[0],
    preparer_name: '',
    emergency_exits_count: '',
    answers: {},
    notes: {},
    images: {},
    signature_url: ''
  });

  const fileInputRef = useRef(null);
  const [uploadingImageId, setUploadingImageId] = useState(null);

  const [headerLayout, setHeaderLayout] = useState(() => {
    const saved = localStorage.getItem('safetyFormLayout');
    return saved ? JSON.parse(saved) : {};
  });
  const [customLogo, setCustomLogo] = useState(() => {
    return localStorage.getItem('safetyFormLogo') || null;
  });
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const updateLayout = (key, info) => {
    setHeaderLayout((prev) => {
      const current = prev[key] || { x: 0, y: 0 };
      const newLayout = {
        ...prev,
        [key]: { x: current.x + info.offset.x, y: current.y + info.offset.y }
      };
      localStorage.setItem('safetyFormLayout', JSON.stringify(newLayout));
      return newLayout;
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('جاري رفع الشعار...', { id: 'logo' });
      const res = await UploadFile({ file });
      setCustomLogo(res.file_url);
      localStorage.setItem('safetyFormLogo', res.file_url);
      toast.success('تم تغيير الشعار', { id: 'logo' });
    } catch (err) {
      toast.error('فشل رفع الشعار', { id: 'logo' });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setFormData((prev) => ({
            ...prev,
            preparer_name: user.full_name || ''
          }));

          const employees = await base44.entities.Employee.filter({ email: user.email });
          if (employees && employees.length > 0) {
            setFormData((prev) => ({
              ...prev,
              health_center_name: employees[0].المركز_الصحي || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleCenterChange = async (centerName) => {
    setFormData((prev) => ({ ...prev, health_center_name: centerName }));
    try {
      const allCenters = await base44.entities.HealthCenter.list(undefined, 200);
      const selectedCenter = allCenters.find((c) => c.اسم_المركز && c.اسم_المركز.includes(centerName));

      if (selectedCenter && selectedCenter.المدير) {
        const manager = await base44.entities.Employee.get(selectedCenter.المدير);
        if (manager) {
          setFormData((prev) => ({ ...prev, preparer_name: manager.full_name_arabic || '' }));
          toast.success(`تم جلب اسم مدير مركز ${centerName}`);
        }
      }
    } catch (error) {
      console.error("Error fetching manager:", error);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));
  };

  const handleNoteChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      notes: { ...prev.notes, [questionId]: value }
    }));
  };

  const handleImageUploadClick = (proofId) => {
    setUploadingImageId(proofId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingImageId) return;

    try {
      toast.loading('جاري رفع الصورة...', { id: 'upload' });
      const res = await UploadFile({ file });

      if (uploadingImageId === 'signature') {
        setFormData((prev) => ({ ...prev, signature_url: res.file_url }));
      } else {
        setFormData((prev) => {
          const currentImages = prev.images[uploadingImageId] || [];
          return {
            ...prev,
            images: {
              ...prev.images,
              [uploadingImageId]: [...currentImages, res.file_url]
            }
          };
        });
      }

      toast.success('تم رفع الصورة بنجاح', { id: 'upload' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('فشل رفع الصورة', { id: 'upload' });
    } finally {
      setUploadingImageId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (proofId, index) => {
    setFormData((prev) => {
      const currentImages = [...(prev.images[proofId] || [])];
      currentImages.splice(index, 1);
      return {
        ...prev,
        images: {
          ...prev.images,
          [proofId]: currentImages
        }
      };
    });
  };

  const handleSave = async () => {
    if (!formData.health_center_name) {
      toast.error('يرجى إدخال اسم المنشأة');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.SafetyEvaluationForm.create({
        health_center_name: formData.health_center_name,
        report_date: formData.report_date,
        preparer_name: formData.preparer_name,
        emergency_exits_count: Number(formData.emergency_exits_count) || 0,
        answers: formData.answers,
        notes: formData.notes,
        images: formData.images,
        signature_url: formData.signature_url,
        status: 'مكتمل'
      });
      toast.success('تم حفظ التقرير بنجاح');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const printElement = document.getElementById('printable-form');
    if (!printElement) return;

    try {
      toast.loading('جاري تجهيز ملف PDF...', { id: 'pdf' });

      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`تقييم_السلامة_${formData.health_center_name || 'المركز'}.pdf`);
      toast.success('تم تحميل ملف PDF بنجاح', { id: 'pdf' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF', { id: 'pdf' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* Action Buttons - Hidden in Print */}
        <div className="flex justify-end gap-3 mb-6 print:hidden flex-wrap">
          {isEditingLayout &&
          <Button variant="outline" onClick={() => {setHeaderLayout({});setCustomLogo(null);localStorage.removeItem('safetyFormLayout');localStorage.removeItem('safetyFormLogo');}} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <RotateCcw className="w-4 h-4" />
              إعادة ضبط
            </Button>
          }
          <Button variant="outline" onClick={() => setIsEditingLayout(!isEditingLayout)} className={`gap-2 ${isEditingLayout ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}>
            <Settings className="w-4 h-4" />
            {isEditingLayout ? 'إنهاء التعديل' : 'تعديل التخطيط'}
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة التقرير
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <Download className="w-4 h-4" />
            حفظ PDF
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التقرير
          </Button>
        </div>

        <Card id="printable-form" className="shadow-lg border-0 print:shadow-none print:border-0 rounded-xl overflow-hidden print:overflow-visible bg-white">
          <CardContent className="p-8 md:p-12 print:p-4">
            
            {/* Single Table with Thead for repeating header */}
            <table className="w-full text-right border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '40%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '27%' }} />
              </colgroup>
              <thead className="print:table-header-group">
                <tr>
                  <td colSpan={6} className="border-0 pb-6 bg-white">
                    {/* Header */}
                    <div className="relative flex justify-between items-start mb-6">
                      <motion.div
                        drag={isEditingLayout}
                        dragMomentum={false}
                        onDragEnd={(e, info) => updateLayout('header_text', info)}
                        animate={headerLayout['header_text'] || { x: 0, y: 0 }}
                        className={`text-right z-10 ${isEditingLayout ? 'cursor-move ring-2 ring-blue-400 p-2 rounded border border-dashed border-blue-400 bg-white/50' : ''}`}>
                        
                        <h2 className="text-xl font-bold text-gray-900 mb-1">الإدارة التنفيذية للأمن والسلامة</h2>
                        <h3 className="text-lg font-semibold text-gray-800">بتجمع المدينة المنورة الصحي</h3>
                      </motion.div>
                      
                      <motion.div
                        drag={isEditingLayout}
                        dragMomentum={false}
                        onDragEnd={(e, info) => updateLayout('header_logo', info)}
                        animate={headerLayout['header_logo'] || { x: 0, y: 0 }}
                        className={`w-32 h-32 flex flex-col items-center justify-center relative group z-10 ${isEditingLayout ? 'cursor-move ring-2 ring-blue-400 p-2 rounded border border-dashed border-blue-400 bg-white/50' : ''}`}>
                        
                        {customLogo ?
                        <img src={customLogo} alt="Logo" className="max-w-full max-h-full object-contain" /> :

                        <ShieldCheck className="w-20 h-20 text-blue-600" />
                        }
                        {isEditingLayout &&
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-12 whitespace-nowrap shadow-md"
                          onClick={() => document.getElementById('logo-upload').click()}>
                          
                            تغيير الشعار
                          </Button>
                        }
                      </motion.div>
                    </div>

                    <div className="py-3 mb-6 text-center">
                      <h1 className="text-gray-900 text-base font-bold">تقرير عن مدى توفر أنظمة ومتطلبات السلامة بالمراكز الصحية

                      </h1>
                    </div>

                    {/* General Info */}
                    <table className="w-full border-collapse border border-gray-800 mb-4 text-center">
                      <tbody>
                        <tr>
                          <td className="border border-gray-800 bg-gray-200 print:bg-gray-200 font-bold p-2 w-1/4">اسم المنشأة</td>
                          <td className="border border-gray-800 p-0 w-1/4">
                            <Select
                              value={formData.health_center_name}
                              onValueChange={handleCenterChange}>
                              
                              <SelectTrigger className="border-0 rounded-none bg-transparent focus:ring-0 text-center font-semibold h-full w-full shadow-none justify-center">
                                <SelectValue placeholder="اختر المركز الصحي" />
                              </SelectTrigger>
                              <SelectContent>
                                {TARGET_CENTERS.map((center) =>
                                <SelectItem key={center} value={center}>{center}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border border-gray-800 bg-gray-200 print:bg-gray-200 font-bold p-2 w-1/4">تاريخ التقرير</td>
                          <td className="border border-gray-800 p-0 w-1/4">
                            <Input
                              type="date"
                              value={formData.report_date}
                              onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                              className="border-0 rounded-none bg-transparent focus-visible:ring-0 text-center font-semibold h-full w-full" />
                            
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section) =>
                <React.Fragment key={section.id}>
                    <tr className="bg-gray-300 print:bg-gray-300 text-center">
                      <th colSpan={2} className="p-1 border border-gray-800 print:border-gray-800 font-bold text-lg text-blue-900 text-right">
                        {section.title}
                      </th>
                      <th className="p-1 border border-gray-800 print:border-gray-800 font-bold text-md">نعم</th>
                      <th className="p-1 border border-gray-800 print:border-gray-800 font-bold text-md">لا</th>
                      {section.hasNA &&
                    <th className="p-1 border border-gray-800 print:border-gray-800 font-bold text-md">لا ينطبق</th>
                    }
                      <th colSpan={section.hasNA ? 1 : 2} className="p-1 border border-gray-800 print:border-gray-800 font-bold text-md">ملاحظات</th>
                    </tr>
                    {section.questions.map((q, idx) =>
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors h-[20px]">
                        <td className="px-1 py-0 border border-gray-800 print:border-gray-800 font-bold text-center text-sm">
                          {idx + 1}
                        </td>
                        <td className="px-1 py-0 border border-gray-800 print:border-gray-800 font-medium text-sm">
                          {q.text}
                        </td>
                        <td
                      className="p-0 border border-gray-800 print:border-gray-800 text-center align-middle cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAnswerChange(q.id, 'yes')}>
                      
                          <div className="w-full h-full min-h-[20px] flex items-center justify-center">
                            {formData.answers[q.id] === 'yes' && <Check className="w-4 h-4 text-green-600" strokeWidth={4} />}
                          </div>
                        </td>
                        <td
                      className="p-0 border border-gray-800 print:border-gray-800 text-center align-middle cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAnswerChange(q.id, 'no')}>
                      
                          <div className="w-full h-full min-h-[20px] flex items-center justify-center">
                            {formData.answers[q.id] === 'no' && <Check className="w-4 h-4 text-red-600" strokeWidth={4} />}
                          </div>
                        </td>
                        {section.hasNA ?
                    <>
                            <td
                        className="p-0 border border-gray-800 print:border-gray-800 text-center align-middle cursor-pointer hover:bg-gray-100"
                        onClick={() => handleAnswerChange(q.id, 'na')}>
                        
                              <div className="w-full h-full min-h-[20px] flex items-center justify-center">
                                {formData.answers[q.id] === 'na' && <Check className="w-4 h-4 text-blue-600" strokeWidth={4} />}
                              </div>
                            </td>
                            <td className="p-0 border border-gray-800 print:border-gray-800">
                              <Input
                          value={formData.notes[q.id] || ''}
                          onChange={(e) => handleNoteChange(q.id, e.target.value)}
                          className="border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-200 h-full min-h-[20px] rounded-none px-1 py-0 text-sm"
                          placeholder="ملاحظات..." />
                        
                            </td>
                          </> :

                    <td colSpan={2} className="p-0 border border-gray-800 print:border-gray-800">
                            <Input
                        value={formData.notes[q.id] || ''}
                        onChange={(e) => handleNoteChange(q.id, e.target.value)}
                        className="border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-200 h-full min-h-[20px] rounded-none px-1 py-0 text-sm"
                        placeholder="ملاحظات..." />
                      
                          </td>
                    }
                      </tr>
                  )}
                    {section.hasCount &&
                  <tr className="bg-gray-300 print:bg-gray-300">
                        <td colSpan={6} className="p-1 border border-gray-800 print:border-gray-800">
                          <div className="flex items-center justify-center gap-4 w-full">
                            <span className="font-bold text-blue-900 text-lg">عدد مخارج الطوارئ:</span>
                            <div className="w-px h-8 bg-gray-500"></div>
                            <Input
                          type="number"
                          value={formData.emergency_exits_count}
                          onChange={(e) => setFormData({ ...formData, emergency_exits_count: e.target.value })}
                          className="w-32 h-10 border-gray-400 text-center bg-white text-lg font-bold" />
                        
                          </div>
                        </td>
                      </tr>
                  }
                  </React.Fragment>
                )}
              </tbody>
            </table>

            {/* Proofs Section */}
            <div className="mt-12 pt-8 break-before-page">
              <p className="text-red-600 font-bold text-center mb-8 text-lg">
                *يرجى إرفاق الصور التوضيحية الخاصة بكل بند من بنود التقييم لدعم النتائج وتحسين دقة التقييم*
              </p>
              
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">الاثباتات</h2>
              
              <div className="space-y-6">
                {PROOFS.map((proof) =>
                <div key={proof.id} className="bg-gray-100 p-4 border border-gray-800 print:border-gray-800 print:bg-transparent">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-red-600">{proof.title}</h3>
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUploadClick(proof.id)}
                      className="print:hidden gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 bg-white">
                      
                        <Upload className="w-4 h-4" />
                        إرفاق صورة
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {formData.images[proof.id]?.map((url, idx) =>
                    <div key={idx} className="relative group w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                          <img src={url} alt="Proof" className="w-full h-full object-cover" />
                          <button
                        onClick={() => removeImage(proof.id, idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="mt-16 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="flex items-center gap-3">
                    <label className="font-bold text-gray-900 text-xl whitespace-nowrap">معد التقرير:</label>
                    <Input
                      value={formData.preparer_name}
                      onChange={(e) => setFormData({ ...formData, preparer_name: e.target.value })}
                      className="border-b-2 border-t-0 border-x-0 border-gray-800 rounded-none bg-transparent focus-visible:ring-0 px-2 text-xl font-bold" />
                    
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="font-bold text-gray-900 text-xl whitespace-nowrap">التوقيع:</label>
                    <div className="flex-1 h-20 border-b-2 border-gray-800 flex items-end pb-1 relative">
                      {formData.signature_url ?
                      <div className="relative w-full h-full">
                          <img src={formData.signature_url} alt="Signature" className="h-full object-contain" />
                          <button
                          onClick={() => setFormData({ ...formData, signature_url: '' })}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full print:hidden">
                          
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div> :

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImageUploadClick('signature')}
                        className="w-full text-gray-500 hover:text-blue-600 print:hidden h-full">
                        
                          <Upload className="w-5 h-5 ml-2" />
                          إرفاق توقيع
                        </Button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" />
        
        <input
          type="file"
          id="logo-upload"
          onChange={handleLogoUpload}
          accept="image/*"
          className="hidden" />
        
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          * { box-sizing: border-box !important; }
          body { background-color: white !important; margin: 0 !important; padding: 0 !important; direction: rtl !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:max-w-none { max-width: 100% !important; width: 100% !important; }
          .break-before-page { page-break-before: always; }
          html, body, #root { height: auto !important; overflow: visible !important; width: 100% !important; }
          .responsive-shell { display: block !important; height: auto !important; overflow: visible !important; width: 100% !important; }
          main { overflow: visible !important; height: auto !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          table { width: 100% !important; max-width: 100% !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
          .bg-gray-50 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
          .bg-gray-200 { background-color: #e5e7eb !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
          .bg-gray-300 { background-color: #d1d5db !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
      `}</style>
    </div>);

}