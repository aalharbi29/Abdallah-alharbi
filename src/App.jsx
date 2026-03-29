import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import FillOccupationalHealthForm from './pages/FillOccupationalHealthForm';
import InventoryHandoverForm from './pages/InventoryHandoverForm';
import MalariaStatisticForm from './pages/MalariaStatisticForm';
import LeishmaniaStatisticForm from './pages/LeishmaniaStatisticForm';
import FillSafetyEvaluationForm from './pages/FillSafetyEvaluationForm';
import FillWaterSamplesForm from './pages/FillWaterSamplesForm';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import HealthCentersMap from './pages/HealthCentersMap';
import HealthCenterMapDetails from './pages/HealthCenterMapDetails';
import HealthCenterMap3D from './pages/HealthCenterMap3D';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : null;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          {MainPage ? <MainPage /> : null}
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/FillOccupationalHealthForm" element={
        <LayoutWrapper currentPageName="FillOccupationalHealthForm">
          <FillOccupationalHealthForm />
        </LayoutWrapper>
      } />
      <Route path="/MalariaStatisticForm" element={
        <LayoutWrapper currentPageName="MalariaStatisticForm">
          <MalariaStatisticForm />
        </LayoutWrapper>
      } />
      <Route path="/LeishmaniaStatisticForm" element={
        <LayoutWrapper currentPageName="LeishmaniaStatisticForm">
          <LeishmaniaStatisticForm />
        </LayoutWrapper>
      } />
      <Route path="/HealthCentersMap" element={
        <LayoutWrapper currentPageName="HealthCentersMap">
          <HealthCentersMap />
        </LayoutWrapper>
      } />
      <Route path="/HealthCenterMapDetails" element={
        <LayoutWrapper currentPageName="HealthCenterMapDetails">
          <HealthCenterMapDetails />
        </LayoutWrapper>
      } />
      <Route path="/HealthCenterMap3D" element={
        <LayoutWrapper currentPageName="HealthCenterMap3D">
          <HealthCenterMap3D />
        </LayoutWrapper>
      } />
      <Route path="/FillSafetyEvaluationForm" element={
        <LayoutWrapper currentPageName="FillSafetyEvaluationForm">
          <FillSafetyEvaluationForm />
        </LayoutWrapper>
      } />
      <Route path="/FillWaterSamplesForm" element={
        <LayoutWrapper currentPageName="FillWaterSamplesForm">
          <FillWaterSamplesForm />
        </LayoutWrapper>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App