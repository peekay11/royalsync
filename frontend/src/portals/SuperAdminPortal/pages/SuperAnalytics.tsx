import { useState } from 'react';
import {
  FiTrendingUp
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const GWP_GROWTH_DATA = [
  { month: 'Oct 25', gwp: 1800000, activePolicies: 480 },
  { month: 'Nov 25', gwp: 2100000, activePolicies: 540 },
  { month: 'Dec 25', gwp: 2350000, activePolicies: 610 },
  { month: 'Jan 26', gwp: 2600000, activePolicies: 700 },
  { month: 'Feb 26', gwp: 2950000, activePolicies: 810 },
  { month: 'Mar 26', gwp: 3200000, activePolicies: 930 },
  { month: 'Apr 26', gwp: 3550000, activePolicies: 1040 },
  { month: 'May 26', gwp: 3800000, activePolicies: 1120 },
  { month: 'Jun 26', gwp: 4100000, activePolicies: 1200 },
  { month: 'Jul 26', gwp: 4450000, activePolicies: 1290 },
  { month: 'Aug 26', gwp: 4700000, activePolicies: 1360 },
  { month: 'Sep 26', gwp: 5120000, activePolicies: 1480 }
];

const INSURER_SHARE = [
  { name: 'Santam', value: 38, color: '#dc2626' },
  { name: 'Discovery Life', value: 32, color: '#2563eb' },
  { name: 'Allan Gray', value: 16, color: '#16a34a' },
  { name: 'Hollard', value: 8, color: '#f59e0b' },
  { name: 'Momentum', value: 6, color: '#9333ea' }
];

const CLAIMS_LOSS_RATIO = [
  { month: 'Apr', premium: 355000, claims: 142000, ratio: 40.0 },
  { month: 'May', premium: 380000, claims: 155000, ratio: 40.7 },
  { month: 'Jun', premium: 410000, claims: 168000, ratio: 41.0 },
  { month: 'Jul', premium: 445000, claims: 172000, ratio: 38.6 },
  { month: 'Aug', premium: 470000, claims: 185000, ratio: 39.3 },
  { month: 'Sep', premium: 512000, claims: 195000, ratio: 38.1 }
];

export const SuperAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'6M' | '1Y'>('1Y');

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Performance Analytics</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time multi-tenant Gross Written Premium, claims loss ratio, and insurer market distribution
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => setTimeRange('6M')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              timeRange === '6M'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeRange('1Y')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              timeRange === '1Y'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Last 12 Months
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Platform GWP</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            R 5.12M / mo
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <FiTrendingUp /> +184% YoY Growth
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Policies</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            1,480
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across 12 insurer underwriting gateways</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Average Loss Ratio</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            38.1%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Well below the 60% industry benchmark</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Claims Settlement Avg</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            4.2 Days
          </div>
          <p className="text-[11px] text-gray-400 mt-1">From lodgment to insurer payout</p>
        </div>
      </div>

      {/* Main GWP Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Platform Gross Written Premium (ZAR)</h2>
          <p className="text-xs text-gray-400">Monthly recurring premium volume across all brokerage tenants</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeRange === '6M' ? GWP_GROWTH_DATA.slice(-6) : GWP_GROWTH_DATA}>
              <defs>
                <linearGradient id="colorGwp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(val: number) => `R ${(val / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: any) => [`R ${Number(value).toLocaleString()}`, 'Monthly GWP']} />
              <Area type="monotone" dataKey="gwp" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGwp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insurer Share & Loss Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Underwriting Insurer Market Share</h2>
            <p className="text-xs text-gray-400">GWP premium distribution by insurance underwriter</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={INSURER_SHARE} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
                  {INSURER_SHARE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
            {INSURER_SHARE.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 dark:text-gray-300 truncate">{item.name}: <strong>{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Claims Loss Ratio Trend (%)</h2>
            <p className="text-xs text-gray-400">Ratio of paid claims to gross written premium</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CLAIMS_LOSS_RATIO}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" />
                <YAxis domain={[30, 50]} tickFormatter={(val: number) => `${val}%`} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Loss Ratio']} />
                <Line type="monotone" dataKey="ratio" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
            Portfolio underwriting remains highly profitable with an optimal 38.1% loss ratio.
          </div>
        </div>
      </div>
    </div>
  );
};

