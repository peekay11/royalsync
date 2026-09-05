import { Routes, Route } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiFileText, FiShield, 
  FiAlertCircle, FiCheckSquare, FiLayout, 
  FiBell, FiBarChart2, FiDollarSign 
} from 'react-icons/fi';
import { PortalLayout } from '../../components/layouts/PortalLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminClients } from './pages/AdminClients';
import { AdminLeads } from './pages/AdminLeads';
import { AdminApplications } from './pages/AdminApplications';
import { AdminPolicies } from './pages/AdminPolicies';
import { AdminClaims } from './pages/AdminClaims';
import { AdminTasks } from './pages/AdminTasks';
import { AdminTemplates } from './pages/AdminTemplates';
import { AdminNotifications } from './pages/AdminNotifications';
import { AdminReports } from './pages/AdminReports';
import { AdminCommissions } from './pages/AdminCommissions';
import { Settings } from '../../pages/Settings';

export const AdminPortal = () => {
  const links = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome /> },
    { name: 'Leads / Pipeline', path: '/admin/leads', icon: <FiUsers /> },
    { name: 'Clients', path: '/admin/clients', icon: <FiUsers /> },
    { name: 'Applications', path: '/admin/applications', icon: <FiFileText /> },
    { name: 'Policies', path: '/admin/policies', icon: <FiShield /> },
    { name: 'Claims', path: '/admin/claims', icon: <FiAlertCircle /> },
    { name: 'Tasks', path: '/admin/tasks', icon: <FiCheckSquare /> },
    { name: 'Templates', path: '/admin/templates', icon: <FiLayout /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <FiBell /> },
    { name: 'Reports', path: '/admin/reports', icon: <FiBarChart2 /> },
    { name: 'Commissions', path: '/admin/commissions', icon: <FiDollarSign /> },
  ];

  return (
    <PortalLayout title="Admin Portal" links={links}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/leads" element={<AdminLeads />} />
        <Route path="/clients" element={<AdminClients />} />
        <Route path="/applications" element={<AdminApplications />} />
        <Route path="/policies" element={<AdminPolicies />} />
        <Route path="/claims" element={<AdminClaims />} />
        <Route path="/tasks" element={<AdminTasks />} />
        <Route path="/templates" element={<AdminTemplates />} />
        <Route path="/notifications" element={<AdminNotifications />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/commissions" element={<AdminCommissions />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </PortalLayout>
  );
};
