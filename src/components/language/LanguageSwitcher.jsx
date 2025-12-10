import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

export default function LanguageSwitcher({ variant = "ghost", size = "sm" }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      className="gap-2"
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs font-medium">
        {language === 'ar' ? 'EN' : 'عربي'}
      </span>
    </Button>
  );
}