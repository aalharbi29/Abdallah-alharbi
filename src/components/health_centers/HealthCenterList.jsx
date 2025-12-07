
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Eye, Edit, Trash2, MapPin, Phone, Mail, Car, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HealthCenter } from '@/entities/HealthCenter';

export default function HealthCenterList({ 
  healthCenters, 
  employees, 
  isLoading, 
  onDataChange, 
  onEdit 
}) {
  const safeHealthCenters = React.useMemo(() => {
    if (!healthCenters) return [];
    if (!Array.isArray(healthCenters)) return [];
    return healthCenters.filter(center => center != null);
  }, [healthCenters]);

  const safeEmployees = React.useMemo(() => {
    if (!employees) return [];
    if (!Array.isArray(employees)) return [];
    return employees.filter(emp => emp != null);
  }, [employees]);

  const handleDelete = async (centerId, centerName) => {
    try {
      await HealthCenter.delete(centerId);
      alert(`تم حذف المركز "${centerName}" بنجاح`);
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error deleting health center:', error);
      alert('فشل في حذف المركز الصحي');
    }
  };

  const getEmployeeCountForCenter = (centerName) => {
    return safeEmployees.filter(emp => emp && emp.المركز_الصحي === centerName).length;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'نشط': return 'bg-green-100 text-green-800';
      case 'متوقف مؤقتاً': return 'bg-yellow-100 text-yellow-800';
      case 'قيد الصيانة': return 'bg-blue-100 text-blue-800';
      case 'مغلق': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOwnershipColor = (ownership) => {
    switch(ownership) {
      case 'حكومي': return 'bg-green-100 text-green-800';
      case 'مستأجر': return 'bg-orange-100 text-orange-800';
      case 'ملك خاص': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">جاري تحميل المراكز الصحية...</div>
        </CardContent>
      </Card>
    );
  }

  if (safeHealthCenters.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد مراكز صحية</h3>
            <p className="text-gray-400">ابدأ بإضافة مركز صحي جديد</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="text-green-600 w-6 h-6" />
          المراكز الصحية
          <Badge variant="secondary" className="ml-2">{safeHealthCenters.length} مركز</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-right min-w-[200px]">اسم المركز</TableHead>
                <TableHead className="text-right min-w-[150px]">القيادة</TableHead>
                <TableHead className="text-right min-w-[100px]">الحالة</TableHead>
                <TableHead className="text-right min-w-[120px]">نوع الملكية</TableHead>
                <TableHead className="text-right min-w-[100px]">الموظفين</TableHead>
                <TableHead className="text-right min-w-[120px]">المركبات</TableHead>
                <TableHead className="text-right min-w-[150px]">التواصل</TableHead>
                <TableHead className="text-center min-w-[180px] no-print">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeHealthCenters.map((center) => {
                if (!center || !center.id) return null;

                const employeeCount = getEmployeeCountForCenter(center.اسم_المركز);
                const totalFromCategories = Object.values(center.تقسيم_الموظفين || {}).reduce((sum, count) => sum + (count || 0), 0);
                
                // البحث عن أسماء المسؤولين باستخدام المعرفات
                const manager = safeEmployees.find(e => e.id === center.المدير);
                const deputy = safeEmployees.find(e => e.id === center.نائب_المدير);
                const supervisor = safeEmployees.find(e => e.id === center.المشرف_الفني);

                return (
                  <TableRow key={center.id} className="hover:bg-gray-50 group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm relative">
                          {(center.اسم_المركز || 'م').charAt(0)}
                          {center.مركز_نائي && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <MapPin className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{center.اسم_المركز || 'غير محدد'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {center.الموقع || 'غير محدد'}
                          </div>
                          {center.مركز_نائي && (
                            <Badge variant="outline" className="mt-1 text-xs bg-yellow-50 text-yellow-700">
                              مركز نائي
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium">{manager?.full_name_arabic || 'غير محدد'}</span>
                        </div>
                        {deputy && (
                          <div className="text-xs text-gray-500">نائب: {deputy.full_name_arabic}</div>
                        )}
                        {supervisor && (
                          <div className="text-xs text-gray-500">مشرف فني: {supervisor.full_name_arabic}</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(center.حالة_التشغيل)}>
                        {center.حالة_التشغيل || 'غير محدد'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge className={getOwnershipColor(center.حالة_المركز)}>
                        {center.حالة_المركز || 'غير محدد'}
                      </Badge>
                      {center.حالة_المركز === 'مستأجر' && center.قيمة_عقد_الايجار && (
                        <div className="text-xs text-gray-500 mt-1">
                          {center.قيمة_عقد_الايجار?.toLocaleString()} ر.س
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {center.عدد_الموظفين_الكلي || totalFromCategories || employeeCount}
                        </div>
                        <div className="text-xs text-gray-500">موظف</div>
                        {totalFromCategories > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            أ:{center.تقسيم_الموظفين?.اطباء || 0} | 
                            م:{center.تقسيم_الموظفين?.ممرضين || 0} | 
                            ص:{center.تقسيم_الموظفين?.صيادلة || 0}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {center.سيارة_خدمات?.متوفرة ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            <Car className="w-3 h-3 ml-1" />
                            خدمات
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                            <XCircle className="w-3 h-3 ml-1" />
                            لا يوجد
                          </Badge>
                        )}
                        {center.سيارة_اسعاف?.متوفرة ? (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            <Car className="w-3 h-3 ml-1" />
                            إسعاف
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                            <XCircle className="w-3 h-3 ml-1" />
                            لا يوجد
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {center.هاتف_المركز && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{center.هاتف_المركز}</span>
                          </div>
                        )}
                        {center.ايميل_المركز && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{center.ايميل_المركز}</span>
                          </div>
                        )}
                        <div className="flex gap-1">
                          {center.center_code && (
                            <Badge variant="outline" className="text-xs">
                              {center.center_code}
                            </Badge>
                          )}
                          {center.organization_code && (
                            <Badge variant="outline" className="text-xs">
                              {center.organization_code}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="no-print">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={createPageUrl(`HealthCenterDetails?id=${center.id}`)}>
                          <Button variant="outline" size="sm" className="hover:bg-blue-50">
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit && onEdit(center)}
                          className="hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد حذف المركز الصحي</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف المركز الصحي "{center.اسم_المركز}"؟
                                {employeeCount > 0 && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <strong className="text-yellow-800">تحذير:</strong> يوجد {employeeCount} موظف مرتبط بهذا المركز.
                                  </div>
                                )}
                                لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(center.id, center.اسم_المركز)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                نعم، احذف المركز
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
