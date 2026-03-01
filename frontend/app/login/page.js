'use client'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    setError('');
    try {
      const resp = await axios.post('https://skill-sync-ai-rnlh.onrender.com', { email, password }); //'http://localhost:3040/api/auth/login
      localStorage.setItem('token', resp.data.token);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="auth-form card">
      <h2 className="text-center mb-4">Welcome Back</h2>
      {error && <div style={{color: 'var(--error)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
      <form onSubmit={submit}>
        <div className="input-group">
          <label className="label">Email Address</label>
          <input 
            type="email" 
            placeholder="john@example.com" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required
          />
        </div>
        
        <div className="input-group">
          <label className="label">Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
          Sign In
        </button>
      </form>
    </div>
  )
}
