import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, FolderOpen, Trash2, Star, Edit, Plus, Copy, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TemplateStyleManager({ 
  templateType = 'flexible',
  currentStyleData,
  onLoadStyle,
  onSyncToOtherTemplate
}) {
  const [styles, setStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleDescription, setNewStyleDescription] = useState('');
  const [editingStyle, setEditingStyle] = useState(null);

  useEffect(() => {
    loadStyles();
  }, [templateType]);

  const loadStyles = async () => {
    setIsLoading(true);
    try {
      const allStyles = await base44.entities.AssignmentTemplateStyle.filter({ template_type: templateType });
      setStyles(Array.isArray(allStyles) ? allStyles : []);
    } catch (error) {
      console.error('Failed to load styles:', error);
      setStyles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStyle = async () => {
    if (!newStyleName.trim()) {
      alert('يرجى إدخال اسم للنمط');
      return;
    }

    try {
      if (editingStyle) {
        // تحديث نمط موجود
        await base44.entities.AssignmentTemplateStyle.update(editingStyle.id, {
          name: newStyleName,
          description: newStyleDescription,
          style_data: JSON.stringify(currentStyleData)
        });
        alert('✅ تم تحديث النمط بنجاح');
      } else {
        // إنشاء نمط جديد
        await base44.entities.AssignmentTemplateStyle.create({
          name: newStyleName,
          description: newStyleDescription,
          template_type: templateType,
          style_data: JSON.stringify(currentStyleData),
          is_default: false
        });
        alert('✅ تم حفظ النمط بنجاح');
      }
      
      setShowSaveDialog(false);
      setNewStyleName('');
      setNewStyleDescription('');
      setEditingStyle(null);
      loadStyles();
    } catch (error) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  const handleLoadStyle = (style) => {
    try {
      const styleData = JSON.parse(style.style_data);
      onLoadStyle(styleData);
      alert(`✅ تم تحميل النمط: ${style.name}`);
    } catch (error) {
      alert('فشل في تحميل النمط: ' + error.message);
    }
  };

  const handleDeleteStyle = async (style) => {
    if (!confirm(`هل أنت متأكد من حذف النمط "${style.name}"؟`)) return;
    
    try {
      await base44.entities.AssignmentTemplateStyle.delete(style.id);
      alert('تم حذف النمط');
      loadStyles();
    } catch (error) {
      alert('فشل في الحذف: ' + error.message);
    }
  };

  const handleSetDefault = async (style) => {
    try {
      // إلغاء الافتراضي من جميع الأنماط الأخرى
      for (const s of styles) {
        if (s.is_default && s.id !== style.id) {
          await base44.entities.AssignmentTemplateStyle.update(s.id, { is_default: false });
        }
      }
      // تعيين هذا النمط كافتراضي
      await base44.entities.AssignmentTemplateStyle.update(style.id, { is_default: true });
      alert(`✅ تم تعيين "${style.name}" كنمط افتراضي`);
      loadStyles();
    } catch (error) {
      alert('فشل في التعيين: ' + error.message);
    }
  };

  const handleDuplicateStyle = async (style) => {
    try {
      await base44.entities.AssignmentTemplateStyle.create({
        name: `${style.name} (نسخة)`,
        description: style.description,
        template_type: style.template_type,
        style_data: style.style_data,
        is_default: false
      });
      alert('✅ تم نسخ النمط');
      loadStyles();
    } catch (error) {
      alert('فشل في النسخ: ' + error.message);
    }
  };

  const handleSyncToOther = async (style) => {
    try {
      const styleData = JSON.parse(style.style_data);
      const otherType = templateType === 'flexible' ? 'standard' : 'flexible';
      
      await base44.entities.AssignmentTemplateStyle.create({
        name: `${style.name} (${otherType === 'standard' ? 'قياسي' : 'مرن'})`,
        description: `منسوخ من النمط ${templateType === 'flexible' ? 'المرن' : 'القياسي'}`,
        template_type: otherType,
        style_data: style.style_data,
        is_default: false
      });
      
      alert(`✅ تم نسخ النمط إلى القالب ${otherType === 'standard' ? 'القياسي' : 'المرن'}`);
    } catch (error) {
      alert('فشل في النسخ: ' + error.message);
    }
  };

  const defaultStyle = styles.find(s => s.is_default);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* زر تحميل نمط */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <FolderOpen className="w-3 h-3" />
              تحميل نمط
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {isLoading ? (
              <DropdownMenuItem disabled>جاري التحميل...</DropdownMenuItem>
            ) : styles.length === 0 ? (
              <DropdownMenuItem disabled>لا توجد أنماط محفوظة</DropdownMenuItem>
            ) : (
              <>
                {styles.map((style) => (
                  <DropdownMenuItem 
                    key={style.id} 
                    onClick={() => handleLoadStyle(style)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {style.is_default && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      <span>{style.name}</span>
                    </div>
                    <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowManageDialog(true)}>
                  <Edit className="w-3 h-3 ml-2" />
                  إدارة الأنماط
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* زر حفظ نمط جديد */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
            setEditingStyle(null);
            setNewStyleName('');
            setNewStyleDescription('');
            setShowSaveDialog(true);
          }}
          className="h-8 text-xs gap-1"
        >
          <Plus className="w-3 h-3" />
          حفظ كنمط جديد
        </Button>

        {/* النمط الافتراضي الحالي */}
        {defaultStyle && (
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 ml-1 text-yellow-500 fill-yellow-500" />
            الافتراضي: {defaultStyle.name}
          </Badge>
        )}
      </div>

      {/* حوار حفظ النمط */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingStyle ? 'تحديث النمط' : 'حفظ نمط جديد'}</DialogTitle>
            <DialogDescription>
              {templateType === 'flexible' ? 'نمط للقالب المرن' : 'نمط للقالب القياسي'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>اسم النمط *</Label>
              <Input
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                placeholder="مثال: نمط التكاليف الرسمية"
                className="mt-1"
              />
            </div>
            <div>
              <Label>وصف (اختياري)</Label>
              <Textarea
                value={newStyleDescription}
                onChange={(e) => setNewStyleDescription(e.target.value)}
                placeholder="وصف مختصر للنمط..."
                className="mt-1 h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveStyle}>
              <Save className="w-4 h-4 ml-2" />
              {editingStyle ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار إدارة الأنماط */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إدارة أنماط {templateType === 'flexible' ? 'القالب المرن' : 'القالب القياسي'}</DialogTitle>
            <DialogDescription>
              تعديل وحذف ونسخ الأنماط المحفوظة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {styles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد أنماط محفوظة بعد
              </div>
            ) : (
              styles.map((style) => (
                <div 
                  key={style.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {style.is_default && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      <span className="font-medium">{style.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {style.template_type === 'flexible' ? 'مرن' : 'قياسي'}
                      </Badge>
                    </div>
                    {style.description && (
                      <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoadStyle(style)}
                      title="تحميل"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingStyle(style);
                        setNewStyleName(style.name);
                        setNewStyleDescription(style.description || '');
                        setShowManageDialog(false);
                        setShowSaveDialog(true);
                      }}
                      title="تحديث بالإعدادات الحالية"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicateStyle(style)}
                      title="نسخ"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSyncToOther(style)}
                      title={`نسخ إلى القالب ${templateType === 'flexible' ? 'القياسي' : 'المرن'}`}
                    >
                      🔄
                    </Button>
                    {!style.is_default && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetDefault(style)}
                        title="تعيين كافتراضي"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStyle(style)}
                      className="text-red-500 hover:text-red-700"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}