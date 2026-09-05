import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ClientPortal } from './portals/ClientPortal/ClientPortal';
import { AdminPortal } from './portals/AdminPortal/AdminPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal/SuperAdminPortal';
import { PartnerPortal } from './portals/PartnerPortal';

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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PortalSelector />} />
        <Route path="/client/*" element={<ClientPortal />} />
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/super-admin/*" element={<SuperAdminPortal />} />
        <Route path="/partner/*" element={<PartnerPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
