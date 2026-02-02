import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Upload,
  Search,
  Filter,
  Building2,
  Calendar,
  User,
  Loader2,
  ClipboardList,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function SecretVisitorReports() {
  const [reports, setReports] = useState([]);
  const [observations, setObservations] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [showNewObservationDialog, setShowNewObservationDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const [newReport, setNewReport] = useState({
    report_number: "",
    health_center_name: "",
    visit_date: "",
    visit_time: "",
    visitor_name: "",
    overall_rating: "",
    summary: "",
    status: "جديد"
  });

  const [newObservation, setNewObservation] = useState({
    report_id: "",
    health_center_name: "",
    department: "",
    category: "",
    description: "",
    severity: "متوسطة",
    responsible_employee_name: "",
    executing_department: "",
    deadline_days: "",
    status: "جديدة"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reportsData, observationsData, centersData, employeesData] = await Promise.all([
        base44.entities.SecretVisitReport.list(),
        base44.entities.SecretVisitObservation.list(),
        base44.entities.HealthCenter.list(),
        base44.entities.Employee.list()
      ]);
      setReports(reportsData || []);
      setObservations(observationsData || []);
      setHealthCenters(centersData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const reportNumber = `SR-${Date.now().toString().slice(-6)}`;
      await base44.entities.SecretVisitReport.create({
        ...newReport,
        report_number: reportNumber
      });
      toast.success("تم إنشاء التقرير بنجاح");
      setShowNewReportDialog(false);
      setNewReport({
        report_number: "",
        health_center_name: "",
        visit_date: "",
        visit_time: "",
        visitor_name: "",
        overall_rating: "",
        summary: "",
        status: "جديد"
      });
      loadData();
    } catch (error) {
      toast.error("فشل في إنشاء التقرير");
    }
  };

  const handleCreateObservation = async () => {
    try {
      const deadlineDate = newObservation.deadline_days 
        ? new Date(Date.now() + newObservation.deadline_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;
      
      await base44.entities.SecretVisitObservation.create({
        ...newObservation,
        deadline_date: deadlineDate
      });
      toast.success("تم إضافة الملاحظة بنجاح");
      setShowNewObservationDialog(false);
      setNewObservation({
        report_id: "",
        health_center_name: "",
        department: "",
        category: "",
        description: "",
        severity: "متوسطة",
        responsible_employee_name: "",
        executing_department: "",
        deadline_days: "",
        status: "جديدة"
      });
      loadData();
    } catch (error) {
      toast.error("فشل في إضافة الملاحظة");
    }
  };

  const updateObservationStatus = async (id, newStatus) => {
    try {
      await base44.entities.SecretVisitObservation.update(id, { status: newStatus });
      toast.success("تم تحديث الحالة");
      loadData();
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      "حرجة": "bg-red-100 text-red-800 border-red-300",
      "عالية": "bg-orange-100 text-orange-800 border-orange-300",
      "متوسطة": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "منخفضة": "bg-green-100 text-green-800 border-green-300"
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      "جديدة": "bg-blue-100 text-blue-800",
      "تم التكليف": "bg-purple-100 text-purple-800",
      "قيد المعالجة": "bg-yellow-100 text-yellow-800",
      "تم الحل": "bg-green-100 text-green-800",
      "تم التحقق": "bg-emerald-100 text-emerald-800",
      "مغلقة": "bg-gray-100 text-gray-800",
      "جديد": "bg-blue-100 text-blue-800",
      "قيد المراجعة": "bg-yellow-100 text-yellow-800",
      "تم التوزيع": "bg-purple-100 text-purple-800",
      "مغلق": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredObservations = observations.filter(obs => {
    const matchesSearch = obs.description?.includes(searchTerm) || 
                          obs.health_center_name?.includes(searchTerm) ||
                          obs.department?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || obs.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || obs.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: observations.length,
    critical: observations.filter(o => o.severity === "حرجة").length,
    pending: observations.filter(o => ["جديدة", "تم التكليف", "قيد المعالجة"].includes(o.status)).length,
    resolved: observations.filter(o => ["تم الحل", "تم التحقق", "مغلقة"].includes(o.status)).length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-8 h-8 text-green-600" />
            برنامج الزائر السري
          </h1>
          <p className="text-gray-500 mt-1">إدارة تقارير الزيارات السرية ومتابعة الملاحظات</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewReportDialog(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 ml-2" />
            تقرير جديد
          </Button>
          <Button onClick={() => setShowNewObservationDialog(true)} variant="outline">
            <Plus className="w-4 h-4 ml-2" />
            ملاحظة جديدة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">إجمالي الملاحظات</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <ClipboardList className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">ملاحظات حرجة</p>
                <p className="text-2xl font-bold text-red-800">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">قيد المعالجة</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">تم الحل</p>
                <p className="text-2xl font-bold text-green-800">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="observations">الملاحظات</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4">
            {reports.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد تقارير حتى الآن</p>
                <Button onClick={() => setShowNewReportDialog(true)} className="mt-4">
                  إنشاء أول تقرير
                </Button>
              </Card>
            ) : (
              reports.map(report => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{report.report_number}</Badge>
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{report.health_center_name}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {report.visit_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.visitor_name}
                          </span>
                          {report.overall_rating && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              التقييم: {report.overall_rating}/10
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setNewObservation(prev => ({
                              ...prev,
                              report_id: report.id,
                              health_center_name: report.health_center_name
                            }));
                            setShowNewObservationDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          إضافة ملاحظة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Observations Tab */}
        <TabsContent value="observations" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث في الملاحظات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="جديدة">جديدة</SelectItem>
                <SelectItem value="تم التكليف">تم التكليف</SelectItem>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="تم الحل">تم الحل</SelectItem>
                <SelectItem value="مغلقة">مغلقة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="حرجة">حرجة</SelectItem>
                <SelectItem value="عالية">عالية</SelectItem>
                <SelectItem value="متوسطة">متوسطة</SelectItem>
                <SelectItem value="منخفضة">منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observations List */}
          <div className="space-y-3">
            {filteredObservations.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد ملاحظات</p>
              </Card>
            ) : (
              filteredObservations.map(obs => (
                <Card key={obs.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getSeverityColor(obs.severity)}>{obs.severity}</Badge>
                          <Badge className={getStatusColor(obs.status)}>{obs.status}</Badge>
                          <Badge variant="outline">{obs.department}</Badge>
                          <Badge variant="outline">{obs.category}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{obs.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <Building2 className="w-4 h-4 inline ml-1" />
                          {obs.health_center_name}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {obs.responsible_employee_name && (
                          <span>المسؤول: {obs.responsible_employee_name}</span>
                        )}
                        {obs.executing_department && (
                          <span>الجهة المنفذة: {obs.executing_department}</span>
                        )}
                        {obs.deadline_date && (
                          <span className="text-red-600">الموعد النهائي: {obs.deadline_date}</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        {obs.status === "جديدة" && (
                          <Button size="sm" variant="outline" onClick={() => updateObservationStatus(obs.id, "تم التكليف")}>
                            تكليف
                          </Button>
                        )}
                        {obs.status === "تم التكليف" && (
                          <Button size="sm" variant="outline" onClick={() => updateObservationStatus(obs.id, "قيد المعالجة")}>
                            بدء المعالجة
                          </Button>
                        )}
                        {obs.status === "قيد المعالجة" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateObservationStatus(obs.id, "تم الحل")}>
                            تم الحل
                          </Button>
                        )}
                        {obs.status === "تم الحل" && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateObservationStatus(obs.id, "مغلقة")}>
                            إغلاق
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Report Dialog */}
      <Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تقرير زيارة سرية جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المركز الصحي</Label>
              <Select 
                value={newReport.health_center_name} 
                onValueChange={(v) => setNewReport({...newReport, health_center_name: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركز" />
                </SelectTrigger>
                <SelectContent>
                  {healthCenters.map(center => (
                    <SelectItem key={center.id} value={center.اسم_المركز}>
                      {center.اسم_المركز}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>تاريخ الزيارة</Label>
                <Input 
                  type="date" 
                  value={newReport.visit_date}
                  onChange={(e) => setNewReport({...newReport, visit_date: e.target.value})}
                />
              </div>
              <div>
                <Label>وقت الزيارة</Label>
                <Input 
                  type="time" 
                  value={newReport.visit_time}
                  onChange={(e) => setNewReport({...newReport, visit_time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>اسم الزائر</Label>
              <Input 
                value={newReport.visitor_name}
                onChange={(e) => setNewReport({...newReport, visitor_name: e.target.value})}
                placeholder="أدخل اسم الزائر السري"
              />
            </div>
            <div>
              <Label>التقييم العام (من 10)</Label>
              <Input 
                type="number" 
                min="1" 
                max="10"
                value={newReport.overall_rating}
                onChange={(e) => setNewReport({...newReport, overall_rating: e.target.value})}
              />
            </div>
            <div>
              <Label>ملخص التقرير</Label>
              <Textarea 
                value={newReport.summary}
                onChange={(e) => setNewReport({...newReport, summary: e.target.value})}
                placeholder="اكتب ملخصاً للتقرير..."
                rows={3}
              />
            </div>
            <Button onClick={handleCreateReport} className="w-full bg-green-600 hover:bg-green-700">
              إنشاء التقرير
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Observation Dialog */}
      <Dialog open={showNewObservationDialog} onOpenChange={setShowNewObservationDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!newObservation.report_id && (
              <div>
                <Label>التقرير</Label>
                <Select 
                  value={newObservation.report_id} 
                  onValueChange={(v) => {
                    const report = reports.find(r => r.id === v);
                    setNewObservation({
                      ...newObservation, 
                      report_id: v,
                      health_center_name: report?.health_center_name || ""
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    {reports.map(report => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.report_number} - {report.health_center_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>القسم</Label>
                <Select 
                  value={newObservation.department} 
                  onValueChange={(v) => setNewObservation({...newObservation, department: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {["الاستقبال", "العيادات", "الصيدلية", "المختبر", "الأشعة", "التمريض", "النظافة", "الصيانة", "الإدارة", "أخرى"].map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التصنيف</Label>
                <Select 
                  value={newObservation.category} 
                  onValueChange={(v) => setNewObservation({...newObservation, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {["خدمة العملاء", "النظافة والتعقيم", "المظهر العام", "الالتزام بالمواعيد", "جودة الخدمة", "السلامة", "التوثيق", "أخرى"].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>درجة الخطورة</Label>
              <Select 
                value={newObservation.severity} 
                onValueChange={(v) => setNewObservation({...newObservation, severity: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="حرجة">حرجة</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>وصف الملاحظة</Label>
              <Textarea 
                value={newObservation.description}
                onChange={(e) => setNewObservation({...newObservation, description: e.target.value})}
                placeholder="اكتب وصفاً تفصيلياً للملاحظة..."
                rows={3}
              />
            </div>
            <div>
              <Label>الموظف المسؤول</Label>
              <Select 
                value={newObservation.responsible_employee_name} 
                onValueChange={(v) => setNewObservation({...newObservation, responsible_employee_name: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المسؤول" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.full_name_arabic}>
                      {emp.full_name_arabic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الجهة المنفذة</Label>
              <Input 
                value={newObservation.executing_department}
                onChange={(e) => setNewObservation({...newObservation, executing_department: e.target.value})}
                placeholder="مثال: قسم الصيانة، إدارة المركز..."
              />
            </div>
            <div>
              <Label>مدة التنفيذ (بالأيام)</Label>
              <Input 
                type="number" 
                min="1"
                value={newObservation.deadline_days}
                onChange={(e) => setNewObservation({...newObservation, deadline_days: e.target.value})}
                placeholder="عدد الأيام المتاحة للتنفيذ"
              />
            </div>
            <Button onClick={handleCreateObservation} className="w-full bg-green-600 hover:bg-green-700">
              إضافة الملاحظة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}