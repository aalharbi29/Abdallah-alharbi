import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, X, Sparkles, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { getGroupsForEntity } from './entityGroups';

// مكون اختيار الحقول بواجهة احترافية مجمعة + دعم فلتر القيم
export default function FieldGroupPicker({
  entity,
  selectedFields,
  onChange,
  onFilterIconClick, // callback لفتح فلتر قيم حقل معين
  activeValueFilters = {}, // { fieldKey: [values] } — لعرض شارة الفلتر النشط
}) {
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState({});

  const groups = useMemo(() => {
    if (!entity) return null;
    const predefined = getGroupsForEntity(entity.value);
    if (predefined) {
      // تحويل مفاتيح الحقول إلى كائنات {key, label}
      return predefined.map((g) => ({
        label: g.label,
        fields: g.fields
          .map((fk) => entity.fields.find((f) => f.key === fk))
          .filter(Boolean),
      }));
    }
    // fallback: مجموعة واحدة بكل الحقول
    return [{ label: '📋 كل الحقول', fields: entity.fields }];
  }, [entity]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        fields: g.fields.filter(
          (f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.fields.length > 0);
  }, [groups, search]);

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

  const toggleGroup = (groupLabel) => {
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const selectGroup = (group) => {
    const groupKeys = group.fields.map((f) => f.key);
    const allSelected = groupKeys.every((k) => selectedFields.includes(k));
    if (allSelected) {
      onChange(selectedFields.filter((f) => !groupKeys.includes(f)));
    } else {
      onChange(Array.from(new Set([...selectedFields, ...groupKeys])));
    }
  };

  const clearAll = () => onChange([]);
  const applyPreset = (preset) => onChange(preset.fields);

  // إذا كان المستخدم يبحث، افتح كل المجموعات التي بها نتائج
  const isSearchingActive = search.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* قوالب جاهزة */}
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

      {/* بحث وأزرار */}
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
        <Button size="sm" variant="outline" onClick={clearAll} className="h-9">
          <X className="w-4 h-4 ml-1" /> مسح الكل
        </Button>
      </div>

      {/* ملخص المختار */}
      {selectedFields.length > 0 && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 font-medium">
            ✓ عدد الحقول المختارة: {selectedFields.length}
          </p>
        </div>
      )}

      {/* المجموعات */}
      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {filteredGroups.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6 bg-white border rounded-lg">
            لا توجد حقول مطابقة
          </p>
        ) : (
          filteredGroups.map((group) => {
            const groupKeys = group.fields.map((f) => f.key);
            const selectedInGroup = groupKeys.filter((k) => selectedFields.includes(k)).length;
            const totalInGroup = groupKeys.length;
            const allSelected = selectedInGroup === totalInGroup && totalInGroup > 0;
            const someSelected = selectedInGroup > 0 && !allSelected;
            const isOpen = isSearchingActive || openGroups[group.label];

            return (
              <div
                key={group.label}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center gap-2 flex-1 text-right"
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    <span className="text-sm font-semibold text-slate-700">{group.label}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${allSelected ? 'bg-green-100 border-green-300 text-green-700' : someSelected ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-slate-100'}`}
                    >
                      {selectedInGroup}/{totalInGroup}
                    </Badge>
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 text-xs ${allSelected ? 'text-red-600' : 'text-green-600'}`}
                    onClick={() => selectGroup(group)}
                  >
                    {allSelected ? 'إلغاء المجموعة' : 'اختر الكل'}
                  </Button>
                </div>

                {isOpen && (
                  <div className="p-3 flex flex-wrap gap-2">
                    {group.fields.map((field) => {
                      const active = selectedFields.includes(field.key);
                      const hasValueFilter = activeValueFilters[field.key]?.length > 0;
                      return (
                        <div key={field.key} className="flex items-center gap-1">
                          <Badge
                            variant={active ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all ${active ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:border-green-300'}`}
                            onClick={() => toggle(field.key)}
                          >
                            {active && <CheckCircle2 className="w-3 h-3 ml-1" />}
                            {field.label}
                          </Badge>
                          {active && onFilterIconClick && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFilterIconClick(field.key, field.label);
                              }}
                              className={`p-1 rounded hover:bg-indigo-100 transition-colors ${hasValueFilter ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-indigo-600'}`}
                              title="فلترة بقيم محددة لهذا الحقل"
                            >
                              <Filter className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}