import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function CenterMapFilters({ search, onSearchChange, showGovernmentPoints, onGovernmentPointsChange, showCommercialPoints, onCommercialPointsChange, showOtherPoints, onOtherPointsChange, showEpidemicCases, onEpidemicCasesChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto_auto] items-center">
      <Input
        placeholder="ابحث داخل النقاط والحالات..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Checkbox id="government-points" checked={showGovernmentPoints} onCheckedChange={onGovernmentPointsChange} />
        <Label htmlFor="government-points">الجهات الحكومية</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="commercial-points" checked={showCommercialPoints} onCheckedChange={onCommercialPointsChange} />
        <Label htmlFor="commercial-points">المنشآت التجارية</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="other-points" checked={showOtherPoints} onCheckedChange={onOtherPointsChange} />
        <Label htmlFor="other-points">نقاط أخرى</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="epidemic-cases" checked={showEpidemicCases} onCheckedChange={onEpidemicCasesChange} />
        <Label htmlFor="epidemic-cases">البؤر الوبائية</Label>
      </div>
    </div>
  );
}