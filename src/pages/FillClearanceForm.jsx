import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Printer, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    reason: "",
    decisionNumber: "",
    decisionDateDay: "",
    decisionDateMonth: "",
    decisionDateYear: "",
    directSupervisorName: "",
    custodianName: "",
    treasurerName: "",
    accountantName: "",
    hrManagerName: "أ / تركي بن عبد الرحمن الغامدي"
  });

  useEffect(() => {
    loadData();
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

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee);
    
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeName: employee.full_name_arabic || "",
        position: employee.position || "",
        positionNumber: employee.رقم_الموظف || "",
        nationality: employee.nationality || "سعودي",
        idNumber: employee.رقم_الهوية || "",
        workPlace: employee.المركز_الصحي || ""
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

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{`
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
            width: 100% !important;
            height: 100% !important;
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
            min-height: 297mm !important;
            height: 297mm !important;
            padding: 15mm 20mm !important;
            margin: 0 !important;
            direction: rtl !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            box-shadow: none !important;
            background-color: white !important;
          }
          .no-print { 
            display: none !important; 
          }
          .print-only {
            display: inline !important;
          }
          @page { 
            size: A4 portrait; 
            margin: 0 !important;
          }
        }
        .editable-cell {
          padding: 2px 4px;
          outline: none;
          min-height: 20px;
          display: inline-block;
        }
        .editable-cell:focus {
          background-color: #f0f9ff;
        }
        .print-only {
          display: none;
        }
      `}</style>

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
          </div>
        </div>
        
        {/* Additional form fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">السبب</label>
            <Input 
              value={formData.reason} 
              onChange={(e) => handleInputChange('reason', e.target.value)}
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
            <label className="text-sm font-medium">تاريخ القرار (يوم/شهر/سنة)</label>
            <div className="flex gap-1">
              <Input 
                value={formData.decisionDateDay} 
                onChange={(e) => handleInputChange('decisionDateDay', e.target.value)}
                placeholder="يوم"
                className="w-16"
              />
              <Input 
                value={formData.decisionDateMonth} 
                onChange={(e) => handleInputChange('decisionDateMonth', e.target.value)}
                placeholder="شهر"
                className="w-16"
              />
              <Input 
                value={formData.decisionDateYear} 
                onChange={(e) => handleInputChange('decisionDateYear', e.target.value)}
                placeholder="سنة"
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <div 
        ref={printRef}
        className="print-area max-w-4xl mx-auto bg-white shadow-lg"
        style={{ 
          padding: '15mm 20mm',
          fontFamily: 'Arial, sans-serif',
          minHeight: '297mm',
          position: 'relative'
        }}
      >
        {/* Header with logos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          {/* Right Logo - MOH */}
          <div style={{ width: '80px' }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Saudi_Ministry_of_Health_Logo.svg/1200px-Saudi_Ministry_of_Health_Logo.svg.png" 
              alt="MOH Logo" 
              style={{ width: '70px', height: 'auto' }}
            />
          </div>
          
          {/* Left Logo - BAIN */}
          <div style={{ width: '100px', textAlign: 'left' }}>
            <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '24px', fontFamily: 'Arial' }}>
              <span style={{ letterSpacing: '2px' }}>ب ـيـ ـن</span>
            </div>
            <div style={{ color: '#0ea5e9', fontSize: '14px', fontWeight: 'bold' }}>BAIN</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#333',
            textDecoration: 'underline',
            textUnderlineOffset: '6px'
          }}>
            براءه ذمة
          </h1>
        </div>

        {/* Employee Info Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '25px',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>الاسـم</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>الوظيفه</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>رقم الوظيفة</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>الجنسية</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>رقم الهوية</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>جهة العمل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', minHeight: '30px' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('employeeName', e.currentTarget.textContent)}>
                  {formData.employeeName || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('position', e.currentTarget.textContent)}>
                  {formData.position || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('positionNumber', e.currentTarget.textContent)}>
                  {formData.positionNumber || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('nationality', e.currentTarget.textContent)}>
                  {formData.nationality || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('idNumber', e.currentTarget.textContent)}>
                  {formData.idNumber || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('workPlace', e.currentTarget.textContent)}>
                  {formData.workPlace || '\u00A0'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Certificate Text */}
        <div style={{ 
          textAlign: 'center', 
          lineHeight: '2.2',
          fontSize: '14px',
          marginBottom: '30px',
          padding: '0 20px'
        }}>
          <p style={{ marginBottom: '15px' }}>
            تشهد إدارة الموارد البشرية بالرعاية الأولية بتجمع المدينة المنورة الصحي
          </p>
          <p style={{ marginBottom: '15px' }}>
            بأن الموضح اسمه أعلاه بريء الذمة من الناحية الإدارية والمالية وقد سلم جميع
          </p>
          <p style={{ marginBottom: '15px' }}>
            ما بعهدته وذلك نظراً لـ 
            <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('reason', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 20px', minWidth: '150px', display: 'inline-block' }}>
              {formData.reason || '...........................'}
            </span>
            بناءً على القرار
          </p>
          <p>
            رقم / 
            <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionNumber', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 10px', minWidth: '80px', display: 'inline-block' }}>
              {formData.decisionNumber || '........................'}
            </span>
            وتاريـخ 
            <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionDateDay', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '30px', display: 'inline-block' }}>
              {formData.decisionDateDay || '.....'}
            </span>
            /
            <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionDateMonth', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '30px', display: 'inline-block' }}>
              {formData.decisionDateMonth || '.....'}
            </span>
            /
            <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('decisionDateYear', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #333', padding: '0 5px', minWidth: '40px', display: 'inline-block' }}>
              {formData.decisionDateYear || '14.........'}
            </span>
            هـ .
          </p>
        </div>

        {/* Signature Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            وعلى ذلك جرى التوقيع :
          </p>
        </div>

        {/* Signatures Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '40px',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '40px' }}>م</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>الوظيفة</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>الاسم</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '100px' }}>التوقيع</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>١</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>الرئيس المباشر</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('directSupervisorName', e.currentTarget.textContent)}>
                  {formData.directSupervisorName || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>٢</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>امين العهدة في المركز / ادارة</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('custodianName', e.currentTarget.textContent)}>
                  {formData.custodianName || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>٣</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>أمين الصندوق بالرعاية الأولية</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('treasurerName', e.currentTarget.textContent)}>
                  {formData.treasurerName || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>٤</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>محاسب الرواتب الموارد البشرية بالرعاية الأولية</td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('accountantName', e.currentTarget.textContent)}>
                  {formData.accountantName || '\u00A0'}
                </span>
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}></td>
            </tr>
          </tbody>
        </table>

        {/* HR Manager Signature */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #333', width: '250px', paddingTop: '15px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('hrManagerName', e.currentTarget.textContent)}>
              {formData.hrManagerName}
            </span>
          </p>
          <p style={{ fontSize: '12px', color: '#555', marginBottom: '5px' }}>
            مدير إدارة الموارد البشرية بالرعاية الأولية
          </p>
          <p style={{ fontSize: '12px', color: '#555' }}>
            بتجمع المدينة المنورة الصحي
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          position: 'absolute', 
          bottom: '15mm', 
          left: '20mm', 
          right: '20mm',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #eee',
          paddingTop: '10px'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '12px' }}>
              تجمع المدينة المنورة الصحي
            </div>
            <div style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold' }}>
              Madinah Health Cluster
            </div>
            <div style={{ color: '#888', fontSize: '9px' }}>
              Empowered by Health Holding co.
            </div>
          </div>
          <div style={{ width: '60px', textAlign: 'left' }}>
            <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '16px' }}>
              ب ـيـ ـن
            </div>
            <div style={{ color: '#0ea5e9', fontSize: '10px', fontWeight: 'bold' }}>BAIN</div>
          </div>
        </div>
      </div>
    </div>
  );
}