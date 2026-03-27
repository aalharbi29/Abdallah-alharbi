import React from 'react';
import useLogoSettings from '@/components/settings/useLogoSettings';

export default function OfficialLetterHeader({
  arabicTitle = 'المملكة العربية السعودية',
  arabicSubtitle = 'وزارة الصحة',
  arabicDepartment = 'تجمع المدينة المنورة الصحي',
  englishTitle = 'Kingdom of Saudi Arabia',
  englishSubtitle = 'Ministry of Health',
  englishDepartment = 'Madinah Health Cluster',
}) {
  const { logoSettings, isLoaded } = useLogoSettings();

  return (
    <div className="text-center mb-8 border-b-2 border-green-700 pb-6">
      <div className="flex justify-between items-start gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">{arabicTitle}</p>
          <p className="text-sm text-gray-600">{arabicSubtitle}</p>
          <p className="text-sm font-bold text-green-800">{arabicDepartment}</p>
        </div>
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          {isLoaded && logoSettings?.show_logo && logoSettings?.logo_url ? (
            <img
              src={logoSettings.logo_url}
              alt="الشعار الرسمي"
              className="w-16 h-16 object-contain"
              crossOrigin="anonymous"
            />
          ) : null}
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-600">{englishTitle}</p>
          <p className="text-sm text-gray-600">{englishSubtitle}</p>
          <p className="text-sm font-bold text-green-800">{englishDepartment}</p>
        </div>
      </div>
    </div>
  );
}