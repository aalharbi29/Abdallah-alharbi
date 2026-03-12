import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SHC2_PhysicalExam({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};
  const set = (field, val) => onChange({ ...d, [field]: val });

  const vitals = [
    { key: 'bp', label: 'BP', unit: 'mmHg' },
    { key: 'pulse', label: 'Pulse', unit: '/min' },
    { key: 'resp_rate', label: 'Resp. Rate', unit: '/min' },
    { key: 'temp', label: 'Temp', unit: 'c°' },
    { key: 'weight', label: 'Wt', unit: 'kg' },
    { key: 'height', label: 'Ht', unit: 'M' },
    { key: 'bmi', label: 'BMI', unit: '' },
  ];

  const examFields = [
    { key: 'general_appearance', en: 'General Appearance', ar: 'المظهر العام' },
    { key: 'head', en: 'Head', ar: 'الرأس' },
    { key: 'eyes_rt', en: 'Eyes RT', ar: 'العين اليمنى' },
    { key: 'eyes_lt', en: 'Eyes LT', ar: 'العين اليسرى' },
    { key: 'ears_rt', en: 'Ears RT', ar: 'الأذن اليمنى' },
    { key: 'ears_lt', en: 'Ears LT', ar: 'الأذن اليسرى' },
    { key: 'teeth', en: 'Teeth', ar: 'الأسنان' },
    { key: 'neck', en: 'Neck', ar: 'الرقبة' },
    { key: 'chest', en: 'Chest', ar: 'الصدر' },
    { key: 'cvs', en: 'C.V.S', ar: 'الجهاز القلبي' },
    { key: 'abdomen', en: 'Abdomen', ar: 'البطن' },
    { key: 'cns', en: 'C.N.S', ar: 'الجهاز العصبي' },
    { key: 'spine', en: 'Spine, musculoskeletal', ar: 'العمود الفقري والعضلات' },
    { key: 'extremities', en: 'Extremities', ar: 'الأطراف' },
    { key: 'clinical_findings', en: 'Clinical Findings', ar: 'النتائج السريرية' },
  ];

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#5B9BD5]">
          {isAr ? 'الفحص الطبي' : 'Physical Examination'}
        </h2>
        <p className="text-xs text-gray-500">SHC2</p>
      </div>

      {/* Vitals */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'العلامات الحيوية' : 'Vital Signs'}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {vitals.map(v => (
              <div key={v.key} className="text-center">
                <Label className="text-xs font-bold">{v.label}</Label>
                <Input value={d[v.key] || ''} onChange={e => set(v.key, e.target.value)} className="h-8 text-sm text-center" />
                <span className="text-[10px] text-gray-400">{v.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Examination Fields */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-2 font-bold">
          {isAr ? 'الفحص السريري' : 'Clinical Examination'}
        </div>
        <div className="p-4 space-y-3">
          {examFields.map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold">{isAr ? f.ar : f.en}:</Label>
              <Input value={d[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="h-8 text-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Physician Signature */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#5B9BD5] text-white text-center py-1">
          <span className="text-sm font-bold">{isAr ? 'توقيع الطبيب' : 'Examining Physician'}</span>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">{isAr ? 'اسم الطبيب' : 'Physician'}</Label>
            <Input value={d.physician_name || ''} onChange={e => set('physician_name', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'التوقيع' : 'Signature'}</Label>
            <Input value={d.physician_sig || ''} onChange={e => set('physician_sig', e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">{isAr ? 'التاريخ' : 'Date'}</Label>
            <Input type="date" value={d.physician_date || ''} onChange={e => set('physician_date', e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}