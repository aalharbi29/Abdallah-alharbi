import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

export default function CurrentLeaves({ leaves }) {
  const safeLeaves = React.useMemo(() => {
    if (!leaves) return [];
    if (!Array.isArray(leaves)) return [];
    return leaves.filter(leave => leave != null);
  }, [leaves]);

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      'إجازة سنوية': 'from-blue-500 to-cyan-500',
      'إجازة مرضية': 'from-red-500 to-rose-500',
      'إجازة أمومة': 'from-pink-500 to-rose-500',
      'إجازة طارئة': 'from-amber-500 to-orange-500',
      'إجازة بدون راتب': 'from-gray-500 to-slate-500'
    };
    return colors[leaveType] || 'from-gray-500 to-slate-500';
  };

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
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">الموظفون في إجازة</h3>
              <p className="text-white/50 text-xs">الإجازات الجارية</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
            <span className="text-amber-400 font-bold text-sm">{safeLeaves.length}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {safeLeaves.length > 0 ? (
            safeLeaves.slice(0, 8).map((leave, idx) => {
              if (!leave || !leave.id) return null;
              const remainingDays = getRemainingDays(leave.end_date);
              
              return (
                <motion.div 
                  key={leave.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="font-medium text-white text-sm">{leave.employee_name || 'غير محدد'}</span>
                    </div>
                    <div className={`px-2 py-1 bg-gradient-to-r ${getLeaveTypeColor(leave.leave_type)} rounded-full`}>
                      <span className="text-white text-xs font-medium">{leave.leave_type || 'غير محدد'}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-3 h-3" />
                      <span>
                        {leave.start_date ? format(new Date(leave.start_date), 'dd/MM') : '-'} 
                        {' ← '}
                        {leave.end_date ? format(new Date(leave.end_date), 'dd/MM') : '-'}
                      </span>
                    </div>
                    {remainingDays > 0 && (
                      <div className="text-amber-400 font-medium">
                        متبقي {remainingDays} {remainingDays === 1 ? 'يوم' : 'أيام'}
                      </div>
                    )}
                    {leave.health_center && (
                      <div className="flex items-center gap-1 text-white/40">
                        <MapPin className="w-3 h-3" />
                        <span>{leave.health_center}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">لا يوجد موظفون في إجازة</p>
            </div>
          )}
        </div>
        
        {safeLeaves.length > 8 && (
          <div className="text-center mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40">+{safeLeaves.length - 8} آخرين</p>
          </div>
        )}
      </div>
    </div>
  );
}