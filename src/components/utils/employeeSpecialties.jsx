const normalizeArabic = (value) => String(value || '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export const MAIN_SPECIALTIES = [
  'تمريض',
  'طبيب بشري',
  'صيدلة',
  'أسنان',
  'مختبر',
  'أشعة',
  'علاج طبيعي',
  'صحة عامة',
  'طب وقائي',
  'جودة وسلامة',
  'إدارة',
  'خدمات مساندة',
  'أخرى',
];

export const JOB_TITLES_BY_SPECIALTY = {
  'تمريض': ['مساعد ممرض', 'فني تمريض', 'أخصائي تمريض', 'أخصائي أول تمريض', 'استشاري تمريض', 'رئيس تمريض', 'مشرف تمريض'],
  'طبيب بشري': ['طب أسرة', 'أخصائي طب أسرة', 'استشاري طب أسرة', 'طبيب مقيم', 'أخصائي أول', 'استشاري'],
  'صيدلة': ['فني صيدلة', 'صيدلي', 'أخصائي صيدلة', 'أخصائي أول صيدلة', 'استشاري صيدلة', 'مشرف صيدلية'],
  'أسنان': ['مساعد طبيب أسنان', 'فني أسنان', 'طبيب أسنان عام', 'أخصائي أسنان', 'استشاري أسنان'],
  'مختبر': ['فني مختبر', 'أخصائي مختبر', 'أخصائي أول مختبر', 'استشاري مختبر'],
  'أشعة': ['فني أشعة', 'أخصائي أشعة', 'أخصائي أول أشعة', 'استشاري أشعة'],
  'علاج طبيعي': ['فني علاج طبيعي', 'أخصائي علاج طبيعي', 'أخصائي أول علاج طبيعي', 'استشاري علاج طبيعي'],
  'صحة عامة': ['مراقب صحي', 'أخصائي صحة عامة', 'أخصائي وبائيات', 'مدرب صحي'],
  'طب وقائي': ['فني طب وقائي', 'أخصائي طب وقائي', 'مراقب وبائيات', 'منسق مكافحة العدوى'],
  'جودة وسلامة': ['منسق جودة', 'أخصائي جودة', 'مشرف جودة', 'منسق أمن وسلامة', 'مشرف أمن وسلامة'],
  'إدارة': ['كاتب', 'مساعد إداري', 'إداري', 'سكرتير', 'مدير', 'مأمور اتصالات'],
  'خدمات مساندة': ['سائق', 'عامل', 'مستخدم', 'حارس أمن', 'فني صيانة', 'فني إسعاف وطوارئ'],
  'أخرى': [],
};

export const canonicalizeJobTitle = (value = '') => {
  const text = normalizeArabic(value).replace(/-/g, ' ');
  if (!text) return '';

  if (/اخصائيه?\s*(ال)?تمريض|اخصائية\s*(ال)?تمريض|اخصائي\s*(ال)?تمريض|اخصائى\s*(ال)?تمريض|اخصائي تمريض/.test(text)) return 'أخصائي تمريض';
  if (/فنيه?\s*تمريض|فني\s*تمريض|فنى\s*تمريض/.test(text)) return 'فني تمريض';
  if (/مساعد\s*ممرض|مساعده\s*ممرض|مساعد\s*تمريض|مساعده\s*تمريض/.test(text)) return 'مساعد ممرض';
  if (/مشرف\s*تمريض|رئيس\s*تمريض/.test(text)) return 'مشرف تمريض';

  if (/طبيب\s*عام|طبيب\s*مقيم\s*طب\s*اسره|طبيب\s*مقيم\s*طب\s*اسرة|طب\s*اسره|طب\s*اسرة|طبيب\s*اسره|طبيب\s*اسرة/.test(text)) return 'طب أسرة';
  if (/اخصائي\s*طب\s*اسره|اخصائيه\s*طب\s*اسره|اخصائي\s*طب\s*اسرة/.test(text)) return 'أخصائي طب أسرة';
  if (/استشاري\s*طب\s*اسره|استشاري\s*طب\s*اسرة/.test(text)) return 'استشاري طب أسرة';

  if (/فني\s*صيدل|فنى\s*صيدل|فنيه\s*صيدل|فنية\s*صيدل|الصيدليه|الصيدلية|فني\s*صيدله|فني\s*صيدلة/.test(text)) return 'فني صيدلة';
  if (/اخصائي\s*صيدل|اخصائيه\s*صيدل|اخصائي\s*صيدله|اخصائي\s*صيدلة/.test(text)) return 'أخصائي صيدلة';
  if (/صيدلي|صيدليه|صيدلية|صيدلاني/.test(text)) return 'صيدلي';

  if (/مساعد\s*طبيب\s*اسنان|مساعده\s*طبيب\s*اسنان/.test(text)) return 'مساعد طبيب أسنان';
  if (/فني\s*(تركيبات\s*)?اسنان|فنى\s*(تركيبات\s*)?اسنان|فنية\s*(تركيبات\s*)?اسنان/.test(text)) return 'فني أسنان';
  if (/طبيب\s*اسنان/.test(text)) return 'طبيب أسنان عام';
  if (/اخصائي\s*اسنان|اخصائيه\s*اسنان/.test(text)) return 'أخصائي أسنان';

  if (/فني\s*مختبر|فنى\s*مختبر|فنيه\s*مختبر|فنية\s*مختبر/.test(text)) return 'فني مختبر';
  if (/اخصائي\s*مختبر|اخصائيه\s*مختبر/.test(text)) return 'أخصائي مختبر';
  if (/فني\s*اشعه|فنى\s*اشعه|فني\s*اشعة|فنية\s*اشعه/.test(text)) return 'فني أشعة';
  if (/اخصائي\s*اشعه|اخصائيه\s*اشعه|اخصائي\s*اشعة/.test(text)) return 'أخصائي أشعة';
  if (/فني\s*علاج\s*طبيعي|فنى\s*علاج\s*طبيعي/.test(text)) return 'فني علاج طبيعي';
  if (/اخصائي\s*علاج\s*طبيعي|اخصائيه\s*علاج\s*طبيعي/.test(text)) return 'أخصائي علاج طبيعي';
  if (/اسعاف|طوارئ/.test(text)) return 'فني إسعاف وطوارئ';

  return String(value).trim();
};

const SPECIALTY_PATTERNS = [
  { specialty: 'تمريض', patterns: [/تمريض/, /ممرض/] },
  { specialty: 'طبيب بشري', patterns: [/طبيب/, /طب اسره/, /طب اسرة/, /استشاري/, /اخصائي طب/] },
  { specialty: 'صيدلة', patterns: [/صيدل/, /صيدله/, /صيدلة/] },
  { specialty: 'أسنان', patterns: [/اسنان/, /أسنان/] },
  { specialty: 'مختبر', patterns: [/مختبر/] },
  { specialty: 'أشعة', patterns: [/اشعه/, /اشعة/, /أشعة/] },
  { specialty: 'علاج طبيعي', patterns: [/علاج طبيعي/] },
  { specialty: 'صحة عامة', patterns: [/صحه عامه/, /صحة عامة/, /مراقب صحي/, /وبائيات/] },
  { specialty: 'طب وقائي', patterns: [/طب وقائي/, /مكافحه العدوى/, /مكافحة العدوى/] },
  { specialty: 'جودة وسلامة', patterns: [/جوده/, /جودة/, /سلامه/, /سلامة/] },
  { specialty: 'إدارة', patterns: [/ادار/, /إدار/, /كاتب/, /سكرتير/, /مدير/] },
  { specialty: 'خدمات مساندة', patterns: [/سائق/, /عامل/, /حارس/, /صيانة/, /صيانه/] },
];

export const inferMainSpecialty = (employee = {}) => {
  const rawDepartment = employee.department || '';
  if (MAIN_SPECIALTIES.includes(rawDepartment)) return rawDepartment;

  const searchable = normalizeArabic([
    employee.department,
    employee.position,
    employee.job_category,
    employee.job_category_type,
  ].filter(Boolean).join(' '));

  const match = SPECIALTY_PATTERNS.find(({ patterns }) => patterns.some((pattern) => pattern.test(searchable)));
  return match?.specialty || 'أخرى';
};

export const getEmployeeMainSpecialty = (employee = {}) => inferMainSpecialty(employee);

export const getEmployeeJobTitle = (employee = {}) => canonicalizeJobTitle(employee.position) || '';

export const getJobTitleOptions = (mainSpecialty, currentTitle = '') => {
  const titles = JOB_TITLES_BY_SPECIALTY[mainSpecialty] || [];
  const canonicalTitle = canonicalizeJobTitle(currentTitle);
  return canonicalTitle && !titles.includes(canonicalTitle) ? [canonicalTitle, ...titles] : titles;
};