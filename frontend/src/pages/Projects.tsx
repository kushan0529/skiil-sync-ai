import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProjects } from '../store/slices/projectSlice';
import axios from 'axios';
import { Briefcase, Search, ArrowRight, Plus, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal';

const Projects = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { projects, loading } = useSelector((state: RootState) => state.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSuccess = (msg: string) => {
    setSuccessMessage(msg);
    dispatch(fetchProjects());
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  if (loading && projects.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Project Portfolio</h1>
          <p className="text-muted">Manage and track all your ongoing initiatives.</p>
        </div>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      {successMessage && (
        <div className="card glass mb-8" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'var(--success)', color: 'var(--success)' }}>
          {successMessage}
        </div>
      )}

      <div className="card mb-8">
        <div className="flex-between flex-wrap gap-4">
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '3rem', width: '100%', borderRadius: '50px' }}
            />
          </div>
          <div className="flex gap-4">
            <select className="btn btn-outline" style={{ borderRadius: '50px' }}>
              <option>All Status</option>
              <option>Planning</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid-1" style={{ gap: '1.5rem' }}>
        {filteredProjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
            <Briefcase size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
            <h3>No projects found</h3>
            <p className="text-muted">Try a different search term or create a new project.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{project.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{project.description}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No date'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Users size={14} />
                      {project.members && project.members.length > 0 
                        ? project.members.map((m: any) => (typeof m === 'object' ? m.name : 'User')).filter(Boolean).join(', ') 
                        : 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status}</span>
                <Link to={`/projects/${project._id}`} className="btn btn-outline btn-sm">
                  View <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Projects;
