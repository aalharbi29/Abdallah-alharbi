import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HealthCenter } from "@/entities/HealthCenter";
import { Employee } from "@/entities/Employee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import HealthCenterForm from "@/components/health_centers/HealthCenterForm";

export default function HealthCenterEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(location.search);
      const centerId = params.get('id');
      
      if (!centerId) {
        navigate(createPageUrl("HealthCenters"));
        return;
      }

      try {
        const [centerData, employeesData] = await Promise.all([
          HealthCenter.get(centerId),
          Employee.list()
        ]);
        
        setCenter(centerData);
        setEmployees(employeesData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [location, navigate]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await HealthCenter.update(center.id, formData);
      navigate(createPageUrl(`HealthCenterDetails?id=${center.id}`));
    } catch (error) {
      console.error("Error updating center:", error);
      alert("حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">لم يتم العثور على المركز</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(createPageUrl(`HealthCenterDetails?id=${center.id}`))}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">تعديل بيانات المركز</h1>
            <p className="text-gray-600">{center.اسم_المركز}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تعديل المعلومات</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthCenterForm
              center={center}
              employees={employees}
              onSubmit={handleSave}
              onCancel={() => navigate(createPageUrl(`HealthCenterDetails?id=${center.id}`))}
              isSubmitting={isSaving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}