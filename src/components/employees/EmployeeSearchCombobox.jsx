import React, { useMemo, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check, Search } from "lucide-react";

export default function EmployeeSearchCombobox({ employees = [], onSelect, placeholder = "ابحث باسم الموظف...", buttonClassName = "w-64" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const filtered = useMemo(() => {
    const q = (query || "").trim();
    if (!q) return employees.slice(0, 50);
    return employees.filter(e => (e.full_name_arabic || "").includes(q)).slice(0, 50);
  }, [employees, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={`${buttonClassName} justify-between`}>
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            {selectedName || "اختر الموظف"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
          <CommandList className="max-h-64">
            <CommandEmpty>لا توجد نتائج</CommandEmpty>
            <CommandGroup>
              {filtered.map(emp => (
                <CommandItem
                  key={emp.id}
                  value={emp.full_name_arabic}
                  onSelect={() => {
                    setSelectedName(emp.full_name_arabic || "");
                    setOpen(false);
                    onSelect && onSelect(emp);
                  }}
                  className="flex flex-col items-end text-right gap-0.5"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-semibold">{emp.full_name_arabic}</span>
                    <Check className={`h-4 w-4 ${selectedName === emp.full_name_arabic ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {(emp["المركز_الصحي"] || "").toString()} {emp.position ? `• ${emp.position}` : ""}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}