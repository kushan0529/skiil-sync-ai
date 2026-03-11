import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Star, Check, AlertCircle, Search, Sparkles } from 'lucide-react';

interface RecommendedProject {
  project: {
    _id: string;
    name: string;
    description: string;
    requiredSkills: string[];
  };
  score: number;
  reason: string;
}

interface Developer {
  _id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
}

const Recommendations = () => {
  const [users, setUsers] = useState<Developer[]>([]);
  const [selectedUser, setSelectedUser] = useState<Developer | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      // Only show members for recommendation
      setUsers(res.data.filter((u: Developer) => u.role === 'member'));
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setFetchingUsers(false);
    }
  };

  const fetchRecommendations = async (userId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/projects/recommend/${userId}`);
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: Developer) => {
    setSelectedUser(user);
    fetchRecommendations(user._id);
  };

  const assignProject = async (projectId: string) => {
    if (!selectedUser) return;
    try {
      await axios.put(`/api/projects/${projectId}`, {
        $addToSet: { members: selectedUser._id }
      });
      alert(`Successfully assigned ${selectedUser.name} to the project!`);
    } catch (err) {
      alert('Failed to assign project');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={28} color="var(--primary)" />
          AI Project Matchmaker
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Find the perfect project for your team members using AI skill analysis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} />
              Team Members
            </h3>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {fetchingUsers ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div 
                  key={user._id} 
                  onClick={() => handleUserSelect(user)}
                  style={{ 
                    padding: '1rem 1.25rem', 
                    cursor: 'pointer', 
                    borderBottom: '1px solid var(--border)',
                    background: selectedUser?._id === user._id ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                    borderLeft: selectedUser?._id === user._id ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user.email}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {user.skills && user.skills.slice(0, 3).map(skill => (
                      <span key={skill} style={{ fontSize: '0.65rem', background: 'var(--bg)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }}>{skill}</span>
                    ))}
                    {user.skills && user.skills.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{user.skills.length - 3} more</span>}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</div>
            )}
          </div>
        </div>

        <div>
          {selectedUser ? (
            <div>
              <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Recommendations for {selectedUser.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                      Based on skills: {selectedUser.skills && selectedUser.skills.length > 0 ? selectedUser.skills.join(', ') : 'None identified yet'}
                    </p>
                  </div>
                  <button onClick={() => fetchRecommendations(selectedUser._id)} className="btn btn-outline btn-sm">
                    Refresh AI
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p style={{ color: 'var(--text-muted)' }}>AI is analyzing projects and skills...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recommendations.map((rec) => (
                    <div key={rec.project._id} className="card" style={{ borderLeft: `4px solid ${rec.score > 0.8 ? '#16a34a' : '#eab308'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{rec.project.name}</h4>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            {rec.project.requiredSkills.map(skill => (
                              <span key={skill} style={{ 
                                fontSize: '0.7rem', 
                                background: selectedUser.skills.includes(skill) ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-secondary)', 
                                color: selectedUser.skills.includes(skill) ? '#16a34a' : 'var(--text-muted)',
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '9999px',
                                border: '1px solid currentColor',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                {selectedUser.skills.includes(skill) && <Check size={10} />}
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: rec.score > 0.8 ? '#16a34a' : '#eab308' }}>{Math.round(rec.score * 100)}%</div>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Match</div>
                        </div>
                      </div>
                      
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{rec.project.description}</p>
                      
                      <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px dashed rgba(99, 102, 241, 0.2)', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <Star size={16} color="var(--primary)" style={{ marginTop: '0.1rem' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>AI Insight:</span> {rec.reason}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => assignProject(rec.project._id)} className="btn btn-primary">
                          Assign to Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h3>No Recommendations Found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>We couldn't find any planning-stage projects that match this user's skills.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border)', background: 'transparent' }}>
              <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
              <h3>Select a Team Member</h3>
              <p>Choose a developer from the left to see AI-powered project recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
