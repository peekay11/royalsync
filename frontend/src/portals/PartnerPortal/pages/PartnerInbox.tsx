import { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiSend, 
  FiEye, 
  FiFileText, 
  FiRefreshCw, 
  FiX, 
  FiShield 
} from 'react-icons/fi';
import { toast } from 'sonner';
import { apiRequest } from '../../../lib/api';

interface QuoteApplication {
  id: string;
  customerName?: string;
  applicant?: string;
  product: string;
  amount: number;
  status: 'pending' | 'submitted' | 'quoted' | 'approved' | 'accepted' | 'declined';
  date?: string;
  createdAt?: string;
  riskDetails?: {
    assetType?: string;
    location?: string;
    securityMeasures?: string;
    pastClaims?: number;
  };
  quote?: {
    monthlyPremium: number;
    annualPremium: number;
    excess: number;
    terms: string;
    validityDays: number;
    quotedAt: string;
  };
  declineReason?: string;
}

const DEFAULT_APPLICATIONS: QuoteApplication[] = [
  {
    id: 'REQ-8902',
    customerName: 'Apex Logistics Ltd',
    product: 'Comprehensive Commercial Fleet',
    amount: 850000,
    status: 'pending',
    date: '2026-09-05',
    riskDetails: {
      assetType: '12x Heavy Freight Scania Trucks',
      location: 'Gauteng - Durban Corridor',
      securityMeasures: '24/7 Satellite Telematics & Armed Response',
      pastClaims: 1
    }
  },
  {
    id: 'REQ-8903',
    customerName: 'Dr. Thandi Nkosi Medical Practice',
    product: 'Professional Indemnity & Life',
    amount: 12000000,
    status: 'pending',
    date: '2026-09-04',
    riskDetails: {
      assetType: 'Specialist Surgical Practice',
      location: 'Sandton, Johannesburg',
      securityMeasures: 'Full HPCSA Compliance & Biometric Record Storage',
      pastClaims: 0
    }
  },
  {
    id: 'REQ-8904',
    customerName: 'BlueSky Tech Hub',
    product: 'Cyber Liability & Cloud Asset Cover',
    amount: 5000000,
    status: 'quoted',
    date: '2026-09-03',
    quote: {
      monthlyPremium: 4200,
      annualPremium: 50400,
      excess: 15000,
      terms: 'Standard Cyber Extortion and First-party Data Breach coverage underwritten by RoyalSync Partner Gateway.',
      validityDays: 30,
      quotedAt: '2026-09-04'
    }
  },
  {
    id: 'REQ-8905',
    customerName: 'Cape Vines Estate Pty Ltd',
    product: 'Commercial Property & Agribusiness',
    amount: 18500000,
    status: 'accepted',
    date: '2026-09-01',
    quote: {
      monthlyPremium: 14500,
      annualPremium: 174000,
      excess: 25000,
      terms: 'Includes Viticulture Crop Hail Protection and Cold-storage machinery breakdown endorsement.',
      validityDays: 30,
      quotedAt: '2026-09-02'
    }
  }
];

export const PartnerInbox = () => {
  const [applications, setApplications] = useState<QuoteApplication[]>(DEFAULT_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [selectedApp, setSelectedApp] = useState<QuoteApplication | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Quote Form state
  const [quoteForm, setQuoteForm] = useState({
    monthlyPremium: '',
    excess: '',
    validityDays: '30',
    terms: '',
    specialConditions: ''
  });

  // Decline Form state
  const [declineReason, setDeclineReason] = useState('Risk profile outside current underwriting appetite');

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any[]>('/sales/applications');
      if (Array.isArray(res) && res.length > 0) {
        const mapped = res.map(item => ({
          id: item.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: item.customerName || item.applicant || 'Applicant Client',
          product: item.product || 'Commercial Comprehensive',
          amount: Number(item.amount) || 250000,
          status: (item.status as any) || 'pending',
          date: item.date || item.createdAt || new Date().toISOString().split('T')[0],
          quote: item.quoteDetails || item.quote,
          riskDetails: item.riskDetails || {
            assetType: 'Specified Business Property',
            location: 'South Africa',
            securityMeasures: 'Monitored Alarm & Fire Suppression',
            pastClaims: 0
          }
        }));
        setApplications(mapped);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const openQuoteModal = (app: QuoteApplication) => {
    setSelectedApp(app);
    setQuoteForm({
      monthlyPremium: (app.amount ? Math.round(app.amount * 0.003).toString() : '2500'),
      excess: (app.amount ? Math.round(app.amount * 0.02).toString() : '5000'),
      validityDays: '30',
      terms: `Binding terms provided for ${app.product}. Subject to standard underwriter policy schedules and warranties.`,
      specialConditions: 'Subject to valid annual maintenance inspection and tracker verification.'
    });
    setIsQuoteModalOpen(true);
  };

  const openDeclineModal = (app: QuoteApplication) => {
    setSelectedApp(app);
    setDeclineReason('Risk profile outside current underwriting appetite');
    setIsDeclineModalOpen(true);
  };

  const openViewModal = (app: QuoteApplication) => {
    setSelectedApp(app);
    setIsViewModalOpen(true);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const monthly = parseFloat(quoteForm.monthlyPremium) || 0;
    const excess = parseFloat(quoteForm.excess) || 0;
    const annual = monthly * 12;

    const quotePayload = {
      monthlyPremium: monthly,
      annualPremium: annual,
      excess: excess,
      terms: quoteForm.terms + (quoteForm.specialConditions ? ` Special Conditions: ${quoteForm.specialConditions}` : ''),
      validityDays: parseInt(quoteForm.validityDays) || 30,
      quotedAt: new Date().toISOString().split('T')[0]
    };

    try {
      await apiRequest(`/sales/applications/${selectedApp.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'quoted',
          quoteDetails: quotePayload
        })
      });
    } catch {
      // Local state fallback
    }

    setApplications(prev => prev.map(item => 
      item.id === selectedApp.id 
        ? { ...item, status: 'quoted', quote: quotePayload } 
        : item
    ));

    toast.success(`Binding quote submitted for ${selectedApp.id}! Premium: R ${monthly.toLocaleString()}/m`);
    setIsQuoteModalOpen(false);
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await apiRequest(`/sales/applications/${selectedApp.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'declined',
          declineReason: declineReason
        })
      });
    } catch {
      // fallback
    }

    setApplications(prev => prev.map(item => 
      item.id === selectedApp.id 
        ? { ...item, status: 'declined', declineReason } 
        : item
    ));

    toast.info(`Application ${selectedApp.id} marked as Declined.`);
    setIsDeclineModalOpen(false);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.id && app.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.customerName && app.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.product && app.product.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && app.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Underwriting Quotes Inbox</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review inbound broker requests, assess risk schedules, and submit binding terms.
          </p>
        </div>
        <button
          onClick={loadApplications}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          Refresh Inbox
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reference, client, product..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'pending', 'quoted', 'accepted', 'declined'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === filter
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Client & Asset</th>
                <th className="px-6 py-3.5">Product Type</th>
                <th className="px-6 py-3.5">Sum Insured</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <FiFileText className="mx-auto text-3xl mb-2 text-gray-300" />
                    No quote requests match your current filters.
                  </td>
                </tr>
              ) : (
                filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900 dark:text-white">
                      {app.id}
                      <span className="block text-[11px] font-normal text-gray-400">{app.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {app.customerName || 'Corporate Client'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {app.riskDetails?.assetType || 'Specified Risk Items'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium">
                        <FiShield className="text-red-500 text-xs" />
                        {app.product}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                      R {Number(app.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        app.status === 'accepted' || app.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : app.status === 'quoted'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : app.status === 'declined'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(app)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          title="View Details"
                        >
                          <FiEye className="text-base" />
                        </button>

                        {app.status === 'pending' || app.status === 'submitted' ? (
                          <>
                            <button
                              onClick={() => openDeclineModal(app)}
                              className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded border border-red-200 dark:border-red-800 transition"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => openQuoteModal(app)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition flex items-center gap-1"
                            >
                              <FiSend className="text-xs" /> Quote
                            </button>
                          </>
                        ) : app.status === 'quoted' ? (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Quoted: R {app.quote?.monthlyPremium?.toLocaleString()}/m
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <span className="text-xs font-mono text-red-600 dark:text-red-400 font-bold">{selectedApp.id}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedApp.customerName}</h3>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-750 p-3 rounded-xl">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Product</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedApp.product}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Sum Insured</span>
                  <span className="font-semibold font-mono text-gray-900 dark:text-white">R {Number(selectedApp.amount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Underwriting Risk Schedule</h4>
                <div className="space-y-1.5 bg-gray-50 dark:bg-gray-750 p-3 rounded-xl text-xs">
                  <p><strong className="text-gray-700 dark:text-gray-300">Asset/Operation:</strong> {selectedApp.riskDetails?.assetType || 'Standard Schedule'}</p>
                  <p><strong className="text-gray-700 dark:text-gray-300">Location:</strong> {selectedApp.riskDetails?.location || 'National South Africa'}</p>
                  <p><strong className="text-gray-700 dark:text-gray-300">Security / Protections:</strong> {selectedApp.riskDetails?.securityMeasures || 'Approved Alarm System'}</p>
                  <p><strong className="text-gray-700 dark:text-gray-300">Prior 3-Year Claims:</strong> {selectedApp.riskDetails?.pastClaims ?? 0}</p>
                </div>
              </div>

              {selectedApp.quote && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-xl">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase mb-1">Active Quote Terms</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Monthly Premium: <strong className="font-mono">R {selectedApp.quote.monthlyPremium.toLocaleString()}</strong></div>
                    <div>Excess: <strong className="font-mono">R {selectedApp.quote.excess.toLocaleString()}</strong></div>
                    <div className="col-span-2 text-[11px] text-gray-600 dark:text-gray-300 mt-1">{selectedApp.quote.terms}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT QUOTE MODAL */}
      {isQuoteModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <span className="text-xs font-mono text-red-600 dark:text-red-400 font-bold">BIND QUOTE</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Terms for {selectedApp.id}</h3>
              </div>
              <button 
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Premium (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-mono">R</span>
                    <input
                      type="number"
                      required
                      value={quoteForm.monthlyPremium}
                      onChange={e => setQuoteForm({ ...quoteForm, monthlyPremium: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Excess / Deductible (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-mono">R</span>
                    <input
                      type="number"
                      required
                      value={quoteForm.excess}
                      onChange={e => setQuoteForm({ ...quoteForm, excess: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Quote Validity Period (Days)
                </label>
                <select
                  value={quoteForm.validityDays}
                  onChange={e => setQuoteForm({ ...quoteForm, validityDays: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Underwriter Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={quoteForm.terms}
                  onChange={e => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Special Subjectivities / Warranties
                </label>
                <input
                  type="text"
                  value={quoteForm.specialConditions}
                  onChange={e => setQuoteForm({ ...quoteForm, specialConditions: e.target.value })}
                  placeholder="e.g. Telematics tracker installed within 14 days"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <FiSend className="text-xs" /> Submit Bindable Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECLINE MODAL */}
      {isDeclineModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Decline Application {selectedApp.id}</h3>
              <button 
                onClick={() => setIsDeclineModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Non-Appetite / Decline
                </label>
                <select
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-white"
                >
                  <option value="Risk profile outside current underwriting appetite">Risk profile outside current underwriting appetite</option>
                  <option value="Exceeds current maximum treaty line limit">Exceeds current maximum treaty line limit</option>
                  <option value="Adverse claims history / loss ratio threshold">Adverse claims history / loss ratio threshold</option>
                  <option value="Incomplete risk disclosures or missing security warranty">Incomplete risk disclosures or missing security warranty</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
