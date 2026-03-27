import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Box, ArrowRight } from 'lucide-react';
import HealthCenter3DMapView from '@/components/health_centers/HealthCenter3DMapView';

export default function HealthCenterMap3D() {
  const location = useLocation();
  const [center, setCenter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCenter = async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (!id) {
        setIsLoading(false);
        return;
      }

      const data = await base44.entities.HealthCenter.get(id);
      setCenter(data || null);
      setIsLoading(false);
    };

    loadCenter();
  }, [location.search]);

  if (isLoading) {
    return <div className="p-6">جاري تحميل العرض ثلاثي الأبعاد...</div>;
  }

  if (!center) {
    return <div className="p-6">لم يتم العثور على المركز.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Box className="w-8 h-8 text-cyan-400" />
              العرض ثلاثي الأبعاد - {center['اسم_المركز']}
            </h1>
            <p className="text-slate-300 mt-2">عرض حقيقي بزاوية مائلة وتضاريس ثلاثية الأبعاد للموقع.</p>
          </div>
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
            <Link to={`/HealthCenterMapDetails?id=${center.id}`}>
              <ArrowRight className="w-4 h-4" />
              العودة للخريطة العادية
            </Link>
          </Button>
        </div>

        <Card className="bg-white/10 border-white/10 text-white">
          <CardHeader>
            <CardTitle>عرض ثلاثي الأبعاد</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthCenter3DMapView center={center} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}