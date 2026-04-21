import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, User, Phone, Mail, MapPin, FileText, Car, Ambulance,
  Calendar, CheckCircle2, XCircle, Users, Briefcase, Info, Shield, ClipboardList
} from 'lucide-react';
import { getFieldLabel } from './entitiesCatalog';
import { resolveFieldLabelGlobal } from './freeReportAI';
import { getNestedValue, toLatinDigits } from './excelExporter';

// تصنيف الحقول إلى أقسام منطقية حسب البادئة/الكلمة المفتاحية
const classifyField = (fieldKey, entity) => {
  const k = fieldKey.toLowerCase();

  if (entity === 'HealthCenter') {
    if (/^سيارة_اسعاف/.test(fieldKey)) return 'ambulance';
    if (/^سيارة_خدمات/.test(fieldKey)) return 'service_car';
    if (/المدير|نائب|المشرف_الفني/.test(fieldKey)) return 'leadership';
    if (/هاتف|جوال|ايميل|فاكس|شريحة|الموقع/.test(fieldKey)) return 'contact';
    if (/ايجار|مؤجر|عقد|قيمة/.test(fieldKey)) return 'rental';
    if (/سباهي|اعتماد|معتمد|نائي|بدل/.test(fieldKey)) return 'accreditation';
    if (/ساعات|الخدمات|عدد_الموظفين|تقسيم/.test(fieldKey)) return 'operations';
    return 'main';
  }

  if (entity === 'Employee') {
    if (/phone|email|جوال|ايميل|بريد/.test(k)) return 'contact';
    if (/contract|hire|start_work|عقد|تعيين|مباشرة/.test(k)) return 'employment';
    if (/rank|level|grade|qualification|scfhs|category|مرتب|مستوى|مؤهل|ملاك/.test(k)) return 'qualification';
    if (/role|task|مهام|ادوار/.test(k)) return 'roles';
    return 'main';
  }

  return 'main';
};

const SECTIONS = {
  main: { title: 'المعلومات الأساسية', icon: Info, color: 'blue' },
  contact: { title: 'معلومات الاتصال', icon: Phone, color: 'emerald' },
  leadership: { title: 'القيادة (المدير / النائب / المشرف الفني)', icon: Users, color: 'indigo' },
  rental: { title: 'بيانات الإيجار والعقد', icon: FileText, color: 'amber' },
  accreditation: { title: 'الاعتمادات والمميزات', icon: Shield, color: 'purple' },
  operations: { title: 'التشغيل والخدمات', icon: Briefcase, color: 'teal' },
  ambulance: { title: 'سيارة الإسعاف', icon: Ambulance, color: 'red' },
  service_car: { title: 'سيارة الخدمات', icon: Car, color: 'slate' },
  employment: { title: 'بيانات التوظيف', icon: Briefcase, color: 'amber' },
  qualification: { title: 'المؤهلات والتصنيفات', icon: ClipboardList, color: 'purple' },
  roles: { title: 'المهام والأدوار', icon: Shield, color: 'indigo' },
};

const COLOR_CLASSES = {
  blue: 'from-blue-50 to-white border-blue-200 text-blue-700',
  emerald: 'from-emerald-50 to-white border-emerald-200 text-emerald-700',
  indigo: 'from-indigo-50 to-white border-indigo-200 text-indigo-700',
  amber: 'from-amber-50 to-white border-amber-200 text-amber-700',
  purple: 'from-purple-50 to-white border-purple-200 text-purple-700',
  teal: 'from-teal-50 to-white border-teal-200 text-teal-700',
  red: 'from-red-50 to-white border-red-200 text-red-700',
  slate: 'from-slate-50 to-white border-slate-200 text-slate-700',
};

const NA = 'غير متاحة';

const formatValue = (val) => {
  if (val === null || val === undefined || val === '') return NA;
  if (typeof val === 'boolean') {
    return val
      ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-4 h-4" /> نعم</span>
      : <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> لا</span>;
  }
  if (Array.isArray(val)) return val.length === 0 ? NA : toLatinDigits(val.join('، '));
  if (typeof val === 'object') return toLatinDigits(JSON.stringify(val));
  if (String(val).trim() === '-') return NA;
  return toLatinDigits(val);
};

export default function SingleRecordDetailCard({ row, fields, entity, title, isFree }) {
  if (!row || !fields || fields.length === 0) return null;

  const labelFor = (f) => (isFree ? resolveFieldLabelGlobal(f) : getFieldLabel(entity, f));

  // تجميع الحقول في أقسام
  const grouped = {};
  fields.forEach((f) => {
    const section = classifyField(f, entity);
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(f);
  });

  // ترتيب الأقسام: main أولاً، ثم البقية بترتيب منطقي
  const sectionOrder = ['main', 'contact', 'leadership', 'operations', 'ambulance', 'service_car', 'rental', 'accreditation', 'employment', 'qualification', 'roles'];
  const orderedSections = sectionOrder.filter((s) => grouped[s]?.length > 0);

  // عنوان بارز (اسم المركز أو الموظف)
  const headerTitle = row['اسم_المركز'] || row['full_name_arabic'] || row['title'] || title || 'تقرير تفصيلي';
  const headerSubtitle = row['seha_id'] ? `رقم صحة: ${toLatinDigits(row['seha_id'])}` : (row['رقم_الموظف'] ? `رقم الموظف: ${toLatinDigits(row['رقم_الموظف'])}` : '');

  return (
    <div className="space-y-4">
      {/* رأس البطاقة */}
      <Card className="overflow-hidden border-2 border-indigo-200 shadow-lg">
        <div className="bg-gradient-to-l from-indigo-600 via-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Building2 className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold">{headerTitle}</h2>
              {headerSubtitle && <p className="text-white/80 mt-1 text-sm">{headerSubtitle}</p>}
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  📋 عرض تفصيلي
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {fields.length} حقل
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {orderedSections.length} قسم
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* الأقسام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orderedSections.map((sectionKey) => {
          const section = SECTIONS[sectionKey];
          const Icon = section.icon;
          const colorClass = COLOR_CLASSES[section.color];
          const sectionFields = grouped[sectionKey];

          return (
            <Card key={sectionKey} className={`bg-gradient-to-br ${colorClass} border-2 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="p-4 border-b border-current/20 bg-white/50 flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <h3 className="font-bold text-base">{section.title}</h3>
                <Badge variant="outline" className="ms-auto bg-white/70 text-xs">
                  {sectionFields.length}
                </Badge>
              </div>
              <CardContent className="p-4 bg-white">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {sectionFields.map((field) => {
                    const rawVal = getNestedValue(row, field);
                    return (
                      <div key={field} className="flex flex-col border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                        <dt className="text-xs text-slate-500 font-semibold mb-0.5">
                          {labelFor(field)}
                        </dt>
                        <dd className="text-sm text-slate-800 font-medium break-words">
                          {formatValue(rawVal)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}