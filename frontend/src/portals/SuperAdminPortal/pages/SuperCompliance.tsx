import { useState, useMemo } from 'react';
import {
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiGlobe,
  FiLock,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'sonner';

interface ConsentRecord {
  id: string;
  clientName: string;
  idNumber: string;
  framework: 'POPIA' | 'GDPR' | 'HYBRID_EU';
  consentTimestamp: string;
  ficaStatus: 'verified' | 'pending' | 'review_required';
  pepFlag: boolean;
  marketingOptIn: boolean;
}

const SAMPLE_CONSENTS: ConsentRecord[] = [
  {
    id: 'con_01',
    clientName: 'Sipho Dlamini',
    idNumber: '9001015009087',
    framework: 'POPIA',
    consentTimestamp: '2026-09-01T08:30:00Z',
    ficaStatus: 'verified',
    pepFlag: false,
    marketingOptIn: true
  },
  {
    id: 'con_02',
    clientName: 'Olive Khumalo',
    idNumber: '8803145028081',
    framework: 'HYBRID_EU',
    consentTimestamp: '2026-09-02T11:15:00Z',
    ficaStatus: 'verified',
    pepFlag: false,
    marketingOptIn: false
  },
  {
    id: 'con_03',
    clientName: 'Bhekani Sithole',
    idNumber: '8507205112089',
    framework: 'GDPR',
    consentTimestamp: '2026-09-03T14:45:00Z',
    ficaStatus: 'verified',
    pepFlag: false,
    marketingOptIn: true
  },
  {
    id: 'con_04',
    clientName: 'Paseka Mabitsela',
    idNumber: '9205185098083',
    framework: 'POPIA',
    consentTimestamp: '2026-09-04T09:20:00Z',
    ficaStatus: 'verified',
    pepFlag: false,
    marketingOptIn: true
  },
  {
    id: 'con_05',
    clientName: 'Tshepiso Mokoena',
    idNumber: '9511025041088',
    framework: 'POPIA',
    consentTimestamp: '2026-09-05T16:00:00Z',
    ficaStatus: 'pending',
    pepFlag: true,
    marketingOptIn: false
  }
];

export const SuperCompliance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const filteredConsents = useMemo(() => {
    return SAMPLE_CONSENTS.filter(item => {
      const matchesFramework = selectedFramework === 'all' || item.framework === selectedFramework;
      const matchesFlag = !showFlaggedOnly || item.pepFlag || item.ficaStatus === 'pending';
      const matchesSearch =
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.idNumber.includes(searchQuery);
      return matchesFramework && matchesFlag && matchesSearch;
    });
  }, [selectedFramework, showFlaggedOnly, searchQuery]);

  const popiaCount = SAMPLE_CONSENTS.filter(c => c.framework === 'POPIA').length;
  const gdprCount = SAMPLE_CONSENTS.filter(c => c.framework === 'GDPR').length;
  const hybridCount = SAMPLE_CONSENTS.filter(c => c.framework === 'HYBRID_EU').length;
  const pepCount = SAMPLE_CONSENTS.filter(c => c.pepFlag).length;

  const exportConsentCSV = () => {
    const headers = ['Record ID', 'Policyholder Name', 'RSA ID Number', 'Privacy Framework', 'Consent Timestamp (UTC)', 'FICA Status', 'PEP/Sanctions Flag', 'Direct Marketing Opt-In'];
    const rows = filteredConsents.map(c => [
      c.id,
      `"${c.clientName}"`,
      `"${c.idNumber}"`,
      c.framework,
      c.consentTimestamp,
      c.ficaStatus,
      c.pepFlag ? 'FLAGGED_PEP' : 'CLEARED',
      c.marketingOptIn ? 'YES' : 'NO'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POPIA_GDPR_Consent_Register_FSP29370_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('POPIA & GDPR Statutory Consent Register CSV downloaded');
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statutory Compliance & Privacy Governance</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            POPIA (South Africa), EU GDPR Dual Accord, and FICA Screening Register (FSP 29370)
          </p>
        </div>
        <button
          onClick={exportConsentCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FiDownload className="w-4 h-4" /> Export Statutory Consent Register (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">POPIA Consents (SA)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <FiShield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{popiaCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Section 18 statutory disclosures</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">EU GDPR Standard</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <FiGlobe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{gdprCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Cross-border EU resident coverage</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dual Accord (Hybrid)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <FiLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{hybridCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Highest combined privacy standard</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">FICA PEP Flags</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{pepCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Enhanced due diligence required</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedFramework}
            onChange={e => setSelectedFramework(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="all">All Privacy Frameworks</option>
            <option value="POPIA">POPIA Only</option>
            <option value="GDPR">EU GDPR Only</option>
            <option value="HYBRID_EU">Dual Accord (Hybrid EU)</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={e => setShowFlaggedOnly(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            Show Flagged PEP / Pending Only
          </label>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client or RSA ID..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Consents Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Consent Register & Screening Audit</h3>
          <span className="text-xs text-gray-400">{filteredConsents.length} accounts verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Policyholder</th>
                <th className="px-6 py-3">RSA ID Number</th>
                <th className="px-6 py-3">Active Framework</th>
                <th className="px-6 py-3">FICA Status</th>
                <th className="px-6 py-3">PEP / Sanctions</th>
                <th className="px-6 py-3">Direct Marketing</th>
                <th className="px-6 py-3 text-right">Consent Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredConsents.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-gray-900 dark:text-white">{c.clientName}</td>
                  <td className="px-6 py-3.5 font-mono text-gray-600 dark:text-gray-400">{c.idNumber}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.framework === 'HYBRID_EU'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : c.framework === 'GDPR'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {c.framework === 'HYBRID_EU' ? 'POPIA + GDPR Dual Accord' : c.framework}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        c.ficaStatus === 'verified'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {c.ficaStatus === 'verified' ? <FiCheckCircle /> : <FiAlertTriangle />}
                      {c.ficaStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {c.pepFlag ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                        <FiAlertTriangle className="w-3 h-3" /> Politically Exposed (PEP)
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Cleared</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">
                    {c.marketingOptIn ? 'Opted In' : 'Opted Out'}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-[11px] text-gray-500">
                    {new Date(c.consentTimestamp).toLocaleDateString()}
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

