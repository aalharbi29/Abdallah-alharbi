import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building2, Download, Printer, BarChart3,
  Grid3x3, Table, Presentation, Filter, Settings, X, Check
} from 'lucide-react';



const availableFields = [
  { key: 'اسم_المركز', label: 'اسم المركز', category: 'basic', default: true },
  { key: 'الموقع', label: 'الموقع', category: 'basic', default: true },
  { key: 'seha_id', label: 'SEHA ID', category: 'basic', default: false },
  { key: 'center_code', label: 'كود المركز', category: 'basic', default: false },
  { key: 'organization_code', label: 'الرقم الوزاري', category: 'basic', default: false },
  { key: 'خط_الطول', label: 'خط الطول', category: 'basic', default: false },
  { key: 'خط_العرض', label: 'خط العرض', category: 'basic', default: false },
  { key: 'موقع_الخريطة', label: 'رابط الخريطة', category: 'basic', default: false },
  { key: 'حالة_التشغيل', label: 'حالة التشغيل', category: 'basic', default: true },
  { key: 'حالة_المركز', label: 'نوع الملكية', category: 'basic', default: true },
  { key: 'مركز_نائي', label: 'مركز نائي', category: 'basic', default: false },
  { key: 'هاتف_المركز', label: 'الهاتف الرئيسي', category: 'contact', default: true },
  { key: 'رقم_الشريحة', label: 'رقم الشريحة', category: 'contact', default: true },
  { key: 'رقم_الجوال', label: 'رقم الجوال', category: 'contact', default: true },
  { key: 'رقم_الهاتف_الثابت', label: 'الهاتف الثابت الإضافي', category: 'contact', default: false },
  { key: 'ايميل_المركز', label: 'البريد الإلكتروني', category: 'contact', default: false },
  { key: 'فاكس_المركز', label: 'الفاكس', category: 'contact', default: false },
  { key: 'المدير', label: 'المدير', category: 'leadership', default: true },
  { key: 'نائب_المدير', label: 'نائب المدير', category: 'leadership', default: false },
  { key: 'المشرف_الفني', label: 'المشرف الفني', category: 'leadership', default: false },
  { key: 'عدد_الموظفين', label: 'عدد الموظفين', category: 'stats', default: true },
  { key: 'سيارة_خدمات', label: 'سيارة الخدمات', category: 'vehicles', default: false },
  { key: 'سيارة_اسعاف', label: 'سيارة الإسعاف', category: 'vehicles', default: false },
];

export default function HealthCentersReport() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter(f => f.default).map(f => f.key)
  );
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'table', 'presentation', 'stats'
  const [isLoading, setIsLoading] = useState(true);
  const [reportTitle, setReportTitle] = useState('تقرير المراكز الصحية');
  const [colorScheme, setColorScheme] = useState('blue');
  const [showFilters, setShowFilters] = useState(true);
  const [pageOrientation, setPageOrientation] = useState('portrait'); // 'portrait' or 'landscape'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [centersData, employeesData] = await Promise.all([
        base44.entities.HealthCenter.list('-updated_date', 500),
        base44.entities.Employee.list('-updated_date', 1000)
      ]);
      setHealthCenters(Array.isArray(centersData) ? centersData : []);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeById = (id) => {
    return employees.find(emp => emp.id === id);
  };

  const getCenterEmployeesCount = (centerName) => {
    return employees.filter(emp => emp.المركز_الصحي === centerName).length;
  };

  const processedCenters = useMemo(() => {
    const centersToProcess = selectedCenters.length > 0
      ? healthCenters.filter(c => selectedCenters.includes(c.id))
      : healthCenters;

    return centersToProcess.map(center => {
      const manager = getEmployeeById(center.المدير);
      const deputyManager = getEmployeeById(center.نائب_المدير);
      const technicalSupervisor = getEmployeeById(center.المشرف_الفني);
      const employeesCount = getCenterEmployeesCount(center.اسم_المركز);

      return {
        ...center,
        المدير: manager
          ? [
              manager.full_name_arabic || '',
              manager.phone ? `جوال: ${manager.phone}` : null,
              manager.email ? `إيميل: ${manager.email}` : null,
            ].filter(Boolean).join(' | ')
          : 'غير محدد',
        نائب_المدير: deputyManager
          ? [
              deputyManager.full_name_arabic || '',
              deputyManager.phone ? `جوال: ${deputyManager.phone}` : null,
              deputyManager.email ? `إيميل: ${deputyManager.email}` : null,
            ].filter(Boolean).join(' | ')
          : 'غير محدد',
        المشرف_الفني: technicalSupervisor
          ? [
              technicalSupervisor.full_name_arabic || '',
              technicalSupervisor.phone ? `جوال: ${technicalSupervisor.phone}` : null,
              technicalSupervisor.email ? `إيميل: ${technicalSupervisor.email}` : null,
            ].filter(Boolean).join(' | ')
          : 'غير محدد',
        عدد_الموظفين: employeesCount,
        سيارة_خدمات: center.سيارة_خدمات?.متوفرة ? 'متوفرة' : 'غير متوفرة',
        سيارة_اسعاف: center.سيارة_اسعاف?.متوفرة ? 'متوفرة' : 'غير متوفرة',
      };
    });
  }, [healthCenters, selectedCenters, employees]);

  const toggleCenter = (centerId) => {
    if (selectedCenters.includes(centerId)) {
      setSelectedCenters(selectedCenters.filter(id => id !== centerId));
    } else {
      setSelectedCenters([...selectedCenters, centerId]);
    }
  };

  const selectAllCenters = () => {
    setSelectedCenters(healthCenters.map(c => c.id));
  };

  const clearAllCenters = () => {
    setSelectedCenters([]);
  };

  const toggleField = (fieldKey) => {
    if (selectedFields.includes(fieldKey)) {
      setSelectedFields(selectedFields.filter(k => k !== fieldKey));
    } else {
      setSelectedFields([...selectedFields, fieldKey]);
    }
  };

  const handlePrint = () => {
    // تطبيق اتجاه الصفحة قبل الطباعة
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4 ${pageOrientation};
          margin: 15mm;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    // إزالة النمط بعد الطباعة
    // Use a timeout to ensure the print dialog has time to open
    // before the style is removed. A small delay is usually sufficient.
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const exportToPDF = () => {
    handlePrint(); // سيستخدم نفس إعدادات الطباعة
  };

  const exportToExcel = () => {
    const headers = selectedFields.map(key =>
      availableFields.find(f => f.key === key)?.label || key
    ).join(',');

    const rows = processedCenters.map(center =>
      selectedFields.map(key => `"${center[key] || ''}"`.replace(/"/g, '""')).join(',')
    ).join('\n');

    const csvContent = "\ufeff" + headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_المراكز_الصحية_${new Date().toLocaleDateString('ar-SA')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const colorSchemes = {
    blue: { primary: 'from-blue-500 to-blue-600', secondary: 'bg-blue-50', text: 'text-blue-600' },
    green: { primary: 'from-green-500 to-green-600', secondary: 'bg-green-50', text: 'text-green-600' },
    purple: { primary: 'from-purple-500 to-purple-600', secondary: 'bg-purple-50', text: 'text-purple-600' },
    red: { primary: 'from-red-500 to-red-600', secondary: 'bg-red-50', text: 'text-red-600' },
  };

  const currentScheme = colorSchemes[colorScheme];

  // Cards View Component
  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {processedCenters.map(center => (
        <Card key={center.id} className="hover:shadow-xl transition-shadow">
          <CardHeader className={`bg-gradient-to-r ${currentScheme.primary} text-white`}>
            <CardTitle className="text-lg">{center.اسم_المركز}</CardTitle>
            <CardDescription className="text-white/90 text-sm">
              {center.الموقع}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {selectedFields.map(key => {
              if (key === 'اسم_المركز' || key === 'الموقع') return null;
              const field = availableFields.find(f => f.key === key);
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{field?.label}:</span>
                  <span className="font-medium">
                    {field?.key === 'موقع_الخريطة' && center[key] ? (
                      <a
                        href={center[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        عرض الخريطة
                      </a>
                    ) : (
                      center[key] || '-'
                    )}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Table View Component
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className={`bg-gradient-to-r ${currentScheme.primary} text-white`}>
            {selectedFields.map(key => {
              const field = availableFields.find(f => f.key === key);
              return (
                <th key={key} className="border border-gray-300 px-4 py-3 text-right font-semibold">
                  {field?.label || key}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {processedCenters.map((center, idx) => (
            <tr key={center.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {selectedFields.map(key => (
                <td key={key} className="border border-gray-300 px-4 py-2 text-sm">
                  {key === 'موقع_الخريطة' && center[key] ? (
                    <a
                      href={center[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      عرض الخريطة
                    </a>
                  ) : (
                    typeof center[key] === 'string' ? center[key] : (center[key] || '-')
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Presentation View Component
  const PresentationView = () => (
    <div className="space-y-8">
      {processedCenters.map((center, idx) => (
        <div key={center.id} className={`min-h-[500px] p-8 rounded-lg shadow-2xl ${currentScheme.secondary} print-page-break`}>
          <div className={`text-center mb-8 pb-4 border-b-4 border-${colorScheme}-500`}>
            <h2 className={`text-3xl font-bold ${currentScheme.text} mb-2`}>
              {center.اسم_المركز}
            </h2>
            <p className="text-gray-600 text-lg">{center.الموقع}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {selectedFields.map(key => {
              if (key === 'اسم_المركز' || key === 'الموقع') return null;
              const field = availableFields.find(f => f.key === key);
              return (
                <div key={key} className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">{field?.label}</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {field?.key === 'موقع_الخريطة' && center[key] ? (
                      <a
                        href={center[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        عرض الخريطة
                      </a>
                    ) : (
                      center[key] || '-'
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            صفحة {idx + 1} من {processedCenters.length}
          </div>
        </div>
      ))}
    </div>
  );

  // Statistics View Component
  const StatsView = () => {
    const stats = {
      total: processedCenters.length,
      active: processedCenters.filter(c => c.حالة_التشغيل === 'نشط').length,
      remote: processedCenters.filter(c => c.مركز_نائي).length,
      government: processedCenters.filter(c => c.حالة_المركز === 'حكومي').length,
      totalEmployees: processedCenters.reduce((sum, c) => sum + (c.عدد_الموظفين || 0), 0),
      withServiceCar: processedCenters.filter(c => c.سيارة_خدمات === 'متوفرة').length,
      withAmbulance: processedCenters.filter(c => c.سيارة_اسعاف === 'متوفرة').length,
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${currentScheme.text}`}>{stats.total}</div>
                <div className="text-sm text-gray-600 mt-2">إجمالي المراكز</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600 mt-2">المراكز النشطة</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">{stats.remote}</div>
                <div className="text-sm text-gray-600 mt-2">المراكز النائية</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{stats.totalEmployees}</div>
                <div className="text-sm text-gray-600 mt-2">إجمالي الموظفين</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المراكز</CardTitle>
          </CardHeader>
          <CardContent>
            <TableView />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-page-break {
            page-break-after: always;
          }
          @page {
            size: A4 ${pageOrientation};
            margin: 15mm;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 no-print">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">تقارير المراكز الصحية الاحترافية</h1>
          <p className="text-gray-600">أنشئ تقارير مخصصة وشاملة مع أنماط عرض متعددة</p>
        </div>

        {/* Controls */}
        {showFilters && (
          <Card className="no-print">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات التقرير
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Title */}
              <div>
                <Label>عنوان التقرير</Label>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Color Scheme */}
              <div>
                <Label>نظام الألوان</Label>
                <div className="flex gap-2 mt-2">
                  {Object.keys(colorSchemes).map(scheme => (
                    <Button
                      key={scheme}
                      variant={colorScheme === scheme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setColorScheme(scheme)}
                      // The class name for the selected scheme will be applied dynamically
                      // if Tailwind JIT mode is active or if classes are pre-compiled.
                      // For dynamic classes like `bg-${scheme}-600`, ensure Tailwind CSS is configured correctly.
                      // For this example, directly applied color classes might be needed if JIT is not set up for dynamic strings.
                      // However, `currentScheme.primary` handles it for other elements, so this is generally fine.
                    >
                      {scheme === 'blue' && 'أزرق'}
                      {scheme === 'green' && 'أخضر'}
                      {scheme === 'purple' && 'بنفسجي'}
                      {scheme === 'red' && 'أحمر'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Page Orientation */}
              <div>
                <Label>اتجاه الصفحة</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={pageOrientation === 'portrait' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPageOrientation('portrait')}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-6 border-2 border-current rounded"></div>
                    عمودي (طولي)
                  </Button>
                  <Button
                    variant={pageOrientation === 'landscape' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPageOrientation('landscape')}
                    className="flex items-center gap-2"
                  >
                    <div className="w-6 h-4 border-2 border-current rounded"></div>
                    أفقي (عرضي)
                  </Button>
                </div>
              </div>

              {/* Center Selection */}
              <div>
                <Label>اختيار المراكز</Label>
                <div className="flex gap-2 mt-2 mb-3">
                  <Button variant="outline" size="sm" onClick={selectAllCenters}>
                    <Check className="w-3 h-3 ml-1" />
                    تحديد الكل ({healthCenters.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllCenters}>
                    <X className="w-3 h-3 ml-1" />
                    إلغاء التحديد
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                  {healthCenters.map(center => (
                    <div key={center.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={center.id}
                        checked={selectedCenters.includes(center.id)}
                        onCheckedChange={() => toggleCenter(center.id)}
                      />
                      <Label htmlFor={center.id} className="cursor-pointer text-sm">
                        {center.اسم_المركز}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <Label>البيانات المراد عرضها</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableFields.map(field => (
                    <div key={field.key} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={field.key}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={() => toggleField(field.key)}
                      />
                      <Label htmlFor={field.key} className="cursor-pointer text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Mode */}
              <div>
                <Label>نمط العرض</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    onClick={() => setViewMode('cards')}
                    className="flex items-center gap-2"
                  >
                    <Grid3x3 className="w-4 h-4" />
                    بطاقات
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-2"
                  >
                    <Table className="w-4 h-4" />
                    جدول
                  </Button>
                  <Button
                    variant={viewMode === 'presentation' ? 'default' : 'outline'}
                    onClick={() => setViewMode('presentation')}
                    className="flex items-center gap-2"
                  >
                    <Presentation className="w-4 h-4" />
                    عرض تقديمي
                  </Button>
                  <Button
                    variant={viewMode === 'stats' ? 'default' : 'outline'}
                    onClick={() => setViewMode('stats')}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    إحصائي
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة ({pageOrientation === 'portrait' ? 'عمودي' : 'أفقي'})
                </Button>
                <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير Excel
                </Button>
                <Button onClick={exportToPDF} variant="outline">
                  <Download className="w-4 h-4 ml-2" />
                  حفظ PDF ({pageOrientation === 'portrait' ? 'عمودي' : 'أفقي'})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showFilters && (
          <div className="flex justify-center no-print">
            <Button onClick={() => setShowFilters(true)} variant="outline">
              <Filter className="w-4 h-4 ml-2" />
              إظهار الفلاتر
            </Button>
          </div>
        )}

        {/* Report Content */}
        <div className="print-area">
          <div className="text-center mb-6 print-show">
            <h1 className={`text-3xl font-bold ${currentScheme.text}`}>{reportTitle}</h1>
            <p className="text-gray-600 mt-2">تاريخ الإعداد: {new Date().toLocaleDateString('ar-SA')}</p>
          </div>

          {processedCenters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">لم يتم اختيار أي مراكز. يرجى اختيار مركز واحد على الأقل.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'cards' && <CardsView />}
              {viewMode === 'table' && <TableView />}
              {viewMode === 'presentation' && <PresentationView />}
              {viewMode === 'stats' && <StatsView />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}