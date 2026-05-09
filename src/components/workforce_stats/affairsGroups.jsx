// مجموعات شؤون المراكز — اختصارات سريعة
export const AFFAIRS_GROUPS = {
  HANAKIYAH: {
    label: 'شؤون المراكز بالحناكية',
    centers: [
      'مركز الحناكية',
      'مركز العقدة',
      'مركز النخيل',
      'مركز الشقرة',
      'مركز الشقران',
      'مركز عرجاء',
    ],
  },
  HASSU: {
    label: 'شؤون المراكز بالحسو',
    centers: [
      'مركز الهميج',
      'مركز الحسو',
      'مركز بلغة',
      'مركز الماوية',
      'مركز هدبان',
      'مركز بطحي',
      'مركز طلال',
      'مركز صخيبرة',
    ],
  },
};

// تطابق "ذكي" يأخذ بالاعتبار اختلاف الكتابة (مع/بدون كلمة "مركز"، الهمزات...)
const norm = (s) => String(s || '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي')
  .replace(/^مركز\s+/, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export const matchAffairsGroup = (allCentersList, groupKey) => {
  const targets = (AFFAIRS_GROUPS[groupKey]?.centers || []).map(norm);
  return allCentersList.filter((c) => {
    const n = norm(c);
    return targets.some((t) => n === t || n.includes(t) || t.includes(n));
  });
};