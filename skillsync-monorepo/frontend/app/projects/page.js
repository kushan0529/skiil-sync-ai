'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(()=> {
    async function load(){
      const token = localStorage.getItem('token');
      if(!token) return;
      try {
        const resp = await axios.get('http://localhost:3040/api/projects', { headers: { Authorization: 'Bearer '+token } });
        setProjects(resp.data.projects || []);
      } catch(err){ console.error(err); }
    }
    load();
  }, []);

  return (
    <div>
      <h2>Your Projects</h2>
      <ul>
        {projects.map(p => <li key={p._id}>{p.name} - {p.description}</li>)}
      </ul>
    </div>
  )
}
