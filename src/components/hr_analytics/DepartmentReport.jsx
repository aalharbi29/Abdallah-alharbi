import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DepartmentReport({ employees, healthCenters }) {
  const [exportFormat, setExportFormat] = useState('csv');

  const departmentData = useMemo(() => {
    const byDepartment = {};
    const byCenter = {};
    const byPosition = {};

    employees.forEach(emp => {
      // By department
      const dept = emp.department || 'غير محدد';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;

      // By health center
      const center = emp.المركز_الصحي || 'غير محدد';
      byCenter[center] = (byCenter[center] || 0) + 1;

      // By position
      const pos = emp.position || 'غير محدد';
      byPosition[pos] = (byPosition[pos] || 0) + 1;
    });

    return {
      byDepartment: Object.entries(byDepartment).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      byCenter: Object.entries(byCenter).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      byPosition: Object.entries(byPosition).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    };
  }, [employees]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const exportToCSV = () => {
    const headers = ['القسم/المركز', 'العدد', 'النسبة %'];
    const rows = departmentData.byCenter.map(item => [
      item.name,
      item.count,
      ((item.count / employees.length) * 100).toFixed(1)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_التوزيع_الوظيفي_${new Date().toLocaleDateString('ar-SA')}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex gap-2 justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 ml-2" />
          تصدير CSV
        </Button>
        <Button onClick={exportToPDF} variant="outline" size="sm">
          <Download className="w-4 h-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">عدد الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{departmentData.byDepartment.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">عدد المراكز الصحية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{departmentData.byCenter.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">عدد التخصصات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{departmentData.byPosition.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - By Center */}
        <Card>
          <CardHeader>
            <CardTitle>التوزيع حسب المركز الصحي</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departmentData.byCenter.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="عدد الموظفين" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - By Position */}
        <Card>
          <CardHeader>
            <CardTitle>التوزيع حسب التخصص (أعلى 8)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={departmentData.byPosition.slice(0, 8)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.byPosition.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول التوزيع التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-right">المركز الصحي</th>
                  <th className="border p-3 text-center">عدد الموظفين</th>
                  <th className="border p-3 text-center">النسبة المئوية</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.byCenter.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-3">{item.name}</td>
                    <td className="border p-3 text-center font-bold">{item.count}</td>
                    <td className="border p-3 text-center">
                      {((item.count / employees.length) * 100).toFixed(1)}%
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