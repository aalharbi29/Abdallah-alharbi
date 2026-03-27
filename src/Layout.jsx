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
      <style>{`
        * {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .font-cairo {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        @media print {
          .no-print, .print-hide { display: none !important; }
          .print-area { 
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-only { display: block !important; }
          .print-title { display: block !important; }
          body { background: white !important; color: black !important; }
          main, .print-area { padding: 0 !important; margin: 0 !important; }
          @page {
              size: A4;
              margin: 20mm;
          }
          table {
              width: 100%;
              border-collapse: collapse;
          }
          th, td {
              border: 1px solid #ccc;
              padding: 8px;
              font-size: 10pt;
          }
          th {
              background-color: #f2f2f2;
          }
        }
        
        .print-title { display: none; }
        .print-only { display: none; }

        @media (max-width: 768px) {
          body {
            font-size: 14px;
            overflow-x: hidden;
          }
          
          input, textarea, select {
            font-size: 16px !important;
          }
          
          .mobile-card {
            margin: 2px !important;
            border-radius: 6px !important;
            padding: 8px !important;
          }
          
          .mobile-text {
            font-size: 12px !important;
            line-height: 1.3 !important;
          }
          
          .mobile-title {
            font-size: 16px !important;
            line-height: 1.2 !important;
          }
          
          .mobile-button {
            height: 36px !important;
            font-size: 12px !important;
            padding: 6px 10px !important;
            min-width: 60px !important;
          }
          
          .mobile-nav-item {
            min-height: 40px !important;
            font-size: 10px !important;
            padding: 6px 2px !important;
          }
          
          .mobile-table th,
          .mobile-table td {
            padding: 4px !important;
            font-size: 10px !important;
            min-width: 80px !important;
          }
          
          .mobile-stats-card {
            padding: 8px !important;
          }
          
          .mobile-stats-value {
            font-size: 18px !important;
          }
          
          .mobile-stats-title {
            font-size: 10px !important;
          }

          .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }

          .dialog-content-mobile {
            max-width: 95vw !important;
            max-height: 90vh !important;
            margin: 2vw !important;
          }

          .card-mobile {
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
          }

          .btn-mobile {
            min-height: 44px !important;
            touch-action: manipulation;
          }

          .form-mobile input,
          .form-mobile select,
          .form-mobile textarea {
            min-height: 44px !important;
            font-size: 16px !important;
          }

          .tabs-mobile {
            font-size: 12px !important;
          }

          .space-mobile > * + * {
            margin-top: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-table th,
          .mobile-table td {
            padding: 2px !important;
            font-size: 9px !important;
            min-width: 60px !important;
          }
          
          .mobile-button {
            height: 32px !important;
            font-size: 10px !important;
            padding: 4px 6px !important;
            min-width: 50px !important;
          }

          .mobile-title {
            font-size: 14px !important;
          }

          .mobile-text {
            font-size: 11px !important;
          }
        }

        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        @media (display-mode: standalone) {
          body {
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }
        }
        .safe-top { padding-top: env(safe-area-inset-top); }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .mobile-overlay {
          backdrop-filter: blur(10px);
          background: rgba(0, 0, 0, 0.5);
        }

        .bottom-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid #e5e7eb;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .touch-target {
          min-width: 44px;
          min-height: 44px;
        }

        main:focus {
          outline: none;
        }

        img {
          max-width: 100%;
          height: auto;
        }

        @media (max-width: 768px) {
          table {
            font-size: 12px;
          }
          
          th, td {
            padding: 4px 2px !important;
            word-break: break-word;
          }
        }
      `}</style>

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