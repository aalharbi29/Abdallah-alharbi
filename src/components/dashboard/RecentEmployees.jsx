import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors = {
  "نشط": "bg-green-100 text-green-800",
  "غير نشط": "bg-gray-100 text-gray-800", 
  "منتهي الخدمة": "bg-red-100 text-red-800"
};

export default function RecentEmployees({ employees = [], isLoading }) {
  const safeEmployees = Array.isArray(employees) ? employees : [];

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          الموظفين الجدد
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المركز الصحي</TableHead>
                <TableHead className="text-right">المنصب</TableHead>
                <TableHead className="text-right">تاريخ التوظيف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : safeEmployees.length > 0 ? (
                safeEmployees.map((employee) => {
                  if (!employee) return null;
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{employee.full_name_arabic}</TableCell>
                      <TableCell>{employee.المركز_الصحي}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        {employee.hire_date ? (
                          (() => {
                            const date = new Date(employee.hire_date);
                            return isNaN(date.getTime()) ? "-" : format(date, "d MMM yyyy", { locale: ar });
                          })()
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[employee.status] || statusColors["نشط"]}>
                          {employee.status || "نشط"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا يوجد موظفين مسجلين
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}