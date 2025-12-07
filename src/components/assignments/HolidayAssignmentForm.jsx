
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function HolidayAssignmentForm({ employee, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    holiday_name: 'عيد الفطر',
    holiday_year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    duration_days: 0,
    compensation_amount: '',
    notes: ''
  });

  const { start_date, end_date } = formData;

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
        // Reset duration if one of the dates is cleared
        setFormData(prev => ({ ...prev, duration_days: 0 }));
    }
  }, [start_date, end_date]);

  if (!employee) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        خطأ: لم يتم تحديد الموظف. يرجى إغلاق النافذة والمحاولة مرة أخرى.
      </div>
    );
  }

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || formData.duration_days <= 0) {
      alert("يرجى إدخال تواريخ صحيحة للتكليف.");
      return;
    }
    const assignmentData = {
      employee_record_id: employee.id,
      employee_name: employee.full_name_arabic,
      employee_national_id: employee.رقم_الهوية,
      employee_position: employee.position,
      from_health_center: employee.المركز_الصحي,
      assigned_to_health_center: employee.المركز_الصحي,
      gender: employee.gender,
      issue_date: new Date().toISOString().split("T")[0],
      assignment_type: `العمل خلال إجازة ${formData.holiday_name}`,
      status: 'active',
      ...formData,
      compensation_amount: parseFloat(formData.compensation_amount) || null
    };
    onSubmit(assignmentData);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>الموظف</Label>
          <Input value={employee?.full_name_arabic || ''} disabled className="bg-gray-100" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="holiday_name">المناسبة</Label>
            <Select value={formData.holiday_name} onValueChange={(value) => setFormData({...formData, holiday_name: value})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="عيد الفطر">عيد الفطر</SelectItem>
                <SelectItem value="عيد الأضحى">عيد الأضحى</SelectItem>
                <SelectItem value="اليوم الوطني">اليوم الوطني</SelectItem>
                <SelectItem value="يوم التأسيس">يوم التأسيس</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="holiday_year">السنة</Label>
            <Select value={formData.holiday_year.toString()} onValueChange={(value) => setFormData({...formData, holiday_year: parseInt(value)})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">تاريخ البداية</Label>
            <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="end_date">تاريخ النهاية</Label>
            <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
          </div>
        </div>
        
        <div>
          <Label>مدة التكليف (أيام)</Label>
          <Input value={formData.duration_days} readOnly className="bg-gray-100" />
        </div>

        <div>
          <Label htmlFor="compensation_amount">مبلغ التعويض (اختياري)</Label>
          <Input id="compensation_amount" type="number" value={formData.compensation_amount} onChange={(e) => setFormData({...formData, compensation_amount: e.target.value})} placeholder="مثال: 500" />
        </div>

        <div>
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="أضف أي ملاحظات..." />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}><X className="w-4 h-4 ml-2" />إلغاء</Button>
          <Button type="submit"><Save className="w-4 h-4 ml-2" />حفظ التسجيل</Button>
        </div>
      </form>
    </div>
  );
}
