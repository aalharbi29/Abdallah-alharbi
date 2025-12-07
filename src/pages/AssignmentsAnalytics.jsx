import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, Users, Clock, FileText, 
  Filter, RefreshCw, Building2 
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AssignmentsAnalytics() {
  const [assignments, setAssignments] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, centersData] = await Promise.all([
        base44.entities.Assignment.list("-created_date", 1000),
        base44.entities.HealthCenter.list()
      ]);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setHealthCenters(Array.isArray(centersData) ? centersData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter assignments based on selected criteria
  const filteredAssignments = assignments.filter(a => {
    if (!a.start_date) return false;
    
    const year = new Date(a.start_date).getFullYear().toString();
    if (selectedYear !== "all" && year !== selectedYear) return false;
    
    if (selectedCenter !== "all" && a.assigned_to_health_center !== selectedCenter) return false;
    if (selectedType !== "all" && a.assignment_type !== selectedType) return false;
    if (selectedStatus !== "all") {
      if (selectedStatus === "approved" && a.approval_status !== "approved") return false;
      if (selectedStatus === "draft" && a.approval_status !== "draft") return false;
    }
    
    return true;
  });

  // Calculate KPIs
  const totalAssignments = filteredAssignments.length;
  const approvedAssignments = filteredAssignments.filter(a => a.approval_status === "approved").length;
  const draftAssignments = filteredAssignments.filter(a => a.approval_status === "draft").length;
  const activeAssignments = filteredAssignments.filter(a => a.status === "active").length;
  
  const averageDuration = filteredAssignments.length > 0
    ? (filteredAssignments.reduce((sum, a) => sum + (a.duration_days || 0), 0) / filteredAssignments.length).toFixed(1)
    : 0;

  const uniqueCenters = [...new Set(filteredAssignments.map(a => a.assigned_to_health_center))].length;
  const uniqueEmployees = [...new Set(filteredAssignments.map(a => a.employee_record_id))].length;

  // Assignments by center
  const assignmentsByCenter = filteredAssignments.reduce((acc, a) => {
    const center = a.assigned_to_health_center || "غير محدد";
    acc[center] = (acc[center] || 0) + 1;
    return acc;
  }, {});

  const centerChartData = Object.entries(assignmentsByCenter)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Assignments by type
  const assignmentsByType = filteredAssignments.reduce((acc, a) => {
    const type = a.assignment_type || "غير محدد";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(assignmentsByType).map(([name, value]) => ({ name, value }));

  // Assignments by month
  const assignmentsByMonth = filteredAssignments.reduce((acc, a) => {
    if (!a.start_date) return acc;
    const month = format(new Date(a.start_date), 'yyyy-MM');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthChartData = Object.entries(assignmentsByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Duration distribution
  const durationRanges = {
    "1-3 أيام": 0,
    "4-7 أيام": 0,
    "8-14 يوم": 0,
    "15-30 يوم": 0,
    "أكثر من 30 يوم": 0
  };

  filteredAssignments.forEach(a => {
    const days = a.duration_days || 0;
    if (days <= 3) durationRanges["1-3 أيام"]++;
    else if (days <= 7) durationRanges["4-7 أيام"]++;
    else if (days <= 14) durationRanges["8-14 يوم"]++;
    else if (days <= 30) durationRanges["15-30 يوم"]++;
    else durationRanges["أكثر من 30 يوم"]++;
  });

  const durationChartData = Object.entries(durationRanges).map(([name, value]) => ({ name, value }));

  const years = [...new Set(assignments.map(a => {
    if (!a.start_date) return null;
    return new Date(a.start_date).getFullYear();
  }).filter(Boolean))].sort((a, b) => b - a);

  const types = [...new Set(assignments.map(a => a.assignment_type).filter(Boolean))];

  if (isLoading) {
    return <div className="p-6 text-center">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                تحليلات التكاليف
              </h1>
              <p className="text-sm text-gray-600 mt-1">مؤشرات الأداء الرئيسية والإحصائيات التفصيلية</p>
            </div>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              الفلاتر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">السنة</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع السنوات</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">المركز</label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المركز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المراكز</SelectItem>
                    {healthCenters.map(center => (
                      <SelectItem key={center.id} value={center.اسم_المركز}>
                        {center.اسم_المركز}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">نوع التكليف</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">حالة الاعتماد</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="approved">معتمد</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي التكاليف</p>
                  <p className="text-3xl font-bold text-gray-900">{totalAssignments}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      معتمد: {approvedAssignments}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      مسودة: {draftAssignments}
                    </Badge>
                  </div>
                </div>
                <FileText className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">متوسط المدة</p>
                  <p className="text-3xl font-bold text-gray-900">{averageDuration}</p>
                  <p className="text-xs text-gray-500 mt-1">يوم</p>
                </div>
                <Clock className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المراكز المستفيدة</p>
                  <p className="text-3xl font-bold text-gray-900">{uniqueCenters}</p>
                  <p className="text-xs text-gray-500 mt-1">مركز صحي</p>
                </div>
                <Building2 className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الموظفون المكلفون</p>
                  <p className="text-3xl font-bold text-gray-900">{uniqueEmployees}</p>
                  <p className="text-xs text-gray-500 mt-1">موظف</p>
                </div>
                <Users className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Assignments by Center */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">التكاليف حسب المركز الصحي</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={centerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Assignments by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">التكاليف حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">التوزيع الشهري</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Duration Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">توزيع المدد الزمنية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={durationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آخر التكاليف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right">الموظف</th>
                    <th className="p-3 text-right">المركز</th>
                    <th className="p-3 text-right">المدة</th>
                    <th className="p-3 text-right">التاريخ</th>
                    <th className="p-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.slice(0, 10).map(a => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{a.employee_name}</td>
                      <td className="p-3">{a.assigned_to_health_center}</td>
                      <td className="p-3">{a.duration_days} يوم</td>
                      <td className="p-3">{a.start_date ? format(new Date(a.start_date), 'yyyy-MM-dd') : '-'}</td>
                      <td className="p-3">
                        <Badge className={a.approval_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {a.approval_status === 'approved' ? 'معتمد' : 'مسودة'}
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
    </div>
  );
}