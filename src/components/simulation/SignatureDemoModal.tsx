import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import {
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Radio,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface StepInfo {
  step: number;
  title: string;
  stage: 'Access Request' | 'Initial Grant' | 'Attack Injected' | 'Adaptive Decision' | 'Enforcement & Audit';
  description: string;
  technicalDetails: string;
  actor: string;
  engineOutput: string;
}

const STEPS: StepInfo[] = [
  {
    step: 1,
    stage: 'Access Request',
    title: 'Employee Requests Access to Sensitive Vault',
    description: "Sarah Chen (Financial Operations) requests direct session access to the Snowflake Financial Ledger & Vault from her managed corporate MacBook Air.",
    technicalDetails: 'Target: res-fin-vault (Sensitivity: Confidential). Origin: 198.51.100.91 (New York, US). Initial session initiated via TLS 1.3.',
    actor: 'Sarah Chen (usr-003)',
    engineOutput: 'Request queued at Zero Trust Edge Enforcement Proxy.',
  },
  {
    step: 2,
    stage: 'Access Request',
    title: 'Identity Passes Initial Zero Trust Verification',
    description: "The authentication proxy verifies that Sarah's account is Active, registered in good standing, and enrolled with hardware-backed FIDO2 MFA.",
    technicalDetails: 'User Status: Active. MFA Method: FIDO2_HARDWARE_KEY verified. Baseline Location: New York, US matches IP geolocation.',
    actor: 'Identity Provider & Risk Engine',
    engineOutput: 'Identity Verification Signal: 0/100 (Nominal). Baseline location check passed.',
  },
  {
    step: 3,
    stage: 'Initial Grant',
    title: 'Policy Engine Grants Access on Trusted Device (ALLOW)',
    description: "Policy P6 and P4 match the incoming request. The MacBook Air trust score is 94/100 (Encrypted, EDR active, patched). Access is permitted.",
    technicalDetails: 'Decision: ALLOW. Policy: P4 Step-up Hardware MFA + P6 Corporate Baseline. Session token ses-103 created in Active state.',
    actor: 'Zero Trust Policy Engine',
    engineOutput: 'Decision: ALLOW. Session ses-103 activated with continuous posture polling enabled.',
  },
  {
    step: 4,
    stage: 'Attack Injected',
    title: 'Adversary Compromises Device Posture In-Session',
    description: "A malicious payload executes via a spear-phishing browser exploit. The local EDR sensor process is forcibly killed and an unauthorized root shell is opened.",
    technicalDetails: 'Host sensor telemetry reports: isEdrActive = false; posture downgraded to Compromised; trust score drops from 94 to 18.',
    actor: 'Adversary (MITRE ATT&CK T1562.001)',
    engineOutput: 'Endpoint Health Check Alert: dev-mac-03 reported COMPROMISED. Immediate telemetry push sent.',
  },
  {
    step: 5,
    stage: 'Adaptive Decision',
    title: 'Adaptive Risk Engine Recalculates Score Instantly',
    description: "Rather than waiting for session expiry, the Zero Trust engine recalculates compound risk. Device risk jumps to 98/100, spiking overall risk to 88/100 (Critical).",
    technicalDetails: 'Composite formula evaluates: Device Posture (weight 0.18, score 98) + Suspicious In-Session Telemetry (weight 0.04, score 92). Risk Score: 88/100.',
    actor: 'Adaptive Risk Engine',
    engineOutput: 'Risk re-evaluated: 14 -> 88 (Critical). Recommended Action: DENY.',
  },
  {
    step: 6,
    stage: 'Adaptive Decision',
    title: 'Continuous Policy Engine Enforces Policy P1',
    description: "The Policy Engine checks active rules. Policy P1: 'Instant Deny on Compromised Endpoints' (Priority 1) takes unconditional precedence over all grants.",
    technicalDetails: 'Rule P1 matched: requireCompliantDevice violated. Explicit Deny overrides existing session grant. Correlation ID: req-sig-revocation.',
    actor: 'Zero Trust Policy Engine',
    engineOutput: 'Decision: DENY. Remediation: Isolate endpoint dev-mac-03 and revoke all related sessions.',
  },
  {
    step: 7,
    stage: 'Enforcement & Audit',
    title: 'Session Transitions Dynamically to REVOKED',
    description: "The live TLS socket between the MacBook and the Snowflake Financial Vault is terminated at the Policy Enforcement Point (PEP). Tokens are blacklisted.",
    technicalDetails: 'Session ses-103 state updated: Active -> Revoked. Socket severed in <180 milliseconds. Inbound requests receive HTTP 403 Forbidden.',
    actor: 'Edge PEP Gateway',
    engineOutput: 'Session ses-103 status: REVOKED. Mutual TLS connection terminated.',
  },
  {
    step: 8,
    stage: 'Enforcement & Audit',
    title: 'Incident Response Auto-Creates Critical Incident',
    description: "The Security Incident Center automatically generates incident inc-sig-901 with full evidence, severity Critical, and assigns it to SOC Analyst Marcus Vance.",
    technicalDetails: 'Incident logged: Title: "Host Compromise & Session Revocation". Severity: Critical. Status: Investigating. Evidence collected from host sensor.',
    actor: 'SOC Incident Center',
    engineOutput: 'Incident logged & dispatched to Security Analyst alert queue.',
  },
  {
    step: 9,
    stage: 'Enforcement & Audit',
    title: 'Immutable Audit Trail Records Every Transition',
    description: "Every micro-step—initial allow, sensor failure, risk elevation, policy evaluation, session severing, and incident creation—is recorded in the audit log.",
    technicalDetails: 'Audit events aud-sig-01 through aud-sig-05 recorded with cryptographic correlation IDs. Non-repudiation verified.',
    actor: 'Audit & Compliance Subsystem',
    engineOutput: 'Audit entry written: Outcome REVOKED. Reason: Policy P1 enforced.',
  },
  {
    step: 10,
    stage: 'Enforcement & Audit',
    title: 'Global Security Posture and Digital Twin Updated',
    description: "The Executive Command Center posture score adjusts, and the Security Digital Twin visually isolates Sarah's MacBook, severing the path to Financial Vault.",
    technicalDetails: 'Posture score updated live. Attack path blocked. Demonstration complete: Zero Trust has prevented lateral movement to Crown Jewel data.',
    actor: 'ZeroTrustX 2.0 Security Operations',
    engineOutput: 'Threat neutralized. Demonstrating: Never Trust, Continuously Verify, Adapt Instantly.',
  },
];

export const SignatureDemoModal: React.FC = () => {
  const {
    signatureActive,
    signatureStep,
    nextSignatureStep,
    prevSignatureStep,
    resetSignatureDemo,
    setSignatureStep,
  } = useZeroTrust();

  if (!signatureActive) return null;

  const currentStepInfo = STEPS.find((s) => s.step === signatureStep) || STEPS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-400">
                  Signature Walkthrough
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Step {signatureStep} of 10</span>
              </div>
              <h2 className="text-base font-bold text-slate-100">
                One Compromised Device. One Adaptive Defense.
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetSignatureDemo}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Reset demonstration state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={resetSignatureDemo}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10-Step Progress Stepper Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {STEPS.map((s) => {
              const isPast = s.step < signatureStep;
              const isCurrent = s.step === signatureStep;

              return (
                <button
                  key={s.step}
                  onClick={() => setSignatureStep(s.step)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : isPast
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900/60 text-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{s.step}</span>
                  {isCurrent && <span className="text-[10px] font-sans font-normal truncate max-w-[120px]">{s.stage}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step Stage & Title */}
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
              Stage: {currentStepInfo.stage}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              {currentStepInfo.title}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {currentStepInfo.description}
            </p>
          </div>

          {/* Technical Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Technical Context & Protocol State
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed font-mono">
                {currentStepInfo.technicalDetails}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                Triggering Actor: <span className="text-blue-300 font-semibold">{currentStepInfo.actor}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs space-y-2">
              <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold block">
                Zero Trust Engine Telemetry Output
              </span>
              <p className="text-blue-200 text-[11px] leading-relaxed font-mono">
                {currentStepInfo.engineOutput}
              </p>
              <div className="pt-2 border-t border-blue-900/30 text-[11px] text-slate-400">
                Enforcement Type: <span className="text-slate-300">Continuous Runtime Evaluation</span>
              </div>
            </div>
          </div>

          {/* Visual State Delta Graphic */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Laptop className={`w-5 h-5 ${signatureStep >= 4 ? 'text-rose-400' : 'text-blue-400'}`} />
              <div>
                <span className="text-slate-200 font-medium block">Finance MacBook Air</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {signatureStep >= 4 ? 'Posture: Compromised (Trust: 18/100)' : 'Posture: Compliant (Trust: 94/100)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-mono">────</span>
              <div className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold border ${
                signatureStep >= 7
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                  : signatureStep >= 3
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {signatureStep >= 7 ? 'REVOKED' : signatureStep >= 3 ? 'ACTIVE SESSION' : 'PENDING'}
              </div>
              <span className="text-slate-600 font-mono">────►</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-slate-200 font-medium block">Snowflake Financial Vault</span>
                <span className="text-[11px] text-slate-400 font-mono">Data: Confidential</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={prevSignatureStep}
            disabled={signatureStep === 1}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              signatureStep === 1
                ? 'text-slate-600 border-slate-800 cursor-not-allowed'
                : 'text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {signatureStep} / 10
          </span>

          {signatureStep < 10 ? (
            <button
              onClick={nextSignatureStep}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={resetSignatureDemo}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete & Reset Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
