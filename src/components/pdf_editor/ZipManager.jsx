import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileArchive, 
  Loader2, 
  FileText,
  Folder,
  Package,
  X,
  Save,
  Archive,
  User,
  FileSignature,
  Check,
  Trash2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function ZipManager({ onFilesExtracted }) {
  const [zipFile, setZipFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [savedFiles, setSavedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFinalSaveDialog, setShowFinalSaveDialog] = useState(false);
  const [saveDestination, setSaveDestination] = useState('archive');
  const [employees, setEmployees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  // حالة حفظ مؤقت
  const [tempSaveData, setTempSaveData] = useState({
    title: '',
    description: ''
  });

  // حالة حفظ نهائي
  const [finalSaveData, setFinalSaveData] = useState({
    // للأرشيف
    category: 'other',
    sub_category: '',
    tags: '',
    // للموظفين
    employee_id: '',
    employee_name: '',
    document_type: 'official',
    // للنماذج
    form_category: 'additional'
  });

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.zip', '.rar', '.7z'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert('الرجاء اختيار ملف مضغوط (ZIP, RAR, 7Z)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      setZipFile({
        name: file.name,
        url: result.file_url,
        size: file.size
      });

      setUploadProgress(100);
      alert('تم رفع الملف المضغوط بنجاح');
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleExtractZip = async () => {
    if (!zipFile) return;

    setIsExtracting(true);

    try {
      const response = await base44.functions.invoke('extractZipFile', {
        fileUrl: zipFile.url
      });

      if (response.data?.success) {
        const files = response.data.files || [];
        setExtractedFiles(files);
        alert(`✅ ${response.data.message}\nملفات PDF: ${response.data.pdfFiles}`);
      } else {
        throw new Error(response.data?.error || 'فشل فك الضغط');
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert(`حدث خطأ أثناء فك الضغط:\n${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveZip = () => {
    setZipFile(null);
    setExtractedFiles([]);
    setSelectedFiles([]);
  };

  const toggleFileSelection = (fileIndex) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileIndex)) {
        return prev.filter(i => i !== fileIndex);
      } else {
        return [...prev, fileIndex];
      }
    });
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === extractedFiles.filter(f => f.isPDF).length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(extractedFiles.map((_, idx) => idx).filter(idx => extractedFiles[idx].isPDF));
    }
  };

  const handleSaveToTemp = async (file) => {
    setCurrentFile(file);
    setTempSaveData({
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: ''
    });
    setShowSaveDialog(true);
  };

  const handleSaveTempConfirm = async () => {
    if (!tempSaveData.title.trim()) {
      alert('يرجى إدخال عنوان الملف');
      return;
    }

    setIsSaving(true);
    try {
      // تحويل Base64 إلى Blob ورفعه
      const binaryString = atob(currentFile.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], `${tempSaveData.title}.pdf`, { type: 'application/pdf' });

      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // إضافة إلى قائمة الملفات المحفوظة مؤقتاً
      const newSavedFile = {
        id: Date.now(),
        name: `${tempSaveData.title}.pdf`,
        title: tempSaveData.title,
        description: tempSaveData.description,
        url: uploadResult.file_url,
        size: currentFile.size,
        originalName: currentFile.name
      };

      setSavedFiles(prev => [...prev, newSavedFile]);
      
      // إرسال إلى المكون الأب لإضافته للدمج
      if (onFilesExtracted) {
        onFilesExtracted([{
          id: newSavedFile.id,
          name: newSavedFile.name,
          url: newSavedFile.url,
          size: newSavedFile.size,
          fromZip: false
        }]);
      }

      alert('✅ تم حفظ الملف مؤقتاً! يمكنك الآن دمجه أو تقسيمه');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('حدث خطأ أثناء حفظ الملف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSelectedToTemp = async () => {
    if (selectedFiles.length === 0) {
      alert('يرجى تحديد ملف واحد على الأقل');
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const idx of selectedFiles) {
        const file = extractedFiles[idx];
        if (!file.isPDF) continue;

        try {
          const binaryString = atob(file.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const fileObj = new File([blob], file.name, { type: 'application/pdf' });

          const uploadResult = await base44.integrations.Core.UploadFile({ file: fileObj });

          const newSavedFile = {
            id: Date.now() + idx,
            name: file.name,
            title: file.name.replace(/\.[^/.]+$/, ''),
            description: '',
            url: uploadResult.file_url,
            size: file.size,
            originalName: file.name
          };

          setSavedFiles(prev => [...prev, newSavedFile]);
          
          if (onFilesExtracted) {
            onFilesExtracted([{
              id: newSavedFile.id,
              name: newSavedFile.name,
              url: newSavedFile.url,
              size: newSavedFile.size,
              fromZip: false
            }]);
          }

          successCount++;
        } catch (fileError) {
          console.error(`Error saving file ${file.name}:`, fileError);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`✅ تم حفظ ${successCount} ملف مؤقتاً! يمكنك الآن دمجها أو تقسيمها`);
      }
      if (failCount > 0) {
        alert(`⚠️ فشل حفظ ${failCount} ملف`);
      }
      
      setSelectedFiles([]);
    } catch (error) {
      console.error('Batch save error:', error);
      alert('حدث خطأ أثناء حفظ الملفات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSave = async (file) => {
    setCurrentFile(file);
    setFinalSaveData({
      category: 'other',
      sub_category: '',
      tags: '',
      employee_id: '',
      employee_name: '',
      document_type: 'official',
      form_category: 'additional'
    });
    
    if (employees.length === 0) {
      await loadEmployees();
    }
    
    setShowFinalSaveDialog(true);
  };

  const loadEmployees = async () => {
    try {
      const data = await base44.entities.Employee.list('-full_name_arabic', 500);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleFinalSaveConfirm = async () => {
    setIsSaving(true);
    try {
      if (saveDestination === 'archive') {
        await base44.entities.ArchivedFile.create({
          title: currentFile.title,
          description: currentFile.description || finalSaveData.tags,
          category: finalSaveData.category,
          sub_category: finalSaveData.sub_category,
          file_url: currentFile.url,
          file_name: currentFile.name,
          tags: finalSaveData.tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        alert('✅ تم حفظ الملف في الأرشيف بنجاح!');
      } else if (saveDestination === 'employee') {
        if (!finalSaveData.employee_id) {
          alert('يرجى اختيار موظف');
          return;
        }
        await base44.entities.EmployeeDocument.create({
          employee_id: finalSaveData.employee_id,
          employee_name: finalSaveData.employee_name,
          document_title: currentFile.title,
          document_type: finalSaveData.document_type,
          description: currentFile.description || '',
          file_url: currentFile.url,
          file_name: currentFile.name,
          tags: finalSaveData.tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        alert(`✅ تم حفظ الملف في مستندات ${finalSaveData.employee_name} بنجاح!`);
      } else if (saveDestination === 'forms') {
        await base44.entities.FormTemplate.create({
          category: finalSaveData.form_category,
          title: currentFile.title,
          description: currentFile.description || '',
          file_url: currentFile.url,
          file_name: currentFile.name
        });
        alert('✅ تم حفظ الملف في النماذج بنجاح!');
      }

      // حذف من القائمة المؤقتة
      setSavedFiles(prev => prev.filter(f => f.id !== currentFile.id));
      setShowFinalSaveDialog(false);
    } catch (error) {
      console.error('Final save error:', error);
      alert('حدث خطأ أثناء الحفظ النهائي');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedFile = (fileId) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف من القائمة المؤقتة؟')) {
      setSavedFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* قسم رفع وفك الضغط */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5 text-indigo-600" />
            رفع وفك ضغط الملفات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".zip,.rar,.7z"
              onChange={handleZipUpload}
              className="hidden"
              id="zip-upload"
              disabled={isUploading || isExtracting}
            />
            <label htmlFor="zip-upload" className="cursor-pointer">
              <FileArchive className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                اضغط هنا لاختيار ملف مضغوط
              </p>
              <p className="text-xs text-gray-500">
                يدعم ZIP, RAR, 7Z
              </p>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-center text-gray-600">
                جاري الرفع... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {zipFile && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium">{zipFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(zipFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveZip}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  onClick={handleExtractZip}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري فك الضغط...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 ml-2" />
                      فك الضغط
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* الملفات المستخرجة */}
      {extractedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                الملفات المستخرجة ({extractedFiles.filter(f => f.isPDF).length} PDF)
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllFiles}
                >
                  <Check className="w-4 h-4 ml-2" />
                  {selectedFiles.length === extractedFiles.filter(f => f.isPDF).length ? 'إلغاء الكل' : 'تحديد الكل'}
                </Button>
                {selectedFiles.length > 0 && (
                  <Button
                    size="sm"
                    onClick={handleSaveSelectedToTemp}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ المحدد ({selectedFiles.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {extractedFiles.map((file, index) => (
                <Card 
                  key={index} 
                  className={`${file.isPDF ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'} hover:shadow-md transition-shadow ${
                    selectedFiles.includes(index) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {file.isPDF && (
                        <Checkbox
                          checked={selectedFiles.includes(index)}
                          onCheckedChange={() => toggleFileSelection(index)}
                          className="mt-1"
                        />
                      )}
                      {file.isPDF ? (
                        <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      ) : (
                        <FileArchive className="w-8 h-8 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        {file.isPDF && (
                          <div className="flex gap-1 mt-2">
                            <Badge className="bg-blue-600 text-white text-xs">
                              PDF
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              onClick={() => handleSaveToTemp(file)}
                            >
                              <Save className="w-3 h-3 ml-1" />
                              حفظ
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الملفات المحفوظة مؤقتاً */}
      {savedFiles.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-green-600" />
              الملفات المحفوظة مؤقتاً ({savedFiles.length})
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              الملفات أدناه متاحة للدمج والتقسيم وحذف الصفحات. احفظها نهائياً في الأرشيف أو ملفات الموظفين.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {savedFiles.map((file) => (
                <Card key={file.id} className="bg-white border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.title}</p>
                          {file.description && (
                            <p className="text-xs text-gray-500 truncate">{file.description}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.size)} • أصلي: {file.originalName}
                          </p>
                          <Badge className="mt-1 bg-green-100 text-green-700 text-xs">
                            جاهز للتعديل والحفظ
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFinalSave(file)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Archive className="w-4 h-4 ml-1" />
                          حفظ نهائي
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSavedFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* حوار الحفظ المؤقت */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حفظ مؤقت للملف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="temp-title">عنوان الملف *</Label>
              <Input
                id="temp-title"
                value={tempSaveData.title}
                onChange={(e) => setTempSaveData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="أدخل عنوان الملف"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="temp-description">وصف (اختياري)</Label>
              <Textarea
                id="temp-description"
                value={tempSaveData.description}
                onChange={(e) => setTempSaveData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل وصف الملف"
                rows={2}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={isSaving}>
              إلغاء
            </Button>
            <Button onClick={handleSaveTempConfirm} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ مؤقتاً
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار الحفظ النهائي */}
      <Dialog open={showFinalSaveDialog} onOpenChange={setShowFinalSaveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>حفظ نهائي في النظام</DialogTitle>
          </DialogHeader>
          <Tabs value={saveDestination} onValueChange={setSaveDestination} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="archive">
                <Archive className="w-4 h-4 ml-2" />
                الأرشيف
              </TabsTrigger>
              <TabsTrigger value="employee">
                <User className="w-4 h-4 ml-2" />
                ملف موظف
              </TabsTrigger>
              <TabsTrigger value="forms">
                <FileSignature className="w-4 h-4 ml-2" />
                النماذج
              </TabsTrigger>
            </TabsList>

            <TabsContent value="archive" className="space-y-4 py-4">
              <div>
                <Label>الفئة</Label>
                <Select 
                  value={finalSaveData.category} 
                  onValueChange={(value) => setFinalSaveData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circulars">التعاميم المنظمة</SelectItem>
                    <SelectItem value="inventory">ملفات الحصر</SelectItem>
                    <SelectItem value="assignments">التكاليف</SelectItem>
                    <SelectItem value="other">ملفات أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {finalSaveData.category === 'circulars' && (
                <div>
                  <Label>الفئة الفرعية</Label>
                  <Select 
                    value={finalSaveData.sub_category} 
                    onValueChange={(value) => setFinalSaveData(prev => ({ ...prev, sub_category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policies_procedures">نماذج السياسات والإجراءات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {finalSaveData.category === 'inventory' && (
                <div>
                  <Label>الفئة الفرعية</Label>
                  <Select 
                    value={finalSaveData.sub_category} 
                    onValueChange={(value) => setFinalSaveData(prev => ({ ...prev, sub_category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human_resources">حصر بشري</SelectItem>
                      <SelectItem value="fixed_assets">حصر أصول ثابتة</SelectItem>
                      <SelectItem value="equipment">حصر أجهزة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>كلمات مفتاحية</Label>
                <Input
                  value={finalSaveData.tags}
                  onChange={(e) => setFinalSaveData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="مفصولة بفاصلة"
                />
              </div>
            </TabsContent>

            <TabsContent value="employee" className="space-y-4 py-4">
              <div>
                <Label>اختر الموظف *</Label>
                <Select 
                  value={finalSaveData.employee_id} 
                  onValueChange={(value) => {
                    const emp = employees.find(e => e.id === value);
                    setFinalSaveData(prev => ({ 
                      ...prev, 
                      employee_id: value,
                      employee_name: emp?.full_name_arabic || ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر موظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name_arabic} - {emp.رقم_الموظف}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>نوع المستند</Label>
                <Select 
                  value={finalSaveData.document_type} 
                  onValueChange={(value) => setFinalSaveData(prev => ({ ...prev, document_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">مستندات شخصية</SelectItem>
                    <SelectItem value="official">مستندات رسمية</SelectItem>
                    <SelectItem value="certificate">شهادات ومؤهلات</SelectItem>
                    <SelectItem value="contract">عقود وتكليفات</SelectItem>
                    <SelectItem value="evaluation">تقييمات أداء</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>كلمات مفتاحية</Label>
                <Input
                  value={finalSaveData.tags}
                  onChange={(e) => setFinalSaveData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="مفصولة بفاصلة"
                />
              </div>
            </TabsContent>

            <TabsContent value="forms" className="space-y-4 py-4">
              <div>
                <Label>فئة النموذج</Label>
                <Select 
                  value={finalSaveData.form_category} 
                  onValueChange={(value) => setFinalSaveData(prev => ({ ...prev, form_category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leaves">نماذج الإجازات</SelectItem>
                    <SelectItem value="assignments">نماذج التكاليف</SelectItem>
                    <SelectItem value="epidemiology">نماذج الاستقصاء الوبائي</SelectItem>
                    <SelectItem value="statistics">نماذج الإحصائيات</SelectItem>
                    <SelectItem value="contract_renewal">نماذج تجديد العقد</SelectItem>
                    <SelectItem value="additional">نماذج إضافية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalSaveDialog(false)} disabled={isSaving}>
              إلغاء
            </Button>
            <Button onClick={handleFinalSaveConfirm} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ نهائي
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}