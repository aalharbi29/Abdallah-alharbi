import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function NarrativeGenerator({ selectedCenter, selectedItems }) {
  const [showDialog, setShowDialog] = useState(false);
  const [narrativeText, setNarrativeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (!selectedCenter || selectedItems.length === 0) {
      toast.error('الرجاء اختيار مركز وإضافة عناصر للتقرير');
      return;
    }
    setIsGenerating(true);
    setShowDialog(true);
    setNarrativeText('');

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
- اكتب مقدمة رسمية مختصرة تذكر اسم المركز وتاريخ التقرير
- اذكر النواقص كنقاط مفصلة ومجزأة داخل النص باستخدام علامة (-) لكل نقطة
- استخدم أسلوب الخطابات الرسمية في وزارة الصحة
- اختم بطلب رسمي لتوفير هذه النواقص
- اجعل النص باللغة العربية الفصحى
- لا تستخدم عنواناً رئيسياً، ابدأ مباشرة بـ "نفيدكم" أو "نحيط علمكم"
- ضع النقاط المجزأة في وسط النص بشكل واضح مع سطر فارغ قبلها وبعدها`,
    });

    setNarrativeText(response);
    setIsGenerating(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(narrativeText);
    toast.success('تم نسخ النص');
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={generate}
        disabled={selectedItems.length === 0 || isGenerating}
        className="w-full h-11 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 gap-2"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
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
                  نص تعبيري رسمي - المركز الصحي: {selectedCenter} ({selectedItems.length} ناقص)
                </div>
                <Textarea
                  value={narrativeText}
                  onChange={(e) => setNarrativeText(e.target.value)}
                  className="min-h-[350px] text-base leading-loose border-2 border-gray-200 focus:border-indigo-400 resize-y"
                  dir="rtl"
                />
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <p>لا يوجد نص</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              إغلاق
            </Button>
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
                <Button
                  onClick={copyText}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  نسخ النص
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}