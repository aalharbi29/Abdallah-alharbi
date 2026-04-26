import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MHC_ASSETS, MHC_TEXTS } from '@/components/branding/madinahCluster';

const DEFAULT_LOGO_URL = MHC_ASSETS.logo;

const DEFAULT_SETTINGS = {
  logo_url: DEFAULT_LOGO_URL,
  max_height: 300,
  margin_top: -80,
  margin_bottom: -30,
  show_logo: true,
  show_footer: true,
  footer_text_1: "شؤون المراكز الصحية بالحسو - مستشفى الحسو العام",
  footer_text_2: MHC_TEXTS.arabicName,
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