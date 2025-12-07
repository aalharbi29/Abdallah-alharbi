
import React, { useState, useEffect } from "react";
import { HealthCenter } from "@/entities/HealthCenter";
import { Employee } from "@/entities/Employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Printer, AlertTriangle, RefreshCw, Loader2, Building2, Filter, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import HealthCenterCard from "../components/health_centers/HealthCenterCard";
import HealthCenterForm from "../components/health_centers/HealthCenterForm";
import ExportManager from "../components/export/ExportManager";
import CustomExportManager from "../components/export/CustomExportManager";

const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return retry(fn, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};

export default function HealthCenters() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    ownership: "all",
    remote: "all"
  });
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('🔄 بدء تحميل المراكز الصحية والموظفين...');
      
      const [centersData, employeesData] = await Promise.allSettled([
        retry(() => HealthCenter.list("-updated_date", 500)),
        retry(() => Employee.list("-updated_date", 500))
      ]);

      console.log('📊 نتائج التحميل الخام:', {
        centersStatus: centersData.status,
        centersValue: centersData.status === 'fulfilled' ? centersData.value : null,
        centersCount: centersData.status === 'fulfilled' && Array.isArray(centersData.value) ? centersData.value.length : 0,
        employeesStatus: employeesData.status,
        employeesCount: employeesData.status === 'fulfilled' && Array.isArray(employeesData.value) ? employeesData.value.length : 0
      });

      // معالجة المراكز
      let safeHealthCenters = [];
      if (centersData.status === 'fulfilled') {
        safeHealthCenters = Array.isArray(centersData.value) ? centersData.value : [];
        console.log(`✅ تم تحميل ${safeHealthCenters.length} مركز صحي`);
        
        // طباعة أول 3 مراكز للتأكد
        if (safeHealthCenters.length > 0) {
          console.log('📋 عينة من المراكز:', safeHealthCenters.slice(0, 3).map(c => ({
            id: c.id,
            اسم_المركز: c.اسم_المركز,
            الموقع: c.الموقع
          })));
        }
      } else {
        console.error('❌ فشل تحميل المراكز:', centersData.reason);
        throw new Error("فشل تحميل بيانات المراكز الصحية: " + (centersData.reason?.message || 'خطأ غير معروف'));
      }

      setHealthCenters(safeHealthCenters);

      // معالجة الموظفين
      const safeEmployees = employeesData.status === 'fulfilled' && Array.isArray(employeesData.value) 
        ? employeesData.value 
        : [];
      
      console.log(`✅ تم تحميل ${safeEmployees.length} موظف`);
      setEmployees(safeEmployees);

      // معلومات تشخيص
      setDebugInfo({
        totalCenters: safeHealthCenters.length,
        totalEmployees: safeEmployees.length,
        centersWithNames: safeHealthCenters.filter(c => c && c.اسم_المركز).length,
        centerNames: safeHealthCenters.map(c => c ? c.اسم_المركز : null).filter(Boolean).slice(0, 5)
      });

      // تحذير إذا لم يتم العثور على مراكز
      if (safeHealthCenters.length === 0) {
        console.warn('⚠️ لم يتم العثور على أي مراكز في قاعدة البيانات');
        setError("لم يتم العثور على أي مراكز صحية في النظام. يرجى إضافة مراكز جديدة.");
      } else {
        console.log(`✅ تم تحميل ${safeHealthCenters.length} مركز بنجاح`);
      }

    } catch (err) {
      console.error("❌ خطأ في تحميل البيانات:", err);
      setError(err.message || "فشل في تحميل البيانات. قد يكون بسبب مشكلة في الشبكة، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCenterSubmit = async (centerData) => {
    try {
      if (editingCenter) {
        await HealthCenter.update(editingCenter.id, centerData);
      } else {
        await HealthCenter.create(centerData);
      }
      setShowCenterForm(false);
      setEditingCenter(null);
      loadData();
    } catch (err) {
      console.error('خطأ في حفظ المركز:', err);
      alert("فشل حفظ بيانات المركز: " + (err.message || 'خطأ غير معروف'));
    }
  };

  const handleEditCenter = (center) => {
    setEditingCenter(center);
    setShowCenterForm(true);
  };

  const filteredCenters = healthCenters.filter(center => {
    if (!center) return false;
    
    // البحث النصي
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchQuery ||
      (center.اسم_المركز && center.اسم_المركز.toLowerCase().includes(searchLower)) ||
      (center.الموقع && center.الموقع.toLowerCase().includes(searchLower)) ||
      (center.center_code && center.center_code.includes(searchQuery)) ||
      (center.organization_code && center.organization_code.includes(searchQuery));

    // الفلاتر
    const matchesStatus = filters.status === "all" || center.حالة_التشغيل === filters.status;
    const matchesOwnership = filters.ownership === "all" || center.حالة_المركز === filters.ownership;
    const matchesRemote = filters.remote === "all" || 
      (filters.remote === "yes" && center.مركز_نائي === true) ||
      (filters.remote === "no" && center.مركز_نائي !== true);

    return matchesSearch && matchesStatus && matchesOwnership && matchesRemote;
  });

  // عرض رسالة خطأ مع إمكانية إعادة التحميل
  if (error && !healthCenters.length && !isLoading) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center bg-gray-100">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTriangle className="h-4 h-4" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <p className="font-semibold mb-2">حدث خطأ:</p>
              <p>{error}</p>
            </div>
            
            {debugInfo && (
              <div className="bg-red-50 p-3 rounded text-sm">
                <p className="font-semibold mb-1">معلومات التشخيص:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>عدد المراكز المحملة: {debugInfo.totalCenters}</li>
                  <li>عدد الموظفين المحملين: {debugInfo.totalEmployees}</li>
                  <li>مراكز بأسماء: {debugInfo.centersWithNames}</li>
                  {debugInfo.centerNames.length > 0 && (
                    <li>أمثلة: {debugInfo.centerNames.filter(Boolean).join(', ') || 'لا توجد'}</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={loadData} variant="default" size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-2" />}
                إعادة المحاولة
              </Button>
              <Button onClick={() => { setEditingCenter(null); setShowCenterForm(true); }} variant="outline" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مركز جديد
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showCenterForm) {
    return <HealthCenterForm 
      center={editingCenter} 
      onSubmit={handleCenterSubmit} 
      onCancel={() => { setShowCenterForm(false); setEditingCenter(null); }} 
      employees={employees} 
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">دليل المراكز الصحية</h1>
            <p className="text-lg text-gray-600">دليل شامل لجميع المراكز الصحية ومعلوماتها التفصيلية</p>
            
            {/* معلومات تشخيص */}
            {debugInfo && (
              <div className="mt-2 text-sm text-gray-500">
                📊 {healthCenters.length} مركز • {employees.length} موظف
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={loadData} variant="outline" disabled={isLoading} title="تحديث البيانات">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <CustomExportManager data={filteredCenters} filename="دليل_المراكز_الصحية" type="healthcenters"/>
            <ExportManager data={filteredCenters} filename="دليل_المراكز_الصحية"/>
            <Button onClick={() => window.print()} variant="outline">
              <Printer className="w-4 h-4 ml-2" />طباعة
            </Button>
            <Button onClick={() => { setEditingCenter(null); setShowCenterForm(true); }} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />مركز جديد
            </Button>
          </div>
        </header>

        {/* Error Alert */}
        {error && healthCenters.length > 0 && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center gap-2">
              <span className="text-sm text-yellow-800">{error}</span>
              <Button onClick={loadData} variant="outline" size="sm" className="mr-auto" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3"/>}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">إجمالي المراكز</p>
                  <p className="text-3xl font-bold">{filteredCenters.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">المراكز النشطة</p>
                  <p className="text-3xl font-bold">{filteredCenters.filter(c => c.حالة_التشغيل === 'نشط').length}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">المراكز النائية</p>
                  <p className="text-3xl font-bold">{filteredCenters.filter(c => c.مركز_نائي).length}</p>
                </div>
                <Building2 className="w-12 h-12 text-amber-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">إجمالي الموظفين</p>
                  <p className="text-3xl font-bold">{employees.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="text-gray-600" />
              البحث والفلترة
              {searchQuery || filters.status !== "all" || filters.ownership !== "all" || filters.remote !== "all" ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({ status: "all", ownership: "all", remote: "all" });
                  }}
                  className="mr-auto text-xs"
                >
                  مسح الفلاتر
                </Button>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="🔎 ابحث بالاسم، الموقع، أو الأكواد..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pr-10" 
                />
              </div>

              <Select value={filters.status} onValueChange={val => setFilters({...filters, status: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة التشغيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="متوقف مؤقتاً">متوقف مؤقتاً</SelectItem>
                  <SelectItem value="قيد الصيانة">قيد الصيانة</SelectItem>
                  <SelectItem value="مغلق">مغلق</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.ownership} onValueChange={val => setFilters({...filters, ownership: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الملكية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="حكومي">حكومي</SelectItem>
                  <SelectItem value="مستأجر">مستأجر</SelectItem>
                  <SelectItem value="ملك خاص">ملك خاص</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.remote} onValueChange={val => setFilters({...filters, remote: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراكز</SelectItem>
                  <SelectItem value="yes">المراكز النائية</SelectItem>
                  <SelectItem value="no">المراكز غير النائية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Centers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-4">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCenters.map((center) => (
              <HealthCenterCard 
                key={center.id} 
                center={center} 
                employees={employees}
                onEdit={handleEditCenter}
                onDataChange={loadData}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCenters.length === 0 && healthCenters.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد مراكز صحية</h3>
            <p className="text-gray-400 mb-6">لم يتم إضافة أي مراكز صحية بعد</p>
            <Button onClick={() => { setEditingCenter(null); setShowCenterForm(true); }} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مركز جديد
            </Button>
          </div>
        )}

        {/* Filtered Empty State */}
        {!isLoading && filteredCenters.length === 0 && healthCenters.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400 mb-6">لم يتم العثور على مراكز تطابق معايير البحث ({healthCenters.length} مركز في النظام)</p>
            <Button onClick={() => { setSearchQuery(""); setFilters({status: "all", ownership: "all", remote: "all"}); }}>
              مسح الفلاتر
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
