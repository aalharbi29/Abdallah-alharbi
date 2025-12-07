
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Statistic } from "@/entities/Statistic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw } from "lucide-react";
import StatisticsUploader from "@/components/statistics/StatisticsUploader";
import MonthGrid from "@/components/statistics/MonthGrid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StatisticsGregorian() {
  const months = useMemo(() => ([
    { key: "jan", label: "يناير" }, { key: "feb", label: "فبراير" }, { key: "mar", label: "مارس" },
    { key: "apr", label: "أبريل" }, { key: "may", label: "مايو" }, { key: "jun", label: "يونيو" },
    { key: "jul", label: "يوليو" }, { key: "aug", label: "أغسطس" }, { key: "sep", label: "سبتمبر" },
    { key: "oct", label: "أكتوبر" }, { key: "nov", label: "نوفمبر" }, { key: "dec", label: "ديسمبر" },
  ]), []);

  const [year, setYear] = useState(new Date().getFullYear());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const yearsList = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - 4 + i);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await Statistic.filter({ period_type: "gregorian", year });
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">الإحصائيات الميلادية</h1>
            <p className="text-gray-600 text-sm md:text-base">ارفع، اعرض، وصدّر الإحصائيات شهرياً حسب السنة.</p>
          </div>
          <div className="flex gap-2">
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[140px] h-11">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                {yearsList.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <StatisticsUploader periodType="gregorian" year={year} months={months} onUploaded={load} />
            <Button variant="outline" onClick={load} size="icon" className="h-11 w-11">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span>أشهر السنة ({year})</span>
            </CardTitle>
            <CardDescription className="text-base">افتح أي شهر للاطلاع على ملفاته وطباعتها وتصديرها.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-16">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-lg">جاري التحميل...</p>
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
