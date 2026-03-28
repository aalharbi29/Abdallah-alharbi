import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Eye,
  Trash2,
  Image as ImageIcon,
  File as FileGeneric,
  Calendar,
  User,
  Download,
  Printer,
  ExternalLink,
  ArrowRight, // Added for the move button
  Edit // Added for editing document title
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog"; // Added for delete confirmation
import PDFViewer from '@/components/files/PDFViewer';
import { downloadFileWithName } from '@/components/files/InlineFileReplacer'; // This import is specific to the original InlineFileReplacer, might be removed if not used elsewhere, but keeping for now.
import InlineFileReplacer from '@/components/files/InlineFileReplacer';
import { ArchivedFile } from '@/entities/ArchivedFile';
import FileMover from '@/components/files/FileMover'; // Added for file moving functionality
import EditDocumentTitleDialog from '@/components/files/EditDocumentTitleDialog'; // Added for title editing

const getFileIcon = (fileName) => {
  if (!fileName) return <FileGeneric className="w-8 h-8 text-gray-400" />;
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) return <ImageIcon className="w-8 h-8 text-blue-500"/>;
  if (/\.pdf$/i.test(fileName)) return <FileText className="w-8 h-8 text-red-500"/>;
  if (/\.(doc|docx)$/i.test(fileName)) return <FileText className="w-8 h-8 text-blue-600"/>;
  if (/\.(xls|xlsx)$/i.test(fileName)) return <FileText className="w-8 h-8 text-green-600"/>;
  return <FileGeneric className="w-8 h-8 text-gray-400"/>;
};

export default function ArchivedFileItem({ fileGroup, onDelete, onRefresh, employees, allCategories, isSelected, onSelect }) {
  const [viewingFile, setViewingFile] = useState(null);
  const [showMover, setShowMover] = useState(false); // Added for file mover dialog
  const [showEditDialog, setShowEditDialog] = useState(false); // State for edit title dialog

  // التحقق من وجود fileGroup وأنه مصفوفة
  if (!fileGroup || !Array.isArray(fileGroup) || fileGroup.length === 0) {
    return null;
  }

  // الملف الرئيسي (أول ملف في المجموعة)
  const mainFile = fileGroup[0];
  
  // التحقق من وجود الملف الرئيسي
  if (!mainFile) {
    return null;
  }

  const groupId = mainFile.group_id || mainFile.id;
  const hasMultipleFiles = fileGroup.length > 1;

  const handlePrint = () => {
    if (mainFile.file_url) {
      window.open(mainFile.file_url, '_blank');
    } else {
      alert('لا يوجد ملف للطباعة');
    }
  };

  // فتح الملف في Google Viewer
  const openInGoogleViewer = (file) => {
    const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.file_url)}&embedded=true`;
    window.open(googleUrl, '_blank', 'width=1200,height=800');
  };

  // فتح الملف في Office Viewer
  const openInOfficeViewer = (file) => {
    const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.file_url)}`;
    window.open(officeUrl, '_blank', 'width=1200,height=800');
  };

  // فتح الملف في Office365
  const openInOffice365 = (file) => {
    const office365Url = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url)}`;
    window.open(office365Url, '_blank', 'width=1200,height=800');
  };

  // فتح مباشر
  const openDirect = (file) => {
    window.open(file.file_url, '_blank');
  };

  const categoryLabels = {
    circulars: 'التعاميم المنظمة',
    inventory: 'ملفات الحصر',
    assignments: 'التكاليف',
    other: 'ملفات أخرى'
  };

  const subCategoryLabels = {
    human_resources: 'حصر بشري',
    fixed_assets: 'حصر أصول ثابتة',
    equipment: 'حصر أجهزة'
  };

  return (
    <>
      <Card
        className={`hover:shadow-lg transition-all duration-200 border-2 ${isSelected ? 'ring-2 ring-blue-500 border-blue-400' : 'hover:border-blue-300'} relative cursor-pointer`}
        onClick={() => onSelect && onSelect(groupId)}
        title={mainFile.file_name || mainFile.title}
      >
        <CardContent className="p-0">
          <div className="p-4 flex items-start gap-4">
            {/* أيقونة الملف */}
            <div className="flex-shrink-0 p-3 bg-gray-50 rounded-xl border border-gray-100" title={mainFile.file_name || mainFile.title}>
              {getFileIcon(mainFile.file_name)}
            </div>

            {/* محتوى البطاقة */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                {/* العنوان والقلم للتعديل */}
                <div className="relative group/title flex items-center gap-2 flex-1 min-w-0 pr-2">
                  <h3
                    className="font-semibold text-base text-gray-900 truncate"
                    title={mainFile.file_name || mainFile.title}
                  >
                    {mainFile.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 flex-shrink-0"
                    title="تعديل العنوان"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                {/* Checkbox للتحديد */}
                {onSelect && (
                  <div className="flex-shrink-0 ml-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelect(groupId);
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* الوصف */}
              {mainFile.description && (
                <p
                  className="text-sm text-gray-500 mb-3 line-clamp-2"
                  title={mainFile.file_name}
                >
                  {mainFile.description}
                </p>
              )}

              {/* الشارات */}
              <div className="flex flex-wrap gap-1.5 mb-3" title={mainFile.file_name}>
                {mainFile.category && categoryLabels[mainFile.category] && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-normal">
                    {categoryLabels[mainFile.category]}
                  </Badge>
                )}
                {mainFile.sub_category && subCategoryLabels[mainFile.sub_category] && (
                  <Badge variant="outline" className="text-gray-600 font-normal bg-gray-50">
                    {subCategoryLabels[mainFile.sub_category]}
                  </Badge>
                )}
                {mainFile.tags && Array.isArray(mainFile.tags) && mainFile.tags.map(tag => tag && (
                  <Badge key={tag} variant="outline" className="text-xs font-normal text-gray-500">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* معلومات إضافية */}
              <div className="flex items-center gap-4 text-xs text-gray-400" title={mainFile.file_name}>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(mainFile.created_date), 'dd/MM/yyyy', { locale: ar })}
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{mainFile.created_by || 'غير معروف'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات - Footer */}
          <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2 no-drag">
            {/* الصف الأول: الإجراءات الأساسية */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={(e) => e.stopPropagation()} title="عرض">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs truncate text-gray-500">{mainFile.file_name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mainFile.file_name && /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(mainFile.file_name) ? (
                      <>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openInGoogleViewer(mainFile); }} className="cursor-pointer py-2">
                          <svg className="w-4 h-4 ml-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
                          Google Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openInOfficeViewer(mainFile); }} className="cursor-pointer py-2">
                          <FileText className="w-4 h-4 ml-2 text-blue-600" />
                          Office Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openInOffice365(mainFile); }} className="cursor-pointer py-2">
                          <ExternalLink className="w-4 h-4 ml-2 text-orange-500" />
                          Office 365
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingFile(mainFile); }} className="cursor-pointer py-2">
                        <Eye className="w-4 h-4 ml-2 text-gray-500" />
                        معاينة داخل التطبيق
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDirect(mainFile); }} className="cursor-pointer py-2">
                      <ExternalLink className="w-4 h-4 ml-2 text-gray-500" />
                      فتح في نافذة جديدة
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    downloadFileWithName(mainFile.file_url, mainFile.file_name); 
                  }}
                  title={`تحميل: ${mainFile.file_name}`}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint();
                  }}
                  title="طباعة"
                >
                  <Printer className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => e.stopPropagation()}
                      title="حذف"
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
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>إلغاء</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={(e) => { 
                          e.stopPropagation();
                          onDelete && onDelete(mainFile.id); 
                        }}
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* الصف الثاني: الإجراءات الإضافية */}
            <div className="flex items-center justify-between w-full border-t border-gray-100 pt-2">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowMover(true); 
                  }}
                  title="نقل الملف"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div onClick={(e) => e.stopPropagation()}>
                  <InlineFileReplacer
                    entitySDK={ArchivedFile}
                    recordId={mainFile.id}
                    onReplaced={() => {
                      onRefresh && onRefresh();
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    iconOnly={true}
                    buttonText="استبدال الملف"
                  />
                </div>
              </div>

              {hasMultipleFiles && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 relative" onClick={(e) => e.stopPropagation()} title="ملفات مرتبطة">
                      <FileGeneric className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 bg-blue-100 text-blue-600 text-[10px] font-bold px-1 rounded-full">{fileGroup.length - 1}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                    <DropdownMenuLabel>ملفات مرتبطة</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {fileGroup.slice(1).map((file) => (
                      <DropdownMenuItem key={file.id} onClick={(e) => { e.stopPropagation(); setViewingFile(file); }} className="cursor-pointer">
                        {getFileIcon(file.file_name)}
                        <span className="mr-2 truncate max-w-[200px]">{file.file_name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* عارض الملفات */}
      {viewingFile && (
        <PDFViewer 
          file={viewingFile} 
          open={!!viewingFile} 
          onOpenChange={(open) => !open && setViewingFile(null)}
        />
      )}

      {showMover && (
        <FileMover
          file={mainFile}
          currentSystem="archive"
          isOpen={showMover}
          onClose={() => setShowMover(false)}
          onSuccess={() => {
            onRefresh && onRefresh();
            alert('تم نقل الملف بنجاح!');
          }}
        />
      )}

      {/* Edit Document Title Dialog */}
      <EditDocumentTitleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        document={mainFile}
        entitySDK={ArchivedFile}
        onSuccess={onRefresh}
      />
    </>
  );
}