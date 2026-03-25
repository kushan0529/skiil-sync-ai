import { Link, NavLink, useNavigate } from "react-router-dom";
import { Layout, User, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const isManager = user?.role === "manager" || user?.role === "admin";
  return <nav className="navbar"><div className="container"><Link to="/" className="logo"><Layout size={24} /><span>SkillSync</span></Link><div className="nav-links">{isAuthenticated ? <><NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink><NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Projects</NavLink>{isManager && <><NavLink to="/manager" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Manager Hub</NavLink><NavLink to="/recommendations" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Sparkles size={16} />
                    Matchmaker
                  </NavLink></>}<NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><User size={20} /></NavLink><button onClick={handleLogout} className="btn btn-outline" title="Logout"><LogOut size={20} /></button></> : <><NavLink to="/login" className="nav-link">Login</NavLink><NavLink to="/register" className="btn btn-primary">Get Started</NavLink></>}</div></div></nav>;
};
var stdin_default = Navbar;
export {
  stdin_default as default
};
