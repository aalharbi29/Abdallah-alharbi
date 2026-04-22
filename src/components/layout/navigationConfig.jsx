import {
  Users,
  Hospital,
  MapPinned,
  FileText,
  BarChart3,
  Home,
  Calendar,
  FileSignature,
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
  Eye,
} from "lucide-react";

const pageUrl = (pageName) => {
  const [path, query] = pageName.split("?");
  return query ? `/${path}?${query}` : `/${path}`;
};

export const getNavigationItems = (t) => [
  { name: "صفحة الأوامر", href: pageUrl("SmartCommands"), icon: Edit },
  { name: t('nav.dashboard'), href: pageUrl("Dashboard"), icon: Home },
  {
    name: t('nav.humanResources'),
    icon: Users,
    subItems: [
      { name: "جميع الموظفين", href: pageUrl("HumanResources"), icon: Users },
      { name: "الموظفون المكلفون", href: pageUrl("AssignedEmployees"), icon: Briefcase },
      { name: "الموظفون المتقاعدون", href: pageUrl("RetiredEmployees"), icon: Archive },
      { name: "الموظفون المستقيلون", href: pageUrl("ResignedEmployees"), icon: Archive },
    ]
  },
  { name: t('nav.hrAnalytics'), href: pageUrl("HRAnalytics"), icon: BarChart3 },
  { name: t('nav.healthCenters'), href: pageUrl("HealthCenters"), icon: Building2 },
  { name: "خريطة المراكز الصحية", href: pageUrl("HealthCentersMap"), icon: MapPinned },
  { name: t('nav.leaves'), href: pageUrl("Leaves"), icon: Calendar },
  { name: t('nav.quickNotes'), href: pageUrl("QuickNotes"), icon: FileSignature },
  { name: t('nav.employeeDataRequest'), href: pageUrl("EmployeeDataRequest"), icon: FileBarChart },
  { name: t('nav.healthCentersReport'), href: pageUrl("HealthCentersReport"), icon: BarChart3 },
  { name: t('nav.bulkUpdateCenterData'), href: pageUrl("BulkUpdateCenterData"), icon: RefreshCw },
  { name: t('nav.interactiveForms'), href: pageUrl("InteractiveForms"), icon: Edit },
  {
    name: t('nav.forms'),
    icon: FileSignature,
    subItems: [
      { name: `${t('nav.forms')} - ${t('nav.leaves')}`, href: pageUrl("Forms?type=leaves"), icon: Calendar },
      { name: `${t('nav.forms')} - ${t('nav.assignments')}`, href: pageUrl("Forms?type=assignments"), icon: DollarSign },
      { name: `${t('nav.forms')} - ${t('reports.statisticsReport')}`, href: pageUrl("Forms?type=epidemiology"), icon: Activity },
      { name: `${t('nav.forms')} - ${t('nav.statistics')}`, href: pageUrl("Forms?type=statistics"), icon: FileBarChart },
      { name: "إحصائية اللشمانيا", href: pageUrl("LeishmaniaStatisticForm"), icon: Activity },
      { name: `${t('nav.forms')} - ${t('forms.formTemplates')}`, href: pageUrl("Forms?type=contract_renewal"), icon: RefreshCw },
      { name: "Equipment Request", href: pageUrl("FillNonMedicalEquipmentForm"), icon: FilePlus },
      { name: "Additional Forms", href: pageUrl("Forms?type=additional"), icon: FilePlus },
      { name: "تكليف مهمة رسمية", href: pageUrl("FillOfficialAssignmentForm"), icon: FileText },
      { name: "طلب استعادة بريد", href: pageUrl("FillEmailRecoveryForm"), icon: Mail },
      { name: "إخلاء طرف", href: pageUrl("FillReleaseForm"), icon: FileText },
    ]
  },
  { name: "نموذج جرد عهدة", href: pageUrl("InventoryHandoverForm"), icon: FileText },
  { name: t('nav.reports'), href: pageUrl("Reports"), icon: BarChart3 },
  {
    name: t('nav.assignments'),
    icon: FileText,
    subItems: [
      { name: t('common.view'), href: pageUrl("Assignments"), icon: FileText },
      { name: t('nav.assignmentsCalendar'), href: pageUrl("AssignmentsCalendar"), icon: Calendar },
      { name: t('nav.assignmentsAnalytics'), href: pageUrl("AssignmentsAnalytics"), icon: BarChart3 }
    ]
  },
  { name: t('nav.holidayAssignments'), href: pageUrl("HolidayAssignments"), icon: Briefcase },
  { name: t('nav.pdfEditor'), href: pageUrl("PDFEditor"), icon: FileText },
  { name: t('nav.archive'), href: pageUrl("Archive"), icon: Archive },
  {
    name: t('nav.statistics'),
    icon: BarChart3,
    subItems: [
      { name: t('nav.statisticsGregorian'), href: pageUrl("StatisticsGregorian"), icon: BarChart3 },
      { name: t('nav.statisticsHijri'), href: pageUrl("StatisticsHijri"), icon: BarChart3 }
    ]
  },
  { name: t('nav.settings'), href: pageUrl("Settings"), icon: Settings },
  { name: t('nav.clinicManagement'), href: pageUrl("ClinicManagement"), icon: Hospital },
  { name: t('nav.aiAnnouncementDesigner'), href: pageUrl("AIAnnouncementDesigner"), icon: FileSignature },
  { name: "نواقص المراكز", href: pageUrl("NoteSorter"), icon: FileText },
  { name: "تقارير الأجهزة الطبية", href: pageUrl("MedicalEquipmentReport"), icon: Activity },
  { name: "الزائر السري", href: pageUrl("SecretVisitorReports"), icon: Eye },
  { name: "تختيم سريع", href: pageUrl("QuickSignArchive"), icon: FileCheck },
  { name: "خطاب تعريف", href: pageUrl("EmployeeIntroductionLetter"), icon: FileText },
  { name: "اعتماد الطلبات", href: pageUrl("ApprovalRequests"), icon: FileCheck },
];