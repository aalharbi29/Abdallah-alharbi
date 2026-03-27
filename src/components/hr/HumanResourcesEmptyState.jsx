import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const emptyFilters = {
  healthCenters: [],
  positions: [],
  departments: [],
  jobCategories: [],
  jobCategoryTypes: [],
  qualifications: [],
  ranks: [],
  sequences: [],
  contractTypes: [],
  specialRoles: [],
  statuses: [],
  holidays: [],
  nationalities: [],
  holidayWorks: []
};

export default function HumanResourcesEmptyState({ hasFilters, onClear }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">لا توجد نتائج</p>
        <p className="text-gray-400 text-sm mt-2">جرب تعديل معايير البحث أو الفلترة</p>
        {hasFilters && (
          <Button variant="outline" className="mt-4" onClick={() => onClear(emptyFilters)}>
            مسح جميع الفلاتر
          </Button>
        )}
      </CardContent>
    </Card>
  );
}