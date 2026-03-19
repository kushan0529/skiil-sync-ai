import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchAllTasks } from '../store/slices/taskSlice';

const CalendarPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      (task.startDate && isSameDay(new Date(task.startDate), day)) || 
      (task.deadline && isSameDay(new Date(task.deadline), day))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'var(--success)';
      case 'in-progress': return 'var(--primary)';
      case 'todo': return 'var(--text-muted)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Smart Calendar</h1>
          <p className="text-muted">Schedule and deadline management</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={prevMonth} className="btn btn-outline" style={{ padding: '0.5rem' }}><ChevronLeft size={20} /></button>
          <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center', fontWeight: 700 }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth} className="btn btn-outline" style={{ padding: '0.5rem' }}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ padding: '1.25rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '600px', alignContent: 'start' }}>
          {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
             <div key={`empty-${i}`} style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', opacity: 0.3 }} />
          ))}
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div 
                key={day.toISOString()} 
                style={{ 
                  borderRight: (i + 1 + startOfMonth(currentDate).getDay()) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)',
                  padding: '1rem',
                  background: isToday ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  position: 'relative',
                  minHeight: '120px'
                }}
              >
                <div style={{ 
                  fontWeight: 700, 
                  marginBottom: '0.75rem', 
                  color: isToday ? 'var(--primary)' : 'var(--text-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1rem'
                }}>
                  <span style={{ 
                    background: isToday ? 'var(--primary)' : 'transparent', 
                    color: isToday ? 'white' : 'inherit',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {dayTasks.map(task => (
                    <div 
                      key={task._id} 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.35rem 0.6rem', 
                        background: 'var(--bg)', 
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        borderLeft: `4px solid ${getStatusColor(task.status)}`,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'transform 0.1s ease'
                      }}
                      title={`${task.title} (${task.status})`}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {task.title}
                    </div>
                  ))}
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
