import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, AlertCircle, Edit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EditDocumentTitleDialog from '@/components/files/EditDocumentTitleDialog';

export default function ReportViewer({ report, onOpenChange, onRefresh, entitySDK }) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    
    if (!report) return null;
    
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(report.file_name);
    const isPDF = /\.pdf$/i.test(report.file_name);
    const isExcel = /\.(xlsx|xls)$/i.test(report.file_name);
    const isOfficeDoc = /\.(docx|doc|pptx|ppt)$/i.test(report.file_name);
    const officeViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(report.file_url)}&embedded=true`;

    const handleEditSuccess = () => {
        if (onRefresh) {
            onRefresh();
        }
        setShowEditDialog(false);
    };

    return (
        <>
            <Dialog open={!!report} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex justify-between items-center pr-8">
                            <DialogTitle>{report.report_title}</DialogTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEditDialog(true)}
                                title="تعديل العنوان"
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                     {isExcel && (
                         <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 mt-2">
                            <AlertCircle className="h-4 w-4 !text-yellow-800" />
                            <AlertTitle className="font-bold">ملاحظة هامة لعرض ملفات Excel</AlertTitle>
                            <AlertDescription>
                                المعاينة قد لا تعرض جميع أوراق العمل (Sheets) بشكل مثالي. للحصول على العرض الكامل والدقيق، يرجى استخدام زر "تحميل".
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="flex-1 overflow-auto p-1 border rounded-md mt-2">
                        {isImage ? (
                            <img src={report.file_url} alt={report.report_title} className="max-w-full h-auto mx-auto" />
                        ) : (isPDF || isOfficeDoc || isExcel) ? (
                            <iframe 
                                src={isPDF ? report.file_url : officeViewerUrl} 
                                className="w-full h-full min-h-[70vh] border-0" 
                                title={report.report_title} 
                            />
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">لا يمكن استعراض هذا النوع من الملفات مباشرة.</p>
                                <p className="text-sm text-gray-500">يرجى تحميله لعرضه.</p>
                                 <Button asChild className="mt-4">
                                    <a href={report.file_url} download={report.file_name}>
                                        <Download className="w-4 h-4 ml-2" />
                                        تحميل الملف
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="mt-4">
                        <Button variant="outline" asChild>
                            <a href={report.file_url} download={report.file_name}>
                                <Download className="w-4 h-4 ml-2" />
                                تحميل
                            </a>
                        </Button>
                        <DialogClose asChild>
                            <Button type="button">إغلاق</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            {report && (
                <EditDocumentTitleDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    document={report}
                    entitySDK={entitySDK}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
}