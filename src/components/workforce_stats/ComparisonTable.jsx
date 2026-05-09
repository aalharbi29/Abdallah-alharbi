import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table as TableIcon } from 'lucide-react';

export default function ComparisonTable({ specialties, statsA, statsB, totalA, totalB, labelA, labelB, showTotal = true }) {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-slate-600" /> جدول المقارنة التفصيلي
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gradient-to-b from-slate-100 to-slate-50">
              <tr>
                <th className="p-3 border-b font-semibold text-slate-700 w-12">م</th>
                <th className="p-3 border-b font-semibold text-slate-700">التخصص</th>
                <th className="p-3 border-b font-semibold text-blue-700 bg-blue-50">{labelA}</th>
                <th className="p-3 border-b font-semibold text-emerald-700 bg-emerald-50">{labelB}</th>
                {showTotal && <th className="p-3 border-b font-semibold text-slate-700">الإجمالي</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specialties.map((sp, i) => {
                const a = statsA[sp] || 0;
                const b = statsB[sp] || 0;
                return (
                  <tr key={sp} className="hover:bg-slate-50/60">
                    <td className="p-3 text-slate-500">{i + 1}</td>
                    <td className="p-3 font-medium text-slate-800">{sp}</td>
                    <td className="p-3 text-blue-700 font-bold bg-blue-50/40">{a}</td>
                    <td className="p-3 text-emerald-700 font-bold bg-emerald-50/40">{b}</td>
                    {showTotal && <td className="p-3 text-slate-700 font-semibold">{a + b}</td>}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold">
              <tr>
                <td className="p-3 border-t" colSpan={2}>الإجمالي</td>
                <td className="p-3 border-t text-blue-700 bg-blue-100">{totalA}</td>
                <td className="p-3 border-t text-emerald-700 bg-emerald-100">{totalB}</td>
                {showTotal && <td className="p-3 border-t text-slate-800">{totalA + totalB}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}