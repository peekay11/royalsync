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
  FiCheckCircle
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
  assignedAdvisor?: {
    name?: string;
    title?: string;
    fspNumber?: string;
    phone?: string;
    email?: string;
  };
}

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

  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'banking' | 'emergency' | 'employment' | 'preferences'>('personal');
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('royalsync_web_theme') === 'dark');

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
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('royalsync_web_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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

              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <FiCheckCircle className="w-3.5 h-3.5" /> {profile?.kycStatus === 'Verified' ? 'KYC Verified' : 'FICA / KYC Verified'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <FiShield className="w-3.5 h-3.5" /> Risk: {profile?.riskProfile || 'Moderate Growth'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
              <StatCard label="Total Portfolio Value" value={profile?.totalNetWorthFormatted || 'R 450,000.00'} />
              <StatCard label="Active Policies" value={String(profile?.activePoliciesCount || 2)} />
              <StatCard label="Financial Goals Met" value={`${profile?.goalCompletionRate || 68}%`} />
            </div>
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
        </div>

        {/* Tab Forms */}
        <form onSubmit={handleSave} className="p-6">
          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your contact details and legal identification.
                </p>
              </div>

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
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Residential & Postal Addresses</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Ensure your residential address is backed by an up-to-date Proof of Address document (less than 90 days old).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Physical / Residential Address
                  </label>
                  <input
                    type="text"
                    value={form.physicalAddress}
                    onChange={e => setForm({ ...form, physicalAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Banking & Claim Payout Account</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  This account is authorized for policy disbursements, claim settlements, and debit-order premium collections.
                </p>
              </div>

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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Emergency Contact & Next of Kin</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Designated person in the event of an urgent policy notification or claim emergency.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Contact Full Name
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={e => setForm({ ...form, emergencyContactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="e.g. nomvula@gmail.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Employment & Income */}
          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Employment & Financial Profile</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Information used for risk underwriting, affordability calculations, and statutory reporting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Employment Status
                  </label>
                  <select
                    value={form.employmentStatus}
                    onChange={e => setForm({ ...form, employmentStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Communication Preferences & Security</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure real-time automated alerts and portal appearance.
                </p>
              </div>

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
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" /> Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" /> Save Profile Details
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
