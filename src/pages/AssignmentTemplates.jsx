import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit2, Trash2, FileText, Copy, Star, StarOff,
  Loader2, LayoutTemplate, Users, Settings2, Search, Download
} from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_TYPES = {
  standard: { label: "قياسي", color: "bg-blue-100 text-blue-800", icon: FileText },
  flexible: { label: "مرن", color: "bg-purple-100 text-purple-800", icon: Settings2 },
  multiple: { label: "متعدد", color: "bg-orange-100 text-orange-800", icon: Users },
};

const DEFAULT_OPTIONS = {
  standard: {
    customTitle: "تكليف",
    customClosing: "خالص التحايا ،،،",
  },
  flexible: {
    customTitle: "تكليف",
    tableLayout: "horizontal",
    showDurationInTable: true,
    showDurationInParagraph: true,
    customDurationText: "",
    customParagraph1: "",
    customAssignmentType: "",
    customParagraph2: "لا يترتب على هذا القرار أي ميزة مالية إلا ما يقره النظام.",
    customParagraph3: "",
    customParagraph4: "",
    customParagraph5: "يتم تنفيذ هذا القرار كلاً فيما يخصه.",
    customClosing: "خالص التحايا ،،،",
    customTableHeaders: {
      name: "الاسم",
      position: "المسمى الوظيفي",
      assignmentType: "نوع التكليف",
      fromCenter: "جهة العمل",
      toCenter: "جهة التكليف",
      duration: "مدة التكليف",
    },
  },
  multiple: {
    customTitle: "قرار تكليف",
    customIntro: "إن مدير شؤون المراكز الصحية بالحناكية وبناء على الصلاحيات الممنوحة لنا نظاماً\nعليه يقرر ما يلي:",
    decisionPoints: [
      "تكليف الموضح بياناتهم أعلاه بالعمل في الجهات الموضحة قرين اسم كل منهم خلال الفترة المحددة.",
      "لا يترتب على هذا التكليف أي ميزة مالية إلا ما يقره النظام.",
      "يتم تنفيذ هذا القرار كلاً فيما يخصه.",
    ],
    customClosing: "خالص التحايا ،،،",
  },
};

export default function AssignmentTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportStyleDialog, setShowImportStyleDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableStyles, setAvailableStyles] = useState([]);
  const [selectedStyleToImport, setSelectedStyleToImport] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "standard",
    options: {},
  });

  useEffect(() => {
    loadTemplates();
    loadAvailableStyles();
  }, []);

  const loadAvailableStyles = async () => {
    try {
      const styles = await base44.entities.AssignmentTemplateStyle.list("-created_date", 100);
      setAvailableStyles(Array.isArray(styles) ? styles : []);
    } catch (error) {
      console.error("Error loading styles:", error);
    }
  };

  const handleImportFromStyle = () => {
    setSelectedStyleToImport(null);
    setShowImportStyleDialog(true);
  };

  const confirmImportStyle = async () => {
    if (!selectedStyleToImport) {
      toast.error("يرجى اختيار نمط للاستيراد");
      return;
    }

    try {
      const style = availableStyles.find(s => s.id === selectedStyleToImport);
      if (!style) return;

      const styleData = typeof style.style_data === 'string' 
        ? JSON.parse(style.style_data) 
        : style.style_data;

      // Create new template from style
      await base44.entities.AssignmentTemplate.create({
        name: `${style.name} (من نمط)`,
        description: style.description || `مستورد من النمط: ${style.name}`,
        template_type: style.template_type,
        options: {
          customTitle: styleData.customTitle || DEFAULT_OPTIONS[style.template_type]?.customTitle,
          customIntro: styleData.customIntro,
          customClosing: styleData.customClosing || DEFAULT_OPTIONS[style.template_type]?.customClosing,
          decisionPoints: styleData.decisionPoints,
          customParagraph1: styleData.customParagraph1,
          customParagraph2: styleData.customParagraph2,
          freeText: styleData.freeText,
          // Save style-specific layout data
          styleLayoutData: {
            columns: styleData.columns,
            titleOffset: styleData.titleOffset,
            tableOffset: styleData.tableOffset,
            introOffset: styleData.introOffset,
            freeTextOffset: styleData.freeTextOffset,
            decisionPointsOffset: styleData.decisionPointsOffset,
            closingOffset: styleData.closingOffset,
            signatureOffset: styleData.signatureOffset,
            stampOffset: styleData.stampOffset,
            managerNameOffset: styleData.managerNameOffset,
            signatureSize: styleData.signatureSize,
            currentStampSize: styleData.currentStampSize,
            showNumbering: styleData.showNumbering,
          }
        },
        is_default: false,
      });

      toast.success("تم استيراد النمط كقالب جديد بنجاح");
      setShowImportStyleDialog(false);
      loadTemplates();
    } catch (error) {
      console.error("Error importing style:", error);
      toast.error("فشل في استيراد النمط");
    }
  };

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.AssignmentTemplate.list("-created_date", 100);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("فشل في تحميل القوالب");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      template_type: "standard",
      options: DEFAULT_OPTIONS.standard,
    });
    setShowCreateDialog(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      template_type: template.template_type,
      options: template.options || DEFAULT_OPTIONS[template.template_type],
    });
    setShowEditDialog(true);
  };

  const handleDuplicate = async (template) => {
    try {
      await base44.entities.AssignmentTemplate.create({
        name: `${template.name} (نسخة)`,
        description: template.description,
        template_type: template.template_type,
        options: template.options,
        is_default: false,
      });
      toast.success("تم نسخ القالب بنجاح");
      loadTemplates();
    } catch (error) {
      toast.error("فشل في نسخ القالب");
    }
  };

  const handleDelete = (template) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await base44.entities.AssignmentTemplate.delete(selectedTemplate.id);
      toast.success("تم حذف القالب بنجاح");
      setShowDeleteDialog(false);
      loadTemplates();
    } catch (error) {
      toast.error("فشل في حذف القالب");
    }
  };

  const handleSetDefault = async (template) => {
    try {
      // Remove default from other templates of same type
      const sameTypeTemplates = templates.filter(
        (t) => t.template_type === template.template_type && t.is_default
      );
      for (const t of sameTypeTemplates) {
        await base44.entities.AssignmentTemplate.update(t.id, { is_default: false });
      }
      // Set this one as default
      await base44.entities.AssignmentTemplate.update(template.id, { is_default: true });
      toast.success("تم تعيين القالب كافتراضي");
      loadTemplates();
    } catch (error) {
      toast.error("فشل في تعيين القالب كافتراضي");
    }
  };

  const saveTemplate = async (isNew = true) => {
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم القالب");
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await base44.entities.AssignmentTemplate.create(formData);
        toast.success("تم إنشاء القالب بنجاح");
        setShowCreateDialog(false);
      } else {
        await base44.entities.AssignmentTemplate.update(selectedTemplate.id, formData);
        toast.success("تم تحديث القالب بنجاح");
        setShowEditDialog(false);
      }
      loadTemplates();
    } catch (error) {
      toast.error(isNew ? "فشل في إنشاء القالب" : "فشل في تحديث القالب");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      template_type: type,
      options: DEFAULT_OPTIONS[type],
    }));
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || t.template_type === activeTab;
    return matchesSearch && matchesTab;
  });

  const TemplateCard = ({ template }) => {
    const typeInfo = TEMPLATE_TYPES[template.template_type];
    const TypeIcon = typeInfo?.icon || FileText;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${typeInfo?.color || "bg-gray-100"}`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {template.name}
                  {template.is_default && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </CardTitle>
                <Badge className={typeInfo?.color}>{typeInfo?.label}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 min-h-[40px]">
            {template.description || "لا يوجد وصف"}
          </CardDescription>

          <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
              <Edit2 className="w-4 h-4 ml-1" />
              تعديل
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDuplicate(template)}>
              <Copy className="w-4 h-4 ml-1" />
              نسخ
            </Button>
            {!template.is_default && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetDefault(template)}
              >
                <Star className="w-4 h-4 ml-1" />
                افتراضي
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(template)}
            >
              <Trash2 className="w-4 h-4 ml-1" />
              حذف
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TemplateForm = ({ isNew = true }) => (
    <div className="space-y-4">
      <div>
        <Label>اسم القالب *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="مثال: تكليف رسمي"
        />
      </div>

      <div>
        <Label>نوع القالب *</Label>
        <Select value={formData.template_type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                قياسي
              </div>
            </SelectItem>
            <SelectItem value="flexible">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                مرن
              </div>
            </SelectItem>
            <SelectItem value="multiple">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                متعدد
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>الوصف</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="وصف توضيحي للقالب..."
          rows={3}
        />
      </div>

      {/* Template-specific options */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          خيارات القالب
        </h4>

        <div className="space-y-3">
          <div>
            <Label>عنوان التكليف</Label>
            <Input
              value={formData.options?.customTitle || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  options: { ...prev.options, customTitle: e.target.value },
                }))
              }
              placeholder="تكليف"
            />
          </div>

          {formData.template_type === "multiple" && (
            <>
              <div>
                <Label>المقدمة</Label>
                <Textarea
                  value={formData.options?.customIntro || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      options: { ...prev.options, customIntro: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>نقاط القرار (سطر لكل نقطة)</Label>
                <Textarea
                  value={(formData.options?.decisionPoints || []).join("\n")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      options: {
                        ...prev.options,
                        decisionPoints: e.target.value.split("\n").filter((p) => p.trim()),
                      },
                    }))
                  }
                  rows={4}
                />
              </div>
            </>
          )}

          {formData.template_type === "flexible" && (
            <>
              <div>
                <Label>الفقرة الأولى</Label>
                <Textarea
                  value={formData.options?.customParagraph1 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      options: { ...prev.options, customParagraph1: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>الفقرة الثانية</Label>
                <Textarea
                  value={formData.options?.customParagraph2 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      options: { ...prev.options, customParagraph2: e.target.value },
                    }))
                  }
                  rows={2}
                />
              </div>
            </>
          )}

          <div>
            <Label>الختام</Label>
            <Input
              value={formData.options?.customClosing || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  options: { ...prev.options, customClosing: e.target.value },
                }))
              }
              placeholder="خالص التحايا ،،،"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <LayoutTemplate className="w-8 h-8 text-green-600" />
              إدارة قوالب التكليف
            </h1>
            <p className="text-gray-600 mt-1">إنشاء وتعديل وإدارة قوالب التكليف</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImportFromStyle} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Download className="w-4 h-4 ml-2" />
              استيراد من نمط
            </Button>
            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء قالب جديد
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="البحث في القوالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">الكل</TabsTrigger>
                  <TabsTrigger value="standard">قياسي</TabsTrigger>
                  <TabsTrigger value="flexible">مرن</TabsTrigger>
                  <TabsTrigger value="multiple">متعدد</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <LayoutTemplate className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد قوالب</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "لا توجد نتائج للبحث" : "ابدأ بإنشاء قالب جديد"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 ml-2" />
                إنشاء قالب
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء قالب جديد</DialogTitle>
            </DialogHeader>
            <TemplateForm isNew={true} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                إلغاء
              </Button>
              <Button
                onClick={() => saveTemplate(true)}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                إنشاء القالب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل القالب</DialogTitle>
            </DialogHeader>
            <TemplateForm isNew={false} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                إلغاء
              </Button>
              <Button
                onClick={() => saveTemplate(false)}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف القالب</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف قالب "{selectedTemplate?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Style Dialog */}
        <Dialog open={showImportStyleDialog} onOpenChange={setShowImportStyleDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                استيراد نمط كقالب جديد
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                اختر نمطاً من الأنماط المحفوظة لإنشاء قالب جديد منه
              </p>
              
              {availableStyles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>لا توجد أنماط محفوظة</p>
                  <p className="text-xs mt-1">يمكنك حفظ أنماط من صفحة إنشاء التكليف</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {availableStyles.map((style) => {
                    const typeInfo = TEMPLATE_TYPES[style.template_type];
                    return (
                      <div
                        key={style.id}
                        onClick={() => setSelectedStyleToImport(style.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedStyleToImport === style.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded ${typeInfo?.color || "bg-gray-100"}`}>
                              {typeInfo?.icon && <typeInfo.icon className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{style.name}</p>
                              {style.description && (
                                <p className="text-xs text-gray-500">{style.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={typeInfo?.color}>{typeInfo?.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportStyleDialog(false)}>
                إلغاء
              </Button>
              <Button
                onClick={confirmImportStyle}
                disabled={!selectedStyleToImport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 ml-2" />
                استيراد كقالب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}