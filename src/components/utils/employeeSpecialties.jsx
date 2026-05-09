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
  'طبيب بشري': ['طبيب عام', 'طبيب أسرة', 'طبيب مقيم', 'أخصائي طب أسرة', 'أخصائي غير طبيب أسرة', 'أخصائي أول', 'استشاري', 'استشاري طب أسرة'],
  'صيدلة': ['فني صيدلة', 'صيدلي', 'أخصائي صيدلة', 'أخصائي أول صيدلة', 'استشاري صيدلة', 'مشرف صيدلية'],
  'أسنان': ['طبيب أسنان عام', 'أخصائي أسنان', 'استشاري أسنان', 'فني أسنان', 'مساعد طبيب أسنان'],
  'مختبر': ['فني مختبر', 'أخصائي مختبر', 'أخصائي أول مختبر', 'استشاري مختبر'],
  'أشعة': ['فني أشعة', 'أخصائي أشعة', 'أخصائي أول أشعة', 'استشاري أشعة'],
  'علاج طبيعي': ['فني علاج طبيعي', 'أخصائي علاج طبيعي', 'أخصائي أول علاج طبيعي', 'استشاري علاج طبيعي'],
  'صحة عامة': ['مراقب صحي', 'أخصائي صحة عامة', 'أخصائي وبائيات', 'مدرب صحي'],
  'طب وقائي': ['فني طب وقائي', 'أخصائي طب وقائي', 'مراقب وبائيات', 'منسق مكافحة العدوى'],
  'جودة وسلامة': ['منسق جودة', 'أخصائي جودة', 'مشرف جودة', 'منسق أمن وسلامة', 'مشرف أمن وسلامة'],
  'إدارة': ['كاتب', 'مساعد إداري', 'إداري', 'سكرتير', 'مدير', 'مأمور اتصالات'],
  'خدمات مساندة': ['سائق', 'عامل', 'مستخدم', 'حارس أمن', 'فني صيانة'],
  'أخرى': [],
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

export const getEmployeeJobTitle = (employee = {}) => employee.position || '';

export const getJobTitleOptions = (mainSpecialty, currentTitle = '') => {
  const titles = JOB_TITLES_BY_SPECIALTY[mainSpecialty] || [];
  return currentTitle && !titles.includes(currentTitle) ? [currentTitle, ...titles] : titles;
};