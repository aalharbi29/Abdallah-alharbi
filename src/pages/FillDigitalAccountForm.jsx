import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Printer, Download, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SmartDateInput from '../components/ui/smart-date-input';

export default function FillDigitalAccountForm() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    system_type: [],
    request_type: '',
    reason: '',
    employee_id: '',
    employee_name_first: '',
    employee_name_second: '',
    employee_name_third: '',
    employee_name_family: '',
    national_id: '',
    birth_date: null,
    moh_email: '',
    scfhs_number: '',
    contract_end_date: null,
    contact_phone: '',
    occupation: [],
    organization: '',
    department: '',
    specialization: '',
    recruitment_privilege: '',
    commitment_accepted: false,
    direct_manager_name: '',
    direct_manager_approval_date: null,
    status: 'مسودة'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeesData, centersData] = await Promise.all([
        base44.entities.Employee.list('-updated_date', 500),
        base44.entities.HealthCenter.list()
      ]);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setHealthCenters(Array.isArray(centersData) ? centersData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      
      // تقسيم الاسم الكامل
      const nameParts = (employee.full_name_arabic || '').split(' ');
      
      setFormData(prev => ({
        ...prev,
        employee_id: employee.id,
        employee_name_first: nameParts[0] || '',
        employee_name_second: nameParts[1] || '',
        employee_name_third: nameParts[2] || '',
        employee_name_family: nameParts[3] || nameParts[nameParts.length - 1] || '',
        national_id: employee.رقم_الهوية || '',
        birth_date: employee.birth_date ? new Date(employee.birth_date) : null,
        moh_email: employee.email || '',
        contact_phone: employee.phone || '',
        organization: employee.المركز_الصحي || '',
        department: employee.department || '',
        specialization: employee.position || '',
        contract_end_date: employee.contract_end_date ? new Date(employee.contract_end_date) : null
      }));
    }
  };

  const handleSystemToggle = (system) => {
    setFormData(prev => {
      const newSystems = prev.system_type.includes(system)
        ? prev.system_type.filter(s => s !== system)
        : [...prev.system_type, system];
      return { ...prev, system_type: newSystems };
    });
  };

  const handleOccupationToggle = (occupation) => {
    setFormData(prev => {
      const newOccupations = prev.occupation.includes(occupation)
        ? prev.occupation.filter(o => o !== occupation)
        : [...prev.occupation, occupation];
      return { ...prev, occupation: newOccupations };
    });
  };

  const handleSave = async () => {
    try {
      await base44.entities.DigitalAccountRequest.create(formData);
      alert('✅ تم حفظ الطلب بنجاح');
      navigate(createPageUrl('InteractiveForms'));
    } catch (error) {
      console.error('Error saving:', error);
      alert('حدث خطأ أثناء حفظ الطلب');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button variant="outline" onClick={() => navigate(createPageUrl('InteractiveForms'))} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">نموذج إنشاء/إيقاف حساب رقمي</h1>
            <p className="text-gray-600 text-sm">رقيم - ميديكا كلاود - موعد</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>

        {/* اختيار الموظف */}
        <Card className="mb-6 no-print">
          <CardHeader>
            <CardTitle className="text-lg">اختيار الموظف</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleEmployeeSelect} value={formData.employee_id}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الموظف..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name_arabic} - {emp.رقم_الموظف} - {emp.المركز_الصحي}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* النموذج الرسمي */}
        <div className="bg-white border-2 border-gray-400 p-0 print-area" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-300">
            <div className="text-left flex-1" style={{ fontSize: '10px', lineHeight: '1.3' }}>
              <p className="font-medium">Med-hc-digital@moh.gov.sa</p>
              <p className="font-medium">Shared Services for Digital Health & Technology</p>
            </div>
            <div className="w-12 h-12 mx-4" style={{ marginTop: '-10px' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#0066cc" />
              </svg>
            </div>
            <div className="text-right flex-1" style={{ fontSize: '10px', lineHeight: '1.3' }}>
              <p className="font-bold">الخدمات المشتركة للصحة الرقمية والتقنية</p>
              <p>Med-hc-digital@moh.gov.sa</p>
            </div>
          </div>

          <h2 className="text-center font-bold py-2 bg-blue-100 border-b border-gray-300" style={{ fontSize: '14px' }}>
            نموذج إنشاء إيقاف حساب
          </h2>

          <div className="p-4" style={{ fontSize: '11px' }}>
            {/* الصف الأول: النظام ونوع الطلب */}
            <table className="w-full border-collapse mb-3" style={{ tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 align-top" style={{ width: '50%' }}>
                    <div className="flex justify-between items-start mb-2">
                      <strong>*System:</strong>
                      <strong className="mr-auto">النظام:</strong>
                    </div>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-1 text-left" style={{ width: '50%' }}>Raqeem</td>
                          <td className="border border-gray-300 p-1">
                            <Checkbox checked={formData.system_type.includes('Raqeem')} onCheckedChange={() => handleSystemToggle('Raqeem')} />
                          </td>
                          <td className="border border-gray-300 p-1 text-right" style={{ width: '50%' }}>رقيم</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1 text-left">Medica cloud</td>
                          <td className="border border-gray-300 p-1">
                            <Checkbox checked={formData.system_type.includes('Medica cloud')} onCheckedChange={() => handleSystemToggle('Medica cloud')} />
                          </td>
                          <td className="border border-gray-300 p-1 text-right">ميديكا كلاود</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1 text-left">Mawid</td>
                          <td className="border border-gray-300 p-1">
                            <Checkbox checked={formData.system_type.includes('Mawid')} onCheckedChange={() => handleSystemToggle('Mawid')} />
                          </td>
                          <td className="border border-gray-300 p-1 text-right">موعد</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="border border-gray-400 p-2 align-top" style={{ width: '50%' }}>
                    <div className="flex justify-between items-start mb-2">
                      <strong>*Type of Request:</strong>
                      <strong className="mr-auto">نوع الطلب:</strong>
                    </div>
                    <table className="w-full">
                      <tbody>
                        {[
                          { ar: 'استعادة كلمة مرور', en: 'Restore password' },
                          { ar: 'انشاء مستخدم جديد', en: 'Create a new user name' }
                        ].map(opt => (
                          <tr key={opt.ar}>
                            <td className="border border-gray-300 p-1 text-left" style={{ width: '45%' }}>{opt.en}</td>
                            <td className="border border-gray-300 p-1 text-center" style={{ width: '10%' }}>
                              <Checkbox checked={formData.request_type === opt.ar} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: opt.ar }))} />
                            </td>
                            <td className="border border-gray-300 p-1 text-right" style={{ width: '45%' }}>{opt.ar}</td>
                          </tr>
                        ))}
                        {[
                          { ar: 'الغاء اسم مستخدم', en: 'Delete a user name' },
                          { ar: 'نقل اسم مستخدم', en: 'Relocate a user name' }
                        ].map(opt => (
                          <tr key={opt.ar}>
                            <td className="border border-gray-300 p-1 text-left">{opt.en}</td>
                            <td className="border border-gray-300 p-1 text-center">
                              <Checkbox checked={formData.request_type === opt.ar} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: opt.ar }))} />
                            </td>
                            <td className="border border-gray-300 p-1 text-right">{opt.ar}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* السبب */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2" style={{ width: '50%' }}>
                    <strong>*Reason: </strong>
                    <Input value={formData.reason} onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-3/4 h-6 px-1" style={{ fontSize: '11px' }} />
                  </td>
                  <td className="border border-gray-400 p-2 text-right" style={{ width: '50%' }}>
                    <strong>السبب: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-3/4"></span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* اسم الموظف */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2" style={{ width: '50%' }}>
                    <strong>*Staff Name:</strong>
                    <div className="mt-1 space-y-1" style={{ fontSize: '10px' }}>
                      <div>First: <Input value={formData.employee_name_first} onChange={(e) => setFormData(p => ({ ...p, employee_name_first: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" /></div>
                      <div>Second: <Input value={formData.employee_name_second} onChange={(e) => setFormData(p => ({ ...p, employee_name_second: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" /></div>
                      <div>Third: <Input value={formData.employee_name_third} onChange={(e) => setFormData(p => ({ ...p, employee_name_third: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" /></div>
                      <div>Family: <Input value={formData.employee_name_family} onChange={(e) => setFormData(p => ({ ...p, employee_name_family: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" /></div>
                    </div>
                  </td>
                  <td className="border border-gray-400 p-2 text-right" style={{ width: '50%' }}>
                    <strong>اسم الموظف:</strong>
                    <div className="mt-1 space-y-1" style={{ fontSize: '10px' }}>
                      <div className="text-right">الأول : <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span></div>
                      <div className="text-right">الثاني : <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span></div>
                      <div className="text-right">الثالث: <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span></div>
                      <div className="text-right">العائلة : <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* البيانات الشخصية - صفين */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ width: '50%', fontSize: '10px' }}>
                    <strong>ID NO: </strong>
                    <Input value={formData.national_id} onChange={(e) => setFormData(p => ({ ...p, national_id: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ width: '50%', fontSize: '10px' }}>
                    <strong>رقم الهوية/ الإقامة: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/2"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>Date of birth: </strong>
                    <Input value={formData.birth_date ? formData.birth_date.toLocaleDateString('en-GB') : ''} onChange={(e) => {}} className="inline-block border-0 border-b border-dotted border-gray-500 w-1/2 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>تاريخ الميلاد: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/2"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>MOH email: </strong>
                    <Input value={formData.moh_email} onChange={(e) => setFormData(p => ({ ...p, moh_email: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-1/2 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>البريد الوزاري: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/2"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>SCFHS number: </strong>
                    <Input value={formData.scfhs_number} onChange={(e) => setFormData(p => ({ ...p, scfhs_number: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-1/2 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>رقم التصنيف إن وجد: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/2"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>End date of (internship\contract): </strong>
                    <Input value={formData.contract_end_date ? formData.contract_end_date.toLocaleDateString('en-GB') : ''} className="inline-block border-0 border-b border-dotted border-gray-500 w-1/3 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>تاريخ انتهاء (التدريب/ العقد): </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/3"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>Contact Phone: </strong>
                    <Input value={formData.contact_phone} onChange={(e) => setFormData(p => ({ ...p, contact_phone: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-1/2 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>رقم التواصل: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/2"></span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* المهنة */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2" style={{ width: '50%' }}>
                    <strong className="block mb-2">*Occupation:</strong>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-1 text-left" style={{ width: '40%', fontSize: '10px' }}>Receptionist</td>
                          <td className="border border-gray-300 p-1 text-center" style={{ width: '10%' }}><Checkbox checked={formData.occupation.includes('استقبال')} onCheckedChange={() => handleOccupationToggle('استقبال')} /></td>
                          <td className="border border-gray-300 p-1 text-left" style={{ width: '40%', fontSize: '10px' }}>Nurse</td>
                          <td className="border border-gray-300 p-1 text-center" style={{ width: '10%' }}><Checkbox checked={formData.occupation.includes('تمريض')} onCheckedChange={() => handleOccupationToggle('تمريض')} /></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1 text-left" style={{ fontSize: '10px' }}>Facility Manger</td>
                          <td className="border border-gray-300 p-1 text-center"><Checkbox checked={formData.occupation.includes('مدير منشأة')} onCheckedChange={() => handleOccupationToggle('مدير منشأة')} /></td>
                          <td className="border border-gray-300 p-1 text-left" style={{ fontSize: '10px' }}>Pharmacist</td>
                          <td className="border border-gray-300 p-1 text-center"><Checkbox checked={formData.occupation.includes('صيدلي')} onCheckedChange={() => handleOccupationToggle('صيدلي')} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="border border-gray-400 p-2 text-right" style={{ width: '50%' }}>
                    <strong className="block mb-2">المهنة :</strong>
                    <table className="w-full" dir="rtl">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-1 text-center" style={{ width: '10%' }}><Checkbox checked={formData.occupation.includes('طبيب')} onCheckedChange={() => handleOccupationToggle('طبيب')} /></td>
                          <td className="border border-gray-300 p-1 text-right" style={{ width: '40%', fontSize: '10px' }}>طبيب</td>
                          <td className="border border-gray-300 p-1 text-center" style={{ width: '10%' }}><Checkbox checked={formData.occupation.includes('تمريض')} onCheckedChange={() => handleOccupationToggle('تمريض')} /></td>
                          <td className="border border-gray-300 p-1 text-right" style={{ width: '40%', fontSize: '10px' }}>استقبال</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1 text-center"><Checkbox checked={formData.occupation.includes('مختبر')} onCheckedChange={() => handleOccupationToggle('مختبر')} /></td>
                          <td className="border border-gray-300 p-1 text-right" style={{ fontSize: '10px' }}>مختبر</td>
                          <td className="border border-gray-300 p-1 text-center"><Checkbox checked={formData.occupation.includes('صيدلي')} onCheckedChange={() => handleOccupationToggle('صيدلي')} /></td>
                          <td className="border border-gray-300 p-1 text-right" style={{ fontSize: '10px' }}>مدير منشأة</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* بيانات الجهة */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ width: '50%', fontSize: '10px' }}>
                    <strong>Organization: </strong>
                    <Input value={formData.organization} onChange={(e) => setFormData(p => ({ ...p, organization: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ width: '50%', fontSize: '10px' }}>
                    <strong>المنشأة: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>Department: </strong>
                    <Input value={formData.department} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>القسم : </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>Specialization: </strong>
                    <Input value={formData.specialization} onChange={(e) => setFormData(p => ({ ...p, specialization: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-2/3 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>التخصص: </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-2/3"></span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-1.5" style={{ fontSize: '10px' }}>
                    <strong>Recruitment privilege: </strong>
                    <Input value={formData.recruitment_privilege} onChange={(e) => setFormData(p => ({ ...p, recruitment_privilege: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-500 w-1/2 h-5 px-1" style={{ fontSize: '10px' }} />
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right" style={{ fontSize: '10px' }}>
                    <strong>الصلاحيات المطلوبة : </strong>
                    <span className="border-b border-dotted border-gray-500 inline-block w-1/2"></span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* التعهد */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2" colSpan="2">
                    <div className="grid grid-cols-2 gap-3">
                      <div style={{ fontSize: '9px', lineHeight: '1.4' }}>
                        <p>I Will safeguard and will not disclose my username and password. Any access to informatio system by my username and password is my responsibility. If I believe someone else has logged into my account, I will immediately report the breach to digital health & technology department and will immediately change my password.</p>
                        <p className="mt-1 text-blue-600">med-hc-digital@moh.gov.sa</p>
                      </div>
                      <div className="text-right" style={{ fontSize: '9px', lineHeight: '1.4' }}>
                        <p>اتعهد بالمحافظة على اسم وكلمة السر الخاصة بي ولن اعطيها لأي شخص اخر، أي وصول إلى نظام المعلومات باستخدام اسم المستخدم. وكلمة المرور الخاصين بي هو مسؤوليتي وإذا علمت ان هناك شخص اخر استخدم حسابي فسوف أقوم بإبلاغ المسؤول بقسم الصحة الرقمية والتكنولوجيا عن ذلك وتغير كلمة السر .</p>
                        <p className="mt-1 text-blue-600">med-hc-digital@moh.gov.sa</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ملاحظة */}
            <table className="w-full border-collapse mb-3">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 bg-blue-50" colSpan="2">
                    <p className="text-center font-bold mb-1" style={{ fontSize: '10px' }}>
                      *The direct manager must provide us with the employee's data in the event of assignment or transfer outside the center or hospital.
                    </p>
                    <p className="text-center font-bold" style={{ fontSize: '10px' }}>
                      * على الرئيس المباشر تزويدنا ببيانات الموظف في حال التكليف او النقل خارج المركز أو المستشفى
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* التوقيع */}
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 text-center align-top" style={{ width: '33%', fontSize: '10px' }}>
                    <strong className="block mb-1">اسم الموظف:</strong>
                    <div className="h-12 flex items-center justify-center">
                      <span className="text-xs">{`${formData.employee_name_first} ${formData.employee_name_family}`.trim()}</span>
                    </div>
                  </td>
                  <td className="border border-gray-400 p-2 text-center align-top" style={{ width: '33%', fontSize: '10px' }}>
                    <strong className="block mb-1">اعتماد الرئيس المباشر</strong>
                    <div className="h-12"></div>
                  </td>
                  <td className="border border-gray-400 p-2 text-center align-top" style={{ width: '33%', fontSize: '10px' }}>
                    <strong className="block mb-1">الختم</strong>
                    <div className="h-12"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="text-center py-2 border-t border-gray-300 bg-blue-50" style={{ fontSize: '11px' }}>
            <p className="font-bold text-blue-800">تجمع المدينة الصحي</p>
            <p style={{ fontSize: '10px' }}>Madinah Health Cluster</p>
            <p className="text-gray-500" style={{ fontSize: '9px' }}>Empowered by Health Holding co.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          .no-print { display: none !important; }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}