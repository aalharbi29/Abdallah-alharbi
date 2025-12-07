
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Trash2, 
  Save, 
  Download,
  ArrowLeft,
  ArrowRight,
  Presentation as PresentationIcon,
  Palette,
  Type,
  Image as ImageIcon,
  Layout,
  Play,
  FileText,
  Loader2,
  Copy,
  CheckCircle // Added CheckCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PresentationViewer from '../components/presentation/PresentationViewer';
import SlideEditor from '../components/presentation/SlideEditor';

const layouts = [
  { value: 'title', label: 'شريحة عنوان', icon: Type },
  { value: 'content', label: 'محتوى', icon: FileText },
  { value: 'two-column', label: 'عمودين', icon: Layout },
  { value: 'image', label: 'صورة', icon: ImageIcon },
  { value: 'blank', label: 'فارغة', icon: Layout }
];

const themes = [
  { name: 'كلاسيكي', primary: '#1e40af', secondary: '#3b82f6', bg: '#ffffff' },
  { name: 'أخضر', primary: '#065f46', secondary: '#10b981', bg: '#f0fdf4' },
  { name: 'أحمر', primary: '#991b1b', secondary: '#ef4444', bg: '#fef2f2' },
  { name: 'بنفسجي', primary: '#5b21b6', secondary: '#8b5cf6', bg: '#faf5ff' },
  { name: 'داكن', primary: '#1f2937', secondary: '#6b7280', bg: '#111827' }
];

export default function PowerPointEditor() {
  const [presentation, setPresentation] = useState({
    title: 'عرض تقديمي جديد',
    description: '',
    category: 'other',
    slides: [
      {
        title: 'شريحة العنوان',
        content: 'انقر للتعديل',
        layout: 'title',
        background_color: '#ffffff',
        elements: []
      }
    ],
    theme: themes[0],
    tags: []
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const currentSlide = presentation.slides[currentSlideIndex];

  const handleAddSlide = (layout = 'content') => {
    const newSlide = {
      title: 'شريحة جديدة',
      content: '',
      layout: layout,
      background_color: presentation.theme.bg,
      elements: []
    };

    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));

    setCurrentSlideIndex(presentation.slides.length);
  };

  const handleDeleteSlide = (index) => {
    if (presentation.slides.length === 1) {
      alert('لا يمكن حذف جميع الشرائح');
      return;
    }

    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));

    if (currentSlideIndex >= presentation.slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };

  const handleDuplicateSlide = (index) => {
    const slideToDuplicate = { ...presentation.slides[index] };
    setPresentation(prev => ({
      ...prev,
      slides: [
        ...prev.slides.slice(0, index + 1),
        slideToDuplicate,
        ...prev.slides.slice(index + 1)
      ]
    }));
  };

  const handleUpdateSlide = (index, updates) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => 
        i === index ? { ...slide, ...updates } : slide
      )
    }));
  };

  const handleUploadPowerPoint = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.(ppt|pptx)$/i.test(file.name)) {
      alert('الرجاء اختيار ملف PowerPoint فقط (.ppt أو .pptx)');
      return;
    }

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      setPresentation(prev => ({
        ...prev,
        original_file_url: result.file_url,
        original_file_name: file.name,
        title: file.name.replace(/\.[^/.]+$/, "")
      }));

      alert('✅ تم رفع الملف بنجاح! يمكنك الآن إنشاء نسخة تفاعلية منه');
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePresentation = async () => {
    if (!presentation.title) {
      alert('يرجى إدخال عنوان للعرض التقديمي');
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.Presentation.create(presentation);
      alert('✅ تم حفظ العرض التقديمي بنجاح!');
    } catch (error) {
      console.error('Save error:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportHTML = () => {
    const html = generatePresentationHTML(presentation);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${presentation.title}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePresentationHTML = (pres) => {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pres.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
        }
        .presentation {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        .slide {
            width: 100%;
            height: 100%;
            display: none;
            padding: 60px;
            background: ${pres.theme.bg};
            color: ${pres.theme.primary};
        }
        .slide.active {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .slide-title {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 30px;
            color: ${pres.theme.primary};
        }
        .slide-content {
            font-size: 24px;
            line-height: 1.6;
            max-width: 800px;
            text-align: center;
        }
        .controls {
            position: fixed;
            bottom: 20px;
            right: 50%;
            transform: translateX(50%);
            display: flex;
            gap: 10px;
            background: rgba(0,0,0,0.7);
            padding: 10px 20px;
            border-radius: 30px;
        }
        button {
            background: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: ${pres.theme.secondary};
            color: white;
        }
        .slide-number {
            color: white;
            padding: 10px 20px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="presentation">
        ${pres.slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                <h1 class="slide-title">${slide.title}</h1>
                <div class="slide-content">${slide.content}</div>
            </div>
        `).join('')}
    </div>
    
    <div class="controls">
        <button onclick="prevSlide()">←</button>
        <span class="slide-number">
            <span id="current">1</span> / <span id="total">${pres.slides.length}</span>
        </span>
        <button onclick="nextSlide()">→</button>
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;

        function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
            document.getElementById('current').textContent = currentSlide + 1;
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
        });
    </script>
</body>
</html>
    `;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              📊 محرر العروض التقديمية
            </h1>
            <p className="text-gray-600">إنشاء وتحرير عروض PowerPoint تفاعلية</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(true)} variant="outline">
              <Play className="w-4 h-4 ml-2" />
              عرض
            </Button>
            <Button onClick={handleExportHTML} variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير HTML
            </Button>
            <Button onClick={handleSavePresentation} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ
            </Button>
          </div>
        </div>

        {/* Upload PowerPoint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              رفع ملف PowerPoint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".ppt,.pptx"
                onChange={handleUploadPowerPoint}
                className="hidden"
                id="ppt-upload"
                disabled={isUploading}
              />
              <label htmlFor="ppt-upload" className="cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
                    <p className="text-sm text-gray-600">جاري الرفع...</p>
                  </>
                ) : (
                  <>
                    <PresentationIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      اضغط هنا أو اسحب ملف PowerPoint
                    </p>
                    <p className="text-xs text-gray-500">
                      يدعم .ppt و .pptx
                    </p>
                  </>
                )}
              </label>
            </div>

            {presentation.original_file_name && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ملف مرفوع: {presentation.original_file_name}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Main Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">الإعدادات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Presentation Info */}
              <div>
                <Label>عنوان العرض</Label>
                <Input
                  value={presentation.title}
                  onChange={(e) => setPresentation(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="عنوان العرض التقديمي"
                />
              </div>

              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={presentation.description}
                  onChange={(e) => setPresentation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر"
                  rows={3}
                />
              </div>

              <div>
                <Label>الفئة</Label>
                <Select
                  value={presentation.category}
                  onValueChange={(value) => setPresentation(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">تدريبي</SelectItem>
                    <SelectItem value="reports">تقارير</SelectItem>
                    <SelectItem value="meetings">اجتماعات</SelectItem>
                    <SelectItem value="educational">تعليمي</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selection */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4" />
                  المظهر
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => setPresentation(prev => ({ ...prev, theme }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        presentation.theme.name === theme.name
                          ? 'border-purple-500 ring-2 ring-purple-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ background: theme.bg }}
                    >
                      <div className="flex gap-1 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ background: theme.primary }}></div>
                        <div className="w-3 h-3 rounded-full" style={{ background: theme.secondary }}></div>
                      </div>
                      <p className="text-xs text-gray-600">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Slide */}
              <div>
                <Label className="mb-2">إضافة شريحة</Label>
                <div className="grid grid-cols-2 gap-2">
                  {layouts.map((layout) => {
                    const Icon = layout.icon;
                    return (
                      <Button
                        key={layout.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSlide(layout.value)}
                        className="flex-col h-auto py-3"
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-xs">{layout.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Slides Thumbnails */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {presentation.slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`relative group flex-shrink-0 cursor-pointer ${
                        index === currentSlideIndex ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <div
                        className="w-32 h-24 rounded-lg border-2 p-2 flex flex-col justify-center items-center"
                        style={{ 
                          background: slide.background_color || presentation.theme.bg,
                          borderColor: index === currentSlideIndex ? presentation.theme.primary : '#e5e7eb'
                        }}
                      >
                        <p className="text-xs font-bold text-center line-clamp-2">{slide.title}</p>
                      </div>
                      <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                        {index + 1}
                      </Badge>
                      
                      {/* Actions */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateSlide(index);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {presentation.slides.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 bg-white/90 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlide(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Slide Editor */}
            <SlideEditor
              slide={currentSlide}
              theme={presentation.theme}
              onUpdate={(updates) => handleUpdateSlide(currentSlideIndex, updates)}
            />

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                السابق
              </Button>

              <Badge variant="outline" className="text-base px-4 py-2">
                {currentSlideIndex + 1} / {presentation.slides.length}
              </Badge>

              <Button
                variant="outline"
                onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === presentation.slides.length - 1}
              >
                التالي
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Presentation Viewer */}
      {showPreview && (
        <PresentationViewer
          presentation={presentation}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
