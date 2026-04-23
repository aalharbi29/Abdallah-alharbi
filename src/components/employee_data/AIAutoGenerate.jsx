import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * يولّد عنوان التقرير والنص التعبيري تلقائياً بالذكاء الاصطناعي
 * بناءً على: أسماء المكلفين + تخصصاتهم + جهات التكليف + مجموعات الفترات + الأيام المحددة
 *
 * النمط المعتمد:
 * - العنوان: "خطة تغطية مركز [الجهة المكلَّف بها] - [التخصص]"
 * - النص: ترويسة ثابتة ("سعادة مدير مستشفى الحسو العام ... السلام عليكم ورحمة الله وبركاته")
 *   يليها نص رسمي يذكر تمتع [تخصص] المركز بإجازته، ويرفع خطة التغطية بتكليف [التخصص]/الاسم،
 *   مع الفترة/المدة/الأيام، ويُختم بـ "نأمل التكرم بالاطلاع والنظر بخطة التغطية ..."
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
      // بناء ملخص بيانات المكلفين
      const employeesSummary = selectedEmployees.map((emp) => {
        const assignCenter = assignmentCenters?.[emp.id];
        return {
          name: emp.full_name_arabic || '',
          position: emp.position || '',
          workplace: emp.المركز_الصحي || '',
          assigned_to: assignCenter
            ? (assignCenter.includes('شؤون') ? assignCenter : `مركز ${assignCenter}`)
            : '',
          assigned_to_raw: assignCenter || '',
        };
      });

      const groupsSummary = (assignmentGroups || []).map((g, idx) => {
        const ids = g.employeeIds?.length > 0 ? g.employeeIds : selectedEmployees.map(e => e.id);
        const empNames = selectedEmployees
          .filter(e => ids.includes(e.id))
          .map(e => e.full_name_arabic)
          .filter(Boolean);
        const suffix = g.dateType === 'hijri' ? 'هـ' : 'م';
        return {
          group_index: idx + 1,
          employees: empNames,
          date_type: g.dateType,
          period_type: g.periodType || 'range',
          from_date: g.fromDate || '',
          to_date: g.toDate || '',
          duration_text: g.durationText || '',
          suffix,
          specific_days: g.specificDays || [],
        };
      });

      const prompt = `أنت مساعد متخصص في صياغة الخطابات الإدارية الرسمية باللغة العربية الفصحى بأسلوب وزاري حكومي دقيق. مهمتك توليد "عنوان التقرير" و"النص التعبيري" فقط، وفقاً للنمط المعتمد أدناه حرفياً.

البيانات المتاحة:

الموظفون المكلفون (مع تخصصاتهم وجهات تكليفهم):
${JSON.stringify(employeesSummary, null, 2)}

مجموعات فترات التكليف:
${JSON.stringify(groupsSummary, null, 2)}

==========================
النمط المعتمد للعنوان:
==========================
"خطة تغطية [الجهة المكلَّف بها من حقل assigned_to] - [التخصص]"

أمثلة:
- إذا كان التخصص "طبيب" والتكليف إلى "مركز الحسو" ⇒ "خطة تغطية مركز الحسو - طبيب"
- إذا كان التخصص "ممرض" أو "ممرضة" ⇒ "خطة تغطية مركز [كذا] - تمريض"
- إذا كان "صيدلي" ⇒ "خطة تغطية مركز [كذا] - صيدلة"
- عمّم القاعدة على أي تخصص آخر (مختبر، أشعة، أسنان، إلخ) بنفس الأسلوب.

إذا تعدد المكلفون بتخصصات مختلفة لنفس المركز ⇒ اجمع التخصصات بفاصلة. مثال: "خطة تغطية مركز الحسو - طبيب، تمريض".
إذا تعددت جهات التكليف ⇒ استخدم أقرب صياغة جامعة بنفس النسق.

==========================
النمط المعتمد للنص التعبيري:
==========================
ابدأ النص حرفياً بترويسة الخطاب كما يلي (مع الحفاظ على المسافات والأسطر كما هي تماماً):

سعادة مدير مستشفى الحسو العام                   حفظه الله
     السلام عليكم ورحمة الله وبركاته

ثم يليها سطر فارغ، ثم الفقرة الرسمية بالنمط التالي (عدّل الكلمات حسب التخصص والبيانات):

"نظراً لتمتع [تخصص الموظف صاحب الإجازة في مركز assigned_to] بإجازته السنوية اعتباراً من [تاريخ بداية الإجازة — إن تعذّر استنباطه اتركه فراغاً مناسباً: '.......']، نرفع لكم خطة تغطية المركز [أضف "جزئياً" هنا فقط إذا كانت specific_days غير فارغة] بتكليف [التخصص بصيغة المفرد/الجمع حسب العدد] / [أسماء المكلفين مفصولة بفواصل] اعتباراً من [from_date][ suffix] [ والموافق — إن توفر] ولمدة [duration_text إن وُجد، وإلا اذكر الفترة: 'من from_date إلى to_date suffix'] [وإن وُجدت أيام محددة أضف: '(كل يوم [الأيام مفصولة بفواصل])' أو الصياغة الأنسب مثل: 'بواقع أيام: ...']. نأمل التكرم بالاطلاع والنظر بخطة التغطية، وفي حال إقرارها نرجو الرفع لمن يلزم بإصدار قرار التكليف."

قواعد حرجة:
- حافظ حرفياً على ترويسة "سعادة مدير مستشفى الحسو العام                   حفظه الله" والسطر "     السلام عليكم ورحمة الله وبركاته" دون أي تغيير في المسافات أو الألفاظ.
- استخدم التخصص المناسب: إن كان "طبيب" ⇒ "طبيب"، إن كان "ممرض/ممرضة" ⇒ "ممرض" أو "تمريض" حسب السياق، صيدلي ⇒ "صيدلي"، فني مختبر ⇒ "فني مختبر"، إلخ. حافظ على نفس النسق مع تغيير التخصص فقط.
- صياغة "لمدة": إن كانت period_type = "duration" فاستخدم duration_text كما هو. إن كانت "range" فاذكر "من from_date إلى to_date suffix".
- "جزئياً" تُضاف فقط إذا كانت specific_days غير فارغة.
- لا تذكر أسماء موظفين آخرين غير المكلفين المذكورين في employeesSummary.
- لا تضف أي مقدمات أو تعليقات خارج حقل narrative.
- أعِد النتيجة كـ JSON فقط.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'عنوان التقرير الرسمي حسب النمط' },
            narrative: { type: 'string', description: 'النص التعبيري الكامل شاملاً الترويسة' },
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