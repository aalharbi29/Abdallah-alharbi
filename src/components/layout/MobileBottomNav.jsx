import React from "react";
import { Link } from "react-router-dom";
import { Home, Building2, Users, FileSignature } from "lucide-react";
import { createPageUrl } from "@/utils";

const mobileNavItems = [
  { name: "الرئيسية", href: createPageUrl("Dashboard"), icon: Home },
  { name: "المراكز", href: createPageUrl("HealthCenters"), icon: Building2 },
  { name: "الموارد", href: createPageUrl("HumanResources"), icon: Users },
  { name: "النماذج", href: createPageUrl("Forms"), icon: FileSignature },
];

export default function MobileBottomNav({ pathname }) {
  return (
    <div className="bottom-nav safe-bottom no-print overflow-x-auto lg:hidden">
      <div className="flex justify-around items-center py-1 min-w-full px-2 sm:px-3">
        {mobileNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1.5 rounded-lg transition-colors mobile-nav-item touch-target min-w-[64px] sm:min-w-[70px] ${
              pathname === item.href ? "text-green-600" : "text-gray-500"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[10px] font-medium text-center leading-tight">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}