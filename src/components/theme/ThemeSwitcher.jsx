import React from 'react';
import { useTheme, themes } from './ThemeProvider';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check } from 'lucide-react';

export default function ThemeSwitcher({ variant = 'default' }) {
  const { theme, setTheme, currentTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <span className="text-lg">{currentTheme?.icon || '🎨'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-center">اختر السمة</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(themes).map(([key, themeData]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{themeData.icon}</span>
                <span>{themeData.name}</span>
              </div>
              {theme === key && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(themes).map(([key, themeData]) => (
        <Button
          key={key}
          variant={theme === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme(key)}
          className={`flex items-center gap-2 ${
            theme === key ? 'ring-2 ring-offset-2 ring-green-500' : ''
          }`}
        >
          <span>{themeData.icon}</span>
          <span>{themeData.name}</span>
        </Button>
      ))}
    </div>
  );
}