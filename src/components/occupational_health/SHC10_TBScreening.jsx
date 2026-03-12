import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function SHC10_TBScreening({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};
  const set = (field, val) => onChange({ ...d, [field]: val });

  return (
    <div className="space-y-4 print:text-[11px] font-cairo" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4 border-b-2 border-black pb-2">
        <h2 className="text-xl font-bold">
          {isAr ? 'نموذج فحص الدرن' : 'Tuberculosis Screening Form'}
        </h2>
        <p className="text-sm font-bold">SHC10</p>
      </div>

      <div className="border-2 border-black">
        <div className="p-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50">
          <div><Label className="text-xs font-bold">Name:</Label><Input value={d.name || ''} onChange={e => set('name', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none bg-transparent" /></div>
          <div><Label className="text-xs font-bold">Age:</Label><Input value={d.age || ''} onChange={e => set('age', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none bg-transparent" /></div>
          <div><Label className="text-xs font-bold">Nationality:</Label><Input value={d.nationality || ''} onChange={e => set('nationality', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none bg-transparent" /></div>
          <div><Label className="text-xs font-bold">Sex:</Label><Input value={d.sex || ''} onChange={e => set('sex', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none bg-transparent" /></div>
          <div><Label className="text-xs font-bold">File No.:</Label><Input value={d.file_no || ''} onChange={e => set('file_no', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none bg-transparent" /></div>
        </div>
      </div>

      {/* First Step */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black py-1 px-2 font-bold text-sm">
          First Step of the Two-Step Test or Annual serial TB Skin Test
        </div>
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Date Test Given:</Label><Input type="date" value={d.step1_given_date || ''} onChange={e => set('step1_given_date', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Test Given by:</Label><Input value={d.step1_given_by || ''} onChange={e => set('step1_given_by', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Site:</Label><Input value={d.step1_site || ''} onChange={e => set('step1_site', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Induration (mm):</Label><Input value={d.step1_induration || ''} onChange={e => set('step1_induration', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Date Test Read:</Label><Input type="date" value={d.step1_read_date || ''} onChange={e => set('step1_read_date', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Test Read by:</Label><Input value={d.step1_read_by || ''} onChange={e => set('step1_read_by', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
          </div>
          <div className="flex gap-6 mt-2 border-t border-gray-300 pt-2">
            <label className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="step1_result" checked={d.step1_result === 'positive'} onChange={() => set('step1_result', 'positive')} /> Positive</label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="step1_result" checked={d.step1_result === 'negative'} onChange={() => set('step1_result', 'negative')} /> Negative</label>
          </div>
        </div>
      </div>

      {/* Second Step */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black py-1 px-2 font-bold text-sm">Second Step of the Two-Step Test</div>
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Date Test Given:</Label><Input type="date" value={d.step2_given_date || ''} onChange={e => set('step2_given_date', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Test Given by:</Label><Input value={d.step2_given_by || ''} onChange={e => set('step2_given_by', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Site:</Label><Input value={d.step2_site || ''} onChange={e => set('step2_site', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Induration (mm):</Label><Input value={d.step2_induration || ''} onChange={e => set('step2_induration', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Date Test Read:</Label><Input type="date" value={d.step2_read_date || ''} onChange={e => set('step2_read_date', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
            <div className="flex items-center gap-2"><Label className="text-xs w-24">Test Read by:</Label><Input value={d.step2_read_by || ''} onChange={e => set('step2_read_by', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
          </div>
          <div className="flex gap-6 mt-2 border-t border-gray-300 pt-2">
            <label className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="step2_result" checked={d.step2_result === 'positive'} onChange={() => set('step2_result', 'positive')} /> Positive</label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="step2_result" checked={d.step2_result === 'negative'} onChange={() => set('step2_result', 'negative')} /> Negative</label>
          </div>
        </div>
      </div>

      {/* Liver Function */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black py-1 px-2 font-bold text-sm">Liver Function Test</div>
        <div className="p-2 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2"><Label className="text-xs">AST:</Label><Input value={d.ast || ''} onChange={e => set('ast', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
          <div className="flex items-center gap-2"><Label className="text-xs">ALT:</Label><Input value={d.alt || ''} onChange={e => set('alt', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
          <div className="flex items-center gap-2"><Label className="text-xs">Bilirubin:</Label><Input value={d.bilirubin || ''} onChange={e => set('bilirubin', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
        </div>
      </div>

      {/* Chest X-Ray */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black py-1 px-2 font-bold text-sm">Chest X-Ray (CXR)</div>
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-2"><Label className="text-xs font-bold">Date of CXR:</Label><Input type="date" value={d.cxr_date || ''} onChange={e => set('cxr_date', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none w-48" /></div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="cxr_result" checked={d.cxr_result === 'normal'} onChange={() => set('cxr_result', 'normal')} /> Normal</label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="cxr_result" checked={d.cxr_result === 'abnormal'} onChange={() => set('cxr_result', 'abnormal')} /> Abnormal</label>
          </div>
          {d.cxr_result === 'abnormal' && (
            <Textarea value={d.cxr_abnormal_detail || ''} onChange={e => set('cxr_abnormal_detail', e.target.value)} className="h-12 text-sm border border-black mt-2" placeholder="Details..." />
          )}
        </div>
      </div>

      {/* Result */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 border-b-2 border-black py-1 px-2 font-bold text-sm">Result</div>
        <div className="p-2 space-y-2">
          {[
            { val: 'normal', en: 'Normal, for annual follow up', ar: 'طبيعي، للمتابعة السنوية' },
            { val: 'tb_disease', en: 'Have TB disease, referred to...', ar: 'مصاب بالسل، محال إلى...' },
            { val: 'ltbi', en: 'Have LTBI, treatment regimen...', ar: 'مصاب بالسل الكامن...' },
          ].map(opt => (
            <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer font-medium">
              <input type="radio" name="tb_final_result" checked={d.tb_final_result === opt.val} onChange={() => set('tb_final_result', opt.val)} />
              {isAr ? opt.ar : opt.en}
            </label>
          ))}
          {d.tb_final_result === 'tb_disease' && (
            <Input value={d.tb_referred_to || ''} onChange={e => set('tb_referred_to', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none w-full" placeholder={isAr ? 'محال إلى...' : 'Referred to...'} />
          )}
          {d.tb_final_result === 'ltbi' && (
            <Textarea value={d.ltbi_regimen || ''} onChange={e => set('ltbi_regimen', e.target.value)} className="h-12 text-sm border border-black w-full" placeholder="Treatment regimen..." />
          )}
        </div>
      </div>

      {/* Doctor */}
      <div className="p-2 grid grid-cols-3 gap-4 border-2 border-black">
        <div className="flex items-center gap-2"><Label className="text-xs font-bold">Dr. Name:</Label><Input value={d.dr_name || ''} onChange={e => set('dr_name', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
        <div className="flex items-center gap-2"><Label className="text-xs font-bold">Sign:</Label><Input value={d.dr_sign || ''} onChange={e => set('dr_sign', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
        <div className="flex items-center gap-2"><Label className="text-xs font-bold">Stamp:</Label><Input value={d.dr_stamp || ''} onChange={e => set('dr_stamp', e.target.value)} className="h-7 text-sm border-0 border-b border-black rounded-none flex-1" /></div>
      </div>
    </div>
  );
}