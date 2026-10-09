import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  LayoutDashboard,
  FlaskConical,
  Network,
  SlidersHorizontal,
  Users,
  Laptop,
  ScrollText,
  Radio,
  AlertOctagon,
  Sparkles,
  ClipboardList,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
}) => {
  const {
    activeRole,
    setActiveRole,
    incidents,
    accessRequests,
    startSignatureDemo,
  } = useZeroTrust();

  const openIncidentsCount = incidents.filter((i) => i.status === 'Open').length;
  const pendingRequestsCount = accessRequests.filter((r) => r.status === 'Pending').length;

  const navGroups: NavGroup[] = [
    {
      label: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'simulation', label: 'Attack Simulation Lab', icon: FlaskConical, highlight: true },
        { id: 'digital-twin', label: 'Security Digital Twin', icon: Network },
        { id: 'playground', label: 'Policy Playground', icon: SlidersHorizontal },
      ],
    },
    {
      label: 'Trust & Enforcement',
      items: [
        { id: 'identity', label: 'Identity & Access', icon: Users },
        { id: 'devices', label: 'Device Inventory', icon: Laptop },
        { id: 'policies', label: 'Policy Management', icon: ScrollText },
        { id: 'sessions', label: 'Continuous Sessions', icon: Radio },
      ],
    },
    {
      label: 'Response & Governance',
      items: [
        { id: 'incidents', label: 'Incident Center', icon: AlertOctagon, badge: openIncidentsCount },
        { id: 'risk-analytics', label: 'Risk Scoring Engine', icon: Sparkles },
        { id: 'access-requests', label: 'JIT Access Requests', icon: ClipboardList, badge: pendingRequestsCount },
        { id: 'audit', label: 'Audit & Compliance', icon: History },
        { id: 'settings', label: 'Settings & Health', icon: Settings },
      ],
    },
  ];

  const roles: UserRole[] = ['Administrator', 'Security Analyst', 'Employee', 'Contractor', 'Auditor'];

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-900 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-900">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap">
                ZeroTrustX <span className="text-blue-400 font-mono text-xs">2.0</span>
              </span>
              <span className="text-[11px] text-slate-500 tracking-wide whitespace-nowrap">
                Adaptive ZTNA & Identity
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-300 hover:bg-slate-900 p-1.5 rounded-md transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Guided Walkthrough Banner */}
      {!collapsed && (
        <div className="p-3 mx-3 mt-3 rounded-lg bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border border-blue-900/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-blue-200">Signature Showcase</span>
            <span className="text-[10px] text-blue-400 font-mono">10 Steps</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            "One Compromised Device. One Adaptive Defense."
          </p>
          <button
            onClick={startSignatureDemo}
            className="w-full mt-2.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            Launch Walkthrough
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                    {!collapsed && item.highlight && (
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-blue-500/20 text-blue-300">
                        LAB
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role Switcher in Sidebar footer */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/80">
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulated Persona</span>
            </div>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center" title={`Active Persona: ${activeRole}`}>
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">
              {activeRole.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
