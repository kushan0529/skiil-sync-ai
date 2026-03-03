import { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProjectId?: string;
}

const CreateTaskModal = ({ isOpen, onClose, onSuccess, defaultProjectId }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/tasks', formData);
      onSuccess();
      onClose();
      setFormData({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        project: defaultProjectId || '',
        assignee: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit}>
        {error && <div className="status-badge status-todo" style={{ width: '100%', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <div className="input-group">
          <label>Task Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            required 
            placeholder="e.g. Implement API"
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            rows={3}
            placeholder="Task details..."
          />
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label>Project</label>
            <select 
              value={formData.project} 
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              required
              disabled={!!defaultProjectId}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Assignee</label>
            <select 
              value={formData.assignee} 
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label>Priority</label>
            <select 
              value={formData.priority} 
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="input-group">
            <label>Deadline</label>
            <input 
              type="date" 
              value={formData.deadline} 
              onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
