import React, { useState, useRef } from "react";
import { Printer, Download, Plus, Trash2, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import useLogoSettings from "@/components/settings/useLogoSettings";
import DraggableLogo from "@/components/common/DraggableLogo";
import OfficialFooter from "@/components/common/OfficialFooter";

const SAMPLE_TYPES = ["بكتيري", "كيميائي", "ضمات", "أغذية", "مسحات", "مياه"];

const RESULT_OPTIONS = ["مطابق", "غير مطابق", "قيد الفحص"];

const emptyRow = () => ({
  serial: "",
  source: "",
  sampleType: "",
  collectionDate: "",
  receivedDate: "",
  result: "",
  notes: "",
});

export default function FillWaterSamplesForm() {
  const { logoSettings } = useLogoSettings();

  const [senderCenter, setSenderCenter] = useState("");
  const [incomingNumber, setIncomingNumber] = useState("");
  const [examinerName, setExaminerName] = useState("");
  const [sectionSupervisor, setSectionSupervisor] = useState("");
  const [labDirector, setLabDirector] = useState("أ/ سلطان عوده السيد");
  const [reportDate, setReportDate] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  const handlePrint = () => window.print();

  const inputCls =
    "border-0 border-b border-gray-500 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-blue-500 px-1 h-7 text-sm";

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
      <div className="print-area max-w-5xl mx-auto bg-white shadow-xl min-h-[297mm] p-10 relative">
        <DraggableLogo className="top-8 right-8" storageKey="water_samples" />

        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-gray-800 pb-4 pt-16">
          <h1 className="text-xl font-extrabold text-gray-900">مختبر الصحة العامة</h1>
          <h2 className="text-base font-bold text-gray-700 mt-1">نتائج فحص عينات المياه والمسحات</h2>
        </div>

        {/* Meta Info Row */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="font-bold text-gray-700 whitespace-nowrap">الجهة المرسلة:</span>
            <Input
              className={`${inputCls} flex-1`}
              placeholder="اسم المركز الصحي"
              value={senderCenter}
              onChange={(e) => setSenderCenter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <span className="font-bold text-gray-700 whitespace-nowrap">رقم الوارد:</span>
            <Input
              className={`${inputCls} flex-1`}
              placeholder="رقم الوارد"
              value={incomingNumber}
              onChange={(e) => setIncomingNumber(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <span className="font-bold text-gray-700 whitespace-nowrap">التاريخ:</span>
            <Input
              type="date"
              className={`${inputCls} flex-1`}
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
        </div>

        {/* Sample Type Checkboxes */}
        <div className="flex flex-wrap gap-4 mb-6 border border-gray-300 rounded-lg p-3 bg-gray-50">
          <span className="font-bold text-gray-700 text-sm self-center">نوع العينة:</span>
          {SAMPLE_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-800">
              <div
                onClick={() => toggleType(type)}
                className={`w-5 h-5 border-2 border-gray-600 rounded flex items-center justify-center cursor-pointer transition-colors ${
                  selectedTypes.includes(type) ? "bg-blue-600 border-blue-600" : "bg-white"
                }`}
              >
                {selectedTypes.includes(type) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {type}
            </label>
          ))}
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-800 text-sm mb-6" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "23%" }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-200 print:bg-gray-200 text-center">
              <th className="border border-gray-800 p-1.5 font-bold text-xs">#</th>
              <th className="border border-gray-800 p-1.5 font-bold text-xs">مصدر العينة</th>
              <th className="border border-gray-800 p-1.5 font-bold text-xs">نوع الفحص</th>
              <th className="border border-gray-800 p-1.5 font-bold text-xs">تاريخ الأخذ</th>
              <th className="border border-gray-800 p-1.5 font-bold text-xs">تاريخ الاستلام</th>
              <th className="border border-gray-800 p-1.5 font-bold text-xs">النتيجة</th>
              <th className="border border-gray-800 p-1.5 font-bold text-xs">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 h-[28px]">
                <td className="border border-gray-800 text-center text-xs font-bold text-gray-500 p-0">
                  <div className="flex items-center justify-center gap-1">
                    <span>{i + 1}</span>
                    <button
                      onClick={() => removeRow(i)}
                      className="no-print text-red-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="border border-gray-800 p-0">
                  <input
                    className="w-full h-full px-1 py-0 bg-transparent focus:outline-none text-xs"
                    placeholder="مصدر العينة"
                    value={row.source}
                    onChange={(e) => updateRow(i, "source", e.target.value)}
                  />
                </td>
                <td className="border border-gray-800 p-0">
                  <select
                    className="w-full h-full px-1 py-0 bg-transparent focus:outline-none text-xs appearance-none"
                    value={row.sampleType}
                    onChange={(e) => updateRow(i, "sampleType", e.target.value)}
                  >
                    <option value="">--</option>
                    {SAMPLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-800 p-0">
                  <input
                    type="date"
                    className="w-full h-full px-1 py-0 bg-transparent focus:outline-none text-xs"
                    value={row.collectionDate}
                    onChange={(e) => updateRow(i, "collectionDate", e.target.value)}
                  />
                </td>
                <td className="border border-gray-800 p-0">
                  <input
                    type="date"
                    className="w-full h-full px-1 py-0 bg-transparent focus:outline-none text-xs"
                    value={row.receivedDate}
                    onChange={(e) => updateRow(i, "receivedDate", e.target.value)}
                  />
                </td>
                <td className="border border-gray-800 p-0">
                  <select
                    className="w-full h-full px-1 py-0 bg-transparent focus:outline-none text-xs appearance-none"
                    value={row.result}
                    onChange={(e) => updateRow(i, "result", e.target.value)}
                  >
                    <option value="">--</option>
                    {RESULT_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-800 p-0">
                  <input
                    className="w-full h-full px-1 py-0 bg-transparent focus:outline-none text-xs"
                    placeholder="ملاحظات"
                    value={row.notes}
                    onChange={(e) => updateRow(i, "notes", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addRow}
          className="no-print mb-8 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة صف
        </button>

        {/* Signatures */}
        <div className="mt-10 grid grid-cols-3 gap-6 text-center text-sm">
          <div className="space-y-2">
            <p className="font-bold text-gray-700">الفاحص</p>
            <input
              className="w-full border-b border-gray-500 bg-transparent focus:outline-none text-center font-semibold text-gray-800 pb-1"
              placeholder="اسم الفاحص"
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)}
            />
            <div className="h-10 border-b border-gray-400"></div>
            <p className="text-xs text-gray-500">التوقيع</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-gray-700">مشرف القسم</p>
            <input
              className="w-full border-b border-gray-500 bg-transparent focus:outline-none text-center font-semibold text-gray-800 pb-1"
              placeholder="اسم المشرف"
              value={sectionSupervisor}
              onChange={(e) => setSectionSupervisor(e.target.value)}
            />
            <div className="h-10 border-b border-gray-400"></div>
            <p className="text-xs text-gray-500">التوقيع</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-gray-700">مدير مختبر الصحة العامة</p>
            <input
              className="w-full border-b border-gray-500 bg-transparent focus:outline-none text-center font-semibold text-gray-800 pb-1"
              value={labDirector}
              onChange={(e) => setLabDirector(e.target.value)}
            />
            <div className="h-10 border-b border-gray-400"></div>
            <p className="text-xs text-gray-500">التوقيع</p>
          </div>
        </div>

        <OfficialFooter className="mt-10" />
      </div>
    </div>
  );
}