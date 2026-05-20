import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, RefreshCw, Wand2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  buildCenterIndex,
  matchCenter,
  extractCenterCore,
} from "../components/utils/centerNameMatcher";

export default function CenterNameNormalizer() {
  const [centers, setCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testInput, setTestInput] = useState("");
  const [fixing, setFixing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [c, e] = await Promise.all([
      base44.entities.HealthCenter.list(),
      base44.entities.Employee.list(),
    ]);
    setCenters(c);
    setEmployees(e);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const centerIndex = useMemo(() => buildCenterIndex(centers), [centers]);

  const officialCenterNames = useMemo(
    () => new Set(centers.map((c) => c["اسم_المركز"]).filter(Boolean)),
    [centers]
  );

  // الموظفون الذين اسم مركزهم لا يطابق أي مركز رسمي
  const mismatchedEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const name = emp["المركز_الصحي"];
        if (!name) return false;
        if (officialCenterNames.has(name)) return false;
        return true;
      })
      .map((emp) => {
        const matched = matchCenter(emp["المركز_الصحي"], centerIndex);
        return {
          ...emp,
          _suggestedCenter: matched,
        };
      });
  }, [employees, officialCenterNames, centerIndex]);

  const autoFixable = mismatchedEmployees.filter((e) => e._suggestedCenter);
  const unresolved = mismatchedEmployees.filter((e) => !e._suggestedCenter);

  // اختبار حي للمدخل
  const testResult = useMemo(() => {
    if (!testInput.trim()) return null;
    const matched = matchCenter(testInput, centerIndex);
    const core = extractCenterCore(testInput);
    return { matched, core };
  }, [testInput, centerIndex]);

  const handleFixOne = async (employee) => {
    if (!employee._suggestedCenter) return;
    const officialName = employee._suggestedCenter["اسم_المركز"];
    await base44.entities.Employee.update(employee.id, {
      "المركز_الصحي": officialName,
    });
    toast.success(`تم ربط ${employee.full_name_arabic} بـ ${officialName}`);
    loadData();
  };

  const handleFixAll = async () => {
    if (autoFixable.length === 0) return;
    setFixing(true);
    let success = 0;
    for (const emp of autoFixable) {
      try {
        await base44.entities.Employee.update(emp.id, {
          "المركز_الصحي": emp._suggestedCenter["اسم_المركز"],
        });
        success++;
      } catch (err) {
        console.error("فشل تحديث:", emp.full_name_arabic, err);
      }
    }
    toast.success(`تم تصحيح ${success} من ${autoFixable.length} موظف`);
    setFixing(false);
    loadData();
  };

  return (
    <div dir="rtl" className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wand2 className="w-7 h-7 text-emerald-600" />
            تطبيع أسماء المراكز
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            يقبل أي صيغة لاسم المركز (كامل/مختصر/عربي/إنجليزي) ويربطه تلقائياً بالمركز الصحيح
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* بطاقة الاختبار الحي */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            اختبار حي
          </CardTitle>
          <CardDescription>
            اكتب أي صيغة لاسم مركز وشاهد إلى أي مركز سيُربط
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="مثال: بطحي / مركز بطحي / Batahi / م.ص بطحي"
            className="text-lg"
          />
          {testResult && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">النواة المستخرجة:</span>
                <Badge variant="secondary">{testResult.core || "—"}</Badge>
              </div>
              {testResult.matched ? (
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">سيُربط بـ:</span>
                  <Badge className="bg-emerald-600">{testResult.matched["اسم_المركز"]}</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span>لم يتم العثور على مركز مطابق</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-700">{employees.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي الموظفين</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-600">{autoFixable.length}</div>
            <div className="text-sm text-muted-foreground">يمكن تصحيحها تلقائياً</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">{unresolved.length}</div>
            <div className="text-sm text-muted-foreground">تحتاج مراجعة يدوية</div>
          </CardContent>
        </Card>
      </div>

      {/* الموظفون القابلون للتصحيح التلقائي */}
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : autoFixable.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg text-emerald-700">
                  ✅ يمكن تصحيحها تلقائياً ({autoFixable.length})
                </CardTitle>
                <CardDescription>
                  هؤلاء الموظفون كُتب اسم مركزهم بصيغة مختلفة، والنظام تعرّف على المركز الصحيح
                </CardDescription>
              </div>
              <Button
                onClick={handleFixAll}
                disabled={fixing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Wand2 className="w-4 h-4 ml-2" />
                {fixing ? "جاري التصحيح..." : "تصحيح الكل"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {autoFixable.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 truncate">
                      {emp.full_name_arabic}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        المُدخل: {emp["المركز_الصحي"]}
                      </Badge>
                      <span>←</span>
                      <Badge className="bg-emerald-600">
                        {emp._suggestedCenter["اسم_المركز"]}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFixOne(emp)}
                  >
                    تصحيح
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <AlertDescription className="text-emerald-800">
            ممتاز! لا يوجد موظفون يحتاجون تصحيح أسماء مراكزهم تلقائياً.
          </AlertDescription>
        </Alert>
      )}

      {/* الحالات التي تحتاج مراجعة يدوية */}
      {unresolved.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg text-amber-700">
              ⚠️ تحتاج مراجعة يدوية ({unresolved.length})
            </CardTitle>
            <CardDescription>
              لم يتم التعرف على هذه المراكز — قد تكون مراكز خارج النظام أو أسماء غير قياسية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unresolved.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-200 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {emp.full_name_arabic}
                    </div>
                    <div className="text-xs text-amber-700 mt-0.5">
                      المركز المُدخل: <strong>{emp["المركز_الصحي"]}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}