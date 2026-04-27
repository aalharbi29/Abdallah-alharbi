import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Plus, Trash2, Save, FileCheck2, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const HEALTH_HOLDING_LOGO = 'https://media.base44.com/images/public/68af5003813e47bd07947b30/5bb77883d_image.png';

const ASSET_CATEGORIES = [
'معدات طبية',
'معدات المختبرات والأجهزة',
'البنية التحتية',
'معدات التوزيع والتكييف',
'المعدات الكهربائية ومعدات توليد/نقل الطاقة',
'معدات التصنيع والإنتاج والآلات الثقيلة',
'معدات الدفاع والسلامة',
'أصول تقنية المعلومات',
'معدات النقل البري',
'الأثاث والتجهيزات'];


const emptyLocation = () => ({ name: '', date: '', notes: '' });
const emptyTeamMember = () => ({ name: '', title: '', date: '' });

export default function FillAssetVerificationForm() {
  const printRef = useRef(null);

  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [form, setForm] = useState({
    facility_name: '',
    cluster_name: 'تجمع المدينة المنورة الصحي',
    city_region: 'المدينة المنورة',
    locations: [{ name: '', date: '', notes: 'لا يوجد' }],
    asset_checks: ASSET_CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: '' }), {}),
    team: [emptyTeamMember(), emptyTeamMember(), emptyTeamMember()],
    notes: '',
    project_manager_name: 'ماهر الينبعاوي',
    center_manager_name: '',
    signature_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    (async () => {
      const [hc, emps] = await Promise.all([
      base44.entities.HealthCenter.list('-created_date', 500),
      base44.entities.Employee.list('-created_date', 500)]
      );
      setHealthCenters(hc || []);
      setEmployees(emps || []);
    })();
  }, []);

  const updateField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const updateLocation = (i, key, value) => setForm((p) => {
    const locations = [...p.locations];
    locations[i] = { ...locations[i], [key]: value };
    return { ...p, locations };
  });
  const updateTeam = (i, key, value) => setForm((p) => {
    const team = [...p.team];
    team[i] = { ...team[i], [key]: value };
    return { ...p, team };
  });
  const updateAssetCheck = (cat, value) =>
  setForm((p) => ({ ...p, asset_checks: { ...p.asset_checks, [cat]: value } }));

  const addLocation = () => setForm((p) => ({ ...p, locations: [...p.locations, emptyLocation()] }));
  const removeLocation = (i) => setForm((p) => ({ ...p, locations: p.locations.filter((_, idx) => idx !== i) }));
  const addTeam = () => setForm((p) => ({ ...p, team: [...p.team, emptyTeamMember()] }));
  const removeTeam = (i) => setForm((p) => ({ ...p, team: p.team.filter((_, idx) => idx !== i) }));

  // التعبئة التلقائية عند اختيار المرفق
  const handleFacilitySelect = (facilityName) => {
    const center = healthCenters.find((c) => c.اسم_المركز === facilityName);
    setForm((p) => ({
      ...p,
      facility_name: facilityName,
      city_region: center?.الموقع || p.city_region,
      // الموقع الذي تم التحقق منه = اسم المرفق الصحي، والملاحظات = لا يوجد
      locations: [{ name: facilityName, date: p.locations?.[0]?.date || '', notes: 'لا يوجد' }]
    }));
    if (center) {
      const manager = employees.find((e) => e.id === center.المدير);
      if (manager) {
        setForm((p) => ({
          ...p,
          center_manager_name: manager.full_name_arabic || ''
        }));
        toast.success('تم تعبئة اسم مدير المركز الصحي تلقائياً');
      }
    }
  };

  const generatePDFBlob = async () => {
    if (!printRef.current) return null;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      if (!printRef.current) return;
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`محضر_تحقق_أصول_${form.facility_name || 'نموذج'}.pdf`);
      toast.success('تم تصدير النموذج كملف PDF');
    } catch (error) {
      toast.error('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!form.facility_name) {
      toast.error('يرجى اختيار المرفق الصحي أولاً');
      return;
    }
    
    try {
      setIsSaving(true);
      const center = healthCenters.find(c => c.اسم_المركز === form.facility_name);
      
      toast.info('جاري إعداد وحفظ المستند...');
      const blob = await generatePDFBlob();
      
      if (!blob) throw new Error('فشل إنشاء PDF');
      
      const file = new File([blob], `محضر_أصول_${form.facility_name}.pdf`, { type: 'application/pdf' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.CenterDocument.create({
        center_id: center ? center.id : '',
        center_name: form.facility_name,
        document_title: 'محضر التحقق من الأصول',
        document_type: 'تقرير',
        description: 'تم إنشاء النموذج تلقائياً من نظام التحقق والمراجعة للأصول',
        file_url,
        file_name: `محضر_أصول_${form.facility_name}.pdf`,
        document_date: new Date().toISOString().split('T')[0],
        document_number: `ASSET-${Date.now().toString().slice(-6)}`,
        is_active: true
      });
      
      toast.success('تم حفظ النموذج بنجاح في مستندات المركز');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-6 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-4 print:max-w-none" data-print-area>
        {/* شريط الأدوات - يُخفى في الطباعة */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">نموذج محضر التحقق من الأصول</h1>
              <p className="text-xs text-gray-500">نموذج رقم (5) — مشروع التحقق ومراجعة سجلات الأصول</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportPDF} disabled={isExporting} variant="outline" className="text-emerald-700 border-emerald-600 hover:bg-emerald-50">
              {isExporting ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Download className="w-4 h-4 ml-1" />}
              تصدير PDF
            </Button>
            <Button onClick={handlePrint} className="bg-slate-600 hover:bg-slate-700">
              <Printer className="w-4 h-4 ml-1" />طباعة
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
              حفظ في المركز
            </Button>
          </div>
        </div>

        {/* المستند - طبق الأصل */}
        <Card className="border-2 border-gray-200 shadow-xl print:shadow-none print:border-0" ref={printRef}>
          <CardContent className="p-6 md:p-10 print:p-8 bg-white" dir="rtl">
            {/* الترويسة — شعار الصحة القابضة على اليمين */}
            <div className="flex justify-end pb-1 border-b-2 border-[#0099d8]">
              <img
                src={HEALTH_HOLDING_LOGO}
                alt="الصحة القابضة"
                className="h-24 md:h-28 object-contain"
                crossOrigin="anonymous" />
              
            </div>

            {/* عنوان المشروع */}
            <div className="text-center mt-2">
              <p className="text-sm font-bold text-[#0099d8]">(مشروع التحقق ومراجعة سجلات الأصول بالتجمعات الصحية)</p>
              <h2 className="mt-3 text-lg md:text-xl font-extrabold text-gray-900">نموذج رقم (5) — نموذج محضر التحقق من الأصول</h2>
            </div>

            {/* قسم: معلومات عامة */}
            <SectionTitle>معلومات عامة</SectionTitle>
            <div className="text-sm space-y-0.5 text-center">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-bold">اسم المرفق الصحي :</span>
                <div className="min-w-[260px]">
                  <Select value={form.facility_name} onValueChange={handleFacilitySelect}>
                    <SelectTrigger className="border-0 border-b border-dashed rounded-none shadow-none h-6 text-sm print:hidden justify-center text-center">
                      <SelectValue placeholder="اختر المركز..." />
                    </SelectTrigger>
                    <SelectContent>
                      {healthCenters.map((c) =>
                      <SelectItem key={c.id} value={c.اسم_المركز}>{c.اسم_المركز}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <span className="hidden print:inline text-sm">{form.facility_name}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-bold">اسم التجمع الصحي :</span>
                <Input value={form.cluster_name} onChange={(e) => updateField('cluster_name', e.target.value)} className="border-0 border-b border-dashed rounded-none shadow-none h-6 text-sm text-center max-w-[320px]" />
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-bold">المدينة / المنطقة (مكان التواجد):</span>
                <Input value={form.city_region} onChange={(e) => updateField('city_region', e.target.value)} className="border-0 border-b border-dashed rounded-none shadow-none h-6 text-sm text-center max-w-[320px]" />
              </div>
            </div>

            {/* قسم: نموذج محضر الجرد */}
            <SectionTitle>نموذج محضر الجرد</SectionTitle>

            {/* المواقع التي تم التحقق منها */}
            <SubHeader>المواقع التي تم التحقق منها</SubHeader>
            <table className="w-full border border-gray-800 border-collapse text-sm border-b-0">
              <thead>
                <tr className="bg-[#0099d8] text-white">
                  <Th className="w-[45%]">الموقع الذي تم التحقق منه</Th>
                  <Th className="w-[20%]">التاريخ</Th>
                  <Th>ملاحظات</Th>
                </tr>
              </thead>
              <tbody>
                {form.locations.map((loc, i) =>
                <tr key={i} className="hover:bg-sky-50/40">
                    <Td className="py-0 leading-none">
                      <div className="flex items-center justify-center gap-1">
                        <input value={loc.name} onChange={(e) => updateLocation(i, 'name', e.target.value)} className="w-full bg-transparent border-0 outline-none text-sm text-center p-0 h-5 leading-none" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeLocation(i)} className="h-4 w-4 print:hidden text-red-500 shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Td>
                    <Td className="py-0 leading-none">
                      <input type="date" value={loc.date} onChange={(e) => updateLocation(i, 'date', e.target.value)} className="w-full bg-transparent border-0 outline-none text-sm text-center p-0 h-5 leading-none" />
                    </Td>
                    <Td className="py-0 leading-none">
                      <input value={loc.notes} onChange={(e) => updateLocation(i, 'notes', e.target.value)} className="w-full bg-transparent border-0 outline-none text-sm text-center p-0 h-5 leading-none" />
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* الأصول التي تم التحقق منها - ملاصقة للمواقع بدون فاصل */}
            <SubHeader>الأصول التي تم التحقق منها</SubHeader>
            <table className="w-full border border-gray-800 border-collapse text-sm border-b-0">
              <thead>
                <tr className="bg-[#0099d8] text-white">
                  <Th className="w-[60%]">فئة الأصل</Th>
                  <Th>هل تم التحقق من هذه الأصول؟</Th>
                </tr>
              </thead>
              <tbody>
                {ASSET_CATEGORIES.map((cat) => {
                  const val = form.asset_checks[cat];
                  const next = val === '' ? '✓' : val === '✓' ? '✗' : '';
                  return (
                    <tr key={cat} className="hover:bg-sky-50/40">
                      <Td className="py-0.5">{cat}</Td>
                      <Td className="py-1">
                        <div className="flex justify-center items-center">
                          <button
                            type="button"
                            onClick={() => updateAssetCheck(cat, next)}
                            className={`inline-flex items-center justify-center w-4 h-4 border border-gray-800 rounded-sm text-[12px] font-bold leading-none cursor-pointer ${val === '✓' ? 'text-green-700' : val === '✗' ? 'text-red-600' : 'text-transparent'}`}
                            title="انقر للتبديل بين صح / خطأ / فارغ"
                            aria-label={`تبديل حالة ${cat}`}>
                            {val || '·'}
                          </button>
                        </div>
                      </Td>
                    </tr>);
                })}
              </tbody>
            </table>

            {/* فريق التحقق - ملاصق لجدول الأصول بدون فاصل */}
            <SubHeader>فريق التحقق من الأصول</SubHeader>
            <table className="w-full border border-gray-800 border-collapse text-sm border-b-0">
              <thead>
                <tr className="bg-[#0099d8] text-white">
                  <Th>الاسم</Th>
                  <Th>المسمى الوظيفي</Th>
                  <Th className="w-[25%]">التاريخ</Th>
                </tr>
              </thead>
              <tbody>
                {form.team.map((m, i) =>
                <tr key={i} className="hover:bg-sky-50/40">
                    <Td className="py-0 leading-none">
                      <input value={m.name} onChange={(e) => updateTeam(i, 'name', e.target.value)} className="w-full bg-transparent border-0 outline-none text-sm text-center p-0 h-5 leading-none" />
                    </Td>
                    <Td className="py-0 leading-none">
                      <input value={m.title} onChange={(e) => updateTeam(i, 'title', e.target.value)} className="w-full bg-transparent border-0 outline-none text-sm text-center p-0 h-5 leading-none" />
                    </Td>
                    <Td className="py-0 leading-none">
                      <div className="flex items-center justify-center gap-1">
                        <input value={m.date} onChange={(e) => updateTeam(i, 'date', e.target.value)} placeholder="أدخل التاريخ يدوياً" className="w-full bg-transparent border-0 outline-none text-sm text-center p-0 h-5 leading-none" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeTeam(i)} className="h-4 w-4 print:hidden text-red-500 shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>


            {/* الملاحظات المرتبطة - ملاصقة لجدول فريق التحقق */}
            <table className="w-full border border-gray-800 border-collapse text-sm">
              <thead>
                <tr className="bg-[#0099d8] text-white">
                  <Th>الملاحظات المرتبطة بعمليات التحقق من الأصول</Th>
                </tr>
              </thead>
              <tbody>
                {form.locations.map((loc, i) =>
                <tr key={i} className="hover:bg-sky-50/40">
                    <Td className="py-0.5">
                      <input value={loc.notes} onChange={(e) => updateLocation(i, 'notes', e.target.value)} className="w-full bg-transparent border-0 outline-none text-sm text-center p-0" placeholder={`ملاحظات الموقع ${i + 1}...`} />
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* التوقيعات */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
              <div className="text-center">
                <p className="font-bold">اسم مدير المشروع في المرفق الصحي:</p>
                <Input value={form.project_manager_name} onChange={(e) => updateField('project_manager_name', e.target.value)} className="border-0 border-b border-dashed rounded-none h-7 text-sm text-center" />
              </div>
              <div className="text-center">
                <p className="font-bold">اسم مدير المركز الصحي:</p>
                <Input value={form.center_manager_name} onChange={(e) => updateField('center_manager_name', e.target.value)} className="border-0 border-b border-dashed rounded-none h-7 text-sm text-center" placeholder="يظهر تلقائياً عند اختيار المرفق" />
              </div>
              <div className="text-center">
                <p className="font-bold">التوقيع:</p>
                <div className="h-8 border-b border-dashed border-gray-500" />
              </div>
              <div className="text-center">
                <p className="font-bold">ختم المرفق:</p>
                <div className="h-8 border-b border-dashed border-gray-500" />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* إخفاء كل عناصر الصفحة الخارجية (الشريط الجانبي/الترويسة العامة) عدا منطقة النموذج */
          body * { visibility: hidden !important; }
          [data-print-area], [data-print-area] * { visibility: visible !important; }
          [data-print-area] { position: absolute; inset: 0; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: 0 !important; }
          /* تأكيد طباعة ألوان الترويسة والجداول */
          .bg-\\[\\#0099d8\\], .bg-stone-400, .bg-gradient-to-l { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>);

}

/* ========== Sub components ========== */
function SectionTitle({ children }) {
  return (
    <div className="mt-6 mb-2">
      <div className="bg-gradient-to-l from-[#0099d8] to-[#33b1e0] text-white px-4 py-2 rounded-md shadow-sm font-bold text-sm">
        {children}
      </div>
    </div>);

}

function SubHeader({ children, className = '' }) {
  return (
    <div className="bg-stone-400 text-[#03141c] px-3 py-1.5 text-sm font-bold border border-[#0099d8]">
      {children}
    </div>);

}

function InfoRow({ label, children }) {
  return (
    <tr className="border border-gray-800">
      <td className="border border-gray-800 bg-gray-50 px-2 py-1 font-bold w-[35%] text-sm align-middle">{label}</td>
      <td className="border border-gray-800 px-1 py-0 align-middle text-center">{children}</td>
    </tr>);

}

function Th({ children, className = '' }) {
  return <th className={`border border-gray-800 px-2 py-1 text-center font-bold text-sm bg-gray-100 text-black ${className}`}>{children}</th>;
}

function Td({ children, className = '' }) {
  return <td className={`border border-gray-800 px-1.5 py-0 text-sm leading-tight text-center align-middle ${className}`}>{children}</td>;
}