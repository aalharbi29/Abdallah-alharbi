// تقسيم حقول الكيانات إلى مجموعات منطقية + تحديد الحقول المفهرسة (enum/options)
// المجموعات تسهّل الاختيار وتقلل الفوضى في واجهة المستخدم
// الحقول المفهرسة تعرض قائمة خيارات لفلترة دقيقة (مثل تخصصات معينة)

// تعريف المجموعات لكل كيان
export const ENTITY_FIELD_GROUPS = {
  Employee: [
    {
      label: '👤 البيانات الشخصية',
      fields: ['full_name_arabic', 'full_name_english', 'رقم_الموظف', 'رقم_الهوية', 'birth_date', 'gender', 'nationality'],
    },
    {
      label: '📞 بيانات التواصل',
      fields: ['phone', 'email'],
    },
    {
      label: '💼 البيانات الوظيفية',
      fields: ['position', 'department', 'job_category', 'job_category_type', 'scfhs_classification', 'qualification', 'rank', 'level', 'grade'],
    },
    {
      label: '📅 التواريخ والعقود',
      fields: ['hire_date', 'start_work_date', 'contract_type', 'contract_end_date'],
    },
    {
      label: '🏥 المركز والمهام',
      fields: ['المركز_الصحي', 'special_roles', 'assigned_tasks', '__combined_roles'],
    },
  ],
  HealthCenter: [
    {
      label: '🏥 البيانات الأساسية',
      fields: ['اسم_المركز', 'اسم_المركز_انجليزي', 'seha_id', 'الموقع', 'موقع_الخريطة', 'حالة_التشغيل'],
    },
    {
      label: '👔 القيادة (أسماء فقط)',
      fields: ['المدير', 'نائب_المدير', 'المشرف_الفني'],
    },
    {
      label: '📱 بيانات المدير التفصيلية',
      fields: ['المدير_جوال', 'المدير_ايميل', 'المدير_تخصص', 'المدير_رقم_الموظف', 'المدير_رقم_الهوية'],
    },
    {
      label: '📱 بيانات نائب المدير التفصيلية',
      fields: ['نائب_المدير_جوال', 'نائب_المدير_ايميل', 'نائب_المدير_تخصص', 'نائب_المدير_رقم_الموظف', 'نائب_المدير_رقم_الهوية'],
    },
    {
      label: '📱 بيانات المشرف الفني التفصيلية',
      fields: ['المشرف_الفني_جوال', 'المشرف_الفني_ايميل', 'المشرف_الفني_تخصص', 'المشرف_الفني_رقم_الموظف', 'المشرف_الفني_رقم_الهوية'],
    },
    {
      label: '📞 الاتصال الرسمي للمركز',
      fields: ['ايميل_المركز', 'هاتف_المركز', 'فاكس_المركز', 'رقم_الجوال', 'رقم_الشريحة', 'رقم_الهاتف_الثابت'],
    },
    {
      label: '🏢 حالة المركز والإيجار',
      fields: ['حالة_المركز', 'قيمة_عقد_الايجار', 'اسم_المؤجر', 'هاتف_المؤجر', 'تاريخ_بداية_العقد', 'تاريخ_انتهاء_العقد', 'رقم_العقد'],
    },
    {
      label: '✅ الاعتمادات',
      fields: ['معتمد_سباهي', 'تاريخ_اعتماد_سباهي', 'مركز_نائي', 'بدل_نأي'],
    },
    {
      label: '👥 الموظفون والساعات',
      fields: ['ساعات_الدوام', 'عدد_الموظفين_الكلي', 'الخدمات_المقدمة'],
    },
    {
      label: '🚗 سيارة الخدمات',
      fields: [
        'سيارة_خدمات.متوفرة', 'سيارة_خدمات.رقم_اللوحة_عربي', 'سيارة_خدمات.رقم_اللوحة_انجليزي',
        'سيارة_خدمات.رقم_الهيكل', 'سيارة_خدمات.الرقم_التسلسلي', 'سيارة_خدمات.نوع_السيارة',
        'سيارة_خدمات.موديل', 'سيارة_خدمات.نوع_الوقود', 'سيارة_خدمات.تبعية_المحطة',
        'سيارة_خدمات.حالة_السيارة', 'سيارة_خدمات.المسافة_المقطوعة', 'سيارة_خدمات.اسم_السائق',
        'سيارة_خدمات.رخصة_السائق', 'سيارة_خدمات.تاريخ_آخر_صيانة',
        'سيارة_خدمات.تاريخ_انتهاء_الرخصة', 'سيارة_خدمات.تاريخ_انتهاء_التأمين',
      ],
    },
    {
      label: '🚑 سيارة الإسعاف',
      fields: [
        'سيارة_اسعاف.متوفرة', 'سيارة_اسعاف.رقم_اللوحة_عربي', 'سيارة_اسعاف.رقم_اللوحة_انجليزي',
        'سيارة_اسعاف.رقم_الهيكل', 'سيارة_اسعاف.الرقم_التسلسلي', 'سيارة_اسعاف.نوع_السيارة',
        'سيارة_اسعاف.موديل', 'سيارة_اسعاف.نوع_الوقود', 'سيارة_اسعاف.حالة_السيارة',
        'سيارة_اسعاف.مجهزة_بالكامل', 'سيارة_اسعاف.اسم_السائق', 'سيارة_اسعاف.رخصة_السائق',
        'سيارة_اسعاف.تاريخ_آخر_صيانة', 'سيارة_اسعاف.تاريخ_انتهاء_الرخصة', 'سيارة_اسعاف.تاريخ_انتهاء_التأمين',
      ],
    },
  ],
  Assignment: [
    { label: '👤 الموظف', fields: ['employee_name', 'employee_job_id', 'employee_national_id', 'employee_position', 'gender'] },
    { label: '🏥 المركز', fields: ['from_health_center', 'assigned_to_health_center'] },
    { label: '📅 التواريخ', fields: ['start_date', 'end_date', 'duration_days', 'issue_date', 'completion_date'] },
    { label: '⚙️ الحالة والإعتماد', fields: ['status', 'approval_status', 'approved_date', 'approved_by', 'assignment_type'] },
    { label: '🎉 المناسبات', fields: ['holiday_name', 'holiday_year', 'compensation_amount'] },
  ],
  Leave: [
    { label: '👤 الموظف', fields: ['employee_name', 'employee_id', 'health_center'] },
    { label: '📅 التواريخ', fields: ['leave_type', 'start_date', 'end_date', 'mubashara_date', 'days_count'] },
    { label: '⚙️ الحالة', fields: ['status'] },
  ],
  MedicalEquipment: [
    { label: '🔬 بيانات الجهاز', fields: ['equipment_name', 'serial_number', 'manufacturer', 'model', 'quantity', 'status'] },
    { label: '🏥 الموقع', fields: ['health_center_name', 'department'] },
  ],
  EquipmentRequest: [
    { label: '📋 الطلب', fields: ['device_name', 'device_code', 'request_type', 'classification', 'priority', 'status'] },
    { label: '🔢 الكميات', fields: ['requested_quantity', 'quantity_in_department', 'quantity_in_site'] },
    { label: '🏥 الموقع', fields: ['health_center_name', 'department'] },
    { label: '👤 مقدم الطلب', fields: ['requester_name'] },
  ],
  DeficiencyReport: [
    { label: '⚠️ البلاغ', fields: ['deficiency_type', 'description', 'report_date', 'status', 'health_center'] },
  ],
  CenterDocument: [
    { label: '📄 المستند', fields: ['center_name', 'document_title', 'document_type', 'document_number'] },
    { label: '📅 التواريخ', fields: ['document_date', 'expiry_date', 'is_active'] },
  ],
  ArchivedEmployee: [
    { label: '👤 الموظف', fields: ['full_name_arabic', 'رقم_الموظف', 'رقم_الهوية', 'position', 'المركز_الصحي'] },
    { label: '📦 الأرشفة', fields: ['archive_type', 'archive_date', 'archive_reason', 'new_workplace'] },
  ],
  AllowanceRequest: [
    { label: '👤 الموظف', fields: ['employee_name', 'employee_number', 'position', 'department'] },
    { label: '💰 البدل', fields: ['allowance_type', 'status'] },
  ],
  ApprovalRequest: [
    { label: '✅ الطلب', fields: ['title', 'request_type', 'status', 'created_date'] },
  ],
  FormSubmission: [
    { label: '🗒️ النموذج', fields: ['form_template_title', 'submitted_by_employee_name', 'submission_date', 'status'] },
  ],
};

// الحقول المفهرسة (ذات قيم محددة) — تُستخرج من البيانات الفعلية ديناميكياً
// مع توفير قيم ثابتة معروفة للحقول ذات enum في schema
export const KNOWN_ENUM_FIELDS = {
  Employee: {
    gender: ['ذكر', 'أنثى'],
    qualification: ['ابتدائي', 'متوسط', 'ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه', 'أخرى'],
    job_category_type: [
      'المستخدمين', 'الاداريين', 'الكادر الرسمي', 'الكادر الصحي', 'المتعاقدين',
      'برنامج التشغيل / وظائف الأطباء', 'برنامج التشغيل / وظائف الأخصائيين غير الأطباء',
      'برنامج التشغيل / الوظائف التقنية', 'برنامج التشغيل / وظائف التمريض',
      'بند الأجور', 'ديوان الوزارة',
    ],
    contract_type: ['خدمة مدنية', 'تشغيل', 'تشغيل ذاتي', 'المستخدمين', 'دائم', 'مؤقت', 'تعاقد', 'متدرب', 'منتهي'],
  },
  HealthCenter: {
    حالة_المركز: ['حكومي', 'مستأجر', 'ملك خاص'],
    حالة_التشغيل: ['نشط', 'متوقف مؤقتاً', 'قيد الصيانة', 'مغلق'],
    ساعات_الدوام: ['7 hrs', '8 hrs', '9 hrs', '16 hrs', '24 hrs'],
    'سيارة_خدمات.حالة_السيارة': ['ممتازة', 'جيدة', 'متوسطة', 'سيئة'],
    'سيارة_خدمات.نوع_الوقود': ['بنزين', 'ديزل'],
    'سيارة_اسعاف.حالة_السيارة': ['ممتازة', 'جيدة', 'متوسطة', 'سيئة'],
    'سيارة_اسعاف.نوع_الوقود': ['بنزين', 'ديزل'],
  },
  Assignment: {
    status: ['active', 'completed', 'cancelled'],
    approval_status: ['draft', 'approved'],
    gender: ['ذكر', 'أنثى'],
  },
  Leave: {
    leave_type: ['إجازة سنوية', 'إجازة مرضية', 'إجازة أمومة', 'إجازة طارئة', 'إجازة بدون راتب'],
    status: ['active', 'completed', 'cancelled'],
  },
  EquipmentRequest: {
    request_type: ['جديد', 'إحلال', 'توسع', 'أخرى'],
    classification: ['طبي', 'غير طبي'],
    priority: ['منخفض الأهمية', 'متوسط الأهمية', 'عالي الأهمية'],
    status: ['مسودة', 'قيد المراجعة', 'معتمد', 'مرفوض'],
  },
  AllowanceRequest: {
    allowance_type: ['بدل عدوى', 'بدل ضرر', 'بدل خطر'],
    status: ['draft', 'submitted', 'approved', 'rejected'],
  },
  ArchivedEmployee: {
    archive_type: ['retired', 'resigned', 'terminated', 'contract_not_renewed', 'transferred'],
  },
  CenterDocument: {
    document_type: ['قرار إداري', 'تكليف مدير', 'تكليف نائب مدير', 'معاملة رسمية', 'عقد إيجار', 'صيانة', 'تجهيزات', 'تقرير', 'مراسلة', 'إحصائيات', 'عينات مياه', 'أخرى'],
  },
  FormSubmission: {
    status: ['جديد', 'قيد المراجعة', 'مكتمل'],
  },
};

// الحقول الحرة (نصوص قابلة للبحث) التي يُفضَّل أخذ قيمها الفريدة من البيانات لعرضها كخيارات
export const DYNAMIC_ENUM_FIELDS = {
  Employee: ['position', 'department', 'nationality', 'rank', 'job_category', 'scfhs_classification'],
  HealthCenter: ['الموقع'],
  Assignment: ['employee_position'],
  MedicalEquipment: ['department', 'manufacturer', 'status'],
  EquipmentRequest: ['department'],
};

export const getGroupsForEntity = (entityValue) => ENTITY_FIELD_GROUPS[entityValue] || null;

export const getEnumOptionsForField = (entityValue, fieldKey) => {
  const entityEnums = KNOWN_ENUM_FIELDS[entityValue];
  if (entityEnums && entityEnums[fieldKey]) return entityEnums[fieldKey];
  return null;
};

export const isDynamicEnumField = (entityValue, fieldKey) => {
  const list = DYNAMIC_ENUM_FIELDS[entityValue];
  return list ? list.includes(fieldKey) : false;
};