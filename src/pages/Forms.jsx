import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Calendar, DollarSign, Activity, FileBarChart, RefreshCw, FilePlus, Download, Eye, Trash2, Search, Loader2, FileSearch, CheckCircle, MoveRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FormViewer from "@/components/forms/FormViewer";
import FilePreviewDialog from "@/components/forms/FilePreviewDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categories = [
  { key: "leaves", label: "نماذج الإجازات", icon: Calendar, color: "blue" },
  { key: "assignments", label: "نماذج التكاليف", icon: DollarSign, color: "green" },
  { key: "epidemiology", label: "نماذج الاستقصاء الوبائي", icon: Activity, color: "red" },
  { key: "statistics", label: "نماذج الإحصائيات", icon: FileBarChart, color: "purple" },
  { key: "contract_renewal", label: "نماذج تجديد العقد", icon: RefreshCw, color: "orange" },
  { key: "additional", label: "نماذج إضافية", icon: FilePlus, color: "indigo" }
];



const colorClasses = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800"
  },
  green: {
    bg: "from-green-500 to-green-600",
    light: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800"
  },
  red: {
    bg: "from-red-500 to-red-600",
    light: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800"
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    light: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-800"
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    light: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800"
  },
  indigo: {
    bg: "from-indigo-500 to-indigo-600",
    light: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-800"
  }
};

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("leaves");
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [viewingForm, setViewingForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewCategory, setPreviewCategory] = useState(null);
  const [indexingFormId, setIndexingFormId] = useState(null);
  const [searchInContent, setSearchInContent] = useState(false);
  const [movingForm, setMovingForm] = useState(null);
  const [targetCategory, setTargetCategory] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');

  useEffect(() => {
    if (typeParam && categories.find(c => c.key === typeParam)) {
      setActiveCategory(typeParam);
    }
  }, [typeParam]);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FormTemplate.list();
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveForm = async (form, newCategory) => {
    if (!form || !newCategory || form.category === newCategory) return;
    
    try {
      await base44.entities.FormTemplate.update(form.id, { category: newCategory });
      await loadForms();
      setMovingForm(null);
      setTargetCategory("");
      alert('تم نقل النموذج بنجاح');
    } catch (error) {
      console.error('Error moving form:', error);
      alert('فشل في نقل النموذج');
    }
  };

  const handleFileSelect = (category, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const categoryInfo = categories.find(c => c.key === category);
    setPreviewFile(file);
    setPreviewCategory({ key: category, label: categoryInfo?.label });
    
    // Reset the input
    event.target.value = '';
  };

  const handleConfirmUpload = async ({ file, title, description }) => {
    if (!previewCategory) return;
    
    setUploadingCategory(previewCategory.key);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.FormTemplate.create({
        category: previewCategory.key,
        title: title,
        description: description,
        file_url: file_url,
        file_name: file.name
      });

      await loadForms();
      alert('تم رفع النموذج بنجاح');
      setPreviewFile(null);
      setPreviewCategory(null);
    } catch (error) {
      console.error('Error uploading form:', error);
      alert('فشل في رفع النموذج');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.FormTemplate.delete(id);
      await loadForms();
      alert('تم حذف النموذج بنجاح');
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('فشل في حذف النموذج');
    }
  };

  const downloadFile = async (url, name) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name || 'form';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.open(url, '_blank');
    }
  };

  const indexFormContent = async (form) => {
    if (!form?.file_url) return;
    
    setIndexingFormId(form.id);
    try {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: form.file_url,
        json_schema: {
          type: "object",
          properties: {
            full_text: { type: "string", description: "النص الكامل المستخرج من الملف" }
          }
        }
      });

      if (result.status === "success" && result.output?.full_text) {
        await base44.entities.FormTemplate.update(form.id, {
          extracted_text: result.output.full_text,
          is_indexed: true
        });
        await loadForms();
        alert('تم فهرسة محتوى الملف بنجاح');
      } else {
        throw new Error('فشل استخراج النص');
      }
    } catch (error) {
      console.error('Error indexing form:', error);
      alert('فشل في فهرسة محتوى الملف');
    } finally {
      setIndexingFormId(null);
    }
  };

  const indexAllForms = async () => {
    const unindexedForms = forms.filter(f => !f.is_indexed);
    if (unindexedForms.length === 0) {
      alert('جميع النماذج مفهرسة بالفعل');
      return;
    }
    
    for (const form of unindexedForms) {
      await indexFormContent(form);
    }
  };

  const filteredForms = (category) => {
    const categoryForms = Array.isArray(forms) ? forms.filter(f => f.category === category) : [];
    if (!searchQuery) return categoryForms;
    
    const query = searchQuery.toLowerCase();
    return categoryForms.filter(form => 
      form?.title?.toLowerCase().includes(query) ||
      form?.description?.toLowerCase().includes(query) ||
      form?.file_name?.toLowerCase().includes(query) ||
      (searchInContent && form?.extracted_text?.toLowerCase().includes(query))
    );
  };

  const getSearchMatchPreview = (form) => {
    if (!searchInContent || !searchQuery || !form?.extracted_text) return null;
    
    const query = searchQuery.toLowerCase();
    const text = form.extracted_text;
    const index = text.toLowerCase().indexOf(query);
    
    if (index === -1) return null;
    
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + query.length + 30);
    let preview = text.substring(start, end);
    
    if (start > 0) preview = '...' + preview;
    if (end < text.length) preview = preview + '...';
    
    return preview;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">مكتبة النماذج المرفوعة</h1>
            <p className="text-gray-600">إدارة وعرض جميع النماذج والاستمارات الرسمية المرفوعة</p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
              <div className="relative flex-grow sm:w-80">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={searchInContent ? "ابحث في العناوين والمحتوى..." : "ابحث في العناوين..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button
                variant={searchInContent ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchInContent(!searchInContent)}
                title="البحث في محتوى الملفات"
                className={searchInContent ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <FileSearch className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <div className="border-b bg-gray-50/50 px-4 py-2">
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-transparent h-auto">
                {(categories || []).map((cat) => {
                  const Icon = cat.icon;
                  const count = (forms || []).filter(f => f.category === cat.key).length;
                    const colors = colorClasses[cat.color];
                    
                    return (
                      <TabsTrigger
                        key={cat.key}
                        value={cat.key}
                        className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-700 leading-tight">{cat.label}</div>
                          <Badge variant="secondary" className={`mt-1 text-xs ${colors.badge}`}>
                            {count}
                          </Badge>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {(categories || []).map((cat) => {
                const Icon = cat.icon;
                const categoryForms = filteredForms(cat.key) || [];
                const colors = colorClasses[cat.color];
                
                return (
                  <TabsContent key={cat.key} value={cat.key} className="p-6">
                    <div className="space-y-6">
                      {/* Category Header */}
                      <div className={`rounded-lg p-4 ${colors.light} border ${colors.border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">{cat.label}</h2>
                              <p className="text-sm text-gray-600">
                                {categoryForms.length === 0 ? 'لا توجد نماذج' : `${categoryForms.length} نموذج`}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <input
                              type="file"
                              id={`upload-${cat.key}`}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileSelect(cat.key, e)}
                              disabled={uploadingCategory === cat.key}
                            />
                            <label htmlFor={`upload-${cat.key}`}>
                              <Button
                                asChild
                                disabled={uploadingCategory === cat.key}
                                className={`bg-gradient-to-r ${colors.bg} hover:opacity-90 text-white shadow-md`}
                              >
                                <span className="cursor-pointer">
                                  {uploadingCategory === cat.key ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                      جاري الرفع...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 ml-2" />
                                      رفع نموذج جديد
                                    </>
                                  )}
                                </span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Forms Grid */}
                      {loading ? (
                        <div className="text-center py-12">
                          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-gray-400" />
                          <p className="text-gray-500">جاري التحميل...</p>
                        </div>
                      ) : !Array.isArray(categoryForms) || categoryForms.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            {searchQuery ? 'لم يتم العثور على نماذج' : 'لا توجد نماذج في هذه الفئة'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {searchQuery ? 'جرب كلمات بحث أخرى' : 'ابدأ برفع نموذج جديد'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(categoryForms || []).map((form) => (
                            <Card key={form.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300">
                              <CardContent className="p-5">
                                <div className="space-y-4">
                                  {/* Icon & Title */}
                                  <div className="flex items-start gap-3">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                                      <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-base text-gray-900 leading-tight line-clamp-2" title={form.title}>
                                        {form.title}
                                      </h3>
                                      {form.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={form.description}>
                                          {form.description}
                                        </p>
                                      )}
                                      {form.is_indexed && (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                                          <CheckCircle className="w-3 h-3" />
                                          مفهرس
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* File Name */}
                                  {form.file_name && (
                                    <div className={`text-xs ${colors.text} ${colors.light} p-2 rounded-md border ${colors.border}`}>
                                      <FileText className="w-3 h-3 inline-block ml-1" />
                                      {form.file_name}
                                    </div>
                                  )}

                                  {/* Search Match Preview */}
                                  {getSearchMatchPreview(form) && (
                                    <div className="text-xs bg-yellow-50 p-2 rounded-md border border-yellow-200 text-yellow-800">
                                      <FileSearch className="w-3 h-3 inline-block ml-1" />
                                      <span className="font-medium">نتيجة البحث: </span>
                                      {getSearchMatchPreview(form)}
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setViewingForm(form)}
                                      className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                    >
                                      <Eye className="w-4 h-4 ml-1" />
                                      عرض
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadFile(form.file_url, form.file_name)}
                                      className="flex-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                    >
                                      <Download className="w-4 h-4 ml-1" />
                                      تحميل
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => indexFormContent(form)}
                                      disabled={indexingFormId === form.id || form.is_indexed}
                                      className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                      title={form.is_indexed ? "تم الفهرسة" : "فهرسة المحتوى"}
                                    >
                                      {indexingFormId === form.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : form.is_indexed ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <FileSearch className="w-4 h-4" />
                                      )}
                                    </Button>
                                    {/* Move Form Button */}
                                    <AlertDialog open={movingForm?.id === form.id} onOpenChange={(open) => !open && setMovingForm(null)}>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setMovingForm(form)}
                                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                          title="نقل النموذج"
                                        >
                                          <MoveRight className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>نقل النموذج</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            اختر الفئة التي تريد نقل النموذج إليها
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-4">
                                          <Select value={targetCategory} onValueChange={setTargetCategory}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="اختر الفئة الجديدة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories.filter(c => c.key !== form.category).map(c => (
                                                <SelectItem key={c.key} value={c.key}>
                                                  {c.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel onClick={() => { setMovingForm(null); setTargetCategory(""); }}>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleMoveForm(form, targetCategory)} 
                                            disabled={!targetCategory}
                                            className="bg-blue-600 hover:bg-blue-700"
                                          >
                                            نقل
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    {/* Delete Button */}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            هل أنت متأكد من حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(form.id)} className="bg-red-600 hover:bg-red-700">
                                            حذف
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* File Preview Dialog */}
      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFile(null);
            setPreviewCategory(null);
          }
        }}
        onConfirm={handleConfirmUpload}
        category={previewCategory?.key}
        categoryLabel={previewCategory?.label}
      />

      {/* Viewer */}
      {viewingForm && (
        <FormViewer
          forms={[viewingForm]}
          onRefresh={() => {
            setViewingForm(null);
            loadForms();
          }}
        />
      )}
    </div>
  );
}