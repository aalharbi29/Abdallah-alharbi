// وضع التقرير الحر: يسمح للذكاء الاصطناعي بتحليل الطلب النصي
// واختيار الكيانات والحقول المناسبة من كامل النظام تلقائياً،
// ثم جلب البيانات ودمجها وإرجاع نتيجة جاهزة للعرض.

import { base44 } from '@/api/base44Client';
import { ENTITIES_CATALOG, getEntityByValue } from './entitiesCatalog';
import { getNestedValue } from './excelExporter';
import { getCombinedRolesText } from '@/components/utils/combinedRoles';

// بناء خريطة شاملة لكل الكيانات والحقول لتزويد AI بها
const buildFullSchemaContext = () => {
  return ENTITIES_CATALOG.map((ent) => {
    const fields = ent.fields.map((f) => `    • ${f.key} (${f.label})`).join('\n');
    return `▪ ${ent.value} — ${ent.label}:\n${fields}`;
  }).join('\n\n');
};

// اختيار الحقل المناسب لدمج بيانات المركز
const CENTER_KEY_PER_ENTITY = {
  Employee: 'المركز_الصحي',
  HealthCenter: 'اسم_المركز',
  MedicalEquipment: 'health_center_name',
  EquipmentRequest: 'health_center_name',
  DeficiencyReport: 'health_center',
  Leave: 'health_center',
  Assignment: 'assigned_to_health_center',
  CenterDocument: 'center_name',
  ArchivedEmployee: 'المركز_الصحي',
};

const normalizeArabic = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// اطلب من AI تحليل النص وإرجاع خطة تقرير
export async function planFreeReport(userPrompt) {
  const schemaContext = buildFullSchemaContext();
  const aiPrompt = `أنت مساعد خبير في بناء التقارير من نظام إدارة صحي بالعربية.
لديك الوصول إلى هذه الكيانات والحقول:

${schemaContext}

الطلب من المستخدم: "${userPrompt}"

حلّل الطلب بدقة واختر:
1. الكيان الأساسي الأنسب.
2. كيانات ثانوية (إن لزم الدمج).
3. قائمة الحقول الأكثر صلة (من كل الكيانات، استخدم مفاتيح الحقول كما هي).
4. معايير تصفية (إن وجدت) — في صيغة شروط بسيطة.
5. عنوان تقرير عربي احترافي.

أرجع JSON فقط بهذا الشكل:
{
  "primary_entity": "اسم الكيان الأساسي",
  "secondary_entities": ["كيان ثانوي 1", "كيان ثانوي 2"],
  "fields": ["حقل1", "حقل2", ...],
  "filters": [
    { "field": "اسم_الحقل", "operator": "equals|contains|not_equals|gt|lt|exists", "value": "القيمة" }
  ],
  "title": "عنوان التقرير",
  "notes": "ملاحظات قصيرة عن المنطق المتبع"
}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: aiPrompt,
    response_json_schema: {
      type: 'object',
      properties: {
        primary_entity: { type: 'string' },
        secondary_entities: { type: 'array', items: { type: 'string' } },
        fields: { type: 'array', items: { type: 'string' } },
        filters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              operator: { type: 'string' },
              value: {}
            }
          }
        },
        title: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['primary_entity', 'fields', 'title'],
    },
  });

  return typeof response === 'string' ? JSON.parse(response) : response;
}

// تطبيق فلاتر AI على الصفوف
const applyAIFilters = (rows, filters) => {
  if (!filters || filters.length === 0) return rows;
  return rows.filter((row) => {
    return filters.every((f) => {
      const val = getNestedValue(row, f.field);
      const target = f.value;
      const op = (f.operator || 'equals').toLowerCase();
      if (op === 'exists') return val !== null && val !== undefined && val !== '';
      if (val === null || val === undefined) return false;
      const sv = String(val).toLowerCase();
      const st = String(target ?? '').toLowerCase();
      switch (op) {
        case 'equals': return sv === st;
        case 'not_equals': return sv !== st;
        case 'contains': return sv.includes(st);
        case 'not_contains': return !sv.includes(st);
        case 'gt': return Number(val) > Number(target);
        case 'gte': return Number(val) >= Number(target);
        case 'lt': return Number(val) < Number(target);
        case 'lte': return Number(val) <= Number(target);
        default: return true;
      }
    });
  });
};

// إثراء صف بحقول من كيانات ثانوية
const enrichRowWithSecondary = (row, primaryEntity, secondaryData, requestedFields) => {
  const enriched = { ...row };

  // ربط المركز
  const centerKey = CENTER_KEY_PER_ENTITY[primaryEntity];
  if (centerKey && secondaryData.HealthCenter && primaryEntity !== 'HealthCenter') {
    const centerName = normalizeArabic(row[centerKey]);
    const matched = secondaryData.HealthCenter.find(
      (c) => normalizeArabic(c['اسم_المركز']) === centerName
    );
    if (matched) {
      // أضف كل الحقول المطلوبة من HealthCenter
      requestedFields.forEach((f) => {
        if (enriched[f] === undefined) {
          const v = getNestedValue(matched, f);
          if (v !== undefined) enriched[f] = v;
        }
      });
    }
  }

  // ربط الموظف (لكيانات HealthCenter مع حقول المدير)
  if (primaryEntity === 'HealthCenter' && secondaryData.Employee) {
    const findEmp = (val) => {
      if (!val) return null;
      return secondaryData.Employee.find(
        (e) => String(e.id) === String(val) ||
               String(e['رقم_الموظف']) === String(val) ||
               String(e['رقم_الهوية']) === String(val)
      );
    };
    const dirEmp = findEmp(row['المدير']);
    const vdirEmp = findEmp(row['نائب_المدير']);
    const supEmp = findEmp(row['المشرف_الفني']);
    if (dirEmp) {
      enriched['المدير'] = `${dirEmp.full_name_arabic}${dirEmp['رقم_الموظف'] ? ` (${dirEmp['رقم_الموظف']})` : ''}`;
      enriched['_director_phone'] = dirEmp.phone;
      enriched['_director_email'] = dirEmp.email;
      enriched['_director_position'] = dirEmp.position;
    }
    if (vdirEmp) enriched['نائب_المدير'] = `${vdirEmp.full_name_arabic}`;
    if (supEmp) enriched['المشرف_الفني'] = `${supEmp.full_name_arabic}`;
  }

  return enriched;
};

// تنفيذ الخطة وإرجاع البيانات
export async function executeFreeReportPlan(plan) {
  const primaryEntity = plan.primary_entity;
  if (!primaryEntity || !base44.entities[primaryEntity]) {
    throw new Error(`الكيان "${primaryEntity}" غير متاح في النظام.`);
  }

  // جلب الكيان الأساسي
  let primaryData = await base44.entities[primaryEntity].filter({});

  // إذا طُلبت الأدوار المُجمَّعة للموظف
  if (primaryEntity === 'Employee' && plan.fields.some((f) => f === '__combined_roles')) {
    try {
      const centers = await base44.entities.HealthCenter.filter({});
      primaryData = primaryData.map((e) => ({ ...e, __combined_roles: getCombinedRolesText(e, centers) }));
    } catch (_) { /* ignore */ }
  }

  // جلب الكيانات الثانوية
  const secondaryData = {};
  const secondaries = Array.isArray(plan.secondary_entities) ? plan.secondary_entities : [];
  // اضطرارياً: إذا كانت الحقول المطلوبة تنتمي لكيان ثانوي، أضفه
  const extraNeeded = new Set(secondaries);
  plan.fields.forEach((field) => {
    ENTITIES_CATALOG.forEach((ent) => {
      if (ent.value === primaryEntity) return;
      if (ent.fields.some((f) => f.key === field)) extraNeeded.add(ent.value);
    });
  });
  // نحتاج HealthCenter لمزامنة معلومات المركز افتراضياً
  if (primaryEntity !== 'HealthCenter') extraNeeded.add('HealthCenter');
  if (primaryEntity === 'HealthCenter') extraNeeded.add('Employee');

  for (const secEntity of extraNeeded) {
    if (secEntity === primaryEntity) continue;
    if (!base44.entities[secEntity]) continue;
    try {
      secondaryData[secEntity] = await base44.entities[secEntity].filter({});
    } catch (_) {
      secondaryData[secEntity] = [];
    }
  }

  // إثراء كل صف
  const enrichedData = primaryData.map((row) =>
    enrichRowWithSecondary(row, primaryEntity, secondaryData, plan.fields)
  );

  // تطبيق الفلاتر
  const filtered = applyAIFilters(enrichedData, plan.filters);

  return filtered;
}

// استخرج تسمية مناسبة لحقل حتى لو لم يكن في الكيان الأساسي
export const resolveFieldLabelGlobal = (fieldKey) => {
  for (const ent of ENTITIES_CATALOG) {
    const f = ent.fields.find((x) => x.key === fieldKey);
    if (f) return f.label;
  }
  return fieldKey.replace(/_/g, ' ');
};