import { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import { Type, FileText, Briefcase, User, Flag, Calendar } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  defaultProjectId?: string;
}

const CreateTaskModal = ({ isOpen, onClose, onSuccess, defaultProjectId }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    deadline: '',
    priority: 'medium',
    project: defaultProjectId || '',
    assignee: ''
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (defaultProjectId) {
        setFormData(prev => ({ ...prev, project: defaultProjectId }));
      }
    }
  }, [isOpen, defaultProjectId]);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/users')
      ]);
      setProjects(projectsRes.data.projects || []);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project) {
      setError('Please select a project to associate this task with.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/tasks', formData);
      onSuccess('New task successfully created and queued.');
      onClose();
      setFormData({
        title: '',
        description: '',
        startDate: '',
        deadline: '',
        priority: 'medium',
        project: defaultProjectId || '',
        assignee: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Define New Task">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div className="status-badge status-todo" style={{ width: '100%', padding: '0.75rem', textAlign: 'center', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Type size={16} /> Task Title
            </label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              placeholder="e.g. Design System Implementation"
              style={{ padding: '0.75rem' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <FileText size={16} /> Task Description
            </label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              rows={3}
              placeholder="Provide detailed context for this task..."
              style={{ padding: '0.75rem', resize: 'none' }}
            />
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Briefcase size={16} /> Project
              </label>
              <select 
                value={formData.project} 
                onChange={(e) => setFormData({...formData, project: e.target.value})}
                required
                disabled={!!defaultProjectId}
                style={{ padding: '0.75rem' }}
              >
                <option value="">Select Target Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <User size={16} /> Assignee
              </label>
              <select 
                value={formData.assignee} 
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                style={{ padding: '0.75rem' }}
              >
                <option value="">Leave Unassigned (Backlog)</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-3" style={{ gap: '1.25rem' }}>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Flag size={16} /> Priority
              </label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                style={{ padding: '0.75rem' }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Calendar size={16} /> Start Date
              </label>
              <input 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                required
                style={{ padding: '0.75rem' }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <Calendar size={16} /> Deadline
              </label>
              <input 
                type="date" 
                value={formData.deadline} 
                onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                required
                style={{ padding: '0.75rem' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
            {loading ? 'Initializing Task...' : 'Confirm Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
