import React from 'react';
import { Briefcase } from 'lucide-react';
import EmployeeStatusListPage from '@/components/employees/EmployeeStatusListPage';

export default function AssignedEmployees() {
  return (
    <EmployeeStatusListPage
      mode="assigned"
      title="الموظفون المكلفون"
      subtitle="الموظفون المكلفون بالعمل خارج مراكزهم الأصلية"
      icon={Briefcase}
      colorClass="text-amber-600"
      gradient="from-amber-500 to-orange-500"
    />
  );
}