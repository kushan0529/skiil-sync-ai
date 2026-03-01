'use client'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:3040/api/projects', 
        { name, description }, 
        { headers: { Authorization: 'Bearer '+token } }
      );
      router.push('/projects');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }

  return (
    <div className="card auth-form">
      <h2 className="text-center mb-4">Create New Project</h2>
      <form onSubmit={submit}>
        <div className="input-group">
          <label className="label">Project Name</label>
          <input 
            placeholder="My Awesome Project" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            required 
          />
        </div>
        
        <div className="input-group">
          <label className="label">Description</label>
          <textarea 
            placeholder="Describe your project goals..." 
            value={description} 
            onChange={e=>setDescription(e.target.value)} 
            rows={4}
          />
        </div>
        
        <div className="flex-center" style={{gap: '1rem'}}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => router.back()}
            style={{flex: 1}}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{flex: 1}}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
