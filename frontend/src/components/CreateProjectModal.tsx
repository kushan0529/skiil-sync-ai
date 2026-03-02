import { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    members: [] as string[]
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/projects', formData);
      onSuccess();
      onClose();
      setFormData({ name: '', description: '', deadline: '', members: [] });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit}>
        {error && <div className="status-badge status-todo" style={{ width: '100%', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <div className="input-group">
          <label>Project Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
            placeholder="e.g. Website Redesign"
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            rows={3}
            placeholder="Project goals and scope..."
          />
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

        <div className="input-group">
          <label>Assign Members</label>
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem' }}>
            {users.map(user => (
              <div 
                key={user._id} 
                onClick={() => toggleMember(user._id)}
                style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  background: formData.members.includes(user._id) ? 'var(--bg-secondary)' : 'transparent',
                  borderRadius: '4px'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={formData.members.includes(user._id)} 
                  readOnly 
                  style={{ width: 'auto' }}
                />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email} ({user.role})</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
