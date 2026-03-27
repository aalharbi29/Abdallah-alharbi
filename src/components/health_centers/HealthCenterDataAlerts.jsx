import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function HealthCenterDataAlerts({ center }) {
  const issues = [];

  if (!center?.المدير) issues.push('لا يوجد مدير');
  if (!center?.خط_الطول || !center?.خط_العرض) issues.push('لا توجد إحداثيات');
  if (!center?.هاتف_المركز && !center?.رقم_الجوال) issues.push('لا يوجد هاتف');
  if (!center?.موقع_الخريطة) issues.push('لا يوجد رابط خريطة');

  if (!issues.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {issues.slice(0, 3).map((issue) => (
        <Badge key={issue} className="bg-red-50 text-red-700 border border-red-200 gap-1">
          <AlertTriangle className="w-3 h-3" />
          {issue}
        </Badge>
      ))}
    </div>
  );
}