import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, CheckCircle, XCircle, 
  Loader2, FileText, Sparkles, AlertCircle,
  RefreshCw, Plus, AlertTriangle, CheckCheck, XOctagon,
  Brain, Zap, Search, Link
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import PDFViewer from '../components/files/PDFViewer';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DataExtractor() {
  const [archivedFiles, setArchivedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [entityType, setEntityType] = useState('Employee');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [extractionStatus, setExtractionStatus] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [existingEmployees, setExistingEmployees] = useState([]);
  const [existingCenters, setExistingCenters] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualMatchDialog, setManualMatchDialog] = useState({ open: false, index: null });
  const [manualSearchQuery, setManualSearchQuery] = useState('');

  useEffect(() => {
    loadArchivedFiles();
    loadExistingData();
  }, []);

  const loadArchivedFiles = async () => {
    try {
      const files = await base44.entities.ArchivedFile.list('-created_date', 500);
      setArchivedFiles(Array.isArray(files) ? files : []);
    } catch (error) {
      console.error('Error loading archived files:', error);
    }
  };

  const loadExistingData = async () => {
    try {
      const [emps, centers] = await Promise.all([
        base44.entities.Employee.list('-full_name_arabic', 1000),
        base44.entities.HealthCenter.list('-اسم_المركز', 500)
      ]);
      
      setExistingEmployees(Array.isArray(emps) ? emps : []);
      setExistingCenters(Array.isArray(centers) ? centers : []);
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const filteredArchive = useMemo(() => {
    if (!searchQuery) return archivedFiles;
    const query = searchQuery.toLowerCase();
    return archivedFiles.filter(file => 
      file.title?.toLowerCase().includes(query) ||
      file.description?.toLowerCase().includes(query) ||
      file.file_name?.toLowerCase().includes(query)
    );
  }, [archivedFiles, searchQuery]);

  const isSupportedFileType = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.toLowerCase().split('.').pop();
    return ['pdf', 'csv', 'png', 'jpg', 'jpeg'].includes(ext);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedFileType(file.name)) {
      alert('نوع الملف غير مدعوم');
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ file_url, file_name: file.name });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('فشل رفع الملف');
    }
  };

  const analyzeAndMatch = async (extractedRecords) => {
    setIsAnalyzing(true);
    const results = [];

    try {
      for (const record of extractedRecords) {
        let matchStatus = 'new';
        let matchedRecord = null;
        let suggestions = [];
        let confidence = 0;
        let newFields = [];
        let existingFields = [];

        if (entityType === 'Employee') {
          // تحسين خوارزمية المطابقة - البحث المتعدد المراحل
          let bestMatch = null;
          let bestScore = 0;

          for (const emp of existingEmployees) {
            let score = 0;
            
            // مطابقة رقم الموظف (أقوى معيار)
            if (record.رقم_الموظف && emp.رقم_الموظف) {
              const recNum = String(record.رقم_الموظف).trim();
              const empNum = String(emp.رقم_الموظف).trim();
              if (recNum === empNum) score += 100;
            }
            
            // مطابقة رقم الهوية (معيار قوي جداً)
            if (record.رقم_الهوية && emp.رقم_الهوية) {
              const recId = String(record.رقم_الهوية).trim();
              const empId = String(emp.رقم_الهوية).trim();
              if (recId === empId) score += 100;
            }
            
            // مطابقة الاسم الكامل (مع تطبيع النص)
            if (record.full_name_arabic && emp.full_name_arabic) {
              const normalize = (str) => str.trim().toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[أإآ]/g, 'ا')
                .replace(/ة/g, 'ه')
                .replace(/ى/g, 'ي');
              
              const recName = normalize(record.full_name_arabic);
              const empName = normalize(emp.full_name_arabic);
              
              if (recName === empName) {
                score += 80;
              } else if (recName.includes(empName) || empName.includes(recName)) {
                score += 50;
              } else {
                // مطابقة جزئية - أول 3 كلمات
                const recWords = recName.split(' ').slice(0, 3);
                const empWords = empName.split(' ').slice(0, 3);
                const matchingWords = recWords.filter(w => empWords.includes(w)).length;
                if (matchingWords >= 2) score += 40;
              }
            }
            
            // مطابقة المركز الصحي (معيار إضافي)
            if (record.المركز_الصحي && emp.المركز_الصحي) {
              const normalize = (str) => str.trim().toLowerCase().replace(/مركز صحي|مركز/g, '').trim();
              if (normalize(record.المركز_الصحي) === normalize(emp.المركز_الصحي)) {
                score += 20;
              }
            }
            
            if (score > bestScore) {
              bestScore = score;
              bestMatch = emp;
            }
          }

          // اعتبار المطابقة ناجحة إذا كانت النتيجة >= 50
          if (bestMatch && bestScore >= 50) {
            matchedRecord = bestMatch;
            confidence = Math.min(100, bestScore);
            matchStatus = 'existing';
            
            Object.keys(record).forEach(key => {
              const recordValue = record[key];
              if (recordValue !== undefined && recordValue !== null && recordValue !== '') {
                if (!matchedRecord[key] || matchedRecord[key] === '') {
                  newFields.push({ field: key, value: recordValue });
                } else if (matchedRecord[key] !== recordValue) {
                  existingFields.push({ field: key, oldValue: matchedRecord[key], newValue: recordValue });
                }
              }
            });
            
            if (newFields.length > 0 || existingFields.length > 0) {
              if (newFields.length > 0) {
                suggestions.push({
                  action: 'add_fields',
                  message: 'إضافة ' + newFields.length + ' حقل جديد فقط',
                  newFields,
                  existingFields
                });
              }
              
              if (existingFields.length > 0) {
                suggestions.push({
                  action: 'update_fields',
                  message: 'تحديث ' + existingFields.length + ' حقل موجود' + (newFields.length > 0 ? ' + إضافة ' + newFields.length + ' حقل جديد' : ''),
                  newFields,
                  existingFields
                });
              }
            }
            
            if (newFields.length === 0 && existingFields.length === 0) {
              matchStatus = 'duplicate';
              suggestions.push({ action: 'skip', message: 'مطابق تماماً - لا تغييرات' });
            }
          } else {
            matchStatus = 'new';
            suggestions.push({ action: 'create', message: 'إضافة موظف جديد' });
          }

        } else if (entityType === 'HealthCenter') {
          const matches = existingCenters.filter(center => {
            if (!center.اسم_المركز || !record.اسم_المركز) return false;
            const centerName = center.اسم_المركز.trim().toLowerCase().replace(/مركز صحي/g, '').trim();
            const recordName = record.اسم_المركز.trim().toLowerCase().replace(/مركز صحي/g, '').trim();
            return centerName === recordName || (record.center_code && center.center_code === record.center_code);
          });

          if (matches.length > 0) {
            matchedRecord = matches[0];
            matchStatus = 'existing';
            confidence = 90;

            Object.keys(record).forEach(key => {
              const recordValue = record[key];
              if (recordValue === undefined || recordValue === null || recordValue === '') return;
              
              if (Array.isArray(recordValue)) {
                const matchedValue = matchedRecord[key];
                if (!matchedValue || matchedValue.length === 0) {
                  newFields.push({ field: key, value: recordValue, isArray: true, count: recordValue.length });
                } else {
                  const newItems = recordValue.filter(item => {
                    if (typeof item === 'string') return !matchedValue.includes(item);
                    if (item.اسم_العيادة) return !matchedValue.some(ex => ex.اسم_العيادة === item.اسم_العيادة);
                    return false;
                  });
                  
                  if (newItems.length > 0) {
                    newFields.push({ field: key, value: newItems, isArray: true, count: newItems.length, mergeMode: true });
                  }
                }
              } else {
                if (!matchedRecord[key] || matchedRecord[key] === '') {
                  newFields.push({ field: key, value: recordValue });
                } else if (matchedRecord[key] !== recordValue) {
                  existingFields.push({ field: key, oldValue: matchedRecord[key], newValue: recordValue });
                }
              }
            });

            if (newFields.length > 0 || existingFields.length > 0) {
              if (newFields.length > 0) {
                const arrayFields = newFields.filter(f => f.isArray);
                const arrayInfo = arrayFields.length > 0 ? ' (' + arrayFields.map(f => f.count + ' ' + f.field).join(', ') + ')' : '';
                suggestions.push({
                  action: 'add_fields',
                  message: 'إضافة ' + newFields.length + ' حقل' + arrayInfo,
                  newFields,
                  existingFields
                });
              }
              
              if (existingFields.length > 0) {
                suggestions.push({
                  action: 'update_fields',
                  message: 'تحديث ' + existingFields.length + ' حقل موجود' + (newFields.length > 0 ? ' + إضافة ' + newFields.length + ' جديد' : ''),
                  newFields,
                  existingFields
                });
              }
            }
            
            if (newFields.length === 0 && existingFields.length === 0) {
              matchStatus = 'duplicate';
              suggestions.push({ action: 'skip', message: 'مطابق تماماً - لا تغييرات' });
            }
          } else {
            matchStatus = 'new';
            suggestions.push({ action: 'create', message: 'إضافة مركز جديد' });
          }
        }

        suggestions.push({ action: 'skip', message: 'تجاهل' });

        results.push({
          record,
          matchStatus,
          matchedRecord,
          suggestions,
          confidence,
          newFields,
          existingFields,
          selectedAction: suggestions[0]?.action || 'create'
        });
      }

      setMatchResults(results);
      const defaultSelected = new Set(
        results.map((r, idx) => (r.matchStatus === 'new' || r.newFields?.length > 0) ? idx : null).filter(idx => idx !== null)
      );
      setSelectedRecords(defaultSelected);
      
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExtractData = async () => {
    const fileToExtract = uploadedFile || selectedFile;
    if (!fileToExtract) {
      alert('الرجاء اختيار ملف');
      return;
    }

    setIsExtracting(true);
    setExtractionStatus(null);
    setExtractedData([]);
    setMatchResults([]);

    try {
      const entitySchema = {
        Employee: {
          type: "object",
          properties: {
            full_name_arabic: { type: "string" },
            رقم_الموظف: { type: "string" },
            رقم_الهوية: { type: "string" },
            المركز_الصحي: { type: "string" },
            position: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" }
          }
        },
        HealthCenter: {
          type: "object",
          properties: {
            اسم_المركز: { type: "string" },
            center_code: { type: "string" },
            رقم_الشريحة: { type: "string" },
            رقم_الجوال: { type: "string" },
            معتمد_سباهي: { type: "boolean" },
            تاريخ_اعتماد_سباهي: { type: "string" },
            قيمة_عقد_الايجار: { type: "number" },
            رقم_العقد: { type: "string" },
            تاريخ_بداية_العقد: { type: "string" },
            تاريخ_انتهاء_العقد: { type: "string" },
            اسم_المؤجر: { type: "string" },
            هاتف_المؤجر: { type: "string" },
            العيادات_المتوفرة: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  اسم_العيادة: { type: "string" }
                }
              }
            },
            الخدمات_المقدمة: { type: "array", items: { type: "string" } }
          }
        }
      };

      const schema = entitySchema[entityType];
      
      const entityName = entityType === 'Employee' ? 'الموظفين' : 'المراكز الصحية';
      
      // تعليمات مفصلة لتحسين الاستخراج
      const extractionInstructions = entityType === 'Employee' 
        ? `استخرج جميع بيانات الموظفين من هذا الملف. ابحث عن:
           - الأسماء العربية الكاملة (الاسم الرباعي أو الثلاثي)
           - أرقام الموظفين (عادة أرقام من 5-10 خانات)
           - أرقام الهوية الوطنية (10 خانات تبدأ بـ 1 أو 2)
           - أسماء المراكز الصحية
           - التخصصات والوظائف (طبيب، ممرض، فني، إداري، إلخ)
           - أرقام الجوال (تبدأ بـ 05)
           - البريد الإلكتروني
           استخرج كل صف أو سجل كعنصر منفصل في المصفوفة.
           ${customInstructions ? 'تعليمات إضافية: ' + customInstructions : ''}`
        : `استخرج جميع بيانات المراكز الصحية من هذا الملف. ابحث عن:
           - أسماء المراكز الصحية
           - أكواد المراكز أو الأرقام التعريفية
           - أرقام الشرائح (SIM) - عادة أرقام طويلة
           - أرقام الجوال والهواتف
           - بيانات الإيجار والعقود
           - حالة اعتماد سباهي
           - العيادات والخدمات المتوفرة
           - المواقع والإحداثيات
           استخرج كل مركز كعنصر منفصل في المصفوفة.
           ${customInstructions ? 'تعليمات إضافية: ' + customInstructions : ''}`;

      const response = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileToExtract.file_url,
        json_schema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: schema,
              description: extractionInstructions
            }
          }
        }
      });

      if (response.status === 'success' && response.output) {
        let extractedArray = [];
        
        if (response.output.data && Array.isArray(response.output.data)) {
          extractedArray = response.output.data;
        } else if (Array.isArray(response.output)) {
          extractedArray = response.output;
        } else if (typeof response.output === 'object') {
          // إذا كان الناتج كائن واحد وليس مصفوفة
          extractedArray = [response.output];
        }
        
        // تنظيف البيانات المستخرجة - إزالة السجلات الفارغة
        extractedArray = extractedArray.filter(item => {
          if (!item || typeof item !== 'object') return false;
          const values = Object.values(item).filter(v => v !== null && v !== undefined && v !== '');
          return values.length > 0;
        });
        
        if (extractedArray.length > 0) {
          setExtractedData(extractedArray);
          setExtractionStatus({ type: 'success', message: 'تم استخراج ' + extractedArray.length + ' سجل' });
          await analyzeAndMatch(extractedArray);
        } else {
          setExtractionStatus({ 
            type: 'error', 
            message: 'لم يتم العثور على بيانات. جرب إضافة تعليمات توضيحية أو استخدم ملف بصيغة أخرى.' 
          });
        }
      } else {
        setExtractionStatus({ 
          type: 'error', 
          message: response.details || 'فشل الاستخراج. تأكد من وضوح الملف وجرب مرة أخرى.' 
        });
      }
    } catch (error) {
      setExtractionStatus({ type: 'error', message: error.message });
    } finally {
      setIsExtracting(false);
    }
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

  const toggleAllRecords = () => {
    if (selectedRecords.size === matchResults.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(matchResults.map((_, idx) => idx)));
    }
  };

  const handleActionChange = (index, action) => {
    setMatchResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selectedAction: action };
      return updated;
    });
  };

  const openManualMatchDialog = (index) => {
    setManualSearchQuery('');
    setManualMatchDialog({ open: true, index });
  };

  const handleManualMatch = (selectedRecord) => {
    const index = manualMatchDialog.index;
    if (index === null) return;

    const item = matchResults[index];
    const newFields = [];
    const existingFields = [];

    Object.keys(item.record).forEach(key => {
      const recordValue = item.record[key];
      if (recordValue !== undefined && recordValue !== null && recordValue !== '') {
        if (!selectedRecord[key] || selectedRecord[key] === '') {
          newFields.push({ field: key, value: recordValue });
        } else if (selectedRecord[key] !== recordValue) {
          existingFields.push({ field: key, oldValue: selectedRecord[key], newValue: recordValue });
        }
      }
    });

    const suggestions = [];
    if (newFields.length > 0) {
      suggestions.push({
        action: 'add_fields',
        message: 'إضافة ' + newFields.length + ' حقل جديد فقط',
        newFields,
        existingFields
      });
    }
    
    if (newFields.length === 0 && existingFields.length === 0) {
      suggestions.push({ action: 'skip', message: 'مطابق تماماً' });
    }
    suggestions.push({ action: 'skip', message: 'تجاهل' });

    setMatchResults(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        matchStatus: 'existing',
        matchedRecord: selectedRecord,
        confidence: 100,
        newFields,
        existingFields,
        suggestions,
        selectedAction: suggestions[0]?.action || 'skip'
      };
      return updated;
    });

    // إضافة للمحدد إذا كان هناك حقول جديدة
    if (newFields.length > 0) {
      setSelectedRecords(prev => new Set([...prev, index]));
    }

    setManualMatchDialog({ open: false, index: null });
  };

  const getFilteredRecordsForManualMatch = () => {
    const records = entityType === 'Employee' ? existingEmployees : existingCenters;
    if (!manualSearchQuery) return records.slice(0, 20);
    
    const query = manualSearchQuery.toLowerCase().trim();
    return records.filter(r => {
      if (entityType === 'Employee') {
        return (r.full_name_arabic?.toLowerCase().includes(query) ||
                r.رقم_الموظف?.includes(query) ||
                r.رقم_الهوية?.includes(query) ||
                r.المركز_الصحي?.toLowerCase().includes(query));
      } else {
        return (r.اسم_المركز?.toLowerCase().includes(query) ||
                r.center_code?.includes(query));
      }
    }).slice(0, 30);
  };

  const handleImportData = async () => {
    if (selectedRecords.size === 0) {
      alert('الرجاء اختيار سجل');
      return;
    }

    const confirmed = confirm('تنفيذ على ' + selectedRecords.size + ' سجل؟');
    if (!confirmed) return;

    setIsImporting(true);
    setImportProgress(0);
    const results = [];
    const selectedData = matchResults.filter((_, idx) => selectedRecords.has(idx));
    const total = selectedData.length;

    for (let i = 0; i < selectedData.length; i++) {
      const item = selectedData[i];
      
      try {
        if (item.selectedAction === 'create') {
          await base44.entities[entityType].create(item.record);
          results.push({ record: item.record, status: 'created', message: 'تم الإضافة' });
          
        } else if (item.selectedAction === 'add_fields') {
          if (item.matchedRecord?.id) {
            const updatedData = {};
            
            // إضافة الحقول الجديدة فقط (التي لم تكن موجودة)
            item.newFields?.forEach(field => {
              if (field.isArray && field.mergeMode) {
                updatedData[field.field] = [...(item.matchedRecord[field.field] || []), ...field.value];
              } else {
                updatedData[field.field] = field.value;
              }
            });
            
            await base44.entities[entityType].update(item.matchedRecord.id, updatedData);
            const fieldCount = item.newFields?.length || 0;
            results.push({ record: item.record, status: 'added_fields', message: 'إضافة ' + fieldCount + ' حقل جديد' });
          }
          
        } else if (item.selectedAction === 'update_fields') {
          if (item.matchedRecord?.id) {
            const updatedData = {};
            
            // إضافة الحقول الجديدة
            item.newFields?.forEach(field => {
              if (field.isArray && field.mergeMode) {
                updatedData[field.field] = [...(item.matchedRecord[field.field] || []), ...field.value];
              } else {
                updatedData[field.field] = field.value;
              }
            });
            
            // تحديث الحقول الموجودة بالقيم الجديدة
            item.existingFields?.forEach(field => {
              updatedData[field.field] = field.newValue;
            });
            
            await base44.entities[entityType].update(item.matchedRecord.id, updatedData);
            const addedCount = item.newFields?.length || 0;
            const updatedCount = item.existingFields?.length || 0;
            results.push({ 
              record: item.record, 
              status: 'updated_fields', 
              message: 'تحديث ' + updatedCount + ' حقل + إضافة ' + addedCount + ' حقل جديد'
            });
          }
          
        } else if (item.selectedAction === 'skip') {
          results.push({ record: item.record, status: 'skipped', message: 'تجاهل' });
        }
      } catch (error) {
        results.push({ record: item.record, status: 'error', error: error.message });
      }
      
      setImportProgress(((i + 1) / total) * 100);
    }

    setImportResults(results);
    setIsImporting(false);

    const created = results.filter(r => r.status === 'created').length;
    const added = results.filter(r => r.status === 'added_fields').length;
    const updated = results.filter(r => r.status === 'updated_fields').length;
    const errors = results.filter(r => r.status === 'error').length;
    
    alert('تم التنفيذ!\n\n✅ سجلات جديدة: ' + created + '\n📝 حقول مضافة: ' + added + '\n🔄 حقول محدّثة: ' + updated + (errors > 0 ? '\n❌ أخطاء: ' + errors : ''));
    await loadExistingData();
  };

  const getMatchBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-600"><Plus className="w-3 h-3 ml-1" />جديد</Badge>;
      case 'existing':
        return <Badge className="bg-blue-600"><RefreshCw className="w-3 h-3 ml-1" />موجود</Badge>;
      case 'duplicate':
        return <Badge className="bg-gray-600"><CheckCheck className="w-3 h-3 ml-1" />مكرر</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'create':
        return <Badge className="bg-green-600"><Plus className="w-3 h-3 ml-1" />إضافة سجل جديد</Badge>;
      case 'add_fields':
        return <Badge className="bg-blue-600"><Plus className="w-3 h-3 ml-1" />إضافة حقول فقط</Badge>;
      case 'update_fields':
        return <Badge className="bg-orange-600"><RefreshCw className="w-3 h-3 ml-1" />تحديث + إضافة</Badge>;
      case 'skip':
        return <Badge className="bg-gray-600"><XOctagon className="w-3 h-3 ml-1" />تجاهل</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">مستخرج البيانات الذكي</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            استخرج بيانات من الملفات وأضفها أو حدّثها للموظفين والمراكز الموجودة
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <Plus className="w-3 h-3 ml-1" />
              إضافة حقول جديدة
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              <RefreshCw className="w-3 h-3 ml-1" />
              تحديث بيانات موجودة
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
              <Database className="w-3 h-3 ml-1" />
              إضافة سجلات جديدة
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extract">1. استخراج</TabsTrigger>
            <TabsTrigger value="analyze">
              2. مطابقة
              {matchResults.length > 0 && <Badge className="mr-2 bg-blue-600">{matchResults.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="import">3. تنفيذ</TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>المدعوم:</strong> PDF, صور, CSV
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>اختر الملف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>رفع ملف</Label>
                    <Input
                      type="file"
                      accept=".pdf,.csv,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                    {uploadedFile && (
                      <Alert className="mt-2 bg-green-50">
                        <FileText className="h-4 w-4 text-green-600" />
                        <AlertDescription>{uploadedFile.file_name}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2">أو</span>
                    </div>
                  </div>

                  <div>
                    <Label>من الأرشيف</Label>
                    <Input
                      placeholder="ابحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-2 mb-2"
                    />
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-1">
                      {filteredArchive.map(file => {
                        const isSupported = isSupportedFileType(file.file_name);
                        return (
                          <div
                            key={file.id}
                            className={'p-2 rounded cursor-pointer ' + (selectedFile?.id === file.id ? 'bg-blue-100' : isSupported ? 'hover:bg-gray-100' : 'opacity-50')}
                            onClick={() => {
                              if (isSupported) {
                                setSelectedFile(file);
                                setUploadedFile(null);
                              }
                            }}
                          >
                            <div className="text-sm font-medium">{file.title}</div>
                            <div className="text-xs text-gray-500">{file.file_name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>نوع البيانات</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">بيانات الموظفين</SelectItem>
                        <SelectItem value="HealthCenter">بيانات المراكز الصحية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>تعليمات إضافية (اختياري)</Label>
                    <Textarea
                      placeholder="وصف محتوى الملف لتحسين الاستخراج، مثال:
- الملف يحتوي على جدول بأسماء الموظفين وأرقامهم
- استخرج بيانات العقود والإيجارات
- الجدول يحتوي على أعمدة: الاسم، الرقم، المركز"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 أضف وصفاً لمحتوى الملف لتحسين دقة الاستخراج
                    </p>
                  </div>

                  <Button
                    onClick={handleExtractData}
                    disabled={(!selectedFile && !uploadedFile) || isExtracting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    size="lg"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري الاستخراج...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        استخراج
                      </>
                    )}
                  </Button>

                  {extractionStatus && (
                    <Alert variant={extractionStatus.type === 'success' ? 'default' : 'destructive'}>
                      {extractionStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertDescription>{extractionStatus.message}</AlertDescription>
                    </Alert>
                  )}

                  {isAnalyzing && (
                    <Alert className="bg-purple-50 border-purple-200">
                      <Brain className="h-4 w-4 text-purple-600 animate-pulse" />
                      <AlertDescription className="text-purple-800">جاري المطابقة...</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            {matchResults.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">لا توجد بيانات</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>النتائج ({matchResults.length})</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={toggleAllRecords}>
                        {selectedRecords.size === matchResults.length ? 'إلغاء' : 'تحديد الكل'}
                      </Button>
                      <Badge>{selectedRecords.size} محدد</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matchResults.map((item, index) => (
                      <Card key={index} className={selectedRecords.has(index) ? 'ring-2 ring-blue-400' : ''}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Checkbox
                              checked={selectedRecords.has(index)}
                              onCheckedChange={() => toggleRecordSelection(index)}
                            />
                            
                            <div className="flex-1">
                              <div className="flex gap-2 mb-2 flex-wrap items-center">
                                <Badge>#{index + 1}</Badge>
                                {getMatchBadge(item.matchStatus)}
                                {item.confidence > 0 && <Badge variant="outline">{item.confidence}%</Badge>}
                                {item.matchStatus === 'new' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
                                    onClick={() => openManualMatchDialog(index)}
                                  >
                                    <Search className="w-3 h-3 ml-1" />
                                    ربط يدوي
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                {Object.entries(item.record).slice(0, 4).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="text-gray-500">{key}:</span>
                                    <p className="font-medium">{value || '-'}</p>
                                  </div>
                                ))}
                              </div>

                              {item.suggestions.length > 0 && (
                                <div className="space-y-2">
                                  <RadioGroup 
                                    value={item.selectedAction}
                                    onValueChange={(value) => handleActionChange(index, value)}
                                  >
                                    {item.suggestions.map((suggestion, idx) => (
                                      <div key={idx} className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value={suggestion.action} id={'act-' + index + '-' + idx} />
                                        <Label htmlFor={'act-' + index + '-' + idx} className="cursor-pointer flex gap-2">
                                          {getActionBadge(suggestion.action)}
                                          <span className="text-sm">{suggestion.message}</span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>

                                  {item.newFields && item.newFields.length > 0 && (
                                    <details className="text-xs" open>
                                      <summary className="cursor-pointer text-green-600 hover:underline font-medium">
                                        ✅ حقول ستُضاف ({item.newFields.length})
                                      </summary>
                                      <div className="mt-2 space-y-1 bg-green-50 p-2 rounded">
                                        {item.newFields.map((field, i) => (
                                          <div key={i} className="flex gap-2 items-center">
                                            <Badge variant="outline" className="text-xs bg-green-100">{field.field}</Badge>
                                            <span className="text-green-700 font-medium">
                                              {field.isArray ? field.count + ' عنصر' : String(field.value).substring(0, 50)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  )}
                                  
                                  {item.existingFields && item.existingFields.length > 0 && (
                                    <details className="text-xs">
                                      <summary className="cursor-pointer text-orange-600 hover:underline font-medium">
                                        ⚠️ حقول مختلفة ({item.existingFields.length}) - لن تُحدّث تلقائياً
                                      </summary>
                                      <div className="mt-2 space-y-1 bg-orange-50 p-2 rounded">
                                        {item.existingFields.map((field, i) => (
                                          <div key={i} className="flex flex-col gap-1 border-b border-orange-100 pb-1 last:border-0">
                                            <Badge variant="outline" className="text-xs bg-orange-100 w-fit">{field.field}</Badge>
                                            <div className="flex gap-2 text-xs">
                                              <span className="text-gray-500">الحالي: {String(field.oldValue).substring(0, 30)}</span>
                                              <span className="text-orange-700">الجديد: {String(field.newValue).substring(0, 30)}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تنفيذ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
                ) : (
                  <>
                    <Alert className="bg-yellow-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex gap-4 text-sm flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            سجلات جديدة: {matchResults.filter((r, i) => selectedRecords.has(i) && r.selectedAction === 'create').length}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            إضافة حقول: {matchResults.filter((r, i) => selectedRecords.has(i) && r.selectedAction === 'add_fields').length}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            تحديث + إضافة: {matchResults.filter((r, i) => selectedRecords.has(i) && r.selectedAction === 'update_fields').length}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {isImporting && (
                      <div className="space-y-2">
                        <Progress value={importProgress} />
                        <p className="text-sm text-center">{Math.round(importProgress)}%</p>
                      </div>
                    )}

                    {importResults.length > 0 && (
                      <div className="space-y-2">
                        {importResults.map((result, index) => (
                          <div
                            key={index}
                            className={'p-2 rounded flex gap-2 text-sm ' + (
                              result.status === 'created' ? 'bg-green-50' : 
                              result.status === 'added_fields' ? 'bg-blue-50' :
                              result.status === 'updated_fields' ? 'bg-orange-50' : 'bg-red-50'
                            )}
                          >
                            {result.status === 'created' && <Plus className="w-4 h-4 text-green-600" />}
                            {result.status === 'added_fields' && <Plus className="w-4 h-4 text-blue-600" />}
                            {result.status === 'updated_fields' && <RefreshCw className="w-4 h-4 text-orange-600" />}
                            {result.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                            <span>{index + 1}. {result.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={handleImportData}
                      disabled={selectedRecords.size === 0 || isImporting}
                      className="w-full bg-green-600"
                      size="lg"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          جاري التنفيذ...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 ml-2" />
                          تنفيذ {selectedRecords.size} إجراء
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PDFViewer
        file={viewingFile}
        open={!!viewingFile}
        onOpenChange={() => setViewingFile(null)}
      />

      {/* Manual Match Dialog */}
      <Dialog open={manualMatchDialog.open} onOpenChange={(open) => setManualMatchDialog({ open, index: open ? manualMatchDialog.index : null })}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              ربط يدوي - اختر {entityType === 'Employee' ? 'الموظف' : 'المركز'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* بيانات السجل المستخرج */}
            {manualMatchDialog.index !== null && matchResults[manualMatchDialog.index] && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="font-medium mb-1">البيانات المستخرجة:</div>
                  <div className="text-sm grid grid-cols-2 gap-1">
                    {Object.entries(matchResults[manualMatchDialog.index].record).slice(0, 6).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span> {val || '-'}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* البحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={entityType === 'Employee' ? 'ابحث بالاسم أو رقم الموظف أو الهوية...' : 'ابحث باسم المركز...'}
                value={manualSearchQuery}
                onChange={(e) => setManualSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* قائمة السجلات */}
            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
              {getFilteredRecordsForManualMatch().map(record => (
                <div
                  key={record.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleManualMatch(record)}
                >
                  <div>
                    <div className="font-medium">
                      {entityType === 'Employee' ? record.full_name_arabic : record.اسم_المركز}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entityType === 'Employee' ? (
                        <>رقم الموظف: {record.رقم_الموظف} | المركز: {record.المركز_الصحي}</>
                      ) : (
                        <>كود: {record.center_code}</>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </Button>
                </div>
              ))}
              {getFilteredRecordsForManualMatch().length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  لا توجد نتائج
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManualMatchDialog({ open: false, index: null })}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}