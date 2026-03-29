import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, ClipboardList, DollarSign, Award, Package, FilePenLine, FileCheck, Trash2, Recycle, Target, Stethoscope, ShieldCheck, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

const interactiveForms = [
  {
    title: "ميثاق الأداء الوظيفي",
    description: "ميثاق وتقييم الأداء للموظف على الوظيفة غير الإشرافية 2025",
    icon: Target,
    color: "from-emerald-500 to-green-600",
    link: createPageUrl("FillPerformanceCharter"),
    category: "تقييم الأداء"
  },
  {
    title: "نموذج 205 - جزء أول",
    description: "تعبئة نموذج 205 لتقييم الوظائف (الجزء الأول)",
    icon: ClipboardList,
    color: "from-blue-500 to-blue-600",
    link: createPageUrl("Fill205Form"),
    category: "تقييم الوظائف"
  },
  {
    title: "نموذج 205 - جزء ثاني",
    description: "تعبئة نموذج 205 لتقييم الوظائف (الجزء الثاني)",
    icon: ClipboardList,
    color: "from-indigo-500 to-indigo-600",
    link: createPageUrl("Fill205FormPart2"),
    category: "تقييم الوظائف"
  },
  {
    title: "نموذج 205 - كامل",
    description: "تعبئة نموذج 205 الكامل (جزء واحد)",
    icon: ClipboardList,
    color: "from-purple-500 to-purple-600",
    link: createPageUrl("Fill205FormComplete"),
    category: "تقييم الوظائف"
  },
  {
    title: "نموذج طلب البدلات",
    description: "تعبئة نموذج طلب بدل العدوى أو بدل الضرر",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
    link: createPageUrl("FillAllowanceForm"),
    category: "البدلات"
  },
  {
    title: "شهادة تقييم ممتاز",
    description: "إصدار شهادة تقدير للموظف المتميز",
    icon: Award,
    color: "from-yellow-500 to-orange-600",
    link: createPageUrl("FillExcellentEmployeeCertificate"),
    category: "الشهادات"
  },
  {
    title: "طلب التجهيزات الطبية",
    description: "نموذج احتياج من التجهيزات الطبية والغير طبية",
    icon: Package,
    color: "from-teal-500 to-cyan-600",
    link: createPageUrl("FillEquipmentRequestForm"),
    category: "التجهيزات"
  },
  {
    title: "محرر النماذج الاحترافي",
    description: "سحب وإفلات، تحرير جداول، تغيير أحجام، حفظ قوالب",
    icon: Edit,
    color: "from-red-500 to-orange-600",
    link: createPageUrl("AdvancedFormEditor"),
    category: "أدوات متقدمة"
  },
  {
    title: "طلب انشاء حساب رقيم",
    description: "نموذج إنشاء/إيقاف حساب في أنظمة رقيم وميديكا وموعد",
    icon: FilePenLine,
    color: "from-cyan-500 to-blue-600",
    link: createPageUrl("FillDigitalAccountForm"),
    category: "الحسابات الرقمية"
  },
  {
    title: "براءة ذمة",
    description: "نموذج براءة ذمة للموظف من الناحية الإدارية والمالية",
    icon: FileCheck,
    color: "from-emerald-500 to-teal-600",
    link: createPageUrl("FillClearanceForm"),
    category: "الموارد البشرية"
  },
  {
    title: "تقييم أداء المتعهد",
    description: "4 نماذج: عقد جمع وتخزين، توريد المستهلكات، النقل، المعالجة - للنفايات الطبية",
    icon: Trash2,
    color: "from-red-500 to-rose-600",
    link: createPageUrl("FillContractorEvaluationForm"),
    category: "النفايات الطبية"
  },
  {
    title: "احتياج مستلزمات النفايات الطبية",
    description: "طلب مفرد لكل مركز أو طلب مجمع لجميع المراكز - أكياس، حاويات، وأدوات",
    icon: Recycle,
    color: "from-teal-500 to-green-600",
    link: createPageUrl("FillMedicalWasteSuppliesForm"),
    category: "النفايات الطبية"
  },
  {
    title: "الصحة المهنية",
    description: "نماذج الفحص الصحي للموظف - استبيان طبي، فحص بدني، تحاليل، تطعيمات، فحص درن، تقييد عمل",
    icon: Stethoscope,
    color: "from-teal-500 to-cyan-600",
    link: createPageUrl("FillOccupationalHealthForm"),
    category: "الصحة المهنية"
  },
  {
    title: "تقييم الأمن والسلامة",
    description: "تقرير عن مدى توفر أنظمة ومتطلبات السلامة بالمراكز الصحية",
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
    link: createPageUrl("FillSafetyEvaluationForm"),
    category: "الأمن والسلامة"
  },
  {
    title: "نموذج عينات مياه",
    description: "نتائج فحص عينات المياه والمسحات",
    icon: Droplets,
    color: "from-cyan-500 to-blue-600",
    link: createPageUrl("FillWaterSamplesForm"),
    category: "الصحة العامة"
  }
];

export default function InteractiveForms() {
  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
            <Edit className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">النماذج التفاعلية</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            تعبئة وإنشاء النماذج الرسمية إلكترونياً بطريقة سهلة وسريعة
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{interactiveForms.length}</div>
              <div className="text-sm text-blue-700">نموذج متاح</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
              <div className="text-sm text-green-700">رقمي تماماً</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">⚡</div>
              <div className="text-sm text-purple-700">فوري وسريع</div>
            </CardContent>
          </Card>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          {interactiveForms.map((form) => {
            const Icon = form.icon;
            return (
              <Link key={form.title} to={form.link} className="min-w-0">
                <Card className="group h-full hover:shadow-2xl transition-all duration-300 border hover:border-indigo-300 cursor-pointer md:hover:scale-105">
                  <CardContent className="p-2 md:p-6">
                    <div className="flex flex-col items-center text-center space-y-2 md:space-y-5">
                      {/* Icon */}
                      <div className={`w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${form.color} flex items-center justify-center shadow-md md:shadow-xl group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 md:w-10 md:h-10 text-white" />
                      </div>
                      
                      {/* Category Badge */}
                      <div className="hidden md:inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {form.category}
                      </div>
                      
                      {/* Title & Description */}
                      <div className="space-y-1 md:space-y-2 min-w-0 w-full">
                        <h3 className="font-bold text-[11px] md:text-lg text-gray-900 leading-tight line-clamp-2">
                          {form.title}
                        </h3>
                        <p className="hidden md:block text-sm text-gray-600 leading-relaxed">
                          {form.description}
                        </p>
                      </div>
                      
                      {/* Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-[10px] md:text-sm px-1.5 md:px-4 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-300 transition-all"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                        <span className="hidden md:inline">تعبئة النموذج</span>
                        <span className="md:hidden">فتح</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <Card className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">💡 نصيحة</h3>
                <p className="text-gray-600 leading-relaxed">
                  جميع النماذج التفاعلية تدعم الحفظ التلقائي، التصدير إلى PDF، والطباعة المباشرة. 
                  يمكنك أيضاً حفظ النماذج المعبأة في ملفات الموظفين للرجوع إليها لاحقاً.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}