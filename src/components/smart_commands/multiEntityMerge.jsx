// دمج بيانات عدة كيانات مع الكيان الأساسي باستخدام العلاقات المتاحة
// مثلاً: Employee (أساسي) + HealthCenter → يضيف بيانات المركز للموظف
//       HealthCenter (أساسي) + Employee → يضيف بيانات المدير/نائب المدير/المشرف

import { base44 } from '@/api/base44Client';

// خريطة حقل المركز لكل كيان
const CENTER_FIELD_MAP = {
  Employee: 'المركز_الصحي',
  HealthCenter: 'اسم_المركز',
  MedicalEquipment: 'health_center_name',
  EquipmentRequest: 'health_center_name',
  DeficiencyReport: 'health_center',
  Leave: 'health_center',
  Assignment: 'assigned_to_health_center',
  CenterDocument: 'center_name',
  ArchivedEmployee: 'المركز_الصحي',
  AllowanceRequest: 'department',
};

// حقل اسم الموظف في الكيانات التابعة
const EMPLOYEE_NAME_FIELD_MAP = {
  Leave: 'employee_name',
  Assignment: 'employee_name',
  AllowanceRequest: 'employee_name',
  EquipmentRequest: 'requester_name',
};

const normalizeName = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// دمج كيانات فرعية مع الكيان الأساسي
// primaryEntity: اسم الكيان الأساسي
// primaryData: البيانات الأساسية
// secondaryEntities: قائمة كيانات إضافية للدمج
export async function mergeMultipleEntities(primaryEntity, primaryData, secondaryEntities) {
  if (!secondaryEntities || secondaryEntities.length === 0) return primaryData;

  let merged = [...primaryData];

  for (const secEntity of secondaryEntities) {
    if (secEntity === primaryEntity) continue;

    try {
      const secData = await base44.entities[secEntity].filter({});
      if (!secData || secData.length === 0) continue;

      // تحديد آلية الربط
      // 1. إذا كان الأساسي Employee والثانوي HealthCenter
      if (primaryEntity === 'Employee' && secEntity === 'HealthCenter') {
        const centerMap = new Map();
        secData.forEach((c) => centerMap.set(normalizeName(c['اسم_المركز']), c));
        merged = merged.map((emp) => {
          const center = centerMap.get(normalizeName(emp['المركز_الصحي']));
          if (!center) return emp;
          return {
            ...emp,
            _center_الموقع: center['الموقع'],
            _center_seha_id: center['seha_id'],
            _center_حالة_المركز: center['حالة_المركز'],
            _center_معتمد_سباهي: center['معتمد_سباهي'],
            _center_مركز_نائي: center['مركز_نائي'],
            _center_ساعات_الدوام: center['ساعات_الدوام'],
          };
        });
        continue;
      }

      // 2. إذا كان الأساسي HealthCenter والثانوي Employee
      if (primaryEntity === 'HealthCenter' && secEntity === 'Employee') {
        const empsByCenter = new Map();
        secData.forEach((emp) => {
          const key = normalizeName(emp['المركز_الصحي']);
          if (!empsByCenter.has(key)) empsByCenter.set(key, []);
          empsByCenter.get(key).push(emp);
        });
        merged = merged.map((center) => {
          const emps = empsByCenter.get(normalizeName(center['اسم_المركز'])) || [];
          return {
            ...center,
            _emp_عدد_الموظفين_الفعلي: emps.length,
            _emp_قائمة_الموظفين: emps.map((e) => e.full_name_arabic).join('، '),
          };
        });
        continue;
      }

      // 3. إذا كان الثانوي له حقل مركز مطابق، اربط حسب المركز
      const secCenterField = CENTER_FIELD_MAP[secEntity];
      const primCenterField = CENTER_FIELD_MAP[primaryEntity];
      if (secCenterField && primCenterField) {
        const secByCenter = new Map();
        secData.forEach((row) => {
          const key = normalizeName(row[secCenterField]);
          if (!secByCenter.has(key)) secByCenter.set(key, []);
          secByCenter.get(key).push(row);
        });
        merged = merged.map((primRow) => {
          const relatedRows = secByCenter.get(normalizeName(primRow[primCenterField])) || [];
          return {
            ...primRow,
            [`_${secEntity}_count`]: relatedRows.length,
          };
        });
        continue;
      }

      // 4. الربط عبر اسم الموظف
      const primEmpField = primaryEntity === 'Employee' ? 'full_name_arabic' : EMPLOYEE_NAME_FIELD_MAP[primaryEntity];
      const secEmpField = secEntity === 'Employee' ? 'full_name_arabic' : EMPLOYEE_NAME_FIELD_MAP[secEntity];
      if (primEmpField && secEmpField) {
        const secByEmp = new Map();
        secData.forEach((row) => {
          const key = normalizeName(row[secEmpField]);
          if (!secByEmp.has(key)) secByEmp.set(key, []);
          secByEmp.get(key).push(row);
        });
        merged = merged.map((primRow) => {
          const related = secByEmp.get(normalizeName(primRow[primEmpField])) || [];
          return {
            ...primRow,
            [`_${secEntity}_count`]: related.length,
          };
        });
      }
    } catch (err) {
      console.warn(`تعذّر دمج ${secEntity}:`, err);
    }
  }

  return merged;
}

// تطبيق فلاتر القيم على البيانات
// valueFilters = { fieldKey: [allowed values] }
export function applyValueFilters(data, valueFilters) {
  if (!valueFilters || Object.keys(valueFilters).length === 0) return data;

  const activeFilters = Object.entries(valueFilters).filter(([_k, v]) => Array.isArray(v) && v.length > 0);
  if (activeFilters.length === 0) return data;

  const getVal = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };

  return data.filter((row) => {
    return activeFilters.every(([fieldKey, allowed]) => {
      const val = getVal(row, fieldKey);
      if (val === null || val === undefined) return false;
      if (Array.isArray(val)) {
        return val.some((v) => allowed.includes(String(v)));
      }
      return allowed.includes(String(val));
    });
  });
}