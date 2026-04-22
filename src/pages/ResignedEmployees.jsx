import React from 'react';
import { LogOut } from 'lucide-react';
import EmployeeStatusListPage from '@/components/employees/EmployeeStatusListPage';

export default function ResignedEmployees() {
  return (
    <EmployeeStatusListPage
      mode="archived"
      archiveType="resigned"
      title="الموظفون المستقيلون"
      subtitle="قائمة الموظفين الذين تقدموا بالاستقالة"
      icon={LogOut}
      colorClass="text-blue-600"
      gradient="from-blue-500 to-cyan-500"
    />
  );
}