import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Download, Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

export default function FillEmailRecoveryForm() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const printRef = useRef(null);

  // أعراض الجداول القابلة للتعديل
  const [table1ColWidths, setTable1ColWidths] = useState({ label: 180, value: 400 });
  const [table2ColWidths, setTable2ColWidths] = useState({ label: 180, value: 400 });
  const [resizing, setResizing] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    entityName: "",
    managerName: "",
    managerEmailPhone: "",
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    adminEmail: "",
  });

  // صفوف إضافية قابلة للتعديل
  const [additionalRows, setAdditionalRows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // معالجة تغيير حجم الأعمدة
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      const diff = startX - e.clientX;
      const newWidth = Math.max(100, startWidth + diff);
      
      if (resizing.table === 1) {
        setTable1ColWidths(prev => ({ ...prev, [resizing.col]: newWidth }));
      } else {
        setTable2ColWidths(prev => ({ ...prev, [resizing.col]: newWidth }));
      }
    };

    const handleMouseUp = () => setResizing(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startX, startWidth]);

  const handleResizeStart = (e, table, col, currentWidth) => {
    e.preventDefault();
    setResizing({ table, col });
    setStartX(e.clientX);
    setStartWidth(currentWidth);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [centersData, employeesData] = await Promise.all([
        base44.entities.HealthCenter.list(),
        base44.entities.Employee.list()
      ]);
      setHealthCenters(centersData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCenterChange = (centerId) => {
    const center = healthCenters.find(c => c.id === centerId);
    setSelectedCenter(center);

    if (center) {
      const manager = employees.find(e => e.id === center.المدير);
      
      setFormData(prev => ({
        ...prev,
        entityName: center.اسم_المركز || "",
        managerName: manager?.full_name_arabic || "",
        managerEmailPhone: manager ? `${manager.email || ""} / ${manager.phone || ""}` : "",
        adminEmail: center.ايميل_المركز || "",
        // بيانات المستلم = بيانات مدير المركز
        recipientName: manager?.full_name_arabic || "",
        recipientEmail: manager?.email || "",
        recipientPhone: manager?.phone || ""
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRow = () => {
    setAdditionalRows(prev => [...prev, { label: "", value: "" }]);
  };

  const removeRow = (index) => {
    setAdditionalRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setAdditionalRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
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
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`طلب_استعادة_بريد_${formData.entityName || 'مركز'}.pdf`);
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

  const borderColor = "#1e5f8a"; // أزرق غامق للحدود الخارجية
  const innerBorderColor = "#000000"; // أسود للحدود الداخلية

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            direction: rtl;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 10mm; }
          .resize-handle { display: none !important; }
        }
        .editable-cell {
          min-height: 35px;
          padding: 10px 15px;
          outline: none;
          transition: background-color 0.2s;
          text-align: right;
          direction: rtl;
        }
        .editable-cell:focus {
          background-color: #f0f9ff;
        }
        .editable-cell:hover {
          background-color: #f8fafc;
        }
        table td {
          text-align: right;
          direction: rtl;
        }
        .resize-handle {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: col-resize;
          background: transparent;
          z-index: 10;
        }
        .resize-handle:hover {
          background: rgba(30, 95, 138, 0.3);
        }
      `}</style>

      {/* أزرار التحكم */}
      <div className="no-print max-w-4xl mx-auto mb-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <Select onValueChange={handleCenterChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="اختر المركز الصحي..." />
            </SelectTrigger>
            <SelectContent>
              {healthCenters.map(center => (
                <SelectItem key={center.id} value={center.id}>
                  {center.اسم_المركز}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={addRow} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة صف
          </Button>
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

      {/* النموذج القابل للطباعة */}
      <div 
        ref={printRef}
        className="print-area max-w-4xl mx-auto bg-white shadow-lg"
        style={{ fontFamily: 'Arial, sans-serif', padding: '40px 50px' }}
      >
        {/* الشعار والعنوان */}
        <div className="flex justify-between items-start mb-2">
          <div className="text-right flex-1">
            <p 
              className="text-sm mb-1"
              contentEditable
              suppressContentEditableWarning
              style={{ outline: 'none', color: '#0ea5e9' }}
            >
              Med-hc-digital@moh.gov.sa
            </p>
            <h1 
              className="text-lg font-bold"
              contentEditable
              suppressContentEditableWarning
              style={{ outline: 'none', color: '#0ea5e9' }}
            >
              الخدمات المشتركة للصحة الرقمية والتقنية
            </h1>
            <p 
              className="text-sm"
              contentEditable
              suppressContentEditableWarning
              style={{ outline: 'none', color: '#0ea5e9' }}
            >
              Shared Services for Digital Health & Technology
            </p>
          </div>
          <div className="w-20 h-20">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/aca0c88a0_.png" 
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* عنوان النموذج */}
        <div className="text-center my-8">
          <h2 
            className="text-xl font-bold underline"
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none', color: '#dc2626', textDecorationColor: '#dc2626' }}
          >
            طلب إنشاء أو استعادة بريد إلكتروني
          </h2>
        </div>

        {/* الجدول الأول - بيانات الجهة الطالبة */}
        <table 
          className="w-full mb-1" 
          style={{ 
            borderCollapse: 'collapse',
            border: `2px solid ${borderColor}`
          }}
        >
          <tbody>
            <tr>
              <td 
                colSpan="2" 
                className="p-3 text-center font-bold"
                contentEditable
                suppressContentEditableWarning
                style={{ 
                  outline: 'none',
                  borderBottom: `1px solid ${innerBorderColor}`,
                  fontSize: '16px'
                }}
              >
                بيانات الجهة الطالبة
              </td>
            </tr>
            <tr>
              <td 
                className="p-3 text-left font-semibold"
                contentEditable
                suppressContentEditableWarning
                style={{ 
                  outline: 'none',
                  borderBottom: `1px solid ${innerBorderColor}`,
                  width: `${table1ColWidths.label}px`,
                  position: 'relative'
                }}
              >
                الجهة
                <div 
                  className="resize-handle no-print"
                  onMouseDown={(e) => handleResizeStart(e, 1, 'label', table1ColWidths.label)}
                />
              </td>
              <td 
                className="editable-cell text-left"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInputChange('entityName', e.currentTarget.textContent)}
                style={{ 
                  borderBottom: `1px solid ${innerBorderColor}`,
                  borderRight: `1px solid ${innerBorderColor}`,
                  width: `${table1ColWidths.value}px`,
                  position: 'relative'
                }}
              >
                {formData.entityName}
                <div 
                  className="resize-handle no-print"
                  onMouseDown={(e) => handleResizeStart(e, 1, 'value', table1ColWidths.value)}
                />
              </td>
            </tr>
            <tr>
              <td 
                className="p-3 text-left font-semibold"
                contentEditable
                suppressContentEditableWarning
                style={{ 
                  outline: 'none',
                  borderBottom: `1px solid ${innerBorderColor}`
                }}
              >
                مدير الادارة
              </td>
              <td 
                className="editable-cell text-left"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInputChange('managerName', e.currentTarget.textContent)}
                style={{ 
                  borderBottom: `1px solid ${innerBorderColor}`,
                  borderRight: `1px solid ${innerBorderColor}`
                }}
              >
                {formData.managerName}
              </td>
            </tr>
            <tr>
              <td 
                className="p-3 text-left font-semibold"
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                (بريد / رقم) مدير الادارة
              </td>
              <td 
                className="editable-cell text-left"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInputChange('managerEmailPhone', e.currentTarget.textContent)}
                style={{ 
                  borderRight: `1px solid ${innerBorderColor}`
                }}
              >
                {formData.managerEmailPhone}
              </td>
            </tr>
          </tbody>
        </table>

        {/* خط فاصل قصير بين الجدولين */}
        <div className="flex justify-center my-4">
          <div style={{ width: '60%', borderBottom: `1px solid ${innerBorderColor}` }}></div>
        </div>

        {/* الجدول الثاني - بيانات مستلم البريد */}
        <table 
          className="w-full" 
          style={{ 
            borderCollapse: 'collapse',
            border: `2px solid ${borderColor}`
          }}
        >
          <tbody>
            {/* عنوان الجدول الثاني داخل الجدول */}
            <tr>
              <td 
                colSpan="2" 
                className="p-3 text-center font-bold"
                contentEditable
                suppressContentEditableWarning
                style={{ 
                  outline: 'none',
                  borderBottom: `1px solid ${innerBorderColor}`,
                  fontSize: '16px',
                  textAlign: 'center'
                }}
              >
                بيانات مستلم البريد الالكتروني
              </td>
            </tr>
            <tr>
              <td 
                className="p-3 text-left font-semibold"
                contentEditable
                suppressContentEditableWarning
                style={{ 
                  outline: 'none',
                  borderBottom: `1px solid ${innerBorderColor}`,
                  width: `${table2ColWidths.label}px`,
                  position: 'relative'
                }}
              >
                اسم المستلم
                <div 
                  className="resize-handle no-print"
                  onMouseDown={(e) => handleResizeStart(e, 2, 'label', table2ColWidths.label)}
                />
              </td>
              <td 
                className="editable-cell text-left"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInputChange('recipientName', e.currentTarget.textContent)}
                style={{ 
                  borderBottom: `1px solid ${innerBorderColor}`,
                  borderRight: `1px solid ${innerBorderColor}`,
                  width: `${table2ColWidths.value}px`,
                  position: 'relative'
                }}
              >
                {formData.recipientName}
                <div 
                  className="resize-handle no-print"
                  onMouseDown={(e) => handleResizeStart(e, 2, 'value', table2ColWidths.value)}
                />
              </td>
            </tr>
            <tr>
              <td 
                className="p-3 text-left font-semibold"
                contentEditable
                suppressContentEditableWarning
                style={{ 
                  outline: 'none',
                  borderBottom: `1px solid ${innerBorderColor}`
                }}
              >
                بريد المستلم
              </td>
              <td 
                className="editable-cell text-left"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInputChange('recipientEmail', e.currentTarget.textContent)}
                style={{ 
                  borderBottom: `1px solid ${innerBorderColor}`,
                  borderRight: `1px solid ${innerBorderColor}`
                }}
              >
                {formData.recipientEmail}
              </td>
            </tr>
            {/* خانة رقم الجوال مع نمط مختلف */}
            <tr>
              <td 
                colSpan="2"
                style={{ 
                  borderBottom: `1px solid ${innerBorderColor}`,
                  padding: 0
                }}
              >
                <div className="flex flex-row-reverse">
                  <div 
                    className="editable-cell flex-1 text-left"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange('recipientPhone', e.currentTarget.textContent)}
                    style={{ 
                      borderRight: `1px solid ${innerBorderColor}`,
                      minWidth: '200px'
                    }}
                  >
                    {formData.recipientPhone}
                  </div>
                  <div 
                    className="p-3 text-left font-semibold"
                    contentEditable
                    suppressContentEditableWarning
                    style={{ 
                      outline: 'none',
                      width: '120px',
                      flexShrink: 0
                    }}
                  >
                    رقم الجوال
                  </div>
                </div>
              </td>
            </tr>
            {/* بريد الادارة فوق الايميل في خلية واحدة */}
            <tr>
              <td 
                colSpan="2"
                className="editable-cell text-center"
                style={{ 
                  fontSize: '16px',
                  direction: 'rtl',
                  padding: '12px'
                }}
              >
                <div className="font-semibold mb-1">بريد الادارة</div>
                <div 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('adminEmail', e.currentTarget.textContent)}
                  style={{ outline: 'none' }}
                >
                  ( {formData.adminEmail || '                                        '} )
                </div>
              </td>
            </tr>

            {/* الصفوف الإضافية */}
            {additionalRows.map((row, index) => (
              <tr key={index} className="relative group">
                <td 
                  className="p-3 text-left font-semibold relative"
                  style={{ 
                    borderTop: `1px solid ${innerBorderColor}`
                  }}
                >
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateRow(index, 'label', e.currentTarget.textContent)}
                    style={{ outline: 'none' }}
                  >
                    {row.label || "عنوان جديد"}
                  </span>
                  <button
                    onClick={() => removeRow(index)}
                    className="no-print absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
                <td 
                  className="editable-cell text-left"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateRow(index, 'value', e.currentTarget.textContent)}
                  style={{ 
                    borderTop: `1px solid ${innerBorderColor}`,
                    borderRight: `1px solid ${innerBorderColor}`
                  }}
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ملاحظات */}
        <div className="mt-8 text-sm space-y-3">
          <p 
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none' }}
          >
            - يتم رفع النموذج عن طريق بريد الإدارة أو بريد مدير الإدارة.
          </p>
          <p 
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none', fontWeight: 'bold', color: '#0ea5e9' }}
          >
            مع إضافة المستلم في نسخة البريد
          </p>
          <p 
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none' }}
          >
            - يتم رفع الطلب على{" "}
            <a href="mailto:Med-hc-dt-op@moh.gov.sa" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              Med-hc-dt-op@moh.gov.sa
            </a>
          </p>
        </div>

        {/* تذييل الصفحة */}
        <div className="mt-16 text-center">
          <h3 
            className="text-lg font-bold"
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none', color: '#0ea5e9' }}
          >
            تجمع المدينة المنورة الصحي
          </h3>
          <p 
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none', color: '#0ea5e9' }}
          >
            Madinah Health Cluster
          </p>
          <p 
            className="text-sm text-gray-500"
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none' }}
          >
            Empowered by Health Holding co.
          </p>
        </div>
      </div>
    </div>
  );
}