import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, Copy, FileText, FileSpreadsheet, CheckCircle2, Users, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function CenterEmployeeExporter({ 
  open, 
  onOpenChange, 
  employees = [],
  centerName = "",
  manager = null
}) {
  const [orderedEmployees, setOrderedEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set());
  const [selectedFields, setSelectedFields] = useState(new Set([
    "full_name_arabic", "رقم_الموظف", "position", "contract_type"
  ]));
  const [administrationName, setAdministrationName] = useState("إدارة الشؤون الصحية - الحناكية");
  const [managerName, setManagerName] = useState(manager?.full_name_arabic || "");
  const [managerTitle, setManagerTitle] = useState("مدير إدارة شؤون المراكز الصحية بالحناكية");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (employees.length > 0) {
      setOrderedEmployees([...employees]);
    }
  }, [employees]);

  const fieldDefinitions = [
    { key: "full_name_arabic", label: "الاسم الكامل" },
    { key: "رقم_الموظف", label: "رقم الموظف" },
    { key: "رقم_الهوية", label: "رقم الهوية" },
    { key: "birth_date", label: "تاريخ الميلاد" },
    { key: "gender", label: "الجنس" },
    { key: "nationality", label: "الجنسية" },
    { key: "phone", label: "الجوال" },
    { key: "email", label: "البريد الإلكتروني" },
    { key: "position", label: "التخصص" },
    { key: "department", label: "القسم" },
    { key: "job_category", label: "ملاك الوظيفة" },
    { key: "job_category_type", label: "فئة الوظيفة" },
    { key: "qualification", label: "المؤهل" },
    { key: "rank", label: "المرتبة" },
    { key: "sequence", label: "التسلسل" },
    { key: "level", label: "المستوى" },
    { key: "grade", label: "الدرجة" },
    { key: "hire_date", label: "تاريخ التوظيف" },
    { key: "contract_type", label: "نوع العقد" },
    { key: "contract_end_date", label: "تاريخ انتهاء العقد" },
  ];

  const handleToggleEmployee = (employeeId) => {
    const newSelected = new Set(selectedEmployeeIds);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployeeIds(newSelected);
  };

  const handleToggleField = (fieldKey) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldKey)) {
      newSelected.delete(fieldKey);
    } else {
      newSelected.add(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployeeIds.size === orderedEmployees.length) {
      setSelectedEmployeeIds(new Set());
    } else {
      setSelectedEmployeeIds(new Set(orderedEmployees.map(e => e.id)));
    }
  };

  const getSelectedEmployees = () => {
    return orderedEmployees.filter(e => selectedEmployeeIds.has(e.id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedEmployees);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedEmployees(items);
  };

  const moveEmployee = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === orderedEmployees.length - 1)
    ) {
      return;
    }

    const newOrder = [...orderedEmployees];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrderedEmployees(newOrder);
  };

  const generateTableHTML = () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0) return "";

    const fieldsArray = Array.from(selectedFields);
    const headers = fieldsArray.map(key => 
      fieldDefinitions.find(f => f.key === key)?.label || key
    );

    let html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>بيان موظفي ${centerName}</title>
  <style>
    * { font-family: 'Arial', 'Times New Roman', serif; }
    body { direction: rtl; margin: 20mm; font-size: 12px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #1e40af; margin: 10px 0; }
    .header h2 { font-size: 16px; color: #374151; margin: 5px 0; }
    .meta { text-align: right; margin-bottom: 20px; font-size: 11px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #374151; padding: 8px; text-align: center; }
    th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; font-weight: bold; font-size: 11px; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 40px; text-align: center; border-top: 2px solid #e5e7eb; padding-top: 20px; }
    .signature { display: inline-block; text-align: center; margin: 0 30px; }
    .signature-line { border-top: 1px solid #000; width: 200px; margin: 40px auto 10px; }
    @page { size: A4; margin: 15mm; }
  </style>
</head>
<body>
  <div class="header">
    <h1>بيان موظفي ${centerName}</h1>
    <h2>${administrationName}</h2>
  </div>
  
  <div class="meta">
    <div>التاريخ: ${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    <div>عدد الموظفين: ${selectedEmps.length}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>م</th>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${selectedEmps.map((emp, idx) => `
        <tr>
          <td>${idx + 1}</td>
          ${fieldsArray.map(key => {
            let val = emp[key] || 'غير محدد';
            if (key === 'birth_date' || key === 'hire_date' || key === 'contract_end_date') {
              if (val && val !== 'غير محدد') {
                try {
                  val = new Date(val).toLocaleDateString('ar-SA');
                } catch (e) {}
              }
            }
            if (Array.isArray(val)) val = val.join(', ');
            return `<td>${val}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div class="signature">
      <div class="signature-line"></div>
      <div style="font-weight: bold;">${managerName}</div>
      <div style="font-size: 11px; color: #6b7280;">${managerTitle}</div>
    </div>
  </div>
</body>
</html>`;

    return html;
  };

  const generateCSV = () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0) return "";

    const fieldsArray = Array.from(selectedFields);
    const headers = ["م", ...fieldsArray.map(key => 
      fieldDefinitions.find(f => f.key === key)?.label || key
    )];

    let csv = headers.join(',') + '\n';
    
    selectedEmps.forEach((emp, idx) => {
      const row = [
        idx + 1,
        ...fieldsArray.map(key => {
          let val = emp[key] || '';
          if (key === 'birth_date' || key === 'hire_date' || key === 'contract_end_date') {
            if (val) {
              try {
                val = new Date(val).toLocaleDateString('ar-SA');
              } catch (e) {}
            }
          }
          if (Array.isArray(val)) val = val.join(' - ');
          return `"${val}"`;
        })
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  };

  const handleCopyTable = async () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0) {
      toast.error("لم يتم اختيار أي موظفين");
      return;
    }

    const fieldsArray = Array.from(selectedFields);
    const headers = ["م", ...fieldsArray.map(key => 
      fieldDefinitions.find(f => f.key === key)?.label || key
    )];

    let tableText = headers.join('\t') + '\n';
    
    selectedEmps.forEach((emp, idx) => {
      const row = [
        idx + 1,
        ...fieldsArray.map(key => {
          let val = emp[key] || '';
          if (key === 'birth_date' || key === 'hire_date' || key === 'contract_end_date') {
            if (val) {
              try {
                val = new Date(val).toLocaleDateString('ar-SA');
              } catch (e) {}
            }
          }
          if (Array.isArray(val)) val = val.join(', ');
          return val;
        })
      ];
      tableText += row.join('\t') + '\n';
    });

    await navigator.clipboard.writeText(tableText);
    toast.success("تم نسخ البيانات للحافظة");
  };

  const handleExport = (format) => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0) {
      toast.error("لم يتم اختيار أي موظفين");
      return;
    }

    setIsExporting(true);

    try {
      if (format === 'excel') {
        const csv = generateCSV();
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `موظفي_${centerName}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success("تم تصدير البيانات إلى Excel");
      } else if (format === 'word' || format === 'html') {
        const html = generateTableHTML();
        const blob = new Blob([html], { type: format === 'word' ? 'application/msword' : 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `موظفي_${centerName}_${new Date().toISOString().split('T')[0]}.${format === 'word' ? 'doc' : 'html'}`;
        link.click();
        toast.success(`تم تصدير البيانات إلى ${format === 'word' ? 'Word' : 'HTML'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("فشل التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const selectedEmps = getSelectedEmployees();
    if (selectedEmps.length === 0) {
      toast.error("لم يتم اختيار أي موظفين");
      return;
    }

    const html = generateTableHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="text-blue-600" />
            استخراج بيان موظفي {centerName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees">اختيار الموظفين ({selectedEmployeeIds.size})</TabsTrigger>
            <TabsTrigger value="fields">البيانات الظاهرة ({selectedFields.size})</TabsTrigger>
            <TabsTrigger value="header">معلومات الترويسة</TabsTrigger>
          </TabsList>

          {/* اختيار الموظفين */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">تحديد الكل ({orderedEmployees.length} موظف)</span>
              <Checkbox
                checked={selectedEmployeeIds.size === orderedEmployees.length && orderedEmployees.length > 0}
                onCheckedChange={handleSelectAllEmployees}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">
                💡 يمكنك سحب وإفلات الموظفين لتغيير الترتيب، أو استخدام الأسهم
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="employees">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-3"
                  >
                    {orderedEmployees.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        لا يوجد موظفون في هذا المركز
                      </div>
                    ) : (
                      orderedEmployees.map((emp, index) => (
                        <Draggable key={emp.id} draggableId={emp.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                selectedEmployeeIds.has(emp.id) 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-white hover:bg-gray-50'
                              } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>

                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{emp.full_name_arabic}</div>
                                <div className="text-sm text-gray-600">
                                  {emp.position} • {emp.رقم_الموظف}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEmployee(index, 'up')}
                                  disabled={index === 0}
                                  className="h-8 w-8"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEmployee(index, 'down')}
                                  disabled={index === orderedEmployees.length - 1}
                                  className="h-8 w-8"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </div>

                              <Checkbox
                                checked={selectedEmployeeIds.has(emp.id)}
                                onCheckedChange={() => handleToggleEmployee(emp.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>

          {/* اختيار الحقول */}
          <TabsContent value="fields" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {fieldDefinitions.map(field => (
                <div
                  key={field.key}
                  className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border transition-all ${
                    selectedFields.has(field.key)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.has(field.key)}
                    onCheckedChange={() => handleToggleField(field.key)}
                  />
                  <Label htmlFor={field.key} className="cursor-pointer flex-1">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* معلومات الترويسة */}
          <TabsContent value="header" className="space-y-4">
            <div>
              <Label htmlFor="centerName" className="mb-2 block">اسم المركز</Label>
              <Input
                id="centerName"
                value={centerName}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="administrationName" className="mb-2 block">اسم الإدارة</Label>
              <Input
                id="administrationName"
                value={administrationName}
                onChange={(e) => setAdministrationName(e.target.value)}
                placeholder="مثال: إدارة الشؤون الصحية - الحناكية"
              />
            </div>

            <div>
              <Label htmlFor="managerName" className="mb-2 block">اسم المدير</Label>
              <Input
                id="managerName"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="اسم المدير الذي سيظهر في التوقيع"
              />
              {manager && (
                <p className="text-xs text-gray-500 mt-1">
                  المدير الحالي: {manager.full_name_arabic}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="managerTitle" className="mb-2 block">المسمى الوظيفي للمدير</Label>
              <Input
                id="managerTitle"
                value={managerTitle}
                onChange={(e) => setManagerTitle(e.target.value)}
                placeholder="مثال: مدير إدارة شؤون المراكز الصحية بالحناكية"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* معاينة */}
        {selectedEmployeeIds.size > 0 && selectedFields.size > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">
                سيتم تصدير {selectedEmployeeIds.size} موظف مع {selectedFields.size} حقل بيانات
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyTable}
            disabled={isExporting || selectedEmployeeIds.size === 0}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            نسخ الجدول
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isExporting || selectedEmployeeIds.size === 0}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            طباعة
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting || selectedEmployeeIds.size === 0}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>

          <Button
            onClick={() => handleExport('word')}
            disabled={isExporting || selectedEmployeeIds.size === 0}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FileDown className="w-4 h-4" />
            Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}