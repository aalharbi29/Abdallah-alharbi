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

  const Separator = () => (
    <div style={{ padding: '0 20px', margin: '8px 0' }}>
      <div style={{ borderBottom: '2px solid #000', width: '100%' }}></div>
    </div>
  );

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
            padding: 8mm 12mm;
            direction: rtl;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
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
        }
        .form-table td {
          border: 1px solid #000;
          vertical-align: top;
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
        style={{ padding: '20px 30px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-right" style={{ flex: 1 }}>
            <h2 className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
              الخدمات المشتركة للصحة الرقمية والتقنية
            </h2>
          </div>
          <div style={{ width: '2px', backgroundColor: '#0ea5e9', height: '30px', margin: '0 15px' }}></div>
          <div className="text-left" style={{ flex: 1 }}>
            <h2 className="text-sm font-bold" style={{ color: '#0ea5e9' }}>
              Shared Services for Digital Health & Technology
            </h2>
          </div>
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
              <td style={{ width: '50%', padding: '8px', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>النظام:</span>
                <div className="flex gap-4 mt-2 justify-end">
                  <CheckboxField checked={formData.systemRaqeem} onChange={(e) => handleInputChange('systemRaqeem', e.target.checked)} labelAr="رقيم" isArabic />
                  <CheckboxField checked={formData.systemMedica} onChange={(e) => handleInputChange('systemMedica', e.target.checked)} labelAr="ميديكا كلاود" isArabic />
                  <CheckboxField checked={formData.systemMawid} onChange={(e) => handleInputChange('systemMawid', e.target.checked)} labelAr="موعد" isArabic />
                </div>
              </td>
              <td style={{ width: '50%', padding: '8px', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>*System:</span>
                <div className="flex gap-4 mt-2">
                  <CheckboxField checked={formData.systemRaqeem} onChange={(e) => handleInputChange('systemRaqeem', e.target.checked)} labelEn="Raqeem" />
                  <CheckboxField checked={formData.systemMedica} onChange={(e) => handleInputChange('systemMedica', e.target.checked)} labelEn="Medica cloud" />
                  <CheckboxField checked={formData.systemMawid} onChange={(e) => handleInputChange('systemMawid', e.target.checked)} labelEn="Mawid" />
                </div>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>نوع الطلب:</span>
                <div className="grid grid-cols-2 gap-2 mt-2" style={{ direction: 'rtl' }}>
                  <CheckboxField checked={formData.createNew} onChange={(e) => handleInputChange('createNew', e.target.checked)} labelAr="انشاء مستخدم جديد" isArabic />
                  <CheckboxField checked={formData.restorePassword} onChange={(e) => handleInputChange('restorePassword', e.target.checked)} labelAr="استعادة كلمة مرور" isArabic />
                  <CheckboxField checked={formData.deleteUser} onChange={(e) => handleInputChange('deleteUser', e.target.checked)} labelAr="الغاء اسم مستخدم" isArabic />
                  <CheckboxField checked={formData.relocateUser} onChange={(e) => handleInputChange('relocateUser', e.target.checked)} labelAr="نقل اسم مستخدم" isArabic />
                </div>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>*Type of Request:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <CheckboxField checked={formData.createNew} onChange={(e) => handleInputChange('createNew', e.target.checked)} labelEn="Create a new user name" />
                  <CheckboxField checked={formData.restorePassword} onChange={(e) => handleInputChange('restorePassword', e.target.checked)} labelEn="Restore password" />
                  <CheckboxField checked={formData.deleteUser} onChange={(e) => handleInputChange('deleteUser', e.target.checked)} labelEn="Delete a user name" />
                  <CheckboxField checked={formData.relocateUser} onChange={(e) => handleInputChange('relocateUser', e.target.checked)} labelEn="Relocate a user name" />
                </div>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>السبب: </span>
                <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('reason', e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', minWidth: '200px' }}>
                  {formData.reason}
                </span>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>اسم الموظف:</span>
                <div className="space-y-1 mt-2">
                  {[
                    { label: 'الأول', field: 'firstName' },
                    { label: 'الثاني', field: 'secondName' },
                    { label: 'الثالث', field: 'thirdName' },
                    { label: 'العائلة', field: 'familyName' }
                  ].map(item => (
                    <div key={item.field} className="flex items-center gap-2 justify-end">
                      <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                        {formData[item.field]}
                      </span>
                      <span style={{ width: '50px' }}>{item.label}:</span>
                    </div>
                  ))}
                </div>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                {[
                  { label: 'رقم الهوية/ الإقامة', field: 'idNumber' },
                  { label: 'تاريخ الميلاد', field: 'birthDate' },
                  { label: 'البريد الوزاري', field: 'mohEmail' },
                  { label: 'رقم التصنيف إن وجد', field: 'scfhsNumber' },
                  { label: 'تاريخ انتهاء (التدريب/ العقد)', field: 'endDate' },
                  { label: 'رقم التواصل', field: 'contactPhone' }
                ].map(item => (
                  <div key={item.field} className="flex items-center gap-2 justify-end mb-1">
                    <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                      {formData[item.field]}
                    </span>
                    <span style={{ minWidth: '140px', textAlign: 'right' }}>{item.label}:</span>
                  </div>
                ))}
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>المهنة:</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <CheckboxField checked={formData.physician} onChange={(e) => handleInputChange('physician', e.target.checked)} labelAr="طبيب" isArabic />
                  <CheckboxField checked={formData.nurse} onChange={(e) => handleInputChange('nurse', e.target.checked)} labelAr="تمريض" isArabic />
                  <CheckboxField checked={formData.receptionist} onChange={(e) => handleInputChange('receptionist', e.target.checked)} labelAr="استقبال" isArabic />
                  <CheckboxField checked={formData.pharmacist} onChange={(e) => handleInputChange('pharmacist', e.target.checked)} labelAr="صيدلي" isArabic />
                  <CheckboxField checked={formData.labTechnician} onChange={(e) => handleInputChange('labTechnician', e.target.checked)} labelAr="مختبر" isArabic />
                  <CheckboxField checked={formData.facilityManager} onChange={(e) => handleInputChange('facilityManager', e.target.checked)} labelAr="مدير منشأة" isArabic />
                </div>
                <div className="space-y-1 mt-3">
                  {[
                    { label: 'المنشأة', field: 'organization' },
                    { label: 'القسم', field: 'department' },
                    { label: 'التخصص', field: 'specialization' },
                    { label: 'الصلاحيات المطلوبة', field: 'recruitmentPrivilege' }
                  ].map(item => (
                    <div key={item.field} className="flex items-center gap-2 justify-end">
                      <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange(item.field, e.currentTarget.textContent)} style={{ borderBottom: '1px dotted #666', flex: 1 }}>
                        {formData[item.field]}
                      </span>
                      <span style={{ minWidth: '100px', textAlign: 'right' }}>{item.label}:</span>
                    </div>
                  ))}
                </div>
              </td>
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <span style={{ fontWeight: 'bold' }}>*Occupation:</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <CheckboxField checked={formData.receptionist} onChange={(e) => handleInputChange('receptionist', e.target.checked)} labelEn="Receptionist" />
                  <CheckboxField checked={formData.nurse} onChange={(e) => handleInputChange('nurse', e.target.checked)} labelEn="Nurse" />
                  <CheckboxField checked={formData.physician} onChange={(e) => handleInputChange('physician', e.target.checked)} labelEn="Physician" />
                  <CheckboxField checked={formData.facilityManager} onChange={(e) => handleInputChange('facilityManager', e.target.checked)} labelEn="Facility Manager" />
                  <CheckboxField checked={formData.pharmacist} onChange={(e) => handleInputChange('pharmacist', e.target.checked)} labelEn="Pharmacist" />
                  <CheckboxField checked={formData.labTechnician} onChange={(e) => handleInputChange('labTechnician', e.target.checked)} labelEn="Lab Technician" />
                </div>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <div style={{ backgroundColor: '#f8f9fa', padding: '8px', fontSize: '9px', lineHeight: '1.5' }}>
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
              <td style={{ padding: '8px', borderTop: 'none', borderBottom: 'none' }}>
                <div style={{ backgroundColor: '#f8f9fa', padding: '8px', fontSize: '9px', lineHeight: '1.5' }}>
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
            <tr>
              <td colSpan="2" style={{ padding: '10px' }}>
                <div className="flex justify-between items-center">
                  {/* اسم الموظف - يسار */}
                  <div style={{ width: '35%', textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>اسم الموظف:</div>
                    <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('employeeName', e.currentTarget.textContent)} style={{ display: 'block', borderBottom: '1px solid #000', minHeight: '25px', padding: '4px' }}>
                      {formData.employeeName}
                    </span>
                  </div>
                  
                  {/* الختم - وسط */}
                  <div style={{ width: '20%', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>الختم / Stamp</div>
                    <div style={{ border: '1px solid #000', height: '50px', width: '70px', margin: '0 auto' }}></div>
                  </div>
                  
                  {/* اعتماد الرئيس المباشر - يمين */}
                  <div style={{ width: '35%', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>اعتماد الرئيس المباشر:</div>
                    <span className="editable-cell" contentEditable suppressContentEditableWarning onBlur={(e) => handleInputChange('managerApproval', e.currentTarget.textContent)} style={{ display: 'block', borderBottom: '1px solid #000', minHeight: '25px', padding: '4px' }}>
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