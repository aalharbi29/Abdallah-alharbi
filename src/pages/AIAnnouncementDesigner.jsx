import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Wand2, Download, Printer, RefreshCw, Users, Calendar,
  MapPin, Info, Sparkles, Image as ImageIcon, Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AIAnnouncementDesigner() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // بيانات الإعلان
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    additionalInfo: '',
    designStyle: 'professional',
    colorScheme: 'blue'
  });

  // البيانات المراد إظهارها
  const [displayFields, setDisplayFields] = useState({
    full_name_arabic: true,
    position: true,
    رقم_الموظف: false,
    المركز_الصحي: true,
    department: false,
    phone: false,
    email: false
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Employee.list('-updated_date', 500);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployee = (employee) => {
    setSelectedEmployees(prev => {
      const exists = prev.find(e => e.id === employee.id);
      if (exists) {
        return prev.filter(e => e.id !== employee.id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const toggleField = (field) => {
    setDisplayFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const generateDesign = async () => {
    if (!announcementData.title || selectedEmployees.length === 0) {
      alert('الرجاء إدخال عنوان الإعلان واختيار موظف واحد على الأقل');
      return;
    }

    setIsGenerating(true);
    try {
      // تجهيز بيانات الموظفين المحددة
      const employeesData = selectedEmployees.map(emp => {
        const empData = {};
        Object.keys(displayFields).forEach(field => {
          if (displayFields[field]) {
            empData[field] = emp[field] || 'غير محدد';
          }
        });
        return empData;
      });

      const prompt = `أنت مصمم جرافيك محترف. قم بإنشاء تصميم HTML/CSS جميل واحترافي لإعلان رسمي.

معلومات الإعلان:
- العنوان: ${announcementData.title}
- الوصف: ${announcementData.description || 'لا يوجد'}
- التاريخ: ${announcementData.date || 'غير محدد'}
- الوقت: ${announcementData.time || 'غير محدد'}
- الموقع: ${announcementData.location || 'غير محدد'}
- معلومات إضافية: ${announcementData.additionalInfo || 'لا يوجد'}

أسماء المرشحين وبياناتهم:
${JSON.stringify(employeesData, null, 2)}

نمط التصميم المطلوب: ${announcementData.designStyle}
نظام الألوان: ${announcementData.colorScheme}

المطلوب:
1. صمم لوحة إعلانية جذابة واحترافية بتنسيق A4 (297mm x 210mm) landscape
2. استخدم ألوان ${announcementData.colorScheme === 'blue' ? 'أزرق وأخضر' : announcementData.colorScheme === 'green' ? 'أخضر ورمادي' : 'ذهبي وأزرق'}
3. اجعل العنوان بارز وكبير في الأعلى
4. نسق أسماء المرشحين في جدول أنيق أو بطاقات جميلة
5. أضف الشعار والهوية البصرية لوزارة الصحة
6. استخدم خطوط عربية واضحة ومقروءة
7. أضف عناصر تصميمية جميلة (أيقونات، إطارات، خلفيات)
8. اجعل التصميم جاهز للطباعة

أرجع ONLY كود HTML كامل متضمن CSS inline بدون أي نص إضافي أو شروحات.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedDesign(response);
    } catch (error) {
      console.error('Error generating design:', error);
      alert('فشل في توليد التصميم: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatedDesign);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDesign], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `announcement-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredEmployees = employees.filter(emp =>
    !searchQuery ||
    emp.full_name_arabic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.رقم_الموظف?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl mb-4">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            مصمم الإعلانات بالذكاء الاصطناعي
          </h1>
          <p className="text-lg text-gray-600">
            صمم إعلانات احترافية في ثوانٍ باستخدام الذكاء الاصطناعي
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* لوحة الإدخال */}
          <div className="space-y-6">
            {/* معلومات الإعلان */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  معلومات الإعلان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>عنوان الإعلان *</Label>
                  <Input
                    value={announcementData.title}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="مثال: المرشحين لحضور دورة الأمن والسلامة"
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label>وصف أو تفاصيل</Label>
                  <Textarea
                    value={announcementData.description}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر للإعلان..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>التاريخ</Label>
                    <Input
                      type="date"
                      value={announcementData.date}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>الوقت</Label>
                    <Input
                      type="time"
                      value={announcementData.time}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>الموقع</Label>
                  <Input
                    value={announcementData.location}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="مثال: قاعة الاجتماعات - المدينة المنورة"
                  />
                </div>

                <div>
                  <Label>معلومات إضافية</Label>
                  <Textarea
                    value={announcementData.additionalInfo}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="أي ملاحظات أو تعليمات إضافية..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نمط التصميم</Label>
                    <Select
                      value={announcementData.designStyle}
                      onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, designStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">رسمي واحترافي</SelectItem>
                        <SelectItem value="modern">عصري وجذاب</SelectItem>
                        <SelectItem value="elegant">أنيق وفاخر</SelectItem>
                        <SelectItem value="simple">بسيط ونظيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نظام الألوان</Label>
                    <Select
                      value={announcementData.colorScheme}
                      onValueChange={(value) => setAnnouncementData(prev => ({ ...prev, colorScheme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">أزرق وأخضر</SelectItem>
                        <SelectItem value="green">أخضر ورمادي</SelectItem>
                        <SelectItem value="gold">ذهبي وأزرق</SelectItem>
                        <SelectItem value="purple">بنفسجي ووردي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* البيانات المراد إظهارها */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  البيانات المراد إظهارها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-name"
                      checked={displayFields.full_name_arabic}
                      onCheckedChange={() => toggleField('full_name_arabic')}
                    />
                    <Label htmlFor="field-name" className="cursor-pointer">الاسم الكامل</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-position"
                      checked={displayFields.position}
                      onCheckedChange={() => toggleField('position')}
                    />
                    <Label htmlFor="field-position" className="cursor-pointer">التخصص</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-employee-num"
                      checked={displayFields.رقم_الموظف}
                      onCheckedChange={() => toggleField('رقم_الموظف')}
                    />
                    <Label htmlFor="field-employee-num" className="cursor-pointer">الرقم الوظيفي</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-center"
                      checked={displayFields.المركز_الصحي}
                      onCheckedChange={() => toggleField('المركز_الصحي')}
                    />
                    <Label htmlFor="field-center" className="cursor-pointer">المركز الصحي</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-department"
                      checked={displayFields.department}
                      onCheckedChange={() => toggleField('department')}
                    />
                    <Label htmlFor="field-department" className="cursor-pointer">القسم</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-phone"
                      checked={displayFields.phone}
                      onCheckedChange={() => toggleField('phone')}
                    />
                    <Label htmlFor="field-phone" className="cursor-pointer">الهاتف</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="field-email"
                      checked={displayFields.email}
                      onCheckedChange={() => toggleField('email')}
                    />
                    <Label htmlFor="field-email" className="cursor-pointer">البريد الإلكتروني</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* اختيار الموظفين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    اختيار الموظفين ({selectedEmployees.length})
                  </span>
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredEmployees.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedEmployees.find(e => e.id === emp.id)
                          ? 'bg-purple-50 border-purple-300 shadow-md'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{emp.full_name_arabic}</div>
                          <div className="text-sm text-gray-600">{emp.position} - {emp.المركز_الصحي}</div>
                        </div>
                        <Checkbox
                          checked={!!selectedEmployees.find(e => e.id === emp.id)}
                          onCheckedChange={() => toggleEmployee(emp)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* زر التصميم */}
            <Button
              onClick={generateDesign}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري التصميم...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 ml-2" />
                  توليد التصميم بالذكاء الاصطناعي
                </>
              )}
            </Button>
          </div>

          {/* لوحة المعاينة */}
          <div className="space-y-6">
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    معاينة التصميم
                  </span>
                  {generatedDesign && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 ml-2" />
                        طباعة
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 ml-2" />
                        تحميل
                      </Button>
                      <Button variant="outline" size="sm" onClick={generateDesign}>
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة التصميم
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!generatedDesign ? (
                  <div className="text-center py-20 text-gray-400">
                    <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">املأ البيانات واختر الموظفين</p>
                    <p className="text-sm">ثم اضغط على "توليد التصميم" لرؤية الإعلان</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-purple-200 rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={generatedDesign}
                      className="w-full h-[600px] bg-white"
                      title="معاينة التصميم"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* الموظفين المحددين */}
            {selectedEmployees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    الموظفين المحددين ({selectedEmployees.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedEmployees.map((emp, index) => (
                      <div key={emp.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{emp.full_name_arabic}</div>
                            <div className="text-xs text-gray-600">{emp.position}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEmployee(emp)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* معلومات مفيدة */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">💡 نصائح للحصول على أفضل تصميم</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• اكتب عنوان واضح ومختصر</li>
                  <li>• حدد البيانات المهمة فقط لتجنب الازدحام</li>
                  <li>• اختر نمط التصميم المناسب للمناسبة</li>
                  <li>• يمكنك إعادة التصميم عدة مرات للحصول على نتائج مختلفة</li>
                  <li>• التصميم جاهز للطباعة بجودة عالية</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}