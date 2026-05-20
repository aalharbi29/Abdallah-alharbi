import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "exceljs";
import { parseExcelRows } from "../components/missing_employees/excelParser";
import {
  buildCenterIndex,
  matchCenter,
} from "../components/utils/centerNameMatcher";

const SHEETS_TO_PROCESS = [
  "بيانات القوى العاملة",
  "تكليف",
  "إيفاد",
  "انهاء عقد+تقاعد+استقاله",
];

/**
 * يجلب جميع الموظفين الحاليين عبر التصفّح (paging)
 */
const fetchAllEmployees = async () => {
  const all = [];
  let page = 0;
  const pageSize = 500;
  // base44 SDK لا يدعم skip مباشرة، نستخدم list مع حد كبير
  // إذا كان العدد < 10000 نأخذها بنداء واحد
  const list = await base44.entities.Employee.list("-created_date", 10000);
  return list;
};

export default function MissingEmployeesImporter() {
  const [stage, setStage] = useState("idle"); // idle | analyzing | review | importing | done
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [missingEmployees, setMissingEmployees] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStage("analyzing");
    setProgress(10);

    try {
      // 1) قراءة الملف
      const buffer = await file.arrayBuffer();
      const workbook = new XLSX.Workbook();
      await workbook.xlsx.load(buffer);

      const allRows = [];
      for (const sheetName of SHEETS_TO_PROCESS) {
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) continue;
        const headers = [];
        sheet.getRow(1).eachCell((cell, col) => {
          headers[col] = String(cell.value ?? "").trim();
        });
        for (let r = 2; r <= sheet.rowCount; r++) {
          const row = sheet.getRow(r);
          const obj = {};
          let hasAny = false;
          row.eachCell((cell, col) => {
            const h = headers[col];
            if (h) {
              let val = cell.value;
              if (val && typeof val === "object" && "text" in val) val = val.text;
              if (val && typeof val === "object" && "result" in val) val = val.result;
              obj[h] = val;
              if (val !== null && val !== undefined && val !== "") hasAny = true;
            }
          });
          if (hasAny) allRows.push(obj);
        }
      }
      setProgress(30);

      // 2) تحليل وفلترة التكرار داخل الملف
      const { validRows, skippedInvalid, skippedDuplicatesInFile } = parseExcelRows(allRows);
      setProgress(50);

      // 3) جلب الموظفين والمراكز الحالية
      const [existingEmployees, centers] = await Promise.all([
        fetchAllEmployees(),
        base44.entities.HealthCenter.list("-created_date", 1000),
      ]);
      setProgress(75);

      // 4) بناء فهارس البحث
      const existingByNationalId = new Map();
      const existingByEmpNumber = new Map();
      for (const emp of existingEmployees) {
        const nid = String(emp["رقم_الهوية"] || "").replace(/\D/g, "").trim();
        const enm = String(emp["رقم_الموظف"] || "").replace(/\D/g, "").trim();
        if (nid) existingByNationalId.set(nid, emp);
        if (enm) existingByEmpNumber.set(enm, emp);
      }
      const centerIndex = buildCenterIndex(centers);

      // 5) استخراج المفقودين + تطبيع المركز
      const missing = [];
      let duplicatesInDB = 0;
      for (const row of validRows) {
        const nid = row.data["رقم_الهوية"];
        const enm = row.data["رقم_الموظف"];

        if (nid && existingByNationalId.has(nid)) {
          duplicatesInDB++;
          continue;
        }
        if (!nid && enm && existingByEmpNumber.has(enm)) {
          duplicatesInDB++;
          continue;
        }

        const matchedCenter = matchCenter(row._rowCenterRaw, centerIndex);
        const officialCenterName = matchedCenter
          ? matchedCenter["اسم_المركز"]
          : row._rowCenterRaw;

        missing.push({
          ...row,
          data: {
            ...row.data,
            "المركز_الصحي": officialCenterName,
          },
          _centerMatched: !!matchedCenter,
        });
      }
      setProgress(100);

      setStats({
        totalRowsInFile: allRows.length,
        validRows: validRows.length,
        skippedInvalid,
        skippedDuplicatesInFile,
        duplicatesInDB,
        missingCount: missing.length,
        unmatchedCenters: missing.filter((m) => !m._centerMatched).length,
      });
      setMissingEmployees(missing);
      setStage("review");
    } catch (err) {
      console.error(err);
      toast.error("فشل تحليل الملف: " + err.message);
      setStage("idle");
    }
  };

  const handleImport = async () => {
    if (missingEmployees.length === 0) return;
    setStage("importing");
    setProgress(0);

    let success = 0;
    let failed = 0;
    const errors = [];
    const batchSize = 20;

    for (let i = 0; i < missingEmployees.length; i += batchSize) {
      const batch = missingEmployees.slice(i, i + batchSize);
      try {
        await base44.entities.Employee.bulkCreate(batch.map((m) => m.data));
        success += batch.length;
      } catch (err) {
        // Fallback: حاول إنشاء كل سجل منفصلاً لمعرفة الفاشل
        for (const item of batch) {
          try {
            await base44.entities.Employee.create(item.data);
            success++;
          } catch (e2) {
            failed++;
            errors.push({ name: item.data.full_name_arabic, error: e2.message });
          }
        }
      }
      setProgress(Math.round(((i + batchSize) / missingEmployees.length) * 100));
    }

    setImportResult({ success, failed, errors });
    setStage("done");
    toast.success(`تم إضافة ${success} موظف بنجاح`);
  };

  const handleReset = () => {
    setStage("idle");
    setStats(null);
    setMissingEmployees([]);
    setImportResult(null);
    setFileName("");
    setProgress(0);
  };

  return (
    <div dir="rtl" className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
          استيراد الموظفين المفقودين
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ارفع ملف Excel من نظام صحي — سيُقارَن مع قاعدة البيانات ويُستخرج فقط الموظفون غير الموجودين
        </p>
      </div>

      {/* مرحلة الرفع */}
      {stage === "idle" && (
        <Card className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <Upload className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <p className="font-semibold text-slate-700">اختر ملف Excel للرفع</p>
              <p className="text-sm text-muted-foreground">
                يدعم أوراق: بيانات القوى العاملة، تكليف، إيفاد، انهاء عقد+تقاعد+استقاله
              </p>
            </div>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="max-w-md mx-auto"
            />
          </CardContent>
        </Card>
      )}

      {/* مرحلة التحليل */}
      {stage === "analyzing" && (
        <Card>
          <CardContent className="pt-8 pb-8 space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <p className="font-semibold">جاري تحليل الملف ومقارنته بقاعدة البيانات...</p>
            <Progress value={progress} className="max-w-md mx-auto" />
            <p className="text-xs text-muted-foreground">{fileName}</p>
          </CardContent>
        </Card>
      )}

      {/* مرحلة المراجعة */}
      {stage === "review" && stats && (
        <>
          {/* إحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-5">
                <div className="text-2xl font-bold text-slate-700">{stats.totalRowsInFile}</div>
                <div className="text-xs text-muted-foreground">إجمالي الصفوف</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="text-2xl font-bold text-amber-600">{stats.skippedDuplicatesInFile}</div>
                <div className="text-xs text-muted-foreground">مكرر داخل الملف</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="text-2xl font-bold text-blue-600">{stats.duplicatesInDB}</div>
                <div className="text-xs text-muted-foreground">موجود بالفعل</div>
              </CardContent>
            </Card>
            <Card className="border-emerald-300 bg-emerald-50/50">
              <CardContent className="pt-5">
                <div className="text-2xl font-bold text-emerald-700">{stats.missingCount}</div>
                <div className="text-xs text-muted-foreground">مفقود (للإضافة)</div>
              </CardContent>
            </Card>
          </div>

          {stats.unmatchedCenters > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>{stats.unmatchedCenters}</strong> موظف من المفقودين لم يُتعرّف على
                مركزه — سيُحفظ الاسم كما هو في الملف. يمكنك تصحيحها لاحقاً من صفحة "تطبيع أسماء المراكز".
              </AlertDescription>
            </Alert>
          )}

          {/* قائمة المفقودين */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>
                    <Users className="w-5 h-5 inline ml-2" />
                    الموظفون المفقودون ({missingEmployees.length})
                  </CardTitle>
                  <CardDescription>سيتم إضافتهم إلى قاعدة البيانات</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>إلغاء</Button>
                  <Button
                    onClick={handleImport}
                    disabled={missingEmployees.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                    إضافة الكل ({missingEmployees.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {missingEmployees.map((emp, idx) => (
                  <div
                    key={emp._dedupKey + idx}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex-wrap"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800">
                        {emp.data.full_name_arabic || "(بدون اسم)"}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-1">
                        <Badge variant="outline">هوية: {emp.data["رقم_الهوية"] || "—"}</Badge>
                        <Badge variant="outline">رقم: {emp.data["رقم_الموظف"] || "—"}</Badge>
                        <Badge variant="outline">{emp.data.position || "—"}</Badge>
                        {emp._centerMatched ? (
                          <Badge className="bg-emerald-600">
                            {emp.data["المركز_الصحي"]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            ⚠ {emp.data["المركز_الصحي"]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {missingEmployees.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا يوجد موظفون مفقودون — جميع البيانات في الملف موجودة بالفعل ✅
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* مرحلة الإضافة */}
      {stage === "importing" && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <p className="font-semibold">جاري إضافة الموظفين...</p>
            <Progress value={progress} className="max-w-md mx-auto" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </CardContent>
        </Card>
      )}

      {/* مرحلة الإنهاء */}
      {stage === "done" && importResult && (
        <Card className="border-emerald-300">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                تم بنجاح إضافة {importResult.success} موظف
              </p>
              {importResult.failed > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  فشل {importResult.failed} ({importResult.errors[0]?.error})
                </p>
              )}
            </div>
            <Button onClick={handleReset} variant="outline">
              استيراد ملف آخر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}