import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ArrowRight, Clock, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function CurrentAssignments({ assignments }) {
  // حماية قوية ضد البيانات المفقودة
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

  const getAssignmentTypeColor = (assignmentType) => {
    const colors = {
      'تكليف داخلي - مؤقت': 'bg-blue-100 text-blue-800',
      'تكليف إجازة عيد الفطر': 'bg-green-100 text-green-800',
      'تكليف إجازة عيد الأضحى': 'bg-purple-100 text-purple-800'
    };
    return colors[assignmentType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="shadow-md h-full mobile-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg mobile-title">
          <Briefcase className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
          <span>التكليفات الجارية</span>
          <Badge variant="secondary" className="text-xs">{safeAssignments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {safeAssignments.length > 0 ? (
            safeAssignments.slice(0, 6).map((assignment) => {
              // حماية إضافية داخل map
              if (!assignment || !assignment.id) return null;

              const remainingDays = getRemainingDays(assignment.end_date);
              
              return (
                <div key={assignment.id} className="p-3 bg-white border border-blue-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm mobile-text">{assignment.employee_name || 'غير محدد'}</span>
                    </div>
                    <Badge className={`text-xs ${getAssignmentTypeColor(assignment.assignment_type)}`}>
                      تكليف
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 mobile-text">
                    <span className="bg-gray-100 px-2 py-1 rounded">{assignment.from_health_center || 'غير محدد'}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="bg-blue-50 px-2 py-1 rounded font-medium">{assignment.assigned_to_health_center || 'غير محدد'}</span>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1 mobile-text">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        من {assignment.start_date ? format(new Date(assignment.start_date), 'dd/MM/yyyy') : 'غير محدد'} 
                        إلى {assignment.end_date ? format(new Date(assignment.end_date), 'dd/MM/yyyy') : 'غير محدد'}
                      </span>
                    </div>
                    {remainingDays > 0 && (
                      <div className="text-blue-600 font-medium">
                        متبقي {remainingDays} {remainingDays === 1 ? 'يوم' : 'أيام'}
                      </div>
                    )}
                    {assignment.duration_days && (
                      <div className="text-gray-500">
                        مدة التكليف: {assignment.duration_days} {assignment.duration_days === 1 ? 'يوم' : 'أيام'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm mobile-text">لا توجد تكليفات جارية حالياً</p>
            </div>
          )}
        </div>
        
        {safeAssignments.length > 6 && (
          <div className="text-center mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mobile-text">
              وهناك {safeAssignments.length - 6} تكليف آخر جاري
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}