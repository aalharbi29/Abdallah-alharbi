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
        <div className="bg-white border-4 border-blue-600 rounded-lg p-8 print-area">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <p className="text-sm font-medium">Shared Services for Digital Health & Technology</p>
                <p className="text-xs text-gray-600">Med-hc-digital@moh.gov.sa</p>
              </div>
              <div className="w-16 h-16 bg-blue-600 rounded-full"></div>
              <div className="text-right">
                <p className="text-sm font-bold">الخدمات المشتركة للصحة الرقمية والتقنية</p>
                <p className="text-xs text-gray-600">Med-hc-digital@moh.gov.sa</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">نموذج إنشاء إيقاف حساب</h2>
          </div>

          {/* النظام ونوع الطلب */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* النظام */}
            <div className="border-2 border-gray-300 p-4 rounded">
              <Label className="font-bold mb-3 block">*النظام: System:</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.system_type.includes('Raqeem')}
                      onCheckedChange={() => handleSystemToggle('Raqeem')}
                    />
                    <span>رقيم</span>
                  </div>
                  <span>Raqeem</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.system_type.includes('Medica cloud')}
                      onCheckedChange={() => handleSystemToggle('Medica cloud')}
                    />
                    <span>ميديكا كلاود</span>
                  </div>
                  <span>Medica cloud</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.system_type.includes('Mawid')}
                      onCheckedChange={() => handleSystemToggle('Mawid')}
                    />
                    <span>موعد</span>
                  </div>
                  <span>Mawid</span>
                </div>
              </div>
            </div>

            {/* نوع الطلب */}
            <div className="border-2 border-gray-300 p-4 rounded">
              <Label className="font-bold mb-3 block">*نوع الطلب: Type of Request:</Label>
              <div className="space-y-2">
                {[
                  { ar: 'استعادة كلمة مرور', en: 'Restore password' },
                  { ar: 'انشاء مستخدم جديد', en: 'Create a new user name' },
                  { ar: 'الغاء اسم مستخدم', en: 'Delete a user name' },
                  { ar: 'نقل اسم مستخدم', en: 'Relocate a user name' }
                ].map(option => (
                  <div key={option.ar} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.request_type === option.ar}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData(prev => ({ ...prev, request_type: option.ar }));
                        }}
                      />
                      <span>{option.ar}</span>
                    </div>
                    <span className="text-sm text-gray-600">{option.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* السبب */}
          <div className="mb-6">
            <Label className="font-bold mb-2 block">*السبب: Reason:</Label>
            <Input
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="border-2 border-gray-300"
              placeholder="اذكر السبب..."
            />
          </div>

          {/* اسم الموظف */}
          <div className="mb-6 border-2 border-gray-300 p-4 rounded">
            <Label className="font-bold mb-3 block">*اسم الموظف: Staff Name:</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block">الأول: First</Label>
                <Input
                  value={formData.employee_name_first}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name_first: e.target.value }))}
                  className="border-b-2 border-dotted border-gray-400"
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">الثاني: Second</Label>
                <Input
                  value={formData.employee_name_second}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name_second: e.target.value }))}
                  className="border-b-2 border-dotted border-gray-400"
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">الثالث: Third</Label>
                <Input
                  value={formData.employee_name_third}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name_third: e.target.value }))}
                  className="border-b-2 border-dotted border-gray-400"
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">العائلة: Family</Label>
                <Input
                  value={formData.employee_name_family}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name_family: e.target.value }))}
                  className="border-b-2 border-dotted border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* البيانات الشخصية */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm mb-1 block">رقم الهوية/ الإقامة: ID NO:</Label>
              <Input
                value={formData.national_id}
                onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">تاريخ الميلاد: Date of birth:</Label>
              <SmartDateInput
                value={formData.birth_date}
                onChange={(date) => setFormData(prev => ({ ...prev, birth_date: date }))}
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">البريد الوزاري: MOH email:</Label>
              <Input
                type="email"
                value={formData.moh_email}
                onChange={(e) => setFormData(prev => ({ ...prev, moh_email: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">رقم التصنيف إن وجد: SCFHS number:</Label>
              <Input
                value={formData.scfhs_number}
                onChange={(e) => setFormData(prev => ({ ...prev, scfhs_number: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">تاريخ انتهاء (التدريب/العقد): End date:</Label>
              <SmartDateInput
                value={formData.contract_end_date}
                onChange={(date) => setFormData(prev => ({ ...prev, contract_end_date: date }))}
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">رقم التواصل: Contact Phone:</Label>
              <Input
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
          </div>

          {/* المهنة */}
          <div className="mb-6 border-2 border-gray-300 p-4 rounded">
            <Label className="font-bold mb-3 block">*المهنة: Occupation:</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { ar: 'استقبال', en: 'Receptionist' },
                { ar: 'تمريض', en: 'Nurse' },
                { ar: 'طبيب', en: 'physician' },
                { ar: 'مدير منشأة', en: 'Facility Manger' },
                { ar: 'صيدلي', en: 'Pharmacist' },
                { ar: 'مختبر', en: 'Lab Technician' }
              ].map(option => (
                <div key={option.ar} className="flex items-center justify-between border p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.occupation.includes(option.ar)}
                      onCheckedChange={() => handleOccupationToggle(option.ar)}
                    />
                    <span className="text-sm">{option.ar}</span>
                  </div>
                  <span className="text-xs text-gray-600">{option.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* بيانات الجهة */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm mb-1 block">المنشأة: Organization:</Label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">القسم: Department:</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">التخصص: Specialization:</Label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">الصلاحيات المطلوبة: Recruitment privilege:</Label>
              <Input
                value={formData.recruitment_privilege}
                onChange={(e) => setFormData(prev => ({ ...prev, recruitment_privilege: e.target.value }))}
                className="border-b-2 border-dotted border-gray-400"
              />
            </div>
          </div>

          {/* التعهد */}
          <div className="mb-6 border-2 border-gray-300 p-4 rounded bg-yellow-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm leading-relaxed">
                <p className="mb-2 font-medium">I Will safeguard and will not disclose my username and password. Any access to information system by my username and password is my responsibility. If I believe someone else has logged into my account, I will immediately report the breach to digital health & technology department and will immediately change my password.</p>
                <p className="text-xs text-gray-600">med-hc-digital@moh.gov.sa</p>
              </div>
              <div className="text-sm leading-relaxed text-right">
                <p className="mb-2 font-medium">اتعهد بالمحافظة على اسم وكلمة السر الخاصة بي ولن اعطيها لأي شخص اخر، أي وصول إلى نظام المعلومات باستخدام اسم المستخدم. وكلمة المرور الخاصين بي هو مسؤوليتي وإذا علمت ان هناك شخص اخر استخدم حسابي فسوف أقوم بإبلاغ المسؤول بقسم الصحة الرقمية والتكنولوجيا عن ذلك وتغير كلمة السر.</p>
                <p className="text-xs text-gray-600">med-hc-digital@moh.gov.sa</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 justify-center">
              <Checkbox
                checked={formData.commitment_accepted}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, commitment_accepted: checked }))}
              />
              <Label className="font-medium cursor-pointer">أوافق على التعهد / I accept the commitment</Label>
            </div>
          </div>

          {/* ملاحظة للرئيس المباشر */}
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 p-4 rounded">
            <p className="text-sm font-medium text-center mb-2">
              *The direct manager must provide us with the employee's data in the event of assignment or transfer outside the center or hospital.
            </p>
            <p className="text-sm font-bold text-center">
              * على الرئيس المباشر تزويدنا ببيانات الموظف في حال التكليف او النقل خارج المركز أو المستشفى
            </p>
          </div>

          {/* اعتماد الرئيس المباشر */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border-2 border-gray-300 p-4 rounded">
              <Label className="font-bold mb-2 block">اسم الموظف:</Label>
              <Input
                value={`${formData.employee_name_first} ${formData.employee_name_second} ${formData.employee_name_third} ${formData.employee_name_family}`.trim()}
                readOnly
                className="border-b-2 border-dotted border-gray-400 bg-gray-50"
              />
            </div>
            <div className="border-2 border-gray-300 p-4 rounded">
              <Label className="font-bold mb-2 block">اعتماد الرئيس المباشر:</Label>
              <Input
                value={formData.direct_manager_name}
                onChange={(e) => setFormData(prev => ({ ...prev, direct_manager_name: e.target.value }))}
                placeholder="اسم الرئيس المباشر"
                className="border-b-2 border-dotted border-gray-400 mb-2"
              />
              <div className="flex items-center gap-2">
                <Label className="text-sm">التاريخ:</Label>
                <SmartDateInput
                  value={formData.direct_manager_approval_date}
                  onChange={(date) => setFormData(prev => ({ ...prev, direct_manager_approval_date: date }))}
                />
              </div>
              <div className="mt-4 text-center">
                <Label className="text-sm text-gray-600">الختم</Label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center border-t-2 border-blue-600 pt-4">
            <p className="text-sm font-bold text-blue-800">تجمع المدينة الصحي</p>
            <p className="text-xs text-gray-600">Madinah Health Cluster</p>
            <p className="text-xs text-gray-500">Empowered by Health Holding co.</p>
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