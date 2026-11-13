import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider, useApp } from './context/AppContext';
import { getGoogleMapsApiKey } from './components/gis/CadastreGoogleMap';

// Common Components
import { SimulationBanner } from './components/common/SimulationBanner';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { NFTCertificateModal } from './components/blockchain/NFTCertificateModal';

// Public Pages
import { LandingPage } from './components/public/LandingPage';
import { PublicVerifyPage } from './components/public/PublicVerifyPage';
import { AboutPage } from './components/public/AboutPage';
import { FeaturesPage } from './components/public/FeaturesPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { ContactPage } from './components/public/ContactPage';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage, AccessDeniedPage } from './components/auth/AuthScreens';

// Citizen Portal
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { MyLandsView } from './components/citizen/MyLandsView';
import { LandDetailView } from './components/citizen/LandDetailView';
import { LandRegistrationWizard } from './components/citizen/LandRegistrationWizard';
import { DocumentCentreView } from './components/citizen/DocumentCentreView';
import { ApplicationTrackingView } from './components/citizen/ApplicationTrackingView';
import { TransactionHistoryView } from './components/citizen/TransactionHistoryView';

// GIS Spatial Engine
import { GISWorkspace } from './components/gis/GISWorkspace';

// Blockchain & NFT
import { BlockchainExplorer } from './components/blockchain/BlockchainExplorer';
import { NFTIssuanceView } from './components/blockchain/NFTIssuanceView';

// Community Attestation
import { CommunityAttestationView } from './components/community/CommunityAttestationView';

// Role Portals
import { SurveyorPortal } from './components/surveyor/SurveyorPortal';
import { RegistrarPortal } from './components/registrar/RegistrarPortal';
import { LandAdminPortal } from './components/administrator/LandAdminPortal';
import { GovernorPortal } from './components/governor/GovernorPortal';
import { SysAdminPortal } from './components/sysadmin/SysAdminPortal';

// Monitoring & Analytics
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { MonitoringView } from './components/monitoring/MonitoringView';

// Shared Pages
import { ProfileView } from './components/shared/ProfileView';
import { SettingsView } from './components/shared/SettingsView';
import { HelpFAQView } from './components/shared/HelpFAQView';
import { NotFoundView } from './components/shared/NotFoundView';

// Animations
import { CadastreBlockchainCanvas } from './components/animations/CadastreBlockchainCanvas';

// Dynamic Role Dashboard Dispatcher
const RoleDashboardDispatcher: React.FC = () => {
  const { currentRole } = useApp();

  switch (currentRole) {
    case 'surveyor':
      return <SurveyorPortal />;
    case 'registrar':
      return <RegistrarPortal />;
    case 'admin':
      return <LandAdminPortal />;
    case 'governor':
      return <GovernorPortal />;
    case 'sysadmin':
      return <SysAdminPortal />;
    case 'citizen':
    default:
      return <CitizenDashboard />;
  }
};

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const { selectedCertificateParcel, setSelectedCertificateParcel, theme } = useApp();
  const location = useLocation();

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const isPortal = location.pathname.startsWith('/portal');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FB] dark:bg-[#080D24] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#6338F5] selection:text-white relative transition-colors duration-200">
      {/* 0. Global Cadastre / Blockchain / NFT Animated Background Canvas */}
      <CadastreBlockchainCanvas theme={theme} />

      {/* Google Maps Demo Quota Notice (Case A) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 1. Global Simulation Banner */}
      <div className="relative z-20">
        <SimulationBanner />
      </div>

      {/* 2. Top Navigation Bar */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* 3. Main Body Structure */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Render Sidebar if in /portal */}
        {isPortal && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full min-w-0 ${
            isPortal ? 'p-3 sm:p-5 lg:p-8' : ''
          }`}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify" element={<PublicVerifyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/access-denied" element={<AccessDeniedPage />} />

            {/* Portal Root -> Dispatches by Active Role */}
            <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
            <Route path="/portal/dashboard" element={<RoleDashboardDispatcher />} />

            {/* Citizen Portal Pages */}
            <Route path="/portal/my-lands" element={<MyLandsView />} />
            <Route path="/portal/lands/:id" element={<LandDetailView />} />
            <Route path="/portal/register-land" element={<LandRegistrationWizard />} />
            <Route path="/portal/documents" element={<DocumentCentreView />} />
            <Route path="/portal/applications" element={<ApplicationTrackingView />} />
            <Route path="/portal/transactions" element={<TransactionHistoryView />} />

            {/* GIS Workspace */}
            <Route path="/portal/gis" element={<GISWorkspace />} />

            {/* Blockchain & NFT */}
            <Route path="/portal/explorer" element={<BlockchainExplorer />} />
            <Route path="/portal/nft-issuance" element={<NFTIssuanceView />} />
            <Route path="/portal/nft-registry" element={<NFTIssuanceView />} />

            {/* Community Attestation */}
            <Route path="/portal/community" element={<CommunityAttestationView />} />

            {/* Role-Specific Direct Routes */}
            <Route path="/portal/surveyor/*" element={<SurveyorPortal />} />
            <Route path="/portal/registrar/*" element={<RegistrarPortal />} />
            <Route path="/portal/admin/*" element={<LandAdminPortal />} />
            <Route path="/portal/governor/*" element={<GovernorPortal />} />
            <Route path="/portal/sysadmin/*" element={<SysAdminPortal />} />

            {/* Analytics & Monitoring */}
            <Route path="/portal/analytics" element={<AnalyticsView />} />
            <Route path="/portal/monitoring" element={<MonitoringView />} />

            {/* Shared Utility */}
            <Route path="/portal/profile" element={<ProfileView />} />
            <Route path="/portal/settings" element={<SettingsView />} />
            <Route path="/portal/help" element={<HelpFAQView />} />

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </main>
      </div>

      {/* 4. Global Footer on Public Routes */}
      {!isPortal && <Footer />}

      {/* 5. Global NFT Certificate Modal */}
      {selectedCertificateParcel && (
        <NFTCertificateModal
          parcel={selectedCertificateParcel}
          onClose={() => setSelectedCertificateParcel(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  const mapsApiKey = getGoogleMapsApiKey();
  const content = (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );

  if (!mapsApiKey) {
    return content;
  }

  return (
    <APIProvider
      apiKey={mapsApiKey}
      libraries={['marker', 'geometry']}
      language="en"
      region="NG"
    >
      {content}
    </APIProvider>
  );
}
