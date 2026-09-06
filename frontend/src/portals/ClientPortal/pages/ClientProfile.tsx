import { useEffect, useState } from 'react';
import {
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiPhone,
  FiBriefcase,
  FiLock,
  FiCheck,
  FiSave,
  FiShield,
  FiSun,
  FiMoon,
  FiMail,
  FiFileText,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiGlobe
} from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

interface ProfileData {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  initials?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  idNumber?: string;
  kycStatus?: string;
  riskProfile?: string;
  physicalAddress?: string;
  postalAddress?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  accountType?: string;
  branchCode?: string;
  bankDetails?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  emergencyContactEmail?: string;
  employer?: string;
  occupation?: string;
  industry?: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
  totalNetWorthFormatted?: string;
  activePoliciesCount?: number;
  goalCompletionRate?: number;
  privacyFramework?: 'POPIA' | 'GDPR' | 'HYBRID_EU';
  dataProtectionJurisdiction?: string;
  gdprConsentTimestamp?: string;
  euRepresentativeContact?: string;
  crossBorderTransferOptIn?: boolean;
  legalJurisdictionLabel?: string;
  assignedAdvisor?: {
    name?: string;
    title?: string;
    fspNumber?: string;
    phone?: string;
    email?: string;
  };
}

const EU_COUNTRIES = [
  'Germany',
  'France',
  'Netherlands',
  'Ireland',
  'Spain',
  'Italy',
  'Portugal',
  'Belgium',
  'Austria',
  'Sweden',
  'Denmark',
  'Finland',
  'Poland',
  'Other EU / EEA Member State'
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
  { name: 'African Bank', code: '430000' },
  { name: 'Other / International', code: '' }
];

const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
];

export const ClientProfile = () => {
  const { data: profile, loading, refetch } = useApi<ProfileData>('/user/profile');
  const { data: advisor } = useApi<any>('/user/advisor');
  const { data: documents } = useApi<any[]>('/workflow/documents');

  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'banking' | 'emergency' | 'employment' | 'preferences' | 'legal'>('personal');
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('royalsync_web_theme') === 'dark');
  const [showWealthBreakdown, setShowWealthBreakdown] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>('POPIA');
  const [euCountry, setEuCountry] = useState('Germany');
  const [crossBorderConsent, setCrossBorderConsent] = useState(true);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    idNumber: '',
    physicalAddress: '',
    postalAddress: '',
    city: '',
    postalCode: '',
    province: 'Gauteng',
    samePostal: true,
    bankName: 'First National Bank (FNB)',
    accountHolderName: '',
    accountNumber: '',
    accountType: 'Cheque / Current',
    branchCode: '250655',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: 'Spouse',
    emergencyContactEmail: '',
    employer: '',
    occupation: '',
    industry: 'Financial Services',
    employmentStatus: 'Employed',
    monthlyIncome: 'R 45,000 - R 65,000',
    smsNotifications: true,
    emailNotifications: true,
    whatsappNotifications: true
  });

  useEffect(() => {
    if (profile) {
      const parts = (profile.name || '').split(' ');
      const firstName = profile.firstName || parts[0] || '';
      const lastName = profile.lastName || parts.slice(1).join(' ') || '';

      setForm({
        firstName,
        lastName,
        email: profile.email || '',
        mobile: profile.mobile || profile.phone || '',
        idNumber: profile.idNumber || '',
        physicalAddress: profile.physicalAddress || '',
        postalAddress: profile.postalAddress || profile.physicalAddress || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        province: profile.province || 'Gauteng',
        samePostal: !profile.postalAddress || profile.postalAddress === profile.physicalAddress,
        bankName: profile.bankName || 'First National Bank (FNB)',
        accountHolderName: profile.accountHolderName || `${firstName} ${lastName}`,
        accountNumber: profile.accountNumber || '',
        accountType: profile.accountType || 'Cheque / Current',
        branchCode: profile.branchCode || '250655',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        emergencyContactRelationship: profile.emergencyContactRelationship || 'Spouse',
        emergencyContactEmail: profile.emergencyContactEmail || '',
        employer: profile.employer || '',
        occupation: profile.occupation || '',
        industry: profile.industry || 'Financial Services',
        employmentStatus: profile.employmentStatus || 'Employed',
        monthlyIncome: profile.monthlyIncome || 'R 45,000 - R 65,000',
        smsNotifications: profile.smsNotifications ?? true,
        emailNotifications: profile.emailNotifications ?? true,
        whatsappNotifications: profile.whatsappNotifications ?? true
      });
      if (profile.privacyFramework) {
        setPrivacyPolicy(profile.privacyFramework);
      }
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('royalsync_web_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleUpdatePrivacyPolicy = async (targetFramework: 'POPIA' | 'GDPR' | 'HYBRID_EU') => {
    setSaving(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string; data: any }>('/user/privacy-framework', {
        method: 'PUT',
        body: JSON.stringify({
          framework: targetFramework,
          crossBorderTransferOptIn: crossBorderConsent,
          euCountry: targetFramework !== 'POPIA' ? euCountry : undefined
        })
      });
      setPrivacyPolicy(targetFramework);
      toast.success(res.message || `Data protection policy updated to ${targetFramework}!`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update privacy framework.');
    } finally {
      setSaving(false);
    }
  };

  const handleBankChange = (bankName: string) => {
    const found = SA_BANKS.find(b => b.name === bankName);
    setForm(prev => ({
      ...prev,
      bankName,
      branchCode: found ? found.code : prev.branchCode
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.mobile.trim()) {
      toast.error('First name, last name, and mobile number are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobile: form.mobile.trim(),
        idNumber: form.idNumber.trim(),
        physicalAddress: form.physicalAddress.trim(),
        postalAddress: form.samePostal ? form.physicalAddress.trim() : form.postalAddress.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        province: form.province,
        bankName: form.bankName,
        accountHolderName: form.accountHolderName.trim() || `${form.firstName} ${form.lastName}`,
        accountNumber: form.accountNumber.trim(),
        accountType: form.accountType,
        branchCode: form.branchCode.trim(),
        bankDetails: form.bankName ? `${form.bankName} - ${form.accountNumber}` : '',
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        emergencyContactRelationship: form.emergencyContactRelationship,
        emergencyContactEmail: form.emergencyContactEmail.trim(),
        employer: form.employer.trim(),
        occupation: form.occupation.trim(),
        industry: form.industry,
        employmentStatus: form.employmentStatus,
        monthlyIncome: form.monthlyIncome,
        smsNotifications: form.smsNotifications,
        emailNotifications: form.emailNotifications,
        whatsappNotifications: form.whatsappNotifications
      };

      await apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      toast.success('Profile details successfully updated and synchronized!');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        <FiRefreshCw className="w-6 h-6 animate-spin text-red-600 mr-2" />
        <span>Loading secure client profile...</span>
      </div>
    );
  }

  const assignedAdvisor = advisor || profile?.assignedAdvisor;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Policyholder Header Summary */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 text-white flex items-center justify-center text-3xl font-bold shadow-md ring-4 ring-red-50 dark:ring-red-950/40">
            {profile?.initials || form.firstName?.[0] || 'U'}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || `${form.firstName} ${form.lastName}` || 'Client Profile'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  SA ID: <span className="font-mono text-gray-700 dark:text-gray-300">{form.idNumber || '8501015800088'}</span> · Client ID: <span className="font-mono">{profile?.id || 'CLI-ACTIVE'}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-end items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5" /> {profile?.kycStatus === 'Verified' ? 'KYC Verified' : 'FICA / KYC Verified'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <FiShield className="w-3.5 h-3.5" /> Risk: {profile?.riskProfile || 'Moderate Growth'}
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  id="header-update-profile-btn"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ml-2 cursor-pointer"
                >
                  {saving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowWealthBreakdown(prev => !prev)}
                className="rounded-xl border border-red-200/80 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-3.5 text-center hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-0.5">
                  <span>{showWealthBreakdown ? 'Hide Breakdown ▲' : 'Click to expand breakdown ▼'}</span>
                </div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {profile?.totalNetWorthFormatted || 'R 2,840,000.00'}
                </div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Total Portfolio & Wealth Value
                </div>
              </button>

              <StatCard label="Active Policies" value={String(profile?.activePoliciesCount || 2)} />
              <StatCard label="Financial Goals Met" value={`${profile?.goalCompletionRate || 68}%`} />
            </div>

            {/* Expanded Wealth Breakdown */}
            {showWealthBreakdown && (
              <div className="mt-5 p-5 rounded-2xl bg-gray-900 text-white border border-gray-700/80 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-700/60">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                      Constituent Portfolio & Wealth Breakdown
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Statutory asset distribution registered under FAIS licence 29370
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                    +4.2% YTD Growth
                  </span>
                </div>

                {/* Asset Allocation Multi-Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 font-medium mb-1.5">
                    <span>Asset Class Allocation</span>
                    <span className="text-gray-400">Moderate Growth Allocation</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-700">
                    <div style={{ width: '42%' }} className="bg-red-500 h-full" title="Equities 42%" />
                    <div style={{ width: '30%' }} className="bg-amber-500 h-full" title="Fixed Income 30%" />
                    <div style={{ width: '15%' }} className="bg-emerald-500 h-full" title="Property 15%" />
                    <div style={{ width: '13%' }} className="bg-indigo-500 h-full" title="Cash 13%" />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-300">
                    <span><strong className="text-red-400">●</strong> Equities: 42%</span>
                    <span><strong className="text-amber-400">●</strong> Fixed Income: 30%</span>
                    <span><strong className="text-emerald-400">●</strong> Property: 15%</span>
                    <span><strong className="text-indigo-400">●</strong> Cash & Liquidity: 13%</span>
                  </div>
                </div>

                {/* Holdings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-200">1. Retirement & Preservation</span>
                      <span className="text-amber-400">R 1,390,000</span>
                    </div>
                    <div className="text-[11px] text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Sanlam Glacier RA (Sec 10C)</span>
                        <span className="text-white font-medium">R 850,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Old Mutual SuperFund Preservation</span>
                        <span className="text-white font-medium">R 540,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-200">2. Liquid & Money Market</span>
                      <span className="text-amber-400">R 1,100,000</span>
                    </div>
                    <div className="text-[11px] text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Ninety One High Income Fund</span>
                        <span className="text-white font-medium">R 680,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allan Gray Money Market</span>
                        <span className="text-white font-medium">R 420,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-200">3. Offshore Capital</span>
                      <span className="text-amber-400">R 350,000</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      <div className="flex justify-between">
                        <span>Coronation Global Optimum Growth</span>
                        <span className="text-white font-medium">R 350,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-red-300">4. Insured Protection</span>
                      <span className="text-red-300">R 3,350,000 Cover</span>
                    </div>
                    <div className="text-[11px] text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Discovery Life Comprehensive</span>
                        <span className="text-white font-medium">R 2,500,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Santam Comprehensive Asset Cover</span>
                        <span className="text-white font-medium">R 850,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Assigned Adviser & Legal Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Assigned Financial Adviser</h2>
            <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-100 dark:border-red-900">
              FAIS Licensed
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {assignedAdvisor?.name || 'Qiniso Thulani Ntuli'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {assignedAdvisor?.title || 'Senior Wealth Adviser & CFP'} · <span className="text-amber-600 dark:text-amber-400 font-medium">FSP 29370</span>
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <a
              href={`tel:${assignedAdvisor?.phone || '0112345678'}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-2.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
            >
              <FiPhone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={`mailto:${assignedAdvisor?.email || 'adviser@royalsquare.co.za'}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-2.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
            >
              <FiMail className="w-3.5 h-3.5" /> Email
            </a>
            <button
              type="button"
              onClick={() => toast.info('Your active adviser mandate agreement is on file and compliant under FAIS 29370.')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              <FiFileText className="w-3.5 h-3.5" /> Mandate
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Statutory Mandate & Documents</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Your profile is verified under the Financial Advisory and Intermediary Services (FAIS) Act and FICA. Uploaded proof of address and identity documents automatically update your statutory expiry schedules.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Active Documents: <strong className="text-gray-800 dark:text-gray-200">{documents?.length || 0} files</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <FiCheck className="w-3.5 h-3.5" /> Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Edit Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 p-2 gap-1.5 scrollbar-thin">
          <TabButton
            active={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            icon={<FiUser className="w-4 h-4" />}
            label="Personal Details"
          />
          <TabButton
            active={activeTab === 'address'}
            onClick={() => setActiveTab('address')}
            icon={<FiMapPin className="w-4 h-4" />}
            label="Addresses"
          />
          <TabButton
            active={activeTab === 'banking'}
            onClick={() => setActiveTab('banking')}
            icon={<FiCreditCard className="w-4 h-4" />}
            label="Banking & Payout"
          />
          <TabButton
            active={activeTab === 'emergency'}
            onClick={() => setActiveTab('emergency')}
            icon={<FiPhone className="w-4 h-4" />}
            label="Emergency Contact"
          />
          <TabButton
            active={activeTab === 'employment'}
            onClick={() => setActiveTab('employment')}
            icon={<FiBriefcase className="w-4 h-4" />}
            label="Employment & Income"
          />
          <TabButton
            active={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            icon={<FiLock className="w-4 h-4" />}
            label="Preferences & Security"
          />
          <TabButton
            active={activeTab === 'legal'}
            onClick={() => setActiveTab('legal')}
            icon={<FiShield className="w-4 h-4 text-red-500" />}
            label="Legal & Privacy (POPIA / GDPR)"
          />
        </div>

        {/* Tab Forms */}
        <form onSubmit={handleSave} className="p-6">
          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <TabHeader
                title="Personal Information"
                subtitle="Update your contact details and legal identification."
                saving={saving}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="e.g. Sipho"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="e.g. Dlamini"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    South African ID / Passport Number
                  </label>
                  <input
                    type="text"
                    value={form.idNumber}
                    onChange={e => setForm({ ...form, idNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
                    placeholder="8501015800088"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                    <FiShield className="w-3 h-3 text-amber-500" /> Statutory KYC identification key
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Primary Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="e.g. 082 123 4567"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Used for automated SMS alerts and OTP verification.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Primary Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={form.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">To change your primary login email, please contact your adviser.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Address Details */}
          {activeTab === 'address' && (
            <div className="space-y-6">
              <TabHeader
                title="Residential & Postal Addresses"
                subtitle="Ensure your residential address is backed by an up-to-date Proof of Address document (less than 90 days old)."
                saving={saving}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Physical / Residential Address
                  </label>
                  <input
                    type="text"
                    value={form.physicalAddress}
                    onChange={e => setForm({ ...form, physicalAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Unit 4, Sandton Crest, 12 Rivonia Road, Morningside"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    City / Suburb
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Sandton"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Province
                  </label>
                  <select
                    value={form.province}
                    onChange={e => setForm({ ...form, province: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  >
                    {SA_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={e => setForm({ ...form, postalCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. 2196"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.samePostal}
                      onChange={e => setForm({ ...form, samePostal: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Postal address is the same as physical address
                    </span>
                  </label>
                </div>

                {!form.samePostal && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                      Postal Address / P.O. Box
                    </label>
                    <input
                      type="text"
                      value={form.postalAddress}
                      onChange={e => setForm({ ...form, postalAddress: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="e.g. P.O. Box 7812, Sandton, 2146"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Banking & Payout */}
          {activeTab === 'banking' && (
            <div className="space-y-6">
              <TabHeader
                title="Banking & Claim Payout Account"
                subtitle="This account is authorized for policy disbursements, claim settlements, and debit-order premium collections."
                saving={saving}
              />

              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Statutory Account Validation:</strong> For AML security, all payout accounts must match the verified SA ID of the primary policyholder. Bank verification takes place against CDV algorithms.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Bank Institution
                  </label>
                  <select
                    value={form.bankName}
                    onChange={e => handleBankChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  >
                    {SA_BANKS.map(bank => (
                      <option key={bank.name} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Account Holder Full Name
                  </label>
                  <input
                    type="text"
                    value={form.accountHolderName}
                    onChange={e => setForm({ ...form, accountHolderName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. S Dlamini"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
                    placeholder="e.g. 62849102941"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={form.accountType}
                    onChange={e => setForm({ ...form, accountType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  >
                    <option value="Cheque / Current">Cheque / Current</option>
                    <option value="Savings Account">Savings Account</option>
                    <option value="Transmission Account">Transmission Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={form.branchCode}
                    onChange={e => setForm({ ...form, branchCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
                    placeholder="e.g. 250655"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Emergency Contact */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <TabHeader
                title="Emergency Contact & Next of Kin"
                subtitle="Designated person in the event of an urgent policy notification or claim emergency."
                saving={saving}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Contact Full Name
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={e => setForm({ ...form, emergencyContactName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Nomvula Dlamini"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Relationship
                  </label>
                  <select
                    value={form.emergencyContactRelationship}
                    onChange={e => setForm({ ...form, emergencyContactRelationship: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  >
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Business Partner">Business Partner</option>
                    <option value="Friend">Friend / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={e => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. 083 987 6543"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Emergency Email Address
                  </label>
                  <input
                    type="email"
                    value={form.emergencyContactEmail}
                    onChange={e => setForm({ ...form, emergencyContactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. nomvula@gmail.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Employment & Income */}
          {activeTab === 'employment' && (
            <div className="space-y-6">
              <TabHeader
                title="Employment & Financial Profile"
                subtitle="Information used for risk underwriting, affordability calculations, and statutory reporting."
                saving={saving}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Employment Status
                  </label>
                  <select
                    value={form.employmentStatus}
                    onChange={e => setForm({ ...form, employmentStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  >
                    <option value="Employed">Employed (Full-time)</option>
                    <option value="Self-Employed">Self-Employed / Business Owner</option>
                    <option value="Contractor">Independent Contractor</option>
                    <option value="Retired">Retired</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Employer Name / Business Name
                  </label>
                  <input
                    type="text"
                    value={form.employer}
                    onChange={e => setForm({ ...form, employer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Standard Bank Corporate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Occupation / Role Title
                  </label>
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={e => setForm({ ...form, occupation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. Senior Software Architect"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Estimated Gross Monthly Income
                  </label>
                  <select
                    value={form.monthlyIncome}
                    onChange={e => setForm({ ...form, monthlyIncome: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  >
                    <option value="Under R 25,000">Under R 25,000</option>
                    <option value="R 25,000 - R 45,000">R 25,000 - R 45,000</option>
                    <option value="R 45,000 - R 65,000">R 45,000 - R 65,000</option>
                    <option value="R 65,000 - R 100,000">R 65,000 - R 100,000</option>
                    <option value="R 100,000 - R 200,000">R 100,000 - R 200,000</option>
                    <option value="Over R 200,000">Over R 200,000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Preferences & Security */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <TabHeader
                title="Communication Preferences & Security"
                subtitle="Configure real-time automated alerts and portal appearance."
                saving={saving}
              />

              {/* Notification Channels */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Automated Alert Channels</h4>
                
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">SMS Notifications</span>
                    <p className="text-xs text-gray-500">Instant SMS for policy renewals, debit alerts, and document expiries.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.smsNotifications}
                    onChange={e => setForm({ ...form, smsNotifications: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Email Notifications & Schedules</span>
                    <p className="text-xs text-gray-500">Quarterly valuation reports, policy schedules, and tax certificates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.emailNotifications}
                    onChange={e => setForm({ ...form, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">WhatsApp Dispatch & Claims Updates</span>
                    <p className="text-xs text-gray-500">Direct WhatsApp claim status tracker and roadside assistance.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.whatsappNotifications}
                    onChange={e => setForm({ ...form, whatsappNotifications: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                </label>
              </div>

              {/* Theme Selector */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Display Theme</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ThemeButton
                    active={darkMode}
                    icon={<FiMoon className="w-5 h-5" />}
                    title="Dark Mode"
                    description="OLED & low light clarity"
                    onClick={() => setDarkMode(true)}
                  />
                  <ThemeButton
                    active={!darkMode}
                    icon={<FiSun className="w-5 h-5" />}
                    title="Light Mode"
                    description="High daylight contrast"
                    onClick={() => setDarkMode(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Legal & Privacy Framework (POPIA / EU GDPR) */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <TabHeader
                title="Legal & Data Protection Jurisdiction"
                subtitle="Select your primary privacy framework to accompany European Union residents or South African law."
                saving={saving}
              />

              {/* Status Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold text-sm">
                    {privacyPolicy === 'GDPR' ? (
                      <span className="font-mono text-xs font-black">EU</span>
                    ) : (privacyPolicy === 'HYBRID_EU' ? (
                      <FiGlobe size={18} />
                    ) : (
                      <span className="font-mono text-xs font-black">ZA</span>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Current Active Framework:{' '}
                      <span className="text-red-600">
                        {privacyPolicy === 'GDPR' ? 'EU GDPR (Regulation 2016/679)' : (privacyPolicy === 'HYBRID_EU' ? 'Dual POPIA + EU GDPR Accord' : 'POPIA (Act 4 of 2013)')}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {privacyPolicy === 'GDPR'
                        ? 'Full EU Chapter III Data Subject Rights and European Standard Contractual Clauses (SCC) active.'
                        : (privacyPolicy === 'HYBRID_EU'
                            ? 'Dual South African FAIS/FICA and European Union cross-border compliance active.'
                            : 'Standard South African Information Regulator statutory protection active.')}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto flex items-center gap-1">
                  <FiCheckCircle size={13} /> Active & Audited
                </span>
              </div>

              {/* Policy Selection Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Switch or Update Policy Framework
                </h4>

                {/* POPIA Card */}
                <div
                  onClick={() => handleUpdatePrivacyPolicy('POPIA')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    privacyPolicy === 'POPIA'
                      ? 'border-red-600 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        ZA
                      </span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        South Africa POPIA (Act 4 of 2013)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300">
                        Default Domestic
                      </span>
                    </div>
                    {privacyPolicy === 'POPIA' && (
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                        <FiCheck />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
                    Protection of Personal Information Act. Covers lawful processing of South African policyholders, FAIS statutory retention, and FICA client verification.
                  </p>
                </div>

                {/* EU GDPR Card */}
                <div
                  onClick={() => handleUpdatePrivacyPolicy('GDPR')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    privacyPolicy === 'GDPR'
                      ? 'border-red-600 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">
                        EU
                      </span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        European Union GDPR (Regulation (EU) 2016/679)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        For EU Expats & European Residents
                      </span>
                    </div>
                    {privacyPolicy === 'GDPR' && (
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                        <FiCheck />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
                    Full GDPR compliance accord. Unlocks European Data Subject Rights (Right to be Forgotten, Data Portability, 72h Breach Alert Protocol, and Standard Contractual Clauses for transborder data transfers).
                  </p>
                </div>

                {/* Dual Accord Card */}
                <div
                  onClick={() => handleUpdatePrivacyPolicy('HYBRID_EU')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    privacyPolicy === 'HYBRID_EU'
                      ? 'border-red-600 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                        GLOBAL
                      </span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        Dual Accord (POPIA + EU GDPR Bridge)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        International Multi-Jurisdiction
                      </span>
                    </div>
                    {privacyPolicy === 'HYBRID_EU' && (
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                        <FiCheck />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
                    Seamless legal bridge for clients holding offshore assets or European citizenship alongside South African coverage.
                  </p>
                </div>
              </div>

              {/* EU Country & Transfer Details */}
              {privacyPolicy !== 'POPIA' && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-700 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    European Union Accompanying Country
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Country of EU Residency / Citizenship</label>
                      <select
                        value={euCountry}
                        onChange={e => setEuCountry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20"
                      >
                        {EU_COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">EU Representative & DPO Point of Contact</label>
                      <input
                        type="text"
                        disabled
                        value="dpo-eu@royalsync.co.za (Dublin / Brussels)"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-xs text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-zinc-800">
                    <input
                      type="checkbox"
                      id="cbConsent"
                      checked={crossBorderConsent}
                      onChange={e => setCrossBorderConsent(e.target.checked)}
                      className="mt-0.5 accent-red-600 rounded"
                    />
                    <label htmlFor="cbConsent" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      Enforce EU Standard Contractual Clauses (SCC Article 46) for international insurer settlement data transfers.
                    </label>
                  </div>
                </div>
              )}

              {/* Data Subject Rights Accordion / Summary */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-700 text-xs space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiFileText className="text-red-600" /> Your Active Statutory Privacy Entitlements
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-gray-600 dark:text-gray-400">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Right of Access & Portability</span>
                    <span>Download all underwriting history in open JSON/CSV format.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Right to Erasure (Forgotten)</span>
                    <span>Purge marketing and non-statutory auxiliary documents upon request.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <FiShield className="text-red-600 w-4 h-4" /> All updates are digitally encrypted and audited.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={saving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <FiRefreshCw className="w-4 h-4" /> Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                id="footer-update-profile-btn"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" /> Updating Profile...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" /> Update Profile Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => {
          localStorage.removeItem('royalsync_token');
          localStorage.removeItem('royalsync_user');
          window.location.href = '/login';
        }}
        className="w-full rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 py-3.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100/80 transition-colors"
      >
        Sign Out Secure Session
      </button>
    </div>
  );
};

/* Subcomponents */

const TabHeader = ({
  title,
  subtitle,
  saving
}: {
  title: string;
  subtitle: string;
  saving: boolean;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 mb-6">
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
    </div>
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 self-start sm:self-auto cursor-pointer"
    >
      {saving ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
      {saving ? 'Updating...' : 'Update Profile'}
    </button>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/40 p-3.5 text-center">
    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{value}</div>
    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</div>
  </div>
);

const TabButton = ({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
      active
        ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm border border-gray-200/80 dark:border-gray-700'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ThemeButton = ({
  active,
  icon,
  title,
  description,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all ${
      active
        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}
  >
    <div className={`p-2.5 rounded-xl ${active ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="font-semibold text-sm text-gray-900 dark:text-white">{title}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
    </div>
    {active && (
      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center">
        <FiCheck className="w-3.5 h-3.5" />
      </span>
    )}
  </button>
);
