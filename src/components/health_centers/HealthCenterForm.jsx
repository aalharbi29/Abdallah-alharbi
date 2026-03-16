import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { ArrowRight, Save, Hospital, User, Car, Phone, Building, MapPin, CheckCircle2, Plus, Trash2, X, ArrowLeftRight, MoveRight, MoveLeft } from "lucide-react";
import VoiceInput from "@/components/ui/VoiceInput";
import { Employee } from "@/entities/Employee";
import EmployeeSelector from "./EmployeeSelector";

export default function HealthCenterForm({ center, onSubmit, onCancel, employees: initialEmployees }) {
  const [formData, setFormData] = useState(center || {
    اسم_المركز: "",
    المدير: "",
    نائب_المدير: "",
    المشرف_الفني: "",
    الموقع: "",
    موقع_الخريطة: "",
    خط_الطول: "",
    خط_العرض: "",
    ايميل_المركز: "",
    هاتف_المركز: "",
    فاكس_المركز: "",
    رقم_الشريحة: "",
    رقم_الجوال: "",
    رقم_الهاتف_الثابت: "",
    حالة_المركز: "حكومي",
    قيمة_عقد_الايجار: 0,
    اسم_المؤجر: "",
    هاتف_المؤجر: "",
    تاريخ_انتهاء_العقد: "",
    تاريخ_بداية_العقد: "",
    رقم_العقد: "",
    معتمد_سباهي: false,
    تاريخ_اعتماد_سباهي: "",
    مركز_نائي: false,
    بدل_نأي: 0,
    العيادات_المتوفرة: [],
    الخدمات_المقدمة: [],
    سيارة_خدمات: {
      متوفرة: false,
      رقم_اللوحة_عربي: "",
      رقم_اللوحة_انجليزي: "",
      رقم_الهيكل: "",
      الرقم_التسلسلي: "",
      نوع_السيارة: "",
      موديل: "",
      حالة_السيارة: "جيدة",
      المسافة_المقطوعة: 0,
      رقم_جهاز_اللاسلكي: "",
      السائق_employee_id: "",
      اسم_السائق: "",
      رخصة_السائق: "",
    },
    سيارة_اسعاف: {
      متوفرة: false,
      رقم_اللوحة_عربي: "",
      رقم_اللوحة_انجليزي: "",
      رقم_الهيكل: "",
      الرقم_التسلسلي: "",
      نوع_السيارة: "",
      موديل: "",
      حالة_السيارة: "جيدة",
      المسافة_المقطوعة: 0,
      رقم_جهاز_اللاسلكي: "",
      مجهزة_بالكامل: false,
      السائق_employee_id: "",
      اسم_السائق: "",
      رخصة_السائق: "",
    },
    عدد_الموظفين_الكلي: 0,
    تقسيم_الموظفين: {
      اطباء: 0,
      ممرضين: 0,
      صيادلة: 0,
      فنيين: 0,
      اداريين: 0,
      عمال: 0,
      امن: 0
    },
    center_code: "",
    organization_code: "",
    الوصف: "",
    حالة_التشغيل: "نشط",
    معلومات_اضافية: ""
  });

  const [employees, setEmployees] = useState(initialEmployees || []);
  const [newClinic, setNewClinic] = useState({ اسم_العيادة: "", نوع_العيادة: "", الطبيب_المسؤول: "", ساعات_العمل: "" });
  const [newService, setNewService] = useState("");
  const isEditMode = !!center;

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!initialEmployees || initialEmployees.length === 0) {
        const fetchedEmployees = await Employee.list();
        setEmployees(Array.isArray(fetchedEmployees) ? fetchedEmployees : []);
      }
    }
    fetchEmployees();
  }, [initialEmployees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedObjectChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const addClinic = () => {
    if (newClinic.اسم_العيادة.trim()) {
      setFormData(prev => ({
        ...prev,
        العيادات_المتوفرة: [...(prev.العيادات_المتوفرة || []), {
          اسم_العيادة: newClinic.اسم_العيادة.trim(),
          نوع_العيادة: newClinic.نوع_العيادة || '',
          الطبيب_المسؤول: newClinic.الطبيب_المسؤول || '',
          ساعات_العمل: newClinic.ساعات_العمل || ''
        }]
      }));
      setNewClinic({ اسم_العيادة: "", نوع_العيادة: "", الطبيب_المسؤول: "", ساعات_العمل: "" });
    } else {
      alert('الرجاء إدخال اسم العيادة على الأقل');
    }
  };

  const removeClinic = (index) => {
    setFormData(prev => ({
      ...prev,
      العيادات_المتوفرة: prev.العيادات_المتوفرة.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        الخدمات_المقدمة: [...(prev.الخدمات_المقدمة || []), newService.trim()]
      }));
      setNewService("");
    }
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      الخدمات_المقدمة: prev.الخدمات_المقدمة.filter((_, i) => i !== index)
    }));
  };

  // نقل عيادة إلى الخدمات المقدمة
  const moveClinicToServices = (index) => {
    const clinic = formData.العيادات_المتوفرة[index];
    if (clinic) {
      setFormData(prev => ({
        ...prev,
        العيادات_المتوفرة: prev.العيادات_المتوفرة.filter((_, i) => i !== index),
        الخدمات_المقدمة: [...(prev.الخدمات_المقدمة || []), clinic.اسم_العيادة]
      }));
    }
  };

  // نقل خدمة إلى العيادات
  const moveServiceToClinic = (index) => {
    const service = formData.الخدمات_المقدمة[index];
    if (service) {
      setFormData(prev => ({
        ...prev,
        الخدمات_المقدمة: prev.الخدمات_المقدمة.filter((_, i) => i !== index),
        العيادات_المتوفرة: [...(prev.العيادات_المتوفرة || []), {
          اسم_العيادة: service,
          نوع_العيادة: '',
          الطبيب_المسؤول: '',
          ساعات_العمل: ''
        }]
      }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onCancel} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {center ? "تعديل بيانات المركز" : "إضافة مركز صحي جديد"}
            </h1>
            <p className="text-gray-600 mt-1">املأ جميع بيانات المركز الصحي بالتفصيل</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* بيانات المركز الأساسية */}
          <Card className="shadow-lg overflow-hidden">
             <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-3 text-lg"><Hospital className="text-green-600"/> البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Label htmlFor="center_name">اسم المركز *</Label>
                <div className="flex gap-2">
                  <Input id="center_name" value={formData.اسم_المركز} onChange={(e) => handleChange("اسم_المركز", e.target.value)} required placeholder="مثل: مركز صحي العزيزية" className="flex-1" />
                  <VoiceInput onResult={(text) => handleChange("اسم_المركز", formData.اسم_المركز ? `${formData.اسم_المركز} ${text}` : text)} />
                </div>
              </div>
              <div>
                <Label htmlFor="center_status">حالة التشغيل</Label>
                <Select value={formData.حالة_التشغيل} onValueChange={(v) => handleChange("حالة_التشغيل", v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="متوقف مؤقتاً">متوقف مؤقتاً</SelectItem>
                    <SelectItem value="قيد الصيانة">قيد الصيانة</SelectItem>
                    <SelectItem value="مغلق">مغلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">الموقع</Label>
                <div className="flex gap-2">
                  <Input id="location" value={formData.الموقع} onChange={(e) => handleChange("الموقع", e.target.value)} placeholder="الرياض - حي العزيزية" className="flex-1" />
                  <VoiceInput onResult={(text) => handleChange("الموقع", formData.الموقع ? `${formData.الموقع} ${text}` : text)} />
                </div>
              </div>
              <div><Label htmlFor="map_location">موقع الخريطة</Label><Input id="map_location" value={formData.موقع_الخريطة} onChange={(e) => handleChange("موقع_الخريطة", e.target.value)} placeholder="رابط خرائط جوجل"/></div>
              <div><Label htmlFor="longitude">خط الطول</Label><Input id="longitude" value={formData.خط_الطول || ""} onChange={(e) => handleChange("خط_الطول", e.target.value)} placeholder="مثال: 40.123456"/></div>
              <div><Label htmlFor="latitude">خط العرض</Label><Input id="latitude" value={formData.خط_العرض || ""} onChange={(e) => handleChange("خط_العرض", e.target.value)} placeholder="مثال: 24.123456"/></div>
              <div>
                <Label htmlFor="seha_id" className="text-green-700 font-semibold">SEHA ID</Label>
                <Input 
                  id="seha_id" 
                  value={formData.seha_id} 
                  onChange={(e) => handleChange("seha_id", e.target.value)} 
                  placeholder="29882"
                  className="border-green-300 focus:border-green-500"
                />
              </div>
              <div><Label htmlFor="center_code">كود المركز</Label><Input id="center_code" value={formData.center_code} onChange={(e) => handleChange("center_code", e.target.value)} placeholder="HC001"/></div>
              <div><Label htmlFor="organization_code">كود المؤسسة</Label><Input id="organization_code" value={formData.organization_code} onChange={(e) => handleChange("organization_code", e.target.value)} placeholder="ORG001"/></div>
              <div className="flex items-center space-x-2 space-x-reverse"><Checkbox id="is_remote" checked={formData.مركز_نائي} onCheckedChange={(checked) => handleChange("مركز_نائي", checked)}/><Label htmlFor="is_remote">مركز نائي</Label></div>
              {formData.مركز_نائي && (<div><Label htmlFor="remote_allowance">بدل النأي (ريال)</Label><Input id="remote_allowance" type="number" value={formData.بدل_نأي} onChange={(e) => handleChange("بدل_نأي", parseInt(e.target.value) || 0)} placeholder="1000"/></div>)}
            </CardContent>
          </Card>

          {/* بيانات التواصل - تم إضافة الحقول الجديدة */}
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-3 text-lg"><Phone className="text-blue-600"/> بيانات التواصل والاتصال</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div><Label htmlFor="center_email">إيميل المركز</Label><Input id="center_email" type="email" value={formData.ايميل_المركز} onChange={(e) => handleChange("ايميل_المركز", e.target.value)} placeholder="center@health.gov.sa"/></div>
              <div><Label htmlFor="center_phone">الهاتف الأرضي</Label><Input id="center_phone" value={formData.هاتف_المركز} onChange={(e) => handleChange("هاتف_المركز", e.target.value)} placeholder="011-1234567"/></div>
              <div><Label htmlFor="center_fax">الفاكس</Label><Input id="center_fax" value={formData.فاكس_المركز} onChange={(e) => handleChange("فاكس_المركز", e.target.value)} placeholder="011-7654321"/></div>

              {/* الحقول الجديدة */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Label htmlFor="sim_number" className="flex items-center gap-2 text-green-700">
                  <Phone className="w-4 h-4" />
                  رقم الشريحة
                </Label>
                <Input
                  id="sim_number"
                  value={formData.رقم_الشريحة}
                  onChange={(e) => handleChange("رقم_الشريحة", e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="mt-2"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label htmlFor="mobile_number" className="flex items-center gap-2 text-blue-700">
                  <Phone className="w-4 h-4" />
                  رقم الجوال
                </Label>
                <Input
                  id="mobile_number"
                  value={formData.رقم_الجوال}
                  onChange={(e) => handleChange("رقم_الجوال", e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="mt-2"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <Label htmlFor="landline_number" className="flex items-center gap-2 text-purple-700">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف الثابت الإضافي
                </Label>
                <Input
                  id="landline_number"
                  value={formData.رقم_الهاتف_الثابت}
                  onChange={(e) => handleChange("رقم_الهاتف_الثابت", e.target.value)}
                  placeholder="011-xxxxxxx"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* بيانات القيادة */}
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-3 text-lg"><User className="text-blue-600"/> بيانات القيادة والإدارة</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="manager_id">مدير المركز</Label>
                <EmployeeSelector
                  employees={employees}
                  value={formData.المدير}
                  onSelect={(employeeId) => handleChange("المدير", employeeId)}
                  placeholder="اختر مدير المركز"
                />
              </div>
              <div>
                <Label htmlFor="deputy_manager_id">نائب المدير</Label>
                <EmployeeSelector
                  employees={employees}
                  value={formData.نائب_المدير}
                  onSelect={(employeeId) => handleChange("نائب_المدير", employeeId)}
                  placeholder="اختر نائب المدير"
                />
              </div>
              <div>
                <Label htmlFor="technical_supervisor_id">المشرف الفني</Label>
                <EmployeeSelector
                  employees={employees}
                  value={formData.المشرف_الفني}
                  onSelect={(employeeId) => handleChange("المشرف_الفني", employeeId)}
                  placeholder="اختر المشرف الفني"
                />
              </div>
            </CardContent>
          </Card>

           <Card className="shadow-lg overflow-hidden">
             <CardHeader className="bg-gray-50 border-b"><CardTitle className="flex items-center gap-3 text-lg"><Building className="text-purple-600"/> بيانات الملكية والعقود</CardTitle></CardHeader>
             <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div><Label htmlFor="ownership_status">حالة الملكية</Label><Select value={formData.حالة_المركز} onValueChange={(v) => handleChange("حالة_المركز", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="حكومي">حكومي</SelectItem><SelectItem value="مستأجر">مستأجر</SelectItem><SelectItem value="ملك خاص">ملك خاص</SelectItem></SelectContent></Select></div>

              {formData.حالة_المركز === "مستأجر" && (
                <>
                  <div><Label htmlFor="contract_number">رقم العقد</Label><Input id="contract_number" value={formData.رقم_العقد} onChange={(e) => handleChange("رقم_العقد", e.target.value)} placeholder="12345"/></div>
                  <div><Label htmlFor="rent_amount">قيمة الإيجار السنوية (ريال)</Label><Input id="rent_amount" type="number" value={formData.قيمة_عقد_الايجار} onChange={(e) => handleChange("قيمة_عقد_الايجار", parseInt(e.target.value) || 0)} placeholder="120000"/></div>
                  <div><Label htmlFor="landlord_name">اسم المؤجر</Label><Input id="landlord_name" value={formData.اسم_المؤجر} onChange={(e) => handleChange("اسم_المؤجر", e.target.value)} placeholder="شركة العقارات المتقدمة"/></div>
                  <div><Label htmlFor="landlord_phone">هاتف المؤجر</Label><Input id="landlord_phone" value={formData.هاتف_المؤجر} onChange={(e) => handleChange("هاتف_المؤجر", e.target.value)} placeholder="0501234570"/></div>
                  <div><Label htmlFor="contract_start">تاريخ بداية العقد</Label><Input id="contract_start" type="date" value={formData.تاريخ_بداية_العقد} onChange={(e) => handleChange("تاريخ_بداية_العقد", e.target.value)}/></div>
                  <div><Label htmlFor="contract_end">تاريخ انتهاء العقد</Label><Input id="contract_end" type="date" value={formData.تاريخ_انتهاء_العقد} onChange={(e) => handleChange("تاريخ_انتهاء_العقد", e.target.value)}/></div>
                </>
              )}
             </CardContent>
           </Card>

           {/* اعتماد سباهي */}
           <Card className="shadow-lg overflow-hidden">
             <CardHeader className="bg-gray-50 border-b">
               <CardTitle className="flex items-center gap-3 text-lg">
                 <CheckCircle2 className="text-green-600"/>
                 اعتماد سباهي
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               <div className="flex items-center space-x-2 space-x-reverse">
                 <Checkbox
                   id="sabahi_accredited"
                   checked={formData.معتمد_سباهي}
                   onCheckedChange={(checked) => handleChange("معتمد_سباهي", checked)}
                 />
                 <Label htmlFor="sabahi_accredited" className="text-base font-medium">
                   المركز حاصل على اعتماد سباهي
                 </Label>
               </div>

               {formData.معتمد_سباهي && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                   <div>
                     <Label htmlFor="sabahi_date">تاريخ الحصول على الاعتماد</Label>
                     <Input
                       id="sabahi_date"
                       type="date"
                       value={formData.تاريخ_اعتماد_سباهي}
                       onChange={(e) => handleChange("تاريخ_اعتماد_سباهي", e.target.value)}
                     />
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>

           {/* العيادات والخدمات */}
           <Card className="shadow-lg overflow-hidden">
             <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Hospital className="text-purple-600"/>
                  العيادات والخدمات المقدمة
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3" />
                  يمكنك نقل العناصر بين العيادات والخدمات باستخدام أزرار النقل
                </p>
              </CardHeader>
             <CardContent className="p-6 space-y-6">
               {/* العيادات */}
               <div>
                 <Label className="text-base font-semibold mb-3 block">العيادات المتوفرة</Label>
                 
                 {formData.العيادات_المتوفرة?.length > 0 && (
                   <div className="space-y-2 mb-4">
                     {formData.العيادات_المتوفرة.map((clinic, index) => (
                       <div key={index} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                         <div className="flex-1">
                           <div className="font-semibold text-purple-900">{clinic.اسم_العيادة}</div>
                           <div className="flex gap-2 mt-1 flex-wrap">
                             {clinic.نوع_العيادة && (
                               <Badge className="bg-purple-600 text-xs">{clinic.نوع_العيادة}</Badge>
                             )}
                             {clinic.الطبيب_المسؤول && (
                               <Badge variant="outline" className="text-xs">👨‍⚕️ {clinic.الطبيب_المسؤول}</Badge>
                             )}
                             {clinic.ساعات_العمل && (
                               <Badge variant="outline" className="text-xs">⏰ {clinic.ساعات_العمل}</Badge>
                             )}
                           </div>
                         </div>
                         <div className="flex gap-1">
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="sm"
                             onClick={() => moveClinicToServices(index)}
                             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                             title="نقل إلى الخدمات المقدمة"
                           >
                             <MoveLeft className="w-4 h-4" />
                           </Button>
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="sm"
                             onClick={() => removeClinic(index)}
                             className="text-red-600 hover:text-red-700"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 {/* إضافة عيادة جديدة */}
                 <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed space-y-3">
                   <div>
                     <Label htmlFor="clinic_name" className="text-sm font-medium">
                       اسم العيادة *
                     </Label>
                     <div className="flex gap-2 mt-1">
                       <Input 
                         id="clinic_name"
                         value={newClinic.اسم_العيادة} 
                         onChange={(e) => setNewClinic({...newClinic, اسم_العيادة: e.target.value})}
                         placeholder="مثال: عيادة الأسنان"
                         className="flex-1"
                       />
                       <VoiceInput onResult={(text) => setNewClinic({...newClinic, اسم_العيادة: newClinic.اسم_العيادة ? `${newClinic.اسم_العيادة} ${text}` : text})} />
                     </div>
                   </div>
                   
                   <details className="text-xs">
                     <summary className="cursor-pointer text-blue-600 hover:underline mb-2">
                       + إضافة تفاصيل اختيارية
                     </summary>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                       <div>
                         <Label htmlFor="clinic_type" className="text-xs">نوع العيادة</Label>
                         <Input 
                           id="clinic_type"
                           value={newClinic.نوع_العيادة} 
                           onChange={(e) => setNewClinic({...newClinic, نوع_العيادة: e.target.value})}
                           placeholder="عام، تخصصي"
                           className="mt-1"
                         />
                       </div>
                       <div>
                         <Label htmlFor="clinic_doctor" className="text-xs">الطبيب المسؤول</Label>
                         <Input 
                           id="clinic_doctor"
                           value={newClinic.الطبيب_المسؤول} 
                           onChange={(e) => setNewClinic({...newClinic, الطبيب_المسؤول: e.target.value})}
                           placeholder="د. أحمد محمد"
                           className="mt-1"
                         />
                       </div>
                       <div>
                         <Label htmlFor="clinic_hours" className="text-xs">ساعات العمل</Label>
                         <Input 
                           id="clinic_hours"
                           value={newClinic.ساعات_العمل} 
                           onChange={(e) => setNewClinic({...newClinic, ساعات_العمل: e.target.value})}
                           placeholder="8 ص - 12 م"
                           className="mt-1"
                         />
                       </div>
                     </div>
                   </details>
                   
                   <Button type="button" onClick={addClinic} variant="outline" className="w-full">
                     <Plus className="w-4 h-4 ml-2" />
                     إضافة العيادة
                   </Button>
                 </div>
               </div>

               {/* الخدمات */}
               <div>
                 <Label className="text-base font-semibold mb-3 block">الخدمات المقدمة</Label>

                 {/* قائمة الخدمات الموجودة */}
                 {formData.الخدمات_المقدمة?.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-4">
                       {formData.الخدمات_المقدمة.map((service, index) => (
                         <Badge key={index} variant="outline" className="bg-blue-50 pr-1 flex items-center gap-1">
                           {service}
                           <Button
                             type="button"
                             variant="ghost"
                             size="sm"
                             onClick={() => moveServiceToClinic(index)}
                             className="h-4 w-4 p-0 hover:bg-purple-100"
                             title="نقل إلى العيادات"
                           >
                             <MoveRight className="w-3 h-3 text-purple-600" />
                           </Button>
                           <Button
                             type="button"
                             variant="ghost"
                             size="sm"
                             onClick={() => removeService(index)}
                             className="h-4 w-4 p-0 hover:bg-red-100"
                           >
                             <X className="w-3 h-3 text-red-600" />
                           </Button>
                         </Badge>
                       ))}
                     </div>
                   )}

                 {/* إضافة خدمة جديدة */}
                 <div className="flex gap-2">
                   <Input
                     value={newService}
                     onChange={(e) => setNewService(e.target.value)}
                     placeholder="مثال: فحص السكري، تطعيمات، رعاية الأمومة"
                     onKeyPress={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         addService();
                       }
                     }}
                     className="flex-1"
                   />
                   <VoiceInput onResult={(text) => setNewService(newService ? `${newService} ${text}` : text)} />
                   <Button type="button" onClick={addService} variant="outline">
                     <Plus className="w-4 h-4" />
                   </Button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">اضغط Enter أو زر + لإضافة الخدمة</p>
               </div>
             </CardContent>
           </Card>

           {isEditMode && <Card className="shadow-lg overflow-hidden">
             <CardHeader className="bg-gray-50 border-b">
               <CardTitle className="flex items-center gap-3 text-lg">
                 <Car className="text-orange-600"/>
                 المركبات والمعدات
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
               {/* سيارة الخدمات */}
               <div>
                 <div className="flex items-center space-x-2 space-x-reverse mb-4">
                   <Checkbox 
                     id="has_service_car" 
                     checked={formData.سيارة_خدمات?.متوفرة || false} 
                     onCheckedChange={(checked) => handleNestedObjectChange("سيارة_خدمات", "متوفرة", checked)}
                   />
                   <Label htmlFor="has_service_car" className="text-lg font-semibold">سيارة خدمات 🚗</Label>
                 </div>
                 
                 {formData.سيارة_خدمات?.متوفرة && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                     {/* رقم اللوحة */}
                     <div className="lg:col-span-3">
                       <Label className="mb-2 block font-semibold">رقم اللوحة</Label>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor="service_plate_ar" className="text-xs text-gray-600">عربي</Label>
                           <Input 
                             id="service_plate_ar"
                             value={formData.سيارة_خدمات?.رقم_اللوحة_عربي || ""} 
                             onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "رقم_اللوحة_عربي", e.target.value)} 
                             placeholder="أ ب ج ١٢٣٤"
                             className="text-right"
                           />
                         </div>
                         <div>
                           <Label htmlFor="service_plate_en" className="text-xs text-gray-600">English</Label>
                           <Input 
                             id="service_plate_en"
                             value={formData.سيارة_خدمات?.رقم_اللوحة_انجليزي || ""} 
                             onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "رقم_اللوحة_انجليزي", e.target.value)} 
                             placeholder="ABC 1234"
                           />
                         </div>
                       </div>
                     </div>

                     <div>
                       <Label htmlFor="service_chassis">رقم الهيكل</Label>
                       <Input 
                         id="service_chassis"
                         value={formData.سيارة_خدمات?.رقم_الهيكل || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "رقم_الهيكل", e.target.value)} 
                         placeholder="123456789ABCDEFGH"
                       />
                     </div>

                     <div>
                       <Label htmlFor="service_serial">الرقم التسلسلي</Label>
                       <Input 
                         id="service_serial"
                         value={formData.سيارة_خدمات?.الرقم_التسلسلي || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "الرقم_التسلسلي", e.target.value)} 
                         placeholder="SN123456"
                       />
                     </div>

                     <div>
                       <Label htmlFor="service_type">نوع السيارة</Label>
                       <Input 
                         id="service_type"
                         value={formData.سيارة_خدمات?.نوع_السيارة || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "نوع_السيارة", e.target.value)} 
                         placeholder="تويوتا كامري"
                       />
                     </div>

                     <div>
                       <Label htmlFor="service_model">الموديل</Label>
                       <Input 
                         id="service_model"
                         value={formData.سيارة_خدمات?.موديل || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "موديل", e.target.value)} 
                         placeholder="2020"
                       />
                     </div>

                     <div>
                       <Label htmlFor="service_mileage">المسافة المقطوعة (كم)</Label>
                       <Input 
                         id="service_mileage"
                         type="number"
                         value={formData.سيارة_خدمات?.المسافة_المقطوعة || 0} 
                         onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "المسافة_المقطوعة", parseInt(e.target.value) || 0)} 
                         placeholder="50000"
                       />
                     </div>

                     <div>
                       <Label htmlFor="service_radio">رقم جهاز اللاسلكي</Label>
                       <Input 
                         id="service_radio"
                         value={formData.سيارة_خدمات?.رقم_جهاز_اللاسلكي || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "رقم_جهاز_اللاسلكي", e.target.value)} 
                         placeholder="RADIO-001"
                       />
                     </div>

                     <div>
                       <Label htmlFor="service_condition">حالة السيارة</Label>
                       <Select 
                         value={formData.سيارة_خدمات?.حالة_السيارة || "جيدة"} 
                         onValueChange={(v) => handleNestedObjectChange("سيارة_خدمات", "حالة_السيارة", v)}
                       >
                         <SelectTrigger><SelectValue/></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="ممتازة">ممتازة</SelectItem>
                           <SelectItem value="جيدة">جيدة</SelectItem>
                           <SelectItem value="متوسطة">متوسطة</SelectItem>
                           <SelectItem value="سيئة">سيئة</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>

                     <div className="lg:col-span-3">
                       <Label className="mb-2 block font-semibold">بيانات السائق</Label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor="service_driver">اختيار السائق من الموظفين</Label>
                           <EmployeeSelector
                             employees={employees}
                             value={formData.سيارة_خدمات?.السائق_employee_id}
                             onSelect={(employeeId) => {
                               const selectedEmployee = employees.find(emp => emp.id === employeeId);
                               handleNestedObjectChange("سيارة_خدمات", "السائق_employee_id", employeeId);
                               if (selectedEmployee) {
                                 handleNestedObjectChange("سيارة_خدمات", "اسم_السائق", selectedEmployee.full_name_arabic);
                               } else {
                                 handleNestedObjectChange("سيارة_خدمات", "اسم_السائق", ""); // Clear if no employee found or selection cleared
                               }
                             }}
                             placeholder="اختر سائق من الموظفين"
                           />
                         </div>
                         <div>
                           <Label htmlFor="service_driver_license">رخصة القيادة</Label>
                           <Input 
                             id="service_driver_license"
                             value={formData.سيارة_خدمات?.رخصة_السائق || ""} 
                             onChange={(e) => handleNestedObjectChange("سيارة_خدمات", "رخصة_السائق", e.target.value)} 
                             placeholder="123456789"
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* سيارة الإسعاف */}
               <div>
                 <div className="flex items-center space-x-2 space-x-reverse mb-4">
                   <Checkbox 
                     id="has_ambulance" 
                     checked={formData.سيارة_اسعاف?.متوفرة || false} 
                     onCheckedChange={(checked) => handleNestedObjectChange("سيارة_اسعاف", "متوفرة", checked)}
                   />
                   <Label htmlFor="has_ambulance" className="text-lg font-semibold">سيارة إسعاف 🚑</Label>
                 </div>
                 
                 {formData.سيارة_اسعاف?.متوفرة && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-red-50 rounded-lg">
                     {/* رقم اللوحة */}
                     <div className="lg:col-span-3">
                       <Label className="mb-2 block font-semibold">رقم اللوحة</Label>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor="ambulance_plate_ar" className="text-xs text-gray-600">عربي</Label>
                           <Input 
                             id="ambulance_plate_ar"
                             value={formData.سيارة_اسعاف?.رقم_اللوحة_عربي || ""} 
                             onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "رقم_اللوحة_عربي", e.target.value)} 
                             placeholder="إسعاف ١٢٣٤"
                             className="text-right"
                           />
                         </div>
                         <div>
                           <Label htmlFor="ambulance_plate_en" className="text-xs text-gray-600">English</Label>
                           <Input 
                             id="ambulance_plate_en"
                             value={formData.سيارة_اسعاف?.رقم_اللوحة_انجليزي || ""} 
                             onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "رقم_اللوحة_انجليزي", e.target.value)} 
                             placeholder="AMB 1234"
                           />
                         </div>
                       </div>
                     </div>

                     <div>
                       <Label htmlFor="ambulance_chassis">رقم الهيكل</Label>
                       <Input 
                         id="ambulance_chassis"
                         value={formData.سيارة_اسعاف?.رقم_الهيكل || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "رقم_الهيكل", e.target.value)} 
                         placeholder="123456789ABCDEFGH"
                       />
                     </div>

                     <div>
                       <Label htmlFor="ambulance_serial">الرقم التسلسلي</Label>
                       <Input 
                         id="ambulance_serial"
                         value={formData.سيارة_اسعاف?.الرقم_التسلسلي || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "الرقم_التسلسلي", e.target.value)} 
                         placeholder="SN123456"
                       />
                     </div>

                     <div>
                       <Label htmlFor="ambulance_type">نوع السيارة</Label>
                       <Input 
                         id="ambulance_type"
                         value={formData.سيارة_اسعاف?.نوع_السيارة || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "نوع_السيارة", e.target.value)} 
                         placeholder="مرسيدس سبرينتر"
                       />
                     </div>

                     <div>
                       <Label htmlFor="ambulance_model">الموديل</Label>
                       <Input 
                         id="ambulance_model"
                         value={formData.سيارة_اسعاف?.موديل || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "موديل", e.target.value)} 
                         placeholder="2023"
                       />
                     </div>

                     <div>
                       <Label htmlFor="ambulance_mileage">المسافة المقطوعة (كم)</Label>
                       <Input 
                         id="ambulance_mileage"
                         type="number"
                         value={formData.سيارة_اسعاف?.المسافة_المقطوعة || 0} 
                         onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "المسافة_المقطوعة", parseInt(e.target.value) || 0)} 
                         placeholder="30000"
                       />
                     </div>

                     <div>
                       <Label htmlFor="ambulance_radio">رقم جهاز اللاسلكي</Label>
                       <Input 
                         id="ambulance_radio"
                         value={formData.سيارة_اسعاف?.رقم_جهاز_اللاسلكي || ""} 
                         onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "رقم_جهاز_اللاسلكي", e.target.value)} 
                         placeholder="RADIO-002"
                       />
                     </div>

                     <div>
                       <Label htmlFor="ambulance_condition">حالة السيارة</Label>
                       <Select 
                         value={formData.سيارة_اسعاف?.حالة_السيارة || "جيدة"} 
                         onValueChange={(v) => handleNestedObjectChange("سيارة_اسعاف", "حالة_السيارة", v)}
                       >
                         <SelectTrigger><SelectValue/></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="ممتازة">ممتازة</SelectItem>
                           <SelectItem value="جيدة">جيدة</SelectItem>
                           <SelectItem value="متوسطة">متوسطة</SelectItem>
                           <SelectItem value="سيئة">سيئة</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>

                     <div className="flex items-center space-x-2 space-x-reverse">
                       <Checkbox 
                         id="ambulance_equipped" 
                         checked={formData.سيارة_اسعاف?.مجهزة_بالكامل || false} 
                         onCheckedChange={(checked) => handleNestedObjectChange("سيارة_اسعاف", "مجهزة_بالكامل", checked)}
                       />
                       <Label htmlFor="ambulance_equipped">مجهزة بالكامل</Label>
                     </div>

                     <div className="lg:col-span-3">
                       <Label className="mb-2 block font-semibold">بيانات السائق</Label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div>
                           <Label htmlFor="ambulance_driver">اختيار السائق من الموظفين</Label>
                           <EmployeeSelector
                             employees={employees}
                             value={formData.سيارة_اسعاف?.السائق_employee_id}
                             onSelect={(employeeId) => {
                               const selectedEmployee = employees.find(emp => emp.id === employeeId);
                               handleNestedObjectChange("سيارة_اسعاف", "السائق_employee_id", employeeId);
                               if (selectedEmployee) {
                                 handleNestedObjectChange("سيارة_اسعاف", "اسم_السائق", selectedEmployee.full_name_arabic);
                               } else {
                                 handleNestedObjectChange("سيارة_اسعاف", "اسم_السائق", ""); // Clear if no employee found or selection cleared
                               }
                             }}
                             placeholder="اختر سائق من الموظفين"
                           />
                         </div>
                         <div>
                           <Label htmlFor="ambulance_driver_license">رخصة القيادة</Label>
                           <Input 
                             id="ambulance_driver_license"
                             value={formData.سيارة_اسعاف?.رخصة_السائق || ""} 
                             onChange={(e) => handleNestedObjectChange("سيارة_اسعاف", "رخصة_السائق", e.target.value)} 
                             placeholder="987654321"
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>

           )} 

                       <Card className="shadow-lg overflow-hidden">
                         <CardHeader className="bg-gray-50 border-b"><CardTitle className="flex items-center gap-3 text-lg"><User className="text-indigo-600"/> إحصائيات الموظفين (محسوبة تلقائياً)</CardTitle></CardHeader>
             <CardContent className="p-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm mb-2 font-medium">📊 الإحصائية التلقائية من النظام</p>
                <div className="text-2xl font-bold text-blue-600">
                  {employees.filter(emp => emp.المركز_الصحي === formData.اسم_المركز).length}
                </div>
                <div className="text-blue-500 text-sm">إجمالي الموظفين المسجلين في النظام</div>
              </div>

              {formData.اسم_المركز && employees.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
                  {['طبيب', 'ممرض', 'صيدلي', 'فني', 'إداري', 'خدمات مساندة', 'أخرى'].map(category => {
                    const count = employees.filter(emp =>
                      emp.المركز_الصحي === formData.اسم_المركز &&
                      (emp.job_category === category || (category === 'أخرى' && !['طبيب', 'ممرض', 'صيدلي', 'فني', 'إداري', 'خدمات مساندة'].includes(emp.job_category)))
                    ).length;
                    return count > 0 ? (
                      <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-700">{count}</div>
                        <div className="text-xs text-gray-500">{category}</div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm font-medium mb-2">⚠️ ملاحظة مهمة</p>
                <p className="text-yellow-700 text-sm">الإحصائية أعلاه محسوبة تلقائياً من قاعدة بيانات الموظفين. لا حاجة لإدخال أرقام يدوية. تأكد من تسجيل جميع موظفي المركز في نظام الموارد البشرية.</p>
              </div>

              <div className="mt-6">
                <Label htmlFor="total_employees_manual">إجمالي الموظفين (إدخال يدوي اختياري)</Label>
                <Input
                  id="total_employees_manual"
                  type="number"
                  min="0"
                  value={formData.عدد_الموظفين_الكلي || 0}
                  onChange={(e) => handleChange("عدد_الموظفين_الكلي", parseInt(e.target.value) || 0)}
                  placeholder="اتركه فارغاً ليتم الحساب تلقائياً"
                />
                <p className="text-xs text-gray-500 mt-1">يُستخدم فقط إذا كانت هناك حاجة لرقم مختلف عن الحساب التلقائي</p>
              </div>
             </CardContent>
           </Card>

           <Card className="shadow-lg overflow-hidden">
             <CardHeader className="bg-gray-50 border-b"><CardTitle className="flex items-center gap-3 text-lg"><MapPin className="text-teal-600"/> معلومات إضافية</CardTitle></CardHeader>
             <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="description">وصف المركز</Label>
                <div className="flex gap-2 items-start">
                  <Textarea id="description" value={formData.الوصف} onChange={(e) => handleChange("الوصف", e.target.value)} rows={3} placeholder="وصف مختصر عن المركز والخدمات التي يقدمها..." className="flex-1"/>
                  <VoiceInput onResult={(text) => handleChange("الوصف", formData.الوصف ? `${formData.الوصف} ${text}` : text)} />
                </div>
              </div>
              <div>
                <Label htmlFor="additional_info">معلومات إضافية</Label>
                <div className="flex gap-2 items-start">
                  <Textarea id="additional_info" value={formData.معلومات_اضافية} onChange={(e) => handleChange("معلومات_اضافية", e.target.value)} rows={3} placeholder="أي معلومات إضافية مهمة عن المركز..." className="flex-1"/>
                  <VoiceInput onResult={(text) => handleChange("معلومات_اضافية", formData.معلومات_اضافية ? `${formData.معلومات_اضافية} ${text}` : text)} />
                </div>
              </div>
             </CardContent>
           </Card>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 ml-2" />
              حفظ البيانات
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}