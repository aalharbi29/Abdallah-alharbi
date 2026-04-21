import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, X, Sparkles } from 'lucide-react';

export default function FieldsPicker({ entity, selectedFields, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!entity) return [];
    if (!search.trim()) return entity.fields;
    return entity.fields.filter((f) =>
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase())
    );
  }, [entity, search]);

  if (!entity) {
    return (
      <div className="text-center py-8 text-slate-400 bg-white rounded-lg border border-dashed">
        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">اختر نوع البيانات أولاً لعرض الحقول المتاحة</p>
      </div>
    );
  }

  const toggle = (fieldKey) => {
    if (selectedFields.includes(fieldKey)) {
      onChange(selectedFields.filter((f) => f !== fieldKey));
    } else {
      onChange([...selectedFields, fieldKey]);
    }
  };

  const selectAll = () => onChange(entity.fields.map((f) => f.key));
  const clearAll = () => onChange([]);
  const applyPreset = (preset) => onChange(preset.fields);

  return (
    <div className="space-y-3">
      {entity.presets && entity.presets.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 mb-2 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> قوالب جاهزة:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entity.presets.map((preset, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer bg-white hover:bg-amber-100 border-amber-300 text-amber-800"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="ابحث عن حقل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 bg-white"
          />
        </div>
        <Button size="sm" variant="outline" onClick={selectAll} className="h-9">
          <CheckCircle2 className="w-4 h-4 ml-1" /> الكل ({entity.fields.length})
        </Button>
        <Button size="sm" variant="outline" onClick={clearAll} className="h-9">
          <X className="w-4 h-4 ml-1" /> مسح
        </Button>
      </div>

      {selectedFields.length > 0 && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 mb-2 font-medium">
            الحقول المختارة ({selectedFields.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedFields.map((fk) => {
              const f = entity.fields.find((x) => x.key === fk);
              return (
                <Badge
                  key={fk}
                  className="bg-green-600 hover:bg-red-500 cursor-pointer"
                  onClick={() => toggle(fk)}
                >
                  {f?.label || fk} <X className="w-3 h-3 mr-1" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-h-[280px] overflow-y-auto p-3 bg-white border rounded-lg">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">لا توجد حقول مطابقة</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((field) => {
              const active = selectedFields.includes(field.key);
              return (
                <Badge
                  key={field.key}
                  variant={active ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    active ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:border-green-300'
                  }`}
                  onClick={() => toggle(field.key)}
                >
                  {active && <CheckCircle2 className="w-3 h-3 ml-1" />}
                  {field.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}