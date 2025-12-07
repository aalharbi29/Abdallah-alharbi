import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, Save, Loader2, Printer, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ViewEquipmentRequest() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const formRef = useRef();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) {
            loadRequest(id);
        } else {
            setError("لم يتم العثور على معرف الطلب.");
            setIsLoading(false);
        }
    }, [location.search]);

    const loadRequest = async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await base44.entities.EquipmentRequest.get(id);
            setFormData(data);
        } catch (err) {
            setError("فشل تحميل بيانات الطلب.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            const { id, created_date, updated_date, created_by, ...updateData } = formData;
            await base44.entities.EquipmentRequest.update(id, updateData);
            alert("تم حفظ التعديلات بنجاح!");
        } catch (error) {
            console.error("Failed to save request:", error);
            alert("فشل حفظ التعديلات.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <div className="p-8 text-center text-lg">جاري تحميل الطلب...</div>;
    }

    if (error) {
        return (
             <div className="p-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!formData) {
        return <div className="p-8 text-center">لم يتم العثور على بيانات الطلب.</div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen" dir="rtl">
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .print-container { padding: 0 !important; margin: 0 !important; background-color: #fff !important; }
                    .form-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; border-radius: 0 !important; }
                    @page { size: A4; margin: 0; }
                }
            `}</style>

            <div className="max-w-5xl mx-auto print-container">
                <div className="flex items-center gap-4 mb-6 no-print">
                    <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("InteractiveForms"))}><ArrowRight className="w-5 h-5"/></Button>
                    <div>
                        <h1 className="text-2xl font-bold">معاينة وتعديل الطلب</h1>
                        <p className="text-gray-600">يمكنك تعديل الحقول مباشرة وطباعة النموذج.</p>
                    </div>
                    <div className="mr-auto flex gap-2">
                         <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                            حفظ التعديلات
                        </Button>
                        <Button onClick={handlePrint} variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                            <Printer className="w-4 h-4 ml-2" />
                            طباعة / حفظ PDF
                        </Button>
                    </div>
                </div>

                <div 
                    ref={formRef} 
                    className="form-page bg-white shadow-2xl rounded-lg mx-auto" 
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/5531cbd21_image.png')`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        padding: '3cm 1.5cm 1.5cm 1.5cm'
                    }}
                >
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-[#0075c2]">إدارة التجهيزات</h2>
                        <h1 className="text-2xl font-bold mt-2">نموذج احتياج من التجهيزات الطبية والغير طبية</h1>
                        <p className="text-sm text-gray-600">وفقاً لقرار لجنة النظر رقم ١٠٠٤٥٦-٤٦ - ٧٠٣ و تاريخ ١٤٤٦/١٢/١٤هـ</p>
                    </div>

                    {/* Form content meticulously styled to match PDF */}
                    <div className="border-2 border-black">
                        <div className="flex border-b-2 border-black">
                            <div className="p-2 flex-grow">
                                <Label className="text-xs font-bold">اسم المستشفى/مركز صحي/الموقع</Label>
                                <Input value={formData.health_center_name || ''} onChange={(e) => handleChange('health_center_name', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                            <div className="p-2 border-r-2 border-black w-1/3">
                                <Label className="text-xs font-bold">القسم</Label>
                                <Input value={formData.department || ''} onChange={(e) => handleChange('department', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                        </div>

                        <div className="flex border-b-2 border-black items-center">
                            <div className="p-2 w-1/3"><Label className="font-bold">نوع الطلب:</Label></div>
                            <div className="p-2 flex-grow flex items-center gap-4">
                                <div className="flex items-center gap-1"><Checkbox checked={formData.request_type === 'جديد'} onCheckedChange={(c) => c && handleChange('request_type', 'جديد')} /><Label>جديد New</Label></div>
                                <div className="flex items-center gap-1"><Checkbox checked={formData.request_type === 'توسع'} onCheckedChange={(c) => c && handleChange('request_type', 'توسع')} /><Label>توسع Expansion</Label></div>
                                <div className="flex items-center gap-1"><Checkbox checked={formData.request_type === 'إحلال'} onCheckedChange={(c) => c && handleChange('request_type', 'إحلال')} /><Label>إحلال</Label></div>
                                <div className="flex items-center gap-1"><Checkbox checked={formData.request_type === 'أخرى'} onCheckedChange={(c) => c && handleChange('request_type', 'أخرى')} /><Label>أخرى Other</Label></div>
                            </div>
                        </div>

                        <div className="flex border-b-2 border-black items-center">
                            <div className="p-2 w-1/3"><Label className="font-bold">تصنيف الطلب:</Label></div>
                            <div className="p-2 flex-grow flex items-center gap-4">
                                <div className="flex items-center gap-1"><Checkbox checked={formData.classification === 'طبي'} onCheckedChange={(c) => c && handleChange('classification', 'طبي')} /><Label>طبي</Label></div>
                                <div className="flex items-center gap-1"><Checkbox checked={formData.classification === 'غير طبي'} onCheckedChange={(c) => c && handleChange('classification', 'غير طبي')} /><Label>غير طبي</Label></div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="p-2 w-1/3"><Label className="font-bold">حالة الطلب:</Label></div>
                            <div className="p-2 flex-grow flex items-center gap-4">
                                <div className="flex items-center gap-1"><Checkbox checked={formData.priority === 'منخفض الأهمية'} onCheckedChange={(c) => c && handleChange('priority', 'منخفض الأهمية')} /><Label>منخفض الأهمية</Label></div>
                                <div className="flex items-center gap-1"><Checkbox checked={formData.priority === 'متوسط الأهمية'} onCheckedChange={(c) => c && handleChange('priority', 'متوسط الأهمية')} /><Label>متوسط الأهمية</Label></div>
                                <div className="flex items-center gap-1"><Checkbox checked={formData.priority === 'عالي الأهمية'} onCheckedChange={(c) => c && handleChange('priority', 'عالي الأهمية')} /><Label>عالي الأهمية</Label></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#e9f3f9] text-center p-1 my-2 font-bold">معلومات الجهاز Device Information</div>

                    <div className="border-2 border-black">
                        <div className="flex border-b-2 border-black">
                            <div className="p-2 w-2/3">
                                <Label className="text-xs font-bold">اسم البند Device Name:</Label>
                                <Input value={formData.device_name || ''} onChange={(e) => handleChange('device_name', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                            <div className="p-2 w-1/3 border-r-2 border-black">
                                <Label className="text-xs font-bold">الكمية المطلوبة لتغطية الاحتياج:</Label>
                                <Input type="number" value={formData.requested_quantity || ''} onChange={(e) => handleChange('requested_quantity', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                        </div>
                        <div className="p-2 border-b-2 border-black">
                            <Label className="text-xs font-bold">رقم البند (في دليل نوبكو أو الكود الوزاري الرسمي):</Label>
                            <Input value={formData.device_code || ''} onChange={(e) => handleChange('device_code', e.target.value)} className="border-0 h-auto p-0 text-base" />
                        </div>
                        <div className="p-2 min-h-[100px]">
                            <Label className="text-xs font-bold">مبررات الطلب:</Label>
                            <Textarea value={(formData.justifications || []).join('\n') || ''} onChange={(e) => handleChange('justifications', e.target.value.split('\n'))} className="border-0 h-auto p-0 text-base resize-none" />
                        </div>
                    </div>

                    <div className="border-2 border-black mt-2">
                        <div className="flex">
                            <div className="p-2 w-1/2">
                                <Label className="text-xs font-bold">اسم مقدم الطلب:</Label>
                                <Input value={formData.requester_name || ''} onChange={(e) => handleChange('requester_name', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                            <div className="p-2 w-1/2 border-r-2 border-black">
                                <Label className="text-xs font-bold">التوقيع:</Label>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="p-2 w-1/2 border-t-2 border-black">
                                <Label className="text-xs font-bold">رقم التواصل:</Label>
                                <Input value={formData.requester_phone || ''} onChange={(e) => handleChange('requester_phone', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                            <div className="p-2 w-1/2 border-t-2 border-r-2 border-black">
                                <Label className="text-xs font-bold">البريد الإلكتروني (الوزاري):</Label>
                                <Input value={formData.requester_email || ''} onChange={(e) => handleChange('requester_email', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center p-2 my-2 text-sm">
                        بناءً على المعاينة، تبين عدم توفر البند المطلوب، أو أن الكميات المتاحة لا تكفي لتغطية احتياج القسم.
                    </div>

                    <div className="border-2 border-black">
                        <div className="flex">
                            <div className="p-2 w-1/2">
                                <Label className="text-xs font-bold">الكمية المتوفرة في القسم:</Label>
                                <Input type="number" value={formData.quantity_in_department || ''} onChange={(e) => handleChange('quantity_in_department', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                            <div className="p-2 w-1/2 border-r-2 border-black">
                                <Label className="text-xs font-bold">الكمية المتوفرة في الموقع:</Label>
                                <Input type="number" value={formData.quantity_in_site || ''} onChange={(e) => handleChange('quantity_in_site', e.target.value)} className="border-0 h-auto p-0 text-base" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#e9f3f9] text-center p-1 my-2 font-bold">الاسماء والتوقيعات للموافقة على استكمال الطلب</div>

                    <table className="w-full border-collapse border-2 border-black text-center">
                        <thead>
                            <tr className="bg-[#e9f3f9]">
                                <th className="border-2 border-black p-1 font-bold">الموافقات</th>
                                <th className="border-2 border-black p-1 font-bold">الاسم</th>
                                <th className="border-2 border-black p-1 font-bold">التوقيع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['رئيس القسم', 'الصيانة (الطبية/العامة)', 'أمين العهدة', 'مراقبة المخزون', 'المدير الطبي', 'مدير الجهة الطالبة'].map((role, i) => {
                                const fieldMap = {
                                    'رئيس القسم': 'department_head',
                                    'الصيانة (الطبية/العامة)': 'maintenance_officer',
                                    'أمين العهدة': 'custodian',
                                    'مراقبة المخزون': 'inventory_controller',
                                    'المدير الطبي': 'medical_director',
                                    'مدير الجهة الطالبة': 'facility_director'
                                };
                                const fieldKey = fieldMap[role];
                                return (
                                    <tr key={i}>
                                        <td className="border-2 border-black p-1 font-semibold">{role}</td>
                                        <td className="border-2 border-black p-0"><Input value={formData[fieldKey] || ''} onChange={(e) => handleChange(fieldKey, e.target.value)} className="w-full h-full border-0 rounded-none p-1 text-center" /></td>
                                        <td className="border-2 border-black p-1"></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex border-2 border-black border-t-0">
                         <div className="p-2 w-1/2">
                            <Label className="text-xs font-bold">التاريخ:</Label>
                        </div>
                        <div className="p-2 w-1/2 border-r-2 border-black">
                            <Label className="text-xs font-bold">الختم:</Label>
                        </div>
                    </div>
                    
                    <div className="bg-[#e9f3f9] text-center p-1 my-2 font-bold">اعتماد اللجنة</div>
                    
                    <div className="text-center p-2 my-2 text-sm">
                        بالإشارة إلى طلب تأمين البند أعلاه، ونظرًا لأهمية تلبية الاحتياج، فقد تم رفع الطلب للجنة النظر، وسيتم اتخاذ القرار بشأنه وفق ما تراه اللجنة مناسبًا.
                    </div>
                    <div className="flex items-center justify-between border-2 border-black p-2">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1"><Checkbox checked={formData.committee_decision === 'بالموافقة'} onCheckedChange={(c) => c && handleChange('committee_decision', 'بالموافقة')} /><Label>بالموافقة</Label></div>
                            <div className="flex items-center gap-1"><Checkbox checked={formData.committee_decision === 'بالرفض'} onCheckedChange={(c) => c && handleChange('committee_decision', 'بالرفض')} /><Label>بالرفض</Label></div>
                        </div>
                        <div>
                            <Label className="ml-2">رقم وتاريخ محضر اللجنة:</Label>
                            <Input value={formData.committee_record_number || ''} onChange={(e) => handleChange('committee_record_number', e.target.value)} className="inline-block w-auto border-b border-gray-400 focus:border-blue-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}