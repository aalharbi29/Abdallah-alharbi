/**
 * يحلل صفوف Excel الخام إلى كائنات موظفين مرشحين للإضافة
 * يطبق فلترة مبكرة على:
 *  - الصفوف بدون اسم موظف أو رقم هوية (سطور غير صالحة)
 *  - التكرار داخل الملف نفسه (نفس رقم الهوية)
 */

const cleanText = (v) => {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\xa0/g, " ").trim();
};

const toEnglishDigits = (str) => {
  if (!str) return "";
  const map = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
  return String(str).replace(/[٠-٩]/g, d => map[d] || d);
};

// يحول قيمة تاريخ من Excel (رقم تسلسلي / كائن Date / نص) إلى صيغة YYYY-MM-DD
const parseExcelDate = (v) => {
  if (v === null || v === undefined || v === "") return "";
  // رقم تسلسلي من Excel
  if (typeof v === "number") {
    const epoch = Date.UTC(1899, 11, 30);
    const date = new Date(epoch + v * 24 * 60 * 60 * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // كائن Date
  if (v instanceof Date) {
    const year = v.getFullYear();
    const month = String(v.getMonth() + 1).padStart(2, "0");
    const day = String(v.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // نص
  const s = toEnglishDigits(String(v).trim());
  if (s.match(/^\d{4}-\d{2}-\d{2}$/)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");
    return `${m[3]}-${month}-${day}`;
  }
  return "";
};

const cleanId = (v) => {
  if (v === null || v === undefined) return "";
  // نزيل أي رموز ونحتفظ بالأرقام فقط
  return String(v).replace(/\D/g, "").trim();
};

const mapGender = (v) => {
  const s = cleanText(v);
  if (!s) return "";
  if (s.includes("ذكر")) return "ذكر";
  if (s.includes("أنثى") || s.includes("انثى")) return "أنثى";
  return "";
};

const mapContractType = (v) => {
  const s = cleanText(v);
  if (!s) return "";
  if (s.includes("خدمة مدنية") || s.includes("الباب الأول")) return "خدمة مدنية";
  if (s.includes("تشغيل ذاتي")) return "تشغيل ذاتي";
  if (s.includes("تشغيل")) return "تشغيل";
  if (s.includes("متعاقد")) return "تعاقد";
  return "خدمة مدنية";
};

const mapJobCategoryType = (v) => {
  const s = cleanText(v);
  if (!s) return "";
  if (s.includes("الكادر الصحي")) return "الكادر الصحي";
  if (s.includes("الكادر الرسمي")) return "الكادر الرسمي";
  if (s.includes("المستخدمين")) return "المستخدمين";
  if (s.includes("الاداريين") || s.includes("الإداريين")) return "الاداريين";
  if (s.includes("المتعاقدين")) return "المتعاقدين";
  if (s.includes("بند الأجور")) return "بند الأجور";
  if (s.includes("ديوان الوزاره") || s.includes("ديوان الوزارة")) return "ديوان الوزارة";
  if (s.includes("الأطباء")) return "برنامج التشغيل / وظائف الأطباء";
  if (s.includes("الأخصائيين")) return "برنامج التشغيل / وظائف الأخصائيين غير الأطباء";
  if (s.includes("التقنية")) return "برنامج التشغيل / الوظائف التقنية";
  if (s.includes("التمريض")) return "برنامج التشغيل / وظائف التمريض";
  return "";
};

/**
 * يستخرج اسم المركز من حقل "إسم الجهه" مثل:
 * "تجمع المدينة المنورة الصحي - مركز رعاية صحية اولية الشقره"
 * → "مركز صحي الشقره" (نستخرج النواة فقط ليتم تطبيعها لاحقاً)
 */
const extractCenterFromEntity = (entityName) => {
  const s = cleanText(entityName);
  if (!s) return "";
  // نأخذ ما بعد آخر "-"
  const parts = s.split("-");
  return parts[parts.length - 1].trim();
};

/**
 * يحلل صفوف الملف ويرجع:
 *  - validRows: الصفوف الصالحة (بعد إزالة المكررات داخل الملف)
 *  - skippedInvalid: عدد الصفوف المتجاهلة لعدم صلاحيتها
 *  - skippedDuplicatesInFile: عدد التكرارات داخل الملف
 */
export const parseExcelRows = (rows) => {
  const seenIds = new Set();
  const seenEmpNums = new Set();
  const validRows = [];
  let skippedInvalid = 0;
  let skippedDuplicatesInFile = 0;

  for (const row of rows || []) {
    const nationalId = cleanId(row["رقم هوية الموظف"]);
    const empNumber = cleanId(row["رقم الموظف"]);
    const fullName = cleanText(row["إسم الموظف"]);

    // صف غير صالح: لا اسم ولا هوية
    if (!fullName && !nationalId) {
      skippedInvalid++;
      continue;
    }

    // تكرار داخل الملف نفسه
    const dedupKey = nationalId || `name:${fullName}|emp:${empNumber}`;
    if (nationalId && seenIds.has(nationalId)) {
      skippedDuplicatesInFile++;
      continue;
    }
    if (empNumber && seenEmpNums.has(empNumber) && !nationalId) {
      skippedDuplicatesInFile++;
      continue;
    }
    if (nationalId) seenIds.add(nationalId);
    if (empNumber) seenEmpNums.add(empNumber);

    validRows.push({
      _rowCenterRaw: extractCenterFromEntity(row["إسم الجهه"]),
      _rowEmployeeStatus: cleanText(row["حال الموظف"]),
      _rowNotes: cleanText(row["الملاحظات"]),
      _dedupKey: dedupKey,
      data: {
        full_name_arabic: fullName,
        "رقم_الهوية": nationalId,
        "رقم_الموظف": empNumber,
        gender: mapGender(row["الجنس"]),
        nationality: cleanText(row["الجنسية"]),
        phone: cleanText(row["رقم جوال الموظف"]),
        email: cleanText(row["إيميل الموظف"]),
        position: cleanText(row["المسمى الوظيفى"]),
        rank: cleanText(row["المرتبة"]),
        birth_date: parseExcelDate(row["تاريخ الميلاد"] || row["تاريخ الميلاد (ميلادي)"] || row["الميلاد"] || row["تاريخ الميلاد بالميلادي"]),
        birth_date_hijri: cleanText(row["تاريخ الميلاد (هجري)"] || row["الميلاد هجري"] || row["تاريخ الميلاد بالهجري"]),
        contract_type: mapContractType(row["نوع التوظيف"]),
        job_category_type: mapJobCategoryType(row["فئة الوظيفة"]),
        job_category: cleanText(row["البرنامج"]),
      },
    });
  }

  return { validRows, skippedInvalid, skippedDuplicatesInFile };
};