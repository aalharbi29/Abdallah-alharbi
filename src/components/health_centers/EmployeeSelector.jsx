import React from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeSelector({ employees, value, onSelect, placeholder = "اختر موظف..." }) {
  const [open, setOpen] = React.useState(false);
  const selectedEmployee = employees.find((emp) => emp.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEmployee ? selectedEmployee.full_name_arabic : placeholder}
          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="ابحث عن موظف..." />
          <CommandEmpty>لم يتم العثور على موظف.</CommandEmpty>
          <CommandGroup>
            {employees.map((employee) => (
              <CommandItem
                key={employee.id}
                value={employee.full_name_arabic}
                onSelect={() => {
                  onSelect(employee.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "ml-2 h-4 w-4",
                    value === employee.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {employee.full_name_arabic}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}