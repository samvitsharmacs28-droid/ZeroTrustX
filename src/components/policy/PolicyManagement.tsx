import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { Policy, PolicyAction, UserRole } from '../../types';
import {
  ScrollText,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';

export const PolicyManagement: React.FC = () => {
  const {
    policies,
    addPolicy,
    updatePolicy,
    deletePolicy,
    togglePolicy,
    activeUser,
  } = useZeroTrust();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);
  const [action, setAction] = useState<PolicyAction>('DENY');
  const [targetResources, setTargetResources] = useState<string>('*');
  const [targetRoles, setTargetRoles] = useState<string>('*');
  const [minDeviceScore, setMinDeviceScore] = useState<number>(70);
  const [maxRiskScore, setMaxRiskScore] = useState<number>(30);
  const [requireCompliantDevice, setRequireCompliantDevice] = useState(false);
  const [blockImpossibleTravel, setBlockImpossibleTravel] = useState(false);
  const [blockDormant, setBlockDormant] = useState(false);

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setName('');
    setDescription('');
    setPriority(policies.length + 1);
    setAction('DENY');
    setTargetResources('*');
    setTargetRoles('*');
    setMinDeviceScore(70);
    setMaxRiskScore(30);
    setRequireCompliantDevice(false);
    setBlockImpossibleTravel(false);
    setBlockDormant(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Policy) => {
    setEditingPolicy(p);
    setName(p.name);
    setDescription(p.description);
    setPriority(p.priority);
    setAction(p.action);
    setTargetResources(p.targetResources.join(', '));
    setTargetRoles(p.targetRoles.join(', '));
    setMinDeviceScore(p.conditions.minDeviceTrustScore || 70);
    setMaxRiskScore(p.conditions.maxRiskScore || 30);
    setRequireCompliantDevice(!!p.conditions.requireCompliantDevice);
    setBlockImpossibleTravel(!!p.conditions.blockIfImpossibleTravel);
    setBlockDormant(!!p.conditions.blockDormantAccounts);
    setIsAddModalOpen(true);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const resourcesArr = targetResources.split(',').map((s) => s.trim()).filter(Boolean);
    const rolesArr = (targetRoles === '*'
      ? ['Administrator', 'Security Analyst', 'Employee', 'Contractor', 'Auditor']
      : targetRoles.split(',').map((s) => s.trim())) as UserRole[];

    const conditions = {
      minDeviceTrustScore: minDeviceScore,
      maxRiskScore: maxRiskScore,
      requireCompliantDevice,
      blockIfImpossibleTravel: blockImpossibleTravel,
      blockDormantAccounts: blockDormant,
    };

    if (editingPolicy) {
      updatePolicy(editingPolicy.id, {
        name,
        description,
        priority,
        action,
        targetResources: resourcesArr,
        targetRoles: rolesArr,
        conditions,
      });
    } else {
      addPolicy({
        name,
        description,
        priority,
        enabled: true,
        action,
        targetResources: resourcesArr,
        targetRoles: rolesArr,
        conditions,
        updatedBy: activeUser.name,
      });
    }

    setIsAddModalOpen(false);
  };

  const sortedPolicies = [...policies].sort((a, b) => a.priority - b.priority);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Policy Decision Authority
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Priority-Ordered Rule Evaluation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-400" />
            Zero Trust Policy Rule Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure access rules and deterministic evaluation precedence. Policies are evaluated top-down; explicit DENY unconditionally overrides permissive ALLOW rules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Policy Rule</span>
        </button>
      </div>

      {/* Precedence & Conflict Disclosure */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Layers className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong className="text-slate-100">Conflict Precedence Order:</strong> Explicit DENY (P1-P3) &gt; Restrict / Challenge (P4-P5) &gt; Baseline Allow (P6) &gt; Fallback Deny (P7).
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 shrink-0">
          ✓ Fail-Secure Safe Defaults
        </span>
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        {sortedPolicies.map((policy) => {
          const actionBadge =
            policy.action === 'ALLOW' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80' :
            policy.action === 'CHALLENGE' ? 'text-amber-400 bg-amber-950/40 border-amber-800/80' :
            policy.action === 'RESTRICT' ? 'text-blue-400 bg-blue-950/40 border-blue-800/80' :
            'text-rose-400 bg-rose-950/40 border-rose-800/80';

          return (
            <div
              key={policy.id}
              className={`p-5 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !policy.enabled
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Left Column: Priority + Name + Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    P{policy.priority}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm truncate">{policy.name}</h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${actionBadge}`}>
                    {policy.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">v{policy.version}</span>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
                  {policy.description}
                </p>

                {/* Scope & Conditions Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                  <span>Scope: <span className="text-slate-300">{policy.targetResources.join(', ')}</span></span>
                  <span>·</span>
                  <span>Roles: <span className="text-slate-300">{policy.targetRoles.join(', ')}</span></span>
                  {policy.conditions.minDeviceTrustScore && (
                    <>
                      <span>·</span>
                      <span>Min Device: <span className="text-slate-300">&gt;={policy.conditions.minDeviceTrustScore}</span></span>
                    </>
                  )}
                  {policy.conditions.maxRiskScore !== undefined && (
                    <>
                      <span>·</span>
                      <span>Max Risk: <span className="text-slate-300">&lt;={policy.conditions.maxRiskScore}</span></span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  onClick={() => togglePolicy(policy.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
                    policy.enabled
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60 hover:bg-emerald-900/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {policy.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>

                <button
                  onClick={() => handleOpenEdit(policy)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit Policy"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deletePolicy(policy.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Delete Policy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Policy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePolicy}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">
                {editingPolicy ? 'Edit Policy Rule' : 'Create New Zero Trust Policy'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Policy Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Strict Hardware MFA for Financial API"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Description & Purpose</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this rule exists and when it triggers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Priority (1 = Highest)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Enforcement Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as PolicyAction)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="CHALLENGE">CHALLENGE (Step-up MFA)</option>
                    <option value="RESTRICT">RESTRICT (Read-only Sandbox)</option>
                    <option value="DENY">DENY (Explicit Block)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Target Resources (* for All)</label>
                <input
                  type="text"
                  value={targetResources}
                  onChange={(e) => setTargetResources(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 block">Condition Toggles</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={requireCompliantDevice}
                    onChange={(e) => setRequireCompliantDevice(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Block non-compliant/compromised devices immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={blockImpossibleTravel}
                    onChange={(e) => setBlockImpossibleTravel(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Block requests violating impossible travel velocity (&gt;800 km/h)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={blockDormant}
                    onChange={(e) => setBlockDormant(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Block dormant accounts (&gt;90 days inactive)</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                Save Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
