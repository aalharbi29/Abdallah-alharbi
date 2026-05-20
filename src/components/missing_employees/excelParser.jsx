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
        contract_type: mapContractType(row["نوع التوظيف"]),
        job_category_type: mapJobCategoryType(row["فئة الوظيفة"]),
        job_category: cleanText(row["البرنامج"]),
      },
    });
  }

  return { validRows, skippedInvalid, skippedDuplicatesInFile };
};