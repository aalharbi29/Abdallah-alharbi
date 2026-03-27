import React from "react";
import { Link } from "react-router-dom";
import { Hospital, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileMenuDrawer({
  isOpen,
  navigationItems,
  expandedMenu,
  toggleSubmenu,
  closeMobileMenu,
  location,
}) {
  if (!isOpen) return null;

  const renderItem = (item) => {
    const isActive = !item.subItems && (location.pathname === item.href || (item.name === "لوحة التحكم" && location.pathname === "/"));

    if (item.subItems) {
      const isExpanded = expandedMenu === item.name;
      const hasActiveSubItem = item.subItems.some((subItem) => {
        const subItemPath = subItem.href.split('?')[0];
        const subItemSearch = subItem.href.split('?')[1] || '';
        return location.pathname === subItemPath && (subItemSearch ? location.search.includes(subItemSearch) : true);
      });

      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={`flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isExpanded || hasActiveSubItem
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700"
            } text-sm`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-4 h-4 ${isExpanded || hasActiveSubItem ? 'text-white' : ''}`} />
              <span>{item.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
          </button>

          {isExpanded && (
            <div className="mr-7 mt-2 space-y-1 animate-fade-in">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === subItem.href.split('?')[0] && (subItem.href.split('?')[1] ? location.search.includes(subItem.href.split('?')[1]) : true)
                      ? "bg-green-100 text-green-800 shadow-sm border-r-4 border-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
                  } text-xs`}
                >
                  <subItem.icon className="w-3.5 h-3.5" />
                  <span>{subItem.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={closeMobileMenu}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
          isActive
            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md"
        } text-sm`}
      >
        <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden no-print">
      <div className="mobile-overlay absolute inset-0" onClick={closeMobileMenu}></div>
      <aside className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 safe-top overflow-y-auto">
        <header className="border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Hospital className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">المراكز الصحية الحسو</h2>
              <p className="text-xs text-gray-500">الحسو</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={closeMobileMenu} className="p-2">
            <X className="w-4 h-4" />
          </Button>
        </header>

        <nav className="p-3 space-y-1 safe-bottom custom-scrollbar">
          {navigationItems.map(renderItem)}
        </nav>
      </aside>
    </div>
  );
}