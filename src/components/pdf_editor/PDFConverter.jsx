import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileText, Loader2, Download, 
  FileSpreadsheet, Presentation, Image as ImageIcon,
  CheckCircle, AlertCircle, ArrowRight, FileImage
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PDFConverter({ onComplete }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [result, setResult] = useState(null);

  const formats = [
    {
      id: 'jpg',
      name: 'JPG',
      extension: '.jpg',
      icon: ImageIcon,
      color: 'bg-blue-500',
      description: 'صور JPG - جودة عالية وحجم متوسط'
    },
    {
      id: 'png',
      name: 'PNG',
      extension: '.png',
      icon: ImageIcon,
      color: 'bg-green-500',
      description: 'صور PNG - أعلى جودة مع شفافية'
    },
    {
      id: 'webp',
      name: 'WebP',
      extension: '.webp',
      icon: ImageIcon,
      color: 'bg-purple-500',
      description: 'صور WebP - حجم صغير وجودة ممتازة'
    },
    {
      id: 'word',
      name: 'Word',
      extension: '.docx',
      icon: FileText,
      color: 'bg-blue-600',
      description: 'مستند Word قابل للتحرير'
    },
    {
      id: 'excel',
      name: 'Excel',
      extension: '.xlsx',
      icon: FileSpreadsheet,
      color: 'bg-green-600',
      description: 'جدول Excel للبيانات'
    },
    {
      id: 'powerpoint',
      name: 'PowerPoint',
      extension: '.pptx',
      icon: Presentation,
      color: 'bg-orange-500',
      description: 'عرض تقديمي PowerPoint'
    }
  ];

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
      setResult(null);
      setSelectedFormat(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConvert = async (format) => {
    if (!uploadedFile) {
      alert('الرجاء رفع ملف PDF أولاً');
      return;
    }

    setSelectedFormat(format.id);
    setIsConverting(true);
    setConversionProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => Math.min(prev + 10, 90));
      }, 400);

      if (['jpg', 'png', 'webp'].includes(format.id)) {
        // تحويل PDF إلى صور
        const response = await base44.functions.invoke('pdfToImages', {
          fileUrl: uploadedFile.url,
          format: format.id,
          quality: 95
        });

        clearInterval(progressInterval);
        setConversionProgress(100);

        if (response.data?.success) {
          setResult({
            format: format,
            images: response.data.images,
            filename: uploadedFile.name.replace('.pdf', ''),
            message: `تم تحويل ${response.data.images.length} صفحة إلى ${format.name}`
          });

          alert(`✅ تم تحويل ${response.data.images.length} صفحة إلى صور ${format.name}`);
        } else {
          throw new Error(response.data?.error || 'فشل التحويل');
        }
      } else {
        // تحويلات أخرى (Word, Excel, PowerPoint) - قريباً
        clearInterval(progressInterval);
        setConversionProgress(100);
        
        alert('⚠️ التحويل إلى ' + format.name + ' سيكون متاحاً قريباً');
        
        setResult({
          format: format,
          filename: uploadedFile.name.replace('.pdf', format.extension),
          message: `التحويل إلى ${format.name} قيد التطوير`
        });
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('❌ حدث خطأ أثناء تحويل الملف');
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* رفع الملف */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            تحويل PDF إلى صيغ أخرى
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-convert-upload"
              disabled={isUploading || isConverting}
            />
            <label htmlFor="pdf-convert-upload" className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-red-500" />
              ) : (
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              )}
              <p className="text-lg font-medium text-gray-700">
                {uploadedFile ? uploadedFile.name : 'اضغط لرفع ملف PDF'}
              </p>
              {uploadedFile && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(uploadedFile.size)}
                </p>
              )}
            </label>
          </div>

          {uploadedFile && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                تم رفع الملف بنجاح! اختر الصيغة المطلوبة للتحويل
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* خيارات التحويل */}
      {uploadedFile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formats.map(format => (
            <Card 
              key={format.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedFormat === format.id ? 'ring-2 ring-blue-500' : ''
              } ${isConverting && selectedFormat !== format.id ? 'opacity-50' : ''}`}
              onClick={() => !isConverting && handleConvert(format)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${format.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <format.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{format.name}</h3>
                <Badge variant="outline" className="mb-2">{format.extension}</Badge>
                <p className="text-sm text-gray-600">{format.description}</p>

                {isConverting && selectedFormat === format.id && (
                  <div className="mt-4 space-y-2">
                    <Progress value={conversionProgress} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {conversionProgress < 100 ? 'جاري التحويل...' : 'تم التحويل!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* نتيجة التحويل */}
      {result && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              {result.message}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.images && result.images.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.images.map((image, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center p-2">
                        <iframe
                          src={image.imageDataUrl}
                          className="w-full h-full border-0"
                          title={`صفحة ${image.pageNumber}`}
                        />
                      </div>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium truncate">
                            صفحة {image.pageNumber}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {result.format.name}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = image.imageDataUrl;
                            link.download = image.filename;
                            link.click();
                          }}
                        >
                          <Download className="w-3 h-3 ml-1" />
                          تحميل
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    result.images.forEach(image => {
                      setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = image.imageDataUrl;
                        link.download = image.filename;
                        link.click();
                      }, 100);
                    });
                  }}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل جميع الصور ({result.images.length})
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${result.format.color} rounded-lg flex items-center justify-center`}>
                    <result.format.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700">{result.filename}</p>
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الملف
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            معلومات هامة
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-gray-400" />
              <span>تحويل PDF إلى Word يحافظ على تنسيق النص والصور قدر الإمكان</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-gray-400" />
              <span>تحويل PDF إلى Excel مناسب للملفات التي تحتوي على جداول بيانات</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-gray-400" />
              <span>جودة التحويل تعتمد على جودة ملف PDF الأصلي</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-gray-400" />
              <span>الملفات الممسوحة ضوئياً قد تحتاج إلى OCR للتحويل الأمثل</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}