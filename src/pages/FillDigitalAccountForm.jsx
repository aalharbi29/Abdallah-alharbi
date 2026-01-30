import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function FillDigitalAccountForm() {
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const printRef = useRef(null);

  const [formData, setFormData] = useState({
    // System
    systemRaqeem: false,
    systemMedica: false,
    systemMawid: false,
    
    // Type of Request
    createNew: false,
    restorePassword: false,
    deleteUser: false,
    relocateUser: false,
    
    // Reason
    reason: "",
    
    // Staff Name
    firstName: "",
    secondName: "",
    thirdName: "",
    familyName: "",
    
    // Other Info
    idNumber: "",
    birthDate: "",
    mohEmail: "",
    scfhsNumber: "",
    endDate: "",
    contactPhone: "",
    
    // Occupation
    receptionist: false,
    nurse: false,
    physician: false,
    facilityManager: false,
    pharmacist: false,
    labTechnician: false,
    
    // Additional Info
    organization: "",
    department: "",
    specialization: "",
    recruitmentPrivilege: "",
    
    // Approval
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
            padding: 10mm 15mm;
            direction: rtl;
            background-image: url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/a3b5521d7_image.png) !important;
            background-size: 100% 100% !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
        }
        
        .editable-cell {
          padding: 4px 8px;
          outline: none;
          text-align: center;
          min-height: 24px;
        }
        
        .editable-cell:focus {
          background-color: #f0f9ff;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
        }
        
        td {
          border: 1px solid #000;
          padding: 4px 8px;
          font-size: 11px;
          vertical-align: middle;
        }
        
        .form-title {
          background-color: #e6f2ff;
          font-weight: bold;
          text-align: center;
          padding: 8px;
          font-size: 14px;
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
        style={{ 
          padding: '30px 40px',
          fontFamily: 'Arial, sans-serif',
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/a3b5521d7_image.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '297mm'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6" style={{ marginTop: '40px' }}>
          <div className="text-right" style={{ flex: 1 }}>
            <h2 className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
              الخدمات المشتركة للصحة الرقمية والتقنية
            </h2>
          </div>
          
          <div style={{ width: '2px', backgroundColor: '#0ea5e9', height: '40px', margin: '0 20px' }}></div>
          
          <div className="text-left" style={{ flex: 1 }}>
            <h2 className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
              Shared Services for Digital Health & Technology
            </h2>
            <p className="text-xs" style={{ color: '#0ea5e9', marginTop: '4px' }}>
              Med-hc-digital@moh.gov.sa
            </p>
          </div>
        </div>

        {/* Form Title */}
        <div className="form-title" style={{ marginBottom: '15px' }}>
          نموذج انشاء إيقاف حساب
        </div>

        {/* Main Table */}
        <table style={{ fontSize: '10px' }}>
          <tbody>
            {/* System Row */}
            <tr>
              <td style={{ width: '50%', padding: '8px', textAlign: 'right' }}>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4" style={{ fontSize: '10px' }}>
                    <label className="flex items-center gap-1">
                      <span>رقيم {formData.systemRaqeem && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.systemRaqeem}
                        onChange={(e) => handleInputChange('systemRaqeem', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      <span>ميديكا كلاود {formData.systemMedica && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.systemMedica}
                        onChange={(e) => handleInputChange('systemMedica', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      <span>موعد {formData.systemMawid && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.systemMawid}
                        onChange={(e) => handleInputChange('systemMawid', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>:النظام*</span>
                </div>
              </td>
              <td style={{ width: '50%', padding: '8px' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontWeight: 'bold' }}>*System:</span>
                  <div className="flex gap-4" style={{ fontSize: '10px' }}>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox" 
                        checked={formData.systemRaqeem}
                        onChange={(e) => handleInputChange('systemRaqeem', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.systemRaqeem && '☑'} Raqeem</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.systemMedica}
                        onChange={(e) => handleInputChange('systemMedica', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.systemMedica && '☑'} Medica cloud</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.systemMawid}
                        onChange={(e) => handleInputChange('systemMawid', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.systemMawid && '☑'} Mawid</span>
                    </label>
                  </div>
                </div>
              </td>
            </tr>

            {/* Request Type Row */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>:نوع الطلب*</span>
                  <div className="grid grid-cols-2 gap-2 mt-2" style={{ fontSize: '10px' }}>
                    <label className="flex items-center gap-1 justify-end">
                      <span>استعادة كلمة مرور {formData.restorePassword && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.restorePassword}
                        onChange={(e) => handleInputChange('restorePassword', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>انشاء مستخدم جديد {formData.createNew && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.createNew}
                        onChange={(e) => handleInputChange('createNew', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>نقل اسم مستخدم {formData.relocateUser && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.relocateUser}
                        onChange={(e) => handleInputChange('relocateUser', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>الغاء اسم مستخدم {formData.deleteUser && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.deleteUser}
                        onChange={(e) => handleInputChange('deleteUser', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                  </div>
                </div>
              </td>
              <td style={{ padding: '8px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>*Type of Request:</span>
                  <div className="grid grid-cols-2 gap-2 mt-2" style={{ fontSize: '10px' }}>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.createNew}
                        onChange={(e) => handleInputChange('createNew', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.createNew && '☑'} Create a new user name</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.restorePassword}
                        onChange={(e) => handleInputChange('restorePassword', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.restorePassword && '☑'} Restore password</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.deleteUser}
                        onChange={(e) => handleInputChange('deleteUser', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.deleteUser && '☑'} Delete a user name</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.relocateUser}
                        onChange={(e) => handleInputChange('relocateUser', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.relocateUser && '☑'} Relocate a user name</span>
                    </label>
                  </div>
                </div>
              </td>
            </tr>

            {/* Reason Row */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                <span 
                  className="editable-cell"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('reason', e.currentTarget.textContent)}
                  style={{ display: 'inline-block', minWidth: '300px', borderBottom: '1px dotted #999' }}
                >
                  {formData.reason}
                </span>
                <span style={{ fontWeight: 'bold' }}> :السبب*</span>
              </td>
              <td style={{ padding: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>*Reason: </span>
                <span 
                  className="editable-cell"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleInputChange('reason', e.currentTarget.textContent)}
                  style={{ display: 'inline-block', minWidth: '300px', borderBottom: '1px dotted #999' }}
                >
                  {formData.reason}
                </span>
              </td>
            </tr>

            {/* Staff Name Section */}
            <tr>
              <td colSpan="2" style={{ padding: '8px' }}>
                <div className="flex justify-between">
                  <div style={{ width: '48%', textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>:اسم الموظف*</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-end">
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('firstName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.firstName}
                        </span>
                        <span style={{ width: '60px', textAlign: 'right' }}>: الأول</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('secondName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.secondName}
                        </span>
                        <span style={{ width: '60px', textAlign: 'right' }}>: الثاني</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('thirdName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.thirdName}
                        </span>
                        <span style={{ width: '60px', textAlign: 'right' }}>: الثالث</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('familyName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.familyName}
                        </span>
                        <span style={{ width: '60px', textAlign: 'right' }}>: العائلة</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ width: '48%' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>*Staff Name:</div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span style={{ width: '60px' }}>First:</span>
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('firstName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.firstName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span style={{ width: '60px' }}>Second:</span>
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('secondName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.secondName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span style={{ width: '60px' }}>Third:</span>
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('thirdName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.thirdName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span style={{ width: '60px' }}>Family:</span>
                        <span 
                          className="editable-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleInputChange('familyName', e.currentTarget.textContent)}
                          style={{ flex: 1, borderBottom: '1px dotted #999' }}
                        >
                          {formData.familyName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            {/* ID and Other Info */}
            {[
              { enLabel: 'ID NO:', arLabel: 'رقم الهوية/ الإقامة:', field: 'idNumber' },
              { enLabel: 'Date of birth:', arLabel: 'تاريخ الميلاد:', field: 'birthDate' },
              { enLabel: 'MOH email:', arLabel: 'البريد الوزاري:', field: 'mohEmail' },
              { enLabel: 'SCFHS number:', arLabel: 'رقم التصنيف إن وجد:', field: 'scfhsNumber' },
              { enLabel: 'End date of (internship\\contract):', arLabel: 'تاريخ انتهاء (التدريب/ العقد):', field: 'endDate' },
              { enLabel: 'Contact Phone:', arLabel: 'رقم التواصل:', field: 'contactPhone' }
            ].map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <span 
                    className="editable-cell"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)}
                    style={{ display: 'inline-block', minWidth: '250px', borderBottom: '1px dotted #999' }}
                  >
                    {formData[item.field]}
                  </span>
                  <span style={{ fontWeight: 'bold' }}> {item.arLabel}</span>
                </td>
                <td style={{ padding: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{item.enLabel} </span>
                  <span 
                    className="editable-cell"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)}
                    style={{ display: 'inline-block', minWidth: '250px', borderBottom: '1px dotted #999' }}
                  >
                    {formData[item.field]}
                  </span>
                </td>
              </tr>
            ))}

            {/* Occupation Row */}
            <tr>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>:المهنة*</span>
                  <div className="grid grid-cols-3 gap-2 mt-2" style={{ fontSize: '10px' }}>
                    <label className="flex items-center gap-1 justify-end">
                      <span>طبيب {formData.physician && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.physician}
                        onChange={(e) => handleInputChange('physician', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>تمريض {formData.nurse && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.nurse}
                        onChange={(e) => handleInputChange('nurse', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>استقبال {formData.receptionist && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.receptionist}
                        onChange={(e) => handleInputChange('receptionist', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>صيدلي {formData.pharmacist && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.pharmacist}
                        onChange={(e) => handleInputChange('pharmacist', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>مختبر {formData.labTechnician && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.labTechnician}
                        onChange={(e) => handleInputChange('labTechnician', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                    <label className="flex items-center gap-1 justify-end">
                      <span>مدير منشأة {formData.facilityManager && '☑'}</span>
                      <input 
                        type="checkbox"
                        checked={formData.facilityManager}
                        onChange={(e) => handleInputChange('facilityManager', e.target.checked)}
                        className="no-print"
                      />
                    </label>
                  </div>
                </div>
              </td>
              <td style={{ padding: '8px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>*Occupation:</span>
                  <div className="grid grid-cols-3 gap-2 mt-2" style={{ fontSize: '10px' }}>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.receptionist}
                        onChange={(e) => handleInputChange('receptionist', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.receptionist && '☑'} Receptionist</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.nurse}
                        onChange={(e) => handleInputChange('nurse', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.nurse && '☑'} Nurse</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.physician}
                        onChange={(e) => handleInputChange('physician', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.physician && '☑'} physician</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.facilityManager}
                        onChange={(e) => handleInputChange('facilityManager', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.facilityManager && '☑'} Facility Manger</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.pharmacist}
                        onChange={(e) => handleInputChange('pharmacist', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.pharmacist && '☑'} Pharmacist</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={formData.labTechnician}
                        onChange={(e) => handleInputChange('labTechnician', e.target.checked)}
                        className="no-print"
                      />
                      <span>{formData.labTechnician && '☑'} Lab Technician</span>
                    </label>
                  </div>
                </div>
              </td>
            </tr>

            {/* Additional Info */}
            {[
              { enLabel: 'Organization:', arLabel: 'المنشأة:', field: 'organization' },
              { enLabel: 'Department:', arLabel: 'القسم:', field: 'department' },
              { enLabel: 'Specialization:', arLabel: 'التخصص:', field: 'specialization' },
              { enLabel: 'Recruitment privilege:', arLabel: 'الصلاحيات المطلوبة:', field: 'recruitmentPrivilege' }
            ].map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <span 
                    className="editable-cell"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)}
                    style={{ display: 'inline-block', minWidth: '250px', borderBottom: '1px dotted #999' }}
                  >
                    {formData[item.field]}
                  </span>
                  <span style={{ fontWeight: 'bold' }}> {item.arLabel}</span>
                </td>
                <td style={{ padding: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{item.enLabel} </span>
                  <span 
                    className="editable-cell"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)}
                    style={{ display: 'inline-block', minWidth: '250px', borderBottom: '1px dotted #999' }}
                  >
                    {formData[item.field]}
                  </span>
                </td>
              </tr>
            ))}

            {/* Commitment Statement */}
            <tr>
              <td style={{ padding: '12px', fontSize: '9px', lineHeight: '1.6', textAlign: 'right' }}>
                <p>
                  اتعهد بالمحافظة على اسم وكلمة السر الخاصة بي ولن اعطيها لأي شخص اخر، أي وصول إلى نظام المعلومات باستخدام اسم المستخدم. وكلمة المرور الخاصين بي هو مسؤوليتي وإذا علمت ان هناك شخص اخر استخدم حسابي فسوف أقوم بإبلاغ المسؤول بقسم الصحة الرقمية والتكنولوجيا عن ذلك وتغير كلمة السر.
                </p>
                <p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold', color: '#0ea5e9' }}>
                  med-hc-digital@moh.gov.sa
                </p>
              </td>
              <td style={{ padding: '12px', fontSize: '9px', lineHeight: '1.6' }}>
                <p>
                  I Will safeguard and will not disclose my username and password. Any access to information system by my username and password is my responsibility. If I believe someone else has logged into my account, I will immediately report the breach to digital health & technology department and will immediately change my password.
                </p>
                <p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold', color: '#0ea5e9' }}>
                  med-hc-digital@moh.gov.sa
                </p>
              </td>
            </tr>

            {/* Manager Note */}
            <tr>
              <td style={{ padding: '8px', fontSize: '9px', textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold' }}>
                  * على الرئيس المباشر تزويدنا ببيانات الموظف في حال التكليف او النقل خارج المركز أو المستشفى
                </p>
              </td>
              <td style={{ padding: '8px', fontSize: '9px' }}>
                <p style={{ fontWeight: 'bold' }}>
                  *The direct manager must provide us with the employee's data in the event of assignment or transfer outside the center or hospital.
                </p>
              </td>
            </tr>

            {/* Approval Section */}
            <tr>
              <td colSpan="2" style={{ padding: '8px' }}>
                <div className="flex justify-between items-center">
                  <div style={{ width: '30%', textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>اسم الموظف:</div>
                    <span 
                      className="editable-cell"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleInputChange('employeeName', e.currentTarget.textContent)}
                      style={{ display: 'block', borderBottom: '1px solid #999', minHeight: '30px' }}
                    >
                      {formData.employeeName}
                    </span>
                  </div>
                  
                  <div style={{ width: '30%', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>الختم / Stamp</div>
                    <div style={{ border: '1px solid #999', height: '60px' }}>
                      
                    </div>
                  </div>
                  
                  <div style={{ width: '30%', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>اعتماد الرئيس المباشر</div>
                    <span 
                      className="editable-cell"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleInputChange('managerApproval', e.currentTarget.textContent)}
                      style={{ display: 'block', borderBottom: '1px solid #999', minHeight: '30px' }}
                    >
                      {formData.managerApproval}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}