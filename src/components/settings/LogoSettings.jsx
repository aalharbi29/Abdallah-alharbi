import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Image, Upload, Trash2, RotateCcw, Save, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

const DEFAULT_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68af5003813e47bd07947b30/ebae7336b_1407.png";

const DEFAULT_SETTINGS = {
  logoUrl: DEFAULT_LOGO_URL,
  showLogo: true,
  maxHeight: 300,
  marginTop: -80,
  marginBottom: -30,
};

export function getLogoSettings() {
  try {
    const saved = localStorage.getItem('report-logo-settings');
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export default function LogoSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getLogoSettings());
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings(prev => ({ ...prev, logoUrl: file_url }));
      toast.success('تم رفع الشعار بنجاح');
    } catch (err) {
      toast.error('فشل رفع الشعار');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('report-logo-settings', JSON.stringify(settings));
    setSaved(true);
    toast.success('تم حفظ إعدادات الشعار');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('report-logo-settings');
    toast.info('تم استعادة الإعدادات الافتراضية');
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: '', showLogo: false }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          إعدادات الشعار في التقارير
        </CardTitle>
        <CardDescription>
          تحكم في شعار الترويسة الذي يظهر في الخطابات والتقارير المصدّرة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* تفعيل/إلغاء الشعار */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <Label>إظهار الشعار</Label>
            <p className="text-xs text-gray-500">عرض الشعار في ترويسة التقارير</p>
          </div>
          <Switch
            checked={settings.showLogo}
            onCheckedChange={(v) => setSettings(prev => ({ ...prev, showLogo: v }))}
          />
        </div>

        {settings.showLogo && (
          <>
            {/* رفع شعار جديد */}
            <div className="space-y-3">
              <Label>رفع شعار جديد</Label>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  <Button variant="outline" className="w-full gap-2" asChild disabled={uploading}>
                    <span>
                      <Upload className="w-4 h-4" />
                      {uploading ? 'جاري الرفع...' : 'اختر صورة الشعار'}
                    </span>
                  </Button>
                </label>
                {settings.logoUrl && (
                  <Button variant="destructive" size="icon" onClick={handleRemoveLogo}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {/* رابط مباشر */}
              <div>
                <Label className="text-xs text-gray-500">أو أدخل رابط الصورة مباشرة</Label>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  dir="ltr"
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            {/* الحجم */}
            <div className="space-y-2">
              <Label>الارتفاع الأقصى: {settings.maxHeight}px</Label>
              <Slider
                value={[settings.maxHeight]}
                onValueChange={([v]) => setSettings(prev => ({ ...prev, maxHeight: v }))}
                min={50}
                max={500}
                step={10}
              />
            </div>

            {/* هامش علوي */}
            <div className="space-y-2">
              <Label>الهامش العلوي: {settings.marginTop}px</Label>
              <Slider
                value={[settings.marginTop]}
                onValueChange={([v]) => setSettings(prev => ({ ...prev, marginTop: v }))}
                min={-150}
                max={50}
                step={5}
              />
            </div>

            {/* هامش سفلي */}
            <div className="space-y-2">
              <Label>الهامش السفلي: {settings.marginBottom}px</Label>
              <Slider
                value={[settings.marginBottom]}
                onValueChange={([v]) => setSettings(prev => ({ ...prev, marginBottom: v }))}
                min={-100}
                max={50}
                step={5}
              />
            </div>

            {/* معاينة */}
            {settings.logoUrl && (
              <div className="border rounded-lg p-4 bg-white">
                <Label className="mb-2 block text-center text-gray-500 text-xs">معاينة الشعار</Label>
                <div className="text-center border-b-2 border-teal-500 pb-2 overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt="معاينة الشعار"
                    style={{
                      maxHeight: `${settings.maxHeight}px`,
                      margin: `${settings.marginTop}px auto ${settings.marginBottom}px auto`,
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* أزرار الحفظ */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="gap-2 flex-1 bg-teal-600 hover:bg-teal-700">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'تم الحفظ!' : 'حفظ إعدادات الشعار'}
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            استعادة الافتراضي
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}