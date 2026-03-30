import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, ArrowRight, Save, Loader2, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, useMotionValue } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import DraggableLogo from "@/components/common/DraggableLogo";
import DraggableWatermark from "@/components/common/DraggableWatermark";
import OfficialFooter from "@/components/common/OfficialFooter";
import { Settings } from "lucide-react";
import { removeWhiteBackground } from "@/utils/imageProcessor";

const months = [
  { value: 1, label: "يناير" }, { value: 2, label: "فبراير" }, { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" }, { value: 5, label: "مايو" }, { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" }, { value: 8, label: "أغسطس" }, { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" }, { value: 11, label: "نوفمبر" }, { value: 12, label: "ديسمبر" },
];

export default function LeishmaniaStatisticForm() {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("https://media.base44.com/images/public/68af5003813e47bd07947b30/341993f8d_.jpg");
  
  const [headerText1, setHeaderText1] = useState(localStorage.getItem('stat_header1') || "تجمع المدينة المنورة الصحي");
  const [headerText2, setHeaderText2] = useState(localStorage.getItem('stat_header2') || "شؤون المراكز الصحية بالحسو");
  const [managerName, setManagerName] = useState(localStorage.getItem('stat_managerName') || "أ / عبدالمجيد سعود الربيقي");
  const [managerTitle, setManagerTitle] = useState(localStorage.getItem('stat_managerTitle') || "المساعد لشؤون المراكز الصحية بالحسو");

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const records = await base44.entities.StampSignature.filter({ type: 'signature', is_default: true, is_active: true });
        if (records && records.length > 0) {
          try {
            const transparentUrl = await removeWhiteBackground(records[0].image_url);
            setSignatureUrl(transparentUrl);
          } catch(e) {
            setSignatureUrl(records[0].image_url);
          }
          if (!localStorage.getItem('stat_managerName') && records[0].owner_name) setManagerName(records[0].owner_name);
          if (!localStorage.getItem('stat_managerTitle') && records[0].owner_title) setManagerTitle(records[0].owner_title);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };
    fetchSignature();
  }, []);

  const initialHeaderPos = JSON.parse(localStorage.getItem('leish_headerPos')) || { x: 0, y: 0 };
  const headerX = useMotionValue(initialHeaderPos.x);
  const headerY = useMotionValue(initialHeaderPos.y);

  const initialTitlePos = JSON.parse(localStorage.getItem('leish_titlePos')) || { x: 0, y: 0 };
  const titleX = useMotionValue(initialTitlePos.x);
  const titleY = useMotionValue(initialTitlePos.y);

  const initialTablePos = JSON.parse(localStorage.getItem('leish_tablePos')) || { x: 0, y: 0 };
  const tableX = useMotionValue(initialTablePos.x);
  const tableY = useMotionValue(initialTablePos.y);

  const initialManagerPos = JSON.parse(localStorage.getItem('leish_managerPos')) || { x: 0, y: 0 };
  const managerX = useMotionValue(initialManagerPos.x);
  const managerY = useMotionValue(initialManagerPos.y);

  const initialSignaturePos = JSON.parse(localStorage.getItem('leish_signaturePos')) || { x: 0, y: 0 };
  const signatureX = useMotionValue(initialSignaturePos.x);
  const signatureY = useMotionValue(initialSignaturePos.y);

  const handleSaveSettings = () => {
    localStorage.setItem('stat_header1', headerText1);
    localStorage.setItem('stat_header2', headerText2);
    localStorage.setItem('stat_managerName', managerName);
    localStorage.setItem('stat_managerTitle', managerTitle);
    
    localStorage.setItem('leish_headerPos', JSON.stringify({ x: headerX.get(), y: headerY.get() }));
    localStorage.setItem('leish_titlePos', JSON.stringify({ x: titleX.get(), y: titleY.get() }));
    localStorage.setItem('leish_tablePos', JSON.stringify({ x: tableX.get(), y: tableY.get() }));
    localStorage.setItem('leish_managerPos', JSON.stringify({ x: managerX.get(), y: managerY.get() }));
    localStorage.setItem('leish_signaturePos', JSON.stringify({ x: signatureX.get(), y: signatureY.get() }));
    
    toast.success("تم حفظ النمط ومواقع العناصر بنجاح");
  };
  
  const emptyRow = {
    adminName: "مراكز الحسو",
    patientName: "",
    nationality: "",
    age_u1_s_m: "", age_u1_s_f: "", age_u1_ns_m: "", age_u1_ns_f: "",
    age_1_4_s_m: "", age_1_4_s_f: "", age_1_4_ns_m: "", age_1_4_ns_f: "",
    age_5_9_s_m: "", age_5_9_s_f: "", age_5_9_ns_m: "", age_5_9_ns_f: "",
    age_10_14_s_m: "", age_10_14_s_f: "", age_10_14_ns_m: "", age_10_14_ns_f: "",
    age_15_44_s_m: "", age_15_44_s_f: "", age_15_44_ns_m: "", age_15_44_ns_f: "",
    age_o45_s_m: "", age_o45_s_f: "", age_o45_ns_m: "", age_o45_ns_f: "",
    res_resident: "", res_non_resident: "",
    diag_clinical: "", diag_microscopic: "",
    ulcers: "",
    treatment: "",
    infection_age: "",
    infection_place: ""
  };

  const [data, setData] = useState([
    {
      ...emptyRow,
      patientName: "لاتوجد حالات",
      nationality: "-",
      age_u1_s_m: "-", age_u1_s_f: "-", age_u1_ns_m: "-", age_u1_ns_f: "-",
      age_1_4_s_m: "-", age_1_4_s_f: "-", age_1_4_ns_m: "-", age_1_4_ns_f: "-",
      age_5_9_s_m: "-", age_5_9_s_f: "-", age_5_9_ns_m: "-", age_5_9_ns_f: "-",
      age_10_14_s_m: "-", age_10_14_s_f: "-", age_10_14_ns_m: "-", age_10_14_ns_f: "-",
      age_15_44_s_m: "-", age_15_44_s_f: "-", age_15_44_ns_m: "-", age_15_44_ns_f: "-",
      age_o45_s_m: "-", age_o45_s_f: "-", age_o45_ns_m: "-", age_o45_ns_f: "-",
      res_resident: "-", res_non_resident: "-",
      diag_clinical: "-", diag_microscopic: "-",
      ulcers: "-",
      treatment: "-",
      infection_age: "-",
      infection_place: "-"
    }
  ]);

  const addRow = () => {
    setData([...data, { ...emptyRow }]);
  };

  const removeRow = (index) => {
    if (data.length > 1) {
      const newData = [...data];
      newData.splice(index, 1);
      setData(newData);
    }
  };

  const handleDownloadPDF = async () => {
    if (!month) {
      toast.error("الرجاء اختيار الشهر أولاً");
      return;
    }
    
    try {
      setIsExporting(true);
      setIsSaving(true);
      toast.loading("جاري تجهيز الملف...", { id: "download-pdf" });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = printRef.current;
      const originalScrollY = window.scrollY;
      const originalScrollX = window.scrollX;

      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;

      const tableContainer = element.querySelector('.overflow-x-auto');
      if (tableContainer) tableContainer.classList.remove('overflow-x-auto');

      element.style.width = '1500px';
      element.style.maxWidth = 'none';

      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1500,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            .print-container { 
              width: 1500px !important; 
              max-width: none !important; 
              padding: 20px !important; 
              margin: 0 !important; 
              box-shadow: none !important; 
              border: none !important;
              background: white !important;
            }
            .print-container input, .cloned-input { 
              border: none !important; 
              background: transparent !important; 
              padding: 0 !important; 
              text-align: center !important;
              font-size: 10pt !important;
              font-weight: 600 !important;
              color: black !important;
              line-height: 1.5 !important;
              padding-bottom: 10px !important;
              padding-top: 10px !important;
            }
            .print-container table { border-collapse: collapse !important; width: 100% !important; }
            .print-container th, .print-container td { 
              border: 1px solid #475569 !important; 
              padding: 8px 4px !important; 
              text-align: center !important; 
              color: black !important;
              height: auto !important;
              line-height: 1.8 !important;
            }
            .print-container th { 
              font-weight: 700 !important; 
              background-color: #f1f5f9 !important; 
              font-size: 8pt !important;
            }
            .print-container td {
              font-size: 9pt !important;
            }
            .header-text { font-size: 12pt !important; font-weight: bold !important; color: black !important; }
            .title-text { font-size: 18pt !important; font-weight: bold !important; color: red !important; }
            .text-blue-400 { color: #60a5fa !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-red-600 { color: #dc2626 !important; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
          `;
          clonedDoc.head.appendChild(style);

          const el = clonedDoc.getElementById('leishmania-print-container');
          if (el) {
            el.style.width = '1500px';
            el.style.minWidth = '1500px';
            el.style.maxWidth = 'none';
            const table = el.querySelector('table');
            if (table && table.parentElement) {
              table.parentElement.classList.remove('overflow-x-auto');
              table.parentElement.style.overflow = 'visible';
            }
            
            const selectTriggers = el.querySelectorAll('button[role="combobox"]');
            selectTriggers.forEach(trigger => {
               const span = clonedDoc.createElement('span');
               span.textContent = trigger.textContent;
               span.className = trigger.className;
               span.style.display = 'inline-block';
               span.style.border = 'none';
               span.style.background = 'transparent';
               span.style.color = 'black';
               trigger.parentNode.replaceChild(span, trigger);
            });

            const inputs = el.querySelectorAll('input');
            inputs.forEach(input => {
              if (input.type !== 'range' && input.type !== 'file') {
                const span = clonedDoc.createElement('span');
                span.textContent = input.value || '';
                span.className = input.className + ' cloned-input';
                span.style.display = 'inline-block';
                span.style.width = '100%';
                span.style.minHeight = '24px';
                span.style.lineHeight = '24px';
                span.style.paddingBottom = '4px';
                input.parentNode.replaceChild(span, input);
              }
            });
          }
        },
        ignoreElements: (el) => el.classList.contains('no-print') || el.tagName.toLowerCase() === 'svg'
      });
      
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      if (tableContainer) tableContainer.classList.add('overflow-x-auto');
      window.scrollTo(originalScrollX, originalScrollY);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let imgWidth = pdfWidth;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = (canvas.width * pageHeight) / canvas.height;
      }

      const xOffset = (pdfWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, 0, imgWidth, imgHeight);
      pdf.save(`leishmania_statistic_${year}_${month}.pdf`);
      
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
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = printRef.current;
      const originalScrollY = window.scrollY;
      const originalScrollX = window.scrollX;

      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;

      const tableContainer = element.querySelector('.overflow-x-auto');
      if (tableContainer) tableContainer.classList.remove('overflow-x-auto');

      element.style.width = '1500px';
      element.style.maxWidth = 'none';

      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 1500,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            .print-container { 
              width: 1500px !important; 
              max-width: none !important; 
              padding: 20px !important; 
              margin: 0 !important; 
              box-shadow: none !important; 
              border: none !important;
              background: white !important;
            }
            .print-container input, .cloned-input { 
              border: none !important; 
              background: transparent !important; 
              padding: 0 !important; 
              text-align: center !important;
              font-size: 10pt !important;
              font-weight: 600 !important;
              color: black !important;
              line-height: 1.5 !important;
              padding-bottom: 10px !important;
              padding-top: 10px !important;
            }
            .print-container table { border-collapse: collapse !important; width: 100% !important; }
            .print-container th, .print-container td { 
              border: 1px solid #475569 !important; 
              padding: 8px 4px !important; 
              text-align: center !important; 
              color: black !important;
              height: auto !important;
              line-height: 1.8 !important;
            }
            .print-container th { 
              font-weight: 700 !important; 
              background-color: #f1f5f9 !important; 
              font-size: 8pt !important;
            }
            .print-container td {
              font-size: 9pt !important;
            }
            .header-text { font-size: 12pt !important; font-weight: bold !important; color: black !important; }
            .title-text { font-size: 18pt !important; font-weight: bold !important; color: red !important; }
            .text-blue-400 { color: #60a5fa !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-red-600 { color: #dc2626 !important; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
          `;
          clonedDoc.head.appendChild(style);

          const el = clonedDoc.getElementById('leishmania-print-container');
          if (el) {
            el.style.width = '1500px';
            el.style.minWidth = '1500px';
            el.style.maxWidth = 'none';
            const table = el.querySelector('table');
            if (table && table.parentElement) {
              table.parentElement.classList.remove('overflow-x-auto');
              table.parentElement.style.overflow = 'visible';
            }
            
            const selectTriggers = el.querySelectorAll('button[role="combobox"]');
            selectTriggers.forEach(trigger => {
               const span = clonedDoc.createElement('span');
               span.textContent = trigger.textContent;
               span.className = trigger.className;
               span.style.display = 'inline-block';
               span.style.border = 'none';
               span.style.background = 'transparent';
               span.style.color = 'black';
               trigger.parentNode.replaceChild(span, trigger);
            });

            const inputs = el.querySelectorAll('input');
            inputs.forEach(input => {
              if (input.type !== 'range' && input.type !== 'file') {
                const span = clonedDoc.createElement('span');
                span.textContent = input.value || '';
                span.className = input.className + ' cloned-input';
                span.style.display = 'inline-block';
                span.style.width = '100%';
                span.style.minHeight = '24px';
                span.style.lineHeight = '24px';
                span.style.paddingBottom = '4px';
                input.parentNode.replaceChild(span, input);
              }
            });
          }
        },
        ignoreElements: (el) => el.classList.contains('no-print') || el.tagName.toLowerCase() === 'svg'
      });
      
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      if (tableContainer) tableContainer.classList.add('overflow-x-auto');
      window.scrollTo(originalScrollX, originalScrollY);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let imgWidth = pdfWidth;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = (canvas.width * pageHeight) / canvas.height;
      }

      const xOffset = (pdfWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, 0, imgWidth, imgHeight);
      const pdfBlob = pdf.output('blob');
      
      const file = new File([pdfBlob], `leishmania_statistic_${year}_${month}.pdf`, { type: 'application/pdf' });
      
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      
      const selectedMonth = months.find(m => m.value.toString() === month);
      
      await base44.entities.Statistic.create({
        period_type: "gregorian",
        year: parseInt(year),
        month_number: selectedMonth.value,
        month_name: selectedMonth.label,
        title: "إحصائية اللشمانيا",
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
    setData(newData);
  };

  const fields = [
    'age_u1_s_m', 'age_u1_s_f', 'age_u1_ns_m', 'age_u1_ns_f', 
    'age_1_4_s_m', 'age_1_4_s_f', 'age_1_4_ns_m', 'age_1_4_ns_f', 
    'age_5_9_s_m', 'age_5_9_s_f', 'age_5_9_ns_m', 'age_5_9_ns_f', 
    'age_10_14_s_m', 'age_10_14_s_f', 'age_10_14_ns_m', 'age_10_14_ns_f', 
    'age_15_44_s_m', 'age_15_44_s_f', 'age_15_44_ns_m', 'age_15_44_ns_f', 
    'age_o45_s_m', 'age_o45_s_f', 'age_o45_ns_m', 'age_o45_ns_f'
  ];

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
            padding: 2px !important; 
            text-align: center; 
            color: black !important;
          }
          th { 
            font-weight: 700; 
            background-color: #f1f5f9 !important; 
            font-size: 8pt !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          td {
            font-size: 9pt !important;
          }
          .header-text { font-size: 12pt; font-weight: bold; color: black; }
          .title-text { font-size: 18pt; font-weight: bold; color: red !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .text-blue-400 { color: #60a5fa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .text-blue-600 { color: #2563eb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .text-red-600 { color: #dc2626 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const event = new CustomEvent('show-watermark-leishmania');
                window.dispatchEvent(event);
              }}
              className="text-xs no-print"
            >
              إظهار العلامة المائية
            </Button>
          </div>
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
              onClick={addRow} 
              variant="outline"
              className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              إضافة مريض
            </Button>
            <Button 
              onClick={handleSaveToStatistics} 
              disabled={isSaving}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
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

        <div id="leishmania-print-container" ref={printRef} className="bg-white p-8 rounded-xl shadow-sm print-container border border-gray-200 relative overflow-hidden">
          <DraggableLogo className="top-8 right-8" storageKey="leishmania" />
          <DraggableWatermark storageKey="leishmania" />
          {/* Header */}
          <div className="flex justify-between items-start mb-8 relative z-10">
            <motion.div style={{ x: headerX, y: headerY }} drag dragMomentum={false} className="text-right space-y-1 header-text text-blue-400 font-semibold cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 z-50">
              <input 
                value={headerText1} 
                onChange={(e) => setHeaderText1(e.target.value)} 
                className="block w-full bg-transparent border-none focus:ring-0 p-0 m-0 text-right font-bold text-blue-400" 
              />
              <input 
                value={headerText2} 
                onChange={(e) => setHeaderText2(e.target.value)} 
                className="block w-full bg-transparent border-none focus:ring-0 p-0 m-0 text-right font-bold text-blue-400" 
              />
            </motion.div>
            <motion.div style={{ x: titleX, y: titleY }} drag dragMomentum={false} className="text-center cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 z-50">
              <h1 className="title-text text-2xl font-bold text-red-600 mb-6">حالات اللشمانيا الجلدية بمراكز الحسو</h1>
              <div className="flex gap-8 justify-center text-lg font-bold" onPointerDownCapture={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">الشهر :</span>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className={`w-32 h-8 text-center font-bold border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus:ring-0 px-0 bg-transparent [&>svg]:print:hidden ${isExporting ? 'border-transparent [&>svg]:hidden' : 'border-slate-300'}`}>
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
                    className={`w-24 h-8 text-center font-bold border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 px-0 bg-transparent ${isExporting ? 'border-transparent' : 'border-slate-300'}`}
                  />
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
            className={`${isExporting ? '' : 'overflow-x-auto'} print:overflow-visible relative z-10 pb-4 cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2`}
            onPointerDownCapture={(e) => {
              if (['INPUT', 'BUTTON', 'SELECT', 'OPTION'].includes(e.target.tagName) || e.target.closest('button')) {
                e.stopPropagation();
              }
            }}
          >
            <table className="w-full border-collapse border border-slate-400 text-center">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-16">اسم الإدارة</th>
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-24">اسم المريض</th>
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-12">الجنسية</th>
                  <th colSpan={24} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800">فئات الاعمار</th>
                  <th colSpan={2} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800">الاقامة</th>
                  <th colSpan={2} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800">التشخيص</th>
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-10">القرح</th>
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-14">نوع العلاج</th>
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-12">عمر الاصابة</th>
                  <th rowSpan={4} className="border border-slate-400 p-1 text-[11px] font-bold text-slate-800 w-16">مكان احتمال العدوي</th>
                </tr>
                <tr className="bg-slate-50">
                  <th colSpan={4} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700">اقل من عام</th>
                  <th colSpan={4} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700">من 1 الي 4</th>
                  <th colSpan={4} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700">من 5 الي 9</th>
                  <th colSpan={4} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700">من 10 الي 14</th>
                  <th colSpan={4} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700">من 15 الي 44</th>
                  <th colSpan={4} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700">اكثر من 45</th>
                  <th rowSpan={3} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700 w-8">مقيم</th>
                  <th rowSpan={3} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700 w-8">غ/مقيم</th>
                  <th rowSpan={3} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700 w-8">سرير</th>
                  <th rowSpan={3} className="border border-slate-400 p-0.5 text-[9px] font-semibold text-slate-700 w-8">مجهري</th>
                </tr>
                <tr className="bg-slate-50">
                  {Array.from({ length: 6 }).flatMap((_, i) => [
                    <th key={`s-${i}`} colSpan={2} className="border border-slate-400 p-0 text-[9px] font-semibold text-slate-700">س</th>,
                    <th key={`ns-${i}`} colSpan={2} className="border border-slate-400 p-0 text-[9px] font-semibold text-slate-700">غ/س</th>
                  ])}
                </tr>
                <tr className="bg-slate-50">
                  {Array.from({ length: 12 }).flatMap((_, i) => [
                    <th key={`m-${i}`} className="border border-slate-400 p-0 text-[8px] font-semibold text-slate-700 w-5">ذكر</th>,
                    <th key={`f-${i}`} className="border border-slate-400 p-0 text-[8px] font-semibold text-slate-700 w-5">انثي</th>
                  ])}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-300 p-0 relative group">
                      <Input className={`w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0 ${row.adminName === 'مراكز الحسو' ? 'text-blue-600' : ''}`} value={row.adminName} onChange={(e) => handleChange(index, 'adminName', e.target.value)} />
                      {data.length > 1 && (
                        <button onClick={() => removeRow(index)} className="absolute right-1 top-2 text-red-500 opacity-0 group-hover:opacity-100 no-print transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                    <td className="border border-slate-300 p-0"><Input className={`w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0 ${row.patientName === 'لاتوجد حالات' ? 'text-red-600' : ''}`} value={row.patientName} onChange={(e) => handleChange(index, 'patientName', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.nationality} onChange={(e) => handleChange(index, 'nationality', e.target.value)} /></td>
                    
                    {fields.map(field => (
                      <td key={field} className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row[field]} onChange={(e) => handleChange(index, field, e.target.value)} /></td>
                    ))}
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.res_resident} onChange={(e) => handleChange(index, 'res_resident', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.res_non_resident} onChange={(e) => handleChange(index, 'res_non_resident', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.diag_clinical} onChange={(e) => handleChange(index, 'diag_clinical', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.diag_microscopic} onChange={(e) => handleChange(index, 'diag_microscopic', e.target.value)} /></td>
                    
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.ulcers} onChange={(e) => handleChange(index, 'ulcers', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.treatment} onChange={(e) => handleChange(index, 'treatment', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.infection_age} onChange={(e) => handleChange(index, 'infection_age', e.target.value)} /></td>
                    <td className="border border-slate-300 p-0"><Input className="w-full h-8 border-0 text-center rounded-none focus-visible:ring-1 text-[10px] font-medium px-0" value={row.infection_place} onChange={(e) => handleChange(index, 'infection_place', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Footer & Draggable Signature */}
          <div className="mt-16 print:mt-8 text-center header-text space-y-4 relative flex flex-col items-center min-h-[150px] print:min-h-0 print:break-inside-avoid">
            <motion.div style={{ x: managerX, y: managerY }} drag dragMomentum={false} className="cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 z-50 flex flex-col items-center gap-2">
              <input 
                value={managerTitle} 
                onChange={(e) => setManagerTitle(e.target.value)} 
                className="block w-64 bg-transparent border-none focus:ring-0 p-0 m-0 text-center text-sm font-bold text-slate-800" 
              />
              <input 
                value={managerName} 
                onChange={(e) => setManagerName(e.target.value)} 
                className="block w-64 bg-transparent border-none focus:ring-0 p-0 m-0 text-center text-sm font-bold text-slate-800" 
              />
            </motion.div>
            
            <motion.div 
              style={{ x: signatureX, y: signatureY }}
              drag 
              dragMomentum={false}
              className="cursor-move z-50 hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-2 mt-2"
              title="اسحب التوقيع لتحريكه"
            >
              <img 
                src={signatureUrl} 
                alt="توقيع المدير" 
                className="h-16 object-contain pointer-events-none mix-blend-multiply" 
                crossOrigin="anonymous"
              />
            </motion.div>
          </div>
          
          <OfficialFooter className="mt-24 print:mt-8" />
        </div>
      </div>
    </div>
  );
}