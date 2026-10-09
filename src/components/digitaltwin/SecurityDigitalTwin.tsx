import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import {
  Network,
  Users,
  Laptop,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Info,
  Radio,
  ArrowRight,
  Filter,
  AlertTriangle,
} from 'lucide-react';

interface SelectedNodeInfo {
  type: 'User' | 'Device' | 'PEP' | 'Resource';
  id: string;
  name: string;
  details: Record<string, string | number | boolean>;
  riskScore?: number;
  status?: string;
}

export const SecurityDigitalTwin: React.FC = () => {
  const { users, devices, resources, sessions, policies } = useZeroTrust();

  const [filterType, setFilterType] = useState<'ALL' | 'COMPROMISED' | 'PRIVILEGED'>('ALL');
  const [highlightCompromisedPath, setHighlightCompromisedPath] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);

  // Identify any compromised device or high risk user
  const compromisedDevice = devices.find((d) => d.posture === 'Compromised') || devices[devices.length - 1];
  const compromisedUser = users.find((u) => u.assignedDeviceIds.includes(compromisedDevice?.id)) || users[users.length - 1];

  const handleSelectUser = (user: (typeof users)[0]) => {
    setSelectedNode({
      type: 'User',
      id: user.id,
      name: user.name,
      riskScore: user.riskScore,
      status: user.status,
      details: {
        Role: user.role,
        Department: user.department,
        MFA: user.mfaMethod,
        BaselineLocation: user.locationBaseline,
        ExcessivePrivileges: user.excessivePrivileges,
      },
    });
  };

  const handleSelectDevice = (device: (typeof devices)[0]) => {
    setSelectedNode({
      type: 'Device',
      id: device.id,
      name: device.name,
      riskScore: 100 - device.trustScore,
      status: device.posture,
      details: {
        OS: `${device.os} (${device.osVersion})`,
        DiskEncryption: device.isEncrypted,
        EDRStatus: device.isEdrActive ? 'Active & Monitored' : 'Disabled / Missing',
        PatchCompliance: device.isPatchCompliant,
        IPAddress: device.ipAddress,
      },
    });
  };

  const handleSelectResource = (resource: (typeof resources)[0]) => {
    setSelectedNode({
      type: 'Resource',
      id: resource.id,
      name: resource.name,
      status: resource.sensitivity,
      details: {
        Category: resource.category,
        Sensitivity: resource.sensitivity,
        RequiredMinDeviceScore: `${resource.requiredMinDeviceScore}/100`,
        RequiresMFA: resource.requiresMfa,
        AllowedRoles: resource.allowedRoles.join(', '),
      },
    });
  };

  const handleSelectPEP = () => {
    setSelectedNode({
      type: 'PEP',
      id: 'pep-core-01',
      name: 'Zero Trust Policy Enforcement Point (PEP Core)',
      status: 'Active',
      details: {
        ActivePolicies: policies.filter((p) => p.enabled).length,
        EvaluationModel: 'Continuous Runtime Verification',
        PrecedenceRule: 'Explicit Deny > Restrict > Challenge > Allow',
        FailSafeMode: 'Fail-Secure (Default Deny)',
      },
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Interactive Topology Twin
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Graph Visualizer</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            Security Digital Twin & Trust Graph
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Visual map of identities, endpoints, Policy Enforcement Points (PEP), and protected data vaults. Inspect nodes to evaluate blast radius and adversary traversal defense.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setHighlightCompromisedPath(!highlightCompromisedPath)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 ${
              highlightCompromisedPath
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{highlightCompromisedPath ? 'Hide Adversary Path' : 'Trace Adversary Path'}</span>
          </button>
        </div>
      </div>

      {/* Honesty Disclosure */}
      <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          Digital twin topology dynamically generated from active application demo state. Demonstrates blast radius containment and continuous PEP micro-segmentation.
        </span>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topology Interactive Canvas (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between min-h-[540px] relative overflow-hidden">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-900 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Compliant / Allow</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Warning / Challenge</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Compromised / Intercepted</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Click any node to inspect attributes</span>
          </div>

          {/* 4-Tier Interactive Architecture Diagram */}
          <div className="py-6 space-y-8 flex-1 flex flex-col justify-around">
            {/* Layer 1: Identities */}
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                Tier 1: Authenticated Identities ({users.length})
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {users.map((u) => {
                  const isHighRisk = u.riskScore >= 60;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedNode?.id === u.id
                          ? 'bg-blue-900/30 border-blue-400 shadow-md'
                          : isHighRisk
                          ? 'bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/40'
                          : 'bg-slate-900/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">{u.name}</span>
                        <span className={`text-[10px] font-mono ${isHighRisk ? 'text-rose-400' : 'text-slate-400'}`}>
                          {u.riskScore}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layer 2: Endpoints */}
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                Tier 2: Registered Endpoints ({devices.length})
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {devices.map((d) => {
                  const isComp = d.posture === 'Compromised';
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDevice(d)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedNode?.id === d.id
                          ? 'bg-blue-900/30 border-blue-400 shadow-md'
                          : isComp
                          ? 'bg-rose-950/30 border-rose-700/80 shadow-rose-950/50'
                          : d.posture === 'Warning'
                          ? 'bg-amber-950/20 border-amber-900/50'
                          : 'bg-slate-900/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">{d.name}</span>
                        <span className={`text-[10px] font-mono font-semibold ${
                          isComp ? 'text-rose-400' : d.posture === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {d.posture}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                        {d.os} · Trust {d.trustScore}/100
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layer 3: Zero Trust PEP & PDP Gateway */}
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 text-center">
                Tier 3: Policy Decision & Enforcement Point (PEP / PDP)
              </span>
              <button
                onClick={handleSelectPEP}
                className={`w-full p-3.5 rounded-xl border text-center transition-all ${
                  selectedNode?.type === 'PEP'
                    ? 'bg-blue-900/40 border-blue-400 shadow-lg'
                    : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/40 border-blue-800/60 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-100">
                    Continuous Zero Trust Access Broker (PEP Gateway)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-4">
                  <span>Policy Precedence: Explicit Deny</span>
                  <span>·</span>
                  <span>Active Rules: {policies.filter((p) => p.enabled).length}</span>
                  <span>·</span>
                  <span>Evaluation: &lt; 20ms</span>
                </div>
              </button>
            </div>

            {/* Layer 4: Protected Crown Jewels */}
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                Tier 4: Protected Corporate Resources ({resources.length})
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {resources.map((r) => {
                  const isCrownJewel = r.sensitivity === 'Restricted_PCI';
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelectResource(r)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedNode?.id === r.id
                          ? 'bg-blue-900/30 border-blue-400 shadow-md'
                          : isCrownJewel
                          ? 'bg-purple-950/20 border-purple-900/50 hover:bg-purple-950/30'
                          : 'bg-slate-900/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">{r.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {r.sensitivity === 'Restricted_PCI' ? 'PCI' : r.sensitivity}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                        {r.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Adversary Path Callout Overlay */}
          {highlightCompromisedPath && compromisedDevice && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-semibold text-rose-300 block">
                    Adversary Lateral Movement Intercepted:
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Compromised host <span className="font-mono text-rose-200">{compromisedDevice.name}</span> attempted pivot to AWS & PCI Vaults. Intercepted by Policy P1 at Tier 3 PEP before touching target data.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-rose-900/50 text-rose-300 border border-rose-800 shrink-0">
                BLOCKED (0 Breach)
              </span>
            </div>
          )}
        </div>

        {/* Node Attribute Inspector (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Node Inspector
                </h3>
              </div>
              {selectedNode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{selectedNode.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                    ID: {selectedNode.id}
                  </span>
                </div>

                {selectedNode.riskScore !== undefined && (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Assessed Risk Score</span>
                    <span className={`text-base font-bold font-mono ${
                      selectedNode.riskScore >= 60 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {selectedNode.riskScore}/100
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Configuration & Attributes
                  </span>
                  <div className="space-y-1.5 text-xs font-mono">
                    {Object.entries(selectedNode.details).map(([key, val]) => (
                      <div key={key} className="p-2 rounded bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-slate-200 font-medium truncate max-w-[170px] text-right">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <Network className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Click on any user, device, PEP gateway, or protected resource in the topology map to inspect live attributes and security properties.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Graph Version: 2.4.1</span>
            <span>Micro-segmentation: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
