import { Routes, Route, Navigate } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiSettings, FiInbox } from 'react-icons/fi';
import { PortalLayout } from '../../components/layouts/PortalLayout';
import { PartnerDashboard } from './pages/Dashboard';
import { PartnerSetup } from './pages/Setup';
import { PartnerMessages } from './pages/Messages';
import { PartnerInbox } from './pages/PartnerInbox';

export const PartnerPortal = () => {
  const links = [
    { name: 'Dashboard', path: '/partner', icon: <FiHome /> },
    { name: 'Quotes Inbox', path: '/partner/inbox', icon: <FiInbox /> },
    { name: 'Messages', path: '/partner/messages', icon: <FiMessageSquare /> },
    { name: 'Setup', path: '/partner/setup', icon: <FiSettings /> },
  ];

  return (
    <PortalLayout title="Partner Portal" links={links}>
      <Routes>
        <Route path="/" element={<PartnerDashboard />} />
        <Route path="/inbox" element={<PartnerInbox />} />
        <Route path="/messages" element={<PartnerMessages />} />
        <Route path="/setup" element={<PartnerSetup />} />
        <Route path="*" element={<Navigate to="/partner" replace />} />
      </Routes>
    </PortalLayout>
  );
};
