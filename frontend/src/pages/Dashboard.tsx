import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchAllTasks, updateTask } from '../store/slices/taskSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { Plus, Briefcase, CheckCircle2, Clock, Users, ArrowRight, Activity, Calendar, ListTodo, AlertCircle, Send, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Modal from '../components/Modal';
import { Sparkles } from 'lucide-react';
import DeadlineWarning from '../components/DeadlineWarning';


const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  
  const { projects, loading: projectsLoading } = useSelector((state: RootState) => state.projects);
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  const { users } = useSelector((state: RootState) => state.users);

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });

  // Modal State for Work Logs
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [logContent, setLogContent] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchAllTasks());
    if (user?.role === 'manager' || user?.role === 'admin') {
      dispatch(fetchUsers());
    }
  }, [dispatch, user]);

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const loading = projectsLoading || tasksLoading;

  // Filter projects and tasks for the user
  const myProjects = projects.filter(p => p.members?.some((m: any) => (m?._id || m) === user?._id) || (p.owner?._id || p.owner) === user?._id);
  const allProjects = projects;
  
  const userTasks = isManager
    ? tasks
    : tasks.filter(t => (t.assignee?._id || t.assignee) === user?._id);

  useEffect(() => {
    // For regular users, team members are the unique set of people they work with across all projects
    const relevantTeamMembers = isManager 
      ? users.length 
      : new Set(myProjects.flatMap(p => p.members?.map((m: any) => m?._id || m) || [])).size;

    setStats({
      totalProjects: myProjects.length,
      activeTasks: userTasks.filter((t: any) => t.status !== 'done').length,
      completedTasks: userTasks.filter((t: any) => t.status === 'done').length,
      teamMembers: relevantTeamMembers || 0
    });
  }, [myProjects, userTasks, users, isManager]);

  const taskStats = [
    { name: 'To Do', value: userTasks.filter((t: any) => t.status === 'todo').length, color: '#94a3b8' },
    { name: 'In Progress', value: userTasks.filter((t: any) => t.status === 'in-progress').length, color: '#6366f1' },
    { name: 'Completed', value: userTasks.filter((t: any) => t.status === 'done').length, color: '#16a34a' }
  ].filter(s => s.value > 0);

  const projectData = myProjects.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 12) + '...' : p.name,
    progress: p.progress || 0
  })).slice(0, 5);

  if (loading && projects.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  const recentMyProjects = myProjects.slice(0, 3);
  const recentGlobalProjects = allProjects.filter(p => !myProjects.some(mp => mp._id === p._id)).slice(0, 3);
  const displayTasks = userTasks.slice(0, 5);


  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    dispatch(updateTask({ taskId, taskData: { status: newStatus } }));
  };

  const openWorkLogModal = (taskId: string) => {
    setActiveTaskId(taskId);
    setIsLogModalOpen(true);
  };

  const submitWorkLog = () => {
    if (activeTaskId && logContent.trim()) {
      const taskToUpdate = tasks.find(t => t._id === activeTaskId);
      if (!taskToUpdate) return;

      const newLog = { content: logContent.trim(), date: new Date().toISOString() };
      const updatedWorkLogs = [...(taskToUpdate.workLogs || []), newLog];

      dispatch(updateTask({ 
        taskId: activeTaskId, 
        taskData: { workLogs: updatedWorkLogs } 
      }));
      setLogContent('');
      setIsLogModalOpen(false);
      setActiveTaskId(null);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={16} />
            <span>Workspace Overview</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>Hello, {user?.name?.split(' ')[0] || 'User'}! You have {stats.activeTasks} pending tasks today.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div style={{ textAlign: 'right', display: 'none' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SYSTEM STATUS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700 }}>
                 <div style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%' }} />
                 AI CORE SYNCED
              </div>
           </div>
        </div>
      </div>

      {isManager && (
        <div className="card" style={{ 
          marginBottom: '2.5rem', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(129, 140, 248, 0.05))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '20px',
          boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)' }}>
               <Users size={28} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700 }}>Manager Assignment Hub</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Assign tasks, monitor team performance, and manage project workflows.</p>
            </div>
          </div>
          <Link to="/manager" className="btn btn-primary" style={{ padding: '0.875rem 1.75rem', borderRadius: '12px' }}>
            Open Manager Hub <ChevronRight size={20} style={{ marginLeft: '0.25rem' }} />
          </Link>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ border: 'none', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Briefcase size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'rgba(22, 163, 74, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>+12%</span>
          </div>
          <h3 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>{stats.totalProjects}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isManager ? 'Active Projects' : 'Assigned Projects'}</p>
        </div>

        <div className="card" style={{ border: 'none', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
          </div>
          <h3 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>{stats.activeTasks}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Tasks</p>
        </div>

        <div className="card" style={{ border: 'none', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(22, 163, 74, 0.1)', borderRadius: '10px', color: '#16a34a' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <h3 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>{stats.completedTasks}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</p>
        </div>

        <div className="card" style={{ border: 'none', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Users size={22} />
            </div>
          </div>
          <h3 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', fontWeight: 800 }}>{stats.teamMembers}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team Network</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Projects Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Active Projects</h3>
              <Link to="/projects" className="btn btn-outline btn-sm" style={{ fontWeight: 700, borderRadius: '8px' }}>View All</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {recentMyProjects.length > 0 ? (
                recentMyProjects.map((project) => (
                  <div key={project._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Briefcase size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>{project.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '120px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${project.progress || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{project.progress || 0}% Complete</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.25rem 0.75rem' }}>{project.status}</span>
                        <DeadlineWarning deadline={project.deadline} status={project.status} />
                      </div>
                      <Link to={`/projects/${project._id}`} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', transition: 'all 0.2s' }} className="hover-primary">
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', background: 'transparent' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No projects assigned to you yet.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Explore Global Projects</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentGlobalProjects.length > 0 ? (
                recentGlobalProjects.map((project) => (
                  <div key={project._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)', opacity: 0.8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Briefcase size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>{project.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open for viewing</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.25rem 0.75rem' }}>{project.status}</span>
                      <Link to={`/projects/${project._id}`} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                   All current projects are in your list.
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{isManager ? 'Global Tasks' : 'My Current Tasks'}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {displayTasks.length > 0 ? (
                displayTasks.map((task) => (
                  <div key={task._id} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', color: 'var(--primary)' }}>
                          <ListTodo size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>{task.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <Briefcase size={12} />
                            <span>{task.project?.name || 'Unassigned Project'}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <select 
                          className={`status-badge status-${task.status.toLowerCase()}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none', fontWeight: 700, padding: '0.4rem 1rem' }}
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                          disabled={isManager}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <DeadlineWarning deadline={task.deadline} status={task.status} />
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                      {task.description || 'No detailed description provided for this task.'}
                    </p>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                        <span>Progress</span>
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${task.progress || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                      </div>
                    </div>

                    {/* Work Logs Section */}
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Activity size={14} />
                        Recent Activity
                      </p>
                      {task.workLogs && task.workLogs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {task.workLogs.slice(-2).reverse().map((log: any, i: number) => (
                            <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-main)', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                              {log.content}
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
                                {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>No progress updates logged yet.</p>
                      )}
                      
                      {!isManager && (
                        <button 
                          onClick={() => openWorkLogModal(task._id)}
                          style={{ marginTop: '1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--primary)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', transition: 'all 0.2s' }}
                          className="hover-primary-bg"
                        >
                          <Plus size={16} /> Add Progress Update
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={15} />
                          {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={15} />
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      {isManager && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                            {task.assignee?.name?.charAt(0) || '?'}
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', background: 'transparent' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 1.25rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>No active tasks found in your workspace.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Work Distribution</h3>
            <div className="card" style={{ padding: '2rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Task Status Distribution</h4>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStats}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {taskStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Project Velocity</h3>
            <div className="card" style={{ padding: '2rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Completion percentage</h4>
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectData} layout="vertical" margin={{ left: -20, right: 30 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" fontSize={11} width={100} tick={{ fill: 'var(--text-muted)', fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="progress" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Log Modal */}
      <Modal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        title="Add Progress Update"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              What did you accomplish on this task?
            </label>
            <textarea 
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="E.g., Implemented the user authentication flow and fixed login bug..."
              style={{ 
                width: '100%', 
                minHeight: '120px', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border)', 
                background: 'var(--bg)', 
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setIsLogModalOpen(false)}
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Cancel
            </button>
            <button 
              onClick={submitWorkLog}
              disabled={!logContent.trim()}
              className="btn btn-primary"
              style={{ flex: 2, padding: '0.75rem', opacity: logContent.trim() ? 1 : 0.6 }}
            >
              Post Update <Send size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .hover-primary:hover {
          background: var(--primary) !important;
          color: white !important;
          transform: translateX(3px);
        }
        .hover-primary-bg:hover {
          background: rgba(99, 102, 241, 0.1) !important;
          border-style: solid !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
