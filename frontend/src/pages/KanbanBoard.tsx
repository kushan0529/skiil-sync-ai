import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, MoreVertical, Calendar } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  priority: string;
}

const columns = {
  'Todo': { title: 'To Do', color: 'var(--text-muted)' },
  'In Progress': { title: 'In Progress', color: 'var(--primary)' },
  'Review': { title: 'Review', color: '#d97706' }, // amber-600
  'Completed': { title: 'Done', color: 'var(--success)' }
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // In a real app, you might want to fetch all tasks or tasks for a specific project
      // For now, let's fetch tasks for the first available project or all tasks if possible
      // Since our API is project-centric, let's assume we fetch tasks for "all projects" or similar
      // For demo, we might need to iterate projects or just mock if endpoint is missing.
      // But we have /api/tasks/project/:id.
      // Let's first fetch projects, then fetch tasks for the first project as a default.
      
      const projectRes = await axios.get('/api/projects');
      const projects = projectRes.data.projects || [];
      
      if (projects.length > 0) {
        const tasksRes = await axios.get(`/api/tasks/project/${projects[0]._id}`);
        setTasks(tasksRes.data);
      } else {
        setTasks([]);
      }
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

  if (loading) return <div className="loading-spinner"></div>;

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Kanban Board</h1>
          <p>Drag and drop tasks to update progress</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', overflowX: 'auto', paddingBottom: '2rem' }}>
          {Object.entries(columns).map(([statusKey, config]) => (
            <div key={statusKey} style={{ minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: config.color }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color }}></div>
                  {config.title}
                  <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                    {getTasksByStatus(statusKey).length}
                  </span>
                </h3>
                <button style={{ color: 'var(--text-muted)' }}><Plus size={16} /></button>
              </div>

              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver ? 'var(--bg-secondary)' : 'transparent',
                      borderRadius: 'var(--radius)',
                      minHeight: '500px',
                      transition: 'background 0.2s'
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
                              padding: '1rem',
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: task.priority === 'high' ? 'var(--error)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {task.priority}
                              </span>
                              <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={16} /></button>
                            </div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{task.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                              <Calendar size={14} />
                              {new Date(task.deadline).toLocaleDateString()}
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
    </div>
  );
};

export default KanbanBoard;
