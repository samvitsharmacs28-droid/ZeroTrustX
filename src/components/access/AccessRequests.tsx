import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { AccessRequest } from '../../types';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  Layers,
} from 'lucide-react';

export const AccessRequests: React.FC = () => {
  const {
    accessRequests,
    resources,
    users,
    activeUser,
    createAccessRequest,
    approveAccessRequest,
    rejectAccessRequest,
  } = useZeroTrust();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(resources[0].id);
  const [justification, setJustification] = useState('');
  const [hours, setHours] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification) return;
    createAccessRequest(selectedResourceId, justification, hours);
    setIsModalOpen(false);
    setJustification('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Ephemeral Privileges
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Just-In-Time (JIT) Elevation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            Just-In-Time (JIT) Access Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Eliminate standing administrative privileges. Users request time-bounded, purpose-specific access to sensitive resources with automated risk scoring and peer approval.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request JIT Elevation</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Requesting User</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Business Justification</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {accessRequests.map((req) => {
                const user = users.find((u) => u.id === req.userId);
                const resource = resources.find((r) => r.id === req.resourceId);

                const statusBadge =
                  req.status === 'Approved' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' :
                  req.status === 'Rejected' ? 'text-rose-400 bg-rose-950/40 border-rose-900/60' :
                  'text-amber-400 bg-amber-950/40 border-amber-900/60';

                return (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{req.id}</td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {user?.name || req.userId}
                      <span className="text-[11px] text-slate-500 font-mono block">{user?.role}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium block truncate max-w-[180px]">{resource?.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{resource?.sensitivity}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-[260px]">
                      "{req.justification}"
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {req.requestedDurationHours} hours
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                        req.riskScoreAtRequest >= 60 ? 'text-rose-400 bg-rose-950/40 border-rose-900/40' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40'
                      }`}>
                        Risk {req.riskScoreAtRequest}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border inline-block ${statusBadge}`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveAccessRequest(req.id)}
                            className="px-2.5 py-1 text-[11px] text-emerald-300 hover:text-emerald-100 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/60 rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectAccessRequest(req.id)}
                            className="px-2.5 py-1 text-[11px] text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/60 rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Decided</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">Submit JIT Elevation Request</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Target Resource</label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.sensitivity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Requested Duration (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Business Justification & Ticket ID</label>
                <textarea
                  required
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Production emergency incident #INC-4412 hotfix deployment..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
