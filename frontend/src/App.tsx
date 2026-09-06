import { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { apiRequest } from './lib/api';

import { ClientPortal } from './portals/ClientPortal/ClientPortal';
import { AdminPortal } from './portals/AdminPortal/AdminPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal/SuperAdminPortal';
import { PartnerPortal } from './portals/PartnerPortal';

import {
  FiCreditCard,
  FiShield,
  FiUser,
  FiPhone,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiLock,
} from 'react-icons/fi';
import { LegalPrivacyModal } from './components/legal/LegalPrivacyModal';

const AuthScreen = ({ portal, defaultRole, allowRegister }: { portal: string, defaultRole: string, allowRegister?: boolean }) => {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>('POPIA');

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!idNumber) return setError('Please enter your 13-digit ID Number');
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ idNumber })
      });
      setOtpSent(true);
      setSuccessMsg(res.message || 'OTP sent successfully to your registered mobile!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otpSent) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ token: string; user: any }>('/auth/login-id', {
        method: 'POST',
        body: JSON.stringify({ idNumber, code: otp })
      });
      localStorage.setItem('royalsync_token', result.token);
      localStorage.setItem('royalsync_user', JSON.stringify(result.user));
      navigate(`/${defaultRole.toLowerCase().replace('_', '-')}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-10">
      <div className="bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-200/80 dark:border-zinc-800 max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 text-red-600 mb-2 border border-red-600/20">
            <FiShield size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome to {portal}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in securely using your South African ID & OTP</p>
          
          {/* Prominent Legal Policy Switcher Pill */}
          <button
            type="button"
            onClick={() => setLegalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/40 border border-gray-200 dark:border-zinc-700 text-[11px] font-semibold text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors cursor-pointer mt-1"
          >
            <FiShield size={12} className="text-red-600 shrink-0" />
            <span>
              Data Protection:{' '}
              <strong className="text-gray-900 dark:text-white">
                {privacyPolicy === 'GDPR' ? 'EU GDPR (EU)' : (privacyPolicy === 'HYBRID_EU' ? 'Dual Accord (POPIA + GDPR)' : 'POPIA (SA)')}
              </strong>
            </span>
            <span className="text-[10px] text-red-600 font-bold ml-0.5">· Switch Framework ▾</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* RSA ID Number Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center justify-between">
              <span>South African ID Number</span>
              <span className="text-[10px] text-gray-400 font-normal">13 Digits</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
                <FiCreditCard size={18} />
              </span>
              <input
                required
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="e.g. 9001015009087"
                maxLength={13}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          {/* OTP Code Input (Conditional) */}
          {otpSent && (
            <div className="space-y-1.5 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span>One-Time PIN (OTP)</span>
                <span className="text-[10px] text-red-500 font-semibold">Demo PIN: 123456</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
                  <FiLock size={18} />
                </span>
                <input
                  required
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP code"
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 tracking-widest focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <FiAlertTriangle className="shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="shrink-0" size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? 'Sending OTP SMS...' : 'Send OTP via SMS'}
              <FiArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <FiArrowRight size={16} />
            </button>
          )}

          {allowRegister && (
            <div className="pt-2 text-center border-t border-gray-100 dark:border-zinc-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to={`/${defaultRole.toLowerCase().replace('_', '-')}/register`}
                  className="font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
                >
                  Register here
                </Link>
              </p>
            </div>
          )}
        </form>

        {/* Legal Privacy Modal */}
        <LegalPrivacyModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          currentFramework={privacyPolicy}
          onFrameworkUpdated={setPrivacyPolicy}
        />
      </div>
    </div>
  );
};

const RegisterScreen = ({ portal, defaultRole }: { portal: string, defaultRole: string }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>('POPIA');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, mobile, idNumber, role: defaultRole, privacyFramework: privacyPolicy })
      });
      localStorage.setItem('royalsync_token', result.token);
      localStorage.setItem('royalsync_user', JSON.stringify(result.user));
      navigate(`/${defaultRole.toLowerCase().replace('_', '-')}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12">
      <div className="bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-200/80 dark:border-zinc-800 max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 text-red-600 mb-2 border border-red-600/20">
            <FiShield size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Register your policyholder profile with {portal}</p>

          {/* Prominent Legal Policy Switcher Pill */}
          <button
            type="button"
            onClick={() => setLegalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/40 border border-gray-200 dark:border-zinc-700 text-[11px] font-semibold text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors cursor-pointer mt-1"
          >
            <FiShield size={12} className="text-red-600 shrink-0" />
            <span>
              Data Protection:{' '}
              <strong className="text-gray-900 dark:text-white">
                {privacyPolicy === 'GDPR' ? 'EU GDPR (EU)' : (privacyPolicy === 'HYBRID_EU' ? 'Dual Accord (POPIA + GDPR)' : 'POPIA (SA)')}
              </strong>
            </span>
            <span className="text-[10px] text-red-600 font-bold ml-0.5">· Switch Framework ▾</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                First Name
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
                  <FiUser size={16} />
                </span>
                <input
                  required
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Sipho"
                  className="w-full pl-10 pr-3.5 py-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Last Name
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
                  <FiUser size={16} />
                </span>
                <input
                  required
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Dlamini"
                  className="w-full pl-10 pr-3.5 py-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* RSA ID Number */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center justify-between">
              <span>South African ID Number</span>
              <span className="text-[10px] text-gray-400 font-normal">13 Digits</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
                <FiCreditCard size={18} />
              </span>
              <input
                required
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="e.g. 9001015009087"
                maxLength={13}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Mobile Contact Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 dark:text-zinc-500 pointer-events-none">
                <FiPhone size={18} />
              </span>
              <input
                required
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="e.g. 071 234 5678"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <FiAlertTriangle className="shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
            <FiArrowRight size={16} />
          </button>

          <div className="pt-2 text-center border-t border-gray-100 dark:border-zinc-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already registered?{' '}
              <Link
                to={`/${defaultRole.toLowerCase().replace('_', '-')}/login`}
                className="font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Legal Privacy Modal */}
        <LegalPrivacyModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          currentFramework={privacyPolicy}
          onFrameworkUpdated={setPrivacyPolicy}
        />
      </div>
    </div>
  );
};

const PortalSelector = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
      <h1 className="text-2xl font-normal text-gray-800 text-center mb-6">Select a Portal</h1>
      <div className="flex flex-col gap-3">
        <Link to="/client" className="p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors text-center font-medium text-gray-700">Client Portal</Link>
        <Link to="/admin" className="p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors text-center font-medium text-gray-700">Admin Portal</Link>
        <Link to="/super-admin" className="p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors text-center font-medium text-gray-700">Super Admin Portal</Link>
        <Link to="/partner" className="p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors text-center font-medium text-gray-700">Partner Portal</Link>
      </div>
      {localStorage.getItem('royalsync_token') && (
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full mt-6 text-sm text-gray-500 hover:text-gray-800 text-center">Logout</button>
      )}
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles, portalPath }: { children: React.ReactNode; roles?: string[]; portalPath: string }) => {
  const user = JSON.parse(localStorage.getItem('royalsync_user') || 'null') as { role?: string } | null;
  if (!localStorage.getItem('royalsync_token') || !user) return <Navigate to={`${portalPath}/login`} replace />;
  if (roles && (!user.role || !roles.includes(user.role))) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PortalSelector />} />
        
        {/* Client Portal Auth */}
        <Route path="/client/login" element={<AuthScreen portal="Client Portal" defaultRole="CLIENT" allowRegister />} />
        <Route path="/client/register" element={<RegisterScreen portal="Client Portal" defaultRole="CLIENT" />} />
        
        {/* Admin Portal Auth */}
        <Route path="/admin/login" element={<AuthScreen portal="Admin Portal" defaultRole="ADMIN" />} />
        
        {/* Super Admin Portal Auth */}
        <Route path="/super-admin/login" element={<AuthScreen portal="Super Admin Portal" defaultRole="SUPER_ADMIN" />} />
        
        {/* Partner Portal Auth */}
        <Route path="/partner/login" element={<AuthScreen portal="Partner Portal" defaultRole="PARTNER" />} />

        {/* Protected Portals */}
        <Route path="/client/*" element={<ProtectedRoute roles={['CLIENT']} portalPath="/client"><ClientPortal /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute roles={['ADMIN', 'ADVISER', 'SUPER_ADMIN']} portalPath="/admin"><AdminPortal /></ProtectedRoute>} />
        <Route path="/super-admin/*" element={<ProtectedRoute roles={['SUPER_ADMIN']} portalPath="/super-admin"><SuperAdminPortal /></ProtectedRoute>} />
        <Route path="/partner/*" element={<ProtectedRoute roles={['PARTNER']} portalPath="/partner"><PartnerPortal /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
