import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  DEACTIVATE: 'bg-orange-100 text-orange-700',
  SUBMIT: 'bg-purple-100 text-purple-700',
};

const actionColor = (action: string) => {
  const prefix = Object.keys(actionColors).find(k => action.startsWith(k));
  return prefix ? actionColors[prefix] : 'bg-gray-100 text-gray-600';
};

export const SuperAudit = () => {
  const { data, loading, error, refetch } = useApi<any>('/audit');
  const [search, setSearch] = useState('');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading audit log...</div>;
  if (error) return (
    <div className="p-8 space-y-3">
      <p className="text-red-600">{error}</p>
      <button onClick={refetch} className="border rounded-lg px-4 py-2 text-sm">Retry</button>
    </div>
  );

  const events: any[] = data?.events ?? [];
  const filtered = search ? events.filter(e =>
    e.actor?.toLowerCase().includes(search.toLowerCase()) ||
    e.action?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  ) : events;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-normal text-gray-800">Immutable Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} total events</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by actor, action or description..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Actor</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Resource</th>
              <th className="px-6 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-500 whitespace-nowrap text-xs">
                  {new Date(e.createdAt).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900 text-xs">{e.actor}</div>
                  <div className="text-xs text-gray-400">{e.actorRole}</div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${actionColor(e.action)}`}>{e.action}</span>
                </td>
                <td className="px-6 py-3 text-gray-500 text-xs font-mono">{e.resource}</td>
                <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{e.description ?? '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
