import { useState, useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import {
  FiList,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCode
} from 'react-icons/fi';
import { toast } from 'sonner';

interface AuditItem {
  id: string;
  actor_id: string;
  actor_role: string;
  tenant_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  before_state?: any;
  after_state?: any;
  ip?: string;
  created_at: string;
}

export const SuperAudit = () => {
  const { data: rawLogs, loading, refetch } = useApi<AuditItem[]>('/audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [inspectItem, setInspectItem] = useState<AuditItem | null>(null);

  const logs = useMemo(() => {
    const list = Array.isArray(rawLogs) ? rawLogs : [];
    return list.filter(item => {
      const matchesAction = selectedAction === 'all' || item.action.toLowerCase() === selectedAction.toLowerCase();
      const matchesRole = selectedRole === 'all' || item.actor_role === selectedRole;
      const matchesSearch =
        (item.actor_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.resource_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.resource_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ip || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAction && matchesRole && matchesSearch;
    });
  }, [rawLogs, searchQuery, selectedAction, selectedRole]);

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Immutable Security Audit Trail</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tamper-evident statutory audit records for every authentication, state mutation, and claims event
          </p>
        </div>
        <button
          onClick={() => {
            refetch();
            toast.success('Audit log refreshed');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Trail
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="toggle">Toggle</option>
              <option value="login">Login</option>
              <option value="stage_progression">Stage Progression</option>
            </select>
          </div>

          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ADVISER">ADVISER</option>
            <option value="CLIENT">CLIENT</option>
            <option value="PARTNER">PARTNER</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by actor, IP, or resource..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <FiList className="text-red-500" /> Event Ledger
          </h3>
          <span className="text-xs text-gray-400">{logs.length} events logged</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse">Loading audit ledger...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No audit events found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor Role</th>
                  <th className="px-6 py-3">Actor ID</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Resource Target</th>
                  <th className="px-6 py-3">Client IP</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.actor_role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : log.actor_role === 'ADMIN'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                            : log.actor_role === 'ADVISER'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono font-medium text-gray-900 dark:text-white">
                      {log.actor_id}
                    </td>
                    <td className="px-6 py-3.5 font-semibold uppercase text-[10px] text-gray-800 dark:text-gray-200">
                      {log.action}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">
                      <span className="font-mono text-xs">{log.resource_type}</span>
                      {log.resource_id && <span className="text-gray-400 text-[10px] block">{log.resource_id}</span>}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-gray-500">
                      {log.ip || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setInspectItem(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <FiEye className="w-3 h-3" /> Inspect State
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* State Inspection Modal */}
      {inspectItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiCode className="text-red-500" /> Audit State Inspection
                </h3>
                <p className="text-xs text-gray-400">Event ID: {inspectItem.id}</p>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl">
              <div>
                <span className="text-gray-400 font-semibold block">Action</span>
                <span className="font-bold text-gray-900 dark:text-white uppercase">{inspectItem.action}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block">Actor</span>
                <span className="font-mono text-gray-900 dark:text-white">{inspectItem.actor_id} ({inspectItem.actor_role})</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block">Resource</span>
                <span className="font-mono text-gray-900 dark:text-white">{inspectItem.resource_type} ({inspectItem.resource_id || 'N/A'})</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block">Timestamp</span>
                <span className="font-mono text-gray-900 dark:text-white">{new Date(inspectItem.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Before State
                </span>
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
                  {inspectItem.before_state ? JSON.stringify(inspectItem.before_state, null, 2) : 'null (New Record)'}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  After State
                </span>
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
                  {inspectItem.after_state ? JSON.stringify(inspectItem.after_state, null, 2) : 'null (Deleted)'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

