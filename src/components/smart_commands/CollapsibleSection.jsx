import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CollapsibleSection({
  title,
  icon: Icon,
  iconColor = 'text-indigo-600',
  badgeCount,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="text-right">
            <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          </div>
          {badgeCount !== undefined && badgeCount > 0 && (
            <Badge className="bg-indigo-600 hover:bg-indigo-700">{badgeCount}</Badge>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {open && <div className="p-4 border-t border-slate-100 bg-slate-50/30">{children}</div>}
    </div>
  );
}