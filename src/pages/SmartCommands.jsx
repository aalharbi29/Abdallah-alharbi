import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Sparkles, FileText, FileSpreadsheet, Printer, Mail, MessageCircle,
  Database, MapPin, Columns3, Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { ENTITIES_CATALOG, getEntityByValue, getFieldLabel } from '@/components/smart_commands/entitiesCatalog';
import { exportToExcel, getNestedValue } from '@/components/smart_commands/excelExporter';
import { getCombinedRolesText } from '@/components/utils/combinedRoles';
import CollapsibleSection from '@/components/smart_commands/CollapsibleSection';
import RequestTypeSelector from '@/components/smart_commands/RequestTypeSelector';
import CentersPicker from '@/components/smart_commands/CentersPicker';
import FieldsPicker from '@/components/smart_commands/FieldsPicker';

// توحيد النص العربي لتجاهل الفروقات الإملائية (أ، إ، آ → ا | ة → ه | ى → ي)
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

// اسم الحقل المستخدم للفلترة على المركز حسب الكيان
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

  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [centersList, setCentersList] = useState([]);

  const currentEntity = useMemo(
    () => (selectedEntity ? getEntityByValue(selectedEntity) : null),
    [selectedEntity]
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

  // إذا تغير الكيان، أعِد تعيين الحقول
  useEffect(() => {
    setSelectedFields([]);
  }, [selectedEntity]);

  const handleExecute = async () => {
    if (!selectedEntity && !prompt.trim()) {
      toast.warning('اختر نوع البيانات المطلوبة أو اكتب وصفاً نصياً لطلبك.');
      return;
    }

    setLoading(true);
    setResults(null);
    setQueryInfo(null);

    try {
      let finalEntity = selectedEntity;
      let finalFields = [...selectedFields];
      let finalTitle = '';

      // إذا كان هناك نص، نطلب من الذكاء الاصطناعي تحليله لإكمال المفقود
      if (prompt.trim()) {
        const entityDescriptions = ENTITIES_CATALOG.map((e) =>
          `- ${e.value} (${e.label})`
        ).join('\n');

        const fieldsContext = currentEntity
          ? `الحقول المتاحة في ${selectedEntity}: ${currentEntity.fields.map((f) => `${f.key} (${f.label})`).join('; ')}`
          : '';

        const aiPrompt = `أنت مساعد لتحليل طلبات بالعربية وبناء تقارير من نظام إدارة صحي.
الكيانات المتاحة:
${entityDescriptions}

${selectedEntity ? `الكيان المختار مسبقاً: ${selectedEntity}` : 'اختر الكيان الأنسب من القائمة.'}
${fieldsContext}
${selectedFields.length > 0 ? `الحقول المختارة مسبقاً: ${selectedFields.join('، ')}` : ''}

الطلب: "${prompt}"

أرجع JSON فقط بهذا الشكل:
{
  "entity": "اسم الكيان",
  "fields": ["حقل1", "حقل2"],
  "title": "عنوان عربي مناسب للتقرير"
}
ملاحظة: أضف حقولاً إضافية مفيدة إذا اقتضى الطلب ذلك، لكن لا تُلغِ الحقول المختارة مسبقاً.`;

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
        // دمج حقول الذكاء الاصطناعي مع الحقول المختارة يدوياً
        finalFields = Array.from(new Set([...finalFields, ...(parsed.fields || [])]));
        finalTitle = parsed.title;
      }

      if (!finalEntity) {
        toast.error('تعذّر تحديد نوع البيانات المطلوبة.');
        setLoading(false);
        return;
      }

      if (!base44.entities[finalEntity]) {
        toast.error(`الكيان "${finalEntity}" غير موجود في النظام.`);
        setLoading(false);
        return;
      }

      // إذا لم يحدد المستخدم حقولاً ولا وجدها الذكاء الاصطناعي، استخدم أول 6 حقول افتراضية
      if (finalFields.length === 0) {
        const entityCat = getEntityByValue(finalEntity);
        finalFields = entityCat ? entityCat.fields.slice(0, 6).map((f) => f.key) : [];
      }

      if (!finalTitle) {
        finalTitle = `تقرير ${getEntityByValue(finalEntity)?.label || finalEntity}`;
      }

      // جلب جميع السجلات ثم فلترة محلية ذكية للمراكز
      let allData = await base44.entities[finalEntity].filter({});

      // 🧠 دمج "مهام إضافية" للموظفين (أدوار قيادية/إشرافية مستقاة من المراكز + special_roles)
      if (finalEntity === 'Employee' && finalFields.includes('__combined_roles')) {
        try {
          const allCenters = await base44.entities.HealthCenter.filter({});
          allData = allData.map((emp) => ({
            ...emp,
            __combined_roles: getCombinedRolesText(emp, allCenters),
          }));
        } catch (err) {
          console.warn('تعذّر جلب المراكز لدمج المهام الإضافية:', err);
        }
      }

      // 🔗 دمج ذكي: إذا كان الكيان HealthCenter واختار المستخدم حقول المدراء/المشرف،
      // نستبدل معرّف الموظف ببياناته الفعلية (الاسم، الجوال، التخصص)
      if (finalEntity === 'HealthCenter') {
        const managerFields = [
          'المدير', 'نائب_المدير', 'المشرف_الفني',
          'المدير_جوال', 'المدير_تخصص',
          'نائب_المدير_جوال', 'نائب_المدير_تخصص',
          'المشرف_الفني_جوال', 'المشرف_الفني_تخصص',
        ];
        const needsLookup = managerFields.some((f) => finalFields.includes(f));
        if (needsLookup) {
          try {
            const allEmployees = await base44.entities.Employee.filter({});
            const empMap = new Map();
            allEmployees.forEach((e) => {
              // نخزن بالمعرف الداخلي id ورقم الموظف والهوية لتغطية كل الحالات
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
                المدير_تخصص: dirEmp?.position || '-',
                نائب_المدير_جوال: vdirEmp?.phone || '-',
                نائب_المدير_تخصص: vdirEmp?.position || '-',
                المشرف_الفني_جوال: supEmp?.phone || '-',
                المشرف_الفني_تخصص: supEmp?.position || '-',
              };
            });
          } catch (err) {
            console.warn('تعذّر جلب بيانات الموظفين للدمج:', err);
          }
        }
      }

      let filtered = allData;
      if (selectedCenters.length > 0) {
        const centerField = getCenterFieldForEntity(finalEntity);
        if (centerField) {
          const normalizedTargets = selectedCenters.map(normalizeArabic);
          filtered = allData.filter((row) => {
            const centerVal = getNestedValue(row, centerField);
            if (!centerVal) return false;
            const normVal = normalizeArabic(centerVal);
            return normalizedTargets.some((t) => normVal.includes(t) || t.includes(normVal));
          });
        }
      }

      setQueryInfo({ entity: finalEntity, fields: finalFields, title: finalTitle });
      setResults(filtered);

      if (filtered.length === 0) {
        toast.info('تم التنفيذ، لكن لا توجد نتائج مطابقة.');
      } else {
        toast.success(`تم استخراج ${filtered.length} سجل بنجاح.`);
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الأمر.');
    } finally {
      setLoading(false);
    }
  };

  const renderCellValue = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'boolean') return val ? '✓ نعم' : '✗ لا';
    if (Array.isArray(val)) return val.join('، ') || '-';
    if (typeof val === 'object') {
      if (val['رقم_اللوحة_عربي']) return `${val['رقم_اللوحة_عربي']} | ${val['حالة_السيارة'] || '-'}`;
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
    const headers = queryInfo.fields.map((f) => getFieldLabel(queryInfo.entity, f));
    const tableHtml = `
      <table>
        <thead><tr><th>م</th>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${results
            .map(
              (row, i) => `
            <tr><td>${i + 1}</td>${queryInfo.fields
                .map((f) => `<td>${renderCellValue(getNestedValue(row, f))}</td>`)
                .join('')}</tr>`
            )
            .join('')}
        </tbody>
      </table>`;
    const html = `<html dir="rtl"><head><meta charset="utf-8"><title>${queryInfo.title}</title>
      <style>
        body { font-family: 'Cairo', Arial; direction: rtl; }
        h1 { text-align: center; color: #1E40AF; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: right; }
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
    const headers = queryInfo.fields.map((f) => getFieldLabel(queryInfo.entity, f));
    const win = window.open('', '', 'width=1000,height=750');
    win.document.write(`<html dir="rtl"><head><title>${queryInfo.title}</title>
      <style>
        body { font-family: 'Cairo', Arial; padding: 25px; direction: rtl; }
        h1 { text-align: center; color: #1E40AF; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
        .info { text-align: center; color: #64748B; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: right; }
        th { background-color: #3B82F6; color: white; }
        tr:nth-child(even) { background-color: #F8FAFC; }
        @media print { @page { size: A4 landscape; margin: 15mm; } }
      </style></head><body>
        <h1>${queryInfo.title}</h1>
        <div class="info">عدد السجلات: ${results.length} | ${new Date().toLocaleDateString('ar-SA')}</div>
        <table><thead><tr><th>م</th>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${results
          .map(
            (row, i) =>
              `<tr><td>${i + 1}</td>${queryInfo.fields
                .map((f) => `<td>${renderCellValue(getNestedValue(row, f))}</td>`)
                .join('')}</tr>`
          )
          .join('')}</tbody></table>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>`);
    win.document.close();
  };

  const shareWhatsApp = () => {
    if (!results || results.length === 0) return;
    let text = `*${queryInfo.title}*\n\n`;
    results.slice(0, 20).forEach((row, i) => {
      text += `*${i + 1}.* ` + queryInfo.fields
        .map((f) => `${getFieldLabel(queryInfo.entity, f)}: ${renderCellValue(getNestedValue(row, f))}`)
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
        .map((f) => `${getFieldLabel(queryInfo.entity, f)}: ${renderCellValue(getNestedValue(row, f))}`)
        .join(' | ') + '\n';
    });
    window.open(`mailto:?subject=${encodeURIComponent(queryInfo.title)}&body=${encodeURIComponent(text)}`);
  };

  const canExecute = selectedEntity || prompt.trim();

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
            اختر نوع البيانات ثم حدد المراكز والحقول، أو اكتب طلبك نصياً وسيتولى الذكاء الاصطناعي الباقي
          </p>
        </div>
      </div>

      {/* الخطوة 1: نوع البيانات المطلوبة */}
      <CollapsibleSection
        title="١. حدد نوع البيانات المطلوبة"
        icon={Database}
        iconColor="text-indigo-600"
        badgeCount={selectedEntity ? 1 : 0}
        defaultOpen={true}
      >
        <RequestTypeSelector selectedEntity={selectedEntity} onSelect={setSelectedEntity} />
        {currentEntity && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-indigo-200 text-sm text-slate-600">
            <strong className="text-indigo-700">المختار:</strong> {currentEntity.icon} {currentEntity.label}
            {' '}({currentEntity.fields.length} حقل متاح)
          </div>
        )}
      </CollapsibleSection>

      {/* الخطوة 2 و 3: المراكز والحقول جنباً إلى جنب */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CollapsibleSection
          title="٢. حدد المراكز المطلوبة"
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

        <CollapsibleSection
          title="٣. حدد الحقول (الأعمدة) المطلوبة"
          icon={Columns3}
          iconColor="text-green-600"
          badgeCount={selectedFields.length}
          defaultOpen={false}
        >
          <FieldsPicker
            entity={currentEntity}
            selectedFields={selectedFields}
            onChange={setSelectedFields}
          />
        </CollapsibleSection>
      </div>

      {/* الخطوة 4: نص ذكي اختياري */}
      <CollapsibleSection
        title="٤. وصف نصي إضافي للذكاء الاصطناعي (اختياري)"
        icon={Wand2}
        iconColor="text-purple-600"
        defaultOpen={false}
      >
        <Textarea
          placeholder="مثال: استخرج المراكز التي ينتهي عقد إيجارها خلال 3 أشهر مع بيانات المؤجر..."
          className="text-base p-4 min-h-[100px] resize-y bg-white"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="text-xs text-slate-500 mt-2">
          💡 الذكاء الاصطناعي سيكمل الحقول المفقودة ويولّد عنوان التقرير بناءً على وصفك.
        </p>
      </CollapsibleSection>

      {/* زر التنفيذ */}
      <div className="flex justify-center sticky bottom-4 z-20">
        <Button
          onClick={handleExecute}
          disabled={loading || !canExecute}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-12 h-14 text-lg rounded-xl shadow-2xl"
        >
          {loading ? <Loader2 className="w-6 h-6 ml-2 animate-spin" /> : <Sparkles className="w-6 h-6 ml-2" />}
          {loading ? 'جاري التنفيذ...' : 'تنفيذ الأمر واستخراج البيانات'}
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
                    {getEntityByValue(queryInfo.entity)?.icon}{' '}
                    {getEntityByValue(queryInfo.entity)?.label || queryInfo.entity}
                  </Badge>
                  <span><strong className="text-slate-700">{results.length}</strong> نتيجة</span>
                  <span>•</span>
                  <span>{queryInfo.fields.length} عمود</span>
                  {selectedCenters.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{selectedCenters.length} مركز</span>
                    </>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={exporting}
                  className="border-green-200 text-green-700 hover:bg-green-50">
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
                            {renderCellValue(getNestedValue(row, field))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات متاحة.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}