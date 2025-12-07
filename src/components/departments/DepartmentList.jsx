
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Users, MapPin, DollarSign, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentList({ departments, employees, onEdit, isLoading }) {
  const getDepartmentEmployeeCount = (departmentName) => {
    return employees.filter(emp => emp.department === departmentName).length;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.length > 0 ? (
        departments.map((department) => (
          <Card key={department.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{department.name_arabic}</h3>
                  {department.name_english && (
                    <p className="text-sm text-gray-500 mt-1">{department.name_english}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(department)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4">
                {department.manager && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">المدير:</span>
                    <span className="font-medium">{department.manager}</span>
                  </div>
                )}

                {department.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {department.location}
                  </div>
                )}

                {department.budget && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {department.budget.toLocaleString()} ريال
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {getDepartmentEmployeeCount(department.name_arabic)} موظف
                  </Badge>
                </div>

                {department.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                    {department.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full">
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أقسام مسجلة</h3>
              <p className="text-gray-500">ابدأ بإضافة أول قسم في المؤسسة</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
