import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import {
  FiShield,
  FiFileText,
  FiTarget,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiCheckCircle,
  FiLayers,
  FiGlobe
} from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IncidentCountdownTimer } from '../../../components/claims/IncidentCountdownTimer';

interface ClientDashboardData {
  activePolicyCount: number;
  monthlyPremium: number;
  openClaims: number;
  nextPayment: { amount?: number; date?: string } | null;
  goals: { target: number; current: number; percentage: number };
  premiumByType: Array<{ name: string; value: number }>;
}

export const ClientDashboard = () => {
  const { data, loading, error, refetch } = useApi<ClientDashboardData>('/dashboard/client');
  const { data: profile } = useApi<any>('/user/profile');
  const [expandedWealth, setExpandedWealth] = useState(false);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard data...</div>;
  if (error) return (
    <div className="p-8 space-y-3">
      <p className="text-red-600">{error}</p>
      <button onClick={refetch} className="border rounded-lg px-4 py-2 hover:bg-gray-50">Retry</button>
    </div>
  );

  const totalWealth = profile?.totalNetWorthFormatted || 'R 2,840,000.00';
  const monthlyPrem = data?.monthlyPremium ? `R ${data.monthlyPremium.toLocaleString()}` : (profile?.totalMonthlyPremium || 'R 6,450.00');

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good morning, {profile?.firstName || JSON.parse(localStorage.getItem('royalsync_user') || '{}')?.firstName || 'Policyholder'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Royal Square Financial Client Portal · FSP Licence 29370
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
          <FiCheckCircle className="w-3.5 h-3.5" /> FICA / KYC Compliant
        </span>
      </div>

      {/* ACTIVE INCIDENT ISSUE & 48-HOUR DOCUMENT REPORTING COUNTDOWN */}
      <IncidentCountdownTimer
        incidentType="Car Collision"
        incidentTitle="2024 Mercedes-Benz C200 AMG Line (Reg: JH 88 GP)"
      />

      {/* TOTAL PORTFOLIO & WEALTH VALUE (Expandable Hero Card) */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-700/60 relative overflow-hidden transition-all">
        {/* Background glow watermark */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                  TOTAL PORTFOLIO & WEALTH VALUE
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  <FiTrendingUp className="w-3 h-3" /> +4.2% YTD
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 text-white">
                {totalWealth}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {data?.activePolicyCount || profile?.activePoliciesCount || 2} Active Mandated Portfolios · {monthlyPrem}/mo premium contribution
              </p>
            </div>

            {/* Expand / Collapse Button */}
            <button
              type="button"
              id="expand-portfolio-breakdown-btn"
              onClick={() => setExpandedWealth(prev => !prev)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
            >
              {expandedWealth ? (
                <>
                  <FiChevronUp className="w-4 h-4" /> Hide Portfolio Breakdown
                </>
              ) : (
                <>
                  <FiChevronDown className="w-4 h-4" /> Click to Expand Breakdown
                </>
              )}
            </button>
          </div>

          {/* EXPANDED DETAILED BREAKDOWN ACCORDION */}
          {expandedWealth && (
            <div className="mt-8 pt-6 border-t border-gray-700/80 space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FiLayers className="text-red-400" /> What Makes Up Your Total Wealth & Portfolio
                  </h3>
                  <p className="text-xs text-gray-400">
                    Comprehensive asset valuation audited under FAIS statutory mandate 29370.
                  </p>
                </div>
                <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                  Daily FSP Feed Synchronized
                </span>
              </div>

              {/* Asset Class Allocation Bar */}
              <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 flex items-center justify-between">
                  <span>Asset Class Allocation</span>
                  <span className="text-[11px] text-gray-400 font-normal">Moderate Growth Strategy</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-700">
                  <div style={{ width: '42%' }} className="bg-red-500 h-full" title="Equities 42%" />
                  <div style={{ width: '30%' }} className="bg-amber-500 h-full" title="Fixed Income 30%" />
                  <div style={{ width: '15%' }} className="bg-emerald-500 h-full" title="Property / Real Estate 15%" />
                  <div style={{ width: '13%' }} className="bg-indigo-500 h-full" title="Cash & Money Market 13%" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    <span>Equities: <strong>42%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Fixed Income: <strong>30%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Property: <strong>15%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                    <span>Cash & Money: <strong>13%</strong></span>
                  </div>
                </div>
              </div>

              {/* Breakdown Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Retirement & Preservation */}
                <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
                    <span className="text-xs font-bold text-gray-200">1. Retirement & Preservation</span>
                    <span className="text-xs font-bold text-amber-400">R 1,390,000 (48.9%)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40">
                      <div>
                        <div className="font-semibold text-white">Sanlam Glacier Retirement Annuity</div>
                        <div className="text-[10px] text-gray-400">Ref: RA-781920 · Section 10C Tax Shielded</div>
                      </div>
                      <span className="font-bold text-white">R 850,000</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40">
                      <div>
                        <div className="font-semibold text-white">Old Mutual SuperFund Preservation</div>
                        <div className="text-[10px] text-gray-400">Ref: PRF-449102 · Vested Preserved Capital</div>
                      </div>
                      <span className="font-bold text-white">R 540,000</span>
                    </div>
                  </div>
                </div>

                {/* 2. Liquid Funds & Unit Trusts */}
                <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
                    <span className="text-xs font-bold text-gray-200">2. Liquid Investments & Money Market</span>
                    <span className="text-xs font-bold text-amber-400">R 1,100,000 (38.7%)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40">
                      <div>
                        <div className="font-semibold text-white">Ninety One High Income Fund</div>
                        <div className="text-[10px] text-gray-400">Ref: UT-901844 · Monthly Interest Reinvestment</div>
                      </div>
                      <span className="font-bold text-white">R 680,000</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40">
                      <div>
                        <div className="font-semibold text-white">Allan Gray Money Market Fund</div>
                        <div className="text-[10px] text-gray-400">Ref: MM-339102 · T+1 Liquidity Shield</div>
                      </div>
                      <span className="font-bold text-white">R 420,000</span>
                    </div>
                  </div>
                </div>

                {/* 3. Offshore & Global Equities */}
                <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700/60">
                    <span className="text-xs font-bold text-gray-200">3. Offshore & Hard Currency</span>
                    <span className="text-xs font-bold text-amber-400">R 350,000 (12.4%)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40">
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1">
                          <FiGlobe className="text-indigo-400" /> Coronation Global Optimum Growth
                        </div>
                        <div className="text-[10px] text-gray-400">Ref: OFF-110294 · Global Equity Feeder</div>
                      </div>
                      <span className="font-bold text-white">R 350,000</span>
                    </div>
                  </div>
                </div>

                {/* 4. Insured Protection Cover */}
                <div className="bg-gradient-to-br from-red-950/40 to-gray-900 rounded-xl p-4 border border-red-900/50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-red-900/50">
                    <span className="text-xs font-bold text-red-300">4. Insured Risk & Asset Protection</span>
                    <span className="text-xs font-bold text-red-300">R 3,350,000 Total Cover</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
                      <div>
                        <div className="font-semibold text-white">Discovery Life Comprehensive Cover</div>
                        <div className="text-[10px] text-gray-400">Life, Disability & Severe Illness · R 3,200/mo</div>
                      </div>
                      <span className="font-bold text-white">R 2,500,000</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
                      <div>
                        <div className="font-semibold text-white">Santam Comprehensive Asset Insurance</div>
                        <div className="text-[10px] text-gray-400">Vehicle, Home & Contents · R 1,850/mo</div>
                      </div>
                      <span className="font-bold text-white">R 850,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col justify-between hover:border-red-200 dark:hover:border-red-900 transition-colors bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Policies</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <FiShield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {data?.activePolicyCount || profile?.activePoliciesCount || 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Under active adviser management</p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col justify-between hover:border-red-200 dark:hover:border-red-900 transition-colors bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Open Claims</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <FiFileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {data?.openClaims || 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Direct claims assessor status</p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col justify-between hover:border-red-200 dark:hover:border-red-900 transition-colors bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Top Goal Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <FiTarget className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {data?.goals?.percentage ?? profile?.goalCompletionRate ?? 68}%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Retirement milestone tracking</p>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Monthly Premium by Cover Type</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Distribution of monthly insurance & investment premiums.</p>
          {data?.premiumByType?.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.premiumByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d92820" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No policy premium data is available yet.
            </div>
          )}
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Adviser Mandate & Support</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Your appointed FAIS licensed financial services provider.</p>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="font-bold text-sm text-gray-900 dark:text-white">Royal Square Financial (Pty) Ltd</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">FSP Licence 29370</div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Appointed adviser <strong>Qiniso Thulani Ntuli</strong> manages your portfolio rebalancing and claims advocacy.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Next Valuation Review: <strong>30 Sep 2026</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Active Status</span>
          </div>
        </div>
      </div>
    </div>
  );
};
