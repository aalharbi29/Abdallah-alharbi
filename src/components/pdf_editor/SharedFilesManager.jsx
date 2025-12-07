import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Trash2, 
  ArrowRight,
  Combine,
  Scissors,
  Layers,
  Download,
  Palette,
  ScanLine
} from 'lucide-react';

export default function SharedFilesManager({ files, onRemove, onNavigateTo, currentTab }) {
  if (files.length === 0) return null;

  const tabIcons = {
    merge: Combine,
    split: Scissors,
    pages: Layers,
    compress: Download,
    annotate: Palette,
    forms: ScanLine
  };

  const tabNames = {
    merge: 'دمج',
    split: 'تقسيم',
    pages: 'إدارة الصفحات',
    compress: 'ضغط',
    annotate: 'تحرير',
    forms: 'تعبئة نماذج',
    convert: 'فصل صفحات',
    security: 'حماية',
    'convert-formats': 'تحويل'
  };

  const quickActions = [
    { tab: 'merge', label: 'دمج', icon: Combine, color: 'blue' },
    { tab: 'split', label: 'تقسيم', icon: Scissors, color: 'purple' },
    { tab: 'pages', label: 'إدارة', icon: Layers, color: 'green' },
    { tab: 'compress', label: 'ضغط', icon: Download, color: 'orange' },
    { tab: 'annotate', label: 'تحرير', icon: Palette, color: 'pink' },
    { tab: 'forms', label: 'نماذج', icon: ScanLine, color: 'indigo' }
  ];

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            الملفات المرفوعة ({files.length})
          </div>
          <Badge className="bg-blue-600 text-white">
            متاحة في جميع التبويبات
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* قائمة الملفات */}
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={file.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(file.id)}
                className="h-7 w-7"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </Button>
            </div>
          ))}
        </div>

        {/* إجراءات سريعة */}
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-600 mb-2 font-medium">الانتقال السريع:</p>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.filter(action => action.tab !== currentTab).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.tab}
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTo(action.tab)}
                  className="gap-1 text-xs h-8"
                >
                  <Icon className="w-3 h-3" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}