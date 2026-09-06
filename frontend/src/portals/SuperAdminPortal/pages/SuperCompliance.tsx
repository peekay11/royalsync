import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    in_review: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const SuperCompliance = () => {
  const { data, loading, error, refetch } = useApi<any>('/compliance/kyc');

  const updateKyc = async (id: string, kycStatus: string) => {
    try {
      await apiRequest(`/compliance/kyc/${id}`, { method: 'PUT', body: JSON.stringify({ kycStatus }) });
      toast.success('KYC status updated');
      refetch();
    } catch {
      toast.error('Failed to update KYC status');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading compliance data...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const stats = data?.stats;
  const pending: any[] = data?.pendingClients ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Tenant Compliance</h1>

      {/* KYC Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: stats?.total ?? 0, color: 'text-gray-900' },
          { label: 'Verified', value: stats?.verified ?? 0, color: 'text-green-600' },
          { label: 'Pending', value: stats?.pending ?? 0, color: 'text-yellow-600' },
          { label: 'Verification Rate', value: `${stats?.verificationRate ?? 0}%`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-1">{s.label}</div>
            <div className={`text-3xl font-light ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* POPIA & FICA section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-2">POPIA Consent Register</h3>
          <p className="text-sm text-gray-500 mb-4">All clients registered with explicit data-use consent.</p>
          <button
            onClick={() => toast.info('CSV export — connect file storage to enable')}
            className="text-sm text-red-600 font-medium hover:underline"
          >
            Export Register (CSV)
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-2">FICA Screening (PEP/Sanctions)</h3>
          <p className="text-sm text-gray-500 mb-4">{stats?.failed ?? 0} failed KYC. {stats?.pending ?? 0} awaiting verification.</p>
          <button
            onClick={() => toast.info('Connect a sanctions provider to enable automated screening')}
            className="text-sm text-red-600 font-medium hover:underline"
          >
            View Flagged Accounts
          </button>
        </div>
      </div>

      {/* Pending KYC list */}
      {pending.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">Pending KYC Verification ({pending.length})</h2>
          </div>
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">KYC Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pending.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                  <td className="px-6 py-4 text-gray-500">{c.mobile}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-ZA')}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.kycStatus} /></td>
                  <td className="px-6 py-4 text-right">
                    <select
                      defaultValue={c.kycStatus}
                      onChange={e => updateKyc(c.id, e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="verified">Verified</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
