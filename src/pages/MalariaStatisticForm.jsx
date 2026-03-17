import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialCenters = [
  "مركز صحي الحسو",
  "مركز صحي الماوية",
  "مركز صحي الهميج",
  "مركز صحي بطحي",
  "مركز صحي بلغه",
  "مركز صحي صخيبره",
  "مركز صحي طلال",
  "مركز صحي هدبان"
];

export default function MalariaStatisticForm() {
  const navigate = useNavigate();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [data, setData] = useState(
    initialCenters.map(center => ({
      name: center,
      totalPatients: "",
      testedSamples: "",
      percentage: "",
      positives: "",
      distBenign: "",
      distMalignant: "",
      distQuad: "",
      distMixed: "",
      casesInside: "",
      casesOutside: "",
      treatmentQuad: "",
      treatmentOct: "",
      treatmentFansidar: "",
      treatmentOther: "",
      ageUnder1: "",
      age1to4: "",
      age5to9: "",
      age10to14: "",
      ageOver14: ""
    }))
  );

  const handlePrint = () => {
    window.print();
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
        newData[index].percentage = "";
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
      return "";
    }
    const sum = data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
    return sum > 0 ? sum : "";
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
          }
          input { 
            border: none !important; 
            background: transparent !important; 
            padding: 0 !important; 
            text-align: center;
            font-size: 11pt !important;
            font-weight: bold;
            color: black !important;
          }
          input::placeholder { color: transparent; }
          table { border-collapse: collapse; width: 100%; }
          th, td { 
            border: 2px solid black !important; 
            padding: 4px !important; 
            text-align: center; 
            font-size: 11pt !important;
            color: black !important;
          }
          th { font-weight: bold; background-color: white !important; }
          .header-text { font-size: 14pt; font-weight: bold; color: black; }
          .title-text { font-size: 20pt; font-weight: bold; text-decoration: underline; color: black; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Printer className="w-4 h-4" />
            طباعة / تصدير PDF
          </Button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm print-container border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-right space-y-1 header-text">
              <p>تجمع المدينة المنورة الصحي</p>
              <p>شؤون المراكز الصحية بالحسو</p>
            </div>
            <div className="text-center">
              <h1 className="title-text text-2xl font-bold underline mb-6">أعمال فحص الدم للملاريا</h1>
              <div className="flex gap-8 justify-center text-lg font-bold">
                <div className="flex items-center gap-2">
                  <span>الشهر :</span>
                  <Input 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)} 
                    className="w-32 h-8 text-center font-bold text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 px-0"
                    placeholder="........"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>السنة :</span>
                  <Input 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    className="w-24 h-8 text-center font-bold text-lg border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 px-0"
                  />
                </div>
              </div>
            </div>
            <div className="w-48"></div> {/* Spacer for balance */}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-black text-center">
              <thead>
                <tr>
                  <th rowSpan={2} className="border-2 border-black p-2 w-32">اسم المركز</th>
                  <th rowSpan={2} className="border-2 border-black p-2 w-20">اجمالي<br/>المراجعين</th>
                  <th rowSpan={2} className="border-2 border-black p-2 w-20">عدد<br/>العينات<br/>المفحوصة</th>
                  <th rowSpan={2} className="border-2 border-black p-2 w-16">النسبة</th>
                  <th rowSpan={2} className="border-2 border-black p-2 w-16">عدد<br/>الايجابي</th>
                  <th colSpan={4} className="border-2 border-black p-2">توزيع الحالات</th>
                  <th colSpan={2} className="border-2 border-black p-2">عدد الحالات</th>
                  <th colSpan={4} className="border-2 border-black p-2">نوع وكمية العلاج</th>
                  <th colSpan={5} className="border-2 border-black p-2">الايجابي حسب فئات العمر</th>
                </tr>
                <tr>
                  <th className="border-2 border-black p-1 w-12 text-sm">حميدة</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">خبيثة</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">رباعية</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">مختلفة</th>
                  <th className="border-2 border-black p-1 w-16 text-sm">من داخل<br/>المملكة</th>
                  <th className="border-2 border-black p-1 w-16 text-sm">من خارج<br/>المملكة</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">رباعي</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">ثماني</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">فانسار</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">اخرى</th>
                  <th className="border-2 border-black p-1 w-14 text-sm">أقل من سنة</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">1-4</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">5-9</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">10-14</th>
                  <th className="border-2 border-black p-1 w-12 text-sm">&gt; 14</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td className="border-2 border-black p-1 font-bold">{row.name}</td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.totalPatients} onChange={(e) => handleChange(index, 'totalPatients', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.testedSamples} onChange={(e) => handleChange(index, 'testedSamples', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 bg-gray-50" value={row.percentage} readOnly /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.positives} onChange={(e) => handleChange(index, 'positives', e.target.value)} /></td>
                    
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.distBenign} onChange={(e) => handleChange(index, 'distBenign', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.distMalignant} onChange={(e) => handleChange(index, 'distMalignant', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.distQuad} onChange={(e) => handleChange(index, 'distQuad', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.distMixed} onChange={(e) => handleChange(index, 'distMixed', e.target.value)} /></td>
                    
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.casesInside} onChange={(e) => handleChange(index, 'casesInside', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.casesOutside} onChange={(e) => handleChange(index, 'casesOutside', e.target.value)} /></td>
                    
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.treatmentQuad} onChange={(e) => handleChange(index, 'treatmentQuad', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.treatmentOct} onChange={(e) => handleChange(index, 'treatmentOct', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.treatmentFansidar} onChange={(e) => handleChange(index, 'treatmentFansidar', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.treatmentOther} onChange={(e) => handleChange(index, 'treatmentOther', e.target.value)} /></td>
                    
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.ageUnder1} onChange={(e) => handleChange(index, 'ageUnder1', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.age1to4} onChange={(e) => handleChange(index, 'age1to4', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.age5to9} onChange={(e) => handleChange(index, 'age5to9', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.age10to14} onChange={(e) => handleChange(index, 'age10to14', e.target.value)} /></td>
                    <td className="border-2 border-black p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1" value={row.ageOver14} onChange={(e) => handleChange(index, 'ageOver14', e.target.value)} /></td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 font-bold">
                  <td className="border-2 border-black p-2">المجموع</td>
                  <td className="border-2 border-black p-2">{calculateTotal('totalPatients')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('testedSamples')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('percentage')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('positives')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('distBenign')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('distMalignant')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('distQuad')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('distMixed')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('casesInside')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('casesOutside')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('treatmentQuad')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('treatmentOct')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('treatmentFansidar')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('treatmentOther')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('ageUnder1')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('age1to4')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('age5to9')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('age10to14')}</td>
                  <td className="border-2 border-black p-2">{calculateTotal('ageOver14')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center header-text space-y-4">
            <p>مدير إدارة المراكز الصحية بالحناكية</p>
            <p>أ / عبدالمجيد سعود الربيقي</p>
            {/* Placeholder for signature if needed */}
            <div className="h-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}