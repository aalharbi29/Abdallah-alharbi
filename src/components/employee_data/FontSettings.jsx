import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Type } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Cairo', label: 'Cairo (كايرو)' },
  { value: 'Tajawal', label: 'Tajawal (تجوال)' },
  { value: 'Noto Kufi Arabic', label: 'Noto Kufi (نوتو كوفي)' },
  { value: 'Noto Naskh Arabic', label: 'Noto Naskh (نوتو نسخ)' },
  { value: 'Amiri', label: 'Amiri (أميري)' },
  { value: 'Scheherazade New', label: 'Scheherazade (شهرزاد)' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex (آي بي إم)' },
  { value: 'Almarai', label: 'Almarai (المراعي)' },
  { value: 'Changa', label: 'Changa (تشانجا)' },
  { value: 'El Messiri', label: 'El Messiri (المسيري)' },
  { value: 'Lateef', label: 'Lateef (لطيف)' },
  { value: 'Harmattan', label: 'Harmattan (هارمتان)' },
  { value: 'Mada', label: 'Mada (مدى)' },
  { value: 'Readex Pro', label: 'Readex Pro (ريدكس)' },
  { value: 'PT Sans Caption', label: 'PT Sans Caption' },
];

const WEIGHT_OPTIONS = [
  { value: '400', label: 'عادي (400)' },
  { value: '500', label: 'متوسط (500)' },
  { value: '600', label: 'شبه عريض (600)' },
  { value: '700', label: 'عريض (700)' },
  { value: '800', label: 'عريض جداً (800)' },
  { value: '900', label: 'أعرض (900)' },
];

function FontRow({ label, settings, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-gray-600 w-24 shrink-0">{label}</span>
      <Select value={settings.font} onValueChange={(v) => onChange({ ...settings, font: v })}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map(f => (
            <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        value={settings.size}
        onChange={(e) => onChange({ ...settings, size: e.target.value })}
        className="w-16 h-8 text-xs text-center"
        min="8"
        max="30"
      />
      <span className="text-xs text-gray-400">px</span>
      <Select value={settings.weight} onValueChange={(v) => onChange({ ...settings, weight: v })}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WEIGHT_OPTIONS.map(w => (
            <SelectItem key={w.value} value={w.value} className="text-xs">{w.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function FontSettings({ fontSettings, onFontSettingsChange }) {
  const [expanded, setExpanded] = useState(false);

  const update = (key, val) => {
    onFontSettingsChange({ ...fontSettings, [key]: val });
  };

  return (
    <div className="border rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-sm font-bold text-indigo-800 hover:bg-indigo-100/50 rounded-lg transition-colors"
      >
        <span className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          إعدادات الخطوط والتنسيق
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {expanded && (
        <div className="p-3 pt-0 space-y-4">
          {/* النص التعبيري */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-indigo-700 border-b pb-1 block">النص التعبيري</Label>
            <FontRow
              label="عبارات رسمية"
              settings={fontSettings.narrativeBold}
              onChange={(v) => update('narrativeBold', v)}
            />
            <FontRow
              label="نص السلام"
              settings={fontSettings.narrativeGreeting}
              onChange={(v) => update('narrativeGreeting', v)}
            />
            <FontRow
              label="النص العام"
              settings={fontSettings.narrativeBody}
              onChange={(v) => update('narrativeBody', v)}
            />
          </div>

          {/* الجدول */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-indigo-700 border-b pb-1 block">الجدول</Label>
            <FontRow
              label="رأس الجدول"
              settings={fontSettings.tableHeader}
              onChange={(v) => update('tableHeader', v)}
            />
            <FontRow
              label="بيانات الجدول"
              settings={fontSettings.tableBody}
              onChange={(v) => update('tableBody', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}