import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { SimulationScenario } from '../../types';
import {
  FlaskConical,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  Activity,
  Cpu,
} from 'lucide-react';

export const AttackSimulationLab: React.FC = () => {
  const {
    simulationScenarios,
    runSimulation,
    simulationRunning,
    lastSimulationResult,
    resetToDefaultData,
    users,
    devices,
    resources,
    startSignatureDemo,
  } = useZeroTrust();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(simulationScenarios[0].id);

  const activeScenario = simulationScenarios.find((s) => s.id === selectedScenarioId) || simulationScenarios[0];
  const targetUser = users.find((u) => u.id === activeScenario.targetUserId) || users[0];
  const targetDevice = devices.find((d) => d.id === activeScenario.targetDeviceId) || devices[0];
  const targetResource = resources.find((r) => r.id === activeScenario.targetResourceId) || resources[0];

  const handleLaunch = async () => {
    await runSimulation(activeScenario.id);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Interactive Defense Simulation
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Controlled Telemetry Environment</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-400" />
            Security Attack Simulation Laboratory
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Test the Zero Trust policy engine and adaptive risk scoring against adversarial attack vectors in real-time. Every simulation recalculates live scores, updates active sessions, and logs security incidents.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={startSignatureDemo}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch 10-Step Story</span>
          </button>
          <button
            onClick={resetToDefaultData}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scenario Selector + Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selectable Scenarios (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Threat Scenario ({simulationScenarios.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">MITRE ATT&CK Mapped</span>
          </div>

          <div className="space-y-2">
            {simulationScenarios.map((scen) => {
              const isSelected = scen.id === selectedScenarioId;
              const isCompromised = scen.category === 'Endpoint Integrity';

              return (
                <button
                  key={scen.id}
                  onClick={() => setSelectedScenarioId(scen.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-lg'
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-200">{scen.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                      {scen.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {scen.summary}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{scen.mitreTechnique}</span>
                    <span className={scen.expectedOutcome === 'DENY' ? 'text-rose-400' : 'text-amber-400'}>
                      Expected: {scen.expectedOutcome}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Scenario Details, Live Execution & Outcomes (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Scenario Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/40">
                    {activeScenario.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeScenario.mitreTechnique}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1.5">
                  {activeScenario.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeScenario.summary}
                </p>
              </div>

              <button
                onClick={handleLaunch}
                disabled={simulationRunning}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg text-white transition-all shadow-md flex items-center gap-2 shrink-0 ${
                  simulationRunning
                    ? 'bg-blue-700/60 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                }`}
              >
                {simulationRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-blue-200" />
                    <span>Evaluating Risk...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Execute Attack Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* Target Entities Involved */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Identity</span>
                <span className="font-medium text-slate-200 block truncate mt-0.5">{targetUser.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{targetUser.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Requesting Endpoint</span>
                <span className="font-medium text-slate-200 block truncate mt-0.5">{targetDevice.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{targetDevice.os} · {targetDevice.posture}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Resource</span>
                <span className="font-medium text-slate-200 block truncate mt-0.5">{targetResource.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{targetResource.sensitivity}</span>
              </div>
            </div>

            {/* Injected Attack Payload Details */}
            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulated Adversarial Injected Event</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activeScenario.simulatedEvent.eventDescription}
              </p>
              {activeScenario.simulatedEvent.suspiciousAction && (
                <div className="text-[10px] font-mono text-rose-400/90 pt-1">
                  Signature: {activeScenario.simulatedEvent.suspiciousAction}
                </div>
              )}
            </div>
          </div>

          {/* Simulation Outcome & Decision Breakdown Card */}
          {lastSimulationResult && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Zero Trust Policy Decision Engine Output
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Ref: {lastSimulationResult.evaluation.correlationId}
                </span>
              </div>

              {/* Decision Badge & Score Transition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Decision */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Policy Decision</span>
                  <div className="mt-1">
                    <span
                      className={`text-lg font-bold font-mono px-2 py-0.5 rounded border inline-block ${
                        lastSimulationResult.evaluation.decision === 'DENY'
                          ? 'text-rose-400 bg-rose-950/40 border-rose-800/60'
                          : lastSimulationResult.evaluation.decision === 'CHALLENGE'
                          ? 'text-amber-400 bg-amber-950/40 border-amber-800/60'
                          : lastSimulationResult.evaluation.decision === 'RESTRICT'
                          ? 'text-blue-400 bg-blue-950/40 border-blue-800/60'
                          : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60'
                      }`}
                    >
                      {lastSimulationResult.evaluation.decision}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 truncate">
                    Matched: {lastSimulationResult.evaluation.matchedPolicyName}
                  </span>
                </div>

                {/* Score Transition */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Risk Score Shift</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold font-mono text-slate-400">
                      {lastSimulationResult.initialScore}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xl font-bold font-mono text-rose-400">
                      {lastSimulationResult.finalScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Classification: {lastSimulationResult.evaluation.riskResult.classification}
                  </span>
                </div>

                {/* System Impact */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase">Mesh Impact</span>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-300">
                    <div>Sessions Updated: <span className="font-mono text-blue-400 font-semibold">{lastSimulationResult.sessionsUpdated}</span></div>
                    <div>Incident Created: <span className="font-mono text-rose-400 font-semibold">{lastSimulationResult.incidentCreated ? 'Yes (Open)' : 'No'}</span></div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Audit log written
                  </span>
                </div>
              </div>

              {/* Explainable Reasoning */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Explainable Decision Justification</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {lastSimulationResult.evaluation.humanExplanation}
                </p>

                {/* Evidence considered */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evidence Factors Evaluated:</span>
                  {lastSimulationResult.evaluation.evidence.map((ev, i) => (
                    <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5 font-mono">
                      <span className="text-blue-400">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Guidance */}
              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs space-y-1.5">
                <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold block">
                  Recommended SOC & User Remediation:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {lastSimulationResult.evaluation.remediation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
