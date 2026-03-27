import React from "react";
import { Button } from "@/components/ui/button";
import { Hospital, Menu } from "lucide-react";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import LanguageSwitcher from "../language/LanguageSwitcher";
import Notifications from "../notifications/Notifications";

export default function AppHeader({ onMenuClick }) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-3 shadow-soft safe-top no-print responsive-header">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden hover:bg-green-50 rounded-xl p-2 touch-target"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Hospital className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
          </div>
          <h1 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mobile-title truncate">المراكز الصحية الحسو</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 responsive-toolbar">
        <LanguageSwitcher variant="ghost" size="sm" />
        <ThemeSwitcher variant="compact" />
        <Notifications />
      </div>
    </header>
  );
}