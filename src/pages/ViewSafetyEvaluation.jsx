import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';

export default function ViewSafetyEvaluation() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const { data, isLoading } = useQuery({
    queryKey: ['safetyEvaluation', id],
    enabled: !!id,
    queryFn: async () => {
      const arr = await base44.entities.SafetyEvaluation.filter({ id });
      return arr?.[0] || null;
    },
  });

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen p-4 md:p-6 bg-white">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">عرض تقرير الأمن والسلامة</h1>
              <p className="text-gray-600 text-sm">معاينة جاهزة للطباعة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowRight className="w-4 h-4" /> عودة
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> طباعة
            </Button>
          </div>
        </div>

        {(!id) && (
          <Card className="print:hidden">
            <CardContent className="p-6 text-center text-gray-600">لا يوجد معرف تقرير في الرابط</CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <Card className="print:hidden">
            <CardContent className="p-6 text-center text-gray-600">تعذر العثور على التقرير</CardContent>
          </Card>
        ) : (
          <div className="bg-white print:bg-white print:shadow-none">
            {/* رأس التقرير للطباعة */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">تقرير الأمن والسلامة</h2>
              <div className="mt-1 text-gray-600 text-sm">اسم المركز: {data.health_center || '—'}</div>
              <div className="mt-1 text-gray-600 text-sm flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>تاريخ التقرير: {data.report_date || '—'}</span>
              </div>
            </div>

            <Card className="shadow-soft print:shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">البيانات الأساسية</CardTitle>
                <CardDescription>تفاصيل التقرير</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">اسم المركز الصحي</div>
                  <div className="font-semibold">{data.health_center || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">تاريخ التقرير</div>
                  <div className="font-semibold">{data.report_date || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">معد التقرير</div>
                  <div className="font-semibold">{data.prepared_by || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">التوقيع</div>
                  <div className="font-semibold">{data.signature || '—'}</div>
                </div>
                {data.notes && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-500 mb-1">ملاحظات عامة</div>
                    <div className="font-semibold whitespace-pre-wrap">{data.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              <h3 className="font-bold mb-3">بنود التقييم</h3>
              <div className="space-y-3">
                {(data.items || []).map((it, idx) => (
                  <Card key={idx} className="shadow-soft print:shadow-none">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-gray-900">{it.criterion || `بند ${idx + 1}`}</div>
                        {it.status && (
                          <Badge className={
                            it.status === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            it.status === 'partial' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }>
                            {it.status === 'available' ? 'متوفر' : it.status === 'partial' ? 'جزئي' : 'غير متوفر'}
                          </Badge>
                        )}
                      </div>
                      {it.notes && (
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{it.notes}</div>
                      )}

                      {Array.isArray(it.proof_images) && it.proof_images.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {it.proof_images.map((url, i) => (
                            <div key={i} className="w-full aspect-square border rounded-lg overflow-hidden bg-gray-50 print:border-0">
                              <img src={url} alt="proof" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}