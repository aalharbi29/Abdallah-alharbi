import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Briefcase, Award, Eye, Pin, MessageCircle, CheckSquare, Square, User, Sparkles, Phone, IdCard, CakeIcon, CalendarCheck, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white/40" />
            </div>
            <p className="text-white/60 text-xl font-bold">لا توجد موظفين</p>
            <p className="text-white/40 text-sm mt-2">قم بإضافة موظفين للبدء</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="space-y-3 md:space-y-5 overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
      {employees.map((employee, idx) => {
        if (!employee || !employee.id) return null;

        const isPinned = pinnedEmployees.has(employee.id);
        const isSelected = selectedEmployees.has(employee.id);
        const activeHolidayAssignments = getEmployeeActiveHolidayAssignments(employee.id);
        const employeeRoles = getEmployeeRoles(employee);

        return (
          <motion.div
            key={employee.id}
            variants={itemVariants}
            layout
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card
              className={`relative w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-indigo-900/60 backdrop-blur-2xl border transition-all duration-500 shadow-xl md:shadow-2xl hover:shadow-indigo-500/20 ${
                isPinned 
                  ? 'border-amber-400 bg-gradient-to-br from-amber-900/40 via-slate-800/80 to-amber-900/30 shadow-amber-500/20' 
                  : 'border-white/20 hover:border-indigo-400/60'
              } ${
                isSelected 
                  ? 'ring-4 ring-indigo-500/50 border-indigo-400 bg-gradient-to-br from-indigo-900/50 via-slate-800/80 to-indigo-900/40' 
                  : ''
              }`}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-indigo-600/5 group-hover:via-purple-600/5 group-hover:to-pink-600/5 transition-all duration-500 pointer-events-none" />
              
              {/* Animated border glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
              </div>

            <CardContent className="relative z-10 p-3 md:p-5 max-w-full overflow-hidden">
              <div className="flex items-start gap-3 md:gap-5 max-w-full overflow-hidden">
                {/* Checkbox للتحديد */}
                {onToggleSelection && (
                  <motion.div 
                    className="pt-2"
                    whileTap={{ scale: 0.9 }}
                  >
                    <div 
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/30' 
                          : 'border-white/30 hover:border-indigo-400 hover:bg-white/10'
                      }`}
                      onClick={() => onToggleSelection(employee.id)}
                    >
                      {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                    </div>
                  </motion.div>
                )}

                {/* الصورة الشخصية */}
                <motion.div 
                  className="flex-shrink-0 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {employee.profile_image_url ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-40" />
                      <img 
                        src={employee.profile_image_url} 
                        alt={employee.full_name_arabic || 'صورة الموظف'} 
                        className="relative w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover border-2 md:border-3 border-white/30 shadow-xl md:shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-30" />
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border-2 border-white/30 flex items-center justify-center shadow-2xl">
                        <User className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
                      </div>
                    </div>
                  )}
                  {isPinned && (
                    <motion.div 
                      className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-2 border-white/50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Pin className="w-3.5 h-3.5 text-white fill-current" />
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3 max-w-full overflow-hidden">
                    <div className="flex-1">
                      <Link
                        to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}
                        className="text-base md:text-xl font-black text-white hover:text-indigo-300 transition-all duration-300 flex items-center gap-1.5 md:gap-2 group/name"
                      >
                        <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text truncate max-w-full mobile-paragraph">{employee.full_name_arabic || 'غير محدد'}</span>
                        <Sparkles className="w-5 h-5 text-yellow-400 opacity-0 group-hover/name:opacity-100 transition-all duration-300 group-hover/name:rotate-12" />
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-2 max-w-full overflow-hidden">
                        {employee.position && (
                          <span className="text-xs md:text-sm font-bold text-indigo-300 bg-indigo-500/20 px-2.5 md:px-3 py-1 rounded-lg mobile-paragraph compact">{employee.position}</span>
                        )}
                        {employee.المركز_الصحي && (
                          <span className="flex items-center gap-1 text-xs md:text-sm font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 md:px-3 py-1 rounded-lg mobile-paragraph compact">
                            <Building2 className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">{employee.المركز_الصحي}</span>
                          </span>
                        )}
                        {employee.contract_type && (
                          <Badge className="text-[11px] md:text-xs py-1 px-2.5 md:px-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 text-purple-200 font-bold mobile-paragraph compact">
                            {employee.contract_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5 md:gap-2 w-full sm:w-auto flex-shrink-0 justify-start sm:justify-end">
                      {onPinEmployee && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPinEmployee(employee.id)}
                            className={`h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl transition-all duration-300 ${
                              isPinned 
                                ? 'text-amber-300 bg-gradient-to-br from-amber-500/30 to-orange-500/30 shadow-lg shadow-amber-500/20' 
                                : 'text-white/50 hover:text-amber-400 hover:bg-amber-500/20'
                            }`}
                          >
                            <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                          </Button>
                        </motion.div>
                      )}

                      {employee.phone && (
                        <motion.a
                          href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button variant="ghost" size="icon" className="text-emerald-400 hover:bg-gradient-to-br hover:from-emerald-500/30 hover:to-green-500/30 h-10 w-10 rounded-xl shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20 transition-all duration-300">
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </motion.a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                    {employee.is_externally_assigned && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-[11px] md:text-xs py-1 md:py-1.5 px-2.5 md:px-3 font-black shadow-xl shadow-orange-500/30 border border-orange-300/30 mobile-paragraph compact">
                          🌍 مكلف خارجي {employee.external_assignment_center && `- ${employee.external_assignment_center}`}
                        </Badge>
                      </motion.div>
                    )}

                    {activeHolidayAssignments.length > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                        <Badge className="bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 text-white text-[11px] md:text-xs py-1 md:py-1.5 px-2.5 md:px-3 font-black shadow-xl shadow-purple-500/30 border border-purple-300/30 mobile-paragraph compact">
                          🎯 {activeHolidayAssignments[0].holiday_name}
                        </Badge>
                      </motion.div>
                    )}

                    {employeeRoles.length > 0 && (
                      employeeRoles.slice(0, 2).map((role, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: "spring", delay: 0.1 * (idx + 1) }}
                        >
                          <Badge className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white text-[11px] md:text-xs py-1 md:py-1.5 px-2.5 md:px-3 font-bold shadow-lg shadow-blue-500/20 border border-blue-300/30 mobile-paragraph compact">
                            {role}
                          </Badge>
                        </motion.div>
                      ))
                    )}
                    {employeeRoles.length > 2 && (
                      <Badge className="bg-white/20 text-white text-[11px] md:text-xs py-1 md:py-1.5 px-2.5 md:px-3 font-bold border-2 border-white/30 backdrop-blur-sm">
                        +{employeeRoles.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 text-xs md:text-sm mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-br from-white/10 to-white/5 rounded-xl md:rounded-2xl border border-white/20 backdrop-blur-sm max-w-full overflow-hidden">
                    {employee.رقم_الموظف && (
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <IdCard className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">الرقم الوظيفي</span>
                          <span className="font-black text-white">{employee.رقم_الموظف}</span>
                        </div>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">الجوال</span>
                          <span className="font-black text-white break-all">{employee.phone}</span>
                        </div>
                      </div>
                    )}
                    {employee.رقم_الهوية && (
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <IdCard className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">الهوية</span>
                          <span className="font-black text-white break-all">{employee.رقم_الهوية}</span>
                        </div>
                      </div>
                    )}
                    {employee.birth_date && (
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <CakeIcon className="w-4 h-4 text-pink-400" />
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">الميلاد</span>
                          <span className="font-black text-white">{employee.birth_date}</span>
                        </div>
                      </div>
                    )}
                    {employee.hire_date && (
                      <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <CalendarCheck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">التعيين</span>
                          <span className="font-black text-white">{employee.hire_date}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 md:gap-2 max-w-full">
                    <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)} className="col-span-2 sm:col-span-1">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          className="h-10 text-sm px-4 font-black bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 border-0"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض الملف
                        </Button>
                      </motion.div>
                    </Link>
                    {onEdit && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          onClick={() => onEdit(employee)} 
                          className="h-10 text-sm px-4 font-bold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 border-0"
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </Button>
                      </motion.div>
                    )}
                    {onAddLeave && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          onClick={() => onAddLeave(employee)} 
                          className="h-10 text-sm px-4 font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30 border-0"
                        >
                          <Calendar className="w-4 h-4 ml-2" />
                          إجازة
                        </Button>
                      </motion.div>
                    )}
                    {onAddAssignment && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          onClick={() => onAddAssignment(employee)} 
                          className="h-10 text-sm px-4 font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-purple-500/30 border-0"
                        >
                          <Briefcase className="w-4 h-4 ml-2" />
                          تكليف
                        </Button>
                      </motion.div>
                    )}
                    {onAddHolidayAssignment && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          onClick={() => onAddHolidayAssignment(employee)} 
                          className="h-10 text-sm px-4 font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl shadow-lg shadow-pink-500/30 border-0"
                        >
                          <Award className="w-4 h-4 ml-2" />
                          تكليف إجازة
                        </Button>
                      </motion.div>
                    )}
                    {onDelete && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => onDelete(employee)}
                          className="h-10 text-sm px-4 font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/30 border-0"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        );
      })}
      </AnimatePresence>
    </motion.div>
  );
}