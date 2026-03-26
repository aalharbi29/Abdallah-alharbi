import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CenterMapLegend from '@/components/health_centers/CenterMapLegend';
import CenterMapFilters from '@/components/health_centers/CenterMapFilters';
import HealthCenterDetailMapView from '@/components/health_centers/HealthCenterDetailMapView';

export default function HealthCenterMapDetails() {
  const location = useLocation();
  const [center, setCenter] = useState(null);
  const [importantPoints, setImportantPoints] = useState([]);
  const [epidemicCases, setEpidemicCases] = useState([]);
  const [search, setSearch] = useState('');
  const [showImportantPoints, setShowImportantPoints] = useState(true);
  const [showEpidemicCases, setShowEpidemicCases] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      const [centerData, pointsData, casesData] = await Promise.all([
        base44.entities.HealthCenter.get(id),
        base44.entities.CenterMapPoint.filter({ health_center_id: id }, '-updated_date', 500),
        base44.entities.EpidemicCasePoint.filter({ health_center_id: id }, '-updated_date', 500),
      ]);
      setCenter(centerData || null);
      setImportantPoints(Array.isArray(pointsData) ? pointsData : []);
      setEpidemicCases(Array.isArray(casesData) ? casesData : []);
      setIsLoading(false);
    };

    loadData();
  }, [location.search]);

  const filteredImportantPoints = useMemo(() => {
    if (!showImportantPoints) return [];
    return importantPoints.filter((item) => {
      const text = `${item.title || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [importantPoints, search, showImportantPoints]);

  const filteredEpidemicCases = useMemo(() => {
    if (!showEpidemicCases) return [];
    return epidemicCases.filter((item) => {
      const text = `${item.case_title || ''} ${item.disease_name || ''} ${item.notes || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [epidemicCases, search, showEpidemicCases]);

  if (isLoading) {
    return <div className="p-6">جاري تحميل خريطة المركز...</div>;
  }

  if (!center) {
    return <div className="p-6">لم يتم العثور على المركز.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الخريطة التفصيلية - {center['اسم_المركز']}</h1>
          <p className="text-gray-600">عرض المركز مع النقاط المهمة اليدوية والحالات الوبائية.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>خيارات العرض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CenterMapLegend />
            <CenterMapFilters
              search={search}
              onSearchChange={setSearch}
              showImportantPoints={showImportantPoints}
              onImportantPointsChange={setShowImportantPoints}
              showEpidemicCases={showEpidemicCases}
              onEpidemicCasesChange={setShowEpidemicCases}
            />
          </CardContent>
        </Card>

        <HealthCenterDetailMapView
          center={center}
          importantPoints={filteredImportantPoints}
          epidemicCases={filteredEpidemicCases}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>النقاط المهمة اليدوية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredImportantPoints.length ? filteredImportantPoints.map((point) => (
                <div key={point.id} className="rounded-lg border p-3">
                  <div className="font-semibold">{point.title}</div>
                  <div className="text-sm text-gray-600">{point.description || '—'}</div>
                </div>
              )) : <div className="text-sm text-gray-500">لا توجد نقاط حالياً.</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الحالات الوبائية على الخريطة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredEpidemicCases.length ? filteredEpidemicCases.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="font-semibold">{item.case_title}</div>
                  <div className="text-sm text-gray-600">{item.disease_name}</div>
                </div>
              )) : <div className="text-sm text-gray-500">لا توجد حالات حالياً.</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}