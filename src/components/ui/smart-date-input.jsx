import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const toEnglishDigits = (str) => {
  if (!str) return "";
  const map = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
  return String(str).replace(/[٠-٩]/g, d => map[d] || d);
};

// دوال التحويل المحسّنة
const convertGregorianToHijri = (gregorianDate) => {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(gregorianDate));
  } catch (error) {
    return '';
  }
};

function hijriParts(date) {
  try {
    const df = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", { year:"numeric", month:"numeric", day:"numeric" });
    const parts = df.formatToParts(date);
    const d = Number(parts.find(p => p.type === "day")?.value || 0);
    const m = Number(parts.find(p => p.type === "month")?.value || 0);
    const yRaw = parts.find(p => p.type === "year")?.value || "0";
    const y = Number(toEnglishDigits(yRaw));
    return { d, m, y };
  } catch { return { d:0, m:0, y:0 }; }
}

// خوارزمية محسّنة للتحويل من الهجري إلى الميلادي
function convertHijriToGregorian(hijriString) {
  try {
    const parts = hijriString.split('/');
    if (parts.length !== 3) return '';
    
    const hDay = parseInt(parts[0]);
    const hMonth = parseInt(parts[1]);
    const hYear = parseInt(parts[2]);
    
    if (!hDay || !hMonth || !hYear) return '';
    
    // معادلة تقريبية محسّنة
    const approxYear = Math.floor((hYear * 0.970224) + 621.5643);
    
    // توسيع نطاق البحث
    const startDate = new Date(approxYear - 2, 0, 1);
    const endDate = new Date(approxYear + 2, 11, 31);
    
    const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "numeric", 
      day: "numeric"
    });
    
    // البحث الخطي الدقيق
    let currentDate = new Date(startDate);
    let bestMatch = null;
    let minDifference = Infinity;
    
    while (currentDate <= endDate) {
      const currentParts = formatter.formatToParts(currentDate);
      const day = Number(currentParts.find(p => p.type === "day")?.value || 0);
      const month = Number(currentParts.find(p => p.type === "month")?.value || 0);
      const yearStr = currentParts.find(p => p.type === "year")?.value || "0";
      const year = Number(toEnglishDigits(yearStr));
      
      // تطابق تام
      if (day === hDay && month === hMonth && year === hYear) {
        return format(currentDate, 'yyyy-MM-dd');
      }
      
      // حساب الفرق
      const daysDiff = Math.abs((year - hYear) * 354 + (month - hMonth) * 29.5 + (day - hDay));
      
      if (daysDiff < minDifference) {
        minDifference = daysDiff;
        bestMatch = new Date(currentDate);
      }
      
      // إذا تجاوزنا التاريخ بكثير، توقف
      if (year > hYear || (year === hYear && month > hMonth + 1)) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return bestMatch ? format(bestMatch, 'yyyy-MM-dd') : '';
  } catch (error) {
    console.error('Hijri conversion error:', error);
    return '';
  }
}

const parseHijriInput = (input) => {
  const cleaned = input.replace(/[^\d]/g, ' ').trim();
  const parts = cleaned.split(/\s+/);
  
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${day}/${month}/${year}`;
  }
  return input;
};

export default function SmartDateInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "أدخل التاريخ...",
  required = false 
}) {
  const [inputMode, setInputMode] = useState('gregorian');
  const [displayValue, setDisplayValue] = useState('');
  const [convertedValue, setConvertedValue] = useState('');

  useEffect(() => {
    if (value) {
      setDisplayValue(value);
      if (inputMode === 'gregorian') {
        const hijriEquivalent = convertGregorianToHijri(value);
        setConvertedValue(hijriEquivalent);
      }
    }
  }, [value, inputMode]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    if (inputMode === 'gregorian') {
      if (inputValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const hijriEquivalent = convertGregorianToHijri(inputValue);
        setConvertedValue(hijriEquivalent);
        onChange(inputValue);
      }
    } else {
      const parsedHijri = parseHijriInput(inputValue);
      
      if (parsedHijri.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const gregorianEquivalent = convertHijriToGregorian(parsedHijri);
        if (gregorianEquivalent) {
          setConvertedValue(gregorianEquivalent);
          onChange(gregorianEquivalent);
        }
      }
    }
  };

  const toggleInputMode = () => {
    setInputMode(prev => prev === 'gregorian' ? 'hijri' : 'gregorian');
    setDisplayValue('');
    setConvertedValue('');
  };

  const getPlaceholder = () => {
    if (inputMode === 'gregorian') {
      return "2024-01-15 (ميلادي)";
    } else {
      return "15/5/1445 (هجري)";
    }
  };

  const getInputType = () => {
    return inputMode === 'gregorian' ? 'date' : 'text';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleInputMode}
          className="text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          {inputMode === 'gregorian' ? 'تبديل للهجري' : 'تبديل للميلادي'}
        </Button>
      </div>
      
      <div className="space-y-2">
        <Input
          type={getInputType()}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          required={required}
          className={`${inputMode === 'hijri' ? 'text-right' : ''}`}
        />
        
        {convertedValue && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>
                {inputMode === 'gregorian' 
                  ? `التاريخ الهجري المقابل: ${convertedValue}`
                  : `التاريخ الميلادي المقابل: ${convertedValue}`
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        {inputMode === 'hijri' && "يمكنك الإدخال بالصيغ: 15/5/1445 أو 15-5-1445 أو 15 5 1445"}
      </div>
    </div>
  );
}