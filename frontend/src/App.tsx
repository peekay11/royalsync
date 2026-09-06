import { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { apiRequest } from './lib/api';

import { ClientPortal } from './portals/ClientPortal/ClientPortal';
import { AdminPortal } from './portals/AdminPortal/AdminPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal/SuperAdminPortal';
import { PartnerPortal } from './portals/PartnerPortal';

const AuthScreen = ({ portal: _portal, defaultRole, allowRegister }: { portal: string, defaultRole: string, allowRegister?: boolean, useEmail?: boolean }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('royalsync_token', result.token);
      localStorage.setItem('royalsync_user', JSON.stringify(result.user));
      const role: string = result.user?.role ?? defaultRole;
      const path = role === 'SUPER_ADMIN' ? '/super-admin' : role === 'ADMIN' || role === 'ADVISER' ? '/admin' : role === 'PARTNER' ? '/partner' : '/client';
      navigate(path);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full space-y-4">
        <div className="text-center mb-2">
          <div className="w-12 h-12 bg-red-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">RS</span>
          </div>
          <h1 className="text-2xl font-normal text-gray-800">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in with your email and password</p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email address</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-400" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button disabled={loading} className="w-full bg-red-600 text-white rounded-lg p-3 font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {allowRegister && (
          <p className="text-center text-sm mt-2">
            Don't have an account? <Link to={`/${defaultRole.toLowerCase().replace('_', '-')}/register`} className="text-red-600 hover:underline">Register here</Link>
          </p>
        )}

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Demo credentials: super@royalsquare.co.za / Admin@12345</p>
        </div>
      </form>
    </div>
  );
};

const RegisterScreen = ({ portal: _portal, defaultRole }: { portal: string, defaultRole: string }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, mobile, email, password, role: defaultRole })
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full space-y-4">
        <div className="text-center mb-2">
          <div className="w-12 h-12 bg-red-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">RS</span>
          </div>
          <h1 className="text-2xl font-normal text-gray-800">Create your account</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">First Name</label>
            <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full border border-gray-300 rounded-lg p-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Last Name</label>
            <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="w-full border border-gray-300 rounded-lg p-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email address</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-gray-300 rounded-lg p-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mobile number</label>
          <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="082 000 0000" className="w-full border border-gray-300 rounded-lg p-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="w-full border border-gray-300 rounded-lg p-3 text-sm" minLength={8} />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <button disabled={loading} className="w-full bg-red-600 text-white rounded-lg p-3 font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">{loading ? 'Registering...' : 'Create Account'}</button>
        <p className="text-center text-sm mt-2">
          Already have an account? <Link to={`/${defaultRole.toLowerCase().replace('_', '-')}/login`} className="text-red-600 hover:underline">Sign in here</Link>
        </p>
      </form>
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
