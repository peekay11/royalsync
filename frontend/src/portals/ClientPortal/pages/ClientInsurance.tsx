import { useState, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { 
  FiShield, FiPlus, FiSearch, FiFilter, FiDollarSign, 
  FiCheckCircle, FiFileText, FiX, FiRefreshCw, FiClock,
  FiChevronRight, FiInfo, FiTruck, FiHeart, FiHome,
  FiActivity, FiUsers, FiTrendingUp, FiSmartphone
} from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { CompanyLogo } from '../../../components/CompanyLogo';

const COVER_CATEGORIES = [
  {
    type: 'Comprehensive Motor Vehicle',
    iconType: 'motor',
    desc: 'Full accidental, theft, third-party and roadside assistance cover.',
    defaultSum: '350000',
    estPremium: '1450',
    popularInsurer: 'Santam'
  },
  {
    type: 'Life Cover & Dread Disease',
    iconType: 'life',
    desc: 'Lump-sum payout for loved ones and critical illness protection.',
    defaultSum: '3000000',
    estPremium: '1850',
    popularInsurer: 'Discovery Life'
  },
  {
    type: 'Building & Home Contents Cover',
    iconType: 'home',
    desc: 'Protection against fire, burst geysers, flood, storm damage and theft.',
    defaultSum: '1500000',
    estPremium: '980',
    popularInsurer: 'Hollard'
  },
  {
    type: 'Medical Aid & Gap Cover',
    iconType: 'medical',
    desc: 'Hospitalisation tariff shortfalls, specialist co-payments and oncology.',
    defaultSum: '1000000',
    estPremium: '2400',
    popularInsurer: 'Discovery Health'
  },
  {
    type: 'Family Funeral Plan',
    iconType: 'funeral',
    desc: 'Guaranteed 24-48h burial payout with cash repatriation and tombstone benefits.',
    defaultSum: '80000',
    estPremium: '380',
    popularInsurer: 'Old Mutual'
  },
  {
    type: 'Retirement Annuity & Wealth Builder',
    iconType: 'retirement',
    desc: 'Tax-efficient investment with offshore & multi-asset market exposure.',
    defaultSum: '500000',
    estPremium: '2000',
    popularInsurer: 'Sanlam'
  },
  {
    type: 'Personal Valuables & All-Risk',
    iconType: 'valuables',
    desc: 'Worldwide portable protection for laptops, cell phones, watches and jewellery.',
    defaultSum: '75000',
    estPremium: '290',
    popularInsurer: 'FNB Insurance'
  },
];

const INSURERS = [
  { name: 'Let Adviser Compare All Quotes', id: '' },
  { name: 'Santam', id: 'santam' },
  { name: 'Discovery Life', id: 'discovery' },
  { name: 'Old Mutual', id: 'oldmutual' },
  { name: 'Sanlam', id: 'sanlam' },
  { name: 'Momentum', id: 'momentum' },
  { name: 'Hollard', id: 'hollard' },
  { name: 'FNB Insurance', id: 'fnb' },
];

export const ClientInsurance = () => {
  const { data: policies, loading, refetch } = useApi<any[]>('/policies');
  const { data: applications, refetch: refetchApps } = useApi<any[]>('/sales/applications');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(COVER_CATEGORIES[0]);
  const [selectedInsurerName, setSelectedInsurerName] = useState('Let Adviser Compare All Quotes');
  const [requestedSumAssured, setRequestedSumAssured] = useState(COVER_CATEGORIES[0].defaultSum);
  const [budgetMonthly, setBudgetMonthly] = useState(COVER_CATEGORIES[0].estPremium);
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Policy Detail Modal
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState<any | null>(null);

  const handleSelectCategory = (cat: typeof COVER_CATEGORIES[0]) => {
    setSelectedProduct(cat);
    setRequestedSumAssured(cat.defaultSum);
    setBudgetMonthly(cat.estPremium);
  };

  const handleRequestPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/sales/applications', {
        method: 'POST',
        body: JSON.stringify({
          productType: selectedProduct.type,
          premium: budgetMonthly,
          sumAssured: requestedSumAssured,
          notes: requestNotes
        })
      });
      toast.success('Policy quote request submitted! Your adviser will prepare comparison options.');
      setShowRequestModal(false);
      setRequestNotes('');
      refetchApps();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit policy request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    return policies.filter(p => {
      if (!p) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const matchSearch = !q || (
        (p.policyNumber || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (p.provider || '').toLowerCase().includes(q)
      );
      const matchCat = categoryFilter === 'all' || (p.type || '').toLowerCase().includes((categoryFilter || '').toLowerCase());
      return matchSearch && matchCat;
    });
  }, [policies, searchQuery, categoryFilter]);

  // Portfolio Totals
  const totalPolicies = policies?.length || 0;
  const totalMonthlyPremium = policies?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0;
  const totalSumAssured = policies?.reduce((sum, p) => sum + (p.sumAssured || 0), 0) || 0;

  const renderCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'motor':
        return <FiTruck className="text-[#d92820] text-base" />;
      case 'life':
        return <FiHeart className="text-[#d92820] text-base" />;
      case 'home':
        return <FiHome className="text-[#d92820] text-base" />;
      case 'medical':
        return <FiActivity className="text-[#d92820] text-base" />;
      case 'funeral':
        return <FiUsers className="text-[#d92820] text-base" />;
      case 'retirement':
        return <FiTrendingUp className="text-[#d92820] text-base" />;
      case 'valuables':
        return <FiSmartphone className="text-[#d92820] text-base" />;
      default:
        return <FiShield className="text-[#d92820] text-base" />;
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <ClipLoader color="#d92820" size={36} />
        <p className="text-gray-500 text-xs font-medium">Loading your insurance portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header & Top Actions ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Insurance Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your active policies, sum assured coverage, and request new insurance protection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { refetch(); refetchApps(); }}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh policies"
          >
            <FiRefreshCw className="text-base" />
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-[#d92820] hover:bg-[#b8201a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <FiPlus className="text-lg" />
            Request New Policy / Add Cover
          </button>
        </div>
      </div>

      {/* ─── Portfolio Metrics ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Policies</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalPolicies}</div>
            <span className="text-xs text-green-600 font-medium mt-0.5 inline-block">100% Protected</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#d92820] flex items-center justify-center text-xl font-bold">
            <FiShield />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Premium</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">R {totalMonthlyPremium.toLocaleString()}</div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Direct debit billing</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Sum Assured</span>
            <div className="text-2xl font-bold text-[#d92820] mt-1">R {totalSumAssured.toLocaleString()}</div>
            <span className="text-xs text-gray-500 mt-0.5 inline-block">Total risk liability cover</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            <FiCheckCircle />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quote Requests</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{applications?.length || 0}</div>
            <span className="text-xs text-amber-600 font-medium mt-0.5 inline-block">In advisory review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiClock />
          </div>
        </div>
      </div>

      {/* ─── Pending Quote Requests Banner (if any) ──────────────────────── */}
      {applications && applications.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiClock className="text-amber-600 text-lg" />
              <h3 className="font-bold text-sm text-gray-900">Your Active Policy Applications & Quotes</h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {applications.length} Pending Broker Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {applications.map(app => (
              <div key={app.id} className="bg-white p-3 rounded-lg border border-amber-200/70 shadow-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-gray-900">{app.productType}</div>
                  <div className="text-[11px] text-gray-500">
                    Est. Budget: R {app.premium?.toLocaleString() || '0'}/mo • Cover: R {app.sumAssured?.toLocaleString() || '0'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Search & Filters Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search your policies by number, underwriter, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <FiFilter className="text-gray-400 text-sm" />
          <span className="text-xs font-medium text-gray-600">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:border-red-500"
          >
            <option value="all">All Categories</option>
            <option value="Motor">Motor & Vehicle</option>
            <option value="Life">Life & Risk</option>
            <option value="Home">Home & Contents</option>
            <option value="Funeral">Funeral Cover</option>
            <option value="Retirement">Retirement & Wealth</option>
            <option value="Valuables">Valuables / All-Risk</option>
          </select>
        </div>
      </div>

      {/* ─── Policy Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.map(policy => (
          <div
            key={policy.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-red-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <CompanyLogo name={policy.provider} domain={policy.providerDomain} size={42} />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{policy.type}</div>
                    <div className="text-xs text-gray-500">
                      Underwritten by <strong>{policy.provider}</strong>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  policy.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {policy.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 my-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Policy Reference</span>
                  <p className="font-bold font-mono text-gray-800">{policy.policyNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Monthly Premium</span>
                  <p className="font-bold text-gray-900">R {policy.premium.toLocaleString()} / mo</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Sum Assured</span>
                  <p className="font-bold text-[#d92820]">
                    {policy.sumAssured ? `R ${policy.sumAssured.toLocaleString()}` : 'Guaranteed Payout'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Inception Date</span>
                  <p className="font-medium text-gray-700">
                    {policy.inceptionDate ? new Date(policy.inceptionDate).toLocaleDateString() : 'Active Book'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <FiFileText className="text-[#d92820]" /> Active Schedule on File
              </span>
              <button
                onClick={() => setSelectedPolicyDetail(policy)}
                className="text-[#d92820] font-semibold hover:underline flex items-center gap-1"
              >
                View Full Benefits <FiChevronRight />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <FiShield className="mx-auto text-4xl text-gray-300 mb-2" />
          <h3 className="font-bold text-gray-800 text-sm">No Policies Found</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
            You currently have no policies matching your query. Request a new policy quote above to expand your insurance cover.
          </p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-[#d92820] text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            + Request New Policy
          </button>
        </div>
      )}

      {/* ─── REQUEST NEW POLICY MODAL ────────────────────────────────────── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Request New Policy / Add Cover</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a policy product and underwriter. Royal Square advisers will prepare and negotiate the best market quote.
                </p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleRequestPolicy} className="space-y-4 text-xs">
              {/* Product Category Selector Grid */}
              <div>
                <label className="block font-bold text-gray-800 mb-2">1. Select Insurance Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COVER_CATEGORIES.map(cat => {
                    const isSelected = selectedProduct.type === cat.type;
                    return (
                      <div
                        key={cat.type}
                        onClick={() => handleSelectCategory(cat)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#d92820] bg-red-50/50 ring-1 ring-[#d92820]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="p-1 rounded-md bg-red-50 text-[#d92820] flex items-center justify-center">
                            {renderCategoryIcon(cat.iconType)}
                          </span>
                          <span className="font-bold text-gray-900 text-xs">{cat.type}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{cat.desc}</p>
                        <div className="text-[10px] text-[#d92820] font-semibold mt-1">
                          Est. from R {cat.estPremium}/mo
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Underwriter */}
              <div>
                <label className="block font-bold text-gray-800 mb-1.5">2. Preferred Underwriter / Insurer</label>
                <select
                  value={selectedInsurerName}
                  onChange={e => setSelectedInsurerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                >
                  {INSURERS.map(i => (
                    <option key={i.name} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>

              {/* Cover Amount & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Desired Sum Assured (ZAR)</label>
                  <input
                    type="number"
                    step="5000"
                    required
                    placeholder="e.g. 500000"
                    value={requestedSumAssured}
                    onChange={e => setRequestedSumAssured(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Monthly Premium Budget (ZAR)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="e.g. 1200"
                    value={budgetMonthly}
                    onChange={e => setBudgetMonthly(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Specific Details / Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Asset Details / Special Requirements (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 2024 Toyota RAV4, VIN number, or residential property address..."
                  value={requestNotes}
                  onChange={e => setRequestNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Information Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 text-[11px] flex items-start gap-2">
                <FiInfo className="text-blue-600 shrink-0 mt-0.5 text-sm" />
                <span>
                  Once submitted, Royal Square Financial advisers will compile comparative quotes across accredited underwriters and contact you with the policy inception contract.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#d92820] hover:bg-[#b8201a] text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <ClipLoader size={12} color="#fff" /> : <FiPlus />}
                  Submit Policy Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── POLICY DETAILS MODAL ────────────────────────────────────────── */}
      {selectedPolicyDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <CompanyLogo name={selectedPolicyDetail.provider} size={36} />
                <div>
                  <h3 className="font-bold text-base text-gray-900">{selectedPolicyDetail.type}</h3>
                  <span className="text-xs text-gray-400 font-mono">{selectedPolicyDetail.policyNumber}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPolicyDetail(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-medium">Underwriter</span>
                  <p className="font-bold text-gray-900">{selectedPolicyDetail.provider}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Status</span>
                  <p className="font-bold text-green-700 capitalize">{selectedPolicyDetail.status}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Monthly Premium</span>
                  <p className="font-bold text-gray-900 text-sm">R {selectedPolicyDetail.premium.toLocaleString()} / mo</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Sum Assured Cover</span>
                  <p className="font-bold text-[#d92820] text-sm">
                    {selectedPolicyDetail.sumAssured ? `R ${selectedPolicyDetail.sumAssured.toLocaleString()}` : 'Full Liability'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 space-y-1">
                <span className="font-bold text-gray-800">Coverage Benefits Summary:</span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Active policy schedule underwritten with full 24/7 incident assistance, fast-track claims triage, and designated broker advisory representation.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedPolicyDetail(null)}
                className="bg-[#d92820] text-white px-4 py-2 rounded-lg font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
