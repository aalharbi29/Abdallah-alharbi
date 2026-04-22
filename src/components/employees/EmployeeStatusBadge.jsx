import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Briefcase, LogOut, Award, ArrowRightLeft, XCircle } from 'lucide-react';

/**
 * يحدد حالة الموظف بناءً على بياناته:
 * - مكلف خارجياً (is_externally_assigned) → assigned
 * - وإلا → نشط (active)
 * أما المتقاعدون/المستقيلون/المنقولون فهم في كيان ArchivedEmployee، ويتم تمرير archiveType مباشرة.
 */
export const getEmployeeStatus = (employee) => {
  if (!employee) return 'active';
  if (employee.archive_type) return employee.archive_type; // سجل من ArchivedEmployee
  if (employee.is_externally_assigned) return 'assigned';
  return 'active';
};

export const STATUS_CONFIG = {
  active: { label: 'نشط', icon: CheckCircle2, className: 'bg-green-100 text-green-800 border-green-300' },
  assigned: { label: 'مكلف', icon: Briefcase, className: 'bg-amber-100 text-amber-800 border-amber-300' },
  retired: { label: 'متقاعد', icon: Award, className: 'bg-purple-100 text-purple-800 border-purple-300' },
  resigned: { label: 'مستقيل', icon: LogOut, className: 'bg-blue-100 text-blue-800 border-blue-300' },
  transferred: { label: 'منقول', icon: ArrowRightLeft, className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  terminated: { label: 'منهى العقد', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-300' },
  contract_not_renewed: { label: 'غير مجدد', icon: XCircle, className: 'bg-orange-100 text-orange-800 border-orange-300' },
};

export const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || 'غير محدد';

export default function EmployeeStatusBadge({ employee, status: explicitStatus, size = 'sm', showIcon = true }) {
  const status = explicitStatus || getEmployeeStatus(employee);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'} font-semibold gap-1`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      {config.label}
    </Badge>
  );
}