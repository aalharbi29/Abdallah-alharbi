import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FillDigitalAccountForm() {
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const printRef = useRef(null);

  const [formData, setFormData] = useState({
    systemRaqeem: false,
    systemMedica: false,
    systemMawid: false,
    createNew: false,
    restorePassword: false,
    deleteUser: false,
    relocateUser: false,
    reason: "",
    firstName: "",
    secondName: "",
    thirdName: "",
    familyName: "",
    idNumber: "",
    birthDate: "",
    mohEmail: "",
    scfhsNumber: "",
    endDate: "",
    contactPhone: "",
    receptionist: false,
    nurse: false,
    physician: false,
    facilityManager: false,
    pharmacist: false,
    labTechnician: false,
    organization: "",
    department: "",
    specialization: "",
    recruitmentPrivilege: "",
    employeeName: "",
    managerApproval: ""
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
      const names = employee.full_name_arabic?.split(" ") || [];
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || "",
        secondName: names[1] || "",
        thirdName: names[2] || "",
        familyName: names[3] || "",
        idNumber: employee.رقم_الهوية || "",
        birthDate: employee.birth_date || "",
        mohEmail: employee.email || "",
        scfhsNumber: employee.scfhs_classification || "",
        endDate: employee.contract_end_date || "",
        contactPhone: employee.phone || "",
        organization: employee.المركز_الصحي || "",
        department: employee.department || "",
        specialization: employee.position || "",
        employeeName: employee.full_name_arabic || ""
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
    pdf.save(`نموذج_انشاء_حساب_${formData.firstName || 'موظف'}.pdf`);
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

  const CheckboxField = ({ checked, onChange, labelAr, labelEn, isArabic }) => (
    <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: '10px' }}>
      {isArabic ? (
        <>
          <span>{labelAr} {checked && '☑'}</span>
          <input type="checkbox" checked={checked} onChange={onChange} className="no-print w-3 h-3" />
        </>
      ) : (
        <>
          <input type="checkbox" checked={checked} onChange={onChange} className="no-print w-3 h-3" />
          <span>{checked && '☑'} {labelEn}</span>
        </>
      )}
    </label>
  );



  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body * { 
            visibility: hidden; 
          }
          .print-area, .print-area * { 
            visibility: visible; 
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 25mm 25mm 25mm 25mm;
            margin: 0;
            direction: rtl;
            box-sizing: border-box;
            background: white;
          }
          .print-area table {
            width: 100% !important;
            table-layout: fixed;
          }
          .no-print { 
            display: none !important; 
          }
          .print-only {
            display: inline !important;
          }
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
        }
        .editable-cell {
          padding: 2px 6px;
          outline: none;
          min-height: 20px;
          display: inline-block;
        }
        .editable-cell:focus {
          background-color: #f0f9ff;
        }
        .form-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 10px;
          table-layout: fixed;
        }
        .form-table td {
          border: 1px solid #000;
          vertical-align: top;
        }
        .print-only {
          display: none;
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-4xl mx-auto mb-4 flex flex-wrap gap-2 justify-between items-center">
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

      {/* Form */}
      <div 
        ref={printRef}
        className="print-area max-w-4xl mx-auto bg-white shadow-lg"
        style={{ padding: '25mm 25mm 25mm 25mm', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
            الخدمات المشتركة للصحة الرقمية والتقنية
          </h2>
          <p className="text-xs" style={{ color: '#6b7280', fontWeight: 'normal', marginTop: '2px' }}>
            Shared Services for Digital Health & Technology
          </p>
        </div>

        {/* Main Table */}
        <table className="form-table">
          <tbody>
            {/* Row 1: Title */}
            <tr>
              <td colSpan="2" style={{ padding: '10px', textAlign: 'center', backgroundColor: '#e6f2ff' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a5f' }}>
                  نموذج انشاء إيقاف حساب
                </span>
              </td>
            </tr>

            {/* Row 2: Content - النظام */}
            <tr>
              <td style={{ width: '50%', padding: '8px', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>النظام:</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.systemRaqeem} onChange={(e) => handleInputChange('systemRaqeem', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.systemRaqeem && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>رقيم</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.systemMedica} onChange={(e) => handleInputChange('systemMedica', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.systemMedica && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>ميديكا كلاود</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.systemMawid} onChange={(e) => handleInputChange('systemMawid', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.systemMawid && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>موعد</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}></td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}></td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ width: '50%', padding: '8px', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>*System:</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.systemRaqeem} onChange={(e) => handleInputChange('systemRaqeem', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.systemRaqeem && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Raqeem</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.systemMedica} onChange={(e) => handleInputChange('systemMedica', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.systemMedica && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Medica cloud</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.systemMawid} onChange={(e) => handleInputChange('systemMawid', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.systemMawid && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Mawid</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}></td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            {/* Separator */}
            <tr>
              <td colSpan="2" style={{ padding: '0 15px', border: 'none' }}>
                <div style={{ borderBottom: '2px solid #000', width: '100%' }}></div>
              </td>
            </tr>

            {/* نوع الطلب */}
            <tr>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>نوع الطلب:</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.createNew} onChange={(e) => handleInputChange('createNew', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.createNew && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>انشاء مستخدم جديد</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.restorePassword} onChange={(e) => handleInputChange('restorePassword', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.restorePassword && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>استعادة كلمة مرور</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.deleteUser} onChange={(e) => handleInputChange('deleteUser', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.deleteUser && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>الغاء اسم مستخدم</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.relocateUser} onChange={(e) => handleInputChange('relocateUser', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.relocateUser && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>نقل اسم مستخدم</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>*Type of Request:</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.createNew} onChange={(e) => handleInputChange('createNew', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.createNew && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Create a new user name</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.restorePassword} onChange={(e) => handleInputChange('restorePassword', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.restorePassword && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Restore password</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.deleteUser} onChange={(e) => handleInputChange('deleteUser', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.deleteUser && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Delete a user name</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center' }}>
                        <input type="checkbox" checked={formData.relocateUser} onChange={(e) => handleInputChange('relocateUser', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.relocateUser && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Relocate a user name</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            {/* Separator */}
            <tr>
              <td colSpan="2" style={{ padding: '0 15px', border: 'none' }}>
                <div style={{ borderBottom: '2px solid #000', width: '100%' }}></div>
              </td>
            </tr>

            {/* السبب */}
            <tr>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold' }}>السبب: </span>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('reason', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', minWidth: '200px' }}>
                  {formData.reason}
                </span>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold' }}>*Reason: </span>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('reason', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', minWidth: '200px' }}>
                  {formData.reason}
                </span>
              </td>
            </tr>
            {/* Separator */}
            <tr>
              <td colSpan="2" style={{ padding: '0 15px', border: 'none' }}>
                <div style={{ borderBottom: '2px solid #000', width: '100%' }}></div>
              </td>
            </tr>

            {/* اسم الموظف */}
            <tr>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold' }}>اسم الموظف:</span>
                <div className="space-y-1 mt-2">
                  {[
                    { label: 'الأول', field: 'firstName' },
                    { label: 'الثاني', field: 'secondName' },
                    { label: 'الثالث', field: 'thirdName' },
                    { label: 'العائلة', field: 'familyName' }
                  ].map(item => (
                    <div key={item.field} className="flex items-center gap-2">
                      <span style={{ width: '50px' }}>{item.label}:</span>
                      <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                        {formData[item.field]}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold' }}>*Staff Name:</span>
                <div className="space-y-1 mt-2">
                  {[
                    { label: 'First', field: 'firstName' },
                    { label: 'Second', field: 'secondName' },
                    { label: 'Third', field: 'thirdName' },
                    { label: 'Family', field: 'familyName' }
                  ].map(item => (
                    <div key={item.field} className="flex items-center gap-2">
                      <span style={{ width: '50px' }}>{item.label}:</span>
                      <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                        {formData[item.field]}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            {/* Separator */}
            <tr>
              <td colSpan="2" style={{ padding: '0 15px', border: 'none' }}>
                <div style={{ borderBottom: '2px solid #000', width: '100%' }}></div>
              </td>
            </tr>

            {/* البيانات العامة */}
            <tr>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                {[
                  { label: 'رقم الهوية/ الإقامة', field: 'idNumber' },
                  { label: 'تاريخ الميلاد', field: 'birthDate' },
                  { label: 'البريد الوزاري', field: 'mohEmail' },
                  { label: 'رقم التصنيف إن وجد', field: 'scfhsNumber' },
                  { label: 'تاريخ انتهاء (التدريب/ العقد)', field: 'endDate' },
                  { label: 'رقم التواصل', field: 'contactPhone' }
                ].map(item => (
                  <div key={item.field} className="flex items-center gap-2 mb-1">
                    <span style={{ minWidth: '140px', textAlign: 'right' }}>{item.label}:</span>
                    <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                      {formData[item.field]}
                    </span>
                  </div>
                ))}
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                {[
                  { label: 'ID NO', field: 'idNumber' },
                  { label: 'Date of birth', field: 'birthDate' },
                  { label: 'MOH email', field: 'mohEmail' },
                  { label: 'SCFHS number', field: 'scfhsNumber' },
                  { label: 'End date of (internship\\contract)', field: 'endDate' },
                  { label: 'Contact Phone', field: 'contactPhone' }
                ].map(item => (
                  <div key={item.field} className="flex items-center gap-2 mb-1">
                    <span style={{ minWidth: '160px' }}>{item.label}:</span>
                    <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                      {formData[item.field]}
                    </span>
                  </div>
                ))}
              </td>
            </tr>
            {/* Separator */}
            <tr>
              <td colSpan="2" style={{ padding: '0 15px', border: 'none' }}>
                <div style={{ borderBottom: '2px solid #000', width: '100%' }}></div>
              </td>
            </tr>

            {/* المهنة */}
            <tr>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>المهنة:</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.physician} onChange={(e) => handleInputChange('physician', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.physician && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>طبيب</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.nurse} onChange={(e) => handleInputChange('nurse', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.nurse && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>تمريض</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.receptionist} onChange={(e) => handleInputChange('receptionist', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.receptionist && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>استقبال</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.pharmacist} onChange={(e) => handleInputChange('pharmacist', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.pharmacist && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>صيدلي</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.labTechnician} onChange={(e) => handleInputChange('labTechnician', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.labTechnician && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>مختبر</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.facilityManager} onChange={(e) => handleInputChange('facilityManager', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.facilityManager && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>مدير منشأة</td>
                    </tr>
                  </tbody>
                </table>
                <div className="space-y-1 mt-3">
                  {[
                    { label: 'المنشأة', field: 'organization' },
                    { label: 'القسم', field: 'department' },
                    { label: 'التخصص', field: 'specialization' },
                    { label: 'الصلاحيات المطلوبة', field: 'recruitmentPrivilege' }
                  ].map(item => (
                    <div key={item.field} className="flex items-center gap-2">
                      <span style={{ minWidth: '100px', textAlign: 'right' }}>{item.label}:</span>
                      <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                        {formData[item.field]}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>*Occupation:</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.physician} onChange={(e) => handleInputChange('physician', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.physician && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Physician</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.nurse} onChange={(e) => handleInputChange('nurse', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.nurse && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Nurse</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.receptionist} onChange={(e) => handleInputChange('receptionist', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.receptionist && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Receptionist</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.pharmacist} onChange={(e) => handleInputChange('pharmacist', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.pharmacist && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Pharmacist</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.labTechnician} onChange={(e) => handleInputChange('labTechnician', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.labTechnician && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Lab Technician</td>
                      <td style={{ border: '1px solid #000', padding: '4px', width: '25px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                        <input type="checkbox" checked={formData.facilityManager} onChange={(e) => handleInputChange('facilityManager', e.target.checked)} className="no-print" style={{ width: '14px', height: '14px' }} />
                        {formData.facilityManager && <span className="print-only">☑</span>}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', fontSize: '10px' }}>Facility Manager</td>
                    </tr>
                  </tbody>
                </table>
                <div className="space-y-1 mt-3">
                  {[
                    { label: 'Organization', field: 'organization' },
                    { label: 'Department', field: 'department' },
                    { label: 'Specialization', field: 'specialization' },
                    { label: 'Recruitment privilege', field: 'recruitmentPrivilege' }
                  ].map(item => (
                    <div key={item.field} className="flex items-center gap-2">
                      <span style={{ minWidth: '120px' }}>{item.label}:</span>
                      <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                        {formData[item.field]}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>

            {/* التعهد */}
            <tr>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'rtl', textAlign: 'right' }}>
                <div style={{ backgroundColor: '#f8f9fa', padding: '8px', fontSize: '9px', lineHeight: '1.5', border: '1px solid #000' }}>
                  <p>
                    اتعهد بالمحافظة على اسم وكلمة السر الخاصة بي ولن اعطيها لأي شخص اخر، أي وصول إلى نظام المعلومات باستخدام اسم المستخدم وكلمة المرور الخاصين بي هو مسؤوليتي وإذا علمت ان هناك شخص اخر استخدم حسابي فسوف أقوم بإبلاغ المسؤول بقسم الصحة الرقمية والتكنولوجيا عن ذلك وتغير كلمة السر.
                  </p>
                  <p style={{ textAlign: 'center', marginTop: '4px', fontWeight: 'bold', color: '#0ea5e9' }}>
                    med-hc-digital@moh.gov.sa
                  </p>
                </div>
                <div style={{ fontSize: '9px', marginTop: '6px', fontWeight: 'bold' }}>
                  * على الرئيس المباشر تزويدنا ببيانات الموظف في حال التكليف أو النقل خارج المركز أو المستشفى
                </div>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none', direction: 'ltr', textAlign: 'left' }}>
                <div style={{ backgroundColor: '#f8f9fa', padding: '8px', fontSize: '9px', lineHeight: '1.5', border: '1px solid #000' }}>
                  <p>
                    I Will safeguard and will not disclose my username and password. Any access to information system by my username and password is my responsibility. If I believe someone else has logged into my account, I will immediately report the breach to digital health & technology department and will immediately change my password.
                  </p>
                  <p style={{ textAlign: 'center', marginTop: '4px', fontWeight: 'bold', color: '#0ea5e9' }}>
                    med-hc-digital@moh.gov.sa
                  </p>
                </div>
                <div style={{ fontSize: '9px', marginTop: '6px', fontWeight: 'bold' }}>
                  *The direct manager must provide us with the employee's data in the event of assignment or transfer outside the center or hospital.
                </div>
              </td>
            </tr>

            {/* Row 3: Signatures */}
            <tr style={{ position: 'relative' }}>
              <td style={{ width: '50%', padding: '10px', textAlign: 'right', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>اسم الموظف:</div>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('employeeName', e.currentTarget.textContent)} style={{ display: 'block', borderBottom: '1px solid #000', minHeight: '25px', padding: '4px' }}>
                  {formData.employeeName}
                </span>
              </td>
              <td style={{ width: '50%', padding: '10px', textAlign: 'left', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>اعتماد الرئيس المباشر:</div>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('managerApproval', e.currentTarget.textContent)} style={{ display: 'block', borderBottom: '1px solid #000', minHeight: '25px', padding: '4px' }}>
                  {formData.managerApproval}
                </span>
              </td>
            </tr>
            {/* Stamp overlay */}
            <tr>
              <td colSpan="2" style={{ padding: '0', border: 'none', position: 'relative', height: '0' }}>
                <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', backgroundColor: 'white', padding: '2px 8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>الختم / Stamp</div>
                  <div style={{ border: '1px solid #000', height: '30px', width: '40px', margin: '0 auto', backgroundColor: 'white' }}></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}