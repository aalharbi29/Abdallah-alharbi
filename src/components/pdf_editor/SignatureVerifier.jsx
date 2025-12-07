import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  FileCheck,
  Info,
  Calendar,
  FileText
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PDFPreview from './PDFPreview';

export default function SignatureVerifier() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('الرجاء اختيار ملف PDF فقط');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setVerificationResult(null);

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({
        id: Date.now(),
        name: file.name,
        url: result.file_url,
        size: file.size
      });
      setUploadProgress(100);
      alert('تم رفع الملف بنجاح');
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVerify = async () => {
    if (!uploadedFile) {
      alert('الرجاء رفع ملف PDF أولاً');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await base44.functions.invoke('verifyPDFSignature', {
        fileUrl: uploadedFile.url
      });

      if (response.data?.success) {
        setVerificationResult(response.data);
        alert('✅ تم فحص الملف بنجاح');
      } else {
        throw new Error(response.data?.error || 'فشل التحقق من التوقيعات');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert(`حدث خطأ أثناء التحقق:\n${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setVerificationResult(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA');
    } catch {
      return 'غير صالح';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            التحقق من التوقيعات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload-verify"
                disabled={isUploading || isVerifying}
              />
              <label htmlFor="pdf-upload-verify" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">
                  اضغط لاختيار ملف PDF
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  للتحقق من التوقيعات
                </p>
              </label>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-xs text-center">{Math.round(uploadProgress)}%</p>
              </div>
            )}

            {uploadedFile && (
              <PDFPreview
                file={uploadedFile}
                index={0}
                onRemove={handleRemoveFile}
              />
            )}
          </div>

          {uploadedFile && (
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الفحص...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 ml-2" />
                  فحص التوقيعات
                </>
              )}
            </Button>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>ملاحظة:</strong> هذا فحص أساسي للملف. للتحقق الكامل من التوقيعات الرقمية المشفرة، استخدم Adobe Acrobat Reader.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>نتائج الفحص</CardTitle>
        </CardHeader>
        <CardContent>
          {verificationResult ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong className="text-green-900">تم فحص الملف بنجاح</strong>
                </AlertDescription>
              </Alert>

              {/* معلومات الملف */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    معلومات الملف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">عدد الصفحات</p>
                      <p className="font-semibold">{verificationResult.fileInfo.totalPages}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">العنوان</p>
                      <p className="font-semibold">{verificationResult.fileInfo.metadata.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">المؤلف</p>
                      <p className="font-semibold">{verificationResult.fileInfo.metadata.author}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">المنتج</p>
                      <p className="font-semibold">{verificationResult.fileInfo.metadata.producer}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-semibold">التواريخ</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        تاريخ الإنشاء: <span className="font-medium">{formatDate(verificationResult.fileInfo.metadata.creationDate)}</span>
                      </p>
                      <p className="text-gray-600">
                        تاريخ التعديل: <span className="font-medium">{formatDate(verificationResult.fileInfo.metadata.modificationDate)}</span>
                      </p>
                    </div>
                  </div>

                  {verificationResult.fileInfo.hasModifications && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-xs text-yellow-800">
                        تم تعديل الملف بعد إنشائه
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* نتائج الفحص */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    نتائج الفحص
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>طريقة الفحص:</strong> {verificationResult.verification.method}
                    </p>
                    <p className="text-sm text-blue-700">
                      {verificationResult.verification.note}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">📋 التوصيات:</p>
                    <ul className="list-disc pr-5 space-y-1 text-sm text-gray-700">
                      {verificationResult.verification.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>الصفحات المفحوصة:</strong> {verificationResult.verification.pagesInspected} من {verificationResult.fileInfo.totalPages}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : uploadedFile ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">جاهز للفحص</p>
              <p className="text-sm">اضغط على زر "فحص التوقيعات" للبدء</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">لم يتم رفع ملف</p>
              <p className="text-sm">ارفع ملف PDF للتحقق من توقيعاته</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}