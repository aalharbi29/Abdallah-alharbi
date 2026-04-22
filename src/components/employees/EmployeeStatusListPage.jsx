import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

/**
 * صفحة عامة قابلة لإعادة الاستخدام لعرض قوائم الموظفين حسب حالة معينة.
 * - mode="archived": يستعلم من ArchivedEmployee بفلتر archive_type.
 * - mode="assigned": يستعلم من Employee بفلتر is_externally_assigned=true.
 */
export default function EmployeeStatusListPage({
  mode = 'archived',
  archiveType,
  title,
  subtitle,
  icon: Icon,
  colorClass = 'text-indigo-600',
  gradient = 'from-indigo-500 to-blue-500',
}) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (mode === 'archived') {
        const res = await base44.entities.ArchivedEmployee.filter({ archive_type: archiveType });
        setData(Array.isArray(res) ? res : []);
      } else if (mode === 'assigned') {
        const res = await base44.entities.Employee.filter({ is_externally_assigned: true });
        setData(Array.isArray(res) ? res : []);
      }
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, archiveType]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((e) =>
      (e.full_name_arabic || '').toLowerCase().includes(q) ||
      (e['رقم_الموظف'] || '').toString().includes(q) ||
      (e['رقم_الهوية'] || '').toString().includes(q)
    );
  }, [data, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('HumanResources'))}>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl shadow-lg`}>
            {Icon && <Icon className="w-7 h-7 text-white" />}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{title}</h1>
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          </div>
          <Button variant="outline" onClick={loadData} className="ml-auto gap-2">
            <RefreshCw className="w-4 h-4" /> تحديث
          </Button>
        </div>

        <Card className="shadow-md border-0 bg-white/80">
          <CardHeader className="border-b bg-gradient-to-l from-slate-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className={colorClass}>{title}</span>
                <Badge variant="secondary">{filtered.length}</Badge>
              </CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="بحث بالاسم، الرقم الوظيفي، أو الهوية..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                جاري التحميل...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">لا توجد سجلات.</div>
            ) : (
              <div className="divide-y">
                {filtered.map((emp) => (
                  <div key={emp.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-800">{emp.full_name_arabic}</h3>
                          {emp['رقم_الموظف'] && <Badge variant="outline" className="text-xs">{emp['رقم_الموظف']}</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                          <div><strong>التخصص:</strong> {emp.position || '—'}</div>
                          <div><strong>المركز:</strong> {emp['المركز_الصحي'] || '—'}</div>
                          {mode === 'archived' && (
                            <>
                              <div><strong>تاريخ النقل:</strong> {emp.archive_date ? format(new Date(emp.archive_date), 'yyyy-MM-dd') : '—'}</div>
                              {emp.new_workplace && <div><strong>الجهة الجديدة:</strong> {emp.new_workplace}</div>}
                            </>
                          )}
                          {mode === 'assigned' && (
                            <>
                              <div><strong>الجهة المكلف بها:</strong> {emp.external_assignment_center || '—'}</div>
                              <div><strong>نهاية التكليف:</strong> {emp.external_assignment_indefinite ? 'حتى إشعار آخر' : (emp.external_assignment_end_date ? format(new Date(emp.external_assignment_end_date), 'yyyy-MM-dd') : '—')}</div>
                            </>
                          )}
                        </div>
                        {(emp.archive_reason || emp.external_assignment_reason) && (
                          <div className="mt-2 text-xs text-slate-500">
                            <strong>السبب:</strong> {emp.archive_reason || emp.external_assignment_reason}
                          </div>
                        )}
                      </div>
                      {mode === 'assigned' && emp.id && (
                        <Link to={createPageUrl(`EmployeeProfile?id=${emp.id}`)}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" /> عرض الملف
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}