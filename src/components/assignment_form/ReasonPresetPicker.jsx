import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const PRESETS = [
  {
    id: 'water_shouran',
    label: 'إيصال عينات المياه لمختبر الصحة العامة بمركز صحي شوران',
    needsCenter: false,
    build: () => 'إيصال عينات المياه لمختبر الصحة العامة بمركز صحي شوران',
  },
  {
    id: 'water_collect',
    label: 'جلب عينات مياه من مركز صحي (تحديد المركز)',
    needsCenter: true,
    build: (center) => `جلب عينات مياه من مركز صحي ${center || ''}`.trim(),
  },
  {
    id: 'colon_samples',
    label: 'إيصال عينات القولون لمركز الفحوصات الموحد',
    needsCenter: false,
    build: () => 'إيصال عينات القولون لمركز الفحوصات الموحد',
  },
];

export default function ReasonPresetPicker({ healthCenters = [], onAdd }) {
  const [presetId, setPresetId] = useState('');
  const [centerName, setCenterName] = useState('');

  const preset = PRESETS.find(p => p.id === presetId);

  const handleAdd = () => {
    if (!preset) return;
    const text = preset.build(centerName);
    if (!text) return;
    onAdd(text);
    setPresetId('');
    setCenterName('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-600">إضافة سبب جاهز</Label>
      <Select value={presetId} onValueChange={setPresetId}>
        <SelectTrigger className="text-xs h-9">
          <SelectValue placeholder="اختر سبباً جاهزاً..." />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map(p => (
            <SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset?.needsCenter && (
        <Select value={centerName} onValueChange={setCenterName}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="اختر المركز الصحي..." />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {healthCenters.map(c => (
              <SelectItem key={c.id} value={c['اسم_المركز'] || ''} className="text-xs">
                {c['اسم_المركز']}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleAdd}
        disabled={!preset || (preset.needsCenter && !centerName)}
      >
        <Plus className="w-3.5 h-3.5 ml-1" /> إضافة السبب
      </Button>
    </div>
  );
}

// تصدير Label بسيط محلياً لتفادي استيراد إضافي غير ضروري
function Label({ className, children }) {
  return <label className={className}>{children}</label>;
}