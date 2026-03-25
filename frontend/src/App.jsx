import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg)" }}><div className="loading-spinner" /></div>;
  }
  const isManager = user?.role === "manager" || user?.role === "admin";
  return <Layout><Routes><Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} /><Route path="/register" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} /><Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} /><Route path="/projects" element={isAuthenticated ? <Projects /> : <Navigate to="/login" />} /><Route path="/projects/:id" element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" />} /><Route path="/kanban" element={isAuthenticated ? <KanbanBoard /> : <Navigate to="/login" />} /><Route path="/calendar" element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />} /><Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />{isManager && <><Route path="/recommendations" element={isAuthenticated ? <Recommendations /> : <Navigate to="/login" />} /><Route path="/manager" element={isAuthenticated ? <ManagerAssignment /> : <Navigate to="/login" />} /><Route path="/manager/assign/:userId" element={isAuthenticated ? <MemberAssignmentDetail /> : <Navigate to="/login" />} /></>}<Route path="*" element={<Navigate to="/" replace />} /></Routes>{isAuthenticated && <AIChatWidget />}</Layout>;
};
function App() {
  return <ThemeProvider><AuthProvider><Router><AppContent /></Router></AuthProvider></ThemeProvider>;
}
var stdin_default = App;
export {
  stdin_default as default
};
