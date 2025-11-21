'use client'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    try {
      const resp = await axios.post('http://localhost:3040/api/auth/login', { email, password });
      localStorage.setItem('token', resp.data.token);
      alert('Logged in');
      router.push('/');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  )
}
