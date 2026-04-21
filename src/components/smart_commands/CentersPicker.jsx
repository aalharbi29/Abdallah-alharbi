import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle2, X } from 'lucide-react';

export default function CentersPicker({ centersList, selectedCenters, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return centersList;
    return centersList.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  }, [centersList, search]);

  const toggle = (center) => {
    if (selectedCenters.includes(center)) {
      onChange(selectedCenters.filter((c) => c !== center));
    } else {
      onChange([...selectedCenters, center]);
    }
  };

  const selectAll = () => onChange([...centersList]);
  const clearAll = () => onChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="ابحث عن مركز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 bg-white"
          />
        </div>
        <Button size="sm" variant="outline" onClick={selectAll} className="h-9">
          <CheckCircle2 className="w-4 h-4 ml-1" /> اختر الكل ({centersList.length})
        </Button>
        <Button size="sm" variant="outline" onClick={clearAll} className="h-9">
          <X className="w-4 h-4 ml-1" /> مسح
        </Button>
      </div>

      {selectedCenters.length > 0 && (
        <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-xs text-indigo-700 mb-2 font-medium">
            المراكز المختارة ({selectedCenters.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedCenters.map((c) => (
              <Badge
                key={c}
                className="bg-indigo-600 hover:bg-red-500 cursor-pointer"
                onClick={() => toggle(c)}
              >
                {c} <X className="w-3 h-3 mr-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-[280px] overflow-y-auto p-3 bg-white border rounded-lg">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">لا توجد مراكز مطابقة</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((center) => {
              const active = selectedCenters.includes(center);
              return (
                <Badge
                  key={center}
                  variant={active ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    active ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
                  onClick={() => toggle(center)}
                >
                  {active && <CheckCircle2 className="w-3 h-3 ml-1" />}
                  {center}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        💡 إذا لم تختر أي مركز، سيتم جلب البيانات من <strong>جميع المراكز</strong>.
      </p>
    </div>
  );
}