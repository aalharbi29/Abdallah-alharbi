import React, { useState, useEffect, useMemo } from 'react';
import { ArchivedEmployee } from '@/entities/ArchivedEmployee';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Archive, 
  Search, 
  UserX, 
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExportManager from '../components/export/ExportManager';
import ArchiveEmployeeForm from '../components/employees/ArchiveEmployeeForm';

const archiveTypeLabels = {
  retired: 'متقاعدون',
  resigned: 'مستقيلون', 
  terminated: 'منهية عقودهم',
  contract_not_renewed: 'غير مجددة عقودهم',
  transferred: 'منقولون'
};

const archiveTypeBadgeColors = {
  retired: 'bg-green-100 text-green-800',
  resigned: 'bg-blue-100 text-blue-800',
  terminated: 'bg-red-100 text-red-800',
  contract_not_renewed: 'bg-orange-100 text-orange-800',
  transferred: 'bg-purple-100 text-purple-800'
};

export default function EmployeeArchive() {
  const [archivedEmployees, setArchivedEmployees] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [archived, active] = await Promise.allSettled([
        ArchivedEmployee.list('-created_date', 1000),
        Employee.list()
      ]);
      
      setArchivedEmployees(
        archived.status === 'fulfilled' && Array.isArray(archived.value) ? archived.value : []
      );
      setActiveEmployees(
        active.status === 'fulfilled' && Array.isArray(active.value) ? active.value : []
      );
    } catch (err) {
      console.error('Error loading archive data:', err);
      setError('حدث خطأ في تحميل بيانات الأرشيف');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveEmployee = async (employeeId) => {
    const employee = activeEmployees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setShowArchiveForm(true);
    }
  };

  const handleArchiveSubmit = async (archiveData) => {
    try {
      // إنشاء سجل في الأرشيف
      await ArchivedEmployee.create({
        ...selectedEmployee,
        original_employee_id: selectedEmployee.id,
        ...archiveData
      });

      // حذف الموظف من قائمة النشطين
      await Employee.delete(selectedEmployee.id);

      setShowArchiveForm(false);
      setSelectedEmployee(null);
      loadData();
      alert('تم أرشفة الموظف بنجاح');
    } catch (error) {
      console.error('Error archiving employee:', error);
      alert('حدث خطأ في أرشفة الموظف');
    }
  };

  const filteredArchived = useMemo(() => {
    return archivedEmployees.filter(emp => {
      if (!emp) return false;
      
      const searchMatch = !searchQuery || 
        (emp.full_name_arabic && emp.full_name_arabic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.رقم_الموظف && emp.رقم_الموظف.includes(searchQuery)) ||
        (emp.رقم_الهوية && emp.رقم_الهوية.includes(searchQuery));
      
      const typeMatch = selectedType === 'all' || emp.archive_type === selectedType;
      
      return searchMatch && typeMatch;
    });
  }, [archivedEmployees, searchQuery, selectedType]);

  const archiveStats = useMemo(() => {
    const stats = {
      total: archivedEmployees.length,
      retired: 0,
      resigned: 0,
      terminated: 0,
      contract_not_renewed: 0,
      transferred: 0
    };

    archivedEmployees.forEach(emp => {
      if (emp.archive_type && stats.hasOwnProperty(emp.archive_type)) {
        stats[emp.archive_type]++;
      }
    });

    return stats;
  }, [archivedEmployees]);

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Archive className="text-indigo-600" />
              أرشيف الموظفين
            </h1>
            <p className="text-gray-600 mt-2">إدارة الموظفين المؤرشفين والمنقولين</p>
          </div>
          
          <div className="flex gap-3">
            <ExportManager data={filteredArchived} filename="أرشيف_الموظفين" />
            <Dialog open={showArchiveForm} onOpenChange={setShowArchiveForm}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <UserX className="w-4 h-4 ml-2" />
                  أرشفة موظف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>أرشفة موظف</DialogTitle>
                </DialogHeader>
                <ArchiveEmployeeForm
                  employees={activeEmployees}
                  onSubmit={handleArchiveSubmit}
                  onCancel={() => setShowArchiveForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{archiveStats.total}</div>
              <div className="text-sm text-gray-600">المجموع</div>
            </CardContent>
          </Card>
          {Object.entries(archiveTypeLabels).map(([key, label]) => (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{archiveStats[key]}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* فلاتر البحث */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="ابحث بالاسم، رقم الموظف، أو رقم الهوية..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="min-w-[200px]">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="فلترة حسب النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {Object.entries(archiveTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الموظفين المؤرشفين */}
        <Card>
          <CardHeader>
            <CardTitle>
              الموظفون المؤرشفون ({filteredArchived.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : filteredArchived.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد سجلات مطابقة للبحث
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArchived.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{employee.full_name_arabic}</h3>
                          <Badge className={archiveTypeBadgeColors[employee.archive_type]}>
                            {archiveTypeLabels[employee.archive_type]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">رقم الموظف:</span> {employee.رقم_الموظف}
                          </div>
                          <div>
                            <span className="font-medium">المنصب:</span> {employee.position}
                          </div>
                          <div>
                            <span className="font-medium">المركز:</span> {employee.المركز_الصحي}
                          </div>
                          <div>
                            <span className="font-medium">تاريخ الأرشفة:</span> {
                              employee.archive_date ? format(new Date(employee.archive_date), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'
                            }
                          </div>
                        </div>
                        {employee.archive_reason && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-700">السبب:</span> {employee.archive_reason}
                          </div>
                        )}
                        {employee.new_workplace && (
                          <div className="mt-1 text-sm">
                            <span className="font-medium text-gray-700">مكان العمل الجديد:</span> {employee.new_workplace}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}