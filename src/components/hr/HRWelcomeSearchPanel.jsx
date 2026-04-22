import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Sparkles } from 'lucide-react';

/**
 * لوحة ترحيبية تظهر عند دخول الموارد البشرية، بدلاً من تحميل قائمة
 * جميع الموظفين فوراً. تسمح بالبحث السريع أو استعراض الكل يدوياً.
 */
export default function HRWelcomeSearchPanel({
  searchQuery,
  onSearchChange,
  onShowAll,
  totalEmployees,
}) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
      <CardContent className="p-6 md:p-10">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg mb-4">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            ابحث عن موظف
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
            اكتب الاسم، رقم الموظف، الجوال، المركز، التخصص، الجنسية أو رقم الهوية.
            سيتم البحث فوراً في جميع بيانات الموظفين.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="مثال: محمد، 1234، 0555، طلال، طبيب، سعودي..."
              className="pr-12 h-14 text-base md:text-lg rounded-2xl border-2 border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Button
              onClick={onShowAll}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 h-12 px-6 rounded-xl border-2 hover:bg-slate-50"
            >
              <Users className="w-5 h-5 text-indigo-600" />
              <span>استعراض كافة الموظفين</span>
              {totalEmployees > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalEmployees}
                </span>
              )}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-500">
            {['الاسم', 'رقم الموظف', 'الجوال', 'المركز', 'التخصص', 'الجنسية', 'رقم الهوية', 'المؤهل'].map((h) => (
              <div key={h} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-center">
                {h}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}