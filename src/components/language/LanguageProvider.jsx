import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ar: {
    common: {
      save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", add: "إضافة",
      search: "بحث", filter: "تصفية", export: "تصدير", import: "استيراد",
      print: "طباعة", download: "تحميل", upload: "رفع", refresh: "تحديث",
      back: "عودة", next: "التالي", previous: "السابق", submit: "إرسال",
      close: "إغلاق", confirm: "تأكيد", loading: "جاري التحميل...",
      noData: "لا توجد بيانات", error: "حدث خطأ", success: "تم بنجاح",
      yes: "نعم", no: "لا", view: "عرض", details: "التفاصيل"
    },
    nav: {
      dashboard: "لوحة التحكم", humanResources: "الموارد البشرية",
      hrAnalytics: "تحليلات الموارد البشرية", healthCenters: "المراكز الصحية",
      leaves: "الإجازات", quickNotes: "ملاحظات سريعة", employeeDataRequest: "طلب بيانات",
      healthCentersReport: "تقارير المراكز", bulkUpdateCenterData: "تحديث بيانات المراكز",
      dataExtractor: "مستخرج البيانات الذكي", interactiveForms: "النماذج التفاعلية",
      forms: "النماذج", reports: "التقارير", assignments: "التكاليف",
      assignmentsCalendar: "تقويم التكاليف", assignmentsAnalytics: "تحليلات التكاليف",
      holidayAssignments: "تكليف الإجازات", pdfEditor: "محرر PDF", archive: "الأرشيف",
      statistics: "الاحصائيات", statisticsGregorian: "الاحصائيات الميلادية",
      statisticsHijri: "الاحصائيات الهجرية", settings: "الإعدادات",
      clinicManagement: "إدارة العيادات", aiAnnouncementDesigner: "مصمم الإعلانات AI"
    },
    header: { healthCenters: "المراكز الصحية", alHanakiyah: "الحسو" },
    footer: {
      systemName: "نظام إدارة المراكز الصحية",
      version: "الإصدار 3.0 | وزارة الصحة"
    },
    employees: {
      title: "الموارد البشرية", name: "الاسم", position: "الوظيفة",
      department: "القسم", employeeNumber: "رقم الموظف", nationalId: "رقم الهوية",
      phone: "الهاتف", email: "البريد الإلكتروني", totalEmployees: "إجمالي الموظفين"
    },
    centers: { title: "المراكز الصحية", totalCenters: "إجمالي المراكز" },
    assignments: { title: "التكاليف", status: "الحالة", draft: "مسودة", active: "نشط" },
    leaves: { title: "الإجازات" },
    forms: { title: "النماذج", formTemplates: "قوالب النماذج" },
    reports: { title: "التقارير", statisticsReport: "تقرير إحصائي" },
    statistics: { title: "الإحصائيات" },
    messages: { saveSuccess: "تم الحفظ بنجاح", confirmDelete: "هل أنت متأكد من الحذف؟" }
  },
  en: {
    common: {
      save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add",
      search: "Search", filter: "Filter", export: "Export", import: "Import",
      print: "Print", download: "Download", upload: "Upload", refresh: "Refresh",
      back: "Back", next: "Next", previous: "Previous", submit: "Submit",
      close: "Close", confirm: "Confirm", loading: "Loading...",
      noData: "No data available", error: "An error occurred", success: "Success",
      yes: "Yes", no: "No", view: "View", details: "Details"
    },
    nav: {
      dashboard: "Dashboard", humanResources: "Human Resources",
      hrAnalytics: "HR Analytics", healthCenters: "Health Centers",
      leaves: "Leaves", quickNotes: "Quick Notes", employeeDataRequest: "Data Request",
      healthCentersReport: "Centers Report", bulkUpdateCenterData: "Bulk Update Centers",
      dataExtractor: "Smart Data Extractor", interactiveForms: "Interactive Forms",
      forms: "Forms", reports: "Reports", assignments: "Assignments",
      assignmentsCalendar: "Assignments Calendar", assignmentsAnalytics: "Assignments Analytics",
      holidayAssignments: "Holiday Assignments", pdfEditor: "PDF Editor", archive: "Archive",
      statistics: "Statistics", statisticsGregorian: "Gregorian Statistics",
      statisticsHijri: "Hijri Statistics", settings: "Settings",
      clinicManagement: "Clinic Management", aiAnnouncementDesigner: "AI Announcement Designer"
    },
    header: { healthCenters: "Health Centers", alHanakiyah: "Al-Hasu" },
    footer: {
      systemName: "Health Centers Management System",
      version: "Version 3.0 | Ministry of Health"
    },
    employees: {
      title: "Human Resources", name: "Name", position: "Position",
      department: "Department", employeeNumber: "Employee Number", nationalId: "National ID",
      phone: "Phone", email: "Email", totalEmployees: "Total Employees"
    },
    centers: { title: "Health Centers", totalCenters: "Total Centers" },
    assignments: { title: "Assignments", status: "Status", draft: "Draft", active: "Active" },
    leaves: { title: "Leaves" },
    forms: { title: "Forms", formTemplates: "Form Templates" },
    reports: { title: "Reports", statisticsReport: "Statistical Report" },
    statistics: { title: "Statistics" },
    messages: { saveSuccess: "Saved successfully", confirmDelete: "Are you sure you want to delete?" }
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};