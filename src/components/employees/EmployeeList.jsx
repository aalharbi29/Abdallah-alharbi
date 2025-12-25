import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Briefcase, Award, Eye, Pin, MessageCircle, CheckSquare, Square, User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

export default function EmployeeList({
  employees,
  assignments,
  healthCenters = [], // Preserving default value from original code
  onEdit,
  onDelete,
  onAddLeave,
  onAddAssignment,
  onAddHolidayAssignment,
  pinnedEmployees = new Set(),
  onPinEmployee,
  selectedEmployees = new Set(),
  onToggleSelection
}) {
  const normalizePhoneForWhatsApp = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');

    // Saudi Arabia country code is 966
    if (digits.startsWith('966')) return digits;
    if (digits.startsWith('00966')) return digits.slice(2); // Remove leading 00
    if (digits.startsWith('0') && digits.length >= 9) return '966' + digits.slice(1); // Remove leading 0 and add 966
    if (digits.length === 9) return '966' + digits; // Assuming 9-digit number is local mobile, add 966

    return digits;
  };

  const getEmployeeActiveHolidayAssignments = (employeeId) => {
    if (!assignments || !Array.isArray(assignments)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day for accurate comparison

    return assignments.filter(a => {
      if (a.employee_record_id !== employeeId) return false;
      if (!a.holiday_name) return false;
      if (a.status === 'cancelled') return false;

      const startDate = new Date(a.start_date);
      const endDate = new Date(a.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // Normalize end date to end of day

      return today >= startDate && today <= endDate;
    });
  };

  const getEmployeeRoles = (employee) => {
    const roles = [];

    if (employee.special_roles && Array.isArray(employee.special_roles)) {
      roles.push(...employee.special_roles);
    }

    if (healthCenters && Array.isArray(healthCenters)) {
      healthCenters.forEach(center => {
        if (center.المدير === employee.id) {
          roles.push(`مدير ${center.اسم_المركز}`);
        }
        if (center.نائب_المدير === employee.id) {
          roles.push(`نائب مدير ${center.اسم_المركز}`);
        }
        if (center.المشرف_الفني === employee.id) {
          roles.push(`مشرف فني - ${center.اسم_المركز}`);
        }
      });
    }

    // Add general roles like 'Supervisor' if department indicates it
    if (employee.department && employee.department.includes('إشرافي')) {
      if (!roles.includes('مشرف')) { // Avoid duplicates if already a specific supervisor role
        roles.push('مشرف');
      }
    }

    // Add employee's main department as a role if it's not already covered by specific health center roles
    if (employee.department && employee.department.trim() !== '' && !roles.some(role => role.includes(employee.department))) {
      // Check if it's a specific health center department role
      const isSpecificCenterDept = healthCenters.some(center =>
        center.المركز_الصحي === employee.المركز_الصحي &&
        (center.المدير_قسم === employee.id || center.نائب_المدير_قسم === employee.id)
      );

      if (!isSpecificCenterDept) {
        roles.push(employee.department);
      }
    }


    return [...new Set(roles)]; // Ensure unique roles
  };

  if (!employees || employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-gray-500">
          <p>لا توجد موظفين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map((employee, idx) => {
        if (!employee || !employee.id) return null;

        const isPinned = pinnedEmployees.has(employee.id);
        const isSelected = selectedEmployees.has(employee.id);
        const activeHolidayAssignments = getEmployeeActiveHolidayAssignments(employee.id);
        const employeeRoles = getEmployeeRoles(employee);

        return (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card
              className={`bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all shadow-lg ${
                isPinned ? 'border-amber-400/50 bg-amber-500/10' : ''
              } ${
                isSelected ? 'ring-2 ring-indigo-400/50' : ''
              }`}
            >
            <CardContent className="p-2 md:p-3">
              <div className="flex items-start gap-2 md:gap-3">
                {/* Checkbox للتحديد */}
                {onToggleSelection && (
                  <div className="pt-0.5">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection(employee.id)}
                    />
                  </div>
                )}

                {/* الصورة الشخصية */}
                <div className="flex-shrink-0">
                  {employee.profile_image_url ? (
                    <img 
                      src={employee.profile_image_url} 
                      alt={employee.full_name_arabic || 'صورة الموظف'} 
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-100 flex items-center justify-center shadow-sm">
                      <User className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1">
                      <Link
                        to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}
                        className="text-sm md:text-base font-extrabold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {employee.full_name_arabic || 'غير محدد'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs font-semibold text-gray-600">
                        {employee.position && <span>{employee.position}</span>}
                        {employee.position && employee.المركز_الصحي && <span>•</span>}
                        {employee.المركز_الصحي && <span>{employee.المركز_الصحي}</span>}
                        {employee.contract_type && (employee.position || employee.المركز_الصحي) && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">{employee.contract_type}</Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-0.5 flex-shrink-0">
                      {onPinEmployee && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPinEmployee(employee.id)}
                          className={`h-7 w-7 ${isPinned ? 'text-yellow-600' : 'text-gray-400'}`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                        </Button>
                      )}

                      {employee.phone && (
                        <a
                          href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <Button variant="ghost" size="icon" className="text-green-600 h-7 w-7">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {employee.is_externally_assigned && (
                      <Badge className="bg-orange-100 text-orange-700 text-[10px] py-0 px-2 h-5 font-bold">
                        مكلف خارجي {employee.external_assignment_center && `- ${employee.external_assignment_center}`}
                      </Badge>
                    )}

                    {activeHolidayAssignments.length > 0 && (
                      <Badge className="bg-purple-100 text-purple-700 text-[10px] py-0 px-2 h-5 font-bold">
                        تكليف {activeHolidayAssignments[0].holiday_name}
                      </Badge>
                    )}

                    {employeeRoles.length > 0 && (
                      employeeRoles.slice(0, 2).map((role, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700 text-[10px] py-0 px-2 h-5 font-bold">
                          {role}
                        </Badge>
                      ))
                    )}
                    {employeeRoles.length > 2 && (
                        <Badge className="bg-blue-50 text-blue-700 text-[10px] py-0 px-2 h-5 font-bold">
                          +{employeeRoles.length - 2}
                        </Badge>
                      )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 text-[11px] font-bold text-gray-700 mb-2">
                    {employee.رقم_الموظف && (
                      <div>
                        <span className="font-extrabold text-gray-500">رقم الموظف:</span> {employee.رقم_الموظف}
                      </div>
                    )}
                    {employee.phone && (
                      <div>
                        <span className="font-extrabold text-gray-500">الجوال:</span> {employee.phone}
                      </div>
                    )}
                    {employee.رقم_الهوية && (
                      <div>
                        <span className="font-extrabold text-gray-500">السجل المدني:</span> {employee.رقم_الهوية}
                      </div>
                    )}
                    {employee.birth_date && (
                      <div>
                        <span className="font-extrabold text-gray-500">ت.الميلاد:</span> {employee.birth_date}
                      </div>
                    )}
                    {employee.hire_date && (
                      <div>
                        <span className="font-extrabold text-gray-500">ت.التعيين:</span> {employee.hire_date}
                      </div>
                    )}
                    {(employee.rank || employee.sequence) && (
                      <div>
                        <span className="font-extrabold text-gray-500">المرتبة/التسلسل:</span> {employee.rank}{employee.sequence && `/${employee.sequence}`}
                      </div>
                    )}
                    {(employee.level || employee.grade) && (
                      <div>
                        <span className="font-extrabold text-gray-500">المستوى/الدرجة:</span> {employee.level}{employee.grade && `/${employee.grade}`}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                        <Eye className="w-3 h-3 ml-1" />
                        عرض
                      </Button>
                    </Link>
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(employee)} className="h-7 text-[11px] px-2">
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                    )}
                    {onAddLeave && (
                      <Button variant="outline" size="sm" onClick={() => onAddLeave(employee)} className="h-7 text-[11px] px-2">
                        <Calendar className="w-3 h-3 ml-1" />
                        إجازة
                      </Button>
                    )}
                    {onAddAssignment && (
                      <Button variant="outline" size="sm" onClick={() => onAddAssignment(employee)} className="h-7 text-[11px] px-2">
                        <Briefcase className="w-3 h-3 ml-1" />
                        تكليف
                      </Button>
                    )}
                    {onAddHolidayAssignment && (
                      <Button variant="outline" size="sm" onClick={() => onAddHolidayAssignment(employee)} className="h-7 text-[11px] px-2">
                        <Award className="w-3 h-3 ml-1" />
                        تكليف إجازة
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(employee)}
                        className="text-red-600 hover:bg-red-50 h-7 text-[11px] px-2"
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}