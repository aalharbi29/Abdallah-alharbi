import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Briefcase, Award, Eye, Pin, MessageCircle, User, Phone, IdCard, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MobileEmployeeCard({
  employee,
  isPinned,
  isSelected,
  activeHolidayAssignments,
  employeeRoles,
  onEdit,
  onDelete,
  onAddLeave,
  onAddAssignment,
  onAddHolidayAssignment,
  onPinEmployee,
  onToggleSelection,
  normalizePhoneForWhatsApp,
}) {
  return (
    <Card className={`w-full overflow-hidden bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-indigo-900/70 border ${isSelected ? 'ring-2 ring-indigo-400 border-indigo-400' : isPinned ? 'border-amber-400' : 'border-white/15'} shadow-xl rounded-2xl`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2 shrink-0">
            {onToggleSelection && (
              <button
                onClick={() => onToggleSelection(employee.id)}
                className={`w-6 h-6 rounded-md border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-400' : 'border-white/30 bg-white/5'}`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-sm bg-white" />}
              </button>
            )}

            {employee.profile_image_url ? (
              <img
                src={employee.profile_image_url}
                alt={employee.full_name_arabic || 'صورة الموظف'}
                className="w-16 h-16 rounded-xl object-cover border border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-white/20 flex items-center justify-center">
                <User className="w-7 h-7 text-white/80" />
              </div>
            )}

            <div className="flex gap-1">
              {onPinEmployee && (
                <Button variant="ghost" size="icon" onClick={() => onPinEmployee(employee.id)} className={`h-7 w-7 rounded-md ${isPinned ? 'text-amber-300 bg-amber-500/20' : 'text-white/60 bg-white/5'}`}>
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                </Button>
              )}
              {employee.phone && (
                <a href={`https://wa.me/${normalizePhoneForWhatsApp(employee.phone)}?text=${encodeURIComponent(`مرحبا ${employee.full_name_arabic}`)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-emerald-400 bg-white/5">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)} className="block text-sm font-black text-white truncate">
                {employee.full_name_arabic || 'غير محدد'}
              </Link>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {employee.position && <Badge className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-200">{employee.position}</Badge>}
                {employee.المركز_الصحي && (
                  <Badge className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-200 max-w-full">
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{employee.المركز_الصحي}</span>
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-[11px] text-white/90 bg-black/10 rounded-2xl p-3 border border-white/10">
              {employee.رقم_الموظف && (
                <div className="flex items-center gap-2 min-w-0">
                  <IdCard className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span className="text-white/60 shrink-0">الرقم:</span>
                  <span className="truncate">{employee.رقم_الموظف}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="text-white/60 shrink-0">الجوال:</span>
                  <span className="truncate">{employee.phone}</span>
                </div>
              )}
              {employee.رقم_الهوية && (
                <div className="flex items-center gap-2 min-w-0">
                  <IdCard className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <span className="text-white/60 shrink-0">الهوية:</span>
                  <span className="truncate">{employee.رقم_الهوية}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {employee.is_externally_assigned && <Badge className="text-[10px] px-2 py-0.5 bg-amber-500 text-white">تكليف خارجي</Badge>}
              {activeHolidayAssignments.length > 0 && <Badge className="text-[10px] px-2 py-0.5 bg-purple-500 text-white">{activeHolidayAssignments[0].holiday_name}</Badge>}
              {employeeRoles.slice(0, 1).map((role, idx) => <Badge key={idx} className="text-[10px] px-2 py-0.5 bg-cyan-500 text-white">{role}</Badge>)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <Link to={createPageUrl(`EmployeeProfile?id=${employee.id}`)} className="col-span-2">
                <Button size="sm" className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-lg">
                  <Eye className="w-3.5 h-3.5 ml-1" />عرض الملف
                </Button>
              </Link>
              {onEdit && <Button size="sm" onClick={() => onEdit(employee)} className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-lg"><Edit className="w-3.5 h-3.5 ml-1" />تعديل</Button>}
              {onAddLeave && <Button size="sm" onClick={() => onAddLeave(employee)} className="h-8 text-xs bg-amber-600 hover:bg-amber-500 rounded-lg"><Calendar className="w-3.5 h-3.5 ml-1" />إجازة</Button>}
              {onAddAssignment && <Button size="sm" onClick={() => onAddAssignment(employee)} className="h-8 text-xs bg-purple-600 hover:bg-purple-500 rounded-lg"><Briefcase className="w-3.5 h-3.5 ml-1" />تكليف</Button>}
              {onAddHolidayAssignment && <Button size="sm" onClick={() => onAddHolidayAssignment(employee)} className="h-8 text-xs bg-pink-600 hover:bg-pink-500 rounded-lg"><Award className="w-3.5 h-3.5 ml-1" />تكليف إجازة</Button>}
              {onDelete && <Button size="sm" onClick={() => onDelete(employee)} className="col-span-2 h-8 text-xs bg-red-600 hover:bg-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5 ml-1" />حذف</Button>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}