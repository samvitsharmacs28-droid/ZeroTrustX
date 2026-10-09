import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Laptop,
  Radio,
  KeyRound,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  onNavigate: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigate }) => {
  const {
    users,
    devices,
    resources,
    sessions,
    incidents,
    auditLogs,
    postureScore,
    activeSessionsCount,
    privilegedSessionsCount,
    highRiskIdentitiesCount,
    policyViolationsCount,
    startSignatureDemo,
  } = useZeroTrust();

  // Calculate actual decision counts from audit logs
  const totalDecisions = auditLogs.filter((a) => a.eventType === 'ACCESS_DECISION').length || 1;
  const allowedCount = auditLogs.filter((a) => a.outcome === 'ALLOWED').length;
  const challengedCount = auditLogs.filter((a) => a.outcome === 'CHALLENGED').length;
  const restrictedCount = auditLogs.filter((a) => a.outcome === 'RESTRICTED').length;
  const deniedCount = auditLogs.filter((a) => a.outcome === 'DENIED' || a.outcome === 'REVOKED').length;

  // Calculate risk distribution of users
  const lowRiskUsers = users.filter((u) => u.riskScore < 30).length;
  const medRiskUsers = users.filter((u) => u.riskScore >= 30 && u.riskScore < 60).length;
  const highRiskUsers = users.filter((u) => u.riskScore >= 60 && u.riskScore < 80).length;
  const criticalRiskUsers = users.filter((u) => u.riskScore >= 80).length;

  // Get most recent events
  const recentEvents = auditLogs.slice(0, 6);

  // Top high risk identities
  const highRiskIdentities = [...users]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Mission Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Zero Trust Security Posture
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Continuous Verification Active</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">
            ZeroTrustX 2.0 Security Operations Command
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time identity verification, adaptive device posture validation, and automated policy enforcement. Access decisions are evaluated continuously per session.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={startSignatureDemo}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Launch 10-Step Showcase</span>
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Simulation Lab</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Posture Score */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Posture Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {postureScore}<span className="text-xs text-slate-500 font-sans font-normal">/100</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Calculated live</span>
            </div>
          </div>
        </div>

        {/* Active Identities */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Users & Devices</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {users.length} <span className="text-xs text-slate-500 font-sans font-normal">/ {devices.length} dev</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {devices.filter((d) => d.posture === 'Compliant').length} compliant devices
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Sessions</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {activeSessionsCount}
            </div>
            <div className="text-[11px] text-indigo-400 mt-0.5">
              {privilegedSessionsCount} privileged sessions
            </div>
          </div>
        </div>

        {/* High Risk Identities */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>High Risk Users</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">
              {highRiskIdentitiesCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Score &gt;= 60/100 threshold
            </div>
          </div>
        </div>

        {/* Blocked / Violations */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Policy Enforcements</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {policyViolationsCount}
            </div>
            <div className="text-[11px] text-rose-400 mt-0.5">
              {deniedCount} denied access
            </div>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Open Incidents</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {incidents.filter((i) => i.status === 'Open').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {incidents.length} total logged
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Visual Charts & Trust Topology Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Access Decisions Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-200">
                Access Decisions Distribution
              </h2>
              <p className="text-[11px] text-slate-400">
                Zero Trust PEP outcomes
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {totalDecisions} total decisions
            </span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {/* ALLOW */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span>
                  ALLOW
                </span>
                <span className="font-mono tabular-nums text-slate-400">{allowedCount}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((allowedCount / Math.max(1, totalDecisions)) * 100))}%` }}
                />
              </div>
            </div>

            {/* CHALLENGE */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block"></span>
                  CHALLENGE (Step-up MFA)
                </span>
                <span className="font-mono tabular-nums text-slate-400">{challengedCount}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((challengedCount / Math.max(1, totalDecisions)) * 100))}%` }}
                />
              </div>
            </div>

            {/* RESTRICT */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block"></span>
                  RESTRICT (Sandbox)
                </span>
                <span className="font-mono tabular-nums text-slate-400">{restrictedCount}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((restrictedCount / Math.max(1, totalDecisions)) * 100))}%` }}
                />
              </div>
            </div>

            {/* DENY */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-rose-500 inline-block"></span>
                  DENY (Explicit Block)
                </span>
                <span className="font-mono tabular-nums text-slate-400">{deniedCount}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((deniedCount / Math.max(1, totalDecisions)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enforcement Rule: Explicit Deny Precedence</span>
            <button
              onClick={() => onNavigate('policies')}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View Rules</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Identity Risk Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-200">
                Identity Risk Classification
              </h2>
              <p className="text-[11px] text-slate-400">
                Continuous score thresholds
              </p>
            </div>
            <button
              onClick={() => onNavigate('risk-analytics')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Config</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[11px] text-emerald-400 font-medium">Low (0–29)</span>
              <div className="text-xl font-bold font-mono text-slate-100">{lowRiskUsers}</div>
              <span className="text-[10px] text-slate-500">Normal Trust Baseline</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[11px] text-amber-400 font-medium">Medium (30–59)</span>
              <div className="text-xl font-bold font-mono text-slate-100">{medRiskUsers}</div>
              <span className="text-[10px] text-slate-500">Requires Step-up MFA</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[11px] text-orange-400 font-medium">High (60–79)</span>
              <div className="text-xl font-bold font-mono text-slate-100">{highRiskUsers}</div>
              <span className="text-[10px] text-slate-500">Restricted Operations</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[11px] text-rose-400 font-medium">Critical (80–100)</span>
              <div className="text-xl font-bold font-mono text-rose-300">{criticalRiskUsers}</div>
              <span className="text-[10px] text-slate-500">Immediate Termination</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Scoring Model: 10 weighted multi-vector telemetry signals</span>
          </div>
        </div>

        {/* Visual Trust Map Preview */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xs font-semibold text-slate-200">
                Zero Trust Architecture Map
              </h2>
              <p className="text-[11px] text-slate-400">
                End-to-end enforcement plane
              </p>
            </div>
            <button
              onClick={() => onNavigate('digital-twin')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Interactive Graph</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Topology diagram preview */}
          <div className="my-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-300">6 Identities</span>
              </div>
              <span className="text-slate-600 font-mono">────►</span>
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300">6 Endpoints</span>
              </div>
            </div>

            <div className="flex items-center justify-center py-1">
              <div className="w-full py-1.5 px-3 rounded bg-blue-950/40 border border-blue-900/60 text-center">
                <span className="text-[11px] font-semibold text-blue-300">
                  Zero Trust Policy Decision Point (PDP / PEP)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">5 Protected Vaults</span>
              </div>
              <span className="text-slate-600 font-mono">◄────</span>
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-slate-300">{activeSessionsCount} Live Sessions</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Continuous Trust Verification</span>
            <span className="text-emerald-400 font-medium">Strict Micro-segmentation</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: High Risk Identites Spotlight & Live Security Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Identities Spotlight */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-200">
                High-Risk Identity Watchlist
              </h2>
              <p className="text-[11px] text-slate-400">
                Accounts exceeding anomalous baseline thresholds
              </p>
            </div>
            <button
              onClick={() => onNavigate('identity')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {highRiskIdentities.map((user) => {
              const riskColor =
                user.riskScore >= 80 ? 'text-rose-400 bg-rose-950/40 border-rose-900/40' :
                user.riskScore >= 60 ? 'text-orange-400 bg-orange-950/40 border-orange-900/40' :
                'text-amber-400 bg-amber-950/40 border-amber-900/40';

              return (
                <div
                  key={user.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-200 truncate">{user.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({user.role})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user.department} · {user.status}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${riskColor}`}>
                      Risk {user.riskScore}
                    </span>
                    <button
                      onClick={() => onNavigate('identity')}
                      className="text-slate-400 hover:text-slate-200 p-1"
                      title="Inspect user"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Security Event Feed */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-200">
                Recent Security Audit Feed
              </h2>
              <p className="text-[11px] text-slate-400">
                Deterministic policy evaluation timeline
              </p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Full Audit Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentEvents.map((event) => {
              const outcomeBadge =
                event.outcome === 'ALLOWED' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40' :
                event.outcome === 'CHALLENGED' ? 'text-amber-400 bg-amber-950/40 border-amber-900/40' :
                event.outcome === 'RESTRICTED' ? 'text-blue-400 bg-blue-950/40 border-blue-900/40' :
                'text-rose-400 bg-rose-950/40 border-rose-900/40';

              const timeStr = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={event.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${outcomeBadge}`}>
                        {event.outcome}
                      </span>
                      <span className="font-medium text-slate-300 truncate">{event.actor}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-slate-400 truncate">{event.target}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate leading-snug">
                      {event.reason}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {timeStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
