import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, Loader2, Tag, FileUp, AlertCircle, X, Sparkles } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import { ArchivedFile } from '@/entities/ArchivedFile';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const documentTypes = {
  personal: 'مستندات شخصية',
  official: 'مستندات رسمية',
  certificate: 'شهادات ومؤهلات',
  contract: 'عقود وتكليفات',
  evaluation: 'تقييمات أداء',
  circulars: 'تعاميم', // Added: Circulars category
  policy_procedure_forms: 'نماذج سياسات وإجراءات', // Added: Policy and Procedure Forms
  other: 'أخرى'
};

export default function UploadArchiveForm({ category, subCategory = '', onUploadFinish }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setDescription('');
    setTags('');
    setError('');
    setUploadProgress(0);
    setCurrentFile('');
  };

  const sanitizeFilename = (filename) => {
    if (!filename) return `file_${Date.now()}.dat`;
    
    const extension = filename.split('.').pop() || 'dat';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // إزالة جميع الأحرف غير الإنجليزية والأرقام والشرطات
    let safeName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0600-\u06FF]/g, '') // إزالة الأحرف العربية
      .replace(/[\u0750-\u077F]/g, '') // إزالة الأحرف العربية الإضافية
      .replace(/[\u08A0-\u08FF]/g, '') // إزالة الأحرف العربية الممتدة
      .replace(/[\uFB50-\uFDFF]/g, '') // إزالة الأشكال العربية التقديمية
      .replace(/[\uFE70-\uFEFF]/g, '') // إزالة الأشكال العربية نصف العرض
      .replace(/[^\w\s-]/g, '')        // إزالة جميع الرموز الخاصة
      .replace(/\s+/g, '_')            // استبدال المسافات بـ _
      .replace(/_{2,}/g, '_')          // إزالة الشرطات المتكررة
      .replace(/^_+|_+$/g, '')         // إزالة الشرطات من البداية والنهاية
      .substring(0, 30);               // تحديد الطول
    
    // إذا كان الاسم فارغاً بعد التنظيف، استخدم اسم افتراضي
    if (!safeName || safeName.length < 3) {
      safeName = `file_${Date.now()}`;
    }
    
    return `${safeName}.${extension}`;
  };

  const validateFile = (file) => {
    // تقليل الحد الأقصى إلى 15MB لتجنب timeout
    const maxSize = 15 * 1024 * 1024;
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
      return `الملف "${file.name}" كبير جداً. الحد الأقصى 15 ميجا بايت لتجنب مشاكل الرفع.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `نوع الملف "${file.name}" غير مدعوم.`;
    }

    // تحذير إذا كان اسم الملف يحتوي على أحرف عربية
    if (/[\u0600-\u06FF]/.test(file.name)) {
      console.warn('⚠️ الملف يحتوي على أحرف عربية في الاسم، سيتم تحويلها لأحرف إنجليزية');
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
    if (fileArray.length > 0) {
      // استخراج عنوان من اسم الملف (تنظيف الأحرف العربية)
      const cleanTitle = fileArray[0].name
        .replace(/\.[^/.]+$/, '')
        .replace(/[\u0600-\u06FF]/g, '')
        .replace(/[^\w\s-]/g, ' ')
        .trim();
      
      setTitle(cleanTitle || 'مستند جديد');
      setIsOpen(true);
    }
    setError('');
  }, []);

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

  const uploadFileWithRetry = async (file, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setCurrentFile(`جاري رفع: ${file.name} (محاولة ${attempt}/${maxRetries})`);
        
        const safeFileName = sanitizeFilename(file.name);
        console.log(`🔄 رفع الملف: ${file.name} → ${safeFileName}`);
        
        // إنشاء ملف جديد بالاسم الآمن
        const fileToUpload = new File([file], safeFileName, { 
          type: file.type,
          lastModified: file.lastModified 
        });

        const uploadResult = await UploadFile({ file: fileToUpload });
        
        if (uploadResult && uploadResult.file_url) {
          console.log(`✅ تم رفع الملف بنجاح: ${safeFileName}`);
          return uploadResult;
        } else {
          throw new Error('رد غير صالح من الخادم');
        }
      } catch (err) {
        console.error(`❌ المحاولة ${attempt} فشلت:`, err);
        
        if (attempt === maxRetries) {
          // في المحاولة الأخيرة، تحديد نوع الخطأ
          if (err.message?.includes('DatabaseTimeout') || err.message?.includes('544')) {
            throw new Error(`انتهت مهلة الاتصال. الملف "${file.name}" قد يكون كبيراً جداً. جرب تقليل الحجم.`);
          } else if (err.message?.includes('500')) {
            throw new Error(`خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.`);
          } else if (err.message?.includes('413')) {
            throw new Error(`الملف كبير جداً. يرجى تقليل حجم "${file.name}".`);
          } else {
            throw new Error(`فشل رفع "${file.name}": ${err.message || 'خطأ غير معروف'}`);
          }
        }
        
        // تأخير بين المحاولات (1.5 ثانية ثم 3 ثواني)
        const delay = 1500 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !title.trim()) {
      setError('يرجى إدخال عنوان المستند والتأكد من وجود ملفات.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const groupId = Date.now().toString();
      const recordsToCreate = [];
      const totalFiles = files.length;
      let successCount = 0;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i) / totalFiles) * 90));

        try {
          const uploadResult = await uploadFileWithRetry(file);
          
          recordsToCreate.push({
            title: files.length > 1 ? `${title.trim()} - ${file.name}` : title.trim(),
            description: description.trim(),
            category,
            sub_category: subCategory || '',
            group_id: files.length > 1 ? groupId : '',
            file_url: uploadResult.file_url,
            file_name: file.name,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          });
          
          successCount++;
        } catch (fileError) {
          console.error(`فشل رفع الملف ${file.name}:`, fileError);
          
          // عرض الخطأ للمستخدم وسؤاله
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
        setCurrentFile('جاري حفظ البيانات في قاعدة البيانات...');
        setUploadProgress(95);
        
        await ArchivedFile.bulkCreate(recordsToCreate);
        setUploadProgress(100);
        
        onUploadFinish();
        setIsOpen(false);
        resetForm();
        
        // إظهار رسالة نجاح
        if (successCount < totalFiles) {
          alert(`✅ تم رفع ${successCount} من أصل ${totalFiles} ملفات بنجاح.\n\nالملفات الفاشلة: ${totalFiles - successCount}`);
        } else {
          alert(`✅ تم رفع جميع الملفات بنجاح! (${successCount} ملف)`);
        }
      } else {
        throw new Error('فشل رفع جميع الملفات. يرجى المحاولة مرة أخرى.');
      }
      
    } catch (err) {
      console.error('❌ خطأ في عملية الرفع:', err);
      setError(`حدث خطأ: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsUploading(false);
      setCurrentFile('');
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEvents}
        onDragLeave={handleDragEvents}
        onDragOver={handleDragEvents}
        className={`relative block w-full border-2 border-dashed rounded-lg p-8 text-center my-4 transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
        <span className="mt-2 block text-sm font-medium text-gray-900">
          اسحب وأفلت الملفات هنا، أو
        </span>
        <label htmlFor={`file-upload-${category}`} className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
          <span>تصفح الملفات</span>
          <input 
            id={`file-upload-${category}`} 
            name="file-upload" 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
            className="sr-only" 
            onChange={(e) => handleFileSelect(e.target.files)} 
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          ملفات مدعومة: PDF، Word، Excel، صور (حتى 15 ميجا بايت)
        </p>
        <p className="text-xs text-indigo-600 mt-1 font-medium">
          💡 يمكنك رفع ملفات متعددة دفعة واحدة
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => { 
        if (!isUploading) {
          setIsOpen(open); 
          if (!open) resetForm(); 
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              تسمية ورفع الملفات
              {!isUploading && (
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📁 سيتم رفع <strong>{files.length}</strong> ملف كمجموعة واحدة
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ⚠️ ملاحظة: سيتم تحويل أسماء الملفات العربية إلى أحرف إنجليزية تلقائياً
              </p>
            </div>

            {/* Files Preview */}
            <div className="space-y-2">
              <Label>الملفات المختارة ({files.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2 bg-gray-50">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                    <span className="truncate flex-1">{file.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                      {!isUploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>جاري الرفع...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                {currentFile && (
                  <p className="text-xs text-gray-500">{currentFile}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="title">عنوان المجموعة *</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                disabled={isUploading}
                maxLength={100}
                placeholder="مثال: حصر أجهزة المختبر"
              />
              {files.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  سيتم إضافة اسم كل ملف إلى العنوان تلقائياً
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">الوصف (يساعد في البحث)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                disabled={isUploading}
                maxLength={500}
                placeholder="وصف تفصيلي للملفات..."
              />
            </div>
            
            <div>
              <Label htmlFor="tags">كلمات مفتاحية (مفصولة بفاصلة ,)</Label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  id="tags" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  className="pr-10" 
                  placeholder="مثال: مختبر, الحناكية, 2024" 
                  disabled={isUploading}
                  maxLength={200}
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isUploading || !title.trim() || files.length === 0}>
                {isUploading ? (
                  <Loader2 className="animate-spin w-4 h-4 ml-2" />
                ) : (
                  <Upload className="w-4 h-4 ml-2" />
                )}
                {isUploading ? 'جاري الرفع...' : `رفع ${files.length} ملف`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}