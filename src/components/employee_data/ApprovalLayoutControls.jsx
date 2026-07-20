import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApprovalLayoutControls({ value, onChange }) {
  const update = (key, nextValue) => onChange({ ...value, [key]: Number(nextValue) });
  const fields = [
    ['signatureWidth', 'عرض التوقيع', 140], ['signatureOffsetX', 'إزاحة التوقيع أفقياً', 0], ['signatureOffsetY', 'إزاحة التوقيع عمودياً', 0],
    ['stampWidth', 'حجم الختم', 100], ['stampOffsetX', 'إزاحة الختم أفقياً', 0], ['stampOffsetY', 'إزاحة الختم عمودياً', 0],
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {fields.map(([key, label, fallback]) => (
        <div key={key} className="flex items-center gap-2">
          <Label className="text-xs flex-1">{label} (بكسل)</Label>
          <Input type="number" min={key.includes('Width') ? 40 : -150} max={key.includes('Width') ? 300 : 150} value={value[key] ?? fallback} onChange={(e) => update(key, e.target.value)} className="w-20 h-8" />
        </div>
      ))}
    </div>
  );
}