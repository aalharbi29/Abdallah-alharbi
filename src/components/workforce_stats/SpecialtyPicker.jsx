import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope } from 'lucide-react';

export default function SpecialtyPicker({ selected, onChange, availableSpecialties }) {
  const toggle = (sp) => {
    if (selected.includes(sp)) onChange(selected.filter((s) => s !== sp));
    else onChange([...selected, sp]);
  };

  return (
    <Card className="shadow-sm border-purple-200">
      <CardHeader className="bg-purple-50 border-b py-2 px-3">
        <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          التخصصات المراد مقارنتها
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            {selected.length === 0 ? 'الكل' : selected.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-wrap gap-1.5">
          {availableSpecialties.map((sp) => {
            const isSelected = selected.includes(sp);
            return (
              <button
                key={sp}
                type="button"
                onClick={() => toggle(sp)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {sp}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}