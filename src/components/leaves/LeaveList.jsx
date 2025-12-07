import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Trash2, CheckCircle, XCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const LeaveStatusBadge = ({ leave, isArchive = false }) => {
    if (!leave) return null;
    if (leave.mubashara_date) return <Badge className="bg-blue-100 text-blue-800">تمت المباشرة</Badge>;
    
    if (isArchive) {
      if (leave.status === 'completed') return <Badge className="bg-green-100 text-green-800">مُنهاة</Badge>;
      if (leave.status === 'cancelled') return <Badge className="bg-red-100 text-red-800">مُلغاة</Badge>;
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">أرشيف</Badge>;
    }
    
    const today = new Date();
    if (!leave.start_date || !leave.end_date) return <Badge variant="outline">تواريخ غير صحيحة</Badge>;
    
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    if (today >= startDate && today <= endDate) return <Badge className="bg-green-100 text-green-800 animate-pulse">إجازة جارية</Badge>;
    if (today > endDate) return <Badge variant="secondary">منتهية</Badge>;
    if (today < startDate) return <Badge variant="outline">قادمة</Badge>;
    return <Badge variant="outline">غير محدد</Badge>;
};

export default function LeaveList({ leaves, onMubashara, onStatusUpdate, onDelete, isLoading, isArchive = false }) {
  // حماية قوية ضد البيانات المفقودة
  const safeLeaves = React.useMemo(() => {
    if (!leaves) return [];
    if (!Array.isArray(leaves)) return [];
    return leaves.filter(leave => leave != null && leave.id); // إزالة null و undefined والعناصر بدون id
  }, [leaves]);

  if (isLoading) return <div className="text-center p-8">جاري تحميل سجل الإجازات...</div>;
  if (safeLeaves.length === 0) return <div className="text-center p-8 text-gray-500">لا توجد إجازات لعرضها.</div>;
  
  return (
    <Card className="shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>المركز</TableHead>
                    <TableHead>نوع الإجازة</TableHead>
                    <TableHead>الفترة (المدة)</TableHead>
                    <TableHead>الحالة</TableHead>
                    {isArchive && <TableHead>تاريخ المباشرة</TableHead>}
                    <TableHead className="print-hide">الإجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {safeLeaves.map((leave) => {
                // حماية إضافية داخل map
                if (!leave || !leave.id) return null;
                
                return (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="font-medium">{leave.employee_name || 'غير محدد'}</div>
                      <p className="text-xs text-gray-500">{leave.employee_id || ''}</p>
                    </TableCell>
                    <TableCell>{leave.health_center || 'غير محدد'}</TableCell>
                    <TableCell>{leave.leave_type || 'غير محدد'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {leave.start_date && leave.end_date ? (
                          <>
                            <span>{format(new Date(leave.start_date), "dd/MM/yyyy")} - {format(new Date(leave.end_date), "dd/MM/yyyy")}</span>
                            <span className="text-xs text-gray-500">{leave.days_count || 0} يوم</span>
                          </>
                        ) : (
                          <span className="text-xs text-red-500">تواريخ غير صحيحة</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><LeaveStatusBadge leave={leave} isArchive={isArchive} /></TableCell>
                    {isArchive && (
                      <TableCell>
                        {leave.mubashara_date ? (
                          <span className="text-sm text-green-600">
                            {format(new Date(leave.mubashara_date), "dd/MM/yyyy")}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">لم يتم التسجيل</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="print-hide">
                      <div className="flex gap-1">
                        {!isArchive ? (
                          <>
                            {!leave.mubashara_date && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">المزيد ▼</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onMubashara && onMubashara(leave.id)}>
                                    <PlayCircle className="w-4 h-4 ml-2 text-green-600" />
                                    تسجيل المباشرة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onStatusUpdate && onStatusUpdate(leave.id, 'completed')}>
                                    <CheckCircle className="w-4 h-4 ml-2 text-blue-600" />
                                    إنهاء الإجازة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onStatusUpdate && onStatusUpdate(leave.id, 'cancelled')}>
                                    <XCircle className="w-4 h-4 ml-2 text-red-600" />
                                    إلغاء الإجازة
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        ) : null}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4 ml-1" />
                                  حذف
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      هل أنت متأكد من حذف هذه الإجازة نهائياً؟ {isArchive ? "سيتم حذفها من الأرشيف نهائياً." : "لا يمكن التراجع عن هذا الإجراء."}
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDelete && onDelete(leave.id)} className="bg-red-600 hover:bg-red-700">
                                    حذف نهائياً
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}