import React from 'react';
import { Button } from '@/components/ui/button';

const templates = [
  {
    key: 'summary',
    label: 'ملخص تنفيذي',
    fields: ['اسم_المركز', 'الموقع', 'حالة_التشغيل', 'حالة_المركز', 'عدد_الموظفين'],
    viewMode: 'stats',
    orientation: 'portrait'
  },
  {
    key: 'contact',
    label: 'دليل تواصل',
    fields: ['اسم_المركز', 'الموقع', 'هاتف_المركز', 'رقم_الجوال', 'ايميل_المركز', 'المدير'],
    viewMode: 'table',
    orientation: 'portrait'
  },
  {
    key: 'assets',
    label: 'التجهيزات والمركبات',
    fields: ['اسم_المركز', 'سيارة_خدمات', 'سيارة_اسعاف', 'حالة_التشغيل', 'عدد_الموظفين'],
    viewMode: 'cards',
    orientation: 'landscape'
  }
];

export default function ReportTemplatesBar({ onApplyTemplate }) {
  return (
    <div className="flex flex-wrap gap-2">
      {templates.map((template) => (
        <Button key={template.key} variant="outline" size="sm" onClick={() => onApplyTemplate(template)}>
          {template.label}
        </Button>
      ))}
    </div>
  );
}