import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Activity,
  Search,
  Download,
  Printer,
  FileText,
  Filter,
  Building2,
  RefreshCw,
  Save,
  FileSpreadsheet,
  Eye,
  X,
  Settings2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const COLUMNS = [
  { key: "index", label: "م", default: true },
  { key: "health_center_name", label: "المركز الصحي", default: true },
  { key: "device_name", label: "اسم الجهاز", default: true },
  { key: "manufacturer", label: "الشركة المصنعة", default: true },
  { key: "model", label: "الموديل", default: true },
  { key: "serial_number", label: "الرقم التسلسلي", default: true },
  { key: "category", label: "الفئة", default: true },
  { key: "agent", label: "الوكيل", default: false },
  { key: "manufacturing_date", label: "تاريخ الصنع", default: false },
  { key: "manufacturing_country", label: "بلد الصنع", default: false },
  { key: "department", label: "القسم", default: false },
  { key: "status", label: "الحالة", default: true },
];

export default function MedicalEquipmentReport() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  
  // Column selection
  const [selectedColumns, setSelectedColumns] = useState(
    COLUMNS.filter(c => c.default).map(c => c.key)
  );
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  
  // Report settings
  const [reportTitle, setReportTitle] = useState("تقرير الأجهزة الطبية");
  const [showPreview, setShowPreview] = useState(false);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [equipment, searchQuery, selectedCenters, selectedCategories, selectedStatuses, selectedDeviceTypes, selectedManufacturers]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [equipmentData, centersData] = await Promise.all([
        base44.entities.MedicalEquipment.list(),
        base44.entities.HealthCenter.list()
      ]);
      setEquipment(equipmentData || []);
      setHealthCenters(centersData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("فشل في تحميل البيانات");
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
          item.serial_number?.toLowerCase().includes(query) ||
          item.health_center_name?.toLowerCase().includes(query)
      );
    }

    if (selectedCenters.length > 0) {
      filtered = filtered.filter((item) => selectedCenters.includes(item.health_center_name));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) => selectedCategories.includes(item.category));
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item) => selectedStatuses.includes(item.status));
    }

    if (selectedDeviceTypes.length > 0) {
      filtered = filtered.filter((item) => selectedDeviceTypes.includes(item.device_name));
    }

    if (selectedManufacturers.length > 0) {
      filtered = filtered.filter((item) => selectedManufacturers.includes(item.manufacturer));
    }

    setFilteredEquipment(filtered);
  };

  const uniqueCenterNames = [...new Set(equipment.map(e => e.health_center_name).filter(Boolean))].sort();
  const uniqueManufacturers = [...new Set(equipment.map(e => e.manufacturer).filter(Boolean))].sort();
  const uniqueDeviceTypes = [...new Set(equipment.map(e => e.device_name).filter(Boolean))].sort();

  const toggleCenter = (centerName) => {
    if (selectedCenters.includes(centerName)) {
      setSelectedCenters(selectedCenters.filter(c => c !== centerName));
    } else {
      setSelectedCenters([...selectedCenters, centerName]);
    }
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleStatus = (status) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const toggleDeviceType = (deviceType) => {
    if (selectedDeviceTypes.includes(deviceType)) {
      setSelectedDeviceTypes(selectedDeviceTypes.filter(d => d !== deviceType));
    } else {
      setSelectedDeviceTypes([...selectedDeviceTypes, deviceType]);
    }
  };

  const toggleManufacturer = (manufacturer) => {
    if (selectedManufacturers.includes(manufacturer)) {
      setSelectedManufacturers(selectedManufacturers.filter(m => m !== manufacturer));
    } else {
      setSelectedManufacturers([...selectedManufacturers, manufacturer]);
    }
  };

  const toggleColumn = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(c => c !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCenters([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedDeviceTypes([]);
    setSelectedManufacturers([]);
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

  const getExportData = () => {
    if (selectedIds.length > 0) {
      return filteredEquipment.filter(item => selectedIds.includes(item.id));
    }
    return filteredEquipment;
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

  const generateHTMLContent = () => {
    const visibleColumns = COLUMNS.filter(c => selectedColumns.includes(c.key));
    const exportData = getExportData();
    
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${reportTitle}</title>
  <style>
    body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 10px; }
    .meta { text-align: center; color: #6b7280; margin-bottom: 20px; }
    .stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 25px; flex-wrap: wrap; }
    .stat-card { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 15px 25px; border-radius: 10px; text-align: center; min-width: 120px; }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; opacity: 0.9; }
    .filters-applied { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
    .filters-applied h4 { margin: 0 0 8px 0; color: #0369a1; font-size: 14px; }
    .filter-tag { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; margin: 2px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 6px; text-align: center; }
    th { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; font-weight: bold; font-size: 12px; }
    tr:nth-child(even) { background: #f9fafb; }
    tr:hover { background: #e0f2fe; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .badge-a { background: #dcfce7; color: #166534; }
    .badge-b { background: #fef3c7; color: #92400e; }
    .badge-c { background: #fee2e2; color: #991b1b; }
    .badge-working { background: #dcfce7; color: #166534; }
    .badge-broken { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 30px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; }
    @media print { 
      body { margin: 5mm; background: white; } 
      .container { box-shadow: none; padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 ${reportTitle}</h1>
    <div class="meta">
      <div>تاريخ الإعداد: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}</div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${exportData.length}</div>
        <div class="stat-label">إجمالي الأجهزة</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${[...new Set(exportData.map(e => e.health_center_name))].length}</div>
        <div class="stat-label">عدد المراكز</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${exportData.filter(e => e.status === 'يعمل').length}</div>
        <div class="stat-label">أجهزة تعمل</div>
      </div>
    </div>

    ${(selectedCenters.length > 0 || filterCategory !== 'all' || filterManufacturer !== 'all') ? `
    <div class="filters-applied">
      <h4>🔍 الفلاتر المطبقة:</h4>
      ${selectedCenters.length > 0 ? selectedCenters.map(c => `<span class="filter-tag">${c}</span>`).join('') : ''}
      ${filterCategory !== 'all' ? `<span class="filter-tag">الفئة: ${filterCategory}</span>` : ''}
      ${filterManufacturer !== 'all' ? `<span class="filter-tag">الشركة: ${filterManufacturer}</span>` : ''}
    </div>
    ` : ''}
    
    <table>
      <thead>
        <tr>
          ${visibleColumns.map(col => `<th>${col.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${exportData.map((item, index) => `
          <tr>
            ${visibleColumns.map(col => {
              if (col.key === 'index') return `<td>${index + 1}</td>`;
              if (col.key === 'category') return `<td><span class="badge badge-${(item.category || '').toLowerCase()}">${item.category || '-'}</span></td>`;
              if (col.key === 'status') return `<td><span class="badge ${item.status === 'يعمل' ? 'badge-working' : 'badge-broken'}">${item.status || '-'}</span></td>`;
              if (col.key === 'manufacturing_date') return `<td>${item.manufacturing_date || item.manufacturing_year || '-'}</td>`;
              return `<td>${item[col.key] || '-'}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <p>نظام إدارة المراكز الصحية - قطاع الحناكية الصحي</p>
    </div>
  </div>
</body>
</html>`;
  };

  const exportToHTML = () => {
    const html = generateHTMLContent();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s/g, '_')}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير التقرير بنجاح");
  };

  const exportToExcel = () => {
    const visibleColumns = COLUMNS.filter(c => selectedColumns.includes(c.key));
    const headers = visibleColumns.map(c => c.label);
    const exportData = getExportData();
    
    let csv = "\uFEFF" + headers.join(",") + "\n";
    
    exportData.forEach((item, index) => {
      const row = visibleColumns.map(col => {
        if (col.key === 'index') return index + 1;
        if (col.key === 'manufacturing_date') return item.manufacturing_date || item.manufacturing_year || '';
        return item[col.key] || '';
      });
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s/g, '_')}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير التقرير بنجاح");
  };

  const handlePrint = () => {
    const html = generateHTMLContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePreview = () => {
    const html = generateHTMLContent();
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقارير الأجهزة الطبية</h1>
            <p className="text-gray-500 text-sm">إنشاء تقارير مخصصة عن الأجهزة الطبية في المراكز</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={loadData}>
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Report Title */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label>عنوان التقرير</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="أدخل عنوان التقرير"
                className="mt-1"
              />
            </div>
            <Button variant="outline" onClick={() => setShowColumnDialog(true)}>
              <Settings2 className="w-4 h-4 ml-2" />
              تخصيص الأعمدة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-purple-600" />
            فلترة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="بحث باسم الجهاز، الشركة، الموديل، الرقم التسلسلي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">الفئة</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="A">الفئة A</SelectItem>
                  <SelectItem value="B">الفئة B</SelectItem>
                  <SelectItem value="C">الفئة C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="يعمل">يعمل</SelectItem>
                  <SelectItem value="معطل">معطل</SelectItem>
                  <SelectItem value="تحت الصيانة">تحت الصيانة</SelectItem>
                  <SelectItem value="مستبعد">مستبعد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">الشركة المصنعة</Label>
              <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="جميع الشركات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الشركات</SelectItem>
                  {uniqueManufacturers.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">نوع الجهاز</Label>
              <Select value={filterDeviceType} onValueChange={setFilterDeviceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {uniqueDeviceTypes.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Centers Selection */}
          <div>
            <Label className="text-xs mb-2 block">المراكز الصحية (اختر المراكز المطلوبة)</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
              {uniqueCenterNames.map((center) => (
                <Badge
                  key={center}
                  variant={selectedCenters.includes(center) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedCenters.includes(center) 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "hover:bg-purple-50"
                  }`}
                  onClick={() => toggleCenter(center)}
                >
                  <Building2 className="w-3 h-3 ml-1" />
                  {center}
                </Badge>
              ))}
            </div>
            {selectedCenters.length > 0 && (
              <p className="text-xs text-purple-600 mt-1">تم اختيار {selectedCenters.length} مركز</p>
            )}
          </div>

          {/* Clear Filters */}
          {(selectedCenters.length > 0 || filterCategory !== 'all' || filterStatus !== 'all' || filterManufacturer !== 'all' || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600">
              <X className="w-4 h-4 ml-1" />
              مسح جميع الفلاتر
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              نتائج التقرير ({filteredEquipment.length} جهاز)
              {selectedIds.length > 0 && (
                <Badge className="bg-purple-100 text-purple-800">محدد: {selectedIds.length}</Badge>
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button variant="outline" size="sm" onClick={exportToHTML}>
                <FileText className="w-4 h-4 ml-2" />
                HTML
              </Button>
              <Button size="sm" onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                Excel
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEquipment.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="border p-2 text-center w-10">
                      <button onClick={handleSelectAll} className="hover:text-purple-600 transition-colors">
                        {selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    {COLUMNS.filter(c => selectedColumns.includes(c.key)).map((col) => (
                      <th key={col.key} className="border p-2 text-right text-xs font-bold">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.slice(0, 50).map((item, index) => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${selectedIds.includes(item.id) ? 'bg-purple-50' : ''}`}>
                      <td className="border p-2 text-center">
                        <button onClick={() => handleSelectItem(item.id)} className="hover:text-purple-600 transition-colors">
                          {selectedIds.includes(item.id) ? (
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      {COLUMNS.filter(c => selectedColumns.includes(c.key)).map((col) => (
                        <td key={col.key} className="border p-2 text-xs">
                          {col.key === 'index' && index + 1}
                          {col.key === 'category' && item.category && (
                            <Badge className={getCategoryBadge(item.category)}>{item.category}</Badge>
                          )}
                          {col.key === 'status' && (
                            <Badge className={getStatusBadge(item.status)}>{item.status || '-'}</Badge>
                          )}
                          {col.key === 'manufacturing_date' && (item.manufacturing_date || item.manufacturing_year || '-')}
                          {!['index', 'category', 'status', 'manufacturing_date'].includes(col.key) && (item[col.key] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEquipment.length > 50 && (
                <p className="text-center text-gray-500 mt-4 text-sm">
                  يتم عرض أول 50 نتيجة من أصل {filteredEquipment.length} - قم بالتصدير لرؤية جميع النتائج
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد نتائج تطابق معايير البحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Selection Dialog */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تخصيص أعمدة التقرير</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {COLUMNS.map((col) => (
              <div key={col.key} className="flex items-center gap-3">
                <Checkbox
                  id={col.key}
                  checked={selectedColumns.includes(col.key)}
                  onCheckedChange={() => toggleColumn(col.key)}
                />
                <Label htmlFor={col.key} className="cursor-pointer">{col.label}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedColumns(COLUMNS.filter(c => c.default).map(c => c.key))}>
              إعادة التعيين
            </Button>
            <Button onClick={() => setShowColumnDialog(false)}>تم</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}