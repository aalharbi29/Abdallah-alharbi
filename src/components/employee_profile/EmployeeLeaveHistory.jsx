import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Clock, CheckCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

const LeaveStatusBadge = ({ leave }) => {
  if (leave.mubashara_date) {
    return <Badge className="bg-blue-100 text-blue-800">تمت المباشرة</Badge>;
  }
  
  const today = new Date();
  const startDate = new Date(leave.start_date);
  const endDate = new Date(leave.end_date);
  
  if (today >= startDate && today <= endDate) {
    return <Badge className="bg-green-100 text-green-800 animate-pulse">إجازة جارية</Badge>;
  }
  if (today > endDate) {
    return <Badge variant="secondary">منتهية</Badge>;
  }
  if (today < startDate) {
    return <Badge variant="outline">قادمة</Badge>;
  }
  return <Badge variant="outline">غير محدد</Badge>;
};

const LeaveItem = ({ leave }) => {
  const duration = leave.start_date && leave.end_date 
    ? differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1
    : leave.days_count || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{leave.leave_type}</h4>
              <LeaveStatusBadge leave={leave} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>من: {format(new Date(leave.start_date), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>إلى: {format(new Date(leave.end_date), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>المدة: {duration} يوم</span>
              </div>
              {leave.mubashara_date && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>المباشرة: {format(new Date(leave.mubashara_date), 'dd/MM/yyyy', { locale: ar })}</span>
                </div>
              )}
            </div>
            
            {leave.reason && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">السبب: </span>
                <span className="text-sm text-gray-600">{leave.reason}</span>
              </div>
            )}
            
            {leave.notes && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">ملاحظات: </span>
                <span className="text-sm text-gray-600">{leave.notes}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EmployeeLeaveHistory({ leaves }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaves = leaves.filter(leave => {
    const searchLower = searchQuery.toLowerCase();
    return leave.leave_type?.toLowerCase().includes(searchLower) ||
           leave.reason?.toLowerCase().includes(searchLower) ||
           leave.notes?.toLowerCase().includes(searchLower);
  });

  // ترتيب الإجازات بالأحدث أولاً
  const sortedLeaves = [...filteredLeaves].sort((a, b) => 
    new Date(b.start_date) - new Date(a.start_date)
  );

  // إحصائيات سريعة
  const totalLeaves = leaves.length;
  const completedLeaves = leaves.filter(l => l.mubashara_date || l.status === 'completed').length;
  const totalDays = leaves.reduce((sum, leave) => {
    const duration = leave.start_date && leave.end_date 
      ? differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1
      : leave.days_count || 0;
    return sum + duration;
  }, 0);

  if (leaves.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد إجازات</h3>
        <p className="mt-1 text-sm text-gray-500">
          لم يتم تسجيل أي إجازات لهذا الموظف بعد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalLeaves}</div>
            <div className="text-sm text-gray-500">إجمالي الإجازات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedLeaves}</div>
            <div className="text-sm text-gray-500">إجازات مكتملة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalDays}</div>
            <div className="text-sm text-gray-500">إجمالي الأيام</div>
          </CardContent>
        </Card>
      </div>

      {/* شريط البحث */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="البحث في الإجازات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredLeaves.length} من {leaves.length} إجازة
        </div>
      </div>

      {/* قائمة الإجازات */}
      <div className="space-y-3">
        {sortedLeaves.map(leave => (
          <LeaveItem key={leave.id} leave={leave} />
        ))}
      </div>
    </div>
  );
}