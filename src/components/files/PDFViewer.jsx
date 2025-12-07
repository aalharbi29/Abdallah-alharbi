import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, ZoomIn, ZoomOut, X, Maximize2, RefreshCw, ExternalLink, Edit, Upload } from "lucide-react";
import { downloadFileWithName } from "./InlineFileReplacer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/integrations/Core";

export default function PDFViewer({ file, open, onOpenChange, entitySDK, recordId, fileUrlField = "file_url", fileNameField = "file_name", onFileUpdated }) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('google');
  const [loading, setLoading] = useState(true);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setShowEditOptions(false);
      // إعادة تعيين وضع العرض إلى Google كافتراضي
      setViewMode('google');
      setTimeout(() => setLoading(false), 1500);
    }
  }, [open]);

  if (!file) return null;

  const fileUrl = file.file_url || file.url;
  const fileName = file.file_name || file.title || file.name || "ملف";
  
  const isPDF = /\.pdf$/i.test(fileName);
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
  const isWord = /\.(doc|docx)$/i.test(fileName);
  const isExcel = /\.(xls|xlsx)$/i.test(fileName);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  
  const handlePrint = () => {
    // طباعة مباشرة بدون تحميل - باستخدام iframe مخفي
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    
    if (isPDF) {
      // طباعة PDF مباشرة عبر iframe
      printFrame.src = fileUrl;
      document.body.appendChild(printFrame);
      printFrame.onload = () => {
        setTimeout(() => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          setTimeout(() => document.body.removeChild(printFrame), 1000);
        }, 500);
      };
    } else if (isImage) {
      // طباعة الصورة مباشرة
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl">
            <head>
              <title>طباعة - ${fileName}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                @media print { 
                  body { margin: 0; } 
                  img { max-width: 100%; max-height: 100%; page-break-inside: avoid; } 
                }
              </style>
            </head>
            <body>
              <img src="${fileUrl}" onload="setTimeout(function(){window.print();window.close();},800);" onerror="alert('فشل تحميل الصورة');" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else if (isWord || isExcel) {
      // Word/Excel - طباعة عبر Office Online في نافذة جديدة مع تعليمات
      const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
      const printWindow = window.open(officeUrl, '_blank', 'width=1000,height=800');
      if (printWindow) {
        setTimeout(() => {
          alert('✅ تم فتح الملف في Office Online.\n\n📌 للطباعة:\n• اضغط Ctrl+P\n• أو من قائمة ملف > طباعة');
        }, 1000);
      }
    } else {
      window.open(fileUrl, '_blank');
    }
  };
  
  const handleDownload = () => downloadFileWithName(fileUrl, fileName);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // فتح في Google Sheets (للقراءة فقط)
  const openInGoogleSheets = () => {
    const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(fileUrl)}/view`;
    window.open(googleSheetsUrl, '_blank');
  };

  // فتح في Office Online (للقراءة فقط)
  const openInOffice365 = () => {
    const office365Url = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    window.open(office365Url, '_blank');
  };

  // رفع ملف محدّث
  const handleFileUpdate = async (e) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    // التحقق من أن الملف الجديد من نفس النوع
    if (isExcel && !/\.(xls|xlsx)$/i.test(newFile.name)) {
      alert('يرجى رفع ملف Excel فقط');
      return;
    }
    if (isWord && !/\.(doc|docx)$/i.test(newFile.name)) {
      alert('يرجى رفع ملف Word فقط');
      return;
    }

    setUploading(true);
    try {
      // تنظيف اسم الملف
      const sanitizedName = newFile.name
        .replace(/[\u0600-\u06FF]/g, '')
        .replace(/[^\w\s.-]/g, '')
        .replace(/\s+/g, '_');
      
      const renamedFile = new File([newFile], sanitizedName, { 
        type: newFile.type, 
        lastModified: newFile.lastModified 
      });

      // رفع الملف
      const uploadResult = await UploadFile({ file: renamedFile });

      // تحديث السجل في قاعدة البيانات
      if (entitySDK && recordId) {
        await entitySDK.update(recordId, {
          [fileUrlField]: uploadResult.file_url,
          [fileNameField]: newFile.name
        });

        alert('✅ تم تحديث الملف بنجاح!');
        
        // إعادة تحميل الصفحة أو تحديث البيانات
        if (onFileUpdated) {
          onFileUpdated();
        } else {
          window.location.reload();
        }
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating file:', error);
      alert('❌ حدث خطأ أثناء تحديث الملف');
    } finally {
      setUploading(false);
    }
  };

  // إنشاء URL للعرض - التأكد من ترميز الرابط بشكل صحيح
  let viewUrl = fileUrl;
  
  // تنظيف الرابط من المسافات والأحرف الخاصة
  const cleanFileUrl = fileUrl ? fileUrl.trim() : '';
  
  if (isPDF || isWord || isExcel) {
    if (viewMode === 'google') {
      // Google Docs Viewer - يتطلب ترميز URL كامل
      viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(cleanFileUrl)}&embedded=true`;
    } else if (viewMode === 'office') {
      // Office Online Viewer
      viewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanFileUrl)}`;
    } else if (viewMode === 'direct') {
      if (isPDF) {
        // العرض المباشر للـ PDF - استخدام الرابط مباشرة
        viewUrl = cleanFileUrl;
      } else if (isWord || isExcel) {
        // العرض المباشر لـ Word/Excel عبر Office Online view (ليس embed)
        viewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(cleanFileUrl)}`;
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isFullscreen ? 'w-screen h-screen max-w-none max-h-none m-0 rounded-none' : 'max-w-6xl h-[90vh]'} flex flex-col p-0 gap-0`}
      >
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-base md:text-lg flex items-center gap-2 flex-1 min-w-0">
              <span className="truncate">{fileName}</span>
              {isPDF && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex-shrink-0">PDF</span>}
              {isImage && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex-shrink-0">صورة</span>}
              {isWord && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex-shrink-0">Word</span>}
              {isExcel && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex-shrink-0">Excel</span>}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="flex-shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-white flex-shrink-0 gap-2 flex-wrap">
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            {(isPDF || isImage) && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50} className="h-8">
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs md:text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200} className="h-8">
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </>
            )}
            
            {(isPDF || isWord || isExcel) && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-1" />
                <Button 
                  variant={viewMode === 'google' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setViewMode('google')}
                  className="h-8 text-xs"
                >
                  Google
                </Button>
                <Button 
                  variant={viewMode === 'office' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setViewMode('office')}
                  className="h-8 text-xs"
                >
                  Office
                </Button>
                <Button 
                  variant={viewMode === 'direct' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setViewMode('direct')}
                  className="h-8 text-xs"
                >
                  مباشر
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {(isExcel || isWord) && entitySDK && recordId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEditOptions(!showEditOptions)}
                className="h-8 text-xs gap-1 bg-blue-50 hover:bg-blue-100"
              >
                <Edit className="w-3 h-3" />
                <span className="hidden md:inline">تحديث الملف</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 text-xs">
              <Maximize2 className="w-3 h-3 md:ml-1" />
              <span className="hidden md:inline">{isFullscreen ? 'خروج' : 'ملء الشاشة'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs">
              <Printer className="w-3 h-3 md:ml-1" />
              <span className="hidden md:inline">طباعة</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs bg-green-50 hover:bg-green-100">
              <Download className="w-3 h-3 md:ml-1" />
              <span className="hidden md:inline">تحميل</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(fileUrl, '_blank')}
              className="h-8 text-xs"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Edit Options Alert */}
        {showEditOptions && (isExcel || isWord) && (
          <Alert className="mx-4 mt-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm space-y-3">
              <div>
                <strong className="text-blue-900">📝 تحديث الملف:</strong>
                <p className="text-blue-800 mt-1">
                  1. حمّل الملف على جهازك<br/>
                  2. افتحه في Excel/Word وقم بالتعديلات<br/>
                  3. احفظ الملف وارفعه هنا لتحديث النسخة في النظام
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="file-update" className="cursor-pointer">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          رفع ملف محدّث
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="file-update"
                  type="file"
                  className="hidden"
                  accept={isExcel ? '.xls,.xlsx' : '.doc,.docx'}
                  onChange={handleFileUpdate}
                  disabled={uploading}
                />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Viewer Area */}
        <div className="flex-1 overflow-hidden bg-gray-900 relative">
          {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">جاري التحميل...</p>
              <p className="text-xs text-gray-400 mt-1">إذا لم يتم العرض، جرب تغيير وضع العرض</p>
            </div>
          </div>
          )}

          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto bg-gray-50">
              <img 
                src={fileUrl} 
                alt={fileName}
                className="max-w-full h-auto shadow-2xl"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transition: 'transform 0.2s'
                }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </div>
          ) : (isPDF || isWord || isExcel) ? (
            viewMode === 'direct' && isPDF ? (
              // عرض PDF مباشر باستخدام object بدلاً من iframe
              <object
                key={`direct-${cleanFileUrl}`}
                data={cleanFileUrl}
                type="application/pdf"
                className="w-full h-full"
                onLoad={() => setLoading(false)}
              >
                <iframe
                  src={cleanFileUrl}
                  className="w-full h-full border-0"
                  title={fileName}
                  onLoad={() => setLoading(false)}
                />
              </object>
            ) : viewMode === 'direct' && (isWord || isExcel) ? (
              // عرض Word/Excel مباشر عبر Office Online view
              <iframe
                key={`direct-office-${cleanFileUrl}`}
                src={viewUrl}
                className="w-full h-full border-0"
                title={fileName}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                style={{
                  background: 'white'
                }}
              />
            ) : (
              <iframe
                key={`${viewMode}-${cleanFileUrl}`}
                src={viewUrl}
                className="w-full h-full border-0"
                title={fileName}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                allow="fullscreen"
                style={{
                  background: 'white'
                }}
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">معاينة غير متاحة</h3>
              <p className="text-gray-500 mb-4">نوع الملف: {fileName.split('.').pop()?.toUpperCase()}</p>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                تحميل الملف
              </Button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {file.description && (
          <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-600 flex-shrink-0">
            <strong>الوصف:</strong> {file.description}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}