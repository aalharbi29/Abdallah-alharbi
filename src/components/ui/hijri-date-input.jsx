import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// أسماء الأشهر الهجرية
const hijriMonths = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// أيام الأسبوع
const weekDays = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

// بيانات أطوال الأشهر في تقويم أم القرى
const ummAlQuraMonthLengths = {
  1400: [30,29,30,29,30,29,30,29,30,29,30,29],
  1401: [30,30,29,30,29,30,29,30,29,30,29,29],
  1402: [30,30,29,30,30,29,30,29,30,29,30,29],
  1403: [29,30,30,29,30,29,30,30,29,30,29,30],
  1404: [29,30,29,30,29,30,29,30,30,29,30,29],
  1405: [30,29,30,29,30,29,30,29,30,29,30,30],
  1406: [29,30,29,30,29,30,29,30,29,30,29,30],
  1407: [30,29,30,29,30,30,29,30,29,30,29,29],
  1408: [30,30,29,30,29,30,30,29,30,29,30,29],
  1409: [29,30,30,29,30,29,30,29,30,30,29,30],
  1410: [29,30,29,30,29,30,29,30,29,30,30,29],
  1411: [30,29,30,29,30,29,30,29,30,29,30,30],
  1412: [29,30,29,30,29,30,29,30,29,30,29,30],
  1413: [29,30,30,29,30,29,30,29,30,29,30,29],
  1414: [30,29,30,29,30,30,29,30,29,30,29,30],
  1415: [29,30,29,30,29,30,30,29,30,29,30,29],
  1416: [30,29,30,29,30,29,30,29,30,30,29,30],
  1417: [29,30,29,30,29,30,29,30,29,30,30,29],
  1418: [30,29,30,29,30,29,30,29,30,29,30,30],
  1419: [29,30,29,30,29,30,29,30,29,30,29,30],
  1420: [30,29,30,29,30,29,30,29,30,29,30,29],
  1421: [30,30,29,30,29,30,29,30,29,30,29,30],
  1422: [29,30,29,30,30,29,30,29,30,29,30,29],
  1423: [30,29,30,29,30,29,30,30,29,30,29,30],
  1424: [29,30,29,30,29,30,29,30,29,30,30,29],
  1425: [30,29,30,29,30,29,30,29,30,29,30,30],
  1426: [29,30,29,30,29,30,29,30,29,30,29,30],
  1427: [30,29,30,29,30,29,30,29,30,29,30,29],
  1428: [30,30,29,30,29,30,29,30,29,30,29,30],
  1429: [29,30,29,30,30,29,30,29,30,29,30,29],
  1430: [30,29,30,29,30,29,30,30,29,30,29,30],
  1431: [29,30,29,30,29,30,29,30,29,30,30,29],
  1432: [30,29,30,29,30,29,30,29,30,29,30,30],
  1433: [29,30,29,30,29,30,29,30,29,30,29,30],
  1434: [30,29,30,29,30,29,30,29,30,29,30,29],
  1435: [30,30,29,30,29,30,29,30,29,30,29,30],
  1436: [29,30,29,30,30,29,30,29,30,29,30,29],
  1437: [30,29,30,29,30,29,30,30,29,30,29,30],
  1438: [29,30,29,30,29,30,29,30,30,29,30,29],
  1439: [30,29,30,29,30,29,30,29,30,29,30,30],
  1440: [29,30,29,30,29,30,29,30,29,30,29,30],
  1441: [30,29,30,29,30,29,30,29,30,29,30,29],
  1442: [30,30,29,30,29,30,29,30,29,30,29,30],
  1443: [29,30,29,30,30,29,30,29,30,29,30,29],
  1444: [30,29,30,29,30,29,30,30,29,30,29,30],
  1445: [29,30,29,30,29,30,29,30,29,30,30,29],
  1446: [30,29,30,29,30,29,30,29,30,29,30,30],
  1447: [29,30,29,30,29,30,29,30,29,30,29,30],
  1448: [30,29,30,29,30,29,30,29,30,29,30,29],
  1449: [30,30,29,30,29,30,29,30,29,30,29,30],
  1450: [29,30,29,30,30,29,30,29,30,29,30,29],
};

// الحصول على عدد أيام الشهر
function getMonthDays(year, month) {
  if (ummAlQuraMonthLengths[year]) {
    return ummAlQuraMonthLengths[year][month - 1] || 30;
  }
  // افتراضي: الأشهر الفردية 30 يوم، الزوجية 29 يوم
  return month % 2 === 1 ? 30 : 29;
}

// الحصول على يوم الأسبوع لأول يوم في الشهر (تقريبي)
function getFirstDayOfMonth(year, month) {
  // حساب تقريبي - يمكن تحسينه لاحقاً
  const baseYear = 1446;
  const baseFirstDay = 0; // 1 محرم 1446 كان يوم الأحد
  
  let totalDays = 0;
  
  if (year >= baseYear) {
    for (let y = baseYear; y < year; y++) {
      for (let m = 1; m <= 12; m++) {
        totalDays += getMonthDays(y, m);
      }
    }
    for (let m = 1; m < month; m++) {
      totalDays += getMonthDays(year, m);
    }
  } else {
    for (let y = year; y < baseYear; y++) {
      for (let m = 1; m <= 12; m++) {
        totalDays -= getMonthDays(y, m);
      }
    }
    for (let m = 1; m < month; m++) {
      totalDays += getMonthDays(year, m);
    }
  }
  
  return (baseFirstDay + totalDays % 7 + 7) % 7;
}

export default function HijriDateInput({ label, value, onChange, placeholder = "اختر التاريخ الهجري" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(1446);
  const [displayMonth, setDisplayMonth] = useState(1);
  const [inputValue, setInputValue] = useState(value || "");

  // تحليل القيمة الحالية
  useEffect(() => {
    if (value) {
      setInputValue(value);
      const parts = value.split('/');
      if (parts.length === 3) {
        const y = parseInt(parts[2]);
        const m = parseInt(parts[1]);
        if (y && m && y >= 1400 && y <= 1500 && m >= 1 && m <= 12) {
          setDisplayYear(y);
          setDisplayMonth(m);
        }
      }
    }
  }, [value]);

  const handleDateSelect = (day) => {
    const dateStr = `${day.toString().padStart(2, '0')}/${displayMonth.toString().padStart(2, '0')}/${displayYear}`;
    setInputValue(dateStr);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    // التحقق من صحة التنسيق
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (regex.test(val)) {
      onChange(val);
    }
  };

  const goToPrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const daysInMonth = getMonthDays(displayYear, displayMonth);
  const firstDayOfWeek = getFirstDayOfMonth(displayYear, displayMonth);

  // إنشاء مصفوفة الأيام
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // التحقق من اليوم المحدد
  const selectedDay = inputValue ? parseInt(inputValue.split('/')[0]) : null;
  const selectedMonth = inputValue ? parseInt(inputValue.split('/')[1]) : null;
  const selectedYear = inputValue ? parseInt(inputValue.split('/')[2]) : null;

  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              dir="ltr"
              className="pr-10 text-left"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setIsOpen(true)}
            >
              <CalendarIcon className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 bg-white rounded-lg shadow-lg border min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <select
                  value={displayMonth}
                  onChange={(e) => setDisplayMonth(parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {hijriMonths.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </select>
                <select
                  value={displayYear}
                  onChange={(e) => setDisplayYear(parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 100 }, (_, i) => 1400 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* أيام الأسبوع */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, idx) => (
                <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* أيام الشهر */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <div key={idx} className="aspect-square">
                  {day && (
                    <button
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        "w-full h-full rounded-md text-sm font-medium transition-colors",
                        "hover:bg-green-100 hover:text-green-700",
                        selectedDay === day && selectedMonth === displayMonth && selectedYear === displayYear
                          ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                          : "text-gray-700"
                      )}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* زر اليوم */}
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // الذهاب للسنة الحالية تقريباً
                  setDisplayYear(1446);
                  setDisplayMonth(6);
                }}
              >
                العودة للحاضر (1446)
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}