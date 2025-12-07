import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

export default function EditDocumentTitleDialog({ 
  open, 
  onOpenChange, 
  document, 
  entitySDK,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    document_title: document?.document_title || document?.title || document?.report_title || '',
    description: document?.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (document) {
      setFormData({
        document_title: document?.document_title || document?.title || document?.report_title || '',
        description: document?.description || ''
      });
    }
  }, [document]);

  const handleSave = async () => {
    if (!formData.document_title.trim()) {
      alert('يرجى إدخال عنوان المستند');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {};
      
      // تحديد الحقول بناءً على نوع الكيان
      if (document?.document_title !== undefined) {
        updateData.document_title = formData.document_title.trim();
      } else if (document?.title !== undefined) {
        updateData.title = formData.document_title.trim();
      } else if (document?.report_title !== undefined) {
        updateData.report_title = formData.document_title.trim();
      }
      
      if (formData.description !== undefined) {
        updateData.description = formData.description.trim();
      }

      await entitySDK.update(document.id, updateData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
      alert('حدث خطأ أثناء تحديث المستند');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستند</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="document_title">عنوان المستند *</Label>
            <Input
              id="document_title"
              value={formData.document_title}
              onChange={(e) => setFormData(prev => ({ ...prev, document_title: e.target.value }))}
              placeholder="أدخل عنوان المستند"
              maxLength={200}
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="أدخل وصف المستند"
              maxLength={500}
              rows={3}
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}