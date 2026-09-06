import { useState, useMemo } from 'react';
import {
  FiTrendingUp,
  FiDownload,
  FiFilter,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';

interface CommissionRecord {
  id: string;
  policyRef: string;
  clientName: string;
  insurer: string;
  productType: string;
  grossPremium: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'paid' | 'pending' | 'processing';
  period: string;
}

const SAMPLE_COMMISSIONS: CommissionRecord[] = [
  {
    id: 'comm_01',
    policyRef: 'SAN-AUTO-8921',
    clientName: 'Sipho Dlamini',
    insurer: 'Santam',
    productType: 'Short-Term Motor',
    grossPremium: 2850,
    commissionRate: 12.5,
    commissionAmount: 356.25,
    status: 'paid',
    period: '2026-09'
  },
  {
    id: 'comm_02',
    policyRef: 'DISC-LIFE-4019',
    clientName: 'Olive Khumalo',
    insurer: 'Discovery Life',
    productType: 'Life & Disability',
    grossPremium: 4200,
    commissionRate: 30.0,
    commissionAmount: 1260.0,
    status: 'paid',
    period: '2026-09'
  },
  {
    id: 'comm_03',
    policyRef: 'AG-RA-99201',
    clientName: 'Bhekani Sithole',
    insurer: 'Allan Gray',
    productType: 'Retirement Annuity',
    grossPremium: 15000,
    commissionRate: 3.0,
    commissionAmount: 450.0,
    status: 'paid',
    period: '2026-09'
  },
  {
    id: 'comm_04',
    policyRef: 'HOL-COMM-512',
    clientName: 'Paseka Mabitsela',
    insurer: 'Hollard',
    productType: 'Commercial Property',
    grossPremium: 8900,
    commissionRate: 15.0,
    commissionAmount: 1335.0,
    status: 'processing',
    period: '2026-09'
  },
  {
    id: 'comm_05',
    policyRef: 'MOM-HEALTH-102',
    clientName: 'Tshepiso Mokoena',
    insurer: 'Momentum',
    productType: 'Medical Aid Gap',
    grossPremium: 1450,
    commissionRate: 10.0,
    commissionAmount: 145.0,
    status: 'pending',
    period: '2026-09'
  },
  {
    id: 'comm_06',
    policyRef: 'SAN-PROP-771',
    clientName: 'Lerato Ndlovu',
    insurer: 'Santam',
    productType: 'Home & Contents',
    grossPremium: 1850,
    commissionRate: 12.5,
    commissionAmount: 231.25,
    status: 'paid',
    period: '2026-08'
  },
  {
    id: 'comm_07',
    policyRef: 'OM-INVEST-330',
    clientName: 'Farai Moyo',
    insurer: 'Old Mutual',
    productType: 'Endowment Policy',
    grossPremium: 6000,
    commissionRate: 5.0,
    commissionAmount: 300.0,
    status: 'paid',
    period: '2026-08'
  }
];

const MONTHLY_DATA = [
  { month: 'Apr', earned: 38400, gwp: 320000 },
  { month: 'May', earned: 41200, gwp: 345000 },
  { month: 'Jun', earned: 39800, gwp: 330000 },
  { month: 'Jul', earned: 43500, gwp: 360000 },
  { month: 'Aug', earned: 44100, gwp: 375000 },
  { month: 'Sep', earned: 45200, gwp: 395000 }
];

const PRODUCT_SPLIT = [
  { name: 'Life & Risk', value: 42, color: '#dc2626' },
  { name: 'Short-Term', value: 33, color: '#2563eb' },
  { name: 'Investments', value: 18, color: '#16a34a' },
  { name: 'Healthcare', value: 7, color: '#f59e0b' }
];

export const AdminCommissions = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsurer, setSelectedInsurer] = useState('all');

  const filteredRecords = useMemo(() => {
    return SAMPLE_COMMISSIONS.filter(rec => {
      const matchesPeriod = selectedPeriod === 'all' || rec.period === selectedPeriod;
      const matchesInsurer = selectedInsurer === 'all' || rec.insurer === selectedInsurer;
      const matchesSearch =
        (rec.clientName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (rec.policyRef || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (rec.productType || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      return matchesPeriod && matchesInsurer && matchesSearch;
    });
  }, [selectedPeriod, selectedInsurer, searchQuery]);

  const totalEarned = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + r.commissionAmount, 0);
  }, [filteredRecords]);

  const totalGWP = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + r.grossPremium, 0);
  }, [filteredRecords]);

  const exportStatement = () => {
    const csvContent = [
      ['Policy Reference', 'Client Name', 'Insurer', 'Product Type', 'Gross Premium (ZAR)', 'Commission Rate (%)', 'Commission Amount (ZAR)', 'Status', 'Period'].join(','),
      ...filteredRecords.map(r =>
        [r.policyRef, `"${r.clientName}"`, r.insurer, `"${r.productType}"`, r.grossPremium.toFixed(2), r.commissionRate, r.commissionAmount.toFixed(2), r.status, r.period].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Commission_Statement_${selectedPeriod}_FSP29370.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Commission statement CSV exported successfully');
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broker Commissions & Remuneration</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Intermediary commission ledger compliant with FAIS Remuneration Regulations (FSP 29370)
          </p>
        </div>
        <button
          onClick={exportStatement}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FiDownload className="w-4 h-4" /> Export Remuneration Statement (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Earned (Filtered)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            R {totalEarned.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <FiTrendingUp /> +6.8% vs last month
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gross Written Premium</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            R {totalGWP.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Under broker intermediary mandate</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Effective Commission Yield</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {totalGWP > 0 ? ((totalEarned / totalGWP) * 100).toFixed(1) : '11.4'}%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Weighted average across product lines</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Settled vs Pending</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            96.8%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Insurer direct debit reconciliation</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Commission Revenue Growth (ZAR)</h2>
          <p className="text-xs text-gray-400 mb-4">6-month monthly broker remuneration trajectory</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R ${Number(value).toLocaleString()}`, 'Commission Earned']} />
                <Bar dataKey="earned" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Product Line Share</h2>
            <p className="text-xs text-gray-400 mb-2">Breakdown of earnings by line of business</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PRODUCT_SPLIT} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4}>
                    {PRODUCT_SPLIT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px]">
            {PRODUCT_SPLIT.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-gray-600 dark:text-gray-300">{p.name}: <strong>{p.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">All Periods</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
            </select>
          </div>

          <select
            value={selectedInsurer}
            onChange={e => setSelectedInsurer(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="all">All Insurers</option>
            <option value="Santam">Santam</option>
            <option value="Discovery Life">Discovery Life</option>
            <option value="Allan Gray">Allan Gray</option>
            <option value="Hollard">Hollard</option>
            <option value="Momentum">Momentum</option>
            <option value="Old Mutual">Old Mutual</option>
          </select>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by policy ref, client, or product..."
          className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2 w-full sm:w-72 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Remuneration Ledger</h3>
          <span className="text-xs text-gray-400">{filteredRecords.length} records matching</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Policy Reference</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Insurer</th>
                <th className="px-6 py-3">Product Type</th>
                <th className="px-6 py-3 text-right">Gross Premium</th>
                <th className="px-6 py-3 text-right">Rate</th>
                <th className="px-6 py-3 text-right">Commission</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white">{rec.policyRef}</td>
                  <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{rec.clientName}</td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">{rec.insurer}</td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">{rec.productType}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-medium text-gray-900 dark:text-white">
                    R {rec.grossPremium.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-gray-500">{rec.commissionRate}%</td>
                  <td className="px-6 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    R {rec.commissionAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        rec.status === 'paid'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : rec.status === 'processing'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {rec.status === 'paid' && <FiCheckCircle className="w-3 h-3" />}
                      {rec.status === 'processing' && <FiClock className="w-3 h-3" />}
                      {rec.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

