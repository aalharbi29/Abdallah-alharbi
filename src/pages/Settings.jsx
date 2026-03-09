import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Bell, 
  Monitor, 
  Settings2, 
  Save, 
  CheckCircle,
  Moon,
  Sun,
  Smartphone,
  Layout,
  Eye,
  Image
} from 'lucide-react';
import ThemeSwitcher from '../components/theme/ThemeSwitcher';
import { useTheme } from '../components/theme/ThemeProvider';
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import LogoSettings from '../components/settings/LogoSettings';

export default function SettingsPage() {
  const { theme, setTheme, currentTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: false,
    compactMode: false,
    fontSize: 16,
    animationsEnabled: true,
    autoSave: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.warn('Failed to parse settings');
      }
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    setSaved(true);
    toast.success('تم حفظ الإعدادات بنجاح');
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Settings2 className="w-7 h-7 inline ml-2" />
            الإعدادات
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            تخصيص مظهر التطبيق وتفضيلاتك الشخصية
          </p>
        </div>

        <Tabs defaultValue="appearance" dir="rtl">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              المظهر
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              العرض
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              الشعار
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Palette className="w-5 h-5" />
                  سمات التطبيق
                </CardTitle>
                <CardDescription>
                  اختر السمة المفضلة لديك لتخصيص مظهر التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-primary)' }}>
                    اختر السمة
                  </Label>
                  <ThemeSwitcher />
                </div>

                <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                  <p className="text-sm mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    معاينة السمة الحالية: {currentTheme?.name}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--accent-light)' }}>
                      <span className="text-xs" style={{ color: 'var(--accent-color)' }}>لون مميز</span>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-primary)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>خلفية</span>
                    </div>
                    <div className="p-3 rounded-lg text-center border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>بطاقة</span>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--accent-color)' }}>
                      <span className="text-xs text-white">زر رئيسي</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <Label style={{ color: 'var(--text-primary)' }}>الوضع الليلي</Label>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>تفعيل السمة الداكنة تلقائياً</p>
                    </div>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Monitor className="w-5 h-5" />
                  إعدادات العرض
                </CardTitle>
                <CardDescription>
                  تخصيص طريقة عرض المحتوى
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center justify-between mb-3" style={{ color: 'var(--text-primary)' }}>
                      <span>حجم الخط: {settings.fontSize}px</span>
                    </Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => updateSetting('fontSize', value)}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <Layout className="w-5 h-5" />
                      <div>
                        <Label style={{ color: 'var(--text-primary)' }}>الوضع المدمج</Label>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>تقليل المسافات لعرض المزيد من المحتوى</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.compactMode} 
                      onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5" />
                      <div>
                        <Label style={{ color: 'var(--text-primary)' }}>الرسوم المتحركة</Label>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>تفعيل التأثيرات الحركية</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.animationsEnabled} 
                      onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <Save className="w-5 h-5" />
                      <div>
                        <Label style={{ color: 'var(--text-primary)' }}>الحفظ التلقائي</Label>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>حفظ التغييرات تلقائياً</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.autoSave} 
                      onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Bell className="w-5 h-5" />
                  إعدادات الإشعارات
                </CardTitle>
                <CardDescription>
                  تحكم في كيفية تلقي الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <div>
                      <Label style={{ color: 'var(--text-primary)' }}>الإشعارات</Label>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>تلقي إشعارات التطبيق</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.notifications} 
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <Label style={{ color: 'var(--text-primary)' }}>الأصوات</Label>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>تفعيل أصوات الإشعارات</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.sounds} 
                    onCheckedChange={(checked) => updateSetting('sounds', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logo">
            <LogoSettings />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveSettings} className="gap-2" style={{ background: 'var(--accent-color)' }}>
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'تم الحفظ!' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  );
}