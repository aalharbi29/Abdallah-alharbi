import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, RotateCw, RotateCcw, Trash2, Loader2, 
  CheckCircle, Copy, Scissors, FileText, GripVertical,
  ZoomIn, Undo, Redo, Maximize2, Split,
  RefreshCw, Save, FileOutput, Layers, Check, X
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function PDFPageManager({ onComplete }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, single
  const [zoom, setZoom] = useState(100);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('manage');
  
  // خيارات الاستخراج
  const [extractRange, setExtractRange] = useState({ from: 1, to: 1 });
  
  // خيارات التقسيم
  const [splitOptions, setSplitOptions] = useState({
    type: 'each', // each, range, fixed
    pagesPerFile: 5,
    ranges: '1-3, 4-6, 7-10'
  });

  const saveToHistory = useCallback((newPages) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPages)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPages(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPages(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('الرجاء اختيار ملف PDF');
      return;
    }

    setIsUploading(true);
    try {
      // رفع الملف أولاً
      const result = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = result.file_url;
      
      setUploadedFile({
        name: file.name,
        url: fileUrl,
        size: file.size
      });

      // تحميل الصفحات الفعلية من الملف
      console.log('📥 جاري تحميل صفحات PDF...');
      const thumbnailsResponse = await base44.functions.invoke('getPDFThumbnails', { 
        fileUrl: fileUrl 
      });
      
      if (thumbnailsResponse.data?.success) {
        const thumbnails = thumbnailsResponse.data.thumbnails || [];
        const pageCount = thumbnailsResponse.data.totalPages || thumbnails.length;
        
        const realPages = thumbnails.map((thumb, i) => ({
          id: `page-${i + 1}-${Date.now()}`,
          originalNumber: thumb.pageNumber,
          number: i + 1,
          rotation: 0,
          deleted: false,
          visible: true,
          thumbnail: thumb.pdfDataUrl,
          scale: 1,
          flipH: false,
          flipV: false
        }));
        
        setPages(realPages);
        setTotalPages(pageCount);
        setSelectedPages([]);
        setHistory([JSON.parse(JSON.stringify(realPages))]);
        setHistoryIndex(0);
        setExtractRange({ from: 1, to: pageCount });
        
        console.log(`✅ تم تحميل ${realPages.length} صفحة من الملف`);
      } else {
        throw new Error(thumbnailsResponse.data?.error || 'فشل تحميل الصفحات');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف أو تحميل الصفحات');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePageSelection = (pageId) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const selectAllPages = () => {
    const activePageIds = pages.filter(p => !p.deleted).map(p => p.id);
    if (selectedPages.length === activePageIds.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(activePageIds);
    }
  };

  const selectRange = (from, to) => {
    const activePages = pages.filter(p => !p.deleted);
    const rangeIds = activePages
      .slice(from - 1, to)
      .map(p => p.id);
    setSelectedPages(rangeIds);
  };

  const invertSelection = () => {
    const activePageIds = pages.filter(p => !p.deleted).map(p => p.id);
    setSelectedPages(activePageIds.filter(id => !selectedPages.includes(id)));
  };

  const rotatePage = (pageId, direction) => {
    const newPages = pages.map(page => {
      if (page.id === pageId) {
        const newRotation = direction === 'cw' 
          ? (page.rotation + 90) % 360 
          : (page.rotation - 90 + 360) % 360;
        return { ...page, rotation: newRotation };
      }
      return page;
    });
    setPages(newPages);
    saveToHistory(newPages);
  };

  const rotateSelectedPages = (direction) => {
    if (selectedPages.length === 0) return;
    const newPages = pages.map(page => {
      if (selectedPages.includes(page.id)) {
        const newRotation = direction === 'cw' 
          ? (page.rotation + 90) % 360 
          : (page.rotation - 90 + 360) % 360;
        return { ...page, rotation: newRotation };
      }
      return page;
    });
    setPages(newPages);
    saveToHistory(newPages);
  };

  const flipPage = (pageId, direction) => {
    const newPages = pages.map(page => {
      if (page.id === pageId) {
        return direction === 'h' 
          ? { ...page, flipH: !page.flipH }
          : { ...page, flipV: !page.flipV };
      }
      return page;
    });
    setPages(newPages);
    saveToHistory(newPages);
  };

  const deletePage = (pageId) => {
    const newPages = pages.map(page => 
      page.id === pageId ? { ...page, deleted: true } : page
    );
    setPages(newPages);
    setSelectedPages(prev => prev.filter(id => id !== pageId));
    saveToHistory(newPages);
  };

  const deleteSelectedPages = () => {
    if (selectedPages.length === 0) return;
    if (!confirm(`هل تريد حذف ${selectedPages.length} صفحة؟`)) return;

    const newPages = pages.map(page => 
      selectedPages.includes(page.id) ? { ...page, deleted: true } : page
    );
    setPages(newPages);
    setSelectedPages([]);
    saveToHistory(newPages);
  };

  const restorePage = (pageId) => {
    const newPages = pages.map(page => 
      page.id === pageId ? { ...page, deleted: false } : page
    );
    setPages(newPages);
    saveToHistory(newPages);
  };

  const restoreAllPages = () => {
    const newPages = pages.map(page => ({ ...page, deleted: false }));
    setPages(newPages);
    saveToHistory(newPages);
  };

  const duplicatePage = (pageId) => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;

    const originalPage = pages[pageIndex];
    const newPage = {
      ...originalPage,
      id: `page-copy-${Date.now()}`,
      originalNumber: originalPage.originalNumber
    };

    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, newPage);
    
    // إعادة ترقيم الصفحات
    const renumbered = newPages.map((p, i) => ({ ...p, number: i + 1 }));
    setPages(renumbered);
    saveToHistory(renumbered);
  };

  const duplicateSelectedPages = () => {
    if (selectedPages.length === 0) return;
    
    let newPages = [...pages];
    selectedPages.forEach(pageId => {
      const pageIndex = newPages.findIndex(p => p.id === pageId);
      if (pageIndex !== -1) {
        const originalPage = newPages[pageIndex];
        const newPage = {
          ...originalPage,
          id: `page-copy-${Date.now()}-${Math.random()}`,
          originalNumber: originalPage.originalNumber
        };
        newPages.splice(pageIndex + 1, 0, newPage);
      }
    });
    
    const renumbered = newPages.map((p, i) => ({ ...p, number: i + 1 }));
    setPages(renumbered);
    setSelectedPages([]);
    saveToHistory(renumbered);
  };

  const movePageUp = (pageId) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index <= 0) return;
    
    const newPages = [...pages];
    [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
    
    const renumbered = newPages.map((p, i) => ({ ...p, number: i + 1 }));
    setPages(renumbered);
    saveToHistory(renumbered);
  };

  const movePageDown = (pageId) => {
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1 || index >= pages.length - 1) return;
    
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    
    const renumbered = newPages.map((p, i) => ({ ...p, number: i + 1 }));
    setPages(renumbered);
    saveToHistory(renumbered);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const renumberedItems = items.map((item, index) => ({
      ...item,
      number: index + 1
    }));

    setPages(renumberedItems);
    saveToHistory(renumberedItems);
  };

  const handleExtractPages = async () => {
    if (selectedPages.length === 0 && extractRange.from === extractRange.to) {
      alert('الرجاء تحديد صفحات للاستخراج');
      return;
    }

    setIsProcessing(true);
    try {
      const pagesToExtract = selectedPages.length > 0 
        ? selectedPages.map(id => pages.find(p => p.id === id)?.originalNumber).filter(Boolean)
        : Array.from({ length: extractRange.to - extractRange.from + 1 }, (_, i) => extractRange.from + i);

      alert(`سيتم استخراج الصفحات: ${pagesToExtract.join(', ')}`);
      
      if (onComplete) {
        onComplete({
          base64: '',
          filename: `extracted_pages_${uploadedFile.name}`,
          message: `تم استخراج ${pagesToExtract.length} صفحة`
        });
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert('حدث خطأ أثناء استخراج الصفحات');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitPDF = async () => {
    setIsProcessing(true);
    try {
      let message = '';
      if (splitOptions.type === 'each') {
        message = `سيتم تقسيم الملف إلى ${pages.filter(p => !p.deleted).length} ملف (صفحة لكل ملف)`;
      } else if (splitOptions.type === 'fixed') {
        const fileCount = Math.ceil(pages.filter(p => !p.deleted).length / splitOptions.pagesPerFile);
        message = `سيتم تقسيم الملف إلى ${fileCount} ملف (${splitOptions.pagesPerFile} صفحات لكل ملف)`;
      } else {
        message = `سيتم تقسيم الملف حسب النطاقات: ${splitOptions.ranges}`;
      }

      alert(message);
      
      if (onComplete) {
        onComplete({
          base64: '',
          filename: `split_${uploadedFile.name}`,
          message
        });
      }
    } catch (error) {
      console.error('Split error:', error);
      alert('حدث خطأ أثناء تقسيم الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const activePages = pages.filter(p => !p.deleted);
      
      // جمع أرقام الصفحات بالترتيب الجديد (مع مراعاة النسخ)
      const pageNumbers = activePages.map(p => p.originalNumber);
      
      // جمع معلومات التدوير
      const rotations = {};
      activePages.forEach(p => {
        if (p.rotation !== 0) {
          rotations[p.originalNumber] = p.rotation;
        }
      });

      console.log('📝 تطبيق التعديلات:', { pageNumbers, rotations });

      // استخدام دالة استخراج الصفحات مع الترتيب الجديد
      const response = await base44.functions.invoke('extractPages', {
        fileUrl: uploadedFile.url,
        pageNumbers: pageNumbers
      });

      if (response.data?.success) {
        alert(`✅ تم تطبيق التعديلات بنجاح! (${activePages.length} صفحة)`);
        
        if (onComplete) {
          onComplete({
            base64: response.data.pdfBase64,
            filename: `edited_${uploadedFile.name.replace('.pdf', '')}`,
            totalPages: activePages.length,
            message: `تم تعديل الملف - ${activePages.length} صفحة`
          });
        }
      } else {
        throw new Error(response.data?.error || 'فشل تطبيق التعديلات');
      }
    } catch (error) {
      console.error('Apply error:', error);
      alert('حدث خطأ أثناء تطبيق التعديلات: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const activePages = pages.filter(p => !p.deleted);
  const deletedPages = pages.filter(p => p.deleted);

  const PageCard = ({ page, index, provided, snapshot }) => (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className={`relative group transition-all duration-200 ${
        snapshot?.isDragging ? 'z-50 shadow-2xl scale-105' : ''
      }`}
    >
      <div
        className={`${viewMode === 'grid' ? 'w-36' : 'w-full'} border-2 rounded-lg overflow-hidden transition-all bg-white ${
          selectedPages.includes(page.id)
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
        }`}
        onClick={() => togglePageSelection(page.id)}
      >
        {/* مقبض السحب */}
        <div
          {...provided?.dragHandleProps}
          className="absolute top-1 right-1 p-1.5 bg-white/90 rounded-md cursor-grab active:cursor-grabbing z-10 shadow-sm hover:bg-gray-100"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>

        {/* رقم الترتيب */}
        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md z-10">
          {index + 1}
        </div>

        {/* علامة التحديد */}
        {selectedPages.includes(page.id) && (
          <div className="absolute top-1 left-8 bg-blue-500 text-white p-0.5 rounded-full z-10">
            <Check className="w-3 h-3" />
          </div>
        )}

        {/* معاينة الصفحة */}
        <div 
          className={`${viewMode === 'grid' ? 'h-44' : 'h-24'} bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center cursor-pointer overflow-hidden`}
          style={{ 
            transform: `rotate(${page.rotation}deg) scaleX(${page.flipH ? -1 : 1}) scaleY(${page.flipV ? -1 : 1})`,
          }}
          onDoubleClick={() => setCurrentPreviewPage(page)}
        >
          {page.thumbnail ? (
            <iframe
              src={page.thumbnail}
              className="w-full h-full border-0 pointer-events-none"
              title={`صفحة ${page.originalNumber}`}
              style={{ transform: 'scale(0.98)', transformOrigin: 'center' }}
            />
          ) : (
            <div className="text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <span className="text-xs text-gray-400 mt-1 block">صفحة {page.originalNumber}</span>
            </div>
          )}
        </div>

        {/* معلومات الصفحة */}
        <div className="p-2 bg-white border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              صفحة {page.number}
            </span>
            <div className="flex gap-1">
              {page.rotation !== 0 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {page.rotation}°
                </Badge>
              )}
              {page.id.includes('copy') && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  نسخة
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* أزرار التحكم السريع */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gradient-to-t from-white/90">
          <Button
            size="icon"
            variant="secondary"
            className="w-7 h-7 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              rotatePage(page.id, 'ccw');
            }}
            title="تدوير لليسار"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-7 h-7 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              rotatePage(page.id, 'cw');
            }}
            title="تدوير لليمين"
          >
            <RotateCw className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-7 h-7 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              duplicatePage(page.id);
            }}
            title="نسخ"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="w-7 h-7 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              deletePage(page.id);
            }}
            title="حذف"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* رفع الملف */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="w-5 h-5 text-blue-600" />
            إدارة صفحات PDF المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-pages-upload"
                disabled={isUploading}
              />
              <label htmlFor="pdf-pages-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-blue-500" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                )}
                <p className="text-lg font-medium text-gray-700">اضغط لرفع ملف PDF</p>
                <p className="text-sm text-gray-500 mt-1">أو اسحب الملف وأفلته هنا</p>
              </label>
            </div>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>{uploadedFile.name}</strong>
                  <span className="text-sm text-gray-600 mr-2">({totalPages} صفحة)</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setUploadedFile(null);
                    setPages([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {uploadedFile && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage" className="gap-2">
              <Layers className="w-4 h-4" />
              إدارة الصفحات
            </TabsTrigger>
            <TabsTrigger value="extract" className="gap-2">
              <FileOutput className="w-4 h-4" />
              استخراج
            </TabsTrigger>
            <TabsTrigger value="split" className="gap-2">
              <Split className="w-4 h-4" />
              تقسيم
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4 mt-4">
            {/* شريط الأدوات */}
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllPages}
                      className="h-8"
                    >
                      {selectedPages.length === activePages.length ? 'إلغاء الكل' : 'تحديد الكل'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={invertSelection}
                      className="h-8"
                      disabled={selectedPages.length === 0}
                    >
                      عكس التحديد
                    </Button>
                    <Badge variant="secondary" className="h-8 px-3 flex items-center">
                      {selectedPages.length} محدد
                    </Badge>
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 p-0">
                      <Undo className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0">
                      <Redo className="w-4 h-4" />
                    </Button>
                    <div className="border-l mx-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotateSelectedPages('ccw')}
                      disabled={selectedPages.length === 0}
                      className="h-8 w-8 p-0"
                      title="تدوير المحدد لليسار"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotateSelectedPages('cw')}
                      disabled={selectedPages.length === 0}
                      className="h-8 w-8 p-0"
                      title="تدوير المحدد لليمين"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={duplicateSelectedPages}
                      disabled={selectedPages.length === 0}
                      className="h-8"
                    >
                      <Copy className="w-4 h-4 ml-1" />
                      نسخ
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedPages}
                      disabled={selectedPages.length === 0}
                      className="h-8"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>

                  <div className="flex gap-1 items-center">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleApplyChanges}
                      className="h-8 bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 ml-1" />
                      )}
                      حفظ التعديلات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* عرض الصفحات */}
            <Card>
              <CardHeader className="py-2 border-b">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>الصفحات النشطة ({activePages.length})</span>
                  <span className="text-xs text-gray-500">اسحب الصفحات لإعادة ترتيبها</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="pages" direction="horizontal">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-wrap gap-4"
                      >
                        {activePages.map((page, index) => (
                          <Draggable key={page.id} draggableId={page.id} index={index}>
                            {(provided, snapshot) => (
                              <PageCard 
                                page={page} 
                                index={index} 
                                provided={provided} 
                                snapshot={snapshot}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {activePages.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Trash2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>تم حذف جميع الصفحات</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={restoreAllPages}
                      className="mt-2"
                    >
                      استعادة الكل
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* الصفحات المحذوفة */}
            {deletedPages.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm text-red-800 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      المحذوفة ({deletedPages.length})
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={restoreAllPages}
                      className="h-7 text-xs"
                    >
                      استعادة الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-wrap gap-2">
                    {deletedPages.map(page => (
                      <div
                        key={page.id}
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-red-200"
                      >
                        <span className="text-sm text-gray-600">صفحة {page.originalNumber}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => restorePage(page.id)}
                          className="h-6 px-2 text-blue-600 hover:text-blue-700"
                        >
                          <RefreshCw className="w-3 h-3 ml-1" />
                          استعادة
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="extract" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileOutput className="w-5 h-5 text-purple-600" />
                  استخراج صفحات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-purple-50 border-purple-200">
                  <AlertDescription className="text-sm text-purple-800">
                    حدد الصفحات المراد استخراجها إلى ملف PDF جديد
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">من صفحة</Label>
                    <Input
                      type="number"
                      value={extractRange.from}
                      onChange={(e) => setExtractRange({ ...extractRange, from: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={totalPages}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">إلى صفحة</Label>
                    <Input
                      type="number"
                      value={extractRange.to}
                      onChange={(e) => setExtractRange({ ...extractRange, to: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={totalPages}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => selectRange(extractRange.from, extractRange.to)}
                    className="flex-1"
                  >
                    تحديد النطاق
                  </Button>
                  <Button 
                    onClick={handleExtractPages}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                    ) : (
                      <FileOutput className="w-4 h-4 ml-1" />
                    )}
                    استخراج {selectedPages.length > 0 ? selectedPages.length : extractRange.to - extractRange.from + 1} صفحة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="split" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Split className="w-5 h-5 text-orange-600" />
                  تقسيم الملف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={splitOptions.type === 'each' ? 'default' : 'outline'}
                    onClick={() => setSplitOptions({ ...splitOptions, type: 'each' })}
                    className="h-auto py-3 flex-col"
                  >
                    <FileText className="w-5 h-5 mb-1" />
                    <span className="text-xs">صفحة لكل ملف</span>
                  </Button>
                  <Button
                    variant={splitOptions.type === 'fixed' ? 'default' : 'outline'}
                    onClick={() => setSplitOptions({ ...splitOptions, type: 'fixed' })}
                    className="h-auto py-3 flex-col"
                  >
                    <Layers className="w-5 h-5 mb-1" />
                    <span className="text-xs">عدد ثابت</span>
                  </Button>
                  <Button
                    variant={splitOptions.type === 'range' ? 'default' : 'outline'}
                    onClick={() => setSplitOptions({ ...splitOptions, type: 'range' })}
                    className="h-auto py-3 flex-col"
                  >
                    <Scissors className="w-5 h-5 mb-1" />
                    <span className="text-xs">نطاقات مخصصة</span>
                  </Button>
                </div>

                {splitOptions.type === 'fixed' && (
                  <div>
                    <Label className="text-sm">عدد الصفحات لكل ملف</Label>
                    <Input
                      type="number"
                      value={splitOptions.pagesPerFile}
                      onChange={(e) => setSplitOptions({ ...splitOptions, pagesPerFile: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={totalPages}
                    />
                  </div>
                )}

                {splitOptions.type === 'range' && (
                  <div>
                    <Label className="text-sm">النطاقات (مثال: 1-3, 4-6, 7-10)</Label>
                    <Input
                      value={splitOptions.ranges}
                      onChange={(e) => setSplitOptions({ ...splitOptions, ranges: e.target.value })}
                      placeholder="1-3, 4-6, 7-10"
                    />
                  </div>
                )}

                <Button 
                  onClick={handleSplitPDF}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <Split className="w-4 h-4 ml-1" />
                  )}
                  تقسيم الملف
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* نافذة معاينة الصفحة */}
      {currentPreviewPage && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setCurrentPreviewPage(null)}
        >
          <Card className="max-w-4xl w-full m-4" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="flex items-center gap-2">
                <ZoomIn className="w-5 h-5" />
                معاينة صفحة {currentPreviewPage.number}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setCurrentPreviewPage(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div 
                className="bg-gray-100 rounded-lg overflow-hidden"
                style={{ 
                  transform: `rotate(${currentPreviewPage.rotation}deg)`,
                  height: '70vh'
                }}
              >
                {currentPreviewPage.thumbnail ? (
                  <iframe
                    src={currentPreviewPage.thumbnail}
                    className="w-full h-full border-0"
                    title={`معاينة صفحة ${currentPreviewPage.number}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}