import { NavLink } from 'react-router-dom';
import { FiHome, FiSettings, FiUser } from 'react-icons/fi';

export const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="mr-3 text-xl" /> },
    { name: 'Profile', path: '/profile', icon: <FiUser className="mr-3 text-xl" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="mr-3 text-xl" /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold text-accent">
        MyApp
      </div>
      <nav className="flex-1 mt-6">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-r-4 border-accent text-accent' : ''
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
