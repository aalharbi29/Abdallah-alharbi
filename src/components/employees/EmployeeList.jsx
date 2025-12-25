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
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-3 md:gap-4">
                {/* Checkbox للتحديد */}
                {onToggleSelection && (
                  <div className="pt-1">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-white/30 hover:border-indigo-400'
                    }`}
                    onClick={() => onToggleSelection(employee.id)}
                    >
                      {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}

                {/* الصورة الشخصية */}
                <div className="flex-shrink-0 relative group">
                  {employee.profile_image_url ? (
                    <img 
                      src={employee.profile_image_url} 
                      alt={employee.full_name_arabic || 'صورة الموظف'} 
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg group-hover:border-indigo-400 transition-all"
                    />
                  ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-2 border-white/20 flex items-center justify-center shadow-lg group-hover:border-indigo-400 transition-all">
                      <User className="w-7 h-7 md:w-8 md:h-8 text-indigo-400" />
                    </div>
                  )}
                  {isPinned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                      <Pin className="w-3 h-3 text-amber-900 fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <Link
                        to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}
                        className="text-base md:text-lg font-bold text-white hover:text-indigo-300 transition-colors flex items-center gap-2"
                      >
                        {employee.full_name_arabic || 'غير محدد'}
                        <Sparkles className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/60">
                        {employee.position && <span className="font-medium">{employee.position}</span>}
                        {employee.position && employee.المركز_الصحي && <span>•</span>}
                        {employee.المركز_الصحي && <span>{employee.المركز_الصحي}</span>}
                        {employee.contract_type && (
                          <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 border-white/30 text-white/70">
                            {employee.contract_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {onPinEmployee && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPinEmployee(employee.id)}
                          className={`h-8 w-8 rounded-xl ${isPinned ? 'text-amber-400 bg-amber-500/20' : 'text-white/40 hover:text-amber-400 hover:bg-amber-500/10'}`}
                        >
                          <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                        </Button>
                      )}

                      {employee.phone && (
                        <a
                          href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="text-emerald-400 hover:bg-emerald-500/20 h-8 w-8 rounded-xl">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {employee.is_externally_assigned && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] py-1 px-2 font-bold shadow-lg">
                        🌍 مكلف خارجي {employee.external_assignment_center && `- ${employee.external_assignment_center}`}
                      </Badge>
                    )}

                    {activeHolidayAssignments.length > 0 && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] py-1 px-2 font-bold shadow-lg">
                        🎯 {activeHolidayAssignments[0].holiday_name}
                      </Badge>
                    )}

                    {employeeRoles.length > 0 && (
                      employeeRoles.slice(0, 2).map((role, idx) => (
                        <Badge key={idx} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] py-1 px-2 font-bold shadow-md">
                          {role}
                        </Badge>
                      ))
                    )}
                    {employeeRoles.length > 2 && (
                      <Badge className="bg-white/20 text-white text-[10px] py-1 px-2 font-bold border border-white/30">
                        +{employeeRoles.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] mb-3 p-3 bg-white/5 rounded-xl">
                    {employee.رقم_الموظف && (
                      <div className="text-white/80">
                        <span className="text-white/50">رقم:</span> <span className="font-bold">{employee.رقم_الموظف}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="text-white/80">
                        <span className="text-white/50">جوال:</span> <span className="font-bold">{employee.phone}</span>
                      </div>
                    )}
                    {employee.رقم_الهوية && (
                      <div className="text-white/80">
                        <span className="text-white/50">هوية:</span> <span className="font-bold">{employee.رقم_الهوية}</span>
                      </div>
                    )}
                    {employee.birth_date && (
                      <div className="text-white/80">
                        <span className="text-white/50">ميلاد:</span> <span className="font-bold">{employee.birth_date}</span>
                      </div>
                    )}
                    {employee.hire_date && (
                      <div className="text-white/80">
                        <span className="text-white/50">تعيين:</span> <span className="font-bold">{employee.hire_date}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs px-3 bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 rounded-lg"
                      >
                        <Eye className="w-3 h-3 ml-1" />
                        عرض
                      </Button>
                    </Link>
                    {onEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(employee)} 
                        className="h-8 text-xs px-3 bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 rounded-lg"
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                    )}
                    {onAddLeave && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onAddLeave(employee)} 
                        className="h-8 text-xs px-3 bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-lg"
                      >
                        <Calendar className="w-3 h-3 ml-1" />
                        إجازة
                      </Button>
                    )}
                    {onAddAssignment && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onAddAssignment(employee)} 
                        className="h-8 text-xs px-3 bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 rounded-lg"
                      >
                        <Briefcase className="w-3 h-3 ml-1" />
                        تكليف
                      </Button>
                    )}
                    {onAddHolidayAssignment && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onAddHolidayAssignment(employee)} 
                        className="h-8 text-xs px-3 bg-pink-500/20 border-pink-500/30 text-pink-300 hover:bg-pink-500/30 rounded-lg"
                      >
                        <Award className="w-3 h-3 ml-1" />
                        إجازة
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(employee)}
                        className="h-8 text-xs px-3 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 rounded-lg"
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
          </motion.div>
        );
      })}
    </div>
  );
}