import React, { useState, useEffect } from 'react';
import { Form205 } from '@/entities/Form205';
import { Form205Part2 } from '@/entities/Form205Part2';
import { AllowanceRequest } from '@/entities/AllowanceRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Eye, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
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

export default function SavedForms() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllForms();
  }, []);

  const loadAllForms = async () => {
    setIsLoading(true);
    try {
      const [form205Data, form205Part2Data, allowanceData] = await Promise.all([
        Form205.list('-created_date'),
        Form205Part2.list('-created_date'),
        AllowanceRequest.list('-created_date')
      ]);

      const allForms = [
        ...(form205Data || []).map(form => ({ ...form, type: 'نموذج 205', color: 'bg-blue-100 text-blue-800' })),
        ...(form205Part2Data || []).map(form => ({ ...form, type: 'تابع نموذج 205', color: 'bg-green-100 text-green-800' })),
        ...(allowanceData || []).map(form => ({ ...form, type: 'إقرار بدل العدوى والضرر والخطر', color: 'bg-purple-100 text-purple-800' }))
      ];

      setForms(allForms.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (error) {
      console.error('Error loading forms:', error);
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (form) => {
    try {
      if (form.type === 'نموذج 205') {
        await Form205.delete(form.id);
      } else if (form.type === 'تابع نموذج 205') {
        await Form205Part2.delete(form.id);
      } else if (form.type === 'إقرار بدل العدوى والضرر والخطر') {
        await AllowanceRequest.delete(form.id);
      }
      loadAllForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('حدث خطأ في حذف النموذج');
    }
  };

  const filteredForms = forms.filter(form => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      form.employee_name?.toLowerCase().includes(searchLower) ||
      form.type.toLowerCase().includes(searchLower) ||
      form.created_by?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">النماذج المحفوظة</h1>
          <p className="text-gray-600">عرض وإدارة جميع النماذج التفاعلية المحفوظة</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="ابحث في النماذج بالاسم أو النوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={form.color}>{form.type}</Badge>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(form.created_date), 'dd/MM/yyyy', { locale: ar })}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{form.employee_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {form.employee_position && (
                      <div><span className="font-medium">المنصب:</span> {form.employee_position}</div>
                    )}
                    {form.department && (
                      <div><span className="font-medium">القسم:</span> {form.department}</div>
                    )}
                    {form.allowance_type && (
                      <div><span className="font-medium">نوع البدل:</span> {form.allowance_type}</div>
                    )}
                    <div><span className="font-medium">تم الإنشاء بواسطة:</span> {form.created_by}</div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(form)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نماذج محفوظة</h3>
              <p className="text-gray-500">
                {searchQuery ? 
                  `لا توجد نماذج تطابق البحث "${searchQuery}"` : 
                  "لم يتم حفظ أي نماذج تفاعلية بعد"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}