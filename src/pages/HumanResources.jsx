import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Award, UserMinus } from "lucide-react";
import HRUnifiedSearch from "@/components/hr/HRUnifiedSearch";

/**
 * صفحة الموارد البشرية الجديدة (Hub):
 * - مربع بحث موحّد في الأعلى (ضمن كل فئات الموظفين).
 * - 4 بطاقات للوصول إلى الفئات: نشطون / مكلفون / متقاعدون / مستقيلون.
 */
const CATEGORIES = [
  {
    key: 'active',
    title: 'جميع الموظفين النشطين',
    description: 'استعراض وإدارة جميع الموظفين النشطين في المراكز',
    icon: Users,
    to: 'ActiveEmployees',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-300',
  },
  {
    key: 'assigned',
    title: 'الموظفون المكلفون',
    description: 'من تم تكليفهم خارج مراكزهم الأصلية',
    icon: Briefcase,
    to: 'AssignedEmployees',
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-300',
  },
  {
    key: 'retired',
    title: 'الموظفون المتقاعدون',
    description: 'من أُحيلوا إلى التقاعد',
    icon: Award,
    to: 'RetiredEmployees',
    gradient: 'from-purple-500 to-fuchsia-600',
    ring: 'ring-purple-300',
  },
  {
    key: 'resigned',
    title: 'الموظفون المستقيلون',
    description: 'من قدّموا استقالاتهم',
    icon: UserMinus,
    to: 'ResignedEmployees',
    gradient: 'from-rose-500 to-red-600',
    ring: 'ring-rose-300',
  },
];

export default function HumanResources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="text-center pt-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">الموارد البشرية</h1>
          <p className="text-white/70 text-sm md:text-base">ابحث عن أي موظف أو اختر إحدى الفئات</p>
        </div>

        <HRUnifiedSearch />

        <div>
          <h2 className="text-white font-semibold text-lg mb-3 text-center">فئات الموظفين</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.key} to={createPageUrl(cat.to)} className="group focus:outline-none">
                  <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1 group-hover:ring-4 ${cat.ring}`}>
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-br ${cat.gradient} p-5 md:p-6 flex flex-col items-center text-center text-white min-h-[160px] md:min-h-[200px] justify-center`}>
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Icon className="w-7 h-7 md:w-8 md:h-8" />
                        </div>
                        <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">{cat.title}</h3>
                        <p className="text-xs md:text-sm text-white/85 leading-snug">{cat.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}