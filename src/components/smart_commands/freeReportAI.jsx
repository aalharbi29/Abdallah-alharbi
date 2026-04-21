// وضع التقرير الحر: يسمح للذكاء الاصطناعي بتحليل الطلب النصي
// واختيار الكيانات والحقول المناسبة من كامل النظام تلقائياً،
// ثم جلب البيانات ودمجها وإرجاع نتيجة جاهزة للعرض.

import { base44 } from '@/api/base44Client';
import { ENTITIES_CATALOG, getEntityByValue } from './entitiesCatalog';
import { getNestedValue } from './excelExporter';
import { getCombinedRolesText } from '@/components/utils/combinedRoles';

// بناء خريطة مختصرة لكل الكيانات والحقول لتزويد AI بها (مضغوطة لتوفير التوكنز)
const buildFullSchemaContext = () => {
  return ENTITIES_CATALOG.map((ent) => {
    const fields = ent.fields.map((f) => `${f.key}:${f.label}`).join(' | ');
    return `[${ent.value}] ${ent.label} => ${fields}`;
  }).join('\n');
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
  const validEntities = ENTITIES_CATALOG.map((e) => e.value).join(', ');

  const aiPrompt = `أنت مساعد خبير في بناء التقارير من نظام إدارة صحي.

⚠️ قاعدة صارمة: primary_entity يجب أن تكون قيمة إنجليزية واحدة فقط من هذه القائمة — ممنوع اختراع أسماء كيانات:
${validEntities}

إرشادات مهمة:
- "سيارات الإسعاف" و"سيارة الخدمات" و"البيانات المكانية" = حقول داخل HealthCenter (وليست كياناً).
- "الموظفين / الأطباء / المدراء" = Employee.
- "الأجهزة الطبية / المعدات" = MedicalEquipment.
- "الإجازات" = Leave. "التكاليف" = Assignment. "العجز / النقص" = DeficiencyReport.
- إذا ذُكرت أسماء مراكز في الطلب (بطحي، الهميج، الدبان، صخيبرة...) ضعها في filters مع operator: "contains" وقيمة واحدة فقط لكل فلتر (أو اجعل operator: "in_list" إن دعا الأمر لعدة مراكز — استخدم contains لكل مركز بفلتر منفصل بمنطق or ضمني).

تفاصيل الحقول لكل كيان (field_key:field_label):
${schemaContext}

الطلب: "${userPrompt}"

أرجع JSON بـ: primary_entity, secondary_entities, fields (مفاتيح إنجليزية/عربية كما في القائمة), filters, title, notes.`;

  let response;
  try {
    response = await base44.integrations.Core.InvokeLLM({
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
                value: { type: 'string' }
              }
            }
          },
          title: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['primary_entity', 'fields', 'title'],
      },
    });
  } catch (err) {
    console.error('InvokeLLM failed:', err);
    throw new Error(`فشل استدعاء الذكاء الاصطناعي: ${err?.message || 'خطأ غير معروف'}`);
  }

  let parsed;
  try {
    parsed = typeof response === 'string' ? JSON.parse(response) : response;
  } catch (err) {
    console.error('JSON parse failed:', response);
    throw new Error('تعذّر قراءة استجابة الذكاء الاصطناعي.');
  }

  if (!parsed?.primary_entity) {
    throw new Error('الذكاء الاصطناعي لم يحدّد الكيان الأساسي.');
  }

  // تحقق من صحة الكيان الأساسي — إذا كان غير موجود، استبدله تلقائياً
  const validEntityKeys = ENTITIES_CATALOG.map((e) => e.value);
  if (!validEntityKeys.includes(parsed.primary_entity)) {
    // حاول الاستدلال من كلمات الطلب
    const promptLower = userPrompt.toLowerCase();
    let guessed = null;
    if (promptLower.includes('سيار') || promptLower.includes('اسعاف') || promptLower.includes('إسعاف') || promptLower.includes('مركز') || promptLower.includes('مرافق')) {
      guessed = 'HealthCenter';
    } else if (promptLower.includes('موظف') || promptLower.includes('طبيب') || promptLower.includes('ممرض')) {
      guessed = 'Employee';
    } else if (promptLower.includes('إجاز') || promptLower.includes('اجاز')) {
      guessed = 'Leave';
    } else if (promptLower.includes('تكليف')) {
      guessed = 'Assignment';
    } else if (promptLower.includes('جهاز') || promptLower.includes('اجهزه') || promptLower.includes('معدات')) {
      guessed = 'MedicalEquipment';
    }
    if (guessed) {
      console.warn(`AI أعاد كياناً غير صالح "${parsed.primary_entity}". تم استبداله بـ "${guessed}".`);
      parsed.primary_entity = guessed;
    } else {
      throw new Error(`الكيان "${parsed.primary_entity}" غير موجود في النظام. جرّب إعادة صياغة الطلب.`);
    }
  }

  // تحقق من الكيانات الثانوية
  if (Array.isArray(parsed.secondary_entities)) {
    parsed.secondary_entities = parsed.secondary_entities.filter((s) => validEntityKeys.includes(s));
  }

  return parsed;
}

// تطبيق فلاتر AI على الصفوف — مع تجميع الفلاتر على نفس الحقل بمنطق OR (أسماء مراكز متعددة)
const applyAIFilters = (rows, filters) => {
  if (!filters || filters.length === 0) return rows;

  // تجميع الفلاتر حسب field+operator
  const grouped = {};
  filters.forEach((f) => {
    const key = `${f.field}__${(f.operator || 'equals').toLowerCase()}`;
    if (!grouped[key]) grouped[key] = { field: f.field, operator: (f.operator || 'equals').toLowerCase(), values: [] };
    grouped[key].values.push(f.value);
  });

  return rows.filter((row) => {
    return Object.values(grouped).every((g) => {
      const val = getNestedValue(row, g.field);
      const op = g.operator;
      if (op === 'exists') return val !== null && val !== undefined && val !== '';
      if (val === null || val === undefined) return op === 'not_equals' || op === 'not_contains';

      const sv = normalizeArabic(String(val));
      // منطق OR بين القيم لنفس الحقل
      return g.values.some((target) => {
        const st = normalizeArabic(String(target ?? ''));
        switch (op) {
          case 'equals': return sv === st;
          case 'not_equals': return sv !== st;
          case 'contains': return sv.includes(st) || st.includes(sv);
          case 'not_contains': return !sv.includes(st);
          case 'gt': return Number(val) > Number(target);
          case 'gte': return Number(val) >= Number(target);
          case 'lt': return Number(val) < Number(target);
          case 'lte': return Number(val) <= Number(target);
          case 'in_list': return String(target).split(/[,،]/).map(normalizeArabic).some((x) => sv.includes(x));
          default: return true;
        }
      });
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