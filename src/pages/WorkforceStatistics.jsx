import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, FileSpreadsheet, Printer, Sparkles, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { inferMainSpecialty, MAIN_SPECIALTIES } from '@/components/utils/employeeSpecialties';
import CenterGroupPicker from '@/components/workforce_stats/CenterGroupPicker';
import SpecialtyPicker from '@/components/workforce_stats/SpecialtyPicker';
import ComparisonTable from '@/components/workforce_stats/ComparisonTable';
import ComparisonChart from '@/components/workforce_stats/ComparisonChart';
import SummaryCards from '@/components/workforce_stats/SummaryCards';
import { exportComparisonExcel, printComparison } from '@/components/workforce_stats/exportComparison';

const normalize = (s) => String(s || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase().trim();

export default function WorkforceStatistics() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [centers, setCenters] = useState([]);
  const [groupA, setGroupA] = useState([]);
  const [groupB, setGroupB] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [labelA, setLabelA] = useState('المجموعة أ');
  const [labelB, setLabelB] = useState('المجموعة ب');

  useEffect(() => {
    Promise.all([
      base44.entities.Employee.filter({}),
      base44.entities.HealthCenter.filter({}),
    ]).then(([emps, cnts]) => {
      setEmployees(emps || []);
      setCenters((cnts || []).map((c) => c['اسم_المركز']).filter(Boolean).sort());
    }).finally(() => setLoading(false));
  }, []);

  const availableSpecialties = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => set.add(inferMainSpecialty(e)));
    return MAIN_SPECIALTIES.filter((s) => set.has(s));
  }, [employees]);

  const computeStats = (centerNames) => {
    if (centerNames.length === 0) return { stats: {}, total: 0 };
    const normTargets = centerNames.map(normalize);
    const filtered = employees.filter((e) => {
      const ec = normalize(e['المركز_الصحي']);
      return ec && normTargets.some((t) => t === ec || ec.includes(t) || t.includes(ec));
    });
    const stats = {};
    const activeSpecs = specialties.length > 0 ? specialties : availableSpecialties;
    activeSpecs.forEach((sp) => { stats[sp] = 0; });
    filtered.forEach((e) => {
      const sp = inferMainSpecialty(e);
      if (activeSpecs.includes(sp)) stats[sp] = (stats[sp] || 0) + 1;
    });
    const total = Object.values(stats).reduce((s, v) => s + v, 0);
    return { stats, total };
  };

  const { statsA, totalA } = useMemo(() => {
    const r = computeStats(groupA);
    return { statsA: r.stats, totalA: r.total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupA, specialties, employees, availableSpecialties]);

  const { statsB, totalB } = useMemo(() => {
    const r = computeStats(groupB);
    return { statsB: r.stats, totalB: r.total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupB, specialties, employees, availableSpecialties]);

  const activeSpecs = specialties.length > 0 ? specialties : availableSpecialties;
  const ready = groupA.length > 0 && groupB.length > 0;

  const handleExportExcel = async () => {
    try {
      await exportComparisonExcel({
        specialties: activeSpecs, statsA, statsB, totalA, totalB,
        labelA, labelB, centersA: groupA, centersB: groupB,
      });
      toast.success('تم تصدير ملف Excel بنجاح.');
    } catch (e) { console.error(e); toast.error('فشل تصدير Excel.'); }
  };

  const handlePrint = () => {
    printComparison({
      specialties: activeSpecs, statsA, statsB, totalA, totalB,
      labelA, labelB, centersA: groupA, centersB: groupB,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
          <Scale className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">إحصائيات الكوادر — مقارنة المجموعات</h1>
          <p className="text-slate-500 text-sm mt-0.5">قارن بين مجموعتين من المراكز الصحية حسب التخصصات.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-blue-700 mb-1 block">اسم المجموعة الأولى</label>
          <Input value={labelA} onChange={(e) => setLabelA(e.target.value)} className="bg-white border-blue-200" />
        </div>
        <div>
          <label className="text-xs font-semibold text-emerald-700 mb-1 block">اسم المجموعة الثانية</label>
          <Input value={labelB} onChange={(e) => setLabelB(e.target.value)} className="bg-white border-emerald-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CenterGroupPicker title={labelA} centers={centers} selected={groupA} onChange={setGroupA} color="blue" />
        <CenterGroupPicker title={labelB} centers={centers} selected={groupB} onChange={setGroupB} color="emerald" />
      </div>

      <SpecialtyPicker selected={specialties} onChange={setSpecialties} availableSpecialties={availableSpecialties} />
      {specialties.length === 0 && (
        <p className="text-xs text-slate-500 -mt-2 px-2">💡 إذا لم تختر تخصصات، سيتم عرض جميع التخصصات المتوفرة في النظام.</p>
      )}

      {!ready ? (
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">اختر مراكز للمجموعتين لرؤية المقارنة</p>
            <p className="text-xs text-slate-400 mt-1">يجب اختيار مركز واحد على الأقل في كل مجموعة.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <SummaryCards
            totalA={totalA} totalB={totalB}
            centersA={groupA.length} centersB={groupB.length}
            labelA={labelA} labelB={labelB}
          />

          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b py-3 flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">📋 خيارات التصدير</CardTitle>
                <CardDescription className="text-xs mt-0.5">صدّر المقارنة كملف Excel أو اطبعها مباشرة.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel} className="border-green-300 text-green-700 hover:bg-green-50">
                  <FileSpreadsheet className="w-4 h-4 ml-1" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="border-slate-300 text-slate-700 hover:bg-slate-100">
                  <Printer className="w-4 h-4 ml-1" /> طباعة
                </Button>
              </div>
            </CardHeader>
          </Card>

          <ComparisonTable
            specialties={activeSpecs}
            statsA={statsA} statsB={statsB}
            totalA={totalA} totalB={totalB}
            labelA={labelA} labelB={labelB}
          />

          <ComparisonChart
            specialties={activeSpecs}
            statsA={statsA} statsB={statsB}
            labelA={labelA} labelB={labelB}
          />
        </>
      )}
    </div>
  );
}