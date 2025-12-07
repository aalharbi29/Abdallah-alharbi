import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function LeavesTrendsReport({ leaves, employees }) {
  const trendsData = useMemo(() => {
    // Last 12 months
    const now = new Date();
    const twelveMonthsAgo = subMonths(now, 11);
    const months = eachMonthOfInterval({ start: twelveMonthsAgo, end: now });

    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthLeaves = leaves.filter(leave => {
        const startDate = new Date(leave.start_date);
        return startDate >= monthStart && startDate <= monthEnd;
      });

      const byType = {
        'إجازة سنوية': 0,
        'إجازة مرضية': 0,
        'إجازة طارئة': 0,
        'إجازة أمومة': 0,
        'إجازة بدون راتب': 0
      };

      monthLeaves.forEach(leave => {
        if (byType.hasOwnProperty(leave.leave_type)) {
          byType[leave.leave_type]++;
        }
      });

      return {
        month: format(month, 'MMM yyyy', { locale: ar }),
        total: monthLeaves.length,
        ...byType
      };
    });

    // By type overall
    const byLeaveType = {};
    leaves.forEach(leave => {
      const type = leave.leave_type || 'غير محدد';
      byLeaveType[type] = (byLeaveType[type] || 0) + 1;
    });

    return {
      monthlyData,
      byType: Object.entries(byLeaveType).map(([name, count]) => ({ name, count }))
    };
  }, [leaves]);

  const exportToCSV = () => {
    const headers = ['الشهر', 'إجمالي الإجازات', 'سنوية', 'مرضية', 'طارئة', 'أمومة', 'بدون راتب'];
    const rows = trendsData.monthlyData.map(item => [
      item.month,
      item.total,
      item['إجازة سنوية'],
      item['إجازة مرضية'],
      item['إجازة طارئة'],
      item['إجازة أمومة'],
      item['إجازة بدون راتب']
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_اتجاهات_الإجازات_${new Date().toLocaleDateString('ar-SA')}.csv`;
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

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاه الإجازات خلال الـ 12 شهر الماضية</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendsData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="إجمالي" />
              <Line type="monotone" dataKey="إجازة سنوية" stroke="#10b981" name="سنوية" />
              <Line type="monotone" dataKey="إجازة مرضية" stroke="#f59e0b" name="مرضية" />
              <Line type="monotone" dataKey="إجازة طارئة" stroke="#ef4444" name="طارئة" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By Type Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>التوزيع حسب نوع الإجازة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendsData.byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="عدد الإجازات" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الإجازات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-right">الشهر</th>
                  <th className="border p-2 text-center">الإجمالي</th>
                  <th className="border p-2 text-center">سنوية</th>
                  <th className="border p-2 text-center">مرضية</th>
                  <th className="border p-2 text-center">طارئة</th>
                  <th className="border p-2 text-center">أمومة</th>
                  <th className="border p-2 text-center">بدون راتب</th>
                </tr>
              </thead>
              <tbody>
                {trendsData.monthlyData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 font-medium">{item.month}</td>
                    <td className="border p-2 text-center font-bold">{item.total}</td>
                    <td className="border p-2 text-center">{item['إجازة سنوية']}</td>
                    <td className="border p-2 text-center">{item['إجازة مرضية']}</td>
                    <td className="border p-2 text-center">{item['إجازة طارئة']}</td>
                    <td className="border p-2 text-center">{item['إجازة أمومة']}</td>
                    <td className="border p-2 text-center">{item['إجازة بدون راتب']}</td>
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