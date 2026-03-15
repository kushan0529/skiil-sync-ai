import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProjects } from '../store/slices/projectSlice';
import { Users, Briefcase, Search, ArrowRight, CheckCircle2, Trash2, AlertTriangle, X, UserPlus } from 'lucide-react';
import ManagerDashboard from '../components/ManagerDashboard';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import AssignMemberModal from '../components/AssignMemberModal';

const ManagerAssignment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { projects, loading } = useSelector((state: RootState) => state.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Deletion state
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Assignment state
  const [projectToAssign, setProjectToAssign] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleAssignSuccess = (msg: string) => {
    setSuccessMessage(msg);
    dispatch(fetchProjects());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/projects/${projectToDelete._id}`);
      setSuccessMessage(`Project "${projectToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      dispatch(fetchProjects());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return <div className="p-8 text-center">You do not have permission to access this page.</div>;
  }

  return (
    <div className="fade-in" style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          <Users className="text-primary" size={36} /> Manager Assignment Hub
        </h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>High-level project management, team assignments, and resource allocation.</p>
      </div>

      {successMessage && (
        <div className="card glass fade-in" style={{ 
          background: 'rgba(22, 163, 74, 0.05)', 
          borderColor: 'var(--success)', 
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2.5rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius)',
          borderLeftWidth: '4px'
        }}>
          <CheckCircle2 size={24} />
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>{successMessage}</div>
          <button 
            onClick={() => setSuccessMessage('')} 
            style={{ marginLeft: 'auto', color: 'var(--success)', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div style={{ marginBottom: '3rem' }}>
        <ManagerDashboard onSuccess={(msg) => {
            setSuccessMessage(msg);
            dispatch(fetchProjects());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      </div>

      <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Project Inventory</h3>
            <p className="text-muted" style={{ margin: 0 }}>Overview of all active and planning projects</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter projects by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.875rem 1rem 0.875rem 3rem', width: '350px', borderRadius: '50px', border: '1px solid var(--border)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loading && projects.length === 0 ? (
             <div className="loading-spinner" style={{ margin: '4rem auto' }}></div>
          ) : filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
               <Briefcase size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.3 }} />
               <p className="text-muted" style={{ fontSize: '1.1rem' }}>No projects found matching your search.</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div 
                key={project._id} 
                className="card project-item-card" 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    background: 'var(--bg)'
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '1rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '12px',
                    color: 'var(--primary)',
                    border: '1px solid var(--border)'
                  }}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700 }}>{project.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '400px' }}>{project.description}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Team</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                         {project.members?.slice(0, 3).map((m: any, i: number) => (
                           <div key={i} style={{ 
                             width: '28px', 
                             height: '28px', 
                             borderRadius: '50%', 
                             background: 'var(--primary)', 
                             color: 'white', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center',
                             fontSize: '0.7rem',
                             border: '2px solid var(--bg)',
                             marginLeft: i > 0 ? '-8px' : '0'
                           }}>
                             {m.name?.charAt(0) || 'U'}
                           </div>
                         ))}
                         {(project.members?.length || 0) > 3 && (
                           <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', border: '2px solid var(--bg)', marginLeft: '-8px' }}>
                             +{project.members.length - 3}
                           </div>
                         )}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{project.members?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Status</div>
                    <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ padding: '0.4rem 1rem', borderRadius: '50px' }}>{project.status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/projects/${project._id}`)}
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        View Details <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                    </button>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            setProjectToAssign(project);
                            setIsAssignModalOpen(true);
                        }}
                        style={{ padding: '0.6rem 1.25rem' }}
                    >
                        <UserPlus size={18} /> Assign
                    </button>
                    <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            setProjectToDelete(project);
                            setIsDeleteModalOpen(true);
                        }}
                        style={{ padding: '0.6rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--error)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>Delete Project?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>{projectToDelete?.name}</strong>? This action will permanently remove all associated tasks and cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
                className="btn btn-outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                style={{ padding: '0.75rem 2rem' }}
            >
                Cancel
            </button>
            <button 
                className="btn btn-primary" 
                onClick={handleDeleteProject}
                disabled={deleteLoading}
                style={{ background: 'var(--error)', borderColor: 'var(--error)', padding: '0.75rem 2rem' }}
            >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {projectToAssign && (
        <AssignMemberModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setProjectToAssign(null);
          }}
          projectId={projectToAssign._id}
          currentMembers={projectToAssign.members || []}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};

export default ManagerAssignment;
