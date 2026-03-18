import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, ArrowRight, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, useMotionValue } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import DraggableLogo from "@/components/common/DraggableLogo";
import OfficialFooter from "@/components/common/OfficialFooter";
import { Settings } from "lucide-react";

const initialCenters = [
"الحسو",
"الماوية",
"الهميج",
"بطحي",
"بلغه",
"صخيبره",
"طلال",
"هدبان"];

const months = [
{ value: 1, label: "يناير" }, { value: 2, label: "فبراير" }, { value: 3, label: "مارس" },
{ value: 4, label: "أبريل" }, { value: 5, label: "مايو" }, { value: 6, label: "يونيو" },
{ value: 7, label: "يوليو" }, { value: 8, label: "أغسطس" }, { value: 9, label: "سبتمبر" },
{ value: 10, label: "أكتوبر" }, { value: 11, label: "نوفمبر" }, { value: 12, label: "ديسمبر" }];

export default function MalariaStatisticForm() {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("https://upload.wikimedia.org/wikipedia/commons/f/f8/Stylized_signature_sample.svg");
  
  const [headerText1, setHeaderText1] = useState(localStorage.getItem('stat_header1') || "تجمع المدينة المنورة الصحي");
  const [headerText2, setHeaderText2] = useState(localStorage.getItem('stat_header2') || "شؤون المراكز الصحية بالحسو");
  const [managerName, setManagerName] = useState(localStorage.getItem('stat_managerName') || "أ / عبدالمجيد سعود الربيقي");
  const [managerTitle, setManagerTitle] = useState(localStorage.getItem('stat_managerTitle') || "مدير إدارة المراكز الصحية بالحناكية");

  React.useEffect(() => {
    const fetchSignature = async () => {
      try {
        const records = await base44.entities.StampSignature.filter({ type: 'signature', is_default: true, is_active: true });
        if (records && records.length > 0) {
          setSignatureUrl(records[0].image_url);
          if (!localStorage.getItem('stat_managerName') && records[0].owner_name) setManagerName(records[0].owner_name);
          if (!localStorage.getItem('stat_managerTitle') && records[0].owner_title) setManagerTitle(records[0].owner_title);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };
    fetchSignature();
  }, []);

  const initialHeaderPos = JSON.parse(localStorage.getItem('malaria_headerPos')) || { x: 0, y: 0 };
  const headerX = useMotionValue(initialHeaderPos.x);
  const headerY = useMotionValue(initialHeaderPos.y);

  const initialTitlePos = JSON.parse(localStorage.getItem('malaria_titlePos')) || { x: 0, y: 0 };
  const titleX = useMotionValue(initialTitlePos.x);
  const titleY = useMotionValue(initialTitlePos.y);

  const initialTablePos = JSON.parse(localStorage.getItem('malaria_tablePos')) || { x: 0, y: 0 };
  const tableX = useMotionValue(initialTablePos.x);
  const tableY = useMotionValue(initialTablePos.y);

  const initialManagerPos = JSON.parse(localStorage.getItem('malaria_managerPos')) || { x: 0, y: 0 };
  const managerX = useMotionValue(initialManagerPos.x);
  const managerY = useMotionValue(initialManagerPos.y);

  const initialSignaturePos = JSON.parse(localStorage.getItem('malaria_signaturePos')) || { x: 0, y: 0 };
  const signatureX = useMotionValue(initialSignaturePos.x);
  const signatureY = useMotionValue(initialSignaturePos.y);

  const handleSaveSettings = () => {
    localStorage.setItem('stat_header1', headerText1);
    localStorage.setItem('stat_header2', headerText2);
    localStorage.setItem('stat_managerName', managerName);
    localStorage.setItem('stat_managerTitle', managerTitle);
    
    localStorage.setItem('malaria_headerPos', JSON.stringify({ x: headerX.get(), y: headerY.get() }));
    localStorage.setItem('malaria_titlePos', JSON.stringify({ x: titleX.get(), y: titleY.get() }));
    localStorage.setItem('malaria_tablePos', JSON.stringify({ x: tableX.get(), y: tableY.get() }));
    localStorage.setItem('malaria_managerPos', JSON.stringify({ x: managerX.get(), y: managerY.get() }));
    localStorage.setItem('malaria_signaturePos', JSON.stringify({ x: signatureX.get(), y: signatureY.get() }));
    
    toast.success("تم حفظ النمط ومواقع العناصر بنجاح");
  };

  const [data, setData] = useState(
    initialCenters.map((center) => ({
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

  const handleDownloadPDF = async () => {
    if (!month) {
      toast.error("الرجاء اختيار الشهر أولاً");
      return;
    }

    try {
      setIsExporting(true);
      setIsSaving(true);
      toast.loading("جاري تجهيز الملف...", { id: "download-pdf" });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = printRef.current;
      const originalScrollY = window.scrollY;
      const originalScrollX = window.scrollX;

      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;

      element.style.width = `${element.scrollWidth}px`;
      element.style.maxWidth = 'none';

      window.scrollTo(0, 0);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1500,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('malaria-print-container');
          if (el) {
            el.classList.add('printing-mode');
            const table = el.querySelector('table');
            if (table && table.parentElement) {
              table.parentElement.classList.remove('overflow-x-auto');
              table.parentElement.style.overflow = 'visible';
            }
            // Replace inputs with spans to fix text rendering issues in html2canvas
            const inputs = el.querySelectorAll('input');
            inputs.forEach(input => {
              if (input.type !== 'range' && input.type !== 'file') {
                const span = clonedDoc.createElement('span');
                span.textContent = input.value || '';
                span.className = input.className + ' cloned-input';
                span.style.display = 'inline-block';
                span.style.width = '100%';
                span.style.lineHeight = 'normal';
                span.style.padding = '2px 0';
                input.parentNode.replaceChild(span, input);
              }
            });
          }
        },
        ignoreElements: (el) => el.classList.contains('no-print') || el.tagName.toLowerCase() === 'svg'
      });

      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      window.scrollTo(originalScrollX, originalScrollY);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`malaria_statistic_${year}_${month}.pdf`);

      toast.success("تم تحميل الملف بنجاح", { id: "download-pdf" });
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء التحميل", { id: "download-pdf" });
    } finally {
      setIsExporting(false);
      setIsSaving(false);
    }
  };

  const handleSaveToStatistics = async () => {
    if (!month) {
      toast.error("الرجاء اختيار الشهر أولاً");
      return;
    }

    try {
      setIsExporting(true);
      setIsSaving(true);
      toast.loading("جاري حفظ الإحصائية...", { id: "save-stat" });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = printRef.current;
      const originalScrollY = window.scrollY;
      const originalScrollX = window.scrollX;

      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;

      element.style.width = `${element.scrollWidth}px`;
      element.style.maxWidth = 'none';

      window.scrollTo(0, 0);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1500,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('malaria-print-container');
          if (el) {
            el.classList.add('printing-mode');
            const table = el.querySelector('table');
            if (table && table.parentElement) {
              table.parentElement.classList.remove('overflow-x-auto');
              table.parentElement.style.overflow = 'visible';
            }
            // Replace inputs with spans to fix text rendering issues in html2canvas
            const inputs = el.querySelectorAll('input');
            inputs.forEach(input => {
              if (input.type !== 'range' && input.type !== 'file') {
                const span = clonedDoc.createElement('span');
                span.textContent = input.value || '';
                span.className = input.className + ' cloned-input';
                span.style.display = 'inline-block';
                span.style.width = '100%';
                span.style.lineHeight = 'normal';
                span.style.padding = '2px 0';
                input.parentNode.replaceChild(span, input);
              }
            });
          }
        },
        ignoreElements: (el) => el.classList.contains('no-print') || el.tagName.toLowerCase() === 'svg'
      });

      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      window.scrollTo(originalScrollX, originalScrollY);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');

      const file = new File([pdfBlob], `malaria_statistic_${year}_${month}.pdf`, { type: 'application/pdf' });

      const uploadRes = await base44.integrations.Core.UploadFile({ file });

      const selectedMonth = months.find((m) => m.value.toString() === month);

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
      setIsExporting(false);
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
        newData[index].percentage = (samples / patients * 100).toFixed(1) + '%';
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
        return (totalSamples / totalPatients * 100).toFixed(1) + '%';
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
            margin: 0 !important;
            font-weight: 600;
            color: black !important;
          }
          table input {
            height: auto !important;
            min-height: 20px !important;
            text-align: center;
            font-size: 8pt !important;
          }
          .print-header-input {
            font-size: 12pt !important;
            text-align: right !important;
          }
          .print-manager-input {
            font-size: 14pt !important;
            text-align: center !important;
          }
          input::placeholder { color: transparent; }
          table { border-collapse: collapse; width: 100%; }
          th, td { 
            border: 1px solid #475569 !important; 
            padding: 4px 2px !important; 
            text-align: center; 
            color: black !important;
            height: auto !important;
          }
          th { 
            font-weight: 700; 
            background-color: #f1f5f9 !important; 
            font-size: 8pt !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          td {
            font-size: 8pt !important;
          }
          .header-text { font-size: 12pt; font-weight: bold; color: black; }
          .title-text { font-size: 18pt; font-weight: bold; text-decoration: underline; color: black; }
        }

        /* html2canvas printing mode styles */
        .printing-mode {
          width: 1500px !important;
          max-width: none !important;
          background: white !important;
          padding: 20px !important;
          box-shadow: none !important;
          border: none !important;
        }
        .printing-mode .no-print { display: none !important; }
        .printing-mode .print-only { display: block !important; }
        .printing-mode input, .printing-mode .cloned-input { 
          border: none !important; 
          background: transparent !important; 
          padding: 0 !important;
          margin: 0 !important;
          font-weight: 600 !important;
          color: black !important;
        }
        .printing-mode table input, .printing-mode table .cloned-input {
          height: auto !important;
          min-height: 20px !important;
          text-align: center !important;
          font-size: 8pt !important;
        }
        .printing-mode .print-header-input {
          font-size: 12pt !important;
          text-align: right !important;
        }
        .printing-mode .print-manager-input {
          font-size: 14pt !important;
          text-align: center !important;
        }
        .printing-mode input::placeholder { color: transparent !important; }
        .printing-mode table { border-collapse: collapse !important; width: 100% !important; }
        .printing-mode th, .printing-mode td { 
          border: 1px solid #475569 !important; 
          padding: 1px !important; 
          text-align: center !important; 
          color: black !important;
          height: 18px !important;
        }
        .printing-mode th { 
          font-weight: 700 !important; 
          background-color: #f1f5f9 !important; 
          font-size: 8pt !important;
        }
        .printing-mode td {
          font-size: 8pt !important;
        }
        .printing-mode .header-text { font-size: 12pt !important; font-weight: bold !important; color: black !important; }
        .printing-mode .title-text { font-size: 18pt !important; font-weight: bold !important; text-decoration: underline !important; color: black !important; }
        .printing-mode button[role="combobox"] { border-color: transparent !important; }
        .printing-mode button[role="combobox"] svg { display: none !important; }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة
          </Button>
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveSettings} 
              variant="outline" 
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Settings className="w-4 h-4" />
              حفظ النمط
            </Button>
            <Button
              onClick={handleSaveToStatistics}
              disabled={isSaving}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ في الإحصائيات
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              تصدير PDF
            </Button>
            <Button onClick={() => window.print()} className="gap-2 bg-slate-600 hover:bg-slate-700 text-white">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </div>
        </div>

        <div id="malaria-print-container" ref={printRef} className="bg-white p-8 rounded-xl shadow-sm print-container border border-gray-200 relative">
          <DraggableLogo className="top-8 right-8" storageKey="malaria" />
          {/* Header */}
          <div className="flex justify-between items-start mb-8 relative z-10">
            <motion.div style={{ x: headerX, y: headerY }} drag dragMomentum={false} className="text-right space-y-1 header-text cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 z-50">
              <input 
                value={headerText1} 
                onChange={(e) => setHeaderText1(e.target.value)} 
                className="block w-full bg-transparent border-none focus:ring-0 p-0 m-0 text-right font-bold text-black print-header-input" 
              />
              <input 
                value={headerText2} 
                onChange={(e) => setHeaderText2(e.target.value)} 
                className="block w-full bg-transparent border-none focus:ring-0 p-0 m-0 text-right font-bold text-black print-header-input" 
              />
            </motion.div>
            <motion.div style={{ x: titleX, y: titleY }} drag dragMomentum={false} className="text-center cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 z-50">
              <h1 className="title-text text-2xl font-bold underline mb-6">أعمال فحص الدم للملاريا</h1>
              <div className="flex gap-8 justify-center text-lg font-bold" onPointerDownCapture={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">الشهر :</span>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className={`w-32 h-8 text-center font-bold border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus:ring-0 px-0 bg-transparent [&>svg]:print:hidden ${isExporting ? 'border-transparent [&>svg]:hidden' : 'border-slate-300'}`}>
                      <SelectValue placeholder="اختر الشهر" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) =>
                      <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">السنة :</span>
                  <Input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={`w-24 h-8 text-center font-bold border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 px-0 bg-transparent ${isExporting ? 'border-transparent' : 'border-slate-300'}`} />
                  
                </div>
              </div>
            </motion.div>
            <div className="w-48"></div> {/* Spacer for balance */}
          </div>

          {/* Table */}
          <motion.div 
            style={{ x: tableX, y: tableY }}
            drag 
            dragMomentum={false} 
            className={`${isExporting ? '' : 'overflow-x-auto'} print:overflow-visible relative z-10 cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 print:p-0 print:mb-2`}
            onPointerDownCapture={(e) => {
              if (['INPUT', 'BUTTON', 'SELECT', 'OPTION'].includes(e.target.tagName) || e.target.closest('button')) {
                e.stopPropagation();
              }
            }}
          >
            <table className="w-full border-collapse border border-slate-400 text-center">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan={2} className="border border-slate-400 p-2 w-32 text-xs font-bold text-slate-800">اسم المركز</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-20 text-xs font-bold text-slate-800">اجمالي<br />المراجعين</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-20 text-xs font-bold text-slate-800">عدد<br />العينات<br />المفحوصة</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-16 text-xs font-bold text-slate-800">النسبة</th>
                  <th rowSpan={2} className="border border-slate-400 p-2 w-16 text-xs font-bold text-slate-800">عدد<br />الايجابي</th>
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
                  <th className="border border-slate-400 p-1 w-16 text-[10px] font-semibold text-slate-700">من داخل<br />المملكة</th>
                  <th className="border border-slate-400 p-1 w-16 text-[10px] font-semibold text-slate-700">من خارج<br />المملكة</th>
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
                {data.map((row, index) =>
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-0 text-[10px] font-semibold text-slate-800">{row.name}</td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.totalPatients} onChange={(e) => handleChange(index, 'totalPatients', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.testedSamples} onChange={(e) => handleChange(index, 'testedSamples', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="bg-slate-50 text-slate-950 p-0 text-[10px] font-medium text-center rounded-none flex border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-[10px] file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full h-5 border-0 focus-visible:ring-1" value={row.percentage} readOnly /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.positives} onChange={(e) => handleChange(index, 'positives', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.distBenign} onChange={(e) => handleChange(index, 'distBenign', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.distMalignant} onChange={(e) => handleChange(index, 'distMalignant', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.distQuad} onChange={(e) => handleChange(index, 'distQuad', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.distMixed} onChange={(e) => handleChange(index, 'distMixed', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.casesInside} onChange={(e) => handleChange(index, 'casesInside', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.casesOutside} onChange={(e) => handleChange(index, 'casesOutside', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.treatmentQuad} onChange={(e) => handleChange(index, 'treatmentQuad', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.treatmentOct} onChange={(e) => handleChange(index, 'treatmentOct', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.treatmentFansidar} onChange={(e) => handleChange(index, 'treatmentFansidar', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.treatmentOther} onChange={(e) => handleChange(index, 'treatmentOther', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.ageUnder1} onChange={(e) => handleChange(index, 'ageUnder1', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.age1to4} onChange={(e) => handleChange(index, 'age1to4', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.age5to9} onChange={(e) => handleChange(index, 'age5to9', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.age10to14} onChange={(e) => handleChange(index, 'age10to14', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-5 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium p-0" value={row.ageOver14} onChange={(e) => handleChange(index, 'ageOver14', e.target.value)} /></td>
                  </tr>
                )}
                {/* Totals Row */}
                <tr className="bg-slate-200 font-bold text-slate-800">
                  <td className="border border-slate-400 p-1 text-xs">المجموع</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('totalPatients')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('testedSamples')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('percentage')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('positives')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('distBenign')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('distMalignant')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('distQuad')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('distMixed')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('casesInside')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('casesOutside')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('treatmentQuad')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('treatmentOct')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('treatmentFansidar')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('treatmentOther')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('ageUnder1')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('age1to4')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('age5to9')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('age10to14')}</td>
                  <td className="border border-slate-400 p-1 text-xs">{calculateTotal('ageOver14')}</td>
                </tr>
              </tbody>
            </table>
          </motion.div>

          {/* Footer & Draggable Signature */}
          <div className="mt-16 text-center header-text space-y-4 relative flex flex-col items-center min-h-[150px]">
            <motion.div style={{ x: managerX, y: managerY }} drag dragMomentum={false} className="cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 z-50 flex flex-col items-center gap-2">
              <input 
                value={managerTitle} 
                onChange={(e) => setManagerTitle(e.target.value)} 
                className="block w-80 bg-transparent border-none focus:ring-0 p-0 m-0 text-center text-lg font-bold text-slate-800 print-manager-input" 
              />
              <input 
                value={managerName} 
                onChange={(e) => setManagerName(e.target.value)} 
                className="block w-80 bg-transparent border-none focus:ring-0 p-0 m-0 text-center text-lg font-bold text-slate-800 print-manager-input" 
              />
            </motion.div>
            
            <motion.div
              style={{ x: signatureX, y: signatureY }}
              drag
              dragMomentum={false}
              className="cursor-move z-50 hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 mt-2"
              title="اسحب التوقيع لتحريكه">
              
              <img
                src={signatureUrl}
                alt="توقيع المدير"
                className="h-16 object-contain pointer-events-none mix-blend-multiply"
                crossOrigin="anonymous" />
              
            </motion.div>
          </div>
          
          <OfficialFooter className="mt-24" />
        </div>
      </div>
    </div>);

}