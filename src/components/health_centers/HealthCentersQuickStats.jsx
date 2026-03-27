import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function HealthCentersQuickStats({ centers, employees }) {
  const centersList = Array.isArray(centers) ? centers : [];
  const employeesList = Array.isArray(employees) ? employees : [];

  const incompleteCount = centersList.filter(center => !center?.المدير || !center?.خط_الطول || !center?.خط_العرض || (!center?.هاتف_المركز && !center?.رقم_الجوال)).length;
  const activeCount = centersList.filter(center => center?.حالة_التشغيل === 'نشط').length;

  const stats = [
    { label: 'إجمالي المراكز', value: centersList.length, icon: Building2, cls: 'from-green-500 to-green-600' },
    { label: 'المراكز النشطة', value: activeCount, icon: CheckCircle2, cls: 'from-blue-500 to-blue-600' },
    { label: 'إجمالي الموظفين', value: employeesList.length, icon: Users, cls: 'from-purple-500 to-purple-600' },
    { label: 'بيانات تحتاج استكمال', value: incompleteCount, icon: AlertTriangle, cls: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`bg-gradient-to-r ${stat.cls} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className="w-12 h-12 text-white/80" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}