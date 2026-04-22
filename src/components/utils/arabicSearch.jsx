/**
 * أدوات بحث وتطبيع للنصوص العربية:
 * - normalizeArabic: يزيل التشكيل ويوحّد الحروف المتشابهة (أ/إ/آ/ا، ه/ة، ى/ي، ؤ/و، ئ/ي...)
 *   ويحوّل الأرقام العربية إلى لاتينية.
 * - matchScore: يُرجع رتبة مطابقة (0 = لا يطابق، الأصغر = أفضل):
 *     1 = أول كلمة تبدأ بالاستعلام (الاسم الأول)
 *     2 = كلمة لاحقة تبدأ بالاستعلام (اسم الأب/الجد...)
 *     3 = مطابقة جزئية داخل كلمة
 *     4 = مطابقة في أي حقل آخر
 */

export const normalizeArabic = (text) => {
  if (text === null || text === undefined) return '';
  let s = String(text);

  // أرقام عربية وفارسية → لاتينية
  s = s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  s = s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

  // إزالة التشكيل والتطويل
  s = s.replace(/[\u064B-\u0652\u0670\u0640]/g, '');

  // توحيد الحروف المتشابهة
  s = s
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '');

  // مسافات متعددة
  s = s.replace(/\s+/g, ' ').trim().toLowerCase();
  return s;
};

/**
 * يحسب رتبة مطابقة لسجل موظف بالنسبة لنص البحث.
 * يعطي الأولوية لمن يبدأ اسمه الأول بالاستعلام، ثم الاسم الثاني، إلخ.
 */
export const matchScore = (employee, rawQuery) => {
  const q = normalizeArabic(rawQuery);
  if (!q) return 0;

  const name = normalizeArabic(employee.full_name_arabic || employee.full_name_english);
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(q)) {
        return i === 0 ? 1 : 2;
      }
    }
    if (name.includes(q)) return 3;
  }

  // حقول أخرى
  const otherFields = [
    employee['رقم_الموظف'],
    employee['رقم_الهوية'],
    employee.phone,
    employee.email,
    employee.position,
    employee.department,
    employee['المركز_الصحي'],
    employee.nationality,
    employee.qualification,
    employee.contract_type,
    employee.job_category,
    employee.job_category_type,
    employee.external_assignment_center,
    employee.archive_reason,
  ];

  for (const f of otherFields) {
    if (f && normalizeArabic(f).includes(q)) return 4;
  }

  return 0;
};