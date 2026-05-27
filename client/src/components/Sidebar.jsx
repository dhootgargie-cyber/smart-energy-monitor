import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard',  path: '/dashboard',  roles: ['admin','technician','student'] },
  { label: 'Live Feed',  path: '/live',        roles: ['admin','technician','student'] },
  { label: 'Alerts',     path: '/alerts',      roles: ['admin','technician'] },
  { label: 'Reports',    path: '/reports',     roles: ['admin','technician'] },
  { label: 'Buildings',  path: '/buildings',   roles: ['admin'] },
  { label: 'Users',      path: '/users',       roles: ['admin'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  const visible = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-56 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-green-400 font-bold text-lg tracking-tight">⚡ EnergyIQ</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visible.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-1">{user?.name}</div>
        <div className="text-xs text-green-400 capitalize mb-3">{user?.role}</div>
        <button
          onClick={logout}
          className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors text-left"
        >
          Logout →
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
