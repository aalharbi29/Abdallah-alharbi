import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Loader2, Save, Download, Archive, User } from 'lucide-react';
import { Employee } from '@/entities/Employee';

export default function SavePDFDialog({ open, onOpenChange, pdfBase64, defaultFilename, onSaveComplete }) {
  const [activeTab, setActiveTab] = useState('download');
  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    // للأرشيف
    archiveTitle: defaultFilename || 'ملف PDF',
    archiveDescription: '',
    archiveCategory: 'other',
    archiveSubCategory: '',
    archiveTags: '',
    // لملف الموظف
    employeeId: '',
    employeeName: '',
    documentTitle: defaultFilename || 'ملف PDF',
    documentType: 'official',
    documentDescription: '',
    documentTags: ''
  });

  useEffect(() => {
    if (open && activeTab === 'employee') {
      loadEmployees();
    }
  }, [open, activeTab]);

  const loadEmployees = async () => {
    try {
      const data = await Employee.list('-full_name_arabic', 500);
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `${defaultFilename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (onSaveComplete) {
        onSaveComplete();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('حدث خطأ أثناء التحميل');
    }
  };

  const handleSaveToArchive = async () => {
    if (!formData.archiveTitle.trim()) {
      alert('يرجى إدخال عنوان الملف');
      return;
    }

    setIsSaving(true);
    try {
      // تحويل Base64 إلى Blob
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], `${formData.archiveTitle}.pdf`, { type: 'application/pdf' });

      // رفع الملف
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // حفظ في الأرشيف
      await base44.entities.ArchivedFile.create({
        title: formData.archiveTitle.trim(),
        description: formData.archiveDescription.trim(),
        category: formData.archiveCategory,
        sub_category: formData.archiveSubCategory || '',
        file_url: uploadResult.file_url,
        file_name: `${formData.archiveTitle}.pdf`,
        tags: formData.archiveTags.split(',').map(t => t.trim()).filter(Boolean)
      });

      alert('✅ تم حفظ الملف في الأرشيف بنجاح!');
      
      if (onSaveComplete) {
        onSaveComplete();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving to archive:', error);
      alert('حدث خطأ أثناء الحفظ في الأرشيف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToEmployee = async () => {
    if (!formData.employeeId || !formData.documentTitle.trim()) {
      alert('يرجى اختيار موظف وإدخال عنوان المستند');
      return;
    }

    setIsSaving(true);
    try {
      // تحويل Base64 إلى Blob
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], `${formData.documentTitle}.pdf`, { type: 'application/pdf' });

      // رفع الملف
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // حفظ في مستندات الموظف
      await base44.entities.EmployeeDocument.create({
        employee_id: formData.employeeId,
        employee_name: formData.employeeName,
        document_title: formData.documentTitle.trim(),
        document_type: formData.documentType,
        description: formData.documentDescription.trim(),
        file_url: uploadResult.file_url,
        file_name: `${formData.documentTitle}.pdf`,
        tags: formData.documentTags.split(',').map(t => t.trim()).filter(Boolean)
      });

      alert(`✅ تم حفظ الملف في مستندات ${formData.employeeName} بنجاح!`);
      
      if (onSaveComplete) {
        onSaveComplete();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving to employee:', error);
      alert('حدث خطأ أثناء الحفظ في مستندات الموظف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setFormData(prev => ({
      ...prev,
      employeeId,
      employeeName: employee?.full_name_arabic || ''
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>حفظ ملف PDF</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              تحميل
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              الأرشيف
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              ملف موظف
            </TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4 py-4">
            <div className="text-center py-8">
              <Download className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">تحميل الملف</h3>
              <p className="text-sm text-gray-600 mb-4">سيتم تحميل الملف مباشرة على جهازك</p>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                تحميل الآن
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="space-y-4 py-4">
            <div>
              <Label htmlFor="archiveTitle">عنوان الملف *</Label>
              <Input
                id="archiveTitle"
                value={formData.archiveTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, archiveTitle: e.target.value }))}
                placeholder="أدخل عنوان الملف"
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="archiveDescription">الوصف</Label>
              <Textarea
                id="archiveDescription"
                value={formData.archiveDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, archiveDescription: e.target.value }))}
                placeholder="أدخل وصف الملف"
                rows={3}
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="archiveCategory">الفئة</Label>
                <Select 
                  value={formData.archiveCategory} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, archiveCategory: value }))}
                  disabled={isSaving}
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

              {formData.archiveCategory === 'circulars' && (
                <div>
                  <Label htmlFor="archiveSubCategory">الفئة الفرعية</Label>
                  <Select 
                    value={formData.archiveSubCategory} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, archiveSubCategory: value }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policies_procedures">نماذج السياسات والإجراءات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.archiveCategory === 'inventory' && (
                <div>
                  <Label htmlFor="archiveSubCategory">الفئة الفرعية</Label>
                  <Select 
                    value={formData.archiveSubCategory} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, archiveSubCategory: value }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human_resources">حصر بشري</SelectItem>
                      <SelectItem value="fixed_assets">حصر أصول ثابتة</SelectItem>
                      <SelectItem value="equipment">حصر أجهزة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="archiveTags">كلمات مفتاحية (مفصولة بفاصلة)</Label>
              <Input
                id="archiveTags"
                value={formData.archiveTags}
                onChange={(e) => setFormData(prev => ({ ...prev, archiveTags: e.target.value }))}
                placeholder="مثال: حصر, 2024, الحناكية"
                disabled={isSaving}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <Button onClick={handleSaveToArchive} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ في الأرشيف
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="employee" className="space-y-4 py-4">
            <div>
              <Label htmlFor="employeeId">اختر الموظف *</Label>
              <Select 
                value={formData.employeeId} 
                onValueChange={handleEmployeeChange}
                disabled={isSaving}
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
              <Label htmlFor="documentTitle">عنوان المستند *</Label>
              <Input
                id="documentTitle"
                value={formData.documentTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, documentTitle: e.target.value }))}
                placeholder="أدخل عنوان المستند"
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="documentType">نوع المستند</Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
                disabled={isSaving}
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
              <Label htmlFor="documentDescription">الوصف</Label>
              <Textarea
                id="documentDescription"
                value={formData.documentDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, documentDescription: e.target.value }))}
                placeholder="أدخل وصف المستند"
                rows={3}
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="documentTags">كلمات مفتاحية (مفصولة بفاصلة)</Label>
              <Input
                id="documentTags"
                value={formData.documentTags}
                onChange={(e) => setFormData(prev => ({ ...prev, documentTags: e.target.value }))}
                placeholder="مثال: تكليف, عقد, شهادة"
                disabled={isSaving}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <Button onClick={handleSaveToEmployee} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ في ملف الموظف
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}