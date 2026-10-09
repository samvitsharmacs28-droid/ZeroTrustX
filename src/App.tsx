import React, { useState } from 'react';
import { ZeroTrustProvider } from './context/ZeroTrustContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/layout/ToastContainer';
import { SignatureDemoModal } from './components/simulation/SignatureDemoModal';

import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AttackSimulationLab } from './components/simulation/AttackSimulationLab';
import { SecurityDigitalTwin } from './components/digitaltwin/SecurityDigitalTwin';
import { PolicyPlayground } from './components/policy/PolicyPlayground';
import { IdentityManagement } from './components/identity/IdentityManagement';
import { DeviceTrustInventory } from './components/device/DeviceTrustInventory';
import { PolicyManagement } from './components/policy/PolicyManagement';
import { ContinuousSessionTrust } from './components/sessions/ContinuousSessionTrust';
import { SecurityIncidentCenter } from './components/incidents/SecurityIncidentCenter';
import { RiskAnalytics } from './components/risk/RiskAnalytics';
import { AccessRequests } from './components/access/AccessRequests';
import { AuditCompliance } from './components/audit/AuditCompliance';
import { SettingsSystemHealth } from './components/settings/SettingsSystemHealth';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <ExecutiveDashboard onNavigate={setCurrentTab} />;
      case 'simulation':
        return <AttackSimulationLab />;
      case 'digital-twin':
        return <SecurityDigitalTwin />;
      case 'playground':
        return <PolicyPlayground />;
      case 'identity':
        return <IdentityManagement />;
      case 'devices':
        return <DeviceTrustInventory />;
      case 'policies':
        return <PolicyManagement />;
      case 'sessions':
        return <ContinuousSessionTrust />;
      case 'incidents':
        return <SecurityIncidentCenter />;
      case 'risk-analytics':
        return <RiskAnalytics />;
      case 'access-requests':
        return <AccessRequests />;
      case 'audit':
        return <AuditCompliance />;
      case 'settings':
        return <SettingsSystemHealth />;
      default:
        return <ExecutiveDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <SignatureDemoModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ZeroTrustProvider>
      <AppContent />
    </ZeroTrustProvider>
  );
}
