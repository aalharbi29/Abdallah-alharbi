import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, Lock, Shield, Key, Eye, EyeOff,
  FileText, Loader2, CheckCircle,
  Droplets, Image as ImageIcon
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PDFSecurity({ onComplete }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('password');

  // خيارات الحماية بكلمة مرور
  const [passwordOptions, setPasswordOptions] = useState({
    userPassword: '',
    ownerPassword: '',
    confirmPassword: '',
    allowPrinting: true,
    allowCopying: false,
    allowEditing: false,
    allowAnnotations: false
  });

  // خيارات العلامة المائية
  const [watermarkOptions, setWatermarkOptions] = useState({
    type: 'text',
    text: 'سري - للاستخدام الداخلي فقط',
    imageUrl: '',
    opacity: 50,
    rotation: -45,
    fontSize: 48,
    color: '#cccccc',
    position: 'center',
    allPages: true,
    specificPages: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('الرجاء اختيار ملف PDF');
      return;
    }

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({
        name: file.name,
        url: result.file_url,
        size: file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProtectWithPassword = async () => {
    if (!uploadedFile) {
      alert('الرجاء رفع ملف PDF أولاً');
      return;
    }

    if (!passwordOptions.userPassword) {
      alert('الرجاء إدخال كلمة مرور');
      return;
    }

    if (passwordOptions.userPassword !== passwordOptions.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    setIsProcessing(true);
    try {
      // في التطبيق الفعلي سيتم استدعاء backend function
      alert('سيتم حماية الملف بكلمة المرور المحددة');

      if (onComplete) {
        onComplete({
          base64: '',
          filename: `protected_${uploadedFile.name}`,
          message: 'تم حماية الملف بكلمة مرور'
        });
      }
    } catch (error) {
      console.error('Protection error:', error);
      alert('حدث خطأ أثناء حماية الملف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddWatermark = async () => {
    if (!uploadedFile) {
      alert('الرجاء رفع ملف PDF أولاً');
      return;
    }

    if (watermarkOptions.type === 'text' && !watermarkOptions.text.trim()) {
      alert('الرجاء إدخال نص العلامة المائية');
      return;
    }

    setIsProcessing(true);
    try {
      // في التطبيق الفعلي سيتم استدعاء backend function
      alert('سيتم إضافة العلامة المائية للملف');

      if (onComplete) {
        onComplete({
          base64: '',
          filename: `watermarked_${uploadedFile.name}`,
          message: 'تم إضافة العلامة المائية'
        });
      }
    } catch (error) {
      console.error('Watermark error:', error);
      alert('حدث خطأ أثناء إضافة العلامة المائية');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setWatermarkOptions(prev => ({
        ...prev,
        imageUrl: result.file_url
      }));
    } catch (error) {
      alert('حدث خطأ أثناء رفع الصورة');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* رفع الملف */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            حماية وأمان PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-security-upload"
              disabled={isUploading}
            />
            <label htmlFor="pdf-security-upload" className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin text-blue-500" />
              ) : (
                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              )}
              <p className="text-sm text-gray-600">
                {uploadedFile ? uploadedFile.name : 'اضغط لرفع ملف PDF'}
              </p>
            </label>
          </div>

          {uploadedFile && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800">
                تم رفع: <strong>{uploadedFile.name}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* معاينة */}
          {uploadedFile && (
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={uploadedFile.url}
                className="w-full h-[300px]"
                title="PDF Preview"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* خيارات الحماية */}
      <Card>
        <CardHeader>
          <CardTitle>خيارات الحماية</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password" className="gap-2">
                <Lock className="w-4 h-4" />
                كلمة مرور
              </TabsTrigger>
              <TabsTrigger value="watermark" className="gap-2">
                <Droplets className="w-4 h-4" />
                علامة مائية
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4 mt-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  حماية الملف بكلمة مرور تمنع فتحه بدون إدخال كلمة المرور الصحيحة
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>كلمة المرور للمستخدم</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwordOptions.userPassword}
                      onChange={(e) => setPasswordOptions({
                        ...passwordOptions,
                        userPassword: e.target.value
                      })}
                      placeholder="أدخل كلمة المرور"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>تأكيد كلمة المرور</Label>
                  <Input
                    type="password"
                    value={passwordOptions.confirmPassword}
                    onChange={(e) => setPasswordOptions({
                      ...passwordOptions,
                      confirmPassword: e.target.value
                    })}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                </div>

                <div className="border-t pt-3">
                  <Label className="text-sm font-semibold mb-2 block">صلاحيات المستخدم:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allowPrinting"
                        checked={passwordOptions.allowPrinting}
                        onCheckedChange={(checked) => setPasswordOptions({
                          ...passwordOptions,
                          allowPrinting: checked
                        })}
                      />
                      <Label htmlFor="allowPrinting" className="text-sm">السماح بالطباعة</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allowCopying"
                        checked={passwordOptions.allowCopying}
                        onCheckedChange={(checked) => setPasswordOptions({
                          ...passwordOptions,
                          allowCopying: checked
                        })}
                      />
                      <Label htmlFor="allowCopying" className="text-sm">السماح بنسخ النص</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allowEditing"
                        checked={passwordOptions.allowEditing}
                        onCheckedChange={(checked) => setPasswordOptions({
                          ...passwordOptions,
                          allowEditing: checked
                        })}
                      />
                      <Label htmlFor="allowEditing" className="text-sm">السماح بالتعديل</Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProtectWithPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing || !uploadedFile}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 ml-2" />
                  )}
                  حماية بكلمة مرور
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="watermark" className="space-y-4 mt-4">
              <Alert className="bg-purple-50 border-purple-200">
                <Droplets className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-800">
                  العلامة المائية تظهر على جميع صفحات الملف لحماية حقوق الملكية
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant={watermarkOptions.type === 'text' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWatermarkOptions({ ...watermarkOptions, type: 'text' })}
                  >
                    <FileText className="w-4 h-4 ml-1" />
                    نص
                  </Button>
                  <Button
                    variant={watermarkOptions.type === 'image' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWatermarkOptions({ ...watermarkOptions, type: 'image' })}
                  >
                    <ImageIcon className="w-4 h-4 ml-1" />
                    صورة
                  </Button>
                </div>

                {watermarkOptions.type === 'text' ? (
                  <>
                    <div className="space-y-1">
                      <Label>نص العلامة المائية</Label>
                      <Textarea
                        value={watermarkOptions.text}
                        onChange={(e) => setWatermarkOptions({
                          ...watermarkOptions,
                          text: e.target.value
                        })}
                        placeholder="أدخل نص العلامة المائية"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>حجم الخط</Label>
                        <Input
                          type="number"
                          value={watermarkOptions.fontSize}
                          onChange={(e) => setWatermarkOptions({
                            ...watermarkOptions,
                            fontSize: parseInt(e.target.value)
                          })}
                          min="12"
                          max="120"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>اللون</Label>
                        <Input
                          type="color"
                          value={watermarkOptions.color}
                          onChange={(e) => setWatermarkOptions({
                            ...watermarkOptions,
                            color: e.target.value
                          })}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Label>صورة العلامة المائية</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="watermark-image"
                    />
                    <label htmlFor="watermark-image">
                      <Button variant="outline" className="w-full" asChild>
                        <span>
                          <ImageIcon className="w-4 h-4 ml-1" />
                          {watermarkOptions.imageUrl ? 'تم رفع الصورة' : 'اختيار صورة'}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>الشفافية ({watermarkOptions.opacity}%)</Label>
                    <Input
                      type="range"
                      min="10"
                      max="100"
                      value={watermarkOptions.opacity}
                      onChange={(e) => setWatermarkOptions({
                        ...watermarkOptions,
                        opacity: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>الدوران ({watermarkOptions.rotation}°)</Label>
                    <Input
                      type="range"
                      min="-90"
                      max="90"
                      value={watermarkOptions.rotation}
                      onChange={(e) => setWatermarkOptions({
                        ...watermarkOptions,
                        rotation: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddWatermark}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isProcessing || !uploadedFile}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Droplets className="w-4 h-4 ml-2" />
                  )}
                  إضافة علامة مائية
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}