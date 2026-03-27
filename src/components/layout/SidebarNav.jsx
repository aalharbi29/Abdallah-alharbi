import React from "react";
import { Link } from "react-router-dom";
import { Hospital, ChevronDown } from "lucide-react";

export default function SidebarNav({
  navigationItems,
  expandedMenu,
  toggleSubmenu,
  location,
  t,
}) {
  const renderItem = (item) => {
    const isActive = !item.subItems && (location.pathname === item.href || item.href === "/");

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
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${isExpanded || hasActiveSubItem ? 'text-white' : ''}`} />
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === subItem.href.split('?')[0] && (subItem.href.split('?')[1] ? location.search.includes(subItem.href.split('?')[1]) : true)
                      ? "bg-green-100 text-green-800 shadow-sm border-r-4 border-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
                  } text-sm`}
                >
                  <subItem.icon className="w-4 h-4" />
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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
          isActive
            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md"
        }`}
      >
        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex w-72 xl:w-80 bg-gradient-to-br from-gray-50 via-white to-green-50/30 border-l border-gray-200/50 flex-col shadow-2xl no-print backdrop-blur-sm responsive-sidebar">
      <header className="border-b border-gray-200/50 p-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
            <Hospital className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-md">المراكز الصحية الحسو</h2>
            <p className="text-sm text-green-50 font-medium">{t('header.alHanakiyah')}</p>
          </div>
        </div>
      </header>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigationItems.map(renderItem)}
      </nav>

      <footer className="border-t border-gray-200/50 p-5 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="text-center">
          <p className="font-bold text-sm text-gray-700">نظام إدارة المراكز الصحية - الحسو</p>
          <p className="text-xs mt-1.5 text-gray-500 font-medium">{t('footer.version')}</p>
        </div>
      </footer>
    </aside>
  );
}