import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, FileText, ChevronRight, ChevronLeft, Stethoscope, Globe, UserPlus } from 'lucide-react';
import OHFormHeader from '@/components/occupational_health/OHFormHeader';
import EmployeeSelector from '@/components/occupational_health/EmployeeSelector';
import SHC1_MedicalHistory from '@/components/occupational_health/SHC1_MedicalHistory';
import SHC2_PhysicalExam from '@/components/occupational_health/SHC2_PhysicalExam';
import SHC3_Screening from '@/components/occupational_health/SHC3_Screening';
import SHC5_VaccinationCard from '@/components/occupational_health/SHC5_VaccinationCard';
import SHC9_WorkRestriction from '@/components/occupational_health/SHC9_WorkRestriction';
import SHC10_TBScreening from '@/components/occupational_health/SHC10_TBScreening';

const FORMS = [
  { id: 'shc1', code: 'SHC1', title: 'استبيان التاريخ الطبي المهني', titleEn: 'Medical History Questionnaire', color: 'bg-blue-500' },
  { id: 'shc2', code: 'SHC2', title: 'الفحص الطبي', titleEn: 'Physical Examination', color: 'bg-green-500' },
  { id: 'shc3', code: 'SHC3', title: 'الفحوصات والتحاليل', titleEn: 'Screening & Investigations', color: 'bg-purple-500' },
  { id: 'shc5', code: 'SHC5', title: 'بطاقة التطعيم', titleEn: 'Vaccination Card', color: 'bg-orange-500' },
  { id: 'shc9', code: 'SHC9', title: 'نموذج تقييد عن العمل', titleEn: 'Work Restriction Form', color: 'bg-red-500' },
  { id: 'shc10', code: 'SHC10', title: 'نموذج فحص الدرن', titleEn: 'TB Screening Form', color: 'bg-teal-500' },
];

export default function FillOccupationalHealthForm() {
  const [lang, setLang] = useState('ar');
  const [selectedForms, setSelectedForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [sharedData, setSharedData] = useState({});
  const printRef = useRef(null);
  const isAr = lang === 'ar';

  const toggleForm = (id) => {
    setSelectedForms(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedForms(FORMS.map(f => f.id));
  const deselectAll = () => { setSelectedForms([]); setActiveForm(null); };

  const handleEmployeeSelect = (empData) => {
    const shared = {
      name: empData.name,
      name_en: empData.name_en,
      birth_date: empData.birth_date,
      sex: empData.sex,
      position: empData.position,
      department: empData.department,
      nationality: empData.nationality,
      phone: empData.phone,
      email: empData.email,
      national_id: empData.national_id,
      medical_record: '',
    };
    setSharedData(shared);
    // Propagate to all form data
    const updated = { ...formData };
    FORMS.forEach(f => {
      updated[f.id] = { ...(updated[f.id] || {}), ...shared };
    });
    setFormData(updated);
  };

  const handleSupervisorSelect = (empData) => {
    const updated = { ...formData };
    FORMS.forEach(f => {
      updated[f.id] = { ...(updated[f.id] || {}), supervisor: empData.name, director_name: empData.name };
    });
    setFormData(updated);
  };

  const updateFormData = (formId, data) => {
    setFormData(prev => ({ ...prev, [formId]: data }));
  };

  const handlePrint = () => {
    window.print();
  };

  const renderForm = (formId) => {
    const d = formData[formId] || {};
    const onChange = (data) => updateFormData(formId, data);
    switch (formId) {
      case 'shc1': return <SHC1_MedicalHistory data={d} onChange={onChange} lang={lang} />;
      case 'shc2': return <SHC2_PhysicalExam data={d} onChange={onChange} lang={lang} />;
      case 'shc3': return <SHC3_Screening data={d} onChange={onChange} lang={lang} />;
      case 'shc5': return <SHC5_VaccinationCard data={d} onChange={onChange} lang={lang} />;
      case 'shc9': return <SHC9_WorkRestriction data={d} onChange={onChange} lang={lang} />;
      case 'shc10': return <SHC10_TBScreening data={d} onChange={onChange} lang={lang} />;
      default: return null;
    }
  };

  const activeIdx = selectedForms.indexOf(activeForm);
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < selectedForms.length - 1;

  // If no active form but forms selected, show selection
  if (!activeForm && selectedForms.length > 0) {
    // Auto-select first
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 p-4 md:p-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {isAr ? 'نماذج الصحة المهنية' : 'Occupational Health Forms'}
          </h1>
          <p className="text-gray-600">
            {isAr ? 'نماذج الفحص الصحي للموظف - قسم الصحة المهنية' : 'Employee Health Screening Forms - Occupational Health Department'}
          </p>
        </div>

        {/* Controls */}
        <Card className="no-print">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <EmployeeSelector onSelect={handleEmployeeSelect} label={isAr ? 'استدعاء بيانات الموظف' : 'Load Employee Data'} />
              <EmployeeSelector onSelect={handleSupervisorSelect} label={isAr ? 'استدعاء بيانات المدير' : 'Load Supervisor Data'} />
              
              <div className="flex items-center gap-2 mr-auto">
                <Globe className="w-4 h-4 text-gray-500" />
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedForms.length > 0 && activeForm && (
                <Button onClick={handlePrint} className="gap-2 bg-teal-600 hover:bg-teal-700">
                  <Printer className="w-4 h-4" />
                  {isAr ? 'طباعة' : 'Print'}
                </Button>
              )}
            </div>

            {sharedData.name && (
              <div className="mt-3 p-2 bg-teal-50 rounded-lg text-sm">
                <span className="font-semibold text-teal-700">{isAr ? 'الموظف:' : 'Employee:'}</span>{' '}
                {sharedData.name} - {sharedData.position} - {sharedData.department}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Selection */}
        {!activeForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between no-print">
              <h2 className="text-lg font-bold">{isAr ? 'اختر النماذج المراد تعبئتها:' : 'Select forms to fill:'}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>{isAr ? 'تحديد الكل' : 'Select All'}</Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>{isAr ? 'إلغاء الكل' : 'Deselect All'}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FORMS.map(form => {
                const isSelected = selectedForms.includes(form.id);
                return (
                  <Card
                    key={form.id}
                    className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:shadow-md'}`}
                    onClick={() => toggleForm(form.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <div className={`w-10 h-10 rounded-lg ${form.color} flex items-center justify-center flex-shrink-0`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{isAr ? form.title : form.titleEn}</div>
                        <Badge variant="outline" className="text-[10px] mt-1">{form.code}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedForms.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={() => setActiveForm(selectedForms[0])}
                  className="gap-2 bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6"
                >
                  <FileText className="w-5 h-5" />
                  {isAr ? `بدء تعبئة ${selectedForms.length} نموذج` : `Start filling ${selectedForms.length} form(s)`}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Form */}
        {activeForm && (
          <div className="space-y-4">
            {/* Navigation tabs */}
            <div className="flex flex-wrap gap-2 no-print">
              {selectedForms.map(fId => {
                const form = FORMS.find(f => f.id === fId);
                return (
                  <Button
                    key={fId}
                    variant={activeForm === fId ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveForm(fId)}
                    className={activeForm === fId ? 'bg-teal-600' : ''}
                  >
                    {form.code}
                  </Button>
                );
              })}
              <Button variant="ghost" size="sm" onClick={() => setActiveForm(null)} className="text-gray-500">
                {isAr ? '← الرجوع للاختيار' : '← Back to selection'}
              </Button>
            </div>

            {/* Form content */}
            <Card ref={printRef}>
              <CardContent className="p-6">
                <OHFormHeader formData={formData[activeForm] || sharedData} lang={lang} />
                {renderForm(activeForm)}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between no-print">
              <Button
                variant="outline"
                onClick={() => canPrev && setActiveForm(selectedForms[activeIdx - 1])}
                disabled={!canPrev}
                className="gap-2"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                {isAr ? 'السابق' : 'Previous'}
              </Button>
              <span className="text-sm text-gray-500 self-center">
                {activeIdx + 1} / {selectedForms.length}
              </span>
              <Button
                variant="outline"
                onClick={() => canNext && setActiveForm(selectedForms[activeIdx + 1])}
                disabled={!canNext}
                className="gap-2"
              >
                {isAr ? 'التالي' : 'Next'}
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}