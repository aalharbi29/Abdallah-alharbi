import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Image, Upload, Save, CheckCircle, Loader2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";

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

export default function LogoSettingsManager() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const records = await base44.entities.LogoSettings.list('-updated_date', 1);
    if (records.length > 0) {
      setExistingId(records[0].id);
      setSettings({
        ...DEFAULT_SETTINGS,
        ...records[0],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const dataToSave = { ...settings };
    delete dataToSave.id;
    delete dataToSave.created_date;
    delete dataToSave.updated_date;
    delete dataToSave.created_by;

    if (existingId) {
      await base44.entities.LogoSettings.update(existingId, dataToSave);
    } else {
      const created = await base44.entities.LogoSettings.create(dataToSave);
      setExistingId(created.id);
    }
    toast.success('تم حفظ إعدادات الشعار بنجاح');
    setSaving(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSettings(prev => ({ ...prev, logo_url: file_url }));
    toast.success('تم رفع الشعار بنجاح');
    setUploading(false);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info('تم استعادة الإعدادات الافتراضية (اضغط حفظ للتطبيق)');
  };

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رفع الشعار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="w-5 h-5" />
            صورة الشعار
          </CardTitle>
          <CardDescription>ارفع شعارك المخصص أو أدخل رابط الصورة مباشرة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={settings.show_logo} onCheckedChange={(v) => update('show_logo', v)} />
            <Label>إظهار الشعار في التقارير والخطابات</Label>
          </div>

          {settings.show_logo && (
            <>
              <div>
                <Label className="mb-2 block">رابط الشعار</Label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => update('logo_url', e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="text-left"
                />
              </div>

              <div>
                <Label className="mb-2 block">أو ارفع صورة جديدة</Label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {uploading ? 'جاري الرفع...' : 'اختر صورة الشعار (PNG, JPG)'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>

              {settings.logo_url && (
                <div className="p-4 bg-gray-50 rounded-xl text-center border">
                  <p className="text-xs text-gray-500 mb-2">معاينة الشعار</p>
                  <img
                    src={settings.logo_url}
                    alt="معاينة الشعار"
                    style={{
                      maxHeight: `${settings.max_height}px`,
                      marginTop: `${settings.margin_top}px`,
                      marginBottom: `${settings.margin_bottom}px`,
                    }}
                    className="mx-auto block"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* إعدادات الحجم والموقع */}
      {settings.show_logo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">حجم الشعار وموقعه</CardTitle>
            <CardDescription>تحكم في أبعاد الشعار وهوامشه في التقارير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="flex items-center justify-between mb-3">
                <span>أقصى ارتفاع: {settings.max_height}px</span>
              </Label>
              <Slider
                value={[settings.max_height]}
                onValueChange={([v]) => update('max_height', v)}
                min={50}
                max={500}
                step={10}
              />
            </div>

            <div>
              <Label className="flex items-center justify-between mb-3">
                <span>الهامش العلوي: {settings.margin_top}px</span>
              </Label>
              <Slider
                value={[settings.margin_top]}
                onValueChange={([v]) => update('margin_top', v)}
                min={-150}
                max={50}
                step={5}
              />
            </div>

            <div>
              <Label className="flex items-center justify-between mb-3">
                <span>الهامش السفلي: {settings.margin_bottom}px</span>
              </Label>
              <Slider
                value={[settings.margin_bottom]}
                onValueChange={([v]) => update('margin_bottom', v)}
                min={-100}
                max={50}
                step={5}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* إعدادات التذييل */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تذييل التقارير</CardTitle>
          <CardDescription>تحكم في نص التذييل الظاهر أسفل التقارير</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={settings.show_footer} onCheckedChange={(v) => update('show_footer', v)} />
            <Label>إظهار التذييل</Label>
          </div>

          {settings.show_footer && (
            <>
              <div>
                <Label className="mb-2 block">السطر الأول (رئيسي)</Label>
                <Input
                  value={settings.footer_text_1}
                  onChange={(e) => update('footer_text_1', e.target.value)}
                  placeholder="شؤون المراكز الصحية..."
                />
              </div>
              <div>
                <Label className="mb-2 block">السطر الثاني</Label>
                <Input
                  value={settings.footer_text_2}
                  onChange={(e) => update('footer_text_2', e.target.value)}
                  placeholder="تجمع المدينة المنورة الصحي"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* أزرار الحفظ */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          استعادة الافتراضي
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}