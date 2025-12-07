// دوال مساعدة لإدارة أدوار الموظفين وربطها بالمراكز الصحية

export const createPageUrl = (pageName) => {
  return `/${pageName}`;
};

// دالة للحصول على أدوار الموظف من المراكز الصحية
export const getEmployeeRolesFromCenters = (employeeId, healthCenters) => {
  if (!employeeId || !Array.isArray(healthCenters)) return [];
  
  const roles = [];
  
  healthCenters.forEach(center => {
    if (center.المدير === employeeId) {
      roles.push({
        role: 'مدير مركز',
        centerName: center.اسم_المركز,
        roleType: 'manager'
      });
    }
    
    if (center.نائب_المدير === employeeId) {
      roles.push({
        role: 'نائب مدير',
        centerName: center.اسم_المركز,
        roleType: 'deputy'
      });
    }
    
    if (center.المشرف_الفني === employeeId) {
      roles.push({
        role: 'مشرف فني',
        centerName: center.اسم_المركز,
        roleType: 'supervisor'
      });
    }
  });
  
  return roles;
};

// دالة للحصول على جميع أدوار الموظف (من special_roles ومن المراكز)
export const getAllEmployeeRoles = (employee, healthCenters) => {
  if (!employee) return [];
  
  const roles = [];
  
  // الأدوار من special_roles
  if (employee.special_roles && Array.isArray(employee.special_roles)) {
    employee.special_roles.forEach(role => {
      if (role) {
        roles.push({
          role: role,
          source: 'manual',
          centerName: employee.المركز_الصحي
        });
      }
    });
  }
  
  // الأدوار من المراكز الصحية
  if (Array.isArray(healthCenters)) {
    const centerRoles = getEmployeeRolesFromCenters(employee.id, healthCenters);
    roles.push(...centerRoles.map(r => ({ ...r, source: 'auto' })));
  }
  
  // إزالة التكرار
  const uniqueRoles = [];
  const seen = new Set();
  
  roles.forEach(roleObj => {
    const key = `${roleObj.role}-${roleObj.centerName || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRoles.push(roleObj);
    }
  });
  
  return uniqueRoles;
};

// دالة للتحقق إذا كان الموظف مدير مركز
export const isEmployeeCenterManager = (employeeId, healthCenters) => {
  if (!employeeId || !Array.isArray(healthCenters)) return false;
  return healthCenters.some(center => center.المدير === employeeId);
};

// دالة للحصول على المركز الذي يديره الموظف
export const getManagedCenter = (employeeId, healthCenters) => {
  if (!employeeId || !Array.isArray(healthCenters)) return null;
  return healthCenters.find(center => center.المدير === employeeId);
};