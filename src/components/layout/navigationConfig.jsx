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
import { createPageUrl } from "@/utils";

export const getNavigationItems = (t) => [
  { name: t('nav.dashboard'), href: createPageUrl("Dashboard"), icon: Home },
  { name: t('nav.humanResources'), href: createPageUrl("HumanResources"), icon: Users },
  { name: t('nav.hrAnalytics'), href: createPageUrl("HRAnalytics"), icon: BarChart3 },
  { name: t('nav.healthCenters'), href: createPageUrl("HealthCenters"), icon: Building2 },
  { name: "خريطة المراكز الصحية", href: createPageUrl("HealthCentersMap"), icon: MapPinned },
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
      { name: `${t('nav.forms')} - ${t('nav.leaves')}`, href: createPageUrl("Forms?type=leaves"), icon: Calendar },
      { name: `${t('nav.forms')} - ${t('nav.assignments')}`, href: createPageUrl("Forms?type=assignments"), icon: DollarSign },
      { name: `${t('nav.forms')} - ${t('reports.statisticsReport')}`, href: createPageUrl("Forms?type=epidemiology"), icon: Activity },
      { name: `${t('nav.forms')} - ${t('nav.statistics')}`, href: createPageUrl("Forms?type=statistics"), icon: FileBarChart },
      { name: "إحصائية اللشمانيا", href: createPageUrl("LeishmaniaStatisticForm"), icon: Activity },
      { name: `${t('nav.forms')} - ${t('forms.formTemplates')}`, href: createPageUrl("Forms?type=contract_renewal"), icon: RefreshCw },
      { name: "Equipment Request", href: createPageUrl("FillNonMedicalEquipmentForm"), icon: FilePlus },
      { name: "Additional Forms", href: createPageUrl("Forms?type=additional"), icon: FilePlus },
      { name: "تكليف مهمة رسمية", href: createPageUrl("FillOfficialAssignmentForm"), icon: FileText },
      { name: "طلب استعادة بريد", href: createPageUrl("FillEmailRecoveryForm"), icon: Mail },
      { name: "إخلاء طرف", href: createPageUrl("FillReleaseForm"), icon: FileText },
    ]
  },
  { name: "نموذج جرد عهدة", href: createPageUrl("InventoryHandoverForm"), icon: FileText },
  { name: t('nav.reports'), href: createPageUrl("Reports"), icon: BarChart3 },
  {
    name: t('nav.assignments'),
    icon: FileText,
    subItems: [
      { name: t('common.view'), href: createPageUrl("Assignments"), icon: FileText },
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
  { name: "تختيم سريع", href: createPageUrl("QuickSignArchive"), icon: FileCheck },
  { name: "خطاب تعريف", href: createPageUrl("EmployeeIntroductionLetter"), icon: FileText },
  { name: "اعتماد الطلبات", href: createPageUrl("ApprovalRequests"), icon: FileCheck },
];