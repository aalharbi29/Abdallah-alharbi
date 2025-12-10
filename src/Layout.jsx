import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  Hospital,
  FileText,
  BarChart3,
  Home,
  Calendar,
  FileSignature,
  Menu,
  X,
  Bell,
  ChevronDown,
  DollarSign,
  Activity,
  FileBarChart,
  RefreshCw,
  FilePlus,
  Briefcase,
  Archive,
  Building2,
  Edit,
  Mail,
  Settings,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InstallPrompt from "./components/pwa/InstallPrompt";
import Notifications from "./components/notifications/Notifications";
import ThemeProvider, { useTheme } from "./components/theme/ThemeProvider";
import ThemeSwitcher from "./components/theme/ThemeSwitcher";
import { LanguageProvider, useLanguage } from "./components/language/LanguageProvider";
import LanguageSwitcher from "./components/language/LanguageSwitcher";

const getNavigationItems = (t) => [
  { name: t('nav.dashboard'), href: createPageUrl("Dashboard"), icon: Home },
  { name: t('nav.humanResources'), href: createPageUrl("HumanResources"), icon: Users },
  { name: t('nav.hrAnalytics'), href: createPageUrl("HRAnalytics"), icon: BarChart3 },
  { name: t('nav.healthCenters'), href: createPageUrl("HealthCenters"), icon: Building2 },
  { name: t('nav.leaves'), href: createPageUrl("Leaves"), icon: Calendar },
  { name: t('nav.quickNotes'), href: createPageUrl("QuickNotes"), icon: FileSignature },
  { name: t('nav.employeeDataRequest'), href: createPageUrl("EmployeeDataRequest"), icon: FileBarChart },
  { name: t('nav.healthCentersReport'), href: createPageUrl("HealthCentersReport"), icon: BarChart3 },
  { name: t('nav.bulkUpdateCenterData'), href: createPageUrl("BulkUpdateCenterData"), icon: RefreshCw },
  { name: t('nav.dataExtractor'), href: createPageUrl("DataExtractor"), icon: FileText },
  { name: t('nav.interactiveForms'), href: createPageUrl("InteractiveForms"), icon: Edit },
  {
    name: t('nav.forms'),
    icon: FileSignature,
    subItems: [
      { name: t('nav.forms') + " - " + t('nav.leaves'), href: createPageUrl("Forms?type=leaves"), icon: Calendar },
      { name: t('nav.forms') + " - " + t('nav.assignments'), href: createPageUrl("Forms?type=assignments"), icon: DollarSign },
      { name: t('nav.forms') + " - " + t('reports.statisticsReport'), href: createPageUrl("Forms?type=epidemiology"), icon: Activity },
      { name: t('nav.forms') + " - " + t('nav.statistics'), href: createPageUrl("Forms?type=statistics"), icon: FileBarChart },
      { name: t('nav.forms') + " - " + t('forms.formTemplates'), href: createPageUrl("Forms?type=contract_renewal"), icon: RefreshCw },
      { name: "Equipment Request", href: createPageUrl("FillNonMedicalEquipmentForm"), icon: FilePlus },
      { name: "Additional Forms", href: createPageUrl("Forms?type=additional"), icon: FilePlus },
      { name: "Clearance Form", href: createPageUrl("FillClearanceForm"), icon: FileCheck },
    ]
  },
  { name: t('nav.reports'), href: createPageUrl("Reports"), icon: BarChart3 },
  {
    name: t('nav.assignments'),
    icon: FileText,
    subItems: [
      { name: t('nav.assignments') + " - " + t('common.view'), href: createPageUrl("Assignments"), icon: FileText },
      { name: t('nav.assignmentsCalendar'), href: createPageUrl("AssignmentsCalendar"), icon: Calendar },
      { name: t('nav.assignmentsAnalytics'), href: createPageUrl("AssignmentsAnalytics"), icon: BarChart3 }
    ]
  },
  { name: t('nav.holidayAssignments'), href: createPageUrl("HolidayAssignments"), icon: Briefcase },
  { name: t('nav.pdfEditor'), href: createPageUrl("PDFEditor"), icon: FileText },
  { name: t('nav.archive'), href: createPageUrl("Archive"), icon: Archive },
  {
    name: t('nav.statistics'),
    icon: BarChart3,
    subItems: [
      { name: t('nav.statisticsGregorian'), href: createPageUrl("StatisticsGregorian"), icon: BarChart3 },
      { name: t('nav.statisticsHijri'), href: createPageUrl("StatisticsHijri"), icon: BarChart3 }
    ]
  },
  { name: t('nav.settings'), href: createPageUrl("Settings"), icon: Settings },
  { name: t('nav.clinicManagement'), href: createPageUrl("ClinicManagement"), icon: Hospital },
  { name: t('nav.aiAnnouncementDesigner'), href: createPageUrl("AIAnnouncementDesigner"), icon: FileSignature },
  ];

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

  const renderNavigationItem = (item, isMobileLayout = false) => {
    const isActive = !item.subItems && (location.pathname === item.href ||
      (item.name === "لوحة التحكم" && location.pathname === "/"));

    if (item.subItems) {
      const isExpanded = expandedMenu === item.name;
      const hasActiveSubItem = (item.subItems || []).some(subItem => {
        const subItemPath = subItem.href.split('?')[0];
        const subItemSearch = subItem.href.split('?')[1] || '';
        const currentLocationPath = location.pathname;
        const currentLocationSearch = location.search;
        
        return currentLocationPath === subItemPath && (subItemSearch ? currentLocationSearch.includes(subItemSearch) : true);
      });

      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={`flex w-full items-center justify-between gap-3 p-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200 ${
              isExpanded || hasActiveSubItem ? "bg-green-100 text-green-700 shadow-sm" : "text-gray-700"
            } ${isMobileLayout ? 'text-sm' : ''}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={isMobileLayout ? "w-4 h-4" : "w-5 h-5"} />
              <span className="font-medium">{item.name}</span>
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>

          {isExpanded && (
            <div className="mr-6 mt-1 space-y-1">
              {(item.subItems || []).map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  onClick={isMobileLayout ? closeMobileMenu : undefined}
                  className={`flex items-center gap-3 p-2 rounded-md hover:bg-green-50 hover:text-green-700 transition-all duration-200 ${
                    location.pathname === subItem.href.split('?')[0] && (subItem.href.split('?')[1] ? location.search.includes(subItem.href.split('?')[1]) : true)
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-gray-600"
                  } ${isMobileLayout ? 'text-xs' : 'text-sm'}`}
                >
                  <subItem.icon className={isMobileLayout ? "w-3 h-3" : "w-4 h-4"} />
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
        onClick={isMobileLayout ? closeMobileMenu : undefined}
        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200 group ${
          isActive
            ? "bg-green-100 text-green-700 border border-green-200 shadow-md"
            : "text-gray-700 hover:shadow-md"
        } ${isMobileLayout ? 'text-sm' : ''}`}
      >
        <item.icon className={`${isMobileLayout ? "w-4 h-4" : "w-5 h-5"} group-hover:scale-110 transition-transform`} />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
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

        .touch-target {
          min-width: 44px;
          min-height: 44px;
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
          <aside className="w-64 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 flex flex-col shadow-xl no-print">
            <header className="border-b border-gray-200 p-4 bg-gradient-to-r from-green-50 to-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Hospital className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t('header.healthCenters')}</h2>
                  <p className="text-xs text-gray-500">{t('header.alHanakiyah')}</p>
                </div>
              </div>
            </header>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {(navigationItems || []).map((item) => renderNavigationItem(item))}
            </nav>

            <footer className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-green-50">
              <div className="text-center text-xs text-gray-500">
                <p className="font-medium">{t('footer.systemName')}</p>
                <p className="text-xs mt-1">{t('footer.version')}</p>
              </div>
            </footer>
          </aside>
        )}

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-2 md:px-3 py-2 flex items-center justify-between shadow-sm safe-top no-print">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="md:hidden hover:bg-gray-100 rounded-md p-2 touch-target"
              >
                <Menu className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                  <Hospital className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <h1 className="text-sm md:text-base font-bold text-gray-900 mobile-title">{t('header.healthCenters')}</h1>
                </div>
                </div>

                <div className="flex items-center gap-1">
                <LanguageSwitcher variant="ghost" size="sm" />
                <ThemeSwitcher variant="compact" />
                <Notifications />
                </div>
            </header>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden no-print">
              <div className="mobile-overlay absolute inset-0" onClick={closeMobileMenu}></div>
              <aside className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 safe-top overflow-y-auto">
                <header className="border-b border-gray-200 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                      <Hospital className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">{t('header.healthCenters')}</h2>
                      <p className="text-xs text-gray-500">{t('header.alHanakiyah')}</p>
                    </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={closeMobileMenu} className="p-2">
                    <X className="w-4 h-4" />
                    </Button>
                </header>

                <nav className="p-3 space-y-1 safe-bottom">
                  {(navigationItems || []).map((item) => renderNavigationItem(item, true))}
                </nav>
              </aside>
            </div>
          )}

          <main className={`flex-1 overflow-y-auto ${mainPadding}`}>
            <div className="min-h-full">
              {children}
            </div>
          </main>

          {isMobile && (
            <div className="bottom-nav safe-bottom no-print">
              <div className="flex justify-around items-center py-1">
                {[
                  { name: "الرئيسية", href: createPageUrl("Dashboard"), icon: Home },
                  { name: "الموارد", href: createPageUrl("HumanResources"), icon: Users },
                  { name: "الإجازات", href: createPageUrl("Leaves"), icon: Calendar },
                ].map((item) => ( 
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors mobile-nav-item touch-target ${
                      location.pathname === item.href
                        ? "text-green-600" 
                        : "text-gray-500"
                    }`}
                  >
                    <item.icon className="w-3 h-3 md:w-4 md-h-4" />
                    <span className="text-xs font-medium text-center leading-tight">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
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