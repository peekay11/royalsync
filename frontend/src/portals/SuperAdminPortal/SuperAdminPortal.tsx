import { Routes, Route } from 'react-router-dom';
import { 
  FiHome, FiLock, FiCheckCircle, FiTrendingUp, 
  FiGrid, FiBriefcase, FiLayout, FiSettings, 
  FiCpu, FiActivity, FiList 
} from 'react-icons/fi';
import { PortalLayout } from '../../components/layouts/PortalLayout';
import { SuperDashboard } from './pages/SuperDashboard';
import { SuperIam } from './pages/SuperIam';
import { SuperCompliance } from './pages/SuperCompliance';
import { SuperAnalytics } from './pages/SuperAnalytics';
import { SuperTenants } from './pages/SuperTenants';
import { SuperInsurers } from './pages/SuperInsurers';
import { SuperTemplates } from './pages/SuperTemplates';
import { SuperConfig } from './pages/SuperConfig';
import { SuperAi } from './pages/SuperAi';
import { SuperIntegration } from './pages/SuperIntegration';
import { SuperAudit } from './pages/SuperAudit';

export const SuperAdminPortal = () => {
  const links = [
    { name: 'Dashboard', path: '/super-admin', icon: <FiHome /> },
    { name: 'IAM', path: '/super-admin/iam', icon: <FiLock /> },
    { name: 'Compliance', path: '/super-admin/compliance', icon: <FiCheckCircle /> },
    { name: 'Analytics', path: '/super-admin/analytics', icon: <FiTrendingUp /> },
    { name: 'Tenants', path: '/super-admin/tenants', icon: <FiGrid /> },
    { name: 'Insurers', path: '/super-admin/insurers', icon: <FiBriefcase /> },
    { name: 'Templates', path: '/super-admin/templates', icon: <FiLayout /> },
    { name: 'System Config', path: '/super-admin/config', icon: <FiSettings /> },
    { name: 'AI Management', path: '/super-admin/ai', icon: <FiCpu /> },
    { name: 'Integration Health', path: '/super-admin/integration', icon: <FiActivity /> },
    { name: 'Audit Log', path: '/super-admin/audit', icon: <FiList /> },
  ];

  return (
    <PortalLayout title="Super Admin" links={links}>
      <Routes>
        <Route path="/" element={<SuperDashboard />} />
        <Route path="/iam" element={<SuperIam />} />
        <Route path="/compliance" element={<SuperCompliance />} />
        <Route path="/analytics" element={<SuperAnalytics />} />
        <Route path="/tenants" element={<SuperTenants />} />
        <Route path="/insurers" element={<SuperInsurers />} />
        <Route path="/templates" element={<SuperTemplates />} />
        <Route path="/config" element={<SuperConfig />} />
        <Route path="/ai" element={<SuperAi />} />
        <Route path="/integration" element={<SuperIntegration />} />
        <Route path="/audit" element={<SuperAudit />} />
      </Routes>
    </PortalLayout>
  );
};
