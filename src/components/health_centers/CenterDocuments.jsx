import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputWithVoice from '@/components/ui/InputWithVoice';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText, Upload, Trash2, Download, Eye, Plus,
  Calendar, Hash, AlertCircle, CheckCircle2, Search, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CenterDocuments({ centerId, centerName }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    document_title: '',
    document_type: 'قرار إداري',
    description: '',
    document_date: '',
    document_number: '',
    tags: '',
    expiry_date: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, [centerId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await base44.entities.CenterDocument.filter(
        { center_id: centerId },
        '-created_date'
      );
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('فشل تحميل المستندات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await extractDataFromFile(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      await extractDataFromFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const extractDataFromFile = async (file) => {
    setIsExtracting(true);
    try {
      // رفع الملف أولاً
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // استخراج البيانات باستخدام الذكاء الاصطناعي
      const extractedData = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل هذا المستند واستخراج المعلومات التالية بشكل دقيق ومختصر:
- document_title: عنوان المستند (مختصر وواضح، 5-10 كلمات)
- document_type: نوع المستند (اختر من: قرار إداري، تكليف مدير، تكليف نائب مدير، معاملة رسمية، عقد إيجار، صيانة، تجهيزات، تقرير، مراسلة، أخرى)
- description: وصف مختصر للمستند (جملة أو جملتين)
- document_date: تاريخ المستند بصيغة YYYY-MM-DD (إن وجد)
- document_number: رقم المستند أو القرار (إن وجد)

إذا لم تجد معلومة محددة، اتركها فارغة (null).
كن دقيقاً ومختصراً في الاستخراج.`,
        add_context_from_internet: false,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            document_title: { type: "string" },
            document_type: { type: "string" },
            description: { type: "string" },
            document_date: { type: ["string", "null"] },
            document_number: { type: ["string", "null"] }
          }
        }
      });

      // ملء الحقول بالبيانات المستخرجة
      if (extractedData) {
        setFormData(prev => ({
          ...prev,
          document_title: extractedData.document_title || prev.document_title,
          document_type: extractedData.document_type || prev.document_type,
          description: extractedData.description || prev.description,
          document_date: extractedData.document_date || prev.document_date,
          document_number: extractedData.document_number || prev.document_number
        }));
        toast.success('تم استخراج البيانات من الملف بنجاح ✓');
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      toast.error('فشل استخراج البيانات - يمكنك إدخالها يدوياً');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('الرجاء اختيار ملف');
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file: selectedFile });

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      await base44.entities.CenterDocument.create({
        center_id: centerId,
        center_name: centerName,
        document_title: formData.document_title,
        document_type: formData.document_type,
        description: formData.description,
        file_url: uploadResult.file_url,
        file_name: selectedFile.name,
        document_date: formData.document_date || null,
        document_number: formData.document_number || null,
        tags: tagsArray,
        expiry_date: formData.expiry_date || null,
        notes: formData.notes || null
      });

      toast.success('تم رفع المستند بنجاح');
      setIsDialogOpen(false);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('فشل رفع المستند');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

    try {
      await base44.entities.CenterDocument.delete(docId);
      toast.success('تم حذف المستند');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('فشل حذف المستند');
    }
  };

  const resetForm = () => {
    setFormData({
      document_title: '',
      document_type: 'قرار إداري',
      description: '',
      document_date: '',
      document_number: '',
      tags: '',
      expiry_date: '',
      notes: ''
    });
    setSelectedFile(null);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.document_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_number?.includes(searchQuery) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const documentTypes = [
    'قرار إداري',
    'تكليف مدير',
    'تكليف نائب مدير',
    'معاملة رسمية',
    'عقد إيجار',
    'صيانة',
    'تجهيزات',
    'تقرير',
    'مراسلة',
    'أخرى'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            مستندات المركز ({documents.length})
          </span>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مستند
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* البحث والفلتر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="بحث في المستندات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="نوع المستند" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* قائمة المستندات */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>لا توجد مستندات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{doc.document_title}</h4>
                      <Badge variant="outline">{doc.document_type}</Badge>
                      {doc.expiry_date && new Date(doc.expiry_date) < new Date() && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 ml-1" />
                          منتهي
                        </Badge>
                      )}
                      {doc.is_active && (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          نشط
                        </Badge>
                      )}
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {doc.document_number && (
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {doc.document_number}
                        </span>
                      )}
                      {doc.document_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.document_date).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {doc.file_name}
                      </span>
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.file_url, '_blank')}
                      title="عرض"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch(doc.file_url);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = doc.file_name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Error downloading:', error);
                          const link = document.createElement('a');
                          link.href = doc.file_url;
                          link.download = doc.file_name;
                          link.target = '_blank';
                          link.click();
                        }
                      }}
                      title="تحميل"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* نافذة إضافة مستند */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مستند جديد</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>عنوان المستند *</Label>
              <InputWithVoice
                value={formData.document_title}
                onChange={(e) => setFormData({ ...formData, document_title: e.target.value })}
                placeholder="مثال: قرار تكليف مدير المركز"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع المستند *</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>رقم المستند/القرار</Label>
                <InputWithVoice
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder="مثال: 12345"
                />
              </div>
            </div>

            <div>
              <Label>الوصف</Label>
              <InputWithVoice
                multiline
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف مختصر للمستند..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تاريخ المستند</Label>
                <Input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
                />
              </div>

              <div>
                <Label>تاريخ الانتهاء (اختياري)</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>كلمات مفتاحية (مفصولة بفاصلة)</Label>
              <InputWithVoice
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="مثال: تكليف, مدير, 2024"
              />
            </div>

            <div>
              <Label>ملاحظات</Label>
              <InputWithVoice
                multiline
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية..."
                rows={2}
              />
            </div>

            <div>
              <Label>الملف *</Label>
              <div className="mt-2">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                    isDragging 
                      ? "border-blue-500 bg-blue-50 scale-105" 
                      : selectedFile
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  )}
                >
                  <div className="text-center">
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
                        <p className="text-sm font-medium text-blue-600">
                          🤖 جاري قراءة الملف بالذكاء الاصطناعي...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className={cn(
                          "w-8 h-8 mx-auto mb-2 transition-colors",
                          isDragging ? "text-blue-500" : selectedFile ? "text-green-500" : "text-gray-400"
                        )} />
                        <p className={cn(
                          "text-sm font-medium",
                          selectedFile ? "text-green-700" : "text-gray-600"
                        )}>
                          {isDragging ? '📥 أفلت الملف هنا' : selectedFile ? `✓ ${selectedFile.name}` : '📁 اضغط أو اسحب الملف هنا'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, Word, Excel, صورة • سيتم استخراج البيانات تلقائياً
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isUploading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    رفع المستند
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}