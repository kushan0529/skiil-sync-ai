import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface DeadlineWarningProps {
  deadline?: string | Date;
  status?: string;
}

const DeadlineWarning: React.FC<DeadlineWarningProps> = ({ deadline, status }) => {
  if (!deadline || status === 'done' || status === 'Completed') return null;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.4rem', 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        color: 'var(--error)',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '0.2rem 0.6rem',
        borderRadius: '50px',
        width: 'fit-content'
      }}>
        <AlertCircle size={14} /> Overdue
      </div>
    );
  }

  if (diffDays <= 3) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.4rem', 
        fontSize: '0.75rem', 
        fontWeight: 700, 
        color: '#f59e0b',
        background: 'rgba(245, 158, 11, 0.1)',
        padding: '0.2rem 0.6rem',
        borderRadius: '50px',
        width: 'fit-content'
      }}>
        <Clock size={14} /> Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}
      </div>
    );
  }

  return null;
};

export default DeadlineWarning;
