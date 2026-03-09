import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const DEFAULT_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png";

const DEFAULT_SETTINGS = {
  logo_url: DEFAULT_LOGO_URL,
  max_height: 300,
  margin_top: -80,
  margin_bottom: -30,
  show_logo: true,
  show_footer: true,
  footer_text_1: "شؤون المراكز الصحية بالحسو - مستشفى الحسو العام",
  footer_text_2: "تجمع المدينة المنورة الصحي",
};

export default function useLogoSettings() {
  const [logoSettings, setLogoSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const records = await base44.entities.LogoSettings.list('-updated_date', 1);
      if (records.length > 0) {
        setLogoSettings({ ...DEFAULT_SETTINGS, ...records[0] });
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  return { logoSettings, isLoaded };
}