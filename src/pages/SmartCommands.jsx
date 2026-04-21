import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, FileSpreadsheet, Printer, Mail, MessageCircle, FileDown, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SmartCommands() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queryInfo, setQueryInfo] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [centerFilter, setCenterFilter] = useState('');

  const entitiesList = [
    { value: 'Employee', label: 'الموظفين', fields: ['full_name_arabic', 'full_name_english', 'رقم_الهوية', 'birth_date', 'gender', 'nationality', 'phone', 'email', 'position', 'department', 'job_category', 'qualification', 'rank', 'level', 'hire_date', 'contract_type', 'المركز_الصحي'] },
    { value: 'HealthCenter', label: 'المراكز الصحية', fields: ['اسم_المركز', 'المدير', 'نائب_المدير', 'المشرف_الفني', 'الموقع', 'ايميل_المركز', 'هاتف_المركز', 'فاكس_المركز', 'رقم_الشريحة', 'رقم_الجوال', 'حالة_المركز', 'قيمة_عقد_الايجار', 'اسم_المؤجر', 'معتمد_سباهي', 'مركز_نائي', 'ساعات_الدوام', 'عدد_الموظفين_الكلي', 'حالة_التشغيل', 'الخدمات_المقدمة', 'سيارة_خدمات', 'سيارة_اسعاف'] },
    { value: 'MedicalEquipment', label: 'الأجهزة الطبية', fields: ['equipment_name', 'health_center_name', 'department', 'status'] },
    { value: 'EquipmentRequest', label: 'طلبات الأجهزة', fields: ['device_name', 'health_center_name', 'requested_quantity', 'status'] },
    { value: 'DeficiencyReport', label: 'نواقص المراكز', fields: ['health_center', 'deficiency_type', 'description'] },
    { value: 'Leave', label: 'الإجازات', fields: ['employee_name', 'employee_id', 'health_center', 'leave_type', 'start_date', 'end_date', 'days_count', 'status'] }
  ];

  // Centers list for dropdown
  const [centersList, setCentersList] = useState([
    "بطحي", "حراء", "النفل", "الروابي", "الياسمين", "الصحافة", "المروج", "الربيع", "الندى", "الزهور", "التعاون",
    "الخزامى", "المنصورة", "العزيزية", "الشفاء", "بدر", "المروة", "الدار البيضاء", "الحزم", "نمار", "ديراب", "الشعلان",
    "اليمامة", "الفواز", "الشفا", "المصانع", "المنصورية"
  ]);

  React.useEffect(() => {
    // حاولنا جلب المراكز بشكل ديناميكي إذا أمكن
    base44.entities.HealthCenter.filter({}).then(data => {
      if (data && data.length > 0) {
        setCentersList(data.map(c => c["اسم_المركز"]).filter(Boolean));
      }
    }).catch(console.error);
  }, []);

  const suggestions = [
    "استخراج المشرفين الفنيين بالمراكز الصحية مع الاسم ورقم الجوال والمركز",
    "حصر السيارات (الإسعاف والخدمات) في جميع المراكز",
    "استخراج قائمة الأطباء في مركز صحي معين",
    "قائمة بالأجهزة الطبية المطلوبة للمراكز وحالتها",
    "استخراج بيانات مدراء المراكز الصحية"
  ];

  const handleExecute = async (overridePrompt = null) => {
    const textToExecute = overridePrompt || prompt;
    if (!textToExecute.trim() && !selectedEntity && !centerFilter) return;
    
    setLoading(true);
    setResults(null);
    setQueryInfo(null);
    
    try {
      let explicitContext = "";
      if (selectedEntity && selectedEntity !== 'none') explicitContext += `الكيان المختار حصرياً هو: ${selectedEntity}. `;
      if (selectedFields.length > 0) explicitContext += `الحقول المطلوبة إجبارياً كأعمدة هي: ${selectedFields.join('، ')}. `;
      if (centerFilter) explicitContext += `المركز المطلوب البحث عنه: ${centerFilter}. `;

      const systemPrompt = `أنت مساعد ذكي لتحليل الأوامر النصية وبناء استعلامات قاعدة بيانات لنظام إدارة صحي.
الكيانات المتاحة:
1. Employee (الموظفين): حقوله الهامة (full_name_arabic, full_name_english, رقم_الهوية, phone, email, position, المركز_الصحي, department, special_roles).
2. HealthCenter (المراكز الصحية): حقوله الهامة (اسم_المركز, المدير, المشرف_الفني, رقم_الجوال, هاتف_المركز, سيارة_خدمات, سيارة_اسعاف).
3. MedicalEquipment (الأجهزة الطبية): حقوله (equipment_name, health_center_name, department, status).
4. EquipmentRequest (طلبات الأجهزة): حقوله (device_name, health_center_name, requested_quantity, status).
5. DeficiencyReport (نواقص المراكز): حقوله (health_center, deficiency_type, description).

${explicitContext}

ملاحظة هامة جداً للبحث والفلترة: إذا كان هناك فلتر بناءً على اسم موظف، أو مركز صحي، أو قسم، أو أي نص عربي، يجب عليك استخدام صيغة الـ regex المتقدمة التي تتجاهل الفروقات الإملائية الشائعة.
مثلاً، استبدل الألف بمختلف أشكالها (أ، إ، آ، ا) والتاء المربوطة والهاء (ة، ه) والياء والألف المقصورة (ي، ى).
مثال لفلترة مركز "بطحي": استخدم {"المركز_الصحي": {"$regex": "بطح[يى]", "$options": "i"}}
مثال لفلترة موظف "أحمد": استخدم {"full_name_arabic": {"$regex": "[أإآا]حمد", "$options": "i"}}
لا تجعل البحث حرفياً أبداً في حقول الأسماء والمراكز بل استخدم regex متسامح.

بناءً على هذا الطلب: "${textToExecute}"

أرجع كائن JSON فقط يحتوي على:
{
  "entity": "اسم الكيان الصحيح للبحث (يجب أن يكون واحدًا من القائمة أو الكيان المختار صراحة)",
  "filters": { "اسم الحقل": { "$regex": "تعبير نمطي متسامح مع الفروقات الإملائية", "$options": "i" } }, // استخدم regex دائمًا للنصوص
  "fields": ["حقل1", "حقل2"], // الحقول المطلوبة كأعمدة.
  "title": "عنوان ملائم للتقرير"
}
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            entity: { type: "string" },
            filters: { type: "object", additionalProperties: true },
            fields: { type: "array", items: { type: "string" } },
            title: { type: "string" }
          },
          required: ["entity", "filters", "fields", "title"]
        }
      });

      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Merge selected fields if user manually selected them
      if (selectedFields.length > 0 && parsed.fields) {
        parsed.fields = Array.from(new Set([...selectedFields, ...parsed.fields]));
      }

      if (!base44.entities[parsed.entity]) {
        toast.error(`الكيان المسمى ${parsed.entity} غير معرف في النظام.`);
        setLoading(false);
        return;
      }

      setQueryInfo(parsed);
      
      // جلب البيانات من القاعدة
      const data = await base44.entities[parsed.entity].filter(parsed.filters);
      setResults(data);
      
      if (data.length === 0) {
        toast.info("تم تنفيذ الأمر لكن لا توجد نتائج مطابقة.");
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
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
    if (typeof val === 'object') {
      if (Array.isArray(val)) return val.join('، ');
      // فك كائنات السيارات كمثال
      if (val['رقم_اللوحة_عربي']) return `لوحة: ${val['رقم_اللوحة_عربي']} | حالة: ${val['حالة_السيارة'] || '-'}`;
      if (val['متوفرة'] !== undefined) return val['متوفرة'] ? 'متوفرة' : 'غير متوفرة';
      return JSON.stringify(val);
    }
    return String(val);
  };

  // دوال التصدير
  const exportExcel = () => {
    if (!results || results.length === 0) return;
    const headers = queryInfo.fields;
    const csvContent = [
      headers.join(','),
      ...results.map(row => headers.map(h => `"${String(renderCellValue(row[h])).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${queryInfo.title}.csv`;
    link.click();
  };

  const exportWord = () => {
    if (!results || results.length === 0) return;
    const tableHtml = document.getElementById('export-table-container').innerHTML;
    const html = `
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>${queryInfo.title}</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>${queryInfo.title}</h2>
          ${tableHtml}
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${queryInfo.title}.doc`;
    link.click();
  };

  const printTable = () => {
    if (!results || results.length === 0) return;
    const tableHtml = document.getElementById('export-table-container').innerHTML;
    const win = window.open('', '', 'width=900,height=700');
    win.document.write(`
      <html dir="rtl">
        <head>
          <title>${queryInfo.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px; }
            th { background-color: #f4f4f4; font-weight: bold; }
            h1 { text-align: center; color: #333; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${queryInfo.title}</h1>
          ${tableHtml}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const shareWhatsApp = () => {
    if (!results || results.length === 0) return;
    let text = `*${queryInfo.title}*\n\n`;
    results.forEach((row, i) => {
      text += `*${i+1}.* ` + queryInfo.fields.map(f => `${f}: ${renderCellValue(row[f])}`).join('\n') + '\n\n';
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareEmail = () => {
    if (!results || results.length === 0) return;
    let text = `${queryInfo.title}\n\n`;
    results.forEach((row, i) => {
      text += `${i+1}. ` + queryInfo.fields.map(f => `${f}: ${renderCellValue(row[f])}`).join(' | ') + '\n';
    });
    window.open(`mailto:?subject=${encodeURIComponent(queryInfo.title)}&body=${encodeURIComponent(text)}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">صفحة الأوامر الذكية</h1>
          <p className="text-slate-500 mt-1">اكتب طلبك بلغتك الطبيعية وسيقوم النظام بتنفيذه فوراً</p>
        </div>
      </div>

      <Card className="border-t-4 border-t-indigo-500 shadow-md">
        <CardContent className="pt-6">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="mb-4 w-full md:w-auto flex items-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
            >
              <SlidersHorizontal className="w-4 h-4" />
              خيارات الفلترة والتخصيص المتقدمة
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            </Button>
            
            {showAdvancedOptions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-xl bg-slate-50/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">تحديد الكيان (القائمة)</label>
                  <Select value={selectedEntity} onValueChange={(val) => { setSelectedEntity(val); setSelectedFields([]); }}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="اختر الكيان (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد (تلقائي)</SelectItem>
                      {entitiesList.map(ent => (
                        <SelectItem key={ent.value} value={ent.value}>{ent.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEntity && selectedEntity !== 'none' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">الحقول المطلوبة (للأعمدة)</label>
                    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-2 bg-white border rounded-md">
                      {entitiesList.find(e => e.value === selectedEntity)?.fields.map(field => (
                        <Badge 
                          key={field}
                          variant={selectedFields.includes(field) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedFields.includes(field)) {
                              setSelectedFields(selectedFields.filter(f => f !== field));
                            } else {
                              setSelectedFields([...selectedFields, field]);
                            }
                          }}
                        >
                          {field}
                        </Badge>
                      ))}
                      {selectedFields.length === 0 && <span className="text-xs text-slate-400 p-1">انقر على الحقول لتحديدها</span>}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">البحث في مركز معين (تلقائي التصحيح)</label>
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
                  <p className="text-xs text-slate-500">يكفي كتابة جزء من الاسم وسيتجاهل النظام الفروقات الإملائية.</p>
                </div>
              </div>
            )}
          </div>

          <Textarea 
            placeholder="اكتب طلبك النصي هنا... (يمكن تركها فارغة إذا استخدمت الخيارات المتقدمة أعلاه للبحث الشامل)"
            className="text-lg p-4 min-h-[120px] resize-y bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-indigo-100 text-xs py-1 px-2"
                  onClick={() => {
                    setPrompt(sug);
                    // Don't auto-execute if they just clicked a suggestion, let them edit or click execute.
                  }}
                >
                  {sug}
                </Badge>
              ))}
            </div>
            
            <Button 
              onClick={() => handleExecute()} 
              disabled={loading || (!prompt && !selectedEntity && !centerFilter)}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-lg rounded-xl shadow-md flex-shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Sparkles className="w-5 h-5 ml-2" />}
              {loading ? 'جاري التنفيذ...' : 'تنفيذ الأمر'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {queryInfo && results && (
        <Card className="shadow-md animate-fade-in border-t-4 border-t-green-500">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-slate-800">{queryInfo.title}</CardTitle>
                <CardDescription className="mt-1">
                  تم العثور على <span className="font-bold text-slate-700">{results.length}</span> نتيجة متطابقة
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportExcel} className="border-green-200 text-green-700 hover:bg-green-50">
                  <FileSpreadsheet className="w-4 h-4 ml-1" /> إكسيل
                </Button>
                <Button variant="outline" size="sm" onClick={exportWord} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <FileText className="w-4 h-4 ml-1" /> وورد
                </Button>
                <Button variant="outline" size="sm" onClick={printTable} className="border-slate-200 text-slate-700 hover:bg-slate-100">
                  <Printer className="w-4 h-4 ml-1" /> طباعة / PDF
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
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto p-4">
                <div id="export-table-container">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-3 border-b text-slate-600 font-semibold w-12">#</th>
                        {queryInfo.fields.map((field, idx) => (
                          <th key={idx} className="p-3 border-b text-slate-600 font-semibold">
                            {field.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((row, rIdx) => (
                        <tr key={row.id || rIdx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-slate-500">{rIdx + 1}</td>
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