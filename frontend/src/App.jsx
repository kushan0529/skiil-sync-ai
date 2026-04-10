import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import CalendarPage from "./pages/CalendarPage";
import ProjectDetails from "./pages/ProjectDetails";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import ManagerAssignment from "./pages/ManagerAssignment";
import MemberAssignmentDetail from "./pages/MemberAssignmentDetail";
import Projects from "./pages/Projects";
import AIChatWidget from "./components/AIChatWidget";
const AppContent = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg)" }}><div className="loading-spinner" /></div>;
  }
  const isManager = user?.role === "manager" || user?.role === "admin";
  const loginRedirect = <Navigate to="/login" state={{ from: location }} replace />;

  return <Layout><Routes><Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} /><Route path="/register" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} /><Route path="/" element={isAuthenticated ? <Dashboard /> : loginRedirect} /><Route path="/projects" element={isAuthenticated ? <Projects /> : loginRedirect} /><Route path="/projects/:id" element={isAuthenticated ? <ProjectDetails /> : loginRedirect} /><Route path="/kanban" element={isAuthenticated ? <KanbanBoard /> : loginRedirect} /><Route path="/calendar" element={isAuthenticated ? <CalendarPage /> : loginRedirect} /><Route path="/profile" element={isAuthenticated ? <Profile /> : loginRedirect} />{isManager && <><Route path="/recommendations" element={isAuthenticated ? <Recommendations /> : loginRedirect} /><Route path="/manager" element={isAuthenticated ? <ManagerAssignment /> : loginRedirect} /><Route path="/manager/assign/:userId" element={isAuthenticated ? <MemberAssignmentDetail /> : loginRedirect} /></>}<Route path="*" element={<Navigate to="/" replace />} /></Routes>{isAuthenticated && <AIChatWidget />}</Layout>;
};
function App() {
  return <ThemeProvider><AuthProvider><Router><AppContent /></Router></AuthProvider></ThemeProvider>;
}
export default App;
