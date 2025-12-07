import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, X, Eye, EyeOff, AlertCircle, Info, Scissors, Trash2, Download, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PDFPreview({ file, onRemove, index, onSelectPages, showActions = false }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [enlargedPage, setEnlargedPage] = useState(null);

  const isDataUrl = file.url && file.url.startsWith('data:');
  const isFromZip = file.fromZip === true;
  const hasValidUrl = file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'));

  useEffect(() => {
    if (hasValidUrl && isExpanded && thumbnails.length === 0 && !isLoading) {
      loadThumbnails();
    }
  }, [hasValidUrl, isExpanded, thumbnails.length, isLoading]); // Added thumbnails.length and isLoading to dependencies to avoid stale closures

  const loadThumbnails = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Loading thumbnails for:', file.name, file.url);
      
      if (!file.url || typeof file.url !== 'string') {
        throw new Error('رابط الملف غير صحيح');
      }

      if (file.url.startsWith('data:')) {
        throw new Error('لا يمكن معاينة الملفات المستخرجة من الأرشيف. يرجى حفظها أولاً.');
      }

      if (!file.url.startsWith('http://') && !file.url.startsWith('https://')) {
        throw new Error('رابط الملف غير صالح. يجب أن يكون رابط HTTP صحيح.');
      }

      const response = await base44.functions.invoke('getPDFThumbnails', { 
        fileUrl: file.url 
      });
      
      console.log('✅ Thumbnail response received:', response.data);
      
      if (response.data?.success) {
        const thumbs = response.data.thumbnails || [];
        setThumbnails(thumbs);
        setTotalPages(response.data.totalPages || 0);
        
        if (thumbs.length === 0 && response.data.totalPages > 0) {
          setError('لم يتم إنشاء أي صورة مصغرة');
        } else if (response.data.displayedPages < response.data.totalPages) {
          setError(`تم عرض أول ${response.data.displayedPages} صفحة من أصل ${response.data.totalPages}`);
        } else if (response.data.totalPages === 0) {
          setError('الملف لا يحتوي على أي صفحات.');
        }
      } else {
        throw new Error(response.data?.error || 'فشل تحميل الصور المصغرة');
      }
    } catch (error) {
      console.error('❌ Error loading thumbnails:', error);
      
      let errorMessage = 'تعذر تحميل معاينة الصفحات.';
      
      if (error.message?.includes('400')) {
        errorMessage = 'خطأ في البيانات المرسلة. تأكد من صحة رابط الملف.';
      } else if (error.message?.includes('404')) {
        errorMessage = 'الملف غير موجود. قد يكون تم حذفه.';
      } else if (error.message?.includes('413')) {
        errorMessage = 'الملف كبير جداً. الحد الأقصى المدعوم هو 50 ميجابايت.';
      } else if (error.message?.includes('timeout') || error.message?.includes('انتهت مهلة')) {
        errorMessage = 'انتهت مهلة التحميل. الملف قد يكون كبيراً. حاول مرة أخرى.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'خطأ في الاتصال. تأكد من اتصالك بالإنترنت.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-2 border-blue-200 hover:border-blue-400 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-50">#{index + 1}</Badge>
              <h4 className="font-medium text-sm truncate" title={file.name}>{file.name}</h4>
              {isFromZip && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  من الأرشيف
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              {hasValidUrl && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {totalPages > 0 && <span className="text-blue-600 font-medium">{totalPages} صفحة</span>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(file.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {isFromZip && !hasValidUrl && (
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              هذا الملف مستخرج من أرشيف. قم بحفظه أولاً في تبويب "الملفات المضغوطة" لتتمكن من معاينته ودمجه.
            </AlertDescription>
          </Alert>
        )}

        {hasValidUrl && (
          <div className="mt-3">
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={isLoading}
              >
                {isExpanded ? (
                  <>
                    <EyeOff className="w-3 h-3 ml-2" />
                    إخفاء
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 ml-2" />
                    معاينة {totalPages > 0 && `(${totalPages} صفحة)`}
                  </>
                )}
              </Button>

              {showActions && onSelectPages && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onSelectPages(file, 'select-for-merge')}
                    disabled={isLoading}
                  >
                    <Scissors className="w-3 h-3 ml-2" />
                    اختيار صفحات
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => onSelectPages(file, 'delete')}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3 ml-2" />
                    حذف صفحات
                  </Button>
                </>
              )}
            </div>

            {file.selectedPages && file.selectedPages.length > 0 && (
              <div className="space-y-2">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-800">
                    ✓ تم اختيار {file.selectedPages.length} صفحة من هذا الملف
                  </AlertDescription>
                </Alert>
                
                {showActions && onSelectPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs bg-gradient-to-r from-green-50 to-blue-50 border-green-300 hover:bg-green-100"
                    onClick={() => onSelectPages(file, 'extract-selected')}
                  >
                    <Download className="w-3 h-3 ml-2" />
                    استخراج وحفظ الصفحات المختارة ({file.selectedPages.length} صفحة)
                  </Button>
                )}
              </div>
            )}

            {isExpanded && (
              <div className="mt-3 bg-gray-50 rounded-lg p-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                    <p className="text-xs text-gray-600">جاري تحميل المعاينة...</p>
                    {totalPages > 50 && (
                      <p className="text-xs text-gray-500 mt-1">الملف يحتوي على {totalPages} صفحة، قد يستغرق بعض الوقت</p>
                    )}
                  </div>
                ) : error && thumbnails.length === 0 ? (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {error}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadThumbnails}
                        className="mt-2 w-full text-xs"
                        disabled={isLoading}
                      >
                        إعادة المحاولة
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {error && (
                      <Alert className="mb-2 bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-xs text-yellow-800">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {thumbnails.length > 0 && (
                      <>
                        <div className="mb-2 text-xs text-gray-600 text-center">
                          عرض {thumbnails.length} من أصل {totalPages} صفحة - اضغط على الصفحة لتكبيرها
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <div className="grid grid-cols-3 gap-2">
                            {thumbnails.map((thumb) => (
                              <div 
                                key={thumb.pageNumber} 
                                className="relative group cursor-pointer"
                                onClick={() => setEnlargedPage(thumb)}
                              >
                                <div className="aspect-[3/4] bg-white rounded border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-400 transition-all hover:scale-105">
                                  <iframe
                                    src={thumb.pdfDataUrl}
                                    className="w-full h-full pointer-events-none"
                                    title={`صفحة ${thumb.pageNumber}`}
                                    style={{ 
                                      transform: 'scale(0.95)',
                                      transformOrigin: 'center center'
                                    }}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                </div>
                                <Badge 
                                  variant="secondary" 
                                  className="absolute bottom-1 left-1 right-1 text-center text-[10px] bg-blue-500 text-white"
                                >
                                  صفحة {thumb.pageNumber}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* نافذة تكبير الصفحة */}
        <Dialog open={!!enlargedPage} onOpenChange={() => setEnlargedPage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ZoomIn className="w-5 h-5" />
                صفحة {enlargedPage?.pageNumber} - {file.name}
              </DialogTitle>
            </DialogHeader>
            {enlargedPage && (
              <div className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4" style={{ minHeight: '60vh' }}>
                <iframe
                  src={enlargedPage.pdfDataUrl}
                  className="w-full border-0 bg-white shadow-lg rounded"
                  style={{ height: '70vh' }}
                  title={`صفحة ${enlargedPage.pageNumber} مكبرة`}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}