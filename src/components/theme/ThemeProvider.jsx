import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'فاتح',
    icon: '☀️',
    colors: {
      background: 'bg-gray-50',
      backgroundSecondary: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      card: 'bg-white',
      cardHover: 'hover:bg-gray-50',
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-700',
      accent: 'bg-green-50',
      sidebar: 'bg-white',
      sidebarHover: 'hover:bg-green-50',
      input: 'bg-white border-gray-300',
      shadow: 'shadow-md',
    },
    cssVars: {
      '--bg-primary': '#f9fafb',
      '--bg-secondary': '#ffffff',
      '--bg-card': '#ffffff',
      '--text-primary': '#111827',
      '--text-secondary': '#4b5563',
      '--border-color': '#e5e7eb',
      '--accent-color': '#16a34a',
      '--accent-light': '#dcfce7',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  },
  dark: {
    name: 'داكن',
    icon: '🌙',
    colors: {
      background: 'bg-gray-900',
      backgroundSecondary: 'bg-gray-800',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      border: 'border-gray-700',
      card: 'bg-gray-800',
      cardHover: 'hover:bg-gray-700',
      primary: 'bg-green-500',
      primaryHover: 'hover:bg-green-600',
      accent: 'bg-gray-700',
      sidebar: 'bg-gray-900',
      sidebarHover: 'hover:bg-gray-800',
      input: 'bg-gray-700 border-gray-600',
      shadow: 'shadow-xl shadow-black/20',
    },
    cssVars: {
      '--bg-primary': '#111827',
      '--bg-secondary': '#1f2937',
      '--bg-card': '#1f2937',
      '--text-primary': '#f9fafb',
      '--text-secondary': '#9ca3af',
      '--border-color': '#374151',
      '--accent-color': '#22c55e',
      '--accent-light': '#14532d',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    }
  },
  blue: {
    name: 'أزرق',
    icon: '💙',
    colors: {
      background: 'bg-blue-50',
      backgroundSecondary: 'bg-white',
      text: 'text-blue-900',
      textSecondary: 'text-blue-600',
      border: 'border-blue-200',
      card: 'bg-white',
      cardHover: 'hover:bg-blue-50',
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      accent: 'bg-blue-100',
      sidebar: 'bg-blue-900',
      sidebarHover: 'hover:bg-blue-800',
      input: 'bg-white border-blue-300',
      shadow: 'shadow-md shadow-blue-100',
    },
    cssVars: {
      '--bg-primary': '#eff6ff',
      '--bg-secondary': '#ffffff',
      '--bg-card': '#ffffff',
      '--text-primary': '#1e3a8a',
      '--text-secondary': '#2563eb',
      '--border-color': '#bfdbfe',
      '--accent-color': '#2563eb',
      '--accent-light': '#dbeafe',
      '--shadow': '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
    }
  },
  purple: {
    name: 'بنفسجي',
    icon: '💜',
    colors: {
      background: 'bg-purple-50',
      backgroundSecondary: 'bg-white',
      text: 'text-purple-900',
      textSecondary: 'text-purple-600',
      border: 'border-purple-200',
      card: 'bg-white',
      cardHover: 'hover:bg-purple-50',
      primary: 'bg-purple-600',
      primaryHover: 'hover:bg-purple-700',
      accent: 'bg-purple-100',
      sidebar: 'bg-purple-900',
      sidebarHover: 'hover:bg-purple-800',
      input: 'bg-white border-purple-300',
      shadow: 'shadow-md shadow-purple-100',
    },
    cssVars: {
      '--bg-primary': '#faf5ff',
      '--bg-secondary': '#ffffff',
      '--bg-card': '#ffffff',
      '--text-primary': '#581c87',
      '--text-secondary': '#9333ea',
      '--border-color': '#e9d5ff',
      '--accent-color': '#9333ea',
      '--accent-light': '#f3e8ff',
      '--shadow': '0 4px 6px -1px rgba(147, 51, 234, 0.1)',
    }
  },
  sunset: {
    name: 'غروب',
    icon: '🌅',
    colors: {
      background: 'bg-orange-50',
      backgroundSecondary: 'bg-white',
      text: 'text-orange-900',
      textSecondary: 'text-orange-600',
      border: 'border-orange-200',
      card: 'bg-white',
      cardHover: 'hover:bg-orange-50',
      primary: 'bg-orange-500',
      primaryHover: 'hover:bg-orange-600',
      accent: 'bg-orange-100',
      sidebar: 'bg-gradient-to-b from-orange-600 to-red-600',
      sidebarHover: 'hover:bg-orange-700',
      input: 'bg-white border-orange-300',
      shadow: 'shadow-md shadow-orange-100',
    },
    cssVars: {
      '--bg-primary': '#fff7ed',
      '--bg-secondary': '#ffffff',
      '--bg-card': '#ffffff',
      '--text-primary': '#7c2d12',
      '--text-secondary': '#ea580c',
      '--border-color': '#fed7aa',
      '--accent-color': '#ea580c',
      '--accent-light': '#ffedd5',
      '--shadow': '0 4px 6px -1px rgba(234, 88, 12, 0.1)',
    }
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('app-theme', theme);
      
      // Apply CSS variables
      const root = document.documentElement;
      const currentTheme = themes[theme];
      if (currentTheme?.cssVars) {
        Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      }
      
      // Apply dark class for Tailwind dark mode
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const currentTheme = themes[theme] || themes.light;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'light', setTheme: () => {}, currentTheme: themes.light, themes };
  }
  return context;
}

export default ThemeProvider;