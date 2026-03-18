import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, ArrowRight, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const initialCenters = [
  "الحسو",
  "الماوية",
  "الهميج",
  "بطحي",
  "بلغه",
  "صخيبره",
  "طلال",
  "هدبان"
];

const months = [
  { value: 1, label: "يناير" }, { value: 2, label: "فبراير" }, { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" }, { value: 5, label: "مايو" }, { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" }, { value: 8, label: "أغسطس" }, { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" }, { value: 11, label: "نوفمبر" }, { value: 12, label: "ديسمبر" },
];

export default function MalariaStatisticForm() {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSaving, setIsSaving] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("https://upload.wikimedia.org/wikipedia/commons/f/f8/Stylized_signature_sample.svg");
  const [managerName, setManagerName] = useState("أ / عبدالمجيد سعود الربيقي");
  const [managerTitle, setManagerTitle] = useState("مدير إدارة المراكز الصحية بالحناكية");

  React.useEffect(() => {
    const fetchSignature = async () => {
      try {
        const records = await base44.entities.StampSignature.filter({ type: 'signature', is_default: true, is_active: true });
        if (records && records.length > 0) {
          setSignatureUrl(records[0].image_url);
          if (records[0].owner_name) setManagerName(records[0].owner_name);
          if (records[0].owner_title) setManagerTitle(records[0].owner_title);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };
    fetchSignature();
  }, []);
  
  const [data, setData] = useState(
    initialCenters.map(center => ({
      name: center,
      totalPatients: "0",
      testedSamples: "0",
      percentage: "0%",
      positives: "0",
      distBenign: "0",
      distMalignant: "0",
      distQuad: "0",
      distMixed: "0",
      casesInside: "0",
      casesOutside: "0",
      treatmentQuad: "0",
      treatmentOct: "0",
      treatmentFansidar: "0",
      treatmentOther: "0",
      ageUnder1: "0",
      age1to4: "0",
      age5to9: "0",
      age10to14: "0",
      ageOver14: "0"
    }))
  );

  const handlePrint = () => {
    toast.info("الطباعة المباشرة غير مدعومة في بيئة المعاينة. يرجى استخدام زر 'حفظ في الإحصائيات' ثم طباعة الملف من قسم الإحصائيات.");
  };

  const handleSaveToStatistics = async () => {
    if (!month) {
      toast.error("الرجاء اختيار الشهر أولاً");
      return;
    }
    
    try {
      setIsSaving(true);
      toast.loading("جاري حفظ الإحصائية...", { id: "save-stat" });
      
      const element = printRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        ignoreElements: (el) => el.classList.contains('no-print')
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      
      const file = new File([pdfBlob], `malaria_statistic_${year}_${month}.pdf`, { type: 'application/pdf' });
      
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      
      const selectedMonth = months.find(m => m.value.toString() === month);
      
      await base44.entities.Statistic.create({
        period_type: "gregorian",
        year: parseInt(year),
        month_number: selectedMonth.value,
        month_name: selectedMonth.label,
        title: "إحصائية الملاريا",
        description: "تم إنشاؤها من النموذج التفاعلي",
        file_url: uploadRes.file_url,
        file_name: file.name
      });
      
      toast.success("تم حفظ الإحصائية بنجاح في الملفات المخصصة", { id: "save-stat" });
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الحفظ", { id: "save-stat" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    
    // Auto calculate percentage if possible
    if (field === 'totalPatients' || field === 'testedSamples') {
      const patients = parseFloat(newData[index].totalPatients) || 0;
      const samples = parseFloat(newData[index].testedSamples) || 0;
      if (patients > 0 && samples > 0) {
        newData[index].percentage = ((samples / patients) * 100).toFixed(1) + '%';
      } else {
        newData[index].percentage = "0%";
      }
    }
    
    setData(newData);
  };

  const calculateTotal = (field) => {
    if (field === 'name') return "المجموع";
    if (field === 'percentage') {
      const totalPatients = data.reduce((sum, row) => sum + (parseFloat(row.totalPatients) || 0), 0);
      const totalSamples = data.reduce((sum, row) => sum + (parseFloat(row.testedSamples) || 0), 0);
      if (totalPatients > 0 && totalSamples > 0) {
        return ((totalSamples / totalPatients) * 100).toFixed(1) + '%';
      }
      return "0%";
    }
    const sum = data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
    return sum;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-cairo" dir="rtl">
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page { size: A4 landscape; margin: 10mm; }
          .print-container { 
            width: 100%; 
            max-width: 100%; 
            padding: 0; 
            margin: 0; 
            box-shadow: none; 
            border: none !important;
          }
          input { 
            border: none !important; 
            background: transparent !important; 
            padding: 0 !important; 
            text-align: center;
            font-size: 10pt !important;
            font-weight: 600;
            color: black !important;
          }
          input::placeholder { color: transparent; }
          table { border-collapse: collapse; width: 100%; }
          th, td { 
            border: 1px solid #475569 !important; 
            padding: 4px !important; 
            text-align: center; 
            color: black !important;
          }
          th { 
            font-weight: 700; 
            background-color: #f1f5f9 !important; 
            font-size: 9pt !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          td {
            font-size: 10pt !important;
          }
          .header-text { font-size: 12pt; font-weight: bold; color: black; }
          .title-text { font-size: 18pt; font-weight: bold; text-decoration: underline; color: black; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة
          </Button>
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveToStatistics} 
              disabled={isSaving}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ في الإحصائيات
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4" />
              طباعة / تصدير PDF
            </Button>
          </div>
        </div>

        <div ref={printRef} className="bg-white p-8 rounded-xl shadow-sm print-container border border-gray-200 relative overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="text-right space-y-1 header-text">
              <p>تجمع المدينة المنورة الصحي</p>
              <p>شؤون المراكز الصحية بالحسو</p>
            </div>
            <div className="text-center">
              <h1 className="title-text text-2xl font-bold underline mb-6">أعمال فحص الدم للملاريا</h1>
              <div className="flex gap-8 justify-center text-lg font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-sm">الشهر :</span>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-32 h-8 text-center font-bold border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus:ring-0 px-0 bg-transparent">
                      <SelectValue placeholder="اختر الشهر" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">السنة :</span>
                  <Input 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    className="w-24 h-8 text-center font-bold border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 px-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="w-48"></div> {/* Spacer for balance */}
          </div>

          {/* Table */}
          <div className="overflow-x-auto relative z-10">
            <table className="w-full border-collapse border border-slate-400 text-center">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan={2} className="border border-slate-400 p-2 w-32 text-xs font-bold text-slate-800">اسم المركز</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-20 text-xs font-bold text-slate-800">اجمالي<br/>المراجعين</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-20 text-xs font-bold text-slate-800">عدد<br/>العينات<br/>المفحوصة</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-16 text-xs font-bold text-slate-800">النسبة</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-16 text-xs font-bold text-slate-800">عدد<br/>الايجابي</th>
                  <th colSpan={4} className="border border-slate-400 p-2 text-xs font-bold text-slate-800">توزيع الحالات</th>
                  <th colSpan={2} className="border border-slate-400 p-2 text-xs font-bold text-slate-800">عدد الحالات</th>
                  <th colSpan={4} className="border border-slate-400 p-2 text-xs font-bold text-slate-800">نوع وكمية العلاج</th>
                  <th colSpan={5} className="border border-slate-400 p-2 text-xs font-bold text-slate-800">الايجابي حسب فئات العمر</th>
                </tr>
                <tr className="bg-slate-50">
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">حميدة</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">خبيثة</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">رباعية</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">مختلفة</th>
                  <th className="border border-slate-400 p-1 w-16 text-[10px] font-semibold text-slate-700">من داخل<br/>المملكة</th>
                  <th className="border border-slate-400 p-1 w-16 text-[10px] font-semibold text-slate-700">من خارج<br/>المملكة</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">رباعي</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">ثماني</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">فانسار</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">اخرى</th>
                  <th className="border border-slate-400 p-1 w-14 text-[10px] font-semibold text-slate-700">أقل من سنة</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">1-4</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">5-9</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">10-14</th>
                  <th className="border border-slate-400 p-1 w-12 text-[10px] font-semibold text-slate-700">&gt; 14</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-1 text-sm font-semibold text-slate-800">{row.name}</td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.totalPatients} onChange={(e) => handleChange(index, 'totalPatients', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.testedSamples} onChange={(e) => handleChange(index, 'testedSamples', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 bg-slate-50 text-sm font-medium text-slate-600" value={row.percentage} readOnly /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.positives} onChange={(e) => handleChange(index, 'positives', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.distBenign} onChange={(e) => handleChange(index, 'distBenign', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.distMalignant} onChange={(e) => handleChange(index, 'distMalignant', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.distQuad} onChange={(e) => handleChange(index, 'distQuad', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.distMixed} onChange={(e) => handleChange(index, 'distMixed', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.casesInside} onChange={(e) => handleChange(index, 'casesInside', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.casesOutside} onChange={(e) => handleChange(index, 'casesOutside', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.treatmentQuad} onChange={(e) => handleChange(index, 'treatmentQuad', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.treatmentOct} onChange={(e) => handleChange(index, 'treatmentOct', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.treatmentFansidar} onChange={(e) => handleChange(index, 'treatmentFansidar', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.treatmentOther} onChange={(e) => handleChange(index, 'treatmentOther', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.ageUnder1} onChange={(e) => handleChange(index, 'ageUnder1', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.age1to4} onChange={(e) => handleChange(index, 'age1to4', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.age5to9} onChange={(e) => handleChange(index, 'age5to9', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.age10to14} onChange={(e) => handleChange(index, 'age10to14', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-sm font-medium" value={row.ageOver14} onChange={(e) => handleChange(index, 'ageOver14', e.target.value)} /></td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-slate-200 font-bold text-slate-800">
                  <td className="border border-slate-400 p-2 text-sm">المجموع</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('totalPatients')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('testedSamples')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('percentage')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('positives')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('distBenign')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('distMalignant')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('distQuad')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('distMixed')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('casesInside')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('casesOutside')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('treatmentQuad')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('treatmentOct')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('treatmentFansidar')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('treatmentOther')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('ageUnder1')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('age1to4')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('age5to9')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('age10to14')}</td>
                  <td className="border border-slate-400 p-2 text-sm">{calculateTotal('ageOver14')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer & Draggable Signature */}
          <div className="mt-16 text-center header-text space-y-4 relative min-h-[150px]">
            <p className="text-sm font-bold text-slate-800">مدير إدارة المراكز الصحية بالحناكية</p>
            <p className="text-sm font-bold text-slate-800">أ / عبدالمجيد سعود الربيقي</p>
            
            <motion.div 
              drag 
              dragMomentum={false}
              className="absolute left-1/2 -translate-x-1/2 top-10 cursor-move z-50 hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2"
              title="اسحب التوقيع لتحريكه"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Stylized_signature_sample.svg" 
                alt="توقيع المدير" 
                className="h-20 opacity-80 mix-blend-multiply pointer-events-none" 
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}