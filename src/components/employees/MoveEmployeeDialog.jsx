import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SmartDateInput from '@/components/ui/smart-date-input';
import { Loader2, Save, X, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'assigned', label: 'مكلف خارجياً', description: 'تكليف الموظف للعمل خارج مركزه الأصلي', color: 'amber' },
  { value: 'retired', label: 'متقاعد', description: 'أرشفة الموظف كمتقاعد', color: 'purple' },
  { value: 'resigned', label: 'مستقيل', description: 'أرشفة الموظف كمستقيل', color: 'blue' },
  { value: 'transferred', label: 'منقول', description: 'نقل الموظف إلى جهة أخرى', color: 'indigo' },
  { value: 'active', label: 'إعادة للنشاط', description: 'إلغاء التكليف الخارجي', color: 'green' },
];

export default function MoveEmployeeDialog({ employee, open, onClose, onSuccess }) {
  const [targetStatus, setTargetStatus] = useState('');
  const [formData, setFormData] = useState({
    archive_date: new Date().toISOString().split('T')[0],
    archive_reason: '',
    new_workplace: '',
    external_assignment_center: '',
    external_assignment_end_date: null,
    external_assignment_indefinite: false,
    external_assignment_reason: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!employee?.id || !targetStatus) {
      toast.warning('يرجى اختيار الحالة المستهدفة');
      return;
    }
    setSaving(true);
    try {
      // إعادة للنشاط: إزالة التكليف الخارجي فقط
      if (targetStatus === 'active') {
        await base44.entities.Employee.update(employee.id, {
          is_externally_assigned: false,
          external_assignment_center: null,
          external_assignment_end_date: null,
          external_assignment_indefinite: false,
          external_assignment_reason: null,
          external_assignment_reason_other: null,
        });
        toast.success('تم إرجاع الموظف للحالة النشطة');
      }
      // تكليف خارجي: تحديث الموظف فقط (يبقى في قائمة الموظفين)
      else if (targetStatus === 'assigned') {
        if (!formData.external_assignment_center) {
          toast.warning('يرجى إدخال الجهة المكلف بها');
          setSaving(false);
          return;
        }
        await base44.entities.Employee.update(employee.id, {
          is_externally_assigned: true,
          external_assignment_center: formData.external_assignment_center,
          external_assignment_end_date: formData.external_assignment_indefinite ? null : formData.external_assignment_end_date,
          external_assignment_indefinite: formData.external_assignment_indefinite,
          external_assignment_reason: formData.external_assignment_reason || 'لتعزيز الكوادر',
        });
        toast.success('تم تسجيل التكليف الخارجي بنجاح');
      }
      // أرشفة: retired / resigned / transferred
      else {
        if (targetStatus === 'transferred' && !formData.new_workplace) {
          toast.warning('يرجى إدخال مكان العمل الجديد');
          setSaving(false);
          return;
        }
        const { id, created_date, updated_date, created_by, ...empData } = employee;
        await base44.entities.ArchivedEmployee.create({
          ...empData,
          original_employee_id: employee.id,
          archive_type: targetStatus,
          archive_date: formData.archive_date,
          archive_reason: formData.archive_reason,
          new_workplace: targetStatus === 'transferred' ? formData.new_workplace : undefined,
          notes: formData.notes,
          archived_by: 'المستخدم الحالي',
        });
        await base44.entities.Employee.delete(employee.id);
        toast.success('تم نقل الموظف إلى الأرشيف بنجاح');
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(`فشل النقل: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedOption = STATUS_OPTIONS.find((o) => o.value === targetStatus);
  const isArchive = ['retired', 'resigned', 'transferred'].includes(targetStatus);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            نقل الموظف: {employee?.full_name_arabic}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>الحالة المستهدفة *</Label>
            <Select value={targetStatus} onValueChange={setTargetStatus}>
              <SelectTrigger><SelectValue placeholder="اختر الحالة الجديدة..." /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <div>
                      <div className="font-medium">{o.label}</div>
                      <div className="text-xs text-slate-500">{o.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isArchive && (
            <>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>سيتم نقل الموظف إلى الأرشيف وإزالته من قائمة الموظفين النشطين.</span>
              </div>
              <SmartDateInput
                label="تاريخ النقل"
                value={formData.archive_date}
                onChange={(v) => handleChange('archive_date', v)}
              />
              <div>
                <Label>السبب</Label>
                <Textarea
                  rows={2}
                  value={formData.archive_reason}
                  onChange={(e) => handleChange('archive_reason', e.target.value)}
                  placeholder="اذكر السبب..."
                />
              </div>
              {targetStatus === 'transferred' && (
                <div>
                  <Label>مكان العمل الجديد *</Label>
                  <Input
                    value={formData.new_workplace}
                    onChange={(e) => handleChange('new_workplace', e.target.value)}
                    placeholder="اسم الجهة أو المؤسسة"
                  />
                </div>
              )}
            </>
          )}

          {targetStatus === 'assigned' && (
            <>
              <div>
                <Label>الجهة المكلف بها *</Label>
                <Input
                  value={formData.external_assignment_center}
                  onChange={(e) => handleChange('external_assignment_center', e.target.value)}
                  placeholder="اسم الجهة أو المركز"
                />
              </div>
              <div>
                <Label>سبب التكليف</Label>
                <Select
                  value={formData.external_assignment_reason}
                  onValueChange={(v) => handleChange('external_assignment_reason', v)}
                >
                  <SelectTrigger><SelectValue placeholder="اختر السبب..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="حتى افتتاح مركز">حتى افتتاح مركز</SelectItem>
                    <SelectItem value="لتعزيز الكوادر">لتعزيز الكوادر</SelectItem>
                    <SelectItem value="لسد العجز">لسد العجز</SelectItem>
                    <SelectItem value="بناء على طلب الجهة">بناء على طلب الجهة</SelectItem>
                    <SelectItem value="حتى إشعار آخر">حتى إشعار آخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="indef"
                  checked={formData.external_assignment_indefinite}
                  onChange={(e) => handleChange('external_assignment_indefinite', e.target.checked)}
                />
                <Label htmlFor="indef" className="cursor-pointer">حتى إشعار آخر (بدون تاريخ محدد)</Label>
              </div>
              {!formData.external_assignment_indefinite && (
                <SmartDateInput
                  label="تاريخ نهاية التكليف"
                  value={formData.external_assignment_end_date}
                  onChange={(v) => handleChange('external_assignment_end_date', v)}
                />
              )}
            </>
          )}

          {targetStatus === 'active' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              سيتم إزالة التكليف الخارجي وإرجاع الموظف للحالة النشطة في مركزه الأصلي.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="w-4 h-4 ml-1" /> إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !targetStatus} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
            تأكيد النقل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}