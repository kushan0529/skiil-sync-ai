import { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import { PlusCircle, Trash2, Calendar, Users, FileText, Type, X } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    deadline: '',
    members: [] as string[],
    requiredSkills: [] as string[],
    tasks: [] as { title: string; description: string; deadline: string }[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [users, setUsers] = useState([]);
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
      // Backend returns { users: [...] }
      setUsers(Array.isArray(res.data.users) ? res.data.users : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, requiredSkills: [...prev.requiredSkills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, requiredSkills: prev.requiredSkills.filter(s => s !== skill) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/projects', formData);
      onSuccess(res.data.message || 'Project created successfully');
      onClose();
      setFormData({ 
        name: '', 
        description: '', 
        startDate: '', 
        deadline: '', 
        members: [], 
        requiredSkills: [],
        tasks: [] 
      });
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

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { title: '', description: '', deadline: '' }]
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const updateTask = (index: number, field: string, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setFormData(prev => ({ ...prev, tasks: newTasks }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure New Project">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div className="status-badge status-todo" style={{ width: '100%', padding: '0.75rem', textAlign: 'center', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Type size={16} /> Project Name
            </label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="e.g. Enterprise Cloud Migration"
              style={{ padding: '0.75rem' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <FileText size={16} /> Description
            </label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              rows={3}
              placeholder="High-level project goals and technical scope..."
              style={{ padding: '0.75rem', resize: 'none' }}
            />
          </div>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
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

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <PlusCircle size={16} /> Required Skills
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)} 
                placeholder="e.g. React, Python..."
                style={{ padding: '0.75rem', flex: 1 }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" onClick={addSkill} className="btn btn-outline">Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.requiredSkills.map(skill => (
                <span key={skill} className="status-badge" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {skill}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
                </span>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              <Users size={16} /> Assign Team Members
            </label>
            <div style={{ 
              maxHeight: '160px', 
              overflowY: 'auto', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '0.5rem',
              background: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {users.map(user => (
                  <div 
                    key={user._id} 
                    onClick={() => toggleMember(user._id)}
                    style={{ 
                      padding: '0.6rem 0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      cursor: 'pointer',
                      background: formData.members.includes(user._id) ? 'var(--primary)' : 'var(--bg)',
                      color: formData.members.includes(user._id) ? 'white' : 'inherit',
                      borderRadius: 'var(--radius)',
                      transition: 'all 0.2s',
                      border: `1px solid ${formData.members.includes(user._id) ? 'var(--primary)' : 'var(--border)'}`
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={formData.members.includes(user._id)} 
                      readOnly 
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{user.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(99, 102, 241, 0.03)', borderRadius: 'var(--radius)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} /> Initial Project Tasks
            </h4>
            <button 
              type="button" 
              onClick={addTask} 
              className="btn btn-outline btn-sm"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              Add New Task
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
            {formData.tasks.map((task, index) => (
              <div key={index} className="card" style={{ padding: '1rem', position: 'relative', background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'none' }}>
                <button 
                  type="button" 
                  onClick={() => removeTask(index)}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--error)', padding: '0.25rem' }}
                >
                  <Trash2 size={16} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input 
                    type="text" 
                    placeholder="Task title (e.g. Set up CI/CD)" 
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    required
                    style={{ fontSize: '0.9rem', padding: '0.6rem' }}
                  />
                  <div className="grid-2" style={{ gap: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} className="text-muted" />
                        <input 
                          type="date" 
                          value={task.deadline}
                          onChange={(e) => updateTask(index, 'deadline', e.target.value)}
                          required
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        />
                     </div>
                  </div>
                </div>
              </div>
            ))}
            {formData.tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No tasks defined. You can add them later or now.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2.5rem', fontSize: '1rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
            {loading ? 'Initializing Project...' : 'Create & Launch Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
