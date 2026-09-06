import { useState, useMemo, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { 
  FiShield, FiPlus, FiSearch, FiFilter, FiRefreshCw, 
  FiUser, FiDollarSign, FiCheckCircle, FiX 
} from 'react-icons/fi';
import { apiRequest } from '../../../lib/api';
import { CompanyLogo } from '../../../components/CompanyLogo';

interface PolicyItem {
  id: string;
  clientId: string;
  clientName: string;
  policyNumber: string;
  type: string;
  provider: string;
  providerDomain?: string;
  premium: number;
  sumAssured?: number;
  status: 'active' | 'lapsed' | 'cancelled' | 'pending' | string;
  inceptionDate?: string;
  createdAt: string;
}

export const AdminPolicies = () => {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    clientId: '',
    insurerId: '',
    policyNumber: '',
    type: 'Life Cover',
    premium: '',
    sumAssured: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [policiesData, clientsData, insurersData] = await Promise.all([
        apiRequest<PolicyItem[]>('/policies'),
        apiRequest<any[]>('/crm/clients'),
        apiRequest<any[]>('/insurers').catch(() => [])
      ]);
      setPolicies(policiesData);
      setClients(clientsData);
      setInsurers(insurersData);
    } catch {
      toast.error('Failed to load policies data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (policyId: string, newStatus: string) => {
    try {
      await apiRequest(`/policies/${policyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, status: newStatus } : p));
      toast.success(`Policy status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update policy status');
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicy.clientId || !newPolicy.policyNumber || !newPolicy.premium) {
      toast.error('Client, policy number, and premium are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest('/policies', {
        method: 'POST',
        body: JSON.stringify(newPolicy)
      });
      toast.success('Policy successfully created');
      setShowAddModal(false);
      setNewPolicy({
        clientId: '',
        insurerId: '',
        policyNumber: '',
        type: 'Life Cover',
        premium: '',
        sumAssured: '',
        status: 'active'
      });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPolicies = useMemo(() => {
    return (policies || []).filter(p => {
      if (!p) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const matchSearch = !q || (
        (p.policyNumber || '').toLowerCase().includes(q) ||
        (p.provider || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        ((p.clientName || '').toLowerCase().includes(q))
      );
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [policies, searchQuery, statusFilter, typeFilter]);

  // High-level Stats
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalMonthlyPremium = policies
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + (p.premium || 0), 0);
  const totalSumAssured = policies
    .reduce((sum, p) => sum + (p.sumAssured || 0), 0);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <ClipLoader color="#d92820" size={40} />
        <p className="text-gray-500 text-sm font-medium">Loading policies ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Policy Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Book of active policies, underwriter portfolios, premiums, and life / short-term cover.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            disabled={refreshing}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh policies"
          >
            <FiRefreshCw className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <FiPlus className="text-lg" />
            Issue Policy
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Policies</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalPolicies}</div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Registered book</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#d92820] flex items-center justify-center text-xl font-bold">
            <FiShield />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Book</span>
            <div className="text-2xl font-bold text-green-700 mt-1">{activePolicies}</div>
            <span className="text-xs text-green-600 font-medium mt-0.5 inline-block">
              {totalPolicies ? Math.round((activePolicies / totalPolicies) * 100) : 0}% retention
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
            <FiCheckCircle />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Premiums</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">R {totalMonthlyPremium.toLocaleString()}</div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Monthly recurring</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Sum Assured</span>
            <div className="text-2xl font-bold text-[#d92820] mt-1">R {totalSumAssured.toLocaleString()}</div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Total risk liability</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            <FiShield />
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search by policy number, provider, client name, type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-fit">
            <FiFilter className="text-gray-400 text-sm" />
            <span className="text-xs font-medium text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="lapsed">Lapsed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-xs font-medium text-gray-600">Category:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-red-500"
            >
              <option value="all">All Categories</option>
              <option value="Life Cover">Life Cover</option>
              <option value="Funeral Cover">Funeral Cover</option>
              <option value="Medical Aid / Gap">Medical Aid / Gap</option>
              <option value="Comprehensive Vehicle">Vehicle</option>
              <option value="Building & Contents">Property</option>
              <option value="Income Protection">Income Protection</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Policies Table ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Policy Details</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Policyholder</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Underwriter / Provider</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Monthly Premium</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Sum Assured</th>
                <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <FiShield className="mx-auto text-3xl mb-2 opacity-40" />
                    No policies found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold font-mono text-gray-900 text-sm">{p.policyNumber}</div>
                      <div className="text-xs text-gray-500">{p.type}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
                        <FiUser className="text-gray-400" />
                        {p.clientName}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <CompanyLogo name={p.provider} domain={p.providerDomain} size={30} />
                        <span className="font-semibold text-gray-900 text-xs">{p.provider}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-xs">R {p.premium.toLocaleString()}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#d92820] text-xs">
                        {p.sumAssured ? `R ${p.sumAssured.toLocaleString()}` : '—'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border cursor-pointer ${
                          p.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : p.status === 'lapsed'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="lapsed">Lapsed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── ADD POLICY MODAL ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Issue New Policy</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Policyholder (Client) *</label>
                <select
                  required
                  value={newPolicy.clientId}
                  onChange={e => setNewPolicy({ ...newPolicy, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="">Choose Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Underwriter / Insurer</label>
                <select
                  value={newPolicy.insurerId}
                  onChange={e => setNewPolicy({ ...newPolicy, insurerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="">Select Insurer Provider</option>
                  {insurers.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Policy Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-902188"
                  value={newPolicy.policyNumber}
                  onChange={e => setNewPolicy({ ...newPolicy, policyNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Category</label>
                <select
                  value={newPolicy.type}
                  onChange={e => setNewPolicy({ ...newPolicy, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="Life Cover">Life Cover</option>
                  <option value="Funeral Cover">Funeral Cover</option>
                  <option value="Medical Aid / Gap">Medical Aid / Gap</option>
                  <option value="Comprehensive Vehicle">Comprehensive Vehicle</option>
                  <option value="Building & Contents">Building & Contents</option>
                  <option value="Income Protection">Income Protection</option>
                  <option value="Retirement Annuity">Retirement Annuity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monthly Premium (ZAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 500"
                    value={newPolicy.premium}
                    onChange={e => setNewPolicy({ ...newPolicy, premium: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sum Assured (ZAR)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="e.g. 1000000"
                    value={newPolicy.sumAssured}
                    onChange={e => setNewPolicy({ ...newPolicy, sumAssured: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <ClipLoader size={12} color="#fff" /> : <FiShield />}
                  Issue Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
