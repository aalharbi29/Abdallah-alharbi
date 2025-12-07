import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, getYear, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

// دالة للحصول على تفاصيل التاريخ الهجري
const getHijriDetails = (date) => {
    if (!date) return { day: '', month: '', year: '' };
    try {
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
        return { formatted: hijriDate };
    } catch (error) {
        return { formatted: 'تاريخ غير صالح' };
    }
};

// الأشهر الهجرية
const hijriMonths = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// إنشاء قائمة السنوات (من 1350 إلى 1500 هجرية)
const hijriYears = Array.from({ length: 151 }, (_, i) => 1350 + i);

export default function SmartDualCalendar({ selected, onSelect, initialFocus }) {
    const [month, setMonth] = useState(selected || new Date());
    
    // عرض التاريخ الهجري المقابل
    const hijriInfo = getHijriDetails(month);
    
    const handleMonthChange = (newMonth) => {
        setMonth(newMonth);
    };

    const handlePrevMonth = () => {
        const newMonth = subMonths(month, 1);
        setMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = addMonths(month, 1);
        setMonth(newMonth);
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* عرض التاريخ الهجري المقابل */}
            <div className="text-center p-2 bg-blue-50 rounded-lg border">
                <div className="text-sm text-blue-700 font-medium">
                    📅 التاريخ الهجري المقابل: {hijriInfo.formatted}
                </div>
            </div>
            
            {/* أزرار التنقل المخصصة */}
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevMonth}
                    className="flex items-center gap-1"
                >
                    <ChevronRight className="w-4 h-4" />
                    الشهر السابق
                </Button>
                
                <div className="text-center">
                    <div className="font-semibold">
                        {format(month, 'MMMM yyyy', { locale: ar })}
                    </div>
                </div>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="flex items-center gap-1"
                >
                    الشهر التالي
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            </div>

            {/* التقويم الميلادي */}
            <Calendar
                mode="single"
                selected={selected}
                onSelect={onSelect}
                month={month}
                onMonthChange={handleMonthChange}
                initialFocus={initialFocus}
                locale={ar}
                className="rounded-md border"
            />
            
            {/* معلومات مساعدة */}
            <div className="text-xs text-gray-500 text-center">
                💡 اختر التاريخ من التقويم الميلادي أعلاه وسيتم عرض التاريخ الهجري المقابل
            </div>
        </div>
    );
}