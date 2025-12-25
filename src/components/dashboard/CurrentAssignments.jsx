import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ArrowLeft, Clock, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

export default function CurrentAssignments({ assignments }) {
  const safeAssignments = React.useMemo(() => {
    if (!assignments) return [];
    if (!Array.isArray(assignments)) return [];
    return assignments.filter(assignment => assignment != null);
  }, [assignments]);

  const getRemainingDays = (endDate) => {
    try {
      const today = new Date();
      const end = new Date(endDate);
      const remaining = differenceInDays(end, today);
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      return 0;
    }
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">التكليفات الجارية</h3>
              <p className="text-white/50 text-xs">التكليفات النشطة حالياً</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
            <span className="text-purple-400 font-bold text-sm">{safeAssignments.length}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {safeAssignments.length > 0 ? (
            safeAssignments.slice(0, 6).map((assignment, idx) => {
              if (!assignment || !assignment.id) return null;
              const remainingDays = getRemainingDays(assignment.end_date);
              
              return (
                <motion.div 
                  key={assignment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="font-medium text-white text-sm">{assignment.employee_name || 'غير محدد'}</span>
                    </div>
                    <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full">
                      <span className="text-white text-xs font-medium">تكليف</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-white/70">{assignment.from_health_center || '-'}</span>
                    <ArrowLeft className="w-3 h-3 text-purple-400" />
                    <span className="px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300 font-medium">{assignment.assigned_to_health_center || '-'}</span>
                  </div>
                  
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-3 h-3" />
                      <span>
                        {assignment.start_date ? format(new Date(assignment.start_date), 'dd/MM') : '-'} 
                        {' ← '}
                        {assignment.end_date ? format(new Date(assignment.end_date), 'dd/MM') : '-'}
                      </span>
                    </div>
                    {remainingDays > 0 && (
                      <div className="text-purple-400 font-medium">
                        متبقي {remainingDays} {remainingDays === 1 ? 'يوم' : 'أيام'}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">لا توجد تكليفات جارية</p>
            </div>
          )}
        </div>
        
        {safeAssignments.length > 6 && (
          <div className="text-center mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40">+{safeAssignments.length - 6} آخرين</p>
          </div>
        )}
      </div>
    </div>
  );
}