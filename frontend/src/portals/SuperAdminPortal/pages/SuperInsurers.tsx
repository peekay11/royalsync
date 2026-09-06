import { useState, useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import {
  FiPlus,
  FiCheckCircle,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'sonner';

interface InsurerItem {
  id: string;
  name: string;
  code: string;
  productLines: string[];
  status: 'active' | 'sandbox' | 'disabled';
  apiUrl: string;
  slaDays: number;
}

const DEFAULT_INSURERS: InsurerItem[] = [
  {
    id: 'ins_1',
    name: 'Santam Insurance Limited',
    code: 'SAN',
    productLines: ['Comprehensive Motor', 'Commercial Asset', 'Home & Contents'],
    status: 'active',
    apiUrl: 'https://api.santam.co.za/v2/broker',
    slaDays: 2
  },
  {
    id: 'ins_2',
    name: 'Discovery Life & Insure',
    code: 'DISC',
    productLines: ['Life & Severe Illness', 'Disability Cover', 'Vitality Drive Motor'],
    status: 'active',
    apiUrl: 'https://gateway.discovery.co.za/fais/v3',
    slaDays: 3
  },
  {
    id: 'ins_3',
    name: 'Allan Gray Financial Services',
    code: 'AG',
    productLines: ['Retirement Annuities', 'Unit Trusts', 'Offshore Feeder'],
    status: 'active',
    apiUrl: 'https://broker.allangray.co.za/api/v1',
    slaDays: 1
  },
  {
    id: 'ins_4',
    name: 'Hollard Insurance Company',
    code: 'HOL',
    productLines: ['Commercial Property', 'Engineering Risk', 'Specialist Liability'],
    status: 'sandbox',
    apiUrl: 'https://sandbox.hollard.co.za/api',
    slaDays: 4
  },
  {
    id: 'ins_5',
    name: 'Momentum Metropolitan Holdings',
    code: 'MOM',
    productLines: ['Medical Aid Gap Cover', 'Income Protection', 'Funds'],
    status: 'active',
    apiUrl: 'https://api.momentum.co.za/brokerage/v1',
    slaDays: 2
  },
  {
    id: 'ins_6',
    name: 'Old Mutual Insure',
    code: 'OM',
    productLines: ['Endowments', 'Agricultural Risk', 'Personal Lines'],
    status: 'active',
    apiUrl: 'https://connect.oldmutual.co.za/api/v2',
    slaDays: 3
  }
];

export const SuperInsurers = () => {
  const { data: apiInsurers, refetch } = useApi<InsurerItem[]>('/insurers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [productLineStr, setProductLineStr] = useState('Motor, Life');
  const [apiUrl, setApiUrl] = useState('');
  const [slaDays, setSlaDays] = useState(3);

  const insurers = useMemo(() => {
    const combined = [...DEFAULT_INSURERS];
    if (apiInsurers && Array.isArray(apiInsurers)) {
      apiInsurers.forEach(ins => {
        if (!combined.some(c => c.id === ins.id || c.name === ins.name)) {
          combined.push(ins);
        }
      });
    }
    return combined.filter(
      ins =>
        ins.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apiInsurers, searchQuery]);

  const handleCreateInsurer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('Name and code are required');
      return;
    }

    try {
      await apiRequest('/insurers', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          productLines: productLineStr.split(',').map(s => s.trim()).filter(Boolean),
          status: 'sandbox',
          apiUrl: apiUrl.trim() || 'https://sandbox.api.insurer.local',
          slaDays: Number(slaDays) || 3
        })
      });
      toast.success('Approved insurer gateway added!');
      setIsAdding(false);
      setName('');
      setCode('');
      setProductLineStr('Motor, Life');
      setApiUrl('');
      refetch();
    } catch {
      toast.error('Failed to add insurer');
    }
  };

  const handleToggleStatus = async (ins: InsurerItem) => {
    const nextStatus = ins.status === 'active' ? 'sandbox' : ins.status === 'sandbox' ? 'disabled' : 'active';
    try {
      await apiRequest(`/insurers/${ins.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...ins, status: nextStatus })
      });
      toast.success(`${ins.name} status updated to ${nextStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Underwriting Insurer Gateways</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Approved insurance company APIs, quoting gateways, and policy inception endpoints
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Add Underwriting Insurer
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
            placeholder="Search insurer by name or code..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <span className="text-xs text-gray-400">{insurers.length} approved partners</span>
      </div>

      {/* Insurers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insurers.map(ins => (
          <div
            key={ins.id}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-xs border border-red-200/50">
                    {ins.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{ins.name}</h3>
                    <span className="text-[10px] text-gray-400 font-mono">Code: {ins.code}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ins.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : ins.status === 'sandbox'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {ins.status === 'active' && <FiCheckCircle />}
                  {ins.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Product Lines</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(ins.productLines || []).map((line, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white dark:bg-zinc-700 rounded text-[10px] font-medium border border-gray-100 dark:border-zinc-600">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-zinc-700 text-[11px]">
                  <span className="text-gray-400">Claims SLA:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{ins.slaDays} Business Days</span>
                </div>

                <div className="pt-1 border-t border-gray-100 dark:border-zinc-700">
                  <span className="text-[10px] text-gray-400 block">Gateway Base URL</span>
                  <span className="font-mono text-[10px] text-gray-700 dark:text-gray-300 truncate block">{ins.apiUrl}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">FAIS Approved</span>
              <button
                onClick={() => handleToggleStatus(ins)}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Switch to {ins.status === 'active' ? 'Sandbox' : ins.status === 'sandbox' ? 'Disabled' : 'Active'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Insurer Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Add Approved Insurer Underwriter</h3>
            <form onSubmit={handleCreateInsurer} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Insurer Legal Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sanlam Financial Group"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Code</label>
                  <input
                    required
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. SLM"
                    maxLength={6}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Product Lines (comma-separated)</label>
                <input
                  type="text"
                  value={productLineStr}
                  onChange={e => setProductLineStr(e.target.value)}
                  placeholder="e.g. Motor, Life, Investment, Commercial"
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">API Gateway Endpoint URL</label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={e => setApiUrl(e.target.value)}
                    placeholder="https://api.sanlam.co.za/v1"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">SLA (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={slaDays}
                    onChange={e => setSlaDays(Number(e.target.value) || 1)}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
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
                  Register Insurer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

