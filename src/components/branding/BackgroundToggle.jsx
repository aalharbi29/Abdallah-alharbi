// 🎚️ زر تبديل الخلفية البصرية الرسمية لتجمع المدينة المنورة الصحي
// يتيح للمستخدم تفعيل/تعطيل الخلفية البانورامية في كل مكون يستخدمه.
import React from 'react';
import { Image as ImageIcon, ImageOff } from 'lucide-react';
import { useBrandBackground } from './useBrandBackground';

export default function BackgroundToggle({ storageKey, defaultEnabled = true, size = 'sm', className = '' }) {
  const { enabled, toggle } = useBrandBackground(storageKey, defaultEnabled);
  const Icon = enabled ? ImageIcon : ImageOff;
  const label = enabled ? 'إخفاء الخلفية المعتمدة' : 'إظهار الخلفية المعتمدة';

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
          ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{enabled ? 'الخلفية: مفعّلة' : 'الخلفية: متوقفة'}</span>
    </button>
  );
}