import React, { useEffect, useState } from 'react';
import { authApi } from '../services/auth.service';
import { AuditLogEntry } from '../types';
import { History, RefreshCw } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await authApi.getAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            Security & System Audit Logs
          </h1>
          <p className="text-xs text-gray-400">
            Append-only tamper-proof audit trail capturing all state-changing API operations.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#151A23] hover:bg-[#1C2331] border border-[#232B3B] text-gray-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log Feed
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#151A23] border border-[#232B3B] space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E121A] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#232B3B]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Payload Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B3B]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1C2331]/50 transition-colors font-mono">
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        hour12: false,
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 whitespace-nowrap">{log.entityName}</td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-gray-400 max-w-md truncate">
                      {log.metadata ? (
                        <span className="text-[11px] text-gray-300 font-mono bg-[#0E121A] px-2 py-1 rounded border border-[#232B3B] inline-block max-w-sm truncate">
                          {log.metadata}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
