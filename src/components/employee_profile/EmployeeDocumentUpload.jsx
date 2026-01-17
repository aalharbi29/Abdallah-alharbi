import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, FileUp, AlertCircle, X, Sparkles, Calendar } from 'lucide-react';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { EmployeeDocument } from '@/entities/EmployeeDocument';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';

const documentTypes = {
  personal: 'مستندات شخصية',
  official: 'مستندات رسمية',
  certificate: 'شهادات ومؤهلات',
  contract: 'عقود وتكليفات',
  evaluation: 'تقييمات أداء',
  other: 'أخرى'
};

const sanitizeFilename = (filename) => {
    if (!filename) return `doc_${Date.now()}.dat`;
    
    const extension = filename.split('.').pop() || 'dat';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    let safeName = nameWithoutExt
      .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 30);
    
    if (!safeName || safeName.length < 3) {
      safeName = `doc_${Date.now().toString().slice(-8)}`;
    }
    
    return `${safeName}.${extension}`;
};

const isFilenameSafe = (filename) => {
  return !/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(filename) &&
         !/[^\w\s.-]/.test(filename);
};

export default function EmployeeDocumentUpload({ employee, onClose, onDocumentUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    document_title: '',
    document_type: 'personal',
    description: '',
    tags: '',
    is_confidential: false,
    expiry_date: '',
    has_no_expiry: false // خيار جديد: حتى إشعار آخر
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState('');

  const validateFile = (file) => {
    if (!file || !file.size) {
      return 'الملف فارغ أو غير صالح';
    }

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return `الملف "${file.name}" كبير جداً. الحد الأقصى 10 ميجا بايت.`;
    }

    if (file.size < 100) {
      return `الملف "${file.name}" صغير جداً أو تالف.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `نوع الملف "${file.name}" غير مدعوم.`;
    }

    return null;
  };

  const handleFileSelect = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setFiles(fileArray);
    if (fileArray.length > 0 && !formData.document_title) {
      setFormData(prev => ({
        ...prev,
        document_title: fileArray[0].name.split('.').slice(0, -1).join('.')
      }));
    }
    setError('');
  }, [formData.document_title]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleFileSelect]);

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const uploadWithRetry = async (file, maxRetries = 3) => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setCurrentUploadFile(`محاولة ${attempt}/${maxRetries}: جاري رفع ${file.name}`);
        
        let fileToUpload = file;
        if (!isFilenameSafe(file.name)) {
          const safeFileName = sanitizeFilename(file.name);
          console.log(`🔄 تنظيف الاسم: ${file.name} → ${safeFileName}`);
          
          fileToUpload = new File([file], safeFileName, { 
            type: file.type,
            lastModified: file.lastModified 
          });
        } else {
          console.log(`✓ اسم الملف آمن: ${file.name}`);
        }

        const uploadResult = await UploadFile({ file: fileToUpload });
        
        if (uploadResult && uploadResult.file_url) {
          console.log(`✅ تم رفع الملف بنجاح: ${fileToUpload.name}`);
          return uploadResult;
        } else {
          throw new Error('رد غير صالح من الخادم');
        }
        
      } catch (err) {
        console.error(`❌ المحاولة ${attempt} فشلت لـ ${file.name}:`, err);
        
        if (attempt === maxRetries) {
          if (err.message?.includes('Network')) {
            throw new Error('فشل الاتصال بالشبكة. يرجى التحقق من اتصالك وإعادة المحاولة.');
          } else if (err.message?.includes('DatabaseTimeout') || err.message?.includes('544')) {
            throw new Error(`انتهت مهلة الرفع لـ "${file.name}". قد يكون الملف كبيراً جداً أو هناك مشكلة مؤقتة. يرجى المحاولة مرة أخرى.`);
          } else if (err.message?.includes('500')) {
            throw new Error(`خطأ داخلي في الخادم أثناء رفع "${file.name}". يرجى المحاولة مرة أخرى.`);
          } else {
            throw new Error(`فشل رفع الملف "${file.name}": ${err.message || 'خطأ غير معروف'}`);
          }
        }
        
        const delay = 3000 * attempt;
        setCurrentUploadFile(`⏳ المحاولة ${attempt} فشلت. انتظار ${delay/1000} ثانية قبل إعادة المحاولة...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !formData.document_title.trim()) {
      setError('يرجى إدخال عنوان المستند والتأكد من وجود ملفات.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      const recordsToCreate = [];
      let successCount = 0;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(Math.round((i / totalFiles) * 90));
        setCurrentUploadFile(`جاري رفع الملف ${i + 1} من ${totalFiles}: ${file.name}`);

        try {
          const uploadResult = await uploadWithRetry(file);
          
          recordsToCreate.push({
            employee_id: employee.id,
            employee_name: employee.full_name_arabic,
            document_title: files.length > 1 ? `${formData.document_title.trim()} - ${file.name}` : formData.document_title.trim(),
            document_type: formData.document_type,
            description: formData.description.trim(),
            file_url: uploadResult.file_url,
            file_name: file.name,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            is_confidential: formData.is_confidential,
            expiry_date: formData.has_no_expiry ? 'حتى إشعار آخر' : (formData.expiry_date || null)
          });
          
          successCount++;
        } catch (fileError) {
          console.error(`فشل رفع ${file.name}:`, fileError);
          
          const continueUpload = window.confirm(
            `⚠️ فشل رفع الملف "${file.name}"\n\n` +
            `السبب: ${fileError.message}\n\n` +
            `هل تريد المتابعة مع الملفات الأخرى؟`
          );
          
          if (!continueUpload) {
            throw fileError;
          }
        }
      }

      if (recordsToCreate.length > 0) {
        setCurrentUploadFile('💾 جاري حفظ بيانات المستندات...');
        setUploadProgress(95);
        
        await EmployeeDocument.bulkCreate(recordsToCreate);
        setUploadProgress(100);
        
        setCurrentUploadFile('✅ اكتمل الرفع بنجاح!');
        
        if (successCount < totalFiles) {
          alert(`تم رفع ${successCount} من أصل ${totalFiles} ملفات بنجاح. فشلت بعض الملفات في الرفع.`);
        }
        
        setTimeout(() => {
          onDocumentUploaded();
        }, 1000);
      } else {
        throw new Error('فشل رفع جميع الملفات أو تم إلغاء العملية.');
      }
      
    } catch (err) {
      console.error('خطأ في الرفع:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الملفات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            رفع مستند: {employee.full_name_arabic}
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isUploading}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* منطقة السحب والإفلات */}
          <div
            onDrop={handleDrop}
            onDragEnter={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDragOver={handleDragEvents}
            className={`relative block w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              اسحب وأفلت الملفات هنا، أو
            </span>
            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>تصفح الملفات</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                className="sr-only" 
                onChange={(e) => handleFileSelect(e.target.files)} 
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              ملفات مدعومة: PDF، Word، Excel، صور (حتى 10 ميجا بايت)
            </p>
          </div>

          {files.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">الملفات المحددة ({files.length}):</h4>
              {files.map((file, index) => (
                <div key={index} className="text-sm text-gray-700 flex items-center justify-between py-1">
                  <span>📎 {file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>جاري الرفع...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              {currentUploadFile && (
                <p className="text-xs text-gray-500">{currentUploadFile}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document_title">عنوان المستند *</Label>
              <Input 
                id="document_title" 
                value={formData.document_title} 
                onChange={e => setFormData(prev => ({...prev, document_title: e.target.value}))} 
                required 
                disabled={isUploading}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="document_type">نوع المستند</Label>
              <Select 
                value={formData.document_type} 
                onValueChange={value => setFormData(prev => ({...prev, document_type: value}))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} 
              disabled={isUploading}
              maxLength={500}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="tags">كلمات مفتاحية (مفصولة بفاصلة)</Label>
            <Input 
              id="tags" 
              value={formData.tags} 
              onChange={e => setFormData(prev => ({...prev, tags: e.target.value}))} 
              placeholder="مثال: شهادة, تدريب, هام" 
              disabled={isUploading}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="is_confidential"
                checked={formData.is_confidential}
                onCheckedChange={value => setFormData(prev => ({...prev, is_confidential: value}))}
                disabled={isUploading}
              />
              <Label htmlFor="is_confidential">مستند سري</Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="has_no_expiry"
                checked={formData.has_no_expiry}
                onCheckedChange={value => setFormData(prev => ({...prev, has_no_expiry: value, expiry_date: value ? '' : prev.expiry_date}))}
                disabled={isUploading}
              />
              <Label htmlFor="has_no_expiry">حتى إشعار آخر (بدون تاريخ انتهاء)</Label>
            </div>
          </div>

          {!formData.has_no_expiry && (
            <div>
              <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية (اختياري)</Label>
              <Input 
                id="expiry_date" 
                type="date"
                value={formData.expiry_date} 
                onChange={e => setFormData(prev => ({...prev, expiry_date: e.target.value}))} 
                disabled={isUploading}
              />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || !formData.document_title.trim() || files.length === 0}>
            {isUploading ? (
              <Loader2 className="animate-spin w-4 h-4 ml-2" />
            ) : (
              <Upload className="w-4 h-4 ml-2" />
            )}
            {isUploading ? 'جاري الرفع...' : 'رفع'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}