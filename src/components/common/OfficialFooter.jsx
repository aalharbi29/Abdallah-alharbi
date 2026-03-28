import React from 'react';
import useLogoSettings from '../settings/useLogoSettings';

export default function OfficialFooter({ className = "", compact = false }) {
  const { logoSettings, isLoaded } = useLogoSettings();

  if (!isLoaded || !logoSettings?.show_footer) return null;

  return (
    <div className={`${compact ? 'mt-6' : 'mt-12'} text-center border-t-2 border-blue-600 pt-4 pb-2 ${className}`}>
      <p className="font-bold text-blue-800 text-sm mb-1">{logoSettings.footer_text_1}</p>
      <p className="text-xs text-slate-600 font-medium">{logoSettings.footer_text_2}</p>
    </div>
  );
}