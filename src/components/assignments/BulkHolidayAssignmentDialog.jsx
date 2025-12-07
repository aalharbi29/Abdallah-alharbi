import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Users, Calendar, Award, Download, Printer } from 'lucide-react';
import { differenceInDays } from 'date-fns';

const holidayTypes = [
  { value: 'عيد الفطر', label: 'عيد الفطر المبارك' },
  { value: 'عيد الأضحى', label: 'عيد الأضحى المبارك' },
  { value: 'اليوم الوطني', label: 'اليوم الوطني السعودي' },
  { value: 'يوم التأسيس', label: 'يوم التأسيس' },
  { value: 'رأس السنة الهجرية', label: 'رأس السنة الهجرية' },
  { value: 'يوم عرفة', label: 'يوم عرفة' },
  { value: 'المولد النبوي', label: 'المولد النبوي الشريف' },
];

export default function BulkHolidayAssignmentDialog({ 
  open, 
  onOpenChange, 
  selectedEmployeeIds = [], 
  employees = [], 
  healthCenters = [],
  onComplete 
}) {
  const [formData, setFormData] = useState({
    holiday_name: 'عيد الفطر',
    holiday_year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    duration_days: 0,
    assigned_to_health_center: '',
    compensation_amount: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Extract dates for cleaner dependency management
  const { start_date, end_date } = formData;

  // حساب المدة تلقائياً عند تغيير التواريخ
  useEffect(() => {
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (end >= start) {
        setFormData(prev => ({ ...prev, duration_days: differenceInDays(end, start) + 1 }));
      } else {
        setFormData(prev => ({ ...prev, duration_days: 0 }));
      }
    } else {
      setFormData(prev => ({ ...prev, duration_days: 0 }));
    }
  }, [start_date, end_date]);

  // الحصول على الموظفين المختارين
  const selectedEmployees = React.useMemo(() => {
    if (!Array.isArray(employees) || !Array.isArray(selectedEmployeeIds)) return [];
    return employees.filter(emp => selectedEmployeeIds.includes(emp?.id)).filter(Boolean);
  }, [employees, selectedEmployeeIds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date || !formData.assigned_to_health_center) {
      alert("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    if (formData.duration_days <= 0) {
      alert("يرجى التأكد من صحة تواريخ التكليف.");
      return;
    }

    if (selectedEmployees.length === 0) {
      alert("لم يتم اختيار أي موظف للتكليف.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const assignmentsToCreate = selectedEmployees.map(employee => ({
        employee_record_id: employee.id,
        employee_name: employee.full_name_arabic,
        employee_national_id: employee.رقم_الهوية,
        employee_position: employee.position,
        from_health_center: employee.المركز_الصحي,
        assigned_to_health_center: formData.assigned_to_health_center,
        gender: employee.gender,
        issue_date: new Date().toISOString().split("T")[0],
        assignment_type: `العمل خلال إجازة ${formData.holiday_name}`,
        status: 'active',
        holiday_name: formData.holiday_name,
        holiday_year: formData.holiday_year,
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_days: formData.duration_days,
        compensation_amount: parseFloat(formData.compensation_amount) || null,
        notes: formData.notes
      }));

      // إنشاء التكاليف دفعة واحدة
      await base44.entities.Assignment.bulkCreate(assignmentsToCreate);
      
      alert(`تم إنشاء ${assignmentsToCreate.length} تكليف بنجاح`);
      
      if (onComplete) {
        onComplete();
      }
      
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating bulk assignments:', error);
      alert('فشل في إنشاء التكاليف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportList = () => {
    if (selectedEmployees.length === 0) {
      alert('لا يوجد موظفين لتصديرهم');
      return;
    }

    const employeesData = selectedEmployees.map(emp => ({
      'الاسم': emp.full_name_arabic,
      'الرقم الوظيفي': emp.رقم_الموظف,
      'المنصب': emp.position,
      'المركز الحالي': emp.المركز_الصحي,
      'المركز المكلف به': formData.assigned_to_health_center,
      'نوع التكليف': `العمل خلال إجازة ${formData.holiday_name}`,
      'السنة': formData.holiday_year,
      'تاريخ البداية': formData.start_date,
      'تاريخ النهاية': formData.end_date,
      'المدة بالأيام': formData.duration_days
    }));

    const csvContent = "data:text/csv;charset=utf-8,\ufeff" + 
      [Object.keys(employeesData[0]).join(','), ...employeesData.map(row => Object.values(row).join(','))].join('\n');
    
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `تكليف_جماعي_${formData.holiday_name}_${formData.holiday_year}.csv`;
    link.click();
  };

  const handlePrint = () => {
    if (selectedEmployees.length === 0) {
      alert('لا يوجد موظفين للطباعة');
      return;
    }

    const printContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 20px;">تكليف جماعي - ${formData.holiday_name} ${formData.holiday_year}</h1>
        <div style="margin-bottom: 20px;">
          <p><strong>المركز المكلف به:</strong> ${formData.assigned_to_health_center}</p>
          <p><strong>فترة التكليف:</strong> من ${formData.start_date} إلى ${formData.end_date} (${formData.duration_days} أيام)</p>
          ${formData.compensation_amount ? `<p><strong>مبلغ التعويض:</strong> ${formData.compensation_amount} ريال</p>` : ''}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">#</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الاسم</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الرقم الوظيفي</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">المنصب</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">المركز الحالي</th>
            </tr>
          </thead>
          <tbody>
            ${selectedEmployees.map((emp, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${emp.full_name_arabic}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${emp.رقم_الموظف}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${emp.position}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${emp.المركز_الصحي}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            تسجيل عمل جماعي خلال الإجازات والمناسبات
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* النموذج */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  بيانات التكليف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>نوع المناسبة</Label>
                      <Select 
                        value={formData.holiday_name} 
                        onValueChange={(value) => setFormData({...formData, holiday_name: value})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {holidayTypes.map(holiday => (
                            <SelectItem key={holiday.value} value={holiday.value}>
                              {holiday.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>السنة</Label>
                      <Select 
                        value={formData.holiday_year.toString()} 
                        onValueChange={(value) => setFormData({...formData, holiday_year: parseInt(value)})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>المركز المكلف به العمل</Label>
                    <Select 
                      value={formData.assigned_to_health_center} 
                      onValueChange={(value) => setFormData({...formData, assigned_to_health_center: value})}
                    >
                      <SelectTrigger><SelectValue placeholder="اختر المركز..." /></SelectTrigger>
                      <SelectContent>
                        {(healthCenters || []).map(center => (
                          <SelectItem key={center.id} value={center.اسم_المركز}>
                            {center.اسم_المركز}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>تاريخ البداية</Label>
                      <Input 
                        type="date" 
                        value={formData.start_date} 
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label>تاريخ النهاية</Label>
                      <Input 
                        type="date" 
                        value={formData.end_date} 
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <Label>مدة التكليف (أيام)</Label>
                    <Input value={formData.duration_days} readOnly className="bg-gray-100" />
                  </div>

                  <div>
                    <Label>مبلغ التعويض (اختياري)</Label>
                    <Input 
                      type="number" 
                      value={formData.compensation_amount} 
                      onChange={(e) => setFormData({...formData, compensation_amount: e.target.value})}
                      placeholder="مثال: 500"
                    />
                  </div>

                  <div>
                    <Label>ملاحظات (اختياري)</Label>
                    <Textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="أضف أي ملاحظات..."
                      rows={3}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* قائمة الموظفين المختارين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    الموظفين المختارين ({selectedEmployees.length})
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportList} 
                      disabled={selectedEmployees.length === 0}
                      type="button"
                    >
                      <Download className="w-4 h-4 ml-1" />
                      تصدير
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrint} 
                      disabled={selectedEmployees.length === 0}
                      type="button"
                    >
                      <Printer className="w-4 h-4 ml-1" />
                      طباعة
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>لم يتم اختيار أي موظف بعد</p>
                    <p className="text-sm">قم بتحديد الموظفين من قائمة الموارد البشرية</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {selectedEmployees.map((employee, index) => (
                        <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{employee.full_name_arabic}</p>
                              <p className="text-sm text-gray-600">{employee.position} - {employee.المركز_الصحي}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{employee.رقم_الموظف}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)} type="button">
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || selectedEmployees.length === 0}
            className="bg-green-600 hover:bg-green-700"
            type="button"
          >
            <Save className="w-4 h-4 ml-2" />
            {isSubmitting ? 'جاري الإنشاء...' : `إنشاء ${selectedEmployees.length} تكليف`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}