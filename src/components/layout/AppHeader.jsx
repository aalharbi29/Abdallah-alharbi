import React from "react";
import { Button } from "@/components/ui/button";
import { Hospital, Menu } from "lucide-react";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import LanguageSwitcher from "../language/LanguageSwitcher";
import Notifications from "../notifications/Notifications";

export default function AppHeader({ onMenuClick }) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-soft safe-top no-print">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden hover:bg-green-50 rounded-xl p-2 touch-target"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
            <Hospital className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-base md:text-xl font-bold text-gray-900 mobile-title">المراكز الصحية الحسو</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher variant="ghost" size="sm" />
        <ThemeSwitcher variant="compact" />
        <Notifications />
      </div>
    </header>
  );
}