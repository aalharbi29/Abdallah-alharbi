import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Sparkles, FileText, FileSpreadsheet, Printer, Mail, MessageCircle,
  Database, MapPin, Columns3, Wand2, Pencil, Save, X, ArrowDownUp, Brain, Mic,
  LayoutGrid, Table as TableIcon
} from 'lucide-react';
import SingleRecordDetailCard from '@/components/smart_commands/SingleRecordDetailCard';
import { toast } from 'sonner';
import VoiceInput from '@/components/ui/VoiceInput';
import { ENTITIES_CATALOG, getEntityByValue, getFieldLabel } from '@/components/smart_commands/entitiesCatalog';
import { exportToExcel, getNestedValue, toLatinDigits, formatLatinDate } from '@/components/smart_commands/excelExporter';
import { getCombinedRolesText } from '@/components/utils/combinedRoles';
import { mergeMultipleEntities, applyValueFilters } from '@/components/smart_commands/multiEntityMerge';
import { planFreeReport, executeFreeReportPlan, resolveFieldLabelGlobal } from '@/components/smart_commands/freeReportAI';
import CollapsibleSection from '@/components/smart_commands/CollapsibleSection';
import MultiEntitySelector from '@/components/smart_commands/MultiEntitySelector';
import CentersPicker from '@/components/smart_commands/CentersPicker';
import FieldGroupPicker from '@/components/smart_commands/FieldGroupPicker';
import SelectedFieldsReorder from '@/components/smart_commands/SelectedFieldsReorder';
import FieldValueFilterDialog from '@/components/smart_commands/FieldValueFilterDialog';

const normalizeArabic = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const getCenterFieldForEntity = (entityValue) => {
  const map = {
    Employee: 'المركز_الصحي',
    HealthCenter: 'اسم_المركز',
    MedicalEquipment: 'health_center_name',
    EquipmentRequest: 'health_center_name',
    DeficiencyReport: 'health_center',
    Leave: 'health_center',
    Assignment: 'assigned_to_health_center',
    CenterDocument: 'center_name',
    ArchivedEmployee: 'المركز_الصحي',
    AllowanceRequest: 'department',
  };
  return map[entityValue];
};

export default function SmartCommands() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queryInfo, setQueryInfo] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [freeReportNotes, setFreeReportNotes] = useState('');
  const [customLabels, setCustomLabels] = useState(null);

  // دعم كيانات متعددة — الأول هو الأساسي
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [centersList, setCentersList] = useState([]);
  // فلاتر القيم: { fieldKey: [allowed values] }
  const [valueFilters, setValueFilters] = useState({});
  const [filterDialog, setFilterDialog] = useState({ open: false, fieldKey: null, fieldLabel: '' });

  // تخزين عينة من البيانات لاستخراج قيم الفلاتر الديناميكية
  const [sampleData, setSampleData] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState({});
  const [savingEdits, setSavingEdits] = useState(false);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'table' | 'detail'

  const primaryEntity = selectedEntities[0] || '';
  const secondaryEntities = selectedEntities.slice(1);

  const UNSAVABLE_COMPUTED_FIELDS = [
    '__combined_roles',
    'المدير_جوال', 'المدير_ايميل', 'المدير_تخصص', 'المدير_رقم_الموظف', 'المدير_رقم_الهوية',
    'نائب_المدير_جوال', 'نائب_المدير_ايميل', 'نائب_المدير_تخصص', 'نائب_المدير_رقم_الموظف', 'نائب_المدير_رقم_الهوية',
    'المشرف_الفني_جوال', 'المشرف_الفني_ايميل', 'المشرف_الفني_تخصص', 'المشرف_الفني_رقم_الموظف', 'المشرف_الفني_رقم_الهوية',
  ];
  const isSavableField = (field) => !UNSAVABLE_COMPUTED_FIELDS.includes(field) && !field.startsWith('_') && !field.startsWith('__custom_');

  const currentEntity = useMemo(
    () => (primaryEntity ? getEntityByValue(primaryEntity) : null),
    [primaryEntity]
  );

  useEffect(() => {
    base44.entities.HealthCenter.filter({})
      .then((data) => {
        if (data?.length > 0) {
          setCentersList(data.map((c) => c['اسم_المركز']).filter(Boolean).sort());
        }
      })
      .catch(() => {});
  }, []);

  // عند تغير الكيان الأساسي، نظّف الحقول والفلاتر
  useEffect(() => {
    setSelectedFields([]);
    setValueFilters({});
    setSampleData([]);
  }, [primaryEntity]);

  // جلب عينة بيانات عند تغير الكيان الأساسي — لاستخدامها في dialog فلتر القيم
  useEffect(() => {
    if (!primaryEntity || !base44.entities[primaryEntity]) return;
    base44.entities[primaryEntity].filter({})
      .then((data) => setSampleData(data || []))
      .catch(() => setSampleData([]));
  }, [primaryEntity]);

  const openValueFilter = (fieldKey, fieldLabel) => {
    setFilterDialog({ open: true, fieldKey, fieldLabel });
  };

  const applyValueFilter = (fieldKey, values) => {
    setValueFilters((prev) => {
      const next = { ...prev };
      if (!values || values.length === 0) {
        delete next[fieldKey];
      } else {
        next[fieldKey] = values;
      }
      return next;
    });
  };

  const removeField = (fieldKey) => {
    setSelectedFields((prev) => prev.filter((f) => f !== fieldKey));
    setValueFilters((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleExecute = async () => {
    if (freeMode && !prompt.trim()) {
      toast.warning('اكتب وصف التقرير في الوضع الحر.');
      return;
    }
    if (!freeMode && !primaryEntity && !prompt.trim()) {
      toast.warning('اختر نوع البيانات المطلوبة أو اكتب وصفاً نصياً لطلبك.');
      return;
    }

    setLoading(true);
    setResults(null);
    setQueryInfo(null);
    setFreeReportNotes('');

    try {
      // === مسار التقرير الذكي بالـ AI ===
      // يُفعَّل تلقائياً إذا: الوضع الحر مُفعّل، أو يوجد وصف نصي ولم يتم اختيار حقول يدوياً.
      // هذا يضمن أن "الموظفين في مركز X" يفهم كـ Employee وليس HealthCenter.
      const useAIPath = freeMode || (prompt.trim() && selectedFields.length === 0);
      if (useAIPath) {
        const plan = await planFreeReport(prompt);
        if (!plan?.primary_entity) {
          toast.error('لم يتمكن الذكاء الاصطناعي من تحديد بيانات مناسبة للطلب.');
          setLoading(false);
          return;
        }
        const freeData = await executeFreeReportPlan(plan);
        setQueryInfo({
          entity: plan.primary_entity,
          fields: plan.fields,
          title: plan.title || 'تقرير ذكي',
          isFree: true,
        });
        setResults(freeData);
        setCustomLabels(plan.__customLabels || null);
        setFreeReportNotes(plan.notes || '');
        if (freeData.length === 0) toast.info('تم التنفيذ، لكن لا توجد نتائج مطابقة.');
        else toast.success(`تم استخراج ${freeData.length} سجل.`);
        setLoading(false);
        return;
      }

      let finalEntity = primaryEntity;
      let finalFields = [...selectedFields];
      let finalTitle = '';

      if (prompt.trim()) {
        const entityDescriptions = ENTITIES_CATALOG.map((e) => `- ${e.value} (${e.label})`).join('\n');
        const fieldsContext = currentEntity
          ? `الحقول المتاحة في ${primaryEntity}: ${currentEntity.fields.map((f) => `${f.key} (${f.label})`).join('; ')}`
          : '';

        const aiPrompt = `أنت مساعد لتحليل طلبات بالعربية وبناء تقارير من نظام إدارة صحي.
الكيانات المتاحة:
${entityDescriptions}

${primaryEntity ? `الكيان الأساسي: ${primaryEntity}` : 'اختر الكيان الأنسب.'}
${fieldsContext}
${selectedFields.length > 0 ? `الحقول المختارة مسبقاً: ${selectedFields.join('، ')}` : ''}

الطلب: "${prompt}"

أرجع JSON فقط:
{
  "entity": "اسم الكيان",
  "fields": ["حقل1", "حقل2"],
  "title": "عنوان عربي مناسب للتقرير"
}`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: aiPrompt,
          response_json_schema: {
            type: 'object',
            properties: {
              entity: { type: 'string' },
              fields: { type: 'array', items: { type: 'string' } },
              title: { type: 'string' },
            },
            required: ['entity', 'fields', 'title'],
          },
        });

        const parsed = typeof response === 'string' ? JSON.parse(response) : response;
        if (!finalEntity) finalEntity = parsed.entity;
        finalFields = Array.from(new Set([...finalFields, ...(parsed.fields || [])]));
        finalTitle = parsed.title;
      }

      if (!finalEntity) {
        toast.error('تعذّر تحديد نوع البيانات المطلوبة.');
        setLoading(false);
        return;
      }

      if (!base44.entities[finalEntity]) {
        toast.error(`الكيان "${finalEntity}" غير موجود.`);
        setLoading(false);
        return;
      }

      if (finalFields.length === 0) {
        const entityCat = getEntityByValue(finalEntity);
        finalFields = entityCat ? entityCat.fields.slice(0, 6).map((f) => f.key) : [];
      }

      if (!finalTitle) {
        finalTitle = `تقرير ${getEntityByValue(finalEntity)?.label || finalEntity}`;
      }

      let allData = await base44.entities[finalEntity].filter({});

      // مهام إضافية للموظفين (قيادية/إشرافية)
      if (finalEntity === 'Employee' && finalFields.includes('__combined_roles')) {
        try {
          const allCenters = await base44.entities.HealthCenter.filter({});
          allData = allData.map((emp) => ({
            ...emp,
            __combined_roles: getCombinedRolesText(emp, allCenters),
          }));
        } catch (err) {
          console.warn('تعذّر جلب المراكز:', err);
        }
      }

      // ربط بيانات المدراء للمراكز
      if (finalEntity === 'HealthCenter') {
        const managerFields = [
          'المدير', 'نائب_المدير', 'المشرف_الفني',
          'المدير_جوال', 'المدير_ايميل', 'المدير_تخصص', 'المدير_رقم_الموظف', 'المدير_رقم_الهوية',
          'نائب_المدير_جوال', 'نائب_المدير_ايميل', 'نائب_المدير_تخصص', 'نائب_المدير_رقم_الموظف', 'نائب_المدير_رقم_الهوية',
          'المشرف_الفني_جوال', 'المشرف_الفني_ايميل', 'المشرف_الفني_تخصص', 'المشرف_الفني_رقم_الموظف', 'المشرف_الفني_رقم_الهوية',
        ];
        if (managerFields.some((f) => finalFields.includes(f))) {
          try {
            const allEmployees = await base44.entities.Employee.filter({});
            const empMap = new Map();
            allEmployees.forEach((e) => {
              if (e.id) empMap.set(String(e.id), e);
              if (e['رقم_الموظف']) empMap.set(String(e['رقم_الموظف']), e);
              if (e['رقم_الهوية']) empMap.set(String(e['رقم_الهوية']), e);
            });
            const findEmp = (val) => (val ? empMap.get(String(val)) : null);
            const nameOf = (emp, rawVal) => {
              if (!rawVal) return '-';
              if (!emp) return rawVal;
              const num = emp['رقم_الموظف'] ? ` (${emp['رقم_الموظف']})` : '';
              return `${emp.full_name_arabic || '-'}${num}`;
            };
            allData = allData.map((center) => {
              const dirEmp = findEmp(center['المدير']);
              const vdirEmp = findEmp(center['نائب_المدير']);
              const supEmp = findEmp(center['المشرف_الفني']);
              return {
                ...center,
                المدير: nameOf(dirEmp, center['المدير']),
                نائب_المدير: nameOf(vdirEmp, center['نائب_المدير']),
                المشرف_الفني: nameOf(supEmp, center['المشرف_الفني']),
                المدير_جوال: dirEmp?.phone || '-',
                المدير_ايميل: dirEmp?.email || '-',
                المدير_تخصص: dirEmp?.position || '-',
                المدير_رقم_الموظف: dirEmp?.['رقم_الموظف'] || '-',
                المدير_رقم_الهوية: dirEmp?.['رقم_الهوية'] || '-',
                نائب_المدير_جوال: vdirEmp?.phone || '-',
                نائب_المدير_ايميل: vdirEmp?.email || '-',
                نائب_المدير_تخصص: vdirEmp?.position || '-',
                نائب_المدير_رقم_الموظف: vdirEmp?.['رقم_الموظف'] || '-',
                نائب_المدير_رقم_الهوية: vdirEmp?.['رقم_الهوية'] || '-',
                المشرف_الفني_جوال: supEmp?.phone || '-',
                المشرف_الفني_ايميل: supEmp?.email || '-',
                المشرف_الفني_تخصص: supEmp?.position || '-',
                المشرف_الفني_رقم_الموظف: supEmp?.['رقم_الموظف'] || '-',
                المشرف_الفني_رقم_الهوية: supEmp?.['رقم_الهوية'] || '-',
              };
            });
          } catch (err) {
            console.warn('تعذّر دمج الموظفين:', err);
          }
        }
      }

      // دمج كيانات إضافية
      if (secondaryEntities.length > 0) {
        allData = await mergeMultipleEntities(finalEntity, allData, secondaryEntities);
      }

      // فلترة المراكز + الحفاظ على ترتيب اختيار المستخدم
      let filtered = allData;
      if (selectedCenters.length > 0) {
        const centerField = getCenterFieldForEntity(finalEntity);
        if (centerField) {
          const normalizedTargets = selectedCenters.map(normalizeArabic);
          // دالة تُرجع رقم ترتيب المركز حسب اختيار المستخدم (الأول = 0)
          const getCenterOrder = (row) => {
            const centerVal = getNestedValue(row, centerField);
            if (!centerVal) return -1;
            const normVal = normalizeArabic(centerVal);
            return normalizedTargets.findIndex((t) => normVal.includes(t) || t.includes(normVal));
          };
          filtered = allData
            .filter((row) => getCenterOrder(row) !== -1)
            .sort((a, b) => getCenterOrder(a) - getCenterOrder(b));
        }
      }

      // تطبيق فلاتر القيم
      filtered = applyValueFilters(filtered, valueFilters);

      setQueryInfo({ entity: finalEntity, fields: finalFields, title: finalTitle });
      setResults(filtered);

      if (filtered.length === 0) {
        toast.info('تم التنفيذ، لكن لا توجد نتائج مطابقة.');
      } else {
        toast.success(`تم استخراج ${filtered.length} سجل بنجاح.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'حدث خطأ أثناء معالجة الأمر.');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowId, field, value) => {
    setEdits((prev) => ({ ...prev, [rowId]: { ...(prev[rowId] || {}), [field]: value } }));
  };

  const handleSaveEdits = async () => {
    const editedRowIds = Object.keys(edits);
    if (editedRowIds.length === 0) {
      toast.info('لا توجد تعديلات للحفظ.');
      return;
    }
    setSavingEdits(true);
    try {
      let successCount = 0;
      let skippedComputed = 0;
      for (const rowId of editedRowIds) {
        const changes = edits[rowId];
        const originalRow = results.find((r) => r.id === rowId) || {};
        const payload = {};
        Object.entries(changes).forEach(([field, value]) => {
          if (!isSavableField(field)) { skippedComputed++; return; }
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (!payload[parent]) payload[parent] = { ...(originalRow[parent] || {}) };
            payload[parent][child] = value;
          } else {
            payload[field] = value;
          }
        });
        if (Object.keys(payload).length === 0) continue;
        await base44.entities[queryInfo.entity].update(rowId, payload);
        successCount++;
      }
      setResults((prev) => prev.map((row) => (edits[row.id] ? { ...row, ...edits[row.id] } : row)));
      setEdits({});
      setEditMode(false);
      if (skippedComputed > 0) {
        toast.success(`تم حفظ ${successCount} سجل. (تم تجاهل ${skippedComputed} حقل محسوب)`);
      } else {
        toast.success(`تم حفظ ${successCount} سجل بنجاح.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('فشل حفظ بعض التعديلات.');
    } finally {
      setSavingEdits(false);
    }
  };

  const cancelEdits = () => { setEdits({}); setEditMode(false); };

  const NA = 'غير متاحة';
  const renderCellValue = (val) => {
    if (val === null || val === undefined || val === '') return NA;
    if (typeof val === 'boolean') return val ? '✓ نعم' : '✗ لا';
    if (Array.isArray(val)) return val.length === 0 ? NA : (toLatinDigits(val.join('، ')) || NA);
    if (typeof val === 'object') {
      if (val['رقم_اللوحة_عربي']) return toLatinDigits(`${val['رقم_اللوحة_عربي']} | ${val['حالة_السيارة'] || NA}`);
      if (val['متوفرة'] !== undefined) return val['متوفرة'] ? 'متوفرة' : 'غير متوفرة';
      return toLatinDigits(JSON.stringify(val));
    }
    if (String(val).trim() === '-' || String(val).trim() === '') return NA;
    return toLatinDigits(val);
  };

  const handleExportExcel = async () => {
    if (!results || results.length === 0) return;
    setExporting(true);
    try {
      await exportToExcel({ title: queryInfo.title, entity: queryInfo.entity, fields: queryInfo.fields, results });
      toast.success('تم تصدير Excel.');
    } catch (e) { console.error(e); toast.error('فشل تصدير Excel.'); }
    finally { setExporting(false); }
  };

  const exportWord = () => {
    if (!results || results.length === 0) return;
    const headers = queryInfo.fields.map((f) => labelFor(f));
    const tableHtml = `
      <table><thead><tr><th>م</th>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${results.map((row, i) => `<tr><td>${i + 1}</td>${queryInfo.fields.map((f) => `<td>${renderCellValue(getNestedValue(row, f))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const html = `<html dir="rtl"><head><meta charset="utf-8"><title>${queryInfo.title}</title>
      <style>* { font-variant-numeric: lining-nums tabular-nums; font-feature-settings: "lnum" 1; }
        body { font-family: 'Cairo', Arial; direction: rtl; }
        h1 { text-align: center; color: #1E40AF; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: right; unicode-bidi: plaintext; }
        th { background-color: #3B82F6; color: white; }
        tr:nth-child(even) { background-color: #F8FAFC; }
      </style></head><body><h1>${queryInfo.title}</h1>${tableHtml}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${queryInfo.title}.doc`;
    link.click();
  };

  const printTable = () => {
    if (!results || results.length === 0) return;
    const headers = queryInfo.fields.map((f) => labelFor(f));
    const win = window.open('', '', 'width=1000,height=750');
    win.document.write(`<html dir="rtl"><head><title>${queryInfo.title}</title>
      <style>* { font-variant-numeric: lining-nums tabular-nums; font-feature-settings: "lnum" 1; unicode-bidi: plaintext; }
        body { font-family: 'Cairo', Arial; padding: 25px; direction: rtl; }
        h1 { text-align: center; color: #1E40AF; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
        .info { text-align: center; color: #64748B; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: right; }
        th { background-color: #3B82F6; color: white; }
        tr:nth-child(even) { background-color: #F8FAFC; }
        @media print { @page { size: A4 landscape; margin: 15mm; } }
      </style></head><body>
      <h1>${queryInfo.title}</h1><div class="info">عدد السجلات: ${results.length} | ${formatLatinDate()}</div>
      <table><thead><tr><th>م</th>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${results.map((row, i) => `<tr><td>${i + 1}</td>${queryInfo.fields.map((f) => `<td>${renderCellValue(getNestedValue(row, f))}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();window.close();}</script></body></html>`);
    win.document.close();
  };

  const shareWhatsApp = () => {
    if (!results || results.length === 0) return;
    let text = `*${queryInfo.title}*\n\n`;
    results.slice(0, 20).forEach((row, i) => {
      text += `*${i + 1}.* ` + queryInfo.fields.map((f) => `${labelFor(f)}: ${renderCellValue(getNestedValue(row, f))}`).join('\n') + '\n\n';
    });
    if (results.length > 20) text += `... و${results.length - 20} سجل إضافي.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareEmail = () => {
    if (!results || results.length === 0) return;
    let text = `${queryInfo.title}\n\n`;
    results.forEach((row, i) => {
      text += `${i + 1}. ` + queryInfo.fields.map((f) => `${labelFor(f)}: ${renderCellValue(getNestedValue(row, f))}`).join(' | ') + '\n';
    });
    window.open(`mailto:?subject=${encodeURIComponent(queryInfo.title)}&body=${encodeURIComponent(text)}`);
  };

  const canExecute = freeMode ? !!prompt.trim() : (primaryEntity || prompt.trim());
  const activeFiltersCount = Object.values(valueFilters).filter((v) => v?.length > 0).length;
  const labelFor = (field) => {
    if (queryInfo?.isFree) return resolveFieldLabelGlobal(field, customLabels);
    return getFieldLabel(queryInfo.entity, field);
  };
  const isCustomColumn = (field) => typeof field === 'string' && field.startsWith('__custom_');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">الأوامر الذكية</h1>
          <p className="text-slate-500 mt-1 text-sm">
            اختر كيان أو أكثر، حدد الحقول والمراكز، وأضف فلاتر دقيقة لاستخراج تقارير احترافية مترابطة.
          </p>
        </div>
      </div>

      {/* الخطوة 1: الكيانات (متعدد) */}
      <CollapsibleSection
        title="١. حدد نوع البيانات (يمكن اختيار أكثر من كيان)"
        icon={Database}
        iconColor="text-indigo-600"
        badgeCount={selectedEntities.length}
        defaultOpen={true}
      >
        <MultiEntitySelector selectedEntities={selectedEntities} onChange={setSelectedEntities} />
        {currentEntity && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-indigo-200 text-sm text-slate-600">
            <strong className="text-indigo-700">الأساسي:</strong> {currentEntity.icon} {currentEntity.label}
            {' '}({currentEntity.fields.length} حقل)
            {secondaryEntities.length > 0 && (
              <span className="mr-2">• <strong>كيانات مدمجة:</strong> {secondaryEntities.map((e) => getEntityByValue(e)?.label).join('، ')}</span>
            )}
          </div>
        )}
      </CollapsibleSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* الخطوة 2: المراكز */}
        <CollapsibleSection
          title="٢. حدد المراكز"
          icon={MapPin}
          iconColor="text-emerald-600"
          badgeCount={selectedCenters.length}
          defaultOpen={false}
        >
          <CentersPicker
            centersList={centersList}
            selectedCenters={selectedCenters}
            onChange={setSelectedCenters}
          />
        </CollapsibleSection>

        {/* الخطوة 3: الحقول (مجمعة) */}
        <CollapsibleSection
          title="٣. الحقول (مُصنّفة بمجموعات)"
          icon={Columns3}
          iconColor="text-green-600"
          badgeCount={selectedFields.length}
          defaultOpen={false}
        >
          <FieldGroupPicker
            entity={currentEntity}
            selectedFields={selectedFields}
            onChange={setSelectedFields}
            onFilterIconClick={openValueFilter}
            activeValueFilters={valueFilters}
          />
        </CollapsibleSection>
      </div>

      {/* الخطوة 4: ترتيب الحقول بالسحب */}
      {selectedFields.length > 0 && currentEntity && (
        <CollapsibleSection
          title="٤. رتّب الأعمدة (اسحب وأفلت)"
          icon={ArrowDownUp}
          iconColor="text-blue-600"
          badgeCount={selectedFields.length}
          defaultOpen={true}
        >
          <SelectedFieldsReorder
            entity={primaryEntity}
            selectedFields={selectedFields}
            onReorder={setSelectedFields}
            onRemove={removeField}
            activeValueFilters={valueFilters}
            onFilterClick={openValueFilter}
          />
          {activeFiltersCount > 0 && (
            <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
              🔍 فلاتر القيم النشطة: {activeFiltersCount} فلتر. ستُطبَّق على البيانات عند التنفيذ.
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* الخطوة 5: نص AI + الوضع الحر + إدخال صوتي */}
      <CollapsibleSection
        title={freeMode ? '٥. 🧠 الوضع الحر (AI يستخرج كل شيء من النظام)' : '٥. وصف نصي إضافي (اختياري)'}
        icon={freeMode ? Brain : Wand2}
        iconColor={freeMode ? 'text-fuchsia-600' : 'text-purple-600'}
        defaultOpen={freeMode}
      >
        <div className="space-y-3">
          {/* مفتاح تبديل الوضع الحر */}
          <div className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${freeMode ? 'bg-gradient-to-l from-fuchsia-50 to-purple-50 border-fuchsia-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${freeMode ? 'text-fuchsia-600' : 'text-slate-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${freeMode ? 'text-fuchsia-800' : 'text-slate-600'}`}>
                  الوضع الحر (تقرير غير مقيّد)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {freeMode
                    ? 'الذكاء الاصطناعي سيحلّل الطلب ويختار الكيانات والحقول من كامل النظام. القيم الناقصة ستظهر كـ "غير متاحة".'
                    : 'فعّل هذا الوضع لترك الذكاء الاصطناعي يستخرج كل شيء بناءً على الوصف النصي فقط.'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant={freeMode ? 'default' : 'outline'}
              onClick={() => setFreeMode((v) => !v)}
              className={freeMode ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : ''}
            >
              {freeMode ? 'مُفعّل' : 'تفعيل'}
            </Button>
          </div>

          {/* مربع الوصف + زر الميكروفون */}
          <div className="relative">
            <Textarea
              placeholder={freeMode
                ? 'مثال: أريد قائمة بكل الأطباء ومراكزهم وأرقام تواصلهم، مع بيانات العقود السارية...'
                : 'مثال: استخرج الموظفين الأطباء في المراكز النائية...'}
              className="text-base p-4 pl-14 min-h-[110px] resize-y bg-white"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              <VoiceInput
                continuous={true}
                onResult={(text) => setPrompt((prev) => (prev ? `${prev} ${text}` : text))}
                className="h-9 w-9"
              />
              {prompt && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setPrompt('')}
                  className="h-7 w-7 text-slate-400 hover:text-red-500"
                  title="مسح"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Mic className="w-3 h-3" /> اضغط على الميكروفون وتحدّث بالعربية لإملاء طلبك صوتياً.
          </p>
        </div>
      </CollapsibleSection>

      {/* زر التنفيذ */}
      <div className="flex justify-center sticky bottom-4 z-20">
        <Button
          onClick={handleExecute}
          disabled={loading || !canExecute}
          className={`text-white px-12 h-14 text-lg rounded-xl shadow-2xl ${freeMode ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'}`}
        >
          {loading ? <Loader2 className="w-6 h-6 ml-2 animate-spin" /> : (freeMode ? <Brain className="w-6 h-6 ml-2" /> : <Sparkles className="w-6 h-6 ml-2" />)}
          {loading ? 'جاري التنفيذ...' : (freeMode ? 'تنفيذ التقرير الحر بالذكاء الاصطناعي' : 'تنفيذ الأمر واستخراج البيانات')}
        </Button>
      </div>

      {/* النتائج */}
      {queryInfo && results && (
        <Card className="shadow-lg border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-l from-green-50 to-white border-b">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-slate-800">{queryInfo.title}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-white">
                    {getEntityByValue(queryInfo.entity)?.icon} {getEntityByValue(queryInfo.entity)?.label || queryInfo.entity}
                  </Badge>
                  <span><strong>{results.length}</strong> نتيجة</span>
                  <span>•</span>
                  <span>{queryInfo.fields.length} عمود</span>
                  {selectedCenters.length > 0 && <><span>•</span><span>{selectedCenters.length} مركز</span></>}
                  {activeFiltersCount > 0 && <><span>•</span><span>{activeFiltersCount} فلتر</span></>}
                  {queryInfo.isFree && <Badge className="bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300">🧠 تقرير حر AI</Badge>}
                </CardDescription>
                {freeReportNotes && queryInfo.isFree && (
                  <div className="mt-2 p-2 bg-fuchsia-50 border border-fuchsia-200 rounded-md text-xs text-fuchsia-800">
                    <strong>منطق AI:</strong> {freeReportNotes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {results.length === 1 && (
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                    <Button
                      variant={viewMode !== 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('detail')}
                      className="h-7 px-2"
                      title="عرض بطاقة تفصيلية"
                    >
                      <LayoutGrid className="w-4 h-4 ml-1" /> بطاقة
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="h-7 px-2"
                      title="عرض جدولي"
                    >
                      <TableIcon className="w-4 h-4 ml-1" /> جدول
                    </Button>
                  </div>
                )}
                {!editMode ? (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    <Pencil className="w-4 h-4 ml-1" /> تعديل مباشر
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSaveEdits} disabled={savingEdits} className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      {savingEdits ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
                      حفظ ({Object.keys(edits).length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEdits} disabled={savingEdits} className="border-red-200 text-red-700 hover:bg-red-50">
                      <X className="w-4 h-4 ml-1" /> إلغاء
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={exporting} className="border-green-200 text-green-700 hover:bg-green-50">
                  {exporting ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 ml-1" />} Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportWord} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <FileText className="w-4 h-4 ml-1" /> وورد
                </Button>
                <Button variant="outline" size="sm" onClick={printTable} className="border-slate-200 text-slate-700 hover:bg-slate-100">
                  <Printer className="w-4 h-4 ml-1" /> طباعة
                </Button>
                <Button variant="outline" size="sm" onClick={shareWhatsApp} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <MessageCircle className="w-4 h-4 ml-1" /> واتساب
                </Button>
                <Button variant="outline" size="sm" onClick={shareEmail} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  <Mail className="w-4 h-4 ml-1" /> إيميل
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {results.length === 1 && viewMode !== 'table' ? (
              <div className="p-4 bg-slate-50/50">
                <SingleRecordDetailCard
                  row={results[0]}
                  fields={queryInfo.fields}
                  entity={queryInfo.entity}
                  title={queryInfo.title}
                  isFree={queryInfo.isFree}
                />
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gradient-to-b from-slate-100 to-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-3 border-b text-slate-600 font-semibold w-12">#</th>
                      {queryInfo.fields.map((field, idx) => (
                        <th key={idx} className="p-3 border-b text-slate-600 font-semibold whitespace-nowrap">
                          {labelFor(field)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((row, rIdx) => {
                      const rowEdits = edits[row.id] || {};
                      const isRowEdited = Object.keys(rowEdits).length > 0;
                      return (
                        <tr key={row.id || rIdx} className={`hover:bg-indigo-50/40 transition-colors ${isRowEdited ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-3 text-slate-500 font-medium">{rIdx + 1}</td>
                          {queryInfo.fields.map((field, fIdx) => {
                            const rawVal = rowEdits[field] !== undefined ? rowEdits[field] : getNestedValue(row, field);
                            const canEdit = editMode && row.id;
                            const isComputed = !isSavableField(field);
                            return (
                              <td key={fIdx} className="p-2 text-slate-800">
                                {canEdit ? (
                                  <input
                                    type="text"
                                    value={rawVal ?? ''}
                                    onChange={(e) => handleCellChange(row.id, field, e.target.value)}
                                    title={isComputed ? 'حقل محسوب: التعديل محلي فقط' : ''}
                                    className={`w-full min-w-[120px] px-2 py-1 text-sm border rounded focus:ring-1 bg-white ${isComputed ? 'border-amber-200 focus:border-amber-400 focus:ring-amber-200 bg-amber-50/40' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-200'}`}
                                  />
                                ) : (
                                  <span>{renderCellValue(rawVal)}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات متاحة.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog فلترة قيم */}
      <FieldValueFilterDialog
        open={filterDialog.open}
        onClose={() => setFilterDialog({ open: false, fieldKey: null, fieldLabel: '' })}
        entityValue={primaryEntity}
        fieldKey={filterDialog.fieldKey}
        fieldLabel={filterDialog.fieldLabel}
        currentValues={filterDialog.fieldKey ? valueFilters[filterDialog.fieldKey] || [] : []}
        onApply={applyValueFilter}
        sampleData={sampleData}
      />
    </div>
  );
}