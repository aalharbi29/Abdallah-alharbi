import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Save, User, ShieldCheck, Phone, Mail, Briefcase, Calendar as CalendarIcon, Plus, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { HealthCenter } from "@/entities/HealthCenter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import SmartDateInput from "@/components/ui/smart-date-input";
import { base44 } from "@/api/base44Client";

const specialRolesOptions = [
    { key: "مدير مركز", label: "مدير مركز" },
    { key: "نائب مدير", label: "نائب مدير" },
    { key: "مشرف فني", label: "مشرف فني" },
    { key: "مشرف تمريض", label: "مشرف تمريض" },
    { key: "مشرف الجودة", label: "مشرف الجودة" },
    { key: "مشرف الأمن والسلامة", label: "مشرف الأمن والسلامة" },
    { key: "مشرف مكافحة العدوى", label: "مشرف مكافحة العدوى" },
    { key: "منسق مكافحة العدوى", label: "منسق مكافحة العدوى" },
    { key: "منسق الصحة المدرسية", label: "منسق الصحة المدرسية" },
    { key: "مشرف الصحة المدرسية", label: "مشرف الصحة المدرسية" },
    { key: "مشرف الطب الوقائي", label: "مشرف الطب الوقائي" },
    { key: "منسق الجودة", label: "منسق الجودة" },
    { key: "مراقب صحي", label: "مراقب صحي" },
    { key: "مدرب صحي", label: "مدرب صحي" },
];

const assignedTasksOptions = [
    // الفريق الطبي
    { key: "منسق الفريق الطبي", label: "منسق الفريق الطبي", category: "الفريق الطبي" },
    { key: "نائب منسق الفريق الطبي", label: "نائب منسق الفريق الطبي", category: "الفريق الطبي" },
    { key: "عضو الفريق الطبي", label: "عضو الفريق الطبي", category: "الفريق الطبي" },
    // مكافحة العدوى
    { key: "منسق مكافحة العدوى", label: "منسق مكافحة العدوى", category: "مكافحة العدوى" },
    { key: "نائب منسق مكافحة العدوى", label: "نائب منسق مكافحة العدوى", category: "مكافحة العدوى" },
    { key: "عضو فريق مكافحة العدوى", label: "عضو فريق مكافحة العدوى", category: "مكافحة العدوى" },
    // الصحة المدرسية
    { key: "منسق الصحة المدرسية", label: "منسق الصحة المدرسية", category: "الصحة المدرسية" },
    { key: "نائب منسق الصحة المدرسية", label: "نائب منسق الصحة المدرسية", category: "الصحة المدرسية" },
    { key: "عضو فريق الصحة المدرسية", label: "عضو فريق الصحة المدرسية", category: "الصحة المدرسية" },
    // المدرب الصحي
    { key: "مدرب صحي", label: "مدرب صحي", category: "المدرب الصحي" },
    { key: "منسق المدرب الصحي", label: "منسق المدرب الصحي", category: "المدرب الصحي" },
    { key: "مشرف المدرب الصحي بالمركز", label: "مشرف المدرب الصحي بالمركز", category: "المدرب الصحي" },
    // المراقبة الصحية
    { key: "مراقب صحي", label: "مراقب صحي", category: "المراقبة الصحية" },
    { key: "منسق فريق المراقب الصحي", label: "منسق فريق المراقب الصحي", category: "المراقبة الصحية" },
    { key: "عضو فريق المراقب الصحي", label: "عضو فريق المراقب الصحي", category: "المراقبة الصحية" },
    // الجودة والسلامة
    { key: "منسق الجودة", label: "منسق الجودة", category: "الجودة والسلامة" },
    { key: "منسق الأمن والسلامة", label: "منسق الأمن والسلامة", category: "الجودة والسلامة" },
    { key: "عضو فريق الجودة", label: "عضو فريق الجودة", category: "الجودة والسلامة" },
    // العيادات
    { key: "عيادة الأمراض المزمنة", label: "عيادة الأمراض المزمنة", category: "العيادات" },
    { key: "عيادة الفرز", label: "عيادة الفرز", category: "العيادات" },
    { key: "عيادة التطعيمات", label: "عيادة التطعيمات", category: "العيادات" },
    { key: "عيادة رعاية الحوامل", label: "عيادة رعاية الحوامل", category: "العيادات" },
    { key: "عيادة الطفل السليم", label: "عيادة الطفل السليم", category: "العيادات" },
    { key: "عيادة الأسنان", label: "عيادة الأسنان", category: "العيادات" },
    // أخرى
    { key: "الاستقبال والتسجيل", label: "الاستقبال والتسجيل", category: "أخرى" },
    { key: "الصيدلية", label: "الصيدلية", category: "أخرى" },
    { key: "المختبر", label: "المختبر", category: "أخرى" },
    { key: "الأشعة", label: "الأشعة", category: "أخرى" },
    { key: "غرفة الإجراءات", label: "غرفة الإجراءات", category: "أخرى" },
    { key: "الطوارئ", label: "الطوارئ", category: "أخرى" },
];

const departmentsOptions = [
    "التمريض",
    "التمريض - إشرافي",
    "الصيدلة",
    "الصيدلة - إشرافي",
    "الأطباء",
    "الأطباء - إشرافي",
    "المختبر",
    "المختبر - إشرافي",
    "الأسنان",
    "الأسنان - إشرافي",
    "الإدارة",
    "الإدارة - إشرافي",
    "الأشعة",
    "الأشعة - إشرافي",
    "الطوارئ",
    "الطوارئ - إشرافي",
    "العيادات الخارجية",
    "العيادات الخارجية - إشرافي",
    "الاستقبال والتسجيل",
    "الاستقبال والتسجيل - إشرافي",
    "الخدمات المساندة",
    "الخدمات المساندة - إشرافي",
    "الصحة العامة",
    "الصحة العامة - إشرافي",
    "الطب الوقائي",
    "الطب الوقائي - إشرافي",
    "الجودة",
    "الجودة - إشرافي",
    "أخرى"
];

const jobCategoryTypeOptions = [
    "المستخدمين",
    "الاداريين",
    "الكادر الرسمي",
    "الكادر الصحي",
    "المتعاقدين",
    "برنامج التشغيل / وظائف الأطباء",
    "برنامج التشغيل / وظائف الأخصائيين غير الأطباء",
    "برنامج التشغيل / الوظائف التقنية",
    "برنامج التشغيل / وظائف التمريض",
    "بند الأجور",
    "ديوان الوزارة"
];

export default function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(employee || {
    رقم_الموظف: "",
    full_name_arabic: "",
    رقم_الهوية: "",
    birth_date: "",
    gender: "ذكر",
    nationality: "سعودي",
    phone: "",
    email: "",
    المركز_الصحي: "",
    position: "",
    department: "",
    job_category: "",
    job_category_type: "",
    qualification: "",
    rank: "",
    sequence: "",
    hire_date: "",
    contract_type: "خدمة مدنية",
    contract_end_date: "",
    special_roles: [],
    assigned_tasks: [],
    profile_image_url: "",
  });

  const [healthCenters, setHealthCenters] = useState([]);
  const [customRole, setCustomRole] = useState("");
  const [customTask, setCustomTask] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    HealthCenter.list().then(data => {
      setHealthCenters(Array.isArray(data) ? data : []);
    }).catch(error => {
      console.error("Failed to fetch health centers:", error);
      setHealthCenters([]);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddRole = (role) => {
    const currentRoles = formData.special_roles || [];
    if (role && !currentRoles.includes(role)) {
      handleChange("special_roles", [...currentRoles, role]);
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    const currentRoles = formData.special_roles || [];
    handleChange("special_roles", currentRoles.filter(r => r !== roleToRemove));
  };
  
  const handleAddCustomRole = () => {
    if (customRole.trim()) {
      handleAddRole(customRole.trim());
      setCustomRole("");
    }
  };

  const handleAddTask = (task) => {
    const currentTasks = formData.assigned_tasks || [];
    if (task && !currentTasks.includes(task)) {
      handleChange("assigned_tasks", [...currentTasks, task]);
    }
  };

  const handleRemoveTask = (taskToRemove) => {
    const currentTasks = formData.assigned_tasks || [];
    handleChange("assigned_tasks", currentTasks.filter(t => t !== taskToRemove));
  };
  
  const handleAddCustomTask = () => {
    if (customTask.trim()) {
      handleAddTask(customTask.trim());
      setCustomTask("");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة فقط');
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      handleChange("profile_image_url", result.file_url);
    } catch (error) {
      console.error('فشل رفع الصورة:', error);
      alert('فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onCancel} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {employee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
            </h1>
            <p className="text-gray-600 mt-1">املأ جميع البيانات المطلوبة أدناه.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg"><User className="text-blue-600"/> البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* قسم الصورة الشخصية */}
              <div className="mb-8 flex flex-col items-center gap-4 pb-6 border-b">
                <div className="relative group">
                  {formData.profile_image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.profile_image_url} 
                        alt="صورة شخصية" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange("profile_image_url", "")}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-200 flex items-center justify-center shadow-lg">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <Label 
                    htmlFor="profile_image" 
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري الرفع...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{formData.profile_image_url ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
                        </>
                      )}
                    </div>
                  </Label>
                  <input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <p className="text-xs text-gray-500 text-center">الحد الأقصى 5 ميجابايت • PNG, JPG, JPEG</p>
                </div>
              </div>

              {/* حقول البيانات الشخصية */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><Label htmlFor="full_name_arabic">الاسم بالعربية *</Label><Input id="full_name_arabic" value={formData.full_name_arabic} onChange={(e) => handleChange("full_name_arabic", e.target.value)} required /></div>
                <div><Label htmlFor="employee_id">الرقم الوظيفي *</Label><Input id="employee_id" value={formData.رقم_الموظف} onChange={(e) => handleChange("رقم_الموظف", e.target.value)} required /></div>
                <div><Label htmlFor="national_id">رقم الهوية</Label><Input id="national_id" value={formData.رقم_الهوية} onChange={(e) => handleChange("رقم_الهوية", e.target.value)} /></div>
                <div>
                  <SmartDateInput
                    label="تاريخ الميلاد"
                    value={formData.birth_date}
                    onChange={(date) => handleChange("birth_date", date)}
                  />
                </div>
                <div><Label htmlFor="gender">الجنس</Label><Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ذكر">ذكر</SelectItem><SelectItem value="أنثى">أنثى</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="nationality">الجنسية</Label><Input id="nationality" value={formData.nationality} onChange={(e) => handleChange("nationality", e.target.value)} /></div>
                <div><Label htmlFor="phone">رقم الجوال</Label><Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} /></div>
                <div className="lg:col-span-2"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg"><Briefcase className="text-purple-600"/> معلومات العمل</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1"><Label htmlFor="health_center">المركز الصحي *</Label><Select value={formData.المركز_الصحي} onValueChange={(v) => handleChange("المركز_الصحي", v)} required><SelectTrigger><SelectValue placeholder="اختر المركز الصحي" /></SelectTrigger><SelectContent>{(healthCenters || []).map(center => (<SelectItem key={center.id} value={center.اسم_المركز}>{center.اسم_المركز}</SelectItem>))}</SelectContent></Select></div>
                <div><Label htmlFor="position">التخصص *</Label><Input id="position" value={formData.position} onChange={(e) => handleChange("position", e.target.value)} required placeholder="مثال: فني تمريض، طبيب عام" /></div>
                <div>
                  <Label htmlFor="department">القسم الذي يعمل به</Label>
                  <Select value={formData.department} onValueChange={(v) => handleChange("department", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsOptions.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">اختر "إشرافي" إذا كان الموظف مشرفاً في القسم</p>
                </div>

                <div><Label htmlFor="job_category">ملاك الوظيفة</Label><Input id="job_category" value={formData.job_category} onChange={(e) => handleChange("job_category", e.target.value)} placeholder="أدخل ملاك الوظيفة" /></div>
                
                {/* New Job Category Type Field */}
                <div>
                  <Label htmlFor="job_category_type">فئة الوظيفة</Label>
                  <Select value={formData.job_category_type} onValueChange={(v) => handleChange("job_category_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة الوظيفة" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategoryTypeOptions.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div><Label htmlFor="qualification">المؤهل</Label><Select value={formData.qualification} onValueChange={(v) => handleChange("qualification", v)}><SelectTrigger><SelectValue placeholder="اختر المؤهل" /></SelectTrigger><SelectContent><SelectItem value="ابتدائي">ابتدائي</SelectItem><SelectItem value="متوسط">متوسط</SelectItem><SelectItem value="ثانوي">ثانوي</SelectItem><SelectItem value="دبلوم">دبلوم</SelectItem><SelectItem value="بكالوريوس">بكالوريوس</SelectItem><SelectItem value="ماجستير">ماجستير</SelectItem><SelectItem value="دكتوراه">دكتوراه</SelectItem><SelectItem value="أخرى">أخرى</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="rank">المرتبة</Label><Input id="rank" value={formData.rank} onChange={(e) => handleChange("rank", e.target.value)} placeholder="أدخل المرتبة" /></div>
                <div><Label htmlFor="sequence">التسلسل</Label><Input id="sequence" value={formData.sequence} onChange={(e) => handleChange("sequence", e.target.value)} placeholder="أدخل التسلسل" /></div>
                <div>
                  <SmartDateInput
                    label="تاريخ التوظيف"
                    value={formData.hire_date}
                    onChange={(date) => handleChange("hire_date", date)}
                  />
                </div>
                <div><Label htmlFor="contract_type">نوع العقد</Label><Select value={formData.contract_type} onValueChange={(v) => handleChange("contract_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="خدمة مدنية">خدمة مدنية</SelectItem><SelectItem value="تشغيل">تشغيل</SelectItem><SelectItem value="تشغيل ذاتي">تشغيل ذاتي</SelectItem><SelectItem value="المستخدمين">المستخدمين</SelectItem><SelectItem value="دائم">دائم</SelectItem><SelectItem value="مؤقت">مؤقت</SelectItem><SelectItem value="تعاقد">تعاقد</SelectItem><SelectItem value="متدرب">متدرب</SelectItem></SelectContent></Select></div>
                
                {/* تاريخ نهاية العقد - يظهر للموظفين غير السعوديين أو المتعاقدين */}
                {(formData.nationality && formData.nationality !== 'سعودي' && formData.nationality !== 'سعودية') || formData.contract_type === 'تعاقد' || formData.contract_type === 'تشغيل' || formData.contract_type === 'تشغيل ذاتي' ? (
                  <div>
                    <SmartDateInput
                      label="تاريخ انتهاء العقد"
                      value={formData.contract_end_date}
                      onChange={(date) => handleChange("contract_end_date", date)}
                    />
                    <p className="text-xs text-gray-500 mt-1">تاريخ انتهاء عقد الموظف</p>
                  </div>
                ) : null}
                 
                 <div className="md:col-span-3 space-y-4">
                    <Label className="flex items-center gap-2 font-semibold"><ShieldCheck/> الأدوار الإشرافية والقيادية</Label>
                    
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg min-h-[44px] items-center border">
                        {(formData.special_roles || []).length > 0 ? (
                            (formData.special_roles || []).map(role => (
                                <Badge key={role} variant="secondary" className="flex items-center gap-2 py-1 px-3 text-sm">
                                    <span>{role}</span>
                                    <button type="button" onClick={() => handleRemoveRole(role)} className="rounded-full hover:bg-gray-300 p-0.5">
                                        <X className="w-3 h-3"/>
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-gray-500 px-2">لا توجد أدوار إشرافية أو قيادية محددة</span>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" type="button" className="flex-1 justify-center text-right font-normal">
                                    <Plus className="w-4 h-4 ml-2" />
                                    اختر من الأدوار الشائعة
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-popover-trigger-width]">
                                <DropdownMenuLabel>اختر دور لإضافته</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {specialRolesOptions.map(role => (
                                    <DropdownMenuItem
                                        key={role.key}
                                        onSelect={() => handleAddRole(role.key)}
                                        disabled={(formData.special_roles || []).includes(role.key)}
                                    >
                                        {role.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex-1 flex gap-2">
                           <Input 
                                placeholder="أو أدخل دور مخصص..."
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                           />
                           <Button type="button" onClick={handleAddCustomRole} disabled={!customRole.trim()}>
                               <Plus className="w-4 h-4"/>
                           </Button>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 space-y-4">
                    <Label className="flex items-center gap-2 font-semibold"><Briefcase/> المهام المكلف بها</Label>

                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg min-h-[44px] items-center border border-blue-200">
                        {(formData.assigned_tasks || []).length > 0 ? (
                            (formData.assigned_tasks || []).map(task => (
                                <Badge key={task} variant="secondary" className="flex items-center gap-2 py-1 px-3 text-sm bg-blue-100 text-blue-800">
                                    <span>{task}</span>
                                    <button type="button" onClick={() => handleRemoveTask(task)} className="rounded-full hover:bg-blue-200 p-0.5">
                                        <X className="w-3 h-3"/>
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-gray-500 px-2">لا توجد مهام محددة</span>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" type="button" className="flex-1 justify-center text-right font-normal">
                                    <Plus className="w-4 h-4 ml-2" />
                                    اختر من المهام الشائعة
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-popover-trigger-width] max-h-[300px] overflow-y-auto">
                                {(() => {
                                    const categories = [...new Set(assignedTasksOptions.map(t => t.category))];
                                    return categories.map(category => (
                                        <React.Fragment key={category}>
                                            <DropdownMenuLabel className="text-xs text-gray-500 bg-gray-50">{category}</DropdownMenuLabel>
                                            {assignedTasksOptions.filter(t => t.category === category).map(task => (
                                                <DropdownMenuItem
                                                    key={task.key}
                                                    onSelect={() => handleAddTask(task.key)}
                                                    disabled={(formData.assigned_tasks || []).includes(task.key)}
                                                >
                                                    {task.label}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                        </React.Fragment>
                                    ));
                                })()}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex-1 flex gap-2">
                           <Input 
                                placeholder="أو أدخل مهمة مخصصة..."
                                value={customTask}
                                onChange={(e) => setCustomTask(e.target.value)}
                           />
                           <Button type="button" onClick={handleAddCustomTask} disabled={!customTask.trim()}>
                               <Plus className="w-4 h-4"/>
                           </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 ml-2" />
              حفظ البيانات
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}