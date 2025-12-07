import React, { useMemo, useState } from "react";
import MonthCard from "./MonthCard";
import MonthDetailDialog from "./MonthDetailDialog";

export default function MonthGrid({ months, items }) {
  const [openMonth, setOpenMonth] = useState(null);

  const grouped = useMemo(() => {
    const byMonth = new Map();
    
    // التحقق من صحة البيانات
    if (!months || !Array.isArray(months) || months.length === 0) {
      return byMonth;
    }
    
    // إنشاء مجموعات فارغة لكل شهر
    months.forEach((m, idx) => {
      if (m) {
        byMonth.set(idx + 1, []);
      }
    });
    
    // توزيع العناصر على الأشهر
    const safeItems = Array.isArray(items) ? items : [];
    safeItems.forEach((it) => {
      if (it && it.month_number) {
        const key = Number(it.month_number);
        if (byMonth.has(key)) {
          byMonth.get(key).push(it);
        }
      }
    });
    
    return byMonth;
  }, [items, months]);

  // التحقق بعد استدعاء الـ hooks
  if (!months || !Array.isArray(months) || months.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        لا توجد بيانات أشهر لعرضها
      </div>
    );
  }

  const monthItems = (mIndex) => grouped.get(mIndex) || [];
  
  // الحصول على اسم الشهر للـ dialog
  const getMonthLabel = (monthIndex) => {
    if (!monthIndex || monthIndex < 1 || monthIndex > months.length) {
      return '';
    }
    const month = months[monthIndex - 1];
    return month ? (month.label || month.name || '') : '';
  };

  const monthLabel = openMonth ? getMonthLabel(openMonth) : '';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m, idx) => {
          if (!m) return null;
          
          const i = idx + 1;
          const count = monthItems(i).length;
          
          return (
            <MonthCard
              key={m.key || idx}
              month={m}
              items={monthItems(i)}
              onClick={() => setOpenMonth(i)}
            />
          );
        })}
      </div>

      {openMonth && (
        <MonthDetailDialog
          monthLabel={monthLabel}
          items={monthItems(openMonth)}
          open={!!openMonth}
          onOpenChange={() => setOpenMonth(null)}
          onRefresh={() => window.location.reload()}
        />
      )}
    </>
  );
}