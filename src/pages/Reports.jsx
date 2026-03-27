import React, { useState, useEffect } from "react";
import { ReportFile } from "@/entities/ReportFile";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Download, Trash2, Plus, Loader2, AlertCircle, Eye, Printer, FileSpreadsheet, RefreshCw, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ExportManager from "../components/export/ExportManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InlineFileReplacer, { downloadFileWithName } from "@/components/files/InlineFileReplacer";
import PDFViewer from "../components/files/PDFViewer"; // Added import for PDFViewer

const reportCategories = [
  { key: "duty_supervisor", name: "تقرير مشرف مراقبة الدوام", icon: "⏰", color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" },
  { key: "technical_supervisor", name: "تقرير المشرف الفني", icon: "🔧", color: "bg-gradient-to-br from-green-50 to-green-100 border-green-200" },
  { key: "preventive_supervisor", name: "تقرير المشرف الوقائي", icon: "🛡️", color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" },
  { key: "quality_supervisor", name: "تقرير مشرف الجودة", icon: "✨", color: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" },
  { key: "pharma_supervisor", name: "تقرير المشرف الدوائي", icon: "💊", color: "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200" },
  { key: "patient_exp_supervisor", name: "تقرير مشرف تجربة المريض", icon: "❤️", color: "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200" },
  { key: "school_health_supervisor", name: "تقرير مشرف الصحة المدرسية", icon: "🎓", color: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200" },
  { key: "additional_reports", name: "تقارير إضافية", icon: "📋", color: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200" },
];

const UploadReportForm = ({ categoryKey, categoryName, onUploadFinish }) => {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState(categoryKey === 'additional_reports' ? '' : categoryName);
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleFilesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const sanitizeFilename = (filename) => {
        const extension = filename.split('.').pop();
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        const safeName = nameWithoutExt
          .replace(/[^\w\s-.]/g, '') // Allow alphanumeric, whitespace, hyphens, and dots (for versions etc.)
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .substring(0, 50); // Limit length to 50 characters for the name part
        return `${safeName || 'file'}.${extension}`;
    };

    const uploadWithRetry = async (fileToUpload, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await UploadFile({ file: fileToUpload });
            } catch (err) {
                console.error(`Upload attempt ${attempt} for ${fileToUpload.name} failed:`, err);
                if (attempt === maxRetries) throw new Error(`فشل رفع الملف "${fileToUpload.name}" بعد ${maxRetries} محاولات.`);
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setError("يرجى اختيار ملف أو أكثر لرفعه.");
            return;
        }
        setIsUploading(true);
        setError('');

        try {
            const recordsToCreate = [];
            for (const file of files) {
                const safeFileName = sanitizeFilename(file.name);
                // Create a new File object with the sanitized name
                const fileToUpload = new File([file], safeFileName, { type: file.type });
                const uploadResult = await uploadWithRetry(fileToUpload);

                recordsToCreate.push({
                    report_category: categoryKey,
                    report_title: files.length > 1 ? `${title} - ${file.name}` : title, // Keep original file name for title if multiple
                    description: description,
                    file_url: uploadResult.file_url,
                    file_name: file.name // Store original file name in DB for display
                });
            }

            if (recordsToCreate.length > 0) {
                // Assuming ReportFile.bulkCreate is available to create multiple records at once
                await ReportFile.bulkCreate(recordsToCreate);
            }
            
            onUploadFinish();
            setIsOpen(false);
            // Reset form fields after successful upload
            setFiles([]);
            setTitle(categoryKey === 'additional_reports' ? '' : categoryName);
            setDescription('');
        } catch(err) {
            setError(`حدث خطأ أثناء رفع الملفات: ${err.message || 'يرجى المحاولة مرة أخرى.'}`);
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 ml-2" />رفع تقرير</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>رفع تقارير جديدة لـ: {categoryName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                     {categoryKey === 'additional_reports' && (
                        <div>
                            <Label htmlFor="title">مسمى التقرير</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="description">وصف موجز</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="files">الملفات (يمكن اختيار عدة ملفات)</Label>
                        <Input id="files" type="file" multiple onChange={handleFilesChange} required />
                        {files.length > 0 && <div className="mt-2 text-sm text-gray-600">تم اختيار {files.length} ملف</div>}
                    </div>
                    {error && <p className="text-red-500 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                            رفع وحفظ
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const data = await ReportFile.list("-created_date");
        setReports(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Failed to load reports:", err);
        setError("فشل في تحميل التقارير. يرجى التحقق من اتصالك بالإنترنت.");
        setReports([]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDelete = async (reportId) => {
      try {
        await ReportFile.delete(reportId);
        loadReports();
      } catch (err) {
        console.error("Failed to delete report:", err);
        setError("فشل في حذف التقرير. يرجى المحاولة مرة أخرى.");
      }
  };
  
  const groupedReports = reports.reduce((acc, report) => {
      (acc[report.report_category] = acc[report.report_category] || []).push(report);
      return acc;
  }, {});

  return (
    <div className="p-3 md:p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen mobile-page-shell">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3 leading-tight">📊 أرشيف التقارير الشامل</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">🚀 إدارة ورفع التقارير الدورية والإضافية بأحدث التقنيات والأساليب المتطورة</p>
        </div>

        {error && (
            <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button onClick={loadReports} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                </Button>
                </AlertDescription>
            </Alert>
        )}

        {isLoading && !error && <p className="text-center text-gray-500">جاري تحميل التقارير...</p>}

        {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCategories.map(cat => {
                const categoryReports = groupedReports[cat.key] || [];
                return (
                    <Card key={cat.key} className={`shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${cat.color} border-2`}>
                        <CardHeader className="border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-bold">{cat.name}</span>
                                </div>
                                <UploadReportForm categoryKey={cat.key} categoryName={cat.name} onUploadFinish={loadReports} />
                            </CardTitle>
                            <CardDescription className="flex justify-between items-center pt-2">
                            <span className="flex items-center gap-2 text-gray-600">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                                    {categoryReports.length}
                                </span>
                                تقرير مرفوع
                            </span>
                            {categoryReports.length > 0 && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-white/80 hover:bg-white"><Printer className="w-4 h-4 ml-1" /> طباعة</Button>
                                    <ExportManager data={categoryReports} filename={`تقارير_${cat.name}`}><Button variant="outline" size="sm" className="bg-white/80 hover:bg-white"><FileSpreadsheet className="w-4 h-4 ml-1" /> تصدير</Button></ExportManager>
                                </div>
                            )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3 p-4">
                            {categoryReports.map(report => (
                                <div key={report.id} className="border rounded-lg p-3 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-sm truncate flex-1 pr-2 text-gray-800">{report.report_title}</h4>
                                        <Badge variant="outline" className="text-xs flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">{format(new Date(report.created_date), 'dd/MM/yyyy')}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 truncate flex-1 bg-gray-50 px-2 py-1 rounded">{report.file_name}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            <Button size="icon" variant="ghost" onClick={() => setViewingReport(report)} className="h-7 w-7 hover:bg-blue-100"><Eye className="w-4 h-4 text-blue-600"/></Button>
                                            <Button 
                                              size="icon" 
                                              variant="ghost" 
                                              onClick={() => downloadFileWithName(report.file_url, report.file_name)}
                                              className="h-7 w-7 hover:bg-green-100"
                                            >
                                              <Download className="w-4 h-4 text-green-600"/>
                                            </Button>
                                            
                                            <InlineFileReplacer
                                              entitySDK={ReportFile}
                                              recordId={report.id}
                                              fileUrlField="file_url"
                                              fileNameField="file_name"
                                              buttonText=""
                                              onReplaced={loadReports}
                                            />
                                            
                                            <AlertDialog>
                                            <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-600"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا التقرير؟</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(report.id)}>حذف</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {categoryReports.length === 0 && <div className="text-center text-gray-500 text-sm py-8 bg-white/50 rounded-lg border-2 border-dashed border-gray-200">
                                <div className="text-4xl mb-2">📄</div>
                                <p>لا توجد تقارير مرفوعة</p>
                                <p className="text-xs mt-1">ابدأ برفع أول تقرير</p>
                            </div>}
                        </CardContent>
                    </Card>
                )})}
            </div>
        )}
        
        <PDFViewer 
            file={viewingReport} 
            open={!!viewingReport} 
            onOpenChange={() => setViewingReport(null)}
        />
      </div>
    </div>
  );
}