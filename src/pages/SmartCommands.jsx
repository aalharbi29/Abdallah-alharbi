import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, FileSpreadsheet, Printer, Mail, MessageCircle, FileDown } from 'lucide-react';
import { toast } from 'sonner';

export default function SmartCommands() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queryInfo, setQueryInfo] = useState(null);

  const suggestions = [
    "استخراج المشرفين الفنيين بالمراكز الصحية مع الاسم ورقم الجوال والمركز",
    "حصر السيارات (الإسعاف والخدمات) في جميع المراكز",
    "استخراج قائمة الأطباء في مركز صحي معين",
    "قائمة بالأجهزة الطبية المطلوبة للمراكز وحالتها",
    "استخراج بيانات مدراء المراكز الصحية"
  ];

  const handleExecute = async (overridePrompt = null) => {
    const textToExecute = overridePrompt || prompt;
    if (!textToExecute.trim()) return;
    
    setLoading(true);
    setResults(null);
    setQueryInfo(null);
    
    try {
      const systemPrompt = `أنت مساعد ذكي لتحليل الأوامر النصية وبناء استعلامات قاعدة بيانات لنظام إدارة صحي.
الكيانات المتاحة:
1. Employee (الموظفين): حقوله الهامة (full_name_arabic, full_name_english, رقم_الهوية, phone, email, position, المركز_الصحي, department, special_roles).
2. HealthCenter (المراكز الصحية): حقوله الهامة (اسم_المركز, المدير, المشرف_الفني, رقم_الجوال, هاتف_المركز, سيارة_خدمات, سيارة_اسعاف).
3. MedicalEquipment (الأجهزة الطبية): حقوله (equipment_name, health_center_name, department, status).
4. EquipmentRequest (طلبات الأجهزة): حقوله (device_name, health_center_name, requested_quantity, status).
5. DeficiencyReport (نواقص المراكز): حقوله (health_center, deficiency_type, description).

بناءً على هذا الطلب: "${textToExecute}"

أرجع كائن JSON فقط يحتوي على:
{
  "entity": "اسم الكيان الصحيح للبحث (يجب أن يكون واحدًا من القائمة)",
  "filters": { "اسم الحقل": "القيمة" }, // يمكنك استخدام { "$regex": "كلمة", "$options": "i" } للبحث النصي الجزئي أو تركه {} لجلب الكل.
  "fields": ["حقل1", "حقل2"], // الحقول التي يفضل المستخدم رؤيتها بالنتيجة كأعمدة. في حال طلب السيارات استخدم ["اسم_المركز", "سيارة_اسعاف", "سيارة_خدمات"].
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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
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
          <Textarea 
            placeholder="مثال: قم باستخراج المشرفين الفنيين بالمراكز الصحية وضع البيانات: الاسم عربي، المركز الصحي، رقم الجوال..."
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
                    handleExecute(sug);
                  }}
                >
                  {sug}
                </Badge>
              ))}
            </div>
            
            <Button 
              onClick={() => handleExecute()} 
              disabled={loading || !prompt}
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