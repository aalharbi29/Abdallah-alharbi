import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SHC9_WorkRestriction({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};
  const set = (field, val) => onChange({ ...d, [field]: val });

  return (
    <div className="space-y-4 print:text-[11px] font-cairo" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4 border-b-2 border-black pb-2">
        <h2 className="text-xl font-bold">
          {isAr ? 'نموذج تقييد عن العمل' : 'Work Restriction Form'}
        </h2>
        <p className="text-sm font-bold">SHC9</p>
      </div>

      <div className="border-2 border-black p-4 space-y-4">
        <div>
          <Label className="text-sm font-bold">{isAr ? 'سعادة:' : 'To:'}</Label>
          <Input value={d.addressed_to || ''} onChange={e => set('addressed_to', e.target.value)} className="h-8 text-sm border-0 border-b border-black rounded-none w-64 inline-block ml-2" />
        </div>

        <p className="text-sm font-bold text-center">{isAr ? 'السلام عليكم ورحمة الله وبركاته' : 'Peace be upon you'}</p>

        <div className="text-sm leading-loose space-y-4 mt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span>{isAr ? 'نظرًا لتعرض الموظف /' : 'Due to the exposure of employee /'}</span>
            <Input value={d.name || ''} onChange={e => set('name', e.target.value)} className="h-8 text-sm w-64 border-0 border-b border-black rounded-none inline-block text-center" />
            <span>{isAr ? 'إلى' : 'to'}</span>
            <Input value={d.exposure_type || ''} onChange={e => set('exposure_type', e.target.value)} className="h-8 text-sm w-64 border-0 border-b border-black rounded-none inline-block text-center" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span>{isAr ? 'أثناء تعامله مع مريض مصاب بمرض' : 'while dealing with a patient with'}</span>
            <Input value={d.disease || ''} onChange={e => set('disease', e.target.value)} className="h-8 text-sm w-64 border-0 border-b border-black rounded-none inline-block text-center" />
          </div>
          <p className="text-sm">
            {isAr
              ? 'وبناءً على سياسة التعامل بهذا الخصوص والمعتمدة من إدارة الصحة العامة بمنطقة المدينة المنورة، فإن الموظف المذكور تم تقييده عن مكان عمله لمدة:'
              : 'Based on the approved policy, the mentioned employee has been restricted from work for:'}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <Input value={d.restriction_days || ''} onChange={e => set('restriction_days', e.target.value)} className="h-8 text-sm w-16 border-0 border-b border-black rounded-none text-center" />
            <span>{isAr ? 'يوم، ابتداءً من تاريخ' : 'days, from'}</span>
            <Input type="date" value={d.restriction_start || ''} onChange={e => set('restriction_start', e.target.value)} className="h-8 text-sm w-36 border-0 border-b border-black rounded-none text-center" />
            <span>{isAr ? 'وحتى تاريخ' : 'until'}</span>
            <Input type="date" value={d.restriction_end || ''} onChange={e => set('restriction_end', e.target.value)} className="h-8 text-sm w-36 border-0 border-b border-black rounded-none text-center" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-12 pt-4">
          <div className="text-center space-y-4">
            <p className="font-bold text-sm">{isAr ? 'طبيب عيادة الصحة المهنية' : 'Occupational Health Physician'}</p>
            <div className="flex items-center justify-center gap-2">
              <Label className="text-xs">{isAr ? 'الاسم:' : 'Name:'}</Label>
              <Input value={d.oh_doctor_name || ''} onChange={e => set('oh_doctor_name', e.target.value)} className="h-8 text-sm border-0 border-b border-black rounded-none w-48" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <p className="font-bold text-sm">{isAr ? 'مدير المركز الصحي' : 'Health Center Director'}</p>
            <div className="flex items-center justify-center gap-2">
              <Label className="text-xs">{isAr ? 'الاسم:' : 'Name:'}</Label>
              <Input value={d.director_name || ''} onChange={e => set('director_name', e.target.value)} className="h-8 text-sm border-0 border-b border-black rounded-none w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}