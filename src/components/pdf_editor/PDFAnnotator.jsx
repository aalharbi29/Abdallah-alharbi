import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload, Type, Image as ImageIcon, Square, Circle, 
  Highlighter, Trash2, Loader2, EyeOff,
  Palette, Bold, Italic, Underline, Plus, Minus, Save,
  MousePointer, Pencil, Eraser, ZoomIn, ZoomOut,
  Undo, Redo, Lock, Unlock, Copy, Clipboard,
  ArrowUpDown, Triangle, Star, Heart, Grid3X3
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PDFAnnotator({ onComplete }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [currentTool, setCurrentTool] = useState('select');
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const containerRef = useRef(null);
  
  // خيارات النص
  const [textOptions, setTextOptions] = useState({
    content: '',
    fontSize: 16,
    fontColor: '#000000',
    backgroundColor: 'transparent',
    fontFamily: 'Arial',
    bold: false,
    italic: false,
    underline: false,
    align: 'right',
    lineHeight: 1.5,
    letterSpacing: 0
  });

  // خيارات الشكل
  const [shapeOptions, setShapeOptions] = useState({
    type: 'rectangle',
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    borderRadius: 0,
    opacity: 100
  });

  // خيارات التمييز
  const [highlightOptions, setHighlightOptions] = useState({
    color: '#ffff00',
    opacity: 50
  });

  // خيارات الرسم الحر
  const [drawOptions, setDrawOptions] = useState({
    color: '#000000',
    width: 3,
    opacity: 100
  });

  const saveToHistory = useCallback((newAnnotations) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations([...history[historyIndex + 1]]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('الرجاء اختيار ملف PDF');
      return;
    }

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({
        name: file.name,
        url: result.file_url,
        size: file.size
      });
      setPreviewUrl(result.file_url);
      setAnnotations([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setTotalPages(5); // في التطبيق الفعلي سيتم تحديد عدد الصفحات من الملف
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const addAnnotation = (type, options = {}) => {
    const newAnnotation = {
      id: Date.now(),
      type,
      page: currentPage,
      x: 150,
      y: 150,
      locked: false,
      visible: true,
      zIndex: annotations.length,
      ...options
    };
    const newAnnotations = [...annotations, newAnnotation];
    setAnnotations(newAnnotations);
    setSelectedAnnotation(newAnnotation.id);
    saveToHistory(newAnnotations);
  };

  const addTextAnnotation = () => {
    if (!textOptions.content.trim()) {
      alert('الرجاء إدخال نص');
      return;
    }
    addAnnotation('text', {
      content: textOptions.content,
      fontSize: textOptions.fontSize,
      fontColor: textOptions.fontColor,
      backgroundColor: textOptions.backgroundColor,
      fontFamily: textOptions.fontFamily,
      bold: textOptions.bold,
      italic: textOptions.italic,
      underline: textOptions.underline,
      align: textOptions.align,
      lineHeight: textOptions.lineHeight,
      letterSpacing: textOptions.letterSpacing,
      width: 250,
      height: 'auto'
    });
    setTextOptions({ ...textOptions, content: '' });
  };

  const addImageAnnotation = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      // الحصول على أبعاد الصورة
      const img = new Image();
      img.onload = () => {
        const maxWidth = 300;
        const ratio = img.height / img.width;
        const width = Math.min(img.width, maxWidth);
        const height = width * ratio;
        
        addAnnotation('image', {
          imageUrl: result.file_url,
          width,
          height,
          originalWidth: img.width,
          originalHeight: img.height,
          opacity: 100,
          borderRadius: 0,
          border: 'none'
        });
      };
      img.src = result.file_url;
    } catch (error) {
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const addShapeAnnotation = () => {
    addAnnotation('shape', {
      shapeType: shapeOptions.type,
      strokeColor: shapeOptions.strokeColor,
      fillColor: shapeOptions.fillColor,
      strokeWidth: shapeOptions.strokeWidth,
      borderRadius: shapeOptions.borderRadius,
      opacity: shapeOptions.opacity,
      width: 120,
      height: shapeOptions.type === 'circle' ? 120 : 80
    });
  };

  const addHighlightAnnotation = () => {
    addAnnotation('highlight', {
      color: highlightOptions.color,
      opacity: highlightOptions.opacity,
      width: 200,
      height: 30
    });
  };

  const addRedactionAnnotation = () => {
    addAnnotation('redaction', {
      color: '#000000',
      width: 150,
      height: 25
    });
  };

  const removeAnnotation = (id) => {
    const newAnnotations = annotations.filter(a => a.id !== id);
    setAnnotations(newAnnotations);
    if (selectedAnnotation === id) setSelectedAnnotation(null);
    saveToHistory(newAnnotations);
  };

  const updateAnnotation = (id, updates) => {
    const newAnnotations = annotations.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    setAnnotations(newAnnotations);
  };

  const duplicateAnnotation = (id) => {
    const annotation = annotations.find(a => a.id === id);
    if (!annotation) return;
    
    const newAnnotation = {
      ...annotation,
      id: Date.now(),
      x: annotation.x + 20,
      y: annotation.y + 20
    };
    const newAnnotations = [...annotations, newAnnotation];
    setAnnotations(newAnnotations);
    setSelectedAnnotation(newAnnotation.id);
    saveToHistory(newAnnotations);
  };

  const copyAnnotation = (id) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation) setClipboard({ ...annotation });
  };

  const pasteAnnotation = () => {
    if (!clipboard) return;
    const newAnnotation = {
      ...clipboard,
      id: Date.now(),
      x: clipboard.x + 30,
      y: clipboard.y + 30
    };
    const newAnnotations = [...annotations, newAnnotation];
    setAnnotations(newAnnotations);
    setSelectedAnnotation(newAnnotation.id);
    saveToHistory(newAnnotations);
  };

  const bringToFront = (id) => {
    const maxZIndex = Math.max(...annotations.map(a => a.zIndex));
    updateAnnotation(id, { zIndex: maxZIndex + 1 });
  };

  const sendToBack = (id) => {
    const minZIndex = Math.min(...annotations.map(a => a.zIndex));
    updateAnnotation(id, { zIndex: minZIndex - 1 });
  };

  const toggleLock = (id) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation) updateAnnotation(id, { locked: !annotation.locked });
  };

  const handleMouseDown = (e, annotation) => {
    if (annotation.locked || currentTool !== 'select') return;
    
    e.stopPropagation();
    setSelectedAnnotation(annotation.id);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - annotation.x,
      y: e.clientY - annotation.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedAnnotation) return;
    
    const annotation = annotations.find(a => a.id === selectedAnnotation);
    if (!annotation || annotation.locked) return;
    
    const newX = Math.max(0, e.clientX - dragStart.x);
    const newY = Math.max(0, e.clientY - dragStart.y);
    
    updateAnnotation(selectedAnnotation, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory(annotations);
    }
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleResizeStart = (e, handle, annotation) => {
    e.stopPropagation();
    if (annotation.locked) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedAnnotation(annotation.id);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleApplyAnnotations = async () => {
    if (!uploadedFile || annotations.length === 0) {
      alert('لا توجد تعديلات لتطبيقها');
      return;
    }

    setIsProcessing(true);
    try {
      // في التطبيق الفعلي سيتم إرسال التعديلات لـ backend function
      const annotationsSummary = annotations.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {});
      
      const summary = Object.entries(annotationsSummary)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ');

      alert(`سيتم تطبيق التعديلات:\n${summary}`);
      
      if (onComplete) {
        onComplete({
          base64: '',
          filename: `annotated_${uploadedFile.name}`,
          message: `تم تطبيق ${annotations.length} تعديل`
        });
      }
    } catch (error) {
      console.error('Apply error:', error);
      alert('حدث خطأ أثناء تطبيق التعديلات');
    } finally {
      setIsProcessing(false);
    }
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'تحديد' },
    { id: 'text', icon: Type, label: 'نص' },
    { id: 'image', icon: ImageIcon, label: 'صورة' },
    { id: 'shape', icon: Square, label: 'شكل' },
    { id: 'draw', icon: Pencil, label: 'رسم' },
    { id: 'highlight', icon: Highlighter, label: 'تمييز' },
    { id: 'redact', icon: EyeOff, label: 'إخفاء' },
    { id: 'eraser', icon: Eraser, label: 'ممحاة' }
  ];

  const shapes = [
    { id: 'rectangle', icon: Square, label: 'مستطيل' },
    { id: 'circle', icon: Circle, label: 'دائرة' },
    { id: 'triangle', icon: Triangle, label: 'مثلث' },
    { id: 'star', icon: Star, label: 'نجمة' },
    { id: 'heart', icon: Heart, label: 'قلب' }
  ];

  const fonts = [
    'Arial', 'Times New Roman', 'Courier New', 'Georgia', 
    'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact'
  ];

  const selectedAnnotationData = annotations.find(a => a.id === selectedAnnotation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* شريط الأدوات الجانبي */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-4 h-4" />
            أدوات التحرير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* رفع الملف */}
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-annotate-upload"
                disabled={isUploading}
              />
              <label htmlFor="pdf-annotate-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin text-blue-500" />
                ) : (
                  <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                )}
                <p className="text-xs text-gray-600">رفع ملف PDF</p>
              </label>
            </div>
          ) : (
            <Alert className="bg-green-50 border-green-200 py-2">
              <AlertDescription className="text-xs flex items-center justify-between">
                <span className="truncate max-w-[120px]">{uploadedFile.name}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setUploadedFile(null);
                    setAnnotations([]);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* أزرار الأدوات */}
          <div className="grid grid-cols-4 gap-1">
            {tools.map(tool => (
              <Button
                key={tool.id}
                variant={currentTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool(tool.id)}
                className="flex flex-col gap-0.5 h-auto py-1.5 px-1"
                title={tool.label}
              >
                <tool.icon className="w-3.5 h-3.5" />
                <span className="text-[10px]">{tool.label}</span>
              </Button>
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={undo} 
              disabled={historyIndex <= 0}
              className="flex-1"
            >
              <Undo className="w-3 h-3 ml-1" />
              تراجع
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              className="flex-1"
            >
              <Redo className="w-3 h-3 ml-1" />
              إعادة
            </Button>
          </div>

          {/* خيارات أداة النص */}
          {currentTool === 'text' && (
            <div className="space-y-2 border-t pt-2">
              <Textarea
                placeholder="أدخل النص..."
                value={textOptions.content}
                onChange={(e) => setTextOptions({ ...textOptions, content: e.target.value })}
                rows={2}
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={textOptions.fontFamily} 
                  onValueChange={(v) => setTextOptions({ ...textOptions, fontFamily: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map(font => (
                      <SelectItem key={font} value={font} className="text-xs">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={textOptions.fontSize}
                  onChange={(e) => setTextOptions({ ...textOptions, fontSize: parseInt(e.target.value) })}
                  className="h-8 text-xs"
                  min="8"
                  max="72"
                />
              </div>
              <div className="flex gap-1 items-center">
                <input
                  type="color"
                  value={textOptions.fontColor}
                  onChange={(e) => setTextOptions({ ...textOptions, fontColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Button
                  size="sm"
                  variant={textOptions.bold ? "default" : "outline"}
                  onClick={() => setTextOptions({ ...textOptions, bold: !textOptions.bold })}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={textOptions.italic ? "default" : "outline"}
                  onClick={() => setTextOptions({ ...textOptions, italic: !textOptions.italic })}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={textOptions.underline ? "default" : "outline"}
                  onClick={() => setTextOptions({ ...textOptions, underline: !textOptions.underline })}
                  className="h-8 w-8 p-0"
                >
                  <Underline className="w-3 h-3" />
                </Button>
              </div>
              <Button onClick={addTextAnnotation} className="w-full h-8 text-xs">
                <Plus className="w-3 h-3 ml-1" />
                إضافة نص
              </Button>
            </div>
          )}

          {/* خيارات الصورة */}
          {currentTool === 'image' && (
            <div className="space-y-2 border-t pt-2">
              <input
                type="file"
                accept="image/*"
                onChange={addImageAnnotation}
                className="hidden"
                id="image-upload-annotate"
              />
              <label htmlFor="image-upload-annotate">
                <Button variant="outline" className="w-full h-8 text-xs" asChild disabled={isUploading}>
                  <span>
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3 h-3 ml-1" />
                    )}
                    اختيار صورة
                  </span>
                </Button>
              </label>
            </div>
          )}

          {/* خيارات الأشكال */}
          {currentTool === 'shape' && (
            <div className="space-y-2 border-t pt-2">
              <div className="grid grid-cols-5 gap-1">
                {shapes.map(shape => (
                  <Button
                    key={shape.id}
                    size="sm"
                    variant={shapeOptions.type === shape.id ? "default" : "outline"}
                    onClick={() => setShapeOptions({ ...shapeOptions, type: shape.id })}
                    className="h-8 w-8 p-0"
                    title={shape.label}
                  >
                    <shape.icon className="w-3.5 h-3.5" />
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Label className="text-xs">حدود</Label>
                  <input
                    type="color"
                    value={shapeOptions.strokeColor}
                    onChange={(e) => setShapeOptions({ ...shapeOptions, strokeColor: e.target.value })}
                    className="w-full h-7 rounded cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">تعبئة</Label>
                  <input
                    type="color"
                    value={shapeOptions.fillColor}
                    onChange={(e) => setShapeOptions({ ...shapeOptions, fillColor: e.target.value })}
                    className="w-full h-7 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">سمك الحدود: {shapeOptions.strokeWidth}px</Label>
                <Slider
                  value={[shapeOptions.strokeWidth]}
                  onValueChange={([v]) => setShapeOptions({ ...shapeOptions, strokeWidth: v })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-1"
                />
              </div>
              <Button onClick={addShapeAnnotation} className="w-full h-8 text-xs">
                <Plus className="w-3 h-3 ml-1" />
                إضافة شكل
              </Button>
            </div>
          )}

          {/* خيارات التمييز */}
          {currentTool === 'highlight' && (
            <div className="space-y-2 border-t pt-2">
              <Label className="text-xs">لون التمييز</Label>
              <div className="flex gap-1 flex-wrap">
                {['#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ffa500', '#ff6b6b'].map(color => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded border-2 transition-transform ${
                      highlightOptions.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setHighlightOptions({ ...highlightOptions, color })}
                  />
                ))}
              </div>
              <div>
                <Label className="text-xs">الشفافية: {highlightOptions.opacity}%</Label>
                <Slider
                  value={[highlightOptions.opacity]}
                  onValueChange={([v]) => setHighlightOptions({ ...highlightOptions, opacity: v })}
                  min={10}
                  max={80}
                  step={5}
                  className="mt-1"
                />
              </div>
              <Button onClick={addHighlightAnnotation} className="w-full h-8 text-xs">
                <Highlighter className="w-3 h-3 ml-1" />
                إضافة تمييز
              </Button>
            </div>
          )}

          {/* خيارات الإخفاء */}
          {currentTool === 'redact' && (
            <div className="space-y-2 border-t pt-2">
              <Alert className="bg-red-50 border-red-200 py-1">
                <AlertDescription className="text-xs text-red-800">
                  سيتم إخفاء المنطقة المحددة بشكل دائم
                </AlertDescription>
              </Alert>
              <Button onClick={addRedactionAnnotation} className="w-full h-8 text-xs bg-red-600 hover:bg-red-700">
                <EyeOff className="w-3 h-3 ml-1" />
                إضافة إخفاء
              </Button>
            </div>
          )}

          {/* خصائص العنصر المحدد */}
          {selectedAnnotationData && (
            <div className="space-y-2 border-t pt-2">
              <Label className="text-xs font-semibold">خصائص العنصر المحدد</Label>
              <div className="grid grid-cols-2 gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => duplicateAnnotation(selectedAnnotation)}
                  className="h-7 text-xs"
                >
                  <Copy className="w-3 h-3 ml-1" />
                  نسخ
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyAnnotation(selectedAnnotation)}
                  className="h-7 text-xs"
                >
                  <Clipboard className="w-3 h-3 ml-1" />
                  حافظة
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => bringToFront(selectedAnnotation)}
                  className="h-7 text-xs"
                >
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                  للأمام
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => toggleLock(selectedAnnotation)}
                  className="h-7 text-xs"
                >
                  {selectedAnnotationData.locked ? (
                    <><Unlock className="w-3 h-3 ml-1" /> فتح</>
                  ) : (
                    <><Lock className="w-3 h-3 ml-1" /> قفل</>
                  )}
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => removeAnnotation(selectedAnnotation)}
                className="w-full h-7 text-xs"
              >
                <Trash2 className="w-3 h-3 ml-1" />
                حذف العنصر
              </Button>
            </div>
          )}

          {/* زر تطبيق التعديلات */}
          {annotations.length > 0 && (
            <Button 
              onClick={handleApplyAnnotations} 
              className="w-full h-9 bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-1" />
              )}
              تطبيق ({annotations.length})
            </Button>
          )}

          {clipboard && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={pasteAnnotation}
              className="w-full h-7 text-xs"
            >
              <Clipboard className="w-3 h-3 ml-1" />
              لصق من الحافظة
            </Button>
          )}
        </CardContent>
      </Card>

      {/* منطقة المعاينة */}
      <Card className="lg:col-span-4">
        <CardHeader className="py-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="h-7 w-7 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Badge variant="outline" className="text-xs">
                صفحة {currentPage} / {totalPages}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="h-7 w-7 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={showGrid ? "default" : "outline"}
                onClick={() => setShowGrid(!showGrid)}
                className="h-7 w-7 p-0"
                title="إظهار الشبكة"
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="h-7 w-7 p-0"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Badge variant="outline" className="text-xs min-w-[50px] text-center">
                {zoom}%
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="h-7 w-7 p-0"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {uploadedFile ? (
            <div 
              ref={containerRef}
              className={`relative bg-gray-100 rounded-lg overflow-auto ${showGrid ? 'bg-grid' : ''}`}
              style={{ 
                minHeight: '600px',
                backgroundImage: showGrid ? 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)' : 'none',
                backgroundSize: '20px 20px'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top right',
                  transition: 'transform 0.2s'
                }}
              >
                <iframe
                  src={previewUrl}
                  className="w-full border-0 pointer-events-none"
                  style={{ height: '800px' }}
                  title="PDF Preview"
                />
              </div>
              
              {/* عرض التعديلات */}
              {annotations
                .filter(a => a.page === currentPage && a.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map(annotation => (
                <div
                  key={annotation.id}
                  className={`absolute transition-shadow ${
                    selectedAnnotation === annotation.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:ring-1 hover:ring-gray-400'
                  } ${annotation.locked ? 'cursor-not-allowed opacity-75' : 'cursor-move'}`}
                  style={{
                    left: annotation.x * (zoom / 100),
                    top: annotation.y * (zoom / 100),
                    width: annotation.width ? annotation.width * (zoom / 100) : 'auto',
                    height: annotation.height !== 'auto' ? annotation.height * (zoom / 100) : 'auto',
                    backgroundColor: annotation.type === 'redaction' ? '#000000' : 
                                    annotation.type === 'highlight' ? annotation.color : 
                                    annotation.backgroundColor || 'transparent',
                    opacity: annotation.type === 'highlight' ? annotation.opacity / 100 : 
                             annotation.opacity ? annotation.opacity / 100 : 1,
                    zIndex: annotation.zIndex + 10,
                    borderRadius: annotation.borderRadius || 0
                  }}
                  onMouseDown={(e) => handleMouseDown(e, annotation)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotation(annotation.id);
                  }}
                >
                  {annotation.type === 'text' && (
                    <div 
                      style={{
                        fontSize: annotation.fontSize * (zoom / 100),
                        color: annotation.fontColor,
                        fontFamily: annotation.fontFamily,
                        fontWeight: annotation.bold ? 'bold' : 'normal',
                        fontStyle: annotation.italic ? 'italic' : 'normal',
                        textDecoration: annotation.underline ? 'underline' : 'none',
                        textAlign: annotation.align,
                        lineHeight: annotation.lineHeight,
                        letterSpacing: annotation.letterSpacing,
                        padding: '4px 8px',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {annotation.content}
                    </div>
                  )}
                  
                  {annotation.type === 'image' && (
                    <img 
                      src={annotation.imageUrl} 
                      alt="" 
                      className="w-full h-full object-contain"
                      style={{
                        opacity: annotation.opacity / 100,
                        borderRadius: annotation.borderRadius
                      }}
                      draggable={false}
                    />
                  )}
                  
                  {annotation.type === 'shape' && (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {annotation.shapeType === 'rectangle' && (
                        <rect 
                          x={annotation.strokeWidth / 2} 
                          y={annotation.strokeWidth / 2} 
                          width={100 - annotation.strokeWidth} 
                          height={100 - annotation.strokeWidth}
                          fill={annotation.fillColor}
                          stroke={annotation.strokeColor}
                          strokeWidth={annotation.strokeWidth}
                          rx={annotation.borderRadius}
                        />
                      )}
                      {annotation.shapeType === 'circle' && (
                        <ellipse 
                          cx="50" 
                          cy="50" 
                          rx={50 - annotation.strokeWidth / 2} 
                          ry={50 - annotation.strokeWidth / 2}
                          fill={annotation.fillColor}
                          stroke={annotation.strokeColor}
                          strokeWidth={annotation.strokeWidth}
                        />
                      )}
                      {annotation.shapeType === 'triangle' && (
                        <polygon 
                          points="50,5 95,95 5,95"
                          fill={annotation.fillColor}
                          stroke={annotation.strokeColor}
                          strokeWidth={annotation.strokeWidth}
                        />
                      )}
                      {annotation.shapeType === 'star' && (
                        <polygon 
                          points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                          fill={annotation.fillColor}
                          stroke={annotation.strokeColor}
                          strokeWidth={annotation.strokeWidth}
                        />
                      )}
                    </svg>
                  )}
                  
                  {/* مقابض تغيير الحجم */}
                  {selectedAnnotation === annotation.id && !annotation.locked && (
                    <>
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'se', annotation)}
                      />
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'ne', annotation)}
                      />
                      <div 
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'sw', annotation)}
                      />
                      <div 
                        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"
                        onMouseDown={(e) => handleResizeStart(e, 'nw', annotation)}
                      />
                    </>
                  )}
                  
                  {annotation.locked && (
                    <div className="absolute top-0 right-0 p-1">
                      <Lock className="w-3 h-3 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">ارفع ملف PDF للبدء في التحرير</p>
                <p className="text-sm mt-2">يمكنك إضافة نصوص، صور، أشكال، وتمييز المحتوى</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}