import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { differenceInDays } from "date-fns";
import { HealthCenter } from "@/entities/HealthCenter";

export default function QuickAssignmentForm({ employee, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        employee_record_id: employee?.id || '',
        employee_name: employee?.full_name_arabic || '',
        employee_national_id: employee?.رقم_الهوية || '',
        employee_position: employee?.position || '',
        from_health_center: employee?.المركز_الصحي || '',
        assigned_to_health_center: '',
        start_date: '',
        end_date: '',
        duration_days: 0,
        issue_date: new Date().toISOString().split('T')[0],
        gender: employee?.gender || '',
    });
    const [healthCenters, setHealthCenters] = useState([]);

    useEffect(() => {
        const fetchCenters = async () => {
            const centers = await HealthCenter.list();
            setHealthCenters(Array.isArray(centers) ? centers : []);
        };
        fetchCenters();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            
            // حساب المدة تلقائياً عند تغيير التواريخ
            if (field === 'start_date' || field === 'end_date') {
                const startDate = field === 'start_date' ? value : updated.start_date;
                const endDate = field === 'end_date' ? value : updated.end_date;
                
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    if (start <= end) {
                        updated.duration_days = differenceInDays(end, start) + 1;
                    } else {
                        updated.duration_days = 0;
                    }
                } else {
                    updated.duration_days = 0;
                }
            }
            
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const duration = parseInt(formData.duration_days, 10);
        
        if (!formData.assigned_to_health_center || !formData.start_date || !formData.end_date || isNaN(duration) || duration <= 0) {
            alert("الرجاء تعبئة جميع الحقول المطلوبة والتأكد من صحة التواريخ والمدة.");
            return;
        }
        
        const submissionData = { ...formData, duration_days: duration };
        onSubmit(submissionData);
    };
    
    const availableCenters = healthCenters.filter(c => c.اسم_المركز !== employee?.المركز_الصحي);

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>المركز المكلف به</Label>
                    <Select value={formData.assigned_to_health_center} onValueChange={(value) => handleChange("assigned_to_health_center", value)}>
                        <SelectTrigger><SelectValue placeholder="اختر المركز..." /></SelectTrigger>
                        <SelectContent>
                            {availableCenters.map(center => (
                                <SelectItem key={center.id} value={center.اسم_المركز}>{center.اسم_المركز}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="start_date">تاريخ بداية التكليف</Label>
                        <Input 
                            id="start_date" 
                            type="date" 
                            value={formData.start_date} 
                            onChange={(e) => handleChange("start_date", e.target.value)} 
                        />
                    </div>
                    <div>
                        <Label htmlFor="end_date">تاريخ نهاية التكليف</Label>
                        <Input 
                            id="end_date" 
                            type="date" 
                            value={formData.end_date} 
                            onChange={(e) => handleChange("end_date", e.target.value)} 
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="duration_days">مدة التكليف (أيام)</Label>
                    <Input 
                        id="duration_days" 
                        type="number" 
                        value={formData.duration_days || 0} 
                        readOnly 
                        className="bg-gray-100" 
                    />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}><X className="w-4 h-4 ml-2" />إلغاء</Button>
                    <Button type="submit"><Save className="w-4 h-4 ml-2" />إنشاء التكليف</Button>
                </div>
            </form>
        </div>
    );
}