import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

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
        <header className="h-16 flex items-center px-8 border-b border-gray-200 bg-white">
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
              U
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
