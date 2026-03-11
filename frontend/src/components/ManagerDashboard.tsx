import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, ClipboardList, UserPlus, Zap } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import CreateTaskModal from './CreateTaskModal';

interface ManagerDashboardProps {
  onSuccess?: (msg: string) => void;
}

const ManagerDashboard = ({ onSuccess }: ManagerDashboardProps) => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [unassignedTasks, setUnassignedTasks] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/users')
      ]);
      
      const allTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      setUnassignedTasks(allTasks.filter((t: any) => !t.assignee));
      
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      setDevelopers(allUsers.filter((u: any) => u.role === 'developer' || u.role === 'member' || u.role === 'user'));
    } catch (err) {
      console.error('Failed to fetch manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      await axios.put(`/api/tasks/${taskId}/assignee`, { userId });
      fetchData(); 
      if (onSuccess) onSuccess('Task successfully assigned to team member.');
    } catch (err) {
      console.error('Failed to assign task');
    }
  };

  const handleProjectSuccess = (msg: string) => {
    fetchData();
    if (onSuccess) onSuccess(msg);
  };

  if (loading) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Synchronizing management data...</p>
    </div>
  );

  return (
    <div className="card glass" style={{ 
        padding: '2rem', 
        border: '1px solid var(--primary)', 
        background: 'rgba(99, 102, 241, 0.03)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            padding: '0.875rem', 
            background: 'var(--primary)', 
            color: 'white', 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <Zap size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Quick Management Actions</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', color: 'var(--text-muted)' }}>Allocate resources and initialize new workstreams</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setIsProjectModalOpen(true)} 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <Plus size={20} /> Create Project
          </button>
          <button 
            onClick={() => setIsTaskModalOpen(true)} 
            className="btn btn-outline"
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, background: 'var(--bg)' }}
          >
            <Plus size={20} /> Create Task
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.125rem', fontWeight: 700 }}>
            <ClipboardList size={20} className="text-primary" /> 
            Backlog: Unassigned Tasks 
            <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.6rem', borderRadius: '50px', marginLeft: '0.5rem' }}>
                {unassignedTasks.length}
            </span>
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            maxHeight: '380px', 
            overflowY: 'auto', 
            padding: '0.5rem',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)'
          }}>
            {unassignedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                <Users size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Great job! No unassigned tasks.</p>
              </div>
            ) : (
              unassignedTasks.map(task => (
                <div key={task._id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)', boxShadow: 'none', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{task.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Briefcase size={12} /> {task.project?.name || 'Independent Task'}
                      </div>
                    </div>
                    <span className={`status-badge status-${task.priority || 'medium'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                        {task.priority}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        Assign Contributor
                    </label>
                    <select 
                      style={{ width: '100%', padding: '0.6rem', fontSize: '0.875rem', borderRadius: '8px' }}
                      onChange={(e) => e.target.value && handleAssignTask(task._id, e.target.value)}
                      value=""
                    >
                      <option value="">Select from available members...</option>
                      {developers.map(dev => (
                        <option key={dev._id} value={dev._id}>{dev.name} ({dev.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '1.125rem', fontWeight: 700 }}>
            <UserPlus size={20} className="text-primary" /> 
            Talent Pool Availability
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            maxHeight: '380px', 
            overflowY: 'auto', 
            padding: '0.5rem'
          }}>
            {developers.map(dev => (
              <div key={dev._id} className="card" style={{ 
                padding: '1rem 1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid var(--border)',
                boxShadow: 'none',
                background: 'var(--bg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1rem', 
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                  }}>
                    {dev.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{dev.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dev.role}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span style={{ 
                       fontSize: '0.75rem', 
                       background: 'rgba(22, 163, 74, 0.1)', 
                       color: 'var(--success)', 
                       padding: '0.3rem 0.75rem', 
                       borderRadius: '50px',
                       fontWeight: 600,
                       border: '1px solid rgba(22, 163, 74, 0.2)'
                    }}>
                        Available
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSuccess={handleProjectSuccess} 
      />
      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

export default ManagerDashboard;
