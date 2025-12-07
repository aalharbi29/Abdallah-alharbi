import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, X } from "lucide-react";

export default function FilePreviewDialog({ 
  file, 
  open, 
  onOpenChange, 
  onConfirm,
  category,
  categoryLabel 
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState(null);

  React.useEffect(() => {
    if (file) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setDescription(`نموذج من فئة ${categoryLabel}`);
      
      // Create preview URL for the file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, categoryLabel]);

  const handleConfirm = () => {
    onConfirm({ file, title, description });
    onOpenChange(false);
  };

  const isPDF = file?.type === 'application/pdf';
  const isImage = file?.type?.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            معاينة الملف قبل الرفع
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">اسم الملف:</span> {file?.name}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">الحجم:</span> {(file?.size / 1024).toFixed(2)} KB
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">النوع:</span> {file?.type || 'غير محدد'}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">عنوان النموذج:</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان النموذج"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف:</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف النموذج"
                rows={2}
              />
            </div>
          </div>

          {/* File Preview */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium mb-3">معاينة المحتوى:</h3>
            {isPDF ? (
              <iframe
                src={previewUrl}
                className="w-full h-[400px] border rounded"
                title="PDF Preview"
              />
            ) : isImage ? (
              <img 
                src={previewUrl} 
                alt="File preview"
                className="max-w-full h-auto max-h-[400px] mx-auto rounded"
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                <p>لا يمكن معاينة هذا النوع من الملفات</p>
                <p className="text-sm">سيتم رفعه مباشرة</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            <Upload className="w-4 h-4 ml-2" />
            تأكيد الرفع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}