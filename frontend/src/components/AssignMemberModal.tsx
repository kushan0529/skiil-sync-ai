import { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import { Users, Search, CheckCircle2 } from 'lucide-react';

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: any[];
  onSuccess: (message: string) => void;
}

const AssignMemberModal = ({ isOpen, onClose, projectId, currentMembers, onSuccess }: AssignMemberModalProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedMembers(currentMembers.map(m => typeof m === 'string' ? m : m._id));
    }
  }, [isOpen, currentMembers]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.put(`/api/projects/${projectId}`, { members: selectedMembers });
      onSuccess('Team members updated successfully');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update members');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Team Members">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div className="status-badge status-todo" style={{ width: '100%', padding: '0.75rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem', width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '0.75rem 0.75rem 0.75rem 2.75rem' }}
          />
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', padding: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredUsers.map(user => (
              <div 
                key={user._id} 
                onClick={() => toggleMember(user._id)}
                style={{ 
                  padding: '0.75rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  cursor: 'pointer',
                  background: selectedMembers.includes(user._id) ? 'var(--primary)' : 'var(--bg)',
                  color: selectedMembers.includes(user._id) ? 'white' : 'inherit',
                  borderRadius: 'var(--radius)',
                  transition: 'all 0.2s',
                  border: `1px solid ${selectedMembers.includes(user._id) ? 'var(--primary)' : 'var(--border)'}`
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: selectedMembers.includes(user._id) ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user.role}</div>
                </div>
                {selectedMembers.includes(user._id) && <CheckCircle2 size={18} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
          <button 
            onClick={handleAssign} 
            className="btn btn-primary" 
            disabled={loading}
            style={{ padding: '0.75rem 2rem' }}
          >
            {loading ? 'Updating...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignMemberModal;
