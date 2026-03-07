import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, FileDown, Printer, ArrowRight, Loader2, Sparkles, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import CharterHeader from '../components/performance_charter/CharterHeader';
import GoalsSection from '../components/performance_charter/GoalsSection';
import CompetenciesSection from '../components/performance_charter/CompetenciesSection';
import FinalRatingSection from '../components/performance_charter/FinalRatingSection';
import CharterPrintView from '../components/performance_charter/CharterPrintView';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const DEFAULT_GOALS = [
  {
    goal: 'حضور دورات تدريبية في مجال تخصصه أو عمله خلال دورة الأداء',
    measurement_criterion: 'ساعة تدريبية',
    relative_weight: 0.1,
    target_output: '20',
    actual_output: 0,
    difference: 0,
    weighted_rating: 0
  }
];

export default function FillPerformanceCharter() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('charter');
  const [showPrint, setShowPrint] = useState(false);
  const [suggestingGoals, setSuggestingGoals] = useState(false);

  const [data, setData] = useState({
    employee_record_id: '',
    employee_name: '',
    agency_department: '',
    job_title: '',
    department: '',
    employee_id_number: '',
    manager_name: '',
    goals: [...DEFAULT_GOALS],
    competencies: [],
    total_goals_weight: 0,
    total_goals_rating: 0,
    total_competencies_weight: 0,
    total_competencies_rating: 0,
    overall_rating: 0,
    overall_rating_text: '',
    evaluation_cycle: '',
    promotion_readiness: '',
    strength_points: '',
    improvement_points: '',
    remarks: '',
    justifications: '',
    supporting_documents: '',
    charter_date: new Date().toISOString().split('T')[0],
    evaluation_date: '',
    status: 'ميثاق'
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-charter'],
    queryFn: () => base44.entities.Employee.list(),
  });

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  useEffect(() => {
    if (editId) {
      base44.entities.PerformanceCharter.list().then(records => {
        const record = records.find(r => r.id === editId);
        if (record) {
          setData(prev => ({ ...prev, ...record }));
        }
      });
    }
  }, [editId]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (editId) {
        return base44.entities.PerformanceCharter.update(editId, formData);
      }
      return base44.entities.PerformanceCharter.create(formData);
    },
    onSuccess: () => {
      toast.success('تم حفظ ميثاق الأداء بنجاح');
      queryClient.invalidateQueries({ queryKey: ['performance-charters'] });
    }
  });

  const handleEmployeeSelect = (emp) => {
    setData(prev => ({
      ...prev,
      employee_record_id: emp.id,
      employee_name: emp.full_name_arabic || '',
      job_title: emp.position || '',
      department: emp.department || '',
      employee_id_number: emp.رقم_الموظف || '',
      agency_department: emp.المركز_الصحي || ''
    }));
  };

  const handleSave = () => {
    const saveData = { ...data };
    saveMutation.mutate(saveData);
  };

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(false), 300);
    }, 500);
  };

  const handleExportExcel = () => {
    const goals = data.goals || [];
    const competencies = data.competencies || [];
    
    let csv = '\uFEFF'; // BOM for Arabic
    csv += 'ميثاق الأداء للموظف على الوظيفة غير الإشرافية 2025\n\n';
    csv += `اسم الموظف:,${data.employee_name || ''},الوكالة / الإدارة العامة:,${data.agency_department || ''}\n`;
    csv += `المسمى الوظيفي:,${data.job_title || ''},الإدارة / القسم:,${data.department || ''}\n`;
    csv += `السجل المدني / رقم الموظف:,${data.employee_id_number || ''},المدير (المقيّم):,${data.manager_name || ''}\n\n`;
    
    csv += 'أولاً: الأهداف\n';
    csv += '#,الهدف,معيار القياس,الوزن النسبي,الناتج المستهدف,الناتج الفعلي,الفرق,التقدير الموزون\n';
    goals.forEach((g, i) => {
      csv += `${i + 1},"${g.goal || ''}","${g.measurement_criterion || ''}",${((parseFloat(g.relative_weight) || 0) * 100).toFixed(0)}%,"${g.target_output || ''}",${g.actual_output || 0},${g.difference || 0},${g.weighted_rating || 0}\n`;
    });
    csv += `مجموع الوزن النسبي,,,${(goals.reduce((s, g) => s + (parseFloat(g.relative_weight) || 0), 0) * 100).toFixed(0)}%,,,,${goals.reduce((s, g) => s + (parseFloat(g.weighted_rating) || 0), 0).toFixed(2)}\n\n`;
    
    csv += 'ثانياً: الجدارات\n';
    csv += '#,الجدارة,الوزن النسبي,المستوى المطلوب,المستوى المتحقق,التقدير\n';
    competencies.forEach((c, i) => {
      csv += `${i + 1},"${c.name || ''}",${((parseFloat(c.relative_weight) || 0) * 100).toFixed(0)}%,${c.required_level || ''},${c.achieved_level || ''},${c.rating || ''}\n`;
    });
    csv += '\n';
    
    csv += 'التقدير العام\n';
    csv += `التقدير:,${data.overall_rating_text || ''}\n`;
    csv += `دورة التقييم:,${data.evaluation_cycle || ''}\n`;
    csv += `الجاهزية للترقية:,${data.promotion_readiness || ''}\n`;
    csv += `نقاط القوة:,"${data.strength_points || ''}"\n`;
    csv += `نقاط التطوير:,"${data.improvement_points || ''}"\n`;
    csv += `الملاحظات:,"${data.remarks || ''}"\n`;
    csv += `المبررات:,"${data.justifications || ''}"\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ميثاق_الأداء_${data.employee_name || 'موظف'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير الملف بنجاح');
  };

  const suggestGoals = async () => {
    if (!data.job_title) {
      toast.error('يرجى تحديد المسمى الوظيفي أولاً');
      return;
    }
    setSuggestingGoals(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `أنت خبير في إدارة الأداء الوظيفي في القطاع الصحي السعودي.
بناءً على المسمى الوظيفي: "${data.job_title}" في قسم "${data.department || 'غير محدد'}"
اقترح 4 أهداف أداء واقعية ومناسبة مع معايير القياس والأوزان النسبية والنواتج المستهدفة.
الأوزان النسبية يجب أن يكون مجموعها مع الهدف الأول (0.10 للتدريب) يساوي 1.0 (100%).`,
      response_json_schema: {
        type: "object",
        properties: {
          goals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                goal: { type: "string" },
                measurement_criterion: { type: "string" },
                relative_weight: { type: "number" },
                target_output: { type: "string" }
              }
            }
          }
        }
      }
    });
    
    if (result?.goals) {
      const newGoals = [
        data.goals[0] || DEFAULT_GOALS[0],
        ...result.goals.map(g => ({
          ...g,
          actual_output: 0,
          difference: 0,
          weighted_rating: 0
        }))
      ];
      setData(prev => ({ ...prev, goals: newGoals }));
      toast.success('تم اقتراح الأهداف بنجاح');
    }
    setSuggestingGoals(false);
  };

  if (showPrint) {
    return <CharterPrintView data={data} />;
  }

  return (
    <div className="min-h-screen p-3 md:p-6 bg-gradient-to-br from-gray-50 to-green-50" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('InteractiveForms')}>
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ميثاق الأداء الوظيفي</h1>
              <p className="text-sm text-gray-500">الوظيفة غير الإشرافية 2025</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={suggestGoals} variant="outline" className="gap-2" disabled={suggestingGoals}>
              {suggestingGoals ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              اقتراح أهداف بالذكاء الاصطناعي
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-green-700 hover:bg-green-800" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" /> طباعة
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" /> تصدير Excel
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="charter" className="text-xs md:text-sm">ميثاق الأداء</TabsTrigger>
            <TabsTrigger value="evaluation" className="text-xs md:text-sm">تقييم الأداء</TabsTrigger>
            <TabsTrigger value="final" className="text-xs md:text-sm">التقدير العام</TabsTrigger>
          </TabsList>

          <TabsContent value="charter">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                <CharterHeader
                  data={data}
                  setData={setData}
                  employees={employees}
                  onEmployeeSelect={handleEmployeeSelect}
                />
                <GoalsSection
                  goals={data.goals}
                  setGoals={(goals) => setData(prev => ({ ...prev, goals }))}
                  showEvaluation={false}
                />
                <CompetenciesSection
                  competencies={data.competencies}
                  setCompetencies={(competencies) => setData(prev => ({ ...prev, competencies }))}
                  showEvaluation={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluation">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                <div className="text-center bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-6 rounded-xl">
                  <h2 className="text-xl font-bold">تقييم الأداء الوظيفي على الوظيفة غير الإشرافية 2025</h2>
                </div>
                <GoalsSection
                  goals={data.goals}
                  setGoals={(goals) => setData(prev => ({ ...prev, goals }))}
                  showEvaluation={true}
                />
                <CompetenciesSection
                  competencies={data.competencies}
                  setCompetencies={(competencies) => setData(prev => ({ ...prev, competencies }))}
                  showEvaluation={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="final">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                <FinalRatingSection data={data} setData={setData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}