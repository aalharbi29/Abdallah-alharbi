
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, PlayCircle, Edit, Phone, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const roleLabels = {
    manager: "مدير مركز",
    deputy: "نائب مدير",
    technical_supervisor: "مشرف فني",
    nursing_supervisor: "مشرف تمريض",
    quality_supervisor: "مشرف الجودة",
    safety_supervisor: "مشرف الأمن والسلامة",
    infection_control_supervisor: "مشرف مكافحة العدوى",
    infection_control_coordinator: "منسق مكافحة العدوى",
    school_health_coordinator: "منسق الصحة المدرسية",
    school_health_supervisor: "مشرف الصحة المدرسية"
};

const EmployeeListForCenter = ({ 
    employees = [], 
    leaves = [], 
    onAddLeave, 
    onMubashara, 
    onAddAssignment, 
    onEdit
}) => {

    const safeEmployees = Array.isArray(employees) ? employees : [];
    const safeLeaves = Array.isArray(leaves) ? leaves : [];

    const isEmployeeOnLeave = (employeeId) => {
        if (!employeeId) return false;
        const today = new Date();
        return safeLeaves.some(leave =>
            leave &&
            leave.employee_id === employeeId &&
            !leave.mubashara_date &&
            new Date(leave.start_date) <= today &&
            new Date(leave.end_date) >= today
        );
    };

    if (safeEmployees.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                لا يوجد موظفين في هذا المركز حالياً
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>الموظف</TableHead>
                            <TableHead>رقم الموظف</TableHead>
                            <TableHead>بيانات التواصل</TableHead>
                            <TableHead>نوع الخدمة</TableHead>
                            <TableHead>المسمى الوظيفي</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead className="text-center no-print">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {safeEmployees.map(employee => {
                            if (!employee) return null;
                            const onLeave = isEmployeeOnLeave(employee.رقم_الموظف);
                            const safeSpecialRoles = Array.isArray(employee.special_roles) ? employee.special_roles : [];
                            
                            return (
                                <TableRow key={employee.id} className={onLeave ? "bg-red-50 border-red-200" : ""}>
                                    <TableCell>
                                        <div className="font-medium">{employee.full_name_arabic || "غير محدد"}</div>
                                        {employee.رقم_الهوية && <div className="text-sm text-gray-500">هوية: {employee.رقم_الهوية}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{employee.رقم_الموظف || "غير محدد"}</div>
                                    </TableCell>
                                    <TableCell>
                                        {employee.phone && <div className="flex items-center gap-2 text-sm mb-1"><Phone className="w-4 h-4 text-gray-400" /> {employee.phone}</div>}
                                        {employee.email && <div className="flex items-center gap-2 text-sm text-blue-600"><Mail className="w-4 h-4 text-gray-400" /> {employee.email}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{employee.contract_type || "غير محدد"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{employee.position || "غير محدد"}</div>
                                        {safeSpecialRoles.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {safeSpecialRoles.map(role => (
                                                    <Badge key={role} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                        {roleLabels[role] || role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={employee.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {employee.status || "غير محدد"}
                                        </Badge>
                                        {onLeave && (
                                            <Badge className="bg-red-500 text-white animate-pulse mt-1 block w-fit">
                                                في إجازة
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center no-print">
                                        <div className="flex items-center justify-center gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => onEdit && onEdit(employee)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>تعديل بيانات الموظف</p></TooltipContent>
                                            </Tooltip>
                                            
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => onAddLeave && onAddLeave(employee)}
                                                    >
                                                        <Calendar className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>إضافة إجازة</p></TooltipContent>
                                            </Tooltip>
                                            
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => onAddAssignment && onAddAssignment(employee)}
                                                    >
                                                        <Plus className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>إنشاء تكليف</p></TooltipContent>
                                            </Tooltip>
                                            
                                            {onLeave && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => onMubashara && onMubashara(employee)}
                                                        >
                                                            <PlayCircle className="h-4 w-4 text-orange-600" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>مباشرة من الإجازة</p></TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
};

export default EmployeeListForCenter;
