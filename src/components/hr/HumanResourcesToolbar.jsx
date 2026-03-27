import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Award, X, MessageCircle, Printer } from 'lucide-react';
import ExportManager from '@/components/export/ExportManager';
import CustomExportManager from '@/components/export/CustomExportManager';

export default function HumanResourcesToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  exportEmployees,
  onOpenWhatsApp,
  onOpenBulkAssignment,
  onClearSelection,
  onPrint,
}) {
  return (
    <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-white/30 p-5 md:p-6 mb-6 no-print shadow-2xl">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="ابحث بالاسم، رقم الهوية، رقم الموظف، الجوال..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-12 h-12 text-base font-semibold bg-white/15 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/50 rounded-xl shadow-lg"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {selectedCount > 0 && (
            <>
              <Button variant="outline" onClick={onOpenWhatsApp} className="gap-2 bg-green-500/30 hover:bg-green-500/40 text-white font-bold border-green-400/50 rounded-xl shadow-lg">
                <MessageCircle className="w-4 h-4" />
                واتساب ({selectedCount})
              </Button>
              <Button variant="outline" onClick={onOpenBulkAssignment} className="gap-2 bg-white/15 border-white/30 text-white font-bold hover:bg-white/25 rounded-xl shadow-lg">
                <Award className="w-4 h-4" />
                تكليف ({selectedCount})
              </Button>
              <Button variant="outline" onClick={onClearSelection} size="icon" className="bg-red-500/30 border-red-400/50 text-white font-bold hover:bg-red-500/40 rounded-xl shadow-lg">
                <X className="w-4 h-4" />
              </Button>
            </>
          )}

          <ExportManager data={exportEmployees} filename="تقرير_الموظفين" />
          <CustomExportManager employees={exportEmployees} selectedCount={selectedCount} />

          <Button variant="outline" onClick={onPrint} className="bg-white/15 border-white/30 text-white font-bold hover:bg-white/25 rounded-xl shadow-lg">
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>
    </div>
  );
}