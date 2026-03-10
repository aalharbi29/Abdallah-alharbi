import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";

// Approximate Hijri month lengths (alternating 30/29, month 12 can be 30 in leap years)
const HIJRI_MONTHS = [
  { name: "محرم", days: 30 },
  { name: "صفر", days: 29 },
  { name: "ربيع الأول", days: 30 },
  { name: "ربيع الثاني", days: 29 },
  { name: "جمادى الأولى", days: 30 },
  { name: "جمادى الآخرة", days: 29 },
  { name: "رجب", days: 30 },
  { name: "شعبان", days: 29 },
  { name: "رمضان", days: 30 },
  { name: "شوال", days: 29 },
  { name: "ذو القعدة", days: 30 },
  { name: "ذو الحجة", days: 29 },
];

const WEEKDAYS = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

function isHijriLeapYear(year) {
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(year % 30);
}

function getDaysInHijriMonth(year, month) {
  if (month === 12 && isHijriLeapYear(year)) return 30;
  return HIJRI_MONTHS[month - 1].days;
}

// Get approximate day of week for first day of Hijri month
// We use Intl to convert hijri date to gregorian and get the weekday
function getFirstDayOfWeek(year, month) {
  try {
    // Create a date formatter that can handle Islamic calendar
    const formatter = new Intl.DateTimeFormat('en-US', {
      calendar: 'islamic-umalqura',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    
    // We need to find the gregorian date for hijri 1/month/year
    // Use a reverse approach: iterate gregorian dates to find matching hijri
    const now = new Date();
    const baseYear = now.getFullYear();
    
    // Approximate: Hijri year ≈ Gregorian year - 579
    const approxGregorianYear = year + 579;
    
    for (let offset = -400; offset <= 400; offset++) {
      const testDate = new Date(approxGregorianYear, (month - 1), 1 + offset);
      const parts = formatter.formatToParts(testDate);
      const hYear = parseInt(parts.find(p => p.type === 'year')?.value);
      const hMonth = parseInt(parts.find(p => p.type === 'month')?.value);
      const hDay = parseInt(parts.find(p => p.type === 'day')?.value);
      
      if (hYear === year && hMonth === month && hDay === 1) {
        return testDate.getDay(); // 0=Sunday
      }
    }
  } catch (e) {
    // fallback
  }
  return 0;
}

function getCurrentHijriDate() {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      calendar: 'islamic-umalqura',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === 'year')?.value);
    const month = parseInt(parts.find(p => p.type === 'month')?.value);
    const day = parseInt(parts.find(p => p.type === 'day')?.value);
    return { year, month, day };
  } catch {
    return { year: 1446, month: 1, day: 1 };
  }
}

export default function HijriDatePicker({ value, onChange, placeholder, className }) {
  const current = getCurrentHijriDate();
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(current.year);
  const [viewMonth, setViewMonth] = useState(current.month);
  const [showYearSelect, setShowYearSelect] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setShowYearSelect(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const daysInMonth = getDaysInHijriMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handleDayClick = (day) => {
    const m = String(viewMonth).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${viewYear}/${m}/${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const yearOptions = [];
  for (let y = current.year - 5; y <= current.year + 10; y++) {
    yearOptions.push(y);
  }

  const isToday = (day) => {
    return viewYear === current.year && viewMonth === current.month && day === current.day;
  };

  const isSelected = (day) => {
    if (!value) return false;
    const m = String(viewMonth).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return value === `${viewYear}/${m}/${d}`;
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <div className="relative">
        <input
          type="text"
          className={className || "border border-gray-300 rounded-lg px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"}
          placeholder={placeholder || "اختر التاريخ الهجري"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 no-print"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 w-[300px] no-print" style={{ left: '50%', transform: 'translateX(-50%)' }} dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowYearSelect(!showYearSelect)}
                className="text-sm font-bold text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
              >
                {viewYear} هـ
              </button>
              <span className="text-sm font-bold text-gray-800">
                {HIJRI_MONTHS[viewMonth - 1]?.name}
              </span>
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Year selector */}
          {showYearSelect && (
            <div className="mb-3 max-h-36 overflow-y-auto border rounded-lg bg-gray-50 p-1 grid grid-cols-4 gap-1">
              {yearOptions.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setViewYear(y); setShowYearSelect(false); }}
                  className={`text-xs py-1.5 rounded-md transition-colors ${y === viewYear ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-100 text-gray-700'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Month quick nav */}
          <div className="mb-3 grid grid-cols-4 gap-1">
            {HIJRI_MONTHS.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setViewMonth(i + 1)}
                className={`text-[10px] py-1 rounded-md transition-colors ${viewMonth === i + 1 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map(wd => (
              <div key={wd} className="text-center text-[10px] font-bold text-gray-500 py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => (
              <div key={i} className="aspect-square flex items-center justify-center">
                {day ? (
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`w-full h-full rounded-lg text-sm font-semibold transition-all
                      ${isSelected(day) ? 'bg-blue-600 text-white shadow-md' : ''}
                      ${isToday(day) && !isSelected(day) ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : ''}
                      ${!isSelected(day) && !isToday(day) ? 'hover:bg-gray-100 text-gray-800' : ''}
                    `}
                  >
                    {day}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => {
                setViewYear(current.year);
                setViewMonth(current.month);
                handleDayClick(current.day);
              }}
              className="w-full text-xs text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg font-bold transition-colors"
            >
              اليوم: {current.day} {HIJRI_MONTHS[current.month - 1]?.name} {current.year} هـ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}