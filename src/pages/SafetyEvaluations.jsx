import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ShieldCheck, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function SafetyEvaluations() {
  const { data, isLoading } = useQuery({
    queryKey: ['safetyEvaluations'],
    queryFn: () => base44.entities.SafetyEvaluation.list('-created_date', 100),
    initialData: [],
  });

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">سجل تقييمات الأمن والسلامة</h1>
              <p className="text-gray-600 text-sm">استعرض التقييمات السابقة واطبع أي تقرير</p>
            </div>
          </div>
          <Link to="/FillSafetyEvaluationForm">
            <Button className="gap-2">تقييم جديد</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <Card className="bg-white/70">
            <CardContent className="p-8 text-center text-gray-600">لا توجد تقييمات حتى الآن</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((r) => (
              <Card key={r.id} className="bg-white/80 card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{r.health_center || '—'}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {r.report_date ? r.report_date : (r.created_date ? format(new Date(r.created_date), 'yyyy-MM-dd') : '—')}
                    </Badge>
                  </CardTitle>
                  <CardDescription>معد التقرير: {r.prepared_by || '—'}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <div className="text-xs text-gray-500">عدد البنود: {Array.isArray(r.items) ? r.items.length : 0}</div>
                  <Link to={`/ViewSafetyEvaluation?id=${r.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" /> عرض/طباعة
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}