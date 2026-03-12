import React from 'react';
import useLogoSettings from '@/components/settings/useLogoSettings';

export default function OHFormHeader({ formData, lang = 'ar' }) {
  const { logoSettings } = useLogoSettings();
  const isAr = lang === 'ar';

  return (
    <div className="mb-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between border-b-2 border-[#5B9BD5] pb-4">
        {/* Logo */}
        <div className="w-20 h-20 flex-shrink-0">
          {logoSettings.show_logo && logoSettings.logo_url && (
            <img src={logoSettings.logo_url} alt="Logo" className="w-20 h-20 object-contain" />
          )}
        </div>
        
        {/* Center Info */}
        <div className="text-center flex-1 px-4">
          <p className="text-sm text-gray-600">{isAr ? 'الاسم' : 'Name'}: <span className="font-semibold">{formData.name || '...................'}</span></p>
          <p className="text-sm text-gray-600">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}: <span className="font-semibold">{formData.birth_date || '...................'}</span></p>
          <p className="text-sm text-gray-600">{isAr ? 'الجنس' : 'Sex'}: <span className="font-semibold">{formData.sex || '...................'}</span></p>
          <p className="text-sm text-gray-600">{isAr ? 'الوظيفة' : 'Position'}: <span className="font-semibold">{formData.position || '...................'}</span></p>
          <p className="text-sm text-gray-600">{isAr ? 'رقم الملف الصحي' : 'Medical Record No.'}: <span className="font-semibold">{formData.medical_record || '...................'}</span></p>
        </div>

        {/* Organization Info */}
        <div className={`text-sm ${isAr ? 'text-left' : 'text-right'} flex-shrink-0`}>
          <p className="font-semibold">{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</p>
          <p>{isAr ? 'وزارة الصحة' : 'Ministry of Health'}</p>
          <p>{isAr ? 'تجمع المدينة المنورة الصحي' : 'Madinah Health Cluster'}</p>
          <p>{isAr ? 'قسم الصحة المهنية' : 'Occupational Health Dept.'}</p>
        </div>
      </div>
    </div>
  );
}