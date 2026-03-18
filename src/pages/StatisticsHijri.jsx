import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Statistic } from "@/entities/Statistic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";
import StatisticsUploader from "@/components/statistics/StatisticsUploader";
import MonthGrid from "@/components/statistics/MonthGrid";

function getCurrentHijriYear() {
  try {
    const df = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { year: 'numeric' });
    const raw = df.format(new Date()).replace(/[^\d\u0660-\u0669]/g, '');
    const latin = raw.replace(/[\u0660-\u0669]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    const num = parseInt(latin, 10);
    return isNaN(num) ? 1446 : num;
  } catch {
    return 1446;
  }
}

export default function StatisticsHijri() {
  const months = useMemo(() => ([
    { key: "m1", label: "محرم" }, { key: "m2", label: "صفر" }, { key: "m3", label: "ربيع أول" },
    { key: "m4", label: "ربيع آخر" }, { key: "m5", label: "جمادى الأولى" }, { key: "m6", label: "جمادى الآخرة" },
    { key: "m7", label: "رجب" }, { key: "m8", label: "شعبان" }, { key: "m9", label: "رمضان" },
    { key: "m10", label: "شوال" }, { key: "m11", label: "ذو القعدة" }, { key: "م12", label: "ذو الحجة" },
  ]), []);

  const [year, setYear] = useState(getCurrentHijriYear());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Statistic.filter({ period_type: "hijri", year });
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading statistics:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen p-2 md:p-4 lg:p-6 bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2 mobile-title">الإحصائيات الهجرية</h1>
            <p className="text-gray-600 text-xs md:text-sm lg:text-base mobile-text">ارفع، اعرض، وصدّر الإحصائيات شهرياً حسب السنة الهجرية.</p>
          </div>
          <div className="flex gap-2 w-full">
            <InputYear value={year} onChange={setYear} />
            <StatisticsUploader periodType="hijri" year={year} months={months} onUploaded={load} />
            <Button variant="outline" onClick={load} size="icon" className="h-11 w-11 touch-target">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b p-3 md:p-6">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-xl">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="mobile-title">أشهر السنة الهجرية ({year} هـ)</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-base mobile-text">افتح أي شهر للاطلاع على ملفاته وطباعتها وتصديرها.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-4 lg:p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-8 md:py-16">
                <RefreshCw className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 animate-spin text-purple-600" />
                <p className="text-sm md:text-lg mobile-text">جاري التحميل...</p>
              </div>
            ) : (
              <MonthGrid months={months} items={items} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// مُدخل بسيط لرقم السنة الهجرية
function InputYear({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-1 md:flex-initial">
      <span className="text-xs md:text-sm text-gray-600">السنة:</span>
      <input
        type="number"
        className="h-11 flex-1 md:w-28 rounded-md border px-2 text-right text-base touch-target"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}