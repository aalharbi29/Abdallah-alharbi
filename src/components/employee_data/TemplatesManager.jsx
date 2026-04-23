import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Save, FolderOpen, Trash2, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * مدير نماذج طلب البيانات الافتراضية المتعددة.
 * يعتمد على حقل config_name في ReportConfiguration لتمييز كل نموذج بالاسم.
 *
 * Props:
 *  - buildCurrentTemplate: () => object  (يرجع محتوى النموذج الحالي للحفظ)
 *  - applyTemplate: (templateData) => void (يطبّق نموذجاً محملاً على الواجهة)
 */
export default function TemplatesManager({ buildCurrentTemplate, applyTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTemplatesList = async () => {
    try {
      const all = await base44.entities.ReportConfiguration.list('-updated_date', 100);
      setTemplates(Array.isArray(all) ? all : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTemplatesList();
  }, []);

  const handleSave = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error('الرجاء إدخال اسم للنموذج');
      return;
    }
    setLoading(true);
    try {
      const data = buildCurrentTemplate();
      const payload = { ...data, config_name: name };
      const existing = await base44.entities.ReportConfiguration.filter({ config_name: name });
      if (existing && existing.length > 0) {
        const overwrite = window.confirm(`يوجد نموذج بنفس الاسم "${name}". هل تريد استبداله؟`);
        if (!overwrite) {
          setLoading(false);
          return;
        }
        await base44.entities.ReportConfiguration.update(existing[0].id, payload);
      } else {
        await base44.entities.ReportConfiguration.create(payload);
      }
      toast.success(`تم حفظ النموذج "${name}" بنجاح`);
      setSaveDialogOpen(false);
      setNewName('');
      await loadTemplatesList();
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (template) => {
    try {
      applyTemplate(template);
      toast.success(`تم تحميل النموذج "${template.config_name}"`);
      setLoadDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء التحميل');
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`هل تريد حذف النموذج "${template.config_name}"؟`)) return;
    try {
      await base44.entities.ReportConfiguration.delete(template.id);
      toast.success('تم حذف النموذج');
      await loadTemplatesList();
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Button
          size="sm"
          variant="outline"
          onClick={() => { setNewName(''); setSaveDialogOpen(true); }}
          className="gap-1"
        >
          <Plus className="w-4 h-4" /> حفظ كنموذج جديد
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { loadTemplatesList(); setLoadDialogOpen(true); }}
          className="gap-1"
        >
          <FolderOpen className="w-4 h-4" /> نماذجي المحفوظة
          {templates.length > 0 && (
            <span className="bg-blue-600 text-white rounded-full px-2 text-xs mr-1">{templates.length}</span>
          )}
        </Button>
      </div>

      {/* حوار الحفظ باسم جديد */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" /> حفظ النموذج الحالي
            </DialogTitle>
            <DialogDescription>
              أدخل اسماً مميزاً للنموذج لتتمكن من استدعائه لاحقاً.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>اسم النموذج</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: خطة تغطية الحسو — طبيب"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار قائمة النماذج */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" /> النماذج المحفوظة
            </DialogTitle>
            <DialogDescription>
              اختر نموذجاً لتحميله، أو احذف النماذج غير المطلوبة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {templates.length === 0 && (
              <p className="text-center text-gray-500 py-8">لا توجد نماذج محفوظة بعد</p>
            )}
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-md border transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-sm">{t.config_name || '(بدون اسم)'}</p>
                  <p className="text-xs text-gray-500">
                    آخر تحديث: {t.updated_date ? new Date(t.updated_date).toLocaleString('ar-SA') : '-'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleLoad(t)} className="bg-blue-600 hover:bg-blue-700">
                    تحميل
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(t)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              <X className="w-4 h-4 ml-1" /> إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}