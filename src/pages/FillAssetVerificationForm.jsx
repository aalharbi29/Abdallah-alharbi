import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Plus, Trash2, Save, FileCheck2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

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
  'الأثاث والتجهيزات',
];

const emptyLocation = () => ({ name: '', date: '', notes: '' });
const emptyTeamMember = () => ({ name: '', title: '', date: '' });

export default function FillAssetVerificationForm() {
  const printRef = useRef(null);

  const [healthCenters, setHealthCenters] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    facility_name: '',
    cluster_name: 'تجمع المدينة المنورة الصحي',
    city_region: 'المدينة المنورة',
    locations: [emptyLocation(), emptyLocation()],
    asset_checks: ASSET_CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: '' }), {}),
    team: [emptyTeamMember(), emptyTeamMember(), emptyTeamMember()],
    notes: '',
    project_manager_name: '',
    center_manager_name: '',
    signature_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    (async () => {
      const [hc, emps] = await Promise.all([
        base44.entities.HealthCenter.list('-created_date', 500),
        base44.entities.Employee.list('-created_date', 500),
      ]);
      setHealthCenters(hc || []);
      setEmployees(emps || []);
    })();
  }, []);

  const updateField = (key, value) => setForm(p => ({ ...p, [key]: value }));
  const updateLocation = (i, key, value) => setForm(p => {
    const locations = [...p.locations];
    locations[i] = { ...locations[i], [key]: value };
    return { ...p, locations };
  });
  const updateTeam = (i, key, value) => setForm(p => {
    const team = [...p.team];
    team[i] = { ...team[i], [key]: value };
    return { ...p, team };
  });
  const updateAssetCheck = (cat, value) =>
    setForm(p => ({ ...p, asset_checks: { ...p.asset_checks, [cat]: value } }));

  const addLocation = () => setForm(p => ({ ...p, locations: [...p.locations, emptyLocation()] }));
  const removeLocation = (i) => setForm(p => ({ ...p, locations: p.locations.filter((_, idx) => idx !== i) }));
  const addTeam = () => setForm(p => ({ ...p, team: [...p.team, emptyTeamMember()] }));
  const removeTeam = (i) => setForm(p => ({ ...p, team: p.team.filter((_, idx) => idx !== i) }));

  // التعبئة التلقائية عند اختيار المرفق
  const handleFacilitySelect = (facilityName) => {
    const center = healthCenters.find(c => c.اسم_المركز === facilityName);
    updateField('facility_name', facilityName);
    if (center) {
      setForm(p => ({
        ...p,
        facility_name: facilityName,
        city_region: center.الموقع || p.city_region,
      }));
      // تعبئة اسم مدير المركز الصحي فقط (لا نائب ولا مشرف فني)
      const manager = employees.find(e => e.id === center.المدير);
      if (manager) {
        setForm(p => ({
          ...p,
          center_manager_name: manager.full_name_arabic || '',
          project_manager_name: manager.full_name_arabic || p.project_manager_name,
        }));
        toast.success('تم تعبئة اسم مدير المركز الصحي تلقائياً');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    toast.success('تم حفظ النموذج محلياً');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-6 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-4 print:max-w-none">
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}><Save className="w-4 h-4 ml-1" />حفظ</Button>
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
              <Printer className="w-4 h-4 ml-1" />طباعة / PDF
            </Button>
          </div>
        </div>

        {/* المستند - طبق الأصل */}
        <Card className="border-2 border-gray-200 shadow-xl print:shadow-none print:border-0" ref={printRef}>
          <CardContent className="p-6 md:p-10 print:p-8 bg-white" dir="rtl">
            {/* الترويسة — شعار الصحة القابضة على اليمين */}
            <div className="flex justify-end pb-2 border-b-2 border-[#0099d8]">
              <img
                src={HEALTH_HOLDING_LOGO}
                alt="الصحة القابضة"
                className="h-14 md:h-16 object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* عنوان المشروع */}
            <div className="text-center mt-5">
              <p className="text-sm font-bold text-[#0099d8]">(مشروع التحقق ومراجعة سجلات الأصول بالتجمعات الصحية)</p>
              <h2 className="mt-3 text-lg md:text-xl font-extrabold text-gray-900">نموذج رقم (5) — نموذج محضر التحقق من الأصول</h2>
            </div>

            {/* قسم: معلومات عامة */}
            <SectionTitle>معلومات عامة</SectionTitle>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <InfoRow label="اسم المرفق الصحي :">
                  <Select value={form.facility_name} onValueChange={handleFacilitySelect}>
                    <SelectTrigger className="border-0 shadow-none h-8 text-sm print:hidden justify-center text-center">
                      <SelectValue placeholder="اختر المركز..." />
                    </SelectTrigger>
                    <SelectContent>
                      {healthCenters.map(c => (
                        <SelectItem key={c.id} value={c.اسم_المركز}>{c.اسم_المركز}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="hidden print:inline text-sm">{form.facility_name}</span>
                </InfoRow>
                <InfoRow label="اسم التجمع الصحي :">
                  <Input value={form.cluster_name} onChange={e => updateField('cluster_name', e.target.value)} className="border-0 shadow-none h-8 text-sm text-center" />
                </InfoRow>
                <InfoRow label="المدينة / المنطقة (مكان التواجد):">
                  <Input value={form.city_region} onChange={e => updateField('city_region', e.target.value)} className="border-0 shadow-none h-8 text-sm text-center" />
                </InfoRow>
              </tbody>
            </table>

            {/* قسم: نموذج محضر الجرد */}
            <SectionTitle>نموذج محضر الجرد</SectionTitle>

            {/* المواقع التي تم التحقق منها */}
            <SubHeader>المواقع التي تم التحقق منها</SubHeader>
            <table className="w-full border border-gray-800 border-collapse text-sm border-b-0">
              <thead>
                <tr className="bg-[#0099d8] text-white">
                  <Th className="w-[70%]">الموقع الذي تم التحقق منه</Th>
                  <Th>التاريخ</Th>
                </tr>
              </thead>
              <tbody>
                {form.locations.map((loc, i) => (
                  <tr key={i} className="hover:bg-sky-50/40">
                    <Td>
                      <div className="flex items-center gap-1">
                        <Input value={loc.name} onChange={e => updateLocation(i, 'name', e.target.value)} className="border-0 shadow-none h-8 text-sm" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeLocation(i)} className="h-7 w-7 print:hidden text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Td>
                    <Td>
                      <Input type="date" value={loc.date} onChange={e => updateLocation(i, 'date', e.target.value)} className="border-0 shadow-none h-8 text-sm" />
                    </Td>
                  </tr>
                ))}
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
                {ASSET_CATEGORIES.map(cat => (
                  <tr key={cat} className="hover:bg-sky-50/40">
                    <Td>{cat}</Td>
                    <Td>
                      <Select value={form.asset_checks[cat]} onValueChange={v => updateAssetCheck(cat, v)}>
                        <SelectTrigger className="border-0 shadow-none h-8 text-sm print:hidden">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="نعم">نعم</SelectItem>
                          <SelectItem value="لا">لا</SelectItem>
                          <SelectItem value="لا ينطبق">لا ينطبق</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="hidden print:inline text-sm">{form.asset_checks[cat]}</span>
                    </Td>
                  </tr>
                ))}
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
                {form.team.map((m, i) => (
                  <tr key={i} className="hover:bg-sky-50/40">
                    <Td>
                      <Input value={m.name} onChange={e => updateTeam(i, 'name', e.target.value)} className="border-0 shadow-none h-8 text-sm" />
                    </Td>
                    <Td>
                      <Input value={m.title} onChange={e => updateTeam(i, 'title', e.target.value)} className="border-0 shadow-none h-8 text-sm" />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Input type="date" value={m.date} onChange={e => updateTeam(i, 'date', e.target.value)} className="border-0 shadow-none h-8 text-sm" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeTeam(i)} className="h-7 w-7 print:hidden text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
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
                {form.locations.map((loc, i) => (
                  <tr key={i} className="hover:bg-sky-50/40">
                    <Td>
                      <Input value={loc.notes} onChange={e => updateLocation(i, 'notes', e.target.value)} className="border-0 shadow-none h-8 text-sm" placeholder={`ملاحظات الموقع ${i + 1}...`} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button type="button" variant="outline" size="sm" onClick={addTeam} className="mt-2 print:hidden">
              <Plus className="w-3.5 h-3.5 ml-1" />إضافة عضو
            </Button>

            {/* التوقيعات */}
            <table className="w-full border border-gray-800 border-collapse text-sm mt-8">
              <tbody>
                <tr>
                  <Td className="w-1/2 align-top">
                    <div className="space-y-1">
                      <p className="font-bold">اسم مدير المشروع في المرفق الصحي:</p>
                      <Input value={form.project_manager_name} onChange={e => updateField('project_manager_name', e.target.value)} className="border-0 border-b border-dashed rounded-none h-8 text-sm" />
                    </div>
                  </Td>
                  <Td className="align-top">
                    <div className="space-y-1">
                      <p className="font-bold">اسم مدير المركز الصحي:</p>
                      <Input value={form.center_manager_name} onChange={e => updateField('center_manager_name', e.target.value)} className="border-0 border-b border-dashed rounded-none h-8 text-sm" placeholder="يظهر تلقائياً عند اختيار المرفق" />
                    </div>
                  </Td>
                </tr>
                <tr>
                  <Td>
                    <div className="space-y-1">
                      <p className="font-bold">التاريخ:</p>
                      <Input type="date" value={form.signature_date} onChange={e => updateField('signature_date', e.target.value)} className="border-0 border-b border-dashed rounded-none h-8 text-sm" />
                    </div>
                  </Td>
                  <Td>
                    <p className="font-bold">التوقيع:</p>
                    <div className="h-10 border-b border-dashed border-gray-500" />
                  </Td>
                </tr>
                <tr>
                  <Td>
                    <p className="font-bold">التوقيع:</p>
                    <div className="h-10 border-b border-dashed border-gray-500" />
                  </Td>
                  <Td>
                    <p className="font-bold">ختم المرفق:</p>
                    <div className="h-10 border-b border-dashed border-gray-500" />
                  </Td>
                </tr>
              </tbody>
            </table>

          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

/* ========== Sub components ========== */
function SectionTitle({ children }) {
  return (
    <div className="mt-6 mb-2">
      <div className="bg-gradient-to-l from-[#0099d8] to-[#33b1e0] text-white px-4 py-2 rounded-md shadow-sm font-bold text-sm">
        {children}
      </div>
    </div>
  );
}

function SubHeader({ children, className = '' }) {
  return (
    <div className={`bg-sky-100 border border-[#0099d8] text-[#006a99] font-bold text-sm px-3 py-1.5 ${className}`}>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <tr className="border border-gray-800">
      <td className="border border-gray-800 bg-gray-50 p-2 font-bold w-[35%] text-sm align-middle">{label}</td>
      <td className="border border-gray-800 p-1 align-middle text-center">{children}</td>
    </tr>
  );
}

function Th({ children, className = '' }) {
  return <th className={`border border-gray-800 p-2 text-center font-bold text-sm ${className}`}>{children}</th>;
}

function Td({ children, className = '' }) {
  return <td className={`border border-gray-800 p-1.5 text-sm ${className}`}>{children}</td>;
}