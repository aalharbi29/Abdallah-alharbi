import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, AlertCircle, Loader2, Upload, RefreshCw, 
  FileSpreadsheet, Database, Search, Check, X, Eye,
  Building2, Users, FileText, Sparkles, ArrowRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function BulkUpdateCenterData() {
  const [entityType, setEntityType] = useState('HealthCenter');
  const [existingRecords, setExistingRecords] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // رفع الملف واستخراج البيانات
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  
  // المطابقة والتحديث
  const [matchResults, setMatchResults] = useState([]);
  const [selectedFields, setSelectedFields] = useState({});
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  
  // التنفيذ
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateResults, setUpdateResults] = useState([]);
  
  // البحث والفلترة
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // معاينة التفاصيل
  const [previewRecord, setPreviewRecord] = useState(null);

  const entityConfig = {
    HealthCenter: {
      name: 'المراكز الصحية',
      icon: Building2,
      matchFields: ['اسم_المركز', 'center_code'],
      displayField: 'اسم_المركز',
      schema: {
        اسم_المركز: { type: 'string', label: 'اسم المركز' },
        center_code: { type: 'string', label: 'كود المركز' },
        organization_code: { type: 'string', label: 'الرقم الوزاري' },
        رقم_الشريحة: { type: 'string', label: 'رقم الشريحة' },
        رقم_الجوال: { type: 'string', label: 'رقم الجوال' },
        هاتف_المركز: { type: 'string', label: 'هاتف المركز' },
        ايميل_المركز: { type: 'string', label: 'البريد الإلكتروني' },
        معتمد_سباهي: { type: 'boolean', label: 'معتمد سباهي' },
        تاريخ_اعتماد_سباهي: { type: 'string', label: 'تاريخ اعتماد سباهي' },
        مركز_نائي: { type: 'boolean', label: 'مركز نائي' },
        بدل_نأي: { type: 'number', label: 'بدل النأي' },
        قيمة_عقد_الايجار: { type: 'number', label: 'قيمة عقد الإيجار' },
        رقم_العقد: { type: 'string', label: 'رقم العقد' },
        تاريخ_بداية_العقد: { type: 'string', label: 'تاريخ بداية العقد' },
        تاريخ_انتهاء_العقد: { type: 'string', label: 'تاريخ انتهاء العقد' },
        اسم_المؤجر: { type: 'string', label: 'اسم المؤجر' },
        هاتف_المؤجر: { type: 'string', label: 'هاتف المؤجر' },
        الموقع: { type: 'string', label: 'الموقع' },
        خط_الطول: { type: 'string', label: 'خط الطول' },
        خط_العرض: { type: 'string', label: 'خط العرض' },
      }
    },
    Employee: {
      name: 'الموظفين',
      icon: Users,
      matchFields: ['رقم_الموظف', 'رقم_الهوية', 'full_name_arabic'],
      displayField: 'full_name_arabic',
      schema: {
        full_name_arabic: { type: 'string', label: 'الاسم الكامل' },
        رقم_الموظف: { type: 'string', label: 'رقم الموظف' },
        رقم_الهوية: { type: 'string', label: 'رقم الهوية' },
        المركز_الصحي: { type: 'string', label: 'المركز الصحي' },
        position: { type: 'string', label: 'التخصص' },
        department: { type: 'string', label: 'القسم' },
        phone: { type: 'string', label: 'رقم الهاتف' },
        email: { type: 'string', label: 'البريد الإلكتروني' },
        qualification: { type: 'string', label: 'المؤهل' },
        rank: { type: 'string', label: 'المرتبة' },
        sequence: { type: 'string', label: 'التسلسل' },
        hire_date: { type: 'string', label: 'تاريخ التوظيف' },
        contract_type: { type: 'string', label: 'نوع العقد' },
        contract_end_date: { type: 'string', label: 'تاريخ انتهاء العقد' },
        nationality: { type: 'string', label: 'الجنسية' },
        gender: { type: 'string', label: 'الجنس' },
      }
    }
  };

  useEffect(() => {
    loadExistingRecords();
  }, [entityType]);

  const loadExistingRecords = async () => {
    setIsFetching(true);
    try {
      const config = entityConfig[entityType];
      const records = await base44.entities[entityType].list(`-${config.displayField}`, 1000);
      setExistingRecords(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error('Error loading records:', error);
      alert('فشل تحميل البيانات');
    } finally {
      setIsFetching(false);
    }
  };

  const normalizeText = (text) => {
    if (!text) return '';
    return String(text).trim()
      .replace(/\s+/g, ' ')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'csv', 'png', 'jpg', 'jpeg', 'xlsx', 'xls'].includes(ext)) {
      alert('نوع الملف غير مدعوم. الأنواع المدعومة: PDF, CSV, صور, Excel');
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ file_url, file_name: file.name });
      setExtractedData([]);
      setMatchResults([]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('فشل رفع الملف');
    }
  };

  const handleExtractData = async () => {
    if (!uploadedFile) return;

    setIsExtracting(true);
    try {
      const config = entityConfig[entityType];
      const schemaProperties = {};
      Object.entries(config.schema).forEach(([key, val]) => {
        schemaProperties[key] = { type: val.type === 'boolean' ? 'boolean' : 'string' };
      });

      const fileExt = uploadedFile.file_name.toLowerCase().split('.').pop();
      const isExcelFile = ['xlsx', 'xls'].includes(fileExt);
      
      let response;
      
      if (isExcelFile) {
        // استخدام InvokeLLM لملفات Excel
        const fieldsList = Object.entries(config.schema)
          .map(([key, val]) => `${key} (${val.label})`)
          .join(', ');
        
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `قم باستخراج جميع البيانات من ملف Excel المرفق. 
استخرج البيانات التالية لكل سجل: ${fieldsList}.
أعد البيانات كمصفوفة من الكائنات.
تأكد من استخراج جميع الصفوف الموجودة في الملف.`,
          file_urls: [uploadedFile.file_url],
          response_json_schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "object", properties: schemaProperties },
                description: `بيانات ${config.name} المستخرجة من الملف`
              }
            }
          }
        });
        
        if (response && response.data) {
          let extracted = response.data;
          if (!Array.isArray(extracted)) extracted = [extracted];
          setExtractedData(extracted);
          await matchRecords(extracted);
        } else {
          alert('فشل استخراج البيانات من ملف Excel');
        }
      } else {
        // استخدام ExtractDataFromUploadedFile للملفات الأخرى
        response = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: uploadedFile.file_url,
          json_schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "object", properties: schemaProperties },
                description: `استخرج جميع بيانات ${config.name} من الملف`
              }
            }
          }
        });

        if (response.status === 'success' && response.output) {
          let extracted = response.output.data || response.output;
          if (!Array.isArray(extracted)) extracted = [extracted];
          
          setExtractedData(extracted);
          await matchRecords(extracted);
        } else {
          alert('فشل استخراج البيانات: ' + (response.details || 'خطأ غير معروف'));
        }
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert('حدث خطأ أثناء استخراج البيانات: ' + error.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const matchRecords = async (extracted) => {
    const config = entityConfig[entityType];
    const results = [];

    for (const record of extracted) {
      let bestMatch = null;
      let bestScore = 0;

      for (const existing of existingRecords) {
        let score = 0;
        
        for (const field of config.matchFields) {
          if (record[field] && existing[field]) {
            const recVal = normalizeText(record[field]);
            const exVal = normalizeText(existing[field]);
            
            if (recVal === exVal) {
              score += 100;
            } else if (recVal.includes(exVal) || exVal.includes(recVal)) {
              score += 50;
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = existing;
        }
      }

      // تحديد الحقول الجديدة والمختلفة
      const newFields = [];
      const changedFields = [];
      
      if (bestMatch) {
        Object.entries(record).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return;
          
          const existingValue = bestMatch[key];
          if (!existingValue || existingValue === '') {
            newFields.push({ field: key, value, label: config.schema[key]?.label || key });
          } else if (String(existingValue) !== String(value)) {
            changedFields.push({ 
              field: key, 
              oldValue: existingValue, 
              newValue: value,
              label: config.schema[key]?.label || key 
            });
          }
        });
      }

      results.push({
        extracted: record,
        matched: bestMatch,
        score: bestScore,
        status: bestMatch && bestScore >= 50 ? 'matched' : 'new',
        newFields,
        changedFields
      });
    }

    setMatchResults(results);
    
    // تحديد السجلات التي بها حقول جديدة تلقائياً
    const autoSelected = new Set();
    const autoFields = {};
    
    results.forEach((r, idx) => {
      if (r.status === 'matched' && r.newFields.length > 0) {
        autoSelected.add(idx);
        autoFields[idx] = r.newFields.map(f => f.field);
      }
    });
    
    setSelectedRecords(autoSelected);
    setSelectedFields(autoFields);
  };

  const toggleRecordSelection = (index) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleFieldSelection = (recordIndex, fieldKey) => {
    setSelectedFields(prev => {
      const current = prev[recordIndex] || [];
      const updated = current.includes(fieldKey)
        ? current.filter(f => f !== fieldKey)
        : [...current, fieldKey];
      return { ...prev, [recordIndex]: updated };
    });
  };

  const selectAllFields = (recordIndex, fields) => {
    setSelectedFields(prev => ({
      ...prev,
      [recordIndex]: fields.map(f => f.field)
    }));
  };

  const handleBulkUpdate = async () => {
    if (selectedRecords.size === 0) {
      alert('الرجاء اختيار سجلات للتحديث');
      return;
    }

    const confirmed = confirm(`سيتم تحديث ${selectedRecords.size} سجل. هل تريد المتابعة؟`);
    if (!confirmed) return;

    setIsUpdating(true);
    setUpdateProgress(0);
    setUpdateResults([]);

    const results = [];
    const selected = Array.from(selectedRecords);
    const total = selected.length;

    for (let i = 0; i < selected.length; i++) {
      const idx = selected[i];
      const item = matchResults[idx];
      const fieldsToUpdate = selectedFields[idx] || [];

      if (item.status === 'matched' && item.matched?.id && fieldsToUpdate.length > 0) {
        try {
          const updateData = {};
          fieldsToUpdate.forEach(fieldKey => {
            const newField = item.newFields.find(f => f.field === fieldKey);
            const changedField = item.changedFields.find(f => f.field === fieldKey);
            if (newField) updateData[fieldKey] = newField.value;
            if (changedField) updateData[fieldKey] = changedField.newValue;
          });

          await base44.entities[entityType].update(item.matched.id, updateData);
          
          const config = entityConfig[entityType];
          results.push({
            name: item.matched[config.displayField] || `سجل ${idx + 1}`,
            status: 'success',
            fieldsCount: fieldsToUpdate.length,
            message: `تم تحديث ${fieldsToUpdate.length} حقل`
          });
        } catch (error) {
          results.push({
            name: `سجل ${idx + 1}`,
            status: 'error',
            message: error.message
          });
        }
      }

      setUpdateProgress(((i + 1) / total) * 100);
      setUpdateResults([...results]);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsUpdating(false);
    alert(`تم الانتهاء! نجح: ${results.filter(r => r.status === 'success').length}, فشل: ${results.filter(r => r.status === 'error').length}`);
  };

  const filteredResults = useMemo(() => {
    let filtered = matchResults;
    
    if (searchQuery) {
      const query = normalizeText(searchQuery);
      filtered = filtered.filter(r => {
        const config = entityConfig[entityType];
        const displayValue = r.matched?.[config.displayField] || r.extracted?.[config.displayField] || '';
        return normalizeText(displayValue).includes(query);
      });
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => {
        if (filterStatus === 'matched') return r.status === 'matched';
        if (filterStatus === 'new') return r.status === 'new';
        if (filterStatus === 'hasUpdates') return r.newFields.length > 0 || r.changedFields.length > 0;
        return true;
      });
    }
    
    return filtered;
  }, [matchResults, searchQuery, filterStatus, entityType]);

  const config = entityConfig[entityType];
  const Icon = config.icon;

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">تحديث البيانات الجماعي</h1>
          <p className="text-gray-600">رفع ملف واستخراج البيانات لتحديث السجلات الموجودة</p>
        </div>

        {/* Entity Type Selection */}
        <div className="flex justify-center gap-4">
          <Button
            variant={entityType === 'HealthCenter' ? 'default' : 'outline'}
            onClick={() => setEntityType('HealthCenter')}
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            المراكز الصحية
          </Button>
          <Button
            variant={entityType === 'Employee' ? 'default' : 'outline'}
            onClick={() => setEntityType('Employee')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            الموظفين
          </Button>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              1. رفع الملف
            </TabsTrigger>
            <TabsTrigger value="match" className="gap-2" disabled={matchResults.length === 0}>
              <Search className="w-4 h-4" />
              2. المطابقة ({matchResults.length})
            </TabsTrigger>
            <TabsTrigger value="update" className="gap-2" disabled={selectedRecords.size === 0}>
              <RefreshCw className="w-4 h-4" />
              3. التحديث ({selectedRecords.size})
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Upload */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  رفع ملف البيانات
                </CardTitle>
                <CardDescription>
                  ارفع ملف PDF أو Excel أو CSV يحتوي على البيانات المراد تحديثها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700">اضغط لرفع ملف</p>
                    <p className="text-sm text-gray-500 mt-1">PDF, Excel, CSV, أو صور</p>
                  </label>
                </div>

                {uploadedFile && (
                  <Alert className="bg-green-50 border-green-200">
                    <FileText className="h-4 w-4 text-green-600" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>تم رفع: <strong>{uploadedFile.file_name}</strong></span>
                      <Button
                        size="sm"
                        onClick={handleExtractData}
                        disabled={isExtracting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الاستخراج...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 ml-2" />
                            استخراج البيانات
                          </>
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <p className="font-medium mb-1">البيانات الحالية:</p>
                    <p>يوجد <strong>{existingRecords.length}</strong> سجل في {config.name}</p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Match */}
          <TabsContent value="match" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل ({matchResults.length})</SelectItem>
                  <SelectItem value="matched">تم المطابقة ({matchResults.filter(r => r.status === 'matched').length})</SelectItem>
                  <SelectItem value="hasUpdates">بها تحديثات ({matchResults.filter(r => r.newFields.length > 0).length})</SelectItem>
                  <SelectItem value="new">جديد ({matchResults.filter(r => r.status === 'new').length})</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary">{selectedRecords.size} محدد</Badge>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {filteredResults.map((item, index) => {
                const actualIndex = matchResults.indexOf(item);
                const isSelected = selectedRecords.has(actualIndex);
                const recordFields = selectedFields[actualIndex] || [];
                const allFields = [...item.newFields, ...item.changedFields];
                
                return (
                  <Card key={actualIndex} className={isSelected ? 'ring-2 ring-blue-400' : ''}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRecordSelection(actualIndex)}
                          disabled={item.status !== 'matched' || allFields.length === 0}
                        />
                        
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>#{actualIndex + 1}</Badge>
                            {item.status === 'matched' ? (
                              <Badge className="bg-green-600">
                                <Check className="w-3 h-3 ml-1" />
                                مطابق
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">
                                <AlertCircle className="w-3 h-3 ml-1" />
                                جديد
                              </Badge>
                            )}
                            {item.score > 0 && <Badge variant="outline">{item.score}%</Badge>}
                            {item.newFields.length > 0 && (
                              <Badge className="bg-blue-600">{item.newFields.length} حقل جديد</Badge>
                            )}
                            {item.changedFields.length > 0 && (
                              <Badge className="bg-orange-600">{item.changedFields.length} حقل مختلف</Badge>
                            )}
                          </div>

                          {/* Display Name */}
                          <div className="font-medium text-lg mb-3">
                            {item.matched?.[config.displayField] || item.extracted?.[config.displayField] || 'بدون اسم'}
                          </div>

                          {/* Fields Selection */}
                          {item.status === 'matched' && allFields.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="text-sm font-medium">اختر الحقول للتحديث:</Label>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => selectAllFields(actualIndex, allFields)}
                                  className="text-xs h-6"
                                >
                                  تحديد الكل
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
                                {item.newFields.map((field, fIdx) => (
                                  <div key={`new-${fIdx}`} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={recordFields.includes(field.field)}
                                      onCheckedChange={() => toggleFieldSelection(actualIndex, field.field)}
                                      id={`field-${actualIndex}-${field.field}`}
                                    />
                                    <label 
                                      htmlFor={`field-${actualIndex}-${field.field}`}
                                      className="flex-1 cursor-pointer text-sm"
                                    >
                                      <span className="font-medium text-green-700">{field.label}:</span>
                                      <span className="mr-2 text-gray-600">{String(field.value).substring(0, 50)}</span>
                                    </label>
                                  </div>
                                ))}
                                
                                {item.changedFields.map((field, fIdx) => (
                                  <div key={`changed-${fIdx}`} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={recordFields.includes(field.field)}
                                      onCheckedChange={() => toggleFieldSelection(actualIndex, field.field)}
                                      id={`field-${actualIndex}-${field.field}`}
                                    />
                                    <label 
                                      htmlFor={`field-${actualIndex}-${field.field}`}
                                      className="flex-1 cursor-pointer text-sm"
                                    >
                                      <span className="font-medium text-orange-700">{field.label}:</span>
                                      <span className="mr-2 text-gray-400 line-through">{String(field.oldValue).substring(0, 20)}</span>
                                      <ArrowRight className="w-3 h-3 inline mx-1" />
                                      <span className="text-gray-800">{String(field.newValue).substring(0, 30)}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.status === 'matched' && allFields.length === 0 && (
                            <Alert className="bg-gray-50">
                              <AlertDescription className="text-gray-600">
                                لا توجد حقول جديدة أو مختلفة للتحديث
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewRecord(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredResults.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">لا توجد نتائج</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Update */}
          <TabsContent value="update" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تنفيذ التحديث</CardTitle>
                <CardDescription>
                  مراجعة وتنفيذ التحديثات على السجلات المحددة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <div className="font-medium mb-2">ملخص التحديثات:</div>
                    <ul className="text-sm space-y-1">
                      <li>• عدد السجلات المحددة: <strong>{selectedRecords.size}</strong></li>
                      <li>• إجمالي الحقول للتحديث: <strong>
                        {Array.from(selectedRecords).reduce((sum, idx) => sum + (selectedFields[idx]?.length || 0), 0)}
                      </strong></li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {isUpdating && (
                  <div className="space-y-2">
                    <Progress value={updateProgress} />
                    <p className="text-sm text-center">{Math.round(updateProgress)}%</p>
                  </div>
                )}

                {updateResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {updateResults.map((result, idx) => (
                      <Alert
                        key={idx}
                        className={result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                      >
                        {result.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          <span className="font-medium">{result.name}</span>: {result.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleBulkUpdate}
                  disabled={selectedRecords.size === 0 || isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 ml-2" />
                      تحديث {selectedRecords.size} سجل
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewRecord} onOpenChange={() => setPreviewRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل السجل</DialogTitle>
          </DialogHeader>
          {previewRecord && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">البيانات المستخرجة:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(previewRecord.extracted, null, 2)}
                </pre>
              </div>
              {previewRecord.matched && (
                <div>
                  <h4 className="font-medium mb-2">السجل الموجود:</h4>
                  <pre className="bg-blue-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(previewRecord.matched, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewRecord(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}