import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Printer, Save, ArrowRight, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ad5a04281_2.png";

// قائمة الأجهزة والمعدات المكتبية والغير طبية
const DEVICE_OPTIONS = [
  // أثاث مكتبي
  "مكتب موظف",
  "مكتب مدير",
  "مكتب استقبال",
  "كرسي موظف دوار",
  "كرسي مدير جلد",
  "كرسي انتظار مبطن جلد",
  "كرسي مراجع مبطن جلد",
  "كراسي انتظار صف 3 مقاعد",
  "كراسي انتظار صف 4 مقاعد",
  "طاولة اجتماعات",
  "طاولة طعام",
  "طاولة جانبية",
  "دولاب مكتبي",
  "خزانة ملفات معدنية",
  "خزانة ملفات خشبية",
  "دولاب أدوات",
  // أجهزة إلكترونية ومكتبية
  "جهاز كمبيوتر مكتبي",
  "جهاز كمبيوتر محمول (لابتوب)",
  "شاشة كمبيوتر",
  "طابعة ليزر",
  "طابعة ملونة",
  "ماسح ضوئي",
  "آلة تصوير مستندات",
  "جهاز فاكس",
  "هاتف مكتبي",
  "جهاز عرض (بروجكتور)",
  "شاشة عرض مواد توعوية",
  "سبورة بيضاء",
  "سبورة ذكية",
  // أجهزة كهربائية
  "مكيف هواء شباك",
  "مكيف هواء سبليت",
  "مكيف هواء متنقل",
  "مروحة سقف",
  "مروحة قائمة",
  "سخان ماء",
  "برادة ماء",
  "ثلاجة صغيرة",
  "ثلاجة كبيرة",
  "ثلاجة أدوية",
  "مايكروويف",
  "غلاية كهربائية",
  // معدات فحص وكشف
  "لمبة كشف على المرضى",
  "سرير كشف",
  "سرير فحص",
  "سرير نقل مرضى",
  "كرسي سحب دم",
  "عربة أدوات طبية",
  "عربة ملفات",
  "ميزان طبي",
  "جهاز قياس طول",
  // معدات تخزين ومستودعات
  "رف تخزين معدني",
  "رف تخزين خشبي",
  "رفوف أرشيف",
  "رفوف مستودع ثقيلة",
  "رفوف مستودع متوسطة",
  "رفوف مستودع خفيفة",
  "خزانة مستودع",
  "طاولة تغليف",
  "عربة نقل بضائع",
  "سلم متحرك",
  "بالتات خشبية",
  "صناديق تخزين بلاستيكية",
  // معدات نظافة وصيانة
  "سلة مهملات مكتبية",
  "سلة مهملات طبية",
  "حاوية نفايات",
  "عربة تنظيف",
  "مكنسة كهربائية",
  "ممسحة أرضيات",
  // معدات أمن وسلامة
  "طفاية حريق",
  "صندوق إسعافات أولية",
  "كاميرا مراقبة",
  "جهاز إنذار",
  "لوحة إرشادية",
  // أخرى
  "ستائر نوافذ",
  "سجاد",
  "ساعة حائط",
  "لوحة إعلانات",
  "حامل مجلات",
  "أخرى"
];

export default function FillNonMedicalEquipmentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    facility_name: "",
    capacity: "مركز صحي",
    facility_type: "مركز صحي",
    region: "الغربية",
    city: "المدينة المنورة - الحناكية",
    date: new Date().toISOString().split('T')[0],
    request_purpose: "",
    request_purpose_other: "",
    request_type: "new",
    priority_level: "",
    device_type: "",
    device_type_other: "",
    device_name: "",
    quantity: "",
    item_code: "",
    site_ready: "",
    site_area_room: "",
    requires_approval: "",
    approval_attachments: "",
    facility_manager_signature: "",
    executive_director_signature: "",
    equipment_director_signature: "",
    deputy_ceo_signature: "",
    customLogo: DEFAULT_LOGO,
    logoSize: 100,
    logoPositionX: 0,
    logoPositionY: 0,
    headerColor: "#000000",
    titleColor: "#000",
    sectionColor: "#d0e8f2",
    cellColors: {},
    columnWidths: { col1: 16.66, col2: 16.66, col3: 16.66, col4: 16.66, col5: 16.66, col6: 16.66 },
    rowHeights: {},
    facilityNameFontSize: 9,
    cellFontSizes: {},
    cellFontWeights: {}
  });

  const [colorPickerOpen, setColorPickerOpen] = useState(null);
  const [textEditorOpen, setTextEditorOpen] = useState(null);
  const [cellMenuOpen, setCellMenuOpen] = useState(null);
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [bulkPrintMode, setBulkPrintMode] = useState(false);
  const [selectedCenters, setSelectedCenters] = useState([]);
  
  // مفتاح حفظ القالب الافتراضي
  const TEMPLATE_STORAGE_KEY = 'non_medical_equipment_form_template_1';
  
  // سحب الأعمدة والصفوف
  const [resizing, setResizing] = useState({ type: null, key: null });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState(0);

  const predefinedColors = [
    '#000000', '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#ced4da', '#d0e8f2', '#b8daff', '#bee5eb', '#c3e6cb',
    '#d4edda', '#fff3cd', '#ffeeba', '#f5c6cb', '#f8d7da',
    '#e2e3e5', '#00843d', '#28a745', '#17a2b8', '#007bff',
    '#6610f2', '#fd7e14', '#dc3545', '#e83e8c', '#6c757d',
    '#343a40', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  // معالجة سحب الأعمدة
  const handleColMouseDown = (e, colKey) => {
    e.preventDefault();
    setResizing({ type: 'col', key: colKey });
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize(formData.columnWidths[colKey] || 16.66);
  };

  // معالجة سحب الصفوف
  const handleRowMouseDown = (e, rowKey) => {
    e.preventDefault();
    setResizing({ type: 'row', key: rowKey });
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize(formData.rowHeights[rowKey] || 30);
  };

  const handleMouseMove = (e) => {
    if (!resizing.type) return;
    
    if (resizing.type === 'col') {
      const diff = (startPos.x - e.clientX) / 6;
      const newWidth = Math.max(8, Math.min(40, startSize + diff / 10));
      setFormData(prev => ({
        ...prev,
        columnWidths: { ...prev.columnWidths, [resizing.key]: newWidth }
      }));
    } else if (resizing.type === 'row') {
      const diff = e.clientY - startPos.y;
      const newHeight = Math.max(20, Math.min(80, startSize + diff));
      setFormData(prev => ({
        ...prev,
        rowHeights: { ...prev.rowHeights, [resizing.key]: newHeight }
      }));
    }
  };

  const handleMouseUp = () => {
    setResizing({ type: null, key: null });
  };

  useEffect(() => {
    if (resizing.type) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, startPos, startSize]);

  useEffect(() => {
    loadData();
    loadSavedTemplate();
  }, []);
  
  // تحميل القالب المحفوظ
  const loadSavedTemplate = () => {
    try {
      const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (savedTemplate) {
        const template = JSON.parse(savedTemplate);
        setFormData(prev => ({
          ...prev,
          ...template,
          // إعادة تعيين البيانات المتغيرة
          facility_name: '',
          device_name: '',
          quantity: '',
          date: new Date().toISOString().split('T')[0],
          facility_manager_signature: ''
        }));
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };
  
  // حفظ كقالب افتراضي
  const saveAsDefaultTemplate = () => {
    try {
      const templateData = {
        customLogo: formData.customLogo,
        logoSize: formData.logoSize,
        headerColor: formData.headerColor,
        titleColor: formData.titleColor,
        sectionColor: formData.sectionColor,
        cellColors: formData.cellColors,
        columnWidths: formData.columnWidths,
        rowHeights: formData.rowHeights,
        capacity: formData.capacity,
        facility_type: formData.facility_type,
        region: formData.region,
        city: formData.city
      };
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templateData));
      alert('✅ تم حفظ القالب الافتراضي بنجاح');
    } catch (error) {
      alert('❌ حدث خطأ أثناء حفظ القالب');
    }
  };

  const loadData = async () => {
    try {
      setIsLoadingCenters(true);
      const [centersData, employeesData] = await Promise.all([
        base44.entities.HealthCenter.list(),
        base44.entities.Employee.list()
      ]);
      setHealthCenters(Array.isArray(centersData) ? centersData : []);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoadingCenters(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // عند اختيار المنشأة، جلب اسم المدير تلقائياً
  const handleFacilityChange = (facilityName) => {
    handleChange('facility_name', facilityName);
    
    // البحث عن المركز الصحي
    const center = healthCenters.find(c => c.اسم_المركز === facilityName);
    if (center && center.المدير) {
      // البحث عن الموظف المدير
      const manager = employees.find(e => e.id === center.المدير);
      if (manager) {
        handleChange('facility_manager_signature', manager.full_name_arabic || '');
      }
    }
  };

  const handleCellDoubleClick = (cellId) => {
    setCellMenuOpen(cellMenuOpen === cellId ? null : cellId);
    setColorPickerOpen(null);
    setTextEditorOpen(null);
  };

  const handleCellColorChange = (cellId, color) => {
    setFormData(prev => ({
      ...prev,
      cellColors: { ...prev.cellColors, [cellId]: color }
    }));
    setColorPickerOpen(null);
    setCellMenuOpen(null);
  };

  const openColorPicker = (cellId) => {
    setColorPickerOpen(cellId);
    setTextEditorOpen(null);
    setCellMenuOpen(null);
  };

  const openTextEditor = (cellId) => {
    setTextEditorOpen(cellId);
    setColorPickerOpen(null);
    setCellMenuOpen(null);
  };

  const handleFontSizeChange = (cellId, size) => {
    setFormData(prev => ({
      ...prev,
      cellFontSizes: { ...prev.cellFontSizes, [cellId]: size }
    }));
  };

  const handleFontWeightChange = (cellId, weight) => {
    setFormData(prev => ({
      ...prev,
      cellFontWeights: { ...prev.cellFontWeights, [cellId]: weight }
    }));
  };

  const getCellColor = (cellId, defaultColor = 'transparent') => {
    return formData.cellColors[cellId] || defaultColor;
  };

  const getCellFontSize = (cellId, defaultSize = 9) => {
    return formData.cellFontSizes?.[cellId] || defaultSize;
  };

  const getCellFontWeight = (cellId, defaultWeight = 'normal') => {
    return formData.cellFontWeights?.[cellId] || defaultWeight;
  };

  const getRowHeight = (rowKey) => {
    return formData.rowHeights[rowKey] || 30;
  };

  const handlePrint = () => window.print();

  // طباعة متعددة لمراكز مختلفة
  const handleBulkPrint = () => {
    if (selectedCenters.length === 0) {
      alert('يرجى اختيار مركز واحد على الأقل');
      return;
    }
    setBulkPrintMode(true);
    setTimeout(() => {
      window.print();
      setBulkPrintMode(false);
    }, 500);
  };

  const toggleCenterSelection = (centerName) => {
    setSelectedCenters(prev => 
      prev.includes(centerName) 
        ? prev.filter(c => c !== centerName)
        : [...prev, centerName]
    );
  };

  const selectAllCenters = () => {
    setSelectedCenters(healthCenters.map(c => c.اسم_المركز));
  };

  const clearCenterSelection = () => {
    setSelectedCenters([]);
  };

  // الحصول على اسم مدير المركز
  const getManagerName = (centerName) => {
    const center = healthCenters.find(c => c.اسم_المركز === centerName);
    if (center && center.المدير) {
      const manager = employees.find(e => e.id === center.المدير);
      return manager?.full_name_arabic || '';
    }
    return '';
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await base44.entities.EquipmentRequest.create(formData);
      alert("✅ تم حفظ النموذج بنجاح");
      navigate(createPageUrl("Forms"));
    } catch (error) {
      alert("❌ حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة');
      return;
    }
    setIsUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('customLogo', file_url);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('حدث خطأ أثناء رفع الشعار');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const CellMenuPopup = ({ cellId }) => (
    <div 
      className="absolute z-50 bg-white border shadow-lg rounded p-2 no-print" 
      style={{ top: '100%', right: 0, minWidth: '140px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-1">
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start text-xs h-8 gap-2"
          onClick={(e) => { e.stopPropagation(); openColorPicker(cellId); }}
        >
          <div className="w-4 h-4 rounded border border-gray-300 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400"></div>
          تغيير اللون
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start text-xs h-8 gap-2"
          onClick={(e) => { e.stopPropagation(); openTextEditor(cellId); }}
        >
          <span className="text-sm font-bold">أ</span>
          تغيير حجم/سمك النص
        </Button>
      </div>
    </div>
  );

  const ColorPickerPopup = ({ cellId, onSelect }) => (
    <div 
      className="absolute z-50 bg-white border shadow-lg rounded p-2 no-print" 
      style={{ top: '100%', right: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xs font-bold mb-2 text-center border-b pb-1">اختر اللون</div>
      <div className="grid grid-cols-6 gap-1" style={{ width: '144px' }}>
        {predefinedColors.map(color => (
          <div
            key={color}
            onClick={(e) => { e.stopPropagation(); onSelect(cellId, color); }}
            className={`w-5 h-5 rounded cursor-pointer border-2 hover:scale-110 transition-transform ${color === '#000000' ? 'border-gray-400' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="w-full mt-1 text-xs h-6"
        onClick={(e) => { e.stopPropagation(); onSelect(cellId, 'transparent'); }}
      >
        إزالة اللون
      </Button>
    </div>
  );

  const TextEditorPopup = ({ cellId }) => (
    <div 
      className="absolute z-50 bg-white border shadow-lg rounded p-3 no-print" 
      style={{ top: '100%', right: 0, minWidth: '180px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xs font-bold mb-2 text-center border-b pb-1">تعديل النص</div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold block mb-1">حجم الخط:</label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              onClick={() => handleFontSizeChange(cellId, Math.max(6, getCellFontSize(cellId) - 1))}
            >
              -
            </Button>
            <span className="text-sm font-bold w-8 text-center">{getCellFontSize(cellId)}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              onClick={() => handleFontSizeChange(cellId, Math.min(24, getCellFontSize(cellId) + 1))}
            >
              +
            </Button>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">سمك الخط:</label>
          <div className="flex gap-1 flex-wrap">
            {[
              { label: 'نحيف', value: '300' },
              { label: 'عادي', value: 'normal' },
              { label: 'سميك', value: '600' },
              { label: 'غليظ', value: 'bold' }
            ].map(w => (
              <Button
                key={w.value}
                size="sm"
                variant={getCellFontWeight(cellId) === w.value ? 'default' : 'outline'}
                className="h-6 text-xs px-2"
                style={{ fontWeight: w.value }}
                onClick={() => handleFontWeightChange(cellId, w.value)}
              >
                {w.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // مقبض سحب العمود
  const ColResizer = ({ colKey }) => (
    <div 
      className="no-print"
      style={{ 
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', 
        cursor: 'col-resize', 
        backgroundColor: resizing.key === colKey ? '#007bff' : 'transparent'
      }}
      onMouseDown={(e) => handleColMouseDown(e, colKey)}
    />
  );

  // مقبض سحب الصف
  const RowResizer = ({ rowKey }) => (
    <div 
      className="no-print"
      style={{ 
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '5px', 
        cursor: 'row-resize', 
        backgroundColor: resizing.key === rowKey ? '#007bff' : 'transparent'
      }}
      onMouseDown={(e) => handleRowMouseDown(e, rowKey)}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-only { display: inline !important; font-size: 11px !important; font-weight: bold !important; }

          .print-container { width: 210mm !important; min-height: 297mm !important; padding: 8mm !important; margin: 0 !important; box-shadow: none !important; background: white !important; }
          @page { size: A4; margin: 0; }
          table { page-break-inside: avoid; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; border-collapse: collapse !important; }
          th, td { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; border: 1px solid #000 !important; }
          .form-table, .form-table th, .form-table td { border: 1px solid #000 !important; }
        }
        .form-table { width: 100%; border-collapse: collapse; background: white; }
        .form-table th, .form-table td { border: 1px solid #000; padding: 4px 5px; font-size: 9px; vertical-align: middle; line-height: 1.3; position: relative; }
        .form-table th { background-color: #e8f4f8 !important; font-weight: bold; text-align: center; }
        .section-header { font-weight: bold; text-align: center; padding: 5px; font-size: 10px; border: 1px solid #000; }
        input[type="text"], input[type="number"], input[type="date"], textarea, select { border: none; background: transparent; width: 100%; padding: 3px; font-size: 9px; line-height: 1.2; -webkit-appearance: none; -moz-appearance: none; appearance: none; }
        @media print {
          select { background: none !important; }
        }
        input[type="radio"], input[type="checkbox"] { margin: 0 4px; }
        .logo-cell img { width: 100%; height: 100%; object-fit: contain; }
        .print-only { display: none; }

        select { cursor: pointer; }
      `}</style>

      {/* أزرار التحكم */}
      <div className="no-print flex justify-between items-center mb-4 max-w-[210mm] mx-auto">
        <Button variant="outline" onClick={() => navigate(createPageUrl("Forms"))}>
          <ArrowRight className="w-4 h-4 ml-2" />العودة
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 ml-2" />حفظ الطلب
          </Button>
          <Button onClick={saveAsDefaultTemplate} disabled={isLoading} variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
            <Save className="w-4 h-4 ml-2" />حفظ كقالب افتراضي
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 ml-2" />طباعة
          </Button>
          <Button onClick={handleBulkPrint} disabled={selectedCenters.length === 0} className="bg-orange-600 hover:bg-orange-700">
            <Printer className="w-4 h-4 ml-2" />طباعة متعددة ({selectedCenters.length})
          </Button>
        </div>
      </div>

      {/* اختيار مراكز للطباعة المتعددة */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 bg-white p-4 rounded shadow border-2 border-orange-200">
        <h3 className="text-sm font-bold mb-3 text-orange-700">طباعة متعددة - اختر المراكز المطلوبة:</h3>
        <div className="flex gap-2 mb-3">
          <Button size="sm" variant="outline" onClick={selectAllCenters}>تحديد الكل</Button>
          <Button size="sm" variant="outline" onClick={clearCenterSelection}>إلغاء التحديد</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
          {healthCenters.map(center => (
            <label key={center.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs ${selectedCenters.includes(center.اسم_المركز) ? 'bg-orange-100 border border-orange-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <input 
                type="checkbox" 
                checked={selectedCenters.includes(center.اسم_المركز)} 
                onChange={() => toggleCenterSelection(center.اسم_المركز)} 
              />
              {center.اسم_المركز}
            </label>
          ))}
        </div>
      </div>

      {/* لوحة التخصيص */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 bg-white p-4 rounded shadow">
        <h3 className="text-sm font-bold mb-3">تخصيص النموذج (انقر مزدوج على أي خلية لتغيير لونها - اسحب حدود الخلايا لتغيير الحجم)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs block mb-1">الشعار:</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded cursor-pointer hover:bg-gray-50 ${isUploadingLogo ? 'opacity-50' : ''}`}>
                  {isUploadingLogo ? <span>جاري الرفع...</span> : <><Upload className="w-3 h-3" />رفع شعار</>}
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleChange('customLogo', DEFAULT_LOGO)} className="h-7 text-xs">
                  الشعار الافتراضي
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1">حجم الشعار:</label>
            <input type="range" min="50" max="150" value={formData.logoSize || 100} onChange={(e) => handleChange('logoSize', parseInt(e.target.value))} className="w-full" />
            <div className="flex gap-2 mt-1">
              <input type="number" placeholder="X" value={formData.logoPositionX || 0} onChange={(e) => handleChange('logoPositionX', parseInt(e.target.value) || 0)} className="w-16 text-xs border rounded px-1" />
              <input type="number" placeholder="Y" value={formData.logoPositionY || 0} onChange={(e) => handleChange('logoPositionY', parseInt(e.target.value) || 0)} className="w-16 text-xs border rounded px-1" />
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1">لون الهيدر:</label>
            <div className="grid grid-cols-5 gap-1">
              {predefinedColors.slice(0, 10).map(color => (
                <div key={color} onClick={() => handleChange('headerColor', color)} className={`w-5 h-5 rounded cursor-pointer border-2 ${formData.headerColor === color ? 'border-black' : 'border-gray-300'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1">لون الأقسام:</label>
            <div className="grid grid-cols-5 gap-1">
              {predefinedColors.slice(0, 10).map(color => (
                <div key={color} onClick={() => handleChange('sectionColor', color)} className={`w-5 h-5 rounded cursor-pointer border-2 ${formData.sectionColor === color ? 'border-black' : 'border-gray-300'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1">حجم خط اسم المركز: {formData.facilityNameFontSize}px</label>
            <input type="range" min="6" max="16" value={formData.facilityNameFontSize || 9} onChange={(e) => handleChange('facilityNameFontSize', parseInt(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>

      {/* النموذج */}
      <div className="print-container max-w-[210mm] mx-auto bg-white shadow-lg" style={{ minHeight: '297mm', padding: '8mm' }}>
        
        {/* Header with Logo */}
        <table className="form-table mb-4">
          <tbody>
            <tr style={{ height: getRowHeight('header-1') }}>
              <td style={{ width: '35%', color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-ar-1'), fontWeight: getCellFontWeight('header-ar-1', 'bold'), fontSize: `${getCellFontSize('header-ar-1')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-ar-1')}>
                المملكة العربية السعودية
                {cellMenuOpen === 'header-ar-1' && <CellMenuPopup cellId="header-ar-1" />}
                {colorPickerOpen === 'header-ar-1' && <ColorPickerPopup cellId="header-ar-1" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-ar-1' && <TextEditorPopup cellId="header-ar-1" />}
                <RowResizer rowKey="header-1" />
              </td>
            <td rowSpan="4" className="logo-cell" style={{ width: '30%', textAlign: 'center', verticalAlign: 'middle', padding: '5px', backgroundColor: getCellColor('header-logo'), position: 'relative', overflow: 'hidden' }} onDoubleClick={() => handleCellDoubleClick('header-logo')}>
                <div 
                  style={{ 
                    width: `${formData.logoSize || 100}%`, 
                    height: `${formData.logoSize || 100}%`,
                    transform: `translate(${formData.logoPositionX || 0}px, ${formData.logoPositionY || 0}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'auto'
                  }}
                >
                  <img src={formData.customLogo || DEFAULT_LOGO} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {cellMenuOpen === 'header-logo' && <CellMenuPopup cellId="header-logo" />}
                {colorPickerOpen === 'header-logo' && <ColorPickerPopup cellId="header-logo" onSelect={handleCellColorChange} />}
              </td>
              <td style={{ width: '35%', color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-en-1'), fontWeight: getCellFontWeight('header-en-1', 'bold'), fontSize: `${getCellFontSize('header-en-1')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-en-1')}>
                KINGDOM OF SAUDI ARABIA
                {cellMenuOpen === 'header-en-1' && <CellMenuPopup cellId="header-en-1" />}
                {colorPickerOpen === 'header-en-1' && <ColorPickerPopup cellId="header-en-1" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-en-1' && <TextEditorPopup cellId="header-en-1" />}
              </td>
            </tr>
            <tr style={{ height: getRowHeight('header-2') }}>
              <td style={{ color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-ar-2'), fontWeight: getCellFontWeight('header-ar-2', 'bold'), fontSize: `${getCellFontSize('header-ar-2')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-ar-2')}>
                وزارة الصحة
                {cellMenuOpen === 'header-ar-2' && <CellMenuPopup cellId="header-ar-2" />}
                {colorPickerOpen === 'header-ar-2' && <ColorPickerPopup cellId="header-ar-2" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-ar-2' && <TextEditorPopup cellId="header-ar-2" />}
                <RowResizer rowKey="header-2" />
              </td>
              <td style={{ color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-en-2'), fontWeight: getCellFontWeight('header-en-2', 'bold'), fontSize: `${getCellFontSize('header-en-2')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-en-2')}>
                MINISTRY OF HEALTH
                {cellMenuOpen === 'header-en-2' && <CellMenuPopup cellId="header-en-2" />}
                {colorPickerOpen === 'header-en-2' && <ColorPickerPopup cellId="header-en-2" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-en-2' && <TextEditorPopup cellId="header-en-2" />}
              </td>
            </tr>
            <tr style={{ height: getRowHeight('header-3') }}>
              <td style={{ color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-ar-3'), fontWeight: getCellFontWeight('header-ar-3', 'bold'), fontSize: `${getCellFontSize('header-ar-3')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-ar-3')}>
                الإدارة العامة للتجهيزات والإحلال
                {cellMenuOpen === 'header-ar-3' && <CellMenuPopup cellId="header-ar-3" />}
                {colorPickerOpen === 'header-ar-3' && <ColorPickerPopup cellId="header-ar-3" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-ar-3' && <TextEditorPopup cellId="header-ar-3" />}
                <RowResizer rowKey="header-3" />
              </td>
              <td style={{ color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-en-3'), fontWeight: getCellFontWeight('header-en-3', 'bold'), fontSize: `${getCellFontSize('header-en-3')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-en-3')}>
                GENERAL DIRECTORATE OF EQUIPMENT & REPLACEMENT
                {cellMenuOpen === 'header-en-3' && <CellMenuPopup cellId="header-en-3" />}
                {colorPickerOpen === 'header-en-3' && <ColorPickerPopup cellId="header-en-3" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-en-3' && <TextEditorPopup cellId="header-en-3" />}
              </td>
            </tr>
            <tr style={{ height: getRowHeight('header-4') }}>
              <td style={{ color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-ar-4'), fontWeight: getCellFontWeight('header-ar-4', 'bold'), fontSize: `${getCellFontSize('header-ar-4')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-ar-4')}>
                إدارة التخطيط الطبي
                {cellMenuOpen === 'header-ar-4' && <CellMenuPopup cellId="header-ar-4" />}
                {colorPickerOpen === 'header-ar-4' && <ColorPickerPopup cellId="header-ar-4" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-ar-4' && <TextEditorPopup cellId="header-ar-4" />}
                <RowResizer rowKey="header-4" />
              </td>
              <td style={{ color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-en-4'), fontWeight: getCellFontWeight('header-en-4', 'bold'), fontSize: `${getCellFontSize('header-en-4')}px`, position: 'relative' }} onDoubleClick={() => handleCellDoubleClick('header-en-4')}>
                DEPARTMENT OF MEDICAL PLANNING
                {cellMenuOpen === 'header-en-4' && <CellMenuPopup cellId="header-en-4" />}
                {colorPickerOpen === 'header-en-4' && <ColorPickerPopup cellId="header-en-4" onSelect={handleCellColorChange} />}
                {textEditorOpen === 'header-en-4' && <TextEditorPopup cellId="header-en-4" />}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Form Title */}
        <div className="section-header mb-2" style={{ backgroundColor: getCellColor('form-title', formData.sectionColor), color: formData.titleColor, position: 'relative', fontSize: `${getCellFontSize('form-title', 10)}px`, fontWeight: getCellFontWeight('form-title', 'bold') }} onDoubleClick={() => handleCellDoubleClick('form-title')}>
          نموذج طلب الأجهزة الغير طبية والأثاث<br/>Non-Medical Device/Furniture Requisition Form
          {cellMenuOpen === 'form-title' && <CellMenuPopup cellId="form-title" />}
          {colorPickerOpen === 'form-title' && <ColorPickerPopup cellId="form-title" onSelect={handleCellColorChange} />}
          {textEditorOpen === 'form-title' && <TextEditorPopup cellId="form-title" />}
        </div>

        {/* Request Information Section */}
        <div className="section-header mb-2" style={{ backgroundColor: getCellColor('req-info-header', formData.sectionColor), position: 'relative', fontSize: `${getCellFontSize('req-info-header', 10)}px`, fontWeight: getCellFontWeight('req-info-header', 'bold') }} onDoubleClick={() => handleCellDoubleClick('req-info-header')}>
          معلومات الطلب (Request Information)
          {cellMenuOpen === 'req-info-header' && <CellMenuPopup cellId="req-info-header" />}
          {colorPickerOpen === 'req-info-header' && <ColorPickerPopup cellId="req-info-header" onSelect={handleCellColorChange} />}
          {textEditorOpen === 'req-info-header' && <TextEditorPopup cellId="req-info-header" />}
        </div>

        <table className="form-table mb-2">
          <tbody>
            <tr style={{ height: getRowHeight('req-row-1') }}>
              <td style={{ width: `${formData.columnWidths.col1}%`, backgroundColor: getCellColor('req-1') }} onDoubleClick={() => handleCellDoubleClick('req-1')}>
                <strong>1. Hospital / Health Facility Name<br/>(اسم المستشفى / المنشأة الصحية):</strong>
                {colorPickerOpen === 'req-1' && <ColorPickerPopup cellId="req-1" onSelect={handleCellColorChange} />}
                <ColResizer colKey="col1" />
                <RowResizer rowKey="req-row-1" />
              </td>
              <td style={{ width: `${formData.columnWidths.col2}%`, backgroundColor: getCellColor('req-2') }} onDoubleClick={() => handleCellDoubleClick('req-2')}>
                <strong>2. Hospital Capacity<br/>(السعة السريرية):</strong>
                {colorPickerOpen === 'req-2' && <ColorPickerPopup cellId="req-2" onSelect={handleCellColorChange} />}
                <ColResizer colKey="col2" />
              </td>
              <td style={{ width: `${formData.columnWidths.col3}%`, backgroundColor: getCellColor('req-3') }} onDoubleClick={() => handleCellDoubleClick('req-3')}>
                <strong>3. Hospital Type<br/>(نوع المستشفى):</strong>
                {colorPickerOpen === 'req-3' && <ColorPickerPopup cellId="req-3" onSelect={handleCellColorChange} />}
                <ColResizer colKey="col3" />
              </td>
              <td style={{ width: `${formData.columnWidths.col4}%`, backgroundColor: getCellColor('req-4') }} onDoubleClick={() => handleCellDoubleClick('req-4')}>
                <strong>4. Region<br/>(المنطقة):</strong>
                {colorPickerOpen === 'req-4' && <ColorPickerPopup cellId="req-4" onSelect={handleCellColorChange} />}
                <ColResizer colKey="col4" />
              </td>
              <td style={{ width: `${formData.columnWidths.col5}%`, backgroundColor: getCellColor('req-5') }} onDoubleClick={() => handleCellDoubleClick('req-5')}>
                <strong>5. City<br/>(المدينة):</strong>
                {colorPickerOpen === 'req-5' && <ColorPickerPopup cellId="req-5" onSelect={handleCellColorChange} />}
                <ColResizer colKey="col5" />
              </td>
              <td style={{ width: `${formData.columnWidths.col6}%`, backgroundColor: getCellColor('req-6') }} onDoubleClick={() => handleCellDoubleClick('req-6')}>
                <strong>6. Date<br/>(التاريخ):</strong>
                {colorPickerOpen === 'req-6' && <ColorPickerPopup cellId="req-6" onSelect={handleCellColorChange} />}
                <ColResizer colKey="col6" />
              </td>
            </tr>
            <tr style={{ height: getRowHeight('req-row-2') }}>
              <td style={{ backgroundColor: getCellColor('req-1-val') }} onDoubleClick={() => handleCellDoubleClick('req-1-val')}>
                <div className="no-print">
                  <select value={formData.facility_name} onChange={(e) => handleFacilityChange(e.target.value)} style={{ width: '100%', padding: '2px', fontSize: '8px' }}>
                    <option value="">اختر المنشأة</option>
                    {!isLoadingCenters && healthCenters.map(center => (
                      <option key={center.id} value={center.اسم_المركز}>{center.اسم_المركز}</option>
                    ))}
                  </select>
                </div>
                <span className="print-only" style={{ fontWeight: 'bold', fontSize: `${formData.facilityNameFontSize || 9}px` }}>{formData.facility_name}</span>
                {colorPickerOpen === 'req-1-val' && <ColorPickerPopup cellId="req-1-val" onSelect={handleCellColorChange} />}
                <RowResizer rowKey="req-row-2" />
              </td>
              <td style={{ backgroundColor: getCellColor('req-2-val') }} onDoubleClick={() => handleCellDoubleClick('req-2-val')}>
                <input type="text" value={formData.capacity} onChange={(e) => handleChange('capacity', e.target.value)} />
                {colorPickerOpen === 'req-2-val' && <ColorPickerPopup cellId="req-2-val" onSelect={handleCellColorChange} />}
              </td>
              <td style={{ backgroundColor: getCellColor('req-3-val') }} onDoubleClick={() => handleCellDoubleClick('req-3-val')}>
                <input type="text" value={formData.facility_type} onChange={(e) => handleChange('facility_type', e.target.value)} />
                {colorPickerOpen === 'req-3-val' && <ColorPickerPopup cellId="req-3-val" onSelect={handleCellColorChange} />}
              </td>
              <td style={{ backgroundColor: getCellColor('req-4-val') }} onDoubleClick={() => handleCellDoubleClick('req-4-val')}>
                <input type="text" value={formData.region} onChange={(e) => handleChange('region', e.target.value)} />
                {colorPickerOpen === 'req-4-val' && <ColorPickerPopup cellId="req-4-val" onSelect={handleCellColorChange} />}
              </td>
              <td style={{ backgroundColor: getCellColor('req-5-val') }} onDoubleClick={() => handleCellDoubleClick('req-5-val')}>
                <input type="text" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
                {colorPickerOpen === 'req-5-val' && <ColorPickerPopup cellId="req-5-val" onSelect={handleCellColorChange} />}
              </td>
              <td style={{ backgroundColor: getCellColor('req-6-val') }} onDoubleClick={() => handleCellDoubleClick('req-6-val')}>
                <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} />
                {colorPickerOpen === 'req-6-val' && <ColorPickerPopup cellId="req-6-val" onSelect={handleCellColorChange} />}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Request Type */}
        <div className="section-header mb-2" style={{ backgroundColor: getCellColor('req-type-header', formData.sectionColor), position: 'relative', fontSize: `${getCellFontSize('req-type-header', 10)}px`, fontWeight: getCellFontWeight('req-type-header', 'bold') }} onDoubleClick={() => handleCellDoubleClick('req-type-header')}>
          نوع الطلب (Request Type)
          {cellMenuOpen === 'req-type-header' && <CellMenuPopup cellId="req-type-header" />}
          {colorPickerOpen === 'req-type-header' && <ColorPickerPopup cellId="req-type-header" onSelect={handleCellColorChange} />}
          {textEditorOpen === 'req-type-header' && <TextEditorPopup cellId="req-type-header" />}
        </div>
        
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td style={{ width: '25%' }}><strong>7. Purpose of Request<br/>(الغرض من الطلب):</strong></td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="request_type" value="new" checked={formData.request_type === 'new'} onChange={(e) => handleChange('request_type', e.target.value)} /> New (جديد)</label>
              </td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="request_type" value="expansion" checked={formData.request_type === 'expansion'} onChange={(e) => handleChange('request_type', e.target.value)} /> Expansion (توسع)</label>
              </td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="request_type" value="other" checked={formData.request_type === 'other'} onChange={(e) => handleChange('request_type', e.target.value)} /> Other (أخرى)</label>
              </td>
            </tr>
            <tr>
              <td colSpan="4">
                <strong>If "Other", Please Describe the Reason (إذا كانت الإجابة "أخرى" الرجاء كتابة السبب):</strong>
                <textarea rows="2" value={formData.request_purpose_other} onChange={(e) => handleChange('request_purpose_other', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Priority Level */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td style={{ width: '25%' }}><strong>8. Request Priority level<br/>(مستوى أولوية الطلب):</strong></td>
              <td style={{ width: '18.75%', textAlign: 'center' }}>
                <label><input type="radio" name="priority" value="critical" checked={formData.priority_level === 'critical'} onChange={(e) => handleChange('priority_level', e.target.value)} /> Critical (شديد الأهمية)</label>
              </td>
              <td style={{ width: '18.75%', textAlign: 'center' }}>
                <label><input type="radio" name="priority" value="high" checked={formData.priority_level === 'high'} onChange={(e) => handleChange('priority_level', e.target.value)} /> High (عالي الأهمية)</label>
              </td>
              <td style={{ width: '18.75%', textAlign: 'center' }}>
                <label><input type="radio" name="priority" value="moderate" checked={formData.priority_level === 'moderate'} onChange={(e) => handleChange('priority_level', e.target.value)} /> Moderate (متوسط الأهمية)</label>
              </td>
              <td style={{ width: '18.75%', textAlign: 'center' }}>
                <label><input type="radio" name="priority" value="minor" checked={formData.priority_level === 'minor'} onChange={(e) => handleChange('priority_level', e.target.value)} /> Minor (ضعيف الأهمية)</label>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Device/Item Information */}
        <div className="section-header mb-2" style={{ backgroundColor: getCellColor('device-header', formData.sectionColor), position: 'relative', fontSize: `${getCellFontSize('device-header', 10)}px`, fontWeight: getCellFontWeight('device-header', 'bold') }} onDoubleClick={() => handleCellDoubleClick('device-header')}>
          معلومات الجهاز/البند (Device/Item Information)
          {cellMenuOpen === 'device-header' && <CellMenuPopup cellId="device-header" />}
          {colorPickerOpen === 'device-header' && <ColorPickerPopup cellId="device-header" onSelect={handleCellColorChange} />}
          {textEditorOpen === 'device-header' && <TextEditorPopup cellId="device-header" />}
        </div>

        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td style={{ width: '30%' }}><strong>9. Device Type (نوع الجهاز):</strong></td>
              <td style={{ width: '35%', textAlign: 'center' }}>
                <label><input type="radio" name="device_type" value="capital" checked={formData.device_type === 'capital'} onChange={(e) => handleChange('device_type', e.target.value)} /> Capital equipment (جهاز عادي)</label>
              </td>
              <td style={{ width: '35%', textAlign: 'center' }}>
                <label><input type="radio" name="device_type" value="other" checked={formData.device_type === 'other'} onChange={(e) => handleChange('device_type', e.target.value)} /> Other (أخرى)</label>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>If "Other", Please Describe the Type (إذا كانت الإجابة "أخرى" الرجاء كتابة النوع):</strong>
                <input type="text" value={formData.device_type_other} onChange={(e) => handleChange('device_type_other', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>10. Device / Item Name (اسم الجهاز أو البند):</strong>
                <div className="no-print">
                  <select value={formData.device_name} onChange={(e) => handleChange('device_name', e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '4px', fontSize: '9px', border: '1px solid #ccc' }}>
                    <option value="">اختر الجهاز أو البند</option>
                    {DEVICE_OPTIONS.map(device => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </select>
                  {formData.device_name === 'أخرى' && (
                    <input type="text" placeholder="أدخل اسم الجهاز" onChange={(e) => handleChange('device_name', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
                  )}
                </div>
                <div className="print-only" style={{ marginTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>{formData.device_name}</div>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>11. Quantity (الكمية):</strong>
                <input type="number" value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>12. Item Code If Non medical (رقم البند في حال لم يكن طبي):</strong>
                <input type="text" value={formData.item_code} onChange={(e) => handleChange('item_code', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
              </td>
            </tr>
            <tr>
              <td style={{ width: '50%' }}><strong>13. Is the Site of the Requested Item Ready?<br/>(هل يوجد مكان جاهز للجهاز المطلوب):</strong></td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="site_ready" value="yes" checked={formData.site_ready === 'yes'} onChange={(e) => handleChange('site_ready', e.target.value)} /> Yes (نعم)</label>
              </td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="site_ready" value="no" checked={formData.site_ready === 'no'} onChange={(e) => handleChange('site_ready', e.target.value)} /> No (لا)</label>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>If Yes, State the Area/ Room? (إذا كانت الإجابة بنعم حدد مكان وغرفة الجهاز):</strong>
                <input type="text" value={formData.site_area_room} onChange={(e) => handleChange('site_area_room', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
              </td>
            </tr>
            <tr>
              <td style={{ width: '50%' }}><strong>14. Does Item Require Approval from Another Committee or Department?<br/>(هل يستطلب الجهاز الحصول على الموافقة من لجنة أو إدارة أخرى):</strong></td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="requires_approval" value="yes" checked={formData.requires_approval === 'yes'} onChange={(e) => handleChange('requires_approval', e.target.value)} /> Yes (نعم)</label>
              </td>
              <td style={{ width: '25%', textAlign: 'center' }}>
                <label><input type="radio" name="requires_approval" value="no" checked={formData.requires_approval === 'no'} onChange={(e) => handleChange('requires_approval', e.target.value)} /> No (لا)</label>
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>If Yes, Please Attach them (إذا كانت الإجابة بنعم الرجاء إرفاق الموافقات):</strong>
                <textarea rows="2" value={formData.approval_attachments} onChange={(e) => handleChange('approval_attachments', e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures Section */}
        <div className="section-header mb-2" style={{ backgroundColor: getCellColor('sig-header', formData.sectionColor), position: 'relative', fontSize: `${getCellFontSize('sig-header', 10)}px`, fontWeight: getCellFontWeight('sig-header', 'bold') }} onDoubleClick={() => handleCellDoubleClick('sig-header')}>
          (التوقيعات للموافقة على استكمال الطلب) (Signatures for Request Completion Approval)
          {cellMenuOpen === 'sig-header' && <CellMenuPopup cellId="sig-header" />}
          {colorPickerOpen === 'sig-header' && <ColorPickerPopup cellId="sig-header" onSelect={handleCellColorChange} />}
          {textEditorOpen === 'sig-header' && <TextEditorPopup cellId="sig-header" />}
        </div>

        <table className="form-table">
          <tbody>
            <tr style={{ height: getRowHeight('sig-1') }}>
              <td style={{ width: '50%', backgroundColor: getCellColor('sig-1-label'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-1-label')}>
                <strong>مدير المنشأة</strong>
                {colorPickerOpen === 'sig-1-label' && <ColorPickerPopup cellId="sig-1-label" onSelect={handleCellColorChange} />}
                <RowResizer rowKey="sig-1" />
              </td>
              <td style={{ width: '50%', backgroundColor: getCellColor('sig-1-value'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-1-value')}>
                <input type="text" value={formData.facility_manager_signature} onChange={(e) => handleChange('facility_manager_signature', e.target.value)} placeholder="الاسم" style={{ textAlign: 'center' }} />
                {colorPickerOpen === 'sig-1-value' && <ColorPickerPopup cellId="sig-1-value" onSelect={handleCellColorChange} />}
              </td>
            </tr>
            <tr style={{ height: getRowHeight('sig-2') }}>
              <td style={{ backgroundColor: getCellColor('sig-2-label'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-2-label')}>
                <strong>المدير التنفيذي للمستشفيات/المراكز الصحية</strong>
                {colorPickerOpen === 'sig-2-label' && <ColorPickerPopup cellId="sig-2-label" onSelect={handleCellColorChange} />}
                <RowResizer rowKey="sig-2" />
              </td>
              <td style={{ backgroundColor: getCellColor('sig-2-value'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-2-value')}>
                <input type="text" value={formData.executive_director_signature} onChange={(e) => handleChange('executive_director_signature', e.target.value)} placeholder="الاسم" style={{ textAlign: 'center' }} />
                {colorPickerOpen === 'sig-2-value' && <ColorPickerPopup cellId="sig-2-value" onSelect={handleCellColorChange} />}
              </td>
            </tr>
            <tr style={{ height: getRowHeight('sig-3') }}>
              <td style={{ backgroundColor: getCellColor('sig-3-label'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-3-label')}>
                <strong>مدير التجهيزات بالتجمع الصحي</strong>
                {colorPickerOpen === 'sig-3-label' && <ColorPickerPopup cellId="sig-3-label" onSelect={handleCellColorChange} />}
                <RowResizer rowKey="sig-3" />
              </td>
              <td style={{ backgroundColor: getCellColor('sig-3-value'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-3-value')}>
                <input type="text" value={formData.equipment_director_signature} onChange={(e) => handleChange('equipment_director_signature', e.target.value)} placeholder="الاسم" style={{ textAlign: 'center' }} />
                {colorPickerOpen === 'sig-3-value' && <ColorPickerPopup cellId="sig-3-value" onSelect={handleCellColorChange} />}
              </td>
            </tr>
            <tr style={{ height: getRowHeight('sig-4') }}>
              <td style={{ backgroundColor: getCellColor('sig-4-label'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-4-label')}>
                <strong>نائب الرئيس التنفيذي للعمليات التشغيلية</strong>
                {colorPickerOpen === 'sig-4-label' && <ColorPickerPopup cellId="sig-4-label" onSelect={handleCellColorChange} />}
                <RowResizer rowKey="sig-4" />
              </td>
              <td style={{ backgroundColor: getCellColor('sig-4-value'), textAlign: 'center' }} onDoubleClick={() => handleCellDoubleClick('sig-4-value')}>
                <input type="text" value={formData.deputy_ceo_signature} onChange={(e) => handleChange('deputy_ceo_signature', e.target.value)} placeholder="الاسم" style={{ textAlign: 'center' }} />
                {colorPickerOpen === 'sig-4-value' && <ColorPickerPopup cellId="sig-4-value" onSelect={handleCellColorChange} />}
              </td>
            </tr>
          </tbody>
        </table>

      </div>

      {/* نسخ الطباعة المتعددة */}
      {bulkPrintMode && selectedCenters.map((centerName, index) => (
        <div key={centerName} className="print-container max-w-[210mm] mx-auto bg-white" style={{ minHeight: '297mm', padding: '8mm', pageBreakBefore: 'always' }}>
          
          {/* Header with Logo */}
          <table className="form-table mb-4">
            <tbody>
              <tr>
                <td style={{ width: '35%', color: formData.headerColor, textAlign: 'center', backgroundColor: getCellColor('header-ar-1'), fontWeight: 'bold' }}>المملكة العربية السعودية</td>
                <td rowSpan="4" className="logo-cell" style={{ width: '30%', textAlign: 'center', verticalAlign: 'middle', padding: '5px' }}>
                  <img src={formData.customLogo || DEFAULT_LOGO} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </td>
                <td style={{ width: '35%', color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>KINGDOM OF SAUDI ARABIA</td>
              </tr>
              <tr>
                <td style={{ color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>وزارة الصحة</td>
                <td style={{ color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>MINISTRY OF HEALTH</td>
              </tr>
              <tr>
                <td style={{ color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>الإدارة العامة للتجهيزات والإحلال</td>
                <td style={{ color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>GENERAL DIRECTORATE OF EQUIPMENT & REPLACEMENT</td>
              </tr>
              <tr>
                <td style={{ color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>إدارة التخطيط الطبي</td>
                <td style={{ color: formData.headerColor, textAlign: 'center', fontWeight: 'bold' }}>DEPARTMENT OF MEDICAL PLANNING</td>
              </tr>
            </tbody>
          </table>

          <div className="section-header mb-2" style={{ backgroundColor: formData.sectionColor }}>
            نموذج طلب الأجهزة الغير طبية والأثاث<br/>Non-Medical Device/Furniture Requisition Form
          </div>

          <div className="section-header mb-2" style={{ backgroundColor: formData.sectionColor }}>
            معلومات الطلب (Request Information)
          </div>

          <table className="form-table mb-2">
            <tbody>
              <tr>
                <td><strong>1. Hospital / Health Facility Name:</strong></td>
                <td><strong>2. Hospital Capacity:</strong></td>
                <td><strong>3. Hospital Type:</strong></td>
                <td><strong>4. Region:</strong></td>
                <td><strong>5. City:</strong></td>
                <td><strong>6. Date:</strong></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', fontSize: `${formData.facilityNameFontSize || 9}px` }}>{centerName}</td>
                <td>{formData.capacity}</td>
                <td>{formData.facility_type}</td>
                <td>{formData.region}</td>
                <td>{formData.city}</td>
                <td>{formData.date}</td>
              </tr>
            </tbody>
          </table>

          <div className="section-header mb-2" style={{ backgroundColor: formData.sectionColor }}>نوع الطلب (Request Type)</div>
          <table className="form-table mb-2">
            <tbody>
              <tr>
                <td><strong>7. Purpose of Request:</strong></td>
                <td>{formData.request_type === 'new' ? '☑ New' : '☐ New'}</td>
                <td>{formData.request_type === 'expansion' ? '☑ Expansion' : '☐ Expansion'}</td>
                <td>{formData.request_type === 'other' ? '☑ Other' : '☐ Other'}</td>
              </tr>
              {formData.request_purpose_other && <tr><td colSpan="4">Other: {formData.request_purpose_other}</td></tr>}
            </tbody>
          </table>

          <table className="form-table mb-2">
            <tbody>
              <tr>
                <td><strong>8. Priority:</strong></td>
                <td>{formData.priority_level === 'critical' ? '☑' : '☐'} Critical</td>
                <td>{formData.priority_level === 'high' ? '☑' : '☐'} High</td>
                <td>{formData.priority_level === 'moderate' ? '☑' : '☐'} Moderate</td>
                <td>{formData.priority_level === 'minor' ? '☑' : '☐'} Minor</td>
              </tr>
            </tbody>
          </table>

          <div className="section-header mb-2" style={{ backgroundColor: formData.sectionColor }}>معلومات الجهاز/البند (Device/Item Information)</div>
          <table className="form-table mb-2">
            <tbody>
              <tr>
                <td><strong>9. Device Type:</strong></td>
                <td>{formData.device_type === 'capital' ? '☑' : '☐'} Capital equipment</td>
                <td>{formData.device_type === 'other' ? '☑' : '☐'} Other: {formData.device_type_other}</td>
              </tr>
              <tr><td colSpan="3"><strong>10. Device/Item Name:</strong> {formData.device_name}</td></tr>
              <tr><td colSpan="3"><strong>11. Quantity:</strong> {formData.quantity}</td></tr>
              <tr><td colSpan="3"><strong>12. Item Code:</strong> {formData.item_code}</td></tr>
              <tr>
                <td><strong>13. Site Ready:</strong></td>
                <td>{formData.site_ready === 'yes' ? '☑ Yes' : '☐ Yes'}</td>
                <td>{formData.site_ready === 'no' ? '☑ No' : '☐ No'}</td>
              </tr>
              {formData.site_area_room && <tr><td colSpan="3">Area/Room: {formData.site_area_room}</td></tr>}
              <tr>
                <td><strong>14. Requires Approval:</strong></td>
                <td>{formData.requires_approval === 'yes' ? '☑ Yes' : '☐ Yes'}</td>
                <td>{formData.requires_approval === 'no' ? '☑ No' : '☐ No'}</td>
              </tr>
            </tbody>
          </table>

          <div className="section-header mb-2" style={{ backgroundColor: formData.sectionColor }}>التوقيعات (Signatures)</div>
          <table className="form-table">
            <tbody>
              <tr>
                <td style={{ textAlign: 'center' }}><strong>مدير المنشأة</strong></td>
                <td style={{ textAlign: 'center' }}>{getManagerName(centerName)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}><strong>المدير التنفيذي</strong></td>
                <td style={{ textAlign: 'center' }}>{formData.executive_director_signature}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}><strong>مدير التجهيزات</strong></td>
                <td style={{ textAlign: 'center' }}>{formData.equipment_director_signature}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}><strong>نائب الرئيس التنفيذي</strong></td>
                <td style={{ textAlign: 'center' }}>{formData.deputy_ceo_signature}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}