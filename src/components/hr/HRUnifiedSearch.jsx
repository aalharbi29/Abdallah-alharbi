import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Eye, Briefcase, Award, UserMinus, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { matchScore } from '@/components/utils/arabicSearch';

/**
 * بحث موحّد في الموارد البشرية:
 * يبحث في الموظفين النشطين + المكلفين خارجياً + المؤرشفين (متقاعد/مستقيل/منقول)
 * يعرض نتيجة موحّدة فقط عندما يكون هناك نص بحث.
 */
export default function HRUnifiedSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [archived, setArchived] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [emps, arch] = await Promise.all([
          base44.entities.Employee.list('-updated_date', 1000).catch(() => []),
          base44.entities.ArchivedEmployee.list('-archive_date', 1000).catch(() => []),
        ]);
        if (!cancelled) {
          setActiveEmployees(Array.isArray(emps) ? emps : []);
          setArchived(Array.isArray(arch) ? arch : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return [];

    const activeScored = activeEmployees
      .map(e => ({ emp: e, score: matchScore(e, q), kind: e.is_externally_assigned ? 'assigned' : 'active' }))
      .filter(x => x.score > 0);

    const archivedScored = archived
      .map(e => ({ emp: e, score: matchScore(e, q), kind: e.archive_type || 'archived', profileId: e.original_employee_id }))
      .filter(x => x.score > 0);

    const all = [...activeScored, ...archivedScored].sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      const na = (a.emp.full_name_arabic || '').localeCompare(b.emp.full_name_arabic || '', 'ar');
      return na;
    });

    return all.map(x => ({ ...x.emp, _statusKind: x.kind, _profileId: x.profileId }));
  }, [query, activeEmployees, archived]);

  const renderStatusBadge = (kind) => {
    const map = {
      active: { label: 'نشط', className: 'bg-green-100 text-green-800', Icon: UserCheck },
      assigned: { label: 'مكلف خارجياً', className: 'bg-amber-100 text-amber-800', Icon: Briefcase },
      retired: { label: 'متقاعد', className: 'bg-purple-100 text-purple-800', Icon: Award },
      resigned: { label: 'مستقيل', className: 'bg-rose-100 text-rose-800', Icon: UserMinus },
      terminated: { label: 'منهى خدمته', className: 'bg-red-100 text-red-800', Icon: UserMinus },
      transferred: { label: 'منقول', className: 'bg-blue-100 text-blue-800', Icon: UserMinus },
      contract_not_renewed: { label: 'لم يُجدد عقده', className: 'bg-orange-100 text-orange-800', Icon: UserMinus },
    };
    const cfg = map[kind] || { label: 'أرشيف', className: 'bg-slate-200 text-slate-800', Icon: UserMinus };
    const { Icon } = cfg;
    return (
      <Badge className={`${cfg.className} gap-1`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardContent className="p-5 md:p-8">
        <div className="text-center mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">ابحث عن أي موظف</h2>
          <p className="text-slate-500 text-sm">
            البحث بالاسم، رقم الموظف، الجوال، الهوية، المركز، التخصص، الجنسية أو المؤهل — يشمل النشطين، المكلفين، المتقاعدين والمستقيلين.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثال: محمد، 1234، 0555، طلال، طبيب..."
            className="pr-12 h-12 md:h-14 text-base md:text-lg rounded-2xl border-2 border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200"
          />
        </div>

        {query.trim() && (
          <div className="mt-6 max-w-3xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> جاري البحث...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                لا توجد نتائج مطابقة لـ "<span className="font-semibold">{query}</span>"
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">
                    عدد النتائج: <Badge variant="secondary">{matches.length}</Badge>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setQuery('')}>مسح</Button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {matches.map((emp) => {
                    const profileId = emp._profileId || emp.id;
                    return (
                      <div
                        key={`${emp._statusKind}-${emp.id}`}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-slate-800 truncate">{emp.full_name_arabic}</h3>
                            {emp['رقم_الموظف'] && (
                              <Badge variant="outline" className="text-[10px]">{emp['رقم_الموظف']}</Badge>
                            )}
                            {renderStatusBadge(emp._statusKind)}
                          </div>
                          <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                            {emp.position && <span>🏷️ {emp.position}</span>}
                            {emp['المركز_الصحي'] && <span>🏥 {emp['المركز_الصحي']}</span>}
                            {emp.phone && <span>📱 {emp.phone}</span>}
                            {emp.nationality && <span>🌐 {emp.nationality}</span>}
                          </div>
                        </div>
                        {profileId && (
                          <Link to={createPageUrl(`EmployeeProfile?id=${profileId}`)}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="w-4 h-4" /> الملف
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}