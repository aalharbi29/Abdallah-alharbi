import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, Trash2, RefreshCw, FileText, Calendar, Building2 } from "lucide-react";
import { Statistic } from "@/entities/Statistic";
import { Badge } from "@/components/ui/badge";
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
import PDFViewer from "@/components/files/PDFViewer";

export default function MonthDetailDialog({ monthLabel, items, open, onOpenChange, onRefresh }) {
  const [viewingFile, setViewingFile] = React.useState(null);

  const handleDelete = async (id) => {
    try {
      await Statistic.delete(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('فشل حذف الملف');
    }
  };

  const downloadFile = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="w-6 h-6 text-blue-600" />
              إحصائيات شهر {monthLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا توجد ملفات لهذا الشهر</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* معلومات الملف */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg text-gray-900 leading-tight">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.source_agency && (
                                <Badge variant="outline" className="gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {item.source_agency}
                                </Badge>
                              )}
                              {item.file_name && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <FileText className="w-3 h-3" />
                                  {item.file_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* الأزرار */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewingFile(item)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(item.file_url, item.file_name)}
                          className="hover:bg-green-50 hover:text-green-600"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
          </div>
        </DialogContent>
      </Dialog>

      {viewingFile && (
        <PDFViewer
          file={viewingFile}
          open={!!viewingFile}
          onOpenChange={() => setViewingFile(null)}
        />
      )}
    </>
  );
}