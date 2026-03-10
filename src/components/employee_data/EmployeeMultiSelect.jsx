import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, X, Check, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const HEALTH_CENTERS = [
  'ادارة شؤون المراكز بالحسو', 'الحسو', 'هدبان', 'صخيبرة', 'طلال', 'الماوية', 'بلغة', 'الهميج', 'بطحي'
];

export default function EmployeeMultiSelect({ employees, selectedEmployees, onSelectionChange, assignmentCenters, onAssignmentCenterChange }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [centerFilter, setCenterFilter] = useState('all');
  const [tempSelected, setTempSelected] = useState([]);
  const [tempAssignCenters, setTempAssignCenters] = useState({});

  const openDialog = () => {
    setTempSelected(selectedEmployees.map(e => e.id));
    setTempAssignCenters(assignmentCenters || {});
    setSearchQuery('');
    setCenterFilter('all');
    setOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    let list = employees;
    
    if (centerFilter && centerFilter !== 'all') {
      list = list.filter(emp => {
        const center = emp.المركز_الصحي || '';
        return center === centerFilter || center.includes(centerFilter) || centerFilter.includes(center);
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(emp =>
        emp.full_name_arabic?.toLowerCase().includes(query) ||
        emp.رقم_الموظف?.includes(query) ||
        emp.رقم_الهوية?.includes(query) ||
        emp.position?.toLowerCase().includes(query)
      );
    }
    
    return list;
  }, [employees, searchQuery, centerFilter]);

  const toggleEmployee = (empId) => {
    setTempSelected(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredEmployees.map(e => e.id);
    setTempSelected(prev => {
      const newSet = new Set(prev);
      filteredIds.forEach(id => newSet.add(id));
      return Array.from(newSet);
    });
  };

  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredEmployees.map(e => e.id));
    setTempSelected(prev => prev.filter(id => !filteredIds.has(id)));
  };

  const confirmSelection = () => {
    const selected = employees.filter(e => tempSelected.includes(e.id));
    onSelectionChange(selected);
    if (onAssignmentCenterChange) {
      onAssignmentCenterChange(tempAssignCenters);
    }
    setOpen(false);
  };

  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every(e => tempSelected.includes(e.id));
  const someFilteredSelected = filteredEmployees.some(e => tempSelected.includes(e.id));

  // إحصائيات حسب المركز
  const centerCounts = useMemo(() => {
    const counts = {};
    employees.forEach(emp => {
      const center = emp.المركز_الصحي || '';
      HEALTH_CENTERS.forEach(hc => {
        if (center === hc || center.includes(hc) || hc.includes(center)) {
          counts[hc] = (counts[hc] || 0) + 1;
        }
      });
    });
    return counts;
  }, [employees]);

  return (
    <>
      <Button
        variant="outline"
        onClick={openDialog}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          {selectedEmployees.length > 0
            ? `تم اختيار ${selectedEmployees.length} موظف`
            : "اختر الموظفين..."}
        </span>
        {selectedEmployees.length > 0 && (
          <Badge variant="secondary" className="text-xs">{selectedEmployees.length}</Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              اختيار الموظفين
              {tempSelected.length > 0 && (
                <Badge className="bg-blue-600 mr-2">{tempSelected.length} محدد</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-4 space-y-3">
            {/* فلاتر البحث */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ابحث بالاسم أو الرقم الوظيفي أو التخصص..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={centerFilter} onValueChange={setCenterFilter}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="w-4 h-4 ml-1" />
                  <SelectValue placeholder="كل المراكز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المراكز ({employees.length})</SelectItem>
                  {HEALTH_CENTERS.map(center => (
                    <SelectItem key={center} value={center}>
                      {center} ({centerCounts[center] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* أزرار تحديد الكل */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={allFilteredSelected ? deselectAllFiltered : selectAllFiltered}
                  className="text-xs h-7 gap-1"
                >
                  {allFilteredSelected ? (
                    <><X className="w-3 h-3" /> إلغاء تحديد الظاهرين</>
                  ) : (
                    <><Check className="w-3 h-3" /> تحديد الكل ({filteredEmployees.length})</>
                  )}
                </Button>
                {tempSelected.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTempSelected([])}
                    className="text-xs h-7 text-red-500 hover:text-red-600 gap-1"
                  >
                    <X className="w-3 h-3" /> مسح الكل
                  </Button>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {filteredEmployees.length} نتيجة
              </span>
            </div>
          </div>

          {/* قائمة الموظفين */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0" style={{ maxHeight: '400px' }}>
            <div className="space-y-0.5">
              {filteredEmployees.map((emp) => {
                const isSelected = tempSelected.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmployee(emp.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleEmployee(emp.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{emp.full_name_arabic}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span>{emp.رقم_الموظف}</span>
                        <span>•</span>
                        <span>{emp.position || '-'}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {emp.المركز_الصحي || '-'}
                    </Badge>
                    {isSelected && onAssignmentCenterChange && (
                      <Select
                        value={tempAssignCenters[emp.id] || ''}
                        onValueChange={(val) => {
                          setTempAssignCenters(prev => ({ ...prev, [emp.id]: val }));
                        }}
                      >
                        <SelectTrigger 
                          className="w-[120px] h-7 text-xs shrink-0" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue placeholder="المركز المكلف" />
                        </SelectTrigger>
                        <SelectContent>
                          {HEALTH_CENTERS.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا يوجد نتائج</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-600">
                {tempSelected.length > 0
                  ? `تم تحديد ${tempSelected.length} موظف`
                  : 'لم يتم تحديد أي موظف'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button onClick={confirmSelection} className="bg-blue-600 hover:bg-blue-700 gap-1">
                  <Check className="w-4 h-4" />
                  تأكيد ({tempSelected.length})
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}