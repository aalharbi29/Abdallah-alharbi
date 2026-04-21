import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Sparkles, FileText, FileSpreadsheet, Printer, Mail, MessageCircle,
  SlidersHorizontal, ChevronDown, ChevronUp, Database, Filter, X, CheckCircle2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ENTITIES_CATALOG, getEntityByValue, getFieldLabel } from '@/components/smart_commands/entitiesCatalog';
import { exportToExcel } from '@/components/smart_commands/excelExporter';

export default function SmartCommands() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queryInfo, setQueryInfo] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [centerFilter, setCenterFilter] = useState('');
  const [centersList, setCentersList] = useState([]);
  const [exporting, setExporting] = useState(false);

  const currentEntity = useMemo(
    () => (selectedEntity && selectedEntity !== 'none' ? getEntityByValue(selectedEntity) : null),
    [selectedEntity]
  );

  useEffect(() => {
    base44.entities.HealthCenter.filter({})
      .then(data => {
        if (data?.length > 0) {
          setCentersList(data.map(c => c['اسم_المركز']).filter(Boolean).sort());
        }
      })
      .catch(() => {});
  }, []);

  const suggestions = [
    'استخراج المشرفين الفنيين بالمراكز الصحية مع الاسم ورقم الجوال',
    'حصر السيارات (الإسعاف والخدمات) في جميع المراكز',
    'قائمة الأطباء والأطباء العامين',
    'حصر المراكز المعتمدة من سباهي',
    'قائمة الموظفين المتعاقدين الذين تنتهي عقودهم خلال 3 أشهر',
    'الأجهزة الطبية المعطلة في جميع المراكز',
    'الإجازات الحالية النشطة',
    'التكاليف المعتمدة لهذا الشهر',
  ];

  const toggleField = (fieldKey) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey) ? prev.filter(f => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  const selectAllFields = () => {
    if (!currentEntity) return;
    setSelectedFields(currentEntity.fields.map(f => f.key));
  };

  const clearFields = () => setSelectedFields([]);

  const handleExecute = async (overridePrompt = null) => {
    const textToExecute = overridePrompt || prompt;
    if (!textToExecute.trim() && !selectedEntity && !centerFilter) {
      toast.warning('اكتب طلبك أو حدّد كياناً من الخيارات المتقدمة.');
      return;
    }

    setLoading(true);
    setResults(null);
    setQueryInfo(null);

    try {
      const entityDescriptions = ENTITIES_CATALOG.map(e =>
        `- ${e.value} (${e.label}): الحقول المتاحة: ${e.fields.map(f => f.key).join(', ')}`
      ).join('\n');

      let explicitContext = '';
      if (selectedEntity && selectedEntity !== 'none') {
        explicitContext += `الكيان المختار حصرياً: ${selectedEntity}. `;
      }
      if (selectedFields.length > 0) {
        explicitContext += `الحقول المطلوبة كأعمدة: ${selectedFields.join('، ')}. `;
      }
      if (centerFilter) {
        explicitContext += `المركز المطلوب: ${centerFilter}. `;
      }

      const systemPrompt = `أنت مساعد ذكي لتحليل الأوامر النصية وبناء استعلامات قاعدة بيانات لنظام إدارة صحي.

الكيانات المتاحة في النظام:
${entityDescriptions}

${explicitContext ? `سياق المستخدم الصريح: ${explicitContext}` : ''}

قواعد مهمة:
1. للفلترة على الأسماء العربية أو المراكز أو الأقسام استخدم regex متسامح مع الفروقات الإملائية.
   - الألف بأشكاله: [أإآا]
   - التاء المربوطة والهاء: [ةه]
   - الياء والألف المقصورة: [يى]
   مثال لـ "بطحي": {"$regex": "بطح[يى]", "$options": "i"}
   مثال لـ "أحمد": {"$regex": "[أإآا]حمد", "$options": "i"}
2. اختر الكيان الأنسب للطلب من القائمة أعلاه.
3. اختر الحقول الأكثر صلة بعنوان التقرير (عادة 4-8 حقول).
4. إذا طلب المستخدم "جميع" السجلات بدون فلتر محدد، اترك filters فارغاً ({}).

الطلب: "${textToExecute || 'استخراج جميع السجلات'}"

أرجع JSON فقط بهذا الشكل:
{
  "entity": "اسم الكيان",
  "filters": { ... regex filters ... },
  "fields": ["حقل1", "حقل2"],
  "title": "عنوان عربي مناسب للتقرير"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            entity: { type: 'string' },
            filters: { type: 'object', additionalProperties: true },
            fields: { type: 'array', items: { type: 'string' } },
            title: { type: 'string' },
          },
          required: ['entity', 'filters', 'fields', 'title'],
        },
      });

      const parsed = typeof response === 'string' ? JSON.parse(response) : response;

      // دمج الحقول المختارة يدوياً مع تلك المقترحة من LLM
      if (selectedFields.length > 0) {
        parsed.fields = Array.from(new Set([...selectedFields, ...(parsed.fields || [])]));
      }

      // احترام اختيار الكيان الصريح
      if (selectedEntity && selectedEntity !== 'none') {
        parsed.entity = selectedEntity;
      }

      if (!base44.entities[parsed.entity]) {
        toast.error(`الكيان "${parsed.entity}" غير موجود في النظام.`);
        setLoading(false);
        return;
      }

      setQueryInfo(parsed);
      const data = await base44.entities[parsed.entity].filter(parsed.filters || {});
      setResults(data);

      if (data.length === 0) {
        toast.info('تم التنفيذ بنجاح، لكن لا توجد نتائج مطابقة.');
      } else {
        toast.success(`تم استخراج ${data.length} سجل بنجاح.`);
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الأمر. يرجى المحاولة بصيغة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const renderCellValue = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'boolean') return val ? '✓ نعم' : '✗ لا';
    if (Array.isArray(val)) return val.join('، ') || '-';
    if (typeof val === 'object') {
      if (val['رقم_اللوحة_عربي']) return `لوحة: ${val['رقم_اللوحة_عربي']} | ${val['حالة_السيارة'] || '-'}`;
      if (val['متوفرة'] !== undefined) return val['متوفرة'] ? 'متوفرة' : 'غير متوفرة';
      return JSON.stringify(val);
    }
    return String(val);
  };

  const handleExportExcel = async () => {
    if (!results || results.length === 0) return;
    setExporting(true);
    try {
      await exportToExcel({
        title: queryInfo.title,
        entity: queryInfo.entity,
        fields: queryInfo.fields,
        results,
      });
      toast.success('تم تصدير ملف Excel بنجاح.');
    } catch (e) {
      console.error(e);
      toast.error('فشل تصدير Excel.');
    } finally {
      setExporting(false);
    }
  };

  const exportWord = () => {
    if (!results || results.length === 0) return;
    const headers = queryInfo.fields.map(f => getFieldLabel(queryInfo.entity, f));
    const tableHtml = `
      <table>
        <thead><tr><th>م</th>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${results.map((row, i) => `
            <tr>
              <td>${i + 1}</td>
              ${queryInfo.fields.map(f => `<td>${renderCellValue(row[f])}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    const html = `
      <html dir="rtl"><head><meta charset="utf-8"><title>${queryInfo.title}</title>
      <style>
        body { font-family: 'Cairo', Arial; direction: rtl; }
        h1 { text-align: center; color: #1E40AF; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: right; }
        th { background-color: #3B82F6; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #F8FAFC; }
      </style></head>
      <body><h1>${queryInfo.title}</h1>${tableHtml}</body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${queryInfo.title}.doc`;
    link.click();
  };

  const printTable = () => {
    if (!results || results.length === 0) return;
    const headers = queryInfo.fields.map(f => getFieldLabel(queryInfo.entity, f));
    const win = window.open('', '', 'width=1000,height=750');
    win.document.write(`
      <html dir="rtl"><head><title>${queryInfo.title}</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; padding: 25px; direction: rtl; }
        h1 { text-align: center; color: #1E40AF; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
        .info { text-align: center; color: #64748B; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: right; }
        th { background-color: #3B82F6; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #F8FAFC; }
        @media print { @page { size: A4 landscape; margin: 15mm; } }
      </style></head>
      <body>
        <h1>${queryInfo.title}</h1>
        <div class="info">عدد السجلات: ${results.length} | التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div>
        <table>
          <thead><tr><th>م</th>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>
            ${results.map((row, i) => `
              <tr><td>${i + 1}</td>${queryInfo.fields.map(f => `<td>${renderCellValue(row[f])}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    win.document.close();
  };

  const shareWhatsApp = () => {
    if (!results || results.length === 0) return;
    let text = `*${queryInfo.title}*\n\n`;
    results.slice(0, 20).forEach((row, i) => {
      text += `*${i + 1}.* ` + queryInfo.fields
        .map(f => `${getFieldLabel(queryInfo.entity, f)}: ${renderCellValue(row[f])}`)
        .join('\n') + '\n\n';
    });
    if (results.length > 20) text += `... وعدد ${results.length - 20} سجل إضافي.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareEmail = () => {
    if (!results || results.length === 0) return;
    let text = `${queryInfo.title}\n\n`;
    results.forEach((row, i) => {
      text += `${i + 1}. ` + queryInfo.fields
        .map(f => `${getFieldLabel(queryInfo.entity, f)}: ${renderCellValue(row[f])}`)
        .join(' | ') + '\n';
    });
    window.open(`mailto:?subject=${encodeURIComponent(queryInfo.title)}&body=${encodeURIComponent(text)}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">الأوامر الذكية</h1>
          <p className="text-slate-500 mt-1">
            مساعد ذكي مطلع على جميع بيانات النظام — اكتب طلبك بلغتك أو استخدم الفلاتر الاحترافية
          </p>
        </div>
      </div>

      {/* Main Input Card */}
      <Card className="border-t-4 border-t-indigo-500 shadow-md">
        <CardContent className="pt-6 space-y-4">
          {/* Advanced Options Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full md:w-auto flex items-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
            خيارات الفلترة والتخصيص الاحترافية
            {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {showAdvancedOptions && (
            <div className="p-4 border rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entity Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Database className="w-4 h-4" /> الكيان (مصدر البيانات)
                  </label>
                  <Select
                    value={selectedEntity}
                    onValueChange={(val) => {
                      setSelectedEntity(val);
                      setSelectedFields([]);
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="اختر الكيان (اختياري)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      <SelectItem value="none">بدون تحديد (تلقائي)</SelectItem>
                      {ENTITIES_CATALOG.map(ent => (
                        <SelectItem key={ent.value} value={ent.value}>
                          <span className="flex items-center gap-2">
                            <span>{ent.icon}</span>
                            <span>{ent.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Center Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Filter className="w-4 h-4" /> البحث في مركز معين
                  </label>
                  <Input
                    placeholder="مثال: بطحي، حراء، النفل..."
                    value={centerFilter}
                    onChange={(e) => setCenterFilter(e.target.value)}
                    className="bg-white"
                    list="centers-list"
                  />
                  <datalist id="centers-list">
                    {centersList.map(c => <option key={c} value={c} />)}
                  </datalist>
                  <p className="text-xs text-slate-500">يتجاهل الفروقات الإملائية تلقائياً.</p>
                </div>
              </div>

              {/* Fields Selector */}
              {currentEntity && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      الحقول المطلوبة ({selectedFields.length}/{currentEntity.fields.length})
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={selectAllFields} className="h-7 text-xs">
                        <CheckCircle2 className="w-3 h-3 ml-1" /> اختر الكل
                      </Button>
                      <Button size="sm" variant="ghost" onClick={clearFields} className="h-7 text-xs">
                        <X className="w-3 h-3 ml-1" /> مسح
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-3 bg-white border rounded-lg">
                    {currentEntity.fields.map(field => (
                      <Badge
                        key={field.key}
                        variant={selectedFields.includes(field.key) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          selectedFields.includes(field.key)
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'hover:bg-indigo-50'
                        }`}
                        onClick={() => toggleField(field.key)}
                      >
                        {field.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompt Textarea */}
          <Textarea
            placeholder="اكتب طلبك النصي هنا... أو استخدم الخيارات المتقدمة أعلاه"
            className="text-base p-4 min-h-[120px] resize-y bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          {/* Suggestions & Execute */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-wrap gap-2 flex-1">
              {suggestions.map((sug, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-indigo-100 text-xs py-1 px-2"
                  onClick={() => setPrompt(sug)}
                >
                  {sug}
                </Badge>
              ))}
            </div>

            <Button
              onClick={() => handleExecute()}
              disabled={loading}
              className="w-full lg:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 h-12 text-lg rounded-xl shadow-md flex-shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Sparkles className="w-5 h-5 ml-2" />}
              {loading ? 'جاري التنفيذ...' : 'تنفيذ الأمر'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {queryInfo && results && (
        <Card className="shadow-md animate-fade-in border-t-4 border-t-green-500">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-slate-800">{queryInfo.title}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-white">
                    {getEntityByValue(queryInfo.entity)?.icon} {getEntityByValue(queryInfo.entity)?.label || queryInfo.entity}
                  </Badge>
                  <span>
                    <span className="font-bold text-slate-700">{results.length}</span> نتيجة
                  </span>
                  <span>•</span>
                  <span>{queryInfo.fields.length} عمود</span>
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  {exporting ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 ml-1" />}
                  Excel احترافي
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
            {results.length > 0 ? (
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gradient-to-b from-slate-100 to-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-3 border-b text-slate-600 font-semibold w-12">#</th>
                      {queryInfo.fields.map((field, idx) => (
                        <th key={idx} className="p-3 border-b text-slate-600 font-semibold whitespace-nowrap">
                          {getFieldLabel(queryInfo.entity, field)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((row, rIdx) => (
                      <tr key={row.id || rIdx} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="p-3 text-slate-500 font-medium">{rIdx + 1}</td>
                        {queryInfo.fields.map((field, fIdx) => (
                          <td key={fIdx} className="p-3 text-slate-800">
                            {renderCellValue(row[field])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                لا توجد بيانات متاحة لهذا الطلب.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}