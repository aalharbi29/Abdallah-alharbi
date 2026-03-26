import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function CenterMapLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">المركز الصحي</Badge>
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">نقطة مهمة</Badge>
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">حالة وبائية</Badge>
    </div>
  );
}