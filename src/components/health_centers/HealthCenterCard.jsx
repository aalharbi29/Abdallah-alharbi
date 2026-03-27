import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Phone, Mail, ExternalLink, Building2, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { HealthCenter } from '@/entities/HealthCenter';
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

export default function HealthCenterCard({ center, employees, onEdit, onDataChange }) {
  // التحقق من وجود المركز
  if (!center) {
    console.warn('⚠️ HealthCenterCard: center is null or undefined');
    return null;
  }

  // حساب عدد الموظفين في هذا المركز
  const centerEmployees = Array.isArray(employees) 
    ? employees.filter(emp => emp.المركز_الصحي === center.اسم_المركز)
    : [];
  
  const employeeCount = centerEmployees.length;

  const handleDelete = async () => {
    try {
      await HealthCenter.delete(center.id);
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting center:', error);
      alert('حدث خطأ أثناء حذف المركز');
    }
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

  return (
    <Card 
      className="h-full hover:shadow-lg transition-shadow cursor-pointer"
      title={center.اسم_المركز || 'مركز غير محدد'}
    >
      <CardHeader className="pb-2 px-3 pt-3 md:pb-3 md:px-6 md:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <CardTitle className="text-base line-clamp-2" title={center.اسم_المركز}>
              {center.اسم_المركز || 'مركز غير محدد'}
            </CardTitle>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(center);
              }}
              title="تعديل"
            >
              <Edit className="w-3 h-3" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-red-600 hover:text-red-700"
                  onClick={(e) => e.stopPropagation()}
                  title="حذف"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف المركز "{center.اسم_المركز}"؟ لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2.5 pt-0 px-3 pb-3 md:space-y-3 md:px-6 md:pb-6">
        {/* الموقع */}
        {center.الموقع && (
          <div className="flex items-start gap-2 text-sm" title={center.الموقع}>
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 line-clamp-2">{center.الموقع}</span>
          </div>
        )}

        {/* الهاتف */}
        {center.هاتف_المركز && (
          <div className="flex items-center gap-2 text-sm" title={center.هاتف_المركز}>
            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <a 
              href={`tel:${center.هاتف_المركز}`}
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {center.هاتف_المركز}
            </a>
          </div>
        )}

        {/* الإيميل */}
        {center.ايميل_المركز && (
          <div className="flex items-center gap-2 text-sm" title={center.ايميل_المركز}>
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <a 
              href={`mailto:${center.ايميل_المركز}`}
              className="text-blue-600 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {center.ايميل_المركز}
            </a>
          </div>
        )}

        {/* الشارات */}
        <div className="flex flex-wrap gap-2">
          {/* عدد الموظفين */}
          <Badge variant="secondary" className="flex items-center gap-1" title={`${employeeCount} موظف`}>
            <Users className="w-3 h-3" />
            {employeeCount}
          </Badge>

          {/* حالة التشغيل */}
          <Badge className={getStatusColor(center.حالة_التشغيل)} title={center.حالة_التشغيل}>
            {center.حالة_التشغيل || 'نشط'}
          </Badge>

          {/* نوع الملكية */}
          <Badge className={getOwnershipColor(center.حالة_المركز)} title={center.حالة_المركز}>
            {center.حالة_المركز || 'حكومي'}
          </Badge>

          {/* مركز نائي */}
          {center.مركز_نائي && (
            <Badge className="bg-amber-100 text-amber-800" title="مركز نائي">
              نائي
            </Badge>
          )}
        </div>

        {/* رابط الخريطة */}
        {center.موقع_الخريطة && (
          <a
            href={center.موقع_الخريطة}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
            title="عرض على الخريطة"
          >
            <ExternalLink className="w-4 h-4" />
            عرض على الخريطة
          </a>
        )}

        {/* زر عرض التفاصيل */}
        <Link 
          to={createPageUrl(`HealthCenterDetails?id=${center.id}`)}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" size="sm" className="w-full mt-2">
            عرض التفاصيل الكاملة
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}