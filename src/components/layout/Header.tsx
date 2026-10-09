import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { RotateCcw, Play, Shield, Terminal } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Executive Command Center',
  simulation: 'Security Attack Simulation Lab',
  'digital-twin': 'Security Digital Twin & Trust Graph',
  playground: 'Explainable Policy Playground',
  identity: 'Identity & Access Management',
  devices: 'Device Trust & Posture Inventory',
  policies: 'Zero Trust Policy Rule Management',
  sessions: 'Continuous Session Trust Monitoring',
  incidents: 'Security Incident Response Center',
  'risk-analytics': 'Adaptive Risk Scoring Engine',
  'access-requests': 'Just-In-Time Access Requests',
  audit: 'Immutable Audit & Compliance Trails',
  settings: 'System Health & Engine Configuration',
};

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    activeUser,
    activeRole,
    postureScore,
    activeSessionsCount,
    resetToDefaultData,
  } = useZeroTrust();

  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/90 backdrop-blur-md px-6 flex items-center justify-between gap-8 z-20 shrink-0">
      {/* Zone 1: Breadcrumb */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-slate-500 font-medium">ZeroTrustX</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-semibold truncate">
          {TAB_TITLES[currentTab] || 'Dashboard'}
        </span>
      </div>

      {/* Zone 2: System Telemetry Stats */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Posture:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-200">
            {postureScore}/100
          </span>
        </div>
        <span className="text-slate-800">·</span>
        <div className="flex items-center gap-2">
          <span>Active Sessions:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-200">
            {activeSessionsCount}
          </span>
        </div>
        <span className="text-slate-800">·</span>
        <div className="flex items-center gap-2">
          <span>Logged as:</span>
          <span className="font-medium text-slate-300">{activeUser.name}</span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {activeRole}
          </span>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={resetToDefaultData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          title="Reset application to clean demonstration baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo</span>
        </button>

        <button
          onClick={() => setCurrentTab('simulation')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Simulation</span>
        </button>
      </div>
    </header>
  );
};
