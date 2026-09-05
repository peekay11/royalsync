import { Routes, Route } from 'react-router-dom';
import { 
  FiHome, FiShield, FiFileText, FiTarget, 
  FiFolder, FiDollarSign, FiMessageCircle, 
  FiUser, FiSettings 
} from 'react-icons/fi';
import { PortalLayout } from '../../components/layouts/PortalLayout';
import { ClientDashboard } from './pages/ClientDashboard';
import { ClientInsurance } from './pages/ClientInsurance';
import { ClientClaims } from './pages/ClientClaims';
import { ClientGoals } from './pages/ClientGoals';
import { ClientDocuments } from './pages/ClientDocuments';
import { ClientPayments } from './pages/ClientPayments';
import { ClientAiInsights } from './pages/ClientAiInsights';
import { ClientProfile } from './pages/ClientProfile';
import { ClientSettings } from './pages/ClientSettings';

export const ClientPortal = () => {
  const links = [
    { name: 'Dashboard', path: '/client', icon: <FiHome /> },
    { name: 'Insurance', path: '/client/insurance', icon: <FiShield /> },
    { name: 'Claims', path: '/client/claims', icon: <FiFileText /> },
    { name: 'Goals', path: '/client/goals', icon: <FiTarget /> },
    { name: 'Documents', path: '/client/documents', icon: <FiFolder /> },
    { name: 'Payments', path: '/client/payments', icon: <FiDollarSign /> },
    { name: 'AI Insights', path: '/client/ai', icon: <FiMessageCircle /> },
    { name: 'Profile', path: '/client/profile', icon: <FiUser /> },
    { name: 'Settings', path: '/client/settings', icon: <FiSettings /> },
  ];

  return (
    <PortalLayout title="Client Portal" links={links}>
      <Routes>
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/insurance" element={<ClientInsurance />} />
        <Route path="/claims" element={<ClientClaims />} />
        <Route path="/goals" element={<ClientGoals />} />
        <Route path="/documents" element={<ClientDocuments />} />
        <Route path="/payments" element={<ClientPayments />} />
        <Route path="/ai" element={<ClientAiInsights />} />
        <Route path="/profile" element={<ClientProfile />} />
        <Route path="/settings" element={<ClientSettings />} />
      </Routes>
    </PortalLayout>
  );
};
