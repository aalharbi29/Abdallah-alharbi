import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RATING_SCALE = [
  { score: 5, label: "ممتاز", labelEn: "Excellent", description: "حقق كل أهدافه وتخطى المستهدفات المحددة بالمستوى المطلوب." },
  { score: 4, label: "جيد جدا", labelEn: "Very Good", description: "حقق كل أهدافه بالمستوى المطلوب." },
  { score: 3, label: "جيد", labelEn: "Good", description: "حقق معظم أهدافه بالمستوى المطلوب." },
  { score: 2, label: "مرضي", labelEn: "Satisfactory", description: "الأداء أقل من التوقعات، وحقق بعضاً من أهدافه." },
  { score: 1, label: "غير مرضي", labelEn: "Unsatisfactory", description: "الأداء أقل من التوقعات بشكل دائم." }
];

export default function FinalRatingSection({ data, setData }) {
  return (
    <div className="space-y-6">
      <div className="bg-green-700 text-white py-3 px-5 rounded-xl">
        <h3 className="text-lg font-bold">التقدير العام لأداء الموظف</h3>
      </div>

      {/* Rating Scale Reference */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" dir="rtl">
          <thead>
            <tr className="bg-green-50">
              <th className="border border-gray-300 p-2">التصنيف</th>
              <th className="border border-gray-300 p-2">التقدير العام</th>
              <th className="border border-gray-300 p-2">الوصف</th>
            </tr>
          </thead>
          <tbody>
            {RATING_SCALE.map(r => (
              <tr key={r.score} className={data.overall_rating_text === r.label ? 'bg-green-100' : 'hover:bg-gray-50'}>
                <td className="border border-gray-300 p-2 text-center font-bold">{r.score}</td>
                <td className="border border-gray-300 p-2 text-center font-semibold">{r.label} - {r.labelEn}</td>
                <td className="border border-gray-300 p-2 text-xs">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Evaluation Cycle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
        <div className="space-y-2">
          <Label className="font-bold">دورة التقييم:</Label>
          <Select
            value={data.evaluation_cycle || ''}
            onValueChange={(val) => setData(prev => ({ ...prev, evaluation_cycle: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="سنوي">سنوي</SelectItem>
              <SelectItem value="مراجعة نصف سنوية">مراجعة نصف سنوية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-bold">الجاهزية للترقية:</Label>
          <Input
            value={data.promotion_readiness || ''}
            onChange={(e) => setData(prev => ({ ...prev, promotion_readiness: e.target.value }))}
            placeholder="الجاهزية للترقية"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">تاريخ التقييم:</Label>
          <Input
            type="date"
            value={data.evaluation_date || ''}
            onChange={(e) => setData(prev => ({ ...prev, evaluation_date: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">التقدير العام:</Label>
          <Select
            value={data.overall_rating_text || ''}
            onValueChange={(val) => setData(prev => ({ ...prev, overall_rating_text: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر التقدير..." />
            </SelectTrigger>
            <SelectContent>
              {RATING_SCALE.map(r => (
                <SelectItem key={r.score} value={r.label}>{r.score} - {r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Strength & Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-bold text-green-700">نقاط القوة Strength Points:</Label>
          <Textarea
            value={data.strength_points || ''}
            onChange={(e) => setData(prev => ({ ...prev, strength_points: e.target.value }))}
            placeholder="اذكر نقاط القوة..."
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-orange-700">النقاط التي تحتاج إلى تطوير:</Label>
          <Textarea
            value={data.improvement_points || ''}
            onChange={(e) => setData(prev => ({ ...prev, improvement_points: e.target.value }))}
            placeholder="اذكر نقاط التطوير..."
            rows={4}
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label className="font-bold">الملاحظات Remarks:</Label>
        <Textarea
          value={data.remarks || ''}
          onChange={(e) => setData(prev => ({ ...prev, remarks: e.target.value }))}
          placeholder="أدخل الملاحظات..."
          rows={3}
        />
      </div>

      {/* Justifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-bold">المبررات (في حالة ممتاز أو غير مرضي):</Label>
          <Textarea
            value={data.justifications || ''}
            onChange={(e) => setData(prev => ({ ...prev, justifications: e.target.value }))}
            placeholder="المبررات..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">الوثائق الداعمة:</Label>
          <Textarea
            value={data.supporting_documents || ''}
            onChange={(e) => setData(prev => ({ ...prev, supporting_documents: e.target.value }))}
            placeholder="الوثائق الداعمة..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}