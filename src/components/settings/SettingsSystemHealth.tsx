import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Download,
  Upload,
  Info,
  Server,
  Key,
  Layers,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const SettingsSystemHealth: React.FC = () => {
  const {
    users,
    devices,
    policies,
    sessions,
    incidents,
    auditLogs,
    riskConfig,
    resetToDefaultData,
    showToast,
  } = useZeroTrust();

  const handleExportSnapshot = () => {
    const snapshot = {
      version: '2.0.4',
      timestamp: new Date().toISOString(),
      users,
      devices,
      policies,
      sessions,
      incidents,
      auditLogs,
      riskConfig,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zerotrustx_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ type: 'success', title: 'Snapshot Exported', message: 'Demo state downloaded as JSON file.' });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Platform Administration
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Architecture & System Health</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            ZeroTrustX 2.0 System Health & Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Verify runtime parameters, inspect NIST SP 800-207 Zero Trust compliance invariants, manage local state snapshots, or reset to demo baseline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportSnapshot}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Snapshot</span>
          </button>
          <button
            onClick={resetToDefaultData}
            className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {/* System Health Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between text-xs">
          <span className="text-slate-400 block mb-1">PEP Enforcement Latency</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">14 ms</span>
          <span className="text-[11px] text-slate-500 mt-1">99.9th percentile eval</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between text-xs">
          <span className="text-slate-400 block mb-1">State Subsystem</span>
          <span className="text-2xl font-bold font-mono text-blue-400">Synchronized</span>
          <span className="text-[11px] text-slate-500 mt-1">Local persistent reactive store</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between text-xs">
          <span className="text-slate-400 block mb-1">Continuous Posture Poll</span>
          <span className="text-2xl font-bold font-mono text-slate-100">15 sec</span>
          <span className="text-[11px] text-slate-500 mt-1">Host telemetry cadence</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between text-xs">
          <span className="text-slate-400 block mb-1">Fail-Safe Default</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">FAIL-SECURE</span>
          <span className="text-[11px] text-slate-500 mt-1">Catch-all explicit DENY</span>
        </div>
      </div>

      {/* NIST SP 800-207 Zero Trust Tenets Checklist */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>NIST SP 800-207 Zero Trust Core Tenets Mapping</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200 block">1. All data sources and computing services are resources</span>
            <p className="text-slate-400">ZeroTrustX 2.0 catalogs cloud infrastructure, financial ledgers, code repositories, and PCI data as distinct policy-bound resources.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200 block">2. All communication is secured regardless of network location</span>
            <p className="text-slate-400">Internal corporate LANs are treated with the exact same zero-trust scrutiny as open public internet or VPN traffic.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200 block">3. Access to individual enterprise resources is granted on a per-session basis</span>
            <p className="text-slate-400">Trust is never inherited. Each connection requires explicit dynamic authorization matching resource sensitivity.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200 block">4. Access is determined by dynamic policy including client posture</span>
            <p className="text-slate-400">Our adaptive risk engine continuously evaluates hardware FIDO2 credentials, EDR status, and geolocation velocity.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200 block">5. The enterprise monitors and measures the integrity of all assets</span>
            <p className="text-slate-400">Device health attestation checks EDR active state, disk encryption, and OS patch compliance before and during sessions.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200 block">6. Authentication and authorization are dynamic and strictly enforced</span>
            <p className="text-slate-400">Continuous session trust severs active TCP sockets within milliseconds when risk escalates beyond configured thresholds.</p>
          </div>
        </div>
      </div>

      {/* Security Assumptions & Honesty Disclosure */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Security Assumptions & Demonstration Boundaries</span>
        </div>
        <ul className="space-y-2 text-slate-400 leading-relaxed list-disc list-inside text-[11px]">
          <li><strong>No Real Passwords or Secrets:</strong> All user records, device telemetry, and simulation events are synthetic fixtures. No real credentials or tokens are stored.</li>
          <li><strong>Simulated Hardware Attestation:</strong> Device posture signals (EDR agents, TPM cryptographic chips, FileVault encryption) are simulated via deterministic software models rather than native kernel drivers.</li>
          <li><strong>Safe Attack Laboratory:</strong> Attack simulations evaluate genuine risk and policy algorithms against simulated state without sending live attack traffic to external networks.</li>
          <li><strong>Fail-Secure Architecture:</strong> Default behavior rejects access whenever an unexpected condition or corrupt request payload is presented.</li>
        </ul>
      </div>
    </div>
  );
};
