import { useState, useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import {
  FiGrid,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'sonner';

interface TenantItem {
  id: string;
  name: string;
  fspNumber: string;
  primaryContact: string;
  email: string;
  subdomain: string;
  status: 'active' | 'suspended';
  userCount?: number;
  created_at?: string;
}

const DEFAULT_TENANTS: TenantItem[] = [
  {
    id: 'tenant_1',
    name: 'Royal Square Financial (Pty) Ltd',
    fspNumber: 'FSP 29370',
    primaryContact: 'Qiniso Thulani Ntuli',
    email: 'qiniso@royalsquare.co.za',
    subdomain: 'royalsquare',
    status: 'active',
    userCount: 1204,
    created_at: '2025-01-03T00:00:00Z'
  },
  {
    id: 'tenant_2',
    name: 'Apex Wealth Advisory Partners',
    fspNumber: 'FSP 44102',
    primaryContact: 'Sibusiso Zulu',
    email: 'sibusiso@apexwealth.co.za',
    subdomain: 'apexwealth',
    status: 'active',
    userCount: 340,
    created_at: '2026-02-15T00:00:00Z'
  }
];

export const SuperTenants = () => {
  const { data: apiTenants, refetch } = useApi<TenantItem[]>('/tenants');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [fspNumber, setFspNumber] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [email, setEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');

  const tenants = useMemo(() => {
    const combined = [...DEFAULT_TENANTS];
    if (apiTenants && Array.isArray(apiTenants)) {
      apiTenants.forEach(t => {
        if (!combined.some(c => c.id === t.id || c.name === t.name)) {
          combined.push(t);
        }
      });
    }
    return combined.filter(
      t =>
        (t.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (t.fspNumber || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (t.primaryContact || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [apiTenants, searchQuery]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fspNumber.trim() || !email.trim()) {
      toast.error('Name, FSP Licence, and Email are required');
      return;
    }

    try {
      await apiRequest('/tenants', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          fspNumber: fspNumber.trim(),
          primaryContact: primaryContact.trim() || 'Principal Broker',
          email: email.trim().toLowerCase(),
          subdomain: (subdomain || name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim(),
          status: 'active',
          userCount: 1
        })
      });
      toast.success('Broker Tenant onboarded successfully!');
      setIsAdding(false);
      setName('');
      setFspNumber('');
      setPrimaryContact('');
      setEmail('');
      setSubdomain('');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create tenant');
    }
  };

  const handleToggleStatus = async (tenant: TenantItem) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      await apiRequest(`/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...tenant, status: newStatus })
      });
      toast.success(`Tenant ${tenant.name} marked as ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update tenant status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brokerage Tenant Organizations</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage multi-tenant intermediary brokerages, FSP licence credentials, and data isolation
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Onboard Broker Tenant
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by broker name, FSP number, or contact..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <span className="text-xs text-gray-400">{tenants.length} tenants registered</span>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map(tenant => (
          <div
            key={tenant.id}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-base border border-red-200/50">
                    <FiGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{tenant.name}</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{tenant.fspNumber}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tenant.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                  }`}
                >
                  {tenant.status === 'active' ? <FiCheckCircle /> : <FiAlertCircle />}
                  {tenant.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Key Individual:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{tenant.primaryContact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact Email:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{tenant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subdomain Access:</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{tenant.subdomain}.royalsync.co.za</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Policyholders:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tenant.userCount || 100}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">Mandate: FAIS Full Intermediary</span>
              <button
                onClick={() => handleToggleStatus(tenant)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  tenant.status === 'active'
                    ? 'border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {tenant.status === 'active' ? 'Suspend Access' : 'Activate Tenant'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Tenant Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Onboard New Brokerage Tenant</h3>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Brokerage Entity Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sterling Wealth Financial Services"
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">FSP Licence Number</label>
                <input
                  required
                  type="text"
                  value={fspNumber}
                  onChange={e => setFspNumber(e.target.value)}
                  placeholder="e.g. FSP 51892"
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Key Individual / Adviser</label>
                  <input
                    type="text"
                    value={primaryContact}
                    onChange={e => setPrimaryContact(e.target.value)}
                    placeholder="e.g. John Khumalo"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Principal Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. admin@sterling.co.za"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subdomain Prefix</label>
                <input
                  type="text"
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value)}
                  placeholder="e.g. sterling"
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

