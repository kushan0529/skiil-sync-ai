import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join SkillSync today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="status-badge status-todo" style={{ width: '100%', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="John Doe"
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="name@company.com"
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Role</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="member">Member / Developer</option>
              <option value="manager">Project Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Create Account
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
