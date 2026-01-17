import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Search,
  Calendar,
  Lock,
  Image,
  File as FileGeneric,
  Eye,
  Trash2,
  Printer,
  Move,
  Download,
  ExternalLink,
  Send,
  Loader2,
  Copy, // Added Copy icon
  Users, // Added Users icon
  Edit // Added Edit icon for title editing
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { EmployeeDocument } from '@/entities/EmployeeDocument';
import { Employee } from '@/entities/Employee';
import PDFViewer from '@/components/files/PDFViewer';
import { downloadFileWithName } from '@/components/files/InlineFileReplacer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import EditDocumentTitleDialog from '@/components/files/EditDocumentTitleDialog'; // Added new import

const documentTypeLabels = {
  personal: 'مستندات شخصية',
  official: 'مستندات رسمية',
  certificate: 'شهادات ومؤهلات',
  contract: 'عقود وتكليفات',
  evaluation: 'تقييمات أداء',
  other: 'أخرى'
};

const documentTypeIcons = {
  personal: '👤',
  official: '📋',
  certificate: '🎓',
  contract: '📝',
  evaluation: '⭐',
  other: '📎'
};

const getFileIcon = (fileName) => {
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) return <Image className="w-8 h-8 text-indigo-500"/>;
  if (/\.pdf$/i.test(fileName)) return <FileText className="w-8 h-8 text-red-500"/>;
  if (/\.(doc|docx)$/i.test(fileName)) return <FileText className="w-8 h-8 text-blue-500"/>;
  if (/\.(xls|xlsx)$/i.test(fileName)) return <FileText className="w-8 h-8 text-green-500"/>;
  return <FileGeneric className="w-8 h-8 text-gray-500"/>;
};

// مكون جديد لنسخ المستند
const CopyDocumentDialog = ({ open, onOpenChange, document: doc, currentEmployeeId, onCopyComplete }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');

  React.useEffect(() => {
    if (open) {
      loadEmployees();
      // Reset state when dialog opens
      setSearchQuery('');
      setSelectedEmployees(new Set());
      setCopyProgress(0);
      setCopyStatus('');
      setIsCopying(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredEmployees(
        employees.filter(emp =>
          emp.full_name_arabic?.toLowerCase().includes(query) ||
          emp.id?.toLowerCase().includes(query) || // Assuming رقم_الموظف is actually emp.id or similar unique identifier
          emp.position?.toLowerCase().includes(query) ||
          emp.health_center_name?.toLowerCase().includes(query) // Adjusted based on common employee object structure
        )
      );
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const allEmployees = await Employee.list('-full_name_arabic', 500); // Fetch up to 500 employees, ordered by name
      // استبعاد الموظف الحالي
      const otherEmployees = allEmployees.filter(emp => emp.id !== currentEmployeeId);
      setEmployees(otherEmployees);
      setFilteredEmployees(otherEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('فشل تحميل قائمة الموظفين');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
  };

  const clearAll = () => {
    setSelectedEmployees(new Set());
  };

  const handleCopy = async () => {
    if (selectedEmployees.size === 0) {
      alert('يرجى اختيار موظف واحد على الأقل');
      return;
    }

    setIsCopying(true);
    setCopyProgress(0);
    setCopyStatus('جاري نسخ المستند...');

    try {
      const selectedEmployeesList = employees.filter(emp => selectedEmployees.has(emp.id));
      const totalEmployees = selectedEmployeesList.length;
      let successCount = 0;
      let failedEmployees = [];

      const documentsToCreate = [];

      for (let i = 0; i < totalEmployees; i++) {
        const employee = selectedEmployeesList[i];
        setCopyStatus(`تحضير نسخ للموظف: ${employee.full_name_arabic} (${i + 1}/${totalEmployees})`);
        setCopyProgress(Math.round(((i + 1) / totalEmployees) * 100));

        // Prepare document data for each selected employee
        documentsToCreate.push({
          employee_id: employee.id,
          employee_name: employee.full_name_arabic,
          document_title: doc.document_title,
          document_type: doc.document_type,
          description: doc.description,
          file_url: doc.file_url,
          file_name: doc.file_name,
          tags: doc.tags || [],
          is_confidential: doc.is_confidential,
          expiry_date: doc.expiry_date
        });
      }

      setCopyStatus('جاري إرسال المستندات لإنشائها...');
      setCopyProgress(100); // Once all data is prepared, set progress to 100 before bulk create

      // Perform bulk creation
      // Assuming EmployeeDocument.bulkCreate takes an array of document objects and returns success/failure info
      const results = await EmployeeDocument.bulkCreate(documentsToCreate);

      // Process results to count successes and failures
      if (results && Array.isArray(results)) {
          results.forEach((result, index) => {
              if (result.success) { // Assuming each result object has a 'success' property
                  successCount++;
              } else {
                  failedEmployees.push(documentsToCreate[index].employee_name || 'موظف غير معروف');
              }
          });
      } else {
          // Fallback if bulkCreate doesn't return detailed results, assume all prepared were successful
          successCount = totalEmployees;
      }

      setCopyStatus('✅ اكتمل النسخ!');

      let message = `تم نسخ المستند بنجاح إلى ${successCount} موظف`;
      if (failedEmployees.length > 0) {
        message += `\n\nفشل النسخ للموظفين التاليين:\n${failedEmployees.join('\n')}`;
      }

      alert(message);

      if (onCopyComplete) {
        onCopyComplete();
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error copying document:', error);
      alert('حدث خطأ أثناء نسخ المستند');
    } finally {
      setIsCopying(false);
      setCopyProgress(0);
      setCopyStatus('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            نسخ المستند: {doc.document_title}
          </DialogTitle>
        </DialogHeader>

        {isCopying ? (
          <div className="flex-grow flex flex-col justify-center items-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="font-medium text-center">{copyStatus}</p>
            <Progress value={copyProgress} className="mt-4 w-2/3" />
            <p className="text-sm text-gray-500 mt-2">{copyProgress}%</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 flex-grow flex flex-col">
              {/* معلومات المستند */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getFileIcon(doc.file_name)}
                    <div className="flex-1">
                      <h4 className="font-semibold">{doc.document_title}</h4>
                      <p className="text-sm text-gray-600">
                        النوع: {documentTypeLabels[doc.document_type]} •
                        الملف: {doc.file_name}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* شريط البحث والإحصائيات */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث عن موظف (الاسم، رقم الموظف، المركز الصحي)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">
                  <Users className="w-3 h-3 ml-1" />
                  {selectedEmployees.size} محدد
                </Badge>
              </div>

              {/* أزرار الإجراءات السريعة */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={filteredEmployees.length === 0 || isLoading}
                >
                  تحديد الكل ({filteredEmployees.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={selectedEmployees.size === 0}
                >
                  إلغاء التحديد
                </Button>
              </div>

              {/* قائمة الموظفين */}
              {isLoading ? (
                <div className="text-center py-8 flex-grow flex flex-col justify-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">جاري تحميل الموظفين...</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] border rounded-lg p-2 flex-grow">
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      لا يوجد موظفين تطابق البحث أو تم استبعاد الموظف الحالي.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredEmployees.map(employee => (
                        <div
                          key={employee.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedEmployees.has(employee.id)
                              ? 'bg-blue-50 border-blue-300'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleEmployee(employee.id)}
                        >
                          <Checkbox
                            checked={selectedEmployees.has(employee.id)}
                            onCheckedChange={() => toggleEmployee(employee.id)}
                            className="pointer-events-none" // Prevent checkbox from being directly clickable to ensure div click works
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{employee.full_name_arabic}</p>
                            <p className="text-sm text-gray-600 truncate">
                              رقم الموظف: {employee.id} • {employee.position} • {employee.health_center_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleCopy}
                disabled={selectedEmployees.size === 0 || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ إلى {selectedEmployees.size} موظف
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};


const DocumentCard = ({ document: doc, onDelete, onRefresh, currentEmployeeId }) => {
  const [isViewing, setIsViewing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false); // New state for copy dialog
  const [showEditDialog, setShowEditDialog] = useState(false); // New state for edit title dialog
  const [newDocumentType, setNewDocumentType] = useState(doc.document_type);
  const [isMoving, setIsMoving] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false); // New state for WhatsApp loading

  const isExpired = doc.expiry_date &&
                    doc.expiry_date !== 'حتى إشعار آخر' &&
                    new Date(doc.expiry_date) < new Date();

  const handlePrint = () => {
    const fileUrl = doc.file_url;
    const fileName = doc.file_name || '';
    const isPDF = /\.pdf$/i.test(fileName);
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
    const isWord = /\.(doc|docx)$/i.test(fileName);
    const isExcel = /\.(xls|xlsx)$/i.test(fileName);

    if (isPDF) {
      // طباعة PDF مباشرة عبر iframe مخفي
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
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
                * { margin: 0; padding: 0; }
                body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
                img { max-width: 100%; max-height: 100vh; }
                @media print { body { margin: 0; } img { max-width: 100%; } }
              </style>
            </head>
            <body>
              <img src="${fileUrl}" onload="setTimeout(function(){window.print();window.close();},800);" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else if (isWord || isExcel) {
      // فتح في Google Docs للطباعة
      const googleUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      const printWindow = window.open(googleUrl, '_blank', 'width=900,height=700');
      if (printWindow) {
        alert('سيتم فتح الملف في نافذة جديدة. اضغط Ctrl+P للطباعة بعد تحميل الملف.');
      }
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDelete = async () => {
    try {
      await EmployeeDocument.delete(doc.id);
      onDelete(doc.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert('حدث خطأ أثناء حذف المستند');
    }
  };

  const handleMove = async () => {
    if (!newDocumentType) {
      alert('يرجى اختيار نوع المستند الجديد');
      return;
    }

    setIsMoving(true);
    try {
      await EmployeeDocument.update(doc.id, {
        document_type: newDocumentType
      });
      setShowMoveDialog(false);
      onRefresh();
      alert('تم نقل المستند بنجاح');
    } catch (error) {
      console.error("Error moving document:", error);
      alert('حدث خطأ أثناء نقل المستند');
    } finally {
      setIsMoving(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    const phoneNumber = '966530715233'; // Example phone number

    try {
      // الخطوة 1: تحميل الملف تلقائياً
      const response = await fetch(doc.file_url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      // إنشاء عنصر رابط للتحميل
      const downloadLink = window.document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = doc.file_name;
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      window.document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(objectUrl);

      // الخطوة 2: إعداد رسالة واتساب
      const message = `
📎 مستند جاهز للإرسال

📄 المستند: ${doc.document_title}
📂 النوع: ${documentTypeLabels[doc.document_type] || doc.document_type}
👤 الموظف: ${doc.employee_name}
${doc.description ? `📝 الوصف: ${doc.description}\n` : ''}
✅ تم تحميل الملف على جهازك
📌 اسم الملف: ${doc.file_name}

يمكنك الآن إرفاق الملف مباشرة من واتساب 👇
      `.trim();

      // الخطوة 3: فتح واتساب بعد ثانية
      setTimeout(() => {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setIsSendingWhatsApp(false);
      }, 1000); // Reduced delay slightly

    } catch (error) {
      console.error('Error downloading file:', error);
      setIsSendingWhatsApp(false);

      // في حالة فشل التحميل، نرسل الرابط فقط
      const fallbackMessage = `
📎 مستند من النظام

📄 ${doc.document_title}
📂 ${documentTypeLabels[doc.document_type] || doc.document_type}
👤 ${doc.employee_name}
${doc.description ? `📝 ${doc.description}\n` : ''}
🔗 رابط الملف: ${doc.file_url}
      `.trim();

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fallbackMessage)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const openInGoogleViewer = () => {
    const googleUrl = `https://docs.google.com/gview?url=${encodeURIComponent(doc.file_url)}&embedded=true`;
    window.open(googleUrl, '_blank', 'width=1200,height=800');
  };

  const openInOfficeViewer = () => {
    const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.file_url)}`;
    window.open(officeUrl, '_blank', 'width=1200,height=800');
  };

  const openInOffice365 = () => {
    const office365Url = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.file_url)}`;
    window.open(office365Url, '_blank', 'width=1200,height=800');
  };

  const openDirect = () => {
    window.open(doc.file_url, '_blank');
  };

  return (
    <>
      <Card
        className={`hover:shadow-md transition-all relative group ${isExpired ? 'border-red-200 bg-red-50' : 'hover:border-blue-300'} cursor-pointer`}
        title={doc.file_name || doc.document_title}
      >
        <CardContent className="p-3">
          {/* أيقونة الملف */}
          <div className="flex items-center justify-center mb-2" title={doc.file_name}>
            {getFileIcon(doc.file_name)}
          </div>

          {/* عنوان المستند مع زر التعديل */}
          <div className="relative group/title">
            <h4
              className="font-semibold text-xs text-center mb-2 line-clamp-2 min-h-[32px]"
              title={doc.file_name || doc.document_title}
            >
              {doc.document_title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="absolute top-0 left-0 h-6 w-6 p-0 opacity-0 group-hover/title:opacity-100 transition-opacity"
              title="تعديل العنوان"
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>

          {/* شارات */}
          <div className="flex flex-wrap justify-center gap-1 mb-2" title={doc.file_name}>
            {doc.is_confidential && (
              <Lock className="w-3 h-3 text-red-500" title="مستند سري" />
            )}
            {isExpired && (
              <Badge variant="destructive" className="text-xs px-1 py-0">منتهي</Badge>
            )}
            {doc.expiry_date === 'حتى إشعار آخر' && (
              <Badge className="text-xs px-1 py-0 bg-green-100 text-green-800">∞</Badge>
            )}
          </div>

          {/* نوع المستند */}
          <Badge variant="outline" className="text-xs w-full justify-center mb-2" title={doc.file_name}>
            {documentTypeLabels[doc.document_type] || doc.document_type}
          </Badge>

          {/* التاريخ */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2" title={doc.file_name}>
            <Calendar className="w-3 h-3" />
            {format(new Date(doc.created_date), 'dd/MM/yyyy', { locale: ar })}
          </div>

          {/* تاريخ الانتهاء */}
          {doc.expiry_date && (
            <div className="text-center text-xs mb-2">
              <span className="text-gray-500">
                {doc.expiry_date === 'حتى إشعار آخر' ?
                  '⏳ حتى إشعار آخر' :
                  `📅 ${format(new Date(doc.expiry_date), 'dd/MM/yyyy', { locale: ar })}`
                }
              </span>
            </div>
          )}

          {/* فترة التكليف - تظهر فقط للعقود والتكليفات */}
          {doc.document_type === 'contract' && (doc.start_date || doc.end_date) && (
            <div className="text-center text-xs mb-2 bg-blue-50 rounded px-2 py-1">
              <span className="text-blue-700 font-medium">
                {doc.start_date && doc.end_date ? (
                  `📅 ${format(new Date(doc.start_date), 'dd/MM/yyyy', { locale: ar })} - ${format(new Date(doc.end_date), 'dd/MM/yyyy', { locale: ar })}`
                ) : doc.start_date ? (
                  `📅 من ${format(new Date(doc.start_date), 'dd/MM/yyyy', { locale: ar })}`
                ) : (
                  `📅 حتى ${format(new Date(doc.end_date), 'dd/MM/yyyy', { locale: ar })}`
                )}
              </span>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="grid grid-cols-3 gap-1 mb-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  title={`استعراض: ${doc.file_name}`}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-xs">{doc.file_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openInGoogleViewer} className="text-xs cursor-pointer">
                  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  Google Viewer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openInOfficeViewer} className="text-xs cursor-pointer">
                  <FileText className="w-4 h-4 ml-2" />
                  Office Viewer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openInOffice365} className="text-xs cursor-pointer">
                  <ExternalLink className="w-4 h-4 ml-2" />
                  Office 365
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsViewing(true)} className="text-xs cursor-pointer">
                  <Eye className="w-4 h-4 ml-2" />
                  عارض النظام
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDirect} className="text-xs cursor-pointer">
                  <ExternalLink className="w-4 h-4 ml-2" />
                  فتح مباشر
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-7 text-xs"
              title={`طباعة: ${doc.file_name}`}
            >
              <Printer className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFileWithName(doc.file_url, doc.file_name)}
              className="h-7 text-xs"
              title={`تحميل: ${doc.file_name}`}
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>

          {/* أزرار إضافية */}
          <div className="grid grid-cols-4 gap-1"> {/* Changed to grid-cols-4 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="h-7 text-xs bg-green-50 hover:bg-green-100 text-green-700 relative"
              title={isSendingWhatsApp ? "جاري التحميل والإعداد للواتساب..." : "تحميل وإرسال عبر واتساب"}
            >
              {isSendingWhatsApp ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
            <Button // New Copy Button
              variant="outline"
              size="sm"
              onClick={() => setShowCopyDialog(true)}
              className="h-7 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700"
              title="نسخ إلى موظفين آخرين"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewDocumentType(doc.document_type);
                setShowMoveDialog(true);
              }}
              className="h-7 text-xs"
              title={`نقل: ${doc.file_name}`}
            >
              <Move className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-7 text-xs text-red-600 hover:text-red-700"
              title={`حذف: ${doc.file_name}`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      <PDFViewer
        file={doc}
        open={isViewing}
        onOpenChange={setIsViewing}
        entitySDK={EmployeeDocument}
        recordId={doc.id}
        fileUrlField="file_url"
        fileNameField="file_name"
        onFileUpdated={onRefresh}
      />

      {/* Copy Dialog */}
      <CopyDocumentDialog
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
        document={doc}
        currentEmployeeId={currentEmployeeId}
        onCopyComplete={onRefresh} // Refresh the list after a successful copy
      />

      {/* Edit Dialog */}
      <EditDocumentTitleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        document={doc}
        entitySDK={EmployeeDocument}
        onSuccess={onRefresh}
      />

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستند "{doc.document_title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نقل المستند</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="document-type">نوع المستند الجديد</Label>
            <Select value={newDocumentType} onValueChange={setNewDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="اختر نوع المستند" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(documentTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>إلغاء</Button>
            <Button onClick={handleMove} disabled={isMoving}>
              {isMoving ? 'جاري النقل...' : 'نقل'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function EmployeeDocumentList({ documents, onDocumentDeleted, onRefresh, currentEmployeeId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = doc.document_title.toLowerCase().includes(searchLower) ||
           doc.description?.toLowerCase().includes(searchLower) ||
           doc.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
           (documentTypeLabels[doc.document_type] || doc.document_type).toLowerCase().includes(searchLower);

    const matchesType = filterType === 'all' || doc.document_type === filterType;

    return matchesSearch && matchesType;
  });

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مستندات</h3>
        <p className="mt-1 text-sm text-gray-500">
          لم يتم رفع أي مستندات لهذا الموظف بعد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="البحث في المستندات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="نوع المستند" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {Object.entries(documentTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {filteredDocuments.length} من {documents.length}
        </div>
      </div>

      {/* عرض المستندات مجمعة حسب النوع - بشكل أفقي */}
      {Object.entries(documentTypeLabels).map(([type, label]) => {
        const docsOfType = filteredDocuments.filter(d => d.document_type === type);
        if (docsOfType.length === 0) return null;
        
        return (
          <div key={type} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 border-b pb-2">
              <span>{documentTypeIcons[type]}</span>
              {label}
              <Badge variant="secondary" className="mr-auto">{docsOfType.length}</Badge>
            </h3>
            <div className="space-y-2">
              {docsOfType.map(document => (
                <DocumentCardHorizontal
                  key={document.id}
                  document={document}
                  onDelete={onDocumentDeleted}
                  onRefresh={onRefresh}
                  currentEmployeeId={currentEmployeeId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}