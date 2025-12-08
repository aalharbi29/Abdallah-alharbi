import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Type, 
  Palette, 
  Maximize2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  Square,
  Eye,
  EyeOff
} from 'lucide-react';

export default function FormElementEditor({ element, onUpdate, onClose }) {
  const [props, setProps] = useState(element || {
    fontSize: '10px',
    fontWeight: 'normal',
    color: '#000000',
    backgroundColor: 'transparent',
    borderColor: '#000000',
    borderWidth: '1px',
    padding: '8px',
    textAlign: 'right',
    fontStyle: 'normal',
    textDecoration: 'none',
    width: '100%',
    height: 'auto'
  });

  const handleChange = (key, value) => {
    const updated = { ...props, [key]: value };
    setProps(updated);
    onUpdate(updated);
  };

  return (
    <Card className="w-80 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          محرر العنصر
          <Button size="sm" variant="ghost" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {/* حجم الخط */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-1">
            <Type className="w-3 h-3" />
            حجم الخط
          </Label>
          <Input
            value={props.fontSize}
            onChange={(e) => handleChange('fontSize', e.target.value)}
            placeholder="10px"
            className="h-8"
          />
        </div>

        {/* سماكة الخط */}
        <div>
          <Label className="text-xs mb-1 block">سماكة الخط</Label>
          <div className="flex gap-1">
            {['normal', 'bold', '600', '700', '800'].map(w => (
              <Button
                key={w}
                size="sm"
                variant={props.fontWeight === w ? 'default' : 'outline'}
                onClick={() => handleChange('fontWeight', w)}
                className="flex-1 h-7 text-xs"
              >
                {w === 'normal' ? 'عادي' : w === 'bold' ? 'عريض' : w}
              </Button>
            ))}
          </div>
        </div>

        {/* لون النص */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-1">
            <Palette className="w-3 h-3" />
            لون النص
          </Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={props.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={props.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="flex-1 h-8"
            />
          </div>
        </div>

        {/* لون الخلفية */}
        <div>
          <Label className="text-xs mb-1 block">لون الخلفية</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={props.backgroundColor === 'transparent' ? '#ffffff' : props.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="h-8 w-16"
            />
            <Input
              value={props.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="flex-1 h-8"
            />
            <Button size="sm" onClick={() => handleChange('backgroundColor', 'transparent')} className="h-8">
              شفاف
            </Button>
          </div>
        </div>

        {/* الحدود */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-1">
            <Square className="w-3 h-3" />
            الحدود
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">اللون</Label>
              <Input
                type="color"
                value={props.borderColor}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="h-7"
              />
            </div>
            <div>
              <Label className="text-xs">السمك</Label>
              <Input
                value={props.borderWidth}
                onChange={(e) => handleChange('borderWidth', e.target.value)}
                placeholder="1px"
                className="h-7"
              />
            </div>
          </div>
        </div>

        {/* المسافة الداخلية */}
        <div>
          <Label className="text-xs mb-1 block">المسافة الداخلية</Label>
          <Input
            value={props.padding}
            onChange={(e) => handleChange('padding', e.target.value)}
            placeholder="8px"
            className="h-8"
          />
        </div>

        {/* المحاذاة */}
        <div>
          <Label className="text-xs mb-1 block">المحاذاة</Label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={props.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => handleChange('textAlign', 'left')}
              className="flex-1 h-8"
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={props.textAlign === 'center' ? 'default' : 'outline'}
              onClick={() => handleChange('textAlign', 'center')}
              className="flex-1 h-8"
            >
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={props.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => handleChange('textAlign', 'right')}
              className="flex-1 h-8"
            >
              <AlignRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* العرض والارتفاع */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs mb-1 block">العرض</Label>
            <Input
              value={props.width}
              onChange={(e) => handleChange('width', e.target.value)}
              placeholder="100%"
              className="h-7"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">الارتفاع</Label>
            <Input
              value={props.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="auto"
              className="h-7"
            />
          </div>
        </div>

        {/* خيارات إضافية */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={props.fontStyle === 'italic' ? 'default' : 'outline'}
            onClick={() => handleChange('fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic')}
            className="flex-1 h-7"
          >
            <Italic className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={props.textDecoration === 'underline' ? 'default' : 'outline'}
            onClick={() => handleChange('textDecoration', props.textDecoration === 'underline' ? 'none' : 'underline')}
            className="flex-1 h-7"
          >
            <Underline className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}