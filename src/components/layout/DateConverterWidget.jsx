import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRightLeft, Copy, Check } from "lucide-react";

// تحويل الأرقام العربية إلى إنجليزية
const toEng = (str) => {
  const map = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
  return String(str || "").replace(/[٠-٩]/g, d => map[d] || d);
};

// تحويل ميلادي إلى هجري
function gregorianToHijri(year, month, day) {
  try {
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return formatter.format(date);
  } catch {
    return null;
  }
}

// تحويل هجري إلى ميلادي - خوارزمية محسّنة
function hijriToGregorian(hYear, hMonth, hDay) {
  try {
    // نطاق البحث
    const approxYear = Math.floor(hYear * 0.970224 + 621.5643);
    const startDate = new Date(approxYear - 1, 0, 1);
    const endDate = new Date(approxYear + 2, 11, 31);
    
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    
    // بحث خطي للعثور على تطابق تام
    let current = new Date(startDate);
    while (current <= endDate) {
      const parts = formatter.formatToParts(current);
      const y = parseInt(toEng(parts.find(p => p.type === 'year')?.value || '0'));
      const m = parseInt(parts.find(p => p.type === 'month')?.value || '0');
      const d = parseInt(parts.find(p => p.type === 'day')?.value || '0');
      
      if (y === hYear && m === hMonth && d === hDay) {
        return current.toLocaleDateString('ar-SA');
      }
      
      // إذا تجاوزنا التاريخ المطلوب، توقف
      if (y > hYear || (y === hYear && m > hMonth + 1)) {
        break;
      }
      
      current.setDate(current.getDate() + 1);
    }
    return null;
  } catch {
    return null;
  }
}

export default function DateConverterWidget() {
  const [gInput, setGInput] = useState('');
  const [hInput, setHInput] = useState('');
  const [gResult, setGResult] = useState('');
  const [hResult, setHResult] = useState('');
  const [copied, setCopied] = useState('');

  // تحويل من ميلادي لهجري
  const handleGregorianChange = (value) => {
    setGInput(value);
    const clean = toEng(value);
    const match = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    
    if (match) {
      const [, y, m, d] = match;
      const result = gregorianToHijri(parseInt(y), parseInt(m), parseInt(d));
      setHResult(result || 'تاريخ غير صحيح');
    } else {
      setHResult('');
    }
  };

  // تحويل من هجري لميلادي
  const handleHijriChange = (value) => {
    setHInput(value);
    const clean = toEng(value);
    const match = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    
    if (match) {
      const [, y, m, d] = match;
      const result = hijriToGregorian(parseInt(y), parseInt(m), parseInt(d));
      setGResult(result || 'تاريخ غير صحيح');
    } else {
      setGResult('');
    }
  };

  const copyToClipboard = async (text, type) => {
    if (!text || text === 'تاريخ غير صحيح') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const setToday = () => {
    const now = new Date();
    const g = now.toISOString().split('T')[0];
    setGInput(g);
    handleGregorianChange(g);
  };

  return (
    <Card className="shadow-md border-green-200">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            محول التاريخ
          </span>
          <Button size="sm" variant="ghost" onClick={setToday} className="h-7 text-xs">
            اليوم
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* ميلادي → هجري */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="flex-1 h-px bg-gray-200" />
            <span>ميلادي → هجري</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          <Input
            type="date"
            value={gInput}
            onChange={(e) => handleGregorianChange(e.target.value)}
            className="text-center"
            placeholder="YYYY-MM-DD"
          />
          
          {hResult && (
            <div className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded-lg text-center text-sm font-medium ${
                hResult === 'تاريخ غير صحيح' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {hResult}
              </div>
              {hResult !== 'تاريخ غير صحيح' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(hResult, 'h')}
                  className="flex-shrink-0"
                >
                  {copied === 'h' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <ArrowRightLeft className="w-5 h-5 text-gray-400" />
        </div>

        {/* هجري → ميلادي */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="flex-1 h-px bg-gray-200" />
            <span>هجري → ميلادي</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          <Input
            type="text"
            value={hInput}
            onChange={(e) => handleHijriChange(e.target.value)}
            placeholder="1446-01-15"
            className="text-center"
            dir="ltr"
          />
          
          {gResult && (
            <div className="flex items-center gap-2">
              <div className={`flex-1 p-2 rounded-lg text-center text-sm font-medium ${
                gResult === 'تاريخ غير صحيح' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {gResult}
              </div>
              {gResult !== 'تاريخ غير صحيح' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(gResult, 'g')}
                  className="flex-shrink-0"
                >
                  {copied === 'g' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          📌 الصيغة: YYYY-MM-DD (مثال: 2024-01-15 أو 1446-05-20)
        </div>
      </CardContent>
    </Card>
  );
}