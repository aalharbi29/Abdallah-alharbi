import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import InstallPrompt from "./components/pwa/InstallPrompt";
import ThemeProvider from "./components/theme/ThemeProvider";
import { LanguageProvider, useLanguage } from "./components/language/LanguageProvider";
import { getNavigationItems } from "./components/layout/navigationConfig";
import AppHeader from "./components/layout/AppHeader";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import SidebarNav from "./components/layout/SidebarNav";
import MobileMenuDrawer from "./components/layout/MobileMenuDrawer";
import LayoutStyles from "./components/layout/LayoutStyles";



function LayoutContent({ children, currentPageName }) {
  const { t } = useLanguage();
  const navigationItems = getNavigationItems(t);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    if (currentPageName === 'ViewAssignment') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const activeSubItemParent = navigationItems.find(item => item.subItems?.some(sub => {
      const subItemPath = sub.href.split('?')[0];
      const subItemSearch = sub.href.split('?')[1] || '';
      const currentLocationPath = location.pathname;
      const currentLocationSearch = location.search;

      return currentLocationPath === subItemPath && (subItemSearch ? currentLocationSearch.includes(subItemSearch) : true);
    }));

    if (activeSubItemParent) {
      setExpandedMenu(activeSubItemParent.name);
    }
    
    const activeTopLevelItem = navigationItems.find(item => !item.subItems && (location.pathname === item.href || (item.name === "لوحة التحكم" && location.pathname === "/")));
    if (activeTopLevelItem && !activeSubItemParent) {
      setExpandedMenu(null);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [location, currentPageName]);

  if (currentPageName === 'ViewAssignment') {
    return (
      <div dir="rtl" className="font-cairo bg-gray-100 min-h-screen">
        {children}
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSubmenu = (itemName) => {
    setExpandedMenu(expandedMenu === itemName ? null : itemName);
  };

  const mainPadding = 'p-1 md:p-2 lg:p-4';

  return (
    <div dir="rtl" className="font-cairo">
      <LayoutStyles />

      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-green-50 overflow-hidden">
        <InstallPrompt />

        {!isMobile && (
          <SidebarNav
            navigationItems={navigationItems}
            expandedMenu={expandedMenu}
            toggleSubmenu={toggleSubmenu}
            location={location}
            t={t}
          />
        )}

        <div className="flex-1 flex flex-col">
          <AppHeader onMenuClick={toggleMobileMenu} />

          <MobileMenuDrawer
            isOpen={isMobileMenuOpen}
            navigationItems={navigationItems}
            expandedMenu={expandedMenu}
            toggleSubmenu={toggleSubmenu}
            closeMobileMenu={closeMobileMenu}
            location={location}
          />

          <main 
                            className={`flex-1 overflow-y-auto ${mainPadding}`}
                            tabIndex={-1}
                            ref={(el) => {
                              if (el) {
                                const handleKeyDown = (e) => {
                                  if (e.key === 'PageDown') {
                                    e.preventDefault();
                                    el.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
                                  } else if (e.key === 'PageUp') {
                                    e.preventDefault();
                                    el.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
                                  } else if (e.key === 'Home') {
                                    e.preventDefault();
                                    el.scrollTo({ top: 0, behavior: 'smooth' });
                                  } else if (e.key === 'End') {
                                    e.preventDefault();
                                    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                                  }
                                };
                                window.removeEventListener('keydown', window._layoutKeyHandler);
                                window._layoutKeyHandler = handleKeyDown;
                                window.addEventListener('keydown', handleKeyDown);
                              }
                            }}
                          >
            <div className="min-h-full">
              {children}
            </div>
          </main>

          {isMobile && <MobileBottomNav pathname={location.pathname} />}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <LayoutContent currentPageName={currentPageName}>
          {children}
        </LayoutContent>
      </ThemeProvider>
    </LanguageProvider>
  );
}