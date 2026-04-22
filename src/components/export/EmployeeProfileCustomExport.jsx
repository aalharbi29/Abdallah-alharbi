import React, { useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, FileSpreadsheet, Printer, ArrowUp, ArrowDown, Filter as FilterIcon } from "lucide-react";

const HIDDEN_KEYS = new Set([
  "id","created_date","updated_date","created_by",
  "salary","emergency_contact","emergency_phone","notes","is_sample","isSample",
  "تم_انشاؤه_بواسطة","الراتب","الاتصال_في_حالة_الطوارئ","ملاحظات"
]);

const LABELS = {
  full_name_arabic: "الاسم الكامل",
  "رقم_الموظف": "الرقم الوظيفي",
  "رقم_الهوية": "رقم الهوية",
  birth_date: "تاريخ الميلاد",
  gender: "الجنس",
  nationality: "الجنسية",
  phone: "الجوال",
  email: "البريد الإلكتروني",
  "المركز_الصحي": "المركز الصحي",
  position: "التخصص",
  job_category: "ملاك الوظيفة",
  qualification: "المؤهل",
  rank: "المرتبة",
  sequence: "التسلسل",
  hire_date: "تاريخ التوظيف",
  contract_type: "نوع العقد",
  special_roles: "الأدوار الخاصة",
  is_externally_assigned: "مكلف خارجياً",
  external_assignment_center: "المركز المكلف به خارجياً",
  external_assignment_end_date: "نهاية التكليف الخارجي",
  __employee_status: "حالة الموظف",
};

function computeEmployeeStatus(employee) {
  if (!employee) return "نشط";
  if (employee.is_externally_assigned) return "مكلف";
  return "نشط";
}

function toEntries(employee) {
  const list = Object.entries(employee || {}).filter(([k]) => !HIDDEN_KEYS.has(k));
  // أضف حقل "حالة الموظف" المحسوب ليكون متاحاً للتحديد في التصدير
  list.unshift(["__employee_status", computeEmployeeStatus(employee)]);
  return list;
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  const low = String(key || "").toLowerCase();
  if (low.includes("date") || key.includes("تاريخ")) {
    try { return new Date(value).toLocaleDateString("ar-SA"); } catch { return String(value); }
  }
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  return String(value);
}

function buildHTML({ employee, rows, title, subtitle }) {
  const today = new Date().toLocaleDateString("ar-SA");
  const trs = rows.map(({ key, label, value }) => `
    <tr>
      <th>${label || key}</th>
      <td>${formatValue(key, value)}</td>
    </tr>
  `).join("");
  return `
<!DOCTYPE html><html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body{font-family:'Cairo',Tahoma,Arial;direction:rtl;margin:24px;background:#fff;color:#111}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .title{font-size:20px;font-weight:bold}
  .subtitle{color:#555}
  table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
  th,td{border:1px solid #d1d5db;padding:8px;vertical-align:top}
  th{background:#f8fafc;text-align:right;width:30%}
  .meta{font-size:12px;color:#64748b;margin-top:4px}
  @page{size:A4;margin:16mm}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">${title}</div>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ``}
      <div class="meta">تاريخ الإنشاء: ${today}</div>
    </div>
  </div>
  <table>${trs}</table>
</body></html>`;
}


export default function EmployeeProfileCustomExport({ employee }) {
  const allEntries = useMemo(() => toEntries(employee), [employee]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customTitle, setCustomTitle] = useState(`ملف الموظف - ${employee?.full_name_arabic || ""}`);
  const [customSubtitle, setCustomSubtitle] = useState("");

  const defaultKeys = useMemo(() => {
    const basic = ["full_name_arabic","رقم_الموظف","__employee_status","gender","nationality","birth_date","position","المركز_الصحي","contract_type","hire_date","email","phone"];
    const available = new Set(allEntries.map(([k]) => k));
    return basic.filter(k => available.has(k));
  }, [allEntries]);

  const [selectedKeys, setSelectedKeys] = useState(defaultKeys);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allEntries;
    return allEntries.filter(([k, v]) => {
      const label = LABELS[k] || k;
      const val = formatValue(k, v);
      return String(label).toLowerCase().includes(s) || String(val).toLowerCase().includes(s);
    });
  }, [search, allEntries]);

  const toggleKey = (key) => {
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const selectAll = () => setSelectedKeys(filtered.map(([k]) => k));
  const clearAll = () => setSelectedKeys([]);

  const moveKey = (key, dir) => {
    setSelectedKeys(prev => {
      const idx = prev.indexOf(key);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  const rows = useMemo(() => {
    const map = new Map(allEntries);
    return selectedKeys.map(k => ({
      key: k,
      label: LABELS[k] || k,
      value: map.get(k)
    }));
  }, [selectedKeys, allEntries]);

  const filenameBase = `ملف_الموظف_${employee?.full_name_arabic || "بدون_اسم"}`;

  const doPrint = () => {
    const html = buildHTML({ employee, rows, title: customTitle, subtitle: customSubtitle });
    const w = window.open("", "_blank");
    if (w && w.document) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => { w.focus(); w.print(); }, 300);
    } else {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${filenameBase}.html`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("تم تنزيل ملف HTML، يمكنك فتحه والطباعة منه.");
    }
  };

  const doWord = () => {
    const html = buildHTML({ employee, rows, title: customTitle, subtitle: customSubtitle });
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filenameBase}.doc`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ملف الموظف");
    const headerRow = worksheet.addRow(["الحقل", "القيمة"]);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '166534' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    rows.forEach(({ key, label, value }) => {
      worksheet.addRow([label || key, formatValue(key, value)]);
    });

    worksheet.columns = [{ width: 28 }, { width: 50 }];
    worksheet.eachRow((row, rowNumber) => {
      row.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } },
        };
        if (rowNumber > 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowNumber % 2 === 0 ? 'F9FAFB' : 'FFFFFFFF' },
          };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filenameBase}.xlsx`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <FilterIcon className="w-4 h-4" />
          تصدير/طباعة مخصص
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تخصيص بيانات ملف الموظف</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* الإعدادات العامة */}
          <div className="lg:col-span-1 space-y-3">
            <div>
              <Label>العنوان</Label>
              <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
            </div>
            <div>
              <Label>وصف/سطر فرعي (اختياري)</Label>
              <Input value={customSubtitle} onChange={(e) => setCustomSubtitle(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedKeys(defaultKeys)}>
                تهيئة بالأساسية
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                تحديد الكل
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="text-red-600">
                إزالة الكل
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              المحدد: <Badge variant="secondary">{selectedKeys.length}</Badge> من {allEntries.length}
            </div>
          </div>

          {/* قائمة الحقول */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <Input placeholder="بحث عن حقل أو قيمة..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="max-h-80 overflow-auto border rounded-md">
              {filtered.map(([key, value]) => {
                const checked = selectedKeys.includes(key);
                return (
                  <div key={key} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <Checkbox id={key} checked={checked} onCheckedChange={() => toggleKey(key)} />
                      <Label htmlFor={key} className="cursor-pointer">
                        <div className="font-medium">{LABELS[key] || key}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[52vw]">
                          {formatValue(key, value)}
                        </div>
                      </Label>
                    </div>
                    {checked && (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => moveKey(key, "up")}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => moveKey(key, "down")}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="justify-between">
          <div className="text-xs text-gray-500">سيتم تطبيق التنسيق الاحترافي تلقائياً عند الطباعة/التصدير</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={doExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
            <Button variant="outline" onClick={doWord} className="gap-2">
              <FileText className="w-4 h-4" /> Word
            </Button>
            <Button onClick={doPrint} className="gap-2">
              <Printer className="w-4 h-4" /> طباعة
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}