import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadFile } from "@/integrations/Core";
import { Loader2, RefreshCw } from "lucide-react";

// دالة helper لتحميل الملف بالاسم الأصلي (غير المنظف)
export async function downloadFileWithName(fileUrl, fileName) {
  try {
    // استخدام الاسم الأصلي مباشرة بدون تنظيف
    const originalFileName = fileName || 'file';
    
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFileName; // استخدام الاسم الأصلي
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    // في حالة الفشل، استخدم الطريقة التقليدية
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function InlineFileReplacer({
  entitySDK,
  recordId,
  fileUrlField = "file_url",
  fileNameField = "file_name",
  buttonText = "استبدال الملف",
  onReplaced,
  variant = "outline",
  size = "sm",
  className = "gap-2",
  iconOnly = false
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const sanitizeFilename = (filename) => {
    if (!filename) return `file_${Date.now()}.dat`;
    
    const extension = filename.split(".").pop() || 'dat';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // إزالة جميع الأحرف غير الإنجليزية والأرقام والشرطات
    let safeName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0600-\u06FF]/g, '') // إزالة الأحرف العربية
      .replace(/[\u0750-\u077F]/g, '')
      .replace(/[\u08A0-\u08FF]/g, '')
      .replace(/[\uFB50-\uFDFF]/g, '')
      .replace(/[\uFE70-\uFEFF]/g, '')
      .replace(/[^\w\s-]/g, '') // إزالة الأحرف غير الأبجدية الرقمية أو المسافات أو الشرطات
      .replace(/\s+/g, '_') // استبدال المسافات المتعددة بشرطة سفلية واحدة
      .replace(/_{2,}/g, '_') // إزالة الشرطات السفلية المتكررة
      .replace(/^_+|_+$/g, '') // إزالة الشرطات السفلية من البداية والنهاية
      .substring(0, 30); // تقييد الطول

    // إذا كان الاسم لا يزال فارغًا أو قصيرًا جدًا بعد التنظيف
    if (!safeName || safeName.length < 3) {
      safeName = `file_${Date.now()}`;
    }
    
    return `${safeName}.${extension}`;
  };

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const originalFileName = file.name; // حفظ الاسم الأصلي
    
    setLoading(true);
    try {
      // تنظيف الاسم للرفع فقط
      const safe = sanitizeFilename(file.name);
      const renamed = new File([file], safe, { type: file.type, lastModified: file.lastModified });
      
      const res = await UploadFile({ file: renamed });
      
      // حفظ الاسم الأصلي في قاعدة البيانات
      const updatePayload = {
        [fileUrlField]: res.file_url,
        [fileNameField]: originalFileName // استخدام الاسم الأصلي
      };
      
      await entitySDK.update(recordId, updatePayload);
      
      alert('✅ تم استبدال الملف بنجاح!');
      
      if (onReplaced) {
        onReplaced(updatePayload);
      }
    } catch (error) {
      console.error('Error replacing file:', error);
      alert('❌ حدث خطأ أثناء استبدال الملف');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" className="hidden" onChange={onChange} />
      <Button 
        type="button" 
        variant={variant} 
        size={size} 
        onClick={handlePick} 
        disabled={loading} 
        className={className}
        title={iconOnly ? buttonText : undefined}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {!iconOnly ? buttonText : null}
      </Button>
    </>
  );
}