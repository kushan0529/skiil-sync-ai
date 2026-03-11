import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Briefcase, BarChart2, Calendar, User, LogOut, Moon, Sun, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { icon: Layout, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Kanban Board', path: '/kanban' },
    ...(user?.role === 'manager' || user?.role === 'admin' ? [{ icon: Users, label: 'Manager Hub', path: '/manager' }] : []),
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Layout className="text-primary" size={28} />
        <span>SkillSync AI</span>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button onClick={toggleTheme} className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button onClick={handleLogout} className="nav-item" style={{ color: 'var(--error)' }}>
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
