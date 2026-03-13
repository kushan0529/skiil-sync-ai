import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Circle, Clock, MoreVertical, Plus, UserPlus, Calendar, Sparkles, Trash2 } from 'lucide-react';
import AssignMemberModal from '../components/AssignMemberModal';
import { useAuth } from '../context/AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  startDate?: string;
  deadline: string;
  members: any[];
}

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/tasks/project/${id}`)
      ]);
      setProject(projectRes.data.project || projectRes.data);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (err) {
      console.error('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = (msg: string) => {
    setSuccessMsg(msg);
    fetchData();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskTitle}"?`)) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        setSuccessMsg(`Task "${taskTitle}" deleted successfully.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err) {
        console.error('Failed to delete task');
      }
    }
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
        <div className="loading-spinner"></div>
    </div>
  );
  
  if (!project) return (
    <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>Project not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        {successMsg && (
          <div className="status-badge status-active" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', justifyContent: 'center', fontSize: '1rem' }}>
            {successMsg}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', fontSize: '1.1rem', lineHeight: 1.6 }}>{project.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ background: 'var(--bg)' }} onClick={() => setIsAssignModalOpen(true)}>
              <UserPlus size={18} /> Manage Team
            </button>
            <button className="btn btn-primary">
              <Plus size={18} /> New Task
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Work Items</h2>
              <span className="status-badge status-planning" style={{ fontSize: '0.8rem' }}>{tasks.length} Total Tasks</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <button style={{ color: task.status === 'done' ? 'var(--success)' : 'var(--text-muted)', background: 'transparent', transition: 'transform 0.2s' }} className="hover-scale">
                      {task.status === 'done' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 600, 
                        marginBottom: '0.4rem', 
                        textDecoration: task.status === 'done' ? 'line-through' : 'none', 
                        color: task.status === 'done' ? 'var(--text-muted)' : 'inherit' 
                      }}>
                        {task.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} />
                          Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: task.priority === 'high' ? 'var(--error)' : task.priority === 'medium' ? 'var(--primary)' : 'var(--success)' }}></span>
                           Priority: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{task.priority}</span>
                        </span>
                      </div>
                    </div>
                    {isManager && (
                      <button 
                        onClick={() => handleDeleteTask(task._id, task.title)}
                        style={{ color: 'var(--error)', background: 'transparent', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
                        title="Delete Task"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button style={{ color: 'var(--text-muted)', background: 'transparent' }}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>This project currently has no active tasks.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>Create First Task</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card-no-hover" style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Project Control</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Current Status</label>
                  <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1.25rem' }}>{project.status}</span>
                </div>
                
                <div className="grid-1" style={{ gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Timeline</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                <Calendar size={18} className="text-primary" />
                                <span>Starts: {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                <Clock size={18} className="text-error" />
                                <span>Ends: {new Date(project.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                    <Sparkles size={64} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <Sparkles size={18} /> SkillSync Insights
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Based on project requirements, we recommend assigning a <strong>Frontend Lead</strong> with React expertise.
                </p>
                <Link to="/manager" className="btn btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>
                  Open Assignment Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AssignMemberModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        projectId={id || ''}
        currentMembers={project.members || []}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default ProjectDetails;
