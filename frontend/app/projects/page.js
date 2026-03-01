'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    async function load(){
      const token = localStorage.getItem('token');
      if(!token) {
        setLoading(false);
        return;
      }
      try {
        const resp = await axios.get('https://skill-sync-ai-rnlh.onrender.com', { headers: { Authorization: 'Bearer '+token } });
        //https://skill-sync-ai-rnlh.onrender.com,http://localhost:3040/api/projects
        setProjects(resp.data.projects || []);
      } catch(err){ console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading projects...</div>;
  }

  return (
    <div>
      <div className="flex-center" style={{justifyContent: 'space-between', marginBottom: '2rem'}}>
        <h2>Your Projects</h2>
        <Link href="/projects/new" className="btn btn-primary">
          + New Project
        </Link>
      </div>
      
      {projects.length === 0 ? (
        <div className="card text-center" style={{padding: '4rem'}}>
          <h3>No projects found</h3>
          <p>Get started by creating your first project.</p>
          <Link href="/projects/new" className="btn btn-primary mt-4">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => (
            <div key={p._id} className="card">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="mt-4" style={{display: 'flex', gap: '0.5rem'}}>
                <span style={{fontSize: '0.8rem', background: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '4px'}}>
                  {p.status || 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
