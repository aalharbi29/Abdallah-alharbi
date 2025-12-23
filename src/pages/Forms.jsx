import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Calendar, DollarSign, Activity, FileBarChart, RefreshCw, FilePlus, Download, Eye, Trash2, Search, Loader2, FileSearch, CheckCircle, MoveRight, Users, Briefcase, FolderOpen } from "lucide-react";
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
  { key: "hr", label: "الموارد البشرية", icon: Users, color: "blue", description: "إجازات، تكاليف، تجديد عقود" },
  { key: "medical", label: "الشؤون الطبية", icon: Activity, color: "red", description: "استقصاء وبائي، تقارير طبية" },
  { key: "statistics", label: "الإحصاء والتقارير", icon: FileBarChart, color: "purple", description: "إحصائيات، تقارير دورية" },
  { key: "administrative", label: "الشؤون الإدارية", icon: Briefcase, color: "green", description: "مراسلات، قرارات، محاضر" },
  { key: "financial", label: "الشؤون المالية", icon: DollarSign, color: "orange", description: "مطالبات، صرف، ميزانيات" },
  { key: "other", label: "نماذج أخرى", icon: FilePlus, color: "indigo", description: "نماذج متنوعة" }
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
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">مكتبة النماذج الرسمية</h1>
                <p className="text-blue-100 text-sm md:text-base">إدارة وتنظيم جميع النماذج والاستمارات الرسمية</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">{forms.length} نموذج</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-grow w-full">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={searchInContent ? "🔍 ابحث في العناوين والمحتوى..." : "🔍 ابحث في العناوين..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-12 text-base border-2 focus:border-blue-500"
                />
              </div>
              <Button
                variant={searchInContent ? "default" : "outline"}
                onClick={() => setSearchInContent(!searchInContent)}
                className={`h-12 px-6 ${searchInContent ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                <FileSearch className="w-5 h-5 ml-2" />
                بحث متقدم
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories || []).map((cat) => {
            const Icon = cat.icon;
            const count = (forms || []).filter(f => f.category === cat.key).length;
            const colors = colorClasses[cat.color];
            const isActive = activeCategory === cat.key;
            
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`relative p-4 rounded-xl transition-all duration-300 text-right ${
                  isActive 
                    ? `bg-gradient-to-br ${colors.bg} text-white shadow-lg scale-105` 
                    : `bg-white border-2 ${colors.border} hover:shadow-md hover:scale-102`
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${colors.bg}`} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white'}`} />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                  {cat.label}
                </h3>
                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'} line-clamp-1`}>
                  {cat.description}
                </p>
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/30 text-white' : colors.badge
                }`}>
                  {count}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <div className="hidden"></div>

              {(categories || []).map((cat) => {
                const Icon = cat.icon;
                const categoryForms = filteredForms(cat.key) || [];
                const colors = colorClasses[cat.color];
                
                return (
                  <TabsContent key={cat.key} value={cat.key} className="p-6">
                    <div className="space-y-6">
                      {/* Category Header */}
                      <div className={`rounded-2xl p-6 bg-gradient-to-r ${colors.bg} text-white shadow-lg`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold">{cat.label}</h2>
                              <p className="text-white/80 text-sm mt-1">
                                {cat.description} • {categoryForms.length === 0 ? 'لا توجد نماذج' : `${categoryForms.length} نموذج`}
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
                                className="bg-white text-gray-800 hover:bg-gray-100 shadow-md font-semibold"
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
                        <div className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">جاري تحميل النماذج...</p>
                        </div>
                      ) : !Array.isArray(categoryForms) || categoryForms.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-200 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-xl font-bold text-gray-600 mb-2">
                            {searchQuery ? 'لم يتم العثور على نماذج' : 'لا توجد نماذج بعد'}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            {searchQuery ? 'جرب كلمات بحث أخرى' : 'ابدأ برفع نموذج جديد لهذه الفئة'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {(categoryForms || []).map((form, index) => (
                            <Card key={form.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                              <div className={`h-2 bg-gradient-to-r ${colors.bg}`}></div>
                              <CardContent className="p-5">
                                <div className="space-y-4">
                                  {/* Icon & Title */}
                                  <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                      <FileText className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors" title={form.title}>
                                        {form.title}
                                      </h3>
                                      {form.description && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2" title={form.description}>
                                          {form.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Meta Info */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {form.is_indexed && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        مفهرس
                                      </span>
                                    )}
                                    {form.file_name && (
                                      <span className={`text-xs ${colors.badge} px-2 py-1 rounded-full truncate max-w-[200px]`}>
                                        {form.file_name}
                                      </span>
                                    )}
                                  </div>

                                  {/* Search Match Preview */}
                                  {getSearchMatchPreview(form) && (
                                    <div className="text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800">
                                      <FileSearch className="w-3 h-3 inline-block ml-1" />
                                      <span className="font-semibold">نتيجة البحث: </span>
                                      {getSearchMatchPreview(form)}
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <Button
                                      size="sm"
                                      onClick={() => setViewingForm(form)}
                                      className={`flex-1 bg-gradient-to-r ${colors.bg} hover:opacity-90 text-white shadow-sm`}
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
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => indexFormContent(form)}
                                        disabled={indexingFormId === form.id || form.is_indexed}
                                        className="hover:bg-purple-50 hover:text-purple-700 px-2"
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
                                            variant="ghost"
                                            onClick={() => setMovingForm(form)}
                                            className="hover:bg-blue-50 hover:text-blue-700 px-2"
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
                                            variant="ghost"
                                            className="hover:bg-red-50 hover:text-red-700 px-2"
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