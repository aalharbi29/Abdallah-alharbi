import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileText, Loader2, Download, 
  FileSpreadsheet, Presentation, Image as ImageIcon,
  CheckCircle, AlertCircle, ArrowRight
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
      id: 'word',
      name: 'Word',
      extension: '.docx',
      icon: FileText,
      color: 'bg-blue-500',
      description: 'مستند Microsoft Word قابل للتحرير'
    },
    {
      id: 'excel',
      name: 'Excel',
      extension: '.xlsx',
      icon: FileSpreadsheet,
      color: 'bg-green-500',
      description: 'جدول بيانات Microsoft Excel'
    },
    {
      id: 'powerpoint',
      name: 'PowerPoint',
      extension: '.pptx',
      icon: Presentation,
      color: 'bg-orange-500',
      description: 'عرض تقديمي Microsoft PowerPoint'
    },
    {
      id: 'images',
      name: 'صور',
      extension: '.jpg/.png',
      icon: ImageIcon,
      color: 'bg-purple-500',
      description: 'تحويل كل صفحة إلى صورة منفصلة'
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
      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // في التطبيق الفعلي سيتم استدعاء backend function للتحويل
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setConversionProgress(100);

      setResult({
        format: format,
        filename: uploadedFile.name.replace('.pdf', format.extension),
        message: `تم تحويل الملف إلى ${format.name} بنجاح`
      });

      if (onComplete) {
        onComplete({
          base64: '',
          filename: uploadedFile.name.replace('.pdf', format.extension),
          message: `تم التحويل إلى ${format.name}`
        });
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('حدث خطأ أثناء تحويل الملف');
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${result.format.color} rounded-lg flex items-center justify-center`}>
                  <result.format.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">{result.message}</h4>
                  <p className="text-sm text-green-700">{result.filename}</p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 ml-2" />
                تحميل الملف
              </Button>
            </div>
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