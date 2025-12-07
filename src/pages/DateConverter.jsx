import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Copy, ArrowLeftRight, Clock } from "lucide-react";

const toEnglishDigits = (str) => {
  if (!str) return "";
  const map = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
  return String(str).replace(/[٠-٩]/g, d => map[d] || d);
};

function formatHijri(date) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", { year:"numeric", month:"long", day:"numeric" }).format(date);
  } catch {
    return "—";
  }
}

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

// تحسين دالة التحويل من الهجري للميلادي
function hijriToGregorianExact(hd, hm, hy) {
  // صيغة تقريبية أكثر دقة
  const approxYear = Math.floor(hy * 0.970229 + 621.5774);
  
  // توسيع نطاق البحث
  let start = new Date(approxYear - 2, 0, 1);
  let end = new Date(approxYear + 2, 11, 31);

  const target = `${hd}-${hm}-${hy}`;
  const fmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", { year: "numeric", month: "numeric", day: "numeric" });

  let lo = start.getTime(), hi = end.getTime();
  let bestMatch = null;
  let bestDiff = Infinity;

  // بحث ثنائي محسّن
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const d = new Date(mid);
    const parts = fmt.formatToParts(d);
    const dd = Number(parts.find(p => p.type === "day")?.value || 0);
    const mm = Number(parts.find(p => p.type === "month")?.value || 0);
    const yyRaw = parts.find(p => p.type === "year")?.value || "0";
    const yy = Number(toEnglishDigits(yyRaw));
    const key = `${dd}-${mm}-${yy}`;
    
    if (key === target) return d;
    
    // حساب الفرق للعثور على أقرب تطابق
    const diff = Math.abs((yy - hy) * 360 + (mm - hm) * 30 + (dd - hd));
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMatch = d;
    }
    
    if (yy < hy || (yy === hy && mm < hm) || (yy === hy && mm === hm && dd < hd)) {
      lo = mid + 86400000;
    } else {
      hi = mid - 86400000;
    }
  }
  
  // إذا لم نجد تطابقاً تاماً، نرجع أقرب تطابق
  return bestMatch;
}

const gMonths = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];

const hMonths = [
  "محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة",
  "رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"
];

export default function DateConverter() {
  // حالة محوّل "ميلادي → هجري"
  const [gDay, setGDay] = useState("");
  const [gMonth, setGMonth] = useState("1");
  const [gYear, setGYear] = useState(String(new Date().getFullYear()));
  const [hResult, setHResult] = useState("");

  // حالة محوّل "هجري → ميلادي"
  const [hDay, setHDay] = useState("");
  const [hMonth, setHMonth] = useState("1");
  const [hYear, setHYear] = useState("");
  const [gResult, setGResult] = useState("");

  // تحويل فوري مع الكتابة (ميلادي -> هجري)
  useEffect(() => {
    const dd = Number(toEnglishDigits(gDay));
    const mm = Number(toEnglishDigits(gMonth));
    const yy = Number(toEnglishDigits(gYear));
    if (dd && mm && yy) {
      const d = new Date(yy, mm - 1, dd);
      // Validate the date (e.g., month/day range)
      if (d.getFullYear() === yy && d.getMonth() === mm - 1 && d.getDate() === dd) {
        setHResult(formatHijri(d));
      } else {
        setHResult("تاريخ ميلادي غير صالح");
      }
    } else {
      setHResult("");
    }
  }, [gDay, gMonth, gYear]);

  // تحويل فوري مع الكتابة (هجري -> ميلادي)
  useEffect(() => {
    const dd = Number(toEnglishDigits(hDay));
    const mm = Number(toEnglishDigits(hMonth));
    const yy = Number(toEnglishDigits(hYear));
    if (dd && mm && yy) {
      // Basic validation for Hijri date ranges
      if (dd >= 1 && dd <= 30 && mm >= 1 && mm <= 12 && yy > 0) {
        const d = hijriToGregorianExact(dd, mm, yy);
        setGResult(d ? d.toLocaleDateString("ar-SA") : "تعذر التحويل بدقة");
      } else {
        setGResult("تاريخ هجري غير صالح");
      }
    } else {
      setGResult("");
    }
  }, [hDay, hMonth, hYear]);

  const setTodayGregorian = () => {
    const now = new Date();
    setGDay(String(now.getDate()));
    setGMonth(String(now.getMonth() + 1));
    setGYear(String(now.getFullYear()));
  };

  const setTodayHijri = () => {
    const now = new Date();
    const { d, m, y } = hijriParts(now);
    if (d && m && y) {
      setHDay(String(d));
      setHMonth(String(m));
      setHYear(String(y));
    } else {
      // Fallback or error handling if hijriParts fails for today's date
      setHDay("");
      setHMonth("1");
      setHYear("");
    }
  };

  const copy = async (text) => {
    try {
      if (text && text !== "—" && !text.includes("غير صالح")) {
        await navigator.clipboard.writeText(text);
        alert("تم نسخ النص: " + text);
      } else {
        alert("لا يوجد نص صالح للنسخ.");
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("فشل النسخ.");
    }
  };

  const swapDirections = () => {
    // نقل النتائج بين الحقلين
    const dd = Number(toEnglishDigits(gDay));
    const mm = Number(toEnglishDigits(gMonth));
    const yy = Number(toEnglishDigits(gYear));
    
    // Convert current Gregorian input to Hijri and set Hijri input fields
    if (dd && mm && yy) {
      const gDate = new Date(yy, mm - 1, dd);
      // Validate the Gregorian date
      if (gDate.getFullYear() === yy && gDate.getMonth() === mm - 1 && gDate.getDate() === dd) {
        const { d, m, y } = hijriParts(gDate);
        if (d && m && y) {
          setHDay(String(d));
          setHMonth(String(m));
          setHYear(String(y));
        } else {
          // Clear Hijri inputs if conversion from Gregorian failed
          setHDay(""); setHMonth("1"); setHYear("");
        }
      } else {
        // Clear Hijri inputs if Gregorian input was invalid
        setHDay(""); setHMonth("1"); setHYear("");
      }
    } else {
        // Clear Hijri inputs if Gregorian input was empty
        setHDay(""); setHMonth("1"); setHYear("");
    }

    // Convert current Hijri result to Gregorian and set Gregorian input fields
    if (gResult && gResult !== "—" && !gResult.includes("غير صالح")) {
      const parts = gResult.split("/"); // SA format D/M/Y
      if (parts.length === 3) {
        setGDay(parts[0]);
        setGMonth(parts[1]);
        setGYear(parts[2]);
      } else {
        // Clear Gregorian inputs if gResult was malformed
        setGDay(""); setGMonth("1"); setGYear(String(new Date().getFullYear()));
      }
    } else {
        // Clear Gregorian inputs if gResult was empty or invalid
        setGDay(""); setGMonth("1"); setGYear(String(new Date().getFullYear()));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">محول التاريخ (هجري ↔ ميلادي)</h1>
            <p className="text-gray-600">أداة فورية تشبه الحاسبة لتحويل التاريخ بين الهجري والميلادي.</p>
          </div>
          <Button variant="outline" onClick={() => { setTodayGregorian(); setTodayHijri(); }} className="gap-2 shrink-0">
            <Clock className="w-4 h-4" /> اليوم (كلاهما)
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              محوّل فوري يشبه الحاسبة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ميلادي → هجري */}
              <div className="rounded-lg border p-4 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                  <h3 className="font-semibold text-lg">ميلادي → هجري</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={setTodayGregorian}>اليوم الميلادي</Button>
                    <Button size="sm" variant="outline" onClick={() => { setGDay(""); setGMonth("1"); setGYear(String(new Date().getFullYear())); setHResult(""); }}>مسح</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="اليوم" value={gDay} onChange={e => setGDay(toEnglishDigits(e.target.value))} inputMode="numeric" pattern="[0-9]*" />
                  <Select value={gMonth} onValueChange={setGMonth}>
                    <SelectTrigger><SelectValue placeholder="الشهر" /></SelectTrigger>
                    <SelectContent>
                      {gMonths.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="السنة" value={gYear} onChange={e => setGYear(toEnglishDigits(e.target.value))} inputMode="numeric" pattern="[0-9]*" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-3 py-2 bg-gray-50 rounded border flex-1 text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap">{hResult || "—"}</div>
                  <Button variant="outline" size="icon" onClick={() => copy(hResult)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* زر تبديل سريع على الشاشات الصغيرة */}
              <div className="md:hidden flex justify-center">
                <Button variant="ghost" onClick={swapDirections} className="gap-2">
                  <ArrowLeftRight className="w-4 h-4" /> تبديل
                </Button>
              </div>

              {/* هجري → ميلادي */}
              <div className="rounded-lg border p-4 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                  <h3 className="font-semibold text-lg">هجري → ميلادي</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={setTodayHijri}>اليوم الهجري</Button>
                    <Button size="sm" variant="outline" onClick={() => { setHDay(""); setHMonth("1"); setHYear(""); setGResult(""); }}>مسح</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="اليوم" value={hDay} onChange={e => setHDay(toEnglishDigits(e.target.value))} inputMode="numeric" pattern="[0-9]*" />
                  <Select value={hMonth} onValueChange={setHMonth}>
                    <SelectTrigger><SelectValue placeholder="الشهر" /></SelectTrigger>
                    <SelectContent>
                      {hMonths.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="السنة" value={hYear} onChange={e => setHYear(toEnglishDigits(e.target.value))} inputMode="numeric" pattern="[0-9]*" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-3 py-2 bg-gray-50 rounded border flex-1 text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap">{gResult || "—"}</div>
                  <Button variant="outline" size="icon" onClick={() => copy(gResult)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}