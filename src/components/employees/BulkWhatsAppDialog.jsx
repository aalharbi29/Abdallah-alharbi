import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  Eye, 
  Copy,
  Phone,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const normalizePhoneForWhatsApp = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  
  if (digits.startsWith('966')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 9) return '966' + digits.slice(1);
  if (digits.length === 9) return '966' + digits;

  return digits;
};

const MESSAGE_TEMPLATES = [
  {
    name: 'تحية عامة',
    text: 'السلام عليكم ورحمة الله وبركاته\n\nنأمل أن تكونوا بخير.\n\nتحياتي،\nإدارة المراكز الصحية بالحناكية'
  },
  {
    name: 'تذكير اجتماع',
    text: 'السادة الزملاء المحترمين\n\nنذكركم باجتماع الغد في تمام الساعة ___\n\nنأمل الحضور في الموعد المحدد.\n\nشكراً لتعاونكم'
  },
  {
    name: 'إشعار عام',
    text: 'الإخوة والأخوات الأفاضل\n\nنود إبلاغكم بـ ___\n\nللاستفسار يرجى التواصل معنا.\n\nتحياتنا'
  },
  {
    name: 'رسالة مخصصة',
    text: ''
  }
];

export default function BulkWhatsAppDialog({ open, onOpenChange, selectedEmployees, employees }) {
  const [messageTemplate, setMessageTemplate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const selectedEmployeesList = useMemo(() => {
    return employees.filter(emp => selectedEmployees.includes(emp.id));
  }, [employees, selectedEmployees]);

  const employeesWithoutPhone = useMemo(() => {
    return selectedEmployeesList.filter(emp => !emp.phone);
  }, [selectedEmployeesList]);

  const employeesWithPhone = useMemo(() => {
    return selectedEmployeesList.filter(emp => emp.phone);
  }, [selectedEmployeesList]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.name);
    setMessageTemplate(template.text);
  };

  const handleSendGroupMessage = () => {
    if (!messageTemplate.trim()) {
      alert('يرجى كتابة نص الرسالة');
      return;
    }

    if (employeesWithPhone.length === 0) {
      alert('لا يوجد موظفين لديهم أرقام جوالات صحيحة');
      return;
    }

    // جمع جميع الأرقام
    const phones = employeesWithPhone.map(emp => normalizePhoneForWhatsApp(emp.phone)).filter(Boolean);
    
    // طريقة 1: فتح واتساب لكل شخص واحد تلو الآخر
    let currentIndex = 0;
    
    const sendNext = () => {
      if (currentIndex < phones.length) {
        const phone = phones[currentIndex];
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageTemplate)}`;
        window.open(whatsappUrl, '_blank');
        currentIndex++;
        
        if (currentIndex < phones.length) {
          setTimeout(sendNext, 2000); // فتح التالي بعد ثانيتين
        } else {
          alert(`✅ تم فتح ${phones.length} محادثة واتساب!\n\nيمكنك الآن إرسال الرسالة من كل نافذة.`);
          onOpenChange(false);
        }
      }
    };
    
    sendNext();
  };

  const handleCopyPhoneList = () => {
    const phonesList = employeesWithPhone
      .map(emp => `${emp.full_name_arabic}: ${normalizePhoneForWhatsApp(emp.phone)}`)
      .join('\n');
    
    navigator.clipboard.writeText(phonesList);
    alert('✅ تم نسخ قائمة الأرقام\n\nيمكنك الآن لصقها في مجموعة واتساب أو قائمة بث');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageTemplate);
    alert('✅ تم نسخ الرسالة');
  };

  const handleCopyNumbersOnly = () => {
    const numbers = employeesWithPhone
      .map(emp => normalizePhoneForWhatsApp(emp.phone))
      .filter(Boolean)
      .join('\n');
    
    navigator.clipboard.writeText(numbers);
    alert('✅ تم نسخ الأرقام فقط\n\nيمكنك استيرادها في واتساب');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            إرسال رسالة واتساب جماعية ({selectedEmployees.length} موظف)
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="compose" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">إنشاء الرسالة</TabsTrigger>
            <TabsTrigger value="employees">الموظفون ({employeesWithPhone.length})</TabsTrigger>
            <TabsTrigger value="help">المساعدة</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* تحذير للموظفين بدون أرقام */}
            {employeesWithoutPhone.length > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>{employeesWithoutPhone.length}</strong> موظف بدون رقم جوال:
                  <div className="mt-2 text-xs">
                    {employeesWithoutPhone.slice(0, 3).map(emp => emp.full_name_arabic).join(', ')}
                    {employeesWithoutPhone.length > 3 && ` و${employeesWithoutPhone.length - 3} آخرون`}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* القوالب الجاهزة */}
            <div>
              <Label className="mb-2 block">قوالب جاهزة</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MESSAGE_TEMPLATES.map(template => (
                  <Button
                    key={template.name}
                    variant={selectedTemplate === template.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSelectTemplate(template)}
                    className="justify-start"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* محرر الرسالة */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>نص الرسالة الموحدة</Label>
                <Button size="sm" variant="ghost" onClick={handleCopyMessage}>
                  <Copy className="w-3 h-3 ml-1" />
                  نسخ الرسالة
                </Button>
              </div>
              <Textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="اكتب رسالتك هنا... سيتم إرسال نفس الرسالة لجميع الموظفين"
                rows={10}
                className="font-arabic text-base"
              />
              
              <p className="text-sm text-gray-500 mt-2">
                💡 اكتب رسالة واحدة موحدة سيتم إرسالها لجميع الموظفين المحددين
              </p>
            </div>

            {/* معاينة الرسالة */}
            {messageTemplate && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    معاينة الرسالة
                  </h4>
                  <div className="bg-white p-4 rounded-lg border whitespace-pre-wrap text-sm">
                    {messageTemplate}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="employees" className="flex-1 overflow-y-auto py-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">
                    الموظفون المستهدفون ({employeesWithPhone.length} بجوال صحيح)
                  </h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopyNumbersOnly}>
                      <Copy className="w-3 h-3 ml-1" />
                      نسخ الأرقام
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCopyPhoneList}>
                      <FileText className="w-3 h-3 ml-1" />
                      نسخ القائمة
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {selectedEmployeesList.map((emp, index) => (
                      <div 
                        key={emp.id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          emp.phone ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{emp.full_name_arabic}</p>
                            <p className="text-xs text-gray-600">{emp.position} - {emp.المركز_الصحي}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {emp.phone ? (
                            <Badge className="bg-green-600">
                              <Phone className="w-3 h-3 ml-1" />
                              {emp.phone}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              لا يوجد رقم
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="flex-1 overflow-y-auto py-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">📱 كيفية الإرسال الجماعي:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <Badge>1</Badge>
                      <span>اكتب رسالتك في مربع النص</span>
                    </li>
                    <li className="flex gap-2">
                      <Badge>2</Badge>
                      <span>اضغط "إرسال جماعي" - سيفتح واتساب لكل موظف تلقائياً</span>
                    </li>
                    <li className="flex gap-2">
                      <Badge>3</Badge>
                      <span>اضغط "إرسال" من كل نافذة واتساب</span>
                    </li>
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">✨ خيارات بديلة:</h3>
                  <div className="space-y-3 text-sm">
                    <Card className="bg-blue-50">
                      <CardContent className="p-3">
                        <h4 className="font-medium mb-1">📋 قائمة البث (Broadcast List)</h4>
                        <ol className="space-y-1 text-xs text-gray-700">
                          <li>1. اضغط "نسخ الأرقام" في تبويب الموظفون</li>
                          <li>2. افتح واتساب → قوائم البث → قائمة جديدة</li>
                          <li>3. أضف الأرقام المنسوخة</li>
                          <li>4. انسخ الرسالة وأرسلها للقائمة</li>
                        </ol>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardContent className="p-3">
                        <h4 className="font-medium mb-1">👥 مجموعة واتساب</h4>
                        <ol className="space-y-1 text-xs text-gray-700">
                          <li>1. أنشئ مجموعة واتساب جديدة</li>
                          <li>2. أضف الموظفين يدوياً أو من جهات الاتصال</li>
                          <li>3. انسخ الرسالة وأرسلها للمجموعة</li>
                        </ol>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50">
                      <CardContent className="p-3">
                        <h4 className="font-medium mb-1">🚀 الطريقة السريعة</h4>
                        <p className="text-xs text-gray-700">
                          اضغط "إرسال جماعي" وسيفتح النظام محادثة لكل موظف تلقائياً مع الرسالة جاهزة. 
                          فقط اضغط إرسال من كل نافذة!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4 flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleCopyMessage}
            disabled={!messageTemplate.trim()}
          >
            <Copy className="w-4 h-4 ml-2" />
            نسخ الرسالة
          </Button>

          <Button 
            variant="outline"
            onClick={handleCopyNumbersOnly}
            disabled={employeesWithPhone.length === 0}
          >
            <Phone className="w-4 h-4 ml-2" />
            نسخ الأرقام ({employeesWithPhone.length})
          </Button>

          <Button 
            onClick={handleSendGroupMessage} 
            disabled={!messageTemplate.trim() || employeesWithPhone.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 ml-2" />
            إرسال جماعي ({employeesWithPhone.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}