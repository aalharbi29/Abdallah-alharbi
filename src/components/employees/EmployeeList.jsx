import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Briefcase, Award, Eye, Pin, MessageCircle, CheckSquare, User, Sparkles, Phone, IdCard, CakeIcon, CalendarCheck, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import MobileEmployeeCard from "./MobileEmployeeCard";

export default function EmployeeList({
  employees,
  assignments,
  healthCenters = [],
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
    if (!raw) return "";
    const digits = String(raw).replace(/\D/g, "");
    if (digits.startsWith("966")) return digits;
    if (digits.startsWith("00966")) return digits.slice(2);
    if (digits.startsWith("0") && digits.length >= 9) return "966" + digits.slice(1);
    if (digits.length === 9) return "966" + digits;
    return digits;
  };

  const getEmployeeActiveHolidayAssignments = (employeeId) => {
    if (!assignments || !Array.isArray(assignments)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return assignments.filter((a) => {
      if (a.employee_record_id !== employeeId) return false;
      if (!a.holiday_name) return false;
      if (a.status === "cancelled") return false;

      const startDate = new Date(a.start_date);
      const endDate = new Date(a.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return today >= startDate && today <= endDate;
    });
  };

  const getShortCenterName = (centerName) => {
    if (!centerName) return "";
    return String(centerName)
      .replace(/^مركز\s+صحي\s+/i, "")
      .replace(/^مركز\s+/i, "")
      .trim();
  };

  const getEmployeeRoles = (employee) => {
    const roles = [];

    if (healthCenters && Array.isArray(healthCenters)) {
      healthCenters.forEach((center) => {
        const centerName = getShortCenterName(center.اسم_المركز || center.المركز_الصحي || "");
        if (center.المدير === employee.id) roles.push(centerName ? `مدير ${centerName}` : "مدير");
        if (center.نائب_المدير === employee.id) roles.push(centerName ? `نائب مدير ${centerName}` : "نائب مدير");
        if (center.المشرف_الفني === employee.id) roles.push(centerName ? `مشرف ${centerName}` : "مشرف");
      });
    }

    if (employee.department && employee.department.includes("إشرافي") && !roles.includes("مشرف")) {
      roles.push("مشرف");
    }

    return [...new Set(roles)];
  };

  if (!employees || employees.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
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
    <motion.div className="overflow-x-hidden" variants={containerVariants} initial="hidden" animate="visible">
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {employees.map((employee) => {
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
                <div className="block md:hidden">
                  <MobileEmployeeCard
                    employee={employee}
                    isPinned={isPinned}
                    isSelected={isSelected}
                    activeHolidayAssignments={activeHolidayAssignments}
                    employeeRoles={employeeRoles}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddLeave={onAddLeave}
                    onAddAssignment={onAddAssignment}
                    onAddHolidayAssignment={onAddHolidayAssignment}
                    onPinEmployee={onPinEmployee}
                    onToggleSelection={onToggleSelection}
                    normalizePhoneForWhatsApp={normalizePhoneForWhatsApp}
                  />
                </div>

                <div className="hidden md:block lg:hidden h-full">
                  <Card
                    className={`relative h-full overflow-hidden bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-indigo-900/70 border shadow-xl rounded-2xl ${
                      isSelected ? "ring-2 ring-indigo-400 border-indigo-400" : isPinned ? "border-amber-400" : "border-white/15"
                    }`}
                  >
                    <CardContent className="p-4 h-full">
                      <div className="flex flex-col gap-3 h-full">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1.5 w-[82px] shrink-0">
                            {onToggleSelection && (
                              <button
                                onClick={() => onToggleSelection(employee.id)}
                                className={`w-6 h-6 rounded-md border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-400' : 'border-white/30 bg-white/5'}`}
                              >
                                {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                              </button>
                            )}

                            {employee.المركز_الصحي && (
                              <Badge className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-200 w-full justify-center text-center">
                                <span className="truncate max-w-[54px]">{getShortCenterName(employee.المركز_الصحي)}</span>
                              </Badge>
                            )}

                            {employee.contract_type && (
                              <Badge className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-200 w-full justify-center text-center">
                                {employee.contract_type}
                              </Badge>
                            )}
                          </div>

                          {employee.profile_image_url ? (
                            <img
                              src={employee.profile_image_url}
                              alt={employee.full_name_arabic || "صورة الموظف"}
                              className="w-18 h-18 rounded-xl object-cover border border-white/20 shrink-0"
                            />
                          ) : (
                            <div className="w-18 h-18 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-white/20 flex items-center justify-center shrink-0">
                              <User className="w-8 h-8 text-white/80" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)} className="block text-base font-black text-white leading-6">
                                  {employee.full_name_arabic || "غير محدد"}
                                </Link>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {employee.position && <Badge className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-200">{employee.position}</Badge>}
                                </div>
                              </div>

                              <div className="flex gap-1 shrink-0">
                                {onPinEmployee && (
                                  <Button variant="ghost" size="icon" onClick={() => onPinEmployee(employee.id)} className={`h-8 w-8 rounded-md ${isPinned ? 'text-amber-300 bg-amber-500/20' : 'text-white/60 bg-white/5'}`}>
                                    <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                                  </Button>
                                )}
                                {employee.phone && (
                                  <a href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-emerald-400 bg-white/5">
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-white/90 bg-black/10 rounded-2xl p-3 border border-white/10">
                              {employee.رقم_الموظف && <div className="truncate"><span className="text-white/60">الرقم:</span> {employee.رقم_الموظف}</div>}
                              {employee.phone && <div className="truncate"><span className="text-white/60">الجوال:</span> {employee.phone}</div>}
                              {employee.رقم_الهوية && <div className="truncate"><span className="text-white/60">الهوية:</span> {employee.رقم_الهوية}</div>}
                              {employee.hire_date && <div className="truncate"><span className="text-white/60">التعيين:</span> {employee.hire_date}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {employee.is_externally_assigned && <Badge className="text-[10px] px-2 py-0.5 bg-amber-500 text-white">تكليف خارجي</Badge>}
                          {activeHolidayAssignments.length > 0 && <Badge className="text-[10px] px-2 py-0.5 bg-purple-500 text-white">{activeHolidayAssignments[0].holiday_name}</Badge>}
                          {employeeRoles.slice(0, 2).map((role, idx) => <Badge key={idx} className="text-[10px] px-2 py-0.5 bg-cyan-500 text-white">{role}</Badge>)}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 mt-auto">
                          <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)} className="col-span-3">
                            <Button size="sm" className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-lg">
                              <Eye className="w-3.5 h-3.5 ml-1" />عرض الملف
                            </Button>
                          </Link>
                          {onEdit && <Button size="sm" onClick={() => onEdit(employee)} className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-lg"><Edit className="w-3.5 h-3.5 ml-1" />تعديل</Button>}
                          {onAddLeave && <Button size="sm" onClick={() => onAddLeave(employee)} className="h-8 text-xs bg-amber-600 hover:bg-amber-500 rounded-lg"><Calendar className="w-3.5 h-3.5 ml-1" />إجازة</Button>}
                          {onAddAssignment && <Button size="sm" onClick={() => onAddAssignment(employee)} className="h-8 text-xs bg-purple-600 hover:bg-purple-500 rounded-lg"><Briefcase className="w-3.5 h-3.5 ml-1" />تكليف</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="hidden lg:block h-full">
                  <Card
                    className={`relative h-full w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-indigo-900/60 backdrop-blur-2xl border transition-all duration-500 shadow-xl md:shadow-2xl hover:shadow-indigo-500/20 ${
                      isPinned
                        ? "border-amber-400 bg-gradient-to-br from-amber-900/40 via-slate-800/80 to-amber-900/30 shadow-amber-500/20"
                        : "border-white/20 hover:border-indigo-400/60"
                    } ${
                      isSelected
                        ? "ring-4 ring-indigo-500/50 border-indigo-400 bg-gradient-to-br from-indigo-900/50 via-slate-800/80 to-indigo-900/40"
                        : ""
                    }`}
                  >
                    <CardContent className="relative z-10 p-5 md:p-6 h-full max-w-full overflow-hidden">
                      <div className="flex flex-col gap-4 h-full max-w-full overflow-hidden">
                        <div className="flex items-start gap-4 md:gap-5 max-w-full overflow-hidden">
                          <div className="flex items-start gap-3 shrink-0">
                            <div className="flex flex-col items-center gap-2 w-[86px] md:w-[100px] shrink-0">
                              {onToggleSelection && (
                                <motion.div whileTap={{ scale: 0.9 }}>
                                  <div
                                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                                      isSelected
                                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/30"
                                        : "border-white/30 hover:border-indigo-400 hover:bg-white/10"
                                    }`}
                                    onClick={() => onToggleSelection(employee.id)}
                                  >
                                    {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                                  </div>
                                </motion.div>
                              )}

                              {employee.المركز_الصحي && (
                                <span className="flex items-center justify-center gap-1 text-[11px] md:text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg w-full mobile-paragraph compact">
                                  <Building2 className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[70px] md:max-w-[84px] text-center">
                                    {getShortCenterName(employee.المركز_الصحي)}
                                  </span>
                                </span>
                              )}

                              {employee.contract_type && (
                                <Badge className="text-[11px] md:text-xs py-1 px-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 text-purple-200 font-bold mobile-paragraph compact w-full justify-center text-center">
                                  {employee.contract_type}
                                </Badge>
                              )}
                            </div>

                            <motion.div
                              className="relative"
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {employee.profile_image_url ? (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-40" />
                                  <img
                                    src={employee.profile_image_url}
                                    alt={employee.full_name_arabic || "صورة الموظف"}
                                    className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover border-2 border-white/30 shadow-xl md:shadow-2xl"
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
                          </div>

                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-start justify-between gap-3 max-w-full overflow-hidden">
                              <div className="flex-1">
                                <Link
                                  to={createPageUrl(`EmployeeProfile?id=${employee.id}`)}
                                  className="block text-sm md:text-lg font-black text-white hover:text-indigo-300 transition-all duration-300"
                                >
                                  <div className="flex items-center gap-1.5 md:gap-2">
                                    <span className="text-white leading-7 md:leading-8 mobile-paragraph">
                                      {employee.full_name_arabic || "غير محدد"}
                                    </span>
                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0" />
                                  </div>
                                </Link>

                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-2 max-w-full overflow-hidden">
                                  {employee.position && (
                                    <span className="text-[11px] md:text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 md:px-3 py-1 rounded-lg mobile-paragraph compact">
                                      {employee.position}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                {employee.phone && (
                                  <motion.a
                                    href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button variant="ghost" size="icon" className="text-emerald-400 hover:bg-gradient-to-br hover:from-emerald-500/30 hover:to-green-500/30 h-9 w-9 md:h-10 md:w-10 rounded-xl shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20 transition-all duration-300">
                                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                  </motion.a>
                                )}
                                {onPinEmployee && (
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onPinEmployee(employee.id)}
                                      className={`h-9 w-9 md:h-10 md:w-10 rounded-xl transition-all duration-300 ${
                                        isPinned
                                          ? "text-amber-300 bg-gradient-to-br from-amber-500/30 to-orange-500/30 shadow-lg shadow-amber-500/20"
                                          : "text-white/50 hover:text-amber-400 hover:bg-amber-500/20"
                                      }`}
                                    >
                                      <Pin className={`w-4 h-4 md:w-5 md:h-5 ${isPinned ? "fill-current" : ""}`} />
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
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

                          {employeeRoles.length > 0 && employeeRoles.slice(0, 2).map((role, idx) => (
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
                          ))}

                          {employeeRoles.length > 2 && (
                            <Badge className="bg-white/20 text-white text-[11px] md:text-xs py-1 md:py-1.5 px-2.5 md:px-3 font-bold border-2 border-white/30 backdrop-blur-sm">
                              +{employeeRoles.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm p-4 md:p-5 bg-black/10 rounded-2xl border border-white/15 backdrop-blur-sm max-w-full overflow-hidden">
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

                        <div className="grid grid-cols-2 gap-2 max-w-full mt-auto pt-2 border-t border-white/10">
                          <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)} className="col-span-2 xl:col-span-1">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" className="w-full h-10 text-sm px-4 font-black bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 border-0">
                                <Eye className="w-4 h-4 ml-2" />
                                عرض الملف
                              </Button>
                            </motion.div>
                          </Link>

                          {onEdit && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" onClick={() => onEdit(employee)} className="w-full h-10 text-sm px-4 font-bold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 border-0">
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل
                              </Button>
                            </motion.div>
                          )}

                          {onAddLeave && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" onClick={() => onAddLeave(employee)} className="w-full h-10 text-sm px-4 font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30 border-0">
                                <Calendar className="w-4 h-4 ml-2" />
                                إجازة
                              </Button>
                            </motion.div>
                          )}

                          {onAddAssignment && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" onClick={() => onAddAssignment(employee)} className="w-full h-10 text-sm px-4 font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-purple-500/30 border-0">
                                <Briefcase className="w-4 h-4 ml-2" />
                                تكليف
                              </Button>
                            </motion.div>
                          )}

                          {onAddHolidayAssignment && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" onClick={() => onAddHolidayAssignment(employee)} className="w-full h-10 text-sm px-4 font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl shadow-lg shadow-pink-500/30 border-0">
                                <Award className="w-4 h-4 ml-2" />
                                تكليف إجازة
                              </Button>
                            </motion.div>
                          )}

                          {onDelete && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" onClick={() => onDelete(employee)} className="w-full h-10 text-sm px-4 font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/30 border-0">
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}