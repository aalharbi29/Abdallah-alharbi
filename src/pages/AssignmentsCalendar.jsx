import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, Eye } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssignmentsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Filters
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterCenter, setFilterCenter] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load data separately to avoid timeout on large datasets
      const assignmentsData = await base44.entities.Assignment.filter(
        { status: 'active', approval_status: 'approved' }, 
        '-start_date', 
        100
      );
      setAssignments(assignmentsData || []);
      
      // Load employees and centers with limits
      const [employeesData, centersData] = await Promise.all([
        base44.entities.Employee.list('-created_date', 200),
        base44.entities.HealthCenter.list('-created_date', 50)
      ]);
      setEmployees(employeesData || []);
      setHealthCenters(centersData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays on error to prevent UI issues
      setAssignments([]);
      setEmployees([]);
      setHealthCenters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filterEmployee !== "all" && assignment.employee_record_id !== filterEmployee) return false;
    if (filterCenter !== "all" && assignment.assigned_to_health_center !== filterCenter) return false;
    if (filterType !== "all" && assignment.assignment_type !== filterType) return false;
    return true;
  });

  const getAssignmentsForDay = (day) => {
    return filteredAssignments.filter(assignment => {
      if (!assignment.start_date || !assignment.end_date) return false;
      try {
        const start = parseISO(assignment.start_date);
        const end = parseISO(assignment.end_date);
        return isWithinInterval(day, { start, end });
      } catch {
        return false;
      }
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 6 }); // Saturday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const assignmentTypes = [...new Set(assignments.map(a => a.assignment_type).filter(Boolean))];

  const getStatusForDay = (day) => {
    const dayAssignments = getAssignmentsForDay(day);
    if (dayAssignments.length === 0) return null;
    
    const today = new Date();
    const hasOngoing = dayAssignments.some(a => {
      const start = parseISO(a.start_date);
      const end = parseISO(a.end_date);
      return isWithinInterval(today, { start, end });
    });
    
    if (hasOngoing) return 'ongoing';
    if (day < today) return 'past';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    if (status === 'ongoing') return 'bg-blue-100 border-blue-400';
    if (status === 'upcoming') return 'bg-green-100 border-green-400';
    if (status === 'past') return 'bg-gray-100 border-gray-300';
    return '';
  };

  if (isLoading) {
    return <div className="p-6 text-center">جاري تحميل التقويم...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            تقويم التكاليف
          </h1>
          <p className="text-sm text-gray-600">عرض جميع التكاليف بشكل زمني منظم</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              تصفية التكاليف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">الموظف</label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الموظفين" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الموظفين</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name_arabic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">المركز</label>
                <Select value={filterCenter} onValueChange={setFilterCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المراكز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المراكز</SelectItem>
                    {healthCenters.map(center => (
                      <SelectItem key={center.id} value={center.اسم_المركز}>
                        {center.اسم_المركز}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">نوع التكليف</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {assignmentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex gap-4 mb-4 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400"></div>
            <span className="text-sm">تكليف جاري</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400"></div>
            <span className="text-sm">تكليف قادم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300"></div>
            <span className="text-sm">تكليف منتهي</span>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {format(currentMonth, 'MMMM yyyy', { locale: ar })}
          </h2>
          <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(day => (
                <div key={day} className="text-center font-bold text-sm py-2 text-gray-700">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, index) => {
                const dayAssignments = getAssignmentsForDay(day);
                const status = getStatusForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      relative min-h-20 p-2 rounded-lg border-2 transition-all
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${isToday ? 'border-blue-600 font-bold' : 'border-gray-200'}
                      ${status ? getStatusColor(status) : ''}
                      hover:shadow-md
                    `}
                  >
                    <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                      {format(day, 'd')}
                    </div>
                    {dayAssignments.length > 0 && (
                      <Badge className="mt-1 text-xs" variant="secondary">
                        {dayAssignments.length}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Assignments */}
        {selectedDay && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                التكاليف في {format(selectedDay, 'EEEE، d MMMM yyyy', { locale: ar })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getAssignmentsForDay(selectedDay).length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد تكاليف في هذا اليوم</p>
              ) : (
                <div className="space-y-3">
                  {getAssignmentsForDay(selectedDay).map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{assignment.employee_name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>الوظيفة:</strong> {assignment.employee_position}</p>
                            <p><strong>من:</strong> {assignment.from_health_center}</p>
                            <p><strong>إلى:</strong> {assignment.assigned_to_health_center}</p>
                            <p><strong>المدة:</strong> {format(parseISO(assignment.start_date), 'dd/MM/yyyy')} - {format(parseISO(assignment.end_date), 'dd/MM/yyyy')} ({assignment.duration_days} يوم)</p>
                            {assignment.assignment_type && (
                              <Badge className="mt-2">{assignment.assignment_type}</Badge>
                            )}
                          </div>
                        </div>
                        <Link to={createPageUrl(`ViewAssignment?id=${assignment.id}`)}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 ml-2" />
                            عرض
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>التكاليف النشطة والقادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAssignments
                .filter(a => a.end_date && parseISO(a.end_date) >= new Date())
                .sort((a, b) => parseISO(a.start_date) - parseISO(b.start_date))
                .map(assignment => {
                  const start = parseISO(assignment.start_date);
                  const end = parseISO(assignment.end_date);
                  const today = new Date();
                  const isOngoing = isWithinInterval(today, { start, end });
                  const isUpcoming = start > today;

                  return (
                    <div key={assignment.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className={`w-3 h-3 rounded-full ${isOngoing ? 'bg-blue-500 animate-pulse' : isUpcoming ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{assignment.employee_name}</h4>
                          <Badge variant={isOngoing ? 'default' : 'outline'} className={isOngoing ? 'bg-blue-500' : ''}>
                            {isOngoing ? 'جاري' : 'قادم'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {assignment.assigned_to_health_center} • {format(start, 'dd MMM', { locale: ar })} - {format(end, 'dd MMM yyyy', { locale: ar })}
                        </p>
                      </div>
                      <Link to={createPageUrl(`ViewAssignment?id=${assignment.id}`)}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 ml-2" />
                          عرض
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              {filteredAssignments.filter(a => a.end_date && parseISO(a.end_date) >= new Date()).length === 0 && (
                <p className="text-center text-gray-500 py-8">لا توجد تكاليف نشطة أو قادمة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}