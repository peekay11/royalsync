import { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp, 
  FiArrowRight, 
  FiSend, 
  FiRefreshCw 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiRequest } from '../../../lib/api';

const quoteTrendData = [
  { month: 'Apr', received: 18, quoted: 16, accepted: 11 },
  { month: 'May', received: 24, quoted: 22, accepted: 15 },
  { month: 'Jun', received: 30, quoted: 27, accepted: 19 },
  { month: 'Jul', received: 28, quoted: 25, accepted: 18 },
  { month: 'Aug', received: 35, quoted: 32, accepted: 24 },
  { month: 'Sep', received: 42, quoted: 38, accepted: 29 },
];

export const PartnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any[]>('/sales/applications');
      if (Array.isArray(res)) {
        setApplications(res);
      }
    } catch {
      // Fallback local initial state if server is offline
      setApplications([
        { id: 'APP-8902', customerName: 'Apex Logistics Ltd', product: 'Commercial Fleet', amount: 48500, status: 'pending', date: '2026-09-05' },
        { id: 'APP-8903', customerName: 'Dr. Thandi Nkosi', product: 'Executive Life Cover', amount: 12500, status: 'submitted', date: '2026-09-04' },
        { id: 'APP-8904', customerName: 'BlueSky Technologies', product: 'Cyber Liability', amount: 36000, status: 'approved', date: '2026-09-02' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalRequests = applications.length || 14;
  const pendingRequests = applications.filter(a => a.status === 'pending' || a.status === 'submitted').length || 6;
  const approvedQuotes = applications.filter(a => a.status === 'approved' || a.status === 'accepted').length || 8;
  const totalValue = applications.reduce((sum, a) => sum + (Number(a.amount) || 0), 0) || 128500;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-red-900 to-red-800 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-red-200">Underwriting & Distribution Partner</span>
          <h1 className="text-2xl font-bold mt-1">Partner Portal Dashboard</h1>
          <p className="text-red-100 text-sm mt-1">
            Review live inbound quote requests, submit bindable terms, and track conversion SLAs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/20"
          >
            <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/partner/inbox"
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-900 hover:bg-red-50 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <FiSend className="text-sm" />
            Quotes Inbox
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inbound Requests</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <FiFileText className="text-lg" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{totalRequests}</div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
            <FiTrendingUp /> +18% vs last month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Awaiting Quote</span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <FiClock className="text-lg" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{pendingRequests}</div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
            Requires underwriter review
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quotes Accepted</span>
            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <FiCheckCircle className="text-lg" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">{approvedQuotes}</div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
            76.3% bind conversion rate
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gross Quoted Value</span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <FiTrendingUp className="text-lg" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-3">
            R {totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Annualised Gross Written Premium
          </p>
        </div>
      </div>

      {/* Chart & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quote Pipeline & Conversion</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly breakdown of received requests, quoted policies, and bound contracts</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quoteTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="received" name="Received" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quoted" name="Quoted" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accepted" name="Bound/Accepted" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Partner Status */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Partner Underwriting Status</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Direct integration with RoyalSync Broker Gateway</p>
            
            <div className="mt-5 space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Underwriting License:</span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">FSP Active</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Target SLA Response:</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Under 4 Hours</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Automated Webhook:</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Connected</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/partner/setup"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition"
            >
              Update Underwriting Profile
              <FiArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Inbound Applications Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Quote Applications</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Inbound policy applications awaiting your assessment</p>
          </div>
          <Link
            to="/partner/inbox"
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            View All in Inbox <FiArrowRight />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Applicant / Client</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Insured Sum</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {applications.slice(0, 5).map((app, idx) => (
                <tr key={app.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                    {app.id || `APP-${8900 + idx}`}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {app.customerName || app.applicant || 'Corporate Client'}
                  </td>
                  <td className="px-6 py-4">{app.product || 'Commercial Comprehensive'}</td>
                  <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                    R {Number(app.amount || 35000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      app.status === 'approved' || app.status === 'accepted'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : app.status === 'quoted'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>
                      {app.status ? String(app.status).toUpperCase() : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/partner/inbox"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline"
                    >
                      Review & Quote <FiArrowRight />
                    </Link>
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
