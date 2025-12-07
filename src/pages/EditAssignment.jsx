import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { HealthCenter } from "@/entities/HealthCenter";
import { Assignment } from "@/entities/Assignment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [assignmentData, setAssignmentData] = useState(null);
  const [healthCenters, setHealthCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (!id) {
          navigate(createPageUrl("Assignments"));
          return;
        }
        
        const [assignment, centers] = await Promise.all([
          Assignment.get(id),
          HealthCenter.list()
        ]);

        setAssignmentData(assignment);
        setHealthCenters(Array.isArray(centers) ? centers : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [location.search, navigate]);
  
  const handleChange = (field, value) => {
    setAssignmentData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (assignmentData?.start_date && assignmentData?.end_date) {
      const start = new Date(assignmentData.start_date);
      const end = new Date(assignmentData.end_date);
      if (start <= end) {
        setAssignmentData(prev => ({
          ...prev,
          duration_days: differenceInDays(end, start) + 1
        }));
      } else {
        setAssignmentData(prev => ({ ...prev, duration_days: 0 }));
      }
    }
  }, [assignmentData?.start_date, assignmentData?.end_date]);

  const handleSubmit = async () => {
    if (!assignmentData) return;
    
    // التحقق من حالة الاعتماد
    if (assignmentData.approval_status === 'approved') {
      setPendingChanges(assignmentData);
      setShowEditConfirm(true);
      return;
    }
    
    // إذا كان مسودة أو بدون حالة، احفظ مباشرة
    await saveChanges(assignmentData);
  };

  const saveChanges = async (data) => {
    try {
      await Assignment.update(data.id, data);
      alert("تم تحديث التكليف بنجاح");
      navigate(createPageUrl(`ViewAssignment?id=${data.id}`));
    } catch (error) {
      alert("فشل في تحديث التكليف: " + error.message);
    }
  };

  const handleApprove = async () => {
    try {
      const user = await base44.auth.me();
      await Assignment.update(assignmentData.id, {
        ...assignmentData,
        approval_status: 'approved',
        approved_date: new Date().toISOString(),
        approved_by: user.email
      });
      alert("✅ تم اعتماد القرار بنجاح. أصبح القرار رسمياً ويظهر في التكاليف النشطة.");
      navigate(createPageUrl(`ViewAssignment?id=${assignmentData.id}`));
    } catch (error) {
      alert("فشل في اعتماد القرار: " + error.message);
    }
  };

  if (isLoading || !assignmentData) {
    return <div className="p-6">جاري تحميل بيانات التكليف...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Assignments"))}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>

          {(!assignmentData.approval_status || assignmentData.approval_status === 'draft') && (
            <Button 
              onClick={() => setShowApprovalConfirm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              اعتماد القرار
            </Button>
          )}

          {assignmentData.approval_status === 'approved' && (
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-3 h-3 ml-1" />
              قرار معتمد
            </Badge>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>تعديل التكليف</span>
              {(!assignmentData.approval_status || assignmentData.approval_status === 'draft') && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  مسودة
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <Label>اسم الموظف</Label>
              <Input readOnly value={assignmentData.employee_name} className="bg-gray-100"/>
            </div>

            <Card className="bg-gray-50 p-4 md:col-span-2">
                <p><strong>الرقم الوظيفي:</strong> {assignmentData.employee_national_id}</p>
                <p><strong>المركز الحالي:</strong> {assignmentData.from_health_center}</p>
            </Card>

            <div className="md:col-span-2">
              <Label htmlFor="assigned-center">المركز المكلف به *</Label>
              <Select 
                required
                onValueChange={(value) => handleChange("assigned_to_health_center", value)} 
                value={assignmentData.assigned_to_health_center}
              >
                <SelectTrigger id="assigned-center"><SelectValue placeholder="اختر المركز..." /></SelectTrigger>
                <SelectContent>
                  {(healthCenters || []).map(center => (
                    <SelectItem key={center.id} value={center.اسم_المركز}>{center.اسم_المركز}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">تاريخ بداية التكليف *</Label>
              <Input id="start-date" type="date" required value={assignmentData.start_date} onChange={(e) => handleChange("start_date", e.target.value)}/>
            </div>
            <div>
              <Label htmlFor="end-date">تاريخ نهاية التكليف *</Label>
              <Input id="end-date" type="date" required value={assignmentData.end_date} onChange={(e) => handleChange("end_date", e.target.value)}/>
            </div>

            <div>
              <Label>مدة التكليف (أيام)</Label>
              <Input type="number" readOnly value={assignmentData.duration_days} className="bg-gray-100" />
            </div>
            <div>
              <Label>تاريخ إصدار القرار</Label>
              <Input type="date" value={assignmentData.issue_date} onChange={e => handleChange("issue_date", e.target.value)} />
            </div>
            
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6 gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate(createPageUrl(`ViewAssignment?id=${assignmentData.id}`))}>إلغاء</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                حفظ التعديلات
            </Button>
        </div>

        {/* Approval Confirmation Dialog */}
        <AlertDialog open={showApprovalConfirm} onOpenChange={setShowApprovalConfirm}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                تأكيد اعتماد القرار
              </AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من اعتماد هذا القرار؟ بعد الاعتماد سيصبح القرار رسمياً ويظهر في التكاليف النشطة، ولن يمكن التعديل عليه إلا بعد تأكيد خاص.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                نعم، اعتماد القرار
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Approved Assignment Confirmation */}
        <AlertDialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                تحذير: تعديل قرار معتمد
              </AlertDialogTitle>
              <AlertDialogDescription>
                هذا القرار صدر بشكل رسمي. هل تريد التعديل عليه؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingChanges(null)}>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  saveChanges(pendingChanges);
                  setShowEditConfirm(false);
                  setPendingChanges(null);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                نعم، التعديل على القرار الرسمي
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}