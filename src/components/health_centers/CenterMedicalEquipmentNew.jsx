import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Printer,
  FileText,
  Filter,
  ChevronDown,
  Building2,
  RefreshCw,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const DEPARTMENTS = [
  "الطوارئ",
  "العيادات الخارجية",
  "المختبر",
  "الأشعة",
  "الصيدلية",
  "العمليات",
  "العناية المركزة",
  "التمريض",
  "الأسنان",
  "النساء والولادة",
  "الأطفال",
  "الباطنية",
  "الجراحة",
  "العلاج الطبيعي",
  "التعقيم",
  "أخرى",
];

const DEVICE_TYPES = [
  "جهاز تنفس",
  "جهاز مراقبة",
  "جهاز أشعة",
  "جهاز تحليل",
  "جهاز تعقيم",
  "جهاز جراحي",
  "جهاز أسنان",
  "جهاز علاج طبيعي",
  "جهاز قياس",
  "أجهزة مختبر",
  "أخرى",
];

export default function CenterMedicalEquipmentNew({ centerId, centerName, allCentersMode = false }) {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [allCenters, setAllCenters] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    device_name: "",
    device_type: "",
    model: "",
    manufacturer: "",
    serial_number: "",
    agent: "",
    manufacturing_country: "",
    manufacturing_date: "",
    category: "",
    department: "",
    status: "يعمل",
    notes: "",
  });

  useEffect(() => {
    loadEquipment();
    if (allCentersMode) {
      loadAllCenters();
    }
  }, [centerId, allCentersMode]);

  useEffect(() => {
    applyFilters();
  }, [equipment, searchQuery, filterDepartment, filterType, filterCategory]);

  const loadAllCenters = async () => {
    try {
      const centers = await base44.entities.HealthCenter.list();
      setAllCenters(centers || []);
    } catch (error) {
      console.error("Error loading centers:", error);
    }
  };

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      let data;
      if (allCentersMode) {
        data = await base44.entities.MedicalEquipment.list();
      } else {
        data = await base44.entities.MedicalEquipment.filter({ health_center_name: centerName });
      }
      setEquipment(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
      toast.error("فشل في تحميل بيانات الأجهزة");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...equipment];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.device_name?.toLowerCase().includes(query) ||
          item.manufacturer?.toLowerCase().includes(query) ||
          item.model?.toLowerCase().includes(query) ||
          item.serial_number?.toLowerCase().includes(query)
      );
    }

    if (filterDepartment && filterDepartment !== "all") {
      filtered = filtered.filter((item) => item.department === filterDepartment);
    }

    if (filterType && filterType !== "all") {
      filtered = filtered.filter((item) => item.device_type === filterType);
    }

    if (filterCategory && filterCategory !== "all") {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    setFilteredEquipment(filtered);
  };

  const resetForm = () => {
    setFormData({
      device_name: "",
      device_type: "",
      model: "",
      manufacturer: "",
      serial_number: "",
      agent: "",
      manufacturing_country: "",
      manufacturing_date: "",
      category: "",
      department: "",
      status: "يعمل",
      notes: "",
    });
    setEditingEquipment(null);
  };

  const handleSave = async () => {
    if (!formData.device_name) {
      toast.error("يرجى إدخال اسم الجهاز");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        health_center_id: centerId,
        health_center_name: centerName,
      };

      if (editingEquipment) {
        await base44.entities.MedicalEquipment.update(editingEquipment.id, dataToSave);
        toast.success("تم تحديث بيانات الجهاز بنجاح");
      } else {
        await base44.entities.MedicalEquipment.create(dataToSave);
        toast.success("تم إضافة الجهاز بنجاح");
      }

      setShowAddDialog(false);
      resetForm();
      loadEquipment();
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("فشل في حفظ البيانات");
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      device_name: item.device_name || "",
      device_type: item.device_type || "",
      model: item.model || "",
      manufacturer: item.manufacturer || "",
      serial_number: item.serial_number || "",
      agent: item.agent || "",
      manufacturing_country: item.manufacturing_country || "",
      manufacturing_date: item.manufacturing_date || "",
      category: item.category || "",
      department: item.department || "",
      status: item.status || "يعمل",
      notes: item.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الجهاز؟")) return;

    try {
      await base44.entities.MedicalEquipment.delete(id);
      toast.success("تم حذف الجهاز بنجاح");
      loadEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("فشل في حذف الجهاز");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEquipment.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEquipment.map(item => item.id));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد الأجهزة المراد حذفها");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} جهاز؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;

    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await base44.entities.MedicalEquipment.delete(id);
      }
      toast.success(`تم حذف ${selectedIds.length} جهاز بنجاح`);
      setSelectedIds([]);
      loadEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("فشل في حذف بعض الأجهزة");
    } finally {
      setIsDeleting(false);
    }
  };

  const generateHTMLContent = (data, title) => {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
    h1 { text-align: center; color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 15px; }
    h2 { color: #374151; margin-top: 30px; }
    .meta { text-align: center; color: #6b7280; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: center; }
    th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; font-weight: bold; }
    tr:nth-child(even) { background: #f9fafb; }
    tr:hover { background: #e0f2fe; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge-a { background: #dcfce7; color: #166534; }
    .badge-b { background: #fef3c7; color: #92400e; }
    .badge-c { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h1>📋 ${title}</h1>
  <div class="meta">
    <div>تاريخ الإعداد: ${new Date().toLocaleDateString('ar-SA')}</div>
    <div>عدد الأجهزة: ${data.length}</div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>م</th>
        ${allCentersMode ? '<th>المركز الصحي</th>' : ''}
        <th>اسم الجهاز</th>
        <th>الشركة المصنعة</th>
        <th>الموديل</th>
        <th>الرقم التسلسلي</th>
        <th>الفئة</th>
        <th>الوكيل</th>
        <th>تاريخ الصنع</th>
        <th>بلد الصنع</th>
        <th>القسم</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${data.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          ${allCentersMode ? `<td>${item.health_center_name || '-'}</td>` : ''}
          <td>${item.device_name || '-'}</td>
          <td>${item.manufacturer || '-'}</td>
          <td>${item.model || '-'}</td>
          <td>${item.serial_number || '-'}</td>
          <td><span class="badge badge-${(item.category || '').toLowerCase()}">${item.category || '-'}</span></td>
          <td>${item.agent || '-'}</td>
          <td>${item.manufacturing_date || item.manufacturing_year || '-'}</td>
          <td>${item.manufacturing_country || '-'}</td>
          <td>${item.department || '-'}</td>
          <td>${item.status || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>نظام إدارة المراكز الصحية - قطاع الحناكية الصحي</p>
  </div>
</body>
</html>`;
  };

  const exportToHTML = () => {
    const title = allCentersMode ? "الأجهزة الطبية - جميع المراكز" : `الأجهزة الطبية - ${centerName}`;
    const html = generateHTMLContent(filteredEquipment, title);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_equipment_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف بنجاح");
  };

  const exportToExcel = () => {
    const headers = allCentersMode 
      ? ["م", "المركز الصحي", "اسم الجهاز", "الشركة المصنعة", "الموديل", "الرقم التسلسلي", "الفئة", "الوكيل", "تاريخ الصنع", "بلد الصنع", "القسم", "الحالة"]
      : ["م", "اسم الجهاز", "الشركة المصنعة", "الموديل", "الرقم التسلسلي", "الفئة", "الوكيل", "تاريخ الصنع", "بلد الصنع", "القسم", "الحالة"];
    
    let csv = "\uFEFF" + headers.join(",") + "\n";
    
    filteredEquipment.forEach((item, index) => {
      const row = allCentersMode
        ? [
            index + 1,
            item.health_center_name || "",
            item.device_name || "",
            item.manufacturer || "",
            item.model || "",
            item.serial_number || "",
            item.category || "",
            item.agent || "",
            item.manufacturing_date || item.manufacturing_year || "",
            item.manufacturing_country || "",
            item.department || "",
            item.status || "",
          ]
        : [
            index + 1,
            item.device_name || "",
            item.manufacturer || "",
            item.model || "",
            item.serial_number || "",
            item.category || "",
            item.agent || "",
            item.manufacturing_date || item.manufacturing_year || "",
            item.manufacturing_country || "",
            item.department || "",
            item.status || "",
          ];
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_equipment_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف بنجاح");
  };

  const handlePrint = () => {
    const title = allCentersMode ? "الأجهزة الطبية - جميع المراكز" : `الأجهزة الطبية - ${centerName}`;
    const html = generateHTMLContent(filteredEquipment, title);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToPDF = () => {
    const title = allCentersMode ? "الأجهزة الطبية - جميع المراكز" : `الأجهزة الطبية - ${centerName}`;
    const html = generateHTMLContent(filteredEquipment, title);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    toast.info("استخدم خيار 'حفظ كـ PDF' في نافذة الطباعة");
  };

  const getCategoryBadge = (category) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-yellow-100 text-yellow-800",
      C: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const colors = {
      "يعمل": "bg-green-100 text-green-800",
      "معطل": "bg-red-100 text-red-800",
      "تحت الصيانة": "bg-yellow-100 text-yellow-800",
      "مستبعد": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const uniqueDepartments = [...new Set(equipment.map(e => e.department).filter(Boolean))];
  const uniqueTypes = [...new Set(equipment.map(e => e.device_type).filter(Boolean))];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="flex items-center gap-2">
            <Activity className="text-purple-600" />
            الأجهزة الطبية ({filteredEquipment.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 ml-2" />
                )}
                حذف المحدد ({selectedIds.length})
              </Button>
            )}
            <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة جهاز
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                  <ChevronDown className="w-4 h-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToHTML}>
                  <FileText className="w-4 h-4 ml-2" />
                  تصدير HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileText className="w-4 h-4 ml-2" />
                  تصدير Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="w-4 h-4 ml-2" />
                  حفظ PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={loadEquipment}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="بحث باسم الجهاز، الشركة، الموديل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="نوع الجهاز" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="A">الفئة A</SelectItem>
              <SelectItem value="B">الفئة B</SelectItem>
              <SelectItem value="C">الفئة C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredEquipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-purple-50">
                  <th className="border p-3 text-center print-hide w-10">
                    <button 
                      onClick={handleSelectAll}
                      className="hover:text-purple-600 transition-colors"
                    >
                      {selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="border p-3 text-right">م</th>
                  {allCentersMode && <th className="border p-3 text-right">المركز</th>}
                  <th className="border p-3 text-right">اسم الجهاز</th>
                  <th className="border p-3 text-right">الشركة المصنعة</th>
                  <th className="border p-3 text-right">الموديل</th>
                  <th className="border p-3 text-right">الرقم التسلسلي</th>
                  <th className="border p-3 text-right">الفئة</th>
                  <th className="border p-3 text-right">الوكيل</th>
                  <th className="border p-3 text-right">تاريخ الصنع</th>
                  <th className="border p-3 text-right">بلد الصنع</th>
                  <th className="border p-3 text-right">القسم</th>
                  <th className="border p-3 text-right">الحالة</th>
                  <th className="border p-3 text-center print-hide">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${selectedIds.includes(item.id) ? 'bg-purple-50' : ''}`}>
                    <td className="border p-3 text-center print-hide">
                      <button 
                        onClick={() => handleSelectItem(item.id)}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {selectedIds.includes(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="border p-3">{index + 1}</td>
                    {allCentersMode && (
                      <td className="border p-3">
                        <Badge variant="outline" className="bg-blue-50">
                          {item.health_center_name}
                        </Badge>
                      </td>
                    )}
                    <td className="border p-3 font-semibold">{item.device_name}</td>
                    <td className="border p-3">{item.manufacturer || '-'}</td>
                    <td className="border p-3">{item.model || '-'}</td>
                    <td className="border p-3 font-mono text-xs">{item.serial_number || '-'}</td>
                    <td className="border p-3">
                      {item.category && (
                        <Badge className={getCategoryBadge(item.category)}>{item.category}</Badge>
                      )}
                    </td>
                    <td className="border p-3">{item.agent || '-'}</td>
                    <td className="border p-3">{item.manufacturing_date || item.manufacturing_year || '-'}</td>
                    <td className="border p-3">{item.manufacturing_country || '-'}</td>
                    <td className="border p-3">{item.department || '-'}</td>
                    <td className="border p-3">
                      <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="border p-3 text-center print-hide">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد أجهزة طبية مسجلة</p>
            <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="mt-4">
              <Plus className="w-4 h-4 ml-2" />
              إضافة جهاز جديد
            </Button>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? "تعديل بيانات الجهاز" : "إضافة جهاز جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label>اسم الجهاز *</Label>
              <Input
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="أدخل اسم الجهاز"
              />
            </div>
            <div>
              <Label>نوع الجهاز</Label>
              <Select
                value={formData.device_type}
                onValueChange={(value) => setFormData({ ...formData, device_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الجهاز" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الشركة المصنعة</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="أدخل اسم الشركة المصنعة"
              />
            </div>
            <div>
              <Label>الموديل</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="أدخل الموديل"
              />
            </div>
            <div>
              <Label>الرقم التسلسلي</Label>
              <Input
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="أدخل الرقم التسلسلي"
              />
            </div>
            <div>
              <Label>الفئة</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">الفئة A</SelectItem>
                  <SelectItem value="B">الفئة B</SelectItem>
                  <SelectItem value="C">الفئة C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الوكيل</Label>
              <Input
                value={formData.agent}
                onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                placeholder="أدخل اسم الوكيل"
              />
            </div>
            <div>
              <Label>تاريخ الصنع</Label>
              <Input
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
              />
            </div>
            <div>
              <Label>بلد الصنع</Label>
              <Input
                value={formData.manufacturing_country}
                onChange={(e) => setFormData({ ...formData, manufacturing_country: e.target.value })}
                placeholder="أدخل بلد الصنع"
              />
            </div>
            <div>
              <Label>القسم</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>حالة الجهاز</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
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
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              {editingEquipment ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}