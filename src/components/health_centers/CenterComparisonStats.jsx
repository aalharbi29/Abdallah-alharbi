import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CenterComparisonStats({ centers }) {
  const list = Array.isArray(centers) ? centers : [];
  if (!list.length) return null;

  const sortedByEmployees = [...list].sort((a, b) => (b.عدد_الموظفين || 0) - (a.عدد_الموظفين || 0));
  const mostEmployees = sortedByEmployees[0];
  const leastEmployees = sortedByEmployees[sortedByEmployees.length - 1];
  const mostIncomplete = [...list].sort((a, b) => {
    const score = (center) => [!center?.المدير, !center?.خط_الطول || !center?.خط_العرض, !center?.هاتف_المركز && !center?.رقم_الجوال, center?.سيارة_خدمات !== 'متوفرة', center?.سيارة_اسعاف !== 'متوفرة'].filter(Boolean).length;
    return score(b) - score(a);
  })[0];

  const items = [
    { title: 'الأعلى موظفين', value: mostEmployees?.اسم_المركز || '-' },
    { title: 'الأقل موظفين', value: leastEmployees?.اسم_المركز || '-' },
    { title: 'الأكثر حاجة للتحديث', value: mostIncomplete?.اسم_المركز || '-' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>مقارنات سريعة بين المراكز</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <p className="text-lg font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}