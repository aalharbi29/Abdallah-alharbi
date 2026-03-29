import React, { useState } from "react";
import { Printer, Droplets, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function FillWaterSamplesForm() {
  const [senderCenter, setSenderCenter] = useState("");
  const [incomingNumber, setIncomingNumber] = useState("");
  const [examinerName, setExaminerName] = useState("");
  const [sectionSupervisor, setSectionSupervisor] = useState("");
  const [labDirector, setLabDirector] = useState("أ/ سلطان عوده السيد");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const getDayName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[date.getDay()];
  };
  const dayName = getDayName(selectedDate);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const [saving, setSaving] = useState(false);

  const handlePrint = () => window.print();

  const handleSave = async () => {
    if (!senderCenter) {
      toast.error('يرجى اختيار الجهة المرسلة (المركز الصحي)');
      return;
    }

    setSaving(true);
    try {
      toast.loading('جاري تجهيز النموذج...', { id: 'save_process' });
      
      // 1. Fetch center ID
      const allCenters = await base44.entities.HealthCenter.list(undefined, 200);
      const cleanCenterName = senderCenter.replace('مركز صحي ', '').replace('مبنى شؤون المراكز ب', '');
      const center = allCenters.find(c => c.اسم_المركز && c.اسم_المركز.includes(cleanCenterName));
      const centerId = center ? center.id : senderCenter;
      const centerName = center ? center.اسم_المركز : senderCenter;

      // 2. Generate PDF
      const printElement = document.querySelector('.print-area');
      if (!printElement) throw new Error('No print area found');
      
      // --- Fix html2canvas text clipping for inputs ---
      const inputs = printElement.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea');
      const replacements = [];

      inputs.forEach(input => {
        const div = document.createElement('div');
        const computedStyle = window.getComputedStyle(input);
        
        div.className = input.className;
        div.textContent = input.tagName === 'SELECT' ? (input.options[input.selectedIndex]?.text || '') : input.value;
        
        // Copy essential styles
        div.style.width = computedStyle.width;
        div.style.minHeight = computedStyle.height;
        div.style.display = 'flex';
        div.style.boxSizing = 'border-box';
        div.style.overflow = 'visible';
        div.style.border = computedStyle.border;
        div.style.borderBottom = computedStyle.borderBottom;
        div.style.padding = computedStyle.padding;
        div.style.margin = computedStyle.margin;
        div.style.color = computedStyle.color;
        div.style.fontFamily = computedStyle.fontFamily;
        div.style.fontSize = computedStyle.fontSize;
        div.style.fontWeight = computedStyle.fontWeight;
        div.style.background = computedStyle.background;
        div.style.backgroundColor = computedStyle.backgroundColor;
        
        if (input.tagName === 'TEXTAREA') {
          div.style.alignItems = 'flex-start';
          div.style.whiteSpace = 'pre-wrap';
        } else {
          div.style.alignItems = 'center';
          div.style.whiteSpace = 'pre';
        }

        const textAlign = computedStyle.textAlign;
        if (textAlign === 'center') {
          div.style.justifyContent = 'center';
        } else if (textAlign === 'left') {
          div.style.justifyContent = computedStyle.direction === 'rtl' ? 'flex-end' : 'flex-start';
        } else if (textAlign === 'right') {
          div.style.justifyContent = computedStyle.direction === 'rtl' ? 'flex-start' : 'flex-end';
        }

        input.parentNode.insertBefore(div, input);
        
        const originalDisplay = input.style.display;
        input.style.display = 'none';
        
        replacements.push({ input, div, originalDisplay });
      });

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true, logging: false });

      // Revert inputs
      replacements.forEach(({ input, div, originalDisplay }) => {
        input.style.display = originalDisplay;
        div.remove();
      });
      // ------------------------------------------

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `عينات_مياه_${cleanCenterName}_${new Date().toISOString().split('T')[0]}.pdf`, { type: 'application/pdf' });
      
      // 3. Upload file
      toast.loading('جاري رفع المستند...', { id: 'save_process' });
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // 4. Save to CenterDocument
      toast.loading('جاري ربط المستند بالمركز...', { id: 'save_process' });
      await base44.entities.CenterDocument.create({
        center_id: centerId,
        center_name: centerName,
        document_title: `نموذج عينات مياه - ${selectedDate || new Date().toISOString().split('T')[0]}`,
        document_type: 'عينات مياه',
        description: `نتائج فحص عينات المياه للمركز (الأنواع: ${selectedTypes.length > 0 ? selectedTypes.join('، ') : 'غير محدد'})`,
        file_url: uploadResult.file_url,
        file_name: file.name,
        document_date: selectedDate || new Date().toISOString().split('T')[0]
      });

      toast.success('تم حفظ النموذج في مستندات المركز بنجاح', { id: 'save_process' });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('حدث خطأ أثناء الحفظ', { id: 'save_process' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { font-family: 'Tajawal', Arial, sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 10mm 15mm !important; box-sizing: border-box; }
          @page { size: A4; margin: 0; }
          input, select { background: transparent !important; }
          html, body, #root, .responsive-shell, main { height: auto !important; overflow: visible !important; width: 100% !important; display: block !important; position: static !important; }
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
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              حفظ في المركز
            </button>
          </div>
        </div>
      </div>

      {/* Print Area */}
      <div className="print-area max-w-4xl mx-auto bg-white shadow-xl min-h-[297mm] p-8 relative font-bold text-black border-[1px] border-slate-300 print:border-black print:border-2" style={{ fontFamily: 'Tajawal, Arial, sans-serif' }}>
        
        {/* Header Box */}
        <div className="mb-1 p-4 rounded-2xl border-2 border-black flex justify-between items-center">
          <div className="text-right leading-tight">
            <div className="mr-6 text-lg">المملكة العربية السعودية</div>
            <div className="mr-16 text-lg">وزارة الصحـــــــــــة</div>
            <div className="text-lg">التجمع الصحي بالمدينة المنورة</div>
            <div className="mr-10 text-lg">مختبر الصحة العامة</div>
          </div>
          <div className="flex-col items-center justify-center resize-x overflow-hidden max-w-[500px] min-w-[50px] w-24 hover:ring-2 hover:ring-slate-200 rounded">
            <img src="https://media.base44.com/images/public/68af5003813e47bd07947b30/9d3c650ad_moh_logo_transparent.png" alt="MOH" className="h-24 w-full object-fill pointer-events-none" />
          </div>
          <div className="text-right leading-relaxed text-base font-bold" dir="rtl">
            <div className="flex items-end gap-1 mb-1"><span className="whitespace-nowrap">صادر المختبر:</span><input className="border-b-2 border-dotted border-black bg-transparent focus:outline-none w-40 text-center" /></div>
            <div className="flex items-end gap-1 mb-1"><span className="whitespace-nowrap">التاريــــــخ:</span><input className="bg-transparent mr-2 text-center border-b-2 border-dotted border-black focus:outline-none w-40" defaultValue="    /    / 14 هـ" dir="rtl" /></div>
            <div className="flex items-end gap-1"><span className="whitespace-nowrap">المشفوعات:</span><input className="border-b-2 border-dotted border-black bg-transparent focus:outline-none w-40 text-center" /></div>
          </div>
        </div>

        {/* Sender Info */}
        <div className="mb-2 ml-6 pr-3 pl-8 text-base flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span>الجهة المرسلة:</span>
            <select
              className="bg-transparent focus:outline-none font-bold text-base min-w-[200px] cursor-pointer print:appearance-none"
              value={senderCenter}
              onChange={(e) => setSenderCenter(e.target.value)}>
              
              <option value="" disabled>اختر المركز...</option>
              <option value="مركز صحي الحسو">مركز صحي الحسو</option>
              <option value="مركز صحي الهميج">مركز صحي الهميج</option>
              <option value="مركز صحي بطحي">مركز صحي بطحي</option>
              <option value="مركز صحي طلال">مركز صحي طلال</option>
              <option value="مركز صحي الماوية">مركز صحي الماوية</option>
              <option value="مركز صحي بلغة">مركز صحي بلغة</option>
              <option value="مركز صحي هدبان">مركز صحي هدبان</option>
              <option value="مركز صحي صخيبرة">مركز صحي صخيبرة</option>
              <option value="مبنى شؤون المراكز بالحسو">مبنى شؤون المراكز بالحسو</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>رقم الوارد :</span>
            <input
              className="border-b-2 border-dotted border-black bg-transparent focus:outline-none text-center w-40"
              value={incomingNumber}
              onChange={(e) => setIncomingNumber(e.target.value)} />
            
          </div>
        </div>

        {/* Checkboxes Box */}
        <div className="border-2 border-black rounded-xl px-2 py-2 flex justify-between items-center mb-4 text-[12px] whitespace-nowrap overflow-hidden">
          <label className="flex items-center gap-1 cursor-pointer print:break-inside-avoid">
            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center print:border-black ${selectedTypes.includes("مياه") ? "bg-black print:bg-black" : "print:bg-white"}`} onClick={() => toggleType("مياه")}></div>
            <span className="text-[11px] sm:text-[12px]">مياه</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer print:break-inside-avoid">
            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center print:border-black ${selectedTypes.includes("أغذية") ? "bg-black print:bg-black" : "print:bg-white"}`} onClick={() => toggleType("أغذية")}></div>
            <span className="text-[11px] sm:text-[12px]">أغذية</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer print:break-inside-avoid">
            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center print:border-black ${selectedTypes.includes("مسحات") ? "bg-black print:bg-black" : "print:bg-white"}`} onClick={() => toggleType("مسحات")}></div>
            <span className="text-[11px] sm:text-[12px]">مسحات</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer print:break-inside-avoid">
            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center print:border-black ${selectedTypes.includes("بكتيري") ? "bg-black print:bg-black" : "print:bg-white"}`} onClick={() => toggleType("بكتيري")}></div>
            <span className="text-[11px] sm:text-[12px]">بكتيري</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer print:break-inside-avoid">
            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center print:border-black ${selectedTypes.includes("ضمات") ? "bg-black print:bg-black" : "print:bg-white"}`} onClick={() => toggleType("ضمات")}></div>
            <span className="text-[11px] sm:text-[12px]">ضمات</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer print:break-inside-avoid">
            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center print:border-black ${selectedTypes.includes("كيميائي") ? "bg-black print:bg-black" : "print:bg-white"}`} onClick={() => toggleType("كيميائي")}></div>
            <span className="text-[11px] sm:text-[12px]">كيميائي</span>
          </label>
          
          <div className="flex items-center gap-1 print:break-inside-avoid">
            <span className="text-[11px] sm:text-[12px]">ليوم:</span>
            <input
              value={dayName}
              readOnly
              placeholder="....." className="bg-transparent text-[11px] sm:text-sm font-bold text-center focus:outline-none w-10 sm:w-14" />
          </div>

          <div className="flex items-center gap-1 print:break-inside-avoid">
            <span className="text-[11px] sm:text-[12px]">الموافق:</span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="print:hidden bg-transparent text-[11px] sm:text-sm font-extrabold text-center normal-case focus:outline-none w-24 sm:w-28 cursor-pointer" />
              <span className="hidden print:inline-block text-[11px] sm:text-sm font-extrabold text-center w-24 sm:w-28">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB') : "   /   / 14 هـ"}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border-2 border-black mb-4 text-center">
          <thead>
            <tr>
              <th className="border-2 border-black p-2 w-[10%] font-bold">تسلسل<br />المختبر</th>
              <th className="border-2 border-black p-2 w-[10%] font-bold">رقم<br />العينة</th>
              <th className="border-2 border-black p-2 w-[25%] font-bold">نوع العينة</th>
              <th className="border-2 border-black p-2 w-[30%] font-bold">مكان اخذ العينة</th>
              <th className="border-2 border-black p-2 w-[25%] font-bold">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(9)].map((_, i) =>
            <tr key={i} className="h-10">
                <td className="border-2 border-black p-1"><input className="w-full h-full bg-transparent focus:outline-none text-center" /></td>
                <td className="border-2 border-black p-1"><input className="w-full h-full bg-transparent focus:outline-none text-center" /></td>
                <td className="border-2 border-black p-1"><input className="w-full h-full bg-transparent focus:outline-none text-center" /></td>
                <td className="border-2 border-black p-1"><input className="w-full h-full bg-transparent focus:outline-none text-center" /></td>
                <td className="border-2 border-black p-1"><input className="w-full h-full bg-transparent focus:outline-none text-center" /></td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Middle Details Boxes */}
        <div className="flex gap-4 mb-4 h-10">
          <div className="pr-8 pl-6 rounded-full border-2 border-black flex items-center gap-2 flex-1 h-full">
            <span className="whitespace-nowrap font-bold text-base">أخذ العينة :</span>
            <input className="bg-transparent focus:outline-none w-full font-bold text-base" defaultValue="عبدالله الحربي" />
          </div>
          <div className="border-2 border-black rounded-full px-6 flex items-center gap-2 flex-1 h-full">
            <span className="whitespace-nowrap font-bold text-base">المستلم :</span>
            <input className="bg-transparent focus:outline-none w-full text-center font-bold text-base" defaultValue="     /      /     14 هـ" dir="rtl" />
          </div>
        </div>

        {/* Results Box */}
        <div className="border-2 border-black rounded-2xl p-6 mb-4 relative min-h-[120px] print:min-h-[100px]">
          <div className="text-center"><span className="underline underline-offset-4 text-lg">مختبر الصحة العامة</span></div>
          <div className="text-lg">تم فحص العينات المدونة أعلاه ، وكانت النتيجة كالتالي :</div>
          <div className="mt-2 space-y-8">
            <div className="border-b-2 border-dotted border-black w-full"></div>
            <div className="border-b-2 border-dotted border-black w-full"></div>
          </div>
        </div>

        {/* Signatures Box */}
        <div className="border-2 border-black rounded-2xl p-4 flex justify-between min-h-[120px] print:break-inside-avoid print:min-h-[100px] print:mb-0">
          <div className="flex flex-col justify-center gap-8 w-1/2">
            <div className="flex items-end gap-2 text-lg">
              <span className="whitespace-nowrap">الفاحص:</span>
              <input className="border-b-2 border-dotted border-black bg-transparent focus:outline-none w-full font-bold"
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)} />
              
            </div>
            <div className="flex items-end gap-2 text-lg">
              <span className="whitespace-nowrap">مشرف القسم:</span>
              <input className="border-b-2 border-dotted border-black bg-transparent focus:outline-none w-full font-bold"
              value={sectionSupervisor}
              onChange={(e) => setSectionSupervisor(e.target.value)} />
              
            </div>
          </div>
          
          <div className="w-1/2 flex flex-col items-center justify-start gap-8 text-center pt-2">
            <div className="text-lg whitespace-nowrap">مدير مختبر الصحة العامة</div>
            <div className="w-full px-12">
              <input className="bg-transparent pt-1 pb-2 text-xl font-bold text-center focus:outline-none w-full"

              value={labDirector}
              onChange={(e) => setLabDirector(e.target.value)} />
              
            </div>
          </div>
        </div>
      </div>
    </div>);

}