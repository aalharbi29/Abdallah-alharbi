import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Save, User, Phone, Mail, KeyRound, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function AdministrationContactManager() {
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await base44.entities.AdministrationContact.list();
      if (list && list.length > 0) {
        setRecord(list[0]);
      } else {
        setRecord({
          administration_name: "إدارة شؤون المراكز الصحية",
          manager_name: "",
          manager_phone: "",
          manager_email: "",
          official_email: "",
          email_username: "",
          email_password: "",
        });
      }
    } catch (err) {
      console.error(err);
      setRecord({
        administration_name: "إدارة شؤون المراكز الصحية",
        manager_name: "",
        manager_phone: "",
        manager_email: "",
        official_email: "",
        email_username: "",
        email_password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (record.id) {
        await base44.entities.AdministrationContact.update(record.id, record);
      } else {
        await base44.entities.AdministrationContact.create(record);
      }
      toast.success("تم حفظ بيانات الإدارة");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(generateCardHTML());
    printWindow.document.close();
    printWindow.print();
  };

  const generateCardHTML = () => {
    const r = record || {};
    const row = (icon, label, value) => `
      <tr>
        <td class="label-cell">${icon} ${label}</td>
        <td class="value-cell">${value || "—"}</td>
      </tr>`;

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>بطاقة تواصل - ${r.administration_name || ""}</title>
        <style>
          @page { size: 9cm 12cm; margin: 0; }
          * { box-sizing: border-box; }
          body { font-family: 'Cairo', 'Tajawal', 'Segoe UI', sans-serif; direction: rtl; margin: 0; padding: 0; display: flex; justify-content: center; }
          .card { width: 9cm; min-height: 12cm; border: 2px solid #0B3D91; border-radius: 12px; overflow: hidden; font-size: 11px; color: #1f2937; }
          .card-header { background: linear-gradient(135deg, #0B3D91, #1E63D6); color: white; text-align: center; padding: 10px 8px; }
          .card-header .title { font-size: 13px; font-weight: 800; }
          .card-header .subtitle { font-size: 9px; opacity: 0.85; margin-top: 2px; }
          .section { border-bottom: 1px solid #e5e7eb; }
          .section-title { background: #F1F8FF; color: #0B3D91; font-weight: 700; font-size: 10px; padding: 5px 10px; border-bottom: 1px solid #d1e7ff; }
          table { width: 100%; border-collapse: collapse; }
          .label-cell { padding: 4px 8px; font-weight: 600; color: #374151; white-space: nowrap; width: 45%; vertical-align: top; font-size: 10px; }
          .value-cell { padding: 4px 8px; color: #111827; word-break: break-all; font-size: 10px; }
          .footer { text-align: center; padding: 6px; font-size: 8px; color: #6b7280; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="card-header">
            <div class="title">${r.administration_name || ""}</div>
            <div class="subtitle">بطاقة بيانات التواصل</div>
          </div>
          <div class="section">
            <div class="section-title">🏢 بيانات الإدارة</div>
            <table>
              ${row("📧", "الإيميل الرسمي", r.official_email)}
              ${row("👤", "اسم المستخدم", r.email_username)}
              ${row("🔑", "كلمة السر", r.email_password)}
            </table>
          </div>
          <div class="section">
            <div class="section-title">👨‍⚕️ مدير الإدارة</div>
            <table>
              ${row("👤", "الاسم", r.manager_name)}
              ${row("📱", "الجوال", r.manager_phone)}
              ${row("✉️", "الإيميل", r.manager_email)}
            </table>
          </div>
          <div class="footer">تجمع المدينة المنورة الصحي</div>
        </div>
      </body>
    </html>`;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-3 text-lg">
          <Building2 className="text-blue-600" />
          بيانات إدارة شؤون المراكز الصحية
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="admin_name">اسم الإدارة</Label>
            <Input
              id="admin_name"
              value={record.administration_name || ""}
              onChange={(e) => handleChange("administration_name", e.target.value)}
              placeholder="إدارة شؤون المراكز الصحية"
            />
          </div>

          <div>
            <Label htmlFor="admin_manager_name" className="flex items-center gap-1.5"><User className="w-4 h-4 text-blue-600" /> اسم المدير</Label>
            <Input
              id="admin_manager_name"
              value={record.manager_name || ""}
              onChange={(e) => handleChange("manager_name", e.target.value)}
              placeholder="اسم مدير الإدارة"
            />
          </div>

          <div>
            <Label htmlFor="admin_manager_phone" className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-600" /> جوال المدير</Label>
            <Input
              id="admin_manager_phone"
              value={record.manager_phone || ""}
              onChange={(e) => handleChange("manager_phone", e.target.value)}
              placeholder="05xxxxxxxx"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div>
            <Label htmlFor="admin_manager_email" className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-600" /> إيميل المدير</Label>
            <Input
              id="admin_manager_email"
              type="email"
              value={record.manager_email || ""}
              onChange={(e) => handleChange("manager_email", e.target.value)}
              placeholder="manager@health.gov.sa"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div>
            <Label htmlFor="admin_official_email" className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-green-600" /> الإيميل الرسمي للإدارة</Label>
            <Input
              id="admin_official_email"
              type="email"
              value={record.official_email || ""}
              onChange={(e) => handleChange("official_email", e.target.value)}
              placeholder="admin@health.gov.sa"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div>
            <Label htmlFor="admin_email_username" className="flex items-center gap-1.5"><User className="w-4 h-4 text-purple-600" /> اسم المستخدم للإيميل</Label>
            <Input
              id="admin_email_username"
              value={record.email_username || ""}
              onChange={(e) => handleChange("email_username", e.target.value)}
              placeholder="username"
              dir="ltr"
              className="text-left"
            />
          </div>

          <div>
            <Label htmlFor="admin_email_password" className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-purple-600" /> كلمة السر للإيميل</Label>
            <Input
              id="admin_email_password"
              type="text"
              value={record.email_password || ""}
              onChange={(e) => handleChange("email_password", e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة البطاقة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}