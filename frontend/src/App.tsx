import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Analytics from './pages/Analytics';
import CalendarPage from './pages/CalendarPage';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import ManagerAssignment from './pages/ManagerAssignment';
import { useAuth } from './hooks/useAuth';
import AIChatWidget from './components/AIChatWidget';

const AppContent = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/kanban" element={isAuthenticated ? <KanbanBoard /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />} />
        <Route path="/projects/:id" element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        
        {isManager && (
          <>
            <Route path="/recommendations" element={isAuthenticated ? <Recommendations /> : <Navigate to="/login" />} />
            <Route path="/manager" element={isAuthenticated ? <ManagerAssignment /> : <Navigate to="/login" />} />
          </>
        )}
      </Routes>
      {isAuthenticated && <AIChatWidget />}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
