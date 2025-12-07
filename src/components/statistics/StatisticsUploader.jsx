import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { Statistic } from "@/entities/Statistic";
import { Progress } from "@/components/ui/progress";

export default function StatisticsUploader({ periodType = "gregorian", year, months, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sourceAgency, setSourceAgency] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");

  const monthNumber = useMemo(() => {
    if (!month) return null;
    const idx = months.findIndex((m) => m.key === month);
    return idx >= 0 ? idx + 1 : null;
  }, [month, months]);

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // التحقق من حجم الملفات
    const maxSize = 15 * 1024 * 1024;
    const oversized = selectedFiles.filter(f => f.size > maxSize);
    
    if (oversized.length > 0) {
      alert(`الملفات التالية كبيرة جداً (أكثر من 15 MB):\n${oversized.map(f => f.name).join('\n')}`);
      return;
    }
    
    setFiles(selectedFiles);
  };

  const sanitizeFilename = (filename) => {
    const ext = filename.split(".").pop();
    const base = filename.replace(/\.[^/.]+$/, "");
    const safe = base
      .replace(/[\u0600-\u06FF]/g, '')
      .replace(/[\u0750-\u077F]/g, '')
      .replace(/[\u08A0-\u08FF]/g, '')
      .replace(/[\uFB50-\uFDFF]/g, '')
      .replace(/[\uFE70-\uFEFF]/g, '')
      .replace(/[^\w\s\-_.\u0600-\u06FF]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);
    return `${safe || "file"}.${ext || "dat"}`;
  };

  const uploadFileWithRetry = async (file, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setCurrentStatus(`رفع ${file.name} (محاولة ${attempt}/${maxRetries})`);
        
        const safe = sanitizeFilename(file.name);
        const renamed = new File([file], safe, { type: file.type, lastModified: file.lastModified });
        const res = await UploadFile({ file: renamed });
        
        if (res && res.file_url) {
          return res;
        } else {
          throw new Error('رد غير صالح من الخادم');
        }
      } catch (err) {
        console.error(`المحاولة ${attempt} فشلت:`, err);
        
        if (attempt === maxRetries) {
          if (err.message?.includes('Network Error') || err.message?.includes('timeout')) {
            throw new Error('فشل الاتصال. يرجى المحاولة مرة أخرى.');
          } else {
            throw new Error(`فشل رفع "${file.name}"`);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!month || !title || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const records = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const f = files[i];
        setUploadProgress(Math.round(((i) / totalFiles) * 90));
        
        const res = await uploadFileWithRetry(f);
        
        records.push({
          period_type: periodType,
          year,
          month_number: monthNumber,
          month_name: months.find((m) => m.key === month)?.label || "",
          title: files.length > 1 ? `${title} - ${f.name}` : title,
          description,
          source_agency: sourceAgency || undefined,
          file_url: res.file_url,
          file_name: f.name
        });
      }
      
      if (records.length) {
        setCurrentStatus('جاري حفظ البيانات...');
        setUploadProgress(95);
        await Statistic.bulkCreate(records);
        setUploadProgress(100);
      }
      
      setOpen(false);
      setMonth("");
      setTitle("");
      setDescription("");
      setFiles([]);
      setSourceAgency("");
      setUploadProgress(0);
      setCurrentStatus("");
      onUploaded && onUploaded();
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`فشل رفع الملفات:\n\n${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          رفع إحصائية
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>رفع إحصائية - {periodType === "gregorian" ? "تقويم ميلادي" : "تقويم هجري"} ({year})</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>الشهر</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger><SelectValue placeholder="اختر الشهر" /></SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>العنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: إحصائية شهر سبتمبر" required />
          </div>
          <div>
            <Label>الجهة (اختياري)</Label>
            <Input value={sourceAgency} onChange={(e) => setSourceAgency(e.target.value)} placeholder="اسم الجهة المرسلة" />
          </div>
          <div>
            <Label>الوصف (اختياري)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>الملفات (حتى 15 MB لكل ملف)</Label>
            <Input type="file" multiple onChange={handleFiles} required accept=".pdf,.doc,.docx,.xls,.xlsx" />
            {files.length > 0 && <p className="text-xs text-gray-500 mt-1">تم اختيار {files.length} ملف</p>}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-center text-gray-600">{currentStatus}</p>
              <p className="text-xs text-center text-gray-500">{uploadProgress}%</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isUploading}>إلغاء</Button>
            <Button type="submit" disabled={isUploading || !month || !title || files.length === 0}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              رفع وحفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}