import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, Award, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PerformanceMetricsReport({ employees, leaves, assignments, healthCenters }) {
  const metrics = useMemo(() => {
    // Calculate metrics per health center
    const centerMetrics = healthCenters.map(center => {
      const centerEmployees = employees.filter(e => e.المركز_الصحي === center.اسم_المركز);
      const centerLeaves = leaves.filter(l => 
        centerEmployees.some(e => e.رقم_الموظف === l.employee_id)
      );
      const centerAssignments = assignments.filter(a =>
        centerEmployees.some(e => e.id === a.employee_record_id)
      );

      const totalLeaveDays = centerLeaves.reduce((sum, leave) => sum + (leave.days_count || 0), 0);
      const avgLeaveDays = centerEmployees.length > 0 ? (totalLeaveDays / centerEmployees.length).toFixed(1) : 0;

      return {
        name: center.اسم_المركز,
        employeeCount: centerEmployees.length,
        leaveCount: centerLeaves.length,
        assignmentCount: centerAssignments.length,
        avgLeaveDays: parseFloat(avgLeaveDays),
        utilizationRate: centerEmployees.length > 0 
          ? ((centerEmployees.length - centerLeaves.filter(l => l.status === 'active').length) / centerEmployees.length * 100).toFixed(1)
          : 0
      };
    }).filter(m => m.employeeCount > 0);

    // Contract type distribution
    const contractTypes = {};
    employees.forEach(emp => {
      const type = emp.contract_type || 'غير محدد';
      contractTypes[type] = (contractTypes[type] || 0) + 1;
    });

    // Job category distribution
    const jobCategories = {};
    employees.forEach(emp => {
      const category = emp.job_category_type || 'غير محدد';
      jobCategories[category] = (jobCategories[category] || 0) + 1;
    });

    return {
      centerMetrics: centerMetrics.sort((a, b) => b.employeeCount - a.employeeCount),
      contractTypes: Object.entries(contractTypes).map(([name, count]) => ({ name, count })),
      jobCategories: Object.entries(jobCategories).map(([name, count]) => ({ name, count })),
      totalMetrics: {
        avgLeaveDaysOverall: (leaves.reduce((sum, l) => sum + (l.days_count || 0), 0) / employees.length).toFixed(1),
        avgAssignmentsPerEmployee: (assignments.length / employees.length).toFixed(2)
      }
    };
  }, [employees, leaves, assignments, healthCenters]);

  const exportToCSV = () => {
    const headers = ['المركز', 'عدد الموظفين', 'الإجازات', 'التكاليف', 'متوسط أيام الإجازة', 'معدل التشغيل %'];
    const rows = metrics.centerMetrics.map(m => [
      m.name,
      m.employeeCount,
      m.leaveCount,
      m.assignmentCount,
      m.avgLeaveDays,
      m.utilizationRate
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_مؤشرات_الأداء_${new Date().toLocaleDateString('ar-SA')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex gap-2 justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 ml-2" />
          تصدير CSV
        </Button>
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Download className="w-4 h-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">متوسط أيام الإجازة</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.totalMetrics.avgLeaveDaysOverall}</p>
                <p className="text-xs text-blue-600 mt-1">يوم / موظف</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">متوسط التكاليف</p>
                <p className="text-3xl font-bold text-purple-900">{metrics.totalMetrics.avgAssignmentsPerEmployee}</p>
                <p className="text-xs text-purple-600 mt-1">تكليف / موظف</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">إجمالي المراكز</p>
                <p className="text-3xl font-bold text-green-900">{metrics.centerMetrics.length}</p>
                <p className="text-xs text-green-600 mt-1">مركز نشط</p>
              </div>
              <Users className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Center */}
      <Card>
        <CardHeader>
          <CardTitle>أداء المراكز الصحية</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metrics.centerMetrics.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="employeeCount" fill="#3b82f6" name="عدد الموظفين" />
              <Bar yAxisId="right" dataKey="avgLeaveDays" fill="#10b981" name="متوسط أيام الإجازة" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Contract Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>التوزيع حسب نوع العقد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.contractTypes.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary">{item.count} موظف</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التوزيع حسب فئة الوظيفة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.jobCategories.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary">{item.count} موظف</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول مؤشرات الأداء التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-right">المركز الصحي</th>
                  <th className="border p-2 text-center">الموظفين</th>
                  <th className="border p-2 text-center">الإجازات</th>
                  <th className="border p-2 text-center">التكاليف</th>
                  <th className="border p-2 text-center">متوسط أيام الإجازة</th>
                  <th className="border p-2 text-center">معدل التشغيل %</th>
                </tr>
              </thead>
              <tbody>
                {metrics.centerMetrics.map((metric, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 font-medium">{metric.name}</td>
                    <td className="border p-2 text-center">{metric.employeeCount}</td>
                    <td className="border p-2 text-center">{metric.leaveCount}</td>
                    <td className="border p-2 text-center">{metric.assignmentCount}</td>
                    <td className="border p-2 text-center">{metric.avgLeaveDays}</td>
                    <td className="border p-2 text-center">
                      <Badge variant={metric.utilizationRate > 80 ? 'default' : 'secondary'}>
                        {metric.utilizationRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}