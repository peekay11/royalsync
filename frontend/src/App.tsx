import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { login } from './lib/api';

import { ClientPortal } from './portals/ClientPortal/ClientPortal';
import { AdminPortal } from './portals/AdminPortal/AdminPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal/SuperAdminPortal';
import { PartnerPortal } from './portals/PartnerPortal';

const LoginScreen = () => {
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
      const result = await login(email, password);
      localStorage.setItem('royalsync_token', result.token);
      localStorage.setItem('royalsync_user', JSON.stringify(result.user));
      navigate('/');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full space-y-4">
      <h1 className="text-2xl font-normal text-gray-800 text-center">RoyalSync sign in</h1>
      <input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email" className="w-full border rounded-lg p-3" />
      <input required type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" className="w-full border rounded-lg p-3" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full bg-red-600 text-white rounded-lg p-3 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign in'}</button>
    </form>
  </div>;
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
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('royalsync_user') || 'null') as { role?: string } | null;
  if (!localStorage.getItem('royalsync_token') || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && (!user.role || !roles.includes(user.role))) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<ProtectedRoute><PortalSelector /></ProtectedRoute>} />
        <Route path="/client/*" element={<ProtectedRoute roles={['CLIENT']}><ClientPortal /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute roles={['ADMIN', 'ADVISER', 'SUPER_ADMIN']}><AdminPortal /></ProtectedRoute>} />
        <Route path="/super-admin/*" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminPortal /></ProtectedRoute>} />
        <Route path="/partner/*" element={<ProtectedRoute roles={['PARTNER']}><PartnerPortal /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
