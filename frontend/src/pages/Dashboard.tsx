import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Briefcase, CheckCircle2, Clock, Users, ArrowRight, Activity, Calendar, ListTodo, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const endpoints = [
        axios.get('/api/projects'),
        axios.get('/api/tasks'),
      ];
      
      // Only managers/admins can list all users
      if (user?.role === 'manager' || user?.role === 'admin') {
        endpoints.push(axios.get('/api/users'));
      }

      const results = await Promise.all(endpoints);
      
      const projects = results[0].data.projects || [];
      const fetchedTasks = Array.isArray(results[1].data) ? results[1].data : [];
      const users = results[2]?.data || [];
      
      setStats({
        totalProjects: projects.length,
        activeTasks: fetchedTasks.filter((t: any) => t.status !== 'done').length,
        completedTasks: fetchedTasks.filter((t: any) => t.status === 'done').length,
        teamMembers: users.length || 0
      });

      setRecentProjects(projects.slice(0, 3));
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
      setStats(prev => ({ ...prev }));
    } finally {
      setLoading(false);
    }
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}! Here's what's happening today.</p>
        </div>
      </div>

      {isManager && (
        <div className="card glass" style={{ marginBottom: '2rem', border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Manager Assignment Hub</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>You have manager access. Assign tasks and manage project teams.</p>
          </div>
          <Link to="/manager" className="btn btn-primary">
            Open Manager Hub <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
              <Briefcase size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.totalProjects}</h3>
          <p style={{ margin: 0 }}>{isManager ? 'Active Projects' : 'My Projects'}</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 'var(--radius)', color: '#ef4444' }}>
              <Clock size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.activeTasks}</h3>
          <p style={{ margin: 0 }}>{isManager ? 'Pending Tasks' : 'My Active Tasks'}</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: 'var(--radius)', color: '#16a34a' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.completedTasks}</h3>
          <p style={{ margin: 0 }}>Completed</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: 'var(--radius)', color: '#4f46e5' }}>
              <Users size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stats.teamMembers}</h3>
          <p style={{ margin: 0 }}>{isManager ? 'Team Members' : 'Colleagues'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Projects Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{isManager ? 'Recent Projects' : 'My Projects'}</h3>
              <Link to="/projects" className="btn btn-outline btn-sm">View All</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
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
                          Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                      <Link to={`/projects/${project._id}`} className="btn btn-outline btn-sm" style={{ padding: '0.5rem' }}>
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <Briefcase size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No projects assigned yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{isManager ? 'Global Tasks' : 'My Tasks'}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
                          <ListTodo size={18} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', marginBottom: '0.125rem' }}>{task.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Project: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{task.project?.name || 'Unassigned'}</span>
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select 
                          className={`status-badge status-${task.status.toLowerCase()}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                          value={task.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await axios.put(`/api/tasks/${task._id}`, { status: newStatus });
                              fetchDashboardData();
                            } catch (err) {
                              console.error('Failed to update status');
                            }
                          }}
                          disabled={isManager} // Managers view is read-only here for brevity
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                      {task.description || 'No description provided.'}
                    </p>

                    {/* Work Logs / What he did */}
                    <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Activity size={12} />
                        Work Activity:
                      </p>
                      {task.workLogs && task.workLogs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {task.workLogs.slice(-2).map((log: any, i: number) => (
                            <div key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-main)', padding: '0.625rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
                              {log.content}
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No progress logged for this task yet.</p>
                      )}
                      
                      {!isManager && (
                        <button 
                          onClick={() => {
                            const content = prompt('What did you do today on this task?');
                            if (content) {
                              axios.put(`/api/tasks/${task._id}`, { 
                                $push: { workLogs: { content, date: new Date() } } 
                              }).then(() => fetchDashboardData());
                            }
                          }}
                          style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Plus size={14} /> Add Progress Update
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} />
                          Start: {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} />
                          Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      {isManager && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Assignee: <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{task.assignee?.name || 'None'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', background: 'transparent' }}>
                  <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No tasks assigned to you yet.</p>
                </div>
              )}
            </div>
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
