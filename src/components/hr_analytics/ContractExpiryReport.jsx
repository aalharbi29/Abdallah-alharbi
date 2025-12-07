import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, AlertTriangle, Clock } from 'lucide-react';
import { format, addMonths, isAfter, isBefore, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ContractExpiryReport({ employees }) {
  const contractData = useMemo(() => {
    const now = new Date();
    const oneMonth = addMonths(now, 1);
    const threeMonths = addMonths(now, 3);
    const sixMonths = addMonths(now, 6);

    const employeesWithContracts = employees.filter(emp => emp.contract_end_date);

    const expiringSoon = [];
    const expiringThreeMonths = [];
    const expiringSixMonths = [];
    const future = [];

    employeesWithContracts.forEach(emp => {
      const endDate = new Date(emp.contract_end_date);
      const daysRemaining = differenceInDays(endDate, now);

      const record = {
        ...emp,
        endDate,
        daysRemaining,
        formattedEndDate: format(endDate, 'dd/MM/yyyy', { locale: ar })
      };

      if (isBefore(endDate, oneMonth)) {
        expiringSoon.push(record);
      } else if (isBefore(endDate, threeMonths)) {
        expiringThreeMonths.push(record);
      } else if (isBefore(endDate, sixMonths)) {
        expiringSixMonths.push(record);
      } else {
        future.push(record);
      }
    });

    return {
      expiringSoon: expiringSoon.sort((a, b) => a.endDate - b.endDate),
      expiringThreeMonths: expiringThreeMonths.sort((a, b) => a.endDate - b.endDate),
      expiringSixMonths: expiringSixMonths.sort((a, b) => a.endDate - b.endDate),
      future: future.sort((a, b) => a.endDate - b.endDate)
    };
  }, [employees]);

  const exportToCSV = () => {
    const headers = ['الاسم', 'رقم الموظف', 'المركز', 'نوع العقد', 'تاريخ الانتهاء', 'الأيام المتبقية'];
    const allContracts = [
      ...contractData.expiringSoon,
      ...contractData.expiringThreeMonths,
      ...contractData.expiringSixMonths,
      ...contractData.future
    ];

    const rows = allContracts.map(emp => [
      emp.full_name_arabic,
      emp.رقم_الموظف,
      emp.المركز_الصحي,
      emp.contract_type,
      emp.formattedEndDate,
      emp.daysRemaining
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_انتهاء_العقود_${new Date().toLocaleDateString('ar-SA')}.csv`;
    link.click();
  };

  const renderContractTable = (data, title, badgeColor) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="secondary" className={badgeColor}>
            {data.length} عقد
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لا توجد عقود في هذه الفئة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-right">الاسم</th>
                  <th className="border p-2 text-center">رقم الموظف</th>
                  <th className="border p-2 text-right">المركز</th>
                  <th className="border p-2 text-center">نوع العقد</th>
                  <th className="border p-2 text-center">تاريخ الانتهاء</th>
                  <th className="border p-2 text-center">الأيام المتبقية</th>
                </tr>
              </thead>
              <tbody>
                {data.map((emp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2">{emp.full_name_arabic}</td>
                    <td className="border p-2 text-center">{emp.رقم_الموظف}</td>
                    <td className="border p-2">{emp.المركز_الصحي}</td>
                    <td className="border p-2 text-center">{emp.contract_type}</td>
                    <td className="border p-2 text-center">{emp.formattedEndDate}</td>
                    <td className="border p-2 text-center">
                      <Badge variant={emp.daysRemaining < 30 ? 'destructive' : 'secondary'}>
                        {emp.daysRemaining} يوم
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

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

      {/* Critical Alert */}
      {contractData.expiringSoon.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              تنبيه: عقود تنتهي خلال شهر واحد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              يوجد {contractData.expiringSoon.length} عقد ينتهي خلال الشهر القادم. يرجى اتخاذ الإجراءات اللازمة.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contract Tables */}
      {renderContractTable(contractData.expiringSoon, 'عقود تنتهي خلال شهر', 'bg-red-100 text-red-700')}
      {renderContractTable(contractData.expiringThreeMonths, 'عقود تنتهي خلال 3 أشهر', 'bg-orange-100 text-orange-700')}
      {renderContractTable(contractData.expiringSixMonths, 'عقود تنتهي خلال 6 أشهر', 'bg-yellow-100 text-yellow-700')}
      {renderContractTable(contractData.future, 'عقود تنتهي بعد 6 أشهر', 'bg-green-100 text-green-700')}
    </div>
  );
}