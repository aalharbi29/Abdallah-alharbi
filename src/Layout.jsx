import React, { useRef } from "react";
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
import useLayoutState from "./components/layout/useLayoutState";
import useMainScrollKeyboard from "./components/layout/useMainScrollKeyboard";
import { useBrandBackground } from "./components/branding/useBrandBackground";
import { MHC_ASSETS } from "./components/branding/madinahCluster";



function LayoutContent({ children, currentPageName }) {
  const { t } = useLanguage();
  const navigationItems = getNavigationItems(t);
  const location = useLocation();
  const mainRef = useRef(null);
  const {
    isMobileMenuOpen,
    isMobile,
    expandedMenu,
    toggleMobileMenu,
    closeMobileMenu,
    toggleSubmenu,
  } = useLayoutState({ currentPageName, navigationItems, location });

  useMainScrollKeyboard(mainRef);
  const { enabled: bgEnabled } = useBrandBackground('layout', true);

  if (currentPageName === 'ViewAssignment') {
    return (
      <div dir="rtl" className="font-cairo bg-gray-100 min-h-screen" style={{ fontFamily: "'Tajawal','Cairo','Segoe UI',sans-serif" }}>
        {children}
      </div>
    );
  }

  const mainPadding = 'p-1 sm:p-1.5 md:p-2 lg:p-4';

  return (
    <div dir="rtl" className="font-cairo" style={{ fontFamily: "'Tajawal','Cairo','Segoe UI',sans-serif" }}>
      <LayoutStyles />

      <div
        className="flex h-screen bg-gradient-to-br from-gray-50 to-green-50 overflow-hidden responsive-shell relative"
        style={bgEnabled ? {
          backgroundImage: `url('${MHC_ASSETS.backgroundClean}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        } : undefined}
      >
        {bgEnabled && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] pointer-events-none z-0" aria-hidden="true" />
        )}
        <div className="relative z-10 contents">
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
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
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
            ref={mainRef}
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