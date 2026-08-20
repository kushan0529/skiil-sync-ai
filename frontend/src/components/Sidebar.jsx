import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, Calendar, User, LogOut, Moon, Sun, Users, Folder, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Folder, label: "Projects", path: "/projects" },
    { icon: Briefcase, label: "Kanban Board", path: "/kanban" },
    { icon: Zap, label: "Linear", path: "/linear" },
    ...user?.role === "manager" || user?.role === "admin" ? [{ icon: Users, label: "Manager Hub", path: "/manager" }] : [],
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: User, label: "Profile", path: "/profile" }
  ];
  return <aside className="sidebar" style={{
    display: "flex",
    flexDirection: "column",
    background: "var(--card-bg)",
    borderRight: "1px solid var(--border)",
    boxShadow: "10px 0 30px -15px rgba(0,0,0,0.05)",
    padding: "2rem 1.25rem",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 50
  }}><div className="sidebar-logo" style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2.5rem",
    padding: "0 0.5rem",
    flexShrink: 0
  }}><div style={{
    width: "42px",
    height: "42px",
    background: "linear-gradient(135deg, var(--primary), #818cf8)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.3)"
  }}><Sparkles size={24} /></div><span style={{
    fontSize: "1.25rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "var(--text-main)"
  }}>SkillSync <span style={{ color: "var(--primary)" }}>AI</span></span></div><nav style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    overflowY: "auto",
    marginBottom: "1.5rem",
    paddingRight: "0.25rem"
  }} className="custom-scrollbar"><p style={{
    fontSize: "0.65rem",
    fontWeight: 800,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.75rem",
    paddingLeft: "1rem",
    flexShrink: 0
  }}>Main Navigation</p>{navItems.map((item) => <NavLink
    key={item.path}
    to={item.path}
    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
    style={({ isActive }) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.85rem 1rem",
      borderRadius: "12px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      background: isActive ? "rgba(99, 102, 241, 0.08)" : "transparent",
      color: isActive ? "var(--primary)" : "var(--text-muted)",
      fontWeight: isActive ? 700 : 500,
      border: isActive ? "1px solid rgba(99, 102, 241, 0.1)" : "1px solid transparent",
      flexShrink: 0
    })}
  ><div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}><item.icon size={20} /><span style={{ fontSize: "0.925rem" }}>{item.label}</span></div><ChevronRight size={14} style={{ opacity: 0.3 }} className="chevron-indicator" /></NavLink>)}</nav><div style={{
    marginTop: "auto",
    borderTop: "1px solid var(--border)",
    paddingTop: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    flexShrink: 0
  }}><div style={{
    padding: "1rem",
    background: "var(--bg-secondary)",
    borderRadius: "16px",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem"
  }}><div style={{
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "var(--card-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "var(--primary)",
    fontSize: "0.8rem",
    border: "1px solid var(--border)"
  }}>{user?.name?.charAt(0) || "U"}</div><div style={{ overflow: "hidden" }}><div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user?.name}</div><div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{user?.role}</div></div></div><button
    onClick={toggleTheme}
    className="nav-item-sub"
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      padding: "0.75rem 1rem",
      borderRadius: "10px",
      color: "var(--text-muted)",
      fontWeight: 600,
      fontSize: "0.875rem"
    }}
  >{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}{theme === "light" ? "Dark Mode" : "Light Mode"}</button><button
    onClick={handleLogout}
    className="nav-item-sub"
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      padding: "0.75rem 1rem",
      borderRadius: "10px",
      color: "var(--error)",
      fontWeight: 600,
      fontSize: "0.875rem"
    }}
  ><LogOut size={18} />
          Sign Out
        </button></div><style>{`
        .nav-item:hover {
          background: var(--bg-secondary) !important;
          color: var(--primary) !important;
          transform: translateX(4px);
        }
        .nav-item.active .chevron-indicator {
          opacity: 0.8 !important;
          transform: translateX(2px);
        }
        .nav-item-sub {
          transition: all 0.2s ease;
        }
        .nav-item-sub:hover {
          background: var(--bg-secondary);
          transform: translateY(-1px);
        }
      `}</style></aside>;
};
var stdin_default = Sidebar;
export {
  stdin_default as default
};
