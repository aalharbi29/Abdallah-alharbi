import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  Building2,
  Loader2,
  ClipboardList,
  Sparkles,
  FileCheck,
  Send,
  Settings,
  Plus
} from "lucide-react";
import { toast } from "sonner";

export default function SecretVisitorReports() {
  const [reports, setReports] = useState([]);
  const [observations, setObservations] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [responseTemplates, setResponseTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCenter, setFilterCenter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    category: "",
    department: "",
    severity: "الكل",
    response_text: "",
    corrective_action: "",
    estimated_days: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reportsData, observationsData, centersData, templatesData] = await Promise.all([
        base44.entities.SecretVisitReport.list(),
        base44.entities.SecretVisitObservation.list(),
        base44.entities.HealthCenter.list(),
        base44.entities.ResponseTemplate.list()
      ]);
      setReports(reportsData || []);
      setObservations(observationsData || []);
      setHealthCenters(centersData || []);
      setResponseTemplates(templatesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, extracted: 0 });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setAnalysisProgress({ current: 0, total: 0, extracted: 0 });
      toast.info("جاري رفع وتحليل التقرير...");

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Create report record
      const reportNumber = `SR-${Date.now().toString().slice(-6)}`;
      const report = await base44.entities.SecretVisitReport.create({
        report_number: reportNumber,
        file_url: file_url,
        file_name: file.name,
        upload_date: new Date().toISOString().split('T')[0],
        analysis_status: "قيد التحليل",
        status: "جديد"
      });

      const centerNames = healthCenters.map(c => c.اسم_المركز).join(", ");
      
      // Step 1: Get total count first
      const countResult = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل هذا التقرير وأعطني العدد الإجمالي للملاحظات الموجودة فيه فقط.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            total_observations: { type: "number" },
            centers_mentioned: { type: "array", items: { type: "string" } }
          }
        }
      });

      const totalExpected = countResult.total_observations || 100;
      const batchSize = 50; // Extract 50 observations at a time
      const totalBatches = Math.ceil(totalExpected / batchSize);
      
      setAnalysisProgress({ current: 0, total: totalBatches, extracted: 0 });
      
      let allObservations = [];
      let lastExtractedIds = [];

      // Step 2: Extract in batches
      for (let batch = 0; batch < totalBatches; batch++) {
        setAnalysisProgress(prev => ({ ...prev, current: batch + 1 }));
        
        const skipDescription = lastExtractedIds.length > 0 
          ? `تجاهل الملاحظات التالية التي تم استخراجها مسبقاً:\n${lastExtractedIds.slice(-10).join('\n')}\n\n` 
          : '';

        const batchResult = await base44.integrations.Core.InvokeLLM({
          prompt: `قم بتحليل تقرير الزائر السري واستخرج الملاحظات من رقم ${batch * batchSize + 1} إلى ${(batch + 1) * batchSize}.

${skipDescription}المراكز الصحية المتاحة: ${centerNames}

لكل ملاحظة، حدد:
1. اسم المركز الصحي (يجب أن يكون من القائمة المتاحة أو "غير محدد")
2. القسم (الاستقبال، العيادات، الصيدلية، المختبر، الأشعة، التمريض، النظافة، الصيانة، الإدارة، أخرى)
3. تصنيف الملاحظة (خدمة العملاء، النظافة، المظهر العام، الالتزام بالمواعيد، جودة الخدمة، السلامة، أخرى)
4. وصف الملاحظة بالتفصيل
5. درجة الخطورة (حرجة، عالية، متوسطة، منخفضة)

استخرج أكبر عدد ممكن من الملاحظات (حتى 50 ملاحظة) في هذه الدفعة.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              observations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    health_center_name: { type: "string" },
                    department: { type: "string" },
                    category: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string" }
                  }
                }
              },
              has_more: { type: "boolean" }
            }
          }
        });

        const batchObs = batchResult.observations || [];
        
        // Filter duplicates based on description
        const existingDescriptions = new Set(allObservations.map(o => o.description?.trim().toLowerCase()));
        const newObs = batchObs.filter(o => !existingDescriptions.has(o.description?.trim().toLowerCase()));
        
        allObservations = [...allObservations, ...newObs];
        lastExtractedIds = newObs.slice(-10).map(o => o.description?.slice(0, 50));
        
        setAnalysisProgress(prev => ({ ...prev, extracted: allObservations.length }));
        
        // Stop if no new observations or explicitly no more
        if (newObs.length === 0 || batchResult.has_more === false) {
          break;
        }
      }

      // Step 3: Save all observations
      toast.info(`جاري حفظ ${allObservations.length} ملاحظة...`);
      
      // Bulk create in chunks of 20
      for (let i = 0; i < allObservations.length; i += 20) {
        const chunk = allObservations.slice(i, i + 20);
        const records = chunk.map(obs => ({
          report_id: report.id,
          health_center_name: obs.health_center_name || "غير محدد",
          department: obs.department || "غير محدد",
          category: obs.category || "أخرى",
          description: obs.description,
          severity: ["حرجة", "عالية", "متوسطة", "منخفضة"].includes(obs.severity) ? obs.severity : "متوسطة",
          status: "جديدة"
        }));
        
        await base44.entities.SecretVisitObservation.bulkCreate(records);
      }

      // Update report
      await base44.entities.SecretVisitReport.update(report.id, {
        analysis_status: "تم التحليل",
        total_observations: allObservations.length,
        status: "تم الفرز"
      });

      toast.success(`تم تحليل التقرير واستخراج ${allObservations.length} ملاحظة بنجاح!`);
      loadData();
      setActiveTab("observations");

    } catch (error) {
      console.error("Error:", error);
      toast.error("فشل في تحليل التقرير");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress({ current: 0, total: 0, extracted: 0 });
    }
  };

  const getMatchingTemplates = (observation) => {
    return responseTemplates.filter(t => {
      const categoryMatch = !t.category || t.category === observation.category;
      const deptMatch = !t.department || t.department === observation.department;
      const severityMatch = t.severity === "الكل" || t.severity === observation.severity;
      return categoryMatch && deptMatch && severityMatch && t.is_active !== false;
    });
  };

  const applyTemplate = async (template) => {
    if (!selectedObservation) return;

    const deadlineDate = template.estimated_days 
      ? new Date(Date.now() + template.estimated_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    try {
      await base44.entities.SecretVisitObservation.update(selectedObservation.id, {
        selected_response_template: template.title,
        response_text: template.response_text,
        deadline_days: template.estimated_days,
        deadline_date: deadlineDate,
        executing_department: template.corrective_action,
        status: "تم التكليف"
      });
      toast.success("تم تطبيق قالب الرد");
      setShowResponseDialog(false);
      loadData();
    } catch (error) {
      toast.error("فشل في تطبيق القالب");
    }
  };

  const updateObservationStatus = async (id, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === "تم الحل") {
        updates.response_date = new Date().toISOString().split('T')[0];
      }
      await base44.entities.SecretVisitObservation.update(id, updates);
      toast.success("تم تحديث الحالة");
      loadData();
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await base44.entities.ResponseTemplate.create({
        ...newTemplate,
        estimated_days: newTemplate.estimated_days ? parseInt(newTemplate.estimated_days) : null,
        is_active: true
      });
      toast.success("تم إنشاء القالب");
      setShowTemplateDialog(false);
      setNewTemplate({
        title: "",
        category: "",
        department: "",
        severity: "الكل",
        response_text: "",
        corrective_action: "",
        estimated_days: ""
      });
      loadData();
    } catch (error) {
      toast.error("فشل في إنشاء القالب");
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
      "مغلقة": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredObservations = observations.filter(obs => {
    const matchesSearch = obs.description?.includes(searchTerm) || 
                          obs.health_center_name?.includes(searchTerm);
    const matchesCenter = filterCenter === "all" || obs.health_center_name === filterCenter;
    const matchesStatus = filterStatus === "all" || obs.status === filterStatus;
    return matchesSearch && matchesCenter && matchesStatus;
  });

  // Group by center
  const observationsByCenter = filteredObservations.reduce((acc, obs) => {
    const center = obs.health_center_name || "غير محدد";
    if (!acc[center]) acc[center] = [];
    acc[center].push(obs);
    return acc;
  }, {});

  const stats = {
    total: observations.length,
    critical: observations.filter(o => o.severity === "حرجة").length,
    pending: observations.filter(o => ["جديدة", "تم التكليف", "قيد المعالجة"].includes(o.status)).length,
    resolved: observations.filter(o => ["تم الحل", "مغلقة"].includes(o.status)).length
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
          <p className="text-gray-500 mt-1">رفع وتحليل التقارير ومتابعة الملاحظات</p>
        </div>
        <Button onClick={() => setShowTemplateDialog(true)} variant="outline">
          <Settings className="w-4 h-4 ml-2" />
          إدارة قوالب الرد
        </Button>
      </div>

      {/* Stats */}
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
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="upload">رفع تقرير</TabsTrigger>
          <TabsTrigger value="observations">الملاحظات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
            <CardContent className="p-8">
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">جاري تحليل التقرير بالذكاء الاصطناعي...</h3>
                  {analysisProgress.total > 0 && (
                    <div className="mt-4 max-w-md mx-auto">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>الدفعة {analysisProgress.current} من {analysisProgress.total}</span>
                        <span>تم استخراج {analysisProgress.extracted} ملاحظة</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-gray-500 mt-4">يتم استخراج الملاحظات على دفعات لضمان عدم فقدان أي ملاحظة</p>
                </div>
              ) : (
                <label className="cursor-pointer block text-center py-8">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">اسحب الملف هنا أو انقر للرفع</h3>
                  <p className="text-gray-500 mt-2">PDF, Word, Excel, أو صور</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">سيتم تحليل التقرير واستخراج الملاحظات تلقائياً</span>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>
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
            <Select value={filterCenter} onValueChange={setFilterCenter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="المركز" />
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
          </div>

          {/* Grouped by Center */}
          {Object.keys(observationsByCenter).length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد ملاحظات</p>
              <Button onClick={() => setActiveTab("upload")} className="mt-4">
                رفع تقرير جديد
              </Button>
            </Card>
          ) : (
            Object.entries(observationsByCenter).map(([centerName, centerObs]) => (
              <Card key={centerName} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-green-600" />
                    {centerName}
                    <Badge variant="outline" className="mr-auto">{centerObs.length} ملاحظة</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {centerObs.map(obs => (
                    <div key={obs.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getSeverityColor(obs.severity)}>{obs.severity}</Badge>
                            <Badge className={getStatusColor(obs.status)}>{obs.status}</Badge>
                            {obs.department && <Badge variant="outline">{obs.department}</Badge>}
                            {obs.category && <Badge variant="outline">{obs.category}</Badge>}
                          </div>
                        </div>
                        <p className="text-gray-800">{obs.description}</p>
                        
                        {obs.response_text && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800 mb-1">الرد المعتمد:</p>
                            <p className="text-sm text-green-700">{obs.response_text}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          {obs.status === "جديدة" && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedObservation(obs);
                                setShowResponseDialog(true);
                              }}
                            >
                              <FileCheck className="w-4 h-4 ml-1" />
                              اختيار رد
                            </Button>
                          )}
                          {obs.status === "تم التكليف" && (
                            <Button size="sm" variant="outline" onClick={() => updateObservationStatus(obs.id, "قيد المعالجة")}>
                              بدء المعالجة
                            </Button>
                          )}
                          {obs.status === "قيد المعالجة" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateObservationStatus(obs.id, "تم الحل")}>
                              <CheckCircle className="w-4 h-4 ml-1" />
                              تم الحل
                            </Button>
                          )}
                          {obs.status === "تم الحل" && (
                            <Button size="sm" variant="outline" onClick={() => updateObservationStatus(obs.id, "مغلقة")}>
                              إغلاق
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد تقارير مرفوعة</p>
            </Card>
          ) : (
            reports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-10 h-10 text-green-600" />
                      <div>
                        <p className="font-semibold">{report.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {report.report_number} • {report.upload_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={report.analysis_status === "تم التحليل" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {report.analysis_status}
                      </Badge>
                      {report.total_observations && (
                        <Badge variant="outline">{report.total_observations} ملاحظة</Badge>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>اختيار قالب الرد</DialogTitle>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">الملاحظة:</p>
                <p className="text-gray-600">{selectedObservation.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={getSeverityColor(selectedObservation.severity)}>{selectedObservation.severity}</Badge>
                  <Badge variant="outline">{selectedObservation.department}</Badge>
                  <Badge variant="outline">{selectedObservation.category}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">قوالب الرد المقترحة:</h4>
                {getMatchingTemplates(selectedObservation).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">لا توجد قوالب مطابقة</p>
                ) : (
                  getMatchingTemplates(selectedObservation).map(template => (
                    <Card key={template.id} className="hover:border-green-300 cursor-pointer transition-colors" onClick={() => applyTemplate(template)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-green-700">{template.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{template.response_text}</p>
                            {template.corrective_action && (
                              <p className="text-sm text-gray-500 mt-1">الإجراء: {template.corrective_action}</p>
                            )}
                          </div>
                          {template.estimated_days && (
                            <Badge variant="outline">{template.estimated_days} يوم</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Management Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إدارة قوالب الرد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add New Template */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة قالب جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>عنوان القالب</Label>
                    <Input 
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                      placeholder="مثال: رد على ملاحظة النظافة"
                    />
                  </div>
                  <div>
                    <Label>التصنيف</Label>
                    <Input 
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                      placeholder="مثال: النظافة"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>القسم</Label>
                    <Input 
                      value={newTemplate.department}
                      onChange={(e) => setNewTemplate({...newTemplate, department: e.target.value})}
                      placeholder="مثال: النظافة"
                    />
                  </div>
                  <div>
                    <Label>مدة التنفيذ (أيام)</Label>
                    <Input 
                      type="number"
                      value={newTemplate.estimated_days}
                      onChange={(e) => setNewTemplate({...newTemplate, estimated_days: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>نص الرد</Label>
                  <Textarea 
                    value={newTemplate.response_text}
                    onChange={(e) => setNewTemplate({...newTemplate, response_text: e.target.value})}
                    placeholder="اكتب نص الرد الجاهز..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>الإجراء التصحيحي</Label>
                  <Input 
                    value={newTemplate.corrective_action}
                    onChange={(e) => setNewTemplate({...newTemplate, corrective_action: e.target.value})}
                    placeholder="مثال: تكثيف جولات النظافة"
                  />
                </div>
                <Button onClick={handleCreateTemplate} className="w-full">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة القالب
                </Button>
              </CardContent>
            </Card>

            {/* Existing Templates */}
            <div className="space-y-2">
              <h4 className="font-semibold">القوالب الحالية ({responseTemplates.length})</h4>
              {responseTemplates.map(template => (
                <Card key={template.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{template.title}</p>
                        <p className="text-sm text-gray-500">{template.response_text?.slice(0, 100)}...</p>
                      </div>
                      <div className="flex gap-1">
                        {template.category && <Badge variant="outline" className="text-xs">{template.category}</Badge>}
                        {template.estimated_days && <Badge variant="outline" className="text-xs">{template.estimated_days} يوم</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}