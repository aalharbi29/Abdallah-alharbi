import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, FileText, Loader2, X, CheckCircle, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageToPDFConverter({ onComplete }) {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedPdf, setConvertedPdf] = useState(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f.name));

    if (imageFiles.length === 0) {
      alert('الرجاء اختيار صور فقط (JPG, PNG, GIF, BMP, WEBP)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const result = await base44.integrations.Core.UploadFile({ file });
        
        uploadedImages.push({
          id: Date.now() + i,
          name: file.name,
          url: result.file_url,
          size: file.size
        });
        
        setUploadProgress(((i + 1) / imageFiles.length) * 100);
      }

      setImages(prev => [...prev, ...uploadedImages]);
      alert(`تم رفع ${imageFiles.length} صورة بنجاح`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleConvertToPDF = async () => {
    if (images.length === 0) {
      alert('الرجاء رفع صورة واحدة على الأقل');
      return;
    }

    setIsConverting(true);

    try {
      const imageUrls = images.map(img => img.url);
      
      const response = await base44.functions.invoke('imagesToPDF', {
        imageUrls
      });

      if (response.data?.success) {
        const pdfData = {
          base64: response.data.pdfBase64,
          filename: `converted_${Date.now()}`,
          totalPages: images.length,
          message: `تم تحويل ${images.length} صورة إلى PDF بنجاح`
        };
        
        setConvertedPdf(pdfData);
        
        if (onComplete) {
          onComplete(pdfData);
        }
        
        alert('✅ تم تحويل الصور إلى PDF بنجاح!');
      } else {
        throw new Error(response.data?.error || 'فشل التحويل');
      }
    } catch (error) {
      console.error('Convert error:', error);
      alert(`حدث خطأ أثناء التحويل:\n${error.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!convertedPdf) return;
    
    try {
      const binaryString = atob(convertedPdf.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${convertedPdf.filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('حدث خطأ أثناء التحميل');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            رفع الصور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={isUploading || isConverting}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                اضغط هنا لاختيار الصور
              </p>
              <p className="text-xs text-gray-500">
                يدعم JPG, PNG, GIF, BMP, WEBP
              </p>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-center text-gray-600">
                جاري الرفع... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {images.length > 0 && (
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handleConvertToPDF}
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التحويل...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 ml-2" />
                  تحويل إلى PDF ({images.length} صورة)
                </>
              )}
            </Button>
          )}

          {convertedPdf && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {convertedPdf.message}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="mt-2 w-full"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            الصور المرفوعة ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">لا توجد صور مرفوعة</p>
              <p className="text-sm">ابدأ برفع صور لتحويلها إلى PDF</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white h-8 w-8"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-2 left-2 bg-purple-500">
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">
                      {(image.size / 1024).toFixed(1)} KB
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}