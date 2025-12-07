import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function CurrentLeaves({ leaves }) {
  // حماية قوية ضد البيانات المفقودة
  const safeLeaves = React.useMemo(() => {
    if (!leaves) return [];
    if (!Array.isArray(leaves)) return [];
    return leaves.filter(leave => leave != null);
  }, [leaves]);

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      'إجازة سنوية': 'bg-blue-100 text-blue-800',
      'إجازة مرضية': 'bg-red-100 text-red-800',
      'إجازة أمومة': 'bg-pink-100 text-pink-800',
      'إجازة طارئة': 'bg-yellow-100 text-yellow-800',
      'إجازة بدون راتب': 'bg-gray-100 text-gray-800'
    };
    return colors[leaveType] || 'bg-gray-100 text-gray-800';
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
    <Card className="shadow-md h-full mobile-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg mobile-title">
          <Calendar className="text-orange-600 w-4 h-4 md:w-5 md:h-5" />
          <span>الموظفون في الإجازة</span>
          <Badge variant="secondary" className="text-xs">{safeLeaves.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {safeLeaves.length > 0 ? (
            safeLeaves.slice(0, 8).map((leave) => {
              // حماية إضافية داخل map
              if (!leave || !leave.id) return null;

              const remainingDays = getRemainingDays(leave.end_date);
              
              return (
                <div key={leave.id} className="p-3 bg-white border border-orange-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm mobile-text">{leave.employee_name || 'غير محدد'}</span>
                    </div>
                    <Badge className={`text-xs ${getLeaveTypeColor(leave.leave_type)}`}>
                      {leave.leave_type || 'غير محدد'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1 mobile-text">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        من {leave.start_date ? format(new Date(leave.start_date), 'dd/MM/yyyy') : 'غير محدد'} 
                        إلى {leave.end_date ? format(new Date(leave.end_date), 'dd/MM/yyyy') : 'غير محدد'}
                      </span>
                    </div>
                    {remainingDays > 0 && (
                      <div className="text-orange-600 font-medium">
                        متبقي {remainingDays} {remainingDays === 1 ? 'يوم' : 'أيام'}
                      </div>
                    )}
                  </div>
                  
                  {leave.health_center && (
                    <div className="text-xs text-gray-500 mt-1 mobile-text">
                      📍 {leave.health_center}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm mobile-text">لا يوجد موظفون في إجازة حالياً</p>
            </div>
          )}
        </div>
        
        {safeLeaves.length > 8 && (
          <div className="text-center mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mobile-text">
              وهناك {safeLeaves.length - 8} موظف آخر في إجازة
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}