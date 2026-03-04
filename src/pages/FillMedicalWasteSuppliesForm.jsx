import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const BG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/b6c7b20f8_ChatGPTImage1202605_58_03.png';

const CENTERS = ["الهميج", "الماوية", "الحسو", "صخيرة", "بطحى", "طلال", "هدبان", "بلغة"];

const SUPPLY_ITEMS = [
{
  category: "الأكياس",
  items: [
  { id: "bag_10_red", label: "لتر (١٠)", color: "red", colorLabel: "أحمر" },
  { id: "bag_10_yellow", label: "لتر (١٠)", color: "yellow", colorLabel: "أصفر" },
  { id: "bag_30_red", label: "لتر (٣٠)", color: "red", colorLabel: "أحمر" },
  { id: "bag_30_yellow", label: "لتر (٣٠)", color: "yellow", colorLabel: "أصفر" },
  { id: "bag_50_red", label: "لتر (٥٠)", color: "red", colorLabel: "أحمر" },
  { id: "bag_50_yellow", label: "لتر (٥٠)", color: "yellow", colorLabel: "أصفر" }]

},
{
  category: "حاويات المواد الحادة",
  items: [
  { id: "sharp_3", label: "سعة (٣) لتر" },
  { id: "sharp_65", label: "سعة (٦٫٥) لتر" },
  { id: "sharp_13", label: "سعة (١٣) لتر" },
  { id: "sharp_21", label: "سعة (٢١) لتر" }]

},
{
  category: "أخرى",
  items: [
  { id: "amalgam", label: "حاويات حشوات الأملغم" },
  { id: "endoscope", label: "حاوية المناظير" },
  { id: "liquid", label: "حاويات النفايات السائلة" },
  { id: "sticker", label: "بطاقة لاصقة" },
  { id: "ties", label: "المرابط" }]

}];


const QUARTERS = ["الربع الأول", "الربع الثاني", "الربع الثالث", "الربع الرابع"];

function SingleForm({ healthCenters, employees, onBack }) {
  const centerOptions = healthCenters.length > 0 ?
  healthCenters.map((c) => c.اسم_المركز).filter(Boolean) :
  CENTERS;

  const [selectedCenter, setSelectedCenter] = useState("");
  const [quantities, setQuantities] = useState({});
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [reportTitle, setReportTitle] = useState("احتياج مراكز الحسو الربع سنوي من مستلزمات النفايات الطبية");
  const [wasteOfficerName, setWasteOfficerName] = useState("");
  const [directorName, setDirectorName] = useState("");

  // إيجاد بيانات المركز المختار
  const selectedCenterData = healthCenters.find((c) => c.اسم_المركز === selectedCenter);

  // إيجاد مدير المركز
  const directorEmpId = selectedCenterData?.المدير;
  const directorEmp = directorEmpId ?
  employees.find((e) => e.id === directorEmpId || e.رقم_الموظف === directorEmpId) :
  null;

  // إيجاد مسؤول النفايات من الموظفين
  const wasteOfficerEmp = selectedCenter ?
  employees.find((e) =>
  (e.المركز_الصحي === selectedCenter || e.اسم_المركز === selectedCenter) &&
  Array.isArray(e.special_roles) &&
  e.special_roles.some((r) => r.includes("نفاي"))
  ) :
  null;

  // موظفو المركز المختار
  const centerEmployees = selectedCenter ?
  employees.filter((e) => e.المركز_الصحي === selectedCenter || e.اسم_المركز === selectedCenter) :
  [];

  // تحديث اسم المدير تلقائياً
  useEffect(() => {
    const name = directorEmp ? directorEmp.full_name_arabic || directorEmp.رقم_الموظف || "" : "";
    setDirectorName(name);
  }, [selectedCenter]);

  // تحديث مسؤول النفايات تلقائياً
  useEffect(() => {
    if (wasteOfficerEmp) {
      setWasteOfficerName(wasteOfficerEmp.full_name_arabic || "");
    } else {
      setWasteOfficerName("");
    }
  }, [selectedCenter]);

  const periodLabel = selectedQuarter && selectedYear ? `${selectedQuarter} ${selectedYear}م` : "";

  const getQty = (itemId) => quantities[itemId] || "";
  const setQty = (itemId, value) => setQuantities((prev) => ({ ...prev, [itemId]: value }));

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: fixed; left: 0; top: 0;
            width: 100%; height: 100%;
            padding: 0; margin: 0;
            background-size: 100% 100% !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-4xl mx-auto mb-4 bg-white rounded-xl shadow p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <h2 className="font-bold text-gray-800">طلب مفرد - مستلزمات النفايات الطبية</h2>
          </div>
          <Button onClick={() => window.print()} className="gap-2 bg-green-600 hover:bg-green-700">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">اسم المركز</label>
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}>
              <option value="">-- اختر المركز --</option>
              {centerOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">الربع السنوي</label>
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}>
              <option value="">-- اختر الربع --</option>
              {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">السنة (ميلادي)</label>
            <input
              type="number"
              className="border rounded px-3 py-1.5 text-sm w-24"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder={String(new Date().getFullYear())} />

          </div>
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500 block mb-1">عنوان التقرير</label>
            <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        className="print-area max-w-4xl mx-auto shadow rounded-xl overflow-hidden"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '297mm'
        }}>

        {/* Header */}
        <div className="pt-20 px-6 text-center">
          <h1 className="text-sky-800 mt-20 text-4xl font-extrabold"

          style={{ fontFamily: "'Cairo', 'Segoe UI', sans-serif", letterSpacing: '0.02em' }}>
            {reportTitle}
          </h1>
          {(selectedCenter || periodLabel) &&
          <div className="flex items-center mt-2 px-2">
              <div className="flex-1"></div>
              <div className="text-sky-600 text-sm font-semibold text-center flex-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {selectedCenter ? `المركز الصحي: ${selectedCenter}` : ""}
              </div>
              <div className="flex-1 text-left text-sky-700 text-sm font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {periodLabel || ""}
              </div>
            </div>
          }
        </div>

        {/* Table */}
        <div className="px-6 py-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-green-100">
                <th className="border border-gray-400 px-3 py-2 text-center" style={{ width: '20%' }}>البند</th>
                <th className="border border-gray-400 px-3 py-2 text-center" style={{ width: '35%' }}>التصنيف</th>
                <th className="border border-gray-400 px-3 py-2 text-center" style={{ width: '20%' }}>الكمية المطلوبة</th>
                <th className="border border-gray-400 px-3 py-2 text-center" style={{ width: '25%' }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLY_ITEMS.map((cat) =>
              <React.Fragment key={cat.category}>
                  {cat.items.map((item, idx) =>
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {idx === 0 &&
                  <td
                    rowSpan={cat.items.length}
                    className="border border-gray-400 px-3 py-2 text-center font-bold text-gray-700 bg-green-50">
                          {cat.category}
                        </td>
                  }
                      <td className="border border-gray-400 px-3 py-2 text-center">
                        {item.color === 'red' && <span className="text-red-600 font-bold">{item.colorLabel} </span>}
                        {item.color === 'yellow' && <span className="text-yellow-600 font-bold">{item.colorLabel} </span>}
                        {item.label}
                      </td>
                      <td className="border border-gray-400 px-2 py-1 text-center">
                        <input
                      type="number"
                      min="0"
                      className="w-full text-center border-none outline-none bg-transparent no-print-hide"
                      value={getQty(item.id)}
                      onChange={(e) => setQty(item.id, e.target.value)}
                      placeholder="0" />
                        <span className="hidden print:inline">{getQty(item.id)}</span>
                      </td>
                      <td className="border border-gray-400 px-3 py-2"></td>
                    </tr>
                )}
                </React.Fragment>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="p-4 grid grid-cols-2 gap-6">
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="text-center font-bold text-gray-700 mb-3 border-b pb-2 text-sm">مسؤول النفايات الطبية بالمركز</div>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">الاسم:</span>
                {wasteOfficerEmp ?
                <span className="flex-1 border-b border-gray-400 text-sm text-center pb-0.5">{wasteOfficerName}</span> :

                <select
                  className="flex-1 border-b border-gray-400 focus:outline-none text-sm bg-transparent text-center no-print-hide"
                  value={wasteOfficerName}
                  onChange={(e) => setWasteOfficerName(e.target.value)}>
                    <option value="">-- اختر الموظف --</option>
                    {centerEmployees.map((emp) =>
                  <option key={emp.id} value={emp.full_name_arabic || emp.رقم_الموظف}>
                        {emp.full_name_arabic || emp.رقم_الموظف}
                      </option>
                  )}
                  </select>
                }
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">التوقيع:</span>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4">
            <div className="text-center font-bold text-gray-700 mb-3 border-b pb-2 text-sm">مدير المركز الصحي</div>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">الاسم:</span>
                <span className="flex-1 border-b border-gray-400 text-sm text-center pb-0.5">
                  {directorName || <span className="text-gray-400 text-xs">اسم مدير المركز</span>}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">التوقيع:</span>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stamp */}
        <div className="px-6 pb-4">
          <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-400 text-sm bg-white/60">الختم</div>
        </div>

        <div style={{ minHeight: '60mm' }}></div>
      </div>
    </div>);

}

export default function FillMedicalWasteSuppliesForm() {
  const [mode, setMode] = useState(null);
  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quantities, setQuantities] = useState({});
  const [combinedSignatures, setCombinedSignatures] = useState({
    supervisorName: "مشرف النفايات الطبية بشؤون المراكز بمستشفى الحسو العام",
    assistantName: "المساعد لشؤون المراكز بمستشفى الحسو العام",
    periodLabel: ""
  });
  const [reportTitle, setReportTitle] = useState("احتياج مراكز الحسو الربع سنوي من مستلزمات النفايات الطبية");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centers, emps] = await Promise.all([
      base44.entities.HealthCenter.list(),
      base44.entities.Employee.list()]
      );
      setHealthCenters(centers || []);
      setEmployees(emps || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getQty = (itemId, centerId) => (quantities[itemId] || {})[centerId] || "";
  const setQty = (itemId, centerId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [centerId]: value }
    }));
  };
  const calcRowTotal = (itemId) => {
    const row = quantities[itemId] || {};
    const sum = CENTERS.reduce((acc, c) => acc + (parseFloat(row[c]) || 0), 0);
    return sum || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>);

  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-4xl">♻️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">احتياج مستلزمات النفايات الطبية</h1>
            <p className="text-gray-500">اختر نوع الطلب</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode('single')}
              className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-green-400 hover:shadow-xl transition-all text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-3xl">🏥</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">طلب مفرد</h2>
              <p className="text-sm text-gray-500">احتياج مركز صحي واحد مع توقيع مسؤول النفايات ومدير المركز</p>
            </button>

            <button
              onClick={() => setMode('combined')}
              className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-teal-400 hover:shadow-xl transition-all text-center group">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
                <span className="text-3xl">📋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">طلب مجمع</h2>
              <p className="text-sm text-gray-500">احتياج جميع المراكز في جدول موحد مع توقيع مشرف النفايات والمساعد</p>
            </button>
          </div>

          <div className="text-center">
            <Link to={createPageUrl("InteractiveForms")}>
              <Button variant="outline" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة للنماذج
              </Button>
            </Link>
          </div>
        </div>
      </div>);

  }

  if (mode === 'single') {
    return (
      <SingleForm
        healthCenters={healthCenters}
        employees={employees}
        onBack={() => setMode(null)} />);


  }

  // ---- النموذج المجمع ----
  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: fixed; left: 0; top: 0;
            width: 100%; height: 100%;
            padding: 0; margin: 0;
            background-size: 100% 100% !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
          table { font-size: 9pt !important; }
          th, td { padding: 3px 4px !important; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-6xl mx-auto mb-4 bg-white rounded-xl shadow p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => {setMode(null);setQuantities({});}} className="gap-1">
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <h2 className="font-bold text-gray-800">طلب مجمع - مستلزمات النفايات الطبية</h2>
          </div>
          <Button onClick={() => window.print()} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500 block mb-1">عنوان التقرير</label>
            <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">الفترة (مثال: الربع الأول 1446)</label>
            <Input
              value={combinedSignatures.periodLabel}
              onChange={(e) => setCombinedSignatures((p) => ({ ...p, periodLabel: e.target.value }))}
              placeholder="الربع الأول 1446هـ"
              className="text-sm w-52" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        className="print-area max-w-6xl mx-auto shadow rounded-xl overflow-hidden"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '210mm'
        }}>

        {/* Header */}
        <div className="pt-16 px-4 text-center">
          <h1 className="text-lg font-extrabold text-sky-800">{reportTitle}</h1>
          {combinedSignatures.periodLabel &&
          <p className="text-sky-600 text-xs mt-0.5 font-semibold">{combinedSignatures.periodLabel}</p>
          }
        </div>

        {/* Table */}
        <div className="px-4 py-2 overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: '12px' }}>
            <thead>
              <tr className="bg-green-100">
                <th colSpan={2} className="border border-gray-400 px-2 py-2 text-center font-bold">البند</th>
                {CENTERS.map((c) =>
                <th key={c} className="border border-gray-400 px-1 py-2 text-center font-bold" style={{ minWidth: '60px' }}>{c}</th>
                )}
                <th className="border border-gray-400 px-2 py-2 text-center font-bold bg-green-200">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLY_ITEMS.map((cat) =>
              <React.Fragment key={cat.category}>
                  {cat.items.map((item, idx) =>
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {idx === 0 &&
                  <td
                    rowSpan={cat.items.length}
                    className="border border-gray-400 px-2 py-1 text-center font-bold text-gray-700 bg-green-50 text-xs"
                    style={{ writingMode: cat.items.length > 2 ? 'vertical-rl' : 'horizontal-tb', whiteSpace: 'nowrap' }}>
                          {cat.category}
                        </td>
                  }
                      <td className="border border-gray-400 px-2 py-1 text-center text-xs" style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>
                        {item.color === 'red' && <span className="text-red-600 font-bold">{item.colorLabel} </span>}
                        {item.color === 'yellow' && <span className="text-yellow-600 font-bold">{item.colorLabel} </span>}
                        {!item.color && <span className="font-medium">{item.label}</span>}
                        {item.color && <span>{item.label}</span>}
                      </td>
                      {CENTERS.map((center) =>
                  <td key={center} className="border border-gray-400 px-1 py-0.5 text-center">
                          <input
                      type="number"
                      min="0"
                      className="w-full text-center border-none outline-none bg-transparent text-xs no-print-hide"
                      style={{ minWidth: '40px' }}
                      value={getQty(item.id, center)}
                      onChange={(e) => setQty(item.id, center, e.target.value)}
                      placeholder="" />
                        </td>
                  )}
                      <td className="border border-gray-400 px-2 py-1 text-center font-bold bg-green-50 text-xs">
                        {calcRowTotal(item.id) || ""}
                      </td>
                    </tr>
                )}
                </React.Fragment>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="p-4 grid grid-cols-2 gap-6 border-t">
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="text-center font-bold text-gray-700 mb-3 border-b pb-2 text-sm">
              مشرف النفايات الطبية بشؤون المراكز
              <div className="text-xs text-gray-500 font-normal">بمستشفى الحسو العام</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold whitespace-nowrap">الاسم:</span>
                <input
                  className="flex-1 border-b border-gray-400 focus:outline-none text-sm bg-transparent text-center no-print-hide"
                  value={combinedSignatures.supervisorName}
                  onChange={(e) => setCombinedSignatures((p) => ({ ...p, supervisorName: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold whitespace-nowrap">التوقيع:</span>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4">
            <div className="text-center font-bold text-gray-700 mb-3 border-b pb-2 text-sm">
              المساعد لشؤون المراكز
              <div className="text-xs text-gray-500 font-normal">بمستشفى الحسو العام</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold whitespace-nowrap">الاسم:</span>
                <input
                  className="flex-1 border-b border-gray-400 focus:outline-none text-sm bg-transparent text-center no-print-hide"
                  value={combinedSignatures.assistantName}
                  onChange={(e) => setCombinedSignatures((p) => ({ ...p, assistantName: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold whitespace-nowrap">التوقيع:</span>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ minHeight: '30mm' }}></div>
      </div>
    </div>);

}