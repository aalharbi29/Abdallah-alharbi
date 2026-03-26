import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function CenterMapFilters({ search, onSearchChange, showImportantPoints, onImportantPointsChange, showEpidemicCases, onEpidemicCasesChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] items-center">
      <Input
        placeholder="ابحث داخل النقاط والحالات..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Checkbox id="important-points" checked={showImportantPoints} onCheckedChange={onImportantPointsChange} />
        <Label htmlFor="important-points">النقاط المهمة</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="epidemic-cases" checked={showEpidemicCases} onCheckedChange={onEpidemicCasesChange} />
        <Label htmlFor="epidemic-cases">الحالات الوبائية</Label>
      </div>
    </div>
  );
}