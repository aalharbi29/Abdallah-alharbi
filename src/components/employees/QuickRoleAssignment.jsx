import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Briefcase, ShieldCheck, Save, Loader2, X, Plus, Search } from "lucide-react";
import { Employee } from "@/entities/Employee";

const specialRolesOptions = [
  { key: "مدير مركز", label: "مدير مركز" },
  { key: "نائب مدير", label: "نائب مدير" },
  { key: "مشرف فني", label: "مشرف فني" },
  { key: "مشرف تمريض", label: "مشرف تمريض" },
  { key: "مشرف الجودة", label: "مشرف الجودة" },
  { key: "مشرف الأمن والسلامة", label: "مشرف الأمن والسلامة" },
  { key: "مشرف مكافحة العدوى", label: "مشرف مكافحة العدوى" },
  { key: "منسق مكافحة العدوى", label: "منسق مكافحة العدوى" },
  { key: "منسق الصحة المدرسية", label: "منسق الصحة المدرسية" },
  { key: "مشرف الصحة المدرسية", label: "مشرف الصحة المدرسية" },
  { key: "مشرف الطب الوقائي", label: "مشرف الطب الوقائي" },
  { key: "منسق الجودة", label: "منسق الجودة" },
  { key: "مراقب صحي", label: "مراقب صحي" },
  { key: "مدرب صحي", label: "مدرب صحي" },
];

const assignedTasksOptions = [
  // الفريق الطبي
  { key: "منسق الفريق الطبي", label: "منسق الفريق الطبي", category: "الفريق الطبي" },
  { key: "نائب منسق الفريق الطبي", label: "نائب منسق الفريق الطبي", category: "الفريق الطبي" },
  { key: "عضو الفريق الطبي", label: "عضو الفريق الطبي", category: "الفريق الطبي" },
  // مكافحة العدوى
  { key: "منسق مكافحة العدوى", label: "منسق مكافحة العدوى", category: "مكافحة العدوى" },
  { key: "نائب منسق مكافحة العدوى", label: "نائب منسق مكافحة العدوى", category: "مكافحة العدوى" },
  { key: "عضو فريق مكافحة العدوى", label: "عضو فريق مكافحة العدوى", category: "مكافحة العدوى" },
  // الصحة المدرسية
  { key: "منسق الصحة المدرسية", label: "منسق الصحة المدرسية", category: "الصحة المدرسية" },
  { key: "نائب منسق الصحة المدرسية", label: "نائب منسق الصحة المدرسية", category: "الصحة المدرسية" },
  { key: "عضو فريق الصحة المدرسية", label: "عضو فريق الصحة المدرسية", category: "الصحة المدرسية" },
  // المدرب الصحي
  { key: "مدرب صحي", label: "مدرب صحي", category: "المدرب الصحي" },
  { key: "منسق المدرب الصحي", label: "منسق المدرب الصحي", category: "المدرب الصحي" },
  { key: "مشرف المدرب الصحي بالمركز", label: "مشرف المدرب الصحي بالمركز", category: "المدرب الصحي" },
  // المراقبة الصحية
  { key: "مراقب صحي", label: "مراقب صحي", category: "المراقبة الصحية" },
  { key: "منسق فريق المراقب الصحي", label: "منسق فريق المراقب الصحي", category: "المراقبة الصحية" },
  { key: "عضو فريق المراقب الصحي", label: "عضو فريق المراقب الصحي", category: "المراقبة الصحية" },
  // الجودة والسلامة
  { key: "منسق الجودة", label: "منسق الجودة", category: "الجودة والسلامة" },
  { key: "منسق الأمن والسلامة", label: "منسق الأمن والسلامة", category: "الجودة والسلامة" },
  { key: "عضو فريق الجودة", label: "عضو فريق الجودة", category: "الجودة والسلامة" },
  // العيادات
  { key: "عيادة الأمراض المزمنة", label: "عيادة الأمراض المزمنة", category: "العيادات" },
  { key: "عيادة الفرز", label: "عيادة الفرز", category: "العيادات" },
  { key: "عيادة التطعيمات", label: "عيادة التطعيمات", category: "العيادات" },
  { key: "عيادة رعاية الحوامل", label: "عيادة رعاية الحوامل", category: "العيادات" },
  { key: "عيادة الطفل السليم", label: "عيادة الطفل السليم", category: "العيادات" },
  { key: "عيادة الأسنان", label: "عيادة الأسنان", category: "العيادات" },
  // أخرى
  { key: "الاستقبال والتسجيل", label: "الاستقبال والتسجيل", category: "أخرى" },
  { key: "الصيدلية", label: "الصيدلية", category: "أخرى" },
  { key: "المختبر", label: "المختبر", category: "أخرى" },
  { key: "الأشعة", label: "الأشعة", category: "أخرى" },
  { key: "غرفة الإجراءات", label: "غرفة الإجراءات", category: "أخرى" },
  { key: "الطوارئ", label: "الطوارئ", category: "أخرى" },
];

export default function QuickRoleAssignment({ employee, open, onOpenChange, onSuccess }) {
  const [selectedRoles, setSelectedRoles] = useState(employee?.special_roles || []);
  const [selectedTasks, setSelectedTasks] = useState(employee?.assigned_tasks || []);
  const [customRole, setCustomRole] = useState('');
  const [customTask, setCustomTask] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (employee) {
      setSelectedRoles(employee.special_roles || []);
      setSelectedTasks(employee.assigned_tasks || []);
    }
  }, [employee]);

  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleTask = (task) => {
    setSelectedTasks(prev => 
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const addCustomRole = () => {
    if (customRole.trim() && !selectedRoles.includes(customRole.trim())) {
      setSelectedRoles(prev => [...prev, customRole.trim()]);
      setCustomRole('');
    }
  };

  const addCustomTask = () => {
    if (customTask.trim() && !selectedTasks.includes(customTask.trim())) {
      setSelectedTasks(prev => [...prev, customTask.trim()]);
      setCustomTask('');
    }
  };

  const handleSave = async () => {
    if (!employee?.id) return;
    
    setIsSaving(true);
    try {
      await Employee.update(employee.id, {
        special_roles: selectedRoles,
        assigned_tasks: selectedTasks
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving roles:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTasks = searchQuery 
    ? assignedTasksOptions.filter(t => t.label.includes(searchQuery) || t.category.includes(searchQuery))
    : assignedTasksOptions;

  const categories = [...new Set(filteredTasks.map(t => t.category))];

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            إضافة أدوار ومهام للموظف
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-1">
            {employee.full_name_arabic} - {employee.position}
          </div>
        </DialogHeader>

        <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks" className="gap-2">
              <Briefcase className="w-4 h-4" />
              المهام المكلف بها
              {selectedTasks.length > 0 && (
                <Badge className="bg-blue-600 text-white text-xs">{selectedTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              الأدوار الإشرافية
              {selectedRoles.length > 0 && (
                <Badge className="bg-green-600 text-white text-xs">{selectedRoles.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="flex-1 overflow-hidden flex flex-col mt-4 min-h-0">
            {/* المهام المحددة */}
            <div className="mb-3">
              <Label className="text-sm font-medium mb-2 block">المهام المحددة:</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-lg min-h-[40px] border border-blue-200">
                {selectedTasks.length > 0 ? (
                  selectedTasks.map(task => (
                    <Badge key={task} className="bg-blue-600 text-white flex items-center gap-1">
                      {task}
                      <button onClick={() => toggleTask(task)} className="hover:bg-blue-700 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">لا توجد مهام محددة</span>
                )}
              </div>
            </div>

            {/* البحث */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن مهمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* قائمة المهام */}
            <ScrollArea className="flex-1 border rounded-lg p-3 min-h-[200px]" style={{ maxHeight: 'calc(100% - 150px)' }}>
              {categories.map(category => (
                <div key={category} className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2 bg-gray-100 px-2 py-1 rounded">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredTasks
                      .filter(t => t.category === category)
                      .map(task => (
                        <label
                          key={task.key}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                            selectedTasks.includes(task.key) 
                              ? 'bg-blue-100 border-blue-400' 
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Checkbox
                            checked={selectedTasks.includes(task.key)}
                            onCheckedChange={() => toggleTask(task.key)}
                          />
                          <span className="text-sm">{task.label}</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* إضافة مهمة مخصصة */}
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="أدخل مهمة مخصصة..."
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
              />
              <Button onClick={addCustomTask} disabled={!customTask.trim()} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="flex-1 overflow-hidden flex flex-col mt-4 min-h-0">
            {/* الأدوار المحددة */}
            <div className="mb-3">
              <Label className="text-sm font-medium mb-2 block">الأدوار المحددة:</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-green-50 rounded-lg min-h-[40px] border border-green-200">
                {selectedRoles.length > 0 ? (
                  selectedRoles.map(role => (
                    <Badge key={role} className="bg-green-600 text-white flex items-center gap-1">
                      {role}
                      <button onClick={() => toggleRole(role)} className="hover:bg-green-700 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">لا توجد أدوار محددة</span>
                )}
              </div>
            </div>

            {/* قائمة الأدوار */}
            <ScrollArea className="flex-1 border rounded-lg p-3 min-h-[200px]" style={{ maxHeight: 'calc(100% - 100px)' }}>
              <div className="grid grid-cols-2 gap-2">
                {specialRolesOptions.map(role => (
                  <label
                    key={role.key}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                      selectedRoles.includes(role.key) 
                        ? 'bg-green-100 border-green-400' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role.key)}
                      onCheckedChange={() => toggleRole(role.key)}
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>

            {/* إضافة دور مخصص */}
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="أدخل دور مخصص..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
              />
              <Button onClick={addCustomRole} disabled={!customRole.trim()} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}