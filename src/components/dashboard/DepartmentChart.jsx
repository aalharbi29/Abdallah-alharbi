import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DepartmentChart(props) {
  // حماية من destructuring على undefined
  const { healthCenters, employees, isLoading = false } = props || {};
  const [viewMode, setViewMode] = useState('centers'); 
  
  // استخدام useMemo لحفظ البيانات الآمنة
  const safeHealthCenters = useMemo(() => {
    if (!healthCenters) return [];
    if (!Array.isArray(healthCenters)) return [];
    return healthCenters.filter(center => center != null);
  }, [healthCenters]);
  
  const safeEmployees = useMemo(() => {
    if (!employees) return [];
    if (!Array.isArray(employees)) return [];
    return employees.filter(emp => emp != null);
  }, [employees]);
  
  const centerData = useMemo(() => {
    if (safeHealthCenters.length === 0) return [];

    const centerStats = [];
    for (const center of safeHealthCenters) {
      if (!center) continue; 

      const centerEmployees = safeEmployees.filter(emp => 
        emp && emp.المركز_الصحي === center.اسم_المركز
      );
      
      centerStats.push({
        name: center.اسم_المركز || 'غير محدد',
        "عدد الموظفين": centerEmployees.length,
        fill: '#3B82F6'
      });
    }
    return centerStats;
  }, [safeHealthCenters, safeEmployees]);

  const specializationData = useMemo(() => {
    if (safeEmployees.length === 0) return [];

    const specializationCounts = {};
    
    for (const emp of safeEmployees) {
      if (emp && emp.position) {
        specializationCounts[emp.position] = (specializationCounts[emp.position] || 0) + 1;
      }
    }

    const specializationStats = [];
    for (const specialization in specializationCounts) {
      specializationStats.push({
        name: specialization,
        "عدد الموظفين": specializationCounts[specialization],
        fill: '#10B981'
      });
    }
    
    return specializationStats.sort((a, b) => b["عدد الموظفين"] - a["عدد الموظفين"]);
  }, [safeEmployees]);

  const currentData = viewMode === 'centers' ? centerData : specializationData;
  const currentTitle = viewMode === 'centers' ? 'توزيع الموظفين حسب المراكز الصحية' : 'توزيع الموظفين حسب التخصصات';
  const currentIcon = viewMode === 'centers' ? Building2 : Users;

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {React.createElement(currentIcon, { className: "text-blue-600 w-5 h-5" })}
            {currentTitle}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'centers' ? 'default' : 'outline'}
              onClick={() => setViewMode('centers')}
            >
              المراكز
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'specializations' ? 'default' : 'outline'}
              onClick={() => setViewMode('specializations')}
            >
              التخصصات
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Skeleton className="h-full w-full" />
          </div>
        ) : currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                labelStyle={{ direction: 'rtl' }}
              />
              <Bar 
                dataKey="عدد الموظفين" 
                fill={viewMode === 'centers' ? '#3B82F6' : '#10B981'} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              {React.createElement(currentIcon, { className: "w-12 h-12 mx-auto text-gray-300 mb-2" })}
              <p>لا توجد بيانات لعرضها</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}