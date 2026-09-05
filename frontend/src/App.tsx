import { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { apiRequest } from './lib/api';

import { ClientPortal } from './portals/ClientPortal/ClientPortal';
import { AdminPortal } from './portals/AdminPortal/AdminPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal/SuperAdminPortal';
import { PartnerPortal } from './portals/PartnerPortal';

const AuthScreen = ({ portal, defaultRole, allowRegister }: { portal: string, defaultRole: string, allowRegister?: boolean }) => {
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
      navigate(`/${defaultRole.toLowerCase().replace('_', '-')}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full space-y-4">
        <h1 className="text-2xl font-normal text-gray-800 text-center">Welcome to {portal}</h1>
        <p className="text-center text-gray-500 text-sm mb-4">Sign in to continue</p>
        <input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email" className="w-full border rounded-lg p-3" />
        <input required type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" className="w-full border rounded-lg p-3" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full bg-red-600 text-white rounded-lg p-3 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign in'}</button>
        {allowRegister && (
          <p className="text-center text-sm mt-4">
            Don't have an account? <Link to={`/${defaultRole.toLowerCase().replace('_', '-')}/register`} className="text-red-600 hover:underline">Register here</Link>
          </p>
        )}
      </form>
    </div>
  );
};

const RegisterScreen = ({ portal, defaultRole }: { portal: string, defaultRole: string }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName, mobile, role: defaultRole })
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
        <h1 className="text-2xl font-normal text-gray-800 text-center">Welcome to {portal}</h1>
        <p className="text-center text-gray-500 text-sm mb-4">Create your account to continue</p>
        <div className="grid grid-cols-2 gap-4">
          <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full border rounded-lg p-3" />
          <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full border rounded-lg p-3" />
        </div>
        <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile Number" className="w-full border rounded-lg p-3" />
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded-lg p-3" />
        <input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full border rounded-lg p-3" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full bg-red-600 text-white rounded-lg p-3 disabled:opacity-50">{loading ? 'Registering...' : 'Register'}</button>
        <p className="text-center text-sm mt-4">
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
