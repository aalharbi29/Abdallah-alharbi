
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Plus, X } from 'lucide-react';
import { createPageUrl } from '@/utils';

const commonDepartments = [
  'الصيدلية',
  'الأشعة',
  'الأسنان',
  'الانتظار',
  'العيادات',
  'المختبر',
  'الطوارئ',
  'الإدارة'
];

const commonJustifications = [
  'عدم توفر البند في القسم',
  'الكميات المتاحة لا تكفي لتغطية احتياج القسم',
  'تلف الجهاز الحالي',
  'انتهاء العمر الافتراضي للجهاز',
  'زيادة عدد المرضى',
  'تحسين جودة الخدمة المقدمة',
  'تطوير القسم'
];

export default function FillEquipmentRequestForm() {
  const navigate = useNavigate();
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [medicalEquipment, setMedicalEquipment] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDepartment, setCustomDepartment] = useState('');
  const [customJustification, setCustomJustification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    health_center_id: '',
    health_center_name: '',
    department: '',
    request_type: 'جديد',
    request_type_other: '',
    classification: 'طبي',
    priority: 'متوسط الأهمية',
    justifications: [],
    requester_name: '',
    requester_phone: '',
    requester_email: '',
    device_name: '',
    device_code: '',
    requested_quantity: 1,
    quantity_in_department: 0,
    quantity_in_site: 0,
    department_head: '',
    maintenance_officer: '',
    custodian: '',
    inventory_controller: '',
    medical_director: '',
    facility_director: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centers, equipment, emps] = await Promise.all([
        base44.entities.HealthCenter.list(),
        base44.entities.MedicalEquipment.list(),
        base44.entities.Employee.list()
      ]);
      setHealthCenters(Array.isArray(centers) ? centers : []);
      setMedicalEquipment(Array.isArray(equipment) ? equipment : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getEmployeeById = (employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const handleCenterSelect = (centerId) => {
    const center = healthCenters.find(c => c.id === centerId);
    if (!center) return;

    setSelectedCenter(center);
    
    // جلب بيانات مدير المركز
    const manager = getEmployeeById(center.المدير);
    
    // جلب بيانات المشرف الفني
    const technicalSupervisor = getEmployeeById(center.المشرف_الفني);
    
    // جلب أمين العهدة (إذا كان محفوظ في المركز)
    const custodian = center.أمين_العهدة ? getEmployeeById(center.أمين_العهدة) : null;

    setFormData(prev => ({
      ...prev,
      health_center_id: center.id,
      health_center_name: center.اسم_المركز,
      // اسم مقدم الطلب = اسم المدير
      requester_name: manager?.full_name_arabic || '',
      // رقم التواصل = رقم جوال المدير الشخصي
      requester_phone: manager?.phone || '',
      // البريد الإلكتروني = ايميل المدير الشخصي
      requester_email: manager?.email || '',
      // مدير الجهة الطالبة = اسم مدير المركز
      facility_director: manager?.full_name_arabic || '',
      // المدير الطبي = المشرف الفني
      medical_director: technicalSupervisor?.full_name_arabic || '',
      // أمين العهدة إذا كان محدد
      custodian: custodian?.full_name_arabic || ''
    }));
  };

  const handleDeviceSelect = (deviceName) => {
    const device = medicalEquipment.find(d => d.device_name === deviceName);
    if (device) {
      setFormData(prev => ({
        ...prev,
        device_name: device.device_name,
        device_code: device.device_code || ''
      }));
    }
  };

  const addJustification = (justification) => {
    if (!formData.justifications.includes(justification)) {
      setFormData(prev => ({
        ...prev,
        justifications: [...prev.justifications, justification]
      }));
    }
  };

  const removeJustification = (index) => {
    setFormData(prev => ({
      ...prev,
      justifications: prev.justifications.filter((_, i) => i !== index)
    }));
  };

  const addCustomJustification = () => {
    if (customJustification.trim() && !formData.justifications.includes(customJustification.trim())) {
      addJustification(customJustification.trim());
      setCustomJustification('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.health_center_name || !formData.device_name) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const request = await base44.entities.EquipmentRequest.create(formData);
      alert('تم حفظ الطلب بنجاح. سيتم الآن نقلك للمعاينة والطباعة.');
      navigate(createPageUrl(`ViewEquipmentRequest?id=${request.id}`));
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ في حفظ الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEquipment = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const searchLower = searchQuery.toLowerCase();
    return medicalEquipment.filter(eq =>
      eq.device_name && eq.device_name.toLowerCase().includes(searchLower)
    );
  }, [searchQuery, medicalEquipment]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('InteractiveForms'))} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">نموذج احتياج من التجهيزات الطبية والغير طبية</h1>
            <p className="text-gray-600 mt-1">وفقاً لقرار لجنة النظر رقم 100456-46-703 وتاريخ 14/12/1446هـ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* المعلومات الأساسية */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health_center">اسم المستشفى/مركز صحي/الموقع *</Label>
                  <Select value={formData.health_center_id} onValueChange={handleCenterSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المركز الصحي" />
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

                <div>
                  <Label htmlFor="department">القسم *</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setFormData(prev => ({ ...prev, department: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, department: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                      <SelectItem value="custom">قسم آخر (إدخال يدوي)</SelectItem>
                    </SelectContent>
                  </Select>
                  {!commonDepartments.includes(formData.department) && formData.department !== '' && (
                    <Input
                      className="mt-2"
                      placeholder="اكتب اسم القسم"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  )}
                  {/* Handle the case where 'custom' was selected but the field is still empty */}
                  {commonDepartments.includes(formData.department) === false && formData.department === '' && (
                    <Input
                      className="mt-2"
                      placeholder="اكتب اسم القسم"
                      value={customDepartment}
                      onChange={(e) => {
                        setCustomDepartment(e.target.value);
                        setFormData(prev => ({ ...prev, department: e.target.value }));
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>نوع الطلب *</Label>
                  <Select value={formData.request_type} onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="جديد">جديد</SelectItem>
                      <SelectItem value="إحلال">إحلال</SelectItem>
                      <SelectItem value="توسع">توسع</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.request_type === 'أخرى' && (
                    <Input
                      className="mt-2"
                      placeholder="حدد نوع الطلب"
                      value={formData.request_type_other}
                      onChange={(e) => setFormData(prev => ({ ...prev, request_type_other: e.target.value }))}
                    />
                  )}
                </div>

                <div>
                  <Label>تصنيف الطلب *</Label>
                  <Select value={formData.classification} onValueChange={(value) => setFormData(prev => ({ ...prev, classification: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="طبي">طبي</SelectItem>
                      <SelectItem value="غير طبي">غير طبي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>حالة الطلب *</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="منخفض الأهمية">منخفض الأهمية</SelectItem>
                      <SelectItem value="متوسط الأهمية">متوسط الأهمية</SelectItem>
                      <SelectItem value="عالي الأهمية">عالي الأهمية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مبررات الطلب */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>مبررات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {commonJustifications.map(just => (
                  <Button
                    key={just}
                    type="button"
                    variant={formData.justifications.includes(just) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (formData.justifications.includes(just)) {
                        setFormData(prev => ({
                          ...prev,
                          justifications: prev.justifications.filter(j => j !== just)
                        }));
                      } else {
                        addJustification(just);
                      }
                    }}
                  >
                    {just}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="أضف مبرر مخصص"
                  value={customJustification}
                  onChange={(e) => setCustomJustification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomJustification())}
                />
                <Button type="button" onClick={addCustomJustification}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.justifications.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <Label>المبررات المحددة:</Label>
                  {formData.justifications.map((just, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">• {just}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJustification(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* بيانات مقدم الطلب */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>بيانات مقدم الطلب (مدير المركز)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="requester_name">اسم مقدم الطلب (مدير المركز)</Label>
                  <Input
                    id="requester_name"
                    value={formData.requester_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_name: e.target.value }))}
                    readOnly={!!selectedCenter}
                    className={selectedCenter ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="requester_phone">رقم التواصل (جوال المدير)</Label>
                  <Input
                    id="requester_phone"
                    value={formData.requester_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_phone: e.target.value }))}
                    readOnly={!!selectedCenter}
                    className={selectedCenter ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="requester_email">البريد الإلكتروني (ايميل المدير الشخصي)</Label>
                  <Input
                    id="requester_email"
                    type="email"
                    value={formData.requester_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_email: e.target.value }))}
                    readOnly={!!selectedCenter}
                    className={selectedCenter ? 'bg-gray-100' : ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات الجهاز */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>معلومات الجهاز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="device_search">البحث عن جهاز</Label>
                <Input
                  id="device_search"
                  placeholder="ابحث عن الجهاز..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {filteredEquipment.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredEquipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleDeviceSelect(eq.device_name);
                          setSearchQuery('');
                        }}
                      >
                        <div className="font-semibold">{eq.device_name}</div>
                        <div className="text-sm text-gray-500">الكود: {eq.device_code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="device_name">اسم البند *</Label>
                  <Input
                    id="device_name"
                    value={formData.device_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, device_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="device_code">رقم البند (في دليل نوبكو أو الكود الوزاري الرسمي)</Label>
                  <Input
                    id="device_code"
                    value={formData.device_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, device_code: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="requested_quantity">الكمية المطلوبة لتغطية الاحتياج *</Label>
                  <Input
                    id="requested_quantity"
                    type="number"
                    min="1"
                    value={formData.requested_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, requested_quantity: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity_in_department">الكمية المتوفرة في القسم</Label>
                  <Input
                    id="quantity_in_department"
                    type="number"
                    min="0"
                    value={formData.quantity_in_department}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity_in_department: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity_in_site">الكمية المتوفرة في الموقع</Label>
                  <Input
                    id="quantity_in_site"
                    type="number"
                    min="0"
                    value={formData.quantity_in_site}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity_in_site: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الموافقات */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>الأسماء والتوقيعات للموافقة على استكمال الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department_head">رئيس القسم</Label>
                  <Input
                    id="department_head"
                    value={formData.department_head}
                    onChange={(e) => setFormData(prev => ({ ...prev, department_head: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance_officer">الصيانة (الطبية/العامة)</Label>
                  <Input
                    id="maintenance_officer"
                    value={formData.maintenance_officer}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenance_officer: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="custodian">أمين العهدة</Label>
                  <Input
                    id="custodian"
                    value={formData.custodian}
                    onChange={(e) => setFormData(prev => ({ ...prev, custodian: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="inventory_controller">مراقبة المخزون</Label>
                  <Input
                    id="inventory_controller"
                    value={formData.inventory_controller}
                    onChange={(e) => setFormData(prev => ({ ...prev, inventory_controller: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="medical_director">المدير الطبي (المشرف الفني)</Label>
                  <Input
                    id="medical_director"
                    value={formData.medical_director}
                    onChange={(e) => setFormData(prev => ({ ...prev, medical_director: e.target.value }))}
                    readOnly={!!selectedCenter}
                    className={selectedCenter ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="facility_director">مدير الجهة الطالبة (مدير المركز)</Label>
                  <Input
                    id="facility_director"
                    value={formData.facility_director}
                    onChange={(e) => setFormData(prev => ({ ...prev, facility_director: e.target.value }))}
                    readOnly={!!selectedCenter}
                    className={selectedCenter ? 'bg-gray-100' : ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأزرار */}
          <div className="flex justify-end pt-6">
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate(createPageUrl('InteractiveForms'))}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ ومتابعة للمعاينة'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
