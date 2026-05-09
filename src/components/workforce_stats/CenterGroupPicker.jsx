import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, CheckSquare, Square, Zap } from 'lucide-react';
import { AFFAIRS_GROUPS, matchAffairsGroup } from './affairsGroups';

const colorMap = {
  blue: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  emerald: { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function CenterGroupPicker({ title, centers, selected, onChange, color = 'blue' }) {
  const [search, setSearch] = useState('');
  const c = colorMap[color] || colorMap.blue;

  const filtered = useMemo(() => {
    if (!search.trim()) return centers;
    const q = search.toLowerCase();
    return centers.filter((center) => center.toLowerCase().includes(q));
  }, [centers, search]);

  const toggle = (center) => {
    if (selected.includes(center)) {
      onChange(selected.filter((s) => s !== center));
    } else {
      onChange([...selected, center]);
    }
  };

  const selectAll = () => onChange([...new Set([...selected, ...filtered])]);
  const clearAll = () => onChange([]);

  const applyShortcut = (groupKey) => {
    const matched = matchAffairsGroup(centers, groupKey);
    if (matched.length === 0) return;
    onChange(matched);
  };

  return (
    <Card className={`shadow-sm ${c.border} border-2`}>
      <CardHeader className={`${c.bg} border-b py-2 px-3`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm ${c.text} flex items-center gap-2`}>
            {title}
            <Badge variant="outline" className={c.badge}>{selected.length}</Badge>
          </CardTitle>
          {selected.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 px-2 text-xs text-red-600 hover:bg-red-50">
              <X className="w-3 h-3 ml-1" /> مسح
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        {/* أزرار الاختصار للشؤون */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(AFFAIRS_GROUPS).map(([key, grp]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => applyShortcut(key)}
              className="h-7 text-[11px] gap-1 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              title={grp.centers.join('، ')}
            >
              <Zap className="w-3 h-3" /> {grp.label}
            </Button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pr-7 text-sm"
          />
        </div>

        <div className="flex justify-between items-center px-1">
          <button type="button" onClick={selectAll} className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <CheckSquare className="w-3 h-3" /> تحديد الظاهر
          </button>
          <span className="text-xs text-slate-400">{filtered.length} مركز</span>
        </div>

        <ScrollArea className="h-48 border rounded-md bg-white">
          <div className="p-1">
            {filtered.map((center) => {
              const isSelected = selected.includes(center);
              return (
                <button
                  key={center}
                  type="button"
                  onClick={() => toggle(center)}
                  className={`w-full text-right text-sm px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                    isSelected ? `${c.bg} ${c.text} font-semibold` : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0 text-slate-300" />}
                  <span className="truncate">{center}</span>
                </button>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-xs text-slate-400 py-4">لا نتائج</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}