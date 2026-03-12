import React from 'react';
import useLogoSettings from '@/components/settings/useLogoSettings';

export default function OHFormHeader({ formData, lang = 'ar' }) {
  const { logoSettings } = useLogoSettings();
  const isAr = lang === 'ar';

  return (
    <div className="mb-6 font-cairo text-sm" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Official Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-right flex-1 font-bold leading-tight">
          <p>{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</p>
          <p>{isAr ? 'وزارة الصحة' : 'Ministry of Health'}</p>
          <p>{isAr ? 'تجمع المدينة المنورة الصحي' : 'Madinah Health Cluster'}</p>
          <p>{isAr ? 'قسم الصحة المهنية' : 'Occupational Health Dept.'}</p>
        </div>
        
        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
          {logoSettings.show_logo && logoSettings.logo_url && (
            <img src={logoSettings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
          )}
        </div>
        
        <div className="text-left flex-1 font-bold leading-tight" dir="ltr">
          <p>Kingdom of Saudi Arabia</p>
          <p>Ministry of Health</p>
          <p>Madinah Health Cluster</p>
          <p>Occupational Health Dept.</p>
        </div>
      </div>

      {/* Patient Info Table */}
      <div className="border-2 border-black">
        <div className="grid grid-cols-4 divide-x divide-x-reverse divide-black border-b border-black bg-gray-50">
          <div className="p-1 font-bold text-center border-b md:border-b-0">{isAr ? 'الاسم' : 'Name'}</div>
          <div className="p-1 text-center col-span-3 border-b md:border-b-0 bg-white">{formData.name || ''}</div>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 divide-x divide-x-reverse divide-black border-b border-black bg-gray-50">
          <div className="p-1 font-bold text-center">{isAr ? 'رقم الملف' : 'MRN'}</div>
          <div className="p-1 text-center bg-white">{formData.medical_record || ''}</div>
          <div className="p-1 font-bold text-center">{isAr ? 'تاريخ الميلاد' : 'DOB'}</div>
          <div className="p-1 text-center bg-white">{formData.birth_date || ''}</div>
          <div className="p-1 font-bold text-center">{isAr ? 'الجنس' : 'Sex'}</div>
          <div className="p-1 text-center bg-white">{formData.sex || ''}</div>
          <div className="p-1 font-bold text-center">{isAr ? 'الوظيفة' : 'Position'}</div>
          <div className="p-1 text-center bg-white">{formData.position || ''}</div>
        </div>
      </div>
    </div>
  );
}