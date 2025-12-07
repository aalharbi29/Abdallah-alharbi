import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload, FileText, Loader2, Download, Save,
  CheckSquare, Type, RefreshCw, CheckCircle, FileSpreadsheet, Eye,
  ChevronDown, ChevronUp, Users, FileDown, X,
  PenTool, Eraser, RotateCcw
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PDFFormFiller({ onComplete }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [activeTab, setActiveTab] = useState('single');
  const [expandedSections, setExpandedSections] = useState({});
  
  // للتوقيع الإلكتروني
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState(null);
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureColor, setSignatureColor] = useState('#000000');
  const [signatureWidth, setSignatureWidth] = useState(2);
  
  // للتعبئة الدفعية
  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // تهيئة التوقيع عند فتح الـ canvas
  useEffect(() => {
    if (isDrawingSignature && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isDrawingSignature]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('الرجاء اختيار ملف PDF');
      return;
    }

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({
        name: file.name,
        url: result.file_url,
        size: file.size
      });
      setFormFields([]);
      setFieldValues({});
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      alert('الرجاء اختيار ملف CSV أو Excel');
      return;
    }

    setIsUploading(true);
    try {
      // قراءة CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('الملف فارغ أو لا يحتوي على بيانات كافية');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvRows(rows);
      setCsvData({ headers, rows });
      
      // تهيئة الربط التلقائي
      const autoMapping = {};
      formFields.forEach(field => {
        const matchingHeader = headers.find(h => 
          h.toLowerCase().includes(field.label.toLowerCase()) ||
          field.label.toLowerCase().includes(h.toLowerCase()) ||
          h.toLowerCase() === field.id.toLowerCase()
        );
        if (matchingHeader) {
          autoMapping[field.id] = matchingHeader;
        }
      });
      setFieldMapping(autoMapping);

      alert(`تم تحميل ${rows.length} سجل من الملف`);
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('حدث خطأ أثناء قراءة الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const detectFormFields = async () => {
    if (!uploadedFile) return;

    setIsDetecting(true);
    try {
      const response = await base44.functions.invoke('detectPDFFormFields', {
        fileUrl: uploadedFile.url
      });

      if (response.data?.success) {
        const detectedFields = response.data.fields || [];
        setFormFields(detectedFields);
        
        // تهيئة القيم الافتراضية
        const initialValues = {};
        detectedFields.forEach(field => {
          if (field.type === 'checkbox') {
            initialValues[field.id] = false;
          } else if (field.type === 'signature') {
            initialValues[field.id] = null;
          } else {
            initialValues[field.id] = '';
          }
        });
        setFieldValues(initialValues);

        // توسيع كل الأقسام
        const sections = [...new Set(detectedFields.map(f => f.section))];
        const expanded = {};
        sections.forEach(s => expanded[s] = true);
        setExpandedSections(expanded);

        alert(`✅ ${response.data.message}`);
      } else {
        throw new Error(response.data?.error || 'فشل اكتشاف الحقول');
      }
    } catch (error) {
      console.error('Detection error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert('حدث خطأ أثناء تحليل النموذج: ' + errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // وظائف التوقيع
  const openSignatureDialog = (fieldId) => {
    setCurrentSignatureField(fieldId);
    setIsDrawingSignature(true);
  };

  const startDrawing = (e) => {
    if (!signatureCanvasRef.current) return;
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = signatureWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (!signatureCanvasRef.current || !currentSignatureField) return;
    const canvas = signatureCanvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    handleFieldChange(currentSignatureField, signatureData);
    setIsDrawingSignature(false);
    setCurrentSignatureField(null);
  };

  const handleFillForm = async () => {
    const missingRequired = formFields.filter(
      field => field.required && !fieldValues[field.id] && fieldValues[field.id] !== false
    );

    if (missingRequired.length > 0) {
      alert(`الرجاء تعبئة الحقول المطلوبة:\n${missingRequired.map(f => f.label).join('\n')}`);
      return;
    }

    setIsProcessing(true);
    try {
      // إزالة حقول التوقيع من البيانات المرسلة (سيتم معالجتها لاحقاً)
      const textFieldValues = {};
      Object.entries(fieldValues).forEach(([key, value]) => {
        const field = formFields.find(f => f.id === key);
        if (field?.type !== 'signature' && value !== null && value !== '') {
          textFieldValues[key] = value;
        }
      });

      const response = await base44.functions.invoke('fillPDFForm', {
        fileUrl: uploadedFile.url,
        fieldValues: textFieldValues
      });

      if (response.data?.success) {
        alert(`✅ ${response.data.message}`);
        
        if (onComplete) {
          onComplete({
            base64: response.data.pdfBase64,
            filename: `filled_${uploadedFile.name.replace('.pdf', '')}`,
            totalPages: 0,
            message: response.data.message
          });
        }
      } else {
        throw new Error(response.data?.error || 'فشل تعبئة النموذج');
      }
    } catch (error) {
      console.error('Fill error:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert('حدث خطأ أثناء تعبئة النموذج: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchFill = async () => {
    if (!csvRows.length) {
      alert('الرجاء تحميل ملف CSV/Excel أولاً');
      return;
    }

    const mappedFields = Object.keys(fieldMapping).filter(k => fieldMapping[k]);
    if (mappedFields.length === 0) {
      alert('الرجاء ربط حقل واحد على الأقل');
      return;
    }

    setIsBatchProcessing(true);
    setBatchProgress(0);

    try {
      const filledPdfs = [];
      
      for (let i = 0; i < csvRows.length; i++) {
        const row = csvRows[i];
        
        // بناء بيانات الحقول من السطر الحالي
        const rowFieldValues = {};
        Object.entries(fieldMapping).forEach(([fieldId, csvColumn]) => {
          if (csvColumn && row[csvColumn]) {
            rowFieldValues[fieldId] = row[csvColumn];
          }
        });

        // تعبئة النموذج لهذا السطر
        const response = await base44.functions.invoke('fillPDFForm', {
          fileUrl: uploadedFile.url,
          fieldValues: rowFieldValues
        });

        if (response.data?.success) {
          filledPdfs.push({
            base64: response.data.pdfBase64,
            filename: `form_${i + 1}_${uploadedFile.name}`
          });
        }

        setBatchProgress(Math.round(((i + 1) / csvRows.length) * 100));
      }

      alert(`✅ تم تعبئة ${filledPdfs.length} نموذج بنجاح!`);
      
      // يمكن دمج الملفات في ZIP أو تحميلها واحداً تلو الآخر
      if (onComplete && filledPdfs.length > 0) {
        onComplete({
          base64: filledPdfs[0].base64,
          filename: `batch_filled_${csvRows.length}_forms`,
          message: `تم تعبئة ${filledPdfs.length} نموذج`
        });
      }
    } catch (error) {
      console.error('Batch fill error:', error);
      alert('حدث خطأ أثناء التعبئة الدفعية: ' + error.message);
    } finally {
      setIsBatchProcessing(false);
      setBatchProgress(0);
    }
  };

  const getCompletionPercentage = () => {
    if (formFields.length === 0) return 0;
    const filledFields = formFields.filter(f => {
      const val = fieldValues[f.id];
      if (f.type === 'checkbox') return val === true;
      if (f.type === 'signature') return val !== null;
      return val !== '' && val !== undefined;
    }).length;
    return Math.round((filledFields / formFields.length) * 100);
  };

  const getSectionLabel = (section) => {
    const labels = {
      personal: 'البيانات الشخصية',
      contact: 'بيانات التواصل',
      work: 'بيانات العمل',
      agreements: 'الموافقات',
      signatures: 'التوقيعات',
      other: 'أخرى'
    };
    return labels[section] || section;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={fieldValues[field.id] || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm cursor-pointer">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-1">
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
            <Select 
              value={fieldValues[field.id] || ''} 
              onValueChange={(v) => handleFieldChange(field.id, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`اختر ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-1">
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
            <Textarea
              value={fieldValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`أدخل ${field.label}`}
              rows={3}
            />
          </div>
        );
      
      case 'date':
        return (
          <div className="space-y-1">
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={fieldValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFieldChange(field.id, new Date().toISOString().split('T')[0])}
                className="whitespace-nowrap"
                title="تاريخ اليوم"
              >
                اليوم
              </Button>
            </div>
          </div>
        );
      
      case 'signature':
        return (
          <div className="space-y-1">
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
            {fieldValues[field.id] ? (
              <div className="relative border-2 border-green-300 rounded-lg p-2 bg-green-50">
                <img 
                  src={fieldValues[field.id]} 
                  alt="التوقيع" 
                  className="h-16 mx-auto"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 left-1 h-6 w-6 p-0"
                  onClick={() => handleFieldChange(field.id, null)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <Badge className="absolute top-1 right-1 bg-green-600 text-xs">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  تم التوقيع
                </Badge>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition-colors"
                onClick={() => openSignatureDialog(field.id)}
              >
                <PenTool className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">انقر لإضافة التوقيع</span>
              </div>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-1">
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
            <Input
              type="number"
              value={fieldValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`أدخل ${field.label}`}
              step="0.01"
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-1">
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
            <Input
              type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
              value={fieldValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`أدخل ${field.label}`}
              dir={field.type === 'email' ? 'ltr' : 'rtl'}
            />
          </div>
        );
    }
  };

  const sections = [...new Set(formFields.map(f => f.section))];

  return (
    <div className="space-y-4">
      {/* رفع الملف */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-blue-600" />
            تعبئة نماذج PDF المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-form-upload"
                disabled={isUploading}
              />
              <label htmlFor="pdf-form-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
                ) : (
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                )}
                <p className="text-sm font-medium text-gray-700">
                  {uploadedFile ? uploadedFile.name : 'رفع نموذج PDF'}
                </p>
                <p className="text-xs text-gray-500 mt-1">انقر أو اسحب الملف</p>
              </label>
            </div>

            {uploadedFile && (
              <div className="flex flex-col gap-2">
                <Alert className="bg-green-50 border-green-200 py-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    تم رفع: <strong>{uploadedFile.name}</strong>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={detectFormFields}
                  disabled={isDetecting}
                  className="flex-1"
                >
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 ml-2" />
                  )}
                  اكتشاف حقول النموذج تلقائياً
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {formFields.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <Type className="w-4 h-4" />
              تعبئة فردية
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Users className="w-4 h-4" />
              تعبئة دفعية (CSV/Excel)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* حقول النموذج */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                      حقول النموذج ({formFields.length})
                    </div>
                    <Badge variant={getCompletionPercentage() === 100 ? "default" : "outline"}>
                      {getCompletionPercentage()}% مكتمل
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={getCompletionPercentage()} className="h-2" />

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {sections.map(section => (
                      <div key={section} className="border rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          onClick={() => toggleSection(section)}
                        >
                          <span className="font-medium text-sm">{getSectionLabel(section)}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {formFields.filter(f => f.section === section).length} حقل
                            </Badge>
                            {expandedSections[section] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        
                        {expandedSections[section] && (
                          <div className="p-3 space-y-3 border-t">
                            {formFields.filter(f => f.section === section).map(field => (
                              <div key={field.id}>
                                {renderField(field)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={handleFillForm}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 ml-2" />
                      )}
                      تعبئة وتحميل
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const resetValues = {};
                        formFields.forEach(f => {
                          resetValues[f.id] = f.type === 'checkbox' ? false : f.type === 'signature' ? null : '';
                        });
                        setFieldValues(resetValues);
                      }}
                    >
                      <Eraser className="w-4 h-4 ml-1" />
                      مسح
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* معاينة PDF */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    معاينة النموذج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={uploadedFile?.url}
                      className="w-full h-[500px]"
                      title="PDF Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="mt-4 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                قم بتحميل ملف CSV أو Excel يحتوي على البيانات لتعبئة نماذج متعددة دفعة واحدة.
                تأكد من أن الصف الأول يحتوي على أسماء الأعمدة.
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">
                      {csvData ? `${csvRows.length} سجل` : 'رفع ملف CSV أو Excel'}
                    </p>
                  </label>
                </div>

                {csvData && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">ربط الأعمدة بحقول النموذج:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                        {formFields.filter(f => f.type !== 'signature' && f.type !== 'checkbox').map(field => (
                          <div key={field.id} className="flex items-center gap-2">
                            <Label className="w-32 text-xs truncate">{field.label}</Label>
                            <Select
                              value={fieldMapping[field.id] || ''}
                              onValueChange={(v) => setFieldMapping(prev => ({ ...prev, [field.id]: v }))}
                            >
                              <SelectTrigger className="flex-1 h-8 text-xs">
                                <SelectValue placeholder="اختر عمود" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={null}>-- لا شيء --</SelectItem>
                                {csvHeaders.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-2 text-sm font-medium border-b">
                        معاينة البيانات (أول 5 سجلات)
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {csvHeaders.slice(0, 5).map(header => (
                                <TableHead key={header} className="text-xs">{header}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvRows.slice(0, 5).map((row, i) => (
                              <TableRow key={i}>
                                {csvHeaders.slice(0, 5).map(header => (
                                  <TableCell key={header} className="text-xs">{row[header]}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {isBatchProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>جاري التعبئة...</span>
                          <span>{batchProgress}%</span>
                        </div>
                        <Progress value={batchProgress} />
                      </div>
                    )}

                    <Button
                      onClick={handleBatchFill}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isBatchProcessing || Object.keys(fieldMapping).filter(k => fieldMapping[k]).length === 0}
                    >
                      {isBatchProcessing ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 ml-2" />
                      )}
                      تعبئة {csvRows.length} نموذج دفعة واحدة
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!formFields.length && uploadedFile && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">لم يتم اكتشاف حقول بعد</p>
            <p className="text-sm">اضغط على "اكتشاف حقول النموذج تلقائياً" لتحليل النموذج</p>
          </CardContent>
        </Card>
      )}

      {/* نافذة التوقيع */}
      {isDrawingSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                التوقيع الإلكتروني
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsDrawingSignature(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-center">
                <Label className="text-xs">لون التوقيع:</Label>
                <input
                  type="color"
                  value={signatureColor}
                  onChange={(e) => setSignatureColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <Label className="text-xs mr-4">سمك الخط:</Label>
                <Input
                  type="number"
                  value={signatureWidth}
                  onChange={(e) => setSignatureWidth(parseInt(e.target.value) || 2)}
                  className="w-16 h-8"
                  min={1}
                  max={10}
                />
              </div>
              
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={signatureCanvasRef}
                  width={450}
                  height={200}
                  className="w-full cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                ارسم توقيعك باستخدام الماوس أو شاشة اللمس
              </p>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSignature} className="flex-1">
                  <RotateCcw className="w-4 h-4 ml-1" />
                  مسح
                </Button>
                <Button onClick={saveSignature} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 ml-1" />
                  حفظ التوقيع
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}