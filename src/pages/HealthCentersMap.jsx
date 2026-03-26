import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2 } from 'lucide-react';
import HealthCentersMapView from '@/components/health_centers/HealthCentersMapView';

export default function HealthCentersMap() {
  const [centers, setCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCenters = async () => {
      const data = await base44.entities.HealthCenter.list('-updated_date', 500);
      setCenters(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };

    loadCenters();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل مواقع المراكز الصحية...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            خريطة المراكز الصحية
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            عرض تفاعلي لمواقع جميع المراكز الصحية المسجلة على الخريطة
          </p>
        </div>

        {centers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد مراكز تحتوي على بيانات لعرضها حالياً.</p>
            </CardContent>
          </Card>
        ) : (
          <HealthCentersMapView centers={centers} />
        )}
      </div>
    </div>
  );
}