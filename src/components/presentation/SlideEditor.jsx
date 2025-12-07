import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Type, Palette } from 'lucide-react';

export default function SlideEditor({ slide, theme, onUpdate }) {
  if (!slide) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          تحرير الشريحة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slide Preview */}
        <div
          className="w-full aspect-video rounded-lg border-2 p-8 flex flex-col justify-center items-center"
          style={{
            background: slide.background_color || theme.bg,
            color: theme.primary
          }}
        >
          <h2 className="text-3xl font-bold mb-4 text-center">{slide.title}</h2>
          <div className="text-lg text-center max-w-2xl whitespace-pre-wrap">
            {slide.content}
          </div>
        </div>

        {/* Edit Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>عنوان الشريحة</Label>
            <Input
              value={slide.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="عنوان الشريحة"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              لون الخلفية
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={slide.background_color || '#ffffff'}
                onChange={(e) => onUpdate({ background_color: e.target.value })}
                className="w-20"
              />
              <Input
                value={slide.background_color || '#ffffff'}
                onChange={(e) => onUpdate({ background_color: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>محتوى الشريحة</Label>
          <Textarea
            value={slide.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="اكتب محتوى الشريحة هنا..."
            rows={6}
            className="font-sans"
          />
        </div>

        {/* Layout Selection */}
        <div>
          <Label>تخطيط الشريحة</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {[
              { value: 'title', label: 'عنوان' },
              { value: 'content', label: 'محتوى' },
              { value: 'two-column', label: 'عمودين' },
              { value: 'image', label: 'صورة' },
              { value: 'blank', label: 'فارغة' }
            ].map((layout) => (
              <Button
                key={layout.value}
                variant={slide.layout === layout.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate({ layout: layout.value })}
              >
                {layout.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}