import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, ShieldCheck, ShieldAlert, Trash2, Loader2 } from "lucide-react";

export default function EmployeeSignatureCard({ employee, onUpdated }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isApproved = !!employee?.signature_image_url && !!employee?.signature_approved;

  const updateEmployee = async (payload) => {
    setIsSaving(true);
    await base44.entities.Employee.update(employee.id, payload);
    setIsSaving(false);
    onUpdated?.();
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة توقيع فقط");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم صورة التوقيع كبير جداً. الحد الأقصى 5 ميجابايت");
      return;
    }

    setIsUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    await updateEmployee({
      signature_image_url: result.file_url,
      signature_approved: false,
      signature_approved_date: null,
      signature_approved_by: null,
    });
    setIsUploading(false);
  };

  const approveSignature = async () => {
    const user = await base44.auth.me();
    await updateEmployee({
      signature_approved: true,
      signature_approved_date: new Date().toISOString(),
      signature_approved_by: user?.email || user?.full_name || "",
    });
  };

  const removeSignature = async () => {
    await updateEmployee({
      signature_image_url: "",
      signature_approved: false,
      signature_approved_date: null,
      signature_approved_by: null,
    });
  };

  if (!employee || employee.__isArchived) return null;

  return (
    <Card className="shadow-md border-0 bg-white/80 overflow-hidden">
      <div className="p-3 md:p-5 bg-gradient-to-r from-emerald-500 to-teal-500 border-b">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            التوقيع الشخصي المعتمد
          </h2>
          <Badge className={isApproved ? "bg-white text-emerald-700" : "bg-white/20 text-white border-white/30"}>
            {isApproved ? "معتمد" : "غير معتمد"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
          <div className="h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {employee.signature_image_url ? (
              <img src={employee.signature_image_url} alt="توقيع الموظف" className="max-h-24 max-w-full object-contain" />
            ) : (
              <div className="text-center text-gray-400 text-sm">لا يوجد توقيع مرفوع</div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              عند اعتماد التوقيع سيتم استخدامه تلقائياً في النماذج بدل البحث اليدوي.
            </p>
            {employee.signature_approved_date && (
              <p className="text-xs text-gray-500">
                تم الاعتماد: {new Date(employee.signature_approved_date).toLocaleDateString("ar-SA")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Label htmlFor="employee_signature_upload" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {employee.signature_image_url ? "تغيير التوقيع" : "رفع التوقيع"}
                </div>
              </Label>
              <input id="employee_signature_upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading || isSaving} />

              <Button type="button" onClick={approveSignature} disabled={!employee.signature_image_url || isSaving || isApproved} className="bg-emerald-600 hover:bg-emerald-700">
                <ShieldCheck className="w-4 h-4 ml-2" />
                اعتماد التوقيع
              </Button>

              {employee.signature_image_url && (
                <Button type="button" variant="outline" onClick={removeSignature} disabled={isSaving}>
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              )}
            </div>
            {!isApproved && employee.signature_image_url && (
              <div className="flex items-center gap-2 text-amber-700 text-sm">
                <ShieldAlert className="w-4 h-4" />
                التوقيع مرفوع لكنه غير معتمد بعد.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}