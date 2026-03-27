import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, Pin, CheckSquare } from 'lucide-react';

export default function HumanResourcesStats({ employeesCount, centersCount, pinnedCount, selectedCount }) {
  const stats = [
    { label: 'إجمالي الموظفين', value: employeesCount, icon: Users },
    { label: 'المراكز الصحية', value: centersCount, icon: Building2 },
    { label: 'المثبتون', value: pinnedCount, icon: Pin },
    { label: 'المحددون', value: selectedCount, icon: CheckSquare },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 no-print">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-white/10 border-white/15 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs md:text-sm">{stat.label}</p>
                <p className="text-white text-xl md:text-2xl font-black mt-1">{stat.value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}