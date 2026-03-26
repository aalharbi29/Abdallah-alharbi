import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Search, Copy, Printer, X, UserPlus, Download, User, Sparkles, Loader2, FileText, Send, FileCode, FileOutput, Stamp, Eye, Save, FolderOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import useLogoSettings from '@/components/settings/useLogoSettings';
import ReportPreviewDialog from '@/components/employee_data/ReportPreviewDialog';
import AITextEnhancer from '@/components/employee_data/AITextEnhancer';
import EmployeeMultiSelect from '@/components/employee_data/EmployeeMultiSelect';
import FontSettings from '@/components/employee_data/FontSettings';
import HijriDatePicker from '@/components/ui/HijriDatePicker';
import { exportToCSV, exportToHTML, generateReportHtml } from '@/components/employee_data/exportUtils';

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
  { key: 'جهة_التكليف', label: 'جهة التكليف', default: false },
  { key: 'فترة_التكليف', label: 'فترة التكليف', default: false },
];

const HEALTH_CENTERS_OPTIONS = [
  'الحسو', 'هدبان', 'صخيبرة', 'طلال', 'الماوية', 'بلغة', 'الهميج', 'بطحي', 'شؤون المراكز بالحسو'
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
  const [reportNarrative, setReportNarrative] = useState('');
  const [reportTitle, setReportTitle] = useState('تقرير بيانات الموظفين');
  const [narrativePosition, setNarrativePosition] = useState('before'); // before or after
  const [showSignature, setShowSignature] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState('');
  const [assignmentCenters, setAssignmentCenters] = useState({});
  // مجموعات التكليف - كل مجموعة لها فترة وموظفين
  const [assignmentGroups, setAssignmentGroups] = useState([
    { id: 1, fromDate: '', toDate: '', dateType: 'hijri', periodType: 'range', durationText: '', specificDays: [], employeeIds: [] }
  ]);
  const [logoPosition, setLogoPosition] = useState('center');
  const [signaturePosition, setSignaturePosition] = useState('center');
  const [signerName, setSignerName] = useState('عبدالمجيد سعود الربيقي');
  const [signerTitle, setSignerTitle] = useState('المساعد لشؤون المراكز الصحية بالحسو');
  const [showPreview, setShowPreview] = useState(false);
  const [splitPages, setSplitPages] = useState(false);
  const [rowsPerFirstPage, setRowsPerFirstPage] = useState(15);
  const [rowsPerNextPage, setRowsPerNextPage] = useState(25);
  const [pageBreakAfterRows, setPageBreakAfterRows] = useState([]);
  const [mergeWorkplace, setMergeWorkplace] = useState(false);
  const [mergeWorkplaceOrientation, setMergeWorkplaceOrientation] = useState('vertical');
  const [mergeAssignment, setMergeAssignment] = useState(false);
  const [mergeAssignmentOrientation, setMergeAssignmentOrientation] = useState('vertical');
  const [fontSettings, setFontSettings] = useState({
    narrativeBold: { font: 'PT Sans Caption', size: '17', weight: '900' },
    narrativeGreeting: { font: 'Cairo', size: '16', weight: '700' },
    narrativeBody: { font: 'Cairo', size: '16', weight: '600' },
    tableHeader: { font: 'Cairo', size: '13', weight: '700' },
    tableBody: { font: 'Cairo', size: '13', weight: '700' },
    paragraphSpacing: 10,
    lineHeight: '2.0',
  });
  const [lineStyles, setLineStyles] = useState({});
  const { logoSettings } = useLogoSettings();

  // حفظ وتحميل النموذج الافتراضي
  const saveDefaultTemplate = async () => {
    try {
      const template = {
        config_name: 'default',
        selected_employees_ids: selectedEmployees.map(e => e.id),
        employee_managers: employeeManagers,
        assignment_centers: assignmentCenters,
        report_title: reportTitle,
        report_narrative: reportNarrative,
        narrative_position: narrativePosition,
        selected_fields: selectedFields,
        display_mode: displayMode,
        logo_position: logoPosition,
        signature_position: signaturePosition,
        signer_name: signerName,
        signer_title: signerTitle,
        show_signature: showSignature,
        selected_signature_id: selectedSignatureId,
        split_pages: splitPages,
        font_settings: fontSettings,
        merge_workplace: mergeWorkplace,
        merge_workplace_orientation: mergeWorkplaceOrientation,
        merge_assignment: mergeAssignment,
        merge_assignment_orientation: mergeAssignmentOrientation,
        assignment_groups: assignmentGroups,
        line_styles: lineStyles,
        rows_per_first_page: rowsPerFirstPage,
        rows_per_next_page: rowsPerNextPage,
        page_break_after_rows: pageBreakAfterRows
      };
      
      const existing = await base44.entities.ReportConfiguration.filter({ config_name: 'default' });
      if (existing && existing.length > 0) {
        await base44.entities.ReportConfiguration.update(existing[0].id, template);
      } else {
        await base44.entities.ReportConfiguration.create(template);
      }
      toast.success('تم حفظ النموذج الافتراضي بنجاح في قاعدة البيانات');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('حدث خطأ أثناء حفظ النموذج');
    }
  };

  const loadDefaultTemplate = async () => {
    try {
      const existing = await base44.entities.ReportConfiguration.filter({ config_name: 'default' });
      if (!existing || existing.length === 0) {
        toast.info('لا يوجد نموذج محفوظ في قاعدة البيانات');
        return;
      }
      const t = existing[0];
      
      if (t.selected_employees_ids && employees.length > 0) {
        const selected = employees.filter(e => t.selected_employees_ids.includes(e.id));
        setSelectedEmployees(selected);
      }
      if (t.employee_managers) setEmployeeManagers(t.employee_managers);
      if (t.assignment_centers) setAssignmentCenters(t.assignment_centers);
      if (t.report_title) setReportTitle(t.report_title);
      if (t.report_narrative) setReportNarrative(t.report_narrative);
      if (t.narrative_position) setNarrativePosition(t.narrative_position);
      if (t.selected_fields) setSelectedFields(t.selected_fields);
      if (t.display_mode) setDisplayMode(t.display_mode);
      if (t.logo_position) setLogoPosition(t.logo_position);
      if (t.signature_position) setSignaturePosition(t.signature_position);
      if (t.signer_name) setSignerName(t.signer_name);
      if (t.signer_title) setSignerTitle(t.signer_title);
      if (t.show_signature !== undefined) setShowSignature(t.show_signature);
      if (t.selected_signature_id) setSelectedSignatureId(t.selected_signature_id);
      if (t.split_pages !== undefined) setSplitPages(t.split_pages);
      if (t.font_settings) setFontSettings(t.font_settings);
      if (t.merge_workplace !== undefined) setMergeWorkplace(t.merge_workplace);
      if (t.merge_workplace_orientation) setMergeWorkplaceOrientation(t.merge_workplace_orientation);
      if (t.merge_assignment !== undefined) setMergeAssignment(t.merge_assignment);
      if (t.merge_assignment_orientation) setMergeAssignmentOrientation(t.merge_assignment_orientation);
      if (t.assignment_groups) setAssignmentGroups(t.assignment_groups);
      if (t.line_styles) setLineStyles(t.line_styles);
      if (t.rows_per_first_page) setRowsPerFirstPage(t.rows_per_first_page);
      if (t.rows_per_next_page) setRowsPerNextPage(t.rows_per_next_page);
      if (t.page_break_after_rows) setPageBreakAfterRows(t.page_break_after_rows);
      
      toast.success('تم تحميل النموذج الافتراضي');
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('حدث خطأ أثناء تحميل النموذج');
    }
  };

  const resetDefaultTemplate = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في التراجع ومسح الإعدادات المحفوظة؟')) return;
    try {
      const existing = await base44.entities.ReportConfiguration.filter({ config_name: 'default' });
      if (existing && existing.length > 0) {
        await base44.entities.ReportConfiguration.delete(existing[0].id);
      }
      
      // Reset local state to defaults
      setSelectedEmployees([]);
      setEmployeeManagers({});
      setAssignmentCenters({});
      setReportTitle('تقرير بيانات الموظفين');
      setReportNarrative('');
      setNarrativePosition('before');
      setSelectedFields(availableFields.filter(f => f.default).map(f => f.key));
      setDisplayMode('normal');
      setLogoPosition('center');
      setSignaturePosition('center');
      setSignerName('عبدالمجيد سعود الربيقي');
      setSignerTitle('المساعد لشؤون المراكز الصحية بالحسو');
      setShowSignature(false);
      setSelectedSignatureId('');
      setSplitPages(false);
      setFontSettings({
        narrativeBold: { font: 'PT Sans Caption', size: '17', weight: '900' },
        narrativeGreeting: { font: 'Cairo', size: '16', weight: '700' },
        narrativeBody: { font: 'Cairo', size: '16', weight: '600' },
        tableHeader: { font: 'Cairo', size: '13', weight: '700' },
        tableBody: { font: 'Cairo', size: '13', weight: '700' },
        paragraphSpacing: 10,
        lineHeight: '2.0',
      });
      setMergeWorkplace(false);
      setMergeWorkplaceOrientation('vertical');
      setMergeAssignment(false);
      setMergeAssignmentOrientation('vertical');
      setAssignmentGroups([{ id: Date.now(), fromDate: '', toDate: '', dateType: 'hijri', periodType: 'range', durationText: '', specificDays: [], employeeIds: [] }]);
      setLineStyles({});
      setRowsPerFirstPage(15);
      setRowsPerNextPage(25);
      setPageBreakAfterRows([]);
      
      toast.success('تم مسح الإعدادات المحفوظة وإعادة تعيين النموذج');
    } catch (error) {
      console.error('Error resetting template:', error);
      toast.error('حدث خطأ أثناء مسح النموذج');
    }
  };

  // تحميل تلقائي عند أول فتح بعد تحميل الموظفين
  useEffect(() => {
    if (employees.length > 0) {
      const loadInitial = async () => {
        try {
          const existing = await base44.entities.ReportConfiguration.filter({ config_name: 'default' });
          if (existing && existing.length > 0) {
            const t = existing[0];
            if (t.selected_employees_ids && employees.length > 0) {
              const selected = employees.filter(e => t.selected_employees_ids.includes(e.id));
              setSelectedEmployees(selected);
            }
            if (t.employee_managers) setEmployeeManagers(t.employee_managers);
            if (t.assignment_centers) setAssignmentCenters(t.assignment_centers);
            if (t.report_title) setReportTitle(t.report_title);
            if (t.report_narrative) setReportNarrative(t.report_narrative);
            if (t.narrative_position) setNarrativePosition(t.narrative_position);
            if (t.selected_fields) setSelectedFields(t.selected_fields);
            if (t.display_mode) setDisplayMode(t.display_mode);
            if (t.logo_position) setLogoPosition(t.logo_position);
            if (t.signature_position) setSignaturePosition(t.signature_position);
            if (t.signer_name) setSignerName(t.signer_name);
            if (t.signer_title) setSignerTitle(t.signer_title);
            if (t.show_signature !== undefined) setShowSignature(t.show_signature);
            if (t.selected_signature_id) setSelectedSignatureId(t.selected_signature_id);
            if (t.split_pages !== undefined) setSplitPages(t.split_pages);
            if (t.font_settings) setFontSettings(t.font_settings);
            if (t.merge_workplace !== undefined) setMergeWorkplace(t.merge_workplace);
            if (t.merge_workplace_orientation) setMergeWorkplaceOrientation(t.merge_workplace_orientation);
            if (t.merge_assignment !== undefined) setMergeAssignment(t.merge_assignment);
            if (t.merge_assignment_orientation) setMergeAssignmentOrientation(t.merge_assignment_orientation);
            if (t.assignment_groups) setAssignmentGroups(t.assignment_groups);
            if (t.line_styles) setLineStyles(t.line_styles);
            if (t.rows_per_first_page) setRowsPerFirstPage(t.rows_per_first_page);
            if (t.rows_per_next_page) setRowsPerNextPage(t.rows_per_next_page);
            if (t.page_break_after_rows) setPageBreakAfterRows(t.page_break_after_rows);
          }
        } catch (error) {
          console.error('Error auto-loading template:', error);
        }
      };
      loadInitial();
    }
  }, [employees.length > 0]);

  useEffect(() => {
    loadEmployees();
    loadHealthCenters();
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    try {
      const sigs = await base44.entities.StampSignature.filter({ is_active: true });
      setSignatures(Array.isArray(sigs) ? sigs : []);
    } catch (error) {
      console.error('Error loading signatures:', error);
      setSignatures([]);
    }
  };

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Employee.list('-updated_date', 1000);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealthCenters = async () => {
    try {
      const centers = await base44.entities.HealthCenter.list();
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

  const copyTableToClipboard = async () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    );

    // إنشاء الجدول كـ HTML للنسخ بشكل أفضل
    let htmlTable = '<table dir="rtl" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">';
    htmlTable += '<thead><tr style="background-color: #f3f4f6;">';
    headers.forEach(header => {
      htmlTable += `<th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${header}</th>`;
    });
    htmlTable += '</tr></thead><tbody>';

    if (displayMode === 'normal') {
      selectedEmployees.forEach((emp, idx) => {
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9fafb';
        htmlTable += `<tr style="background-color: ${bgColor};">`;
        selectedFields.forEach(key => {
          htmlTable += `<td style="border: 1px solid #000; padding: 8px; text-align: center; white-space: pre-wrap;">${getFieldValue(emp, key)}</td>`;
        });
        htmlTable += '</tr>';
      });
    } else {
      selectedEmployees.forEach(emp => {
        htmlTable += '<tr style="background-color: #dbeafe;">';
        selectedFields.forEach(key => {
          htmlTable += `<td style="border: 1px solid #000; padding: 8px; text-align: center; white-space: pre-wrap;">${getFieldValue(emp, key)}</td>`;
        });
        htmlTable += '</tr>';
      });

      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            htmlTable += `<tr style="background-color: #d1fae5;"><td colspan="${selectedFields.length}" style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">بيانات المدير المباشر</td></tr>`;
            htmlTable += '<tr style="background-color: #ecfdf5;">';
            selectedFields.forEach(key => {
              htmlTable += `<td style="border: 1px solid #000; padding: 8px; text-align: center; white-space: pre-wrap;">${getFieldValue(manager, key)}</td>`;
            });
            htmlTable += '</tr>';
            processedManagers.add(managerId);
          }
        }
      });
    }

    htmlTable += '</tbody></table>';

    // النص العادي للنسخ كبديل
    let plainText = headers.join('\t') + '\n';
    if (displayMode === 'normal') {
      plainText += selectedEmployees.map(emp =>
        selectedFields.map(key => getFieldValue(emp, key).replace(/\n/g, ' ')).join('\t')
      ).join('\n');
    } else {
      selectedEmployees.forEach(emp => {
        plainText += selectedFields.map(key => getFieldValue(emp, key).replace(/\n/g, ' ')).join('\t') + '\n';
      });
      const processedManagers = new Set();
      Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
        if (!processedManagers.has(managerId)) {
          const manager = getManagerWithCenters(managerId, employeeIds);
          if (manager) {
            plainText += 'بيانات المدير المباشر\n';
            plainText += selectedFields.map(key => getFieldValue(manager, key).replace(/\n/g, ' ')).join('\t') + '\n';
            processedManagers.add(managerId);
          }
        }
      });
    }

    // تنسيق الطلب النهائي
    const requestText = finalRequest ? `\n\n${finalRequest}` : '';
    const fullPlainText = `بعد التحية\n\n${plainText}${requestText}`;
    const fullHtml = `<div dir="rtl" style="font-family: Arial, sans-serif;"><p style="font-weight: bold;">بعد التحية</p><br/>${htmlTable}<br/>${finalRequest ? `<p>${finalRequest}</p><br/>` : ''}</div>`;

    try {
      // محاولة نسخ كـ HTML و نص عادي معاً
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([fullHtml], { type: 'text/html' }),
        'text/plain': new Blob([fullPlainText], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
      alert('تم نسخ الطلب والجدول بنجاح! يمكنك الآن لصقها في Word أو Excel وسيظهر الجدول بشكل صحيح.');
    } catch (err) {
      // في حال فشل نسخ HTML، نستخدم النص العادي فقط
      try {
        await navigator.clipboard.writeText(fullPlainText);
        alert('تم نسخ النص! (استخدم التصدير لـ Excel للحصول على جدول منسق)');
      } catch (e) {
        console.error('Failed to copy:', e);
        alert('فشل النسخ. يرجى المحاولة مرة أخرى');
      }
    }
  };

  const handleExportToCSV = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    );
    exportToCSV({
      headers,
      displayMode,
      selectedEmployees,
      selectedFields,
      groupedByManager,
      getManagerWithCenters,
      getFieldValue,
      availableFields
    });
  };

  const handleExportToHTML = () => {
    const html = generateReportHtml({
      selectedFields, availableFields, reportTitle, reportNarrative, narrativePosition, lineStyles, fontSettings,
      logoSettings, logoPosition, showSignature, selectedSignatureId, signatures,
      signerName, signerTitle, signaturePosition, assignmentGroups, selectedEmployees,
      displayMode, groupedByManager, getManagerWithCenters, getFieldValue,
      mergeWorkplace, mergeWorkplaceOrientation, mergeAssignment, mergeAssignmentOrientation, splitPages, rowsPerFirstPage, rowsPerNextPage,
      pageBreakAfterRows, finalRequest
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle || 'تقرير_بيانات_الموظفين'}_${new Date().toLocaleDateString('ar-SA')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportAsReport = () => {
    const html = generateReportHtml({
      selectedFields, availableFields, reportTitle, reportNarrative, narrativePosition, lineStyles, fontSettings,
      logoSettings, logoPosition, showSignature, selectedSignatureId, signatures,
      signerName, signerTitle, signaturePosition, assignmentGroups, selectedEmployees,
      displayMode, groupedByManager, getManagerWithCenters, getFieldValue,
      mergeWorkplace, mergeWorkplaceOrientation, mergeAssignment, mergeAssignmentOrientation, splitPages, rowsPerFirstPage, rowsPerNextPage,
      pageBreakAfterRows, finalRequest
    });

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
      };
    }
    
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  };

  const handlePrint = () => {
    exportAsReport();
  };

  const getFieldValue = (emp, key) => {
    if (key === 'جهة_التكليف') {
      const center = assignmentCenters[emp.id];
      if (!center) return '-';
      return center.includes('شؤون') ? center : `مركز ${center}`;
    }
    if (key === 'فترة_التكليف') {
      const group = assignmentGroups.find(g => {
        if (g.employeeIds.length > 0) return g.employeeIds.includes(emp.id);
        if (assignmentGroups.length === 1) return true;
        return false;
      });
      if (!group || (!group.fromDate && !group.toDate && !group.durationText)) return '-';
      const suffix = group.dateType === 'hijri' ? 'هـ' : 'م';
      let text = '';
      if (group.periodType === 'duration') {
        text = `${group.durationText || '...'} اعتباراً من ${group.fromDate || '...'} ${suffix}`;
      } else {
        text = `من ${group.fromDate || '...'} إلى ${group.toDate || '...'} ${suffix}`;
      }
      if (group.specificDays && group.specificDays.length > 0) {
        text += `\n(أيام: ${group.specificDays.join('، ')})`;
      }
      return text;
    }
    if (key === 'المركز_الصحي') {
      const val = emp[key] || '-';
      return val !== '-' ? val.replace(/\s*صحي\s*/g, ' ').trim() : '-';
    }
    return emp[key] || '-';
  };

  const getMergedCellStyle = (spanCount, orientation) => {
    const baseStyle = { border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000', verticalAlign: 'middle' };
    if (spanCount <= 1) return baseStyle;
    
    if (orientation === 'vertical') {
      return { ...baseStyle, writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', width: '40px' };
    } else if (orientation === 'diagonal') {
      return { ...baseStyle, whiteSpace: 'nowrap' };
    } else {
      return { ...baseStyle, whiteSpace: 'normal' };
    }
  };

  const renderMergedCellContent = (content, spanCount, orientation) => {
    if (spanCount > 1 && orientation === 'diagonal') {
      return <div style={{ transform: 'rotate(-45deg)', display: 'inline-block', whiteSpace: 'nowrap' }}>{content}</div>;
    }
    return content;
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
                  <EmployeeMultiSelect
                    employees={employees}
                    selectedEmployees={selectedEmployees}
                    onSelectionChange={setSelectedEmployees}
                    assignmentCenters={assignmentCenters}
                    onAssignmentCenterChange={setAssignmentCenters}
                  />
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
                {selectedEmployees.map((emp, index) => (
                  <Badge key={emp.id} variant="secondary" className="gap-1">
                    <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
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

              {/* عنوان التقرير */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>عنوان التقرير الرسمي</Label>
                  <AITextEnhancer
                    text={reportTitle}
                    onApply={(newText) => setReportTitle(newText)}
                    type="title"
                    disabled={!reportTitle?.trim()}
                  />
                </div>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="تقرير بيانات الموظفين"
                  className="mt-2 font-bold"
                />
              </div>

              {/* نص تعبيري للتقرير */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>نص تعبيري للتقرير (اختياري)</Label>
                  <AITextEnhancer
                    text={reportNarrative}
                    onApply={(newText) => setReportNarrative(newText)}
                    type="narrative"
                    disabled={!reportNarrative?.trim()}
                  />
                </div>
                <Textarea
                  value={reportNarrative}
                  onChange={(e) => setReportNarrative(e.target.value)}
                  placeholder="مثال: بيان بأسماء الموظفين المكلفين خلال إجازة عيد الفطر المبارك لعام 1446هـ..."
                  rows={3}
                  className="mt-2"
                />
                <div className="flex items-center gap-4 mt-2">
                  <Label className="text-xs text-gray-500">موقع النص:</Label>
                  <RadioGroup value={narrativePosition} onValueChange={setNarrativePosition} className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="before" id="narr-before" />
                      <Label htmlFor="narr-before" className="cursor-pointer text-xs">قبل الجدول</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="after" id="narr-after" />
                      <Label htmlFor="narr-after" className="cursor-pointer text-xs">بعد الجدول</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* جهة التكليف لكل موظف */}
              {selectedFields.includes('جهة_التكليف') && (
                <div className="space-y-3">
                  <Label>تحديد جهة التكليف لكل موظف</Label>
                  <div className="space-y-2">
                    {selectedEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <span className="text-sm flex-1">{emp.full_name_arabic}</span>
                        <Select
                          value={assignmentCenters[emp.id] || ''}
                          onValueChange={(val) => setAssignmentCenters(prev => ({ ...prev, [emp.id]: val }))}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="اختر المركز" />
                          </SelectTrigger>
                          <SelectContent>
                            {HEALTH_CENTERS_OPTIONS.map(center => (
                              <SelectItem key={center} value={`${center}`}>مركز {center}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* مجموعات فترة التكليف */}
              {selectedFields.includes('فترة_التكليف') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>مجموعات فترة التكليف</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAssignmentGroups(prev => [...prev, { id: Date.now(), fromDate: '', toDate: '', dateType: 'hijri', employeeIds: [] }])}
                    >
                      + إضافة مجموعة
                    </Button>
                  </div>
                  {assignmentGroups.map((group, gIdx) => (
                    <div key={group.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">المجموعة {gIdx + 1}</span>
                        {assignmentGroups.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-500 h-6 px-2"
                            onClick={() => setAssignmentGroups(prev => prev.filter(g => g.id !== group.id))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <Select
                          value={group.dateType}
                          onValueChange={(val) => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, dateType: val } : g))}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hijri">هجري</SelectItem>
                            <SelectItem value="gregorian">ميلادي</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={group.periodType || 'range'}
                          onValueChange={(val) => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, periodType: val } : g))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="range">من / إلى</SelectItem>
                            <SelectItem value="duration">لمدة (اعتباراً من)</SelectItem>
                          </SelectContent>
                        </Select>

                        {group.periodType === 'duration' ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-bold">لمدة:</Label>
                              <Input type="text" placeholder="مثال: شهر" value={group.durationText || ''} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, durationText: e.target.value } : g))} className="w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-bold">اعتباراً من:</Label>
                              {group.dateType === 'gregorian' ? (
                                <Input type="date" value={group.fromDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, fromDate: e.target.value } : g))} className="w-40" />
                              ) : (
                                <HijriDatePicker
                                  value={group.fromDate}
                                  onChange={(val) => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, fromDate: val } : g))}
                                  placeholder="مثال: 1446/10/01"
                                  className="flex h-9 w-44 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-center"
                                />
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-bold">من:</Label>
                              {group.dateType === 'gregorian' ? (
                                <Input type="date" value={group.fromDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, fromDate: e.target.value } : g))} className="w-40" />
                              ) : (
                                <HijriDatePicker
                                  value={group.fromDate}
                                  onChange={(val) => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, fromDate: val } : g))}
                                  placeholder="مثال: 1446/10/01"
                                  className="flex h-9 w-44 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-center"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-bold">إلى:</Label>
                              {group.dateType === 'gregorian' ? (
                                <Input type="date" value={group.toDate} onChange={e => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, toDate: e.target.value } : g))} className="w-40" />
                              ) : (
                                <HijriDatePicker
                                  value={group.toDate}
                                  onChange={(val) => setAssignmentGroups(prev => prev.map(g => g.id === group.id ? { ...g, toDate: val } : g))}
                                  placeholder="مثال: 1446/10/15"
                                  className="flex h-9 w-44 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-center"
                                />
                              )}
                            </div>
                          </>
                        )}
                        
                        <div className="flex items-center gap-2 w-full mt-2">
                          <Label className="text-xs font-bold">أيام محددة (اختياري):</Label>
                          <div className="flex flex-wrap gap-1">
                            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => {
                              const isSelected = (group.specificDays || []).includes(day);
                              return (
                                <Badge
                                  key={day}
                                  variant={isSelected ? "default" : "outline"}
                                  className="cursor-pointer text-xs"
                                  onClick={() => {
                                    setAssignmentGroups(prev => prev.map(g => {
                                      if (g.id !== group.id) return g;
                                      const days = g.specificDays || [];
                                      return {
                                        ...g,
                                        specificDays: isSelected ? days.filter(d => d !== day) : [...days, day]
                                      };
                                    }));
                                  }}
                                >
                                  {day}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">اختر الموظفين لهذه المجموعة:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployees.map(emp => {
                            const isInGroup = group.employeeIds.includes(emp.id);
                            const isInOtherGroup = assignmentGroups.some(g => g.id !== group.id && g.employeeIds.includes(emp.id));
                            return (
                              <Badge
                                key={emp.id}
                                variant={isInGroup ? "default" : "outline"}
                                className={`cursor-pointer text-xs ${isInGroup ? 'bg-blue-600' : isInOtherGroup ? 'opacity-40' : 'hover:bg-blue-50'}`}
                                onClick={() => {
                                  if (isInOtherGroup) return;
                                  setAssignmentGroups(prev => prev.map(g => {
                                    if (g.id !== group.id) return g;
                                    return {
                                      ...g,
                                      employeeIds: isInGroup
                                        ? g.employeeIds.filter(id => id !== emp.id)
                                        : [...g.employeeIds, emp.id]
                                    };
                                  }));
                                }}
                              >
                                {emp.full_name_arabic}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* إعدادات الخطوط */}
              <FontSettings fontSettings={fontSettings} onFontSettingsChange={setFontSettings} />

              {/* إعدادات دمج الخلايا */}
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-sm font-bold">إعدادات دمج الخلايا المتشابهة في الجدول</Label>
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mergeWorkplace"
                        checked={mergeWorkplace}
                        onCheckedChange={setMergeWorkplace}
                      />
                      <Label htmlFor="mergeWorkplace" className="cursor-pointer text-sm">
                        دمج خلايا "جهة العمل" المتشابهة المتتالية
                      </Label>
                    </div>
                    {mergeWorkplace && (
                      <Select value={mergeWorkplaceOrientation} onValueChange={setMergeWorkplaceOrientation}>
                        <SelectTrigger className="w-[180px] h-8 text-xs bg-white">
                          <SelectValue placeholder="اتجاه النص" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vertical">كتابة طولية</SelectItem>
                          <SelectItem value="horizontal">كتابة بالعرض</SelectItem>
                          <SelectItem value="diagonal">مائل 45 درجة</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mergeAssignment"
                        checked={mergeAssignment}
                        onCheckedChange={setMergeAssignment}
                      />
                      <Label htmlFor="mergeAssignment" className="cursor-pointer text-sm">
                        دمج خلايا "جهة التكليف" المتشابهة المتتالية
                      </Label>
                    </div>
                    {mergeAssignment && (
                      <Select value={mergeAssignmentOrientation} onValueChange={setMergeAssignmentOrientation}>
                        <SelectTrigger className="w-[180px] h-8 text-xs bg-white">
                          <SelectValue placeholder="اتجاه النص" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vertical">كتابة طولية</SelectItem>
                          <SelectItem value="horizontal">كتابة بالعرض</SelectItem>
                          <SelectItem value="diagonal">مائل 45 درجة</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              {/* تجزئة الصفحات */}
              <div className="space-y-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="splitPages"
                    checked={splitPages}
                    onCheckedChange={setSplitPages}
                  />
                  <Label htmlFor="splitPages" className="cursor-pointer text-sm font-bold">
                    تجزئة التقرير (النص في صفحة والجدول في صفحة مع التوقيع في كلتيهما)
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">عدد صفوف الصفحة الأولى للجدول</Label>
                    <Input type="number" min={1} max={50} value={rowsPerFirstPage} onChange={e => setRowsPerFirstPage(parseInt(e.target.value) || 15)} className="mt-1 w-24" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">عدد صفوف الصفحات التالية</Label>
                    <Input type="number" min={1} max={50} value={rowsPerNextPage} onChange={e => setRowsPerNextPage(parseInt(e.target.value) || 25)} className="mt-1 w-24" />
                  </div>
                </div>
                {selectedEmployees.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">فرض فاصل صفحة بعد موظف معين (اختياري):</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployees.map((emp, idx) => (
                        <Badge
                          key={emp.id}
                          variant={pageBreakAfterRows.includes(idx) ? "default" : "outline"}
                          className={`cursor-pointer text-xs ${pageBreakAfterRows.includes(idx) ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50'}`}
                          onClick={() => {
                            setPageBreakAfterRows(prev =>
                              prev.includes(idx) ? prev.filter(r => r !== idx) : [...prev, idx]
                            );
                          }}
                        >
                          {idx + 1}. {emp.full_name_arabic}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">اضغط على اسم الموظف لفرض فاصل صفحة بعده</p>
                  </div>
                )}
              </div>

              {/* إعدادات الشعار */}
              <div>
                <Label className="text-xs text-gray-500">موقع الشعار:</Label>
                <RadioGroup value={logoPosition} onValueChange={setLogoPosition} className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="right" id="logo-right" />
                    <Label htmlFor="logo-right" className="cursor-pointer text-xs">يمين</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="center" id="logo-center" />
                    <Label htmlFor="logo-center" className="cursor-pointer text-xs">وسط</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="left" id="logo-left" />
                    <Label htmlFor="logo-left" className="cursor-pointer text-xs">يسار</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* التوقيع الرسمي */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showSignature"
                    checked={showSignature}
                    onCheckedChange={setShowSignature}
                  />
                  <Label htmlFor="showSignature" className="cursor-pointer flex items-center gap-1 font-bold">
                    <Stamp className="w-4 h-4" />
                    إضافة التوقيع الرسمي
                  </Label>
                </div>
                {showSignature && (
                  <>
                    {signatures.length > 0 && (
                      <Select value={selectedSignatureId} onValueChange={setSelectedSignatureId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر التوقيع / الختم" />
                        </SelectTrigger>
                        <SelectContent>
                          {signatures.map(sig => (
                            <SelectItem key={sig.id} value={sig.id}>
                              {sig.name} - {sig.owner_name || ''} ({sig.type === 'stamp' ? 'ختم' : 'توقيع'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {signatures.length === 0 && (
                      <p className="text-xs text-gray-500">لا توجد أختام مسجلة. سيظهر الاسم فقط.</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">اسم الموقع</Label>
                        <Input value={signerName} onChange={e => setSignerName(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">المسمى الوظيفي</Label>
                        <Input value={signerTitle} onChange={e => setSignerTitle(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">موقع التوقيع:</Label>
                      <RadioGroup value={signaturePosition} onValueChange={setSignaturePosition} className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="right" id="sig-right" />
                          <Label htmlFor="sig-right" className="cursor-pointer text-xs">يمين</Label>
                        </div>
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="center" id="sig-center" />
                          <Label htmlFor="sig-center" className="cursor-pointer text-xs">وسط</Label>
                        </div>
                        <div className="flex items-center gap-1">
                          <RadioGroupItem value="left" id="sig-left" />
                          <Label htmlFor="sig-left" className="cursor-pointer text-xs">يسار</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}
              </div>

              {/* حفظ / تحميل النموذج */}
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Button size="sm" variant="outline" onClick={saveDefaultTemplate} className="gap-1">
                  <Save className="w-4 h-4" /> حفظ كنموذج افتراضي
                </Button>
                <Button size="sm" variant="outline" onClick={loadDefaultTemplate} className="gap-1">
                  <FolderOpen className="w-4 h-4" /> تحميل النموذج المحفوظ
                </Button>
                <Button size="sm" variant="destructive" onClick={resetDefaultTemplate} className="gap-1">
                  <X className="w-4 h-4" /> تراجع ومسح الإعدادات
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowPreview(true)}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة التقرير
                </Button>
                <Button
                  onClick={exportAsReport}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <FileOutput className="w-4 h-4 ml-2" />
                  تصدير PDF
                </Button>
                <Button
                  onClick={copyTableToClipboard}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ الطلب والجدول
                </Button>
                <Button
                  onClick={handleExportToCSV}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير Excel
                </Button>
                <Button
                  onClick={handleExportToHTML}
                  disabled={selectedEmployees.length === 0 || selectedFields.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FileCode className="w-4 h-4 ml-2" />
                  تصدير HTML
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
                      {(() => {
                        const hasAssignCol = selectedFields.includes('فترة_التكليف');
                        const otherCols = selectedFields.filter(k => k !== 'فترة_التكليف');

                        const renderMergedRows = (empList, bgFn) => {
                          const wSpans = {}; const aSpans = {};
                          if (mergeWorkplace || mergeAssignment) {
                            let cw = null, ws = 0, ca = null, as = 0;
                            empList.forEach((e, i) => {
                              const w = getFieldValue(e, 'المركز_الصحي'); const a = getFieldValue(e, 'جهة_التكليف');
                              if (mergeWorkplace) { if (w !== cw) { cw = w; ws = i; wSpans[i] = 1; } else { wSpans[ws]++; wSpans[i] = 0; } }
                              if (mergeAssignment) { if (a !== ca) { ca = a; as = i; aSpans[i] = 1; } else { aSpans[as]++; aSpans[i] = 0; } }
                            });
                          }

                          if (!hasAssignCol || !assignmentGroups || assignmentGroups.length === 0) {
                            return empList.map((emp, idx) => (
                              <tr key={emp.id} style={{ backgroundColor: bgFn ? bgFn(idx) : (idx % 2 === 0 ? '#fff' : '#f9fafb') }}>
                                {selectedFields.map(key => {
                                  if (mergeWorkplace && key === 'المركز_الصحي') {
                                    if (wSpans[idx] === 0) return null;
                                    return <td key={key} rowSpan={wSpans[idx]} style={getMergedCellStyle(wSpans[idx], mergeWorkplaceOrientation)}>{renderMergedCellContent(getFieldValue(emp, key), wSpans[idx], mergeWorkplaceOrientation)}</td>;
                                  }
                                  if (mergeAssignment && key === 'جهة_التكليف') {
                                    if (aSpans[idx] === 0) return null;
                                    return <td key={key} rowSpan={aSpans[idx]} style={getMergedCellStyle(aSpans[idx], mergeAssignmentOrientation)}>{renderMergedCellContent(getFieldValue(emp, key), aSpans[idx], mergeAssignmentOrientation)}</td>;
                                  }
                                  return <td key={key} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000' }}>{getFieldValue(emp, key)}</td>;
                                })}
                              </tr>
                            ));
                          }
                          const grouped = [];
                          const usedIds = new Set();
                          assignmentGroups.forEach(group => {
                            const ids = group.employeeIds.length > 0 ? group.employeeIds : (assignmentGroups.length === 1 ? empList.map(e => e.id) : []);
                            const grpEmps = empList.filter(e => ids.includes(e.id));
                            if (grpEmps.length > 0) { grouped.push({ group, employees: grpEmps }); grpEmps.forEach(e => usedIds.add(e.id)); }
                          });
                          const ungrouped = empList.filter(e => !usedIds.has(e.id));
                          if (ungrouped.length > 0) grouped.push({ group: null, employees: ungrouped });

                          const sortedEmps = [];
                          grouped.forEach(({ employees: grpEmps }) => sortedEmps.push(...grpEmps));
                          
                          const sortedWSpans = {}; const sortedASpans = {};
                          if (mergeWorkplace || mergeAssignment) {
                            let cw = null, ws = 0, ca = null, as = 0;
                            sortedEmps.forEach((e, i) => {
                              const w = getFieldValue(e, 'المركز_الصحي'); const a = getFieldValue(e, 'جهة_التكليف');
                              if (mergeWorkplace) { if (w !== cw) { cw = w; ws = i; sortedWSpans[i] = 1; } else { sortedWSpans[ws]++; sortedWSpans[i] = 0; } }
                              if (mergeAssignment) { if (a !== ca) { ca = a; as = i; sortedASpans[i] = 1; } else { sortedASpans[as]++; sortedASpans[i] = 0; } }
                            });
                          }

                          const rows = [];
                          let gi = 0;
                          grouped.forEach(({ group, employees: grpEmps }) => {
                            grpEmps.forEach((emp, li) => {
                              const bg = bgFn ? bgFn(gi) : (gi % 2 === 0 ? '#fff' : '#f9fafb');
                              rows.push(
                                <tr key={emp.id} style={{ backgroundColor: bg }}>
                                  {otherCols.map(key => {
                                    if (mergeWorkplace && key === 'المركز_الصحي') {
                                      if (sortedWSpans[gi] === 0) return null;
                                      return <td key={key} rowSpan={sortedWSpans[gi]} style={getMergedCellStyle(sortedWSpans[gi], mergeWorkplaceOrientation)}>{renderMergedCellContent(getFieldValue(emp, key), sortedWSpans[gi], mergeWorkplaceOrientation)}</td>;
                                    }
                                    if (mergeAssignment && key === 'جهة_التكليف') {
                                      if (sortedASpans[gi] === 0) return null;
                                      return <td key={key} rowSpan={sortedASpans[gi]} style={getMergedCellStyle(sortedASpans[gi], mergeAssignmentOrientation)}>{renderMergedCellContent(getFieldValue(emp, key), sortedASpans[gi], mergeAssignmentOrientation)}</td>;
                                    }
                                    return <td key={key} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000' }}>{getFieldValue(emp, key)}</td>;
                                  })}
                                  {li === 0 && (
                                    <td key="فترة_التكليف" rowSpan={grpEmps.length} style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', backgroundColor: '#fff', minWidth: '80px', lineHeight: '1.6', color: '#000' }}>
                                      {(() => {
                                        if (!group) return '-';
                                        const suffix = group.dateType === 'hijri' ? 'هـ' : 'م';
                                        let text = '';
                                        if (group.periodType === 'duration') {
                                          text = <><div>{group.durationText || '...'}</div><div>اعتباراً من {group.fromDate || '...'} {suffix}</div></>;
                                        } else if (group.fromDate || group.toDate) {
                                          text = <><div>من {group.fromDate || '...'}</div><div>إلى {group.toDate || '...'} {suffix}</div></>;
                                        } else {
                                          return '-';
                                        }
                                        return (
                                          <>
                                            {text}
                                            {group.specificDays && group.specificDays.length > 0 && (
                                              <div style={{ fontSize: '10px', marginTop: '4px', color: '#4b5563' }}>(أيام: {group.specificDays.join('، ')})</div>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </td>
                                  )}
                                </tr>
                              );
                              gi++;
                            });
                          });
                          return rows;
                        };

                        if (displayMode === 'normal') {
                          return renderMergedRows(selectedEmployees);
                        } else {
                          const empRows = renderMergedRows(selectedEmployees, () => '#dbeafe');
                          const managerRows = [];
                          const processedManagers = new Set();
                          Object.entries(groupedByManager).forEach(([managerId, employeeIds]) => {
                            if (!processedManagers.has(managerId)) {
                              const manager = getManagerWithCenters(managerId, employeeIds);
                              if (manager) {
                                managerRows.push(
                                  <tr key={`mh-${managerId}`} style={{ backgroundColor: '#d1fae5' }}>
                                    <td colSpan={selectedFields.length} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                                      بيانات المدير المباشر
                                    </td>
                                  </tr>
                                );
                                managerRows.push(
                                  <tr key={`md-${managerId}`} style={{ backgroundColor: '#ecfdf5' }}>
                                    {selectedFields.map(key => (
                                      <td key={key} style={{ border: '1px solid #000', padding: '8px 16px', textAlign: 'center', color: '#000' }}>
                                        {manager[key] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                );
                                processedManagers.add(managerId);
                              }
                            }
                          });
                          return [...empRows, ...managerRows];
                        }
                      })()}
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

        {/* شاشة المعاينة */}
        <ReportPreviewDialog
          open={showPreview}
          onClose={() => setShowPreview(false)}
          onExport={() => { setShowPreview(false); exportAsReport(); }}
          logoSettings={logoSettings}
          logoPosition={logoPosition}
          reportTitle={reportTitle}
          reportNarrative={reportNarrative}
          narrativePosition={narrativePosition}
          headers={selectedFields.map(key => availableFields.find(f => f.key === key)?.label || key)}
          selectedFields={selectedFields}
          selectedEmployees={selectedEmployees}
          displayMode={displayMode}
          getFieldValue={getFieldValue}
          groupedByManager={groupedByManager}
          getManagerWithCenters={getManagerWithCenters}
          finalRequest={finalRequest}
          showSignature={showSignature}
          selectedSig={showSignature && selectedSignatureId ? signatures.find(s => s.id === selectedSignatureId) : null}
          signerName={signerName}
          signerTitle={signerTitle}
          signaturePosition={signaturePosition}
          assignmentGroups={assignmentGroups}
          splitPages={splitPages}
          fontSettings={fontSettings}
          mergeWorkplace={mergeWorkplace}
          mergeWorkplaceOrientation={mergeWorkplaceOrientation}
          mergeAssignment={mergeAssignment}
          mergeAssignmentOrientation={mergeAssignmentOrientation}
          lineStyles={lineStyles}
          setLineStyles={setLineStyles}
        />
      </div>
    </div>
  );
}