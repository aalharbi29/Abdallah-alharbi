
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
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox للتحديد */}
            {onSelect && (
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelect(groupId);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            )}

            {/* أيقونة الملف */}
            <div className="flex-shrink-0 mt-1" title={mainFile.file_name || mainFile.title}>
              {getFileIcon(mainFile.file_name)}
            </div>

            {/* محتوى البطاقة */}
            <div className="flex-1 min-w-0">
              {/* العنوان والقلم للتعديل */}
              <div className="relative group/title flex items-center gap-2 mb-1">
                <h3
                  className="font-semibold text-base truncate"
                  title={mainFile.file_name || mainFile.title}
                >
                  {mainFile.title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card selection
                    setShowEditDialog(true);
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover/title:opacity-100 transition-opacity"
                  title="تعديل العنوان"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {/* الوصف */}
              {mainFile.description && (
                <p
                  className="text-sm text-gray-600 mb-2 line-clamp-2"
                  title={mainFile.file_name}
                >
                  {mainFile.description}
                </p>
              )}

              {/* الشارات */}
              <div className="flex flex-wrap gap-2 mb-3" title={mainFile.file_name}>
                {mainFile.category && categoryLabels[mainFile.category] && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {categoryLabels[mainFile.category]}
                  </Badge>
                )}
                {mainFile.sub_category && subCategoryLabels[mainFile.sub_category] && (
                  <Badge variant="outline">
                    {subCategoryLabels[mainFile.sub_category]}
                  </Badge>
                )}
                {mainFile.tags && Array.isArray(mainFile.tags) && mainFile.tags.map(tag => tag && (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* معلومات إضافية */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3" title={mainFile.file_name}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(mainFile.created_date), 'dd/MM/yyyy', { locale: ar })}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {mainFile.created_by || 'غير معروف'}
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex flex-wrap gap-2 no-drag">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Eye className="w-3 h-3 ml-1" />
                      عرض
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs truncate">{mainFile.file_name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mainFile.file_name && /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(mainFile.file_name) ? (
                      <>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openInGoogleViewer(mainFile); }} className="cursor-pointer">
                          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
                          عرض في Google Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openInOfficeViewer(mainFile); }} className="cursor-pointer">
                          <FileText className="w-4 h-4 ml-2" />
                          عرض في Office Viewer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openInOffice365(mainFile); }} className="cursor-pointer">
                          <ExternalLink className="w-4 h-4 ml-2" />
                          عرض في Office 365
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingFile(mainFile); }} className="cursor-pointer">
                        <Eye className="w-4 h-4 ml-2" />
                        معاينة الملف
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDirect(mainFile); }} className="cursor-pointer">
                      <ExternalLink className="w-4 h-4 ml-2" />
                      فتح مباشر
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    downloadFileWithName(mainFile.file_url, mainFile.file_name); 
                  }}
                  title={`تحميل: ${mainFile.file_name}`}
                >
                  <Download className="w-3 h-3 ml-1" />
                  تحميل
                </Button>

                {/* زر استبدال الملف */}
                <div onClick={(e) => e.stopPropagation()}>
                  <InlineFileReplacer
                    currentFile={mainFile}
                    onReplace={async (newFileUrl, newFileName) => {
                      await ArchivedFile.update(mainFile.id, {
                        file_url: newFileUrl,
                        file_name: newFileName
                      });
                      onRefresh && onRefresh();
                    }}
                  />
                </div>

                {hasMultipleFiles && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        المزيد ({fileGroup.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                      <DropdownMenuLabel>الملفات في المجموعة</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {fileGroup.slice(1).map((file) => ( // Display files other than the main file
                        <DropdownMenuItem key={file.id} onClick={(e) => { e.stopPropagation(); setViewingFile(file); }} className="cursor-pointer">
                          {getFileIcon(file.file_name)}
                          <span className="mr-2 truncate">{file.file_name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowMover(true); 
                  }}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  title={`نقل: ${mainFile.file_name}`}
                >
                  <ArrowRight className="w-3 h-3 ml-1" />
                  نقل
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint();
                  }}
                  title={`طباعة: ${mainFile.file_name}`}
                >
                  <Printer className="w-3 h-3 ml-1" />
                  طباعة
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                      title={`حذف: ${mainFile.file_name}`}
                    >
                      <Trash2 className="w-3 h-3 ml-1" />
                      حذف
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
                          e.stopPropagation(); // Stop propagation here too
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
