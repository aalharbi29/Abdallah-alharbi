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

// مطابقة مرنة لأسماء المراكز: تُزيل "ال" التعريف وتُقارن الجذور
const stripAl = (s) => s.replace(/^ال/, '').replace(/\sال/g, ' ');
const fuzzyCenterMatch = (centerValue, target) => {
  if (!centerValue || !target) return false;
  const v = stripAl(normalizeArabic(centerValue));
  const t = stripAl(normalizeArabic(target));
  if (!v || !t) return false;
  // مطابقة ثنائية الاتجاه على الجذر (بدون ال)
  return v.includes(t) || t.includes(v);
};

// heuristic: اختيار مسبق للكيان حسب كلمات مفتاحية واضحة
const detectLikelyEntity = (prompt) => {
  const p = normalizeArabic(prompt);
  // سيارات / مركبات / إسعاف / خدمات = HealthCenter (دائماً)
  if (/سيار|مركب|اسعاف|عربي|عربيات/i.test(p)) return 'HealthCenter';
  // مدير / نائب / مشرف فني / معلومات المركز
  if (/مدير|نائب|مشرف فني|اعتماد|سباهي|ايجار|عقد/i.test(p) && /مركز|مراكز|صحي/i.test(p)) return 'HealthCenter';
  if (/اجاز|إجاز/i.test(p)) return 'Leave';
  if (/تكليف|مكلف/i.test(p)) return 'Assignment';
  if (/نقص|عجز|ناقص/i.test(p)) return 'DeficiencyReport';
  if (/طلب جهاز|طلب تجهيز|طلبات الاجهزه/i.test(p)) return 'EquipmentRequest';
  return null;
};

// اطلب من AI تحليل النص وإرجاع خطة تقرير
export async function planFreeReport(userPrompt) {
  const schemaContext = buildFullSchemaContext();
  const validEntities = ENTITIES_CATALOG.map((e) => e.value).join(', ');
  const hintedEntity = detectLikelyEntity(userPrompt);

  const aiPrompt = `أنت مساعد خبير في بناء التقارير من نظام إدارة صحي.

⚠️ قاعدة صارمة: primary_entity يجب أن تكون قيمة إنجليزية واحدة فقط من هذه القائمة — ممنوع اختراع أسماء كيانات:
${validEntities}

🎯 قاعدة اختيار الكيان الأساسي (primary_entity):

أمثلة واضحة لمطابقة الطلب بالكيان الصحيح — اتبع هذه الأمثلة حرفياً:

✅ "حصر سيارات الإسعاف" / "سيارات الخدمات" / "مركبات المراكز" / "معلومات المراكز / المدراء / الإيجارات" → **HealthCenter** (سيارات الإسعاف حقل داخل المركز).
✅ "بيانات الموظفين / الأطباء / الممرضين / المدراء بمعزل عن المراكز" → **Employee**.
✅ "الأجهزة الطبية / السرائر / أجهزة الأشعة / المعدات الطبية داخل الأقسام" → **MedicalEquipment** (⚠️ لا تستخدمه للسيارات أبداً — السيارات ليست أجهزة طبية).
✅ "طلبات شراء أجهزة / طلبات تجهيز" → EquipmentRequest.
✅ "الإجازات" → Leave. "التكاليف" → Assignment. "نواقص / عجز المراكز" → DeficiencyReport.

⚠️ تحذير: كلمة "سيارة" أو "مركبة" أو "إسعاف" لا تعني أبداً MedicalEquipment — بل HealthCenter.
⚠️ إذا ذُكرت أسماء مراكز في الطلب + "حصر/حالة/بيانات" → الكيان هو HealthCenter افتراضياً.
- إذا ذُكرت أسماء مراكز في الطلب (بطحي، الهميج، الدبان، صخيبرة...) ضع **فلتراً منفصلاً لكل مركز** مع operator: "contains" وقيمة نصية واحدة فقط (لا تجمع الأسماء في قيمة واحدة بفواصل!). مثال صحيح: [{field:"اسم_المركز",operator:"contains",value:"بطحي"},{field:"اسم_المركز",operator:"contains",value:"الهميج"}] — سيُعاملان كـ OR تلقائياً.
- اختر حقل المركز الصحيح حسب الكيان: HealthCenter=اسم_المركز، Employee=المركز_الصحي، MedicalEquipment=health_center_name، Leave=health_center، Assignment=assigned_to_health_center.
- لا تستخدم filter على كائنات مركبة (مثل سيارة_اسعاف بدون .field داخلي).

تفاصيل الحقول لكل كيان (field_key:field_label):
${schemaContext}

الطلب: "${userPrompt}"
${hintedEntity ? `\n💡 تلميح قوي جداً من النظام: primary_entity المتوقع هو "${hintedEntity}". استخدمه ما لم يكن الطلب يشير بوضوح إلى كيان آخر.\n` : ''}
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

  // تصحيح قسري: إذا كان hint يشير لكيان محدد و AI اختار شيئاً مخالفاً بوضوح، صحّحه
  if (hintedEntity && parsed.primary_entity !== hintedEntity) {
    const pLower = normalizeArabic(userPrompt);
    // حالة خاصة: سيارة/إسعاف تم تصنيفها خطأ كـ MedicalEquipment أو EquipmentRequest
    if (/سيار|اسعاف|مركب/i.test(pLower) && ['MedicalEquipment', 'EquipmentRequest'].includes(parsed.primary_entity)) {
      console.warn(`تصحيح قسري: AI اختار "${parsed.primary_entity}" لكن السياق يشير لـ "${hintedEntity}".`);
      parsed.primary_entity = hintedEntity;
    }
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
      // حقول أسماء المراكز تستخدم مطابقة مرنة (تُزيل "ال" التعريف)
      const isCenterField = /اسم_المركز|health_center|center_name|المركز_الصحي|assigned_to_health_center/i.test(g.field);
      // منطق OR بين القيم لنفس الحقل
      return g.values.some((target) => {
        const st = normalizeArabic(String(target ?? ''));
        if (isCenterField && (op === 'contains' || op === 'equals')) {
          return fuzzyCenterMatch(val, target);
        }
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

  // ربط الموظف (لكيانات HealthCenter مع حقول المدير والحقول الحاسوبية المرتبطة)
  if (primaryEntity === 'HealthCenter' && secondaryData.Employee) {
    const findEmp = (val) => {
      if (!val) return null;
      return secondaryData.Employee.find(
        (e) => String(e.id) === String(val) ||
               String(e['رقم_الموظف']) === String(val) ||
               String(e['رقم_الهوية']) === String(val)
      );
    };
    const formatEmpName = (emp, rawVal) => {
      if (!emp) return rawVal || '';
      return `${emp.full_name_arabic || ''}${emp['رقم_الموظف'] ? ` (${emp['رقم_الموظف']})` : ''}`;
    };

    const dirEmp = findEmp(row['المدير']);
    const vdirEmp = findEmp(row['نائب_المدير']);
    const supEmp = findEmp(row['المشرف_الفني']);

    enriched['المدير'] = formatEmpName(dirEmp, row['المدير']);
    enriched['نائب_المدير'] = formatEmpName(vdirEmp, row['نائب_المدير']);
    enriched['المشرف_الفني'] = formatEmpName(supEmp, row['المشرف_الفني']);

    // حقول حاسوبية للمدير
    enriched['المدير_جوال'] = dirEmp?.phone || '';
    enriched['المدير_ايميل'] = dirEmp?.email || '';
    enriched['المدير_تخصص'] = dirEmp?.position || '';
    enriched['المدير_رقم_الموظف'] = dirEmp?.['رقم_الموظف'] || '';
    enriched['المدير_رقم_الهوية'] = dirEmp?.['رقم_الهوية'] || '';
    // نائب المدير
    enriched['نائب_المدير_جوال'] = vdirEmp?.phone || '';
    enriched['نائب_المدير_ايميل'] = vdirEmp?.email || '';
    enriched['نائب_المدير_تخصص'] = vdirEmp?.position || '';
    enriched['نائب_المدير_رقم_الموظف'] = vdirEmp?.['رقم_الموظف'] || '';
    enriched['نائب_المدير_رقم_الهوية'] = vdirEmp?.['رقم_الهوية'] || '';
    // المشرف الفني
    enriched['المشرف_الفني_جوال'] = supEmp?.phone || '';
    enriched['المشرف_الفني_ايميل'] = supEmp?.email || '';
    enriched['المشرف_الفني_تخصص'] = supEmp?.position || '';
    enriched['المشرف_الفني_رقم_الموظف'] = supEmp?.['رقم_الموظف'] || '';
    enriched['المشرف_الفني_رقم_الهوية'] = supEmp?.['رقم_الهوية'] || '';
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
  const beforeCount = enrichedData.length;
  const filtered = applyAIFilters(enrichedData, plan.filters);

  // تشخيص: إذا أزالت الفلاتر كل البيانات، اطبع معلومات للمطور
  if (beforeCount > 0 && filtered.length === 0 && plan.filters?.length > 0) {
    console.warn('⚠️ الفلاتر استبعدت كل الصفوف. الفلاتر المُطبّقة:', plan.filters);
    console.warn('عيّنة من البيانات قبل الفلترة:', enrichedData.slice(0, 2));
  }

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