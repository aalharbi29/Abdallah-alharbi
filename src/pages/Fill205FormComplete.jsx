
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form205Complete } from '@/entities/Form205Complete';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, Eye, AlertCircle, Printer } from 'lucide-react';
import { createPageUrl } from '@/utils';

const Form205CompletePreview = ({ formData, onClose }) => {
  const getPreviewHTML = () => {
    const renderCheckbox = (checked) => `<span style="display: inline-block; width: 14px; height: 14px; border: 1px solid black; text-align: center; vertical-align: middle; margin: 0 2px; font-size: 10px;">${checked ? '✓' : ''}</span>`;
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            font-size: 11px; 
            line-height: 1.2;
            margin: 0; 
            padding: 10mm;
            background: white;
          }
          @page { size: A4; margin: 15mm; }
          
          .form-container { 
            width: 100%; 
            border: 2px solid black;
            padding: 15px;
          }
          
          .main-title {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 15px;
            line-height: 1.3;
          }
          
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          
          .info-table td, .info-table th {
            border: 1px solid black;
            padding: 6px 4px;
            text-align: center;
            font-size: 10px;
            font-weight: normal;
            vertical-align: middle;
          }
          
          .info-table th {
            font-weight: bold;
            background-color: #f5f5f5;
          }
          
          .duties-description {
            font-size: 10px;
            font-weight: bold;
            margin: 10px 0 5px 0;
            text-align: center;
            border: 1px solid black;
            padding: 8px;
            line-height: 1.4;
          }
          
          .duties-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          
          .duties-table td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-size: 10px;
            height: 22px;
          }
          
          .duties-table .num-col {
            width: 30px;
            font-weight: bold;
          }
          
          .duties-table .percent-col {
            width: 40px;
          }
          
          .section-row {
            margin: 8px 0;
          }
          
          .work-nature-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          
          .work-nature-table td {
            border: 1px solid black;
            padding: 6px;
            font-size: 10px;
            vertical-align: top;
          }
          
          .work-nature-label {
            font-weight: bold;
            text-align: center;
            width: 120px;
          }
          
          .checkbox-row {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 4px;
          }
          
          .checkbox-item {
            font-size: 9px;
            white-space: nowrap;
          }
          
          .equipment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          
          .equipment-table td {
            border: 1px solid black;
            padding: 6px;
            font-size: 10px;
            vertical-align: top;
          }
          
          .effects-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          
          .effects-table td {
            border: 1px solid black;
            padding: 6px;
            font-size: 10px;
            vertical-align: top;
          }
          
          .time-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          
          .time-table td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-size: 10px;
          }
          
          .time-table th {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-size: 9px;
            font-weight: bold;
            background-color: #f5f5f5;
          }
          
          .safety-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          
          .safety-table td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-size: 10px;
            height: 22px;
          }
          
          .safety-table .num-col {
            width: 30px;
            font-weight: bold;
          }
          
          .signature-section {
            margin-top: 15px;
            font-size: 9px;
            text-align: center;
            line-height: 1.4;
          }
          
          .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .signature-table td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
            font-size: 9px;
            height: 35px;
          }
          
          .fill-area {
            min-height: 20px;
            padding: 2px;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <div class="main-title">
            نموذج (٢٠٥) للوظائف التي يتعرض شاغلوها لضرر والعدوى والخطر<br>
            لموظفي وزارة الصحة والخدمات الصحية
          </div>
          
          <!-- الجدول الأساسي -->
          <table class="info-table">
            <tr>
              <th style="width: 18%;">الاسم</th>
              <th style="width: 12%;">رقم الهوية</th>
              <th style="width: 18%;">جهة العمل الفعلية</th>
              <th style="width: 18%;">المسمى الوظيفي</th>
              <th colspan="2" style="width: 18%;">نوع البدل</th>
            </tr>
            <tr>
              <td rowspan="2" style="height: 40px;" class="fill-area">${formData.employee_name || ''}</td>
              <td rowspan="2" class="fill-area">${formData.national_id || ''}</td>
              <td rowspan="2" class="fill-area">${formData.work_entity || ''}</td>
              <td rowspan="2" class="fill-area">${formData.job_title || ''}</td>
              <th>عدوى</th>
              <th>ضرر</th>
            </tr>
            <tr>
              <td>${renderCheckbox(formData.allowance_type === 'عدوى')}</td>
              <td>${renderCheckbox(formData.allowance_type === 'ضرر')}</td>
            </tr>
          </table>
          
          <!-- وصف الواجبات -->
          <div class="duties-description">
            وصف موجز للواجبات والمسؤوليات التي يزاولها حالياً مرتبة حسب الأهمية مع تحديد النسبة المئوية لكل عنصر بحيث لا يتجاوز المجموع ولا يقل عن ١٠٠٪:
          </div>
          
          <table class="duties-table">
            ${[1, 2, 3, 4].map(i => `
              <tr>
                <td class="num-col">${i}</td>
                <td class="fill-area">${formData[`duty_${i}`] || ''}</td>
                <td class="percent-col">% ${formData[`duty_${i}_percentage`]}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="2">المجموع الكلي</td>
              <td>٪١٠٠</td>
            </tr>
          </table>
          
          <!-- طبيعة العمل -->
          <table class="work-nature-table">
            <tr>
              <td class="work-nature-label" rowspan="2">طبيعة العمل:</td>
              <td>
                <div class="checkbox-row">
                  <div class="checkbox-item">${renderCheckbox(formData.work_location_office)} مكتب</div>
                  <div class="checkbox-item">${renderCheckbox(formData.work_location_lab)} معمل</div>
                  <div class="checkbox-item">${renderCheckbox(formData.work_location_hospital)} مستشفى</div>
                  <div class="checkbox-item">${renderCheckbox(formData.work_location_field)} ميدان</div>
                  <div class="checkbox-item">سبب التواجد في هذا المكان</div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="fill-area" style="min-height: 30px;">${formData.presence_reason || ''}</td>
            </tr>
          </table>
          
          <!-- الأجهزة المستعملة -->
          <table class="equipment-table">
            <tr>
              <td class="work-nature-label">المواد المستعملة</td>
              <td class="fill-area" style="min-height: 25px;">${formData.equipment_types || ''}</td>
            </tr>
          </table>
          
          <!-- الآثار المترتبة -->
          <table class="effects-table">
            <tr>
              <td class="work-nature-label" rowspan="2">الآثار المترتبة على استعمالها:</td>
              <td style="text-align: center; font-weight: bold;">عدوى (التعرض لانتقال العدوى)</td>
              <td style="text-align: center; font-weight: bold;">ضررا (التعرض للأضرار)</td>
            </tr>
            <tr>
              <td class="fill-area" style="min-height: 25px;">${formData.infection_effects || ''}</td>
              <td class="fill-area" style="min-height: 25px;">${formData.damage_effects || ''}</td>
            </tr>
          </table>
          
          <!-- وصف الوقت -->
          <table class="time-table">
            <tr>
              <td class="work-nature-label" rowspan="2">وصف الوقت الذي يعمل به</td>
              <th style="width: 12%;">كل الوقت</th>
              <th style="width: 12%;">معظم الوقت</th>
              <th style="width: 12%;">بعض الوقت</th>
              <th style="width: 20%;">النسبة المئوية للوقت الذي يعمل به</th>
              <th style="width: 12%;">النسبة المئوية</th>
            </tr>
            <tr>
              <td>${renderCheckbox(formData.time_all)}</td>
              <td>${renderCheckbox(formData.time_most)}</td>
              <td>${renderCheckbox(formData.time_some)}</td>
              <td>${renderCheckbox(formData.time_percentage)}</td>
              <td>% ${formData.time_percentage_value || ''}</td>
            </tr>
          </table>
          
          <!-- نسبة التعرض -->
          <div style="border: 1px solid black; padding: 8px; margin: 8px 0; font-size: 10px;">
            <strong>نسبة التعرض للضرر أو العدوى بعد التقيد التام باستخدام تلك الوسائل:</strong> _____ %
          </div>
          
          <!-- وسائل الوقاية والسلامة -->
          <div style="border: 1px solid black; padding: 8px; margin: 8px 0;">
            <div style="font-weight: bold; font-size: 10px; margin-bottom: 5px;">وسائل الوقاية والسلامة المستخدمة للعمل مع الأساسية:</div>
            <table class="safety-table">
              ${[1, 2, 3, 4].map(i => `
                <tr>
                  <td class="num-col">${i}</td>
                  <td class="fill-area">${formData[`safety_measure_${i}`] || ''}</td>
                </tr>
              `).join('')}
            </table>
            
            <div style="font-weight: bold; font-size: 10px; margin: 8px 0;">الأسباب:</div>
            <table class="safety-table">
              ${[1, 2, 3, 4].map(i => `
                <tr>
                  <td class="num-col">${i}</td>
                  <td class="fill-area">${formData[`reason_${i}`] || ''}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <!-- الإقرار والتوقيع -->
          <div class="signature-section">
            إقرار: نحن (...................................) الموظف الموضح بياناته أعلاه من المستخدمين لنؤكد العدوى بما يتوافق<br>
            مع اللوائح والأنظمة والتعليمات الوزارية المطبقة لذلك ويمارس عمله بشكل دائم ومتعلق في الجهة المقررة لها البدل وسيقوم جري التوقيع<br>
            مع اللوائح والأنظمة والتعليمات الوزارية الخاصة بالمنطقة الصحية
            
            <table class="signature-table">
              <tr>
                <td>الرئيس المباشر</td>
                <td>رئيس القسم المختص</td>
                <td>الموظف المختص</td>
              </tr>
              <tr style="height: 50px;">
                <td>الاسم:<br>التوقيع:</td>
                <td>الاسم:<br>التوقيع:</td>
                <td>الاسم:<br>التوقيع:</td>
              </tr>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center no-print">
          <h2 className="text-xl font-bold">معاينة نموذج 205</h2>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={onClose} variant="outline">إغلاق</Button>
          </div>
        </div>
        
        <div className="p-4" dangerouslySetInnerHTML={{ __html: getPreviewHTML() }} />
      </div>
    </div>
  );
};

export default function Fill205FormComplete() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    employee_record_id: '',
    employee_name: '',
    national_id: '',
    work_entity: '',
    job_title: '',
    allowance_type: 'عدوى',
    duty_1: '', duty_1_percentage: 0,
    duty_2: '', duty_2_percentage: 0,
    duty_3: '', duty_3_percentage: 0,
    duty_4: '', duty_4_percentage: 0,
    work_location_office: false,
    work_location_lab: false,
    work_location_hospital: false,
    work_location_health_center: false,
    work_location_field: false,
    presence_reason: '',
    equipment_types: '',
    infection_effects: '',
    damage_effects: '',
    time_all: false,
    time_most: false,
    time_some: false,
    time_percentage: false,
    time_percentage_value: '',
    safety_measure_1: '',
    safety_measure_2: '',
    safety_measure_3: '',
    safety_measure_4: '',
    reason_1: '',
    reason_2: '',
    reason_3: '',
    reason_4: ''
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
  }, []);

  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      employee_record_id: employee.id,
      employee_name: employee.full_name_arabic || '',
      national_id: employee.رقم_الهوية || '',
      work_entity: employee.المركز_الصحي || '',
      job_title: employee.position || '',
    }));
    setSearchQuery('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_name || !formData.job_title) {
      alert('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    const totalPercentage = [1,2,3,4].reduce((sum, i) => 
      sum + (Number(formData[`duty_${i}_percentage`]) || 0), 0
    );

    if (totalPercentage !== 100) {
      alert('يجب أن يكون مجموع النسب المئوية للواجبات 100%');
      return;
    }

    setIsSubmitting(true);
    try {
      await Form205Complete.create(formData);
      alert('تم حفظ النموذج بنجاح');
      navigate(createPageUrl('Forms?type=interactive'));
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ في حفظ النموذج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const searchLower = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.full_name_arabic && emp.full_name_arabic.toLowerCase().includes(searchLower)
    );
  }, [searchQuery, employees]);

  const totalPercentage = [1,2,3,4].reduce((sum, i) => 
    sum + (Number(formData[`duty_${i}_percentage`]) || 0), 0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Forms?type=interactive'))} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">نموذج 205 - النسخة الكاملة</h1>
            <p className="text-gray-600 mt-1">للوظائف التي يتعرض شاغلوها لضرر والعدوى والخطر</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* معلومات الموظف الأساسية */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>المعلومات الأساسية</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <Label htmlFor="employee_name">الاسم *</Label>
                  <Input id="employee_name" name="employee_name" value={formData.employee_name} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="national_id">رقم الهوية *</Label>
                  <Input id="national_id" name="national_id" value={formData.national_id} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="work_entity">جهة العمل الفعلية *</Label>
                  <Input id="work_entity" name="work_entity" value={formData.work_entity} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_title">المسمى الوظيفي *</Label>
                  <Input id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} required />
                </div>
                <div>
                  <Label>نوع البدل</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="allowance_type"
                        value="عدوى"
                        checked={formData.allowance_type === 'عدوى'}
                        onChange={handleChange}
                        className="ml-2"
                      />
                      عدوى
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="allowance_type"
                        value="ضرر"
                        checked={formData.allowance_type === 'ضرر'}
                        onChange={handleChange}
                        className="ml-2"
                      />
                      ضرر
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الواجبات والمسؤوليات */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>الواجبات والمسؤوليات</CardTitle>
              <p className="text-sm text-gray-600">وصف موجز للواجبات مرتبة حسب الأهمية مع النسبة المئوية (المجموع = 100%)</p>
            </CardHeader>
            <CardContent>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-3">
                    <Label htmlFor={`duty_${i}`}>{i}. الواجب</Label>
                    <Input id={`duty_${i}`} name={`duty_${i}`} value={formData[`duty_${i}`]} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor={`duty_${i}_percentage`}>النسبة %</Label>
                    <Input 
                      id={`duty_${i}_percentage`} 
                      name={`duty_${i}_percentage`} 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={formData[`duty_${i}_percentage`]} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">المجموع الكلي:</span>
                  <span className={`font-bold text-lg ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPercentage}%
                  </span>
                </div>
                {totalPercentage !== 100 && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">يجب أن يكون المجموع 100%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* طبيعة العمل */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>طبيعة العمل</CardTitle></CardHeader>
            <CardContent>
              <Label className="text-base font-semibold">مكان العمل:</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-4">
                {Object.entries({
                  work_location_office: 'مكتب',
                  work_location_lab: 'معمل', 
                  work_location_hospital: 'مستشفى',
                  work_location_health_center: 'مركز صحي',
                  work_location_field: 'ميدان'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      name={key}
                      checked={formData[key]}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                    <Label htmlFor={key} className="mr-2">{label}</Label>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label htmlFor="presence_reason">سبب التواجد في هذا المكان:</Label>
                <Textarea 
                  id="presence_reason" 
                  name="presence_reason" 
                  value={formData.presence_reason} 
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* الأجهزة والآثار */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>الأجهزة والآثار المترتبة</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="equipment_types">الأجهزة المستعملة ونوعيها:</Label>
                <Textarea 
                  id="equipment_types" 
                  name="equipment_types" 
                  value={formData.equipment_types} 
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="infection_effects">عدوى (التعرض لانتقال العدوى):</Label>
                  <Textarea 
                    id="infection_effects" 
                    name="infection_effects" 
                    value={formData.infection_effects} 
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="damage_effects">ضررا (التعرض للأضرار):</Label>
                  <Textarea 
                    id="damage_effects" 
                    name="damage_effects" 
                    value={formData.damage_effects} 
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* وصف الوقت */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>وصف الوقت الذي يعمل به</CardTitle></CardHeader>
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

              {formData.time_percentage && (
                <div>
                  <Label htmlFor="time_percentage_value">النسبة المئوية للوقت:</Label>
                  <Input 
                    id="time_percentage_value" 
                    name="time_percentage_value" 
                    type="number"
                    min="0"
                    max="100"
                    value={formData.time_percentage_value} 
                    onChange={handleChange}
                    placeholder="0-100"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* وسائل الوقاية */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>وسائل الوقاية والسلامة</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
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

              <div className="mb-6">
                <Label className="text-base font-semibold">الأسباب:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Label htmlFor={`reason_${i}`}>({i}) السبب</Label>
                      <Input 
                        id={`reason_${i}`} 
                        name={`reason_${i}`} 
                        value={formData[`reason_${i}`]} 
                        onChange={handleChange} 
                      />
                    </div>
                  ))}
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
              <Button type="submit" disabled={isSubmitting || totalPercentage !== 100} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ النموذج'}
              </Button>
            </div>
          </div>
        </form>

        {showPreview && (
          <Form205CompletePreview 
            formData={formData} 
            onClose={() => setShowPreview(false)} 
          />
        )}
      </div>
    </div>
  );
}
