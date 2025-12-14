import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Wand2, Download, Printer, RefreshCw, Users, Calendar,
  MapPin, Info, Sparkles, Image as ImageIcon, Loader2,
  Upload, Library, Edit2, Maximize2
} from 'lucide-react';
import ImageLibrary from '../components/announcement/ImageLibrary';
import ImageEditor from '../components/announcement/ImageEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AIAnnouncementDesigner() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [includeEmployees, setIncludeEmployees] = useState(false);
  
  // توليد الصور
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const [imageFilters, setImageFilters] = useState(null);

  // القوالب الجاهزة
  const templates = [
    // إعلانات
    {
      id: 'training',
      name: 'دعوة تدريب',
      icon: '🎓',
      designType: 'announcement',
      title: 'المرشحين لحضور دورة [اسم الدورة]',
      description: 'يسر القطاع دعوتكم لحضور الدورة التدريبية',
      designStyle: 'professional',
      colorScheme: 'blue',
      additionalInfo: 'يرجى الحضور في الموعد المحدد والالتزام بالزي الرسمي',
      needsEmployees: true,
      suggestedFields: ['full_name_arabic', 'position', 'المركز_الصحي']
    },
    {
      id: 'event',
      name: 'إعلان حدث',
      icon: '🎉',
      designType: 'announcement',
      title: 'المدعوين لحضور [اسم الحدث]',
      description: 'يشرفنا دعوتكم لحضور الحدث الخاص',
      designStyle: 'elegant',
      colorScheme: 'gold',
      additionalInfo: 'نتطلع لحضوركم الكريم',
      needsEmployees: true,
      suggestedFields: ['full_name_arabic', 'position', 'المركز_الصحي']
    },
    {
      id: 'notice',
      name: 'إشعار عام',
      icon: '📢',
      designType: 'announcement',
      title: 'إشعار هام',
      description: 'إعلان موجه للجميع',
      designStyle: 'professional',
      colorScheme: 'blue',
      additionalInfo: '',
      needsEmployees: false,
      suggestedFields: []
    },
    // بروشورات
    {
      id: 'health_brochure',
      name: 'بروشور صحي',
      icon: '📘',
      designType: 'brochure',
      title: 'دليل الصحة والوقاية',
      description: 'معلومات صحية مهمة',
      designStyle: 'modern',
      colorScheme: 'green',
      additionalInfo: 'معلومات موثوقة من وزارة الصحة',
      needsEmployees: false,
      suggestedFields: []
    },
    {
      id: 'services_brochure',
      name: 'بروشور خدمات',
      icon: '📗',
      designType: 'brochure',
      title: 'الخدمات المتاحة',
      description: 'تعرف على خدماتنا',
      designStyle: 'professional',
      colorScheme: 'blue',
      additionalInfo: '',
      needsEmployees: false,
      suggestedFields: []
    },
    // بطاقات توعوية
    {
      id: 'hygiene_awareness',
      name: 'بطاقة توعية صحية',
      icon: '🩺',
      designType: 'awareness',
      title: 'نصائح للوقاية من العدوى',
      description: 'حافظ على صحتك',
      designStyle: 'simple',
      colorScheme: 'green',
      additionalInfo: 'اتبع الإرشادات للحفاظ على السلامة',
      needsEmployees: false,
      suggestedFields: []
    },
    {
      id: 'safety_awareness',
      name: 'بطاقة الأمن والسلامة',
      icon: '🛡️',
      designType: 'awareness',
      title: 'قواعد الأمن والسلامة',
      description: 'سلامتك مسؤوليتنا',
      designStyle: 'professional',
      colorScheme: 'blue',
      additionalInfo: '',
      needsEmployees: false,
      suggestedFields: []
    },
    // وصف عمل
    {
      id: 'nurse_job',
      name: 'وصف وظيفي - تمريض',
      icon: '💼',
      designType: 'job_description',
      title: 'وصف وظيفي: ممرض/ممرضة',
      description: 'المهام والمسؤوليات',
      designStyle: 'professional',
      colorScheme: 'blue',
      additionalInfo: '',
      needsEmployees: false,
      suggestedFields: []
    },
    {
      id: 'doctor_job',
      name: 'وصف وظيفي - طبيب',
      icon: '👨‍⚕️',
      designType: 'job_description',
      title: 'وصف وظيفي: طبيب عام',
      description: 'المهام والمسؤوليات',
      designStyle: 'professional',
      colorScheme: 'blue',
      additionalInfo: '',
      needsEmployees: false,
      suggestedFields: []
    }
  ];

  // بيانات التصميم
  const [announcementData, setAnnouncementData] = useState({
    designType: 'announcement', // announcement, brochure, awareness, job_description
    pageSize: 'a4', // a3, a4, a5, a6, a7
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    additionalInfo: '',
    designStyle: 'professional',
    colorScheme: 'blue'
  });

  // البيانات المراد إظهارها
  const [displayFields, setDisplayFields] = useState({
    full_name_arabic: true,
    position: true,
    رقم_الموظف: false,
    المركز_الصحي: true,
    department: false,
    phone: false,
    email: false
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Employee.list('-updated_date', 500);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployee = (employee) => {
    setSelectedEmployees(prev => {
      const exists = prev.find(e => e.id === employee.id);
      if (exists) {
        return prev.filter(e => e.id !== employee.id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const toggleField = (field) => {
    setDisplayFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const applyTemplate = (template) => {
    setAnnouncementData(prev => ({
      ...prev,
      designType: template.designType,
      title: template.title,
      description: template.description,
      designStyle: template.designStyle,
      colorScheme: template.colorScheme,
      additionalInfo: template.additionalInfo
    }));

    // تطبيق الحقول المقترحة
    const newDisplayFields = {};
    Object.keys(displayFields).forEach(field => {
      newDisplayFields[field] = template.suggestedFields?.includes(field) || false;
    });
    setDisplayFields(newDisplayFields);

    // تفعيل أو إلغاء تفعيل قسم الموظفين
    setIncludeEmployees(template.needsEmployees || false);

    setShowTemplates(false);
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      alert('الرجاء إدخال وصف للصورة');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const styleDescriptions = {
        realistic: 'photorealistic, high quality, professional photography',
        illustration: 'digital illustration, modern art style, clean design',
        minimalist: 'minimalist design, simple shapes, clean lines, flat design',
        corporate: 'corporate style, professional, business environment, saudi arabia',
        medical: 'medical illustration, healthcare setting, clean and professional'
      };

      const fullPrompt = `${imagePrompt}, ${styleDescriptions[imageStyle]}, Saudi Arabian context, professional medical environment, high quality, 4k`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt: fullPrompt
      });

      if (response && response.url) {
        setGeneratedImage(response.url);
        
        // حفظ الصورة في المكتبة تلقائياً
        await base44.entities.AnnouncementImage.create({
          title: imagePrompt.substring(0, 50),
          description: imagePrompt,
          image_url: response.url,
          source: 'generated',
          style: imageStyle,
          tags: [imageStyle, 'مولد']
        });
      } else {
        throw new Error('فشل في توليد الصورة');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('فشل في توليد الصورة: ' + error.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSelectFromLibrary = (image) => {
    setGeneratedImage(image.image_url);
    setShowImageLibrary(false);
  };

  const handleUploadCustomImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.AnnouncementImage.create({
        title: file.name,
        description: 'صورة مرفوعة من المستخدم',
        image_url: uploadResult.file_url,
        source: 'uploaded',
        tags: ['مرفوع', 'مخصص']
      });

      setGeneratedImage(uploadResult.file_url);
      alert('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('فشل في رفع الصورة');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEditImage = () => {
    if (!generatedImage) {
      alert('لا توجد صورة للتعديل');
      return;
    }
    setImageToEdit(generatedImage);
    setShowImageEditor(true);
  };

  const handleSaveEditedImage = (editedData) => {
    setGeneratedImage(editedData.url);
    setImageFilters(editedData.filters);
    setShowImageEditor(false);
  };

  const generateDesign = async () => {
    if (!announcementData.title) {
      alert('الرجاء إدخال عنوان التصميم');
      return;
    }
    
    if (includeEmployees && selectedEmployees.length === 0) {
      alert('الرجاء اختيار موظف واحد على الأقل أو إلغاء تفعيل قسم الموظفين');
      return;
    }

    setIsGenerating(true);
    try {
      // تجهيز بيانات الموظفين المحددة (إذا كانت مفعلة)
      const employeesData = includeEmployees ? selectedEmployees.map(emp => {
        const empData = {};
        Object.keys(displayFields).forEach(field => {
          if (displayFields[field]) {
            empData[field] = emp[field] || 'غير محدد';
          }
        });
        return empData;
      }) : [];

      const filterStyle = imageFilters 
        ? `filter: brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%); transform: rotate(${imageFilters.rotation}deg);`
        : '';

      const imageInstruction = generatedImage 
        ? `\n\nصورة مضمنة (يجب استخدامها في التصميم):\n<img src="${generatedImage}" alt="صورة التصميم" style="max-width: 100%; height: auto; border-radius: 10px; margin: 20px 0; ${filterStyle}">\nاستخدم هذه الصورة بشكل جذاب في أعلى أو جانب التصميم.`
        : '';

      const designTypeText = {
        announcement: 'إعلان رسمي',
        brochure: 'بروشور معلوماتي',
        awareness: 'بطاقة توعوية',
        job_description: 'وصف وظيفي'
      }[announcementData.designType] || 'إعلان';

      const backgroundInstructions = {
        announcement: 'استخدم خلفية gradient احترافية من الأزرق الفاتح للأبيض، مع أشكال هندسية شفافة في الخلفية',
        brochure: 'استخدم خلفية بألوان هادئة مع patterns طبية دقيقة (صليب، نبضات قلب)، واجعل الخلفية متدرجة بشكل ناعم',
        awareness: 'خلفية بسيطة مع أيقونات طبية شفافة كبيرة في الخلفية (قلب، يد، درع)، مع gradients ناعمة',
        job_description: 'خلفية رسمية احترافية بألوان هادئة مع شريط جانبي ملون'
      }[announcementData.designType];

      const pageSizes = {
        a3: { width: '297mm', height: '420mm' },
        a4: { width: '210mm', height: '297mm' },
        a5: { width: '148mm', height: '210mm' },
        a6: { width: '105mm', height: '148mm' },
        a7: { width: '74mm', height: '105mm' }
      };

      const currentSize = pageSizes[announcementData.pageSize] || pageSizes.a4;

      const prompt = `أنت مصمم جرافيك محترف متخصص في التصاميم الطبية والحكومية. قم بإنشاء تصميم HTML/CSS جميل واحترافي جداً لـ ${designTypeText}.

معلومات التصميم:
- العنوان: ${announcementData.title}
- الوصف: ${announcementData.description || 'لا يوجد'}
- التاريخ: ${announcementData.date || 'غير محدد'}
- الوقت: ${announcementData.time || 'غير محدد'}
- الموقع: ${announcementData.location || 'غير محدد'}
- معلومات إضافية: ${announcementData.additionalInfo || 'لا يوجد'}${imageInstruction}
${includeEmployees && employeesData.length > 0 ? `\nأسماء المرشحين وبياناتهم:\n${JSON.stringify(employeesData, null, 2)}` : ''}

نوع التصميم: ${designTypeText}
نمط التصميم المطلوب: ${announcementData.designStyle}
نظام الألوان: ${announcementData.colorScheme}

المطلوب - تصميم احترافي جداً:
1. المقاس والتخطيط:
   - مقاس الصفحة: ${currentSize.width} × ${currentSize.height} (${announcementData.pageSize.toUpperCase()})
   - التخطيط: portrait (عمودي) - الطول أكبر من العرض
   - استخدم @page { size: ${announcementData.pageSize.toUpperCase()} portrait; margin: 0; }
   - width: ${currentSize.width}; height: ${currentSize.height}; في body

2. الخلفية - مهم جداً:
   ${backgroundInstructions}
   - أضف تأثيرات ظل ناعمة (box-shadow) على العناصر المهمة
   - استخدم borders رفيعة وأنيقة
   - أضف decorative elements في الزوايا

3. الألوان والتدرجات:
   - استخدم ألوان ${announcementData.colorScheme === 'blue' ? 'أزرق (#1e40af, #3b82f6) وأخضر (#10b981)' : announcementData.colorScheme === 'green' ? 'أخضر (#059669, #10b981) ورمادي (#6b7280)' : announcementData.colorScheme === 'purple' ? 'بنفسجي (#7c3aed, #a855f7) ووردي (#ec4899)' : 'ذهبي (#f59e0b, #d97706) وأزرق (#1e40af)'}
   - أضف gradients ناعمة جداً في الخلفيات
   - استخدم شفافية (opacity, rgba) بذكاء

4. العنوان:
   - اجعله كبير جداً (40-60px) وبارز
   - أضف له خلفية gradient أو شريط ملون
   - استخدم font-weight: 800 و text-shadow ناعم

5. المحتوى:
${includeEmployees && employeesData.length > 0 ? '   - نسق أسماء المرشحين في جدول أنيق مع borders وألوان تبادلية للصفوف\n   - أضف أيقونات للأعمدة\n' : ''}${designTypeText === 'وصف وظيفي' ? '   - نظم المحتوى في صناديق (cards) ملونة: المهام، المسؤوليات، المتطلبات، المؤهلات\n   - أضف أيقونات لكل قسم\n' : ''}${designTypeText === 'بطاقة توعوية' ? '   - استخدم رسوم توضيحية وأيقونات كبيرة وواضحة\n   - اجعل المعلومات في نقاط كبيرة وسهلة القراءة\n   - أضف صناديق ملونة للنصائح المهمة\n' : ''}${designTypeText === 'بروشور معلوماتي' ? '   - نظم المحتوى في أقسام (sections) بخلفيات متناوبة\n   - استخدم نقاط وقوائم مع أيقونات\n   - أضف sidebar ملون للعناوين الفرعية\n' : ''}
6. شعار وزارة الصحة:
   - ضع الشعار في الأعلى أو الزاوية
   - أضف نص "وزارة الصحة - المملكة العربية السعودية" بخط أنيق
   - استخدم اللون الأخضر المميز لوزارة الصحة

7. الخطوط:
   - استخدم 'Cairo', 'Tajawal' للعربية
   - أحجام متدرجة: العنوان (40-60px), العناوين الفرعية (24-32px), النص (16-20px)
   - font-weight متنوع: 800 للعناوين, 600 للعناوين الفرعية, 400 للنص

8. عناصر تصميمية إضافية:
   - أضف أيقونات ملونة من Unicode (✓, ★, ●, ▶, 🏥, 📋, etc)
   - استخدم border-radius للزوايا الدائرية (8-16px)
   - أضف decorative dividers بين الأقسام
   - استخدم padding وmargin سخية للتهوية

9. جودة الطباعة:
   - استخدم @media print لتحسين الطباعة
   - تأكد من الألوان واضحة عند الطباعة
   - لا تستخدم ألوان فاتحة جداً على خلفية بيضاء

${generatedImage ? '10. دمج الصورة:\n   - ضع الصورة في موقع بارز (أعلى أو جانب)\n   - أضف إطار أنيق للصورة\n   - استخدم border-radius وbox-shadow' : ''}

التصميم يجب أن يكون:
- احترافي جداً مع خلفيات جميلة
- جاهز للطباعة بجودة عالية
- ملفت للنظر ومنظم
- يعكس الهوية الحكومية السعودية

⚠️ مهم جداً - اتجاه النص العربي والمقاسات:
- استخدم dir="rtl" في الـ <html> و <body>
- استخدم text-align: right لجميع النصوص العربية
- اجعل الجداول والعناصر تبدأ من اليمين
- تأكد من أن التخطيط كامل من اليمين لليسار (RTL)
- الصفحة portrait (عمودي) وليس landscape
- استخدم المقاسات المحددة بالضبط: ${currentSize.width} × ${currentSize.height}

أرجع ONLY كود HTML كامل متضمن CSS inline بدون أي نص إضافي أو شروحات.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedDesign(response);
    } catch (error) {
      console.error('Error generating design:', error);
      alert('فشل في توليد التصميم: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatedDesign);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDesign], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `announcement-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredEmployees = employees.filter(emp =>
    !searchQuery ||
    emp.full_name_arabic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.رقم_الموظف?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl mb-4">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            أداة التصميم بالذكاء الاصطناعي
          </h1>
          <p className="text-lg text-gray-600">
            صمم إعلانات، بروشورات، بطاقات توعوية، أو أوصاف وظيفية احترافية في ثوانٍ
          </p>
        </div>

        {/* القوالب الجاهزة */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                ابدأ بقالب جاهز
              </span>
              <Button
                variant={showTemplates ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                {showTemplates ? 'إخفاء القوالب' : 'عرض القوالب'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showTemplates && (
            <CardContent>
              <div className="space-y-4">
                {/* إعلانات */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-2">📢 إعلانات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.filter(t => t.designType === 'announcement').map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="p-4 border-2 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-center group bg-white"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-purple-700">
                          {template.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* بروشورات */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-2">📘 بروشورات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.filter(t => t.designType === 'brochure').map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="p-4 border-2 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-center group bg-white"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-purple-700">
                          {template.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* بطاقات توعوية */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-2">🩺 بطاقات توعوية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.filter(t => t.designType === 'awareness').map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="p-4 border-2 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-center group bg-white"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-purple-700">
                          {template.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* أوصاف وظيفية */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-2">💼 أوصاف وظيفية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.filter(t => t.designType === 'job_description').map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="p-4 border-2 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-center group bg-white"
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-purple-700">
                          {template.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  اختر قالب لملء البيانات تلقائياً - يمكنك التعديل على كل شيء لاحقاً
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* لوحة الإدخال */}
          <div className="space-y-6">
            {/* معلومات التصميم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  معلومات التصميم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نوع التصميم</Label>
                  <Select
                    value={announcementData.designType}
                    onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, designType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">📢 إعلان</SelectItem>
                      <SelectItem value="brochure">📘 بروشور</SelectItem>
                      <SelectItem value="awareness">🩺 بطاقة توعوية</SelectItem>
                      <SelectItem value="job_description">💼 وصف وظيفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>عنوان التصميم *</Label>
                  <Input
                    value={announcementData.title}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="مثال: المرشحين لحضور دورة الأمن والسلامة"
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label>وصف أو تفاصيل</Label>
                  <Textarea
                    value={announcementData.description}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر للإعلان..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التاريخ</Label>
                    <Input
                      type="date"
                      value={announcementData.date}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>الوقت</Label>
                    <Input
                      type="time"
                      value={announcementData.time}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>الموقع</Label>
                  <Input
                    value={announcementData.location}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="مثال: قاعة الاجتماعات - المدينة المنورة"
                  />
                </div>

                <div>
                  <Label>معلومات إضافية</Label>
                  <Textarea
                    value={announcementData.additionalInfo}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="أي ملاحظات أو تعليمات إضافية..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>مقاس الصفحة</Label>
                    <Select
                      value={announcementData.pageSize}
                      onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, pageSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a3">A3 (297 × 420 ملم)</SelectItem>
                        <SelectItem value="a4">A4 (210 × 297 ملم)</SelectItem>
                        <SelectItem value="a5">A5 (148 × 210 ملم)</SelectItem>
                        <SelectItem value="a6">A6 (105 × 148 ملم)</SelectItem>
                        <SelectItem value="a7">A7 (74 × 105 ملم)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نمط التصميم</Label>
                    <Select
                      value={announcementData.designStyle}
                      onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, designStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">رسمي واحترافي</SelectItem>
                        <SelectItem value="modern">عصري وجذاب</SelectItem>
                        <SelectItem value="elegant">أنيق وفاخر</SelectItem>
                        <SelectItem value="simple">بسيط ونظيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نظام الألوان</Label>
                    <Select
                      value={announcementData.colorScheme}
                      onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, colorScheme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">أزرق وأخضر</SelectItem>
                        <SelectItem value="green">أخضر ورمادي</SelectItem>
                        <SelectItem value="gold">ذهبي وأزرق</SelectItem>
                        <SelectItem value="purple">بنفسجي ووردي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* توليد صورة بالذكاء الاصطناعي */}
            <Card className="border-2 border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-600" />
                  توليد صورة بالذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>وصف الصورة المطلوبة</Label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="مثال: أطباء يتعاونون في مستشفى حديث، فريق طبي متنوع، بيئة صحية احترافية..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>نمط الصورة</Label>
                  <Select
                    value={imageStyle}
                    onValueChange={setImageStyle}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">واقعي (تصوير فوتوغرافي)</SelectItem>
                      <SelectItem value="illustration">رسم توضيحي (Illustration)</SelectItem>
                      <SelectItem value="minimalist">بسيط (Minimalist)</SelectItem>
                      <SelectItem value="corporate">مؤسسي احترافي</SelectItem>
                      <SelectItem value="medical">طبي متخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 ml-2" />
                        توليد
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowImageLibrary(true)}
                  >
                    <Library className="w-4 h-4 ml-2" />
                    المكتبة
                  </Button>
                </div>

                <label htmlFor="custom-upload">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isGeneratingImage}
                    asChild
                  >
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 ml-2" />
                      رفع صورة خاصة
                    </span>
                  </Button>
                </label>
                <input
                  id="custom-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCustomImage}
                  className="hidden"
                />

                {generatedImage && (
                  <div className="mt-4 space-y-2">
                    <div className="border-2 border-pink-200 rounded-lg overflow-hidden">
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="w-full h-auto"
                        style={imageFilters ? {
                          filter: `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`,
                          transform: `rotate(${imageFilters.rotation}deg)`
                        } : {}}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditImage}
                      >
                        <Edit2 className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedImage(null)}
                      >
                        <X className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateImage}
                      >
                        <RefreshCw className="w-3 h-3 ml-1" />
                        جديدة
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 bg-pink-50 p-3 rounded-lg border border-pink-200">
                  💡 الصورة المولدة ستُدمج تلقائياً في التصميم النهائي
                </div>
              </CardContent>
            </Card>

            {/* تفعيل قسم الموظفين */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    إضافة موظفين للتصميم
                  </span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-employees"
                      checked={includeEmployees}
                      onCheckedChange={setIncludeEmployees}
                    />
                    <Label htmlFor="include-employees" className="cursor-pointer">
                      تفعيل
                    </Label>
                  </div>
                </CardTitle>
              </CardHeader>
              {includeEmployees && (
                <>
                  <CardHeader className="pt-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="w-4 h-4 text-green-600" />
                      البيانات المراد إظهارها
                    </CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-name"
                      checked={displayFields.full_name_arabic}
                      onCheckedChange={() => toggleField('full_name_arabic')}
                    />
                    <Label htmlFor="field-name" className="cursor-pointer">الاسم الكامل</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-position"
                      checked={displayFields.position}
                      onCheckedChange={() => toggleField('position')}
                    />
                    <Label htmlFor="field-position" className="cursor-pointer">التخصص</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-employee-num"
                      checked={displayFields.رقم_الموظف}
                      onCheckedChange={() => toggleField('رقم_الموظف')}
                    />
                    <Label htmlFor="field-employee-num" className="cursor-pointer">الرقم الوظيفي</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-center"
                      checked={displayFields.المركز_الصحي}
                      onCheckedChange={() => toggleField('المركز_الصحي')}
                    />
                    <Label htmlFor="field-center" className="cursor-pointer">المركز الصحي</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-department"
                      checked={displayFields.department}
                      onCheckedChange={() => toggleField('department')}
                    />
                    <Label htmlFor="field-department" className="cursor-pointer">القسم</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-phone"
                      checked={displayFields.phone}
                      onCheckedChange={() => toggleField('phone')}
                    />
                    <Label htmlFor="field-phone" className="cursor-pointer">الهاتف</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-email"
                      checked={displayFields.email}
                      onCheckedChange={() => toggleField('email')}
                    />
                    <Label htmlFor="field-email" className="cursor-pointer">البريد الإلكتروني</Label>
                  </div>
                </div>
              </CardContent>

              {/* اختيار الموظفين */}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    اختيار الموظفين ({selectedEmployees.length})
                  </span>
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredEmployees.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedEmployees.find(e => e.id === emp.id)
                          ? 'bg-purple-50 border-purple-300 shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{emp.full_name_arabic}</div>
                          <div className="text-sm text-gray-600">{emp.position} - {emp.المركز_الصحي}</div>
                        </div>
                        <Checkbox
                          checked={!!selectedEmployees.find(e => e.id === emp.id)}
                          onCheckedChange={() => toggleEmployee(emp)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
                </>
              )}
            </Card>

            {/* زر التصميم */}
            <Button
              onClick={generateDesign}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري التصميم...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 ml-2" />
                  توليد التصميم بالذكاء الاصطناعي
                </>
              )}
            </Button>

            {includeEmployees && selectedEmployees.length === 0 && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ لم يتم اختيار أي موظفين - قم بإلغاء تفعيل قسم الموظفين أو اختر موظفين
                </p>
              </div>
            )}

            {generatedImage && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-700">
                  <Badge className="bg-green-100 text-green-700">✓</Badge>
                  <span className="font-semibold">صورة جاهزة للدمج</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  سيتم تضمين الصورة المولدة في التصميم النهائي
                </p>
              </div>
            )}
          </div>

          {/* لوحة المعاينة */}
          <div className="space-y-6">
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    معاينة التصميم
                  </span>
                  {generatedDesign && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 ml-2" />
                        طباعة
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 ml-2" />
                        تحميل
                      </Button>
                      <Button variant="outline" size="sm" onClick={generateDesign}>
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة التصميم
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!generatedDesign ? (
                  <div className="text-center py-20 text-gray-400">
                    <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">املأ البيانات واختر الموظفين</p>
                    <p className="text-sm">ثم اضغط على "توليد التصميم" لرؤية الإعلان</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-purple-200 rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={generatedDesign}
                      className="w-full h-[600px] bg-white"
                      title="معاينة التصميم"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* الموظفين المحددين */}
            {selectedEmployees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    الموظفين المحددين ({selectedEmployees.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedEmployees.map((emp, index) => (
                      <div key={emp.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{emp.full_name_arabic}</div>
                            <div className="text-xs text-gray-600">{emp.position}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEmployee(emp)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* مكتبة الصور */}
        {showImageLibrary && (
          <ImageLibrary
            onSelectImage={handleSelectFromLibrary}
            onClose={() => setShowImageLibrary(false)}
          />
        )}

        {/* محرر الصور */}
        {showImageEditor && imageToEdit && (
          <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
            <DialogContent className="max-w-4xl">
              <ImageEditor
                imageUrl={imageToEdit}
                onSave={handleSaveEditedImage}
                onClose={() => setShowImageEditor(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* معلومات مفيدة */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">💡 نصائح للحصول على أفضل تصميم</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• اختر نوع التصميم المناسب (إعلان، بروشور، بطاقة توعوية، وصف وظيفي)</li>
                  <li>• اكتب عنوان واضح ومختصر</li>
                  <li>• قسم الموظفين اختياري - فعّله فقط عند الحاجة</li>
                  <li>• استخدم الصور المولدة لتحسين التصميم</li>
                  <li>• يمكنك إعادة التصميم عدة مرات للحصول على نتائج مختلفة</li>
                  <li>• التصميم جاهز للطباعة بجودة عالية</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}