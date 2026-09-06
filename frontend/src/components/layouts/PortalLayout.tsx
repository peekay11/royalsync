import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiSettings, FiBell, FiX, FiCheck } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiRequest } from '../../lib/api';

interface SidebarItem {
  name: string;
  path: string;
  icon: ReactNode;
}

interface PortalLayoutProps {
  title: string;
  links: SidebarItem[];
  children: ReactNode;
}

export const PortalLayout = ({ title, links, children }: PortalLayoutProps) => {
  const location = useLocation();
  const portalRoot = `/${location.pathname.split('/')[1]}`;
  const { data: notifs, refetch } = useApi<any[]>('/notifications');
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = notifs || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n =>
          apiRequest(`/notifications/${n.id}/read`, { method: 'PUT' }).catch(() => {})
        )
      );
      refetch();
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-medium text-gray-700 tracking-tight">{title}</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-3 text-lg opacity-80">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center px-8 border-b border-gray-200 bg-white relative z-30">
          <div className="ml-auto flex items-center gap-3">
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                aria-label="Alerts and notifications"
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors relative"
              >
                <FiBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">Admin Alerts</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-medium"
                        >
                          <FiCheck size={12} /> Mark read
                        </button>
                      )}
                      <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600">
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 my-2">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs">
                        No active alerts or notifications
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div key={item.id} className="py-3 px-1 hover:bg-gray-50/80 rounded-xl transition-colors">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.badgeText || 'ADMIN ALERT'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 mt-1">{item.title || item.message}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to={`${portalRoot}/settings`}
              aria-label="Open settings"
              title="Settings"
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
            >
              <FiSettings className="text-lg" />
            </Link>
            <button onClick={() => { localStorage.removeItem('royalsync_token'); localStorage.removeItem('royalsync_user'); window.location.href = '/login'; }} className="text-sm text-gray-600 hover:text-red-600">Log out</button>
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
              {JSON.parse(localStorage.getItem('royalsync_user') || '{}')?.firstName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
