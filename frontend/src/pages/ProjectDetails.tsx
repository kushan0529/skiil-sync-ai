import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Circle, Clock, MoreVertical, Plus, UserPlus } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  deadline: string;
}

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/tasks/project/${id}`)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) return <div>Loading project details...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>{project.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline">
              <UserPlus size={18} />
              Invite
            </button>
            <button className="btn btn-primary">
              <Plus size={18} />
              New Task
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Project Tasks</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tasks.length} tasks</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task._id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'box-shadow 0.2s' }}>
                  <button style={{ color: task.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)', background: 'transparent' }}>
                    {task.status === 'Completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? 'var(--text-muted)' : 'inherit' }}>
                      {task.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                      <span style={{ textTransform: 'capitalize' }}>Priority: {task.priority}</span>
                    </div>
                  </div>
                  <button style={{ color: 'var(--text-muted)', background: 'transparent' }}>
                    <MoreVertical size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No tasks yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: '84px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Status</label>
                <span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status}</span>
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Deadline</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Clock size={16} color="var(--text-muted)" />
                  {new Date(project.deadline).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>AI Insights</h4>
                <div style={{ background: 'linear-gradient(to bottom right, #eff6ff, #fdf4ff)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #dbeafe' }}>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: 500 }}>Smart Match</p>
                  <p style={{ fontSize: '0.75rem', color: '#1e40af', opacity: 0.8 }}>
                    Upload your resume to see which tasks match your skills perfectly.
                  </p>
                  <Link to="/profile" className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}>
                    Setup Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
