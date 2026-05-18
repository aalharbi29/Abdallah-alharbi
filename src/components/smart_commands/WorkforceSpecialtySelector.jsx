import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Stethoscope, HeartPulse, FlaskConical, Pill, Radiation, Briefcase, Sparkles, X, Activity } from 'lucide-react';

export const WORKFORCE_SPECIALTIES = [
  { key: 'doctors', label: 'الأطباء', icon: Stethoscope, keywords: ['طبيب', 'طبيبة', 'استشاري', 'أخصائي طب', 'اخصائي طب', 'طب عام', 'أسنان', 'اسنان'] },
  { key: 'nursing', label: 'التمريض', icon: HeartPulse, keywords: ['تمريض', 'ممرض', 'ممرضة', 'فني تمريض', 'اخصائي تمريض', 'أخصائي تمريض'] },
  { key: 'pharmacy', label: 'الصيدلة', icon: Pill, keywords: ['صيدلي', 'صيدلية', 'صيدلة', 'فني صيدلة'] },
  { key: 'laboratory', label: 'المختبر', icon: FlaskConical, keywords: ['مختبر', 'مختبرات', 'أخصائي مختبر', 'اخصائي مختبر', 'فني مختبر'] },
  { key: 'radiology', label: 'الأشعة', icon: Radiation, keywords: ['أشعة', 'اشعة', 'أخصائي أشعة', 'فني أشعة'] },
  { key: 'publicHealth', label: 'الصحة العامة والوبائيات', icon: Activity, keywords: ['صحة عامة', 'الصحة العامة', 'وبائيات', 'وبائي', 'وبائية', 'مراقب صحي', 'مكافحة العدوى', 'عدوى', 'فني وبائيات'] },
  { key: 'administrative', label: 'الإداريين', icon: Briefcase, keywords: ['إداري', 'اداري', 'كاتب', 'مساعد إداري', 'سكرتير'] },
];

export const workforceDefaultFields = ['full_name_arabic', 'رقم_الموظف', 'المركز_الصحي', 'position', 'department', 'phone', 'qualification'];

const normalizeArabic = (value = '') => String(value)
  .replace(/[أإآ]/g, 'ا')
  .replace(/[ى]/g, 'ي')
  .replace(/[ة]/g, 'ه')
  .replace(/[\u064B-\u065F\u0670ـ]/g, '')
  .toLowerCase()
  .trim();

export function matchesWorkforceSpecialty(employee, selectedKeys) {
  if (!selectedKeys?.length) return true;
  const text = normalizeArabic([
    employee.position,
    employee.department,
    employee.scfhs_classification,
    employee.job_category,
    employee.job_category_type,
    employee.qualification,
    ...(employee.assigned_tasks || []),
    ...(employee.special_roles || []),
  ].filter(Boolean).join(' '));

  return selectedKeys.some((key) => {
    const specialty = WORKFORCE_SPECIALTIES.find((item) => item.key === key);
    return specialty?.keywords.some((keyword) => text.includes(normalizeArabic(keyword)));
  });
}

export function detectWorkforceSpecialtiesFromText(text) {
  if (!text?.trim()) return [];
  const normalized = normalizeArabic(text);
  return WORKFORCE_SPECIALTIES
    .filter((specialty) => specialty.keywords.some((keyword) => normalized.includes(normalizeArabic(keyword))) || normalized.includes(normalizeArabic(specialty.label)))
    .map((specialty) => specialty.key);
}

export default function WorkforceSpecialtySelector({ selectedSpecialties, onChange, onApply }) {
  const toggle = (key) => {
    onChange(
      selectedSpecialties.includes(key)
        ? selectedSpecialties.filter((item) => item !== key)
        : [...selectedSpecialties, key]
    );
  };

  return (
    <div className="rounded-xl border border-cyan-200 bg-gradient-to-l from-cyan-50 to-blue-50 p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-5 w-5 text-cyan-700" />
          <div>
            <p className="text-sm font-bold text-cyan-900">إضافة قوى عاملة حسب التخصص</p>
            <p className="text-xs text-slate-600">حدد تخصصاً مثل الأطباء أو التمريض، أو اكتبه في مربع الذكاء الاصطناعي.</p>
          </div>
        </div>
        <Button type="button" size="sm" onClick={onApply} className="bg-cyan-700 hover:bg-cyan-800">
          <Sparkles className="ml-1 h-4 w-4" /> تطبيق مباشر
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {WORKFORCE_SPECIALTIES.map((specialty) => {
          const Icon = specialty.icon;
          const active = selectedSpecialties.includes(specialty.key);
          return (
            <Badge
              key={specialty.key}
              variant={active ? 'default' : 'outline'}
              onClick={() => toggle(specialty.key)}
              className={`cursor-pointer px-3 py-1.5 ${active ? 'bg-cyan-700 hover:bg-cyan-800' : 'bg-white hover:bg-cyan-100 border-cyan-200 text-cyan-900'}`}
            >
              <Icon className="ml-1 h-3.5 w-3.5" />
              {specialty.label}
              {active && <X className="mr-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}