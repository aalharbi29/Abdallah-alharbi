import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, X, Filter } from 'lucide-react';
import { getEnumOptionsForField } from './entityGroups';
import { getNestedValue } from './excelExporter';

// Dialog لفلترة قيم حقل معين
// يستعرض القيم المتاحة (enum ثابت أو قيم فريدة من البيانات)
// ويتيح للمستخدم اختيار قيم محددة لعمل فلتر دقيق
export default function FieldValueFilterDialog({
  open,
  onClose,
  entityValue,
  fieldKey,
  fieldLabel,
  currentValues = [],
  onApply,
  sampleData = [], // البيانات الفعلية لاستخراج القيم الفريدة
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setSelected(currentValues || []);
      setSearch('');
    }
  }, [open, currentValues]);

  const availableOptions = useMemo(() => {
    if (!fieldKey) return [];
    // جرّب enum ثابت أولاً
    const enumOpts = getEnumOptionsForField(entityValue, fieldKey);
    if (enumOpts) return enumOpts;
    // وإلا، استخرج قيم فريدة من البيانات
    const unique = new Set();
    sampleData.forEach((row) => {
      const val = getNestedValue(row, fieldKey);
      if (val !== null && val !== undefined && val !== '') {
        if (Array.isArray(val)) {
          val.forEach((v) => v && unique.add(String(v)));
        } else if (typeof val !== 'object') {
          unique.add(String(val));
        }
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [entityValue, fieldKey, sampleData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return availableOptions;
    const q = search.toLowerCase();
    return availableOptions.filter((opt) => String(opt).toLowerCase().includes(q));
  }, [availableOptions, search]);

  const toggle = (val) => {
    if (selected.includes(val)) {
      setSelected(selected.filter((s) => s !== val));
    } else {
      setSelected([...selected, val]);
    }
  };

  const selectAll = () => setSelected([...availableOptions]);
  const clearAll = () => setSelected([]);

  const handleApply = () => {
    onApply(fieldKey, selected);
    onClose();
  };

  const handleClearFilter = () => {
    onApply(fieldKey, []);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            فلترة قيم حقل: <span className="text-indigo-700">{fieldLabel}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {availableOptions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg">
              لا توجد قيم متاحة لهذا الحقل في البيانات الحالية.
              <br />
              <span className="text-xs">قد تحتاج لتنفيذ الأمر مرة أولى لجلب البيانات ثم إعادة الفلترة.</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="ابحث عن قيمة..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-9"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={selectAll} className="h-9">
                  الكل
                </Button>
                <Button size="sm" variant="outline" onClick={clearAll} className="h-9">
                  مسح
                </Button>
              </div>

              <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
                💡 اختر القيم التي تريد أن تظهر في التقرير. عند عدم الاختيار سيُعرض كل شيء.
                {selected.length > 0 && (
                  <span className="block mt-1 font-semibold">تم اختيار {selected.length} قيمة</span>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto p-3 bg-white border rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {filtered.map((opt) => {
                    const active = selected.includes(opt);
                    return (
                      <Badge
                        key={opt}
                        variant={active ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${active ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-indigo-50 hover:border-indigo-300'}`}
                        onClick={() => toggle(opt)}
                      >
                        {active && <CheckCircle2 className="w-3 h-3 ml-1" />}
                        {opt}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {currentValues.length > 0 && (
            <Button variant="outline" onClick={handleClearFilter} className="text-red-600 border-red-200 hover:bg-red-50">
              <X className="w-4 h-4 ml-1" /> إزالة الفلتر
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-700">
            <CheckCircle2 className="w-4 h-4 ml-1" /> تطبيق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}