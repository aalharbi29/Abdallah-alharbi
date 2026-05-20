/**
 * 🎯 نظام تطبيع ومطابقة أسماء المراكز الصحية
 *
 * يقبل أي صيغة لاسم المركز ويربطها بالمركز الصحيح في النظام:
 * - "مركز صحي بطحي" ✅ (الصيغة الكاملة)
 * - "مركز بطحي" ✅ (مختصر)
 * - "بطحي" ✅ (الاسم فقط)
 * - "م.ص بطحي" ✅ (اختصار)
 * - "PHC Batahi" ✅ (إنجليزي)
 * - "Batahi Health Center" ✅ (إنجليزي كامل)
 */

import { normalizeArabic } from "./arabicSearch";

/**
 * يزيل البادئات الشائعة من اسم المركز ليبقى الاسم النواة فقط
 * مثال: "مركز صحي بطحي" → "بطحي"
 *       "Batahi Health Center" → "batahi"
 */
const PREFIXES_AR = [
  'مركز صحي',
  'مركز الصحي',
  'مركز الرعاية الصحية',
  'م ص',
  'م.ص',
  'م/ص',
  'مركز',
  'الـ',
  'ال',
];

const PREFIXES_EN = [
  'primary health care center',
  'primary healthcare center',
  'health care center',
  'healthcare center',
  'health center',
  'phc center',
  'phcc',
  'phc',
  'hc',
];

const SUFFIXES_EN = [
  'health center',
  'healthcare center',
  'health care center',
  'phc',
  'phcc',
  'hc',
];

/**
 * يستخرج "النواة" من اسم المركز (الاسم الجغرافي فقط بدون بادئات/لواحق)
 */
export const extractCenterCore = (rawName) => {
  if (!rawName) return '';
  let s = String(rawName).trim();

  // كشف اللغة (هل يحوي أحرف عربية؟)
  const hasArabic = /[\u0600-\u06FF]/.test(s);

  if (hasArabic) {
    // تطبيع عربي
    s = normalizeArabic(s);
    // إزالة البادئات العربية (مرتبة من الأطول للأقصر)
    const sortedPrefixes = [...PREFIXES_AR].sort((a, b) => b.length - a.length);
    for (const prefix of sortedPrefixes) {
      const np = normalizeArabic(prefix);
      if (s.startsWith(np + ' ')) {
        s = s.slice(np.length + 1).trim();
        break;
      }
      if (s === np) {
        s = '';
        break;
      }
    }
    // إزالة "ال" التعريف من البداية
    if (s.startsWith('ال') && s.length > 3) {
      const stripped = s.slice(2);
      // نتركها للمقارنة الإضافية لاحقاً، لكن نخزن النسختين
      s = stripped;
    }
  } else {
    // تطبيع إنجليزي
    s = s.toLowerCase().replace(/[._\-/]/g, ' ').replace(/\s+/g, ' ').trim();
    // إزالة البادئات الإنجليزية
    const sortedPrefixes = [...PREFIXES_EN].sort((a, b) => b.length - a.length);
    for (const prefix of sortedPrefixes) {
      if (s.startsWith(prefix + ' ')) {
        s = s.slice(prefix.length + 1).trim();
        break;
      }
    }
    // إزالة اللواحق الإنجليزية
    const sortedSuffixes = [...SUFFIXES_EN].sort((a, b) => b.length - a.length);
    for (const suffix of sortedSuffixes) {
      if (s.endsWith(' ' + suffix)) {
        s = s.slice(0, -(suffix.length + 1)).trim();
        break;
      }
    }
  }

  return s.trim();
};

/**
 * يبني فهرس البحث لمراكز النظام:
 * { coreKey: { center, allKeys: Set<string> } }
 */
export const buildCenterIndex = (centers) => {
  const index = new Map();

  for (const center of centers || []) {
    const keys = new Set();

    // الاسم العربي الرسمي + النواة
    if (center['اسم_المركز']) {
      keys.add(normalizeArabic(center['اسم_المركز']));
      const core = extractCenterCore(center['اسم_المركز']);
      if (core) keys.add(core);
      // نسخة بدون "ال" التعريف
      if (core.startsWith('ال')) keys.add(core.slice(2));
    }

    // الاسم الإنجليزي + النواة
    if (center['اسم_المركز_انجليزي']) {
      keys.add(String(center['اسم_المركز_انجليزي']).toLowerCase().trim());
      const coreEn = extractCenterCore(center['اسم_المركز_انجليزي']);
      if (coreEn) keys.add(coreEn);
    }

    // اسم الموقع (مثل "بطحي" مباشرة)
    if (center['الموقع']) {
      const locCore = extractCenterCore(center['الموقع']);
      if (locCore) keys.add(locCore);
      if (locCore.startsWith('ال')) keys.add(locCore.slice(2));
    }

    for (const key of keys) {
      if (key && !index.has(key)) {
        index.set(key, { center, allKeys: keys });
      }
    }
  }

  return index;
};

/**
 * يبحث عن المركز المطابق لاسم مدخل من الموظف
 * يُرجع المركز إذا تطابق، أو null إذا لم يتطابق
 */
export const matchCenter = (inputName, centerIndex) => {
  if (!inputName || !centerIndex) return null;

  // 1. مطابقة كاملة على الاسم الرسمي
  const normalizedFull = normalizeArabic(inputName);
  if (centerIndex.has(normalizedFull)) {
    return centerIndex.get(normalizedFull).center;
  }

  const lowerFull = String(inputName).toLowerCase().trim();
  if (centerIndex.has(lowerFull)) {
    return centerIndex.get(lowerFull).center;
  }

  // 2. مطابقة على النواة
  const core = extractCenterCore(inputName);
  if (core && centerIndex.has(core)) {
    return centerIndex.get(core).center;
  }

  // 3. نواة بدون "ال" التعريف
  if (core.startsWith('ال') && centerIndex.has(core.slice(2))) {
    return centerIndex.get(core.slice(2)).center;
  }

  // 4. تطابق احتواء جزئي (احتياطي - لا يستخدم إلا للنواة الطويلة)
  if (core && core.length >= 3) {
    for (const [key, value] of centerIndex.entries()) {
      if (key.length >= 3 && (key.includes(core) || core.includes(key))) {
        return value.center;
      }
    }
  }

  return null;
};

/**
 * يُرجع اسم المركز الرسمي المطبّع لإدخاله في حقل المركز_الصحي
 * يضمن أن كل الموظفين يرتبطون بالاسم الموحد للمركز
 */
export const normalizeCenterNameForEmployee = (inputName, centerIndex) => {
  const matched = matchCenter(inputName, centerIndex);
  if (matched && matched['اسم_المركز']) {
    return matched['اسم_المركز'];
  }
  // إذا لم يتطابق، نُعيد الاسم كما هو (المستخدم سيراجعه)
  return inputName;
};