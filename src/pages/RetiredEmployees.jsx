import React from 'react';
import { Award } from 'lucide-react';
import EmployeeStatusListPage from '@/components/employees/EmployeeStatusListPage';

export default function RetiredEmployees() {
  return (
    <EmployeeStatusListPage
      mode="archived"
      archiveType="retired"
      title="الموظفون المتقاعدون"
      subtitle="قائمة الموظفين الذين أُحيلوا إلى التقاعد"
      icon={Award}
      colorClass="text-purple-600"
      gradient="from-purple-500 to-fuchsia-500"
    />
  );
}