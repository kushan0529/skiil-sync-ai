import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Layout, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <Layout size={24} />
          <span>SkillSync</span>
        </Link>
        
        <div className="nav-links">
          {token ? (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <User size={20} />
              </NavLink>
              <button onClick={handleLogout} className="btn btn-outline" title="Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary">Get Started</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
