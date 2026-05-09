import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronLeft, Building2, Users, Layers } from 'lucide-react';
import { inferMainSpecialty } from '@/components/utils/employeeSpecialties';

const normalize = (s) => String(s || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase().trim();

const matchesCenter = (empCenter, target) => {
  const a = normalize(empCenter);
  const b = normalize(target);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
};

function CenterBlock({ centerName, employees, activeSpecs, color }) {
  const [open, setOpen] = useState(false);
  const [openSpec, setOpenSpec] = useState(null);

  const centerEmps = useMemo(
    () => employees.filter((e) => matchesCenter(e['المركز_الصحي'], centerName)),
    [employees, centerName]
  );

  const bySpecialty = useMemo(() => {
    const map = {};
    activeSpecs.forEach((sp) => { map[sp] = []; });
    centerEmps.forEach((e) => {
      const sp = inferMainSpecialty(e);
      if (activeSpecs.includes(sp)) map[sp].push(e);
    });
    return map;
  }, [centerEmps, activeSpecs]);

  const total = activeSpecs.reduce((s, sp) => s + (bySpecialty[sp]?.length || 0), 0);

  return (
    <div className={`border rounded-lg ${color.border} bg-white overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 ${color.bg} hover:opacity-90 transition`}
      >
        <div className="flex items-center gap-2">
          <Building2 className={`w-4 h-4 ${color.text}`} />
          <span className={`font-semibold text-sm ${color.text}`}>{centerName}</span>
          <Badge variant="outline" className={color.badge}>{total} موظف</Badge>
        </div>
        {open ? <ChevronDown className={`w-4 h-4 ${color.text}`} /> : <ChevronLeft className={`w-4 h-4 ${color.text}`} />}
      </button>

      {open && (
        <div className="p-2 space-y-1.5">
          {activeSpecs.map((sp) => {
            const list = bySpecialty[sp] || [];
            if (list.length === 0) return null;
            const isOpenSp = openSpec === sp;
            return (
              <div key={sp} className="border rounded-md bg-slate-50/40">
                <button
                  type="button"
                  onClick={() => setOpenSpec(isOpenSp ? null : sp)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{sp}</span>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 text-[10px]">{list.length}</Badge>
                  </div>
                  {isOpenSp ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                {isOpenSp && (
                  <ol className="px-3 py-2 space-y-0.5 text-sm text-slate-700 list-decimal list-inside bg-white border-t">
                    {list.map((e) => (
                      <li key={e.id} className="py-0.5">
                        <span className="font-medium">{e.full_name_arabic || '—'}</span>
                        {e.position && <span className="text-xs text-slate-500 mr-2">— {e.position}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
          {total === 0 && <p className="text-xs text-slate-400 text-center py-2">لا يوجد موظفون مطابقون لهذه التخصصات.</p>}
        </div>
      )}
    </div>
  );
}

const COLORS = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default function DetailedBreakdown({ groupA, groupB, labelA, labelB, employees, activeSpecs }) {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-600" /> التفاصيل لكل مركز وتخصص (مع أسماء الموظفين)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-blue-700 px-1">{labelA}</h3>
          {groupA.map((c) => (
            <CenterBlock key={c} centerName={c} employees={employees} activeSpecs={activeSpecs} color={COLORS.blue} />
          ))}
          {groupA.length === 0 && <p className="text-xs text-slate-400 text-center py-3">لم تختر مراكز.</p>}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-emerald-700 px-1">{labelB}</h3>
          {groupB.map((c) => (
            <CenterBlock key={c} centerName={c} employees={employees} activeSpecs={activeSpecs} color={COLORS.emerald} />
          ))}
          {groupB.length === 0 && <p className="text-xs text-slate-400 text-center py-3">لم تختر مراكز.</p>}
        </div>
      </CardContent>
    </Card>
  );
}