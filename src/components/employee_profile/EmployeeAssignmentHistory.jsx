import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, Calendar, MapPin, Eye } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const AssignmentStatusBadge = ({ assignment }) => {
  if (assignment.status === 'completed') {
    return <Badge className="bg-green-100 text-green-800">مُنهى</Badge>;
  }
  if (assignment.status === 'cancelled') {
    return <Badge className="bg-red-100 text-red-800">مُلغى</Badge>;
  }

  // التحقق من حالة التكليف بناءً على التواريخ
  const today = new Date();
  const startDate = new Date(assignment.start_date);
  const endDate = new Date(assignment.end_date);
  
  if (today >= startDate && today <= endDate) {
    return <Badge className="bg-blue-100 text-blue-800 animate-pulse">تكليف جاري</Badge>;
  }
  if (today > endDate) {
    return <Badge variant="secondary">منتهي</Badge>;
  }
  if (today < startDate) {
    return <Badge variant="outline">قادم</Badge>;
  }
  return <Badge variant="outline">نشط</Badge>;
};

const AssignmentItem = ({ assignment }) => {
  const duration = assignment.start_date && assignment.end_date 
    ? differenceInDays(new Date(assignment.end_date), new Date(assignment.start_date)) + 1
    : assignment.duration_days || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">
                تكليف إلى {assignment.assigned_to_health_center}
              </h4>
              <AssignmentStatusBadge assignment={assignment} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>من: {assignment.from_health_center}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>إلى: {assignment.assigned_to_health_center}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>من: {format(new Date(assignment.start_date), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>إلى: {format(new Date(assignment.end_date), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>المدة: {duration} يوم</span>
              </div>
              {assignment.assignment_type && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">النوع: {assignment.assignment_type}</span>
                </div>
              )}
            </div>
            
            {assignment.holiday_name && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">المناسبة: </span>
                <span className="text-sm text-gray-600">{assignment.holiday_name}</span>
              </div>
            )}
            
            {assignment.compensation_amount && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">التعويض: </span>
                <span className="text-sm text-gray-600">{assignment.compensation_amount} ريال</span>
              </div>
            )}
            
            {assignment.notes && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">ملاحظات: </span>
                <span className="text-sm text-gray-600">{assignment.notes}</span>
              </div>
            )}
            
            {assignment.completion_date && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">تاريخ الإنهاء: </span>
                <span className="text-sm text-gray-600">
                  {format(new Date(assignment.completion_date), 'dd/MM/yyyy', { locale: ar })}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link to={createPageUrl(`ViewAssignment?id=${assignment.id}`)}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 ml-1" />
                عرض التفاصيل
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EmployeeAssignmentHistory({ assignments }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchQuery.toLowerCase();
    return assignment.assigned_to_health_center?.toLowerCase().includes(searchLower) ||
           assignment.from_health_center?.toLowerCase().includes(searchLower) ||
           assignment.assignment_type?.toLowerCase().includes(searchLower) ||
           assignment.holiday_name?.toLowerCase().includes(searchLower) ||
           assignment.notes?.toLowerCase().includes(searchLower);
  });

  // ترتيب التكاليف بالأحدث أولاً
  const sortedAssignments = [...filteredAssignments].sort((a, b) => 
    new Date(b.start_date) - new Date(a.start_date)
  );

  // إحصائيات سريعة
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const activeAssignments = assignments.filter(a => {
    if (a.status === 'active') return true;
    const today = new Date();
    const startDate = new Date(a.start_date);
    const endDate = new Date(a.end_date);
    return today >= startDate && today <= endDate;
  }).length;
  const totalDays = assignments.reduce((sum, assignment) => {
    const duration = assignment.start_date && assignment.end_date 
      ? differenceInDays(new Date(assignment.end_date), new Date(assignment.start_date)) + 1
      : assignment.duration_days || 0;
    return sum + duration;
  }, 0);

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد تكاليف</h3>
        <p className="mt-1 text-sm text-gray-500">
          لم يتم تسجيل أي تكاليف لهذا الموظف بعد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalAssignments}</div>
            <div className="text-sm text-gray-500">إجمالي التكاليف</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedAssignments}</div>
            <div className="text-sm text-gray-500">مكتملة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{activeAssignments}</div>
            <div className="text-sm text-gray-500">جارية</div>
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
            placeholder="البحث في التكاليف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredAssignments.length} من {assignments.length} تكليف
        </div>
      </div>

      {/* قائمة التكاليف */}
      <div className="space-y-3">
        {sortedAssignments.map(assignment => (
          <AssignmentItem key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}