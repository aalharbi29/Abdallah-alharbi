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
      let otherType;
      if (templateType === 'flexible') otherType = 'standard';
      else if (templateType === 'standard') otherType = 'flexible';
      else otherType = 'standard'; // multiple -> standard
      
      const typeNames = { standard: 'قياسي', flexible: 'مرن', multiple: 'متعدد' };
      
      await base44.entities.AssignmentTemplateStyle.create({
        name: `${style.name} (${typeNames[otherType]})`,
        description: `منسوخ من النمط ${typeNames[templateType]}`,
        template_type: otherType,
        style_data: style.style_data,
        is_default: false
      });
      
      alert(`✅ تم نسخ النمط إلى القالب ${typeNames[otherType]}`);
    } catch (error) {
      alert('فشل في النسخ: ' + error.message);
    }
  };

  const defaultStyle = styles.find(s => s.is_default);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
        {/* زر تحميل نمط */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 md:h-8 text-[10px] md:text-xs gap-1 px-2">
              <FolderOpen className="w-3 h-3" />
              <span className="hidden sm:inline">تحميل</span> نمط
              <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 md:w-64">
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
                    className="flex items-center justify-between text-xs md:text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {style.is_default && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      <span className="truncate max-w-[150px]">{style.name}</span>
                    </div>
                    <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowManageDialog(true)} className="text-xs md:text-sm">
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
          className="h-7 md:h-8 text-[10px] md:text-xs gap-1 px-2"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">حفظ</span> جديد
        </Button>

        {/* النمط الافتراضي الحالي */}
        {defaultStyle && (
          <Badge variant="secondary" className="text-[9px] md:text-xs hidden sm:flex">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 ml-1 text-yellow-500 fill-yellow-500" />
            <span className="truncate max-w-[80px]">{defaultStyle.name}</span>
          </Badge>
        )}
      </div>

      {/* حوار حفظ النمط */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent dir="rtl" className="max-w-[95vw] md:max-w-md mx-2 p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm md:text-base">{editingStyle ? 'تحديث النمط' : 'حفظ نمط جديد'}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {templateType === 'flexible' ? 'نمط للقالب المرن' : templateType === 'multiple' ? 'نمط للتكليف المتعدد' : 'نمط للقالب القياسي'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 py-3 md:py-4">
            <div>
              <Label className="text-xs md:text-sm">اسم النمط *</Label>
              <Input
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                placeholder="مثال: نمط التكاليف الرسمية"
                className="mt-1 h-8 md:h-10 text-xs md:text-sm"
              />
            </div>
            <div>
              <Label className="text-xs md:text-sm">وصف (اختياري)</Label>
              <Textarea
                value={newStyleDescription}
                onChange={(e) => setNewStyleDescription(e.target.value)}
                placeholder="وصف مختصر للنمط..."
                className="mt-1 h-16 md:h-20 text-xs md:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="h-8 md:h-10 text-xs md:text-sm">
              إلغاء
            </Button>
            <Button onClick={handleSaveStyle} className="h-8 md:h-10 text-xs md:text-sm">
              <Save className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              {editingStyle ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار إدارة الأنماط */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent dir="rtl" className="max-w-[95vw] md:max-w-2xl max-h-[80vh] overflow-y-auto mx-2 p-3 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-sm md:text-base">إدارة أنماط {templateType === 'flexible' ? 'القالب المرن' : templateType === 'multiple' ? 'التكليف المتعدد' : 'القالب القياسي'}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              تعديل وحذف ونسخ الأنماط
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 md:space-y-3 py-3 md:py-4">
            {styles.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-gray-500 text-xs md:text-sm">
                لا توجد أنماط محفوظة بعد
              </div>
            ) : (
              styles.map((style) => (
                <div 
                  key={style.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg border gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                      {style.is_default && <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />}
                      <span className="font-medium text-xs md:text-sm truncate">{style.name}</span>
                      <Badge variant="outline" className="text-[9px] md:text-xs">
                        {style.template_type === 'flexible' ? 'مرن' : style.template_type === 'multiple' ? 'متعدد' : 'قياسي'}
                      </Badge>
                    </div>
                    {style.description && (
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1 truncate">{style.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-0.5 md:gap-1 flex-wrap justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoadStyle(style)}
                      title="تحميل"
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <FolderOpen className="w-3 h-3 md:w-4 md:h-4" />
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
                      title="تحديث"
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicateStyle(style)}
                      title="نسخ"
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                    >
                      <Copy className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    {templateType !== 'multiple' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSyncToOther(style)}
                        title={`نسخ إلى القالب ${templateType === 'flexible' ? 'القياسي' : 'المرن'}`}
                        className="h-7 w-7 md:h-8 md:w-8 p-0 text-xs"
                      >
                        🔄
                      </Button>
                    )}
                    {!style.is_default && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetDefault(style)}
                        title="تعيين كافتراضي"
                        className="h-7 w-7 md:h-8 md:w-8 p-0"
                      >
                        <Star className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStyle(style)}
                      className="text-red-500 hover:text-red-700 h-7 w-7 md:h-8 md:w-8 p-0"
                      title="حذف"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)} className="h-8 md:h-10 text-xs md:text-sm">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}