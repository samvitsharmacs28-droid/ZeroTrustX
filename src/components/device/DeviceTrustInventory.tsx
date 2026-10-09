import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { Device, DevicePosture } from '../../types';
import {
  Laptop,
  Search,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Activity,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export const DeviceTrustInventory: React.FC = () => {
  const {
    devices,
    users,
    sessions,
    updateDevicePosture,
    toggleDeviceEncryption,
    toggleDeviceEdr,
    toggleDevicePatch,
  } = useZeroTrust();

  const [searchQuery, setSearchQuery] = useState('');
  const [postureFilter, setPostureFilter] = useState<string>('ALL');

  const filteredDevices = devices.filter((d) => {
    const owner = users.find((u) => u.id === d.ownerId);
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (owner && owner.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPosture = postureFilter === 'ALL' || d.posture === postureFilter;

    return matchesSearch && matchesPosture;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Endpoint Posture Attestation
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Hardware & Sensor Telemetry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-400" />
            Device Trust & Posture Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Continuous health attestation for managed endpoints. Toggle sensor signals (EDR, disk encryption, patch level) to observe how degraded device posture immediately triggers policy denial.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Interactive: Click toggles to alter device telemetry live</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search endpoints by device name, owner, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Posture Filter:</span>
            <select
              value={postureFilter}
              onChange={(e) => setPostureFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Postures</option>
              <option value="Compliant">Compliant</option>
              <option value="Warning">Warning</option>
              <option value="Compromised">Compromised</option>
            </select>
          </div>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const owner = users.find((u) => u.id === device.ownerId);
          const activeSession = sessions.find((s) => s.deviceId === device.id && s.state === 'Active');

          const isCompromised = device.posture === 'Compromised';
          const isWarning = device.posture === 'Warning';

          return (
            <div
              key={device.id}
              className={`p-5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                isCompromised
                  ? 'bg-rose-950/20 border-rose-900/60 shadow-lg shadow-rose-950/20'
                  : isWarning
                  ? 'bg-amber-950/15 border-amber-900/50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompromised ? 'bg-rose-900/40 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-slate-100 truncate">{device.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Owner: {owner?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 ${
                      isCompromised
                        ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                        : isWarning
                        ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                        : 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                    }`}
                  >
                    {device.posture}
                  </span>
                </div>

                {/* Specs */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">OS Build:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{device.os} {device.osVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP / MAC:</span>
                    <span className="text-slate-300">{device.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trust Score:</span>
                    <span className={`font-bold ${device.trustScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {device.trustScore}/100
                    </span>
                  </div>
                </div>

                {/* Interactive Signal Controls */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Telemetry Controls (Live Toggles)
                  </span>

                  {/* Disk Encryption Toggle */}
                  <button
                    onClick={() => toggleDeviceEncryption(device.id)}
                    className="w-full p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span className="text-slate-400 flex items-center gap-1.5">
                      {device.isEncrypted ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-rose-400" />}
                      Disk Encryption (FileVault/BitLocker)
                    </span>
                    <span className={`font-mono font-semibold ${device.isEncrypted ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {device.isEncrypted ? 'ENCRYPTED' : 'UNENCRYPTED'}
                    </span>
                  </button>

                  {/* EDR Sensor Toggle */}
                  <button
                    onClick={() => toggleDeviceEdr(device.id)}
                    className="w-full p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Activity className={`w-3.5 h-3.5 ${device.isEdrActive ? 'text-emerald-400' : 'text-rose-400'}`} />
                      EDR Host Agent
                    </span>
                    <span className={`font-mono font-semibold ${device.isEdrActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {device.isEdrActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </button>

                  {/* Patch Compliance Toggle */}
                  <button
                    onClick={() => toggleDevicePatch(device.id)}
                    className="w-full p-2 rounded-lg bg-slate-950/50 hover:bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CheckCircle className={`w-3.5 h-3.5 ${device.isPatchCompliant ? 'text-emerald-400' : 'text-amber-400'}`} />
                      OS Patch Compliance
                    </span>
                    <span className={`font-mono font-semibold ${device.isPatchCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {device.isPatchCompliant ? 'COMPLIANT' : 'OVERDUE'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeSession ? 'Session active' : 'Idle'}
                </span>

                <div className="flex items-center gap-2">
                  {device.posture !== 'Compromised' ? (
                    <button
                      onClick={() => updateDevicePosture(device.id, 'Compromised')}
                      className="px-2.5 py-1 text-[11px] text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 rounded-md transition-colors"
                    >
                      Simulate Infection
                    </button>
                  ) : (
                    <button
                      onClick={() => updateDevicePosture(device.id, 'Compliant')}
                      className="px-2.5 py-1 text-[11px] text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/60 rounded-md transition-colors"
                    >
                      Remediate Host
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
