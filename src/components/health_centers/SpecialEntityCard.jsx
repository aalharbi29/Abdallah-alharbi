import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

// بطاقة الكيانات الخاصة (شؤون/تموين/مختبر) التي لا تأتي من قاعدة البيانات
export default function SpecialEntityCard({ card }) {
  const Icon = card.icon;
  return (
    <Card className="relative overflow-hidden border-0 shadow-xl h-full min-h-[280px]">
      <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />
      <div className="absolute -top-14 -left-14 w-44 h-44 bg-white/15 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

      <CardContent className="relative p-6 text-white flex flex-col h-full">
        <div className="flex items-start justify-between mb-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-lg">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] font-bold">خاصة</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-2xl font-black mb-1.5 drop-shadow">{card.title}</h3>
          <p className="text-white/90 text-sm font-medium">{card.subtitle}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/80 font-semibold">
          بطاقة إدارية مميزة
        </div>
      </CardContent>
    </Card>
  );
}