import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Employee } from '@/entities/Employee';
import { HealthCenter } from '@/entities/HealthCenter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Search, Copy, Printer, X, UserPlus, Download, User, Sparkles, Loader2, FileText, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllEmployeeRoles } from '@/components/utils/employeeRoles';

const availableFields = [
  { key: 'full_name_arabic', label: 'الاسم الكامل', default: true },
  { key: 'رقم_الهوية', label: 'رقم الهوية', default: true },
  { key: 'رقم_الموظف', label: 'الرقم الوظيفي', default: true },
  { key: 'position', label: 'التخصص', default: true },
  { key: 'المركز_الصحي', label: 'جهة العمل', default: true },
  { key: 'phone', label: 'رقم الجوال', default: false },
  { key: 'email', label: 'البريد الإلكتروني', default: false },
  { key: 'nationality', label: 'الجنسية', default: false },
  { key: 'gender', label: 'الجنس', default: false },
  { key: 'birth_date', label: 'تاريخ الميلاد', default: false },
  { key: 'hire_date', label: 'تاريخ التوظيف', default: false },
  { key: 'contract_type', label: 'نوع العقد', default: false },
  { key: 'qualification', label: 'المؤهل', default: false },
  { key: 'job_category', label: 'ملاك الوظيفة', default: false },
  { key: 'الأدوار', label: 'الأدوار', default: false },
];

export default function EmployeeDataRequest() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeManagers, setEmployeeManagers] = useState({});
  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter(f => f.default).map(f => f.key)
  );
  const [displayMode, setDisplayMode] = useState('normal');
  const [open, setOpen] = useState(false);
  const [managerSelectOpen, setManagerSelectOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyManagers, setShowOnlyManagers] = useState(true);
  const [healthCenters, setHealthCenters] = useState([]);

  // حالة الذكاء الاصطناعي
  const [aiMode, setAiMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [finalRequest, setFinalRequest] = useState('');

  useEffect(() => {
    loadEmployees();
    loadHealthCenters();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await Employee.list('-updated_date', 1000);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealthCenters = async () => {
    try {
      const centers = await HealthCenter.list();
      setHealthCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading health centers:', error);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(emp =>
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.includes(query) ||
      emp.رقم_الهوية?.includes(query)
    );
  }, [employees, searchQuery]);

  const filteredManagerEmployees = useMemo(() => {
    let managersList = employees;
    
    if (showOnlyManagers) {
      managersList = employees.filter(emp => {
        const hasManagerRole = emp.special_roles && 
                              Array.isArray(emp.special_roles) && 
                              emp.special_roles.some(role => 
                                role && role.includes('مدير')
                              );
        
        const hasManagerInPosition = emp.position && 
                                     emp.position.includes('مدير');
        
        const hasRoleInCenter = healthCenters.some(center => 
          center.المدير === emp.id || 
          center.نائب_المدير === emp.id ||
          center.المشرف_الفني === emp.id
        );
        
        return hasManagerRole || hasManagerInPosition || hasRoleInCenter;
      });
    }
    
    if (!managerSearchQuery) return managersList;
    
    const query = managerSearchQuery.toLowerCase();
    return managersList.filter(emp =>
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.includes(query) ||
      emp.رقم_الهوية?.includes(query) ||
      emp.المركز_الصحي?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query)
    );
  }, [employees, managerSearchQuery, showOnlyManagers, healthCenters]);

  const handleAnalyzeText = async () => {
    if (!rawText.trim()) {
      alert('الرجاء إدخال النص المراد تحليله');
      return;
    }

    setIsAnalyzing(true);
    setExtractedData(null);
    setFinalRequest('');
    setSelectedEmployees([]);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لاستخلاص البيانات من النصوص العربية.
        
النص التالي يحتوي على طلب متعلق بموظف أو عدة موظفين:
"${rawText}"

يرجى استخلاص وإرجاع البيانات التالية بتنسيق JSON:
1. أسماء الموظفين المذكورين (إن وجدوا)
2. ملخص واضح ومختصر للطلب
3. نوع الطلب (مثل: تحديث بيانات، إضافة لدورة، نقل، إجازة، إلخ)
4. أي تفاصيل إضافية مهمة

مثال للإخراج المطلوب:
{
  "employee_names": ["اسم الموظف"],
  "request_summary": "ملخص الطلب بشكل واضح ومهني",
  "request_type": "نوع الطلب",
  "details": "تفاصيل إضافية مهمة"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            employee_names: {
              type: "array",
              items: { type: "string" },
              description: "قائمة بأسماء الموظفين المذكورين"
            },
            request_summary: {
              type: "string",
              description: "ملخص واضح ومختصر للطلب"
            },
            request_type: {
              type: "string",
              description: "نوع الطلب"
            },
            details: {
              type: "string",
              description: "تفاصيل إضافية"
            }
          }
        }
      });

      const data = response;
      setExtractedData(data);

      // البحث عن الموظفين المذكورين تلقائياً
      if (data.employee_names && data.employee_names.length > 0) {
        const foundEmployees = [];
        data.employee_names.forEach(name => {
          const employee = employees.find(emp => 
            emp.full_name_arabic?.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(emp.full_name_arabic?.toLowerCase())
          );
          if (employee && !foundEmployees.find(e => e.id === employee.id)) {
            foundEmployees.push(employee);
          }
        });
        
        if (foundEmployees.length > 0) {
          setSelectedEmployees(foundEmployees);
        }
      }

      // إنشاء نص الطلب النهائي
      setFinalRequest(data.request_summary || '');

    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('حدث خطأ أثناء تحليل النص. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddEmployee = (employee) => {
    if (!selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
    setOpen(false);
    setSearchQuery('');
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(selectedEmployees.filter(e => e.id !== employeeId));
    const newManagers = { ...employeeManagers };
    delete newManagers[employeeId];
    setEmployeeManagers(newManagers);
  };

  const handleSelectManager = (employeeId, managerId) => {
    setEmployeeManagers(prev => ({
      ...prev,
      [employeeId]: managerId
    }));
    setManagerSelectOpen(null);
    setManagerSearchQuery('');
  };

  const toggleField = (fieldKey) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(k => k !== fieldKey));
    } else {
      setSelectedFields([...selectedFields, fieldKey]);
    }
  };

  const getManagerWithCenters = (managerId, employeeIds) => {
    const manager = employees.find(e => e.id === managerId);
    if (!manager) return null;

    const centers = employeeIds
      .map(empId => {
        const emp = selectedEmployees.find(e => e.id === empId);
        return emp?.المركز_الصحي;
      })
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

    const centersWithTitle = centers.map(center => `مدير ${center}`).join(' - ');
    const managerRoles = getAllEmployeeRoles(manager, healthCenters);
    const rolesList = managerRoles.map(r => r.role).join(', ');

    return {
      ...manager,
      المركز_الصحي: centersWithTitle,
      الأدوار: rolesList
    };
  };

  const groupedByManager = useMemo(() => {
    const groups = {};
    selectedEmployees.forEach(emp => {
      const managerId = employeeManagers[emp.id];
      if (managerId) {
        if (!groups[managerId]) {
          groups[managerId] = [];
        }
        groups[managerId].push(emp.id);
      }
    });
    return groups;
  }, [selectedEmployees, employeeManagers]);

  const copyTableToClipboard = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    ).join('\t');

    let tableText = '';

    if (displayMode === 'normal') {
      const rows = selectedEmployees.map(emp =>
        selectedFields.map(key => emp[key] || '').join('\t')
      ).join('\n');
      tableText = headers + '\n' + rows;
    } else {
      const rows = [];
      selectedEmployees.forEach(emp => {
        rows.push(selectedFields.map(key => emp[key] || '').join('\t'));
      });

      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            rows.push('بيانات المدير المباشر');
            rows.push(selectedFields.map(key => manager[key] || '').join('\t'));
            processedManagers.add(managerId);
          }
        }
      });

      tableText = headers + '\n' + rows.join('\n');
    }

    // تنسيق الطلب النهائي بالترتيب المطلوب
    let fullText = '';
    
    if (finalRequest) {
      fullText = `بعد التحية\n\n${tableText}\n\n${finalRequest}\n\nنأمل التكرم بالاطلاع وإكمال اللازم.\n\n\nأطيب التحايا.`;
    } else {
      fullText = `بعد التحية\n\n${tableText}\n\nنأمل التكرم بالاطلاع وإكمال اللازم.\n\n\nأطيب التحايا.`;
    }

    navigator.clipboard.writeText(fullText).then(() => {
      alert('تم نسخ الطلب والجدول! يمكنك الآن لصقهما في Word');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('فشل النسخ. يرجى المحاولة مرة أخرى');
    });
  };

  const exportToCSV = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    ).join(',');

    let csvContent = "\ufeff" + headers + '\n';

    if (displayMode === 'normal') {
      const rows = selectedEmployees.map(emp =>
        selectedFields.map(key => `"${emp[key] || ''}"`.replace(/"/g, '""')).join(',')
      ).join('\n');
      csvContent += rows;
    } else {
      const rows = [];
      selectedEmployees.forEach(emp => {
        rows.push(selectedFields.map(key => `"${emp[key] || ''}"`.replace(/"/g, '""')).join(','));
      });

      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            rows.push('"بيانات المدير المباشر"' + ','.repeat(selectedFields.length - 1));
            rows.push(selectedFields.map(key => `"${manager[key] || ''}"`.replace(/"/g, '""')).join(','));
            processedManagers.add(managerId);
          }
        }
      });

      csvContent += rows.join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `بيانات_الموظفين_${new Date().toLocaleDateString('ar-SA')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">طلب بيانات الموظفين الذكي</h1>
          <p className="text-gray-600">استخراج وعرض بيانات الموظفين باستخدام الذكاء الاصطناعي</p>
        </div>

        <Tabs defaultValue={aiMode ? "ai" : "manual"} onValueChange={(v) => setAiMode(v === 'ai')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Search className="w-4 h-4 ml-2" />
              البحث اليدوي
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 ml-2" />
              الاستخلاص الذكي
            </TabsTrigger>
          </TabsList>

          {/* AI Mode */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  الاستخلاص الذكي للبيانات
                </CardTitle>
                <CardDescription>
                  الصق النص الخام وسيقوم الذكاء الاصطناعي باستخلاص المعلومات وإنشاء طلب واضح
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>النص الخام</Label>
                  <Textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="مثال: الرجاء من سعادتكم الرفع لمن يلزم بادراج الممرضة ميجا ناريكال ضمن خطة دورة تقييم الاداء الوظيفي لعام 2025..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleAnalyzeText}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      تحليل واستخلاص البيانات
                    </>
                  )}
                </Button>

                {extractedData && (
                  <div className="space-y-4 mt-6">
                    <Alert className="bg-green-50 border-green-200">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>نوع الطلب:</strong> {extractedData.request_type}
                      </AlertDescription>
                    </Alert>

                    {extractedData.employee_names && extractedData.employee_names.length > 0 && (
                      <div>
                        <Label>الموظفون المستخلصون</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {extractedData.employee_names.map((name, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {finalRequest && (
                      <div>
                        <Label>نص الطلب النهائي</Label>
                        <Textarea
                          value={finalRequest}
                          onChange={(e) => setFinalRequest(e.target.value)}
                          rows={4}
                          className="mt-2 bg-yellow-50 border-yellow-200"
                        />
                      </div>
                    )}

                    {extractedData.details && (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          <strong>تفاصيل إضافية:</strong> {extractedData.details}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Mode */}
          <TabsContent value="manual">
            <Card className="no-print">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  البحث عن الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اختر الموظفين</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {selectedEmployees.length > 0
                            ? `تم اختيار ${selectedEmployees.length} موظف`
                            : "ابحث عن موظف..."}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="ابحث بالاسم أو الرقم الوظيفي..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandEmpty>لا يوجد موظفين.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {filteredEmployees.map((emp) => (
                            <CommandItem
                              key={emp.id}
                              onSelect={() => handleAddEmployee(emp)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{emp.full_name_arabic}</div>
                                <div className="text-xs text-gray-500">
                                  {emp.رقم_الموظف} • {emp.position}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Employees & Rest of the UI */}
        {selectedEmployees.length > 0 && (
          <Card className="no-print">
            <CardHeader>
              <CardTitle>الموظفون المختارون ({selectedEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.map(emp => (
                  <Badge key={emp.id} variant="secondary" className="gap-1">
                    {emp.full_name_arabic}
                    <button
                      onClick={() => handleRemoveEmployee(emp.id)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Display Mode Selection */}
              <div>
                <Label>نمط العرض</Label>
                <RadioGroup value={displayMode} onValueChange={setDisplayMode} className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer">عرض عادي</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="with-manager" id="with-manager" />
                    <Label htmlFor="with-manager" className="cursor-pointer">عرض الموظف مع مديره المباشر</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Manager Selection */}
              {displayMode === 'with-manager' && selectedEmployees.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>تحديد المدير المباشر لكل موظف</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id="showOnlyManagers"
                        checked={showOnlyManagers}
                        onCheckedChange={() => setShowOnlyManagers(!showOnlyManagers)}
                      />
                      <Label htmlFor="showOnlyManagers" className="cursor-pointer text-xs text-gray-600">
                        إظهار المدراء فقط ({filteredManagerEmployees.length})
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    {selectedEmployees.map(emp => {
                      const managerId = employeeManagers[emp.id];
                      const manager = managerId ? employees.find(e => e.id === managerId) : null;

                      return (
                        <div key={emp.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <span className="text-sm flex-1">{emp.full_name_arabic}</span>
                          <Popover open={managerSelectOpen === emp.id} onOpenChange={(isOpen) => setManagerSelectOpen(isOpen ? emp.id : null)}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="w-[200px] justify-start">
                                <User className="w-3 h-3 ml-1" />
                                {manager ? manager.full_name_arabic : 'اختر المدير'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="ابحث عن المدير..."
                                  value={managerSearchQuery}
                                  onValueChange={setManagerSearchQuery}
                                />
                                <CommandEmpty>
                                  <div className="p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-2">لا يوجد نتائج</p>
                                    {showOnlyManagers && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setShowOnlyManagers(false)}
                                      >
                                        إظهار جميع الموظفين
                                      </Button>
                                    )}
                                  </div>
                                </CommandEmpty>
                                <CommandGroup className="max-h-[250px] overflow-y-auto">
                                  {filteredManagerEmployees.filter(e => e.id !== emp.id).map((mgr) => (
                                    <CommandItem
                                      key={mgr.id}
                                      onSelect={() => handleSelectManager(emp.id, mgr.id)}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{mgr.full_name_arabic}</div>
                                        <div className="text-xs text-gray-500">
                                          {mgr.position} • {mgr.المركز_الصحي}
                                        </div>
                                        {mgr.special_roles && mgr.special_roles.length > 0 && (
                                          <div className="flex gap-1 mt-1">
                                            {mgr.special_roles.filter(r => r && r.includes('مدير')).map((role, idx) => (
                                              <Badge key={idx} variant="secondary" className="text-xs py-0">
                                                {role}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Field Selection */}
              <div>
                <Label>البيانات المراد عرضها</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableFields.map(field => (
                    <div key={field.key} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={field.key}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={() => toggleField(field.key)}
                      />
                      <Label htmlFor={field.key} className="cursor-pointer text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={copyTableToClipboard}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ الطلب والجدول
                </Button>
                <Button
                  onClick={exportToCSV}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير Excel
                </Button>
                <Button
                  onClick={handlePrint}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  variant="outline"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {selectedEmployees.length > 0 && selectedFields.length > 0 && (
          <Card className="print-area">
            <CardHeader className="print-hide">
              <CardTitle>النتيجة النهائية</CardTitle>
            </CardHeader>
            <CardContent>
              {/* تنسيق الطلب النهائي */}
              <div className="space-y-6">
                {/* بعد التحية */}
                <div className="text-right">
                  <p style={{ color: '#000', fontSize: '18px', fontWeight: '600' }}>بعد التحية</p>
                </div>

                {/* الجدول */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ border: '1px solid #000' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        {selectedFields.map(key => {
                          const field = availableFields.find(f => f.key === key);
                          return (
                            <th
                              key={key}
                              style={{ 
                                border: '1px solid #000',
                                padding: '8px 16px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#000'
                              }}
                            >
                              {field?.label || key}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {displayMode === 'normal' ? (
                        selectedEmployees.map((emp, idx) => (
                          <tr key={emp.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                            {selectedFields.map(key => (
                              <td
                                key={key}
                                style={{ 
                                  border: '1px solid #000',
                                  padding: '8px 16px',
                                  textAlign: 'center',
                                  color: '#000'
                                }}
                              >
                                {emp[key] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        (() => {
                          const rows = [];
                          selectedEmployees.forEach((emp) => {
                            rows.push(
                              <tr key={`emp-${emp.id}`} style={{ backgroundColor: '#dbeafe' }}>
                                {selectedFields.map(key => (
                                  <td
                                    key={key}
                                    style={{ 
                                      border: '1px solid #000',
                                      padding: '8px 16px',
                                      textAlign: 'center',
                                      fontWeight: '500',
                                      color: '#000'
                                    }}
                                  >
                                    {emp[key] || '-'}
                                  </td>
                                ))}
                              </tr>
                            );
                          });

                          const processedManagers = new Set();
                          Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
                            if (!processedManagers.has(managerId)) {
                              const manager = getManagerWithCenters(managerId, employeeIds);
                              if (manager) {
                                rows.push(
                                  <tr key={`manager-header-${managerId}`} style={{ backgroundColor: '#d1fae5' }}>
                                    <td
                                      colSpan={selectedFields.length}
                                      style={{ 
                                        border: '1px solid #000',
                                        padding: '8px 16px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        color: '#000'
                                      }}
                                    >
                                      بيانات المدير المباشر
                                    </td>
                                  </tr>
                                );
                                rows.push(
                                  <tr key={`manager-data-${managerId}`} style={{ backgroundColor: '#ecfdf5' }}>
                                    {selectedFields.map(key => (
                                      <td
                                        key={key}
                                        style={{ 
                                          border: '1px solid #000',
                                          padding: '8px 16px',
                                          textAlign: 'center',
                                          color: '#000'
                                        }}
                                      >
                                        {manager[key] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                );
                                processedManagers.add(managerId);
                              }
                            }
                          });
                          return rows;
                        })()
                      )}
                    </tbody>
                  </table>
                </div>

                {/* نص الطلب */}
                {finalRequest && (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p style={{ color: '#000' }} className="whitespace-pre-wrap leading-relaxed text-right">
                      {finalRequest}
                    </p>
                  </div>
                )}

                {/* الخاتمة */}
                <div className="text-right space-y-4">
                  <p style={{ color: '#000', fontSize: '18px' }}>نأمل التكرم بالاطلاع وإكمال اللازم.</p>
                  <p style={{ color: '#000', fontSize: '18px', fontWeight: '600' }} className="mt-6">أطيب التحايا.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEmployees.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {aiMode ? (
                <>
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                  <p className="text-lg">الصق النص المراد تحليله أعلاه واضغط على زر "تحليل واستخلاص البيانات"</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">ابدأ بالبحث واختيار الموظفين لعرض بياناتهم</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}