import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProjectById, clearCurrentProject, updateProject } from '../store/slices/projectSlice';
import { fetchTasksByProjectId, updateTask, deleteTask, updateTaskProgressInState } from '../store/slices/taskSlice';
import { ArrowLeft, CheckCircle2, Circle, Clock, MoreVertical, Plus, UserPlus, Calendar, Sparkles, Trash2 } from 'lucide-react';
import AssignMemberModal from '../components/AssignMemberModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import DeadlineWarning from '../components/DeadlineWarning';

const socket = io(import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4040' : window.location.origin), {
  reconnectionAttempts: 5,
  transports: ['polling', 'websocket'], // Prioritize polling for Vercel compatibility
  timeout: 10000,
});

const ProjectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  
  const { currentProject: project, loading: projectLoading } = useSelector((state: RootState) => state.projects);
  const { projectTasks: tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleTaskSuccess = (msg: string) => {
    setSuccessMsg(msg);
    if (id) dispatch(fetchTasksByProjectId(id));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleTaskCompletion = async (task: any) => {
    const isNowDone = task.status !== 'done';
    const newStatus = isNowDone ? 'done' : 'todo';
    const newProgress = isNowDone ? 100 : 0;

    if (!id) return;

    // Optimistic update for task status and progress
    dispatch(updateTaskProgressInState({ taskId: task._id, progress: newProgress, status: newStatus }));

    try {
      await dispatch(updateTask({ 
        taskId: task._id, 
        taskData: { status: newStatus, progress: newProgress } 
      }));
      
      // Calculate project progress
      const otherTasks = tasks.filter(t => t && t._id !== task._id);
      const allTasks = [...otherTasks, { ...task, status: newStatus }];
      const completedCount = allTasks.filter(t => t && t.status === 'done').length;
      const totalCount = allTasks.length;
      const projectProgress = Math.round((completedCount / totalCount) * 100);

      dispatch(updateProject({ 
        id, 
        projectData: { progress: projectProgress } 
      }));
    } catch (err) {
      console.error('Failed to toggle task completion');
    }
  };

  const handleTaskProgressChange = (taskId: string, newProgress: number) => {
    let newStatus = 'todo';
    if (newProgress === 100) newStatus = 'done';
    else if (newProgress > 0) newStatus = 'in-progress';

    // Optimistic update
    dispatch(updateTaskProgressInState({ taskId, progress: newProgress, status: newStatus }));

    dispatch(updateTask({ 
      taskId, 
      taskData: { progress: newProgress, status: newStatus } 
    }));
  };

  const handleProjectProgressChange = (newProgress: number) => {
    if (id) {
      dispatch(updateProject({ id, projectData: { progress: newProgress } }));
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasksByProjectId(id));

      socket.emit('joinProject', id);
      
      socket.on('taskUpdate', () => {
        dispatch(fetchTasksByProjectId(id));
      });

      socket.on('projectUpdate', () => {
        dispatch(fetchProjectById(id));
      });
    }
    return () => {
      if (id) {
        socket.emit('leaveProject', id);
        socket.off('taskUpdate');
        socket.off('projectUpdate');
      }
      dispatch(clearCurrentProject());
    };
  }, [id, dispatch]);

  const handleAssignSuccess = (msg: string) => {
    setSuccessMsg(msg);
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasksByProjectId(id));
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteTaskAction = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskTitle}"?`)) {
      try {
        await dispatch(deleteTask(taskId));
        setSuccessMsg(`Task "${taskTitle}" deleted successfully.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err) {
        console.error('Failed to delete task');
      }
    }
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isMember = project?.members?.some((m: any) => (m._id || m) === user?._id) || project?.owner === user?._id || (project?.owner?._id === user?._id);
  const canModify = isManager || isMember;
  const loading = projectLoading || tasksLoading;

  if (loading && !project) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
        <div className="loading-spinner"></div>
    </div>
  );
  
  if (!project && !loading) return (
    <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
        <h2>Project not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        {successMsg && (
          <div className="status-badge status-active" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', justifyContent: 'center', fontSize: '1rem' }}>
            {successMsg}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{project?.name}</h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', fontSize: '1.1rem', lineHeight: 1.6 }}>{project?.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {canModify && (
              <>
                <button className="btn btn-outline" style={{ background: 'var(--bg)' }} onClick={() => setIsAssignModalOpen(true)}>
                  <UserPlus size={18} /> Manage Team
                </button>
                <button className="btn btn-primary" onClick={() => setIsCreateTaskModalOpen(true)}>
                  <Plus size={18} /> New Task
                </button>
              </>
            )}
            {!canModify && (
              <div className="status-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <Clock size={16} /> View-only Mode
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Work Items</h2>
              <span className="status-badge status-planning" style={{ fontSize: '0.8rem' }}>{tasks.length} Total Tasks</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border)', boxShadow: 'none', opacity: canModify ? 1 : 0.85 }}>
                    <button 
                      onClick={() => canModify && toggleTaskCompletion(task)}
                      disabled={!canModify}
                      style={{ color: task.status === 'done' ? 'var(--success)' : 'var(--text-muted)', background: 'transparent', transition: 'transform 0.2s', cursor: canModify ? 'pointer' : 'default' }} 
                      className={canModify ? "hover-scale" : ""}
                    >
                      {task.status === 'done' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h4 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: 600, 
                          marginBottom: '0.4rem', 
                          textDecoration: task.status === 'done' ? 'line-through' : 'none', 
                          color: task.status === 'done' ? 'var(--text-muted)' : 'inherit' 
                        }}>
                          {task.title}
                        </h4>
                        {task.progress >= 75 && task.progress < 100 && (
                          <span className="status-badge status-active" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>High Progress</span>
                        )}
                        {task.progress === 100 && (
                          <span className="status-badge status-active" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--success)', color: 'white' }}>
                            <CheckCircle2 size={12} style={{ marginRight: '0.2rem' }} /> Completed
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} />
                          Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                           <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: (task.preference || (task as any).priority) === 'high' ? 'var(--error)' : (task.preference || (task as any).priority) === 'medium' ? 'var(--primary)' : 'var(--success)' }}></span>
                           Priority: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{task.preference || (task as any).priority}</span>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                           <UserPlus size={14} />
                           Assignee: <span style={{ fontWeight: 600 }}>{task.assignee?.name || 'Unassigned'}</span>
                        </span>
                      </div>
                      <DeadlineWarning deadline={task.deadline} status={task.status} />
                      <div style={{ maxWidth: '200px', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                          <span>Progress</span>
                          <span>{task.progress || 0}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                          <div style={{ width: `${task.progress || 0}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                        </div>
                        {canModify && (isManager || (task.assignee?._id || task.assignee) === user?._id) && (
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={task.progress || 0} 
                            onChange={(e) => handleTaskProgressChange(task._id, parseInt(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                        )}
                      </div>
                    </div>
                    {isManager && canModify && (
                      <button 
                        onClick={() => handleDeleteTaskAction(task._id, task.title)}
                        style={{ color: 'var(--error)', background: 'transparent', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
                        title="Delete Task"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button style={{ color: 'var(--text-muted)', background: 'transparent', cursor: canModify ? 'pointer' : 'default' }}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>This project currently has no active tasks.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setIsCreateTaskModalOpen(true)}>Create First Task</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card-no-hover" style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Project Control</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Overall Progress</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '10px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${project?.progress || 0}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '40px' }}>{project?.progress || 0}%</span>
                  </div>
                  {canModify && (
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={project?.progress || 0} 
                      onChange={(e) => handleProjectProgressChange(parseInt(e.target.value))}
                      style={{ width: '100%', marginTop: '0.75rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  )}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Current Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`status-badge status-${project?.status?.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1.25rem' }}>{project?.status}</span>
                    <DeadlineWarning deadline={project?.deadline} status={project?.status} />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '1rem', letterSpacing: '0.05em' }}>Team Members ({project?.members?.length || 0})</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {project?.members && project.members.length > 0 ? (
                      project.members.map((member: any) => (
                        <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                            {member.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{member.role}</div>
                          </div>
                          {member.skills && member.skills.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                               <span title={member.skills.join(', ')} style={{ cursor: 'help' }}>
                                 <Sparkles size={14} style={{ color: 'var(--primary)', opacity: 0.7 }} />
                               </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>No members assigned yet.</div>
                    )}
                  </div>
                </div>
                
                <div className="grid-1" style={{ gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Timeline</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                <Calendar size={18} className="text-primary" />
                                <span>Starts: {project?.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
                                <Clock size={18} className="text-error" />
                                <span>Ends: {project?.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Not set'}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                    <Sparkles size={64} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <Sparkles size={18} /> SkillSync Insights
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Based on project requirements, we recommend assigning a <strong>Frontend Lead</strong> with React expertise.
                </p>
                <Link to="/manager" className="btn btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>
                  Open Assignment Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {project && (
        <AssignMemberModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          projectId={id || ''}
          currentMembers={project.members || []}
          requiredSkills={project.requiredSkills || []}
          onSuccess={handleAssignSuccess}
        />
      )}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={handleTaskSuccess}
        defaultProjectId={id}
      />
    </div>
  );
};

export default ProjectDetails;
