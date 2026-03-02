import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import axios from 'axios';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Mock fetching tasks for now, replace with actual API call
      // Fetch all tasks from all projects (or specific user tasks)
      const projectRes = await axios.get('/api/projects');
      const projects = projectRes.data.projects || [];
      
      let allTasks: any[] = [];
      if (projects.length > 0) {
        // Fetch tasks for first project as example
        const tasksRes = await axios.get(`/api/tasks/project/${projects[0]._id}`);
        allTasks = tasksRes.data;
      }
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to fetch tasks for calendar');
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.deadline), day));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Smart Calendar</h1>
          <p>Schedule and deadline management</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={prevMonth} className="btn btn-outline" style={{ padding: '0.5rem' }}><ChevronLeft size={20} /></button>
          <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth} className="btn btn-outline" style={{ padding: '0.5rem' }}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '600px', alignContent: 'start' }}>
          {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
             <div key={`empty-${i}`} style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} />
          ))}
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div 
                key={day.toISOString()} 
                style={{ 
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)',
                  padding: '1rem',
                  background: isSameDay(day, new Date()) ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  fontWeight: 600, 
                  marginBottom: '0.5rem', 
                  color: isSameDay(day, new Date()) ? 'var(--primary)' : 'var(--text-main)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  {format(day, 'd')}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dayTasks.map(task => (
                    <div 
                      key={task._id} 
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.5rem', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: '4px',
                        borderLeft: `3px solid ${task.status === 'Completed' ? 'var(--success)' : 'var(--primary)'}`,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}>.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
