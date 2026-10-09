import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { Session, SessionState } from '../../types';
import {
  Radio,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Lock,
  Clock,
  Laptop,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ContinuousSessionTrust: React.FC = () => {
  const {
    sessions,
    users,
    devices,
    resources,
    revokeSession,
    challengeSession,
    restrictSession,
    updateDevicePosture,
    showToast,
  } = useZeroTrust();

  const handleDegradeSession = (session: Session) => {
    // Simulate real-time posture drop on the session's device
    updateDevicePosture(session.deviceId, 'Compromised');
    showToast({
      type: 'warning',
      title: 'Continuous Trust Degradation',
      message: `Endpoint ${session.deviceId} reported anomalous root process. Session risk escalated!`,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Continuous Session Trust
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Post-Authentication Runtime Verification</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            Active Session Monitoring & Enforcement
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Zero Trust does not end at initial login. Live sessions are re-evaluated continuously against incoming telemetry signals. If endpoint health degrades or anomalous speed is detected, access is immediately revoked or challenged.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            Active Sessions: <span className="font-mono font-bold text-blue-400">{sessions.filter((s) => s.state === 'Active').length}</span>
          </div>
        </div>
      </div>

      {/* Workflow Explanation Strip */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
          Continuous Reassessment Pipeline:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-blue-400 font-mono font-bold block mb-1">01. Login Grant</span>
            <p className="text-[11px] text-slate-400">Initial authentication passes policy. Ephemeral session token issued.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-amber-400 font-mono font-bold block mb-1">02. Sensor Drift</span>
            <p className="text-[11px] text-slate-400">Host EDR reports anomalous memory injection or location changes unexpectedly.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-orange-400 font-mono font-bold block mb-1">03. Risk Re-score</span>
            <p className="text-[11px] text-slate-400">Risk engine recalculates compound score in runtime (&lt;20ms).</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-rose-400 font-mono font-bold block mb-1">04. Instant Sever</span>
            <p className="text-[11px] text-slate-400">Policy P1 severs active socket, blacklists token, and files audit incident.</p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Location / IP</th>
                <th className="py-3 px-4">Current State</th>
                <th className="py-3 px-4 text-center">Live Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sessions.map((session) => {
                const user = users.find((u) => u.id === session.userId);
                const device = devices.find((d) => d.id === session.deviceId);
                const resource = resources.find((r) => r.id === session.resourceId);

                const stateBadge =
                  session.state === 'Active' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' :
                  session.state === 'Step-up Required' ? 'text-amber-400 bg-amber-950/40 border-amber-900/60' :
                  session.state === 'Restricted' ? 'text-blue-400 bg-blue-950/40 border-blue-900/60' :
                  'text-rose-400 bg-rose-950/40 border-rose-900/60';

                return (
                  <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Session ID */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-blue-400" />
                        <span>{session.id}</span>
                      </div>
                      {session.privileged && (
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-800/40 mt-1 inline-block">
                          Privileged
                        </span>
                      )}
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{user?.name || session.userId}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{user?.role}</span>
                    </td>

                    {/* Endpoint */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 block truncate max-w-[150px]">{device?.name || session.deviceId}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{device?.posture}</span>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-200 block font-medium truncate max-w-[180px]">{resource?.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{resource?.sensitivity}</span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-slate-300 block">{session.location}</span>
                      <span className="text-slate-500">{session.ipAddress}</span>
                    </td>

                    {/* State */}
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border inline-block ${stateBadge}`}>
                        {session.state}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                        session.riskScore >= 60 ? 'text-rose-400 bg-rose-950/40 border-rose-900/40' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40'
                      }`}>
                        {session.riskScore}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {session.state === 'Active' && (
                          <>
                            <button
                              onClick={() => handleDegradeSession(session)}
                              className="px-2 py-1 text-[11px] text-amber-300 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-900/60 rounded transition-colors"
                              title="Simulate In-Session Posture Degradation"
                            >
                              Degrade Host
                            </button>
                            <button
                              onClick={() => challengeSession(session.id)}
                              className="px-2 py-1 text-[11px] text-blue-300 hover:text-blue-100 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-900/60 rounded transition-colors"
                              title="Force Step-up Hardware MFA"
                            >
                              Step-up
                            </button>
                            <button
                              onClick={() => revokeSession(session.id)}
                              className="px-2 py-1 text-[11px] text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/60 rounded transition-colors"
                              title="Immediate Kill Switch"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                        {session.state === 'Step-up Required' && (
                          <button
                            onClick={() => revokeSession(session.id, 'Step-up MFA timeout')}
                            className="px-2 py-1 text-[11px] text-rose-400 hover:text-rose-200 bg-slate-900 border border-slate-800 rounded transition-colors"
                          >
                            Sever Session
                          </button>
                        )}
                        {session.state === 'Revoked' && (
                          <span className="text-[11px] text-rose-400 font-mono">Terminated</span>
                        )}
                        {session.state === 'Restricted' && (
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="px-2 py-1 text-[11px] text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded transition-colors"
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
