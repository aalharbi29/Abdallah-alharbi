
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Upload, 
  FileText, 
  Users, 
  DollarSign,
  Award,
  Search,
  Plus,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  UserCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Edit // Added Edit icon
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PDFViewer from "@/components/files/PDFViewer";
import { downloadFileWithName } from "@/components/files/InlineFileReplacer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import StatementEditor from "@/components/holiday_assignments/StatementEditor"; // Added StatementEditor import

const HolidayFile = {
  list: async () => {
    const stored = localStorage.getItem('holiday_files');
    return stored ? JSON.parse(stored) : [];
  },
  create: async (data) => {
    const files = await HolidayFile.list();
    const newFile = { ...data, id: Date.now().toString(), created_date: new Date().toISOString() };
    files.push(newFile);
    localStorage.setItem('holiday_files', JSON.stringify(files));
    return newFile;
  },
  delete: async (id) => {
    const files = await HolidayFile.list();
    const filtered = files.filter(f => f.id !== id);
    localStorage.setItem('holiday_files', JSON.stringify(filtered));
  }
};

const HOLIDAYS = [
  { id: 'hajj', name: 'الحج', icon: Calendar },
  { id: 'eid_fitr', name: 'عيد الفطر', icon: Calendar },
  { id: 'national', name: 'اليوم الوطني ويوم التأسيس', icon: Calendar }
];

const CATEGORIES = [
  { id: 'certificates', name: 'شهادات الإنجاز', icon: Award },
  { id: 'financial', name: 'إقرارات مالية', icon: DollarSign },
  { id: 'names', name: 'الأسماء المكلفة', icon: Users }
];

export default function HolidayAssignments() {
  const [selectedHoliday, setSelectedHoliday] = useState('hajj');
  const [selectedCategory, setSelectedCategory] = useState('certificates');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [extractingFile, setExtractingFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  const [yearForAssignment, setYearForAssignment] = useState(new Date().getFullYear()); // Default to current Gregorian year
  const [yearType, setYearType] = useState('gregorian'); // Default to gregorian year for extraction
  const [isUpdatingEmployees, setIsUpdatingEmployees] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateResults, setUpdateResults] = useState([]);
  
  // حالة محرر البيان
  const [showStatementEditor, setShowStatementEditor] = useState(false);
  const [statements, setStatements] = useState([]);
  const [editingStatement, setEditingStatement] = useState(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const allFiles = await HolidayFile.list();
      const filtered = allFiles.filter(f => 
        f.holiday === selectedHoliday && f.category === selectedCategory
      );
      setFiles(filtered);
      
      // تحميل البيانات المحفوظة
      if (selectedCategory === 'names') {
        const statementsData = await base44.entities.HolidayAssignmentStatement.list('-created_date', 100);
        setStatements(Array.isArray(statementsData) ? statementsData : []);
      } else {
        setStatements([]); // Clear statements if not in 'names' category
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHoliday, selectedCategory]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file, title: file.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title) {
      alert('الرجاء إدخال العنوان واختيار ملف');
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file: uploadForm.file });
      
      await HolidayFile.create({
        title: uploadForm.title,
        description: uploadForm.description,
        file_url: uploadResult.file_url,
        file_name: uploadForm.file.name,
        holiday: selectedHoliday,
        category: selectedCategory
      });

      setShowUpload(false);
      setUploadForm({ title: '', description: '', file: null });
      loadFiles();
      alert('تم رفع الملف بنجاح');
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    
    try {
      await HolidayFile.delete(fileId);
      loadFiles();
      alert('تم حذف الملف بنجاح');
    } catch (error) {
      console.error('Delete error:', error);
      alert('حدث خطأ أثناء حذف الملف');
    }
  };

  const handleExtractNames = async (file) => {
    setExtractingFile(file);
    setShowExtractDialog(true);
    setIsExtracting(true);
    setExtractedData([]);
    setUpdateResults([]);
    // Set default year for assignment, assuming the current year based on common practice
    setYearForAssignment(new Date().getFullYear());
    setYearType('gregorian');

    try {
      const holidayName = HOLIDAYS.find(h => h.id === selectedHoliday)?.name;
      
      const response = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: file.file_url,
        json_schema: {
          type: "object",
          properties: {
            employees: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  full_name: { type: "string", description: "الاسم الكامل" },
                  employee_number: { type: "string", description: "رقم الموظف" },
                  national_id: { type: "string", description: "رقم الهوية" },
                  health_center: { type: "string", description: "المركز الصحي" },
                  position: { type: "string", description: "الوظيفة" }
                }
              }
            }
          },
          required: ["employees"],
          description: `استخرج قائمة بجميع الموظفين المكلفين في ${holidayName}. ابحث عن الأسماء وأرقام الموظفين في الجدول أو القائمة.`
        }
      });

      if (response.status === 'success' && response.output?.employees) {
        setExtractedData(response.output.employees);
        alert(`✅ تم استخلاص ${response.output.employees.length} موظف من الملف`);
      } else {
        throw new Error(response.details || 'فشل استخلاص البيانات');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert(`حدث خطأ أثناء استخلاص البيانات:\n${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateStatement = () => {
    if (extractedData.length === 0) {
      alert('يرجى استخلاص البيانات أولاً');
      return;
    }
    
    // Pass extracted data to the editor for a new statement
    setEditingStatement(null); // Ensure it's a new statement
    setShowStatementEditor(true);
    setShowExtractDialog(false); // Close extraction dialog
  };

  const handleEditStatement = (statement) => {
    setEditingStatement(statement);
    setShowStatementEditor(true);
  };

  const handleDeleteStatement = async (statementId) => {
    if (!confirm('هل أنت متأكد من حذف هذا البيان؟')) return;
    
    try {
      await base44.entities.HolidayAssignmentStatement.delete(statementId);
      loadFiles(); // Reload files and statements
      alert('تم حذف البيان بنجاح');
    } catch (error) {
      console.error('Delete error:', error);
      alert('حدث خطأ أثناء حذف البيان');
    }
  };

  const handleUpdateEmployees = async () => {
    if (extractedData.length === 0) {
      alert('لا توجد بيانات لتحديثها');
      return;
    }

    const holidayName = HOLIDAYS.find(h => h.id === selectedHoliday)?.name;
    if (!confirm(`هل أنت متأكد من تحديث ${extractedData.length} موظف بتكليف ${holidayName} ${yearForAssignment}؟`)) {
      return;
    }

    setIsUpdatingEmployees(true);
    setUpdateProgress(0);
    setUpdateResults([]);

    try {
      const allEmployees = await base44.entities.Employee.list('-updated_date', 1000);
      const results = [];

      for (let i = 0; i < extractedData.length; i++) {
        const extractedEmp = extractedData[i];
        setUpdateProgress(Math.round(((i + 1) / extractedData.length) * 100));

        try {
          let employee = null;
          
          if (extractedEmp.employee_number) {
            employee = allEmployees.find(e => e.رقم_الموظف === extractedEmp.employee_number);
          }
          
          if (!employee && extractedEmp.national_id) {
            employee = allEmployees.find(e => e.رقم_الهوية === extractedEmp.national_id);
          }
          
          if (!employee && extractedEmp.full_name) {
            employee = allEmployees.find(e => 
              e.full_name_arabic?.toLowerCase().includes(extractedEmp.full_name.toLowerCase()) ||
              (extractedEmp.full_name && e.full_name_arabic && extractedEmp.full_name.toLowerCase().includes(e.full_name_arabic?.toLowerCase()))
            );
          }

          if (employee) {
            const existingAssignments = employee.holiday_assignments || [];
            
            const alreadyExists = existingAssignments.some(a => 
              a.holiday_name === holidayName && 
              a.year === yearForAssignment && 
              a.year_type === yearType
            );

            if (!alreadyExists) {
              const newAssignment = {
                holiday_name: holidayName,
                year: yearForAssignment,
                year_type: yearType,
                assigned_center: extractedEmp.health_center || employee.المركز_الصحي,
                assignment_date: new Date().toISOString(),
                notes: extractingFile?.description || ''
              };

              await base44.entities.Employee.update(employee.id, {
                holiday_assignments: [...existingAssignments, newAssignment]
              });

              results.push({
                name: employee.full_name_arabic,
                status: 'success',
                message: 'تم التحديث بنجاح'
              });
            } else {
              results.push({
                name: employee.full_name_arabic,
                status: 'skipped',
                message: 'التكليف موجود مسبقاً'
              });
            }
          } else {
            results.push({
              name: extractedEmp.full_name || extractedEmp.employee_number || 'غير معروف',
              status: 'error',
              message: 'لم يتم العثور على الموظف'
            });
          }
        } catch (empError) {
          console.error('Error updating employee:', empError);
          results.push({
            name: extractedEmp.full_name || extractedEmp.employee_number || 'غير معروف',
            status: 'error',
            message: empError.message || 'خطأ في التحديث'
          });
        }
      }

      setUpdateResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const skippedCount = results.filter(r => r.status === 'skipped').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      alert(`✅ اكتملت العملية!\n\nتم التحديث: ${successCount}\nمتخطى: ${skippedCount}\nفشل: ${errorCount}`);
    } catch (error) {
      console.error('Update error:', error);
      alert('حدث خطأ أثناء تحديث الموظفين');
    } finally {
      setIsUpdatingEmployees(false);
      setUpdateProgress(0);
    }
  };

  const currentHoliday = HOLIDAYS.find(h => h.id === selectedHoliday);
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

  const filteredFiles = files.filter(file => 
    !searchQuery || file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-green-600" />
              تكليف الإجازات
            </h1>
            <p className="text-gray-600">إدارة التكاليف والإقرارات المالية وشهادات الإنجاز</p>
          </div>
          <Button onClick={loadFiles} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {HOLIDAYS.map(holiday => {
            const Icon = holiday.icon;
            return (
              <Card 
                key={holiday.id}
                className={`cursor-pointer transition-all ${
                  selectedHoliday === holiday.id 
                    ? 'border-green-500 shadow-lg bg-green-50' 
                    : 'hover:border-green-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedHoliday(holiday.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${selectedHoliday === holiday.id ? 'text-green-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold">{holiday.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentHoliday && <currentHoliday.icon className="w-5 h-5 text-green-600" />}
              {currentHoliday?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {CATEGORIES.map(category => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={`البحث في ${category.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowUpload(true)}>
                      <Plus className="w-4 h-4" />
                      رفع ملف
                    </Button>
                  </div>

                  {/* قائمة البيانات المحفوظة للأسماء */}
                  {category.id === 'names' && statements.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg">البيانات المحفوظة</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {statements.map(statement => (
                            <Card key={statement.id} className="bg-white">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{statement.title}</h4>
                                    <p className="text-sm text-gray-600">
                                      {statement.employees_data?.length || 0} موظف
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      التكليف: {statement.holiday_type} {statement.year} ({statement.year_type === 'hijri' ? 'هجري' : 'ميلادي'})
                                    </p>
                                    {statement.start_date && (
                                      <p className="text-xs text-gray-500">
                                        من {statement.start_date} إلى {statement.end_date}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Button size="icon" variant="ghost" onClick={() => handleEditStatement(statement)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteStatement(statement.id)}>
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="min-h-[300px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : filteredFiles.length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        <category.icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">لا توجد ملفات</h3>
                        <p className="text-sm mb-4">لم يتم إضافة أي {category.name} بعد</p>
                        <Button variant="outline" className="gap-2" onClick={() => setShowUpload(true)}>
                          <Upload className="w-4 h-4" />
                          رفع ملف
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFiles.map(file => (
                          <Card key={file.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <Badge variant="outline" className="text-xs">{category.name}</Badge>
                              </div>
                              <h4 className="font-semibold mb-1 line-clamp-2">{file.title}</h4>
                              {file.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description}</p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" variant="outline" onClick={() => setViewingFile(file)} className="flex-1">
                                  <Eye className="w-3 h-3 ml-1" />
                                  عرض
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadFileWithName(file.file_url, file.file_name)} className="flex-1">
                                  <Download className="w-3 h-3 ml-1" />
                                  تحميل
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(file.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {category.id === 'names' && (
                                <Button 
                                  size="sm" 
                                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                                  onClick={() => handleExtractNames(file)}
                                >
                                  <UserCheck className="w-3 h-3 ml-1" />
                                  استخلاص البيانات
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع ملف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>العنوان *</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان الملف"
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف اختياري"
                rows={3}
              />
            </div>
            <div>
              <Label>الملف *</Label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              {uploadForm.file && (
                <p className="text-sm text-gray-600 mt-2">
                  الملف المحدد: {uploadForm.file.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  رفع
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExtractDialog} onOpenChange={setShowExtractDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>استخلاص البيانات</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                <p className="text-lg font-medium">جاري استخلاص البيانات من الملف...</p>
                <p className="text-sm text-gray-500">قد يستغرق هذا بعض الوقت</p>
              </div>
            ) : extractedData.length > 0 ? (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    تم استخلاص {extractedData.length} موظف من الملف
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>السنة</Label>
                    <Input
                      type="number"
                      value={yearForAssignment}
                      onChange={(e) => setYearForAssignment(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>نوع التقويم</Label>
                    <Select value={yearType} onValueChange={setYearType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hijri">هجري</SelectItem>
                        <SelectItem value="gregorian">ميلادي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isUpdatingEmployees && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>جاري تحديث سجلات الموظفين...</span>
                      <span>{updateProgress}%</span>
                    </div>
                    <Progress value={updateProgress} />
                  </div>
                )}

                {updateResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {updateResults.map((result, idx) => (
                      <div key={idx} className={`p-2 border-b flex items-center gap-2 ${
                        result.status === 'success' ? 'bg-green-50' :
                        result.status === 'skipped' ? 'bg-yellow-50' : 'bg-red-50'
                      }`}>
                        {result.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : result.status === 'skipped' ? (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm flex-1">{result.name}</span>
                        <span className="text-xs text-gray-500">{result.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        <th className="p-2 text-right">#</th>
                        <th className="p-2 text-right">الاسم</th>
                        <th className="p-2 text-right">رقم الموظف</th>
                        <th className="p-2 text-right">المركز</th>
                        <th className="p-2 text-right">الوظيفة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedData.map((emp, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2">{emp.full_name || '-'}</td>
                          <td className="p-2">{emp.employee_number || '-'}</td>
                          <td className="p-2">{emp.health_center || '-'}</td>
                          <td className="p-2">{emp.position || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>لم يتم استخلاص أي بيانات بعد</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtractDialog(false)}>
              إغلاق
            </Button>
            {extractedData.length > 0 && !isUpdatingEmployees && (
              <>
                <Button 
                  onClick={handleUpdateEmployees}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserCheck className="w-4 h-4 ml-2" />
                  تحديث سجلات الموظفين
                </Button>
                <Button 
                  onClick={handleCreateStatement}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  إنشاء بيان رسمي
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* محرر البيان */}
      {showStatementEditor && (
        <StatementEditor
          extractedData={extractedData}
          holidayType={HOLIDAYS.find(h => h.id === selectedHoliday)?.name}
          year={yearForAssignment}
          yearType={yearType}
          initialStatement={editingStatement}
          onClose={() => {
            setShowStatementEditor(false);
            setEditingStatement(null);
            loadFiles(); // Reload statements after editor closes
          }}
        />
      )}

      {/* PDF Viewer */}
      <PDFViewer 
        file={viewingFile} 
        open={!!viewingFile} 
        onOpenChange={() => setViewingFile(null)}
      />
    </div>
  );
}
