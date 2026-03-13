import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, MoreVertical, Calendar, Briefcase } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  priority: string;
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
                            {...provided.dragHandleProps}
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
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <span className={`status-badge status-${task.priority}`} style={{ fontSize: '0.65rem' }}>
                                {task.priority}
                              </span>
                              <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={16} /></button>
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 }}>{task.title}</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Briefcase size={14} />
                                    <span style={{ fontWeight: 500 }}>{task.project?.name || 'Independent'}</span>
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
