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
// الأولوية دائماً لنوع "الكائن المطلوب" (موظفين/أجهزة/إجازات) قبل "الموقع" (مركز).
const detectLikelyEntity = (prompt) => {
  const p = normalizeArabic(prompt);

  // 1️⃣ الموظفون أولوية قصوى — حتى لو ذُكر "مركز" في الطلب
  if (/موظف|موظفين|اطباء|طبيب|ممرض|صيدلي|فني|اداري|عمال|ممرضه|ممرضات/i.test(p)) return 'Employee';

  // 2️⃣ الإجازات / التكاليف / النواقص قبل أي ذكر لمركز
  if (/اجاز|إجاز/i.test(p)) return 'Leave';
  if (/تكليف|مكلف/i.test(p)) return 'Assignment';
  if (/نقص|عجز|ناقص/i.test(p)) return 'DeficiencyReport';
  if (/طلب جهاز|طلب تجهيز|طلبات الاجهزه/i.test(p)) return 'EquipmentRequest';
  if (/اجهزه طبيه|جهاز طبي|معدات طبيه/i.test(p)) return 'MedicalEquipment';

  // 3️⃣ سيارات / مركبات / إسعاف = HealthCenter (لأنها حقول داخل المركز)
  if (/سيار|مركب|اسعاف|عربي|عربيات/i.test(p)) return 'HealthCenter';

  // 4️⃣ معلومات/بيانات/تقرير + مركز → HealthCenter (طلب معلومات المركز ذاته)
  if (/تقرير|معلومات|بيانات|تفاصيل|حصر|حاله/i.test(p) && /مركز|مراكز|صحي/i.test(p)) return 'HealthCenter';

  // 5️⃣ مدير / نائب / مشرف فني
  if (/مدير|نائب|مشرف فني|اعتماد|سباهي|ايجار|عقد/i.test(p) && /مركز|مراكز|صحي/i.test(p)) return 'HealthCenter';

  return null;
};

// استخراج أسماء مراكز من النص
// ملاحظة مهمة: "مركز صحي طلال" → الاسم هو "طلال" (نتجاوز كلمتي "صحي" و "الصحي")
const STOP_WORDS = new Set([
  'صحي', 'الصحي', 'في', 'عن', 'على', 'من', 'الى', 'إلى', 'مع', 'و', 'أو', 'او',
  'هذا', 'ذلك', 'جميع', 'كل', 'بعض', 'هو', 'هي', 'التابع', 'التابعه',
]);

// استخراج أسماء موظفين من نص بصيغة: "اسم من مركز ..." أو "اسم و اسم من مركز ..."
// نتجاهل أي أسماء تأتي بعد "الرؤساء المباشرين" أو ضمن مفردات إدارية.
const extractEmployeeNameHints = (prompt) => {
  const p = String(prompt || '');
  const hints = new Set();
  // نلتقط: اسم (كلمتان أو ثلاث) يسبق كلمة "من مركز"
  // ومجموعات معطوفة بـ "و" قبل "من مركز"
  const pattern = /([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){1,2})(?=\s+(?:و\s+[\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){1,2}\s+)*من\s+مركز)/g;
  let m;
  while ((m = pattern.exec(p)) !== null) {
    const candidate = m[1].trim();
    // استبعاد عبارات إدارية شائعة
    if (/الرؤساء|المباشرين|الأداء|الوظيفي|الإلكترونية|الالكترونيه|التقييمات|التقييم/.test(candidate)) continue;
    if (candidate.split(/\s+/).length >= 2) hints.add(candidate);
  }
  // أيضاً نلتقط أسماء معطوفة بـ "و" بين "اسم من مركز X و اسم من مركز Y"
  const pattern2 = /و\s+([\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+){1,2})(?=\s+من\s+مركز)/g;
  while ((m = pattern2.exec(p)) !== null) {
    const candidate = m[1].trim();
    if (/الرؤساء|المباشرين|الأداء|الوظيفي|الإلكترونية|الالكترونيه|التقييمات|التقييم/.test(candidate)) continue;
    if (candidate.split(/\s+/).length >= 2) hints.add(candidate);
  }
  return Array.from(hints);
};

const extractCenterNameHints = (prompt) => {
  const p = String(prompt || '').trim();
  const hints = new Set();
  // نمط مرن: بعد "مركز" أو "المركز" قد يأتي "صحي/الصحي" ثم الاسم الفعلي
  const patterns = [
    /(?:ال)?مركز(?:\s+(?:ال)?صحي)?\s+((?:(?!في|عن|على|من|و|أو|لل)[^\s،,.\n])+(?:\s+(?:(?!في|عن|على|من|و|أو|لل)[^\s،,.\n])+){0,2})/g,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(p)) !== null) {
      // نظّف: أزل stop words من البداية وخذ أول كلمة مفيدة (+ كلمتين بعدها إن وُجدتا)
      const words = m[1].split(/\s+/).filter(Boolean);
      // تخطَّ stop words في البداية
      while (words.length > 0 && STOP_WORDS.has(words[0])) words.shift();
      if (words.length === 0) continue;
      const name = words.slice(0, 3).join(' ').trim();
      if (name && name.length >= 2 && !STOP_WORDS.has(name)) {
        hints.add(name);
      }
    }
  });
  return Array.from(hints);
};

// حقول شاملة افتراضية للمركز الصحي عند طلب "تقرير عن مركز"
const DEFAULT_HEALTH_CENTER_FULL_FIELDS = [
  'اسم_المركز', 'seha_id', 'الموقع', 'حالة_المركز', 'حالة_التشغيل', 'ساعات_الدوام',
  'هاتف_المركز', 'رقم_الجوال', 'ايميل_المركز', 'فاكس_المركز',
  'المدير', 'المدير_جوال', 'المدير_ايميل', 'المدير_تخصص',
  'نائب_المدير', 'نائب_المدير_جوال', 'نائب_المدير_تخصص',
  'المشرف_الفني', 'المشرف_الفني_جوال', 'المشرف_الفني_تخصص',
  'معتمد_سباهي', 'تاريخ_اعتماد_سباهي', 'مركز_نائي', 'بدل_نأي',
  'اسم_المؤجر', 'هاتف_المؤجر', 'قيمة_عقد_الايجار', 'تاريخ_بداية_العقد', 'تاريخ_انتهاء_العقد', 'رقم_العقد',
  'عدد_الموظفين_الكلي',
  'سيارة_اسعاف.متوفرة', 'سيارة_اسعاف.رقم_اللوحة_عربي', 'سيارة_اسعاف.حالة_السيارة', 'سيارة_اسعاف.اسم_السائق',
  'سيارة_خدمات.متوفرة', 'سيارة_خدمات.رقم_اللوحة_عربي', 'سيارة_خدمات.حالة_السيارة', 'سيارة_خدمات.اسم_السائق',
];

// اطلب من AI تحليل النص وإرجاع خطة تقرير
export async function planFreeReport(userPrompt) {
  const schemaContext = buildFullSchemaContext();
  const validEntities = ENTITIES_CATALOG.map((e) => e.value).join(', ');
  const hintedEntity = detectLikelyEntity(userPrompt);

  const aiPrompt = `أنت مساعد خبير في بناء التقارير من نظام إدارة صحي.

⚠️ قاعدة صارمة: primary_entity يجب أن تكون قيمة إنجليزية واحدة فقط من هذه القائمة — ممنوع اختراع أسماء كيانات:
${validEntities}

🎯 قاعدة اختيار الكيان الأساسي (primary_entity):
**الكيان = "نوع السجلات المطلوبة"، وليس "الموقع الذي تنتمي إليه".**

أمثلة واضحة لمطابقة الطلب بالكيان الصحيح — اتبع هذه الأمثلة حرفياً:

✅ "تقرير عن الموظفين في مركز طلال" / "الأطباء في المراكز النائية" → **Employee** (المطلوب سجلات الموظفين، والمركز مجرد فلتر).
✅ "تقرير عن مركز طلال" / "معلومات مركز صحي طلال" / "بيانات المركز" (بدون ذكر موظفين/أجهزة/إجازات) → **HealthCenter** (المطلوب سجل المركز نفسه).
✅ "إجازات الموظفين في مركز X" → **Leave**.
✅ "تكاليف في مركز X" → **Assignment**.
✅ "نواقص مركز X" → **DeficiencyReport**.
✅ "سيارات الإسعاف / الخدمات / المركبات" → **HealthCenter** (حقل داخل المركز).
✅ "الأجهزة الطبية / السرائر / أجهزة الأشعة" → **MedicalEquipment** (⚠️ السيارات ليست أجهزة طبية).
✅ "طلبات شراء أجهزة / طلبات تجهيز" → EquipmentRequest.

🔑 قاعدة ذهبية: إذا ذُكر في الطلب "موظفين/أطباء/ممرضين/فنيين" فالكيان = Employee حتى لو ذُكر اسم مركز معه.

⚠️ تحذير: كلمة "سيارة" أو "مركبة" أو "إسعاف" لا تعني أبداً MedicalEquipment — بل HealthCenter.
⚠️ إذا ذُكرت أسماء مراكز في الطلب + "حصر/حالة/بيانات/تقرير/معلومات" → الكيان هو HealthCenter افتراضياً.

🔴🔴 قاعدة إلزامية: إذا ذكر المستخدم اسم مركز محدد (مثل "مركز طلال"، "مركز بطحي"، "المركز الصحي بالهميج") **يجب** وضع فلتر {field:"اسم_المركز", operator:"contains", value:"طلال"} — استخرج اسم المركز من النص دون كلمة "مركز" أو "المركز الصحي". بدون هذا الفلتر سيرجع النظام 200 سجل وهذا خطأ فادح!

- إذا ذُكرت عدة أسماء مراكز (بطحي، الهميج، الدبان، صخيبرة...) ضع **فلتراً منفصلاً لكل مركز** مع operator:"contains" وقيمة نصية واحدة فقط. مثال: [{field:"اسم_المركز",operator:"contains",value:"بطحي"},{field:"اسم_المركز",operator:"contains",value:"الهميج"}] — تُعامل كـ OR تلقائياً.
- اختر حقل المركز الصحيح حسب الكيان: HealthCenter=اسم_المركز، Employee=المركز_الصحي، MedicalEquipment=health_center_name، Leave=health_center، Assignment=assigned_to_health_center.
- لا تستخدم filter على كائنات مركبة (مثل سيارة_اسعاف بدون .field داخلي).

📋 عند طلب "تقرير/معلومات/بيانات/تفاصيل" عن مركز معيّن، **اختر حقولاً شاملة** (على الأقل 20 حقل) تغطي: الاتصال، القيادة، الإيجار، الاعتمادات، سيارة الإسعاف، سيارة الخدمات. لا تكتفِ بحقلين أو ثلاثة.

🎯🎯 قاعدة حاسمة لاختيار الحقول (fields):
- **اختر فقط الحقول التي طلبها المستخدم صراحةً.** ممنوع إضافة حقول لم يطلبها (مثل: الأدوار القيادية، المهام الإضافية، الأدوار الإشرافية، __combined_roles، ...) إلا إذا ذكرها المستخدم بنفسه.
- إذا طلب المستخدم "اسم الموظف، رقمه الوظيفي، سجله المدني، تخصصه، جهة عمله" → الحقول هي بالضبط هذه الخمسة فقط، لا أكثر.
- إذا طلب المستخدم عموداً نصياً ثابتاً (مثل: "عمود إضافي يكتب فيه: تقييم الأداء الوظيفي 2025") تجاهله — النظام لا يدعم إضافة أعمدة نصية ثابتة، اكتفِ بذكر ذلك في حقل notes.

🔴 قاعدة حاسمة لفلترة الموظفين بأسماء محددة:
- إذا ذكر المستخدم أسماء موظفين محددة (مثل: "شجاع صالح من مركز بطحي، محمد مطلق من مركز الماوية") **يجب** إنشاء فلتر OR لكل اسم على حقل full_name_arabic بـ operator:"contains".
- مثال للطلب "شجاع صالح من بطحي و محمد مطلق من الماوية":
  filters: [
    {field:"full_name_arabic", operator:"contains", value:"شجاع صالح"},
    {field:"full_name_arabic", operator:"contains", value:"محمد مطلق"}
  ]
- لا تضف فلاتر على المركز في هذه الحالة (الاسم وحده يكفي للتمييز). الفلاتر على نفس الحقل تُعامل OR تلقائياً.

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

  // 🔧 إصلاح حاسم: إذا ذكر المستخدم اسم مركز محدد، نحقن فلتر تلقائياً
  // على الحقل الصحيح للكيان المختار (لأن AI كثيراً ما ينسى هذا الفلتر)
  const centerHints = extractCenterNameHints(userPrompt);
  if (centerHints.length > 0) {
    const centerField = CENTER_KEY_PER_ENTITY[parsed.primary_entity];
    if (centerField) {
      const hasCenterFilter = Array.isArray(parsed.filters) && parsed.filters.some(
        (f) => f.field === centerField
      );
      if (!hasCenterFilter) {
        console.info(`🔧 حقن فلاتر تلقائية على "${centerField}" للمراكز: ${centerHints.join(', ')}`);
        parsed.filters = parsed.filters || [];
        centerHints.forEach((name) => {
          parsed.filters.push({ field: centerField, operator: 'contains', value: name });
        });
      }
    }
  }

  // 🔧 الحقول الشاملة الافتراضية عند طلب "تقرير/معلومات" عن مركز
  if (parsed.primary_entity === 'HealthCenter') {
    const p = normalizeArabic(userPrompt);
    const wantsFullReport = /تقرير|معلومات|بيانات|تفاصيل|كل شي|شامل/i.test(p);
    if (wantsFullReport && (!parsed.fields || parsed.fields.length < 5)) {
      console.info('🔧 استخدام الحقول الشاملة الافتراضية للمركز الصحي.');
      parsed.fields = [...new Set([...(parsed.fields || []), ...DEFAULT_HEALTH_CENTER_FULL_FIELDS])];
    }
  }

  // 🔧 حقول افتراضية للموظفين فقط إذا لم يحدّد المستخدم/AI أي حقول
  // (لا نُضيف افتراضياً عندما يكون عدد الحقول 1 أو أكثر — احترام تحديد المستخدم)
  if (parsed.primary_entity === 'Employee' && (!parsed.fields || parsed.fields.length === 0)) {
    console.info('🔧 استخدام الحقول الافتراضية للموظفين (لا توجد حقول محددة).');
    parsed.fields = [
      'full_name_arabic', 'رقم_الموظف', 'رقم_الهوية', 'position', 'department',
      'المركز_الصحي', 'phone', 'email',
    ];
  }

  // 🔴 إذا ذكر المستخدم أسماء موظفين بصيغة "X من مركز Y" والـ AI لم يضع فلاتر بالأسماء، نحقنها
  const nameHints = extractEmployeeNameHints(userPrompt);
  if (parsed.primary_entity === 'Employee' && nameHints.length > 0) {
    const hasNameFilter = Array.isArray(parsed.filters) && parsed.filters.some(
      (f) => f.field === 'full_name_arabic'
    );
    if (!hasNameFilter) {
      console.info(`🔧 حقن فلاتر تلقائية على full_name_arabic للأسماء: ${nameHints.join(', ')}`);
      parsed.filters = parsed.filters || [];
      // أزل أي فلاتر مراكز سابقة (لأن الاسم وحده كافٍ للتمييز عند تحديد أسماء)
      parsed.filters = parsed.filters.filter((f) => !/المركز_الصحي|اسم_المركز|health_center|center_name|assigned_to_health_center/i.test(f.field));
      nameHints.forEach((name) => {
        parsed.filters.push({ field: 'full_name_arabic', operator: 'contains', value: name });
      });
    }
  }

  // 🔧 تطبيع أسماء الحقول: AI أحياناً يُرجع "key:label" أو الـ label العربي بدلاً من المفتاح الحقيقي
  parsed.fields = normalizeFieldKeys(parsed.fields, parsed.primary_entity);

  return parsed;
}

// تحوّل قائمة حقول من AI إلى المفاتيح الفعلية في ENTITIES_CATALOG.
// يدعم: "key:label" → "key" / label عربي → key / مرادفات شائعة (السجل المدني = رقم_الهوية)
const FIELD_SYNONYMS = {
  'السجل_المدني': 'رقم_الهوية', 'السجل المدني': 'رقم_الهوية', 'الهوية': 'رقم_الهوية',
  'الهوية_الوطنية': 'رقم_الهوية', 'national_id': 'رقم_الهوية',
  'الجوال': 'phone', 'رقم_الجوال': 'phone', 'الهاتف': 'phone', 'الموبايل': 'phone',
  'البريد': 'email', 'البريد_الإلكتروني': 'email', 'الإيميل': 'email', 'الايميل': 'email',
  'الاسم': 'full_name_arabic', 'الاسم_الكامل': 'full_name_arabic', 'اسم_الموظف': 'full_name_arabic',
  'الوظيفه': 'position', 'الوظيفة': 'position', 'التخصص': 'position',
  'القسم': 'department',
};

function normalizeFieldKeys(fields, entityValue) {
  if (!Array.isArray(fields)) return fields;
  const entity = ENTITIES_CATALOG.find((e) => e.value === entityValue);
  const allowedKeys = new Set(entity ? entity.fields.map((f) => f.key) : []);
  // فهرس عكسي: label العربي → key
  const labelToKey = {};
  if (entity) {
    entity.fields.forEach((f) => {
      labelToKey[normalizeArabic(f.label)] = f.key;
    });
  }

  const normalized = [];
  fields.forEach((raw) => {
    if (!raw || typeof raw !== 'string') return;
    let key = raw.trim();

    // إن جاء بصيغة "key:label" خذ الجزء قبل ':' فقط
    if (key.includes(':')) key = key.split(':')[0].trim();

    // مفتاح صحيح موجود فعلاً
    if (allowedKeys.has(key)) {
      normalized.push(key);
      return;
    }

    // مرادفات شائعة
    const syn = FIELD_SYNONYMS[key] || FIELD_SYNONYMS[key.replace(/\s+/g, '_')];
    if (syn && allowedKeys.has(syn)) {
      normalized.push(syn);
      return;
    }

    // مطابقة عبر label العربي
    const viaLabel = labelToKey[normalizeArabic(key)];
    if (viaLabel) {
      normalized.push(viaLabel);
      return;
    }

    // احتفظ به كما هو (قد يكون حقلاً مركباً مثل سيارة_اسعاف.متوفرة)
    normalized.push(key);
  });

  return [...new Set(normalized)];
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