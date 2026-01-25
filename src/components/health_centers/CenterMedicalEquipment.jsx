import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Activity,
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  Printer,
  Filter,
  MoreVertical,
  FileCode,
  FileSpreadsheet,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function CenterMedicalEquipment({ centerId, centerName }) {
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    device_name: '',
    device_type: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    manufacturing_country: '',
    manufacturing_year: '',
    category: 'C',
    department: '',
    status: 'يعمل',
    notes: '',
  });

  useEffect(() => {
    loadEquipment();
  }, [centerName]);

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.MedicalEquipment.filter({ health_center_name: centerName });
      setEquipment(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading equipment:', error);
      setEquipment([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deviceTypes = useMemo(() => {
    const types = [...new Set(equipment.map(e => e.device_type).filter(Boolean))];
    return types.sort();
  }, [equipment]);

  const departments = useMemo(() => {
    const depts = [...new Set(equipment.map(e => e.department).filter(Boolean))];
    return depts.sort();
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = !searchQuery ||
        item.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || item.device_type === filterType;
      const matchesDept = filterDepartment === 'all' || item.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesType && matchesDept && matchesStatus;
    });
  }, [equipment, searchQuery, filterType, filterDepartment, filterStatus]);

  const handleAddEquipment = async () => {
    try {
      await base44.entities.MedicalEquipment.create({
        ...formData,
        health_center_id: centerId,
        health_center_name: centerName,
      });
      setShowAddDialog(false);
      resetForm();
      loadEquipment();
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleEditEquipment = async () => {
    if (!editingItem) return;
    try {
      await base44.entities.MedicalEquipment.update(editingItem.id, formData);
      setShowEditDialog(false);
      setEditingItem(null);
      resetForm();
      loadEquipment();
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجهاز؟')) return;
    try {
      await base44.entities.MedicalEquipment.delete(id);
      loadEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setFormData({
      device_name: item.device_name || '',
      device_type: item.device_type || '',
      model: item.model || '',
      manufacturer: item.manufacturer || '',
      serial_number: item.serial_number || '',
      manufacturing_country: item.manufacturing_country || '',
      manufacturing_year: item.manufacturing_year || '',
      category: item.category || 'C',
      department: item.department || '',
      status: item.status || 'يعمل',
      notes: item.notes || '',
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      device_name: '',
      device_type: '',
      model: '',
      manufacturer: '',
      serial_number: '',
      manufacturing_country: '',
      manufacturing_year: '',
      category: 'C',
      department: '',
      status: 'يعمل',
      notes: '',
    });
  };

  const exportToHTML = () => {
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>الأجهزة الطبية - ${centerName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    body { font-family: 'Cairo', sans-serif; padding: 30px; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #1e40af; margin-bottom: 10px; }
    h2 { text-align: center; color: #64748b; font-weight: normal; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 12px; text-align: center; }
    td { border: 1px solid #e2e8f0; padding: 10px; text-align: center; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .stats { display: flex; gap: 20px; margin-bottom: 30px; justify-content: center; }
    .stat-card { background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center; min-width: 120px; }
    .stat-number { font-size: 24px; font-weight: bold; color: #1e40af; }
    .stat-label { color: #64748b; font-size: 14px; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>الأجهزة الطبية المتوفرة</h1>
    <h2>${centerName}</h2>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${filteredEquipment.length}</div>
        <div class="stat-label">إجمالي الأجهزة</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${filteredEquipment.filter(e => e.status === 'يعمل').length}</div>
        <div class="stat-label">تعمل</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${filteredEquipment.filter(e => e.status === 'معطل').length}</div>
        <div class="stat-label">معطلة</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>م</th>
          <th>اسم الجهاز</th>
          <th>الموديل</th>
          <th>الشركة المصنعة</th>
          <th>الرقم التسلسلي</th>
          <th>بلد الصنع</th>
          <th>سنة الصنع</th>
          <th>الفئة</th>
          <th>القسم</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        ${filteredEquipment.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.device_name || '-'}</td>
            <td>${item.model || '-'}</td>
            <td>${item.manufacturer || '-'}</td>
            <td>${item.serial_number || '-'}</td>
            <td>${item.manufacturing_country || '-'}</td>
            <td>${item.manufacturing_year || '-'}</td>
            <td>${item.category || '-'}</td>
            <td>${item.department || '-'}</td>
            <td><span class="badge ${item.status === 'يعمل' ? 'badge-green' : item.status === 'معطل' ? 'badge-red' : 'badge-yellow'}">${item.status || '-'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <p style="text-align: center; margin-top: 30px; color: #64748b;">
      تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}
    </p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الأجهزة_الطبية_${centerName}_${new Date().toLocaleDateString('ar-SA')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['م', 'اسم الجهاز', 'الموديل', 'الشركة المصنعة', 'الرقم التسلسلي', 'بلد الصنع', 'سنة الصنع', 'الفئة', 'القسم', 'الحالة', 'ملاحظات'];
    let csvContent = "\ufeff" + headers.join(',') + '\n';

    filteredEquipment.forEach((item, index) => {
      const row = [
        index + 1,
        `"${item.device_name || ''}"`,
        `"${item.model || ''}"`,
        `"${item.manufacturer || ''}"`,
        `"${item.serial_number || ''}"`,
        `"${item.manufacturing_country || ''}"`,
        `"${item.manufacturing_year || ''}"`,
        `"${item.category || ''}"`,
        `"${item.department || ''}"`,
        `"${item.status || ''}"`,
        `"${item.notes || ''}"`,
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `الأجهزة_الطبية_${centerName}_${new Date().toLocaleDateString('ar-SA')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>الأجهزة الطبية - ${centerName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    body { font-family: 'Cairo', sans-serif; padding: 20px; }
    h1 { text-align: center; color: #1e40af; }
    h2 { text-align: center; color: #64748b; font-weight: normal; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
    th { background: #1e40af; color: white; padding: 8px; }
    td { border: 1px solid #ccc; padding: 6px; text-align: center; }
    tr:nth-child(even) { background: #f8fafc; }
    @page { size: A4 landscape; margin: 10mm; }
  </style>
</head>
<body>
  <h1>الأجهزة الطبية المتوفرة</h1>
  <h2>${centerName}</h2>
  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>اسم الجهاز</th>
        <th>الموديل</th>
        <th>الشركة</th>
        <th>الرقم التسلسلي</th>
        <th>بلد الصنع</th>
        <th>سنة الصنع</th>
        <th>الفئة</th>
        <th>القسم</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${filteredEquipment.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.device_name || '-'}</td>
          <td>${item.model || '-'}</td>
          <td>${item.manufacturer || '-'}</td>
          <td>${item.serial_number || '-'}</td>
          <td>${item.manufacturing_country || '-'}</td>
          <td>${item.manufacturing_year || '-'}</td>
          <td>${item.category || '-'}</td>
          <td>${item.department || '-'}</td>
          <td>${item.status || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'يعمل':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 ml-1" />يعمل</Badge>;
      case 'معطل':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 ml-1" />معطل</Badge>;
      case 'تحت الصيانة':
        return <Badge className="bg-yellow-100 text-yellow-800">تحت الصيانة</Badge>;
      case 'مستبعد':
        return <Badge className="bg-gray-100 text-gray-800">مستبعد</Badge>;
      default:
        return <Badge variant="outline">{status || 'غير محدد'}</Badge>;
    }
  };

  const EquipmentForm = ({ onSubmit, submitLabel }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label>اسم الجهاز *</Label>
        <Input
          value={formData.device_name}
          onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
          placeholder="مثال: جهاز قياس الضغط"
        />
      </div>

      <div>
        <Label>نوع الجهاز</Label>
        <Input
          value={formData.device_type}
          onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
          placeholder="مثال: أجهزة قياس"
        />
      </div>

      <div>
        <Label>الموديل</Label>
        <Input
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          placeholder="مثال: V100"
        />
      </div>

      <div>
        <Label>الشركة المصنعة</Label>
        <Input
          value={formData.manufacturer}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          placeholder="مثال: GE"
        />
      </div>

      <div>
        <Label>الرقم التسلسلي</Label>
        <Input
          value={formData.serial_number}
          onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
          placeholder="S.N"
        />
      </div>

      <div>
        <Label>بلد الصنع</Label>
        <Input
          value={formData.manufacturing_country}
          onChange={(e) => setFormData({ ...formData, manufacturing_country: e.target.value })}
          placeholder="مثال: ألمانيا"
        />
      </div>

      <div>
        <Label>سنة الصنع</Label>
        <Input
          value={formData.manufacturing_year}
          onChange={(e) => setFormData({ ...formData, manufacturing_year: e.target.value })}
          placeholder="مثال: 2020"
        />
      </div>

      <div>
        <Label>الفئة</Label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>القسم</Label>
        <Input
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="مثال: عيادة الأسنان"
        />
      </div>

      <div>
        <Label>الحالة</Label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="يعمل">يعمل</SelectItem>
            <SelectItem value="معطل">معطل</SelectItem>
            <SelectItem value="تحت الصيانة">تحت الصيانة</SelectItem>
            <SelectItem value="مستبعد">مستبعد</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2">
        <Label>ملاحظات</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="ملاحظات إضافية..."
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span className="flex items-center gap-2">
            <Activity className="text-purple-600" />
            الأجهزة الطبية المتوفرة ({equipment.length} جهاز)
          </span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة جهاز
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToHTML}>
                  <FileCode className="w-4 h-4 ml-2" />
                  تصدير HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  تصدير Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* فلاتر البحث */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="البحث في الأجهزة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="نوع الجهاز" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              {deviceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأقسام</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="يعمل">يعمل</SelectItem>
              <SelectItem value="معطل">معطل</SelectItem>
              <SelectItem value="تحت الصيانة">تحت الصيانة</SelectItem>
              <SelectItem value="مستبعد">مستبعد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* جدول الأجهزة */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : filteredEquipment.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">م</TableHead>
                  <TableHead>اسم الجهاز</TableHead>
                  <TableHead>الموديل</TableHead>
                  <TableHead>الشركة</TableHead>
                  <TableHead>الرقم التسلسلي</TableHead>
                  <TableHead>بلد الصنع</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center w-20">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{item.device_name}</TableCell>
                    <TableCell>{item.model || '-'}</TableCell>
                    <TableCell>{item.manufacturer || '-'}</TableCell>
                    <TableCell className="text-xs">{item.serial_number || '-'}</TableCell>
                    <TableCell>{item.manufacturing_country || '-'}</TableCell>
                    <TableCell>{item.department || '-'}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEquipment(item.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد أجهزة طبية مسجلة</p>
            <p className="text-sm">اضغط على "إضافة جهاز" لإضافة جهاز جديد</p>
          </div>
        )}
      </CardContent>

      {/* Dialog إضافة جهاز */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة جهاز طبي جديد</DialogTitle>
          </DialogHeader>
          <EquipmentForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button onClick={handleAddEquipment} disabled={!formData.device_name}>
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تعديل جهاز */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الجهاز</DialogTitle>
          </DialogHeader>
          <EquipmentForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button onClick={handleEditEquipment} disabled={!formData.device_name}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}