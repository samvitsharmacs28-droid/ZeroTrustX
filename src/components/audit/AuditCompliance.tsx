import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { AuditLog } from '../../types';
import {
  History,
  Search,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const AuditCompliance: React.FC = () => {
  const { auditLogs } = useZeroTrust();

  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.correlationId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOutcome = outcomeFilter === 'ALL' || log.outcome === outcomeFilter;
    const matchesType = eventTypeFilter === 'ALL' || log.eventType === eventTypeFilter;

    return matchesSearch && matchesOutcome && matchesType;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Event Type', 'Actor', 'Target', 'Outcome', 'Reason', 'Correlation ID'];
    const rows = filteredLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.eventType}"`,
      `"${log.actor}"`,
      `"${log.target}"`,
      `"${log.outcome}"`,
      `"${log.reason.replace(/"/g, '""')}"`,
      `"${log.correlationId}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zerotrustx_audit_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Audit & Compliance Records
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Non-Repudiation Trail</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Security Audit & Compliance Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Append-only record of all authentication challenges, PEP access decisions, posture changes, and continuous session revocations. Traceable by unique correlation IDs.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Honesty Disclosure */}
      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>Audit Storage Note:</strong> Active records are held in application state / client persistence for demonstration purposes. In production deployments, these streams pipe to immutable WORM SIEM storage (e.g. Chronicle / BigQuery).
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by actor, target, reason, or correlation ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="ALLOWED">ALLOWED</option>
              <option value="CHALLENGED">CHALLENGED</option>
              <option value="RESTRICTED">RESTRICTED</option>
              <option value="DENIED">DENIED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Event Type:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Event Types</option>
              <option value="ACCESS_DECISION">Access Decision</option>
              <option value="AUTHENTICATION">Authentication</option>
              <option value="SESSION_TRANSITION">Session Transition</option>
              <option value="POLICY_CHANGE">Policy Change</option>
              <option value="DEVICE_POSTURE_CHANGE">Device Posture Change</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Correlation ID</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const outcomeBadge =
                  log.outcome === 'ALLOWED' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80' :
                  log.outcome === 'CHALLENGED' ? 'text-amber-400 bg-amber-950/40 border-amber-800/80' :
                  log.outcome === 'RESTRICTED' ? 'text-blue-400 bg-blue-950/40 border-blue-800/80' :
                  log.outcome === 'MODIFIED' ? 'text-indigo-400 bg-indigo-950/40 border-indigo-800/80' :
                  'text-rose-400 bg-rose-950/40 border-rose-800/80';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Time */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-300 block">{log.eventType}</span>
                    </td>

                    {/* Outcome */}
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${outcomeBadge}`}>
                        {log.outcome}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 text-slate-200 truncate max-w-[170px]">
                      {log.actor}
                    </td>

                    {/* Target */}
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]">
                      {log.target}
                    </td>

                    {/* Correlation ID */}
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                      {log.correlationId}
                    </td>

                    {/* Details Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Audit Log Entry</span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedLog.eventType}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Correlation ID</span>
                <span className="text-blue-400">{selectedLog.correlationId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Actor</span>
                <span className="text-slate-200">{selectedLog.actor}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Target Resource</span>
                <span className="text-slate-200">{selectedLog.target}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Timestamp</span>
                <span className="text-slate-400">{selectedLog.timestamp}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Decision & Audit Rationale
              </span>
              <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {selectedLog.reason}
              </p>
            </div>

            {selectedLog.details && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Event Metadata Payload
                </span>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-300 border border-slate-800 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
