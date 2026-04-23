import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * يولّد عنوان التقرير والنص التعبيري تلقائياً بالذكاء الاصطناعي
 * بناء على: أسماء المكلفين + جهات التكليف + مجموعات الفترات + الأيام المحددة
 */
export default function AIAutoGenerate({
  selectedEmployees,
  assignmentCenters,
  assignmentGroups,
  onApply, // ({ title, narrative }) => void
}) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selectedEmployees || selectedEmployees.length === 0) {
      toast.error('الرجاء اختيار الموظفين المكلفين أولاً');
      return;
    }

    setLoading(true);
    try {
      // بناء ملخص البيانات للذكاء الاصطناعي
      const employeesSummary = selectedEmployees.map((emp) => {
        const assignCenter = assignmentCenters?.[emp.id];
        return {
          name: emp.full_name_arabic || '',
          position: emp.position || '',
          workplace: emp.المركز_الصحي || '',
          assigned_to: assignCenter ? (assignCenter.includes('شؤون') ? assignCenter : `مركز ${assignCenter}`) : '',
        };
      });

      const groupsSummary = (assignmentGroups || []).map((g, idx) => {
        const ids = g.employeeIds?.length > 0 ? g.employeeIds : selectedEmployees.map(e => e.id);
        const empNames = selectedEmployees
          .filter(e => ids.includes(e.id))
          .map(e => e.full_name_arabic)
          .filter(Boolean);
        const suffix = g.dateType === 'hijri' ? 'هـ' : 'م';
        let period = '';
        if (g.periodType === 'duration') {
          period = `لمدة ${g.durationText || ''} اعتباراً من ${g.fromDate || ''} ${suffix}`;
        } else if (g.fromDate || g.toDate) {
          period = `من ${g.fromDate || ''} إلى ${g.toDate || ''} ${suffix}`;
        }
        return {
          group_index: idx + 1,
          employees: empNames,
          period,
          specific_days: g.specificDays || [],
        };
      });

      const prompt = `أنت مساعد متخصص في صياغة الخطابات الرسمية الإدارية باللغة العربية الفصحى بأسلوب وزاري حكومي.

لديك بيانات تكليف موظفين كالتالي:

الموظفون المكلفون:
${JSON.stringify(employeesSummary, null, 2)}

مجموعات فترات التكليف:
${JSON.stringify(groupsSummary, null, 2)}

المطلوب:
1) صياغة "عنوان تقرير" رسمي مختصر وواضح يعكس طبيعة التكليف (مثال: "بيان بأسماء الموظفين المكلفين بالعمل خلال إجازة عيد الفطر لعام 1446هـ").
2) صياغة "نص تعبيري" تمهيدي رسمي للتقرير (جملة أو جملتين) يوضح الغرض ويستهل الجدول، بأسلوب إداري لائق يبدأ بصيغة مثل: "نرفق لسعادتكم..." أو "نفيد سعادتكم بأن..." أو "بالإشارة إلى..." — مع ذكر الفترة والأيام إن وجدت والجهات المكلف إليها بشكل طبيعي.

القواعد:
- لا تُدرج أسماء الموظفين داخل العنوان أو النص (سيظهرون في الجدول).
- استخدم التقويم المذكور في البيانات (هجري/ميلادي).
- إن تعددت الفترات فاذكرها بإيجاز.
- إن وُجدت أيام محددة فأدرجها بصيغة: "(أيام: ...)".
- لا تُضف أي مقدمات أو شروحات خارج JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'عنوان التقرير الرسمي' },
            narrative: { type: 'string', description: 'النص التعبيري التمهيدي' },
          },
          required: ['title', 'narrative'],
        },
      });

      if (response?.title || response?.narrative) {
        onApply({ title: response.title || '', narrative: response.narrative || '' });
        toast.success('تم توليد العنوان والنص التعبيري تلقائياً');
      } else {
        toast.error('لم يتم توليد نتيجة — حاول مرة أخرى');
      }
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء التوليد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-1"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" /> توليد العنوان والنص تلقائياً
        </>
      )}
    </Button>
  );
}