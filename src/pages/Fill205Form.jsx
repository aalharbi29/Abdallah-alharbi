
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form205 } from '@/entities/Form205';
import { Employee } from '@/entities/Employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, Eye, AlertCircle, Printer } from 'lucide-react';
import { createPageUrl } from '@/utils';
import FormExportManager from '../components/export/FormExportManager';

const Form205Preview = ({ formData, onClose }) => {
  const getPreviewHTML = () => {
    // Adjusted styles for checkbox to fit the new design
    const renderCheckbox = (checked) => `<div style="width:14px; height:14px; border:1px solid black; display:inline-flex; align-items:center; justify-content:center; margin: 0 4px; font-size:10px;">${checked ? '&#10003;' : '&nbsp;'}</div>`;
    // Adjusted length for dotted value
    const renderDottedValue = (value) => value || '...........................';
    
    return `
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; font-weight: 600; margin: 0; padding: 0; }
          @page { size: A4; margin: 15mm; } /* Adjusted page margin */
          .container { 
            width: 100%; 
            max-width: 800px; 
            margin: auto; 
            height: 250mm; /* Set fixed height to 250mm */
            display: flex; 
            flex-direction: column;
          }
          .title { text-align: center; font-size: 20px; font-weight: bold; line-height: 1.4; margin-bottom: 20px; } /* Adjusted font-size, margin */
          .section-title { font-weight: bold; margin: 0 0 12px 0; font-size: 16px; text-decoration: underline; } /* Adjusted margin, font-size, added underline */
          .bordered-box { 
            border: 2px solid black; 
            padding: 15px; 
            margin-bottom: 0; /* Adjusted margin */
            flex-grow: 1; /* Allows it to grow and fill available space */
            display: flex;
            flex-direction: column;
            justify-content: space-around; /* Distributes content evenly */
          }
          .info-table { 
            width: 100%; 
            border-collapse: collapse;
            margin-bottom: 10px; /* Added margin-bottom */
          }
          .info-table td { 
            padding: 10px 8px; /* Adjusted padding */
            font-size: 16px; /* Adjusted font-size */
            font-weight: 600; /* Adjusted font-weight */
            border: none; /* Added border: none */
            vertical-align: middle; /* Added vertical-align */
          }
          .info-table tr {
            height: 35px;
          }
          .right-align { text-align: right; }
          .center-align { text-align: center; }
          .left-align { text-align: left; }
          .duties-title { font-weight: bold; font-size: 14px; text-align: center; margin: 0 0 12px 0; line-height: 1.4; } /* Adjusted font-size, margin */
          .duties-table { width: 100%; border-collapse: collapse; margin: 0 0 15px 0; } /* Adjusted margin */
          .duties-table td { border: 1px solid black; padding: 8px; vertical-align: top; font-size: 14px; font-weight: 600; } /* Adjusted font-size */
          .duties-table .num { width: 5%; text-align: center; }
          .duties-table .percent { width: 15%; text-align: center; }
          .total-row { font-weight: bold; }
          .work-conditions-title { font-weight: bold; margin: 0 0 12px 0; font-size: 16px; text-decoration: underline; } /* Adjusted margin, font-size, added underline */
          .work-location-title { font-weight: bold; font-size: 14px; margin: 0 0 10px 0; } /* Adjusted margin, font-size */
          .checkbox-grid { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-top: 12px; } /* Adjusted gap, margin */
          .checkbox-item { display: flex; align-items: center; font-size: 14px; font-weight: 600; } /* Adjusted font-size */
          .other-location { margin: 15px 0 15px 0; font-size: 14px; font-weight: 600; } /* Adjusted margin, font-size */
          .reason-section { margin-top: 0; } /* Adjusted margin */
          .reason-title { font-weight: bold; font-size: 14px; margin-bottom: 8px; } /* Adjusted margin-bottom, font-size */
          .reason-box { border: 1px solid black; min-height: 40px; margin-top: 8px; padding: 8px; margin-bottom: 0; } /* Adjusted min-height, margin */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">نموذج (٢٠٥)<br/>للوظائف التي يتعرض شاغلوها (لضرر، عدوى) أو خطر</div>
          <div class="bordered-box">
            <div> <!-- Wrapper div for general info section -->
              <div class="section-title">معلومات عامة:</div>
              <table class="info-table">
                <tr>
                  <td class="right-align" style="width:33.33%;">الوزارة: ${renderDottedValue(formData.ministry)}</td>
                  <td class="center-align" style="width:33.33%;">الإدارة: ${renderDottedValue(formData.administration)}</td>
                  <td class="left-align" style="width:33.33%;">البلد: ${renderDottedValue(formData.country)}</td>
                </tr>
                <tr>
                  <td class="right-align">مسمى الوظيفة بالميزانية: ${renderDottedValue(formData.job_title_budget)}</td>
                  <td class="center-align">مرتبتها: ${renderDottedValue(formData.job_rank)}</td>
                  <td class="left-align">رقمها: ${renderDottedValue(formData.job_number)}</td>
                </tr>
                <tr>
                  <td colspan="2" class="right-align">اسم شاغلها: ${renderDottedValue(formData.employee_name)}</td>
                  <td class="center-align">وظيفته: ${renderDottedValue(formData.employee_position)}</td>
                </tr>
                 <tr>
                  <td colspan="2" class="right-align">رقم قرار التكليف: ${renderDottedValue(formData.assignment_decision_number)}</td>
                  <td class="center-align">تاريخه: ${formData.assignment_date ? new Date(formData.assignment_date).toLocaleDateString('ar-SA') : '__/__/____'}</td>
                </tr>
              </table>
            </div>

            <div> <!-- Wrapper div for duties section -->
              <div class="duties-title">وصف موجز للواجبات والمسؤوليات التي يزاولها حالياً مرتبة حسب الأهمية مع تحديد النسبة المئوية لكل عنصر بحيث لا يتجاوز المجموع ولا يقل عن ١٠٠٪:</div>
              <table class="duties-table">
                ${[1, 2, 3, 4, 5, 6].map(i => `
                  <tr>
                    <td class="num">${i}.</td>
                    <td>${formData[`duty_${i}`] || ''}</td>
                    <td class="percent">% ${formData[`duty_${i}_percentage`] || ''}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2">المجموع:</td>
                  <td class="percent">% 100</td>
                </tr>
              </table>
            </div>

            <div> <!-- Wrapper div for work conditions section -->
              <div class="work-conditions-title">ظروف العمل:</div>
              <div class="work-location-title">(أ) مكان العمل:</div>
              <div class="checkbox-grid">
                ${Object.entries({
                  office:'مكتب', lab:'معمل', hospital:'مستشفى', field:'ميدان', 
                  street:'شارع', warehouse:'مستودع', workshop:'ورشة'
                }).map(([key, name]) => 
                  `<div class="checkbox-item">${renderCheckbox(formData[`work_location_${key}`])} ${name}</div>`
                ).join('')}
              </div>
              <div class="other-location">${formData.work_location_other ? `${renderCheckbox(true)} مكان آخر يحدد: ${formData.work_location_other}` : `${renderCheckbox(false)} مكان آخر يحدد`}</div>
              
              <div class="reason-section">
                <div class="reason-title">سبب التواجد في هذا المكان:</div>
                <div class="reason-box">${formData.reason_for_presence || ''}</div>
              </div>
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
          <h2 className="text-xl font-bold">معاينة نموذج 205</h2>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <FormExportManager formData={formData} formHTMLGenerator={getPreviewHTML} fileName="نموذج_205" /> {/* Ensure fileName is passed */}
            <Button onClick={onClose} variant="outline">إغلاق</Button>
          </div>
        </div>
        
        <div className="p-4" dangerouslySetInnerHTML={{ __html: getPreviewHTML() }} />
      </div>
    </div>
  );
};

export default function Fill205Form() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    employee_record_id: '',
    ministry: '',
    administration: '',
    country: '',
    job_title_budget: '',
    job_rank: '',
    job_number: '',
    employee_name: '',
    employee_position: '',
    assignment_decision_number: '',
    assignment_date: '',
    duty_1: '', duty_1_percentage: 0,
    duty_2: '', duty_2_percentage: 0,
    duty_3: '', duty_3_percentage: 0,
    duty_4: '', duty_4_percentage: 0,
    duty_5: '', duty_5_percentage: 0,
    duty_6: '', duty_6_percentage: 0,
    work_location_office: false,
    work_location_lab: false,
    work_location_hospital: false,
    work_location_field: false,
    work_location_street: false,
    work_location_warehouse: false,
    work_location_workshop: false,
    work_location_other: '',
    reason_for_presence: ''
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
      employee_position: employee.position || '',
      job_number: employee.رقم_الموظف || '',
      job_rank: employee.job_rank || '', 
      // Auto-fill other relevant data
      // e.g., you can set ministry/administration if it's common
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
    if (!formData.employee_name || !formData.employee_position) {
      alert('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      await Form205.create(formData);
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

  const totalPercentage = [1,2,3,4,5,6].reduce((sum, i) => 
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
            <h1 className="text-3xl font-bold text-gray-900">نموذج 205</h1>
            <p className="text-gray-600 mt-1">للوظائف التي يتعرض شاغلوها (لضرر، عدوى) أو خطر</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card 1: General Info */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>معلومات عامة</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="ministry">الوزارة</Label>
                  <Input id="ministry" name="ministry" value={formData.ministry} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="administration">الإدارة</Label>
                  <Input id="administration" name="administration" value={formData.administration} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="country">البلد</Label>
                  <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="job_title_budget">مسمى الوظيفة بالميزانية</Label>
                  <Input id="job_title_budget" name="job_title_budget" value={formData.job_title_budget} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="job_rank">مرتبتها</Label>
                  <Input id="job_rank" name="job_rank" value={formData.job_rank} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="job_number">رقمها</Label>
                  <Input id="job_number" name="job_number" value={formData.job_number} onChange={handleChange} />
                </div>
              </div>

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
                  <Label htmlFor="employee_position">وظيفته *</Label>
                  <Input id="employee_position" name="employee_position" value={formData.employee_position} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="employee_name">اسم شاغلها *</Label>
                  <Input id="employee_name" name="employee_name" value={formData.employee_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="assignment_date">تاريخه</Label>
                  <Input id="assignment_date" name="assignment_date" type="date" value={formData.assignment_date} onChange={handleChange} />
                </div>
              </div>

              <div>
                <Label htmlFor="assignment_decision_number">رقم قرار التكليف</Label>
                <Input id="assignment_decision_number" name="assignment_decision_number" value={formData.assignment_decision_number} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Duties */}
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>الواجبات والمسؤوليات</CardTitle>
              <p className="text-sm text-gray-600">وصف موجز للواجبات والمسؤوليات مرتبة حسب الأهمية مع تحديد النسبة المئوية</p>
            </CardHeader>
            <CardContent>
              {[1, 2, 3, 4, 5, 6].map((i) => (
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

          {/* Card 3: Work Conditions */}
          <Card className="shadow-lg mb-6">
            <CardHeader><CardTitle>ظروف العمل</CardTitle></CardHeader>
            <CardContent>
              <Label className="text-base font-semibold">١. مكان العمل:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                {Object.entries({
                  office: 'مكتب',
                  lab: 'معمل', 
                  hospital: 'مستشفى',
                  field: 'ميدان',
                  street: 'شارع',
                  warehouse: 'مستودع',
                  workshop: 'ورشة'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`work_location_${key}`}
                      name={`work_location_${key}`}
                      checked={formData[`work_location_${key}`]}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, [`work_location_${key}`]: checked }))
                      }
                    />
                    <Label htmlFor={`work_location_${key}`} className="mr-2">{label}</Label>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label htmlFor="work_location_other">مكان آخر يحدد:</Label>
                <Input 
                  id="work_location_other" 
                  name="work_location_other" 
                  value={formData.work_location_other} 
                  onChange={handleChange} 
                  placeholder="اذكر المكان الآخر إن وجد"
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="reason_for_presence">سبب التواجد في هذا المكان:</Label>
                <Textarea 
                  id="reason_for_presence" 
                  name="reason_for_presence" 
                  value={formData.reason_for_presence} 
                  onChange={handleChange}
                  rows={4}
                  placeholder="اشرح سبب التواجد في مكان العمل المحدد..."
                />
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
          <Form205Preview 
            formData={formData} 
            onClose={() => setShowPreview(false)} 
          />
        )}
      </div>
    </div>
  );
}
