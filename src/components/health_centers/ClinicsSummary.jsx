import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Stethoscope, Users, Clock, Plus, Settings, 
  CheckCircle, XCircle, DoorOpen 
} from 'lucide-react';

export default function ClinicsSummary({ healthCenterId, healthCenterName }) {
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (healthCenterId) {
      loadClinics();
    }
  }, [healthCenterId]);

  const loadClinics = async () => {
    setIsLoading(true);
    try {
      if (!base44.entities.Clinic) {
        console.warn('Clinic entity not found');
        setClinics([]);
        setIsLoading(false);
        return;
      }
      const data = await base44.entities.Clinic.filter({ health_center_id: healthCenterId });
      setClinics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading clinics:', error);
      setClinics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeClinics = clinics.filter(c => c.is_active !== false);
  const inactiveClinics = clinics.filter(c => c.is_active === false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-600" />
            العيادات والأقسام
            <Badge className="bg-green-100 text-green-800">{activeClinics.length} نشطة</Badge>
          </CardTitle>
          <Link to={createPageUrl(`ClinicManagement?center=${healthCenterId}`)}>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              إدارة العيادات
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {clinics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد عيادات مسجلة</p>
            <Link to={createPageUrl(`ClinicManagement?center=${healthCenterId}`)}>
              <Button variant="link" className="mt-2 gap-2">
                <Plus className="w-4 h-4" />
                إضافة عيادات
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeClinics.map(clinic => (
              <div 
                key={clinic.id} 
                className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{clinic.clinic_name}</h4>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-2 text-sm">
                  <Badge variant="outline" className="text-xs">{clinic.clinic_type}</Badge>
                  
                  {clinic.responsible_doctor_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{clinic.responsible_doctor_name}</span>
                    </div>
                  )}
                  
                  {clinic.room_number && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DoorOpen className="w-3 h-3" />
                      <span>غرفة {clinic.room_number}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-3 h-3" />
                    <span>{clinic.assigned_employees?.length || 0} موظف</span>
                  </div>
                </div>
              </div>
            ))}
            
            {inactiveClinics.length > 0 && (
              <div className="col-span-full mt-4">
                <p className="text-sm text-gray-500 mb-2">عيادات متوقفة ({inactiveClinics.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {inactiveClinics.map(clinic => (
                    <Badge key={clinic.id} variant="outline" className="bg-gray-100 text-gray-600">
                      <XCircle className="w-3 h-3 ml-1" />
                      {clinic.clinic_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}