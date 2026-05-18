export const createEmptyAssignmentPeriod = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  periodType: 'range',
  fromDate: '',
  toDate: '',
  durationText: '',
  employeeIds: [],
});

export const normalizeAssignmentPeriods = (group = {}) => {
  group = group || {};
  group = group || {};
  const source = Array.isArray(group.periods) && group.periods.length > 0
    ? group.periods
    : [{
        id: group.id || 'legacy-period',
        periodType: group.periodType || 'range',
        fromDate: group.fromDate || '',
        toDate: group.toDate || '',
        durationText: group.durationText || '',
        employeeIds: group.employeeIds || [],
      }];

  return source.map((period, index) => ({
    id: period.id || `${group.id || 'period'}-${index}`,
    periodType: period.periodType || group.periodType || 'range',
    fromDate: period.fromDate || '',
    toDate: period.toDate || '',
    durationText: period.durationText || '',
    employeeIds: Array.isArray(period.employeeIds) ? period.employeeIds : [],
  }));
};

export const getPeriodLabel = (index) => {
  const labels = ['الفترة الأولى', 'الفترة الثانية', 'الفترة الثالثة', 'الفترة الرابعة', 'الفترة الخامسة'];
  return labels[index] || `الفترة ${index + 1}`;
};

export const getEmployeePeriods = (group, employeeId) => {
  const periods = normalizeAssignmentPeriods(group);
  if (!employeeId) return periods;
  const assigned = periods.filter((period) => (period.employeeIds || []).includes(employeeId));
  const hasAnyPeriodEmployeeSelection = periods.some((period) => (period.employeeIds || []).length > 0);
  return assigned.length > 0 || hasAnyPeriodEmployeeSelection ? assigned : periods;
};

export const formatAssignmentPeriodPlain = (group, employeeId) => {
  const suffix = group?.dateType === 'hijri' ? 'هـ' : 'م';
  const periods = getEmployeePeriods(group, employeeId).filter((period) => period.fromDate || period.toDate || period.durationText);

  if (periods.length === 0) return '-';

  const lines = periods.map((period, index) => {
    const label = periods.length > 1 ? `${getPeriodLabel(index)}: ` : '';
    if (period.periodType === 'duration') {
      return `${label}${period.durationText || '...'} اعتباراً من ${period.fromDate || '...'} ${suffix}`;
    }
    return `${label}من ${period.fromDate || '...'} ${suffix} إلى ${period.toDate || '...'} ${suffix}`;
  });

  if (group?.specificDays && group.specificDays.length > 0) {
    lines.push(`(أيام: ${group.specificDays.join('، ')})`);
  }

  return lines.join('\n');
};

export const formatAssignmentPeriodsHtml = (group, employeeId) => {
  const suffix = group?.dateType === 'hijri' ? 'هـ' : 'م';
  const periods = getEmployeePeriods(group, employeeId).filter((period) => period.fromDate || period.toDate || period.durationText);

  if (periods.length === 0) return '-';

  const html = periods.map((period, index) => {
    const label = periods.length > 1
      ? `<div style="font-size:10px;color:#0B3D91;font-weight:800;margin-bottom:2px;">${getPeriodLabel(index)}</div>`
      : '';
    const value = period.periodType === 'duration'
      ? `<div>${period.durationText || '...'}</div><div>اعتباراً من ${period.fromDate || '...'} ${suffix}</div>`
      : `<div>من ${period.fromDate || '...'} ${suffix}</div><div>إلى ${period.toDate || '...'} ${suffix}</div>`;
    return `<div style="margin-bottom:${index === periods.length - 1 ? 0 : 6}px;">${label}${value}</div>`;
  }).join('');

  const days = group?.specificDays && group.specificDays.length > 0
    ? `<div style="font-size:10px;margin-top:4px;color:#4b5563;">(أيام: ${group.specificDays.join('، ')})</div>`
    : '';

  return `${html}${days}`;
};