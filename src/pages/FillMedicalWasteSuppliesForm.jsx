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
  const [reportTitle, setReportTitle] = useState("احتياج مراكز الحسو من مستلزمات النفايات الطبية");
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
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap');
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
        .form-title { font-family: 'Tajawal', 'Cairo', sans-serif; }
        .form-body { font-family: 'Cairo', 'Tajawal', sans-serif; }
        .pro-table th { 
          background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%) !important;
          color: white !important;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .pro-table td { transition: background 0.2s; }
        .pro-table tbody tr:hover td { background: #ecfdf5 !important; }
        .pro-table .cat-cell {
          background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
          font-weight: 800;
          color: #065f46;
          letter-spacing: 0.02em;
        }
        .sig-card {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
          border: 2px solid #d1fae5;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.08);
        }
        .sig-card-header {
          background: linear-gradient(135deg, #065f46, #047857);
          color: white;
          border-radius: 12px 12px 0 0;
          padding: 10px 16px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.02em;
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-4xl mx-auto mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack} className="gap-1 rounded-lg">
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <h2 className="font-bold text-gray-800 text-lg form-title">طلب مفرد - مستلزمات النفايات الطبية</h2>
          </div>
          <Button onClick={() => window.print()} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg shadow-md">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">اسم المركز</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}>
              <option value="">-- اختر المركز --</option>
              {centerOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">الربع السنوي</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}>
              <option value="">-- اختر الربع --</option>
              {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">السنة (ميلادي)</label>
            <input
              type="number"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24 bg-gray-50 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder={String(new Date().getFullYear())} />
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500 block mb-1">عنوان التقرير</label>
            <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="text-sm rounded-lg" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        className="print-area max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden form-body"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '297mm'
        }}>

        {/* Header */}
        <div className="pt-20 px-8 text-center">
          <h1 className="text-emerald-900 mt-20 text-sm font-extrabold leading-tight form-title"
          style={{ fontSize: '28px', letterSpacing: '0.03em', textShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {reportTitle}
          </h1>
          {(selectedCenter || periodLabel) &&
          <div className="flex items-center mt-4 px-4">
              <div className="flex-1"></div>
              <div className="text-center flex-1">
                {selectedCenter &&
              <span className="inline-block bg-emerald-50 border border-emerald-200 rounded-full px-5 py-1.5 text-emerald-800 text-sm font-bold form-title" style={{ letterSpacing: '0.02em' }}>
                    المركز الصحي: {selectedCenter}
                  </span>
              }
              </div>
              <div className="flex-1 text-left">
                {periodLabel &&
              <span className="inline-block bg-sky-50 border border-sky-200 rounded-full px-5 py-1.5 text-sky-800 text-sm font-bold form-title" style={{ letterSpacing: '0.02em' }}>
                    {periodLabel}
                  </span>
              }
              </div>
            </div>
          }
        </div>

        {/* Table */}
        <div className="px-8 py-4 rounded overflow-x-auto">
          <table className="pro-table w-full border-collapse" style={{ fontSize: '14px' }}>
            <thead>
              <tr>
                <th className="border border-emerald-700 px-4 py-3 text-center rounded-tr-xl" style={{ width: '20%' }}>البند</th>
                <th className="border border-emerald-700 px-4 py-3 text-center" style={{ width: '35%' }}>التصنيف</th>
                <th className="border border-emerald-700 px-4 py-3 text-center" style={{ width: '20%' }}>الكمية المطلوبة</th>
                <th className="border border-emerald-700 px-4 py-3 text-center rounded-tl-xl" style={{ width: '25%' }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLY_ITEMS.map((cat) =>
              <React.Fragment key={cat.category}>
                  {cat.items.map((item, idx) =>
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white/80" : "bg-emerald-50/40"}>
                      {idx === 0 &&
                  <td
                    rowSpan={cat.items.length}
                    className="cat-cell border border-gray-300 px-3 py-0.5 text-center" style={{ fontSize: '15px' }}>
                          {cat.category}
                        </td>
                  }
                      <td className="border border-gray-300 px-4 py-0.5 text-center font-bold" style={{ fontSize: '14px' }}>
                        {item.color === 'red' && <span className="inline-block bg-red-100 text-red-700 rounded-md px-2 py-0.5 font-extrabold text-xs ml-1">{item.colorLabel}</span>}
                        {item.color === 'yellow' && <span className="inline-block bg-yellow-100 text-yellow-700 rounded-md px-2 py-0.5 font-extrabold text-xs ml-1">{item.colorLabel}</span>}
                        {item.label}
                      </td>
                      <td className="border border-gray-300 px-2 py-0.5 text-center">
                        <input
                      type="number"
                      min="0"
                      className="w-full text-center border-none outline-none bg-transparent font-extrabold text-emerald-800 no-print-hide"
                      style={{ fontSize: '15px' }}
                      value={getQty(item.id)}
                      onChange={(e) => setQty(item.id, e.target.value)}
                      placeholder="—" />
                        <span className="hidden print:inline font-extrabold" style={{ fontSize: '15px' }}>{getQty(item.id)}</span>
                      </td>
                      <td className="border border-gray-300 px-3 py-0.5"></td>
                    </tr>
                )}
                </React.Fragment>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="px-8 py-5 grid grid-cols-2 gap-8">
          <div className="sig-card overflow-hidden">
            <div className="sig-card-header form-title" style={{ fontSize: '14px' }}>مسؤول النفايات الطبية بالمركز</div>
            <div className="p-5 space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-sm font-bold text-emerald-800 whitespace-nowrap form-title">الاسم:</span>
                {wasteOfficerEmp ?
                <span className="flex-1 border-b-2 border-emerald-300 text-sm text-center pb-1 font-semibold text-gray-800">{wasteOfficerName}</span> :
                <select
                  className="flex-1 border-b-2 border-emerald-300 focus:outline-none text-sm bg-transparent text-center font-semibold no-print-hide"
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
              <div className="flex items-end gap-3">
                <span className="text-sm font-bold text-emerald-800 whitespace-nowrap form-title">التوقيع:</span>
                <div className="flex-1 border-b-2 border-emerald-300 h-8"></div>
              </div>
            </div>
          </div>

          <div className="sig-card overflow-hidden">
            <div className="sig-card-header form-title" style={{ fontSize: '14px' }}>مدير المركز الصحي</div>
            <div className="p-5 space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-sm font-bold text-emerald-800 whitespace-nowrap form-title">الاسم:</span>
                <span className="flex-1 border-b-2 border-emerald-300 text-sm text-center pb-1 font-semibold text-gray-800">
                  {directorName || <span className="text-gray-400 text-xs font-normal">اسم مدير المركز</span>}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-sm font-bold text-emerald-800 whitespace-nowrap form-title">التوقيع:</span>
                <div className="flex-1 border-b-2 border-emerald-300 h-8"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stamp */}
        <div className="px-8 pb-5">
          <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-4 text-center text-emerald-400 text-sm bg-white/40 font-semibold form-title" style={{ letterSpacing: '0.05em' }}>الختم</div>
        </div>

        <div style={{ minHeight: '50mm' }}></div>
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
    supervisorName: "",
    supervisorTitle: "مشرف النفايات الطبية بشؤون المراكز",
    assistantName: "عبدالمجيد سعود الربيقي",
    assistantTitle: "المساعد لشؤون المراكز",
    periodLabel: ""
  });
  const [combinedQuarter, setCombinedQuarter] = useState("");
  const [combinedYear, setCombinedYear] = useState("");
  const [reportTitle, setReportTitle] = useState("احتياج مراكز الحسو من مستلزمات النفايات الطبية");

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
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap');
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
        .form-title { font-family: 'Tajawal', 'Cairo', sans-serif; }
        .form-body { font-family: 'Cairo', 'Tajawal', sans-serif; }
        .pro-table th { 
          background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%) !important;
          color: white !important;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .pro-table td { transition: background 0.2s; }
        .pro-table tbody tr:hover td { background: #ecfdf5 !important; }
        .pro-table .cat-cell {
          background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%) !important;
          font-weight: 800;
          color: #065f46;
          letter-spacing: 0.02em;
        }
        .pro-table .total-cell {
          background: linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%) !important;
          font-weight: 800;
          color: #065f46;
        }
        .sig-card {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
          border: 2px solid #d1fae5;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.08);
        }
        .sig-card-header {
          background: linear-gradient(135deg, #065f46, #047857);
          color: white;
          border-radius: 12px 12px 0 0;
          padding: 10px 16px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.02em;
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-6xl mx-auto mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => {setMode(null);setQuantities({});}} className="gap-1 rounded-lg">
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <h2 className="font-bold text-gray-800 text-lg form-title">طلب مجمع - مستلزمات النفايات الطبية</h2>
          </div>
          <Button onClick={() => window.print()} className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-md">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500 block mb-1">عنوان التقرير</label>
            <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="text-sm rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">الربع السنوي</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              value={combinedQuarter}
              onChange={(e) => setCombinedQuarter(e.target.value)}>
              <option value="">-- اختر الربع --</option>
              {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">السنة</label>
            <input
              type="text"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 bg-gray-50 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              value={combinedYear}
              onChange={(e) => setCombinedYear(e.target.value)}
              placeholder="1446هـ" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <label className="text-xs font-medium text-gray-500 block mb-1">اسم مشرف النفايات</label>
            <Input value={combinedSignatures.supervisorName} onChange={(e) => setCombinedSignatures((p) => ({ ...p, supervisorName: e.target.value }))} placeholder="اسم المشرف" className="text-sm rounded-lg" />
          </div>
          <div className="flex-1 min-w-44">
            <label className="text-xs font-medium text-gray-500 block mb-1">المسمى الوظيفي للمشرف</label>
            <Input value={combinedSignatures.supervisorTitle} onChange={(e) => setCombinedSignatures((p) => ({ ...p, supervisorTitle: e.target.value }))} className="text-sm rounded-lg" />
          </div>
          <div className="flex-1 min-w-44">
            <label className="text-xs font-medium text-gray-500 block mb-1">اسم المساعد</label>
            <Input value={combinedSignatures.assistantName} onChange={(e) => setCombinedSignatures((p) => ({ ...p, assistantName: e.target.value }))} className="text-sm rounded-lg" />
          </div>
          <div className="flex-1 min-w-44">
            <label className="text-xs font-medium text-gray-500 block mb-1">المسمى الوظيفي للمساعد</label>
            <Input value={combinedSignatures.assistantTitle} onChange={(e) => setCombinedSignatures((p) => ({ ...p, assistantTitle: e.target.value }))} className="text-sm rounded-lg" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div
        className="print-area max-w-6xl mx-auto shadow-2xl rounded-2xl overflow-hidden form-body"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '210mm'
        }}>

        {/* Header */}
        <div className="pt-16 px-6 text-center">
          <h1 className="text-emerald-900 mt-6 text-2xl font-black form-title" style={{ fontSize: '20px', letterSpacing: '0.03em', textShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{reportTitle}</h1>
          {(combinedQuarter || combinedYear) &&
          <span className="inline-block mt-2 bg-sky-50 border border-sky-200 rounded-full px-5 py-1 text-sky-800 text-xs font-bold form-title">
            {combinedQuarter}{combinedQuarter && combinedYear ? " " : ""}{combinedYear}
          </span>
          }
        </div>

        {/* Table */}
        <div className="px-4 py-3 overflow-x-auto">
          <table className="pro-table w-full border-collapse" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th colSpan={2} className="border border-emerald-700 px-2 py-2.5 text-center">البند</th>
                {CENTERS.map((c) =>
                <th key={c} className="border border-emerald-700 px-1 py-2.5 text-center" style={{ minWidth: '60px' }}>{c}</th>
                )}
                <th className="border border-emerald-700 px-2 py-2.5 text-center" style={{ background: 'linear-gradient(135deg, #047857, #065f46) !important' }}>المجموع</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLY_ITEMS.map((cat) =>
              <React.Fragment key={cat.category}>
                  {cat.items.map((item, idx) =>
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white/80" : "bg-emerald-50/40"}>
                      {idx === 0 &&
                  <td
                    rowSpan={cat.items.length}
                    className="cat-cell border border-gray-300 px-2 py-0 text-center"
                    style={{ writingMode: cat.items.length > 2 ? 'vertical-rl' : 'horizontal-tb', whiteSpace: 'nowrap', fontSize: '13px' }}>
                          {cat.category}
                        </td>
                  }
                      <td className="border border-gray-300 px-2 py-0 text-center font-bold" style={{ minWidth: '200px', whiteSpace: 'nowrap', fontSize: '12px' }}>
                        {item.color === 'red' && <span className="bg-transparent text-black ml-1 px-1.5 py-0.5 text-xs font-black rounded inline-block">{item.colorLabel}</span>}
                        {item.color === 'yellow' && <span className="bg-transparent text-black ml-1 px-1.5 py-0.5 text-xs font-black rounded inline-block">{item.colorLabel}</span>}
                        {!item.color && <span className="font-black">{item.label}</span>}
                        {item.color && <span className="font-black">{item.label}</span>}
                      </td>
                      {CENTERS.map((center) =>
                  <td key={center} className="border border-gray-300 px-1 py-0 text-center">
                          <input
                      type="number"
                      min="0"
                      className="w-full text-center border-none outline-none bg-transparent font-extrabold text-emerald-800 no-print-hide"
                      style={{ minWidth: '40px', fontSize: '13px' }}
                      value={getQty(item.id, center)}
                      onChange={(e) => setQty(item.id, center, e.target.value)}
                      placeholder="" />
                        </td>
                  )}
                      <td className="total-cell border border-gray-300 px-2 py-0 text-center" style={{ fontSize: '13px' }}>
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
        <div className="px-6 py-4 grid grid-cols-2 gap-8">
          <div className="sig-card overflow-hidden">
            <div className="sig-card-header form-title" style={{ fontSize: '13px' }}>
              مشرف النفايات الطبية بشؤون المراكز
              <div className="text-xs font-normal opacity-80 mt-0.5">بمستشفى الحسو العام</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-end gap-3">
                <span className="text-emerald-800 text-sm font-black form-title whitespace-nowrap">الاسم:</span>
                <input className="bg-transparent text-sm font-black text-center flex-1 border-b-2 border-emerald-300 focus:outline-none no-print-hide"

                value={combinedSignatures.supervisorName}
                onChange={(e) => setCombinedSignatures((p) => ({ ...p, supervisorName: e.target.value }))} />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-emerald-800 text-sm font-black whitespace-nowrap form-title">التوقيع:</span>
                <div className="flex-1 border-b-2 border-emerald-300 h-7"></div>
              </div>
            </div>
          </div>

          <div className="sig-card overflow-hidden">
            <div className="sig-card-header form-title" style={{ fontSize: '13px' }}>
              المساعد لشؤون المراكز
              <div className="text-xs font-normal opacity-80 mt-0.5">بمستشفى الحسو العام</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-end gap-3">
                <span className="text-emerald-800 text-sm font-black whitespace-nowrap form-title">الاسم:</span>
                <input className="bg-transparent text-sm font-black text-center flex-1 border-b-2 border-emerald-300 focus:outline-none no-print-hide"

                value={combinedSignatures.assistantName}
                onChange={(e) => setCombinedSignatures((p) => ({ ...p, assistantName: e.target.value }))} />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-emerald-800 text-sm font-black whitespace-nowrap form-title">التوقيع:</span>
                <div className="flex-1 border-b-2 border-emerald-300 h-7"></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ minHeight: '20mm' }}></div>
      </div>
    </div>);

}