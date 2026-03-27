import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Building2, TrendingUp, RefreshCw, UserPlus } from 'lucide-react';

export default function HumanResourcesHeader({ employeesCount, filteredCount, isLoading, onRefresh, onAddEmployee }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mobile-stack-section">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur-lg opacity-50"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight leading-tight">الموارد البشرية</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                <Building2 className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-bold">{employeesCount} موظف</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/30 backdrop-blur-md rounded-full border border-emerald-400/50">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                <span className="text-emerald-200 text-sm font-bold">{filteredCount} معروض</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 no-print">
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-white/30 bg-white/10 text-white font-bold hover:bg-white/20 rounded-xl backdrop-blur-md shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            onClick={onAddEmployee}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-xl rounded-xl"
          >
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة موظف
          </Button>
        </div>
      </div>
    </div>
  );
}