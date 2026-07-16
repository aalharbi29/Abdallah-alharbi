import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, User, Phone, Mail, KeyRound, Building2, Copy, Check, FileCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CenterContactCard({ open, onOpenChange, center, manager, technicalSupervisor }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!center) return null;

  const handleCopy = (label, value) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(label);
      toast.success(`تم نسخ ${label}`);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(generateCardHTML());
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveHTML = () => {
    const html = generateCardHTML();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `بطاقة-تواصل-${center.اسم_المركز || "المركز"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم حفظ ملف HTML");
  };

  const generateCardHTML = () => {
    const row = (icon, label, value) => `
      <tr>
        <td class="label-cell">${icon} ${label}</td>
        <td class="value-cell">${value || "—"}</td>
      </tr>`;

    const rowWithCopy = (icon, label, value) => {
      const v = value || "";
      const escaped = v.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      return `
      <tr>
        <td class="label-cell">${icon} ${label}</td>
        <td class="value-cell">
          <span class="val-text">${v || "—"}</span>
          ${v ? `<button class="copy-btn" onclick="copyVal(this, '${escaped}')" title="نسخ ${label}">📋</button>` : ""}
        </td>
      </tr>`;
    };

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>بطاقة تواصل - ${center.اسم_المركز || ""}</title>
        <style>
          @page { size: 9cm 14cm; margin: 0; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'Tajawal', 'Segoe UI', sans-serif;
            direction: rtl;
            margin: 0;
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .card {
            width: 9cm;
            min-height: 14cm;
            border: 2px solid #0B3D91;
            border-radius: 12px;
            overflow: hidden;
            font-size: 11px;
            color: #1f2937;
          }
          .card-header {
            background: linear-gradient(135deg, #0B3D91, #1E63D6);
            color: white;
            text-align: center;
            padding: 10px 8px;
          }
          .card-header .title { font-size: 13px; font-weight: 800; }
          .card-header .subtitle { font-size: 9px; opacity: 0.85; margin-top: 2px; }
          .section { border-bottom: 1px solid #e5e7eb; }
          .section-title {
            background: #F1F8FF;
            color: #0B3D91;
            font-weight: 700;
            font-size: 10px;
            padding: 5px 10px;
            border-bottom: 1px solid #d1e7ff;
          }
          table { width: 100%; border-collapse: collapse; }
          .label-cell {
            padding: 4px 8px;
            font-weight: 600;
            color: #374151;
            white-space: nowrap;
            width: 45%;
            vertical-align: top;
            font-size: 10px;
          }
          .value-cell {
            padding: 4px 8px;
            color: #111827;
            word-break: break-all;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
          }
          .copy-btn {
            border: none;
            background: #e0edff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            padding: 1px 4px;
            line-height: 1;
            transition: background 0.2s;
            flex-shrink: 0;
          }
          .copy-btn:hover { background: #b3d4ff; }
          .copy-btn.copied { background: #c8f7d4; }
          .footer {
            text-align: center;
            padding: 6px;
            font-size: 8px;
            color: #6b7280;
            background: #f9fafb;
          }
          .hint { font-size: 10px; color: #6b7280; }
          @media print {
            .copy-btn, .hint { display: none !important; }
            body { padding: 0; gap: 0; }
            .value-cell { display: block; }
          }
        </style>
      </head>
      <body>
        <div class="hint">💡 اضغط أيقونة 📋 بجانب أي بيان لنسخه مباشرة</div>
        <div class="card">
          <div class="card-header">
            <div class="title">${center.اسم_المركز || ""}</div>
            <div class="subtitle">بطاقة بيانات التواصل</div>
          </div>

          <div class="section">
            <div class="section-title">🏢 بيانات المركز</div>
            <table>
              ${rowWithCopy("🆔", "كود الصحة", center.seha_id)}
              ${rowWithCopy("🏛️", "كود الوزارة", center.organization_code)}
              ${rowWithCopy("📧", "إيميل المركز", center.ايميل_المركز)}
              ${rowWithCopy("👤", "اسم المستخدم", center.ايميل_المستخدم)}
              ${rowWithCopy("🔑", "كلمة السر", center.كلمة_سر_الايميل)}
            </table>
          </div>

          <div class="section">
            <div class="section-title">👨‍⚕️ مدير المركز</div>
            <table>
              ${rowWithCopy("👤", "الاسم", manager?.full_name_arabic)}
              ${rowWithCopy("📱", "الجوال", manager?.phone)}
              ${rowWithCopy("✉️", "الإيميل", manager?.email)}
            </table>
          </div>

          <div class="section">
            <div class="section-title">🔧 المشرف الفني</div>
            <table>
              ${rowWithCopy("👤", "الاسم", technicalSupervisor?.full_name_arabic)}
              ${rowWithCopy("📱", "الجوال", technicalSupervisor?.phone)}
              ${rowWithCopy("✉️", "الإيميل", technicalSupervisor?.email)}
            </table>
          </div>

          <div class="footer">
            تجمع المدينة المنورة الصحي
          </div>
        </div>
        <script>
          function copyVal(btn, val) {
            navigator.clipboard.writeText(val).then(function() {
              btn.textContent = '✓';
              btn.classList.add('copied');
              setTimeout(function() {
                btn.textContent = '📋';
                btn.classList.remove('copied');
              }, 1500);
            });
          }
        </script>
      </body>
    </html>`;
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0 group">
      <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
      <span className="text-xs font-semibold text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-xs text-gray-900 break-all flex-1" dir="auto">{value || "—"}</span>
      {value && (
        <button
          onClick={() => handleCopy(label, value)}
          className="shrink-0 p-1 rounded hover:bg-blue-100 transition-colors"
          title={`نسخ ${label}`}
        >
          {copiedField === label ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">بطاقة تواصل {center.اسم_المركز}</DialogTitle>
        </DialogHeader>

        <div className="border-2 border-blue-900 rounded-xl overflow-hidden mx-auto" style={{ width: "9cm", maxWidth: "100%" }}>
          <div className="bg-gradient-to-br from-blue-900 to-blue-600 text-white text-center py-2">
            <div className="text-sm font-extrabold">{center.اسم_المركز}</div>
            <div className="text-[9px] opacity-85">بطاقة بيانات التواصل</div>
          </div>

          <div className="border-b border-gray-200">
            <div className="bg-blue-50 text-blue-900 font-bold text-[10px] px-3 py-1.5 border-b border-blue-100">
              🏢 بيانات المركز
            </div>
            <div className="px-3">
              <InfoRow icon={Building2} label="كود الصحة" value={center.seha_id} />
              <InfoRow icon={Building2} label="كود الوزارة" value={center.organization_code} />
              <InfoRow icon={Mail} label="إيميل المركز" value={center.ايميل_المركز} />
              <InfoRow icon={User} label="اسم المستخدم" value={center.ايميل_المستخدم} />
              <InfoRow icon={KeyRound} label="كلمة السر" value={center.كلمة_سر_الايميل} />
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="bg-blue-50 text-blue-900 font-bold text-[10px] px-3 py-1.5 border-b border-blue-100">
              👨‍⚕️ مدير المركز
            </div>
            <div className="px-3">
              <InfoRow icon={User} label="الاسم" value={manager?.full_name_arabic} />
              <InfoRow icon={Phone} label="الجوال" value={manager?.phone} />
              <InfoRow icon={Mail} label="الإيميل" value={manager?.email} />
            </div>
          </div>

          <div>
            <div className="bg-blue-50 text-blue-900 font-bold text-[10px] px-3 py-1.5 border-b border-blue-100">
              🔧 المشرف الفني
            </div>
            <div className="px-3">
              <InfoRow icon={User} label="الاسم" value={technicalSupervisor?.full_name_arabic} />
              <InfoRow icon={Phone} label="الجوال" value={technicalSupervisor?.phone} />
              <InfoRow icon={Mail} label="الإيميل" value={technicalSupervisor?.email} />
            </div>
          </div>

          <div className="text-center py-1.5 text-[8px] text-gray-500 bg-gray-50">
            تجمع المدينة المنورة الصحي
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">إغلاق</Button>
          <Button variant="secondary" onClick={handleSaveHTML} className="flex-1 gap-2">
            <FileCode className="w-4 h-4" />
            حفظ HTML
          </Button>
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="w-4 h-4" />
            طباعة البطاقة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}