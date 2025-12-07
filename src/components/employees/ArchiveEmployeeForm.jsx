import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Save, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SmartDateInput from '@/components/ui/smart-date-input';

const archiveTypeOptions = [
  { value: 'retired', label: 'متقاعد', description: 'بلوغ سن التقاعد أو التقاعد المبكر' },
  { value: 'resigned', label: 'مستقيل', description: 'تقدم بطلب استقالة' },
  { value: 'terminated', label: 'منهى العقد', description: 'إنهاء العقد من قبل الإدارة' },
  { value: 'contract_not_renewed', label: 'عدم تجديد العقد', description: 'انتهاء مدة العقد دون تجديد' },
  { value: 'transferred', label: 'منقول', description: 'نقل إلى جهة عمل أخرى' }
];

export default function ArchiveEmployeeForm({ employees, onSubmit, onCancel }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    archive_type: '',
    archive_date: new Date().toISOString().split('T')[0],
    archive_reason: '',
    new_workplace: '',
    notes: ''
  });
  const [searchOpen, setSearchOpen] = useState(false);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSearchOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      alert('يرجى اختيار موظف للأرشفة');
      return;
    }
    if (!formData.archive_type) {
      alert('يرجى تحديد نوع الأرشفة');
      return;
    }
    
    onSubmit({
      ...formData,
      archived_by: 'المستخدم الحالي' // يمكن تحسين هذا لاحقاً
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>اختيار الموظف *</Label>
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Search className="w-4 h-4 ml-2" />
              {selectedEmployee ? selectedEmployee.full_name_arabic : 'ابحث عن موظف...'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="ابحث بالاسم أو رقم الموظف..." />
              <CommandEmpty>لم يتم العثور على موظف.</CommandEmpty>
              <CommandGroup>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    onSelect={() => handleEmployeeSelect(employee)}
                  >
                    <div>
                      <div className="font-medium">{employee.full_name_arabic}</div>
                      <div className="text-sm text-gray-500">
                        {employee.رقم_الموظف} - {employee.position} - {employee.المركز_الصحي}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {selectedEmployee && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm">
              <p><strong>الاسم:</strong> {selectedEmployee.full_name_arabic}</p>
              <p><strong>رقم الموظف:</strong> {selectedEmployee.رقم_الموظف}</p>
              <p><strong>المنصب:</strong> {selectedEmployee.position}</p>
              <p><strong>المركز:</strong> {selectedEmployee.المركز_الصحي}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="archive_type">نوع الأرشفة *</Label>
        <Select value={formData.archive_type} onValueChange={(value) => handleChange('archive_type', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الأرشفة..." />
          </SelectTrigger>
          <SelectContent>
            {archiveTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SmartDateInput
        label="تاريخ الأرشفة"
        value={formData.archive_date}
        onChange={(value) => handleChange('archive_date', value)}
        required
      />

      <div>
        <Label htmlFor="archive_reason">سبب الأرشفة</Label>
        <Textarea
          id="archive_reason"
          value={formData.archive_reason}
          onChange={(e) => handleChange('archive_reason', e.target.value)}
          placeholder="اذكر سبب الأرشفة بالتفصيل..."
          rows={3}
        />
      </div>

      {formData.archive_type === 'transferred' && (
        <div>
          <Label htmlFor="new_workplace">مكان العمل الجديد *</Label>
          <Input
            id="new_workplace"
            value={formData.new_workplace}
            onChange={(e) => handleChange('new_workplace', e.target.value)}
            placeholder="اسم الجهة أو المؤسسة الجديدة..."
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="notes">ملاحظات إضافية</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="أي ملاحظات أخرى..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 ml-2" />
          إلغاء
        </Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          <Save className="w-4 h-4 ml-2" />
          أرشفة الموظف
        </Button>
      </div>
    </form>
  );
}