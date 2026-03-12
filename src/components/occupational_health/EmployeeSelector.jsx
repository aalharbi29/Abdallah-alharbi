import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EmployeeSelector({ onSelect, label = "اختر الموظف" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-oh'],
    queryFn: () => base44.entities.Employee.list('-created_date', 500),
  });

  const filtered = useMemo(() => {
    if (!search) return employees.slice(0, 50);
    const q = search.toLowerCase();
    return employees.filter(e =>
      e.full_name_arabic?.toLowerCase().includes(q) ||
      e.رقم_الموظف?.includes(q) ||
      e.رقم_الهوية?.includes(q)
    ).slice(0, 50);
  }, [employees, search]);

  const handleSelect = (emp) => {
    onSelect({
      name: emp.full_name_arabic || '',
      name_en: emp.full_name_english || '',
      birth_date: emp.birth_date || '',
      sex: emp.gender || '',
      position: emp.position || '',
      department: emp.department || '',
      nationality: emp.nationality || '',
      phone: emp.phone || '',
      email: emp.email || '',
      national_id: emp.رقم_الهوية || '',
      employee_number: emp.رقم_الموظف || '',
      health_center: emp.المركز_الصحي || '',
      qualification: emp.qualification || '',
    });
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="w-4 h-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {label}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="بحث بالاسم أو الرقم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0" style={{ maxHeight: '400px' }}>
            {filtered.map(emp => (
              <div
                key={emp.id}
                onClick={() => handleSelect(emp)}
                className="p-3 rounded-lg cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
              >
                <div className="font-medium text-sm">{emp.full_name_arabic}</div>
                <div className="text-xs text-gray-500">{emp.رقم_الموظف} • {emp.position || '-'} • {emp.المركز_الصحي || '-'}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}