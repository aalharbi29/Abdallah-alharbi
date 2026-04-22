import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, CheckCircle2, ArrowLeft } from "lucide-react";

// بطاقة اختيار المجموعة (الشؤون) — تظهر في الشاشة الرئيسية
export default function GroupSelectorCard({ group, stats, onSelect }) {
  const Icon = group.icon;
  return (
    <button
      onClick={() => onSelect(group.id)}
      className="group text-right w-full focus:outline-none focus:ring-4 focus:ring-emerald-400/40 rounded-3xl"
    >
      <Card className={`relative overflow-hidden border-0 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl`}>
        {/* الخلفية التدرجية */}
        <div className={`absolute inset-0 bg-gradient-to-br ${group.color}`} />
        {/* أنماط زخرفية */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <CardContent className="relative p-8 md:p-10 text-white">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-xl">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold">فتح</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-lg">
            {group.title}
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-8 font-medium">
            {group.description}
          </p>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <Building2 className="w-5 h-5 mb-2 text-white/80" />
              <div className="text-2xl font-black">{stats.centersCount}</div>
              <div className="text-[11px] text-white/80 font-semibold">مركز صحي</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <Users className="w-5 h-5 mb-2 text-white/80" />
              <div className="text-2xl font-black">{stats.employeesCount}</div>
              <div className="text-[11px] text-white/80 font-semibold">موظف</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <CheckCircle2 className="w-5 h-5 mb-2 text-white/80" />
              <div className="text-2xl font-black">{stats.activeCount}</div>
              <div className="text-[11px] text-white/80 font-semibold">نشط</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}