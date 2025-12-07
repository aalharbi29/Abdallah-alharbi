import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Save,
  RefreshCw,
  Maximize2,
  Minimize2,
  Scissors
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PDFCropTool({ file, onComplete }) {
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const canvasRef = useRef(null);

  useEffect(() => {
    if (file?.url) {
      setPreviewUrl(file.url);
      // هنا يمكن إضافة دالة للحصول على عدد الصفحات من الـ PDF
    }
  }, [file]);

  const handleScaleChange = (value) => {
    setScale(value[0]);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetCrop = () => {
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setScale(100);
    setRotation(0);
  };

  const handleApplyCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const response = await base44.functions.invoke('cropPDF', {
        fileUrl: file.url,
        pageNumber,
        cropArea,
        scale: scale / 100,
        rotation
      });

      if (response.data?.success) {
        onComplete({
          base64: response.data.pdfBase64,
          filename: `cropped_${file.name.replace('.pdf', '')}`,
          totalPages: 1,
          message: 'تم قص وتعديل الصفحة بنجاح'
        });
        alert('✅ تم تطبيق التعديلات بنجاح');
      }
    } catch (error) {
      console.error('Crop error:', error);
      alert('حدث خطأ أثناء تطبيق التعديلات');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Crop className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">يرجى رفع ملف PDF أولاً</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* أدوات التحكم */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-blue-600" />
            أدوات القص والتعديل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات الملف */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">{file.name}</p>
            <p className="text-xs text-blue-700">الحجم: {(file.size / 1024).toFixed(2)} KB</p>
          </div>

          {/* التكبير والتصغير */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              التكبير/التصغير: {scale}%
            </Label>
            <Slider
              value={[scale]}
              onValueChange={handleScaleChange}
              min={25}
              max={400}
              step={5}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setScale(50)}
                className="flex-1"
              >
                <Minimize2 className="w-3 h-3 ml-1" />
                50%
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setScale(100)}
                className="flex-1"
              >
                100%
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setScale(200)}
                className="flex-1"
              >
                <Maximize2 className="w-3 h-3 ml-1" />
                200%
              </Button>
            </div>
          </div>

          {/* الدوران */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              الدوران: {rotation}°
            </Label>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRotate}
                className="flex-1"
              >
                <RotateCw className="w-3 h-3 ml-1" />
                تدوير 90°
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setRotation(0)}
                className="flex-1"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>

          {/* منطقة القص */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Crop className="w-4 h-4" />
              منطقة القص (بالنسبة المئوية)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={cropArea.x}
                  onChange={(e) => setCropArea(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={cropArea.y}
                  onChange={(e) => setCropArea(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label className="text-xs">العرض</Label>
                <Input
                  type="number"
                  value={cropArea.width}
                  onChange={(e) => setCropArea(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <Label className="text-xs">الارتفاع</Label>
                <Input
                  type="number"
                  value={cropArea.height}
                  onChange={(e) => setCropArea(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="space-y-2 pt-4 border-t">
            <Button 
              onClick={handleResetCrop} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
            <Button 
              onClick={handleApplyCrop} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>جاري المعالجة...</>
              ) : (
                <>
                  <Scissors className="w-4 h-4 ml-2" />
                  تطبيق التعديلات
                </>
              )}
            </Button>
          </div>

          {/* إرشادات */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 <strong>نصيحة:</strong> اضبط منطقة القص والتكبير، ثم اضغط "تطبيق التعديلات" للحصول على PDF جديد
            </p>
          </div>
        </CardContent>
      </Card>

      {/* معاينة الملف */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>معاينة الملف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <div 
              className="flex items-center justify-center p-8"
              style={{
                transform: `scale(${scale / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
              }}
            >
              <iframe
                src={previewUrl}
                className="w-full h-96 border-0 bg-white shadow-lg"
                title="PDF Preview"
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <Badge variant="secondary">
              التكبير: {scale}% | الدوران: {rotation}°
            </Badge>
            <Badge variant="outline">
              منطقة القص: {cropArea.width}x{cropArea.height}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}