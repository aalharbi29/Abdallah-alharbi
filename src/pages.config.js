/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAnnouncementDesigner from './pages/AIAnnouncementDesigner';
import AdvancedFormEditor from './pages/AdvancedFormEditor';
import Agenda from './pages/Agenda';
import ApprovalRequests from './pages/ApprovalRequests';
import Archive from './pages/Archive';
import AssignmentTemplates from './pages/AssignmentTemplates';
import Assignments from './pages/Assignments';
import AssignmentsAnalytics from './pages/AssignmentsAnalytics';
import AssignmentsCalendar from './pages/AssignmentsCalendar';
import BulkUpdateCenterData from './pages/BulkUpdateCenterData';
import ClinicManagement from './pages/ClinicManagement';
import CreateAssignment from './pages/CreateAssignment';
import CreateAssignmentFromTemplate from './pages/CreateAssignmentFromTemplate';
import CreateHolidayAssignmentLetter from './pages/CreateHolidayAssignmentLetter';
import Dashboard from './pages/Dashboard';
import DateConverter from './pages/DateConverter';
import EditAssignment from './pages/EditAssignment';
import EmployeeArchive from './pages/EmployeeArchive';
import EmployeeDataRequest from './pages/EmployeeDataRequest';
import EmployeeIntroductionLetter from './pages/EmployeeIntroductionLetter';
import EmployeeProfile from './pages/EmployeeProfile';
import Fill205Form from './pages/Fill205Form';
import Fill205FormComplete from './pages/Fill205FormComplete';
import Fill205FormPart2 from './pages/Fill205FormPart2';
import FillAllowanceForm from './pages/FillAllowanceForm';
import FillClearanceForm from './pages/FillClearanceForm';
import FillContractorEvaluationForm from './pages/FillContractorEvaluationForm';
import FillDigitalAccountForm from './pages/FillDigitalAccountForm';
import FillEmailRecoveryForm from './pages/FillEmailRecoveryForm';
import FillEquipmentRequestForm from './pages/FillEquipmentRequestForm';
import FillExcellentEmployeeCertificate from './pages/FillExcellentEmployeeCertificate';
import FillForm from './pages/FillForm';
import FillMedicalWasteSuppliesForm from './pages/FillMedicalWasteSuppliesForm';
import FillNonMedicalEquipmentForm from './pages/FillNonMedicalEquipmentForm';
import FillOfficialAssignmentForm from './pages/FillOfficialAssignmentForm';
import FillReleaseForm from './pages/FillReleaseForm';
import FormEditor from './pages/FormEditor';
import Forms from './pages/Forms';
import HRAnalytics from './pages/HRAnalytics';
import HealthCenterDetails from './pages/HealthCenterDetails';
import HealthCenterEdit from './pages/HealthCenterEdit';
import HealthCenters from './pages/HealthCenters';
import HealthCentersReport from './pages/HealthCentersReport';
import HolidayAssignments from './pages/HolidayAssignments';
import Home from './pages/Home';
import HumanResources from './pages/HumanResources';
import InteractiveForms from './pages/InteractiveForms';
import InventoryHandoverForm from './pages/InventoryHandoverForm';
import Leaves from './pages/Leaves';
import MedicalEquipmentReport from './pages/MedicalEquipmentReport';
import NoteSorter from './pages/NoteSorter';
import PDFEditor from './pages/PDFEditor';
import PowerPointEditor from './pages/PowerPointEditor';
import QuickNotes from './pages/QuickNotes';
import QuickSignArchive from './pages/QuickSignArchive';
import Reports from './pages/Reports';
import SavedForms from './pages/SavedForms';
import SecretVisitorReports from './pages/SecretVisitorReports';
import Settings from './pages/Settings';
import StatisticsGregorian from './pages/StatisticsGregorian';
import StatisticsHijri from './pages/StatisticsHijri';
import ViewAssignment from './pages/ViewAssignment';
import ViewEquipmentRequest from './pages/ViewEquipmentRequest';
import ViewExcellentEmployeeCertificate from './pages/ViewExcellentEmployeeCertificate';
import FillPerformanceCharter from './pages/FillPerformanceCharter';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAnnouncementDesigner": AIAnnouncementDesigner,
    "AdvancedFormEditor": AdvancedFormEditor,
    "Agenda": Agenda,
    "ApprovalRequests": ApprovalRequests,
    "Archive": Archive,
    "AssignmentTemplates": AssignmentTemplates,
    "Assignments": Assignments,
    "AssignmentsAnalytics": AssignmentsAnalytics,
    "AssignmentsCalendar": AssignmentsCalendar,
    "BulkUpdateCenterData": BulkUpdateCenterData,
    "ClinicManagement": ClinicManagement,
    "CreateAssignment": CreateAssignment,
    "CreateAssignmentFromTemplate": CreateAssignmentFromTemplate,
    "CreateHolidayAssignmentLetter": CreateHolidayAssignmentLetter,
    "Dashboard": Dashboard,
    "DateConverter": DateConverter,
    "EditAssignment": EditAssignment,
    "EmployeeArchive": EmployeeArchive,
    "EmployeeDataRequest": EmployeeDataRequest,
    "EmployeeIntroductionLetter": EmployeeIntroductionLetter,
    "EmployeeProfile": EmployeeProfile,
    "Fill205Form": Fill205Form,
    "Fill205FormComplete": Fill205FormComplete,
    "Fill205FormPart2": Fill205FormPart2,
    "FillAllowanceForm": FillAllowanceForm,
    "FillClearanceForm": FillClearanceForm,
    "FillContractorEvaluationForm": FillContractorEvaluationForm,
    "FillDigitalAccountForm": FillDigitalAccountForm,
    "FillEmailRecoveryForm": FillEmailRecoveryForm,
    "FillEquipmentRequestForm": FillEquipmentRequestForm,
    "FillExcellentEmployeeCertificate": FillExcellentEmployeeCertificate,
    "FillForm": FillForm,
    "FillMedicalWasteSuppliesForm": FillMedicalWasteSuppliesForm,
    "FillNonMedicalEquipmentForm": FillNonMedicalEquipmentForm,
    "FillOfficialAssignmentForm": FillOfficialAssignmentForm,
    "FillReleaseForm": FillReleaseForm,
    "FormEditor": FormEditor,
    "Forms": Forms,
    "HRAnalytics": HRAnalytics,
    "HealthCenterDetails": HealthCenterDetails,
    "HealthCenterEdit": HealthCenterEdit,
    "HealthCenters": HealthCenters,
    "HealthCentersReport": HealthCentersReport,
    "HolidayAssignments": HolidayAssignments,
    "Home": Home,
    "HumanResources": HumanResources,
    "InteractiveForms": InteractiveForms,
    "InventoryHandoverForm": InventoryHandoverForm,
    "Leaves": Leaves,
    "MedicalEquipmentReport": MedicalEquipmentReport,
    "NoteSorter": NoteSorter,
    "PDFEditor": PDFEditor,
    "PowerPointEditor": PowerPointEditor,
    "QuickNotes": QuickNotes,
    "QuickSignArchive": QuickSignArchive,
    "Reports": Reports,
    "SavedForms": SavedForms,
    "SecretVisitorReports": SecretVisitorReports,
    "Settings": Settings,
    "StatisticsGregorian": StatisticsGregorian,
    "StatisticsHijri": StatisticsHijri,
    "ViewAssignment": ViewAssignment,
    "ViewEquipmentRequest": ViewEquipmentRequest,
    "ViewExcellentEmployeeCertificate": ViewExcellentEmployeeCertificate,
    "FillPerformanceCharter": FillPerformanceCharter,
}

export const pagesConfig = {
    mainPage: "InventoryHandoverForm",
    Pages: PAGES,
    Layout: __Layout,
};