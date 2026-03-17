import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, User, CheckCircle2 } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Determine initial mode based on path
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
    setError('');
    setSuccess('');
  }, [location.pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', { name, email, password, role });
      
      if (role === 'manager') {
        setSuccess('Manager account created! Pending admin approval.');
        setTimeout(() => setIsLogin(true), 4000);
      } else {
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.15), transparent), #0f172a',
      padding: '2rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        background: 'rgba(30, 41, 59, 0.7)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '28px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Element */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, var(--primary), #a855f7)',
          filter: 'blur(60px)',
          opacity: 0.2,
          zIndex: 0
        }} />

        {/* Sliding Toggle Bar */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.5)', 
          borderRadius: '16px', 
          padding: '4px', 
          display: 'flex', 
          marginBottom: '2.5rem',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            position: 'absolute',
            left: isLogin ? '4px' : '50%',
            width: 'calc(50% - 4px)',
            height: 'calc(100% - 8px)',
            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
            borderRadius: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }} />
          <button 
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            style={{ 
              flex: 1, 
              padding: '12px', 
              border: 'none', 
              background: 'transparent', 
              color: isLogin ? 'white' : 'rgba(255,255,255,0.5)', 
              fontWeight: 700, 
              zIndex: 1, 
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            style={{ 
              flex: 1, 
              padding: '12px', 
              border: 'none', 
              background: 'transparent', 
              color: !isLogin ? 'white' : 'rgba(255,255,255,0.5)', 
              fontWeight: 700, 
              zIndex: 1, 
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            Register
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
            {isLogin ? 'Access your SkillSync dashboard' : 'Join our professional talent network'}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div className="fade-in" style={{ 
              padding: '0.875rem', 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#fca5a5', 
              borderRadius: '12px', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success && (
            <div className="fade-in" style={{ 
              padding: '0.875rem', 
              background: 'rgba(34, 197, 94, 0.15)', 
              color: '#86efac', 
              borderRadius: '12px', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ 
                  width: '100%', padding: '12px 12px 12px 2.75rem', background: 'rgba(15, 23, 42, 0.3)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none'
                }} 
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', padding: '12px 12px 12px 2.75rem', background: 'rgba(15, 23, 42, 0.3)', 
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none'
              }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', padding: '12px 12px 12px 2.75rem', background: 'rgba(15, 23, 42, 0.3)', 
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none'
              }} 
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px', background: 'rgba(15, 23, 42, 0.3)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none',
                  appearance: 'none', cursor: 'pointer'
                }}
              >
                <option value="member" style={{ background: '#1e293b' }}>Developer Member</option>
                <option value="manager" style={{ background: '#1e293b' }}>Project Manager</option>
                <option value="admin" style={{ background: '#1e293b' }}>Administrator</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--primary), #a855f7)', 
              border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '0.5rem', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
