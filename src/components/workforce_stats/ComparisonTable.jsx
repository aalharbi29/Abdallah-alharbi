import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table as TableIcon, Copy, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ComparisonTable({ specialties, statsA, statsB, totalA, totalB, labelA, labelB, showTotal = true }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const headers = ['م', 'التخصص', labelA, labelB, ...(showTotal ? ['الإجمالي'] : [])];
    const rows = specialties.map((sp, i) => {
      const a = statsA[sp] || 0;
      const b = statsB[sp] || 0;
      return [i + 1, sp, a, b, ...(showTotal ? [a + b] : [])];
    });
    const footer = ['', 'الإجمالي', totalA, totalB, ...(showTotal ? [totalA + totalB] : [])];

    // Tab-separated for spreadsheet apps
    const tsv = [headers, ...rows, footer].map((r) => r.join('\t')).join('\n');

    // HTML for rich-text targets (Word/Email)
    const htmlRows = rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:6px;">${c}</td>`).join('')}</tr>`).join('');
    const html = `<table dir="rtl" style="border-collapse:collapse;font-family:Tajawal,Arial;">
      <thead><tr>${headers.map((h) => `<th style="border:1px solid #ccc;padding:6px;background:#f1f5f9;">${h}</th>`).join('')}</tr></thead>
      <tbody>${htmlRows}</tbody>
      <tfoot><tr>${footer.map((c) => `<td style="border:1px solid #ccc;padding:6px;background:#e2e8f0;font-weight:bold;">${c}</td>`).join('')}</tr></tfoot>
    </table>`;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([tsv], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(tsv);
      }
      setCopied(true);
      toast.success('تم نسخ الجدول — يمكنك لصقه في Excel أو Word.');
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error(e);
      toast.error('تعذّر النسخ.');
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-l from-slate-50 to-white border-b py-3 flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-slate-600" /> جدول المقارنة التفصيلي
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopy} className="border-slate-300 text-slate-700 hover:bg-slate-100">
          {copied ? <ClipboardCheck className="w-4 h-4 ml-1 text-green-600" /> : <Copy className="w-4 h-4 ml-1" />}
          {copied ? 'تم النسخ' : 'نسخ الجدول'}
        </Button>
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