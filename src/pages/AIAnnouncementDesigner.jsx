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
  Upload, Library, Edit2, Maximize2, X, Palette, FileText,
  Heart, Briefcase, GraduationCap, Megaphone, BookOpen, Shield,
  Stethoscope, CheckCircle2, Clock, Zap, Layers, Eye, Play,
  Film, PenTool, Search, UserPlus, Settings, ChevronDown
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
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAnnouncementDesigner() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
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
  const [isDragging, setIsDragging] = useState(false);

  // معالجة السحب والإفلات
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await uploadImage(file);
      } else {
        alert('الرجاء إفلات ملف صورة فقط');
      }
    }
  };

  // معالجة اللصق
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadImage(file);
        }
        break;
      }
    }
  };

  // رفع الصورة
  const uploadImage = async (file) => {
    setIsGeneratingImage(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.AnnouncementImage.create({
        title: file.name || 'صورة ملصوقة',
        description: 'صورة مرفوعة من المستخدم',
        image_url: uploadResult.file_url,
        source: 'uploaded',
        tags: ['مرفوع', 'مخصص']
      });

      setGeneratedImage(uploadResult.file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('فشل في رفع الصورة');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // توليد الفيديو
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoScript, setVideoScript] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

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

    await uploadImage(file);
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

      const prompt = `أنت مصمم جرافيك محترف متخصص في التصاميم الطبية والحكومية السعودية. قم بإنشاء تصميم HTML/CSS جميل واحترافي جداً لـ ${designTypeText}.

⚠️ مهم جداً - الخطوط والنصوص العربية:
- استخدم خطوط عربية واضحة ومقروءة: 'Cairo', 'Tajawal', 'Noto Sans Arabic'
- تأكد من أن جميع النصوص العربية واضحة ومقروءة بدون تشويه
- استخدم أحجام خطوط مناسبة للغة العربية (16px للنصوص، 24px للعناوين الفرعية، 40px+ للعناوين الرئيسية)
- اجعل المسافات بين الأسطر مريحة للقراءة (line-height: 1.8)
- استخدم font-weight مناسب للوضوح (400 للنصوص، 700 للعناوين)

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

7. الخطوط والنصوص العربية:
   - استخدم @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
   - font-family: 'Cairo', 'Tajawal', 'Noto Sans Arabic', sans-serif;
   - أحجام متدرجة: العنوان (40-60px), العناوين الفرعية (24-32px), النص (16-20px)
   - font-weight متنوع: 800 للعناوين, 700 للعناوين الفرعية, 400 للنص
   - line-height: 1.8 للنصوص العربية لسهولة القراءة
   - تأكد من أن الخطوط واضحة ومقروءة بدون تشويه

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* خلفية متحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-3 md:p-6 max-w-7xl mx-auto mobile-page-shell">
        {/* Header احترافي */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-10"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 rounded-3xl shadow-2xl">
              <Wand2 className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          <h1 className="text-2xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-3 md:mb-4 tracking-tight leading-tight">
            استوديو التصميم الذكي
          </h1>
          <p className="text-lg md:text-xl text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            أنشئ تصاميم احترافية مذهلة باستخدام قوة الذكاء الاصطناعي
          </p>
          
          {/* شريط الإحصائيات السريعة */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-5 md:mt-8">
            {[
              { icon: Layers, label: 'إعلانات', color: 'from-blue-500 to-cyan-500' },
              { icon: BookOpen, label: 'بروشورات', color: 'from-green-500 to-emerald-500' },
              { icon: Heart, label: 'توعوية', color: 'from-pink-500 to-rose-500' },
              { icon: Briefcase, label: 'وظيفية', color: 'from-orange-500 to-amber-500' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 font-medium text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* القوالب الجاهزة - محسّنة */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <div 
              className="p-3 md:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-white">قوالب جاهزة للاستخدام</h3>
                  <p className="text-purple-200/70 text-xs md:text-sm">اختر من بين {templates.length} قالب احترافي</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: showTemplates ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-white/70" />
              </motion.div>
            </div>

            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 md:p-6 pt-0 space-y-4 md:space-y-6">
                    {[
                      { type: 'announcement', title: 'إعلانات', icon: Megaphone, color: 'from-blue-500 to-cyan-500' },
                      { type: 'brochure', title: 'بروشورات', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
                      { type: 'awareness', title: 'بطاقات توعوية', icon: Heart, color: 'from-pink-500 to-rose-500' },
                      { type: 'job_description', title: 'أوصاف وظيفية', icon: Briefcase, color: 'from-orange-500 to-amber-500' },
                    ].map((category, catIdx) => (
                      <div key={category.type}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                            <category.icon className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-bold text-white">{category.title}</h4>
                          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-4">
                          {templates.filter(t => t.designType === category.type).map((template, idx) => (
                            <motion.button
                              key={template.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: catIdx * 0.1 + idx * 0.05 }}
                              onClick={() => applyTemplate(template)}
                              className="group relative p-3 md:p-5 bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 text-center overflow-hidden min-h-[108px] md:min-h-[140px]"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="relative">
                                <div className="text-3xl md:text-4xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">{template.icon}</div>
                                <div className="font-semibold text-white/90 group-hover:text-white text-xs md:text-sm leading-tight">
                                  {template.name}
                                </div>
                                {template.needsEmployees && (
                                  <div className="mt-2 flex justify-center">
                                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-1">
                                      <Users className="w-3 h-3" /> يحتاج موظفين
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                      <p className="text-purple-200 flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        اختر قالب لملء البيانات تلقائياً - يمكنك التعديل على كل شيء لاحقاً
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-6 xl:gap-8">
          {/* لوحة الإدخال */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 md:space-y-6"
          >
            {/* معلومات التصميم - محسّنة */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="p-3 md:p-5 border-b border-white/10 flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-white">معلومات التصميم</h3>
                  <p className="text-purple-200/70 text-xs md:text-sm">حدد تفاصيل المحتوى</p>
                </div>
              </div>
              
              <div className="p-3 md:p-6 space-y-4 md:space-y-5">
                <div>
                  <Label className="text-white/90 font-medium mb-2 block">نوع التصميم</Label>
                  <Select
                    value={announcementData.designType}
                    onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, designType: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="announcement" className="text-white hover:bg-white/10">📢 إعلان</SelectItem>
                      <SelectItem value="brochure" className="text-white hover:bg-white/10">📘 بروشور</SelectItem>
                      <SelectItem value="awareness" className="text-white hover:bg-white/10">🩺 بطاقة توعوية</SelectItem>
                      <SelectItem value="job_description" className="text-white hover:bg-white/10">💼 وصف وظيفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white/90 font-medium mb-2 block">عنوان التصميم *</Label>
                  <Input
                    value={announcementData.title}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="مثال: المرشحين لحضور دورة الأمن والسلامة"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl text-lg"
                  />
                </div>

                <div>
                  <Label className="text-white/90 font-medium mb-2 block">وصف أو تفاصيل</Label>
                  <Textarea
                    value={announcementData.description}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر للإعلان..."
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <Label className="text-white/90 font-medium mb-2 block flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      التاريخ
                    </Label>
                    <Input
                      type="date"
                      value={announcementData.date}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-white/90 font-medium mb-2 block flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      الوقت
                    </Label>
                    <Input
                      type="time"
                      value={announcementData.time}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, time: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/90 font-medium mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    الموقع
                  </Label>
                  <Input
                    value={announcementData.location}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="مثال: قاعة الاجتماعات - المدينة المنورة"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-white/90 font-medium mb-2 block">معلومات إضافية</Label>
                  <Textarea
                    value={announcementData.additionalInfo}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="أي ملاحظات أو تعليمات إضافية..."
                    rows={2}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                </div>

                {/* إعدادات التصميم */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    إعدادات التصميم
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                    <div>
                      <Label className="text-white/70 text-xs mb-1 block">مقاس الصفحة</Label>
                      <Select
                        value={announcementData.pageSize}
                        onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, pageSize: value }))}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          <SelectItem value="a3" className="text-white">A3</SelectItem>
                          <SelectItem value="a4" className="text-white">A4</SelectItem>
                          <SelectItem value="a5" className="text-white">A5</SelectItem>
                          <SelectItem value="a6" className="text-white">A6</SelectItem>
                          <SelectItem value="a7" className="text-white">A7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs mb-1 block">النمط</Label>
                      <Select
                        value={announcementData.designStyle}
                        onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, designStyle: value }))}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          <SelectItem value="professional" className="text-white">رسمي</SelectItem>
                          <SelectItem value="modern" className="text-white">عصري</SelectItem>
                          <SelectItem value="elegant" className="text-white">أنيق</SelectItem>
                          <SelectItem value="simple" className="text-white">بسيط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/70 text-xs mb-1 block">الألوان</Label>
                      <Select
                        value={announcementData.colorScheme}
                        onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, colorScheme: value }))}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 rounded-xl text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          <SelectItem value="blue" className="text-white">🔵 أزرق</SelectItem>
                          <SelectItem value="green" className="text-white">🟢 أخضر</SelectItem>
                          <SelectItem value="gold" className="text-white">🟡 ذهبي</SelectItem>
                          <SelectItem value="purple" className="text-white">🟣 بنفسجي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* توليد صورة بالذكاء الاصطناعي - محسّن */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="p-3 md:p-5 border-b border-white/10 flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">مولّد الصور الذكي</h3>
                  <p className="text-purple-200/70 text-sm">أنشئ صور احترافية بالذكاء الاصطناعي</p>
                </div>
              </div>
              
              <div className="p-3 md:p-6 space-y-4 md:space-y-5">
                <div>
                  <Label className="text-white/90 font-medium mb-2 block">وصف الصورة المطلوبة</Label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="مثال: أطباء يتعاونون في مستشفى حديث، فريق طبي متنوع..."
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-white/90 font-medium mb-2 block">نمط الصورة</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'realistic', label: '📷', title: 'واقعي' },
                      { value: 'illustration', label: '🎨', title: 'رسم' },
                      { value: 'minimalist', label: '⬜', title: 'بسيط' },
                      { value: 'corporate', label: '🏢', title: 'مؤسسي' },
                      { value: 'medical', label: '🏥', title: 'طبي' },
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setImageStyle(style.value)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          imageStyle === style.value 
                            ? 'border-pink-500 bg-pink-500/20' 
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-2xl mb-1">{style.label}</div>
                        <div className="text-xs text-white/70">{style.title}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* منطقة السحب والإفلات واللصق */}
                <div 
                  className={`relative border-2 border-dashed rounded-2xl p-6 mb-4 transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-pink-500 bg-pink-500/20' 
                      : 'border-white/30 hover:border-white/50 bg-white/5'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  onClick={() => document.getElementById('custom-upload')?.click()}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'v') {
                      // اللصق يتم معالجته عبر onPaste
                    }
                  }}
                >
                  <div className="text-center">
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-pink-400' : 'text-white/50'}`} />
                    <p className="text-white/80 font-medium mb-1">
                      {isDragging ? 'أفلت الصورة هنا' : 'اسحب وأفلت صورة هنا'}
                    </p>
                    <p className="text-white/50 text-sm">
                      أو <span className="text-pink-400">اضغط للاختيار</span> أو <span className="text-pink-400">Ctrl+V</span> للصق
                    </p>
                  </div>
                  <input
                    id="custom-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCustomImage}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white h-12 rounded-xl shadow-lg"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
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
                    className="border-white/20 text-white hover:bg-white/10 h-12 rounded-xl"
                  >
                    <Library className="w-4 h-4 ml-2" />
                    المكتبة
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('custom-upload')?.click()}
                    className="border-white/20 text-white hover:bg-white/10 h-12 rounded-xl"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    رفع
                  </Button>
                </div>

                {generatedImage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-pink-500/50">
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="w-full h-auto"
                        style={imageFilters ? {
                          filter: `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) saturate(${imageFilters.saturation}%)`,
                          transform: `rotate(${imageFilters.rotation}deg)`
                        } : {}}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary" onClick={handleEditImage} className="rounded-full">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = `image-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }} className="rounded-full">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setGeneratedImage(null)} className="rounded-full">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>صورة جاهزة للدمج في التصميم</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* تفعيل قسم الموظفين - محسّن */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIncludeEmployees(!includeEmployees)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
                    includeEmployees 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                      : 'bg-white/10'
                  }`}>
                    <UserPlus className={`w-6 h-6 ${includeEmployees ? 'text-white' : 'text-white/50'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">إضافة موظفين</h3>
                    <p className="text-purple-200/70 text-sm">
                      {includeEmployees 
                        ? `تم اختيار ${selectedEmployees.length} موظف` 
                        : 'اضغط لتفعيل إضافة الموظفين'
                      }
                    </p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  includeEmployees ? 'bg-green-500' : 'bg-white/20'
                }`}>
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    includeEmployees ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>

              <AnimatePresence>
                {includeEmployees && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 md:p-6 pt-0 space-y-4 md:space-y-6">
                      {/* البيانات المراد إظهارها */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-400" />
                          البيانات المراد إظهارها
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {[
                            { id: 'full_name_arabic', label: 'الاسم' },
                            { id: 'position', label: 'التخصص' },
                            { id: 'رقم_الموظف', label: 'الرقم الوظيفي' },
                            { id: 'المركز_الصحي', label: 'المركز' },
                            { id: 'department', label: 'القسم' },
                            { id: 'phone', label: 'الهاتف' },
                            { id: 'email', label: 'البريد' },
                          ].map((field) => (
                            <button
                              key={field.id}
                              onClick={() => toggleField(field.id)}
                              className={`p-2 rounded-xl text-sm font-medium transition-all ${
                                displayFields[field.id]
                                  ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                                  : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/30'
                              }`}
                            >
                              {field.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* اختيار الموظفين */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            اختيار الموظفين ({selectedEmployees.length})
                          </h4>
                          <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                              placeholder="بحث..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-40 h-9 pr-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl text-sm"
                            />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                          {filteredEmployees.slice(0, 50).map(emp => (
                            <div
                              key={emp.id}
                              onClick={() => toggleEmployee(emp)}
                              className={`p-3 rounded-xl cursor-pointer transition-all ${
                                selectedEmployees.find(e => e.id === emp.id)
                                  ? 'bg-purple-500/30 border border-purple-500/50'
                                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-white">{emp.full_name_arabic}</div>
                                  <div className="text-sm text-white/60">{emp.position} - {emp.المركز_الصحي}</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedEmployees.find(e => e.id === emp.id)
                                    ? 'bg-purple-500 border-purple-500'
                                    : 'border-white/30'
                                }`}>
                                  {selectedEmployees.find(e => e.id === emp.id) && (
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* زر التصميم الرئيسي - محسّن */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={generateDesign}
                disabled={isGenerating}
                className="w-full h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-purple-500/30 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 ml-3 animate-spin" />
                    جاري إنشاء التصميم...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6 ml-3" />
                    إنشاء التصميم بالذكاء الاصطناعي
                    <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                  </>
                )}
              </Button>
            </motion.div>

            {includeEmployees && selectedEmployees.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-2xl backdrop-blur-sm"
              >
                <p className="text-amber-200 text-center flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" />
                  لم يتم اختيار أي موظفين - قم بإلغاء تفعيل قسم الموظفين أو اختر موظفين
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* لوحة المعاينة - محسّنة */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl lg:sticky lg:top-6">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">معاينة التصميم</h3>
                    <p className="text-purple-200/70 text-sm">النتيجة النهائية</p>
                  </div>
                </div>
                {generatedDesign && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrint}
                      className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                    >
                      <Printer className="w-4 h-4 ml-1" />
                      طباعة
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownload}
                      className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                    >
                      <Download className="w-4 h-4 ml-1" />
                      تحميل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateDesign}
                      className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {!generatedDesign ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                      <Wand2 className="w-12 h-12 text-white/30" />
                    </div>
                    <p className="text-xl text-white/60 mb-2">التصميم سيظهر هنا</p>
                    <p className="text-white/40">املأ البيانات واضغط على زر الإنشاء</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                  >
                    <iframe
                      srcDoc={generatedDesign}
                      className="w-full h-[420px] md:h-[600px] bg-white"
                      title="معاينة التصميم"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* الموظفين المحددين */}
            <AnimatePresence>
              {selectedEmployees.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden"
                >
                  <div className="p-3 md:p-5 border-b border-white/10 flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">المحددين ({selectedEmployees.length})</h3>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 max-h-48 overflow-y-auto space-y-2">
                    {selectedEmployees.map((emp, index) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{emp.full_name_arabic}</div>
                            <div className="text-xs text-white/50">{emp.position}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEmployee(emp)}
                          className="text-red-400 hover:bg-red-500/20 rounded-full w-8 h-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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

        {/* معلومات مفيدة - محسّنة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-white mb-4">نصائح للحصول على أفضل النتائج</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Layers, text: 'اختر نوع التصميم المناسب للمحتوى' },
                  { icon: PenTool, text: 'اكتب عنوان واضح ومختصر وجذاب' },
                  { icon: Users, text: 'قسم الموظفين اختياري - فعّله عند الحاجة' },
                  { icon: ImageIcon, text: 'استخدم الصور المولدة لتحسين التصميم' },
                  { icon: RefreshCw, text: 'أعد التوليد للحصول على نتائج متنوعة' },
                  { icon: Printer, text: 'التصميم جاهز للطباعة بجودة عالية' },
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <tip.icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}