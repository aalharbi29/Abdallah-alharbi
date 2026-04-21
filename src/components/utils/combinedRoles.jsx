// مساعد موحّد لاستخراج "المهام الإضافية" للموظف
// يجمع بين:
// 1) الأدوار اليدوية المحفوظة على الموظف (special_roles + assigned_tasks)
// 2) الأدوار المستقاة من المراكز الصحية (مدير / نائب مدير / مشرف فني)

const ROLE_LABELS = {
  manager: 'مدير مركز',
  deputy: 'نائب مدير',
  technical_supervisor: 'مشرف فني',
  nursing_supervisor: 'مشرف تمريض',
  quality_supervisor: 'مشرف جودة',
  safety_supervisor: 'مشرف أمن وسلامة',
  infection_control_supervisor: 'مشرف مكافحة العدوى',
  infection_control_coordinator: 'منسق مكافحة العدوى',
  school_health_coordinator: 'منسق صحة مدرسية',
  school_health_supervisor: 'مشرف صحة مدرسية',
};

const humanize = (val) => ROLE_LABELS[val] || String(val || '').replace(/_/g, ' ');

/**
 * يُرجع مصفوفة نصية بأدوار الموظف القيادية والإشرافية
 * @param {object} employee - سجل الموظف
 * @param {Array} healthCenters - مصفوفة كل المراكز الصحية
 * @returns {string[]}
 */
export const getCombinedEmployeeRoles = (employee, healthCenters = []) => {
  if (!employee) return [];
  const roles = new Set();

  // 1) من المراكز: المدير / نائب المدير / المشرف الفني
  if (Array.isArray(healthCenters) && employee.id) {
    healthCenters.forEach((c) => {
      if (!c) return;
      if (c['المدير'] === employee.id) roles.add('مدير مركز');
      if (c['نائب_المدير'] === employee.id) roles.add('نائب مدير');
      if (c['المشرف_الفني'] === employee.id) roles.add('مشرف فني');
    });
  }

  // 2) من الأدوار اليدوية
  if (Array.isArray(employee.special_roles)) {
    employee.special_roles.forEach((r) => {
      if (r) roles.add(humanize(r));
    });
  }

  // 3) من المهام المكلف بها
  if (Array.isArray(employee.assigned_tasks)) {
    employee.assigned_tasks.forEach((t) => {
      if (t) roles.add(humanize(t));
    });
  }

  return Array.from(roles);
};

/** نسخة نصية مفصولة بفواصل لعرضها في الخلية أو التصدير */
export const getCombinedRolesText = (employee, healthCenters = []) => {
  const arr = getCombinedEmployeeRoles(employee, healthCenters);
  return arr.length > 0 ? arr.join('، ') : '';
};