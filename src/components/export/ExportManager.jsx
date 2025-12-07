
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Loader2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExportManager({ data, filename = "تقرير" }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const csvContent = convertToCSV(data);
      const blob = new Blob(["\ufeff" + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      downloadFile(blob, `${filename}.csv`);
    } catch (error) {
      alert("حدث خطأ في التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToImage = () => {
    setIsExporting(true);
    try {
      // استخدام الطباعة كبديل لـ html2canvas
      alert("سيتم تصدير الصفحة كصورة عن طريق الطباعة. اختر 'Save as PDF' ثم احفظها كصورة.");
      window.print();
    } catch (error) {
      alert("حدث خطأ في تصدير الصورة");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = () => {
    setIsExporting(true);
    try {
      const htmlContent = generateHTMLReport(data);
      const blob = new Blob([htmlContent], { 
        type: 'application/msword' 
      });
      downloadFile(blob, `${filename}.doc`);
    } catch (error) {
      alert("حدث خطأ في تصدير ملف Word");
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const generateHTMLReport = (data) => {
    if (!data || data.length === 0) return `<html dir="rtl"><body><h1>${filename}</h1><p>لا توجد بيانات للتصدير</p></body></html>`;
    
    const headers = Object.keys(data[0]);
    const tableHeaders = headers.map(key => `<th>${key}</th>`).join('');
    
    const tableRows = data.map(item => {
      const cells = headers.map(header => 
        `<td style="padding: 8px; border: 1px solid #ddd;">${item[header] || ''}</td>`
      ).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f5f5f5; padding: 12px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <table>
            <tr>${tableHeaders}</tr>
            ${tableRows}
          </table>
        </body>
      </html>
    `;
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="no-print">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            تصدير البيانات
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تصدير Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToWord}>
            <FileText className="w-4 h-4 ml-2" />
            تصدير Word
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToPDF}>
            <FileText className="w-4 h-4 ml-2" />
            تصدير PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToImage}>
            <Image className="w-4 h-4 ml-2" />
            طباعة كصورة
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
