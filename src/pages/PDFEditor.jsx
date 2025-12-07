import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Scissors,
  Combine,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  FileImage,
  X,
  FileArchive,
  FileSignature,
  Shield,
  Palette,
  Lock,
  FileSpreadsheet,
  Layers,
  ScanLine,
  Bug,
  RefreshCw,
  Wrench,
  FolderOpen
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PDFPreview from "../components/pdf_editor/PDFPreview";
import SavePDFDialog from "../components/pdf_editor/SavePDFDialog";
import PDFPageSelector from "../components/pdf_editor/PDFPageSelector";
import ImageToPDFConverter from "../components/pdf_editor/ImageToPDFConverter";
import ZipManager from "../components/pdf_editor/ZipManager";
import SignatureCanvas from "../components/pdf_editor/SignatureCanvas";
import SignatureVerifier from "../components/pdf_editor/SignatureVerifier";
import PDFAnnotator from "../components/pdf_editor/PDFAnnotator";
import PDFFormFiller from "../components/pdf_editor/PDFFormFiller";
import PDFSecurity from "../components/pdf_editor/PDFSecurity";
import PDFConverter from "../components/pdf_editor/PDFConverter";
import PDFPageManager from "../components/pdf_editor/PDFPageManager";
import SaveToLocationDialog from "../components/pdf_editor/SaveToLocationDialog";

export default function PDFEditor() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [resultPdf, setResultPdf] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('merge');

  const [splitType, setSplitType] = useState('each');
  const [pageRanges, setPageRanges] = useState([{ start: 1, end: 1 }]);
  const [splitResults, setSplitResults] = useState([]);

  const [convertedImages, setConvertedImages] = useState([]);

  const [showPageSelector, setShowPageSelector] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [operationType, setOperationType] = useState('');

  const [compressionQuality, setCompressionQuality] = useState(50);
  const [compressionResult, setCompressionResult] = useState(null);

  // حالة اكتشاف الأخطاء
  const [detectedErrors, setDetectedErrors] = useState([]);
  const [isCheckingErrors, setIsCheckingErrors] = useState(false);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [showSaveToLocationDialog, setShowSaveToLocationDialog] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      alert('الرجاء اختيار ملفات PDF فقط');
      return;
    }

    const shouldReplace = ['split', 'convert', 'compress', 'sign', 'verify'].includes(activeTab);
    const filesToProcess = shouldReplace ? [pdfFiles[0]] : pdfFiles;

    if (shouldReplace && filesToProcess.length === 0) {
      alert('الرجاء اختيار ملف PDF واحد فقط لهذا التبويب');
      return;
    }
    if (shouldReplace && pdfFiles.length > 1) {
      alert('تم اختيار أول ملف PDF فقط لهذا التبويب.');
    }

    setIsUploading(true);
    setUploadProgress(0);

    if (shouldReplace) {
      setSplitResults([]);
      setConvertedImages([]);
      setCompressionResult(null);
      setResultPdf(null);
    }

    try {
      const uploadedList = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedList.push({
          id: Date.now() + i,
          name: file.name,
          url: result.file_url,
          size: file.size,
          selected: false,
          selectedPages: []
        });
        setUploadProgress(((i + 1) / filesToProcess.length) * 100);
      }

      setUploadedFiles(prev => shouldReplace ? uploadedList : [...prev, ...uploadedList]);
      alert(`تم رفع ${uploadedList.length} ملف بنجاح`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملفات');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      if (updatedFiles.length === 0) {
        setSplitResults([]);
        setConvertedImages([]);
        setCompressionResult(null);
        setResultPdf(null);
      }
      return updatedFiles;
    });
  };

  const handleSelectPages = (file, type) => {
    setCurrentFile(file);
    setOperationType(type);
    setShowPageSelector(true);
  };

  const handlePagesSelected = async (selectedPages) => {
    if (operationType === 'extract') {
      await handleExtractPages(currentFile, selectedPages);
    } else if (operationType === 'delete') {
      await handleDeletePages(currentFile, selectedPages);
    } else if (operationType === 'select-for-merge') {
      setUploadedFiles(prev => prev.map(f =>
        f.id === currentFile.id ? { ...f, selectedPages } : f
      ));
      alert(`تم اختيار ${selectedPages.length} صفحة من ${currentFile.name}`);
    } else if (operationType === 'extract-selected') {
      // استخراج الصفحات المختارة مسبقاً
      await handleExtractPages(currentFile, selectedPages);
    }
    setShowPageSelector(false);
  };

  const handleExtractPages = async (file, selectedPages) => {
    if (selectedPages.length === 0) {
      alert('يجب اختيار صفحة واحدة على الأقل');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage(`جاري استخراج ${selectedPages.length} صفحة...`);

    try {
      const response = await base44.functions.invoke('extractPages', {
        fileUrl: file.url,
        pageNumbers: selectedPages
      });

      if (response.data?.success) {
        setResultPdf({
          base64: response.data.pdfBase64,
          filename: `extracted_pages_${Date.now()}`,
          totalPages: selectedPages.length,
          message: `تم استخراج ${selectedPages.length} صفحة بنجاح`
        });
        alert(`✅ تم استخراج ${selectedPages.length} صفحة`);
      } else {
        throw new Error(response.data?.error || 'فشل الاستخراج');
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert(`حدث خطأ أثناء استخراج الصفحات:\n${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleDeletePages = async (file, pagesToDelete) => {
    if (pagesToDelete.length === 0) {
      alert('يجب اختيار صفحة واحدة على الأقل للحذف');
      return;
    }

    const confirmDelete = confirm(`هل أنت متأكد من حذف ${pagesToDelete.length} صفحة من ${file.name}؟\n\nهذا الإجراء سيحذف الصفحات المحددة ويحتفظ بالباقي.`);
    
    if (!confirmDelete) return;

    setIsProcessing(true);
    setProcessingMessage(`جاري حذف ${pagesToDelete.length} صفحة...`);

    try {
      const response = await base44.functions.invoke('deletePages', {
        fileUrl: file.url,
        pageNumbers: pagesToDelete
      });

      if (response.data?.success) {
        setResultPdf({
          base64: response.data.pdfBase64,
          filename: `${file.name.replace('.pdf', '')}_بعد_الحذف`,
          totalPages: response.data.remainingPages,
          message: `تم حذف ${pagesToDelete.length} صفحة، تبقى ${response.data.remainingPages} صفحة`
        });
        alert(`✅ تم حذف ${pagesToDelete.length} صفحة بنجاح!\nالصفحات المتبقية: ${response.data.remainingPages}`);
      } else {
        throw new Error(response.data?.error || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`حدث خطأ أثناء حذف الصفحات:\n${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleMergeAll = async () => {
    if (uploadedFiles.length < 2) {
      alert('يجب رفع ملفين على الأقل للدمج');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('جاري دمج الملفات...');

    try {
      const mergeData = uploadedFiles.map(f => ({
        fileUrl: f.url,
        selectedPages: f.selectedPages && f.selectedPages.length > 0 ? f.selectedPages : null
      }));

      const response = await base44.functions.invoke('mergePDFsAdvanced', { files: mergeData });

      if (response.data.success) {
        setResultPdf({
          base64: response.data.pdfBase64,
          filename: `merged_${Date.now()}`,
          totalPages: response.data.totalPages,
          message: response.data.message
        });
        alert(`✅ ${response.data.message}`);
      } else {
        throw new Error(response.data.error || 'فشل الدمج');
      }
    } catch (error) {
      console.error('Merge error:', error);
      alert(`حدث خطأ أثناء دمج الملفات:\n${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleSplitPDF = async () => {
    if (uploadedFiles.length === 0) {
      alert('يجب رفع ملف واحد على الأقل للتقسيم');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('جاري تقسيم الملف...');
    setSplitResults([]);

    try {
      const payload = {
        fileUrl: uploadedFiles[0].url,
        splitType: splitType
      };

      if (splitType === 'ranges') {
        payload.pageRanges = pageRanges;
      }

      const response = await base44.functions.invoke('splitPDF', payload);

      if (response.data?.success) {
        setSplitResults(response.data.splitPdfs);
        alert(`✅ ${response.data.message}`);
      } else {
        throw new Error(response.data?.error || 'فشل التقسيم');
      }
    } catch (error) {
      console.error('Split error:', error);
      alert(`حدث خطأ أثناء تقسيم الملف:\n${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleConvertToImages = async () => {
    if (uploadedFiles.length === 0) {
      alert('يجب رفع ملف واحد على الأقل');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('جاري فصل صفحات PDF...');
    setConvertedImages([]);

    try {
      const response = await base44.functions.invoke('pdfToImages', {
        fileUrl: uploadedFiles[0].url
      });

      if (response.data?.success) {
        setConvertedImages(response.data.images);
        const msg = response.data.processedPages < response.data.totalPages
          ? 'تم فصل أول ' + response.data.processedPages + ' صفحة من أصل ' + response.data.totalPages
          : 'تم فصل ' + response.data.images.length + ' صفحة بنجاح!';
        alert('✅ ' + msg);
      } else {
        throw new Error(response.data?.error || 'فشل الفصل');
      }
    } catch (error) {
      console.error('Convert error:', error);
      alert('❌ حدث خطأ أثناء فصل الصفحات');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleCompressPDF = async () => {
    if (uploadedFiles.length === 0) {
      alert('الرجاء رفع ملف PDF واحد على الأقل');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('جاري ضغط الملف...');
    setCompressionResult(null);

    try {
      const response = await base44.functions.invoke('compressPDF', {
        fileUrl: uploadedFiles[0].url,
        compressionPercentage: compressionQuality
      });

      if (response.data?.success) {
        const result = {
          base64: response.data.pdfBase64,
          filename: `compressed_${uploadedFiles[0].name.replace('.pdf', '')}`,
          originalSize: response.data.originalSize,
          compressedSize: response.data.compressedSize,
          reductionPercentage: response.data.reductionPercentage,
          requestedQuality: response.data.requestedQuality,
          message: response.data.message
        };

        setCompressionResult(result);
        setResultPdf({
          base64: response.data.pdfBase64,
          filename: result.filename,
          totalPages: 0,
          message: result.message
        });

        alert(`✅ ${response.data.message}`);
      } else {
        throw new Error(response.data?.error || 'فشل الضغط');
      }
    } catch (error) {
      console.error('Compression error:', error);
      alert(`حدث خطأ أثناء ضغط الملف:\n${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleDownloadImage = (image) => {
    try {
      if (image.downloadUrl) {
        window.open(image.downloadUrl, '_blank');
      } else {
        const binaryString = atob(image.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = image.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      alert('حدث خطأ أثناء التحميل');
    }
  };

  const handleDownloadSplitFile = (splitFile) => {
    try {
      const cleanBase64 = splitFile.pdfBase64.replace(/\s/g, '');
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = splitFile.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading split file:', error);
      alert('حدث خطأ أثناء تحميل الملف');
    }
  };

  const handleDownloadResult = () => {
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
      console.error('Error downloading result:', error);
      alert('حدث خطأ أثناء التحميل');
    }
  };

  const addPageRange = () => {
    setPageRanges([...pageRanges, { start: 1, end: 1 }]);
  };

  const removePageRange = (index) => {
    setPageRanges(pageRanges.filter((_, i) => i !== index));
  };

  const updatePageRange = (index, field, value) => {
    const newRanges = [...pageRanges];
    newRanges[index][field] = parseInt(value) || 1;
    setPageRanges(newRanges);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFilesFromZip = (pdfFiles) => {
    setUploadedFiles(prev => [...prev, ...pdfFiles]);
    alert(`تمت إضافة ${pdfFiles.length} ملف PDF إلى قائمة الملفات`);
  };

  // وظيفة اكتشاف الأخطاء
  const checkForErrors = () => {
    setIsCheckingErrors(true);
    setDetectedErrors([]);
    
    const errors = [];
    
    // فحص أخطاء الملفات
    if (uploadedFiles.length === 0 && ['merge', 'split', 'convert', 'compress'].includes(activeTab)) {
      errors.push({
        id: 'no-files',
        type: 'warning',
        message: 'لم يتم رفع أي ملف PDF',
        solution: 'قم برفع ملف PDF واحد على الأقل للمتابعة',
        action: () => document.getElementById('pdf-upload-merge')?.click()
      });
    }

    if (activeTab === 'merge' && uploadedFiles.length === 1) {
      errors.push({
        id: 'single-file-merge',
        type: 'warning',
        message: 'لا يمكن دمج ملف واحد فقط',
        solution: 'أضف ملف PDF آخر على الأقل لعملية الدمج',
        action: () => document.getElementById('pdf-upload-merge')?.click()
      });
    }

    // فحص الملفات التي قد تكون تالفة
    uploadedFiles.forEach((file, index) => {
      if (!file.url) {
        errors.push({
          id: `file-url-${index}`,
          type: 'error',
          message: `الملف "${file.name}" لا يحتوي على رابط صالح`,
          solution: 'أعد رفع الملف',
          action: () => handleRemoveFile(file.id)
        });
      }
      if (file.size === 0) {
        errors.push({
          id: `file-empty-${index}`,
          type: 'error',
          message: `الملف "${file.name}" فارغ`,
          solution: 'احذف الملف وارفع ملف آخر',
          action: () => handleRemoveFile(file.id)
        });
      }
    });

    // فحص نطاقات التقسيم
    if (activeTab === 'split' && splitType === 'ranges') {
      pageRanges.forEach((range, index) => {
        if (range.start > range.end) {
          errors.push({
            id: `range-invalid-${index}`,
            type: 'error',
            message: `النطاق ${index + 1}: صفحة البداية (${range.start}) أكبر من صفحة النهاية (${range.end})`,
            solution: 'صحح قيم النطاق',
            action: () => updatePageRange(index, 'end', range.start)
          });
        }
        if (range.start < 1) {
          errors.push({
            id: `range-start-${index}`,
            type: 'error',
            message: `النطاق ${index + 1}: صفحة البداية يجب أن تكون 1 على الأقل`,
            solution: 'صحح قيمة صفحة البداية',
            action: () => updatePageRange(index, 'start', 1)
          });
        }
      });
    }

    // فحص جودة الضغط
    if (activeTab === 'compress') {
      if (compressionQuality < 20) {
        errors.push({
          id: 'low-quality',
          type: 'warning',
          message: 'جودة الضغط منخفضة جداً وقد تؤثر على وضوح المحتوى',
          solution: 'ننصح برفع الجودة إلى 30% على الأقل',
          action: () => setCompressionQuality(30)
        });
      }
    }

    // فحص نتائج العمليات السابقة
    if (resultPdf && !resultPdf.base64) {
      errors.push({
        id: 'empty-result',
        type: 'error',
        message: 'نتيجة العملية الأخيرة فارغة',
        solution: 'أعد تنفيذ العملية',
        action: () => setResultPdf(null)
      });
    }

    setTimeout(() => {
      setDetectedErrors(errors);
      setIsCheckingErrors(false);
      setShowErrorPanel(true);
      
      if (errors.length === 0) {
        alert('✅ لا توجد أخطاء! النظام يعمل بشكل سليم.');
      }
    }, 500);
  };

  // إصلاح جميع الأخطاء
  const fixAllErrors = () => {
    detectedErrors.forEach(error => {
      if (error.action) {
        error.action();
      }
    });
    setDetectedErrors([]);
    setShowErrorPanel(false);
    alert('✅ تم إصلاح جميع الأخطاء القابلة للإصلاح');
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
            📄 محرر ملفات PDF الاحترافي
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            🚀 دمج، تقسيم، تحرير، تعبئة نماذج، حماية، تحويل، ضغط، توقيع رقمي، والمزيد
          </p>
          
          {/* زر اكتشاف الأخطاء */}
          <div className="mt-4">
            <Button
              onClick={checkForErrors}
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              disabled={isCheckingErrors}
            >
              {isCheckingErrors ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bug className="w-4 h-4" />
              )}
              {isCheckingErrors ? 'جاري الفحص...' : 'اكتشاف الأخطاء'}
            </Button>
          </div>
        </div>

        {/* لوحة الأخطاء المكتشفة */}
        {showErrorPanel && detectedErrors.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader className="py-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  تم اكتشاف {detectedErrors.length} {detectedErrors.length === 1 ? 'مشكلة' : 'مشاكل'}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={fixAllErrors}
                    className="bg-green-600 hover:bg-green-700 gap-1"
                  >
                    <Wrench className="w-3 h-3" />
                    إصلاح الكل
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowErrorPanel(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                {detectedErrors.map((error) => (
                  <div
                    key={error.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      error.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}
                  >
                    <div className={`mt-0.5 ${error.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${error.type === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                        {error.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        💡 {error.solution}
                      </p>
                    </div>
                    {error.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          error.action();
                          setDetectedErrors(prev => prev.filter(e => e.id !== error.id));
                        }}
                        className="gap-1 text-xs h-7"
                      >
                        <RefreshCw className="w-3 h-3" />
                        إصلاح
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800 font-medium">
              {processingMessage}
            </AlertDescription>
          </Alert>
        )}

        {resultPdf && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong className="text-green-900">{resultPdf.message}</strong>
                {resultPdf.totalPages > 0 && (
                  <p className="text-sm text-green-700 mt-1">
                    عدد الصفحات: {resultPdf.totalPages}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadResult} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
                <Button onClick={() => setShowSaveDialog(true)} size="sm" variant="outline">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ سريع
                </Button>
                <Button onClick={() => setShowSaveToLocationDialog(true)} size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700">
                  <FolderOpen className="w-4 h-4 ml-2" />
                  نقل إلى...
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="merge" className="gap-1 text-xs px-2 py-1.5">
              <Combine className="w-3 h-3" />
              دمج
            </TabsTrigger>
            <TabsTrigger value="split" className="gap-1 text-xs px-2 py-1.5">
              <Scissors className="w-3 h-3" />
              تقسيم
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-1 text-xs px-2 py-1.5">
              <Layers className="w-3 h-3" />
              إدارة الصفحات
            </TabsTrigger>
            <TabsTrigger value="annotate" className="gap-1 text-xs px-2 py-1.5">
              <Palette className="w-3 h-3" />
              تحرير
            </TabsTrigger>
            <TabsTrigger value="forms" className="gap-1 text-xs px-2 py-1.5">
              <ScanLine className="w-3 h-3" />
              تعبئة نماذج
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1 text-xs px-2 py-1.5">
              <Lock className="w-3 h-3" />
              حماية
            </TabsTrigger>
            <TabsTrigger value="convert-formats" className="gap-1 text-xs px-2 py-1.5">
              <FileSpreadsheet className="w-3 h-3" />
              تحويل
            </TabsTrigger>
            <TabsTrigger value="convert" className="gap-1 text-xs px-2 py-1.5">
              <ImageIcon className="w-3 h-3" />
              فصل صفحات
            </TabsTrigger>
            <TabsTrigger value="image-to-pdf" className="gap-1 text-xs px-2 py-1.5">
              <FileImage className="w-3 h-3" />
              JPG→PDF
            </TabsTrigger>
            <TabsTrigger value="compress" className="gap-1 text-xs px-2 py-1.5">
              <Download className="w-3 h-3" />
              ضغط
            </TabsTrigger>
            <TabsTrigger value="sign" className="gap-1 text-xs px-2 py-1.5">
              <FileSignature className="w-3 h-3" />
              توقيع
            </TabsTrigger>
            <TabsTrigger value="verify" className="gap-1 text-xs px-2 py-1.5">
              <Shield className="w-3 h-3" />
              تحقق
            </TabsTrigger>
            <TabsTrigger value="zip" className="gap-1 text-xs px-2 py-1.5">
              <FileArchive className="w-3 h-3" />
              ZIP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="merge" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>رفع ملفات PDF للدمج</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    💡 يمكنك اختيار صفحات محددة من كل ملف، ثم دمجها أو استخراج الصفحات المختارة وحفظها منفصلة
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload-merge"
                      disabled={isUploading || isProcessing}
                    />
                    <label htmlFor="pdf-upload-merge" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600">اضغط لاختيار ملفات PDF</p>
                      <p className="text-xs text-gray-500 mt-2">يمكنك رفع عدة ملفات مرة واحدة</p>
                    </label>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-center">{Math.round(uploadProgress)}%</p>
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">
                          <strong>خيارات متعددة:</strong>
                          <ul className="list-disc pr-4 mt-2 space-y-1">
                            <li>اضغط "اختيار صفحات" لتحديد صفحات معينة من كل ملف</li>
                            <li>بعد اختيار الصفحات، يمكنك "استخراجها وحفظها" منفصلة أو "دمجها" مع ملفات أخرى</li>
                            <li>اضغط "حذف صفحات" لإزالة صفحات غير مرغوبة من الملف</li>
                          </ul>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        {uploadedFiles.map((file, index) => (
                          <PDFPreview
                            key={file.id}
                            file={file}
                            index={index}
                            onRemove={handleRemoveFile}
                            onSelectPages={handleSelectPages}
                            showActions={true}
                          />
                        ))}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">ملخص الدمج</h3>
                          <Badge className="bg-blue-600 text-white">
                            {uploadedFiles.length} ملف
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {uploadedFiles.map((file, idx) => (
                            <div key={file.id} className="flex items-center gap-2">
                              <span className="font-medium">#{idx + 1}</span>
                              <span className="flex-1 truncate">{file.name}</span>
                              {file.selectedPages && file.selectedPages.length > 0 ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {file.selectedPages.length} صفحة محددة
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600">
                                  كل الصفحات
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleMergeAll}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6"
                        disabled={uploadedFiles.length < 2 || isProcessing}
                      >
                        <Combine className="w-5 h-5 ml-2" />
                        دمج {uploadedFiles.length} ملف
                        {uploadedFiles.some(f => f.selectedPages?.length > 0) && ' (مع الصفحات المحددة)'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="split" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>رفع ملف PDF</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload-split"
                      disabled={isUploading || isProcessing}
                    />
                    <label htmlFor="pdf-upload-split" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600">اضغط لاختيار ملف PDF</p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && uploadedFiles[0] && (
                    <>
                      <PDFPreview
                        key={uploadedFiles[0].id}
                        file={uploadedFiles[0]}
                        index={0}
                        onRemove={handleRemoveFile}
                      />

                      <div className="space-y-3">
                        <Label>نوع التقسيم</Label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="split-each"
                              value="each"
                              checked={splitType === 'each'}
                              onChange={(e) => setSplitType(e.target.value)}
                              className="ml-2"
                            />
                            <label htmlFor="split-each">صفحة لكل ملف</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="split-ranges"
                              value="ranges"
                              checked={splitType === 'ranges'}
                              onChange={(e) => setSplitType(e.target.value)}
                              className="ml-2"
                            />
                            <label htmlFor="split-ranges">نطاقات مخصصة</label>
                          </div>
                        </div>

                        {splitType === 'ranges' && (
                          <div className="space-y-2">
                            {pageRanges.map((range, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <Input
                                  type="number"
                                  placeholder="من"
                                  value={range.start}
                                  onChange={(e) => updatePageRange(index, 'start', e.target.value)}
                                  min="1"
                                />
                                <span>-</span>
                                <Input
                                  type="number"
                                  placeholder="إلى"
                                  value={range.end}
                                  onChange={(e) => updatePageRange(index, 'end', e.target.value)}
                                  min="1"
                                />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => removePageRange(index)}
                                  disabled={pageRanges.length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button onClick={addPageRange} variant="outline" size="sm">
                              <Plus className="w-4 h-4 ml-2" />
                              إضافة نطاق
                            </Button>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleSplitPDF}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={isProcessing}
                      >
                        <Scissors className="w-4 h-4 ml-2" />
                        تقسيم الملف
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {splitResults.length === 0 ? 'الملفات المقسمة' : 'الملفات المقسمة (' + splitResults.length + ')'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {splitResults.length > 0 ? (
                    <div className="space-y-3">
                      {splitResults.map((splitFile, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{splitFile.filename}</p>
                              <p className="text-sm text-gray-500">الصفحات: {splitFile.pageCount}</p>
                            </div>
                            <Button onClick={() => handleDownloadSplitFile(splitFile)}>
                              <Download className="w-4 h-4 ml-2" />
                              تحميل
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Scissors className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>ارفع ملف وقم بتقسيمه</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="convert" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>رفع ملف PDF</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload-convert"
                      disabled={isUploading || isProcessing}
                    />
                    <label htmlFor="pdf-upload-convert" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600">اضغط لاختيار ملف PDF</p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && uploadedFiles[0] && (
                    <>
                      <PDFPreview
                        key={uploadedFiles[0].id}
                        file={uploadedFiles[0]}
                        index={0}
                        onRemove={handleRemoveFile}
                      />

                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={handleConvertToImages}
                        disabled={isProcessing}
                      >
                        <ImageIcon className="w-4 h-4 ml-2" />
                        فصل الصفحات
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>الصفحات المفصولة</CardTitle>
                </CardHeader>
                <CardContent>
                  {convertedImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {convertedImages.map((image, index) => (
                        <Card key={index} className="overflow-hidden">
                          <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center p-2">
                            <iframe
                              src={image.imageDataUrl}
                              className="w-full h-full border-0"
                              title={'صفحة ' + image.pageNumber}
                            />
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium truncate">{image.filename}</p>
                              <Button
                                size="sm"
                                onClick={() => handleDownloadImage(image)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>ارفع ملف وقم بفصل الصفحات</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="image-to-pdf" className="mt-6">
            <ImageToPDFConverter onComplete={(pdfData) => {
              setResultPdf(pdfData);
              setActiveTab('merge');
            }} />
          </TabsContent>

          <TabsContent value="compress" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-600" />
                    رفع ملف PDF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload-compress"
                      disabled={isUploading || isProcessing}
                    />
                    <label htmlFor="pdf-upload-compress" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        اضغط هنا لاختيار ملف PDF
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && uploadedFiles[0] && (
                    <>
                      <PDFPreview
                        key={uploadedFiles[0].id}
                        file={uploadedFiles[0]}
                        index={0}
                        onRemove={handleRemoveFile}
                      />

                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-semibold mb-3 block">مستوى الجودة</Label>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">حجم أصغر</span>
                              <Badge className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg px-4 py-1">
                                {compressionQuality}%
                              </Badge>
                              <span className="text-sm text-gray-600">جودة أعلى</span>
                            </div>
                            
                            <Input
                              type="range"
                              min="10"
                              max="90"
                              step="5"
                              value={compressionQuality}
                              onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                              className="w-full h-3 cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>10%</span>
                              <span>25%</span>
                              <span>50%</span>
                              <span>75%</span>
                              <span>90%</span>
                            </div>
                          </div>
                        </div>

                        <Alert className={
                          compressionQuality >= 70 ? 'bg-green-50 border-green-200' :
                          compressionQuality >= 50 ? 'bg-blue-50 border-blue-200' :
                          compressionQuality >= 30 ? 'bg-yellow-50 border-yellow-200' :
                          'bg-orange-50 border-orange-200'
                        }>
                          <AlertCircle className={'h-4 w-4 ' + (
                            compressionQuality >= 70 ? 'text-green-600' :
                            compressionQuality >= 50 ? 'text-blue-600' :
                            compressionQuality >= 30 ? 'text-yellow-600' :
                            'text-orange-600'
                          )} />
                          <AlertDescription className={'text-xs ' + (
                            compressionQuality >= 70 ? 'text-green-800' :
                            compressionQuality >= 50 ? 'text-blue-800' :
                            compressionQuality >= 30 ? 'text-yellow-800' :
                            'text-orange-800'
                          )}>
                            {compressionQuality >= 70 ? '🎯 جودة ممتازة - ضغط خفيف جداً' :
                             compressionQuality >= 50 ? '⚖️ توازن جيد - جودة عالية مع ضغط معتدل' :
                             compressionQuality >= 30 ? '📦 ضغط متوسط - تقليل ملحوظ في الحجم' :
                             '💪 ضغط قوي - أصغر حجم ممكن'}
                          </AlertDescription>
                        </Alert>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        onClick={handleCompressPDF}
                        disabled={isProcessing}
                      >
                        <Download className="w-4 h-4 ml-2" />
                        ضغط الملف (جودة {compressionQuality}%)
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {compressionResult ? 'نتيجة الضغط' : 'الملف المرفوع'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {compressionResult ? (
                    <div className="space-y-4">
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          <p className="font-bold mb-2">{compressionResult.message}</p>
                        </AlertDescription>
                      </Alert>

                      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">الحجم الأصلي</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatFileSize(compressionResult.originalSize)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">بعد الضغط</p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatFileSize(compressionResult.compressedSize)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">الجودة</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {compressionResult.requestedQuality}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-center mb-4">
                            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                              تم التقليل بنسبة {compressionResult.reductionPercentage}%
                            </Badge>
                          </div>

                          <Progress 
                            value={100 - compressionResult.reductionPercentage} 
                            className="h-4"
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>الحجم الجديد</span>
                            <span>{(100 - compressionResult.reductionPercentage).toFixed(1)}% من الحجم الأصلي</span>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownloadResult}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 ml-2" />
                          تحميل
                        </Button>
                        <Button
                          onClick={() => setShowSaveDialog(true)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 ml-2" />
                          حفظ
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>ارفع ملف PDF لضغطه</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sign" className="mt-6">
            <SignatureCanvas onComplete={(pdfData) => {
              setResultPdf(pdfData);
            }} />
          </TabsContent>

          <TabsContent value="verify" className="mt-6">
            <SignatureVerifier />
          </TabsContent>

          <TabsContent value="zip" className="mt-6">
            <ZipManager onFilesExtracted={handleFilesFromZip} />
          </TabsContent>

          <TabsContent value="pages" className="mt-6">
            <PDFPageManager onComplete={(pdfData) => {
              setResultPdf(pdfData);
            }} />
          </TabsContent>

          <TabsContent value="annotate" className="mt-6">
            <PDFAnnotator onComplete={(pdfData) => {
              setResultPdf(pdfData);
            }} />
          </TabsContent>

          <TabsContent value="forms" className="mt-6">
            <PDFFormFiller onComplete={(pdfData) => {
              setResultPdf(pdfData);
            }} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <PDFSecurity onComplete={(pdfData) => {
              setResultPdf(pdfData);
            }} />
          </TabsContent>

          <TabsContent value="convert-formats" className="mt-6">
            <PDFConverter onComplete={(pdfData) => {
              setResultPdf(pdfData);
            }} />
          </TabsContent>
        </Tabs>
      </div>

      {showPageSelector && currentFile && (
        <PDFPageSelector
          open={showPageSelector}
          onOpenChange={setShowPageSelector}
          file={currentFile}
          operationType={operationType}
          onPagesSelected={handlePagesSelected}
        />
      )}

      {resultPdf && (
        <>
          <SavePDFDialog
            open={showSaveDialog}
            onOpenChange={setShowSaveDialog}
            pdfBase64={resultPdf.base64}
            defaultFilename={resultPdf.filename}
            onSaveComplete={() => {
              setResultPdf(null);
              setUploadedFiles([]);
            }}
          />
          <SaveToLocationDialog
            open={showSaveToLocationDialog}
            onOpenChange={setShowSaveToLocationDialog}
            pdfBase64={resultPdf.base64}
            defaultFilename={resultPdf.filename}
            onSaveComplete={() => {
              setResultPdf(null);
              setUploadedFiles([]);
            }}
          />
        </>
      )}
    </div>
  );
}