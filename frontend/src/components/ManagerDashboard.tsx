import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, ClipboardList, UserPlus } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import CreateTaskModal from './CreateTaskModal';

const ManagerDashboard = () => {
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
      setDevelopers(allUsers.filter((u: any) => u.role === 'developer' || u.role === 'member'));
    } catch (err) {
      console.error('Failed to fetch manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      await axios.put(`/api/tasks/${taskId}/assignee`, { userId });
      fetchData(); // Refresh
    } catch (err) {
      console.error('Failed to assign task');
    }
  };

  if (loading) return <div>Loading Manager Panel...</div>;

  return (
    <div className="card" style={{ marginBottom: '2rem', border: '2px dashed var(--primary)', background: 'rgba(99, 102, 241, 0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)' }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Manager Assignment Hub</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Assign tasks and projects to your team</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsProjectModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> New Project
          </button>
          <button onClick={() => setIsTaskModalOpen(true)} className="btn btn-outline btn-sm">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ClipboardList size={18} /> Unassigned Tasks ({unassignedTasks.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', padding: '0.25rem' }}>
            {unassignedTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>All tasks are assigned!</p>
            ) : (
              unassignedTasks.map(task => (
                <div key={task._id} className="card" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project: {task.project?.name || 'N/A'}</div>
                    </div>
                    <div className={`status-badge status-${task.priority || 'medium'}`} style={{ fontSize: '0.7rem' }}>{task.priority}</div>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select 
                      style={{ fontSize: '0.8rem', padding: '0.25rem' }}
                      onChange={(e) => e.target.value && handleAssignTask(task._id, e.target.value)}
                      value=""
                    >
                      <option value="">Assign to...</option>
                      {developers.map(dev => (
                        <option key={dev._id} value={dev._id}>{dev.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <UserPlus size={18} /> Team Availability
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', padding: '0.25rem' }}>
            {developers.map(dev => (
              <div key={dev._id} className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                    {dev.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{dev.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.role}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   {/* This would ideally show task count */}
                   <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4f46e5', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSuccess={fetchData} 
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
