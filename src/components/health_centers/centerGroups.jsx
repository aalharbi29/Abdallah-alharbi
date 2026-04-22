// تعريف مجموعات المراكز الصحية (الشؤون) — مصدر الحقيقة
// كل مجموعة تحتوي على:
//  - id: مُعرّف داخلي
//  - title: الاسم المعروض
//  - shortName: الاسم المختصر
//  - description: وصف قصير
//  - icon: أيقونة lucide
//  - color: تدرج لوني (tailwind classes)
//  - accent: لون مميز للتفاصيل
//  - centers: قائمة أسماء المراكز التابعة (للمطابقة مع اسم_المركز)
//  - specialCards: بطاقات مخصصة إضافية تظهر داخل المجموعة (لا تأتي من قاعدة البيانات)

import { Building2, Landmark, FlaskConical, Package, Briefcase } from "lucide-react";

export const CENTER_GROUPS = [
  {
    id: "hasu",
    title: "شؤون المراكز بالحسو",
    shortName: "الحسو",
    description: "يتبعها 8 مراكز صحية",
    icon: Landmark,
    color: "from-emerald-500 via-teal-500 to-cyan-500",
    accent: "emerald",
    centers: [
      "بطحي",
      "طلال",
      "الماوية",
      "بلغة",
      "الهميج",
      "هدبان",
      "صخيبرة",
      "الحسو",
    ],
    specialCards: [
      {
        id: "hasu-affairs",
        title: "شؤون المراكز بالحسو",
        subtitle: "الإدارة الرئيسية",
        icon: Briefcase,
        color: "from-emerald-600 to-teal-700",
      },
    ],
  },
  {
    id: "hanakiya",
    title: "شؤون المراكز بالحناكية",
    shortName: "الحناكية",
    description: "يتبعها 7 مراكز + خدمات مساندة",
    icon: Landmark,
    color: "from-indigo-500 via-purple-500 to-fuchsia-500",
    accent: "indigo",
    centers: [
      "النخيل",
      "عرجا",
      "الشقران",
      "الشقرة",
      "الحناكية",
      "المحفر",
      "العقدة",
    ],
    specialCards: [
      {
        id: "hanakiya-affairs",
        title: "شؤون المراكز بالحناكية",
        subtitle: "الإدارة الرئيسية",
        icon: Briefcase,
        color: "from-indigo-600 to-purple-700",
      },
      {
        id: "hanakiya-supply",
        title: "التموين الطبي",
        subtitle: "مستودع التموين",
        icon: Package,
        color: "from-amber-500 to-orange-600",
      },
      {
        id: "hanakiya-lab",
        title: "مختبر الحناكية",
        subtitle: "المختبر المرجعي",
        icon: FlaskConical,
        color: "from-rose-500 to-pink-600",
      },
    ],
  },
];

// تطبيع النص للمطابقة (إزالة التشكيل + توحيد الألف والياء/الهاء)
const normalize = (s = "") =>
  String(s)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// الحصول على مجموعة المركز بناءً على اسمه
export const getGroupForCenter = (centerName) => {
  if (!centerName) return null;
  const n = normalize(centerName);
  return (
    CENTER_GROUPS.find((g) =>
      g.centers.some((c) => {
        const nc = normalize(c);
        return n === nc || n.includes(nc) || nc.includes(n);
      })
    ) || null
  );
};

// فلترة مراكز قاعدة البيانات التابعة لمجموعة معينة
export const filterCentersByGroup = (centers, groupId) => {
  if (!Array.isArray(centers)) return [];
  const group = CENTER_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];
  const normalizedGroupCenters = group.centers.map(normalize);
  return centers.filter((c) => {
    if (!c?.اسم_المركز) return false;
    const n = normalize(c.اسم_المركز);
    return normalizedGroupCenters.some((nc) => n === nc || n.includes(nc) || nc.includes(n));
  });
};

// إحصاءات سريعة لكل مجموعة
export const getGroupStats = (centers, employees, groupId) => {
  const groupCenters = filterCentersByGroup(centers, groupId);
  const centerNames = new Set(groupCenters.map((c) => normalize(c.اسم_المركز)));
  const groupEmployees = (employees || []).filter((e) =>
    e?.المركز_الصحي && centerNames.has(normalize(e.المركز_الصحي))
  );
  return {
    centersCount: groupCenters.length,
    employeesCount: groupEmployees.length,
    activeCount: groupCenters.filter((c) => c.حالة_التشغيل === "نشط" || !c.حالة_التشغيل).length,
  };
};