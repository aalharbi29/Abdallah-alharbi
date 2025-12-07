import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Check, X, Scissors, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PDFPageSelector({ open, onOpenChange, file, operationType, onPagesSelected }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (open && file) {
      loadThumbnails();
      // إذا كان الملف يحتوي على صفحات محددة مسبقاً، اجعلها محددة
      if (file.selectedPages && file.selectedPages.length > 0) {
        setSelectedPages(new Set(file.selectedPages));
      } else {
        setSelectedPages(new Set());
      }
    }
  }, [open, file]);

  const loadThumbnails = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('getPDFThumbnails', { 
        fileUrl: file.url 
      });
      
      if (response.data?.success) {
        setThumbnails(response.data.thumbnails);
      }
    } catch (error) {
      console.error('Error loading thumbnails:', error);
      alert('فشل تحميل معاينة الصفحات');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePage = (pageNumber) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(thumbnails.map(t => t.pageNumber)));
    }
    setSelectAll(!selectAll);
  };

  const handleConfirm = () => {
    if (selectedPages.size === 0) {
      alert('يجب اختيار صفحة واحدة على الأقل');
      return;
    }
    onPagesSelected(Array.from(selectedPages).sort((a, b) => a - b));
  };

  const getTitle = () => {
    switch(operationType) {
      case 'extract': return 'اختر الصفحات للاستخراج';
      case 'delete': return 'اختر الصفحات للحذف';
      case 'select-for-merge': return 'اختر الصفحات للدمج';
      default: return 'اختر الصفحات';
    }
  };

  const getButtonText = () => {
    const count = selectedPages.size;
    switch(operationType) {
      case 'extract': return `استخراج ${count} صفحة`;
      case 'delete': return `حذف ${count} صفحة`;
      case 'select-for-merge': return `تأكيد اختيار ${count} صفحة`;
      default: return 'تأكيد';
    }
  };

  const getIcon = () => {
    switch(operationType) {
      case 'delete': return <Trash2 className="w-4 h-4 ml-2" />;
      case 'select-for-merge': return <Scissors className="w-4 h-4 ml-2" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{getTitle()}</span>
            <Badge variant="secondary">{selectedPages.size} صفحة مختارة</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="w-full"
          >
            {selectAll ? (
              <>
                <X className="w-4 h-4 ml-2" />
                إلغاء تحديد الكل
              </>
            ) : (
              <>
                <Check className="w-4 h-4 ml-2" />
                تحديد الكل
              </>
            )}
          </Button>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">جاري تحميل الصفحات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {thumbnails.map((thumb) => {
                const isSelected = selectedPages.has(thumb.pageNumber);
                return (
                  <div
                    key={thumb.pageNumber}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                      isSelected 
                        ? operationType === 'delete'
                          ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                          : 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => togglePage(thumb.pageNumber)}
                  >
                    <div className="aspect-[3/4] bg-white rounded-t-lg overflow-hidden">
                      <iframe
                        src={thumb.pdfDataUrl}
                        className="w-full h-full pointer-events-none"
                        title={`صفحة ${thumb.pageNumber}`}
                      />
                    </div>
                    <div className="p-2 bg-white rounded-b-lg flex items-center justify-between">
                      <span className="text-sm font-medium">صفحة {thumb.pageNumber}</span>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => togglePage(thumb.pageNumber)}
                      />
                    </div>
                    {isSelected && (
                      <div className={`absolute top-2 right-2 rounded-full p-1 ${
                        operationType === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                      } text-white`}>
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedPages.size === 0}
            className={operationType === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {getIcon()}
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}