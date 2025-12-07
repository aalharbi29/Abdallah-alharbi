import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Save, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SmartDualCalendar from "@/components/ui/SmartDualCalendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function LeaveForm({ leave, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(leave || {
    employee_id: "",
    employee_name: "",
    leave_type: "إجازة سنوية",
    start_date: "",
    end_date: "",
    days_count: "",
    reason: "",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if(startDate > endDate) {
          setFormData(prev => ({ ...prev, days_count: 0 }));
          return;
      }
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, days_count: diffDays }));
    } else if (!formData.start_date || !formData.end_date) {
        setFormData(prev => ({ ...prev, days_count: "" }));
    }
  }, [formData.start_date, formData.end_date]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onCancel} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {leave ? "تعديل الإجازة" : "إضافة إجازة جديدة"}
            </h1>
            <p className="text-gray-600 mt-1">املأ بيانات الإجازة</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              بيانات الإجازة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="employee_id">رقم الموظف *</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => handleChange("employee_id", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="employee_name">اسم الموظف *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => handleChange("employee_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="leave_type">نوع الإجازة</Label>
                  <Select value={formData.leave_type} onValueChange={(value) => handleChange("leave_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إجازة سنوية">إجازة سنوية</SelectItem>
                      <SelectItem value="إجازة مرضية">إجازة مرضية</SelectItem>
                      <SelectItem value="إجازة أمومة">إجازة أمومة</SelectItem>
                      <SelectItem value="إجازة طارئة">إجازة طارئة</SelectItem>
                      <SelectItem value="إجازة بدون راتب">إجازة بدون راتب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div></div>
                
                <div>
                  <Label htmlFor="start_date">تاريخ البداية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-right font-normal">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.start_date ? format(new Date(formData.start_date), 'PPP', { locale: ar }) : <span>اختر تاريخاً</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <SmartDualCalendar
                        selected={formData.start_date ? new Date(formData.start_date) : undefined}
                        onSelect={(date) => handleChange("start_date", date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="end_date">تاريخ النهاية</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-right font-normal">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.end_date ? format(new Date(formData.end_date), 'PPP', { locale: ar }) : <span>اختر تاريخاً</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                       <SmartDualCalendar
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date) => handleChange("end_date", date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                 <div>
                  <Label htmlFor="days_count">عدد الأيام</Label>
                  <Input
                    id="days_count"
                    type="number"
                    value={formData.days_count}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">سبب الإجازة</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  rows={3}
                  placeholder="اذكر سبب طلب الإجازة..."
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ البيانات
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}