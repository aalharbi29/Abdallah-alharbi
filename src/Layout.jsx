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
            { name: "تكليف مهمة رسمية", href: createPageUrl("FillOfficialAssignmentForm"), icon: FileText },
                        { name: "طلب استعادة بريد", href: createPageUrl("FillEmailRecoveryForm"), icon: Mail },
                      ]
                    },
            { name: t('nav.assignmentTemplates') || "إدارة قوالب التكليف", href: createPageUrl("AssignmentTemplates"), icon: FileText },
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
  { name: "نواقص المراكز", href: createPageUrl("NoteSorter"), icon: FileText },
    { name: "تقارير الأجهزة الطبية", href: createPageUrl("MedicalEquipmentReport"), icon: Activity },
    { name: "الزائر السري", href: createPageUrl("SecretVisitorReports"), icon: Eye },
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
            className={`flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isExpanded || hasActiveSubItem 
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg" 
                : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700"
            } ${isMobileLayout ? 'text-sm' : 'text-base'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`${isMobileLayout ? "w-4 h-4" : "w-5 h-5"} ${isExpanded || hasActiveSubItem ? 'text-white' : ''}`} />
              <span>{item.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
          </button>

          {isExpanded && (
            <div className="mr-7 mt-2 space-y-1 animate-fade-in">
              {(item.subItems || []).map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.href}
                  onClick={isMobileLayout ? closeMobileMenu : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === subItem.href.split('?')[0] && (subItem.href.split('?')[1] ? location.search.includes(subItem.href.split('?')[1]) : true)
                      ? "bg-green-100 text-green-800 shadow-sm border-r-4 border-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
                  } ${isMobileLayout ? 'text-xs' : 'text-sm'}`}
                >
                  <subItem.icon className={isMobileLayout ? "w-3.5 h-3.5" : "w-4 h-4"} />
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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
          isActive
            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md"
        } ${isMobileLayout ? 'text-sm' : 'text-base'}`}
      >
        <item.icon className={`${isMobileLayout ? "w-4 h-4" : "w-5 h-5"} group-hover:scale-110 transition-transform duration-200`} />
        <span>{item.name}</span>
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
          <aside className="w-72 bg-gradient-to-br from-gray-50 via-white to-green-50/30 border-l border-gray-200/50 flex flex-col shadow-2xl no-print backdrop-blur-sm">
            <header className="border-b border-gray-200/50 p-6 bg-gradient-to-r from-green-600 to-emerald-600">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                  <Hospital className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">{t('header.healthCenters')}</h2>
                  <p className="text-sm text-green-50 font-medium">{t('header.alHanakiyah')}</p>
                </div>
              </div>
            </header>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {(navigationItems || []).map((item) => renderNavigationItem(item))}
            </nav>

            <footer className="border-t border-gray-200/50 p-5 bg-gradient-to-br from-gray-50 to-green-50">
              <div className="text-center">
                <p className="font-bold text-sm text-gray-700">{t('footer.systemName')}</p>
                <p className="text-xs mt-1.5 text-gray-500 font-medium">{t('footer.version')}</p>
              </div>
            </footer>
          </aside>
        )}

        <div className="flex-1 flex flex-col">
          <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-soft safe-top no-print">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="md:hidden hover:bg-green-50 rounded-xl p-2 touch-target"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </Button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
                  <Hospital className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h1 className="text-base md:text-xl font-bold text-gray-900 mobile-title">{t('header.healthCenters')}</h1>
                </div>
                </div>

                <div className="flex items-center gap-2">
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

          {isMobile && (
            <div className="bottom-nav safe-bottom no-print overflow-x-auto">
              <div className="flex justify-around items-center py-1 min-w-max px-2">
                {[
                  { name: "الرئيسية", href: createPageUrl("Dashboard"), icon: Home },
                  { name: "الموارد", href: createPageUrl("HumanResources"), icon: Users },
                  { name: "الإجازات", href: createPageUrl("Leaves"), icon: Calendar },
                  { name: "التصميم", href: createPageUrl("AIAnnouncementDesigner"), icon: FileSignature },
                ].map((item) => ( 
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors mobile-nav-item touch-target min-w-[70px] ${
                      location.pathname === item.href
                        ? "text-green-600" 
                        : "text-gray-500"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium text-center leading-tight">{item.name}</span>
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