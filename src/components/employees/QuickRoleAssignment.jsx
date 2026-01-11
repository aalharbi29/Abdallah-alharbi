import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Briefcase, ShieldCheck, Save, Loader2, X, Plus, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
  { key: "منسق الفريق الطبي", label: "منسق الفريق الطبي", category: "الفريق الطبي" },
  { key: "نائب منسق الفريق الطبي", label: "نائب منسق الفريق الطبي", category: "الفريق الطبي" },
  { key: "عضو الفريق الطبي", label: "عضو الفريق الطبي", category: "الفريق الطبي" },
  { key: "منسق مكافحة العدوى", label: "منسق مكافحة العدوى", category: "مكافحة العدوى" },
  { key: "نائب منسق مكافحة العدوى", label: "نائب منسق مكافحة العدوى", category: "مكافحة العدوى" },
  { key: "عضو فريق مكافحة العدوى", label: "عضو فريق مكافحة العدوى", category: "مكافحة العدوى" },
  { key: "المقيم الذاتي لبرنامج PHC", label: "المقيم الذاتي لبرنامج PHC", category: "مكافحة العدوى" },
  { key: "منسق الصحة المدرسية", label: "منسق الصحة المدرسية", category: "الصحة المدرسية" },
  { key: "نائب منسق الصحة المدرسية", label: "نائب منسق الصحة المدرسية", category: "الصحة المدرسية" },
  { key: "منسقة الصحة المدرسية", label: "منسقة الصحة المدرسية", category: "الصحة المدرسية" },
  { key: "عضو فريق الصحة المدرسية", label: "عضو فريق الصحة المدرسية", category: "الصحة المدرسية" },
  { key: "مدرب صحي", label: "مدرب صحي", category: "المدرب الصحي" },
  { key: "منسق المدرب الصحي", label: "منسق المدرب الصحي", category: "المدرب الصحي" },
  { key: "مشرف المدرب الصحي بالمركز", label: "مشرف المدرب الصحي بالمركز", category: "المدرب الصحي" },
  { key: "مراقب صحي", label: "مراقب صحي", category: "المراقبة الصحية" },
  { key: "منسق فريق المراقب الصحي", label: "منسق فريق المراقب الصحي", category: "المراقبة الصحية" },
  { key: "عضو فريق المراقب الصحي", label: "عضو فريق المراقب الصحي", category: "المراقبة الصحية" },
  { key: "منسق الجودة", label: "منسق الجودة", category: "الجودة والسلامة" },
  { key: "منسق الأمن والسلامة", label: "منسق الأمن والسلامة", category: "الجودة والسلامة" },
  { key: "عضو فريق الجودة", label: "عضو فريق الجودة", category: "الجودة والسلامة" },
  { key: "عيادة الأمراض المزمنة", label: "عيادة الأمراض المزمنة", category: "العيادات" },
  { key: "عيادة الفرز", label: "عيادة الفرز", category: "العيادات" },
  { key: "عيادة التطعيمات", label: "عيادة التطعيمات", category: "العيادات" },
  { key: "عيادة رعاية الحوامل", label: "عيادة رعاية الحوامل", category: "العيادات" },
  { key: "عيادة الطفل السليم", label: "عيادة الطفل السليم", category: "العيادات" },
  { key: "عيادة الأسنان", label: "عيادة الأسنان", category: "العيادات" },
  { key: "الاستقبال والتسجيل", label: "الاستقبال والتسجيل", category: "أخرى" },
  { key: "الصيدلية", label: "الصيدلية", category: "أخرى" },
  { key: "المختبر", label: "المختبر", category: "أخرى" },
  { key: "الأشعة", label: "الأشعة", category: "أخرى" },
  { key: "غرفة الإجراءات", label: "غرفة الإجراءات", category: "أخرى" },
  { key: "الطوارئ", label: "الطوارئ", category: "أخرى" },
];

export default function QuickRoleAssignment({ employee, open, onOpenChange, onSuccess }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [customRole, setCustomRole] = useState('');
  const [customTask, setCustomTask] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    if (employee && open) {
      setSelectedRoles(employee.special_roles || []);
      setSelectedTasks(employee.assigned_tasks || []);
      setSearchQuery('');
    }
  }, [employee, open]);

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
      await base44.entities.Employee.update(employee.id, {
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            إضافة أدوار ومهام للموظف
          </DialogTitle>
          <div className="text-sm text-gray-600">
            {employee.full_name_arabic} - {employee.position}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
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

            {/* تبويب المهام */}
            <TabsContent value="tasks" className="flex-1 overflow-hidden flex flex-col m-0 data-[state=inactive]:hidden">
              {/* البحث */}
              <div className="relative mb-3 flex-shrink-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن مهمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* قائمة المهام */}
              <div className="flex-1 overflow-y-auto border rounded-lg p-3 mb-3" style={{ maxHeight: '45vh' }}>
                {categories.map(category => (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="text-sm font-semibold text-gray-700 mb-2 bg-gray-100 px-2 py-1 rounded sticky top-0 z-10">
                      {category}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredTasks
                        .filter(t => t.category === category)
                        .map(task => (
                          <label
                            key={task.key}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all text-sm ${
                              selectedTasks.includes(task.key) 
                                ? 'bg-blue-100 border-blue-400' 
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <Checkbox
                              checked={selectedTasks.includes(task.key)}
                              onCheckedChange={() => toggleTask(task.key)}
                            />
                            <span>{task.label}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* المهام المحددة */}
              {selectedTasks.length > 0 && (
                <div className="mb-3 flex-shrink-0">
                  <Label className="text-sm font-medium mb-1 block">المهام المحددة ({selectedTasks.length}):</Label>
                  <div className="flex flex-wrap gap-1 p-2 bg-blue-50 rounded-lg border border-blue-200 max-h-[80px] overflow-y-auto">
                    {selectedTasks.map(task => (
                      <Badge key={task} className="bg-blue-600 text-white flex items-center gap-1 text-xs">
                        {task}
                        <button onClick={() => toggleTask(task)} className="hover:bg-blue-700 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* إضافة مهمة مخصصة */}
              <div className="flex gap-2 flex-shrink-0">
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

            {/* تبويب الأدوار */}
            <TabsContent value="roles" className="flex-1 overflow-hidden flex flex-col m-0 data-[state=inactive]:hidden">
              {/* قائمة الأدوار */}
              <div className="flex-1 overflow-y-auto border rounded-lg p-3 mb-3" style={{ maxHeight: '50vh' }}>
                <div className="grid grid-cols-2 gap-2">
                  {specialRolesOptions.map(role => (
                    <label
                      key={role.key}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all text-sm ${
                        selectedRoles.includes(role.key) 
                          ? 'bg-green-100 border-green-400' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Checkbox
                        checked={selectedRoles.includes(role.key)}
                        onCheckedChange={() => toggleRole(role.key)}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* الأدوار المحددة */}
              {selectedRoles.length > 0 && (
                <div className="mb-3 flex-shrink-0">
                  <Label className="text-sm font-medium mb-1 block">الأدوار المحددة ({selectedRoles.length}):</Label>
                  <div className="flex flex-wrap gap-1 p-2 bg-green-50 rounded-lg border border-green-200 max-h-[80px] overflow-y-auto">
                    {selectedRoles.map(role => (
                      <Badge key={role} className="bg-green-600 text-white flex items-center gap-1 text-xs">
                        {role}
                        <button onClick={() => toggleRole(role)} className="hover:bg-green-700 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* إضافة دور مخصص */}
              <div className="flex gap-2 flex-shrink-0">
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
        </div>

        <DialogFooter className="p-4 pt-2 border-t">
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