import { useEffect, useState } from 'react';
import { FiCheck, FiEdit2, FiFileText, FiMail, FiMoon, FiPhone, FiPlus, FiSave, FiShield, FiSun } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

export const ClientProfile = () => {
  const { data: profile, loading, refetch } = useApi<any>('/user/profile');
  const { data: advisor } = useApi<any>('/user/advisor');
  const { data: documents } = useApi<any[]>('/workflow/documents');
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '', address: '' });
  const [showAddressEditor, setShowAddressEditor] = useState(false);
  const [showBankEditor, setShowBankEditor] = useState(false);
  const [bankAccount, setBankAccount] = useState(() => localStorage.getItem('royalsync_bank_account') || profile?.bankDetails || '');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('royalsync_web_theme') === 'dark');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (profile?.name) {
      const [firstName = '', ...last] = profile.name.split(' ');
      setForm({ firstName, lastName: last.join(' '), mobile: profile.phone || '', address: profile.physicalAddress || '' });
    }
  }, [profile]);
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('royalsync_web_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  useEffect(() => {
    if (!bankAccount && profile?.bankDetails) setBankAccount(profile.bankDetails);
  }, [profile, bankAccount]);
  const save = async () => {
    setSaving(true);
    try {
      await apiRequest('/user/profile', { method: 'PUT', body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, mobile: form.mobile, physicalAddress: form.address }) });
      toast.success('Profile updated');
      refetch();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <div className="p-8 text-gray-500">Loading profile...</div>;
  return (
    <div className="space-y-6 max-w-4xl">
      <section className="flex flex-col items-center text-center py-3">
        <div className="w-20 h-20 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl font-bold">{profile?.initials || form.firstName?.[0] || 'U'}</div>
        <h1 className="text-2xl font-semibold text-gray-800 mt-3">{profile?.name || `${form.firstName} ${form.lastName}`}</h1>
        {profile?.idNumber && <p className="text-sm text-gray-500 mt-1">SA ID: {profile.idNumber}</p>}
        <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-red-600"><FiShield /> {profile?.kycStatus === 'Verified' ? 'KYC Verified Policyholder' : 'KYC Pending'}</span>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Net Worth" value={profile?.totalNetWorthFormatted || 'R 0.00'} />
        <Stat label="Policies" value={String(profile?.activePoliciesCount || 0)} />
        <Stat label="Goals Met" value={`${profile?.goalCompletionRate || 0}%`} />
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Assigned Financial Adviser</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800">{advisor?.name || profile?.assignedAdvisor?.name || 'Unassigned Adviser'}</h3>
          <p className="text-sm text-gray-500">{advisor?.title || profile?.assignedAdvisor?.title || 'Financial Planner'}</p>
          <p className="text-xs font-semibold text-amber-600">{advisor?.fspNumber || profile?.assignedAdvisor?.fspNumber || 'FSP Pending'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            <a href={advisor?.phone ? `tel:${advisor.phone}` : undefined} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"><FiPhone /> Call</a>
            <a href={advisor?.email ? `mailto:${advisor.email}` : undefined} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"><FiMail /> Email</a>
            <button type="button" onClick={() => toast.info('Your adviser mandate is active and available on request.')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"><FiFileText /> Mandate</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Statutory Mandates & Agreements</h2>
        <div className="space-y-3">
          <InfoAction title="Client Service Agreement" detail="Scope of Services · Remuneration Schedule" onClick={() => toast.info('Client Service Agreement is available from your adviser.')} />
          <InfoAction title="Notice of Appointment" detail="Royal Square Financial · Appointment record" onClick={() => toast.info('Notice of Appointment is available from your adviser.')} />
          <InfoAction title="Document Expiry & Alerts" detail={`${documents?.length || 0} documents connected · SMS & email alerts`} onClick={() => toast.info('Document expiry alerts are managed in the Documents portal.')} />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Appearance & Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ThemeButton active={darkMode} icon={<FiMoon />} title="Dark Mode" onClick={() => setDarkMode(true)} />
          <ThemeButton active={!darkMode} icon={<FiSun />} title="Light Mode" onClick={() => setDarkMode(false)} />
        </div>
      </section>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowAddressEditor(current => !current)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
              <FiPlus /> {showAddressEditor ? 'Close address' : 'Add address'}
            </button>
            <button type="button" onClick={() => setShowBankEditor(current => !current)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <FiEdit2 /> {showBankEditor ? 'Close bank accounts' : 'Edit bank accounts'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input type="text" disabled value={profile?.idNumber || 'Not configured'} className="w-full border-gray-200 bg-gray-50 rounded-md text-sm text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Requires adviser approval to change.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input type="text" value={form.mobile} onChange={event => setForm({ ...form, mobile: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          {showAddressEditor && <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label><input type="text" placeholder="e.g. 12 Main Road, Sandton" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" /></div>}
        </div>
        <div className="mt-6">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">{saving ? <FiSave /> : <FiCheck />} {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
      {showBankEditor && <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-1">Bank Accounts</h2>
        <p className="text-sm text-gray-500 mb-4">Update the account used for claim payouts. Details are stored on this device until bank-account syncing is enabled.</p>
        <label className="block text-sm font-medium text-gray-700">Account details
          <input type="text" placeholder="e.g. FNB Cheque Account ending 4912" value={bankAccount} onChange={event => setBankAccount(event.target.value)} className="mt-1 w-full border-gray-300 rounded-md text-sm" />
        </label>
        <button type="button" onClick={() => { localStorage.setItem('royalsync_bank_account', bankAccount); toast.success('Bank account details saved'); }} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"><FiSave /> Save bank account</button>
      </section>}
      <button onClick={() => { localStorage.removeItem('royalsync_token'); localStorage.removeItem('royalsync_user'); window.location.href = '/login'; }} className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100">Sign Out</button>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl border border-gray-200 bg-white p-4 text-center"><div className="text-lg font-bold text-amber-600">{value}</div><div className="mt-1 text-xs text-gray-500">{label}</div></div>;
const InfoAction = ({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) => <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-red-200"><span><span className="block font-semibold text-gray-800">{title}</span><span className="mt-1 block text-xs text-gray-500">{detail}</span></span><span className="text-lg text-red-600">→</span></button>;
const ThemeButton = ({ active, icon, title, onClick }: { active: boolean; icon: React.ReactNode; title: string; onClick: () => void }) => <button type="button" onClick={onClick} className={`relative rounded-xl border p-4 text-left ${active ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">{icon}</span><span className="block font-semibold text-gray-800">{title}</span>{active && <span className="absolute right-3 top-3 rounded-full bg-red-600 p-1 text-white"><FiCheck /></span>}</button>;
