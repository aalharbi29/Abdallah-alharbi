import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Crop, RotateCw, Sun, Contrast, Droplets,
  X, Check, Download
} from 'lucide-react';

export default function ImageEditor({ imageUrl, onSave, onClose }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const applyFilters = () => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) rotate(${rotation}deg)`;
  };

  const handleSave = () => {
    // في الواقع، يمكنك استخدام canvas لحفظ الصورة المعدلة
    // لكن للبساطة، سنمرر الصورة الأصلية مع الفلاتر
    onSave({
      url: imageUrl,
      filters: {
        brightness,
        contrast,
        saturation,
        rotation
      }
    });
  };

  const reset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>تعديل الصورة</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              إعادة تعيين
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* معاينة الصورة */}
        <div className="flex justify-center items-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-[400px] object-contain"
            style={{ filter: applyFilters() }}
          />
        </div>

        {/* أدوات التعديل */}
        <div className="space-y-4">
          {/* السطوع */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4" />
              السطوع ({brightness}%)
            </Label>
            <Slider
              value={[brightness]}
              onValueChange={([value]) => setBrightness(value)}
              min={0}
              max={200}
              step={1}
            />
          </div>

          {/* التباين */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Contrast className="w-4 h-4" />
              التباين ({contrast}%)
            </Label>
            <Slider
              value={[contrast]}
              onValueChange={([value]) => setContrast(value)}
              min={0}
              max={200}
              step={1}
            />
          </div>

          {/* التشبع */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4" />
              التشبع ({saturation}%)
            </Label>
            <Slider
              value={[saturation]}
              onValueChange={([value]) => setSaturation(value)}
              min={0}
              max={200}
              step={1}
            />
          </div>

          {/* الدوران */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <RotateCw className="w-4 h-4" />
              الدوران ({rotation}°)
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(r => r - 90)}
              >
                ⟲ 90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(r => r + 90)}
              >
                ⟳ 90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(0)}
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4 ml-2" />
            حفظ التعديلات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}