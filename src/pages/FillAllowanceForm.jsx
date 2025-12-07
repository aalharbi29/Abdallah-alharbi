
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AllowanceRequest } from '@/entities/AllowanceRequest';
import { Employee } from '@/entities/Employee';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Save, FileText, Eye } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const AllowanceFormPreview = ({ formData, onClose }) => {
  const getCurrentHijriDate = () => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date()).replace(/\//g, '-');
    } catch (error) {
      return new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('allowance-form-preview');
    const printWindow = window.open('', '_blank');

    if (printWindow && printWindow.document) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="utf-8">
            <title>إقرار بدل العدوى والضرر والخطر</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                direction: rtl; 
                margin: 0; 
                padding: 0; 
                background: white;
              }
              .form-container { 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                position: relative;
                background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/4cc2f0984_.png');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                padding: 20mm;
                box-sizing: border-box;
              }
              .content { 
                position: relative; 
                z-index: 2;
                line-height: 1.6;
              }
              .header {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                margin-bottom: 30px;
                padding-left: 80px; /* زيادة المسافة أكثر لتحريك النص والعمود لليمين */
              }
              .header-content {
                display: flex;
                align-items: center;
                gap: 20px; /* تقليل المسافة لتقريب الفقرات من العمود */
              }
              .header-text {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                font-size: 11px;
                line-height: 1.4;
              }
              .header-line {
                margin: 2px 0;
                font-weight: bold;
                color: #0284c7;
                text-align: left;
                background: none;
                padding: 0;
                border-radius: 0;
                display: block;
              }
              .vertical-line {
                width: 2px;
                height: 60px;
                background-color: #0284c7;
                margin: 0 10px;
              }
              .main-title {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin: 25px 0 0 0;
                text-decoration: none;
              }
              .info-table {
                width: 100%;
                border-collapse: collapse;
                margin: 0;
                border: 5px solid black; /* حد واحد سميك بدلاً من المضاعف */
              }
              .info-table th, .info-table td {
                border: 1px solid black;
                padding: 10px;
                text-align: center;
                font-weight: bold;
                font-size: 14px;
              }
              .info-table th {
                background-color: #f5f5f5;
              }
              .declaration-text {
                text-align: center;
                margin: 0;
                font-size: 18px;
                font-weight: bold;
                line-height: 1.8;
              }
              .commitment-header {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                line-height: 1.8;
                margin-top: 10px; /* زيادة المسافة للفصل بوضوح */
              }
              .commitment-section {
                margin: 0 0 20px 0;
                text-align: right;
                line-height: 1.6;
                font-size: 18px;
                padding-right: 20px;
              }
              .commitment-list {
                margin: 0;
                padding-right: 25px;
              }
              .commitment-list div {
                margin: 2px 0;
                font-size: 18px;
                font-weight: bold;
              }
              .final-commitment {
                font-weight: bold;
                font-size: 22px;
                margin: 20px 0 10px 0;
                text-align: right;
              }
              .employee-signature {
                text-align: right;
                margin: 10px 0;
                font-size: 18px;
              }
              .employee-name {
                font-size: 22px;
                font-weight: bold;
              }
              .signature-line {
                border-bottom: 2px solid black;
                width: 100%;
                margin: 15px 0;
              }
              .supervisor-title {
                font-weight: bold;
                font-size: 22px;
                margin: 5px 0 15px 0;
                text-align: center;
                line-height: 1.4;
              }
              .supervisor-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .supervisor-table {
                border-collapse: collapse;
                width: 70%;
              }
              .supervisor-table th, .supervisor-table td {
                border: 2px solid black;
                padding: 12px;
                text-align: center;
                font-weight: bold;
                font-size: 20px; /* تضخيم كافة البيانات إلى 20px */
              }
              .supervisor-table th {
                background-color: #f5f5f5;
                width: 30%;
                font-size: 20px; /* تضخيم العناوين أيضاً */
              }
              .supervisor-table .signature-cell {
                height: 25px;
                font-size: 20px;
              }
              .supervisor-table .supervisor-name {
                font-size: 20px; /* موحد مع باقي البيانات */
                font-weight: bold;
              }
              .stamp-area {
                width: 25%;
                text-align: center;
                border: 2px solid black;
                padding: 40px 10px;
                margin-left: 20px;
                font-weight: bold;
                font-size: 20px; /* تضخيم نص الختم أيضاً */
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
                @page {
                  size: A4;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div id="print-content-wrapper">${printContent.innerHTML}</div>
          </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      alert('تم حجب النوافذ المنبثقة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}>

      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center no-print">
          <h2 className="text-xl font-bold">معاينة نموذج إقرار البدل</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={onClose} variant="outline">إغلاق</Button>
          </div>
        </div>
        
        <div id="allowance-form-preview" className="p-0">
          <div className="form-container" style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            position: 'relative',
            backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/4cc2f0984_.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            padding: '20mm',
            boxSizing: 'border-box'
          }}>
            
            <div className="content">
              <div className="header" style={{ paddingLeft: '80px' }}> {/* تحريك أكثر لليمين */}
                <div className="header-content" style={{ gap: '20px' }}> {/* تقليل المسافة */}
                  <div className="vertical-line"></div>
                  <div className="mr-6 ml-20 header-text">
                    <div className="header-line">تجمع المدينة المنورة الصحي</div>
                    <div className="header-line">إدارة الرعاية الأولية بتجمع المدينة المنورة الصحي</div>
                    <div className="header-line">إدارة شئون المراكز الصحية بالحناكية</div>
                  </div>
                </div>
              </div>

              <div className="main-title">
                إقرار بدل (العدوى والضرر والخطر) لمزاولة الوظيفة المقرر لها البدل
              </div>

              <table className="info-table">
                <thead>
                  <tr>
                    <th>الاســـــــــم</th>
                    <th>الوظيفة</th>
                    <th>رقم الموظف</th>
                    <th>القسم المكلف بالعمل به</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formData.employee_name || '_____________'}</td>
                    <td>{formData.position || '_____________'}</td>
                    <td>{formData.employee_number || '_____________'}</td>
                    <td>{formData.department || '_____________'}</td>
                  </tr>
                </tbody>
              </table>

              <div className="declaration-text">
                أنا الموضح اسمي وبياناتي أعلاه أطلب صرف {formData.allowance_type || 'بدل عدوى'} المقرر لي نظاماً حسب لائحة الوظائف الصحية.
              </div>
              
              <div className="commitment-header">
                وأتعهد بما يلي:
              </div>

              <div className="commitment-section">
                <div className="commitment-list">
                  <div>- أن مسمى الوظيفة مشمول بلائحة الوظائف الصحية.</div>
                  <div>- أن مسمى الوظيفة مشمول بدليل التصنيف المهني للممارسين الصحيين.</div>
                  <div>- أن مسمى الوظيفة مشمول ببدل العدوى او الخطر.</div>
                  <div>- أن مسمى التخصص مشمول ببدل العدوى او الخطر.</div>
                  <div>- أن الوظيفة متوافقة مع تخصص الموظف.</div>
                  <div>- أني أمارس مهام التخصص بصفة دائمة ومستمرة بالقسم المقرر له البدل.</div>
                </div>
              </div>

              <div className="final-commitment">
                أتعهد بصحة المعلومات الواردة أعلاه وأتحمل كامل المسؤولية في حال ثبت خلاف ذلك:
              </div>

              <div className="employee-signature">
                <div className="employee-name"><strong>الاسم:</strong> {formData.employee_name || '_____________'}</div>
                <div style={{ margin: '8px 0' }}><strong>التوقيع:</strong> _____________</div>
                <div><strong>التاريخ:</strong> {formData.employee_signature_date ? format(new Date(formData.employee_signature_date), 'yyyy-MM-dd') + ' هـ' : getCurrentHijriDate() + ' هـ'}</div>
              </div>

              <div className="signature-line"></div>

              <div className="supervisor-title">
                مصادقة الرئيس المباشر على صحة المعلومات ومزاولة الموظف لمهام الوظيفة
                <br />
                بالقسم المقرر له البدل وإبلاغ إدارة الموارد البشرية عند نقله أو تكليفه.
              </div>

              <div className="supervisor-info">
                <div className="stamp-area">
                  الختم
                </div>
                <table className="supervisor-table">
                  <tbody>
                    <tr>
                      <th>الاسم</th>
                      <td className="supervisor-name">{formData.supervisor_name || 'عبدالمجيد سعود الربيقي'}</td>
                    </tr>
                    <tr>
                      <th>التوقيع</th>
                      <td className="signature-cell"></td>
                    </tr>
                    <tr>
                      <th>التاريخ</th>
                      <td>{formData.supervisor_signature_date ? format(new Date(formData.supervisor_signature_date), 'yyyy-MM-dd') + ' هـ' : getCurrentHijriDate() + ' هـ'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default function FillAllowanceForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employee_name: '',
    position: '',
    employee_number: '',
    department: '',
    allowance_type: 'بدل عدوى',
    employee_signature_date: format(new Date(), 'yyyy-MM-dd'),
    supervisor_name: 'عبدالمجيد سعود الربيقي',
    supervisor_signature_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let employeesData = [];
      let userData = null;

      try {
        const empResult = await Employee.list();
        employeesData = Array.isArray(empResult) ? empResult : [];
      } catch (err) {
        console.warn('Failed to load employees:', err);
        employeesData = [];
      }

      try {
        userData = await User.me();
      } catch (err) {
        console.warn('Failed to load user data:', err);
        userData = null;
      }

      setEmployees(employeesData);
      setCurrentUser(userData);

    } catch (error) {
      console.error('Error loading data:', error);
      setEmployees([]);
      setCurrentUser(null);
    }
  };

  const handleEmployeeSelect = (employee) => {
    setFormData((prev) => ({
      ...prev,
      employee_name: employee.full_name_arabic || '',
      position: employee.position || '',
      employee_number: employee.رقم_الموظف || '',
      department: employee.المركز_الصحي || ''
    }));
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_name || !formData.position || !formData.employee_number) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      await AllowanceRequest.create({
        ...formData,
        status: 'submitted'
      });

      alert('تم إرسال الطلب بنجاح');
      navigate(createPageUrl('Forms?type=interactive'));
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ في إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const safeEmployees = useMemo(() => Array.isArray(employees) ? employees : [], [employees]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return [];

    const searchLower = searchQuery.toLowerCase().trim();
    if (searchLower.length < 2) return [];

    return safeEmployees.filter((employee) => {
      if (!employee || !employee.full_name_arabic) return false;

      const nameLower = employee.full_name_arabic.toLowerCase();

      if (searchLower.includes(' ')) {
        const searchTerms = searchLower.split(' ').filter(Boolean);
        return searchTerms.every((term) => nameLower.includes(term));
      } else {
        return nameLower.includes(searchLower);
      }
    });
  }, [searchQuery, safeEmployees]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Forms?type=interactive'))} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إقرار بدل العدوى والضرر والخطر</h1>
            <p className="text-gray-600 mt-1">تعبئة طلب بدل العدوى والضرر والخطر</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              بيانات الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="employee_search">بحث عن موظف (بالاسم الثنائي)</Label>
                  <Input
                    id="employee_search"
                    placeholder="ابحث بالاسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} />

                  {searchQuery.length >= 2 && filteredEmployees.length > 0 &&
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredEmployees.map((emp) =>
                    <div
                      key={emp.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleEmployeeSelect(emp)}>

                                  {emp.full_name_arabic}
                              </div>
                    )}
                      </div>
                  }
                  {searchQuery.length >= 2 && filteredEmployees.length === 0 &&
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-2 text-gray-500">
                        لا يوجد موظفين مطابقين
                    </div>
                  }
                </div>
                <div>
                  <Label htmlFor="employee_name">اسم الموظف *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employee_name: e.target.value }))}
                    required
                    className="bg-gray-100"
                    readOnly />

                </div>
                <div>
                  <Label htmlFor="position">الوظيفة *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                    required
                    className="bg-gray-100"
                    readOnly />

                </div>
                <div>
                  <Label htmlFor="employee_number">رقم الموظف *</Label>
                  <Input
                    id="employee_number"
                    value={formData.employee_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employee_number: e.target.value }))}
                    required
                    className="bg-gray-100"
                    readOnly />

                </div>
                <div>
                  <Label htmlFor="department">القسم المكلف بالعمل به *</Label>
                   <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                    required
                    className="bg-gray-100"
                    readOnly />

                </div>
              </div>

              <div>
                <Label htmlFor="allowance_type">نوع البدل المطلوب *</Label>
                <Select value={formData.allowance_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, allowance_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="بدل عدوى">بدل عدوى</SelectItem>
                    <SelectItem value="بدل ضرر">بدل ضرر</SelectItem>
                    <SelectItem value="بدل خطر">بدل خطر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supervisor_name">اسم الرئيس المباشر</Label>
                  <Input
                    id="supervisor_name"
                    value={formData.supervisor_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, supervisor_name: e.target.value }))} />

                </div>
                <div>
                  <Label htmlFor="supervisor_signature_date">تاريخ المصادقة</Label>
                  <Input
                    id="supervisor_signature_date"
                    type="date"
                    value={formData.supervisor_signature_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, supervisor_signature_date: e.target.value }))} />

                </div>
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3} />

              </div>

              <div className="flex justify-between pt-6">
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
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {showPreview &&
        <AllowanceFormPreview formData={formData} onClose={handleClosePreview} />
        }
      </div>
    </div>);

}
