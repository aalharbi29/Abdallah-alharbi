import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Printer, Download, Loader2, X, RotateCcw, Stamp, PenTool, Move, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FillClearanceForm() {
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const printRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeName: "",
    position: "",
    positionNumber: "",
    nationality: "",
    idNumber: "",
    workPlace: "",
    decisionType: "",
    decisionNumber: "",
    decisionDateDay: "",
    decisionDateMonth: "",
    decisionDateYear: "144",
    directSupervisorName: "",
    custodianName: "",
    accountantName: "",
    hrManagerName: "أ.تركي بن عبدالرحمن الغامدي",
    headerDepartmentName: "إدارة الموارد البشرية بالرعاية الأولية بتجمع المدينة المنورة",
    hrManagerTitle: "مدير إدارة الموارد البشرية بالرعاية الأولية",
    certificateText1: "تشهد الموارد البشرية بالرعاية الاولية بتجمع المدينة المنورة بأن الموضح اسمه وبياناته",
    certificateText2: "أعلاه بريء الذمة من الناحية الإدارية والمالية وقد سلم جميع ما بعهدته وذلك نظراً .",
    decisionText: "لقرار"
  });

  // الأختام والتوقيعات
  const [systemStamps, setSystemStamps] = useState([]);
  const [systemSignatures, setSystemSignatures] = useState([]);
  const [stampSettings, setStampSettings] = useState({
    showStamp: false,
    selectedStamp: null,
    position: { x: 400, y: 650 },
    size: 80
  });
  const [signatureSettings, setSignatureSettings] = useState({
    showSignature: false,
    selectedSignature: null,
    position: { x: 350, y: 580 },
    size: 100
  });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // حالة إظهار/إخفاء العناصر
  const [visibleSections, setVisibleSections] = useState({
    employeeTable: true,
    certificateText: true,
    decisionLine: true,
    signatureSection: true,
    signaturesTable: true,
    hrManagerSection: true
  });

  const toggleSection = (section) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const resetAllSections = () => {
    setVisibleSections({
      employeeTable: true,
      certificateText: true,
      decisionLine: true,
      signatureSection: true,
      signaturesTable: true,
      hrManagerSection: true
    });
  };

  useEffect(() => {
    loadData();
    loadStampsAndSignatures();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [employeesData, centersData] = await Promise.all([
        base44.entities.Employee.list(),
        base44.entities.HealthCenter.list()
      ]);
      setEmployees(employeesData || []);
      setHealthCenters(centersData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStampsAndSignatures = async () => {
    try {
      const data = await base44.entities.StampSignature.list('-created_date', 50);
      const items = Array.isArray(data) ? data : [];
      setSystemStamps(items.filter(item => item.type === 'stamp' && item.is_active !== false));
      setSystemSignatures(items.filter(item => item.type === 'signature' && item.is_active !== false));
    } catch (error) {
      console.error('Error loading stamps:', error);
    }
  };

  // دوال السحب والإفلات
  const handleMouseDown = (e, type) => {
    e.preventDefault();
    const rect = printRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentPos = type === 'stamp' ? stampSettings.position : signatureSettings.position;
    setDragOffset({
      x: e.clientX - rect.left - currentPos.x,
      y: e.clientY - rect.top - currentPos.y
    });
    setDragging(type);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !printRef.current) return;

    const rect = printRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 80));

    if (dragging === 'stamp') {
      setStampSettings(prev => ({ ...prev, position: { x, y } }));
    } else if (dragging === 'signature') {
      setSignatureSettings(prev => ({ ...prev, position: { x, y } }));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset]);

  const handleEmployeeSelect = async (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee);
    
    if (employee) {
      // Find direct supervisor name from health center
      let supervisorName = "";
      if (employee.المركز_الصحي) {
        const center = healthCenters.find(c => c.اسم_المركز === employee.المركز_الصحي);
        if (center && center.المدير) {
          // Find director name from employees
          const director = employees.find(e => e.id === center.المدير);
          supervisorName = director?.full_name_arabic || "";
        }
      }
      
      setFormData(prev => ({
        ...prev,
        employeeName: employee.full_name_arabic || "",
        position: employee.position || "",
        positionNumber: employee.رقم_الموظف || "",
        nationality: employee.nationality || "",
        idNumber: employee.رقم_الهوية || "",
        workPlace: employee.المركز_الصحي || "",
        directSupervisorName: supervisorName
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`براءة_ذمة_${formData.employeeName || 'موظف'}.pdf`);
    toast.success("تم تصدير الملف بنجاح");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  const formStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
    
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        width: 210mm !important;
        height: 297mm !important;
      }
      body * { 
        visibility: hidden; 
      }
      .print-area, .print-area * { 
        visibility: visible !important; 
      }
      .print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        background-color: white !important;
      }
      .no-print { 
        display: none !important; 
      }
      @page { 
        size: A4 portrait; 
        margin: 0 !important;
      }
    }
    .editable-field {
      outline: none;
      min-width: 20px;
      display: inline-block;
    }
    .editable-field:focus {
      background-color: #e0f2fe;
    }
    @media screen {
      .editable-field:hover {
        background-color: #f0f9ff;
      }
    }
    .deletable-section {
      position: relative;
    }
    @media screen {
      .deletable-section:hover .delete-btn {
        opacity: 1;
      }
    }
    .delete-btn {
      opacity: 0;
      transition: opacity 0.2s;
      position: absolute;
      top: -8px;
      left: -8px;
      z-index: 10;
    }
    @media print {
      .delete-btn {
        display: none !important;
      }
    }
    .font-bold-title {
      font-family: 'Cairo', 'GE SS Two Bold', Arial, sans-serif;
      font-weight: 700;
    }
    .font-regular {
      font-family: 'Cairo', 'GE SS Two', Arial, sans-serif;
      font-weight: 400;
    }
  `;

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{formStyles}</style>

      {/* Controls */}
      <div className="no-print max-w-4xl mx-auto mb-4 bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={handleEmployeeSelect}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="اختر الموظف..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name_arabic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            <Button onClick={handleExportPDF} className="gap-2 bg-red-600 hover:bg-red-700">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button onClick={resetAllSections} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              استعادة الكل
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">نوع القرار</label>
            <Input 
              value={formData.decisionType} 
              onChange={(e) => handleInputChange('decisionType', e.target.value)}
              placeholder="نقل / استقالة / ..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">رقم القرار</label>
            <Input 
              value={formData.decisionNumber} 
              onChange={(e) => handleInputChange('decisionNumber', e.target.value)}
              placeholder="رقم القرار"
            />
          </div>
          <div>
            <label className="text-sm font-medium">تاريخ القرار</label>
            <div className="flex gap-1">
              <Input 
                value={formData.decisionDateDay} 
                onChange={(e) => handleInputChange('decisionDateDay', e.target.value)}
                placeholder="يوم"
                className="w-14"
              />
              <Input 
                value={formData.decisionDateMonth} 
                onChange={(e) => handleInputChange('decisionDateMonth', e.target.value)}
                placeholder="شهر"
                className="w-14"
              />
              <Input 
                value={formData.decisionDateYear} 
                onChange={(e) => handleInputChange('decisionDateYear', e.target.value)}
                placeholder="سنة"
                className="w-16"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Preview - Exact Match to PDF */}
      <div 
        ref={printRef}
        className="print-area max-w-4xl mx-auto bg-white shadow-lg"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          padding: '0',
          margin: '0 auto',
          position: 'relative',
          boxSizing: 'border-box',
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/b6c7b20f8_ChatGPTImage1202605_58_03.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Header Section - White background with text and logo */}
        <div style={{ 
            padding: '27mm 39mm 0 10mm',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
            <div className="font-bold-title editable-field" 
                 contentEditable 
                 suppressContentEditableWarning 
                 onBlur={(e) => handleInputChange('headerDepartmentName', e.currentTarget.textContent)}
                 style={{ 
                              color: '#3498db', 
                              fontSize: '14px', 
                              textAlign: 'left',
                              borderRight: '3px solid #3498db',
                              paddingRight: '10px',
                              paddingTop: '2mm',
                              paddingBottom: '2mm'
                            }}>
                              {formData.headerDepartmentName}
                            </div>

          </div>

        {/* Main Content - pushed down */}
        <div style={{ padding: '0 10mm', marginTop: '35mm' }}>
          
          {/* Title Row */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h1 className="font-bold-title" style={{ 
              fontSize: '18px', 
              color: '#333',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              margin: '0'
            }}>
              بـراءة ذمـة
            </h1>
          </div>

          {/* Employee Info Table */}
          {visibleSections.employeeTable && (
          <div className="deletable-section">
            <button className="delete-btn no-print bg-red-500 hover:bg-red-600 text-white rounded-full p-1" onClick={() => toggleSection('employeeTable')}>
              <X className="w-4 h-4" />
            </button>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '25px',
            fontSize: '12px'
          }}>
            <thead>
              <tr>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>الاســـــــم</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>الوظيفه</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>رقم الوظيفة</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>الجنسية</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>رقم الهوية</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>جهة العمل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #888', padding: '12px 8px', textAlign: 'center', minHeight: '35px', height: '35px', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                        <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('employeeName', e.currentTarget.textContent)}>
                                          {formData.employeeName || '\u00A0'}
                                        </span>
                                      </td>
                                      <td style={{ border: '1px solid #888', padding: '12px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                        <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('position', e.currentTarget.textContent)}>
                                          {formData.position || '\u00A0'}
                                        </span>
                                      </td>
                                      <td style={{ border: '1px solid #888', padding: '12px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                        <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('positionNumber', e.currentTarget.textContent)}>
                                          {formData.positionNumber || '\u00A0'}
                                        </span>
                                      </td>
                                      <td style={{ border: '1px solid #888', padding: '12px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                        <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('nationality', e.currentTarget.textContent)}>
                                          {formData.nationality || '\u00A0'}
                                        </span>
                                      </td>
                                      <td style={{ border: '1px solid #888', padding: '12px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                        <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('idNumber', e.currentTarget.textContent)}>
                                          {formData.idNumber || '\u00A0'}
                                        </span>
                                      </td>
                                      <td style={{ border: '1px solid #888', padding: '12px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                        <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('workPlace', e.currentTarget.textContent)}>
                                          {formData.workPlace || '\u00A0'}
                                        </span>
                                      </td>
              </tr>
            </tbody>
          </table>
          </div>
          )}

          {/* Certificate Text - Centered */}
          {visibleSections.certificateText && (
          <div className="deletable-section">
            <button className="delete-btn no-print bg-red-500 hover:bg-red-600 text-white rounded-full p-1" onClick={() => toggleSection('certificateText')}>
              <X className="w-4 h-4" />
            </button>
          <div className="font-bold-title" style={{ 
            textAlign: 'center', 
            lineHeight: '2.0',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <p style={{ marginBottom: '10px' }}>
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('certificateText1', e.currentTarget.textContent)}>
                {formData.certificateText1}
              </span>
            </p>
            <p style={{ marginBottom: '10px' }}>
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('certificateText2', e.currentTarget.textContent)}>
                {formData.certificateText2}
              </span>
            </p>
            <p style={{ marginBottom: '0' }}>
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionText', e.currentTarget.textContent)}>
                {formData.decisionText}
              </span>{' '}
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionType', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '100px', display: 'inline-block' }}>
                {formData.decisionType || '.........................'}
              </span>
              {' '}ورقم{' '}
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionNumber', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '100px', display: 'inline-block' }}>
                {formData.decisionNumber || '.............................'}
              </span>
              {' '}وتاريخ{' '}
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionDateDay', e.currentTarget.textContent)} style={{ padding: '0 2px' }}>
                {formData.decisionDateDay || '\u00A0\u00A0'}
              </span>
              /
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionDateMonth', e.currentTarget.textContent)} style={{ padding: '0 2px' }}>
                {formData.decisionDateMonth || '\u00A0\u00A0'}
              </span>
              /
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionDateYear', e.currentTarget.textContent)} style={{ padding: '0 2px' }}>
                {formData.decisionDateYear || '144'}
              </span>
              هـ
            </p>
          </div>
          </div>
          )}

          {/* Signature Section Title */}
          {visibleSections.signatureSection && (
          <div className="deletable-section">
            <button className="delete-btn no-print bg-red-500 hover:bg-red-600 text-white rounded-full p-1" onClick={() => toggleSection('signatureSection')}>
              <X className="w-4 h-4" />
            </button>
          <div className="font-bold-title" style={{ textAlign: 'right', marginBottom: '8mm', marginTop: '25px', paddingRight: '5mm' }}>
            <p className="editable-field" contentEditable suppressContentEditableWarning style={{ fontSize: '14px', margin: 0 }}>
              وعلى ذلك جرى التوقيع :
            </p>
          </div>
          </div>
          )}

          {/* Signatures Table - Column widths: م=8%, الوظيفة=42%, الاسم=30%, التوقيع=20% */}
          {visibleSections.signaturesTable && (
          <div className="deletable-section">
            <button className="delete-btn no-print bg-red-500 hover:bg-red-600 text-white rounded-full p-1" onClick={() => toggleSection('signaturesTable')}>
              <X className="w-4 h-4" />
            </button>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '20mm',
            fontSize: '12px'
          }}>
            <thead>
              <tr>
                <th className="font-bold-title" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', backgroundColor: '#f5f5f5', width: '8%' }}>م</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', backgroundColor: '#f5f5f5', width: '38%' }}>الوظيفة</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', backgroundColor: '#f5f5f5', width: '34%' }}>الاسم</th>
                                      <th className="font-bold-title" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', backgroundColor: '#f5f5f5', width: '20%' }}>التوقيع</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                                    <td className="font-regular" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center' }}>1</td>
                                    <td className="editable-field" contentEditable suppressContentEditableWarning style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'right', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>الرئيس المباشر</td>
                                    <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                      <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('directSupervisorName', e.currentTarget.textContent)}>
                                        {formData.directSupervisorName || '\u00A0'}
                                      </span>
                                    </td>
                                    <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center' }}></td>
                                  </tr>
                                  <tr>
                                    <td className="font-regular" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center' }}>2</td>
                                    <td className="editable-field" contentEditable suppressContentEditableWarning style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'right', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>امين العهده في المركز / ادارة</td>
                                    <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                      <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('custodianName', e.currentTarget.textContent)}>
                                        {formData.custodianName || '\u00A0'}
                                      </span>
                                    </td>
                                    <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center' }}></td>
                                  </tr>
                                  <tr>
                                    <td className="font-regular" style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center' }}>3</td>
                                    <td className="editable-field" contentEditable suppressContentEditableWarning style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'right', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>محاسب الرواتب بالموارد البشرية بالرعاية الاولية</td>
                                    <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontFamily: "'Cairo', 'GE SS Two', Arial, sans-serif", fontWeight: 500 }}>
                                      <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('accountantName', e.currentTarget.textContent)}>
                                        {formData.accountantName || '\u00A0'}
                                      </span>
                                    </td>
                                    <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center' }}></td>
                                  </tr>
            </tbody>
          </table>
          </div>
          )}

          {/* HR Manager Signature */}
          {visibleSections.hrManagerSection && (
          <div className="deletable-section">
            <button className="delete-btn no-print bg-red-500 hover:bg-red-600 text-white rounded-full p-1" onClick={() => toggleSection('hrManagerSection')}>
              <X className="w-4 h-4" />
            </button>
          <div style={{ textAlign: 'center' }}>
            <p className="font-bold-title" style={{ fontSize: '16px', marginBottom: '35px' }}>
              <span className="editable-field" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('hrManagerName', e.currentTarget.textContent)}>
                {formData.hrManagerName}
              </span>
            </p>
            <p className="font-bold-title editable-field" 
               contentEditable 
               suppressContentEditableWarning 
               onBlur={(e) => handleInputChange('hrManagerTitle', e.currentTarget.textContent)}
               style={{ fontSize: '13px', color: '#333', marginTop: '0' }}>
              {formData.hrManagerTitle}
            </p>
          </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          position: 'absolute', 
          bottom: '20mm', 
          left: '20mm', 
          right: '10mm',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-end'
        }}>
          {/* Footer Text */}
          <div style={{ textAlign: 'right' }}>
            <div className="font-bold-title" style={{ color: '#3498db', fontSize: '14px', letterSpacing: '1px' }}>
              تجمع المدينة المنورة الصحي
            </div>
            <div className="font-bold-title" style={{ color: '#3498db', fontSize: '13px', letterSpacing: '1px' }}>
              Madinah Health Cluster
            </div>
            <div className="font-regular" style={{ color: '#888', fontSize: '10px', letterSpacing: '0.5px' }}>
              Empowered by Health Holding co.
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}