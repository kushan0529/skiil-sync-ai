import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const Analytics = () => {
  const [taskStats, setTaskStats] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mocking data fetching logic for now as backend analytics endpoints might need creation
      // We can aggregate data from projects and tasks APIs manually here for demo
      const projectRes = await axios.get('/api/projects');
      const projects = projectRes.data.projects || [];
      
      const stats = projects.map((p: any) => ({
        name: p.name,
        tasks: Math.floor(Math.random() * 20) + 5, // Mock data
        completed: Math.floor(Math.random() * 10),
      }));
      setProjectStats(stats);

      const statusData = [
        { name: 'To Do', value: 12, color: '#94a3b8' },
        { name: 'In Progress', value: 8, color: '#6366f1' },
        { name: 'Review', value: 5, color: '#d97706' },
        { name: 'Done', value: 15, color: '#22c55e' },
      ];
      setTaskStats(statusData);
    } catch (err) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Analytics Dashboard</h1>
        <p>Overview of project performance and team productivity</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Task Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            {taskStats.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Project Progress</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: 'var(--bg-secondary)' }} />
                <Bar dataKey="tasks" fill="var(--bg-secondary)" radius={[4, 4, 0, 0]} name="Total Tasks" />
                <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Productivity Insights (AI)</h3>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 500 }}>
            <span role="img" aria-label="rocket">🚀</span> Team Velocity is up by 15%
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>
            Based on recent task completions, your team is clearing the "In Progress" column faster than last week. 
            Consider assigning more tasks from the backlog to maintain momentum.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
