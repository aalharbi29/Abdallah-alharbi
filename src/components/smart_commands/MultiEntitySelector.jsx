import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { ENTITIES_CATALOG } from './entitiesCatalog';

// اختيار كيان واحد أو أكثر — الأول هو الكيان الأساسي والباقي يُدمج عند الإمكان
export default function MultiEntitySelector({ selectedEntities, onChange }) {
  const toggle = (entityValue) => {
    if (selectedEntities.includes(entityValue)) {
      onChange(selectedEntities.filter((e) => e !== entityValue));
    } else {
      onChange([...selectedEntities, entityValue]);
    }
  };

  const makePrimary = (entityValue) => {
    // نقل الكيان لأول القائمة
    const others = selectedEntities.filter((e) => e !== entityValue);
    onChange([entityValue, ...others]);
  };

  return (
    <div className="space-y-3">
      {selectedEntities.length > 0 && (
        <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
          💡 الكيان الأول (<strong>{ENTITIES_CATALOG.find((e) => e.value === selectedEntities[0])?.label}</strong>) هو الأساسي.
          الكيانات الأخرى ستُدمج معه عبر العلاقات التلقائية (المركز، الموظف). اضغط على أي كيان مختار لجعله الأساسي.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {ENTITIES_CATALOG.map((entity) => {
          const active = selectedEntities.includes(entity.value);
          const isPrimary = active && selectedEntities[0] === entity.value;
          return (
            <button
              key={entity.value}
              type="button"
              onClick={() => (active ? makePrimary(entity.value) : toggle(entity.value))}
              onContextMenu={(e) => {
                e.preventDefault();
                toggle(entity.value);
              }}
              className={`relative p-3 rounded-lg border-2 text-right transition-all ${
                isPrimary
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-700 text-white shadow-lg'
                  : active
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl">{entity.icon}</span>
                {isPrimary && (
                  <Badge className="bg-white text-indigo-700 text-[10px] px-1.5">أساسي</Badge>
                )}
                {active && !isPrimary && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className={`text-sm font-semibold mt-1 ${isPrimary ? 'text-white' : ''}`}>
                {entity.label}
              </div>
              {active && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(entity.value);
                  }}
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${isPrimary ? 'bg-white/20 hover:bg-white/40 text-white' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                  title="إلغاء الاختيار"
                >
                  ×
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}