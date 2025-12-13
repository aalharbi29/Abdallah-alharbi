import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Briefcase, Award, Eye, Pin, MessageCircle, CheckSquare, Square, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

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
      {employees.map((employee) => {
        if (!employee || !employee.id) return null; // Ensure employee and ID exist

        const isPinned = pinnedEmployees.has(employee.id);
        const isSelected = selectedEmployees.has(employee.id);
        const activeHolidayAssignments = getEmployeeActiveHolidayAssignments(employee.id);
        const employeeRoles = getEmployeeRoles(employee);

        return (
          <Card
            key={employee.id}
            className={`hover:shadow-lg transition-all ${
              isPinned ? 'border-yellow-400 border-2 bg-yellow-50' : ''
            } ${
              isSelected ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Checkbox للتحديد */}
                {onToggleSelection && (
                  <div className="pt-1">
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
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-gray-100 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-100 flex items-center justify-center shadow-md">
                      <User className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <Link
                        to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}
                        className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {employee.full_name_arabic || 'غير محدد'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                        {employee.position && <span>{employee.position}</span>}
                        {employee.position && employee.المركز_الصحي && <span>•</span>}
                        {employee.المركز_الصحي && <span>{employee.المركز_الصحي}</span>}
                        {employee.contract_type && (employee.position || employee.المركز_الصحي) && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{employee.contract_type}</Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {onPinEmployee && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPinEmployee(employee.id)}
                          className={isPinned ? 'text-yellow-600' : 'text-gray-400'}
                        >
                          <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                        </Button>
                      )}

                      {employee.phone && (
                        <a
                          href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <Button variant="ghost" size="icon" className="text-green-600">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {employee.is_externally_assigned && (
                      <Badge className="bg-orange-100 text-orange-700">
                        مكلف خارجي {employee.external_assignment_center && `- ${employee.external_assignment_center}`}
                      </Badge>
                    )}

                    {activeHolidayAssignments.length > 0 && (
                      <Badge className="bg-purple-100 text-purple-700">
                        تكليف {activeHolidayAssignments[0].holiday_name}
                      </Badge>
                    )}

                    {employeeRoles.length > 0 && (
                      employeeRoles.slice(0, 2).map((role, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700">
                          {role}
                        </Badge>
                      ))
                    )}
                    {employeeRoles.length > 2 && (
                        <Badge className="bg-blue-50 text-blue-700 text-xs">
                          +{employeeRoles.length - 2}
                        </Badge>
                      )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                    {employee.رقم_الهوية && (
                      <div>
                        <span className="font-medium">السجل المدني:</span> {employee.رقم_الهوية}
                      </div>
                    )}
                    {employee.birth_date && (
                      <div>
                        <span className="font-medium">تاريخ الميلاد:</span> {employee.birth_date}
                      </div>
                    )}
                    {employee.hire_date && (
                      <div>
                        <span className="font-medium">تاريخ التعيين:</span> {employee.hire_date}
                      </div>
                    )}
                    {employee.phone && (
                      <div>
                        <span className="font-medium">الجوال:</span> {employee.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 ml-1" />
                        عرض الملف
                      </Button>
                    </Link>
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                    )}
                    {onAddLeave && (
                      <Button variant="outline" size="sm" onClick={() => onAddLeave(employee)}>
                        <Calendar className="w-3 h-3 ml-1" />
                        إجازة
                      </Button>
                    )}
                    {onAddAssignment && (
                      <Button variant="outline" size="sm" onClick={() => onAddAssignment(employee)}>
                        <Briefcase className="w-3 h-3 ml-1" />
                        تكليف
                      </Button>
                    )}
                    {onAddHolidayAssignment && (
                      <Button variant="outline" size="sm" onClick={() => onAddHolidayAssignment(employee)}>
                        <Award className="w-3 h-3 ml-1" />
                        تكليف إجازة
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(employee)}
                        className="text-red-600 hover:bg-red-50"
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