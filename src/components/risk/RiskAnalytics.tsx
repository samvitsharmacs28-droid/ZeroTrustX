import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { RiskConfig } from '../../types';
import {
  Sparkles,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  RotateCcw,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { INITIAL_RISK_CONFIG } from '../../services/demoData';

export const RiskAnalytics: React.FC = () => {
  const {
    users,
    devices,
    resources,
    riskConfig,
    updateRiskConfig,
    riskEngine,
  } = useZeroTrust();

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0].id);
  const [editingConfig, setEditingConfig] = useState<RiskConfig>(riskConfig);

  const targetUser = users.find((u) => u.id === selectedUserId) || users[0];
  const targetDevice = devices.find((d) => targetUser.assignedDeviceIds.includes(d.id)) || devices[0];
  const targetResource = resources[0];

  const liveEvaluation = riskEngine.evaluateRisk({
    user: targetUser,
    device: targetDevice,
    resource: targetResource,
  });

  const handleSaveConfig = () => {
    updateRiskConfig(editingConfig);
  };

  const handleResetConfig = () => {
    setEditingConfig(INITIAL_RISK_CONFIG);
    updateRiskConfig(INITIAL_RISK_CONFIG);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Adaptive Risk Scoring Engine
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Multi-Signal Weighted Formulation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Adaptive Risk Engine & Telemetry Signals
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Deterministic, explainable risk scoring combining 10 orthogonal telemetry vectors. Zero double-counting, transparent weights, and configurable thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetConfig}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
          >
            Apply Tuning
          </button>
        </div>
      </div>

      {/* Mathematical Formulation Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">Mathematical Scoring Model & Normalization Formula:</span>
          <span className="font-mono text-blue-400 text-[11px]">Normalized Continuous Score ∈ [0, 100]</span>
        </div>
        <p className="font-mono text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          RiskScore = min(100, (Σ [ Signal_i × Weight_i ] / Σ [ Weight_i ]) ) + Overrides(Compromised_Host: 85, Impossible_Travel: 82, Dormant: 80)
        </p>
        <p className="text-[11px] text-slate-500">
          *Note: This architecture is an explainable rules & signals engine with typed vector inputs, allowing drop-in integration of trained anomaly detection models without UI refactoring.
        </p>
      </div>

      {/* Grid: Live Signal Breakdown Inspector + Weights Tuning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signal Breakdown for Selected User (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                10-Signal Telemetry Decomposition
              </h2>
              <span className="text-[11px] text-slate-400">
                Inspect calculated signals for active identity
              </span>
            </div>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}) — Risk {u.riskScore}
                </option>
              ))}
            </select>
          </div>

          {/* User Score Summary Header */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-200 block">{targetUser.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {targetUser.role} · Bound Device: {targetDevice.name}
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {liveEvaluation.overallScore}
                <span className="text-xs text-slate-500 font-sans">/100</span>
              </span>
              <span className={`text-[11px] font-mono font-semibold block ${
                liveEvaluation.classification === 'Critical' ? 'text-rose-400' :
                liveEvaluation.classification === 'High' ? 'text-orange-400' :
                liveEvaluation.classification === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {liveEvaluation.classification} Risk
              </span>
            </div>
          </div>

          {/* 10 Signals List */}
          <div className="space-y-2 text-xs">
            {liveEvaluation.signals.map((sig) => {
              const isElevated = sig.score > 40;
              return (
                <div
                  key={sig.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isElevated
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : 'bg-slate-950/50 border-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{sig.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {sig.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] text-slate-500">Weight: {sig.weight}</span>
                      <span className={`font-bold ${isElevated ? 'text-rose-400' : 'text-slate-300'}`}>
                        {sig.score}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {sig.description}
                  </p>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Observed Value: <span className="font-mono text-slate-300">{String(sig.rawValue)}</span></span>
                    {sig.mitigationTip && (
                      <span className="text-blue-400 truncate max-w-[260px]">💡 {sig.mitigationTip}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weights Tuning & Thresholds (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Threshold Sliders */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800">
              Risk Classification Thresholds
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Low Risk Cutoff:</span>
                  <span className="font-mono font-bold text-emerald-400">0 – {editingConfig.thresholds.lowMax}</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={45}
                  value={editingConfig.thresholds.lowMax}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      thresholds: { ...editingConfig.thresholds, lowMax: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Medium Risk Cutoff:</span>
                  <span className="font-mono font-bold text-amber-400">{editingConfig.thresholds.lowMax + 1} – {editingConfig.thresholds.mediumMax}</span>
                </div>
                <input
                  type="range"
                  min={46}
                  max={70}
                  value={editingConfig.thresholds.mediumMax}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      thresholds: { ...editingConfig.thresholds, mediumMax: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>High Risk Cutoff:</span>
                  <span className="font-mono font-bold text-orange-400">{editingConfig.thresholds.mediumMax + 1} – {editingConfig.thresholds.highMax}</span>
                </div>
                <input
                  type="range"
                  min={71}
                  max={89}
                  value={editingConfig.thresholds.highMax}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      thresholds: { ...editingConfig.thresholds, highMax: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
              Critical Risk applies to any score above {editingConfig.thresholds.highMax}/100.
            </div>
          </div>

          {/* Weights Tuning Sliders */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 pb-2 border-b border-slate-800">
              Signal Weight Factors
            </h3>

            <div className="space-y-2.5 text-[11px]">
              {Object.entries(editingConfig.weights).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-mono text-blue-400 font-semibold">{val.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.3}
                    step={0.01}
                    value={val}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        weights: {
                          ...editingConfig.weights,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
