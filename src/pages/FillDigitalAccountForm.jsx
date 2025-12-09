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
    employee_name_arabic: '',
    employee_name_english: '',
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
    direct_manager_name_english: '',
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

  const handleEmployeeSelect = async (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      
      const nameParts = (employee.full_name_arabic || '').split(' ');
      
      let managerName = '';
      let managerNameEnglish = '';
      
      const healthCenter = healthCenters.find(c => c.اسم_المركز === employee.المركز_الصحي);
      if (healthCenter && healthCenter.المدير) {
        const manager = employees.find(e => e.رقم_الموظف === healthCenter.المدير);
        if (manager) {
          managerName = manager.full_name_arabic || '';
          managerNameEnglish = manager.full_name_arabic || '';
        }
      }
      
      setFormData(prev => ({
        ...prev,
        employee_id: employee.id,
        employee_name_first: nameParts[0] || '',
        employee_name_second: nameParts[1] || '',
        employee_name_third: nameParts[2] || '',
        employee_name_family: nameParts[3] || nameParts[nameParts.length - 1] || '',
        employee_name_arabic: employee.full_name_arabic || '',
        employee_name_english: employee.full_name_arabic || '',
        national_id: employee.رقم_الهوية || '',
        birth_date: employee.birth_date ? new Date(employee.birth_date) : null,
        moh_email: employee.email || '',
        contact_phone: employee.phone || '',
        occupation: employee.position ? [employee.position] : [],
        organization: employee.المركز_الصحي || '',
        department: employee.department || '',
        specialization: employee.position || '',
        recruitment_privilege: '',
        contract_end_date: employee.contract_end_date ? new Date(employee.contract_end_date) : null,
        direct_manager_name: managerName,
        direct_manager_name_english: managerNameEnglish
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
    <>
      {/* خلفية الشعار المستقلة - ثابتة على كامل الصفحة */}
      <div 
        className="fixed inset-0 pointer-events-none print-background"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/44e7acbe3_page_1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1
        }}
      />

      <div 
        className="min-h-screen p-4 md:p-6" 
        dir="rtl"
        style={{
          backgroundColor: 'transparent'
        }}
      >
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
              className={`bg-white border border-black print-area ${isEditMode ? 'cursor-pointer' : ''}`}
              style={{ 
                width: '210mm', 
                margin: '0 auto', 
                padding: '0',
                ...getElementStyle('main-container') 
              }}
              onClick={(e) => handleElementClick(e, 'main-container')}
            >
              {/* عنوان النموذج */}
              <div 
                className={`border-b border-black text-center py-1 ${isEditMode ? 'cursor-pointer hover:bg-purple-50' : ''}`}
                style={getElementStyle('form-title-container')}
                onClick={(e) => handleElementClick(e, 'form-title-container')}
              >
                <h2 
                  className={`${isEditMode ? 'cursor-pointer' : ''}`}
                  style={{ fontSize: '13px', fontWeight: 'normal', ...getElementStyle('form-title') }}
                  onClick={(e) => handleElementClick(e, 'form-title')}
                >
                  نموذج إنشاء إيقاف حساب
                </h2>
              </div>

              <div style={{ fontSize: '10px' }}>
                {/* جدول النظام ونوع الطلب */}
                <table 
                  className={`w-full border-collapse border border-black ${isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-purple-400' : ''}`}
                  style={getElementStyle('table-system-request')}
                  onClick={(e) => handleElementClick(e, 'table-system-request')}
                >
                  <tbody>
                    <tr>
                      {/* يمين - عربي - النظام */}
                      <td className="border border-black p-2 align-top text-right" style={{ width: '50%' }}>
                        <strong style={{ fontSize: '11px' }}>النظام:</strong>
                        <table className="w-full border-collapse mt-1">
                          <tbody>
                            <tr>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>ميديكا كلاود</td>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.system_type.includes('Medica cloud')} onCheckedChange={() => handleSystemToggle('Medica cloud')} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>رقيم</td>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.system_type.includes('Raqeem')} onCheckedChange={() => handleSystemToggle('Raqeem')} className="scale-75" /></td>
                            </tr>
                            <tr>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}></td>
                              <td className="border border-black text-center p-0.5"></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>موعد</td>
                              <td className="border border-black text-center p-0.5"><Checkbox checked={formData.system_type.includes('Mawid')} onCheckedChange={() => handleSystemToggle('Mawid')} className="scale-75" /></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      {/* يسار - إنجليزي - النظام */}
                      <td 
                        className={`border border-black p-2 align-top ${isEditMode ? 'cursor-pointer hover:bg-purple-50' : ''}`}
                        style={{ width: '50%', ...getElementStyle('cell-system-en') }}
                        onClick={(e) => handleElementClick(e, 'cell-system-en')}
                      >
                        <strong style={{ fontSize: '11px', ...getElementStyle('label-system-en') }} onClick={(e) => handleElementClick(e, 'label-system-en')}>*System:</strong>
                        <table className="w-full border-collapse mt-1">
                          <tbody>
                            <tr>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.system_type.includes('Raqeem')} onCheckedChange={() => handleSystemToggle('Raqeem')} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>Raqeem</td>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.system_type.includes('Medica cloud')} onCheckedChange={() => handleSystemToggle('Medica cloud')} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>Medica cloud</td>
                            </tr>
                            <tr>
                              <td className="border border-black text-center p-0.5"><Checkbox checked={formData.system_type.includes('Mawid')} onCheckedChange={() => handleSystemToggle('Mawid')} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Mawid</td>
                              <td className="border border-black text-center p-0.5"></td>
                              <td className="border border-black text-center p-0.5"></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      {/* يمين - عربي - نوع الطلب */}
                      <td className="border border-black p-2 align-top text-right">
                        <strong style={{ fontSize: '11px' }}>نوع الطلب:</strong>
                        <table className="w-full border-collapse mt-1">
                          <tbody>
                            <tr>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>استعادة كلمة مرور</td>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.request_type === 'استعادة كلمة مرور'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'استعادة كلمة مرور' }))} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>انشاء مستخدم جديد</td>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.request_type === 'انشاء مستخدم جديد'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'انشاء مستخدم جديد' }))} className="scale-75" /></td>
                            </tr>
                            <tr>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>نقل اسم مستخدم</td>
                              <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'نقل اسم مستخدم'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'نقل اسم مستخدم' }))} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>الغاء اسم مستخدم</td>
                              <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'الغاء اسم مستخدم'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'الغاء اسم مستخدم' }))} className="scale-75" /></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      {/* يسار - إنجليزي - نوع الطلب */}
                      <td className="border border-black p-2 align-top">
                        <strong style={{ fontSize: '11px' }}>*Type of Request:</strong>
                        <table className="w-full border-collapse mt-1">
                          <tbody>
                            <tr>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.request_type === 'استعادة كلمة مرور'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'استعادة كلمة مرور' }))} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>Restore password</td>
                              <td className="border border-black text-center p-0.5" style={{ width: '10%' }}><Checkbox checked={formData.request_type === 'انشاء مستخدم جديد'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'انشاء مستخدم جديد' }))} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px', width: '30%' }}>Create a new user name</td>
                            </tr>
                            <tr>
                              <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'نقل اسم مستخدم'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'نقل اسم مستخدم' }))} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Relocate a user name</td>
                              <td className="border border-black text-center p-0.5"><Checkbox checked={formData.request_type === 'الغاء اسم مستخدم'} onCheckedChange={(c) => c && setFormData(p => ({ ...p, request_type: 'الغاء اسم مستخدم' }))} className="scale-75" /></td>
                              <td className="border border-black text-center p-0.5" style={{ fontSize: '9px' }}>Delete a user name</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* السبب */}
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1" style={{ width: '50%', fontSize: '10px' }}>
                        <strong style={{ fontWeight: 'bold' }}>*Reason: </strong>
                        <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span>
                      </td>
                      <td className="border border-black p-1 text-right" style={{ width: '50%', fontSize: '10px' }}>
                        <strong style={{ fontWeight: 'bold' }}>السبب: </strong>
                        <Input value={formData.reason} onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))} className="inline-block border-0 border-b border-dotted border-gray-600 w-3/4 h-5 px-1 text-right" style={{ fontSize: '10px' }} />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* اسم الموظف */}
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2" style={{ width: '50%' }}>
                        <strong style={{ fontSize: '10px', fontWeight: 'bold' }}>*Staff Name:</strong>
                        <div className="space-y-0.5 mt-1" style={{ fontSize: '9px' }}>
                          <div>First: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                          <div>Second: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                          <div>Third: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                          <div>Family: <span className="border-b border-dotted border-gray-600 inline-block w-3/4 mx-1"></span></div>
                        </div>
                      </td>
                      <td className="border border-black p-2 text-right" style={{ width: '50%' }}>
                        <strong style={{ fontSize: '10px', fontWeight: 'bold' }}>اسم الموظف:</strong>
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
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border-l border-black p-1" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>ID NO: </strong>
                        <Input 
                          value={formData.national_id} 
                          onChange={(e) => setFormData(p => ({ ...p, national_id: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                      <td className="p-1 text-right" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>رقم الهوية/ الإقامة: </strong>
                        <Input 
                          value={formData.national_id} 
                          onChange={(e) => setFormData(p => ({ ...p, national_id: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1 text-right" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-l border-black p-1" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>Date of birth: </strong>
                        <span className="inline-block w-2/3 mx-1">{formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('en-GB') : ''}</span>
                      </td>
                      <td className="p-1 text-right" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>تاريخ الميلاد: </strong>
                        <span className="inline-block w-2/3 mx-1">{formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('ar-SA') : ''}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-l border-black p-1" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>MOH email: </strong>
                        <Input 
                          value={formData.moh_email} 
                          onChange={(e) => setFormData(p => ({ ...p, moh_email: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                      <td className="p-1 text-right" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>البريد الوزاري: </strong>
                        <Input 
                          value={formData.moh_email} 
                          onChange={(e) => setFormData(p => ({ ...p, moh_email: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1 text-right" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-l border-black p-1" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>SCFHS number: </strong>
                        <Input 
                          value={formData.scfhs_number} 
                          onChange={(e) => setFormData(p => ({ ...p, scfhs_number: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                      <td className="p-1 text-right" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>رقم التصنيف إن وجد: </strong>
                        <Input 
                          value={formData.scfhs_number} 
                          onChange={(e) => setFormData(p => ({ ...p, scfhs_number: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1 text-right" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-l border-black p-1" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>End date of (internship\contract): </strong>
                        <span className="inline-block w-2/3 mx-1">{formData.contract_end_date ? new Date(formData.contract_end_date).toLocaleDateString('en-GB') : ''}</span>
                      </td>
                      <td className="p-1 text-right" style={{ width: '50%', fontSize: '9px', borderBottom: 'none' }}>
                        <strong style={{ fontWeight: 'bold' }}>تاريخ انتهاء (التدريب/ العقد): </strong>
                        <span className="inline-block w-2/3 mx-1">{formData.contract_end_date ? new Date(formData.contract_end_date).toLocaleDateString('ar-SA') : ''}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-l border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>Contact Phone: </strong>
                        <Input 
                          value={formData.contact_phone} 
                          onChange={(e) => setFormData(p => ({ ...p, contact_phone: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                      <td className="p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>رقم التواصل: </strong>
                        <Input 
                          value={formData.contact_phone} 
                          onChange={(e) => setFormData(p => ({ ...p, contact_phone: e.target.value }))} 
                          className="inline-block border-0 w-2/3 h-5 px-1 text-right" 
                          style={{ fontSize: '9px' }} 
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* المهنة */}
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 align-top" style={{ width: '50%' }}>
                        <strong style={{ fontSize: '10px', fontWeight: 'bold' }}>*Occupation:</strong>
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

                      <td className="border border-black p-2 align-top text-right" style={{ width: '50%' }}>
                        <strong style={{ fontSize: '10px', fontWeight: 'bold' }}>المهنة :</strong>
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
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>Organization: </strong>
                        <Input value={formData.organization} onChange={(e) => setFormData(p => ({ ...p, organization: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1" style={{ fontSize: '9px' }} />
                      </td>
                      <td className="border border-black p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>المنشأة: </strong>
                        <Input value={formData.organization} onChange={(e) => setFormData(p => ({ ...p, organization: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1 text-right" style={{ fontSize: '9px' }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>Department: </strong>
                        <Input value={formData.department} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1" style={{ fontSize: '9px' }} />
                      </td>
                      <td className="border border-black p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>القسم : </strong>
                        <Input value={formData.department} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1 text-right" style={{ fontSize: '9px' }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>Specialization: </strong>
                        <Input value={formData.specialization} onChange={(e) => setFormData(p => ({ ...p, specialization: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1" style={{ fontSize: '9px' }} />
                      </td>
                      <td className="border border-black p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>التخصص: </strong>
                        <Input value={formData.specialization} onChange={(e) => setFormData(p => ({ ...p, specialization: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1 text-right" style={{ fontSize: '9px' }} />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>Recruitment privilege: </strong>
                        <Input value={formData.recruitment_privilege} onChange={(e) => setFormData(p => ({ ...p, recruitment_privilege: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1" style={{ fontSize: '9px' }} />
                      </td>
                      <td className="border border-black p-1 text-right" style={{ width: '50%', fontSize: '9px' }}>
                        <strong style={{ fontWeight: 'bold' }}>الصلاحيات المطلوبة : </strong>
                        <Input value={formData.recruitment_privilege} onChange={(e) => setFormData(p => ({ ...p, recruitment_privilege: e.target.value }))} className="inline-block border-0 w-2/3 h-5 px-1 text-right" style={{ fontSize: '9px' }} />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* التعهد */}
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 align-top" style={{ width: '50%' }}>
                        <div className="border border-black p-2" style={{ fontSize: '8px', lineHeight: '1.3' }}>
                          <p className="mb-1">I Will safeguard and will not disclose my username and password. Any access to informatio system by my username and password is my responsibility. If I believe someone else has logged into my account, I will immediately report the breach to digital health & technology department and will immediately change my password.</p>
                          <p className="text-blue-600 text-center">med-hc-digital@moh.gov.sa</p>
                        </div>
                      </td>
                      <td className="border border-black p-2 align-top text-right" style={{ width: '50%' }}>
                        <div className="border border-black p-2" style={{ fontSize: '8px', lineHeight: '1.3' }}>
                          <p className="mb-1">اتعهد بالمحافظة على اسم وكلمة السر الخاصة بي ولن اعطيها لأي شخص اخر، أي وصول إلى نظام المعلومات باستخدام اسم المستخدم. وكلمة المرور الخاصين بي هو مسؤوليتي وإذا علمت ان هناك شخص اخر استخدم حسابي فسوف أقوم بإبلاغ المسؤول بقسم الصحة الرقمية والتكنولوجيا عن ذلك وتغير كلمة السر .</p>
                          <p className="text-blue-600 text-center">med-hc-digital@moh.gov.sa</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ملاحظة الرئيس المباشر */}
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5" style={{ width: '50%', fontSize: '8px', lineHeight: '1.3' }}>
                        <strong style={{ fontWeight: 'bold' }}>*The direct manager must provide us with the employee's data in the event of assignment or transfer outside the center or hospital.</strong>
                      </td>
                      <td className="border border-black p-1.5 text-right" style={{ width: '50%', fontSize: '8px', lineHeight: '1.3' }}>
                        <strong style={{ fontWeight: 'bold' }}>* على الرئيس المباشر تزويدنا ببيانات الموظف في حال التكليف او النقل خارج المركز أو المستشفى</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* التوقيعات */}
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center align-top" style={{ fontSize: '10px', width: '33%' }}>
                        <strong style={{ fontWeight: 'bold' }}>الختم</strong>
                        <div className="mt-8"></div>
                      </td>
                      <td className="border border-black p-2 text-center align-top" style={{ fontSize: '10px', width: '34%' }}>
                        <div>
                          <strong style={{ fontWeight: 'bold' }}>اعتماد الرئيس المباشر</strong>
                          <div className="mt-1 text-right px-2" style={{ fontSize: '9px' }}>
                            <strong>الاسم:</strong> {formData.direct_manager_name}
                          </div>
                          <div className="text-left px-2" style={{ fontSize: '8px', color: '#666' }}>
                            <strong>Name:</strong> {formData.direct_manager_name_english}
                          </div>
                          <div className="mt-4 border-b border-dotted border-gray-600 mx-4"></div>
                          <div className="text-xs text-gray-500 mt-1">التوقيع</div>
                        </div>
                      </td>
                      <td className="border border-black p-2 text-center align-top" style={{ fontSize: '10px', width: '33%' }}>
                        <div>
                          <strong style={{ fontWeight: 'bold' }}>اسم الموظف</strong>
                          <div className="mt-1 text-right px-2" style={{ fontSize: '9px' }}>
                            <strong>{formData.employee_name_arabic}</strong>
                          </div>
                          <div className="text-left px-2" style={{ fontSize: '8px', color: '#666' }}>
                            {formData.employee_name_english}
                          </div>
                          <div className="mt-4 border-b border-dotted border-gray-600 mx-4"></div>
                          <div className="text-xs text-gray-500 mt-1">التوقيع</div>
                        </div>
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
      </div>

      {isEditMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl z-50">
          <p className="text-sm font-medium">🎨 وضع التحرير نشط - اضغط على أي عنصر لتعديله</p>
        </div>
      )}

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          .print-background {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            background-size: 210mm 297mm !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            z-index: -1 !important;
            visibility: visible !important;
          }
          
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-background { visibility: visible !important; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: transparent !important;
          }
          .no-print { display: none !important; }
        }
        ${isEditMode ? `
          .cursor-pointer:hover {
            outline: 2px dashed #a855f7;
            outline-offset: 2px;
          }
        ` : ''}
      `}</style>
    </>
  );
}