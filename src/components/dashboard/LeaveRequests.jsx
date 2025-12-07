
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors = {
  "في الانتظار": "bg-yellow-100 text-yellow-800",
  "معتمدة": "bg-green-100 text-green-800",
  "مرفوضة": "bg-red-100 text-red-800"
};

// statusLabels and leaveTypeLabels are no longer needed as the data fields
// are expected to contain the localized Arabic strings directly.

export default function LeaveRequests({ leaves, isLoading }) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          طلبات الإجازة الأخيرة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (leaves || []).length > 0 ? (
          <div className="space-y-3">
            {(leaves || []).map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{leave.اسم_الموظف}</p>
                    <p className="text-sm text-gray-500">
                      {leave.نوع_الاجازة} • {leave.عدد_الايام || 'N/A'} أيام
                    </p>
                    {leave.تاريخ_البداية && leave.تاريخ_النهاية &&
                      <p className="text-xs text-gray-400">
                        {format(new Date(leave.تاريخ_البداية), "d MMM", { locale: ar })} - 
                        {format(new Date(leave.تاريخ_النهاية), "d MMM", { locale: ar })}
                      </p>
                    }
                  </div>
                </div>
                <Badge className={statusColors[leave.الحالة]}>
                  {leave.الحالة}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            لا توجد طلبات إجازة
          </div>
        )}
      </CardContent>
    </Card>
  );
}
