
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Gift,
  Calculator,
  Save,
  Copy,
  Users,
  Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays, eachDayOfInterval, getDay } from 'date-fns';
import SmartDateInput from '@/components/ui/smart-date-input';
import { ScrollArea } from '@/components/ui/scroll-area';

const HOLIDAY_TYPES = [
  { value: 'عيد_الفطر', label: 'إجازة عيد الفطر (رمضان)' },
  { value: 'عيد_الأضحى', label: 'إجازة عيد الأضحى (الحج)' },
  { value: 'اليوم_الوطني', label: 'إجازة اليوم الوطني' },
  { value: 'يوم_التأسيس', label: 'إجازة يوم التأسيس' },
  { value: 'أخرى', label: 'أخرى (حدد)' }
];

export default function HolidayWorkManager({ employee, onUpdate }) {
  const [holidayWorks, setHolidayWorks] = useState(employee?.holiday_work_records || []);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // State for copy functionality
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyingRecord, setCopyingRecord] = useState(null);
  const [targetEmployees, setTargetEmployees] = useState([]);
  const [selectedTargetEmployees, setSelectedTargetEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  const [formData, setFormData] = useState({
    holiday_type: 'عيد_الفطر',
    custom_holiday_name: '',
    year: 1446,
    year_type: 'hijri',
    start_date: null,
    end_date: null,
    duration_days: 0,
    assigned_center: '', // جديد
    include_friday: false,
    include_saturday: false,
    eid_day_1: false,
    eid_day_2: false,
    calculated_compensation_days: 0,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      holiday_type: 'عيد_الفطر',
      custom_holiday_name: '',
      year: 1446,
      year_type: 'hijri',
      start_date: null,
      end_date: null,
      duration_days: 0,
      assigned_center: employee?.المركز_الصحي || '', // جديد، يتم تهيئته من بيانات الموظف الحالي
      include_friday: false,
      include_saturday: false,
      eid_day_1: false,
      eid_day_2: false,
      calculated_compensation_days: 0,
      notes: ''
    });
    setEditingIndex(null);
  };

  const calculateCompensationDays = () => {
    if (!formData.start_date || !formData.end_date) {
      return 0;
    }

    try {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (start > end) {
        return 0;
      }

      const allDays = eachDayOfInterval({ start, end });
      const contractType = employee?.contract_type || '';
      const isSelfEmployed = contractType.includes('تشغيل ذاتي');
      
      let compensationDays = 0;
      
      // حساب أيام العمل الفعلية
      let workDays = allDays.filter(day => {
        const dayOfWeek = getDay(day); // 0 = Sunday, 5 = Friday, 6 = Saturday
        
        // تخطي الجمعة والسبت إذا لم يتم تحديد احتسابهم
        if (dayOfWeek === 5 && !formData.include_friday) return false;
        if (dayOfWeek === 6 && !formData.include_saturday) return false;
        
        return true;
      });

      const totalWorkDays = workDays.length;

      // حساب التعويض حسب نوع العقد
      if (isSelfEmployed) {
        // التشغيل الذاتي
        compensationDays = totalWorkDays * 2;
        
        // يوم العيد وثاني أيام العيد
        if (formData.eid_day_1) compensationDays += 2; // يوم العيد = 2 يوم إضافي
        if (formData.eid_day_2) compensationDays += 2; // ثاني العيد = 2 يوم إضافي
        
      } else {
        // الخدمة المدنية
        compensationDays = totalWorkDays; // كل يوم = يوم واحد
        
        // يوم العيد وثاني أيام العيد (إذا كانت أيام عمل)
        if (formData.eid_day_1) compensationDays += 1; // يوم العيد = يوم إضافي (ليصبح المجموع 2)
        if (formData.eid_day_2) compensationDays += 1; // ثاني العيد = يوم إضافي (ليصبح المجموع 2)
      }

      return compensationDays;
    } catch (error) {
      console.error('Error calculating compensation:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const duration = differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1;
      const compensation = calculateCompensationDays();
      
      setFormData(prev => ({
        ...prev,
        duration_days: duration,
        calculated_compensation_days: compensation
      }));
    } else {
       setFormData(prev => ({
        ...prev,
        duration_days: 0,
        calculated_compensation_days: 0
      }));
    }
  }, [
    formData.start_date, 
    formData.end_date, 
    formData.include_friday, 
    formData.include_saturday,
    formData.eid_day_1,
    formData.eid_day_2,
    employee?.contract_type // Dependency for calculateCompensationDays
  ]);

  const handleAdd = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleEdit = (index) => {
    const record = holidayWorks[index];
    setFormData({
      ...record,
      start_date: record.start_date ? new Date(record.start_date) : null,
      end_date: record.end_date ? new Date(record.end_date) : null
    });
    setEditingIndex(index);
    setShowDialog(true);
  };

  const handleDelete = async (index) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;

    const updatedRecords = holidayWorks.filter((_, i) => i !== index);
    await saveToEmployee(updatedRecords);
  };

  const handleCopy = async (index) => {
    const record = holidayWorks[index];
    setCopyingRecord(record);
    setShowCopyDialog(true);
    setLoadingEmployees(true);
    setSearchQuery('');
    setSelectedTargetEmployees([]);

    try {
      const allEmployees = await base44.entities.Employee.list('-full_name_arabic', 1000);
      // استثناء الموظف الحالي
      const filtered = (allEmployees || []).filter(emp => emp.id !== employee.id);
      setTargetEmployees(filtered);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('حدث خطأ أثناء تحميل قائمة الموظفين');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleCopyToEmployees = async () => {
    if (selectedTargetEmployees.length === 0) {
      alert('يرجى اختيار موظف واحد على الأقل');
      return;
    }

    if (!confirm(`هل أنت متأكد من نسخ السجل إلى ${selectedTargetEmployees.length} موظف؟`)) {
      return;
    }

    setIsCopying(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const empId of selectedTargetEmployees) {
        try {
          const targetEmp = await base44.entities.Employee.get(empId);
          const existingRecords = targetEmp.holiday_work_records || [];
          
          // إعادة حساب التعويض حسب نوع عقد الموظف المستهدف
          let compensationDays = 0;
          
          if (copyingRecord.start_date && copyingRecord.end_date) {
            const start = new Date(copyingRecord.start_date);
            const end = new Date(copyingRecord.end_date);
            
            if (start <= end) { // Ensure start date is not after end date
                const allDays = eachDayOfInterval({ start, end });
                const isSelfEmployed = targetEmp.contract_type?.includes('تشغيل ذاتي');
                
                let workDays = allDays.filter(day => {
                  const dayOfWeek = getDay(day);
                  if (dayOfWeek === 5 && !copyingRecord.include_friday) return false;
                  if (dayOfWeek === 6 && !copyingRecord.include_saturday) return false;
                  return true;
                });

                const totalWorkDays = workDays.length;

                if (isSelfEmployed) {
                  compensationDays = totalWorkDays * 2;
                  if (copyingRecord.eid_day_1) compensationDays += 2;
                  if (copyingRecord.eid_day_2) compensationDays += 2;
                } else {
                  compensationDays = totalWorkDays;
                  if (copyingRecord.eid_day_1) compensationDays += 1;
                  if (copyingRecord.eid_day_2) compensationDays += 1;
                }
            }
          }

          const newRecord = {
            ...copyingRecord,
            calculated_compensation_days: compensationDays
          };

          await base44.entities.Employee.update(empId, {
            holiday_work_records: [...existingRecords, newRecord]
          });
          
          successCount++;
        } catch (empError) {
          console.error(`Error copying to employee ${empId}:`, empError);
          errorCount++;
        }
      }

      alert(`✅ تم نسخ السجل بنجاح!\n\nنجح: ${successCount}\nفشل: ${errorCount}`);
      setShowCopyDialog(false);
      setSelectedTargetEmployees([]);
    } catch (error) {
      console.error('Copy error:', error);
      alert('حدث خطأ أثناء نسخ السجل');
    } finally {
      setIsCopying(false);
    }
  };

  const toggleEmployeeSelection = (empId) => {
    setSelectedTargetEmployees(prev => {
      if (prev.includes(empId)) {
        return prev.filter(id => id !== empId);
      } else {
        return [...prev, empId];
      }
    });
  };

  const selectAll = () => {
    const filtered = getFilteredEmployees();
    if (selectedTargetEmployees.length === filtered.length) { // Simplified logic
      setSelectedTargetEmployees([]);
    } else {
      setSelectedTargetEmployees(filtered.map(e => e.id));
    }
  };

  const getFilteredEmployees = () => {
    if (!targetEmployees) return []; // Handle case where targetEmployees might be null/undefined
    if (!searchQuery) return targetEmployees;
    
    const query = searchQuery.toLowerCase();
    return targetEmployees.filter(emp => 
      emp.full_name_arabic?.toLowerCase().includes(query) ||
      emp.رقم_الموظف?.includes(query) ||
      emp.المركز_الصحي?.toLowerCase().includes(query)
    );
  };

  const handleSave = async () => {
    if (!formData.start_date || !formData.end_date) {
      alert('يرجى تحديد تاريخ البداية والنهاية');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
        alert('تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية.');
        return;
    }

    if (formData.holiday_type === 'أخرى' && !formData.custom_holiday_name) {
      alert('يرجى تحديد اسم الإجازة');
      return;
    }

    const recordToSave = {
      ...formData,
      start_date: format(new Date(formData.start_date), 'yyyy-MM-dd'),
      end_date: format(new Date(formData.end_date), 'yyyy-MM-dd')
    };

    let updatedRecords;
    if (editingIndex !== null) {
      updatedRecords = [...holidayWorks];
      updatedRecords[editingIndex] = recordToSave;
    } else {
      updatedRecords = [...holidayWorks, recordToSave];
    }

    await saveToEmployee(updatedRecords);
  };

  const saveToEmployee = async (records) => {
    setIsSaving(true);
    try {
      await base44.entities.Employee.update(employee.id, {
        holiday_work_records: records
      });
      
      setHolidayWorks(records);
      setShowDialog(false);
      resetForm();
      
      if (onUpdate) onUpdate();
      
      alert('✅ تم حفظ السجل بنجاح');
    } catch (error) {
      console.error('Save error:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const getHolidayLabel = (record) => {
    if (record.holiday_type === 'أخرى') {
      return record.custom_holiday_name || 'أخرى';
    }
    return HOLIDAY_TYPES.find(h => h.value === record.holiday_type)?.label || record.holiday_type;
  };

  const filteredEmployees = getFilteredEmployees();

  return (
    <Card className="shadow-lg border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            العمل خلال الأعياد والإجازات الرسمية
          </CardTitle>
          <Button size="sm" onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 ml-1" />
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {holidayWorks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">لا توجد سجلات عمل في الإجازات</p>
            <Button size="sm" variant="outline" onClick={handleAdd} className="mt-4">
              <Plus className="w-4 h-4 ml-1" />
              إضافة سجل
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {holidayWorks.map((record, index) => (
              <Card key={index} className="bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-600">{getHolidayLabel(record)}</Badge>
                        <Badge variant="outline">{record.year} {record.year_type === 'hijri' ? 'هـ' : 'م'}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">من:</span> {record.start_date}
                        </div>
                        <div>
                          <span className="font-medium">إلى:</span> {record.end_date}
                        </div>
                        <div>
                          <span className="font-medium">المدة:</span> {record.duration_days} يوم
                        </div>
                        <div>
                          <span className="font-medium">التعويض:</span> 
                          <Badge className="mr-1 bg-green-600">{record.calculated_compensation_days} يوم</Badge>
                        </div>
                        {record.assigned_center && (
                          <div className="col-span-2">
                            <span className="font-medium">المركز المكلف:</span> {record.assigned_center}
                          </div>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-xs text-gray-500 mt-2">{record.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleCopy(index)} title="نسخ لموظفين آخرين">
                        <Copy className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(index)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(index)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'تعديل سجل العمل' : 'إضافة سجل عمل في إجازة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نوع الإجازة *</Label>
                <Select 
                  value={formData.holiday_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, holiday_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOLIDAY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.holiday_type === 'أخرى' && (
                <div>
                  <Label>اسم الإجازة *</Label>
                  <Input
                    value={formData.custom_holiday_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_holiday_name: e.target.value }))}
                    placeholder="أدخل اسم الإجازة"
                  />
                </div>
              )}

              <div>
                <Label>العام *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label>نوع التقويم</Label>
                <Select 
                  value={formData.year_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, year_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hijri">هجري</SelectItem>
                    <SelectItem value="gregorian">ميلادي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* خانة المركز المكلف - جديد */}
            <div>
              <Label>المركز المكلف بالعمل فيه</Label>
              <Input
                value={formData.assigned_center}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_center: e.target.value }))}
                placeholder="المركز الصحي الذي تم العمل فيه"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmartDateInput
                label="تاريخ بداية العمل *"
                value={formData.start_date}
                onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                required={true}
              />

              <SmartDateInput
                label="تاريخ نهاية العمل *"
                value={formData.end_date}
                onChange={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                required={true}
              />
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  إعدادات حساب الإجازة التعويضية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium mb-2">نوع العقد: 
                    <Badge className="mr-2">
                      {employee?.contract_type || 'غير محدد'}
                    </Badge>
                  </p>
                  <p className="text-xs text-gray-600">
                    {employee?.contract_type?.includes('تشغيل ذاتي') 
                      ? '⭐ التشغيل الذاتي: كل يوم عمل = يومين تعويض'
                      : '📋 الخدمة المدنية: كل يوم عمل = يوم واحد تعويض'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">احتساب أيام الأسبوع:</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="include_friday"
                        checked={formData.include_friday}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_friday: checked }))}
                      />
                      <Label htmlFor="include_friday" className="cursor-pointer">
                        احتساب الجمعة
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="include_saturday"
                        checked={formData.include_saturday}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_saturday: checked }))}
                      />
                      <Label htmlFor="include_saturday" className="cursor-pointer">
                        احتساب السبت
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">أيام العيد الخاصة (احتساب مضاعف):</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="eid_day_1"
                        checked={formData.eid_day_1}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, eid_day_1: checked }))}
                      />
                      <Label htmlFor="eid_day_1" className="cursor-pointer">
                        يوم العيد (يحتسب يومين)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="eid_day_2"
                        checked={formData.eid_day_2}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, eid_day_2: checked }))}
                      />
                      <Label htmlFor="eid_day_2" className="cursor-pointer">
                        ثاني أيام العيد (يحتسب يومين)
                      </Label>
                    </div>
                  </div>
                </div>

                {formData.start_date && formData.end_date && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">مدة العمل</p>
                        <p className="text-2xl font-bold text-blue-600">{formData.duration_days} يوم</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">الإجازة التعويضية</p>
                        <p className="text-2xl font-bold text-green-600">{formData.calculated_compensation_days} يوم</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <Label>ملاحظات</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  {editingIndex !== null ? 'تحديث' : 'حفظ'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار نسخ السجل لموظفين آخرين */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              نسخ السجل إلى موظفين آخرين
            </DialogTitle>
          </DialogHeader>

          {copyingRecord && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-600">{getHolidayLabel(copyingRecord)}</Badge>
                  <Badge variant="outline">{copyingRecord.year} {copyingRecord.year_type === 'hijri' ? 'هـ' : 'م'}</Badge>
                </div>
                <div className="text-sm text-gray-700">
                  <p>المدة: من {copyingRecord.start_date} إلى {copyingRecord.end_date} ({copyingRecord.duration_days} يوم)</p>
                  <p className="text-green-600 font-medium">التعويض: {copyingRecord.calculated_compensation_days} يوم</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <Label>البحث عن موظفين</Label>
              <Input
                placeholder="ابحث بالاسم، رقم الموظف، أو المركز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>اختر الموظفين ({selectedTargetEmployees.length} محدد)</Label>
              <Button size="sm" variant="outline" onClick={selectAll}>
                {selectedTargetEmployees.length === filteredEmployees.length && filteredEmployees.length > 0 ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
            </div>

            {loadingEmployees ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="mr-2 text-gray-500">جاري تحميل الموظفين...</p>
              </div>
            ) : (
              <ScrollArea className="h-96 border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>لا توجد نتائج</p>
                    </div>
                  ) : (
                    filteredEmployees.map(emp => (
                      <div 
                        key={emp.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedTargetEmployees.includes(emp.id) ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                        }`}
                        onClick={() => toggleEmployeeSelection(emp.id)}
                      >
                        <Checkbox 
                          checked={selectedTargetEmployees.includes(emp.id)}
                          onCheckedChange={() => toggleEmployeeSelection(emp.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{emp.full_name_arabic}</p>
                          <p className="text-sm text-gray-600">
                            {emp.رقم_الموظف} - {emp.position} - {emp.المركز_الصحي}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {emp.contract_type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleCopyToEmployees} 
              disabled={isCopying || selectedTargetEmployees.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCopying ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري النسخ...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ إلى {selectedTargetEmployees.length} موظف
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
