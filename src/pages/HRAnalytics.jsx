import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  Loader2
} from 'lucide-react';
import DepartmentReport from '../components/hr_analytics/DepartmentReport';
import LeavesTrendsReport from '../components/hr_analytics/LeavesTrendsReport';
import ContractExpiryReport from '../components/hr_analytics/ContractExpiryReport';
import PerformanceMetricsReport from '../components/hr_analytics/PerformanceMetricsReport';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HRAnalytics() {
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [employeesData, centersData, leavesData, assignmentsData] = await Promise.allSettled([
        base44.entities.Employee.list('-updated_date', 500),
        base44.entities.HealthCenter.list(),
        base44.entities.Leave.list('-created_date', 500),
        base44.entities.Assignment.list('-created_date', 500)
      ]);

      setEmployees(employeesData.status === 'fulfilled' && Array.isArray(employeesData.value) ? employeesData.value : []);
      setHealthCenters(centersData.status === 'fulfilled' && Array.isArray(centersData.value) ? centersData.value : []);
      setLeaves(leavesData.status === 'fulfilled' && Array.isArray(leavesData.value) ? leavesData.value : []);
      setAssignments(assignmentsData.status === 'fulfilled' && Array.isArray(assignmentsData.value) ? assignmentsData.value : []);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('فشل تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      totalEmployees: employees.length,
      activeLeaves: leaves.filter(l => l.status === 'active').length,
      activeAssignments: assignments.filter(a => a.status === 'active').length,
      expiringContracts: employees.filter(e => {
        if (!e.contract_end_date) return false;
        const endDate = new Date(e.contract_end_date);
        const threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        return endDate <= threeMonths;
      }).length
    };
  }, [employees, leaves, assignments]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg text-gray-700">جاري تحميل بيانات التقارير...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              تحليلات وتقارير الموارد البشرية
            </h1>
            <p className="text-gray-600 mt-2">تقارير تفصيلية وتحليلات شاملة لبيانات الموظفين</p>
          </div>
          
          <Button onClick={loadData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الموظفين</p>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </div>
                <Users className="w-10 h-10 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">الإجازات النشطة</p>
                  <p className="text-3xl font-bold">{stats.activeLeaves}</p>
                </div>
                <Calendar className="w-10 h-10 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">التكاليف النشطة</p>
                  <p className="text-3xl font-bold">{stats.activeAssignments}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">عقود تنتهي قريباً</p>
                  <p className="text-3xl font-bold">{stats.expiringContracts}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="department" dir="rtl">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="department" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  التوزيع الوظيفي
                </TabsTrigger>
                <TabsTrigger value="leaves" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  اتجاهات الإجازات
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  انتهاء العقود
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  مؤشرات الأداء
                </TabsTrigger>
              </TabsList>

              <TabsContent value="department">
                <DepartmentReport employees={employees} healthCenters={healthCenters} />
              </TabsContent>

              <TabsContent value="leaves">
                <LeavesTrendsReport leaves={leaves} employees={employees} />
              </TabsContent>

              <TabsContent value="contracts">
                <ContractExpiryReport employees={employees} />
              </TabsContent>

              <TabsContent value="performance">
                <PerformanceMetricsReport 
                  employees={employees} 
                  leaves={leaves} 
                  assignments={assignments}
                  healthCenters={healthCenters}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}