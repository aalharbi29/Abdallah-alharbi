import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Type, Bold, Italic, Underline, AlignRight, AlignCenter, AlignLeft } from 'lucide-react';

export const FreeTextBlock = ({ block, isEditMode, onUpdateBlock }) => {
  const [settings, setSettings] = useState({
    fontSize: block.data.fontSize || 16,
    align: block.data.align || 'right',
    bold: block.data.bold || false,
    italic: block.data.italic || false,
    underline: block.data.underline || false
  });

  if (!block?.data) return null;

  const applySettings = (newSettings) => {
    setSettings(newSettings);
    onUpdateBlock(block.id, { ...block.data, ...newSettings });
  };

  return (
    <div className="my-4 relative group" dir="rtl">
      {isEditMode && (
        <div className="absolute -top-10 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Type className="w-4 h-4 ml-1" />
                تنسيق
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">حجم الخط: {settings.fontSize}px</Label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([val]) => applySettings({ ...settings, fontSize: val })}
                    min={10}
                    max={32}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">المحاذاة</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={settings.align === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applySettings({ ...settings, align: 'right' })}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={settings.align === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applySettings({ ...settings, align: 'center' })}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={settings.align === 'left' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applySettings({ ...settings, align: 'left' })}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={settings.bold ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applySettings({ ...settings, bold: !settings.bold })}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={settings.italic ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applySettings({ ...settings, italic: !settings.italic })}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={settings.underline ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applySettings({ ...settings, underline: !settings.underline })}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      {isEditMode ? (
        <Textarea
          value={block.data.text || ''}
          onChange={(e) => onUpdateBlock(block.id, { ...block.data, text: e.target.value })}
          placeholder="اكتب نصك الحر هنا..."
          className="w-full min-h-[100px] resize-y"
          style={{
            fontSize: `${settings.fontSize}px`,
            textAlign: settings.align,
            fontWeight: settings.bold ? 'bold' : 'normal',
            fontStyle: settings.italic ? 'italic' : 'normal',
            textDecoration: settings.underline ? 'underline' : 'none'
          }}
        />
      ) : (
        <p 
          className="whitespace-pre-wrap"
          style={{
            fontSize: `${settings.fontSize}px`,
            textAlign: settings.align,
            fontWeight: settings.bold ? 'bold' : 'normal',
            fontStyle: settings.italic ? 'italic' : 'normal',
            textDecoration: settings.underline ? 'underline' : 'none',
            color: '#000'
          }}
        >
          {block.data.text}
        </p>
      )}
    </div>
  );
};