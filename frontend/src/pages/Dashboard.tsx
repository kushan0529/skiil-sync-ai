import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Briefcase, CheckCircle2, Clock, Users, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ManagerDashboard from '../components/ManagerDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks'), // We need a list tasks endpoint
        axios.get('/api/users')
      ]);
      
      const projects = projectsRes.data.projects || [];
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      
      setStats({
        totalProjects: projects.length,
        activeTasks: tasks.filter((t: any) => t.status !== 'done').length,
        completedTasks: tasks.filter((t: any) => t.status === 'done').length,
        teamMembers: users.length
      });

      setRecentProjects(projects.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data');
      // Set some defaults so it doesn't break
      setStats(prev => ({ ...prev }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}! Here's what's happening today.</p>
        </div>
      </div>

      {(user?.role === 'manager' || user?.role === 'admin') && <ManagerDashboard />}

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
              <Briefcase size={24} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>+2 this week</span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.totalProjects}</h3>
          <p style={{ margin: 0 }}>Active Projects</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 'var(--radius)', color: '#ef4444' }}>
              <Clock size={24} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--error)', fontWeight: 600 }}>Due soon</span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.activeTasks}</h3>
          <p style={{ margin: 0 }}>Pending Tasks</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: 'var(--radius)', color: '#16a34a' }}>
              <CheckCircle2 size={24} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>+15%</span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.completedTasks}</h3>
          <p style={{ margin: 0 }}>Completed</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: 'var(--radius)', color: '#4f46e5' }}>
              <Users size={24} />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active</span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.teamMembers}</h3>
          <p style={{ margin: 0 }}>Team Members</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Recent Projects</h3>
            <Link to="/projects" className="btn btn-outline btn-sm">View All</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentProjects.map((project) => (
              <div key={project._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{project.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>{project.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <Link to={`/projects/${project._id}`} className="btn btn-outline btn-sm" style={{ padding: '0.5rem' }}>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Activity Feed</h3>
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Today</h4>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ marginTop: '0.25rem', color: 'var(--primary)' }}><Activity size={16} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <span style={{ fontWeight: 600 }}>Sarah</span> completed task <span style={{ fontWeight: 600 }}>"API Integration"</span>
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 hours ago</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ marginTop: '0.25rem', color: 'var(--success)' }}><CheckCircle2 size={16} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Project <span style={{ fontWeight: 600 }}>"Website Redesign"</span> marked as done
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5 hours ago</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ marginTop: '0.25rem', color: 'var(--primary)' }}><Plus size={16} /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    New member <span style={{ fontWeight: 600 }}>Mike</span> joined the team
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
