import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Plus, Trash2, UploadCloud, ShieldCheck } from 'lucide-react';

export default function FillSafetyEvaluationForm() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    health_center: '',
    report_date: new Date().toISOString().slice(0,10),
    prepared_by: '',
    signature: '',
    notes: '',
    items: [
      { criterion: 'طفايات الحريق', status: 'available', notes: '', proof_images: [] },
      { criterion: 'مخارج الطوارئ', status: 'available', notes: '', proof_images: [] },
      { criterion: 'إنذار وكشف الحريق', status: 'available', notes: '', proof_images: [] },
    ],
  });

  const updateItem = (idx, patch) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, ...patch } : it)
    }));
  };

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { criterion: '', status: 'available', notes: '', proof_images: [] }] }));
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const handleUpload = async (idx, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const uploaded = [];
    for (const f of files) {
      const res = await base44.integrations.Core.UploadFile({ file: f });
      uploaded.push(res.file_url);
    }
    updateItem(idx, { proof_images: [...(form.items[idx].proof_images || []), ...uploaded] });
  };

  const handleSubmit = async () => {
    setSaving(true);
    await base44.entities.SafetyEvaluation.create(form);
    setSaving(false);
    alert('تم حفظ التقييم بنجاح');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">تقييم الأمن والسلامة</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            يرجى إرفاق الصور التوضيحية الخاصة بكل بند من بنود التقييم لدعم النتائج وتحسين دقة التقييم.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات أساسية</CardTitle>
            <CardDescription>أدخل معلومات المركز ومعد التقرير</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">اسم المركز الصحي</label>
              <Input value={form.health_center} onChange={e => setForm({ ...form, health_center: e.target.value })} placeholder="مثال: مركز صحي النزهة" />
            </div>
            <div>
              <label className="text-sm text-gray-600">تاريخ التقرير</label>
              <Input type="date" value={form.report_date} onChange={e => setForm({ ...form, report_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">معد التقرير</label>
              <Input value={form.prepared_by} onChange={e => setForm({ ...form, prepared_by: e.target.value })} placeholder="الاسم الثلاثي" />
            </div>
            <div>
              <label className="text-sm text-gray-600">التوقيع</label>
              <Input value={form.signature} onChange={e => setForm({ ...form, signature: e.target.value })} placeholder="التوقيع/الاسم المختصر" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">ملاحظات عامة</label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="ملاحظات عامة حول السلامة..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>بنود التقييم</CardTitle>
            <CardDescription>أضف البند، اختر الحالة، وارفع إثباتات بالصور</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.items.map((item, idx) => (
              <div key={idx} className="p-3 md:p-4 rounded-xl border bg-white/70">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  <div className="md:col-span-5">
                    <label className="text-sm text-gray-600">اسم البند</label>
                    <Input value={item.criterion} onChange={e => updateItem(idx, { criterion: e.target.value })} placeholder="مثال: مخارج الطوارئ" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-600">الحالة</label>
                    <Select value={item.status} onValueChange={(v) => updateItem(idx, { status: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">متوفر</SelectItem>
                        <SelectItem value="partial">جزئي</SelectItem>
                        <SelectItem value="not_available">غير متوفر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 flex gap-2 pt-6 md:pt-0">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById(`proof-${idx}`)?.click()} className="gap-2">
                      <UploadCloud className="w-4 h-4" /> رفع إثباتات
                    </Button>
                    <input id={`proof-${idx}`} type="file" multiple className="hidden" onChange={(e) => handleUpload(idx, e.target.files)} />
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeItem(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="md:col-span-12">
                    <label className="text-sm text-gray-600">ملاحظات</label>
                    <Textarea rows={2} value={item.notes} onChange={e => updateItem(idx, { notes: e.target.value })} placeholder="تفاصيل إضافية..." />
                  </div>
                  {item.proof_images?.length > 0 && (
                    <div className="md:col-span-12">
                      <div className="flex flex-wrap gap-2">
                        {item.proof_images.map((url, i) => (
                          <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-50">
                            <img src={url} alt="proof" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button variant="secondary" className="gap-2" onClick={addItem}><Plus className="w-4 h-4" /> إضافة بند</Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" onClick={() => window.history.back()}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving ? '...جارٍ الحفظ' : 'حفظ التقييم'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          هذا النموذج مستوحى من: تقرير عن مدى توفر أنظمة ومتطلبات السلامة بالمراكز الصحية
        </div>
      </div>
    </div>
  );
}