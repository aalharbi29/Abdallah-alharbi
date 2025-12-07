import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  FileText,
  Archive,
  Search,
  Loader2,
  Check,
  Save
} from "lucide-react";
import { Employee } from "@/entities/Employee";
import { EmployeeDocument } from "@/entities/EmployeeDocument";
import { FormTemplate } from "@/entities/FormTemplate";
import { ArchivedFile } from "@/entities/ArchivedFile";
import { base44 } from "@/api/base44Client";

const documentTypeLabels = {
  personal: 'مستندات شخصية',
  official: 'مستندات رسمية',
  certificate: 'شهادات ومؤهلات',
  contract: 'عقود وتكليفات',
  evaluation: 'تقييمات أداء',
  other: 'أخرى'
};

const archiveCategoryLabels = {
  circulars: 'التعاميم',
  inventory: 'الحصر',
  assignments: 'التكاليف',
  other: 'أخرى'
};

export default function SaveToLocationDialog({ 
  open, 
  onOpenChange, 
  pdfBase64, 
  defaultFilename,
  onSaveComplete 
}) {
  const [activeTab, setActiveTab] = useState("employee");
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [documentTitle, setDocumentTitle] = useState(defaultFilename || "");
  const [documentType, setDocumentType] = useState("official");
  const [archiveCategory, setArchiveCategory] = useState("other");
  const [formCategory, setFormCategory] = useState("أخرى");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadEmployees();
      setDocumentTitle(defaultFilename || "ملف PDF");
    }
  }, [open, defaultFilename]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await Employee.list('-full_name_arabic', 500);
      setEmployees(data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.toLowerCase().includes(query) ||
      emp.المركز_الصحي?.toLowerCase().includes(query)
    );
  });

  const uploadPdfFile = async () => {
    // تحويل base64 إلى File
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const file = new File([blob], `${documentTitle}.pdf`, { type: 'application/pdf' });
    
    // رفع الملف
    const result = await base44.integrations.Core.UploadFile({ file });
    return result.file_url;
  };

  const handleSaveToEmployee = async () => {
    if (!selectedEmployee) {
      alert("يرجى اختيار موظف");
      return;
    }

    setIsSaving(true);
    try {
      const fileUrl = await uploadPdfFile();
      
      await EmployeeDocument.create({
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.full_name_arabic,
        document_title: documentTitle,
        document_type: documentType,
        file_url: fileUrl,
        file_name: `${documentTitle}.pdf`,
        tags: ["محرر PDF"]
      });

      alert(`✅ تم حفظ الملف في ملف الموظف: ${selectedEmployee.full_name_arabic}`);
      onSaveComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving to employee:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToForms = async () => {
    setIsSaving(true);
    try {
      const fileUrl = await uploadPdfFile();
      
      await FormTemplate.create({
        category: formCategory,
        title: documentTitle,
        description: "تم إنشاؤه من محرر PDF",
        file_url: fileUrl,
        file_name: `${documentTitle}.pdf`
      });

      alert("✅ تم حفظ الملف في النماذج");
      onSaveComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving to forms:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToArchive = async () => {
    setIsSaving(true);
    try {
      const fileUrl = await uploadPdfFile();
      
      await ArchivedFile.create({
        title: documentTitle,
        category: archiveCategory,
        file_url: fileUrl,
        file_name: `${documentTitle}.pdf`,
        tags: ["محرر PDF"]
      });

      alert("✅ تم حفظ الملف في الأرشيف");
      onSaveComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving to archive:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            حفظ الملف في النظام
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* اسم الملف */}
          <div>
            <Label>اسم الملف</Label>
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="أدخل اسم الملف"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="employee" className="gap-1">
                <User className="w-4 h-4" />
                ملف موظف
              </TabsTrigger>
              <TabsTrigger value="forms" className="gap-1">
                <FileText className="w-4 h-4" />
                النماذج
              </TabsTrigger>
              <TabsTrigger value="archive" className="gap-1">
                <Archive className="w-4 h-4" />
                الأرشيف
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employee" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="space-y-3 flex-1 flex flex-col">
                {/* نوع المستند */}
                <div>
                  <Label>نوع المستند</Label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* البحث عن موظف */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن موظف بالاسم أو الرقم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* قائمة الموظفين */}
                <ScrollArea className="flex-1 border rounded-lg p-2 min-h-[200px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      لا يوجد موظفين
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredEmployees.slice(0, 50).map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedEmployee?.id === emp.id
                              ? 'bg-blue-50 border-blue-300'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {selectedEmployee?.id === emp.id && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{emp.full_name_arabic}</p>
                            <p className="text-sm text-gray-600">
                              {emp.رقم_الموظف} • {emp.المركز_الصحي}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <Button
                  onClick={handleSaveToEmployee}
                  disabled={!selectedEmployee || isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ في ملف الموظف
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="forms" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label>فئة النموذج</Label>
                  <Input
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="أدخل فئة النموذج"
                  />
                </div>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">سيتم حفظ الملف في قسم النماذج</p>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSaveToForms}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ في النماذج
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="archive" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label>فئة الأرشيف</Label>
                  <select
                    value={archiveCategory}
                    onChange={(e) => setArchiveCategory(e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    {Object.entries(archiveCategoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Archive className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">سيتم حفظ الملف في الأرشيف</p>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSaveToArchive}
                  disabled={isSaving}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ في الأرشيف
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}