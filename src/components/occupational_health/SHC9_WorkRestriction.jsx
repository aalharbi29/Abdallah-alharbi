import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SHC9_WorkRestriction({ data, onChange, lang = 'ar' }) {
  const isAr = lang === 'ar';
  const d = data || {};
  const set = (field, val) => onChange({ ...d, [field]: val });

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#5B9BD5]">
          {isAr ? 'نموذج تقييد عن العمل' : 'Work Restriction Form'}
        </h2>
        <p className="text-xs text-gray-500">SHC9</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
        <div>
          <Label className="text-sm">{isAr ? 'سعادة:' : 'To:'}</Label>
          <Input value={d.addressed_to || ''} onChange={e => set('addressed_to', e.target.value)} className="h-9 text-sm" />
        </div>

        <p className="text-sm font-semibold text-center">{isAr ? 'السلام عليكم ورحمة الله وبركاته' : 'Peace be upon you'}</p>

        <div className="text-sm leading-relaxed space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span>{isAr ? 'نظرًا لتعرض الموظف /' : 'Due to the exposure of employee /'}</span>
            <Input value={d.name || ''} onChange={e => set('name', e.target.value)} className="h-8 text-sm w-48 inline-block" />
            <span>{isAr ? 'إلى' : 'to'}</span>
            <Input value={d.exposure_type || ''} onChange={e => set('exposure_type', e.target.value)} className="h-8 text-sm w-48 inline-block" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span>{isAr ? 'أثناء تعامله مع مريض مصاب بمرض' : 'while dealing with a patient with'}</span>
            <Input value={d.disease || ''} onChange={e => set('disease', e.target.value)} className="h-8 text-sm w-48 inline-block" />
          </div>
          <p className="text-sm">
            {isAr
              ? 'وبناءً على سياسة التعامل بهذا الخصوص والمعتمدة من إدارة الصحة العامة بمنطقة المدينة المنورة، فإن الموظف المذكور تم تقييده عن مكان عمله لمدة:'
              : 'Based on the approved policy, the mentioned employee has been restricted from work for:'}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Input value={d.restriction_days || ''} onChange={e => set('restriction_days', e.target.value)} className="h-8 text-sm w-20" placeholder={isAr ? 'يوم' : 'days'} />
            <span>{isAr ? 'يوم، ابتداءً من تاريخ' : 'days, from'}</span>
            <Input type="date" value={d.restriction_start || ''} onChange={e => set('restriction_start', e.target.value)} className="h-8 text-sm w-40" />
            <span>{isAr ? 'وحتى تاريخ' : 'until'}</span>
            <Input type="date" value={d.restriction_end || ''} onChange={e => set('restriction_end', e.target.value)} className="h-8 text-sm w-40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t">
          <div className="text-center space-y-2">
            <p className="font-bold text-sm">{isAr ? 'طبيب عيادة الصحة المهنية' : 'Occupational Health Physician'}</p>
            <div><Label className="text-xs">{isAr ? 'الاسم:' : 'Name:'}</Label><Input value={d.oh_doctor_name || ''} onChange={e => set('oh_doctor_name', e.target.value)} className="h-8 text-sm" /></div>
          </div>
          <div className="text-center space-y-2">
            <p className="font-bold text-sm">{isAr ? 'مدير المركز الصحي' : 'Health Center Director'}</p>
            <div><Label className="text-xs">{isAr ? 'الاسم:' : 'Name:'}</Label><Input value={d.director_name || ''} onChange={e => set('director_name', e.target.value)} className="h-8 text-sm" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}