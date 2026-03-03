import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// ============= تعريف الأنماط الأربعة =============
const FORM_TYPES = [
{
  id: "collection",
  title: "عقد جمع وتخزين",
  fullTitle: "نموذج تقييم أداء المتعهد ( عقد جمع وتخزين )",
  totalScore: 100,
  items: [
  { id: 1, section: "النقل خارج النشأة", content: "يتم متابعة نقل النفايات الطبية إلى خارج النشأة بشكل يومي (كل 24 ساعة) وفق سجلات", score: 10 },
  { id: 2, section: "", content: "يتم تسليم النفايات لسيارات مجهزة ومطابقة للمواصفات وعليها ملصق الخطر الحيوي من جانبين على الأقل وتدوين الملاحظات", score: 10 },
  { id: 3, section: "", content: "يتم طلب شهادة استلام النفايات الطبية يومياً موضحاً بها الكميات والأنواع من الناقل", score: 10 },
  { id: 4, section: "", content: "يتم طلب شهادة إتمام المعالجة بصورة يومية موضحاً بها الكميات والأنواع وطرق المعالجة من الناقل", score: 10 },
  { id: 5, section: "", content: "يتوفر سجل احصائي لكميات النفايات الطبية وأنواعها ومصدرها", score: 10 },
  { id: 6, section: "", content: "غرفة التخزين المؤقت نظيفة وتعقم بشكل دوري", score: 10 },
  { id: 7, section: "", content: "لا يوجد تكدس او بعثرة للنفايات الطبية داخل غرفة التخزين المؤقت", score: 10 },
  { id: 8, section: "", content: "يتم تعقيم وتطهير السلال والعربات بشكل دوري", score: 10 },
  { id: 9, section: "", content: "جميع الأكياس عليها ملصق يوضح نوع النفايات ومصدرها", score: 10 },
  { id: 10, section: "", content: "يوجد سجل حضور وانصراف للمشرفين وعمال نقل النفايات الطبية", score: 10 }]

},
{
  id: "supply",
  title: "عقد توريد المستهلكات والمستلزمات",
  fullTitle: "نموذج تقييم أداء المتعهد ( عقد توريد المستهلكات والمستلزمات )",
  totalScore: 250,
  items: [
  { id: 1, section: "المستهلكات", content: "توفير أكياس جمع النفايات الصفراء والحمراء مطابقة لسماكة 150 ميكرون", score: 40 },
  { id: 2, section: "", content: "توفير أشرطة بلاستيكية قوية التحمل لربط الأكياس", score: 40 },
  { id: 3, section: "", content: "توفير حاويات النفايات الحادة الصفراء اللون وذات غطاء يغلق مرة واحدة فقط وعليها شعار الخطر الحيوي", score: 40 },
  { id: 4, section: "", content: "توفير بطاقات لاصقة تعريفية حسب المواصفات جدول مواصفات المواد", score: 40 },
  { id: 6, section: "المستلزمات", content: "توفير حاويات لأكياس النفايات الطبية ستانلس ستيل أو من مادة بلاستيكية لها غطاء يفتح بالقدم وعليها شعار الخطر الحيوي من جانبين على الأقل (استبدال التالف بصورة فورية)", score: 40 },
  { id: 7, section: "", content: "توفير عربة نقل النفايات في المركز الصحي من البلاستيك المقوى وعليها شعار خطر حيوي ولها غطاء محكم الغلق (عمل الصيانة اللازمة للمعطل)", score: 25 },
  { id: 8, section: "", content: "يتم النقل بواسطة سيارة مجهزة ومطابقة للمواصفات وعليها ملصق الخطر الحيوي من جانبين على الأقل", score: 25 }]

},
{
  id: "transport",
  title: "عقد النقل",
  fullTitle: "نموذج تقييم أداء المتعهد ( عقد النقل )",
  totalScore: 100,
  items: [
  { id: 1, section: "النقل خارج المنشأة / مستندات التعامل مع النفايات الطبية", content: "يتم نقل النفايات الطبية إلى خارج المنشأة بشكل يومي (كل 24 ساعة) وكل 3 أيام للمراكز الصحية التي بها وحدة تجميد.", score: 15 },
  { id: 2, section: "", content: "يتم النقل بواسطة سيارة مجهزة ومطابقة للمواصفات وعليها ملصق الخطر الحيوي من جانبين على الأقل", score: 10 },
  { id: 3, section: "", content: "يوجد ميزان في سيارة النقل ويتم استخدامه لوزن النفايات الطبية", score: 10 },
  { id: 4, section: "", content: "توضع النفايات في حاويات داخل سيارة النقل", score: 10 },
  { id: 5, section: "", content: "سيارة النقل نظيفة ومعقمة ولا يوجد تسربات أو روائح", score: 10 },
  { id: 6, section: "", content: "يتم تزويد المنشأة الصحية بشهادة استلام النفايات الطبية يومياً موضحاً بها الكميات والأنواع", score: 10 },
  { id: 7, section: "", content: "يتم تزويد المنشأة الصحية بشهادات إتمام المعالجة بصورة يومية موضحاً بها الكميات والأنواع وطرق المعالجة", score: 15 },
  { id: 8, section: "", content: "يتوفر سجل احصائي لكميات النفايات الطبية وأنواعها ومصدرها", score: 10 },
  { id: 9, section: "", content: "استلام حاوية النفايات الطبية من محطة معالجة النفايات الطبية بعد غسلها وتطهيرها واعادتها إلى المنشأة الصحية", score: 10 }]

},
{
  id: "treatment",
  title: "عقد المعالجة",
  fullTitle: "نموذج تقييم أداء المتعهد ( عقد المعالجة )",
  totalScore: 100,
  items: [
  { id: 1, section: "المعالجة والتخلص النهائي / نماذج الاستلام والتسليم", content: "وزن وتسجيل كمية النفايات المستلمة وفقاً لنماذج الاستلام والتسليم", score: 10 },
  { id: 2, section: "", content: "يقوم مركز المعالجة بتقطيع النفايات إلى أجزاء صغيرة بعد المعالجة", score: 10 },
  { id: 3, section: "", content: "معالجة كافة أنواع نفايات الرعاية الصحية الخطرة الناتجة عن المنشآت الصحية", score: 10 },
  { id: 4, section: "", content: "إجراء فحوصات واختبارات جودة إتمام المعالجة", score: 10 },
  { id: 5, section: "", content: "تزويد المنشأة الصحية بشهادات إتمام المعالجة بصورة يومية موضحاً بها الكميات والأنواع وطرق المعالجة", score: 10 },
  { id: 6, section: "", content: "تزويد المنشأة الصحية بشهادات الردم والتخلص النهائي. استلام نفايات الرعاية الصحية الخطرة (النفايات الطبية المجمعة داخل تروليات مغلقة) من متعهد نقل النفايات الطبية الخطرة الصادرة من المنشآت الصحية التابعة لوزارة الصحة بالمنطقة/المحافظة محل العقد.", score: 10 },
  { id: 7, section: "", content: "يتم تسليم متعهد النقل تروليات النفايات الطبية الخطرة بعد غسلها وتطهيرها.", score: 20 }]

}];


export default function FillContractorEvaluationForm() {
  const [healthCenters, setHealthCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedFormType, setSelectedFormType] = useState(FORM_TYPES[0]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [evaluations, setEvaluations] = useState({});
  const [wasteManagerName, setWasteManagerName] = useState("");
  const [directorName, setDirectorName] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    base44.entities.HealthCenter.list().then((data) => {
      if (Array.isArray(data)) setHealthCenters(data);
    }).catch(() => {});
  }, []);

  // Reset evaluations when form type changes
  useEffect(() => {
    setEvaluations({});
  }, [selectedFormType.id]);

  const handleEvalChange = (itemId, value) => {
    const maxScore = selectedFormType.items.find((i) => i.id === itemId)?.score || 0;
    const numVal = Math.min(Math.max(0, Number(value) || 0), maxScore);
    setEvaluations((prev) => ({ ...prev, [itemId]: numVal }));
  };

  const totalEval = selectedFormType.items.reduce((sum, item) => {
    return sum + (evaluations[item.id] !== undefined ? evaluations[item.id] : 0);
  }, 0);

  const handlePrint = () => window.print();

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { font-family: 'Tajawal', Arial, sans-serif; }

        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          @page { size: A4; margin: 12mm; }
          input, select { border: none !important; background: transparent !important; color: black !important; }
          select { -webkit-appearance: none; appearance: none; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white rounded-xl shadow border border-slate-200 p-5">
        <h2 className="text-xl font-bold text-slate-800 mb-4">تقييم أداء المتعهد - النفايات الطبية</h2>

        {/* نوع النموذج */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">نوع النموذج:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FORM_TYPES.map((ft) =>
            <button
              key={ft.id}
              onClick={() => setSelectedFormType(ft)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
              selectedFormType.id === ft.id ?
              'bg-green-600 text-white border-green-600 shadow-md' :
              'bg-white text-slate-700 border-slate-300 hover:bg-green-50'}`
              }>

                {ft.title}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* المركز الصحي */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">المركز / المستشفى:</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}>

              <option value="">-- اختر المنشأة --</option>
              {healthCenters.map((c) =>
              <option key={c.id} value={c["اسم_المركز"]}>{c["اسم_المركز"]}</option>
              )}
            </select>
          </div>
          {/* الشهر */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">الشهر:</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              value={month}
              onChange={(e) => setMonth(e.target.value)}>

              <option value="">-- الشهر --</option>
              {months.map((m, i) => <option key={i} value={m}>{m}</option>)}
            </select>
          </div>
          {/* السنة */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">السنة:</label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2020" max="2099" />

          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500">
            الدرجة الكلية: <span className="font-bold text-green-700 text-lg">{totalEval}</span> / {selectedFormType.totalScore}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow">

            <Printer className="w-4 h-4" /> طباعة
          </button>
        </div>
      </div>

      {/* ===== Print Area ===== */}
      <div ref={printRef} className="print-area max-w-5xl mx-auto bg-white shadow-xl"
      style={{
        backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/b6c7b20f8_ChatGPTImage1202605_58_03.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-20 flex justify-between items-start">
            <div className="text-right">
              <div className="text-slate-600 mb-6 ml-10 text-sm font-bold opacity-100">إدارة الخدمات العامة</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              


              
            </div>
          </div>

          <div className="text-center mb-5">
            <h1 className="text-slate-900 text-2xl font-extrabold">{selectedFormType.fullTitle}</h1>
            <div className="text-base text-slate-700 mt-2">
              للتخلص من النفايات الطبية بالمنشآت الصحية بمستشفى / مركز (
              <span className="font-bold text-green-800 mx-2">{selectedCenter || "........................"}</span>
              )
            </div>
            <div className="text-base font-bold text-slate-700 mt-1">
              لشهر {month || "........"} / {year}
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="border border-slate-500 px-2 py-2 text-center w-10">م</th>
                <th className="border border-slate-500 px-3 py-2 text-center w-28">البند</th>
                <th className="border border-slate-500 px-3 py-2 text-right">المحتوى</th>
                <th className="border border-slate-500 px-2 py-2 text-center w-16">الدرجة</th>
                <th className="border border-slate-500 px-2 py-2 text-center w-20">التقييم</th>
              </tr>
            </thead>
            <tbody>
              {selectedFormType.items.map((item, idx) =>
              <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-600">{item.id}</td>
                  <td className="border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700 leading-tight">
                    {item.section}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right leading-relaxed">{item.content}</td>
                  <td className="border border-slate-300 px-2 py-2 text-center font-bold text-slate-800">{item.score}</td>
                  <td className="border border-slate-300 px-1 py-1 text-center">
                    <input
                    type="number"
                    min="0"
                    max={item.score}
                    className="w-16 text-center border border-slate-300 rounded focus:outline-none focus:border-green-500 font-bold text-green-800 bg-green-50 no-print"
                    value={evaluations[item.id] !== undefined ? evaluations[item.id] : ""}
                    onChange={(e) => handleEvalChange(item.id, e.target.value)}
                    placeholder="0" />

                    <span className="print-score hidden">{evaluations[item.id] ?? ""}</span>
                  </td>
                </tr>
              )}
              {/* المجموع */}
              <tr className="bg-green-700 text-white font-extrabold">
                <td colSpan={3} className="pt-3 pr-3 pb-3 pl-3 text-lg text-center border border-green-600">المجموع</td>
                <td className="border border-green-600 px-2 py-3 text-center text-lg">{selectedFormType.totalScore}</td>
                <td className="border border-green-600 px-2 py-3 text-center text-lg text-yellow-200">
                  {totalEval}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Info */}
          <div className="mb-4 pr-3 pl-3 text-sm rounded-lg border border-slate-300">
            <div className="text-slate-700 font-bold text-center">أسم المنشأة الصحية: {selectedCenter || "......................................"}</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* مسؤول النفايات */}
            <div className="border border-slate-300 rounded-lg p-4">
              <div className="text-center font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">مسؤول النفايات الطبية</div>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">الاسم:</span>
                  <input
                    className="flex-1 border-b border-slate-400 focus:outline-none focus:border-green-500 text-sm bg-transparent text-center"
                    value={wasteManagerName}
                    onChange={(e) => setWasteManagerName(e.target.value)}
                    placeholder="الاسم" />

                </div>
                <div className="flex items-end gap-2">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">التوقيع:</span>
                  <div className="flex-1 border-b border-slate-400 h-6"></div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">التاريخ:</span>
                  <div className="flex-1 border-b border-slate-400 h-6"></div>
                </div>
              </div>
            </div>

            {/* مدير المستشفى */}
            <div className="border border-slate-300 rounded-lg p-4">
              <div className="text-center font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">مدير المستشفى / القطاع</div>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">الاسم:</span>
                  <input
                    className="flex-1 border-b border-slate-400 focus:outline-none focus:border-green-500 text-sm bg-transparent text-center"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="الاسم" />

                </div>
                <div className="flex items-end gap-2">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">التوقيع:</span>
                  <div className="flex-1 border-b border-slate-400 h-6"></div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">التاريخ:</span>
                  <div className="flex-1 border-b border-slate-400 h-6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* الختم */}
          <div className="text-center mt-4 text-slate-600 font-bold text-sm">الختم</div>

          {/* Footer Logo */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
            <div className="text-xs text-slate-400">[ نموذج ][ 11 ]</div>
            <div className="text-center">
              <div className="font-extrabold text-slate-700">تجمع المدينة المنورة الصحي</div>
              <div className="text-xs text-slate-500">Madinah Health Cluster</div>
              <div className="text-xs text-slate-400">Empowered by Health Holding co.</div>
            </div>
            <div className="text-xs text-slate-400">[ 11 ][ نموذج ]</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print-score { display: inline !important; }
        }
        .no-print .print-score { display: none; }
      `}</style>
    </div>);

}