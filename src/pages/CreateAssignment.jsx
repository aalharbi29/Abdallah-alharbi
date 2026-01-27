import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Employee } from "@/entities/Employee";
import { HealthCenter } from "@/entities/HealthCenter";
import { Assignment } from "@/entities/Assignment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Save, ChevronsUpDown, Settings2, Table, List, Loader2, Plus, Trash2, FolderOpen, ChevronDown } from "lucide-react";
import { createPageUrl } from "@/utils";
import { differenceInDays } from "date-fns";
import FlexibleAssignmentTemplate from "@/components/assignments/FlexibleAssignmentTemplate";
import StandardAssignmentTemplate from "@/components/assignments/StandardAssignmentTemplate";
import MultipleAssignmentTemplate from "@/components/assignments/MultipleAssignmentTemplate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";



export default function CreateAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const assignmentType = urlParams.get('type') || 'standard'; // standard, flexible, or multiple

  // Multiple assignment state
  const [multipleAssignments, setMultipleAssignments] = useState([]);

  const [assignmentData, setAssignmentData] = useState({
    employee_record_id: "",
    employee_name: "",
    employee_national_id: "",
    employee_position: "",
    from_health_center: "",
    gender: "",
    assigned_to_health_center: "",
    start_date: "",
    end_date: "",
    duration_days: 0,
    issue_date: new Date().toISOString().split("T")[0],
  });

  // State for specific days selection in multiple assignment
  const [useSpecificDays, setUseSpecificDays] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const [templateOptions, setTemplateOptions] = useState({
    customTitle: 'تكليف',
    tableLayout: 'horizontal',
    showDurationInTable: true,
    showDurationInParagraph: true,
    customDurationText: '',
    customParagraph1: '',
    customAssignmentType: '',
    customParagraph2: 'لا يترتب على هذا القرار أي ميزة مالية إلا ما يقره النظام.',
    customParagraph3: '',
    customParagraph4: '',
    customParagraph5: 'يتم تنفيذ هذا القرار كلاً فيما يخصه.',
    customClosing: 'خالص التحايا ،،،',
    customTableHeaders: {
      name: 'الاسم',
      position: 'المسمى الوظيفي',
      assignmentType: 'نوع التكليف',
      fromCenter: 'جهة العمل',
      toCenter: 'جهة التكليف',
      duration: 'مدة التكليف'
    },
    multiplePeriods: false,
    additionalPeriods: [],
    // Multiple template specific options
    decisionPoints: [
      'تكليف الموضح بياناتهم أعلاه بالعمل في الجهات الموضحة قرين اسم كل منهم خلال الفترة المحددة.',
      'لا يترتب على هذا التكليف أي ميزة مالية إلا ما يقره النظام.',
      'يتم تنفيذ هذا القرار كلاً فيما يخصه.'
    ],
    customIntro: 'إن مدير شؤون المراكز الصحية بالحناكية وبناء على الصلاحيات الممنوحة لنا نظاماً\nعليه يقرر ما يلي:',
    freeText: '',
    showFreeText: true
  });

  // Saved templates state
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [empData, centerData] = await Promise.all([
          Employee.list("-created_date", 200),
          HealthCenter.list()
        ]);
        setEmployees(Array.isArray(empData) ? empData : []);
        setHealthCenters(Array.isArray(centerData) ? centerData : []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setEmployees([]);
        setHealthCenters([]);
      }
    }
    fetchData();
    loadSavedTemplates();
  }, [assignmentType]);

  const loadSavedTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const templates = await base44.entities.AssignmentTemplate.filter({ template_type: assignmentType });
      setSavedTemplates(Array.isArray(templates) ? templates : []);
    } catch (error) {
      console.error("Error loading templates:", error);
      setSavedTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const applyTemplate = (template) => {
    if (!template?.options) return;
    
    const options = template.options;
    
    setTemplateOptions(prev => ({
      ...prev,
      customTitle: options.customTitle || prev.customTitle,
      customIntro: options.customIntro || prev.customIntro,
      customClosing: options.customClosing || prev.customClosing,
      decisionPoints: options.decisionPoints || prev.decisionPoints,
      customParagraph1: options.customParagraph1 || prev.customParagraph1,
      customParagraph2: options.customParagraph2 || prev.customParagraph2,
      customParagraph3: options.customParagraph3 || prev.customParagraph3,
      customParagraph4: options.customParagraph4 || prev.customParagraph4,
      customParagraph5: options.customParagraph5 || prev.customParagraph5,
      tableLayout: options.tableLayout || prev.tableLayout,
      showDurationInTable: options.showDurationInTable !== undefined ? options.showDurationInTable : prev.showDurationInTable,
      showDurationInParagraph: options.showDurationInParagraph !== undefined ? options.showDurationInParagraph : prev.showDurationInParagraph,
      customTableHeaders: options.customTableHeaders || prev.customTableHeaders,
      freeText: options.freeText || prev.freeText,
    }));

    alert(`✅ تم تحميل القالب: ${template.name}`);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setAssignmentData(prev => ({
      ...prev,
      employee_record_id: employee.id,
      employee_name: employee.full_name_arabic,
      employee_national_id: employee.رقم_الهوية,
      employee_position: employee.position,
      from_health_center: employee.المركز_الصحي,
      gender: employee.gender,
    }));
    setPopoverOpen(false);
  };

  const handleChange = (field, value) => {
    setAssignmentData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'start_date' || field === 'end_date') {
        const startDate = field === 'start_date' ? value : updated.start_date;
        const endDate = field === 'end_date' ? value : updated.end_date;
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (start <= end) {
            updated.duration_days = differenceInDays(end, start) + 1;
          } else {
            updated.duration_days = 0;
          }
        } else {
          updated.duration_days = 0;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async () => {
    const requiredFields = [
      { field: 'assigned_to_health_center', name: 'المركز المكلف به', value: assignmentData.assigned_to_health_center },
      { field: 'start_date', name: 'تاريخ البداية', value: assignmentData.start_date },
      { field: 'end_date', name: 'تاريخ النهاية', value: assignmentData.end_date }
    ];

    if (assignmentType !== 'multiple') {
      requiredFields.push({ field: 'employee_record_id', name: 'الموظف', value: assignmentData.employee_record_id });
    }

    const missingFields = requiredFields.filter(field => !field.value || field.value.toString().trim() === '');
    
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(f => f.name).join('، ');
      alert(`الرجاء تعبئة الحقول التالية: ${missingFieldNames}`);
      return;
    }

    const startDate = new Date(assignmentData.start_date);
    const endDate = new Date(assignmentData.end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("يرجى إدخال تواريخ صحيحة.");
      return;
    }
    
    if (startDate > endDate) {
      alert("تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية.");
      return;
    }

    let duration = parseInt(assignmentData.duration_days, 10);
    if (isNaN(duration) || duration <= 0) {
      duration = Math.max(1, differenceInDays(endDate, startDate) + 1);
    }

    setIsSaving(true); 
    try {
      // Handle Multiple Assignments
      if (assignmentType === 'multiple') {
        if (multipleAssignments.length === 0) {
          alert('الرجاء إضافة موظف واحد على الأقل');
          setIsSaving(false);
          return;
        }

        // Create records for each employee with template_options
        const groupId = crypto.randomUUID();

        // حفظ خيارات القالب للتكليف المتعدد
        const multipleTemplateOptions = JSON.stringify({
          customTitle: templateOptions.customTitle || 'قرار تكليف',
          customIntro: templateOptions.customIntro,
          decisionPoints: templateOptions.decisionPoints,
          customClosing: templateOptions.customClosing,
          freeText: templateOptions.freeText
        });

        const createdIds = [];
        for (const item of multipleAssignments) {
          const res = await Assignment.create({
            employee_record_id: item.employee_record_id,
            employee_name: item.name,
            employee_position: item.position,
            employee_national_id: item.national_id,
            employee_job_id: item.employee_id,
            from_health_center: item.current_work,
            assigned_to_health_center: item.assigned_work,
            start_date: item.start_date,
            end_date: item.end_date,
            duration_days: parseInt(item.duration, 10) || 0,
            issue_date: assignmentData.issue_date,
            assignment_template_type: 'multiple',
            group_id: groupId,
            status: 'active',
            template_options: multipleTemplateOptions,
            notes: item.full_duration ? `المدة: ${item.full_duration}` : 'جزء من تكليف جماعي'
          });
          createdIds.push(res.id);
        }
        
        navigate(createPageUrl(`ViewAssignment?id=${createdIds[0]}`));
        return;
      }

      // Handle Single Assignment
      const finalAssignmentData = {
        ...assignmentData,
        duration_days: duration,
        employee_name: assignmentData.employee_name || selectedEmployee?.full_name_arabic || '',
        employee_position: assignmentData.employee_position || selectedEmployee?.position || '',
        from_health_center: assignmentData.from_health_center || selectedEmployee?.المركز_الصحي || '',
        gender: assignmentData.gender || selectedEmployee?.gender || '',
        template_options: assignmentType === 'flexible' ? JSON.stringify(templateOptions) : null,
        assignment_template_type: assignmentType
      };
      
      const newAssignment = await Assignment.create(finalAssignmentData);
      navigate(createPageUrl(`ViewAssignment?id=${newAssignment.id}`));
    } catch (error) {
      console.error("❌ فشل في إنشاء التكليف:", error);
      alert(`حدث خطأ أثناء إنشاء التكليف: ${error.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Assignments"))} size="sm">
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base md:text-3xl font-bold text-gray-900">تكليف جديد</h1>
              {assignmentType === 'flexible' && (
                <Badge className="bg-purple-100 text-purple-800 text-[9px] md:text-xs">مرن</Badge>
              )}
              {assignmentType === 'standard' && (
                <Badge className="bg-blue-100 text-blue-800 text-[9px] md:text-xs">قياسي</Badge>
              )}
              {assignmentType === 'multiple' && (
                <Badge className="bg-orange-100 text-orange-800 text-[9px] md:text-xs">جماعي</Badge>
              )}
              
              {/* زر تحميل القالب */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 text-[10px] md:text-sm h-7 md:h-9 px-2 md:px-3">
                    <FolderOpen className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">قالب</span>
                    <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {loadingTemplates ? (
                    <DropdownMenuItem disabled>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جاري التحميل...
                    </DropdownMenuItem>
                  ) : savedTemplates.length === 0 ? (
                    <DropdownMenuItem disabled>
                      لا توجد قوالب محفوظة لهذا النوع
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {savedTemplates.map((template) => (
                        <DropdownMenuItem 
                          key={template.id} 
                          onClick={() => applyTemplate(template)}
                          className="flex flex-col items-start gap-0.5"
                        >
                          <span className="font-medium">{template.name}</span>
                          {template.description && (
                            <span className="text-xs text-gray-500">{template.description}</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open(createPageUrl("AssignmentTemplates"), '_blank')}>
                        <Settings2 className="w-4 h-4 ml-2" />
                        إدارة القوالب
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1 hidden md:block">
              {assignmentType === 'flexible' 
                ? 'قابل للتخصيص' 
                : assignmentType === 'multiple'
                ? 'عدة موظفين'
                : 'تنسيق ثابت'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 h-auto">
            <TabsTrigger value="basic" className="text-xs md:text-sm py-2">البيانات الأساسية</TabsTrigger>
            {assignmentType === 'flexible' && (
              <TabsTrigger value="advanced" className="text-xs md:text-sm py-2">
                <Settings2 className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                <span className="hidden sm:inline">التخصيص </span>المتقدم
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic">
            <Card className="shadow-sm md:shadow-lg">
              <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-lg">بيانات التكليف</CardTitle></CardHeader>
              <CardContent className="p-3 md:p-6">
                {assignmentType === 'multiple' ? (
                  <div className="space-y-3 md:space-y-6">
                    <div className="p-3 md:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 text-xs md:text-base">
                        <Plus className="w-3 h-3 md:w-4 md:h-4" /> إضافة موظفين
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
                        <div className="md:col-span-1">
                          <Label className="text-xs md:text-sm">الموظف</Label>
                          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between h-8 md:h-10 text-xs md:text-sm">
                                <span className="truncate">{selectedEmployee ? selectedEmployee.full_name_arabic : "اختر..."}</span>
                                <ChevronsUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 opacity-50 flex-shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                              <Command>
                                <CommandInput placeholder="ابحث..." />
                                <CommandEmpty>لا يوجد</CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto">
                                  {(employees || []).map((employee) => (
                                    <CommandItem 
                                      key={employee.id} 
                                      onSelect={() => {
                                        setSelectedEmployee(employee);
                                        setPopoverOpen(false);
                                        setAssignmentData(prev => ({...prev, from_health_center: employee.المركز_الصحي || ''}));
                                      }}
                                    >
                                      {employee.full_name_arabic}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div>
                          <Label className="text-xs md:text-sm">جهة التكليف</Label>
                          <Select 
                            value={assignmentData.assigned_to_health_center} 
                            onValueChange={(v) => setAssignmentData(prev => ({...prev, assigned_to_health_center: v}))}
                          >
                            <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm"><SelectValue placeholder="اختر..." /></SelectTrigger>
                            <SelectContent>
                              {(healthCenters || []).map(center => (
                                <SelectItem key={center.id} value={center.اسم_المركز}>{center.اسم_المركز}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs md:text-sm">المدة (أيام)</Label>
                          <Input 
                            type="number" 
                            value={assignmentData.duration_days} 
                            onChange={(e) => setAssignmentData(prev => ({...prev, duration_days: e.target.value}))}
                            placeholder="5"
                            className="h-8 md:h-10 text-xs md:text-sm"
                          />
                        </div>

                        <div className="md:col-span-3 border p-2 md:p-3 rounded bg-gray-50">
                          <div className="flex items-center space-x-2 space-x-reverse mb-2">
                            <Checkbox 
                              id="useSpecificDays" 
                              checked={useSpecificDays} 
                              onCheckedChange={setUseSpecificDays}
                              className="w-3 h-3 md:w-4 md:h-4"
                            />
                            <Label htmlFor="useSpecificDays" className="cursor-pointer font-medium text-blue-700 text-xs md:text-sm">
                              أيام محددة
                            </Label>
                          </div>
                          
                          {useSpecificDays && (
                            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                              {daysOfWeek.map(day => (
                                <div key={day} className="flex items-center space-x-1 space-x-reverse bg-white px-1.5 md:px-2 py-0.5 md:py-1 rounded border">
                                  <Checkbox 
                                    id={`day-${day}`} 
                                    checked={selectedDays.includes(day)} 
                                    onCheckedChange={() => toggleDay(day)}
                                    className="w-3 h-3 md:w-4 md:h-4"
                                  />
                                  <Label htmlFor={`day-${day}`} className="cursor-pointer text-[10px] md:text-sm">{day}</Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs md:text-sm">تاريخ البداية</Label>
                          <Input 
                            type="date" 
                            value={assignmentData.start_date} 
                            onChange={(e) => setAssignmentData(prev => ({...prev, start_date: e.target.value}))}
                            className="h-8 md:h-10 text-xs md:text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs md:text-sm">تاريخ النهاية</Label>
                          <Input 
                            type="date" 
                            value={assignmentData.end_date} 
                            onChange={(e) => setAssignmentData(prev => ({...prev, end_date: e.target.value}))}
                            className="h-8 md:h-10 text-xs md:text-sm"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button 
                            onClick={() => {
                              if (!selectedEmployee) return alert('اختر موظفاً');
                              
                              let fullDuration = '';
                              if (useSpecificDays && selectedDays.length > 0) {
                                const daysStr = selectedDays.join(' و ');
                                fullDuration = `كل ${daysStr} خلال الفترة من\n${assignmentData.start_date} إلى ${assignmentData.end_date}`;
                              }

                              setMultipleAssignments(prev => [...prev, {
                                id: Date.now(),
                                name: selectedEmployee.full_name_arabic,
                                position: selectedEmployee.position,
                                national_id: selectedEmployee.رقم_الهوية,
                                employee_id: selectedEmployee.رقم_الموظف,
                                current_work: assignmentData.from_health_center || selectedEmployee.المركز_الصحي,
                                assigned_work: assignmentData.assigned_to_health_center,
                                duration: assignmentData.duration_days,
                                start_date: assignmentData.start_date,
                                end_date: assignmentData.end_date,
                                full_duration: fullDuration,
                                employee_record_id: selectedEmployee.id,
                                gender: selectedEmployee.gender
                                }]);
                              setSelectedEmployee(null);
                            }}
                            className="w-full bg-blue-600 h-8 md:h-10 text-xs md:text-sm"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" /> إضافة
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-x-auto">
                      <table className="w-full text-[10px] md:text-sm text-right min-w-[500px]">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-1.5 md:p-3 border-b">الاسم</th>
                            <th className="p-1.5 md:p-3 border-b hidden sm:table-cell">جهة العمل</th>
                            <th className="p-1.5 md:p-3 border-b">المكلف بها</th>
                            <th className="p-1.5 md:p-3 border-b">المدة</th>
                            <th className="p-1.5 md:p-3 border-b hidden md:table-cell">من</th>
                            <th className="p-1.5 md:p-3 border-b hidden md:table-cell">إلى</th>
                            <th className="p-1.5 md:p-3 border-b w-8 md:w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {multipleAssignments.map((item, idx) => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="p-1.5 md:p-3 truncate max-w-[80px] md:max-w-none">{item.name}</td>
                              <td className="p-1.5 md:p-3 truncate max-w-[60px] md:max-w-none hidden sm:table-cell">{item.current_work}</td>
                              <td className="p-1.5 md:p-3 truncate max-w-[60px] md:max-w-none">{item.assigned_work}</td>
                              <td className="p-1.5 md:p-3">{item.duration}ي</td>
                              <td className="p-1.5 md:p-3 hidden md:table-cell">{item.start_date}</td>
                              <td className="p-1.5 md:p-3 hidden md:table-cell">{item.end_date}</td>
                              <td className="p-1.5 md:p-3 text-center">
                                <button 
                                  onClick={() => setMultipleAssignments(prev => prev.filter(i => i.id !== item.id))}
                                  className="text-red-500 hover:text-red-700"
                                  >
                                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  </button>
                                  </td>
                                  </tr>
                                  ))}
                                  {multipleAssignments.length === 0 && (
                                  <tr>
                                  <td colSpan="7" className="p-4 md:p-8 text-center text-gray-500 text-xs md:text-sm">لم يتم إضافة موظفين</td>
                                  </tr>
                                  )}
                                  </tbody>
                                  </table>
                                  </div>

                                  {/* Multiple Template Customization */}
                                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                  <Settings2 className="w-4 h-4" />
                                  تخصيص نص القرار
                                  </h3>

                                  <div>
                                  <Label>المقدمة</Label>
                                  <Textarea 
                                  value={templateOptions.customIntro}
                                  onChange={(e) => setTemplateOptions(prev => ({...prev, customIntro: e.target.value}))}
                                  className="mt-1 h-20"
                                  />
                                  </div>

                                  <div>
                                  <Label className="mb-2 block">نقاط القرار</Label>
                                  {templateOptions.decisionPoints.map((point, idx) => (
                                  <div key={idx} className="flex gap-2 mb-2 items-center">
                                  <Badge variant="outline" className="h-8 w-8 flex justify-center items-center shrink-0">{idx + 1}</Badge>
                                  <Input 
                                  value={point}
                                  onChange={(e) => {
                                  const newPoints = [...templateOptions.decisionPoints];
                                  newPoints[idx] = e.target.value;
                                  setTemplateOptions(prev => ({...prev, decisionPoints: newPoints}));
                                  }}
                                  />
                                  <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                  const newPoints = templateOptions.decisionPoints.filter((_, i) => i !== idx);
                                  setTemplateOptions(prev => ({...prev, decisionPoints: newPoints}));
                                  }}
                                  className="text-red-500"
                                  >
                                  <Trash2 className="w-4 h-4" />
                                  </Button>
                                  </div>
                                  ))}
                                  <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTemplateOptions(prev => ({...prev, decisionPoints: [...prev.decisionPoints, '']}))}
                                  className="mt-2"
                                  >
                                  <Plus className="w-4 h-4 ml-2" /> إضافة نقطة
                                  </Button>
                                  </div>

                                  <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label>خطاب حر (تحت الجدول)</Label>
                                    <div className="flex items-center gap-2">
                                      <Checkbox 
                                        id="showFreeText"
                                        checked={templateOptions.showFreeText !== false}
                                        onCheckedChange={(checked) => setTemplateOptions(prev => ({...prev, showFreeText: checked}))}
                                      />
                                      <Label htmlFor="showFreeText" className="text-sm cursor-pointer">إظهار مربع الخطاب الحر</Label>
                                    </div>
                                  </div>
                                  {templateOptions.showFreeText !== false && (
                                    <>
                                      <Textarea 
                                        value={templateOptions.freeText}
                                        onChange={(e) => setTemplateOptions(prev => ({...prev, freeText: e.target.value}))}
                                        className="mt-1 h-24"
                                        placeholder="اكتب هنا أي نص إضافي تريد إضافته تحت الجدول... (يمكن سحبه وتحريكه في المعاينة)"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">💡 يمكنك سحب هذا النص والجدول إلى أي مكان في المعاينة</p>
                                    </>
                                  )}
                                  </div>
                                  </div>
                                  </div>
                                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label>اختر الموظف *</Label>
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                            {selectedEmployee ? selectedEmployee.full_name_arabic : "اختر موظف..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="ابحث عن موظف..." />
                            <CommandEmpty>لم يتم العثور على موظف.</CommandEmpty>
                            <CommandGroup>
                              {(employees || []).map((employee) => (
                                <CommandItem key={employee.id} onSelect={() => handleEmployeeSelect(employee)}>
                                  {employee.full_name_arabic}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {selectedEmployee && (
                      <>
                        <Card className="bg-gray-50 p-4 md:col-span-2">
                            <p><strong>المركز الحالي:</strong> {selectedEmployee.المركز_الصحي}</p>
                            <p><strong>المنصب:</strong> {selectedEmployee.position}</p>
                        </Card>

                        <div className="md:col-span-2">
                          <Label htmlFor="assigned_to_health_center">المركز المكلف به *</Label>
                          <Select value={assignmentData.assigned_to_health_center} onValueChange={(value) => handleChange('assigned_to_health_center', value)}>
                            <SelectTrigger><SelectValue placeholder="اختر المركز..." /></SelectTrigger>
                            <SelectContent>
                              {(healthCenters || []).filter(c => c.اسم_المركز !== selectedEmployee.المركز_الصحي).map(center => (
                                <SelectItem key={center.id} value={center.اسم_المركز}>{center.اسم_المركز}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="start_date">تاريخ بداية التكليف *</Label>
                          <Input 
                            id="start_date" 
                            type="date" 
                            value={assignmentData.start_date} 
                            onChange={(e) => handleChange('start_date', e.target.value)} 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="end_date">تاريخ نهاية التكليف *</Label>
                          <Input 
                            id="end_date" 
                            type="date" 
                            value={assignmentData.end_date} 
                            onChange={(e) => handleChange('end_date', e.target.value)} 
                          />
                        </div>

                        <div>
                          <Label htmlFor="duration_days">مدة التكليف (أيام)</Label>
                          <Input 
                            id="duration_days" 
                            type="number" 
                            value={assignmentData.duration_days || 0} 
                            readOnly 
                            className="bg-gray-100" 
                          />
                        </div>

                        {/* فترات التكليف المتعددة */}
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-2 space-x-reverse mb-3">
                            <Checkbox 
                              id="multiplePeriods" 
                              checked={templateOptions.multiplePeriods} 
                              onCheckedChange={(checked) => setTemplateOptions(prev => ({...prev, multiplePeriods: checked}))} 
                            />
                            <Label htmlFor="multiplePeriods" className="cursor-pointer font-medium">📅 فترات تكليف متعددة (غير متصلة)</Label>
                          </div>
                          
                          {templateOptions.multiplePeriods && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-blue-800">الفترات الإضافية:</Label>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setTemplateOptions(prev => ({
                                    ...prev, 
                                    additionalPeriods: [...prev.additionalPeriods, { start_date: '', end_date: '' }]
                                  }))}
                                  className="h-8 text-xs"
                                >
                                  + إضافة فترة
                                </Button>
                              </div>
                              
                              <p className="text-xs text-blue-700">
                                الفترة الأساسية: من {assignmentData.start_date || '---'} إلى {assignmentData.end_date || '---'}
                              </p>
                              
                              {templateOptions.additionalPeriods.map((period, index) => (
                                <div key={index} className="flex items-center gap-2 bg-white p-3 rounded border">
                                  <span className="text-sm text-gray-700 font-medium min-w-[60px]">فترة {index + 2}:</span>
                                  <div className="flex-1">
                                    <Label className="text-xs text-gray-500">من</Label>
                                    <Input
                                      type="date"
                                      value={period.start_date}
                                      onChange={(e) => {
                                        const newPeriods = [...templateOptions.additionalPeriods];
                                        newPeriods[index].start_date = e.target.value;
                                        setTemplateOptions(prev => ({...prev, additionalPeriods: newPeriods}));
                                      }}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs text-gray-500">إلى</Label>
                                    <Input
                                      type="date"
                                      value={period.end_date}
                                      onChange={(e) => {
                                        const newPeriods = [...templateOptions.additionalPeriods];
                                        newPeriods[index].end_date = e.target.value;
                                        setTemplateOptions(prev => ({...prev, additionalPeriods: newPeriods}));
                                      }}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const newPeriods = templateOptions.additionalPeriods.filter((_, i) => i !== index);
                                      setTemplateOptions(prev => ({...prev, additionalPeriods: newPeriods}));
                                    }}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                              
                              {templateOptions.additionalPeriods.length === 0 && (
                                <p className="text-xs text-gray-500 text-center py-2">اضغط "إضافة فترة" لإضافة فترات تكليف إضافية</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="issue_date">تاريخ إصدار الخطاب</Label>
                          <Input 
                            id="issue_date" 
                            type="date" 
                            value={assignmentData.issue_date} 
                            onChange={(e) => handleChange('issue_date', e.target.value)} 
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {assignmentType === 'flexible' && (
            <TabsContent value="advanced">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>التخصيص المتقدم للخطاب</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      تخصيص العنوان
                    </h3>
                    <div>
                      <Label>عنوان الخطاب</Label>
                      <Textarea
                        placeholder="مثال: تكليف، خطاب تكليف، قرار تكليف"
                        value={templateOptions.customTitle}
                        onChange={(e) => setTemplateOptions(prev => ({...prev, customTitle: e.target.value}))}
                        rows={1}
                        className="resize-y"
                      />
                    </div>
                  </div>

                  {/* ... existing flexible options ... */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
                    <h3 className="font-bold text-purple-900 flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      تخصيص الجدول
                    </h3>
                    
                    <div>
                      <Label className="mb-2 block">طريقة عرض الجدول</Label>
                      <RadioGroup 
                        value={templateOptions.tableLayout} 
                        onValueChange={(value) => setTemplateOptions(prev => ({...prev, tableLayout: value}))}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-purple-100 cursor-pointer">
                          <RadioGroupItem value="horizontal" id="horizontal" />
                          <Label htmlFor="horizontal" className="cursor-pointer flex items-center gap-2">
                            <Table className="w-4 h-4" />
                            عرضي (الافتراضي)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-purple-100 cursor-pointer">
                          <RadioGroupItem value="vertical" id="vertical" />
                          <Label htmlFor="vertical" className="cursor-pointer flex items-center gap-2">
                            <List className="w-4 h-4" />
                            طولي
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>عنوان خانة الاسم</Label>
                        <Textarea
                          value={templateOptions.customTableHeaders.name}
                          onChange={(e) => setTemplateOptions(prev => ({
                            ...prev, 
                            customTableHeaders: {...prev.customTableHeaders, name: e.target.value}
                          }))}
                          rows={1}
                          className="resize-y"
                        />
                      </div>
                      <div>
                        <Label>عنوان خانة المسمى الوظيفي</Label>
                        <Textarea
                          value={templateOptions.customTableHeaders.position}
                          onChange={(e) => setTemplateOptions(prev => ({
                            ...prev, 
                            customTableHeaders: {...prev.customTableHeaders, position: e.target.value}
                          }))}
                          rows={1}
                          className="resize-y"
                        />
                      </div>
                      <div>
                        <Label>عنوان خانة نوع التكليف</Label>
                        <Textarea
                          value={templateOptions.customTableHeaders.assignmentType}
                          onChange={(e) => setTemplateOptions(prev => ({
                            ...prev, 
                            customTableHeaders: {...prev.customTableHeaders, assignmentType: e.target.value}
                          }))}
                          rows={1}
                          className="resize-y"
                        />
                      </div>
                      <div>
                        <Label>عنوان خانة جهة العمل</Label>
                        <Textarea
                          value={templateOptions.customTableHeaders.fromCenter}
                          onChange={(e) => setTemplateOptions(prev => ({
                            ...prev, 
                            customTableHeaders: {...prev.customTableHeaders, fromCenter: e.target.value}
                          }))}
                          rows={1}
                          className="resize-y"
                        />
                      </div>
                      <div>
                        <Label>عنوان خانة جهة التكليف</Label>
                        <Textarea
                          value={templateOptions.customTableHeaders.toCenter}
                          onChange={(e) => setTemplateOptions(prev => ({
                            ...prev, 
                            customTableHeaders: {...prev.customTableHeaders, toCenter: e.target.value}
                          }))}
                          rows={1}
                          className="resize-y"
                        />
                      </div>
                      <div>
                        <Label>عنوان خانة مدة التكليف</Label>
                        <Textarea
                          value={templateOptions.customTableHeaders.duration}
                          onChange={(e) => setTemplateOptions(prev => ({
                            ...prev, 
                            customTableHeaders: {...prev.customTableHeaders, duration: e.target.value}
                          }))}
                          rows={1}
                          className="resize-y"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="showTableDuration" 
                          checked={templateOptions.showDurationInTable} 
                          onCheckedChange={(checked) => setTemplateOptions(prev => ({...prev, showDurationInTable: checked}))} 
                        />
                        <Label htmlFor="showTableDuration" className="cursor-pointer">إظهار المدة في الجدول</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="showParaDuration" 
                          checked={templateOptions.showDurationInParagraph} 
                          onCheckedChange={(checked) => setTemplateOptions(prev => ({...prev, showDurationInParagraph: checked}))} 
                        />
                        <Label htmlFor="showParaDuration" className="cursor-pointer">إظهار المدة في الفقرة الأولى</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>نوع التكليف المخصص (اتركه فارغاً للنوع الافتراضي)</Label>
                    <Textarea
                      placeholder="مثال: تكليف داخلي - مؤقت"
                      value={templateOptions.customAssignmentType}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customAssignmentType: e.target.value}))}
                      rows={1}
                      className="resize-y"
                    />
                  </div>

                  <div>
                    <Label>صيغة مدة التكليف المخصصة (اتركه فارغاً للصيغة الافتراضية)</Label>
                    <Textarea
                      placeholder="مثال: لمدة 15 يوماً، اعتباراً من..."
                      value={templateOptions.customDurationText}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customDurationText: e.target.value}))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>الفقرة الأولى (اتركه فارغاً للنص الافتراضي)</Label>
                    <Textarea
                      placeholder="تكليف الموضح بياناته أعلاه لتغطية العمل في..."
                      value={templateOptions.customParagraph1}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customParagraph1: e.target.value}))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>الفقرة الثانية</Label>
                    <Textarea
                      value={templateOptions.customParagraph2}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customParagraph2: e.target.value}))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>الفقرة الثالثة (اتركه فارغاً لعدم الإظهار)</Label>
                    <Textarea
                      placeholder="نسخة للمركز الأصلي لإبلاغ المذكور..."
                      value={templateOptions.customParagraph3}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customParagraph3: e.target.value}))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>الفقرة الرابعة (اتركه فارغاً لعدم الإظهار)</Label>
                    <Textarea
                      placeholder="نسخة للمركز المكلف به..."
                      value={templateOptions.customParagraph4}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customParagraph4: e.target.value}))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>الفقرة الخامسة</Label>
                    <Textarea
                      value={templateOptions.customParagraph5}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customParagraph5: e.target.value}))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>الختام</Label>
                    <Textarea
                      value={templateOptions.customClosing}
                      onChange={(e) => setTemplateOptions(prev => ({...prev, customClosing: e.target.value}))}
                      rows={1}
                      className="resize-y"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {(selectedEmployee || (assignmentType === 'multiple' && multipleAssignments.length > 0)) && (
          <div className="flex justify-end mt-4 md:mt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={isSaving} 
              className="bg-green-600 hover:bg-green-700 gap-1 md:gap-2 w-full md:w-auto text-xs md:text-sm h-9 md:h-10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 md:w-4 md:h-4" />
                  حفظ وإنشاء
                </>
              )}
            </Button>
          </div>
        )}

        {/* Preview Section */}
        <div className="mt-4 md:mt-8">
          <h2 className="text-sm md:text-xl font-bold mb-2 md:mb-4">معاينة</h2>
          {assignmentType === 'flexible' ? (
            <FlexibleAssignmentTemplate 
              assignment={{...assignmentData, employee_name: selectedEmployee?.full_name_arabic, employee_position: selectedEmployee?.position, gender: selectedEmployee?.gender}} 
              employee={selectedEmployee} 
              {...templateOptions}
            />
          ) : assignmentType === 'multiple' ? (
            <MultipleAssignmentTemplate 
              assignments={multipleAssignments}
              customTitle={templateOptions.customTitle || 'قرار تكليف'}
              customIntro={templateOptions.customIntro || 'إن مدير شؤون المراكز الصحية بالحناكية وبناء على الصلاحيات الممنوحة لنا نظاماً\nعليه يقرر ما يلي:'}
              decisionPoints={templateOptions.decisionPoints || [
                'تكليف الموضح بياناتهم أعلاه بالعمل في الجهات الموضحة قرين اسم كل منهم خلال الفترة المحددة.',
                'لا يترتب على هذا التكليف أي ميزة مالية إلا ما يقره النظام.',
                'يتم تنفيذ هذا القرار كلاً فيما يخصه.'
              ]}
              customClosing={templateOptions.customClosing || 'خالص التحايا ،،،'}
              freeText={templateOptions.freeText || ''}
              onTitleChange={(v) => setTemplateOptions(prev => ({...prev, customTitle: v}))}
              onIntroChange={(v) => setTemplateOptions(prev => ({...prev, customIntro: v}))}
              onDecisionPointsChange={(v) => setTemplateOptions(prev => ({...prev, decisionPoints: v}))}
              onClosingChange={(v) => setTemplateOptions(prev => ({...prev, customClosing: v}))}
              onFreeTextChange={(v) => setTemplateOptions(prev => ({...prev, freeText: v}))}
              onAssignmentsChange={(rowIdx, colId, value) => {
                setMultipleAssignments(prev => {
                  const updated = [...prev];
                  if (updated[rowIdx]) updated[rowIdx][colId] = value;
                  return updated;
                });
              }}
            />
          ) : (
            <StandardAssignmentTemplate 
              assignment={{...assignmentData, employee_name: selectedEmployee?.full_name_arabic, employee_position: selectedEmployee?.position, gender: selectedEmployee?.gender}} 
              employee={selectedEmployee} 
            />
          )}
        </div>
      </div>
    </div>
  );
}