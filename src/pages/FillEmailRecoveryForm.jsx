import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FillEmailRecoveryForm() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const printRef = useRef(null);

  // بيانات النموذج
  const [formData, setFormData] = useState({
    entityName: "",
    managerName: "",
    managerEmailPhone: "",
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    adminEmail: "",
    additionalNotes: ""
  });

  // صفوف إضافية قابلة للتعديل
  const [additionalRows, setAdditionalRows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

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
      // البحث عن مدير المركز
      const manager = employees.find(e => e.id === center.المدير);
      
      setFormData(prev => ({
        ...prev,
        entityName: center.اسم_المركز || "",
        managerName: manager?.full_name_arabic || "",
        managerEmailPhone: manager ? `${manager.email || ""} / ${manager.phone || ""}` : "",
        adminEmail: center.ايميل_المركز || ""
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
            padding: 10mm;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 10mm; }
        }
        .editable-cell {
          min-height: 30px;
          padding: 8px 12px;
          outline: none;
          transition: background-color 0.2s;
        }
        .editable-cell:focus {
          background-color: #f0f9ff;
        }
        .editable-cell:hover {
          background-color: #f8fafc;
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
        className="print-area max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* الشعار والعنوان */}
        <div className="p-6 border-b-4 border-cyan-500">
          <div className="flex justify-between items-start">
            <div className="text-right">
              <h1 
                className="text-cyan-600 text-xl font-bold"
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                الخدمات المشتركة للصحة الرقمية والتقنية
              </h1>
              <p 
                className="text-cyan-500 text-sm"
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                Shared Services for Digital Health & Technology
              </p>
            </div>
            <div className="w-16 h-16">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/aca0c88a0_.png" 
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <h2 
              className="text-cyan-600 text-lg font-bold underline"
              contentEditable
              suppressContentEditableWarning
              style={{ outline: 'none' }}
            >
              طلب إنشاء أو استعادة بريد إلكتروني
            </h2>
          </div>
        </div>

        {/* بيانات الجهة الطالبة */}
        <div className="p-6">
          <table className="w-full border-collapse border-2 border-cyan-500">
            <tbody>
              <tr className="bg-cyan-50">
                <td 
                  colSpan="2" 
                  className="border-2 border-cyan-500 p-3 text-center font-bold text-cyan-700"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  بيانات الجهة الطالبة
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500 w-2/3"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('entityName', e.currentTarget.textContent)}
                >
                  {formData.entityName}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50 w-1/3"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  الجهة
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('managerName', e.currentTarget.textContent)}
                >
                  {formData.managerName}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  مدير الادارة
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('managerEmailPhone', e.currentTarget.textContent)}
                >
                  {formData.managerEmailPhone}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  (بريد / رقم) مدير الادارة
                </td>
              </tr>
            </tbody>
          </table>

          {/* بيانات مستلم البريد الالكتروني */}
          <table className="w-full border-collapse border-2 border-cyan-500 mt-6">
            <tbody>
              <tr className="bg-cyan-50">
                <td 
                  colSpan="2" 
                  className="border-2 border-cyan-500 p-3 text-center font-bold text-cyan-700"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  بيانات مستلم البريد الالكتروني
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500 w-2/3"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('recipientName', e.currentTarget.textContent)}
                >
                  {formData.recipientName}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50 w-1/3"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  اسم المستلم
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('recipientEmail', e.currentTarget.textContent)}
                >
                  {formData.recipientEmail}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  بريد المستلم
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('recipientPhone', e.currentTarget.textContent)}
                >
                  {formData.recipientPhone}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  رقم الجوال
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('adminEmail', e.currentTarget.textContent)}
                >
                  {formData.adminEmail}
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  بريد الادارة
                </td>
              </tr>
              <tr>
                <td 
                  className="editable-cell border-2 border-cyan-500 text-center"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ minHeight: '40px' }}
                >
                  (                                                                           )
                </td>
                <td 
                  className="border-2 border-cyan-500 p-3 text-center font-semibold bg-gray-50"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ outline: 'none' }}
                >
                  (                                                                           )
                </td>
              </tr>

              {/* الصفوف الإضافية */}
              {additionalRows.map((row, index) => (
                <tr key={index} className="relative group">
                  <td 
                    className="editable-cell border-2 border-cyan-500"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateRow(index, 'value', e.currentTarget.textContent)}
                  >
                    {row.value}
                  </td>
                  <td 
                    className="border-2 border-cyan-500 p-3 text-right font-semibold bg-gray-50 relative"
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
                      className="no-print absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ملاحظات */}
          <div className="mt-6 text-sm text-gray-700 space-y-2">
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
              style={{ outline: 'none' }}
              className="font-semibold text-cyan-700"
            >
              مع إضافة المستلم في نسخة البريد
            </p>
            <p 
              contentEditable
              suppressContentEditableWarning
              style={{ outline: 'none' }}
            >
              - يتم رفع الطلب على{" "}
              <a href="mailto:Med-hc-dt-op@moh.gov.sa" className="text-blue-600 underline">
                Med-hc-dt-op@moh.gov.sa
              </a>
            </p>
          </div>

          {/* تذييل الصفحة */}
          <div className="mt-12 pt-6 border-t-2 border-cyan-500">
            <div className="text-center">
              <h3 
                className="text-cyan-700 text-lg font-bold"
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                تجمع المدينة المنورة الصحي
              </h3>
              <p 
                className="text-cyan-600"
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                Madinah Health Cluster
              </p>
              <p 
                className="text-gray-500 text-sm"
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                Empowered by Health Holding co.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}