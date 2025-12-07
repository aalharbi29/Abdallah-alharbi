import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2, Plus, Edit, Trash2, Users, Search, 
  ArrowRight, Save, Loader2, Stethoscope, UserPlus, X, DoorOpen
} from 'lucide-react';

const clinicTypes = [
  "عيادة عامة", "عيادة أسنان", "عيادة أطفال", "عيادة نساء وولادة",
  "عيادة أمراض مزمنة", "عيادة تطعيمات", "عيادة رعاية حوامل",
  "عيادة طفل سليم", "عيادة فرز", "عيادة تغذية", "عيادة صحة نفسية",
  "غرفة إجراءات", "مختبر", "صيدلية", "أشعة", "طوارئ", "استقبال", "أخرى"
];

const departments = [
  "العيادات الخارجية", "الطوارئ", "الأسنان", "المختبر", "الأشعة",
  "الصيدلية", "التمريض", "الإدارة", "الخدمات المساندة", "الصحة العامة", "أخرى"
];

const daysOfWeek = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
  { key: 'saturday', label: 'السبت' },
];

const defaultWorkingHours = {
  sunday: { is_open: true, start_time: '07:30', end_time: '14:30' },
  monday: { is_open: true, start_time: '07:30', end_time: '14:30' },
  tuesday: { is_open: true, start_time: '07:30', end_time: '14:30' },
  wednesday: { is_open: true, start_time: '07:30', end_time: '14:30' },
  thursday: { is_open: true, start_time: '07:30', end_time: '12:00' },
  friday: { is_open: false, start_time: '', end_time: '' },
  saturday: { is_open: false, start_time: '', end_time: '' },
};

export default function ClinicManagement() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showClinicDialog, setShowClinicDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [selectedClinicForEmployees, setSelectedClinicForEmployees] = useState(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_type: '',
    department: '',
    responsible_doctor_id: '',
    responsible_doctor_name: '',
    assigned_employees: [],
    working_hours: defaultWorkingHours,
    is_active: true,
    room_number: '',
    phone_extension: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const centerId = urlParams.get('center');
    if (centerId && healthCenters.length > 0) {
      const center = healthCenters.find(c => c.id === centerId);
      if (center) {
        setSelectedCenter(center);
      }
    }
  }, [healthCenters]);

  useEffect(() => {
    if (selectedCenter) {
      loadClinics();
      loadEmployees();
    }
  }, [selectedCenter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const centers = await base44.entities.HealthCenter.list('-اسم_المركز', 500);
      setHealthCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClinics = async () => {
    if (!selectedCenter) return;
    try {
      const allClinics = await base44.entities.Clinic.filter({ health_center_id: selectedCenter.id });
      setClinics(Array.isArray(allClinics) ? allClinics : []);
    } catch (error) {
      console.error('Error loading clinics:', error);
      setClinics([]);
    }
  };

  const loadEmployees = async () => {
    if (!selectedCenter) return;
    try {
      const allEmployees = await base44.entities.Employee.filter({ المركز_الصحي: selectedCenter.اسم_المركز });
      setEmployees(Array.isArray(allEmployees) ? allEmployees : []);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    }
  };

  const handleOpenNewClinic = () => {
    setEditingClinic(null);
    setFormData({
      clinic_name: '',
      clinic_type: '',
      department: '',
      responsible_doctor_id: '',
      responsible_doctor_name: '',
      assigned_employees: [],
      working_hours: defaultWorkingHours,
      is_active: true,
      room_number: '',
      phone_extension: '',
      notes: ''
    });
    setShowClinicDialog(true);
  };

  const handleEditClinic = (clinic) => {
    setEditingClinic(clinic);
    setFormData({
      clinic_name: clinic.clinic_name || '',
      clinic_type: clinic.clinic_type || '',
      department: clinic.department || '',
      responsible_doctor_id: clinic.responsible_doctor_id || '',
      responsible_doctor_name: clinic.responsible_doctor_name || '',
      assigned_employees: clinic.assigned_employees || [],
      working_hours: clinic.working_hours || defaultWorkingHours,
      is_active: clinic.is_active !== false,
      room_number: clinic.room_number || '',
      phone_extension: clinic.phone_extension || '',
      notes: clinic.notes || ''
    });
    setShowClinicDialog(true);
  };

  const handleSaveClinic = async () => {
    if (!formData.clinic_name || !formData.clinic_type) {
      alert('الرجاء إدخال اسم ونوع العيادة');
      return;
    }

    setIsSaving(true);
    try {
      const clinicData = {
        ...formData,
        health_center_id: selectedCenter.id,
        health_center_name: selectedCenter.اسم_المركز
      };

      if (editingClinic) {
        await base44.entities.Clinic.update(editingClinic.id, clinicData);
      } else {
        await base44.entities.Clinic.create(clinicData);
      }

      await loadClinics();
      setShowClinicDialog(false);
    } catch (error) {
      console.error('Error saving clinic:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClinic = async (clinic) => {
    if (!confirm(`هل أنت متأكد من حذف عيادة "${clinic.clinic_name}"؟`)) return;
    
    try {
      await base44.entities.Clinic.delete(clinic.id);
      await loadClinics();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleOpenEmployeeAssignment = (clinic) => {
    setSelectedClinicForEmployees(clinic);
    setEmployeeSearchQuery('');
    setShowEmployeeDialog(true);
  };

  const handleAssignEmployee = async (employee, roleInClinic = '') => {
    if (!selectedClinicForEmployees) return;

    const currentEmployees = selectedClinicForEmployees.assigned_employees || [];
    const isAlreadyAssigned = currentEmployees.some(e => e.employee_id === employee.id);

    if (isAlreadyAssigned) {
      // إزالة الموظف
      const updatedEmployees = currentEmployees.filter(e => e.employee_id !== employee.id);
      await base44.entities.Clinic.update(selectedClinicForEmployees.id, {
        assigned_employees: updatedEmployees
      });
    } else {
      // إضافة الموظف
      const updatedEmployees = [...currentEmployees, {
        employee_id: employee.id,
        employee_name: employee.full_name_arabic,
        position: employee.position,
        role_in_clinic: roleInClinic
      }];
      await base44.entities.Clinic.update(selectedClinicForEmployees.id, {
        assigned_employees: updatedEmployees
      });
    }

    await loadClinics();
    const updatedClinic = (await base44.entities.Clinic.filter({ health_center_id: selectedCenter.id }))
      .find(c => c.id === selectedClinicForEmployees.id);
    setSelectedClinicForEmployees(updatedClinic);
  };

  const handleSetResponsibleDoctor = (employee) => {
    setFormData(prev => ({
      ...prev,
      responsible_doctor_id: employee.id,
      responsible_doctor_name: employee.full_name_arabic
    }));
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day],
          [field]: value
        }
      }
    }));
  };

  const filteredClinics = clinics.filter(clinic =>
    clinic.clinic_name?.includes(searchQuery) ||
    clinic.clinic_type?.includes(searchQuery) ||
    clinic.department?.includes(searchQuery)
  );

  const filteredEmployeesForAssignment = employees.filter(emp =>
    emp.full_name_arabic?.includes(employeeSearchQuery) ||
    emp.position?.includes(employeeSearchQuery)
  );

  const doctors = employees.filter(emp => 
    emp.position?.includes('طبيب') || emp.position?.includes('دكتور')
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('HealthCenters')}>
              <Button variant="outline" size="icon">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">إدارة العيادات والأقسام</h1>
              <p className="text-gray-600">إضافة وتعديل العيادات وربط الموظفين بها</p>
            </div>
          </div>
        </div>

        {/* Center Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              اختر المركز الصحي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedCenter?.id || ''} 
              onValueChange={(id) => setSelectedCenter(healthCenters.find(c => c.id === id))}
            >
              <SelectTrigger className="max-w-md">
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
          </CardContent>
        </Card>

        {selectedCenter && (
          <>
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن عيادة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button onClick={handleOpenNewClinic} className="bg-green-600 hover:bg-green-700 gap-2">
                <Plus className="w-4 h-4" />
                إضافة عيادة جديدة
              </Button>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClinics.map(clinic => (
                <Card key={clinic.id} className={`relative ${!clinic.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-lg">{clinic.clinic_name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClinic(clinic)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClinic(clinic)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{clinic.clinic_type}</Badge>
                      {clinic.department && <Badge className="bg-blue-100 text-blue-800">{clinic.department}</Badge>}
                      {clinic.is_active ? (
                        <Badge className="bg-green-100 text-green-800">نشطة</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">متوقفة</Badge>
                      )}
                    </div>

                    {clinic.responsible_doctor_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">المسؤول:</span>
                        <span className="font-medium">{clinic.responsible_doctor_name}</span>
                      </div>
                    )}

                    {clinic.room_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <DoorOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">الغرفة:</span>
                        <span>{clinic.room_number}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">الموظفون:</span>
                      <span className="font-medium">{clinic.assigned_employees?.length || 0}</span>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => handleOpenEmployeeAssignment(clinic)}
                    >
                      <UserPlus className="w-4 h-4" />
                      إدارة الموظفين
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {filteredClinics.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد عيادات مسجلة لهذا المركز</p>
                  <Button onClick={handleOpenNewClinic} variant="link" className="mt-2">
                    إضافة عيادة جديدة
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Clinic Form Dialog */}
      <Dialog open={showClinicDialog} onOpenChange={setShowClinicDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-green-600" />
              {editingClinic ? 'تعديل العيادة' : 'إضافة عيادة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="hours">ساعات العمل</TabsTrigger>
              <TabsTrigger value="staff">الطاقم الطبي</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>اسم العيادة *</Label>
                  <Input
                    value={formData.clinic_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinic_name: e.target.value }))}
                    placeholder="مثال: عيادة الطب العام"
                  />
                </div>
                <div>
                  <Label>نوع العيادة *</Label>
                  <Select 
                    value={formData.clinic_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, clinic_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العيادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinicTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>القسم</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, department: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>رقم الغرفة</Label>
                  <Input
                    value={formData.room_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
                    placeholder="مثال: 101"
                  />
                </div>
                <div>
                  <Label>رقم التحويلة</Label>
                  <Input
                    value={formData.phone_extension}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_extension: e.target.value }))}
                    placeholder="مثال: 201"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
                  />
                  <Label>العيادة نشطة</Label>
                </div>
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-4">
              <div className="space-y-3">
                {daysOfWeek.map(day => (
                  <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium">{day.label}</span>
                    </div>
                    <Switch
                      checked={formData.working_hours[day.key]?.is_open || false}
                      onCheckedChange={(v) => handleWorkingHoursChange(day.key, 'is_open', v)}
                    />
                    {formData.working_hours[day.key]?.is_open && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">من</Label>
                          <Input
                            type="time"
                            value={formData.working_hours[day.key]?.start_time || ''}
                            onChange={(e) => handleWorkingHoursChange(day.key, 'start_time', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">إلى</Label>
                          <Input
                            type="time"
                            value={formData.working_hours[day.key]?.end_time || ''}
                            onChange={(e) => handleWorkingHoursChange(day.key, 'end_time', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                    {!formData.working_hours[day.key]?.is_open && (
                      <span className="text-sm text-gray-500">مغلق</span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label>الطبيب المسؤول</Label>
                  <Select
                    value={formData.responsible_doctor_id}
                    onValueChange={(id) => {
                      const doctor = employees.find(e => e.id === id);
                      if (doctor) handleSetResponsibleDoctor(doctor);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطبيب المسؤول" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name_arabic} - {doctor.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.assigned_employees?.length > 0 && (
                  <div>
                    <Label>الموظفون المعينون</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.assigned_employees.map(emp => (
                        <Badge key={emp.employee_id} variant="secondary" className="gap-1">
                          {emp.employee_name}
                          <button
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              assigned_employees: prev.assigned_employees.filter(e => e.employee_id !== emp.employee_id)
                            }))}
                            className="hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  * يمكنك إدارة الموظفين بشكل تفصيلي بعد حفظ العيادة
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowClinicDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveClinic} disabled={isSaving} className="bg-green-600 hover:bg-green-700 gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Assignment Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              إدارة موظفي العيادة: {selectedClinicForEmployees?.clinic_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Current Employees */}
            {selectedClinicForEmployees?.assigned_employees?.length > 0 && (
              <div>
                <Label className="mb-2 block">الموظفون الحاليون:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedClinicForEmployees.assigned_employees.map(emp => (
                    <Badge key={emp.employee_id} className="bg-green-100 text-green-800 gap-2">
                      {emp.employee_name}
                      <span className="text-xs opacity-70">({emp.position})</span>
                      <button
                        onClick={() => {
                          const employee = employees.find(e => e.id === emp.employee_id);
                          if (employee) handleAssignEmployee(employee);
                        }}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن موظف..."
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Employees List */}
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">التخصص</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployeesForAssignment.map(emp => {
                    const isAssigned = selectedClinicForEmployees?.assigned_employees?.some(
                      e => e.employee_id === emp.id
                    );
                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.full_name_arabic}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell className="text-center">
                          {isAssigned ? (
                            <Badge className="bg-green-100 text-green-800">معين</Badge>
                          ) : (
                            <Badge variant="outline">غير معين</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={isAssigned ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleAssignEmployee(emp)}
                          >
                            {isAssigned ? 'إزالة' : 'تعيين'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowEmployeeDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}