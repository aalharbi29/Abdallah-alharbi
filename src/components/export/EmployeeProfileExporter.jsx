import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Printer } from "lucide-react";

function toKeyValueArray(employee) {
  const hidden = new Set(["id", "created_date", "updated_date", "created_by", "salary", "emergency_contact", "emergency_phone", "notes", "is_sample", "isSample", "تم_انشاؤه_بواسطة", "الراتب", "الاتصال_في_حالة_الطوارئ", "ملاحظات"]);
  const entries = Object.entries(employee || {}).filter(([k, v]) => !hidden.has(k));
  return entries;
}

function generateHTML(employee) {
  const entries = toKeyValueArray(employee);
  const title = `ملف الموظف - ${employee?.full_name_arabic || ""}`;
  const today = new Date().toLocaleDateString("ar-SA");
  const rows = entries.map(([k, v]) => {
    let val = v;
    if (typeof val === "boolean") val = val ? "نعم" : "لا";
    if (Array.isArray(val)) val = val.join(", ");
    if (typeof val === "object" && val !== null) val = JSON.stringify(val);
    if ((k.toLowerCase().includes("date") || k.includes("تاريخ")) && v) {
      try { val = new Date(v).toLocaleDateString("ar-SA"); } catch {}
    }
    return `<tr><th style="text-align:right;border:1px solid #ccc;padding:8px;background:#f7f7f7">${k}</th><td style="border:1px solid #ccc;padding:8px">${val ?? "—"}</td></tr>`;
  }).join("");
  return `
<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body{font-family:'Cairo',Tahoma,Arial;direction:rtl;margin:20px;}
  h1{font-size:20px;margin:0 0 8px}
  .meta{color:#555;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{border:1px solid #333;padding:8px}
  th{background:#f0f0f0;text-align:right}
</style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">تاريخ التصدير: ${today}</div>
  <table>${rows}</table>
</body></html>`;
}

function generateCSV(employee) {
  const entries = toKeyValueArray(employee);
  const lines = [["الحقل", "القيمة"], ...entries.map(([k, v]) => {
    let val = v;
    if (typeof val === "boolean") val = val ? "نعم" : "لا";
    if (Array.isArray(val)) val = val.join(", ");
    if (typeof val === "object" && val !== null) val = JSON.stringify(val);
    if ((k.toLowerCase().includes("date") || k.includes("تاريخ")) && v) {
      try { val = new Date(v).toLocaleDateString("ar-SA"); } catch {}
    }
    const esc = (s) => `"${String(s ?? "—").replace(/"/g, '""')}"`;
    return [esc(k), esc(val)];
  })];
  return "\ufeff" + lines.map(r => r.join(",")).join("\n");
}

export default function EmployeeProfileExporter({ employee }) {
  const filenameBase = `ملف_الموظف_${employee?.full_name_arabic || "بدون_اسم"}`;

  const handlePrint = () => window.print();

  const handleWord = () => {
    const html = generateHTML(employee);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filenameBase}.doc`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExcel = () => {
    const csv = generateCSV(employee);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filenameBase}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" /> طباعة
      </Button>
      <Button variant="outline" onClick={handleWord} className="gap-2">
        <FileText className="w-4 h-4" /> Word
      </Button>
      <Button variant="outline" onClick={handleExcel} className="gap-2">
        <FileSpreadsheet className="w-4 h-4" /> Excel
      </Button>
      <a className="hidden" download id="hidden-download" href="#"></a>
    </div>
  );
}