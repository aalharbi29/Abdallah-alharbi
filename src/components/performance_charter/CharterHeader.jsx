import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CharterHeader({ data, setData, employees, onEmployeeSelect }) {
  return (
    <div className="space-y-4">
      <div className="text-center bg-gradient-to-r from-green-700 to-green-800 text-white py-4 px-6 rounded-xl">
        <h2 className="text-xl font-bold">ميثاق الأداء للموظف على الوظيفة غير الإشرافية 2025</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
        <div className="space-y-2">
          <Label className="font-bold text-gray-700">اسم الموظف:</Label>
          <Select
            value={data.employee_record_id || ""}
            onValueChange={(val) => {
              const emp = employees.find(e => e.id === val);
              if (emp) onEmployeeSelect(emp);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الموظف..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.full_name_arabic} - {emp.رقم_الموظف}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.employee_name && (
            <div className="text-sm text-green-700 font-semibold px-2">{data.employee_name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">الوكالة / الإدارة العامة:</Label>
          <Input
            value={data.agency_department || ''}
            onChange={(e) => setData(prev => ({ ...prev, agency_department: e.target.value }))}
            placeholder="الوكالة / الإدارة العامة"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">المسمى الوظيفي:</Label>
          <Input
            value={data.job_title || ''}
            onChange={(e) => setData(prev => ({ ...prev, job_title: e.target.value }))}
            placeholder="المسمى الوظيفي"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">الإدارة / القسم:</Label>
          <Input
            value={data.department || ''}
            onChange={(e) => setData(prev => ({ ...prev, department: e.target.value }))}
            placeholder="الإدارة / القسم"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">السجل المدني / رقم الموظف:</Label>
          <Input
            value={data.employee_id_number || ''}
            onChange={(e) => setData(prev => ({ ...prev, employee_id_number: e.target.value }))}
            placeholder="السجل المدني / رقم الموظف"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">المدير (المقيّم):</Label>
          <Select
            value={data.manager_name || ""}
            onValueChange={(val) => setData(prev => ({ ...prev, manager_name: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المدير..." />
            </SelectTrigger>
            <SelectContent>
              {employees.filter(e => 
                e.special_roles?.some(r => r.includes('مدير')) || 
                e.position?.includes('مدير')
              ).map(emp => (
                <SelectItem key={emp.id} value={emp.full_name_arabic}>
                  {emp.full_name_arabic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}