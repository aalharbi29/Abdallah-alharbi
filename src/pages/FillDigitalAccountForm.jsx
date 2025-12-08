import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Printer, Download, CheckCircle, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SmartDateInput from '../components/ui/smart-date-input';
import FormElementEditor from '../components/form_builder/FormElementEditor';

export default function FillDigitalAccountForm() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementStyles, setElementStyles] = useState({});

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

  const handleElementClick = (e, elementId) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleStyleUpdate = (elementId, styles) => {
    setElementStyles(prev => ({
      ...prev,
      [elementId]: styles
    }));
  };

  const getElementStyle = (elementId) => {
    return elementStyles[elementId] || {};
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6" dir="rtl">
      <div className="flex gap-4 max-w-7xl mx-auto">
        {/* لوحة التحكم */}
        {isEditMode && selectedElement && (
          <div className="fixed left-4 top-20 z-50">
            <FormElementEditor
              element={getElementStyle(selectedElement)}
              onUpdate={(styles) => handleStyleUpdate(selectedElement, styles)}
              onClose={() => setSelectedElement(null)}
            />
          </div>
        )}

        <div className="flex-1 max-w-5xl mx-auto">
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
            <Button 
              onClick={() => setIsEditMode(!isEditMode)} 
              variant={isEditMode ? 'default' : 'outline'}
              className={isEditMode ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <Edit3 className="w-4 h-4 ml-2" />
              {isEditMode ? 'إيقاف التحرير' : 'تحرير التصميم'}
            </Button>
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

        {/* الشعار والعنوان - خارج الجدول */}
        <div 
          className={`text-center mb-4 print-area-header ${isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-purple-400 rounded p-2' : ''}`}
          onClick={(e) => handleElementClick(e, 'header')}
          style={getElementStyle('header')}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <defs>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#blueGrad)" />
              <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 60 L30 75 L35 55 L20 40 L40 40 Z" fill="white" />
            </svg>
          </div>
          <h1 
            className={`text-sky-600 font-bold mb-1 ${isEditMode ? 'cursor-pointer hover:bg-purple-50' : ''}`}
            style={{ fontSize: '16px', ...getElementStyle('title') }}
            onClick={(e) => handleElementClick(e, 'title')}
          >
            الخدمات المشتركة للصحة الرقمية والتقنية
          </h1>
          <p 
            className={`text-gray-400 ${isEditMode ? 'cursor-pointer hover:bg-purple-50' : ''}`}
            style={{ fontSize: '12px', ...getElementStyle('subtitle') }}
            onClick={(e) => handleElementClick(e, 'subtitle')}
          >
            Shared Services for Digital Health & Technology
          </p>
        </div>

        {/* النموذج الرسمي */}
        <div 
          className={`bg-white border-2 border-black print-area ${isEditMode ? 'cursor-pointer' : ''}`}
          style={{ width: '210mm', margin: '0 auto', padding: '0', ...getElementStyle('main-container') }}
          onClick={(e) => handleElementClick(e, 'main-container')}
        >
          {/* عنوان النموذج */}
          <div 
            className={`border-b-2 border-black text-center py-1 ${isEditMode ? 'cursor-pointer hover:bg-purple-50' : ''}`}
            style={getElementStyle('form-title-container')}
            onClick={(e) => handleElementClick(e, 'form-title-container')}
          >
            <h2 
              className={`font-bold ${isEditMode ? 'cursor-pointer' : ''}`}
              style={{ fontSize: '13px', ...getElementStyle('form-title') }}
              onClick={(e) => handleElementClick(e, 'form-title')}
            >
              نموذج إنشاء إيقاف حساب
            </h2>
          </div>

          <div style={{ fontSize: '10px' }}>
            {/* جدول النظام ونوع الطلب */}
            <table 
              className={`w-full border-collapse border-2 border-black ${isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-purple-400' : ''}`}
              style={getElementStyle('table-system-request')}
              onClick={(e) => handleElementClick(e, 'table-system-request')}
            >
              <tbody>
                <tr>
                  {/* يمين - إنجليزي - النظام */}
                  <td 
                    className={`border-2 border-black p-2 align-top ${isEditMode ? 'cursor-pointer hover:bg-purple-50' : ''}`}
                    style={{ width: '50%', ...getElementStyle('cell-system-en') }}
                    onClick={(e) => handleElementClick(e, 'cell-system-en')}
                  >
                    <strong style={{ fontSize: '11px', ...getElementStyle('label-system-en') }} onClick={(e) => handleElementClick(e, 'label-system-en')}>*System:</strong>
                    <table className="w-full border-collapse mt-1">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Raqeem</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Medica cloud</td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}><Checkbox checked={formData.system_type.includes('Raqeem')} onCheckedChange={() => handleSystemToggle('Raqeem')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}><Checkbox checked={formData.system_type.includes('Medica cloud')} onCheckedChange={() => handleSystemToggle('Medica cloud')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse mt-1">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" colSpan="2" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Mawid</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" colSpan="2" style={{ fontSize: '9px' }}><Checkbox checked={formData.system_type.includes('Mawid')} onCheckedChange={() => handleSystemToggle('Mawid')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" colSpan="2" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* يسار - عربي - النظام */}
                  <td className="border-2 border-black p-2 align-top text-right" style={{ width: '50%' }}>
                    <strong style={{ fontSize: '11px' }}>النظام:</strong>
                    <table className="w-full border-collapse mt-1" dir="rtl">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>ميديكا كلاود</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>رقيم</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse mt-1" dir="rtl">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>موعد</td>
                          <td className="border border-black text-center p-0.5" colSpan="2" style={{ fontSize: '9px' }}></td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" colSpan="2" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" colSpan="2" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  {/* يمين - إنجليزي - نوع الطلب */}
                  <td className="border-2 border-black p-2 align-top">
                    <strong style={{ fontSize: '11px' }}>*Type of Request:</strong>
                    <table className="w-full border-collapse mt-1">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Create a new user name</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Restore password</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'انشاء مستخدم جديد'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'انشاء مستخدم جديد' }))} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'استعادة كلمة مرور'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'استعادة كلمة مرور' }))} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse mt-1">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Delete a user name</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Relocate a user name</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'الغاء اسم مستخدم'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'الغاء اسم مستخدم' }))} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'نقل اسم مستخدم'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'نقل اسم مستخدم' }))} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* يسار - عربي - نوع الطلب */}
                  <td className="border-2 border-black p-2 align-top text-right">
                    <strong style={{ fontSize: '11px' }}>نوع الطلب:</strong>
                    <table className="w-full border-collapse mt-1" dir="rtl">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>استعادة كلمة مرور</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>انشاء مستخدم جديد</td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse mt-1" dir="rtl">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>نقل اسم مستخدم</td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>الغاء اسم مستخدم</td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* السبب */}
            <table className="w-full border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="border-2 border-black p-1" style={{ width: '50%', fontSize: '10px' }}>
                    <strong>*Reason: </strong>
                    <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span>
                  </td>
                  <td className="border-2 border-black p-1 text-right" style={{ width: '50%', fontSize: '10px' }}>
                    <strong>السبب: </strong>
                    <Input value={formData.reason} onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-3/4 h-5 px-1 text-right" style={{ fontSize: '10px' }} />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* اسم الموظف */}
            <table className="w-full border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="border-2 border-black p-2" style={{ width: '50%' }}>
                    <strong style={{ fontSize: '10px' }}>*Staff Name:</strong>
                    <div className="space-y-0.5 mt-1" style={{ fontSize: '9px' }}>
                      <div>First: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                      <div>Second: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                      <div>Third: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                      <div>Family: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                    </div>
                  </td>
                  <td className="border-2 border-black p-2 text-right" style={{ width: '50%' }}>
                    <strong style={{ fontSize: '10px' }}>اسم الموظف:</strong>
                    <div className="space-y-0.5 mt-1" style={{ fontSize: '9px' }}>
                      <div>الأول : <Input value={formData.employee_name_first} onChange={(e) => setFormData(p => ({ ...p, employee_name_first: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-3/4 h-5 px-1 text-right" style={{ fontSize: '9px' }} /></div>
                      <div>الثاني : <Input value={formData.employee_name_second} onChange={(e) => setFormData(p => ({ ...p, employee_name_second: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-3/4 h-5 px-1 text-right" style={{ fontSize: '9px' }} /></div>
                      <div>الثالث: <Input value={formData.employee_name_third} onChange={(e) => setFormData(p => ({ ...p, employee_name_third: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-3/4 h-5 px-1 text-right" style={{ fontSize: '9px' }} /></div>
                      <div>العائلة : <Input value={formData.employee_name_family} onChange={(e) => setFormData(p => ({ ...p, employee_name_family: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-3/4 h-5 px-1 text-right" style={{ fontSize: '9px' }} /></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* البيانات الشخصية */}
            {[
              { en: 'ID NO:', ar: 'رقم الهوية/ الإقامة:', key: 'national_id' },
              { en: 'Date of birth:', ar: 'تاريخ الميلاد:', key: 'birth_date' },
              { en: 'MOH email:', ar: 'البريد الوزاري:', key: 'moh_email' },
              { en: 'SCFHS number:', ar: 'رقم التصنيف إن وجد:', key: 'scfhs_number' },
              { en: 'End date of (internship\\contract):', ar: 'تاريخ انتهاء (التدريب/ العقد):', key: 'contract_end_date' },
              { en: 'Contact Phone:', ar: 'رقم التواصل:', key: 'contact_phone' }
            ].map((field, idx) => (
              <table key={idx} className="w-full border-collapse border-2 border-black">
                <tbody>
                  <tr>
                    <td className="border-2 border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                      <strong>{field.en} </strong>
                      <span className="border-b border-dotted border-gray-600 inline-block w-2/3 mx-1"></span>
                    </td>
                    <td className="border-2 border-black p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                      <strong>{field.ar} </strong>
                      {field.key === 'birth_date' || field.key === 'contract_end_date' ? (
                        <span className="border-b border-dotted border-gray-600 inline-block w-2/3 mx-1"></span>
                      ) : (
                        <Input 
                          value={formData[field.key]} 
                          onChange={(e) => setFormData(p => ({ ...p, [field.key]: e.target.value }))} 
                          className="inline-block border-0 border-b border-dotted border-gray-600 w-2/3 h-5 px-1 text-right" 
                          style={{ fontSize: '9px' }} 
                        />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            ))}

            {/* المهنة */}
            <table className="w-full border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="border-2 border-black p-2 align-top" style={{ width: '50%' }}>
                    <strong style={{ fontSize: '10px' }}>*Occupation:</strong>
                    <table className="w-full border-collapse mt-1">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Receptionist</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('استقبال')} onCheckedChange={() => handleOccupationToggle('استقبال')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Nurse</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('تمريض')} onCheckedChange={() => handleOccupationToggle('تمريض')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>physician</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('طبيب')} onCheckedChange={() => handleOccupationToggle('طبيب')} className="scale-75" /></td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Facility Manger</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('مدير منشأة')} onCheckedChange={() => handleOccupationToggle('مدير منشأة')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Pharmacist</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('صيدلي')} onCheckedChange={() => handleOccupationToggle('صيدلي')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Lab Technician</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('مختبر')} onCheckedChange={() => handleOccupationToggle('مختبر')} className="scale-75" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td className="border-2 border-black p-2 align-top text-right" style={{ width: '50%' }}>
                    <strong style={{ fontSize: '10px' }}>المهنة :</strong>
                    <table className="w-full border-collapse mt-1" dir="rtl">
                      <tbody>
                        <tr>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('طبيب')} onCheckedChange={() => handleOccupationToggle('طبيب')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>طبيب</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('تمريض')} onCheckedChange={() => handleOccupationToggle('تمريض')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>تمريض</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('استقبال')} onCheckedChange={() => handleOccupationToggle('استقبال')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>استقبال</td>
                        </tr>
                        <tr>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('مختبر')} onCheckedChange={() => handleOccupationToggle('مختبر')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>مختبر</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('صيدلي')} onCheckedChange={() => handleOccupationToggle('صيدلي')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>صيدلي</td>
                          <td className="border border-black text-center p-0.5"><Checkbox checked={formData.occupation.includes('مدير منشأة')} onCheckedChange={() => handleOccupationToggle('مدير منشأة')} className="scale-75" /></td>
                          <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>مدير منشأة</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* بيانات الجهة */}
            {[
              { en: 'Organization:', ar: 'المنشأة:', key: 'organization' },
              { en: 'Department:', ar: 'القسم :', key: 'department' },
              { en: 'Specialization:', ar: 'التخصص:', key: 'specialization' },
              { en: 'Recruitment privilege:', ar: 'الصلاحيات المطلوبة :', key: 'recruitment_privilege' }
            ].map((field, idx) => (
              <table key={idx} className="w-full border-collapse border-2 border-black">
                <tbody>
                  <tr>
                    <td className="border-2 border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                      <strong>{field.en} </strong>
                      <span className="border-b border-dotted border-gray-600 inline-block w-2/3 mx-1"></span>
                    </td>
                    <td className="border-2 border-black p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                      <strong>{field.ar} </strong>
                      <Input value={formData[field.key]} onChange={(e) => setFormData(p => ({ ...p, [field.key]: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-2/3 h-5 px-1 text-right" style={{ fontSize: '9px' }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            ))}

            {/* التعهد */}
            <table className="w-full border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="border-2 border-black p-2 align-top" style={{ width: '50%' }}>
                    <div className="border border-black p-2" style={{ fontSize: '8px', lineHeight: '1.3' }}>
                      <p className="mb-1">I Will safeguard and will not disclose my username and password. Any access to informatio system by my username and password is my responsibility. If I believe someone else has logged into my account, I will immediately report the breach to digital health & technology department and will immediately change my password.</p>
                      <p className="text-blue-600 text-center">med-hc-digital@moh.gov.sa</p>
                    </div>
                  </td>
                  <td className="border-2 border-black p-2 align-top text-right" style={{ width: '50%' }}>
                    <div className="border border-black p-2" style={{ fontSize: '8px', lineHeight: '1.3' }}>
                      <p className="mb-1">اتعهد بالمحافظة على اسم وكلمة السر الخاصة بي ولن اعطيها لأي شخص اخر، أي وصول إلى نظام المعلومات باستخدام اسم المستخدم. وكلمة المرور الخاصين بي هو مسؤوليتي وإذا علمت ان هناك شخص اخر استخدم حسابي فسوف أقوم بإبلاغ المسؤول بقسم الصحة الرقمية والتكنولوجيا عن ذلك وتغير كلمة السر .</p>
                      <p className="text-blue-600 text-center">med-hc-digital@moh.gov.sa</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ملاحظة الرئيس المباشر */}
            <table className="w-full border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="border-2 border-black p-1.5" style={{ width: '50%', fontSize: '8px', lineHeight: '1.3' }}>
                    <strong>*The direct manager must provide us with the employee's data in the event of assignment or transfer outside the center or hospital.</strong>
                  </td>
                  <td className="border-2 border-black p-1.5 text-right" style={{ width: '50%', fontSize: '8px', lineHeight: '1.3' }}>
                    <strong>* على الرئيس المباشر تزويدنا ببيانات الموظف في حال التكليف او النقل خارج المركز أو المستشفى</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* التوقيعات */}
            <table className="w-full border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="border-2 border-black p-2 text-center" style={{ fontSize: '10px' }}>
                    <strong>اسم الموظف:</strong>
                    <div className="mt-8 border-b border-dotted border-gray-600 mx-4"></div>
                  </td>
                  <td className="border-2 border-black p-2 text-center" style={{ fontSize: '10px' }}>
                    <strong>اعتماد الرئيس المباشر</strong>
                    <div className="mt-8"></div>
                  </td>
                  <td className="border-2 border-black p-2 text-center" style={{ fontSize: '10px' }}>
                    <strong>الختم</strong>
                    <div className="mt-8"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="text-center py-2" style={{ fontSize: '10px' }}>
            <div className="h-8 bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{ height: '3px', margin: '8px 0' }}></div>
            <p className="font-bold text-blue-600">تجمع المدينة الصحي</p>
            <p className="text-gray-600" style={{ fontSize: '9px' }}>Madinah Health Cluster</p>
            <p className="text-gray-400" style={{ fontSize: '8px' }}>Empowered by Health Holding co.</p>
          </div>
        </div>
        </div>
      </div>

      {isEditMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl z-50">
          <p className="text-sm font-medium">🎨 وضع التحرير نشط - اضغط على أي عنصر لتعديله</p>
        </div>
      )}

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
        ${isEditMode ? `
          .cursor-pointer:hover {
            outline: 2px dashed #a855f7;
            outline-offset: 2px;
          }
        ` : ''}
      `}</style>
    </div>
  );
}