import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { MFAMethod, DevicePosture, PolicyAction } from '../../types';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const PolicyPlayground: React.FC = () => {
  const { users, devices, resources, evaluateAccess, policies } = useZeroTrust();

  // Playground form state
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0].id);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0].id);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0].id);
  const [overridePosture, setOverridePosture] = useState<DevicePosture>('Compliant');
  const [overrideMfa, setOverrideMfa] = useState<MFAMethod>('FIDO2_HARDWARE_KEY');
  const [overrideLocation, setOverrideLocation] = useState<string>('San Francisco, US');
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isOffHours, setIsOffHours] = useState<boolean>(false);
  const [suspiciousFlag, setSuspiciousFlag] = useState<boolean>(false);

  // Result state
  const [evaluationResult, setEvaluationResult] = useState<ReturnType<typeof evaluateAccess> | null>(() => {
    return evaluateAccess(users[0].id, resources[0].id, devices[0].id);
  });

  const handleEvaluate = () => {
    const user = users.find((u) => u.id === selectedUserId) || users[0];
    const modifiedUser = {
      ...user,
      mfaMethod: overrideMfa,
      mfaEnrolled: overrideMfa !== 'NONE',
    };

    const res = evaluateAccess(selectedUserId, selectedResourceId, selectedDeviceId, {
      location: overrideLocation,
      speedKmh,
      failedAttempts,
      isOffHours,
      suspiciousActivityFlag: suspiciousFlag,
      suspiciousActivityDetail: suspiciousFlag ? 'Manual simulation flag: suspicious memory hook detected' : undefined,
      overrideDevicePosture: overridePosture,
    });
    setEvaluationResult(res);
  };

  const handleResetToPresets = (preset: 'SAFE' | 'COMPROMISED_HOST' | 'IMPOSSIBLE_TRAVEL' | 'BRUTE_FORCE') => {
    if (preset === 'SAFE') {
      setSelectedUserId(users[0].id);
      setSelectedResourceId(resources[1].id);
      setSelectedDeviceId(devices[0].id);
      setOverridePosture('Compliant');
      setOverrideMfa('FIDO2_HARDWARE_KEY');
      setOverrideLocation('San Francisco, US');
      setSpeedKmh(0);
      setFailedAttempts(0);
      setIsOffHours(false);
      setSuspiciousFlag(false);
    } else if (preset === 'COMPROMISED_HOST') {
      setSelectedUserId(users[2].id); // Sarah
      setSelectedResourceId(resources[1].id); // Finance vault
      setSelectedDeviceId(devices[2].id);
      setOverridePosture('Compromised');
      setOverrideMfa('FIDO2_HARDWARE_KEY');
      setSpeedKmh(0);
      setFailedAttempts(0);
      setSuspiciousFlag(true);
    } else if (preset === 'IMPOSSIBLE_TRAVEL') {
      setSelectedUserId(users[0].id);
      setSelectedResourceId(resources[0].id);
      setOverridePosture('Compliant');
      setOverrideLocation('London, UK');
      setSpeedKmh(12000);
      setFailedAttempts(0);
    } else if (preset === 'BRUTE_FORCE') {
      setSelectedUserId(users[1].id);
      setOverrideMfa('SMS_OTP');
      setFailedAttempts(6);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Interactive Policy Sandbox
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">What-If Decision Simulator</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            Explainable Zero Trust Policy Playground
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manipulate any identity attribute, endpoint posture signal, geographic origin, or authentication strength to observe real-time policy evaluation, conflict resolution, and decision rationale.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
          <button
            onClick={() => handleResetToPresets('SAFE')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Safe Baseline
          </button>
          <button
            onClick={() => handleResetToPresets('COMPROMISED_HOST')}
            className="px-2.5 py-1 text-xs rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 transition-colors"
          >
            Host Compromised
          </button>
          <button
            onClick={() => handleResetToPresets('IMPOSSIBLE_TRAVEL')}
            className="px-2.5 py-1 text-xs rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-900/50 transition-colors"
          >
            Impossible Velocity
          </button>
        </div>
      </div>

      {/* Grid: Inputs Configuration + Live Decision Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Conditions Controls (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Access Request Parameters
            </h2>
            <button
              onClick={() => handleResetToPresets('SAFE')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Identity Selector */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Requesting Identity</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.department}, Status: {u.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Resource */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Target Protected Resource</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — Sensitivity: {r.sensitivity}
                  </option>
                ))}
              </select>
            </div>

            {/* Requesting Device */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Requesting Device</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.os}, Trust: {d.trustScore}/100)
                  </option>
                ))}
              </select>
            </div>

            {/* Device Posture Override */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Device Health Posture</label>
                <select
                  value={overridePosture}
                  onChange={(e) => setOverridePosture(e.target.value as DevicePosture)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Compliant">Compliant (EDR Active, Encrypted)</option>
                  <option value="Warning">Warning (Patch Overdue)</option>
                  <option value="Compromised">Compromised (Malware / Rooted)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">MFA Method Presented</label>
                <select
                  value={overrideMfa}
                  onChange={(e) => setOverrideMfa(e.target.value as MFAMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="FIDO2_HARDWARE_KEY">FIDO2 Hardware Key (Phishing-resistant)</option>
                  <option value="AUTHENTICATOR_APP">Authenticator App (TOTP)</option>
                  <option value="SMS_OTP">SMS OTP (Weak)</option>
                  <option value="NONE">None (Password Only)</option>
                </select>
              </div>
            </div>

            {/* Location & Speed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Origin Geolocation</label>
                <input
                  type="text"
                  value={overrideLocation}
                  onChange={(e) => setOverrideLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                  placeholder="e.g. San Francisco, US or Kyiv, UA"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Calculated Velocity (km/h)</label>
                <input
                  type="number"
                  value={speedKmh}
                  onChange={(e) => setSpeedKmh(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Failed Attempts & Behavioral Flags */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Recent Failed Auth Attempts</label>
                <input
                  type="number"
                  value={failedAttempts}
                  onChange={(e) => setFailedAttempts(Number(e.target.value))}
                  min={0}
                  max={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isOffHours}
                    onChange={(e) => setIsOffHours(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Simulate Off-Hours (03:00 AM)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-rose-300">
                  <input
                    type="checkbox"
                    checked={suspiciousFlag}
                    onChange={(e) => setSuspiciousFlag(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>Inject Suspicious Process Hook</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              className="w-full mt-4 py-2.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Evaluate Policy Engine Decision</span>
            </button>
          </div>
        </div>

        {/* Right: Decision Output & Explainability (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {evaluationResult && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Real-Time Policy Evaluation Verdict
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  ID: {evaluationResult.correlationId}
                </span>
              </div>

              {/* Decision Hero Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  evaluationResult.decision === 'ALLOW'
                    ? 'bg-emerald-950/30 border-emerald-800/80'
                    : evaluationResult.decision === 'CHALLENGE'
                    ? 'bg-amber-950/30 border-amber-800/80'
                    : evaluationResult.decision === 'RESTRICT'
                    ? 'bg-blue-950/30 border-blue-800/80'
                    : 'bg-rose-950/30 border-rose-800/80'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Zero Trust Verdict
                  </span>
                  <div className="text-2xl font-bold font-mono tracking-tight mt-0.5">
                    <span
                      className={
                        evaluationResult.decision === 'ALLOW'
                          ? 'text-emerald-400'
                          : evaluationResult.decision === 'CHALLENGE'
                          ? 'text-amber-400'
                          : evaluationResult.decision === 'RESTRICT'
                          ? 'text-blue-400'
                          : 'text-rose-400'
                      }
                    >
                      {evaluationResult.decision}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 block mt-1">
                    Rule Matched: <span className="font-semibold text-slate-100">{evaluationResult.matchedPolicyName}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Calculated Risk Score
                  </span>
                  <span
                    className={`text-2xl font-bold font-mono ${
                      evaluationResult.riskResult.overallScore >= 60 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {evaluationResult.riskResult.overallScore}
                    <span className="text-xs text-slate-500 font-sans">/100</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Tier: {evaluationResult.riskResult.classification}
                  </span>
                </div>
              </div>

              {/* Explainable Decision Text */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Human-Readable Justification
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {evaluationResult.humanExplanation}
                </p>
              </div>

              {/* Evidence Evaluated */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Evidence Factors Considered:
                </span>
                <div className="space-y-1">
                  {evaluationResult.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] font-mono text-slate-300">
                      <span className="text-blue-400">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation */}
              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs space-y-1.5">
                <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold block">
                  Recommended Remediation Action
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {evaluationResult.remediation}
                </p>
              </div>

              {/* Math snapshot */}
              <div className="text-[10px] font-mono text-slate-500 text-right">
                {evaluationResult.riskResult.formulaSnapshot}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
