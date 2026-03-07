import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, FileText, Copy, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

function buildExportHTML(narrativeText, selectedCenter, selectedItems, reportTitle) {
  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const hijriDate = new Date().toLocaleDateString('ar-SA-u-ca-islamic', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const paragraphs = narrativeText.split('\n').filter(l => l.trim()).map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('–')) {
      const text = trimmed.replace(/^[-•–]\s*/, '');
      return `<li>${text}</li>`;
    }
    return `</ul><p>${trimmed}</p><ul>`;
  }).join('\n');

  const bodyContent = `<ul>${paragraphs}</ul>`
    .replace(/<ul>\s*<\/ul>/g, '')
    .replace(/<ul>\s*<\/ul>/g, '');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${reportTitle || 'تقرير نواقص ' + selectedCenter}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',sans-serif;background:#fff;color:#1e293b;line-height:1.8;padding:30px 50px;}
.page{max-width:800px;margin:0 auto;}
.logo-header{text-align:center;padding:10px 0 12px;border-bottom:2px solid #0f766e;margin-bottom:25px;}
.logo-header img{max-height:160px;margin:0 auto;display:block;}
.letterhead{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:15px;margin-bottom:25px;}
.letterhead-right{text-align:right;}
.letterhead-left{text-align:left;color:#64748b;font-size:0.85rem;}
.org-name{font-size:1.1rem;font-weight:800;color:#0f766e;margin-bottom:4px;}
.org-sub{font-size:0.85rem;color:#475569;font-weight:600;}
.title-section{text-align:center;margin-bottom:30px;}
.title-section h1{font-size:1.3rem;font-weight:800;color:#0f766e;border:2px solid #0f766e;display:inline-block;padding:8px 40px;border-radius:8px;}
.meta-info{display:flex;justify-content:space-between;margin-bottom:25px;font-size:0.9rem;color:#475569;}
.content{font-size:1rem;line-height:2.2;text-align:justify;}
.content p{margin-bottom:10px;text-indent:20px;}
.content ul{margin:10px 25px;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:4px 20px;}
.content li{position:relative;padding-right:16px;margin-bottom:2px;line-height:1.6;width:calc(50% - 20px);}
.content li::before{content:"●";position:absolute;right:0;color:#0f766e;font-size:0.6rem;top:3px;}
.signature-section{margin-top:50px;display:flex;justify-content:space-between;gap:40px;}
.sig-box{flex:1;text-align:center;}
.sig-label{font-weight:700;color:#475569;font-size:0.9rem;margin-bottom:8px;}
.sig-line{border-bottom:2px solid #cbd5e1;height:50px;margin-bottom:8px;}
.sig-name{font-size:0.85rem;color:#64748b;}
.footer-line{margin-top:40px;border-top:2px solid #e2e8f0;padding-top:15px;text-align:center;font-size:0.8rem;color:#94a3b8;}
.stamp-area{margin-top:30px;text-align:center;}
.stamp-box{display:inline-block;width:120px;height:120px;border:2px dashed #cbd5e1;border-radius:12px;line-height:120px;color:#94a3b8;font-size:0.8rem;}
@media print{
  body{padding:20px 40px;font-size:11pt;}
  @page{size:A4;margin:15mm 20mm;}
  .no-print{display:none!important;}
}
</style>
</head>
<body>
<div class="page">
  <div class="logo-header">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png" alt="تجمع المدينة المنورة الصحي" />
  </div>
  <div class="letterhead">
    <div class="letterhead-right">
      <div class="org-name">وزارة الصحة</div>
      <div class="org-sub">مستشفى الحسو العام</div>
      <div class="org-sub">شؤون المراكز الصحية</div>
    </div>
    <div class="letterhead-left">
      <div>${today}</div>
      <div>${hijriDate}</div>
    </div>
  </div>

  <div class="title-section">
    <h1>${reportTitle || 'تقرير نواقص المركز الصحي'}</h1>
  </div>

  <div class="content">
    ${bodyContent}
  </div>

  <div class="signature-section">
    <div class="sig-box">
      <div class="sig-label">مدير المركز الصحي</div>
      <div class="sig-line"></div>
      <div class="sig-name">الاسم: ........................</div>
    </div>
    <div class="sig-box">
      <div class="stamp-area"><div class="stamp-box">الختم</div></div>
    </div>
    <div class="sig-box">
      <div class="sig-label">المساعد لشؤون المراكز</div>
      <div class="sig-line"></div>
      <div class="sig-name">الاسم: ........................</div>
    </div>
  </div>

  <div class="footer-line" style="display:flex;justify-content:space-between;align-items:center;">
    <div style="text-align:right;">تم إنشاء هذا التقرير بواسطة نظام إدارة المراكز الصحية - الحسو</div>
    <div style="text-align:left;font-size:0.75rem;color:#94a3b8;">${today} | ${hijriDate}</div>
  </div>
</div>
</body>
</html>`;
}

export default function NarrativeGenerator({ selectedCenter, selectedItems }) {
  const [showDialog, setShowDialog] = useState(false);
  const [narrativeText, setNarrativeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  const generate = async () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }
    setIsGenerating(true);
    setShowDialog(true);
    setNarrativeText('');
    if (!reportTitle) setReportTitle(`تقرير نواقص المركز الصحي - ${selectedCenter}`);

    const medItems = selectedItems.filter(i => i.type === 'medical');
    const nonMedItems = selectedItems.filter(i => i.type === 'nonmedical');

    let itemsList = '';
    if (medItems.length > 0) {
      itemsList += 'التجهيزات الطبية الناقصة:\n';
      medItems.forEach(i => { itemsList += `- ${i.name} (العدد: ${i.quantity})\n`; });
    }
    if (nonMedItems.length > 0) {
      itemsList += '\nالتجهيزات غير الطبية الناقصة:\n';
      nonMedItems.forEach(i => { itemsList += `- ${i.name} (العدد: ${i.quantity})\n`; });
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `أنت كاتب رسمي في وزارة الصحة السعودية. اكتب نصاً تعبيرياً رسمياً يصف نواقص المركز الصحي التالي:

المركز الصحي: ${selectedCenter}
عدد النواقص الإجمالي: ${selectedItems.length} (${medItems.length} طبي، ${nonMedItems.length} غير طبي)

${itemsList}

المطلوب:
- اكتب مقدمة رسمية مختصرة تذكر اسم المركز
- اذكر النواقص كنقاط مفصلة ومجزأة داخل النص باستخدام علامة (-) لكل نقطة مع ذكر العدد
- استخدم أسلوب الخطابات الرسمية في وزارة الصحة
- اختم بطلب رسمي لتوفير هذه النواقص
- اجعل النص باللغة العربية الفصحى
- لا تستخدم عنواناً رئيسياً، ابدأ مباشرة بـ "نفيدكم" أو "نحيط علمكم"
- ضع النقاط المجزأة في وسط النص بشكل واضح مع سطر فارغ قبلها وبعدها
- لا تضع نجوم أو رموز ماركداون`,
    });

    setNarrativeText(response);
    setIsGenerating(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(narrativeText);
    toast.success('تم نسخ النص');
  };

  const exportHTML = () => {
    const html = buildExportHTML(narrativeText, selectedCenter, selectedItems, reportTitle);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle || 'تقرير-نواقص'}-${selectedCenter}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير الملف بصيغة HTML');
  };

  const printAsPDF = () => {
    const html = buildExportHTML(narrativeText, selectedCenter, selectedItems, reportTitle);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={generate}
        disabled={selectedItems.length === 0 || isGenerating}
        className="w-full h-11 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 gap-2"
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        تحويل لنص تعبيري بالذكاء الاصطناعي
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              النص التعبيري لتقرير النواقص
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="font-medium">جاري إنشاء النص التعبيري...</p>
                <p className="text-sm text-gray-400 mt-1">يتم تحليل {selectedItems.length} عنصر من نواقص {selectedCenter}</p>
              </div>
            ) : narrativeText ? (
              <>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  يمكنك تعديل النص مباشرة ثم تصديره كملف PDF أو HTML
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">عنوان التقرير</Label>
                  <Input
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="h-10 border-2 border-gray-200 focus:border-indigo-400"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">نص التقرير (قابل للتعديل)</Label>
                  <Textarea
                    value={narrativeText}
                    onChange={(e) => setNarrativeText(e.target.value)}
                    className="min-h-[300px] text-base leading-loose border-2 border-gray-200 focus:border-indigo-400 resize-y"
                    dir="rtl"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <p>لا يوجد نص</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>إغلاق</Button>
            {narrativeText && (
              <>
                <Button
                  variant="outline"
                  onClick={generate}
                  disabled={isGenerating}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  إعادة التوليد
                </Button>
                <Button variant="outline" onClick={copyText} className="border-gray-200">
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ
                </Button>
                <Button
                  variant="outline"
                  onClick={exportHTML}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 ml-2" />
                  HTML
                </Button>
                <Button onClick={printAsPDF} className="bg-indigo-600 hover:bg-indigo-700">
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة / PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}