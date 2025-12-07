import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Assignment } from "@/entities/Assignment";
import { Employee } from "@/entities/Employee";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Edit, Printer, FileText, AlertCircle, Settings2, MessageCircle, Star, Save, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import FlexibleAssignmentTemplate from '../components/assignments/FlexibleAssignmentTemplate';
import StandardAssignmentTemplate from '../components/assignments/StandardAssignmentTemplate';
import MultipleAssignmentTemplate from '../components/assignments/MultipleAssignmentTemplate';
import TemplateStyleManager from '../components/assignments/TemplateStyleManager';
import { exportAssignment } from "@/functions/exportAssignment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail } from "lucide-react";

export default function ViewAssignmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [assignment, setAssignment] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeNotFound, setEmployeeNotFound] = useState(false);

  // Template mode selection
  const [templateMode, setTemplateMode] = useState('standard'); // 'standard', 'flexible', or 'multiple'
  const [multipleAssignmentsList, setMultipleAssignmentsList] = useState([]); // For multiple assignment mode
  const [multipleDecisionPoints, setMultipleDecisionPoints] = useState([]); // For multiple assignment mode

  // States for flexible template - جميع الخيارات
  const [showDurationInTable, setShowDurationInTable] = useState(true);
  const [showDurationInParagraph, setShowDurationInParagraph] = useState(true);
  const [customDurationText, setCustomDurationText] = useState('');
  const [customParagraph1, setCustomParagraph1] = useState('');
  const [customParagraph2, setCustomParagraph2] = useState('');
  const [customParagraph3, setCustomParagraph3] = useState('');
  const [customParagraph4, setCustomParagraph4] = useState('');
  const [customParagraph5, setCustomParagraph5] = useState('');
  const [customAssignmentType, setCustomAssignmentType] = useState('');
  const [customClosing, setCustomClosing] = useState('');
  const [customTitle, setCustomTitle] = useState('تكليف'); // New state for custom title
  const [customIntro, setCustomIntro] = useState(''); // New state for custom intro
  const [showNumbering, setShowNumbering] = useState(true); // إظهار/إخفاء الترقيم
  const [paragraphAlign, setParagraphAlign] = useState('right'); // محاذاة الفقرات
  const [multiplePeriods, setMultiplePeriods] = useState(false); // فترات متعددة
  const [additionalPeriods, setAdditionalPeriods] = useState([]); // الفترات الإضافية
  const [customTextBefore, setCustomTextBefore] = useState(''); // نص قبل الجدول
  const [customTextAfter, setCustomTextAfter] = useState(''); // نص بعد الختام
  const [customTextAfterPosition, setCustomTextAfterPosition] = useState({ x: 300, y: 750 }); // موقع النص الإضافي
  const [customTextAfterStyle, setCustomTextAfterStyle] = useState({ size: 14, font: 'Arial', bold: false, align: 'center' }); // تنسيق النص الإضافي
  const [syncWithStandard, setSyncWithStandard] = useState(false); // عكس التعديلات على القالب الأساسي
  const [tableLayout, setTableLayout] = useState('horizontal'); // New state for table layout
  const [customTableHeaders, setCustomTableHeaders] = useState({ // New state for custom table headers
    name: 'الاسم',
    position: 'المسمى الوظيفي',
    employeeNumber: 'الرقم الوظيفي',
    showEmployeeNumber: true, // يمكن إيقافه لاحقاً
    assignmentType: 'نوع التكليف',
    fromCenter: 'جهة العمل',
    toCenter: 'جهة التكليف',
    duration: 'مدة التكليف'
  });
  
  // خيارات الجدول الجديدة - حدود وأبعاد
  const [tableBorderWidth, setTableBorderWidth] = useState(2);
  const [tableBorderColor, setTableBorderColor] = useState('#000000');
  const [tableColumnWidths, setTableColumnWidths] = useState({});
  const [tableRowHeights, setTableRowHeights] = useState({});
  const [enableTableResize, setEnableTableResize] = useState(true);
  
  // حدود الخلايا الفردية
  const [cellBorders, setCellBorders] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellBorderPopup, setCellBorderPopup] = useState({ show: false, x: 0, y: 0 });
  const [editingCellBorder, setEditingCellBorder] = useState({ width: 1, color: '#000000', style: 'solid' });
  
  // قيم الخلايا المخصصة
  const [customCellValues, setCustomCellValues] = useState({});

  // New states for draggable signature and stamp
  const [signaturePosition, setSignaturePosition] = useState({ x: 420, y: 520 });
  const [stampPosition, setStampPosition] = useState({ x: 350, y: 600 });
  const [managerNamePosition, setManagerNamePosition] = useState({ x: 250, y: 550 });
  const [isDragging, setIsDragging] = useState(null); // 'signature', 'stamp', 'managerName', 'paragraph1', etc.
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Offset from mouse pointer to element corner
  const [stampSize, setStampSize] = useState(173); // حجم الختم (زيادة 15%)
  
  // مواقع الفقرات القابلة للسحب
  const [paragraphPositions, setParagraphPositions] = useState({
    title: { x: 0, y: 0, enabled: false },
    intro: { x: 0, y: 0, enabled: false },
    table: { x: 0, y: 0, enabled: false },
    paragraph1: { x: 0, y: 0, enabled: false },
    paragraph2: { x: 0, y: 0, enabled: false },
    paragraph3: { x: 0, y: 0, enabled: false },
    paragraph4: { x: 0, y: 0, enabled: false },
    paragraph5: { x: 0, y: 0, enabled: false },
    closing: { x: 0, y: 0, enabled: false }
  });
  const [enableParagraphDrag, setEnableParagraphDrag] = useState(false);
  
  // PDF margins control
  const [pdfMargins, setPdfMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 }); // mm
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [customHeader, setCustomHeader] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  
  // Email templates
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState('standard');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  
  // تنسيق متقدم لكل مقطع
  const [textStyles, setTextStyles] = useState({
    title: { size: 24, font: 'Arial', bold: true },
    intro: { size: 16, font: 'Arial', bold: true },
    paragraph1: { size: 16, font: 'Arial', bold: false },
    paragraph2: { size: 16, font: 'Arial', bold: false },
    paragraph3: { size: 16, font: 'Arial', bold: false },
    paragraph4: { size: 16, font: 'Arial', bold: false },
    paragraph5: { size: 16, font: 'Arial', bold: false },
    closing: { size: 16, font: 'Arial', bold: true },
    managerName: { size: 16, font: 'Arial', bold: true },
    tableHeaders: { size: 14, font: 'Arial', bold: true },
    tableData: { size: 14, font: 'Arial', bold: false }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      loadAssignment(id);
      loadDefaultTemplate(); // تحميل النمط الافتراضي للمستخدم
      loadEmailTemplates();
    } else {
      setError('معرف التكليف غير موجود في الرابط');
      setIsLoading(false);
    }
  }, [location.search]);

  const loadEmailTemplates = async () => {
    // محاولة تحميل القالب القياسي المخصص من بيانات المستخدم
    let customStandardTemplate = null;
    try {
      const user = await base44.auth.me();
      if (user.custom_standard_email_template) {
        customStandardTemplate = JSON.parse(user.custom_standard_email_template);
      }
    } catch (error) {
      console.warn('Could not load custom template:', error);
    }

    // القوالب المدمجة مباشرة
    const builtInTemplates = [
      {
        id: 'standard',
        name: 'قالب قياسي',
        template_key: 'standard',
        subject: customStandardTemplate?.subject || 'تكليف - {employee_name}',
        body: customStandardTemplate?.body || `مرفق لكم قرار تكليف الموظف / {employee_name} ({employee_position})
من {from_center} إلى {to_center}
{duration}

يرجى الاطلاع على قرار التكليف المرفق وتنفيذ القرار كل فيما يخصه.

خالص التحايا ،،،`,
        is_default: true,
        description: 'قالب بريد إلكتروني قياسي للتكاليف'
      },
      {
        id: 'formal',
        name: 'قالب رسمي',
        template_key: 'formal',
        subject: 'إشعار رسمي - تكليف',
        body: `المحترم{gender_suffix} / {employee_name}
{employee_position}

السلام عليكم ورحمة الله وبركاته،

الموضوع: تكليف للعمل في {to_center}

بناءً على الصلاحيات الممنوحة، وحسب ما تقتضيه مصلحة العمل، نحيطكم علماً بصدور قرار تكليفكم للعمل في {to_center} {duration}.

يرجى المباشرة في الموعد المحدد والتنسيق مع إدارة {to_center}.

مرفق صورة من القرار للاطلاع والعمل بموجبه.

مع خالص الشكر والتقدير،

{manager_name}`,
        description: 'قالب رسمي للتكاليف'
      },
      {
        id: 'brief',
        name: 'قالب مختصر',
        template_key: 'brief',
        subject: 'تكليف عمل - {employee_name}',
        body: `عزيز{gender_suffix} {employee_name},

تم تكليفك للعمل في {to_center} {duration}.

المباشرة: {start_date}

مرفق القرار الرسمي.

تحياتي،
إدارة شؤون المراكز الصحية`,
        description: 'قالب مختصر وسريع'
      },
      {
        id: 'holiday',
        name: 'عمل خلال إجازة',
        template_key: 'holiday',
        subject: 'تكليف عمل خلال {holiday_name} - {employee_name}',
        body: `السلام عليكم ورحمة الله وبركاته،

المحترم{gender_suffix} / {employee_name}

تحية طيبة وبعد،

نفيدكم بأنه تم تكليفكم للعمل خلال إجازة {holiday_name} في {to_center} {duration}.

مبلغ التعويض: {compensation}

يرجى المباشرة في الموعد المحدد.

مع خالص الشكر والتقدير،

مدير ادارة شؤون المراكز الصحية بقطاع الحناكية الصحي
أ/عبدالمجيد سعود الربيقي`,
        description: 'قالب للعمل خلال الإجازات الرسمية'
      },
      {
        id: 'external',
        name: 'تكليف خارجي',
        template_key: 'external',
        subject: 'تكليف خارجي - {employee_name}',
        body: `السلام عليكم ورحمة الله وبركاته،

المحترم{gender_suffix} / {employee_name}
{employee_position}

تحية طيبة وبعد،

الموضوع: تكليف خارجي للعمل في {to_center}

نفيدكم بأنه تم تكليفكم للعمل في {to_center} بصفة {assignment_type} {duration}.

يرجى التنسيق مع الجهة المكلف بها والمباشرة في الموعد المحدد.

مرفق قرار التكليف الرسمي.

مع خالص التحايا،

مدير إدارة شؤون المراكز الصحية بالحناكية
أ/عبدالمجيد سعود الربيقي`,
        description: 'قالب للتكليف الخارجي'
      }
    ];
    
    setEmailTemplates(builtInTemplates);
    setSelectedEmailTemplate('standard');
  };

  const loadDefaultTemplate = async () => {
    try {
      const user = await base44.auth.me();
      if (user.default_assignment_template) {
        const defaultTemplate = JSON.parse(user.default_assignment_template);
        
        // تطبيق النمط الافتراضي فقط إذا لم يكن التكليف يحتوي على خياراته الخاصة
        // هذا سيُطبّق قبل تحميل خيارات التكليف المحفوظة
        setShowDurationInTable(defaultTemplate.showDurationInTable ?? true);
        setShowDurationInParagraph(defaultTemplate.showDurationInParagraph ?? true);
        setCustomDurationText(defaultTemplate.customDurationText || '');
        setCustomParagraph1(defaultTemplate.customParagraph1 || '');
        setCustomParagraph2(defaultTemplate.customParagraph2 || '');
        setCustomParagraph3(defaultTemplate.customParagraph3 || '');
        setCustomParagraph4(defaultTemplate.customParagraph4 || '');
        setCustomParagraph5(defaultTemplate.customParagraph5 || '');
        setCustomAssignmentType(defaultTemplate.customAssignmentType || '');
        setCustomClosing(defaultTemplate.customClosing || '');
        setCustomTitle(defaultTemplate.customTitle || 'تكليف');
        setCustomIntro(defaultTemplate.customIntro || '');
        setShowNumbering(defaultTemplate.showNumbering ?? true);
        setParagraphAlign(defaultTemplate.paragraphAlign || 'right');
        setMultiplePeriods(defaultTemplate.multiplePeriods ?? false);
        setAdditionalPeriods(defaultTemplate.additionalPeriods || []);
        setCustomTextBefore(defaultTemplate.customTextBefore || '');
        setCustomTextAfter(defaultTemplate.customTextAfter || '');
        if (defaultTemplate.customTextAfterPosition) setCustomTextAfterPosition(defaultTemplate.customTextAfterPosition);
        if (defaultTemplate.customTextAfterStyle) setCustomTextAfterStyle(defaultTemplate.customTextAfterStyle);
        setSyncWithStandard(defaultTemplate.syncWithStandard ?? false);
        setTableLayout(defaultTemplate.tableLayout || 'horizontal');
        setCustomTableHeaders(defaultTemplate.customTableHeaders || {
          name: 'الاسم',
          position: 'المسمى الوظيفي',
          assignmentType: 'نوع التكليف',
          fromCenter: 'جهة العمل',
          toCenter: 'جهة التكليف',
          duration: 'مدة التكليف'
        });
        if (defaultTemplate.signaturePosition) setSignaturePosition(defaultTemplate.signaturePosition);
        if (defaultTemplate.stampPosition) setStampPosition(defaultTemplate.stampPosition);
        if (defaultTemplate.managerNamePosition) setManagerNamePosition(defaultTemplate.managerNamePosition);
        if (defaultTemplate.stampSize) setStampSize(defaultTemplate.stampSize);
        if (defaultTemplate.textStyles) setTextStyles(defaultTemplate.textStyles);
        
        console.log('✅ تم تحميل النمط الافتراضي للمستخدم');
      }
    } catch (error) {
      console.warn('لم يتم تحميل النمط الافتراضي:', error);
    }
  };

  const loadAssignment = async (assignmentId) => {
    if (!assignmentId) {
        setError('محاولة تحميل تكليف بمعرف غير صالح.');
        setIsLoading(false);
        return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setEmployeeNotFound(false); // Reset employeeNotFound state
      
      const assignmentData = await Assignment.get(assignmentId);
      if (!assignmentData) {
        setError('لم يتم العثور على التكليف بالمعرف المحدد');
        setIsLoading(false);
        return;
      }
      setAssignment(assignmentData);
      
      // تحميل خيارات القالب المحفوظة من التكليف أولاً
      if (assignmentData.template_options) {
        try {
          const savedOptions = JSON.parse(assignmentData.template_options);
          setShowDurationInTable(savedOptions.showDurationInTable ?? true);
          setShowDurationInParagraph(savedOptions.showDurationInParagraph ?? true);
          setCustomDurationText(savedOptions.customDurationText || '');
          setCustomParagraph1(savedOptions.customParagraph1 || '');
          setCustomParagraph2(savedOptions.customParagraph2 || '');
          setCustomParagraph3(savedOptions.customParagraph3 || '');
          setCustomParagraph4(savedOptions.customParagraph4 || '');
          setCustomParagraph5(savedOptions.customParagraph5 || '');
          setCustomAssignmentType(savedOptions.customAssignmentType || '');
          setCustomClosing(savedOptions.customClosing || '');
          setCustomTitle(savedOptions.customTitle || 'تكليف');
          setCustomIntro(savedOptions.customIntro || '');
          setShowNumbering(savedOptions.showNumbering ?? true);
          setParagraphAlign(savedOptions.paragraphAlign || 'right');
          setMultiplePeriods(savedOptions.multiplePeriods ?? false);
          setAdditionalPeriods(savedOptions.additionalPeriods || []);
          setCustomTextBefore(savedOptions.customTextBefore || '');
          setCustomTextAfter(savedOptions.customTextAfter || '');
          if (savedOptions.customTextAfterPosition) setCustomTextAfterPosition(savedOptions.customTextAfterPosition);
          if (savedOptions.customTextAfterStyle) setCustomTextAfterStyle(savedOptions.customTextAfterStyle);
          setSyncWithStandard(savedOptions.syncWithStandard ?? false);
          setTableLayout(savedOptions.tableLayout || 'horizontal');
          setCustomTableHeaders(savedOptions.customTableHeaders || {
            name: 'الاسم',
            position: 'المسمى الوظيفي',
            assignmentType: 'نوع التكليف',
            fromCenter: 'جهة العمل',
            toCenter: 'جهة التكليف',
            duration: 'مدة التكليف'
          });
          if (savedOptions.signaturePosition) {
            setSignaturePosition(savedOptions.signaturePosition);
          }
          if (savedOptions.stampPosition) {
            setStampPosition(savedOptions.stampPosition);
          }
          if (savedOptions.managerNamePosition) {
            setManagerNamePosition(savedOptions.managerNamePosition);
          }
          if (savedOptions.stampSize) {
            setStampSize(savedOptions.stampSize);
          }
          if (savedOptions.textStyles) {
            setTextStyles(savedOptions.textStyles);
          }
          if (savedOptions.tableBorderWidth !== undefined) {
            setTableBorderWidth(savedOptions.tableBorderWidth);
          }
          if (savedOptions.tableBorderColor) {
            setTableBorderColor(savedOptions.tableBorderColor);
          }
          if (savedOptions.tableColumnWidths) {
            setTableColumnWidths(savedOptions.tableColumnWidths);
          }
          if (savedOptions.tableRowHeights) {
            setTableRowHeights(savedOptions.tableRowHeights);
          }
          if (savedOptions.paragraphPositions) {
            setParagraphPositions(savedOptions.paragraphPositions);
          }
          if (savedOptions.enableParagraphDrag !== undefined) {
            setEnableParagraphDrag(savedOptions.enableParagraphDrag);
          }
          if (savedOptions.cellBorders) {
            setCellBorders(savedOptions.cellBorders);
          }
          if (savedOptions.customCellValues) {
            setCustomCellValues(savedOptions.customCellValues);
          }
          if (savedOptions.decisionPoints) {
            setMultipleDecisionPoints(savedOptions.decisionPoints);
          }

          console.log('✅ تم تحميل خيارات القالب المحفوظة من التكليف');
        } catch (e) {
          console.warn('Failed to parse template options:', e);
        }
      }

      // Handle Multiple Assignment Mode - STRICTLY enforce 'multiple' if set
      if (assignmentData.assignment_template_type === 'multiple' && assignmentData.group_id) {
        setTemplateMode('multiple');
        try {
          const siblings = await Assignment.filter({ group_id: assignmentData.group_id });
          // Map siblings to the format expected by MultipleAssignmentTemplate
          const mappedSiblings = siblings.map(sib => ({
          id: sib.id,
          name: sib.employee_name,
          national_id: sib.employee_national_id,
          employee_id: sib.employee_job_id,
          current_work: sib.from_health_center,
          assigned_work: sib.assigned_to_health_center,
            duration: sib.duration_days,
            start_date: sib.start_date ? format(new Date(sib.start_date), "yyyy-MM-dd") : '',
            end_date: sib.end_date ? format(new Date(sib.end_date), "yyyy-MM-dd") : '',
            full_duration: (sib.notes && sib.notes.startsWith('المدة: ')) ? sib.notes.replace('المدة: ', '') : null
          }));
          setMultipleAssignmentsList(mappedSiblings);
        } catch (err) {
          console.error("Failed to load sibling assignments:", err);
        }
      } else if (assignmentData.assignment_template_type === 'flexible') {
        setTemplateMode('flexible');
      } else {
        // Default to standard ONLY if not explicitly multiple
        setTemplateMode('standard');
      }
      
      // Attempt to load employee data, but don't fail if not found
      if (assignmentData.employee_record_id) {
        try {
          const employeeData = await Employee.get(assignmentData.employee_record_id);
          setEmployee(employeeData);
        } catch (empError) {
          console.warn("تعذر تحميل بيانات الموظف:", empError);
          
          // Determine if employee was not found (404) or another error
          if (empError.message?.includes('404') || (empError.response && empError.response.status === 404)) {
            setEmployeeNotFound(true);
            console.log("ℹ️ الموظف غير موجود في النظام (ربما تم حذفه أو أرشفته)، سيتم عرض التكليف بالبيانات المحفوظة");
          }
          
          // Continue without employee data - data exists in assignment itself
          setEmployee(null);
        }
      }
      
    } catch (error) {
      console.error("❌ فشل في تحميل التكليف:", error);
      if (error.message?.includes('404') || (error.response && error.response.status === 404)) {
        setError('التكليف غير موجود في النظام. قد يكون تم حذفه أو أن الرابط غير صحيح.');
      } else if (error.message?.includes('Network')) {
        setError('فشل الاتصال بالخادم. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
      } else if (error.message?.includes('500')) {
        setError('خطأ في السيرفر. يرجى المحاولة مرة أخرى بعد قليل أو الاتصال بالدعم التقني.');
      } else {
        setError(`حدث خطأ في تحميل بيانات التكليف: ${error.message || 'خطأ غير معروف'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleMultipleAssignmentsChange = (index, field, value) => {
    setMultipleAssignmentsList(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  };

  const saveMultipleAssignmentsData = async () => {
    if (!multipleAssignmentsList.length) return;
    
    if (!confirm('هل أنت متأكد من حفظ التغييرات على بيانات الموظفين في الجدول؟')) return;

    setIsLoading(true);
    try {
      const updates = multipleAssignmentsList.map(item => {
        // Map back from table fields to Entity fields if needed
        // Table: name, national_id, employee_id, current_work, assigned_work, duration, start_date, end_date
        // Entity: employee_name, employee_national_id, employee_job_id, from_health_center, assigned_to_health_center, duration_days...
        return base44.entities.Assignment.update(item.id, {
          employee_name: item.name,
          employee_national_id: item.national_id,
          employee_job_id: item.employee_id,
          from_health_center: item.current_work,
          assigned_to_health_center: item.assigned_work,
          duration_days: parseInt(item.duration) || 0,
          // We don't update dates from text easily unless we parse them, assuming basic fields for now
          // If full_duration is modified, we might save it in notes
          notes: item.full_duration ? `المدة: ${item.full_duration}` : undefined
        });
      });

      await Promise.all(updates);
      
      // Also save template options like title/intro
      const templateOptions = JSON.stringify({
        customTitle,
        customIntro,
        decisionPoints: multipleDecisionPoints,
        customClosing
      });
      await base44.entities.Assignment.update(assignment.id, { template_options: templateOptions });

      alert('✅ تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Failed to save multiple assignments:', error);
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!assignment) return;
    setIsLoading(true);
    try {
      console.log('📤 جاري تصدير التكليف مع الخيارات:', { 
        templateMode, 
        textStyles, 
        stampSize,
        signaturePosition,
        stampPosition,
        managerNamePosition
      });
      
      const response = await exportAssignment({ 
        assignmentId: assignment.id,
        templateMode,
        showDurationInTable,
        showDurationInParagraph,
        customDurationText,
        customParagraph1,
        customParagraph2,
        customParagraph3,
        customParagraph4,
        customParagraph5,
        customAssignmentType,
        customClosing,
        customTitle,
        customIntro, // Pass customIntro for single templates as well if needed, but definitely for multiple
        decisionPoints: multipleDecisionPoints, // Pass decision points for multiple template
        tableLayout,
        customTableHeaders,
        signaturePosition,
        stampPosition,
        managerNamePosition,
        stampSize,
        textStyles,
        pdfMargins,
        showHeaderFooter,
        customHeader,
        customFooter
      });

      if (response.data && response.data.success) {
        const { html_content } = response.data;
        
        const printWindow = window.open('', '_blank');
        
        if (printWindow && printWindow.document) {
          printWindow.document.write(html_content);
          printWindow.document.close();
          
          // انتظر تحميل الصور قبل الطباعة
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 1500);
        } else {
          console.warn('Pop-up blocked, using alternative method');
          
          const blob = new Blob([html_content], { type: 'text/html;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const safeFilename = `قرار_تكليف_${(assignment.employee_name || 'unknown').replace(/[\s/\\?%*:"|<>]/g, '_')}.html`;
          link.download = safeFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          alert('تم تحميل الملف بصيغة HTML. يمكنك فتحه والطباعة منه أو حفظه كـ PDF من المتصفح.');
        }

        // Save copy to employee file automatically
        // TODO: Add logic here to create EmployeeDocument using the generated file URL if available, 
        // or prompt user that it's ready to print.
        // Since we are generating on the fly for print, we might not have a stored URL yet.
        // To save to employee file, we'd ideally use html2pdf or backend pdf generation that returns a URL.
        // Current implementation returns HTML content.

      } else {
        throw new Error('فشل تحميل محتوى التقرير للتصدير.');
      }

    } catch (error) {
      console.error('Export error:', error);
      alert(`فشل في تصدير التكليف: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToWord = async () => {
    if (!assignment) return;
    setIsLoading(true);
    try {
      const response = await exportAssignment({ 
        assignmentId: assignment.id, 
        format: 'word',
        templateMode,
        showDurationInTable,
        showDurationInParagraph,
        customDurationText,
        customParagraph1,
        customParagraph2,
        customParagraph3,
        customParagraph4,
        customParagraph5,
        customAssignmentType,
        customClosing,
        customTitle,
        tableLayout,
        customTableHeaders,
        signaturePosition,
        stampPosition,
        managerNamePosition,
        stampSize,
        textStyles,
        pdfMargins,
        showHeaderFooter,
        customHeader,
        customFooter
      });
      
      if (response.data && response.data.success) {
        const blob = new Blob(['\ufeff' + response.data.html_content], { type: 'application/msword;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeFilename = `قرار_تكليف_${assignment.employee_name || 'غير_معرف'}.doc`.replace(/[\s/\\?%*:"|<>]/g, '_');
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('فشل تحميل محتوى Word');
      }
    } catch (error) {
      console.error('خطأ في تصدير ملف Word:', error);
      alert('حدث خطأ في تصدير الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const replaceVariables = (text) => {
    if (!text || !assignment) return text;
    
    const isFemale = assignment.gender === 'أنثى';
    const variables = {
      '{employee_name}': assignment.employee_name || '',
      '{employee_position}': assignment.employee_position || '',
      '{from_center}': assignment.from_health_center || '',
      '{to_center}': assignment.assigned_to_health_center || '',
      '{start_date}': assignment.start_date ? format(new Date(assignment.start_date), 'dd/MM/yyyy') : '',
      '{end_date}': assignment.end_date ? format(new Date(assignment.end_date), 'dd/MM/yyyy') : '',
      '{duration}': getSingleLineDurationText(),
      '{assignment_type}': customAssignmentType || assignment.assignment_type || 'تكليف داخلي',
      '{holiday_name}': assignment.holiday_name || '',
      '{compensation}': assignment.compensation_amount ? `${assignment.compensation_amount} ريال` : '',
      '{manager_name}': 'مدير إدارة شؤون المراكز الصحية بالحناكية\nأ/عبدالمجيد سعود الربيقي',
      '{gender_suffix}': isFemale ? 'ة' : ''
    };

    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    return result;
  };

  const getProcessedTemplates = () => {
    return emailTemplates.map(template => ({
      ...template,
      subject: replaceVariables(template.subject),
      body: replaceVariables(template.body)
    }));
  };

  const getSingleLineDurationText = () => {
    if (customDurationText) {
      return customDurationText.replace(/<br\s*\/?>/gi, ' ');
    }
    
    const days = assignment.duration_days;
    if (!days) return '';
    const formattedStartDate = assignment.start_date ? format(new Date(assignment.start_date), "dd-MM-yyyy") : '';
    const formattedEndDate = assignment.end_date ? format(new Date(assignment.end_date), "dd-MM-yyyy") : '';
    const startDayName = assignment.start_date ? format(new Date(assignment.start_date), 'EEEE', { locale: ar }) : '';
    const endDayName = assignment.end_date ? format(new Date(assignment.end_date), 'EEEE', { locale: ar }) : '';
    
    if (days === 1) return `لمدة يوم واحد والموافق يوم ${startDayName} ${formattedStartDate}م`;
    if (days === 2) return `لمدة يومين، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    if (days >= 3 && days <= 10) return `لمدة ${days} أيام، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
    return `لمدة ${days} يوم، اعتباراً من ${startDayName} ${formattedStartDate}م حتى ${endDayName} ${formattedEndDate}م`;
  };

  const handleExportAsEmail = () => {
    if (!assignment) return;
    setShowEmailDialog(true);
  };

  const sendEmail = () => {
    const processedTemplates = getProcessedTemplates();
    let emailData;
    
    if (selectedEmailTemplate === 'custom') {
      emailData = {
        subject: replaceVariables(`${customTitle || 'تكليف'} - ${assignment.employee_name || ''}`),
        body: replaceVariables(customEmailBody)
      };
    } else {
      const template = processedTemplates.find(t => t.template_key === selectedEmailTemplate);
      if (template) {
        emailData = {
          subject: template.subject,
          body: template.body
        };
      }
    }
    
    if (!emailData) {
      alert('القالب غير موجود');
      return;
    }
    
    const mailtoLink = `mailto:${employee?.email || ''}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
    setShowEmailDialog(false);
  };

  const handleSendWhatsApp = async () => {
    if (!assignment || !employee) {
      alert('بيانات الموظف غير متوفرة');
      return;
    }

    // تطبيع رقم الهاتف
    const normalizePhone = (phone) => {
      if (!phone) return '';
      const digits = String(phone).replace(/\D/g, '');
      if (digits.startsWith('966')) return digits;
      if (digits.startsWith('00')) return digits.slice(2);
      if (digits.startsWith('0')) return '966' + digits.slice(1);
      if (digits.length === 9) return '966' + digits; // Assuming KSA 9-digit format starting with 5
      return digits;
    };

    const phone = employee?.phone || assignment.employee_phone;
    if (!phone) {
      alert('رقم هاتف الموظف غير متوفر');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    const message = `
السلام عليكم ${assignment.employee_name || ''},

نفيدكم بأنه تم تكليفكم للعمل في ${assignment.assigned_to_health_center || 'المركز المحدد'}
للفترة من ${assignment.start_date ? format(new Date(assignment.start_date), 'dd/MM/yyyy') : ''} إلى ${assignment.end_date ? format(new Date(assignment.end_date), 'dd/MM/yyyy') : ''}

يمكنكم الاطلاع على خطاب التكليف الرسمي من خلال ملفكم في النظام.

مع أطيب التحيات،
إدارة شؤون المراكز الصحية بالحناكية
    `.trim();

    const waUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Dragging handlers
  const handleMouseDown = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // حساب المسافة بين الماوس ومركز العنصر
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(type);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const container = document.querySelector('.flexible-draggable-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    
    // حساب الموضع الجديد بالنسبة للـ container مباشرة
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    if (isDragging === 'managerName') {
      setManagerNamePosition({ x: newX, y: newY });
    } else if (isDragging === 'signature') {
      setSignaturePosition({ x: newX, y: newY });
    } else if (isDragging === 'stamp') {
      setStampPosition({ x: newX, y: newY });
    } else if (isDragging === 'customTextAfter') {
      setCustomTextAfterPosition({ x: newX, y: newY });
    } else if (isDragging && isDragging.startsWith('para_')) {
      const paraKey = isDragging.replace('para_', '');
      setParagraphPositions(prev => ({
        ...prev,
        [paraKey]: { ...prev[paraKey], x: newX, y: newY, enabled: true }
      }));
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handleMouseMove(e);
      const handleUp = (e) => handleMouseUp(e);
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (isLoading) return <div className="p-6 text-center text-lg">جاري تحميل التكليف...</div>;
  
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">خطأ في التحميل</h3>
                <div className="mt-2 text-sm text-red-700"><p>{error}</p></div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Button onClick={() => loadAssignment(new URLSearchParams(location.search).get('id'))} className="bg-red-100 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 mr-2">إعادة المحاولة</Button>
                    <Button onClick={() => navigate(createPageUrl("Assignments"))} className="bg-red-100 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200">العودة للتكاليف</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!assignment) return <div className="p-6 text-center text-lg">لم يتم العثور على بيانات التكليف</div>;

  return (
    <div className="relative py-8 print:py-0" dir="rtl">
        <style>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            .print-container {
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .draggable-item {
              cursor: default !important;
            }
            .bg-gray-200 {
              background: white !important;
              padding: 0 !important;
            }
          }
          .print-only {
            display: none;
          }
          .draggable-item {
            cursor: grab;
            user-select: none;
            z-index: 100;
            touch-action: none;
            position: absolute;
          }
          .draggable-item:active {
            cursor: grabbing;
            z-index: 200;
          }
          .draggable-item img {
            pointer-events: none;
            user-select: none;
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
          }
          .flexible-draggable-container {
            position: relative;
          }
        `}</style>
        {/* Floating Controls */}
        <div className="no-print absolute top-10 right-10 z-10 flex flex-col gap-3 items-end max-h-[80vh] overflow-y-auto">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-wrap gap-2">
                 <Button onClick={() => navigate(createPageUrl(`EditAssignment?id=${assignment.id}`))}>
                    <Edit className="w-4 h-4 ml-2" />تعديل
                </Button>
                {(!assignment.approval_status || assignment.approval_status === 'draft') && (
                  <Button 
                    onClick={async () => {
                      if (confirm('هل أنت متأكد من اعتماد هذا القرار؟ سيصبح القرار رسمياً ولن يمكن التعديل عليه إلا بعد تأكيد خاص.')) {
                        try {
                          const user = await base44.auth.me();
                          
                          if (templateMode === 'multiple' && multipleAssignmentsList.length > 0) {
                            // Approve ALL assignments in the group
                            await Promise.all(multipleAssignmentsList.map(item => 
                              base44.entities.Assignment.update(item.id, {
                                approval_status: 'approved',
                                approved_date: new Date().toISOString(),
                                approved_by: user.email
                              })
                            ));
                            alert(`✅ تم اعتماد ${multipleAssignmentsList.length} قرارات في المجموعة بنجاح`);
                          } else {
                            await base44.entities.Assignment.update(assignment.id, {
                              approval_status: 'approved',
                              approved_date: new Date().toISOString(),
                              approved_by: user.email
                            });
                            alert('✅ تم اعتماد القرار بنجاح');
                          }
                          window.location.reload();
                        } catch (error) {
                          alert('فشل في اعتماد القرار: ' + error.message);
                        }
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />اعتماد
                  </Button>
                )}
                <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    <FileText className="w-4 h-4 ml-2" />
                    {isLoading ? "..." : "PDF وحفظ"}
                </Button>
                <Button onClick={handleExportToWord} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    <Download className="w-4 h-4 ml-2" />Word
                </Button>
                <Button onClick={handleExportAsEmail} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    <MessageCircle className="w-4 h-4 ml-2" />بريد
                </Button>
                <Button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700">
                    <Printer className="w-4 h-4 ml-2" />طباعة
                </Button>
                <Button onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 ml-2" />واتساب
                </Button>
            </div>
            <div className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                <Button variant="outline" onClick={() => navigate(createPageUrl("Assignments"))}>
                    <ArrowRight className="w-4 h-4 ml-2" />
                    العودة لقائمة التكاليف
                </Button>
            </div>
            
            {/* Template Mode Selection - Hide if Multiple */}
            {templateMode !== 'multiple' && (
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                <h4 className="text-sm font-bold text-center border-b pb-2 mb-2">نوع القالب</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={templateMode === 'standard' ? 'default' : 'outline'}
                    onClick={() => setTemplateMode('standard')}
                  >
                    القالب الأساسي
                  </Button>
                  <Button
                    size="sm"
                    variant={templateMode === 'flexible' ? 'default' : 'outline'}
                    onClick={() => setTemplateMode('flexible')}
                  >
                    القالب المرن
                  </Button>
                </div>
                
                {/* مدير أنماط القالب القياسي */}
                {templateMode === 'standard' && (
                  <div className="mt-3 pt-3 border-t">
                    <Label className="text-xs font-bold block mb-2">📁 أنماط القالب القياسي</Label>
                    <TemplateStyleManager
                      templateType="standard"
                      currentStyleData={{
                        signaturePosition,
                        stampPosition,
                        managerNamePosition,
                        stampSize,
                        textStyles,
                        syncWithStandard,
                        showNumbering,
                        paragraphAlign,
                        customTitle,
                        customIntro,
                        customParagraph1,
                        customParagraph2,
                        customParagraph3,
                        customParagraph4,
                        customParagraph5,
                        customClosing,
                        customTextAfter,
                        customTextAfterPosition,
                        customTextAfterStyle,
                        showDurationInParagraph,
                        multiplePeriods,
                        additionalPeriods
                      }}
                      onLoadStyle={(styleData) => {
                        if (styleData.signaturePosition) setSignaturePosition(styleData.signaturePosition);
                        if (styleData.stampPosition) setStampPosition(styleData.stampPosition);
                        if (styleData.managerNamePosition) setManagerNamePosition(styleData.managerNamePosition);
                        if (styleData.stampSize !== undefined) setStampSize(styleData.stampSize);
                        if (styleData.textStyles) setTextStyles(styleData.textStyles);
                        if (styleData.syncWithStandard !== undefined) setSyncWithStandard(styleData.syncWithStandard);
                        if (styleData.showNumbering !== undefined) setShowNumbering(styleData.showNumbering);
                        if (styleData.paragraphAlign !== undefined) setParagraphAlign(styleData.paragraphAlign);
                        if (styleData.customTitle !== undefined) setCustomTitle(styleData.customTitle);
                        if (styleData.customIntro !== undefined) setCustomIntro(styleData.customIntro);
                        if (styleData.customParagraph1 !== undefined) setCustomParagraph1(styleData.customParagraph1);
                        if (styleData.customParagraph2 !== undefined) setCustomParagraph2(styleData.customParagraph2);
                        if (styleData.customParagraph3 !== undefined) setCustomParagraph3(styleData.customParagraph3);
                        if (styleData.customParagraph4 !== undefined) setCustomParagraph4(styleData.customParagraph4);
                        if (styleData.customParagraph5 !== undefined) setCustomParagraph5(styleData.customParagraph5);
                        if (styleData.customClosing !== undefined) setCustomClosing(styleData.customClosing);
                        if (styleData.customTextAfter !== undefined) setCustomTextAfter(styleData.customTextAfter);
                        if (styleData.customTextAfterPosition) setCustomTextAfterPosition(styleData.customTextAfterPosition);
                        if (styleData.customTextAfterStyle) setCustomTextAfterStyle(styleData.customTextAfterStyle);
                        if (styleData.showDurationInParagraph !== undefined) setShowDurationInParagraph(styleData.showDurationInParagraph);
                        if (styleData.multiplePeriods !== undefined) setMultiplePeriods(styleData.multiplePeriods);
                        if (styleData.additionalPeriods !== undefined) setAdditionalPeriods(styleData.additionalPeriods);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
              {templateMode === 'standard' && (
                <div className="mt-3 pt-3 border-t">
                  <Label className="text-xs font-bold block mb-2">📁 أنماط القالب القياسي</Label>
                  <TemplateStyleManager
                    templateType="standard"
                    currentStyleData={{
                      signaturePosition,
                      stampPosition,
                      managerNamePosition,
                      stampSize,
                      textStyles,
                      syncWithStandard,
                      showNumbering,
                      paragraphAlign,
                      customTitle,
                      customIntro,
                      customParagraph1,
                      customParagraph2,
                      customParagraph3,
                      customParagraph4,
                      customParagraph5,
                      customClosing,
                      customTextAfter,
                      customTextAfterPosition,
                      customTextAfterStyle,
                      showDurationInParagraph,
                      multiplePeriods,
                      additionalPeriods
                    }}
                    onLoadStyle={(styleData) => {
                      if (styleData.signaturePosition) setSignaturePosition(styleData.signaturePosition);
                      if (styleData.stampPosition) setStampPosition(styleData.stampPosition);
                      if (styleData.managerNamePosition) setManagerNamePosition(styleData.managerNamePosition);
                      if (styleData.stampSize !== undefined) setStampSize(styleData.stampSize);
                      if (styleData.textStyles) setTextStyles(styleData.textStyles);
                      if (styleData.syncWithStandard !== undefined) setSyncWithStandard(styleData.syncWithStandard);
                      if (styleData.showNumbering !== undefined) setShowNumbering(styleData.showNumbering);
                      if (styleData.paragraphAlign !== undefined) setParagraphAlign(styleData.paragraphAlign);
                      if (styleData.customTitle !== undefined) setCustomTitle(styleData.customTitle);
                      if (styleData.customIntro !== undefined) setCustomIntro(styleData.customIntro);
                      if (styleData.customParagraph1 !== undefined) setCustomParagraph1(styleData.customParagraph1);
                      if (styleData.customParagraph2 !== undefined) setCustomParagraph2(styleData.customParagraph2);
                      if (styleData.customParagraph3 !== undefined) setCustomParagraph3(styleData.customParagraph3);
                      if (styleData.customParagraph4 !== undefined) setCustomParagraph4(styleData.customParagraph4);
                      if (styleData.customParagraph5 !== undefined) setCustomParagraph5(styleData.customParagraph5);
                      if (styleData.customClosing !== undefined) setCustomClosing(styleData.customClosing);
                      if (styleData.customTextAfter !== undefined) setCustomTextAfter(styleData.customTextAfter);
                      if (styleData.customTextAfterPosition) setCustomTextAfterPosition(styleData.customTextAfterPosition);
                      if (styleData.customTextAfterStyle) setCustomTextAfterStyle(styleData.customTextAfterStyle);
                      if (styleData.showDurationInParagraph !== undefined) setShowDurationInParagraph(styleData.showDurationInParagraph);
                      if (styleData.multiplePeriods !== undefined) setMultiplePeriods(styleData.multiplePeriods);
                      if (styleData.additionalPeriods !== undefined) setAdditionalPeriods(styleData.additionalPeriods);
                    }}
                  />
                </div>
              )}

            {/* Flexible Template Controls - Now in sidebar */}
                    {templateMode === 'flexible' && (
                      <div className="fixed left-4 top-20 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden">
                        <h4 className="text-sm font-bold text-center border-b pb-2 p-3 bg-gray-50 sticky top-0">
                          <Settings2 className="w-4 h-4 inline ml-1" />
                          خيارات التحكم الكاملة
                        </h4>
                
                {/* مدير الأنماط */}
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-xs font-bold text-blue-800 block mb-2">📁 أنماط القوالب المحفوظة</Label>
                  <TemplateStyleManager
                    templateType="flexible"
                    currentStyleData={{
                      showDurationInTable,
                      showDurationInParagraph,
                      customDurationText,
                      customParagraph1,
                      customParagraph2,
                      customParagraph3,
                      customParagraph4,
                      customParagraph5,
                      customAssignmentType,
                      customClosing,
                      customTitle,
                      customIntro,
                      showNumbering,
                      paragraphAlign,
                      multiplePeriods,
                      additionalPeriods,
                      customTextBefore,
                      customTextAfter,
                      customTextAfterPosition,
                      customTextAfterStyle,
                      syncWithStandard,
                      tableLayout,
                      customTableHeaders,
                      signaturePosition,
                      stampPosition,
                      managerNamePosition,
                      stampSize,
                      textStyles,
                      tableBorderWidth,
                      tableBorderColor,
                      tableColumnWidths,
                      tableRowHeights,
                      paragraphPositions,
                      enableParagraphDrag,
                      cellBorders,
                      customCellValues
                    }}
                    onLoadStyle={(styleData) => {
                      // تحميل جميع الإعدادات من النمط
                      if (styleData.showDurationInTable !== undefined) setShowDurationInTable(styleData.showDurationInTable);
                      if (styleData.showDurationInParagraph !== undefined) setShowDurationInParagraph(styleData.showDurationInParagraph);
                      if (styleData.customDurationText !== undefined) setCustomDurationText(styleData.customDurationText);
                      if (styleData.customParagraph1 !== undefined) setCustomParagraph1(styleData.customParagraph1);
                      if (styleData.customParagraph2 !== undefined) setCustomParagraph2(styleData.customParagraph2);
                      if (styleData.customParagraph3 !== undefined) setCustomParagraph3(styleData.customParagraph3);
                      if (styleData.customParagraph4 !== undefined) setCustomParagraph4(styleData.customParagraph4);
                      if (styleData.customParagraph5 !== undefined) setCustomParagraph5(styleData.customParagraph5);
                      if (styleData.customAssignmentType !== undefined) setCustomAssignmentType(styleData.customAssignmentType);
                      if (styleData.customClosing !== undefined) setCustomClosing(styleData.customClosing);
                      if (styleData.customTitle !== undefined) setCustomTitle(styleData.customTitle);
                      if (styleData.customIntro !== undefined) setCustomIntro(styleData.customIntro);
                      if (styleData.showNumbering !== undefined) setShowNumbering(styleData.showNumbering);
                      if (styleData.paragraphAlign !== undefined) setParagraphAlign(styleData.paragraphAlign);
                      if (styleData.multiplePeriods !== undefined) setMultiplePeriods(styleData.multiplePeriods);
                      if (styleData.additionalPeriods !== undefined) setAdditionalPeriods(styleData.additionalPeriods);
                      if (styleData.customTextBefore !== undefined) setCustomTextBefore(styleData.customTextBefore);
                      if (styleData.customTextAfter !== undefined) setCustomTextAfter(styleData.customTextAfter);
                      if (styleData.customTextAfterPosition) setCustomTextAfterPosition(styleData.customTextAfterPosition);
                      if (styleData.customTextAfterStyle) setCustomTextAfterStyle(styleData.customTextAfterStyle);
                      if (styleData.syncWithStandard !== undefined) setSyncWithStandard(styleData.syncWithStandard);
                      if (styleData.tableLayout !== undefined) setTableLayout(styleData.tableLayout);
                      if (styleData.customTableHeaders) setCustomTableHeaders(styleData.customTableHeaders);
                      if (styleData.signaturePosition) setSignaturePosition(styleData.signaturePosition);
                      if (styleData.stampPosition) setStampPosition(styleData.stampPosition);
                      if (styleData.managerNamePosition) setManagerNamePosition(styleData.managerNamePosition);
                      if (styleData.stampSize !== undefined) setStampSize(styleData.stampSize);
                      if (styleData.textStyles) setTextStyles(styleData.textStyles);
                      if (styleData.tableBorderWidth !== undefined) setTableBorderWidth(styleData.tableBorderWidth);
                      if (styleData.tableBorderColor) setTableBorderColor(styleData.tableBorderColor);
                      if (styleData.tableColumnWidths) setTableColumnWidths(styleData.tableColumnWidths);
                      if (styleData.tableRowHeights) setTableRowHeights(styleData.tableRowHeights);
                      if (styleData.paragraphPositions) setParagraphPositions(styleData.paragraphPositions);
                      if (styleData.enableParagraphDrag !== undefined) setEnableParagraphDrag(styleData.enableParagraphDrag);
                      if (styleData.cellBorders) setCellBorders(styleData.cellBorders);
                      if (styleData.customCellValues) setCustomCellValues(styleData.customCellValues);
                    }}
                  />
                </div>
                
                {/* أزرار الحفظ */}
                <div className="flex gap-2 mb-3">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const templateOptions = JSON.stringify({
                          showDurationInTable,
                          showDurationInParagraph,
                          customDurationText,
                          customParagraph1,
                          customParagraph2,
                          customParagraph3,
                          customParagraph4,
                          customParagraph5,
                          customAssignmentType,
                          customClosing,
                          customTitle,
                          customIntro,
                          showNumbering,
                          customTextBefore,
                          customTextAfter,
                          customTextAfterPosition,
                          customTextAfterStyle,
                          syncWithStandard,
                          tableLayout,
                          customTableHeaders,
                          signaturePosition,
                          stampPosition,
                          managerNamePosition,
                          stampSize,
                          textStyles,
                          tableBorderWidth,
                          tableBorderColor,
                          tableColumnWidths,
                          tableRowHeights,
                          paragraphPositions,
                          enableParagraphDrag,
                          cellBorders,
                          customCellValues
                          });

                          await base44.entities.Assignment.update(assignment.id, { template_options: templateOptions });
                          alert('✅ تم حفظ التعديلات على هذا التكليف');
                      } catch (error) {
                        console.error('Error saving:', error);
                        alert('حدث خطأ أثناء الحفظ');
                      }
                    }}
                    className="h-8 text-xs gap-1"
                  >
                    <Save className="w-3 h-3" />
                    حفظ لهذا التكليف
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const defaultTemplate = {
                          showDurationInTable,
                          showDurationInParagraph,
                          customDurationText,
                          customParagraph1,
                          customAssignmentType,
                          customParagraph2,
                          customParagraph3,
                          customParagraph4,
                          customParagraph5,
                          customClosing,
                          customTitle,
                          customIntro,
                          showNumbering,
                          paragraphAlign,
                          multiplePeriods,
                          additionalPeriods,
                          customTextBefore,
                          customTextAfter,
                          customTextAfterPosition,
                          customTextAfterStyle,
                          syncWithStandard,
                          tableLayout,
                          customTableHeaders,
                          signaturePosition,
                          stampPosition,
                          managerNamePosition,
                          stampSize,
                          textStyles
                        };
                        
                        const user = await base44.auth.me();
                        await base44.auth.updateMe({ 
                          default_assignment_template: JSON.stringify(defaultTemplate) 
                        });
                        alert('✅ تم حفظ هذا النمط كافتراضي للتكاليف المستقبلية');
                      } catch (error) {
                        alert('حدث خطأ أثناء الحفظ: ' + error.message);
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    💾 حفظ التعديلات
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const defaultTemplate = {
                          showDurationInTable,
                          showDurationInParagraph,
                          customDurationText,
                          customParagraph1,
                          customParagraph2,
                          customParagraph3,
                          customParagraph4,
                          customParagraph5,
                          customAssignmentType,
                          customClosing,
                          customTitle,
                          customIntro,
                          showNumbering,
                          customTextBefore,
                          customTextAfter,
                          customTextAfterPosition,
                          customTextAfterStyle,
                          syncWithStandard,
                          tableLayout,
                          customTableHeaders,
                          signaturePosition,
                          stampPosition,
                          managerNamePosition,
                          stampSize,
                          textStyles
                        };
                        
                        const user = await base44.auth.me();
                        await base44.auth.updateMe({ 
                          default_assignment_template: JSON.stringify(defaultTemplate) 
                        });
                        alert('✅ تم حفظ هذا النمط كافتراضي للتكاليف المستقبلية');
                      } catch (error) {
                        alert('حدث خطأ: ' + error.message);
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ⭐ حفظ كنمط افتراضي
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div>
                    <Label htmlFor="customTitle" className="text-xs font-bold">عنوان الخطاب:</Label>
                    <Textarea
                      id="customTitle"
                      placeholder="مثال: تكليف"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="text-xs h-12 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customIntro" className="text-xs font-bold">نص المقدمة:</Label>
                    <Textarea
                      id="customIntro"
                      placeholder="إن مدير شؤون المراكز الصحية بالحناكية وبناءً على الصلاحيات الممنوحة له نظاماً..."
                      value={customIntro}
                      onChange={(e) => setCustomIntro(e.target.value)}
                      className="text-xs h-20 resize-none mt-1"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">اتركه فارغاً لاستخدام النص الافتراضي</p>
                  </div>

                  <div>
                    <Label htmlFor="customTextBefore" className="text-xs font-bold">نص إضافي قبل الجدول:</Label>
                    <Textarea
                      id="customTextBefore"
                      placeholder="أدخل أي نص تريد إضافته قبل الجدول..."
                      value={customTextBefore}
                      onChange={(e) => setCustomTextBefore(e.target.value)}
                      className="text-xs h-16 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold block mb-2">طريقة عرض الجدول:</Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={tableLayout === 'horizontal' ? 'default' : 'outline'}
                        onClick={() => setTableLayout('horizontal')}
                        className="flex-1"
                      >
                        عرضي
                      </Button>
                      <Button
                        size="sm"
                        variant={tableLayout === 'vertical' ? 'default' : 'outline'}
                        onClick={() => setTableLayout('vertical')}
                        className="flex-1"
                      >
                        طولي
                      </Button>
                    </div>
                  </div>

                  {/* Table Border & Resize Settings */}
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 space-y-3">
                    <Label className="text-xs font-bold text-orange-800 block">⚙️ إعدادات حدود الجدول</Label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px]">سمك الحدود (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={tableBorderWidth}
                          onChange={(e) => setTableBorderWidth(parseInt(e.target.value) || 1)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">لون الحدود</Label>
                        <Input
                          type="color"
                          value={tableBorderColor}
                          onChange={(e) => setTableBorderColor(e.target.value)}
                          className="h-7 w-full cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="enableTableResize" 
                        checked={enableTableResize} 
                        onCheckedChange={setEnableTableResize} 
                      />
                      <Label htmlFor="enableTableResize" className="cursor-pointer text-xs">
                        تمكين سحب حدود الجدول لتغيير الأبعاد
                      </Label>
                    </div>
                    
                    {enableTableResize && (
                      <p className="text-[10px] text-orange-600">
                        💡 اسحب حدود الأعمدة والصفوف في المعاينة لتغيير أبعادها
                      </p>
                    )}
                    
                    {Object.keys(tableColumnWidths).length > 0 || Object.keys(tableRowHeights).length > 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTableColumnWidths({});
                          setTableRowHeights({});
                        }}
                        className="h-7 text-xs w-full"
                      >
                        إعادة ضبط أبعاد الجدول
                      </Button>
                    ) : null}
                    
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-[10px] text-blue-700 font-semibold mb-1">🖱️ تخصيص حدود الخلايا:</p>
                      <p className="text-[10px] text-blue-600">اضغط على أي خلية في الجدول لتخصيص حدودها بشكل منفرد</p>
                    </div>
                    
                    {Object.keys(cellBorders).length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCellBorders({})}
                        className="h-7 text-xs w-full mt-2"
                      >
                        إعادة ضبط حدود الخلايا
                      </Button>
                    )}
                  </div>

                  {/* Custom Table Headers Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="headerName" className="text-xs">عنوان خانة الاسم</Label>
                      <Input
                        id="headerName"
                        value={customTableHeaders.name}
                        onChange={(e) => setCustomTableHeaders(prev => ({
                          ...prev, 
                          name: e.target.value
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                        <Label htmlFor="headerPosition" className="text-xs">عنوان خانة المسمى الوظيفي</Label>
                        <Input
                          id="headerPosition"
                          value={customTableHeaders.position}
                          onChange={(e) => setCustomTableHeaders(prev => ({
                            ...prev, 
                            position: e.target.value
                          }))}
                          className="text-xs h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="headerEmployeeNumber" className="text-xs">عنوان خانة الرقم الوظيفي</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="headerEmployeeNumber"
                            value={customTableHeaders.employeeNumber}
                            onChange={(e) => setCustomTableHeaders(prev => ({
                              ...prev, 
                              employeeNumber: e.target.value
                            }))}
                            className="text-xs h-8 flex-1"
                          />
                          <label className="flex items-center gap-1 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={customTableHeaders.showEmployeeNumber !== false}
                              onChange={(e) => setCustomTableHeaders(prev => ({
                                ...prev,
                                showEmployeeNumber: e.target.checked
                              }))}
                              className="w-4 h-4"
                            />
                            إظهار
                          </label>
                        </div>
                      </div>
                      <div>
                      <Label htmlFor="headerAssignmentType" className="text-xs">عنوان خانة نوع التكليف</Label>
                      <Input
                        id="headerAssignmentType"
                        value={customTableHeaders.assignmentType}
                        onChange={(e) => setCustomTableHeaders(prev => ({
                          ...prev, 
                          assignmentType: e.target.value
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="headerFromCenter" className="text-xs">عنوان خانة جهة العمل</Label>
                      <Input
                        id="headerFromCenter"
                        value={customTableHeaders.fromCenter}
                        onChange={(e) => setCustomTableHeaders(prev => ({
                          ...prev, 
                          fromCenter: e.target.value
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="headerToCenter" className="text-xs">عنوان خانة جهة التكليف</Label>
                      <Input
                        id="headerToCenter"
                        value={customTableHeaders.toCenter}
                        onChange={(e) => setCustomTableHeaders(prev => ({
                          ...prev, 
                          toCenter: e.target.value
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="headerDuration" className="text-xs">عنوان خانة مدة التكليف</Label>
                      <Input
                        id="headerDuration"
                        value={customTableHeaders.duration}
                        onChange={(e) => setCustomTableHeaders(prev => ({
                          ...prev, 
                          duration: e.target.value
                        }))}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox id="showTableDuration" checked={showDurationInTable} onCheckedChange={setShowDurationInTable} />
                      <Label htmlFor="showTableDuration" className="cursor-pointer text-sm">إظهار المدة في الجدول</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox id="showParaDuration" checked={showDurationInParagraph} onCheckedChange={setShowDurationInParagraph} />
                      <Label htmlFor="showParaDuration" className="cursor-pointer text-sm">إظهار المدة في الفقرة ١</Label>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox id="showNumbering" checked={showNumbering} onCheckedChange={setShowNumbering} />
                      <Label htmlFor="showNumbering" className="cursor-pointer text-sm">إظهار ترقيم الفقرات (١- ٢- ...)</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-sm">محاذاة الفقرات:</Label>
                      <select
                        value={paragraphAlign}
                        onChange={(e) => setParagraphAlign(e.target.value)}
                        className="h-8 text-xs border rounded px-2"
                      >
                        <option value="right">يمين</option>
                        <option value="center">وسط</option>
                        <option value="left">يسار</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse col-span-2">
                      <Checkbox id="syncWithStandard" checked={syncWithStandard} onCheckedChange={setSyncWithStandard} />
                      <Label htmlFor="syncWithStandard" className="cursor-pointer text-sm">🔄 عكس التعديلات على القالب الأساسي</Label>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse col-span-2">
                      <Checkbox id="multiplePeriods" checked={multiplePeriods} onCheckedChange={setMultiplePeriods} />
                      <Label htmlFor="multiplePeriods" className="cursor-pointer text-sm">📅 فترات تكليف متعددة</Label>
                    </div>
                  </div>

                  {/* فترات التكليف المتعددة */}
                  {multiplePeriods && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-bold text-blue-800">فترات التكليف الإضافية:</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setAdditionalPeriods([...additionalPeriods, { start_date: '', end_date: '' }])}
                          className="h-7 text-xs"
                        >
                          + إضافة فترة
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {additionalPeriods.map((period, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                            <span className="text-xs text-gray-600">فترة {index + 2}:</span>
                            <Input
                              type="date"
                              value={period.start_date}
                              onChange={(e) => {
                                const newPeriods = [...additionalPeriods];
                                newPeriods[index].start_date = e.target.value;
                                setAdditionalPeriods(newPeriods);
                              }}
                              className="h-7 text-xs flex-1"
                            />
                            <span className="text-xs">إلى</span>
                            <Input
                              type="date"
                              value={period.end_date}
                              onChange={(e) => {
                                const newPeriods = [...additionalPeriods];
                                newPeriods[index].end_date = e.target.value;
                                setAdditionalPeriods(newPeriods);
                              }}
                              className="h-7 text-xs flex-1"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setAdditionalPeriods(additionalPeriods.filter((_, i) => i !== index))}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {additionalPeriods.length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-2">اضغط "إضافة فترة" لإضافة فترات تكليف إضافية</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="customAssignmentType" className="text-xs font-bold">نوع التكليف:</Label>
                    <Textarea
                      id="customAssignmentType"
                      placeholder="مثال: تكليف خارجي - دائم"
                      value={customAssignmentType}
                      onChange={(e) => setCustomAssignmentType(e.target.value)}
                      className="text-xs h-12 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customDuration" className="text-xs font-bold">صيغة المدة:</Label>
                    <Textarea
                      id="customDuration"
                      placeholder="مثال: لمدة 15 يوماً من تاريخ..."
                      value={customDurationText}
                      onChange={(e) => setCustomDurationText(e.target.value)}
                      className="text-xs h-16 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customParagraph1" className="text-xs font-bold">الفقرة ١:</Label>
                    <Textarea
                      id="customParagraph1"
                      placeholder="تكليف الموضح بياناته..."
                      value={customParagraph1}
                      onChange={(e) => setCustomParagraph1(e.target.value)}
                      className="text-xs h-20 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customParagraph2" className="text-xs font-bold">الفقرة ٢:</Label>
                    <Textarea
                      id="customParagraph2"
                      placeholder="لا يترتب على هذا القرار..."
                      value={customParagraph2}
                      onChange={(e) => setCustomParagraph2(e.target.value)}
                      className="text-xs h-16 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customParagraph3" className="text-xs font-bold">الفقرة ٣ (اتركه فارغاً لإخفائها):</Label>
                    <Textarea
                      id="customParagraph3"
                      placeholder="نسخة للمركز الأصلي..."
                      value={customParagraph3}
                      onChange={(e) => setCustomParagraph3(e.target.value)}
                      className="text-xs h-16 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customParagraph4" className="text-xs font-bold">الفقرة ٤ (اتركه فارغاً لإخفائها):</Label>
                    <Textarea
                      id="customParagraph4"
                      placeholder="نسخة للمركز المكلف به..."
                      value={customParagraph4}
                      onChange={(e) => setCustomParagraph4(e.target.value)}
                      className="text-xs h-16 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customParagraph5" className="text-xs font-bold">الفقرة ٥:</Label>
                    <Textarea
                      id="customParagraph5"
                      placeholder="يتم تنفيذ هذا القرار..."
                      value={customParagraph5}
                      onChange={(e) => setCustomParagraph5(e.target.value)}
                      className="text-xs h-16 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customClosing" className="text-xs font-bold">الختام:</Label>
                    <Textarea
                      id="customClosing"
                      placeholder="خالص التحايا ،،،"
                      value={customClosing}
                      onChange={(e) => setCustomClosing(e.target.value)}
                      className="text-xs h-12 resize-none mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customTextAfter" className="text-xs font-bold">نص إضافي بعد الختام (مثال: مدير الجهة واسمه):</Label>
                    <Textarea
                      id="customTextAfter"
                      placeholder="السطر الأول (مثل: مدير المركز الصحي)&#10;السطر الثاني (مثل: أ/ محمد أحمد)"
                      value={customTextAfter}
                      onChange={(e) => setCustomTextAfter(e.target.value.replace(/\n/g, '<br/>'))}
                      className="text-xs h-20 resize-none mt-1"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">💡 اضغط Enter للانتقال لسطر جديد</p>
                    {customTextAfter && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border space-y-2">
                        <Label className="text-[10px] font-semibold">تنسيق النص الإضافي:</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px]">الحجم</Label>
                            <Input
                              type="number"
                              min="8"
                              max="24"
                              value={customTextAfterStyle.size}
                              onChange={(e) => setCustomTextAfterStyle(prev => ({ ...prev, size: parseInt(e.target.value) || 14 }))}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">الخط</Label>
                            <select
                              value={customTextAfterStyle.font}
                              onChange={(e) => setCustomTextAfterStyle(prev => ({ ...prev, font: e.target.value }))}
                              className="h-7 text-xs w-full border rounded px-1"
                            >
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Tahoma">Tahoma</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={customTextAfterStyle.bold}
                                onChange={(e) => setCustomTextAfterStyle(prev => ({ ...prev, bold: e.target.checked }))}
                                className="w-4 h-4"
                              />
                              <span className="text-[10px]">عريض</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Label className="text-[10px]">المحاذاة:</Label>
                          <select
                            value={customTextAfterStyle.align || 'center'}
                            onChange={(e) => setCustomTextAfterStyle(prev => ({ ...prev, align: e.target.value }))}
                            className="h-7 text-xs border rounded px-1"
                          >
                            <option value="right">يمين</option>
                            <option value="center">وسط</option>
                            <option value="left">يسار</option>
                          </select>
                        </div>
                        <p className="text-[10px] text-gray-500">💡 اسحب النص في المعاينة لتغيير موقعه</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stampSize" className="text-xs font-bold">حجم الختم: {stampSize}px</Label>
                    <Input
                      id="stampSize"
                      type="range"
                      min="100"
                      max="350"
                      step="5"
                      value={stampSize}
                      onChange={(e) => setStampSize(parseInt(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">الحجم الافتراضي: 173px</p>
                  </div>

                  {/* إعدادات هوامش PDF */}
                  <div className="border-t pt-3 mt-3">
                    <Label className="text-xs font-bold block mb-3">📄 إعدادات PDF المتقدمة</Label>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <Label className="text-[10px]">هامش علوي (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={pdfMargins.top}
                          onChange={(e) => setPdfMargins(prev => ({ ...prev, top: parseInt(e.target.value) || 0 }))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">هامش سفلي (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={pdfMargins.bottom}
                          onChange={(e) => setPdfMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) || 0 }))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">هامش أيمن (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={pdfMargins.right}
                          onChange={(e) => setPdfMargins(prev => ({ ...prev, right: parseInt(e.target.value) || 0 }))}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">هامش أيسر (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={pdfMargins.left}
                          onChange={(e) => setPdfMargins(prev => ({ ...prev, left: parseInt(e.target.value) || 0 }))}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <Checkbox 
                        id="showHeaderFooter" 
                        checked={showHeaderFooter} 
                        onCheckedChange={setShowHeaderFooter} 
                      />
                      <Label htmlFor="showHeaderFooter" className="cursor-pointer text-xs">إضافة رأس وتذييل مخصص</Label>
                    </div>

                    {showHeaderFooter && (
                      <>
                        <div className="mb-2">
                          <Label className="text-[10px]">نص الرأس</Label>
                          <Input
                            value={customHeader}
                            onChange={(e) => setCustomHeader(e.target.value)}
                            placeholder="مثال: سري - للغاية"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">نص التذييل</Label>
                          <Input
                            value={customFooter}
                            onChange={(e) => setCustomFooter(e.target.value)}
                            placeholder="مثال: صفحة 1 من 1"
                            className="h-7 text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* تنسيق النصوص المتقدم */}
                  <div className="border-t pt-3 mt-3">
                    <Label className="text-xs font-bold block mb-3">🎨 تنسيق النصوص</Label>
                    
                    {Object.entries({
                      title: 'العنوان',
                      intro: 'المقدمة',
                      paragraph1: 'الفقرة ١',
                      paragraph2: 'الفقرة ٢',
                      paragraph3: 'الفقرة ٣',
                      paragraph4: 'الفقرة ٤',
                      paragraph5: 'الفقرة ٥',
                      closing: 'الختام',
                      managerName: 'اسم المدير',
                      tableHeaders: 'عناوين الجدول',
                      tableData: 'بيانات الجدول'
                    }).map(([key, label]) => (
                      <div key={key} className="mb-3 p-2 bg-gray-50 rounded border">
                        <Label className="text-xs font-semibold mb-2 block">{label}</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px] text-gray-600">الحجم</Label>
                            <Input
                              type="number"
                              min="8"
                              max="36"
                              value={textStyles[key].size}
                              onChange={(e) => setTextStyles(prev => ({
                                ...prev,
                                [key]: { ...prev[key], size: parseInt(e.target.value) || 16 }
                              }))}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-600">نوع الخط</Label>
                            <select
                              value={textStyles[key].font}
                              onChange={(e) => setTextStyles(prev => ({
                                ...prev,
                                [key]: { ...prev[key], font: e.target.value }
                              }))}
                              className="h-7 text-xs w-full border rounded px-1"
                            >
                              <option value="Arial">Arial</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Calibri">Calibri</option>
                              <option value="Tahoma">Tahoma</option>
                              <option value="Verdana">Verdana</option>
                              <option value="Courier New">Courier New</option>
                              <option value="PT Heading">PT Heading</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={textStyles[key].bold}
                                onChange={(e) => setTextStyles(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key], bold: e.target.checked }
                                }))}
                                className="w-4 h-4"
                              />
                              <span className="text-[10px]">عريض</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* تمكين سحب الفقرات */}
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="enableParagraphDrag" 
                        checked={enableParagraphDrag} 
                        onCheckedChange={setEnableParagraphDrag} 
                      />
                      <Label htmlFor="enableParagraphDrag" className="cursor-pointer text-xs font-bold text-indigo-800">
                        🔄 تمكين سحب الفقرات لتغيير مواقعها
                      </Label>
                    </div>
                    
                    {enableParagraphDrag && (
                      <>
                        <p className="text-[10px] text-indigo-600">
                          💡 اسحب أي فقرة في المعاينة لتغيير موقعها بحرية
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setParagraphPositions({
                            title: { x: 0, y: 0, enabled: false },
                            intro: { x: 0, y: 0, enabled: false },
                            table: { x: 0, y: 0, enabled: false },
                            paragraph1: { x: 0, y: 0, enabled: false },
                            paragraph2: { x: 0, y: 0, enabled: false },
                            paragraph3: { x: 0, y: 0, enabled: false },
                            paragraph4: { x: 0, y: 0, enabled: false },
                            paragraph5: { x: 0, y: 0, enabled: false },
                            closing: { x: 0, y: 0, enabled: false }
                          })}
                          className="h-7 text-xs w-full"
                        >
                          إعادة ضبط مواقع الفقرات
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-xs font-bold block mb-2">💡 نصيحة: اسحب الختم والتوقيع والاسم لتغيير موضعهم في المعاينة.</Label>
                  </div>
                  </div>
                </div>
              )}

              {/* Spacer when flexible controls are open */}
                  {templateMode === 'flexible' && <div className="w-80" />}

            {employeeNotFound && ( // Display alert based on new state
              <Alert className="max-w-md bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  ⚠️ سجل الموظف غير موجود في النظام (ربما تم حذفه أو أرشفته). يتم عرض التكليف بالبيانات المحفوظة.
                </AlertDescription>
              </Alert>
            )}
        </div>
        
        {/* Cell Border Popup */}
        {cellBorderPopup.show && (
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 p-4"
            style={{ 
              left: Math.min(cellBorderPopup.x, window.innerWidth - 280), 
              top: Math.min(cellBorderPopup.y, window.innerHeight - 250),
              minWidth: '250px'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold">تخصيص حدود الخلية</h4>
              <button 
                onClick={() => setCellBorderPopup({ show: false, x: 0, y: 0 })}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">سمك الحدود (px)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={editingCellBorder.width}
                  onChange={(e) => setEditingCellBorder(prev => ({ ...prev, width: parseInt(e.target.value) || 1 }))}
                  className="h-8 text-xs"
                />
              </div>
              
              <div>
                <Label className="text-xs">لون الحدود</Label>
                <Input
                  type="color"
                  value={editingCellBorder.color}
                  onChange={(e) => setEditingCellBorder(prev => ({ ...prev, color: e.target.value }))}
                  className="h-8 w-full cursor-pointer"
                />
              </div>
              
              <div>
                <Label className="text-xs">نمط الحدود</Label>
                <select
                  value={editingCellBorder.style}
                  onChange={(e) => setEditingCellBorder(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full h-8 text-xs border rounded px-2"
                >
                  <option value="solid">متصل</option>
                  <option value="dashed">متقطع</option>
                  <option value="dotted">منقط</option>
                  <option value="double">مزدوج</option>
                  <option value="none">بدون حدود</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setCellBorders(prev => ({
                      ...prev,
                      [selectedCell]: editingCellBorder
                    }));
                    setCellBorderPopup({ show: false, x: 0, y: 0 });
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  تطبيق
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newBorders = { ...cellBorders };
                    delete newBorders[selectedCell];
                    setCellBorders(newBorders);
                    setCellBorderPopup({ show: false, x: 0, y: 0 });
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  إعادة للافتراضي
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Email Template Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                إنشاء مسودة بريد إلكتروني
              </DialogTitle>
              <DialogDescription>
                اختر قالب جاهز أو قم بتخصيص نص البريد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="mb-3">
                <Label className="text-sm font-bold">اختر قالب البريد:</Label>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-2">
                  {getProcessedTemplates().map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedEmailTemplate === template.template_key ? 'default' : 'outline'}
                      className="justify-start h-auto py-3"
                      onClick={() => {
                        setSelectedEmailTemplate(template.template_key);
                        setCustomEmailBody(template.body);
                      }}
                    >
                      <div className="text-right w-full">
                        <div className="flex items-center justify-between">
                          <div className="font-bold">{template.name}</div>
                          {template.is_default && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-xs opacity-70 mt-1">{template.subject}</div>
                      </div>
                    </Button>
                  ))}
                  <Button
                    variant={selectedEmailTemplate === 'custom' ? 'default' : 'outline'}
                    className="justify-start h-auto py-3"
                    onClick={() => setSelectedEmailTemplate('custom')}
                  >
                    <div className="text-right">
                      <div className="font-bold">✏️ قالب مخصص</div>
                      <div className="text-xs opacity-70 mt-1">اكتب نص البريد بنفسك</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-bold mb-2 block">معاينة نص البريد:</Label>
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="text-xs text-gray-600 mb-2">
                    <strong>إلى:</strong> {employee?.email || assignment.employee_name || 'غير محدد'}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    <strong>الموضوع:</strong> {
                      selectedEmailTemplate === 'custom' 
                        ? replaceVariables(`${customTitle || 'تكليف'} - ${assignment.employee_name || ''}`)
                        : getProcessedTemplates().find(t => t.template_key === selectedEmailTemplate)?.subject || ''
                    }
                  </div>
                  <Textarea
                    value={
                      selectedEmailTemplate === 'custom' 
                        ? customEmailBody 
                        : getProcessedTemplates().find(t => t.template_key === selectedEmailTemplate)?.body || ''
                    }
                    onChange={(e) => {
                      setCustomEmailBody(e.target.value);
                      setSelectedEmailTemplate('custom');
                    }}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="اكتب نص البريد هنا..."
                  />
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>💡 <strong>نصائح:</strong></p>
                  <p>• يمكنك تعديل النص مباشرة في المعاينة</p>
                  <p>• سيتم فتح عميل البريد الافتراضي لديك مع النص الجاهز</p>
                  <p>• يمكنك إرفاق ملف PDF للقرار من خلال عميل البريد</p>
                </div>

                {selectedEmailTemplate === 'standard' && (
                  <div className="border-t pt-3">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const processedTemplates = getProcessedTemplates();
                          const currentTemplate = processedTemplates.find(t => t.template_key === 'standard');

                          await base44.auth.updateMe({
                            custom_standard_email_template: JSON.stringify({
                              subject: currentTemplate.subject,
                              body: customEmailBody
                            })
                          });

                          alert('✅ تم حفظ التعديلات على القالب القياسي. سيتم استخدام هذا النص في جميع التكاليف القادمة.');
                          loadEmailTemplates();
                        } catch (error) {
                          alert('فشل الحفظ: ' + error.message);
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التعديلات على القالب القياسي
                    </Button>
                  </div>
                )}
                </div>
                </div>

                <DialogFooter>
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                إلغاء
                </Button>
                <Button onClick={sendEmail} className="bg-purple-600 hover:bg-purple-700">
                <Mail className="w-4 h-4 ml-2" />
                فتح في عميل البريد
                </Button>
                </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* The actual document */}
        <div className="flex justify-center bg-gray-200 py-8">
          {templateMode === 'multiple' ? (
            <div className="relative">
              <MultipleAssignmentTemplate 
                assignments={multipleAssignmentsList}
                customTitle={customTitle}
                customIntro={customIntro}
                decisionPoints={multipleDecisionPoints}
                customClosing={customClosing}
                showNumbering={showNumbering}
                onTitleChange={setCustomTitle}
                onIntroChange={setCustomIntro}
                onDecisionPointsChange={setMultipleDecisionPoints}
                onClosingChange={setCustomClosing}
                onAssignmentsChange={handleMultipleAssignmentsChange}
              />
              {/* Add Save Button specifically for Multiple Template */}
              <div className="absolute top-4 left-4 no-print">
                <Button 
                  onClick={saveMultipleAssignmentsData}
                  className="bg-green-600 hover:bg-green-700 shadow-lg"
                  size="sm"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          ) : templateMode === 'standard' ? (
            <StandardAssignmentTemplate 
              assignment={assignment} 
              employee={employee}
              signaturePosition={signaturePosition}
              stampPosition={stampPosition}
              managerNamePosition={managerNamePosition}
              stampSize={stampSize}
              textStyles={textStyles}
              syncOptions={syncWithStandard ? {
                showNumbering,
                paragraphAlign,
                multiplePeriods,
                additionalPeriods,
                customTitle,
                customIntro,
                customParagraph1,
                customParagraph2,
                customParagraph3,
                customParagraph4,
                customParagraph5,
                customClosing,
                customTextAfter,
                customTextAfterPosition,
                customTextAfterStyle,
                showDurationInParagraph
              } : null}
            />
          ) : (
            <div className="relative flexible-draggable-container">
              <FlexibleAssignmentTemplate 
                assignment={assignment} 
                employee={employee}
                showDurationInTable={showDurationInTable}
                showDurationInParagraph={showDurationInParagraph}
                customDurationText={customDurationText}
                customParagraph1={customParagraph1}
                customParagraph2={customParagraph2}
                customParagraph3={customParagraph3}
                customParagraph4={customParagraph4}
                customParagraph5={customParagraph5}
                customAssignmentType={customAssignmentType}
                customClosing={customClosing}
                customTitle={customTitle}
                customIntro={customIntro}
                showNumbering={showNumbering}
                customTextBefore={customTextBefore}
                customTextAfter={customTextAfter}
                customTextAfterPosition={customTextAfterPosition}
                customTextAfterStyle={customTextAfterStyle}
                paragraphAlign={paragraphAlign}
                multiplePeriods={multiplePeriods}
                additionalPeriods={additionalPeriods}
                tableLayout={tableLayout}
                customTableHeaders={customTableHeaders}
                signaturePosition={signaturePosition}
                stampPosition={stampPosition}
                managerNamePosition={managerNamePosition}
                stampSize={stampSize}
                textStyles={textStyles}
                tableBorderWidth={tableBorderWidth}
                tableBorderColor={tableBorderColor}
                tableColumnWidths={tableColumnWidths}
                tableRowHeights={tableRowHeights}
                onTableColumnWidthChange={(key, width) => setTableColumnWidths(prev => ({ ...prev, [key]: width }))}
                onTableRowHeightChange={(key, height) => setTableRowHeights(prev => ({ ...prev, [key]: height }))}
                enableTableResize={enableTableResize}
                paragraphPositions={paragraphPositions}
                enableParagraphDrag={enableParagraphDrag}
                cellBorders={cellBorders}
                onCellBorderChange={(cellKey, currentBorder, event) => {
                  setSelectedCell(cellKey);
                  setEditingCellBorder(currentBorder);
                  setCellBorderPopup({ 
                    show: true, 
                    x: event.clientX, 
                    y: event.clientY 
                  });
                }}
                customCellValues={customCellValues}
                onCellValueChange={(cellKey, value) => {
                  setCustomCellValues(prev => ({ ...prev, [cellKey]: value }));
                }}
              />
              
              {/* Draggable Manager Name */}
              <div
                className="draggable-item no-print"
                style={{ 
                  left: `${managerNamePosition.x}px`, 
                  top: `${managerNamePosition.y}px`,
                  padding: '8px',
                  background: isDragging === 'managerName' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: isDragging === 'managerName' ? '2px dashed #3b82f6' : '2px dashed transparent',
                  transition: isDragging === 'managerName' ? 'none' : 'all 0.2s'
                }}
                onMouseDown={(e) => handleMouseDown('managerName', e)}
                onDragStart={(e) => e.preventDefault()}
                title="اسحب لتغيير الموضع"
              >
                <div style={{ textAlign: 'center' }}>
                  <p className="font-semibold text-base select-none" style={{ marginBottom: '4px' }}>
                    مدير إدارة شؤون المراكز الصحية بالحناكية
                  </p>
                  <p className="font-semibold text-base select-none">
                    أ/عبدالمجيد سعود الربيقي
                  </p>
                </div>
              </div>

              {/* Draggable Stamp */}
              <div
                className="draggable-item no-print"
                style={{ 
                  left: `${stampPosition.x}px`, 
                  top: `${stampPosition.y}px`,
                  padding: '4px',
                  background: isDragging === 'stamp' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  borderRadius: '8px',
                  border: isDragging === 'stamp' ? '2px dashed #ef4444' : '2px dashed transparent',
                  transition: isDragging === 'stamp' ? 'none' : 'all 0.2s'
                }}
                onMouseDown={(e) => handleMouseDown('stamp', e)}
                onDragStart={(e) => e.preventDefault()}
                title="اسحب لتغيير الموضع"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/9059c4577_2.png"
                  alt="الختم"
                  className="select-none"
                  style={{ width: `${stampSize}px`, opacity: 0.9 }}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
              
              {/* Draggable Signature */}
              <div
                className="draggable-item no-print"
                style={{ 
                  left: `${signaturePosition.x}px`, 
                  top: `${signaturePosition.y}px`,
                  padding: '4px',
                  background: isDragging === 'signature' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  borderRadius: '8px',
                  border: isDragging === 'signature' ? '2px dashed #22c55e' : '2px dashed transparent',
                  transition: isDragging === 'signature' ? 'none' : 'all 0.2s'
                }}
                onMouseDown={(e) => handleMouseDown('signature', e)}
                onDragStart={(e) => e.preventDefault()}
                title="اسحب لتغيير الموضع"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/7cc0a0a53_.png"
                  alt="التوقيع"
                  className="select-none"
                  style={{ width: '170px', mixBlendMode: 'darken' }}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>

              {/* Draggable Custom Text After */}
              {customTextAfter && (
                <div
                  className="draggable-item no-print"
                  style={{ 
                    left: `${customTextAfterPosition.x}px`, 
                    top: `${customTextAfterPosition.y}px`,
                    padding: '8px',
                    background: isDragging === 'customTextAfter' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: isDragging === 'customTextAfter' ? '2px dashed #a855f7' : '2px dashed transparent',
                    transition: isDragging === 'customTextAfter' ? 'none' : 'all 0.2s',
                    maxWidth: '400px'
                  }}
                  onMouseDown={(e) => handleMouseDown('customTextAfter', e)}
                  onDragStart={(e) => e.preventDefault()}
                  title="اسحب لتغيير الموضع"
                >
                  <div 
                    style={{ 
                      fontSize: `${customTextAfterStyle.size}px`,
                      fontFamily: customTextAfterStyle.font,
                      fontWeight: customTextAfterStyle.bold ? 'bold' : 'normal',
                      textAlign: customTextAfterStyle.align || 'center'
                    }}
                    dangerouslySetInnerHTML={{ __html: customTextAfter }}
                  />
                </div>
              )}

              {/* Draggable Paragraph Handles */}
              {enableParagraphDrag && (
                <div className="no-print absolute top-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg border border-indigo-200 z-50" style={{ maxWidth: '200px' }}>
                  <p className="text-xs font-bold text-indigo-800 mb-2">🔄 اسحب أي فقرة:</p>
                  <div className="space-y-1">
                    {Object.entries({
                      title: 'العنوان',
                      intro: 'المقدمة',
                      table: 'الجدول',
                      paragraph1: 'الفقرة ١',
                      paragraph2: 'الفقرة ٢',
                      paragraph3: 'الفقرة ٣',
                      paragraph4: 'الفقرة ٤',
                      paragraph5: 'الفقرة ٥',
                      closing: 'الختام'
                    }).map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-1 rounded text-xs hover:bg-indigo-50 cursor-grab"
                        style={{ 
                          background: paragraphPositions[key]?.enabled ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          border: paragraphPositions[key]?.enabled ? '1px solid #6366f1' : '1px solid transparent'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          // تفعيل الفقرة وبدء السحب
                          setParagraphPositions(prev => ({
                            ...prev,
                            [key]: { ...prev[key], enabled: true, x: prev[key]?.x || 100, y: prev[key]?.y || 200 }
                          }));
                          handleMouseDown(`para_${key}`, e);
                        }}
                      >
                        <span>{label}</span>
                        {paragraphPositions[key]?.enabled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setParagraphPositions(prev => ({
                                ...prev,
                                [key]: { x: 0, y: 0, enabled: false }
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="إعادة للموضع الأصلي"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}