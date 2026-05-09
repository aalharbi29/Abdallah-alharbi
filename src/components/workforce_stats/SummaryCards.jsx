import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SummaryCards({ totalA, totalB, centersA, centersB, labelA, labelB }) {
  const diff = totalA - totalB;
  const DiffIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const diffColor = diff > 0 ? 'text-blue-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-500';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border-blue-200 shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg"><Users className="w-5 h-5 text-blue-700" /></div>
          <div>
            <p className="text-xs text-slate-500 truncate" title={labelA}>{labelA}</p>
            <p className="text-2xl font-bold text-blue-700">{totalA}</p>
            <p className="text-[10px] text-slate-400">موظف في {centersA} مركز</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-emerald-200 shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg"><Users className="w-5 h-5 text-emerald-700" /></div>
          <div>
            <p className="text-xs text-slate-500 truncate" title={labelB}>{labelB}</p>
            <p className="text-2xl font-bold text-emerald-700">{totalB}</p>
            <p className="text-[10px] text-slate-400">موظف في {centersB} مركز</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-lg"><Building2 className="w-5 h-5 text-slate-700" /></div>
          <div>
            <p className="text-xs text-slate-500">إجمالي المراكز</p>
            <p className="text-2xl font-bold text-slate-700">{centersA + centersB}</p>
            <p className="text-[10px] text-slate-400">في المقارنة</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-amber-200 shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg"><DiffIcon className={`w-5 h-5 ${diffColor}`} /></div>
          <div>
            <p className="text-xs text-slate-500">الفارق</p>
            <p className={`text-2xl font-bold ${diffColor}`}>{Math.abs(diff)}</p>
            <p className="text-[10px] text-slate-400">
              {diff > 0 ? `${labelA} أكثر` : diff < 0 ? `${labelB} أكثر` : 'متساويان'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}