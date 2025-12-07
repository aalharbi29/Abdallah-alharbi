import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2, Archive, FileText, Briefcase, FileCheck, Users, Box, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ArchivedFile } from '@/entities/ArchivedFile';
import { FormTemplate } from '@/entities/FormTemplate';
import { Alert, AlertDescription } from '@/components/ui/alert';

const systemTypes = {
  archive: { name: 'الأرشيف', icon: Archive },
  forms: { name: 'النماذج', icon: FileText },
  assignments: { name: 'التكاليف', icon: Briefcase }
};

const archiveCategories = {
  circulars: { name: 'التعاميم المنظمة', icon: FileText },
  inventory: { name: 'ملفات الحصر', icon: Box },
  assignments: { name: 'التكاليف', icon: Briefcase },
  other: { name: 'ملفات أخرى', icon: FileText }
};

const archiveSubCategories = {
  policies_procedures: { name: 'نماذج السياسات والإجراءات', icon: FileCheck },
  human_resources: { name: 'حصر بشري', icon: Users },
  fixed_assets: { name: 'حصر أصول ثابتة', icon: Box },
  equipment: { name: 'حصر أجهزة', icon: Wrench }
};

const formCategories = [
  { value: 'leaves', label: 'نماذج الإجازات' },
  { value: 'assignments', label: 'نماذج التكاليف' },
  { value: 'epidemiology', label: 'نماذج الاستقصاء الوبائي' },
  { value: 'statistics', label: 'نماذج الإحصائيات' },
  { value: 'contract_renewal', label: 'نماذج تجديد العقد' },
  { value: 'additional', label: 'نماذج إضافية' }
];

export default function FileMover({ file, currentSystem, isOpen, onClose, onSuccess }) {
  const [targetSystem, setTargetSystem] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [targetSubCategory, setTargetSubCategory] = useState('');
  const [title, setTitle] = useState(file?.title || '');
  const [description, setDescription] = useState(file?.description || '');
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');

  if (!file) return null;

  const handleMove = async () => {
    if (!targetSystem) {
      setError('يرجى اختيار النظام المستهدف');
      return;
    }

    if (targetSystem === 'archive' && !targetCategory) {
      setError('يرجى اختيار الفئة في الأرشيف');
      return;
    }

    if (targetSystem === 'forms' && !targetCategory) {
      setError('يرجى اختيار نوع النموذج');
      return;
    }

    if (!title.trim()) {
      setError('يرجى إدخال العنوان');
      return;
    }

    setIsMoving(true);
    setError('');

    try {
      // Create in target system
      if (targetSystem === 'archive') {
        await ArchivedFile.create({
          title: title,
          description: description || file.description || '',
          category: targetCategory,
          sub_category: targetSubCategory || '',
          file_url: file.file_url,
          file_name: file.file_name,
          tags: file.tags || []
        });
      } else if (targetSystem === 'forms') {
        await FormTemplate.create({
          title: title,
          description: description || file.description || '',
          category: targetCategory,
          file_url: file.file_url,
          file_name: file.file_name
        });
      }

      // Delete from current system
      if (currentSystem === 'archive') {
        await ArchivedFile.delete(file.id);
      } else if (currentSystem === 'forms') {
        await FormTemplate.delete(file.id);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error moving file:', err);
      setError('فشل نقل الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsMoving(false);
    }
  };

  const CurrentIcon = systemTypes[currentSystem]?.icon || Archive;
  const TargetIcon = targetSystem ? systemTypes[targetSystem]?.icon : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            نقل الملف
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Location */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Label className="text-sm text-blue-700 mb-2 block">الموقع الحالي</Label>
            <div className="flex items-center gap-2">
              <CurrentIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{systemTypes[currentSystem]?.name}</span>
              {file.category && (
                <>
                  <span className="text-blue-400">←</span>
                  <Badge variant="secondary">{archiveCategories[file.category]?.name || formCategories.find(c => c.value === file.category)?.label || file.category}</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-blue-700 mt-2 truncate">{file.title}</p>
          </div>

          {/* Target System */}
          <div>
            <Label htmlFor="target-system">النظام المستهدف *</Label>
            <Select value={targetSystem} onValueChange={(val) => { setTargetSystem(val); setTargetCategory(''); setTargetSubCategory(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر النظام..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(systemTypes)
                  .filter(([key]) => key !== currentSystem)
                  .map(([key, data]) => {
                    const Icon = data.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {data.name}
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* Archive Category */}
          {targetSystem === 'archive' && (
            <>
              <div>
                <Label htmlFor="archive-category">الفئة في الأرشيف *</Label>
                <Select value={targetCategory} onValueChange={(val) => { setTargetCategory(val); setTargetSubCategory(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(archiveCategories).map(([key, data]) => {
                      const Icon = data.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {data.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Category for circulars and inventory */}
              {(targetCategory === 'circulars' || targetCategory === 'inventory') && (
                <div>
                  <Label htmlFor="archive-sub-category">الفئة الفرعية (اختياري)</Label>
                  <Select value={targetSubCategory} onValueChange={setTargetSubCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة الفرعية..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>بدون فئة فرعية</SelectItem>
                      {targetCategory === 'circulars' && (
                        <SelectItem value="policies_procedures">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            نماذج السياسات والإجراءات
                          </div>
                        </SelectItem>
                      )}
                      {targetCategory === 'inventory' && (
                        <>
                          <SelectItem value="human_resources">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              حصر بشري
                            </div>
                          </SelectItem>
                          <SelectItem value="fixed_assets">
                            <div className="flex items-center gap-2">
                              <Box className="w-4 h-4" />
                              حصر أصول ثابتة
                            </div>
                          </SelectItem>
                          <SelectItem value="equipment">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4" />
                              حصر أجهزة
                            </div>
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Form Category */}
          {targetSystem === 'forms' && (
            <div>
              <Label htmlFor="form-category">نوع النموذج *</Label>
              <Select value={targetCategory} onValueChange={setTargetCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع النموذج..." />
                </SelectTrigger>
                <SelectContent>
                  {formCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">العنوان *</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="عنوان الملف..."
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="وصف الملف..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Preview */}
          {targetSystem && TargetIcon && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <Label className="text-sm text-green-700 mb-2 block">سيتم النقل إلى</Label>
              <div className="flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">{systemTypes[targetSystem]?.name}</span>
                {targetCategory && (
                  <>
                    <span className="text-green-400">←</span>
                    <Badge className="bg-green-100 text-green-800">
                      {targetSystem === 'archive' 
                        ? archiveCategories[targetCategory]?.name 
                        : formCategories.find(c => c.value === targetCategory)?.label}
                    </Badge>
                  </>
                )}
                {targetSubCategory && (
                  <>
                    <span className="text-green-400">←</span>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {archiveSubCategories[targetSubCategory]?.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMoving}>
            إلغاء
          </Button>
          <Button onClick={handleMove} disabled={isMoving}>
            {isMoving ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري النقل...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 ml-2" />
                نقل الملف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}