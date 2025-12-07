import Dashboard from './pages/Dashboard';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import Forms from './pages/Forms';
import FillForm from './pages/FillForm';
import HealthCenterDetails from './pages/HealthCenterDetails';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import ViewAssignment from './pages/ViewAssignment';
import EditAssignment from './pages/EditAssignment';
import CreateHolidayAssignmentLetter from './pages/CreateHolidayAssignmentLetter';
import ViewEquipmentRequest from './pages/ViewEquipmentRequest';
import Agenda from './pages/Agenda';
import Archive from './pages/Archive';
import FillAllowanceForm from './pages/FillAllowanceForm';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeeArchive from './pages/EmployeeArchive';
import HumanResources from './pages/HumanResources';
import HealthCenters from './pages/HealthCenters';
import Fill205Form from './pages/Fill205Form';
import Fill205FormPart2 from './pages/Fill205FormPart2';
import SavedForms from './pages/SavedForms';
import Fill205FormComplete from './pages/Fill205FormComplete';
import StatisticsGregorian from './pages/StatisticsGregorian';
import StatisticsHijri from './pages/StatisticsHijri';
import DateConverter from './pages/DateConverter';
import HolidayAssignments from './pages/HolidayAssignments';
import HealthCenterEdit from './pages/HealthCenterEdit';
import PDFEditor from './pages/PDFEditor';
import QuickNotes from './pages/QuickNotes';
import FillExcellentEmployeeCertificate from './pages/FillExcellentEmployeeCertificate';
import ViewExcellentEmployeeCertificate from './pages/ViewExcellentEmployeeCertificate';
import InteractiveForms from './pages/InteractiveForms';
import FillEquipmentRequestForm from './pages/FillEquipmentRequestForm';
import FormEditor from './pages/FormEditor';
import EmployeeDataRequest from './pages/EmployeeDataRequest';
import HealthCentersReport from './pages/HealthCentersReport';
import BulkUpdateCenterData from './pages/BulkUpdateCenterData';
import DataExtractor from './pages/DataExtractor';
import PowerPointEditor from './pages/PowerPointEditor';
import CreateAssignmentFromTemplate from './pages/CreateAssignmentFromTemplate';
import AssignmentsCalendar from './pages/AssignmentsCalendar';
import AssignmentsAnalytics from './pages/AssignmentsAnalytics';
import FillNonMedicalEquipmentForm from './pages/FillNonMedicalEquipmentForm';
import Settings from './pages/Settings';
import ClinicManagement from './pages/ClinicManagement';
import FillClearanceForm from './pages/FillClearanceForm';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Leaves": Leaves,
    "Reports": Reports,
    "Forms": Forms,
    "FillForm": FillForm,
    "HealthCenterDetails": HealthCenterDetails,
    "Assignments": Assignments,
    "CreateAssignment": CreateAssignment,
    "ViewAssignment": ViewAssignment,
    "EditAssignment": EditAssignment,
    "CreateHolidayAssignmentLetter": CreateHolidayAssignmentLetter,
    "ViewEquipmentRequest": ViewEquipmentRequest,
    "Agenda": Agenda,
    "Archive": Archive,
    "FillAllowanceForm": FillAllowanceForm,
    "EmployeeProfile": EmployeeProfile,
    "EmployeeArchive": EmployeeArchive,
    "HumanResources": HumanResources,
    "HealthCenters": HealthCenters,
    "Fill205Form": Fill205Form,
    "Fill205FormPart2": Fill205FormPart2,
    "SavedForms": SavedForms,
    "Fill205FormComplete": Fill205FormComplete,
    "StatisticsGregorian": StatisticsGregorian,
    "StatisticsHijri": StatisticsHijri,
    "DateConverter": DateConverter,
    "HolidayAssignments": HolidayAssignments,
    "HealthCenterEdit": HealthCenterEdit,
    "PDFEditor": PDFEditor,
    "QuickNotes": QuickNotes,
    "FillExcellentEmployeeCertificate": FillExcellentEmployeeCertificate,
    "ViewExcellentEmployeeCertificate": ViewExcellentEmployeeCertificate,
    "InteractiveForms": InteractiveForms,
    "FillEquipmentRequestForm": FillEquipmentRequestForm,
    "FormEditor": FormEditor,
    "EmployeeDataRequest": EmployeeDataRequest,
    "HealthCentersReport": HealthCentersReport,
    "BulkUpdateCenterData": BulkUpdateCenterData,
    "DataExtractor": DataExtractor,
    "PowerPointEditor": PowerPointEditor,
    "CreateAssignmentFromTemplate": CreateAssignmentFromTemplate,
    "AssignmentsCalendar": AssignmentsCalendar,
    "AssignmentsAnalytics": AssignmentsAnalytics,
    "FillNonMedicalEquipmentForm": FillNonMedicalEquipmentForm,
    "Settings": Settings,
    "ClinicManagement": ClinicManagement,
    "FillClearanceForm": FillClearanceForm,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};