// 🎛️ Hook لإدارة تفضيل تفعيل الخلفيات البصرية لتجمع المدينة المنورة الصحي
// يحفظ التفضيل في localStorage حسب المفتاح (لكل مكون مفتاحه الخاص).
import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'mhc_brand_bg_';

export function useBrandBackground(key, defaultEnabled = true) {
  const storageKey = STORAGE_PREFIX + key;

  const [enabled, setEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === null) return defaultEnabled;
      return stored === 'true';
    } catch {
      return defaultEnabled;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(enabled));
    } catch { /* ignore */ }
  }, [enabled, storageKey]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, setEnabled, toggle };
}

// قراءة مباشرة (للاستخدام خارج React مثل دوال التصدير)
export function getBrandBackgroundPref(key, defaultEnabled = true) {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored === null) return defaultEnabled;
    return stored === 'true';
  } catch {
    return defaultEnabled;
  }
}