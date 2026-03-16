import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, MoreVertical, Calendar, Briefcase, UserPlus, GripVertical } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import { useAuth } from '../context/AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  priority: string;
  progress?: number;
  assignee?: {
    _id: string;
    name: string;
  };
  project?: {
    name: string;
  };
}

const columns = {
  'todo': { title: 'To Do', color: 'var(--text-muted)' },
  'in-progress': { title: 'In Progress', color: 'var(--primary)' },
  'done': { title: 'Done', color: 'var(--success)' }
};

const KanbanBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksRes = await axios.get('/api/tasks');
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (err) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    // Optimistic Update
    const newStatus = destination.droppableId;
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await axios.put(`/api/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status');
      // Revert on error
      fetchTasks();
    }
  };

  const handleProgressChange = async (taskId: string, newProgress: number) => {
    // Optimistic Update
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { 
        ...t, 
        progress: newProgress, 
        status: newProgress === 100 ? 'done' : (newProgress > 0 && t.status === 'todo' ? 'in-progress' : t.status) 
      } : t
    );
    setTasks(updatedTasks);

    try {
      const payload: any = { progress: newProgress };
      const currentTask = tasks.find(t => t._id === taskId);
      if (newProgress === 100) payload.status = 'done';
      else if (newProgress > 0 && currentTask?.status === 'todo') payload.status = 'in-progress';
      else if (newProgress === 0 && currentTask?.status === 'in-progress') payload.status = 'todo';
      
      await axios.put(`/api/tasks/${taskId}`, payload);
    } catch (err) {
      console.error('Failed to update task progress');
      fetchTasks();
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Kanban Board</h1>
          <p className="text-muted">Orchestrate your workflow with drag-and-drop precision.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={20} /> New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem' }}>
          {Object.entries(columns).map(([statusKey, config]) => (
            <div key={statusKey} style={{ minWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: config.color, fontWeight: 700 }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: config.color, boxShadow: `0 0 10px ${config.color}44` }}></div>
                  {config.title}
                  <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '0.2rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem' }}>
                    {getTasksByStatus(statusKey).length}
                  </span>
                </h3>
              </div>

              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-secondary)',
                      borderRadius: 'var(--radius)',
                      minHeight: '600px',
                      padding: '1rem',
                      transition: 'all 0.2s ease',
                      border: snapshot.isDraggingOver ? '2px dashed var(--primary)' : '2px solid transparent'
                    }}
                  >
                    {getTasksByStatus(statusKey).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="card"
                            style={{
                              marginBottom: '1rem',
                              padding: '1.25rem',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'none',
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.9 : 1,
                              transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div {...provided.dragHandleProps} style={{ color: 'var(--text-muted)', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                                  <GripVertical size={18} />
                                </div>
                                <span className={`status-badge status-${task.priority}`} style={{ fontSize: '0.65rem' }}>
                                  {task.priority}
                                </span>
                              </div>
                              <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={16} /></button>
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 }}>{task.title}</h4>
                            
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                                <span>Progress</span>
                                <span>{task.progress || 0}%</span>
                              </div>
                              <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                <div style={{ width: `${task.progress || 0}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                              </div>
                              {(user?.role === 'manager' || user?.role === 'admin' || task.assignee?._id === user?._id) && (
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={task.progress || 0} 
                                  onChange={(e) => handleProgressChange(task._id, parseInt(e.target.value))}
                                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                />

                              )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Briefcase size={14} />
                                    <span style={{ fontWeight: 500 }}>{task.project?.name || 'Independent'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <UserPlus size={14} />
                                    <span>{task.assignee?.name || 'Unassigned'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={14} />
                                    <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTasks()}
      />
    </div>
  );
};

export default KanbanBoard;
