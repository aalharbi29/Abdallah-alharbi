// 💧 زر تبديل العلامة المائية الرسمية (نجمة تجمع المدينة المنورة الصحي)
// تظهر خلف التقارير والخطابات والجداول. مفتاح موحّد: 'watermark'.
import React from 'react';
import { Droplet, EyeOff } from 'lucide-react';
import { useBrandBackground } from './useBrandBackground';

export default function WatermarkToggle({ size = 'sm', className = '', storageKey = 'watermark', defaultEnabled = true }) {
  const { enabled, toggle } = useBrandBackground(storageKey, defaultEnabled);
  const Icon = enabled ? Droplet : EyeOff;
  const label = enabled ? 'إخفاء العلامة المائية' : 'إظهار العلامة المائية';

  const sizeClasses = size === 'xs'
    ? 'h-7 px-2 text-[11px] gap-1'
    : 'h-8 px-3 text-xs gap-1.5';

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      className={`inline-flex items-center rounded-md border transition-colors ${sizeClasses} ${
        enabled
          ? 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100'
          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{enabled ? 'العلامة المائية: مفعّلة' : 'العلامة المائية: متوقفة'}</span>
    </button>
  );
}