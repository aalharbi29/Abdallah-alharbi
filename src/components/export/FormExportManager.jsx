import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Printer, Loader2, FileImage } from "lucide-react";

export default function FormExportManager({ formData, formHTMLGenerator, fileName = "نموذج_205" }) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = (format) => {
    setIsExporting(true);
    try {
      const htmlContent = formHTMLGenerator();
      
      if (format === 'word') {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + htmlContent + footer;
        downloadFile(sourceHTML, `${fileName}.doc`, "application/msword");
      } else if (format === 'html') {
        const fullHtml = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${fileName}</title></head><body>${htmlContent}</body></html>`;
        downloadFile(fullHtml, `${fileName}.html`, "text/html");
      } else if (format === 'excel') {
        const csvData = convertFormDataToCSV(formData);
        downloadFile(csvData, `${fileName}.csv`, "text/csv;charset=utf-8");
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("فشل التصدير.");
    } finally {
      setIsExporting(false);
    }
  };

  const convertFormDataToCSV = (data) => {
    const csvRows = [];
    csvRows.push("الحقل,القيمة");
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const fieldName = getArabicFieldName(key);
        csvRows.push(`"${fieldName}","${value}"`);
      }
    });
    
    return csvRows.join('\n');
  };

  const getArabicFieldName = (key) => {
    const fieldNames = {
      ministry: "الوزارة",
      administration: "الإدارة",
      country: "البلد",
      job_title_budget: "مسمى الوظيفة بالميزانية",
      job_rank: "مرتبتها",
      job_number: "رقمها",
      employee_name: "اسم شاغلها",
      employee_position: "وظيفته",
      assignment_decision_number: "رقم قرار التكليف",
      assignment_date: "تاريخه",
      duty_1: "الواجب الأول",
      duty_1_percentage: "نسبة الواجب الأول",
      duty_2: "الواجب الثاني",
      duty_2_percentage: "نسبة الواجب الثاني",
      duty_3: "الواجب الثالث",
      duty_3_percentage: "نسبة الواجب الثالث",
      duty_4: "الواجب الرابع",
      duty_4_percentage: "نسبة الواجب الرابع",
      duty_5: "الواجب الخامس",
      duty_5_percentage: "نسبة الواجب الخامس",
      duty_6: "الواجب السادس",
      duty_6_percentage: "نسبة الواجب السادس",
      work_location_office: "مكتب",
      work_location_lab: "معمل",
      work_location_hospital: "مستشفى",
      work_location_field: "ميدان",
      work_location_street: "شارع",
      work_location_warehouse: "مستودع",
      work_location_workshop: "ورشة",
      work_location_other: "مكان آخر يحدد",
      reason_for_presence: "سبب التواجد في هذا المكان"
    };
    return fieldNames[key] || key;
  };

  const handlePrint = () => {
    const printContent = formHTMLGenerator();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>طباعة ${fileName}</title></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      alert('تم حجب النوافذ المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.');
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handlePrint} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
        <Printer className="w-4 h-4 ml-2" />
        طباعة
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isExporting} className="bg-green-600 hover:bg-green-700">
            {isExporting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Download className="w-4 h-4 ml-2" />}
            تصدير
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('word')}>
            <FileText className="w-4 h-4 ml-2" />
            تصدير Word
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('html')}>
            <FileImage className="w-4 h-4 ml-2" />
            تصدير HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تصدير Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}