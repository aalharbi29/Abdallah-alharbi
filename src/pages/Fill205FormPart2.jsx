
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form205Part2 } from '@/entities/Form205Part2';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, Eye, Printer } from 'lucide-react';
import { createPageUrl } from '@/utils';
import FormExportManager from '../components/export/FormExportManager';

const Form205Part2Preview = ({ formData, onClose }) => {
  const getPreviewHTML = () => {
    const renderCheckbox = (checked) => `<div style="width:14px; height:14px; border:1px solid black; display:inline-flex; align-items:center; justify-content:center; margin: 0 4px; font-size:10px;">${checked ? '&#10003;' : '&nbsp;'}</div>`;
    
    return `
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; font-weight: 600; margin: 0; padding: 0; }
          @page { size: A4; margin: 15mm; }
          .container { 
            width: 100%; 
            max-width: 800px; 
            margin: auto; 
            height: 250mm;
            display: flex; 
            flex-direction: column;
          }
          .title { text-align: center; font-size: 20px; font-weight: bold; line-height: 1.4; margin-bottom: 15px; }
          .bordered-box { 
            border: 2px solid black; 
            padding: 15px; 
            margin-bottom: 0;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }
          .section-number { font-weight: bold; font-size: 16px; margin: 10px 0 5px 0; }
          .section-title { font-weight: bold; margin: 5px 0; font-size: 14px; }
          .checkbox-grid { display: flex; flex-wrap: wrap; gap: 8px 15px; margin: 8px 0; }
          .checkbox-item { display: flex; align-items: center; font-size: 14px; font-weight: 600; }
          .text-field { border-bottom: 1px solid black; min-height: 20px; margin: 5px 0; }
          .safety-measures-table { width: 100%; margin: 8px 0; }
          .safety-measures-table td { padding: 4px; font-size: 14px; width: 50%; }
          .signatures-section { margin-top: auto; padding-top: 15px; }
          .signatures-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .signatures-table td { padding: 8px; text-align: center; font-size: 14px; font-weight: 600; border: none; }
          .signature-line { border-bottom: 2px dotted black; min-height: 20px; margin: 5px 0; }
          .name-dots { border-bottom: 2px dotted black; min-height: 15px; margin: 2px 0; }
          .no-dots { min-height: 15px; margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">تابع نموذج (٢٠٥)</div>
          <div class="bordered-box">
            
            <div class="section-number">(٢) الأجهزة والمواد المستعملة:</div>
            <div class="section-title">أ) نوعها:</div>
            <div class="text-field">${formData.equipment_type || ''}</div>
            
            <div class="section-title">ب) الآثار المترتبة على استخدامها:</div>
            <div class="checkbox-grid">
              <div class="checkbox-item">${renderCheckbox(formData.effect_poisoning)} تسمم</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_explosion)} انفجار</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_infection)} عدوى</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_disfigurement)} تشويه</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_fire)} حريق</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_stress)} إجهاد</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_deafness)} صمم</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_pollution)} تلوث</div>
              <div class="checkbox-item">${renderCheckbox(formData.effect_radiation)} إشعاع</div>
            </div>
            <div class="checkbox-item" style="margin-top: 8px;">
              ${renderCheckbox(formData.other_effect ? true : false)} أثر آخر يحدد: ${formData.other_effect || ''}
            </div>
            
            <div style="margin: 10px 0;">
              <strong>سبب التعرض لذلك:</strong>
              <div class="text-field">${formData.exposure_reason || ''}</div>
            </div>

            <div class="section-number">(٣) الوقت:</div>
            <div class="checkbox-grid">
              <div class="checkbox-item">${renderCheckbox(formData.time_all)} كل الوقت</div>
              <div class="checkbox-item">${renderCheckbox(formData.time_most)} معظم الوقت</div>
              <div class="checkbox-item">${renderCheckbox(formData.time_some)} بعض الوقت</div>
              <div class="checkbox-item">${renderCheckbox(formData.time_percentage)} النسبة المئوية</div>
            </div>
            <div style="margin: 8px 0;">
              <strong>السبب:</strong>
              <div class="text-field">${formData.time_reason || ''}</div>
            </div>

            <div class="section-number">(٤) وسائل الوقاية والسلامة:</div>
            <div class="section-title">أ) ما هي وسائل الوقاية والسلامة التي يستخدمها الموظف:</div>
            <table class="safety-measures-table">
              <tr>
                <td>(١) ${formData.safety_measure_1 || ''}</td>
                <td>(٤) ${formData.safety_measure_4 || ''}</td>
              </tr>
              <tr>
                <td>(٢) ${formData.safety_measure_2 || ''}</td>
                <td>(٥) ${formData.safety_measure_5 || ''}</td>
              </tr>
              <tr>
                <td>(٣) ${formData.safety_measure_3 || ''}</td>
                <td>(٦) ${formData.safety_measure_6 || ''}</td>
              </tr>
            </table>

            <div class="section-title">ب) نسبة التعرض للضرر أو الخطر بعد التقيد التام باستخدام تلك الوسائل:</div>
            <div class="text-field">${formData.exposure_percentage_after_safety || ''}</div>

            <div class="section-title">ج) الأسباب:</div>
            <div class="text-field">${formData.exposure_reasons || ''}</div>

            <div class="signatures-section">
              <table class="signatures-table">
                <tr>
                  <td>الرئيس المباشر</td>
                  <td>مدير إدارة الموارد البشرية</td>
                  <td>المدير التنفيذي للرعاية الأولية<br>بتجمع المدينة الصحي</td>
                </tr>
                <tr>
                  <td>
                    ${formData.direct_supervisor_name || ''}
                    <div class="no-dots"></div>
                  </td>
                  <td>
                    ${formData.hr_manager_name || ''}
                    <div class="name-dots"></div>
                  </td>
                  <td>
                    ${formData.executive_manager_name || ''}
                    <div class="name-dots"></div>
                  </td>
                </tr>
                <tr>
                  <td>
                    توقيع: <div class="signature-line">${formData.direct_supervisor_signature_date ? new Date(formData.direct_supervisor_signature_date).toLocaleDateString('ar-SA') : ''}</div>
                  </td>
                  <td>
                    توقيع: <div class="signature-line">${formData.hr_manager_signature_date ? new Date(formData.hr_manager_signature_date).toLocaleDateString('ar-SA') : ''}</div>
                  </td>
                  <td>
                    توقيع: <div class="signature-line">${formData.executive_manager_signature_date ? new Date(formData.executive_manager_signature_date).toLocaleDateString('ar-SA') : ''}</div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </body>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center no-print">
          <h2 className="text-xl font-bold">معاينة تابع نموذج 205</h2>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <FormExportManager formData={formData} formHTMLGenerator={getPreviewHTML} fileName="تابع_نموذج_205" />
            <Button onClick={onClose} variant="outline">إغلاق</Button>
          </div>
        </div>
        
        <div className="p-4" dangerouslySetInnerHTML={{ __html: getPreviewHTML() }} />
      </div>
    </div>
  );
};

export default function Fill205FormPart2() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedData, setSavedData] = useState({
    supervisors: [],
    hrManagers: [],
    executiveManagers: [],
    equipmentTypes: [],
    safetyMeasures: []
  });

  const [formData, setFormData] = useState({
    employee_record_id: '',
    employee_name: '',
    equipment_type: '',
    effect_poisoning: false,
    effect_explosion: false,
    effect_infection: false,
    effect_disfigurement: false,
    effect_fire: false,
    effect_stress: false,
    effect_deafness: false,
    effect_pollution: false,
    effect_radiation: false,
    other_effect: '',
    exposure_reason: '',
    time_all: false,
    time_most: false,
    time_some: false,
    time_percentage: false,
    time_reason: '',
    safety_measure_1: '',
    safety_measure_2: '',
    safety_measure_3: '',
    safety_measure_4: '',
    safety_measure_5: '',
    safety_measure_6: '',
    exposure_percentage_after_safety: '',
    exposure_reasons: '',
    direct_supervisor_name: '',
    direct_supervisor_signature_date: '',
    hr_manager_name: '',
    hr_manager_signature_date: '',
    executive_manager_name: '',
    executive_manager_signature_date: ''
  });

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await Employee.list();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]);
      }
    }
    loadEmployees();
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    const saved = localStorage.getItem('form205part2_saved_data');
    if (saved) {
      setSavedData(JSON.parse(saved));
    }
  };

  const saveToLocalStorage = (key, value) => {
    if (!value || value.trim() === '') return;
    
    const currentSaved = JSON.parse(localStorage.getItem('form205part2_saved_data') || '{"supervisors":[],"hrManagers":[],"executiveManagers":[],"equipmentTypes":[],"safetyMeasures":[]}');
    
    if (!currentSaved[key].includes(value)) {
      currentSaved[key].push(value);
      localStorage.setItem('form205part2_saved_data', JSON.stringify(currentSaved));
      setSavedData(currentSaved);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      employee_record_id: employee.id,
      employee_name: employee.full_name_arabic || '',
    }));
    setSearchQuery('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // حفظ البيانات في localStorage عند التغيير
    if (type !== 'checkbox' && value.trim() !== '') {
      if (name === 'direct_supervisor_name') saveToLocalStorage('supervisors', value);
      else if (name === 'hr_manager_name') saveToLocalStorage('hrManagers', value);
      else if (name === 'executive_manager_name') saveToLocalStorage('executiveManagers', value);
      else if (name === 'equipment_type') saveToLocalStorage('equipmentTypes', value);
      else if (name.startsWith('safety_measure_')) saveToLocalStorage('safetyMeasures', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_name) {
      alert('يرجى تعبئة اسم الموظف');
      return;
    }

    setIsSubmitting(true);
    try {
      await Form205Part2.create(formData);
      alert('تم حفظ النموذج بنجاح! يمكنك العثور عليه في قائمة "النماذج المحفوظة"');
      navigate(createPageUrl('Forms?type=interactive'));
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ في حفظ النموذج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const QuickSelectButton = ({ items, onSelect }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.slice(0, 3).map((item, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelect(item)}
            className="text-xs"
          >
            {item}
          </Button>
        ))}
      </div>
    );
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const searchLower = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.full_name_arabic && emp.full_name_arabic.toLowerCase().includes(searchLower)
    );
  }, [searchQuery, employees]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Forms?type=interactive'))} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تابع نموذج 205</h1>
            <p className="text-gray-600 mt-1">الجزء الثاني من النموذج - الأجهزة والمواد وأدوات السلامة</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* بيانات الموظف */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>بيانات الموظف</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="employee_search">البحث عن موظف</Label>
                  <Input
                    id="employee_search"
                    placeholder="ابحث بالاسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {filteredEmployees.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEmployeeSelect(emp)}
                        >
                          {emp.full_name_arabic}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="employee_name">اسم الموظف *</Label>
                  <Input id="employee_name" name="employee_name" value={formData.employee_name} onChange={handleChange} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأجهزة والمواد المستعملة */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>(٢) الأجهزة والمواد المستعملة</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="equipment_type">أ) نوعها</Label>
                <Textarea id="equipment_type" name="equipment_type" value={formData.equipment_type} onChange={handleChange} rows={3} />
                <QuickSelectButton 
                  items={savedData.equipmentTypes} 
                  onSelect={(item) => setFormData(prev => ({...prev, equipment_type: item}))}
                />
              </div>

              <Label className="text-base font-semibold">ب) الآثار المترتبة على استخدامها:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
                {[
                  { key: 'effect_poisoning', label: 'تسمم' },
                  { key: 'effect_explosion', label: 'انفجار' },
                  { key: 'effect_infection', label: 'عدوى' },
                  { key: 'effect_disfigurement', label: 'تشويه' },
                  { key: 'effect_fire', label: 'حريق' },
                  { key: 'effect_stress', label: 'إجهاد' },
                  { key: 'effect_deafness', label: 'صمم' },
                  { key: 'effect_pollution', label: 'تلوث' },
                  { key: 'effect_radiation', label: 'إشعاع' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      name={key}
                      checked={formData[key]}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [key]: checked }))}
                    />
                    <Label htmlFor={key} className="mr-2">{label}</Label>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label htmlFor="other_effect">أثر آخر يحدد:</Label>
                <Input id="other_effect" name="other_effect" value={formData.other_effect} onChange={handleChange} />
              </div>

              <div className="mt-4">
                <Label htmlFor="exposure_reason">سبب التعرض لذلك:</Label>
                <Textarea id="exposure_reason" name="exposure_reason" value={formData.exposure_reason} onChange={handleChange} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* الوقت */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>(٣) الوقت</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { key: 'time_all', label: 'كل الوقت' },
                  { key: 'time_most', label: 'معظم الوقت' },
                  { key: 'time_some', label: 'بعض الوقت' },
                  { key: 'time_percentage', label: 'النسبة المئوية' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      name={key}
                      checked={formData[key]}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [key]: checked }))}
                    />
                    <Label htmlFor={key} className="mr-2">{label}</Label>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="time_reason">السبب:</Label>
                <Textarea id="time_reason" name="time_reason" value={formData.time_reason} onChange={handleChange} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* وسائل الوقاية والسلامة */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>(٤) وسائل الوقاية والسلامة</CardTitle></CardHeader>
            <CardContent>
              <Label className="text-base font-semibold">أ) ما هي وسائل الوقاية والسلامة التي يستخدمها الموظف:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <Label htmlFor={`safety_measure_${i}`}>({i}) وسيلة الوقاية</Label>
                    <Input 
                      id={`safety_measure_${i}`} 
                      name={`safety_measure_${i}`} 
                      value={formData[`safety_measure_${i}`]} 
                      onChange={handleChange} 
                    />
                  </div>
                ))}
              </div>
              <QuickSelectButton 
                items={savedData.safetyMeasures} 
                onSelect={(item) => {
                  const emptyField = [1,2,3,4,5,6].find(i => !formData[`safety_measure_${i}`]);
                  if (emptyField) {
                    setFormData(prev => ({...prev, [`safety_measure_${emptyField}`]: item}));
                  }
                }}
              />

              <div className="mt-6">
                <Label htmlFor="exposure_percentage_after_safety">ب) نسبة التعرض للضرر أو الخطر بعد التقيد التام باستخدام تلك الوسائل:</Label>
                <Textarea 
                  id="exposure_percentage_after_safety" 
                  name="exposure_percentage_after_safety" 
                  value={formData.exposure_percentage_after_safety} 
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="exposure_reasons">ج) الأسباب:</Label>
                <Textarea 
                  id="exposure_reasons" 
                  name="exposure_reasons" 
                  value={formData.exposure_reasons} 
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* التوقيعات */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>التوقيعات</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="font-semibold">الرئيس المباشر</Label>
                  <div className="space-y-2 mt-2">
                    <Input 
                      placeholder="الاسم" 
                      name="direct_supervisor_name" 
                      value={formData.direct_supervisor_name} 
                      onChange={handleChange} 
                    />
                    <QuickSelectButton 
                      items={savedData.supervisors} 
                      onSelect={(item) => setFormData(prev => ({...prev, direct_supervisor_name: item}))}
                    />
                    <Input 
                      type="date" 
                      name="direct_supervisor_signature_date" 
                      value={formData.direct_supervisor_signature_date} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">مدير إدارة الموارد البشرية</Label>
                  <div className="space-y-2 mt-2">
                    <Input 
                      placeholder="الاسم" 
                      name="hr_manager_name" 
                      value={formData.hr_manager_name} 
                      onChange={handleChange} 
                    />
                    <QuickSelectButton 
                      items={savedData.hrManagers} 
                      onSelect={(item) => setFormData(prev => ({...prev, hr_manager_name: item}))}
                    />
                    <Input 
                      type="date" 
                      name="hr_manager_signature_date" 
                      value={formData.hr_manager_signature_date} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">المدير التنفيذي للرعاية الأولية بتجمع المدينة الصحي</Label>
                  <div className="space-y-2 mt-2">
                    <Input 
                      placeholder="الاسم" 
                      name="executive_manager_name" 
                      value={formData.executive_manager_name} 
                      onChange={handleChange} 
                    />
                    <QuickSelectButton 
                      items={savedData.executiveManagers} 
                      onSelect={(item) => setFormData(prev => ({...prev, executive_manager_name: item}))}
                    />
                    <Input 
                      type="date" 
                      name="executive_manager_signature_date" 
                      value={formData.executive_manager_signature_date} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 ml-2" />
              معاينة النموذج
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate(createPageUrl('Forms?type=interactive'))}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ النموذج'}
              </Button>
            </div>
          </div>
        </form>

        {showPreview && (
          <Form205Part2Preview 
            formData={formData} 
            onClose={() => setShowPreview(false)} 
          />
        )}
      </div>
    </div>
  );
}
