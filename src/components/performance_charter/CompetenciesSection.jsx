import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COMPETENCIES_DATA = [
  {
    name: "حس المسؤولية",
    behaviors: [
      "يتحمل مسؤولية أعماله وقراراته، ولا يلقى اللوم على الآخرين.",
      "يفهم دوره، وكيفية ارتباطه بالأهداف العامة لجهة عمله.",
      "يساهم في تطوير وتنفيذ فرص رفع كفاءة الإنفاق وإنجاز المهمة الموكلة له بإنتاجية أكبر.",
      "يفصح عن ما يواجهه من تحديات بشفافية."
    ]
  },
  {
    name: "التعاون",
    behaviors: [
      "يشارك المعلومات بانفتاح وفق متطلبات العمل.",
      "يسعى إلى الاستفادة من آراء الآخرين من خارج إدارته، وتهيئة الآخرين لدعم الأعمال التي يقوم بها.",
      "يستجيب لطلبات الدعم والمساندة من الوحدات التنظيمية في جهة عمله."
    ]
  },
  {
    name: "التواصل",
    behaviors: [
      "يستخدم التواصل المكتوب الواضح والفعال.",
      "يستخدم التواصل الشفهي الواضح والفعال.",
      "ينصت للآخرين بعناية."
    ]
  },
  {
    name: "تحقيق النتائج",
    behaviors: [
      "يستطيع القيام بمهام متعددة وتحديد أولوياتها حسب أهميتها النسبية.",
      "يمكن الاعتماد عليه، وينفذ مهامه في وقتها بمستوى عالٍ من الجودة.",
      "مبادر ويعمل بدون توجيه من رئيسه عند تنفيذه لمهامه."
    ]
  },
  {
    name: "التطوير",
    behaviors: [
      "يسعى إلى التعلم وتطوير نفسه باستمرار.",
      "يساعد الآخرين على تطوير أنفسهم."
    ]
  },
  {
    name: "الارتباط الوظيفي",
    behaviors: [
      "لديه الاستعداد لمواجهة تحديات العمل.",
      "يتطلع إلى مستوى أعلى من الإنجاز والابتكار عند تنفيذ العمل.",
      "يلتزم بمواعيد العمل ويكون متواجداً عند الحاجة إليه.",
      "يركز على \"خدمة العملاء\" عند تنفيذ أعماله."
    ]
  }
];

const LEVELS = [
  { value: "1", label: "1 - غير مرضي" },
  { value: "2", label: "2 - مرضي" },
  { value: "3", label: "3 - جيد" },
  { value: "4", label: "4 - جيد جدا" },
  { value: "5", label: "5 - ممتاز" }
];

export default function CompetenciesSection({ competencies, setCompetencies, showEvaluation = false }) {
  
  React.useEffect(() => {
    if (competencies.length === 0) {
      setCompetencies(COMPETENCIES_DATA.map(c => ({
        name: c.name,
        relative_weight: 0,
        required_level: 0,
        achieved_level: 0,
        rating: 0
      })));
    }
  }, []);

  const updateCompetency = (index, field, value) => {
    const updated = [...competencies];
    updated[index] = { ...updated[index], [field]: value };
    setCompetencies(updated);
  };

  const totalWeight = competencies.reduce((sum, c) => sum + (parseFloat(c.relative_weight) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-green-700 text-white py-3 px-5 rounded-xl">
        <h3 className="text-lg font-bold">ثانياً: الجدارات Part-2: Competencies</h3>
      </div>

      <div className="space-y-4">
        {COMPETENCIES_DATA.map((comp, index) => {
          const compData = competencies[index] || {};
          return (
            <div key={comp.name} className="border rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 bg-green-50 p-3 border-b">
                <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <h4 className="font-bold text-green-800 text-base flex-1">{comp.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">الوزن:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={compData.relative_weight || 0}
                    onChange={(e) => updateCompetency(index, 'relative_weight', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-center text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">المطلوب:</span>
                  <Select
                    value={String(compData.required_level || '')}
                    onValueChange={(val) => updateCompetency(index, 'required_level', parseInt(val))}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showEvaluation && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">المتحقق:</span>
                    <Select
                      value={String(compData.achieved_level || '')}
                      onValueChange={(val) => updateCompetency(index, 'achieved_level', parseInt(val))}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(l => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 font-semibold mb-2">الوصف السلوكي:</p>
                <ul className="space-y-1">
                  {comp.behaviors.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`text-center font-bold p-3 rounded-lg ${Math.abs(totalWeight - 1) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        مجموع الوزن النسبي: {(totalWeight * 100).toFixed(0)}% (يجب أن يكون 100%)
      </div>
    </div>
  );
}