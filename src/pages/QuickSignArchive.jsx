import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  FileSignature, 
  Stamp, 
  Download, 
  Loader2, 
  CheckCircle, 
  Save,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// الأختام الجاهزة
const BUILT_IN_STAMPS = [
  { id: 'approved', name: 'موافق', emoji: '✅', color: '#10b981' },
  { id: 'rejected', name: 'مرفوض', emoji: '❌', color: '#ef4444' },
  { id: 'confidential', name: 'سري', emoji: '🔒', color: '#6b7280' },
  { id: 'urgent', name: 'عاجل', emoji: '⚡', color: '#f59e0b' },
  { id: 'reviewed', name: 'تمت المراجعة', emoji: '👁️', color: '#3b82f6' },
  { id: 'paid', name: 'مدفوع', emoji: '💰', color: '#10b981' },
  { id: 'received', name: 'مستلم', emoji: '📥', color: '#8b5cf6' },
  { id: 'official', name: 'رسمي', emoji: '🏛️', color: '#1e40af' }
];

// مواضع افتراضية
const PRESET_POSITIONS = [
  { id: 'bottom-right', name: 'أسفل اليمين', x: 400, y: 750 },
  { id: 'bottom-left', name: 'أسفل اليسار', x: 100, y: 750 },
  { id: 'bottom-center', name: 'أسفل الوسط', x: 250, y: 750 },
  { id: 'top-right', name: 'أعلى اليمين', x: 400, y: 50 },
  { id: 'center', name: 'المنتصف', x: 250, y: 400 }
];

export default function QuickSignArchive() {
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdf, setResultPdf] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [position, setPosition] = useState({ x: 400, y: 750 });
  const [size, setSize] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [elementType, setElementType] = useState('stamp'); // 'stamp' or 'signature'

  // قراءة معاملات URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('file_url');
    const name = params.get('file_name');
    
    if (url) {
      setFileUrl(decodeURIComponent(url));
    }
    if (name) {
      setFileName(decodeURIComponent(name));
    }
  }, []);

  // توليد صورة الختم
  const generateStampImage = async (stamp) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم دائرة الختم
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, 2 * Math.PI);
    ctx.strokeStyle = stamp.color;
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // رسم الإيموجي
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp.emoji, 100, 70);
    
    // رسم النص
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = stamp.color;
    ctx.fillText(stamp.name, 100, 130);
    
    // إضافة التاريخ
    const today = new Date().toLocaleDateString('ar-SA');
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(today, 100, 160);
    
    return canvas.toDataURL('image/png');
  };

  // اختيار ختم
  const handleSelectStamp = async (stamp) => {
    setSelectedStamp(stamp);
    const stampImage = await generateStampImage(stamp);
    setSignatureImage(stampImage);
    setElementType('stamp');
  };

  // تطبيق موضع مسبق
  const applyPresetPosition = (preset) => {
    setPosition({ x: preset.x, y: preset.y });
  };

  // إضافة الختم/التوقيع على الملف
  const handleApplyStamp = async () => {
    if (!fileUrl) {
      alert('لا يوجد ملف محدد');
      return;
    }

    if (!signatureImage) {
      alert('الرجاء اختيار ختم أو توقيع');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await base44.functions.invoke('addSignatureToPDF', {
        fileUrl: fileUrl,
        signatureImageUrl: signatureImage,
        x: position.x,
        y: position.y,
        width: size,
        height: size,
        pageNumber: pageNumber
      });

      if (response.data?.success) {
        setResultPdf({
          base64: response.data.pdfBase64,
          filename: `stamped_${fileName || 'document'}`.replace('.pdf', ''),
          message: 'تم إضافة الختم بنجاح!'
        });
        alert('✅ تم إضافة الختم/التوقيع بنجاح!');
      } else {
        throw new Error(response.data?.error || 'فشل إضافة الختم');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`حدث خطأ: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // تحميل الملف النتيجة
  const handleDownload = () => {
    if (!resultPdf) return;
    
    try {
      const binaryString = atob(resultPdf.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resultPdf.filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('حدث خطأ أثناء التحميل');
    }
  };

  // حفظ في الأرشيف
  const handleSaveToArchive = async () => {
    if (!resultPdf) return;

    try {
      // تحويل base64 إلى ملف
      const binaryString = atob(resultPdf.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], `${resultPdf.filename}.pdf`, { type: 'application/pdf' });

      // رفع الملف
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // حفظ في الأرشيف
      await base44.entities.ArchivedFile.create({
        title: `${resultPdf.filename} (مختوم)`,
        description: `ملف مختوم من: ${fileName}`,
        category: 'other',
        file_url: uploadResult.file_url,
        file_name: `${resultPdf.filename}.pdf`,
        tags: ['مختوم', 'موقع']
      });

      alert('✅ تم حفظ الملف المختوم في الأرشيف بنجاح!');
    } catch (error) {
      console.error('Save error:', error);
      alert(`حدث خطأ أثناء الحفظ: ${error.message}`);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Stamp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تختيم وتوقيع سريع</h1>
              <p className="text-sm text-gray-600">أضف ختم أو توقيع على الملف المؤرشف</p>
            </div>
          </div>
          <Link to={createPageUrl('Archive')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة للأرشيف
            </Button>
          </Link>
        </div>

        {/* File Info */}
        {fileName && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <FileSignature className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>الملف المحدد:</strong> {fileName}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stamps Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-purple-600" />
                اختر الختم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {BUILT_IN_STAMPS.map(stamp => (
                  <Button
                    key={stamp.id}
                    variant={selectedStamp?.id === stamp.id ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col items-center justify-center text-center"
                    onClick={() => handleSelectStamp(stamp)}
                    style={{ 
                      borderColor: selectedStamp?.id === stamp.id ? stamp.color : '',
                      backgroundColor: selectedStamp?.id === stamp.id ? stamp.color : ''
                    }}
                  >
                    <span className="text-2xl">{stamp.emoji}</span>
                    <span className="text-xs mt-1">{stamp.name}</span>
                  </Button>
                ))}
              </div>

              {signatureImage && (
                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50 text-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800 mb-2">الختم المحدد</p>
                  <img 
                    src={signatureImage} 
                    alt="Stamp preview" 
                    className="max-h-24 mx-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Position Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الموضع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>موضع سريع</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_POSITIONS.map(preset => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPresetPosition(preset)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموضع الأفقي (X): {position.x}</Label>
                  <Slider
                    value={[position.x]}
                    onValueChange={(v) => setPosition({ ...position, x: v[0] })}
                    min={50}
                    max={500}
                    step={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الموضع العمودي (Y): {position.y}</Label>
                  <Slider
                    value={[position.y]}
                    onValueChange={(v) => setPosition({ ...position, y: v[0] })}
                    min={50}
                    max={800}
                    step={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>حجم الختم: {size}px</Label>
                <Slider
                  value={[size]}
                  onValueChange={(v) => setSize(v[0])}
                  min={50}
                  max={200}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label>رقم الصفحة</Label>
                <Input
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                />
              </div>

              <Button
                onClick={handleApplyStamp}
                disabled={!signatureImage || !fileUrl || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التختيم...
                  </>
                ) : (
                  <>
                    <Stamp className="w-4 h-4 ml-2" />
                    تطبيق الختم
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        {resultPdf && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                تم التختيم بنجاح!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الملف
                </Button>
                <Button onClick={handleSaveToArchive} variant="outline" className="flex-1">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ في الأرشيف
                </Button>
              </div>

              {/* Preview */}
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={`data:application/pdf;base64,${resultPdf.base64}`}
                  className="w-full h-[500px]"
                  title="معاينة الملف المختوم"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual URL Input */}
        {!fileUrl && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>أو أدخل رابط الملف يدوياً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>رابط ملف PDF</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}