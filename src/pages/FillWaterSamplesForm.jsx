import React, { useState } from "react";
import { Printer, Droplets } from "lucide-react";

export default function FillWaterSamplesForm() {
  const [senderCenter, setSenderCenter] = useState("");
  const [incomingNumber, setIncomingNumber] = useState("");
  const [examinerName, setExaminerName] = useState("");
  const [sectionSupervisor, setSectionSupervisor] = useState("");
  const [labDirector, setLabDirector] = useState("أ/ سلطان عوده السيد");
  const [selectedTypes, setSelectedTypes] = useState([]);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { font-family: 'Tajawal', Arial, sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          @page { size: A4; margin: 12mm; }
          input, select { border: none !important; background: transparent !important; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">نموذج عينات مياه</h2>
              <p className="text-sm text-slate-500">نتائج فحص عينات المياه والمسحات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> طباعة
            </button>
          </div>
        </div>
      </div>

      {/* Print Area */}
      <div className="print-area max-w-5xl mx-auto bg-white shadow-xl min-h-[297mm] p-12 relative text-xl font-bold leading-loose">
        
        {/* Meta Info Row */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 w-1/2">
            <span className="whitespace-nowrap">الجهة المرسلة:</span>
            <input
              className="bg-transparent focus:outline-none px-2 flex-1 font-bold text-xl"
              value={senderCenter}
              placeholder="مركز صحي بلغة"
              onChange={(e) => setSenderCenter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-1/3">
            <span className="whitespace-nowrap">رقم الوارد  :</span>
            <input
              className="bg-transparent focus:outline-none px-2 flex-1 font-bold text-xl"
              value={incomingNumber}
              onChange={(e) => setIncomingNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Sample Type Checkboxes */}
        <div className="flex justify-between items-center mb-16 px-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={selectedTypes.includes("كيميائي")} onChange={() => toggleType("كيميائي")} />
            <span>كيميائي</span>
          </label>
          
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">ليوم :</span>
            <input
              className="bg-transparent focus:outline-none px-2 w-48 text-center font-bold text-xl"
              placeholder="............................"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">الموافق :</span>
            <input
              className="bg-transparent focus:outline-none px-2 w-48 text-center font-bold text-xl"
              placeholder="04/   05  / 7 144هـ"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={selectedTypes.includes("بكتيري")} onChange={() => toggleType("بكتيري")} />
            <span>بكتيري</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={selectedTypes.includes("ضمات")} onChange={() => toggleType("ضمات")} />
            <span>ضمات</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={selectedTypes.includes("أغذية")} onChange={() => toggleType("أغذية")} />
            <span>أغذية</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={selectedTypes.includes("مسحات")} onChange={() => toggleType("مسحات")} />
            <span>مسحات</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={selectedTypes.includes("مياه")} onChange={() => toggleType("مياه")} />
            <span>مياه</span>
          </label>
        </div>

        {/* Signatures Area */}
        <div className="mt-16 space-y-16 text-xl font-bold">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">الفاحص :</span>
            <input
              className="bg-transparent focus:outline-none px-2 w-64 font-bold text-xl"
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <span className="whitespace-nowrap ml-32">مدير مختبر الصحة العامة</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">مشرف  القسم :</span>
              <input
                className="bg-transparent focus:outline-none px-2 w-64 font-bold text-xl"
                value={sectionSupervisor}
                onChange={(e) => setSectionSupervisor(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                className="bg-transparent focus:outline-none px-2 w-80 text-center ml-10 font-bold text-xl"
                value={labDirector}
                onChange={(e) => setLabDirector(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}