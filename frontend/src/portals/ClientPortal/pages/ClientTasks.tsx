import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import {
  FiMapPin,
  FiCreditCard,
  FiFileText,
  FiTruck,
  FiCalendar,
  FiRefreshCw,
  FiShield,
  FiX,
  FiPrinter,
  FiCheckSquare,
  FiSend,
  FiPieChart,
  FiAward
} from 'react-icons/fi';

type TaskModalType =
  | 'change_of_address'
  | 'change_of_bank_details'
  | 'request_policy_document'
  | 'request_border_letter'
  | 'request_irp5_tax_certificate'
  | 'request_consultation'
  | 'client_financial_statement'
  | null;

const SADC_COUNTRIES = [
  'Botswana',
  'Mozambique',
  'Namibia',
  'Zimbabwe',
  'Eswatini (Swaziland)',
  'Lesotho',
  'Zambia',
  'Malawi'
];

const INVESTMENT_COMPANIES = [
  'Allan Gray Unit Trusts',
  'Ninety One Asset Management',
  'Sanlam Glacier',
  'Old Mutual Wealth',
  'Coronation Fund Managers',
  'Investec Asset Management',
  'Sygnia Collective Investments',
  'Stanlib Wealth'
];

const SA_BANKS = [
  { name: 'First National Bank (FNB)', code: '250655' },
  { name: 'Standard Bank', code: '051001' },
  { name: 'Absa Bank', code: '632005' },
  { name: 'Nedbank', code: '198765' },
  { name: 'Capitec Bank', code: '470010' },
  { name: 'Discovery Bank', code: '679000' },
  { name: 'Investec Bank', code: '580105' },
  { name: 'TymeBank', code: '678910' },
  { name: 'African Bank', code: '430000' }
];

export const ClientTasks = () => {
  const { data: requests, loading, refetch } = useApi<any[]>('/service-requests');
  const { data: profile } = useApi<any>('/user/profile');
  const { data: latestStatement, refetch: refetchStatement } = useApi<any>('/service-requests/financial-statement');

  const [activeModal, setActiveModal] = useState<TaskModalType>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [previewDocument, setPreviewDocument] = useState<any>(null);

  // Address Form
  const [addressForm, setAddressForm] = useState({
    physicalAddress: profile?.physicalAddress || '',
    city: profile?.city || 'Sandton',
    province: profile?.province || 'Gauteng',
    postalCode: profile?.postalCode || '2196',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Bank Form
  const [bankForm, setBankForm] = useState({
    bankName: 'First National Bank (FNB)',
    accountHolderName: profile?.name || '',
    accountNumber: '',
    accountType: 'Cheque / Current',
    branchCode: '250655',
    notes: 'Update account for policy debit orders and claims payout'
  });

  // Policy Document Request Form
  const [policyDocForm, setPolicyDocForm] = useState({
    provider: 'Discovery Life',
    policyNumber: 'POL-DISC-9921',
    documentType: 'Policy Schedule',
    taxYear: '2026',
    deliveryMethod: 'Digital Portal & Email'
  });

  // Border Letter Form
  const [borderForm, setBorderForm] = useState({
    vehicleReg: 'CA 892-411',
    vinNumber: 'AAV11902840192',
    destinationCountry: 'Botswana',
    departureDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
    driverName: profile?.name || 'Policyholder Driver',
    borderPost: 'Kopfontein Border Post',
    purpose: 'Leisure / Holiday Travel'
  });

  // IRP5 Tax Cert Form
  const [irp5Form, setIrp5Form] = useState({
    investmentCompany: 'Allan Gray Unit Trusts',
    taxYear: '2026',
    certificateType: 'IT3(a) / IRP5 Tax Certificate',
    accountNumber: 'AG-9910284',
    sarsReason: 'SARS eFiling Annual Assessment'
  });

  // Consultation Form
  const [consultForm, setConsultForm] = useState({
    consultationType: 'Comprehensive Annual Financial Review',
    preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    preferredTime: '10:00 AM',
    channel: 'Video Conference (Microsoft Teams)',
    agenda: 'Portfolio performance review, risk cover audit, and tax optimization'
  });

  // Balance Sheet & Income Statement Form
  const [finForm, setFinForm] = useState({
    financialYear: '2026',
    // Assets
    primaryResidence: 2200000,
    vehiclesValue: 450000,
    investmentsUnitTrusts: 1100000,
    retirementAnnuities: 1390000,
    cashBank: 250000,
    otherAssets: 100000,
    // Liabilities
    homeLoanBond: 950000,
    vehicleFinance: 180000,
    creditCardsOverdraft: 35000,
    personalLoans: 0,
    otherLiabilities: 15000,
    // Income
    grossMonthlySalary: 65000,
    rentalIncome: 0,
    investmentDividends: 8500,
    otherIncome: 0,
    // Expenses
    housingPayment: 14500,
    livingGroceries: 12000,
    vehicleFuelTransport: 6500,
    insurancePremiums: 6450,
    debtRepayments: 3200,
    discretionarySpend: 8000
  });

  // Live Calculations for Financial Statement
  const totalAssetsCalc =
    Number(finForm.primaryResidence) +
    Number(finForm.vehiclesValue) +
    Number(finForm.investmentsUnitTrusts) +
    Number(finForm.retirementAnnuities) +
    Number(finForm.cashBank) +
    Number(finForm.otherAssets);

  const totalLiabilitiesCalc =
    Number(finForm.homeLoanBond) +
    Number(finForm.vehicleFinance) +
    Number(finForm.creditCardsOverdraft) +
    Number(finForm.personalLoans) +
    Number(finForm.otherLiabilities);

  const netWorthCalc = totalAssetsCalc - totalLiabilitiesCalc;

  const totalIncomeCalc =
    Number(finForm.grossMonthlySalary) +
    Number(finForm.rentalIncome) +
    Number(finForm.investmentDividends) +
    Number(finForm.otherIncome);

  const totalExpensesCalc =
    Number(finForm.housingPayment) +
    Number(finForm.livingGroceries) +
    Number(finForm.vehicleFuelTransport) +
    Number(finForm.insurancePremiums) +
    Number(finForm.debtRepayments) +
    Number(finForm.discretionarySpend);

  const netMonthlySurplusCalc = totalIncomeCalc - totalExpensesCalc;

  const handleSubmitTask = async (taskType: TaskModalType, payload: Record<string, any>) => {
    setSubmitting(true);
    try {
      const res = await apiRequest<any>('/service-requests', {
        method: 'POST',
        body: JSON.stringify({
          taskType,
          ...payload,
          clientName: profile?.name || 'Valued Client',
          idNumber: profile?.idNumber || '8501015800088',
          phone: profile?.phone || profile?.mobile || '082 123 4567',
          email: profile?.email || 'client@royalsync.co.za'
        })
      });

      toast.success(`Service request ${res.reference || ''} submitted successfully!`);
      setActiveModal(null);
      refetch();
      if (taskType === 'client_financial_statement') refetchStatement();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = (requests || []).filter(req => {
    if (activeFilter === 'pending') return req.status !== 'completed' && req.status !== 'approved';
    if (activeFilter === 'completed') return req.status === 'completed' || req.status === 'approved';
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <FiCheckSquare className="text-red-600 w-6 h-6" /> Service Requests & Tasks Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Initiate statutory updates, document deliveries, border clearances, tax certificates, and financial balance sheets.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-start md:self-auto">
          <FiShield className="w-3.5 h-3.5" /> FAIS Licence 29370 Compliant Workflows
        </span>
      </div>

      {/* 7 Task Launchers Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Available Self-Service Tasks & Requests
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Change of Address */}
          <TaskLaunchCard
            icon={<FiMapPin className="w-5 h-5 text-red-600" />}
            title="Change of Address"
            description="Update residential & postal address with statutory FICA synchronization."
            badge="FICA Profile"
            onClick={() => setActiveModal('change_of_address')}
          />

          {/* 2. Change of Bank Details */}
          <TaskLaunchCard
            icon={<FiCreditCard className="w-5 h-5 text-amber-600" />}
            title="Change of Bank Details"
            description="Update payout bank account for claims settlements & debit orders."
            badge="AML Verified"
            onClick={() => setActiveModal('change_of_bank_details')}
          />

          {/* 3. Request a Policy Document */}
          <TaskLaunchCard
            icon={<FiFileText className="w-5 h-5 text-blue-600" />}
            title="Request Policy Document"
            description="Order policy schedules, tax certificates, and certificates of cover."
            badge="Digital Delivery"
            onClick={() => setActiveModal('request_policy_document')}
          />

          {/* 4. Request a Border Letter */}
          <TaskLaunchCard
            icon={<FiTruck className="w-5 h-5 text-emerald-600" />}
            title="Request a Border Letter"
            description="Cross-border vehicle travel insurance clearance certificate for SADC."
            badge="Instant Letter"
            onClick={() => setActiveModal('request_border_letter')}
          />

          {/* 5. Request an IRP5 Tax Cert */}
          <TaskLaunchCard
            icon={<FiAward className="w-5 h-5 text-indigo-600" />}
            title="Request IRP5 / IT3 Tax Cert"
            description="Obtain annual SARS tax certificates from linked investment companies."
            badge="SARS eFiling"
            onClick={() => setActiveModal('request_irp5_tax_certificate')}
          />

          {/* 6. Request a Consultation */}
          <TaskLaunchCard
            icon={<FiCalendar className="w-5 h-5 text-rose-600" />}
            title="Request a Consultation"
            description="Book one-on-one portfolio review or estate planning with your adviser."
            badge="Adviser Session"
            onClick={() => setActiveModal('request_consultation')}
          />

          {/* 7. Balance Sheet & Income Statement */}
          <TaskLaunchCard
            icon={<FiPieChart className="w-5 h-5 text-purple-600" />}
            title="Financial Statement & Balance Sheet"
            description="Comprehensive assets, liabilities, net worth, and monthly income collection."
            badge="Net Worth Tool"
            highlight
            onClick={() => setActiveModal('client_financial_statement')}
          />
        </div>
      </div>

      {/* Financial Statement Summary Banner (if completed) */}
      {latestStatement && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl border border-gray-700 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2 py-0.5 rounded">
                Verified Financial Statement on Record
              </span>
              <h3 className="text-lg font-bold mt-1 text-white">
                Personal Balance Sheet · Net Worth: {latestStatement.netWorthFormatted || 'R 2,840,000.00'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Total Assets: <strong>R {Number(latestStatement.totalAssets || 0).toLocaleString()}</strong> · Total Liabilities: <strong>R {Number(latestStatement.totalLiabilities || 0).toLocaleString()}</strong> · Monthly Surplus: <strong>{latestStatement.monthlySurplusFormatted || 'R 18,350.00'}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('client_financial_statement')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-xs font-semibold text-white transition-all cursor-pointer self-start sm:self-auto"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Update Balance Sheet
            </button>
          </div>
        </div>
      )}

      {/* Service Request & Tasks Tracker */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Active Service Requests & Tasks</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track statutory verification and adviser processing stages in real time.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'all' ? 'bg-white dark:bg-gray-800 text-red-600 font-bold shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
            >
              All ({requests?.length || 0})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'pending' ? 'bg-white dark:bg-gray-800 text-red-600 font-bold shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === 'completed' ? 'bg-white dark:bg-gray-800 text-red-600 font-bold shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <FiRefreshCw className="w-5 h-5 animate-spin text-red-600" />
            <span>Loading task records...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center mx-auto">
              <FiCheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">No Service Requests Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Select any of the 7 tasks above to submit a change of address, border letter, tax request, or financial statement.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filteredRequests.map(req => (
              <div key={req.id} className="p-4 sm:p-5 hover:bg-gray-50/70 dark:hover:bg-gray-900/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                      {req.reference || req.id}
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {req.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'completed' || req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {req.status || 'submitted'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted: {new Date(req.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })} · Assigned Adviser: Qiniso Thulani Ntuli
                  </p>

                  {req.borderCertificateNumber && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                      Official Clearance Certificate: {req.borderCertificateNumber}
                    </div>
                  )}

                  {req.adviserNotes && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 mt-1">
                      Adviser Note: "{req.adviserNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  {req.taskType === 'request_border_letter' && (
                    <button
                      type="button"
                      onClick={() => setPreviewDocument(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 text-xs font-semibold cursor-pointer"
                    >
                      <FiPrinter className="w-3.5 h-3.5" /> View Border Letter
                    </button>
                  )}
                  {req.taskType === 'client_financial_statement' && (
                    <button
                      type="button"
                      onClick={() => setActiveModal('client_financial_statement')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-xs font-medium cursor-pointer"
                    >
                      <FiFileText className="w-3.5 h-3.5" /> Review Balance Sheet
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: CHANGE OF ADDRESS */}
      {/* ============================================================ */}
      {activeModal === 'change_of_address' && (
        <ModalWrapper title="Change of Residential / Postal Address" onClose={() => setActiveModal(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('change_of_address', addressForm);
            }}
            className="space-y-4 text-xs"
          >
            <p className="text-gray-500 dark:text-gray-400">
              Submit your new physical address. Statutory compliance under FICA requires address updates to match proof of residence.
            </p>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">New Physical / Street Address *</label>
              <input
                type="text"
                required
                value={addressForm.physicalAddress}
                onChange={e => setAddressForm({ ...addressForm, physicalAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. 15 West Street, Sandown, Sandton"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">City / Suburb *</label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={addressForm.postalCode}
                  onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Effective Date</label>
              <input
                type="date"
                value={addressForm.effectiveDate}
                onChange={e => setAddressForm({ ...addressForm, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <SubmitButton submitting={submitting} label="Submit Address Change Request" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CHANGE OF BANK DETAILS */}
      {/* ============================================================ */}
      {activeModal === 'change_of_bank_details' && (
        <ModalWrapper title="Change of Bank Details & Debit Mandate" onClose={() => setActiveModal(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('change_of_bank_details', bankForm);
            }}
            className="space-y-4 text-xs"
          >
            <p className="text-gray-500 dark:text-gray-400">
              Update your authorized bank account for claims settlements and policy debit orders.
            </p>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Bank Name *</label>
              <select
                value={bankForm.bankName}
                onChange={e => {
                  const b = SA_BANKS.find(x => x.name === e.target.value);
                  setBankForm({ ...bankForm, bankName: e.target.value, branchCode: b?.code || bankForm.branchCode });
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {SA_BANKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Account Holder Full Name *</label>
              <input
                type="text"
                required
                value={bankForm.accountHolderName}
                onChange={e => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="62849102941"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Branch Code</label>
                <input
                  type="text"
                  value={bankForm.branchCode}
                  onChange={e => setBankForm({ ...bankForm, branchCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
            <SubmitButton submitting={submitting} label="Submit Bank Details Update" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: REQUEST A POLICY DOCUMENT */}
      {/* ============================================================ */}
      {activeModal === 'request_policy_document' && (
        <ModalWrapper title="Request a Policy Document" onClose={() => setActiveModal(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('request_policy_document', policyDocForm);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Select Policy / Insurer *</label>
              <select
                value={policyDocForm.provider}
                onChange={e => setPolicyDocForm({ ...policyDocForm, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Discovery Life Comprehensive">Discovery Life (POL-DISC-9921)</option>
                <option value="Santam Comprehensive Asset Cover">Santam Insurance (SAN-88129)</option>
                <option value="Sanlam Glacier Retirement Annuity">Sanlam Glacier (RA-781920)</option>
                <option value="Allan Gray Money Market">Allan Gray (AG-339102)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Document Type *</label>
              <select
                value={policyDocForm.documentType}
                onChange={e => setPolicyDocForm({ ...policyDocForm, documentType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Policy Schedule">Full Policy Schedule & Wording</option>
                <option value="Certificate of Cover">Certificate of Active Cover</option>
                <option value="Tax Certificate (IT3b/IRP5)">Annual Tax Certificate</option>
                <option value="Premium Payment Confirmation">Premium Payment History</option>
                <option value="Endorsement Letter">Adviser Endorsement Letter</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Delivery Channel</label>
              <input
                type="text"
                disabled
                value="Digital Portal Document Vault & Email"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500"
              />
            </div>
            <SubmitButton submitting={submitting} label="Request Document Dispatch" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: REQUEST A BORDER LETTER */}
      {/* ============================================================ */}
      {activeModal === 'request_border_letter' && (
        <ModalWrapper title="Request Cross-Border Vehicle Travel Letter" onClose={() => setActiveModal(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('request_border_letter', borderForm);
            }}
            className="space-y-4 text-xs"
          >
            <p className="text-gray-500 dark:text-gray-400">
              Generates an authorized Cross-Border Insurance Letter for border control officials across SADC territories.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Vehicle Registration *</label>
                <input
                  type="text"
                  required
                  value={borderForm.vehicleReg}
                  onChange={e => setBorderForm({ ...borderForm, vehicleReg: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="CA 892-411"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">VIN / Chassis Number</label>
                <input
                  type="text"
                  value={borderForm.vinNumber}
                  onChange={e => setBorderForm({ ...borderForm, vinNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="AAV11902840192"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Destination Country *</label>
              <select
                value={borderForm.destinationCountry}
                onChange={e => setBorderForm({ ...borderForm, destinationCountry: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {SADC_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Departure Date *</label>
                <input
                  type="date"
                  required
                  value={borderForm.departureDate}
                  onChange={e => setBorderForm({ ...borderForm, departureDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Return Date *</label>
                <input
                  type="date"
                  required
                  value={borderForm.returnDate}
                  onChange={e => setBorderForm({ ...borderForm, returnDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Authorized Driver Name *</label>
              <input
                type="text"
                required
                value={borderForm.driverName}
                onChange={e => setBorderForm({ ...borderForm, driverName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <SubmitButton submitting={submitting} label="Generate & Issue Border Letter" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: REQUEST AN IRP5 TAX CERTIFICATE */}
      {/* ============================================================ */}
      {activeModal === 'request_irp5_tax_certificate' && (
        <ModalWrapper title="Request IRP5 / IT3 Tax Certificate" onClose={() => setActiveModal(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('request_irp5_tax_certificate', irp5Form);
            }}
            className="space-y-4 text-xs"
          >
            <p className="text-gray-500 dark:text-gray-400">
              Request official tax certificates for annual SARS eFiling from linked investment and wealth managers.
            </p>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Investment Company / Platform *</label>
              <select
                value={irp5Form.investmentCompany}
                onChange={e => setIrp5Form({ ...irp5Form, investmentCompany: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {INVESTMENT_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Tax Assessment Year *</label>
                <select
                  value={irp5Form.taxYear}
                  onChange={e => setIrp5Form({ ...irp5Form, taxYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                >
                  <option value="2026">2026 Tax Year</option>
                  <option value="2025">2025 Tax Year</option>
                  <option value="2024">2024 Tax Year</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Certificate Type *</label>
                <select
                  value={irp5Form.certificateType}
                  onChange={e => setIrp5Form({ ...irp5Form, certificateType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                >
                  <option value="IT3(a) / IRP5 Tax Certificate">IT3(a) Annuity / Lump Sum</option>
                  <option value="IT3(b) Interest & Dividend Income">IT3(b) Interest & Dividends</option>
                  <option value="IT3(c) Capital Gains Tax Record">IT3(c) Capital Gains</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Reason / Note</label>
              <input
                type="text"
                value={irp5Form.sarsReason}
                onChange={e => setIrp5Form({ ...irp5Form, sarsReason: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. SARS eFiling submission"
              />
            </div>
            <SubmitButton submitting={submitting} label="Request Tax Certificate" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: REQUEST A CONSULTATION */}
      {/* ============================================================ */}
      {activeModal === 'request_consultation' && (
        <ModalWrapper title="Request an Adviser Consultation" onClose={() => setActiveModal(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('request_consultation', consultForm);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Consultation Objective *</label>
              <select
                value={consultForm.consultationType}
                onChange={e => setConsultForm({ ...consultForm, consultationType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Comprehensive Annual Financial Review">Comprehensive Annual Financial Review</option>
                <option value="Investment Portfolio Rebalancing">Investment Portfolio Rebalancing</option>
                <option value="Retirement & Annuity Planning">Retirement & Annuity Planning</option>
                <option value="Estate Planning & Will Drafting">Estate Planning & Will Drafting</option>
                <option value="Life & Severe Illness Cover Audit">Life & Severe Illness Cover Audit</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={consultForm.preferredDate}
                  onChange={e => setConsultForm({ ...consultForm, preferredDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Preferred Time *</label>
                <select
                  value={consultForm.preferredTime}
                  onChange={e => setConsultForm({ ...consultForm, preferredTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Meeting Format</label>
              <select
                value={consultForm.channel}
                onChange={e => setConsultForm({ ...consultForm, channel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Video Conference (Microsoft Teams)">Video Conference (Microsoft Teams)</option>
                <option value="In-Person (Royal Square Financial Sandton)">In-Person (Sandton Office)</option>
                <option value="Direct Phone Call">Direct Phone Call</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Agenda / Discussion Points</label>
              <textarea
                rows={2}
                value={consultForm.agenda}
                onChange={e => setConsultForm({ ...consultForm, agenda: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <SubmitButton submitting={submitting} label="Book Consultation Session" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* MODAL 7: FINANCIAL STATEMENT, BALANCE SHEET & INCOME */}
      {/* ============================================================ */}
      {activeModal === 'client_financial_statement' && (
        <ModalWrapper
          title="Client Balance Sheet & Income Statement Collection"
          onClose={() => setActiveModal(null)}
          wide
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitTask('client_financial_statement', {
                ...finForm,
                totalAssets: totalAssetsCalc,
                totalLiabilities: totalLiabilitiesCalc,
                netWorth: netWorthCalc,
                totalIncome: totalIncomeCalc,
                totalExpenses: totalExpensesCalc,
                monthlySurplus: netMonthlySurplusCalc
              });
            }}
            className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin"
          >
            {/* Real-time calculated banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900 text-white p-4 rounded-xl border border-gray-700">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Assets</div>
                <div className="text-base font-bold text-emerald-400">R {totalAssetsCalc.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Liabilities</div>
                <div className="text-base font-bold text-rose-400">R {totalLiabilitiesCalc.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Net Wealth Value</div>
                <div className="text-base font-bold text-amber-400">R {netWorthCalc.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Net Monthly Cashflow</div>
                <div className="text-base font-bold text-indigo-400">R {netMonthlySurplusCalc.toLocaleString()}/mo</div>
              </div>
            </div>

            {/* Section 1: ASSETS */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                1. Asset Portfolio (ZAR)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FinField label="Primary Residence / Real Estate" value={finForm.primaryResidence} onChange={v => setFinForm({ ...finForm, primaryResidence: v })} />
                <FinField label="Vehicles & Movables" value={finForm.vehiclesValue} onChange={v => setFinForm({ ...finForm, vehiclesValue: v })} />
                <FinField label="Investments & Unit Trusts" value={finForm.investmentsUnitTrusts} onChange={v => setFinForm({ ...finForm, investmentsUnitTrusts: v })} />
                <FinField label="Retirement Annuities & Pensions" value={finForm.retirementAnnuities} onChange={v => setFinForm({ ...finForm, retirementAnnuities: v })} />
                <FinField label="Cash, Money Market & Bank Accounts" value={finForm.cashBank} onChange={v => setFinForm({ ...finForm, cashBank: v })} />
                <FinField label="Other Assets / Offshore Holdings" value={finForm.otherAssets} onChange={v => setFinForm({ ...finForm, otherAssets: v })} />
              </div>
            </div>

            {/* Section 2: LIABILITIES */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                2. Liabilities & Debt (ZAR)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FinField label="Home Mortgage Bond Balance" value={finForm.homeLoanBond} onChange={v => setFinForm({ ...finForm, homeLoanBond: v })} />
                <FinField label="Vehicle Asset Finance Debt" value={finForm.vehicleFinance} onChange={v => setFinForm({ ...finForm, vehicleFinance: v })} />
                <FinField label="Credit Cards & Overdrafts" value={finForm.creditCardsOverdraft} onChange={v => setFinForm({ ...finForm, creditCardsOverdraft: v })} />
                <FinField label="Personal Loans / Store Facilities" value={finForm.personalLoans} onChange={v => setFinForm({ ...finForm, personalLoans: v })} />
              </div>
            </div>

            {/* Section 3: INCOME STATEMENT */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                3. Monthly Income & Expenses (Cashflow)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FinField label="Gross Monthly Salary / Draw" value={finForm.grossMonthlySalary} onChange={v => setFinForm({ ...finForm, grossMonthlySalary: v })} />
                <FinField label="Investment Yield & Dividends" value={finForm.investmentDividends} onChange={v => setFinForm({ ...finForm, investmentDividends: v })} />
                <FinField label="Monthly Housing / Bond Repayment" value={finForm.housingPayment} onChange={v => setFinForm({ ...finForm, housingPayment: v })} />
                <FinField label="Living Groceries & Utilities" value={finForm.livingGroceries} onChange={v => setFinForm({ ...finForm, livingGroceries: v })} />
                <FinField label="Insurance & Risk Premiums" value={finForm.insurancePremiums} onChange={v => setFinForm({ ...finForm, insurancePremiums: v })} />
                <FinField label="Vehicle Fuel & Maintenance" value={finForm.vehicleFuelTransport} onChange={v => setFinForm({ ...finForm, vehicleFuelTransport: v })} />
              </div>
            </div>

            <SubmitButton submitting={submitting} label="Save & Generate Financial Balance Sheet" />
          </form>
        </ModalWrapper>
      )}

      {/* ============================================================ */}
      {/* PREVIEW: OFFICIAL BORDER LETTER MODAL */}
      {/* ============================================================ */}
      {previewDocument && (
        <ModalWrapper title="Official Cross-Border Insurance Travel Certificate" onClose={() => setPreviewDocument(null)}>
          <div className="p-6 bg-white text-gray-900 rounded-xl space-y-4 border border-gray-200 font-sans text-xs">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="font-bold text-sm text-red-600">ROYAL SQUARE FINANCIAL (PTY) LTD</h3>
                <p className="text-[10px] text-gray-500">Authorized FSP 29370 · Reg: 2009/022911/07</p>
                <p className="text-[10px] text-gray-500">Cross-Border Territorial Authorization Certificate</p>
              </div>
              <div className="text-right font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                {previewDocument.borderCertificateNumber || 'CBL-RSF-2026-99102'}
              </div>
            </div>

            <div className="space-y-2 leading-relaxed">
              <p><strong>TO WHOM IT MAY CONCERN / BORDER CONTROL OFFICIALS:</strong></p>
              <p>
                This document certifies that the comprehensive vehicle insurance policy backing <strong>{previewDocument.vehicleReg || 'CA 892-411'}</strong> (VIN: {previewDocument.vinNumber || 'AAV11902840192'}) remains in full force and effect across the territorial borders of <strong>{previewDocument.destinationCountry || 'SADC Territory'}</strong>.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border grid grid-cols-2 gap-2 text-[11px]">
                <div><strong>Authorized Driver:</strong> {previewDocument.driverName || 'Policyholder'}</div>
                <div><strong>Destination:</strong> {previewDocument.destinationCountry || 'Botswana'}</div>
                <div><strong>Travel Dates:</strong> {previewDocument.departureDate || '2026-09-10'} to {previewDocument.returnDate || '2026-09-20'}</div>
                <div><strong>Territorial Extent:</strong> SADC Protocol Compliant</div>
              </div>
              <p className="text-[10px] text-gray-500 pt-2 border-t">
                Issued under mandate by Qiniso Thulani Ntuli (CFP / Key Individual) on behalf of Royal Square Financial. Valid with original insurer schedule.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FiPrinter className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

/* Subcomponents */

const TaskLaunchCard = ({
  icon,
  title,
  description,
  badge,
  highlight,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  highlight?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between cursor-pointer group shadow-sm ${
      highlight
        ? 'border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-500'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 dark:hover:border-red-800'
    }`}
  >
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
          {badge}
        </span>
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
        {description}
      </p>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
      <span>Initiate Request</span>
      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
    </div>
  </button>
);

const ModalWrapper = ({
  title,
  onClose,
  wide,
  children
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full overflow-hidden ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FinField = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-2 text-gray-400 font-mono">R</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs"
      />
    </div>
  </div>
);

const SubmitButton = ({ submitting, label }: { submitting: boolean; label: string }) => (
  <button
    type="submit"
    disabled={submitting}
    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
  >
    {submitting ? (
      <>
        <FiRefreshCw className="w-4 h-4 animate-spin" /> Submitting Request...
      </>
    ) : (
      <>
        <FiSend className="w-4 h-4" /> {label}
      </>
    )}
  </button>
);
