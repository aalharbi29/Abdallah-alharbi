
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Save, X, ChevronsUpDown } from "lucide-react";
import { addDays, differenceInDays } from "date-fns";

export default function QuickLeaveForm({ employee, employees, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        employee_id: "",
        employee_name: "",
        health_center: "",
        leave_type: "إجازة سنوية",
        start_date: "",
        end_date: "",
        days_count: '', // Changed initial value to empty string
        reason: "",
        status: "active", // التأكد من وضع الحالة الصحيحة
        notes: ""
    });

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [open, setOpen] = useState(false);
    const isPreselected = !!employee;

    // Effect to set selectedEmployee if an employee is pre-selected via props
    useEffect(() => {
        if (employee) {
            setSelectedEmployee(employee);
        }
    }, [employee]);

    // Effect to update formData when selectedEmployee changes
    useEffect(() => {
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                employee_id: selectedEmployee.رقم_الموظف,
                employee_name: selectedEmployee.full_name_arabic,
                health_center: selectedEmployee.المركز_الصحي,
                employee_record_id: selectedEmployee.id, // إضافة معرف السجل أيضاً
            }));
        } else {
            // If selectedEmployee becomes null (e.g., if prop employee is removed/nullified),
            // reset employee-related fields in formData
            setFormData(prev => ({
                ...prev,
                employee_id: "",
                employee_name: "",
                health_center: "",
                employee_record_id: "", // مسح معرف السجل أيضاً
            }));
        }
    }, [selectedEmployee]);

    // Effect to update end_date when start_date or days_count change
    useEffect(() => {
        const days = parseInt(formData.days_count, 10);
        if (formData.start_date && !isNaN(days) && days > 0) {
            const startDate = new Date(formData.start_date);
            const endDate = addDays(startDate, days - 1);
            const newEndDate = endDate.toISOString().split('T')[0];
            // Only update if the calculated end_date is different to prevent unnecessary re-renders
            if (formData.end_date !== newEndDate) {
                setFormData(prev => ({
                    ...prev,
                    end_date: newEndDate
                }));
            }
        } else if (formData.start_date && (isNaN(days) || days <= 0)) {
            // If days_count becomes invalid or empty while start_date is set, clear end_date
            if (formData.end_date !== '') {
                setFormData(prev => ({ ...prev, end_date: '' }));
            }
        }
    }, [formData.start_date, formData.days_count, formData.end_date]); // Added formData.end_date to dependencies

    // Effect to update days_count when end_date changes
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            if (end >= start) {
                const duration = differenceInDays(end, start) + 1;
                // Only update if the calculated duration is different
                if (parseInt(formData.days_count, 10) !== duration) {
                    setFormData(prev => ({ ...prev, days_count: duration.toString() }));
                }
            } else {
                // If end_date is before start_date, reset days_count
                if (formData.days_count !== '') {
                    setFormData(prev => ({ ...prev, days_count: '' }));
                }
            }
        } else if (formData.days_count !== '' && !formData.start_date && !formData.end_date) {
            // If both dates are cleared, clear days_count too
            setFormData(prev => ({ ...prev, days_count: '' }));
        }
    }, [formData.start_date, formData.end_date, formData.days_count]); // Added formData.days_count to dependencies

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) {
            alert("يرجى اختيار موظف أولاً.");
            return;
        }

        const parsedDaysCount = parseInt(formData.days_count, 10);
        if (!formData.start_date || !formData.end_date || isNaN(parsedDaysCount) || parsedDaysCount <= 0) {
            alert("يرجى إدخال تواريخ صحيحة للإجازة وعدد أيام أكبر من صفر.");
            return;
        }
        
        // التأكد من إرسال جميع البيانات المطلوبة
        const leaveData = {
            ...formData,
            employee_id: selectedEmployee.رقم_الموظف,
            employee_name: selectedEmployee.full_name_arabic,
            health_center: selectedEmployee.المركز_الصحي,
            employee_record_id: selectedEmployee.id, // إضافة معرف السجل للربط
            status: "active", // التأكد من الحالة
            days_count: parsedDaysCount // Ensure days_count is sent as a number
        };
        
        console.log('بيانات الإجازة المرسلة:', leaveData);
        
        try {
            await onSubmit(leaveData);
        } catch (error) {
            console.error('خطأ في إرسال الإجازة:', error);
            alert("فشل في إضافة الإجازة");
        }
    };

    // Ensure employees prop is an array
    const safeEmployees = Array.isArray(employees) ? employees : [];

    return (
        <div className="space-y-6 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {isPreselected ? (
                    <div>
                        <Label>الموظف</Label>
                        <Input value={selectedEmployee?.full_name_arabic || ""} disabled />
                    </div>
                ) : (
                    <div>
                        <Label htmlFor="employee">اختر الموظف</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                                    {selectedEmployee ? selectedEmployee.full_name_arabic : "ابحث عن موظف..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="ابحث بالاسم أو الرقم الوظيفي..." />
                                    <CommandEmpty>لم يتم العثور على موظف.</CommandEmpty>
                                    <CommandGroup className="max-h-60 overflow-y-auto">
                                        {safeEmployees.length > 0 ? safeEmployees.map((emp) => emp ? (
                                            <CommandItem
                                                key={emp.رقم_الموظف || emp.id}
                                                onSelect={() => {
                                                    setSelectedEmployee(emp);
                                                    setOpen(false);
                                                }}
                                            >
                                                {emp.full_name_arabic} - {emp.position || emp.الوظيفة_الحالية}
                                            </CommandItem>
                                        ) : null) : (
                                            <CommandItem disabled>لا توجد بيانات موظفين متاحة</CommandItem>
                                        )}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <div>
                    <Label htmlFor="leave_type">نوع الإجازة</Label>
                    <Select value={formData.leave_type} onValueChange={(value) => handleChange("leave_type", value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="إجازة سنوية">إجازة سنوية</SelectItem>
                            <SelectItem value="إجازة مرضية">إجازة مرضية</SelectItem>
                            <SelectItem value="إجازة أمومة">إجازة أمومة</SelectItem>
                            <SelectItem value="إجازة طارئة">إجازة طارئة</SelectItem>
                            <SelectItem value="إجازة بدون راتب">إجازة بدون راتب</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="start_date">تاريخ البداية</Label>
                        <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => handleChange("start_date", e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="days_count">عدد الأيام</Label>
                        <Input id="days_count" type="number" min="1" value={formData.days_count} onChange={(e) => handleChange("days_count", e.target.value)} placeholder="أدخل عدد الأيام" />
                    </div>
                </div>
                <div>
                    <Label htmlFor="end_date">تاريخ النهاية</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => handleChange("end_date", e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="reason">السبب</Label>
                    <Textarea id="reason" value={formData.reason} onChange={(e) => handleChange("reason", e.target.value)} placeholder="أدخل سبب الإجازة (اختياري)" />
                </div>
                <div>
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="أضف أي ملاحظات إضافية (اختياري)" />
                </div>
                <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={!selectedEmployee}><Save className="w-4 h-4 ml-2" />حفظ الإجازة</Button>
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 ml-1" />إلغاء</Button>}
                </div>
            </form>
        </div>
    );
}
