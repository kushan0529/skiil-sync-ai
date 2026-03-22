import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Shield, Upload, FileText, Check, Loader2, Sparkles, Briefcase, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const MemberAssignmentDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchMember();
  }, [userId]);

  const fetchMember = async () => {
    try {
      const res = await axios.get('/api/users');
      // Backend returns { users: [...] }
      const allUsers = Array.isArray(res.data.users) ? res.data.users : Array.isArray(res.data) ? res.data : [];
      const found = allUsers.find((u: any) => u._id === userId);
      if (found) {
        setMember(found);
      } else {
        setMessage('Member not found');
      }
    } catch (err) {
      console.error('Failed to fetch member');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);

    setUploading(true);
    setMessage('Analyzing resume with AI...');
    setRecommendations([]); // Clear old recs

    try {
      const res = await axios.post('/api/users/upload-resume', formData);
      setMember(res.data.user);
      setMessage('Resume parsed successfully! Finding best project matches...');
      
      // Get recommendations
      fetchRecommendations();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to upload and analyze resume';
      setMessage(errMsg);
      setUploading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await axios.get(`/api/projects/recommend/${userId}`);
      setRecommendations(res.data.recommendations || []);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to fetch recommendations';
      setMessage(errMsg);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
      setUploading(false);
    }
  };

  const handleAssign = async (projectId: string) => {
    setAssigning(true);
    try {
      // In this specific workflow, we might want to just assign to the recommended one
      // The backend has assignToBestProject, but here we want to pick one
      await axios.put(`/api/projects/${projectId}`, { 
        $addToSet: { members: userId } 
      });
      
      const projectName = recommendations.find(r => r.project._id === projectId)?.project.name || 'Project';
      setMessage(`The project "${projectName}" has been successfully assigned to ${member?.name}.`);
      
      setTimeout(() => navigate('/manager'), 3000);
    } catch (err) {
      setMessage('Failed to assign member');
    } finally {
      setAssigning(false);
    }
  };

  if (!member && !message) return <div className="loading-spinner"></div>;

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/manager')} className="btn btn-outline btn-sm">
          Back to Hub
        </button>
        <h1 style={{ margin: 0 }}>Member Assignment: {member?.name}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <User size={20} className="text-primary" /> Member Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Email</label>
                <div style={{ fontWeight: 500 }}>{member?.email}</div>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Current Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {member?.skills?.length > 0 ? (
                    member.skills.map((s: string) => (
                      <span key={s} className="status-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)' }}>{s}</span>
                    ))
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>No skills identified yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <FileText size={20} className="text-primary" /> Upload Resume
            </h3>
            <form onSubmit={handleUpload}>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
                <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Upload PDF to parse skills for {member?.name}
                </p>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  accept=".pdf"
                  style={{ display: 'none' }}
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  {file ? file.name : 'Select File'}
                </label>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!file || uploading}
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Parse Resume & Suggest'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card" style={{ height: '100%', minHeight: '500px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Sparkles size={20} style={{ color: '#f59e0b' }} /> AI Recommendations
            </h3>

            {message && (
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {message.includes('success') ? <CheckCircle2 color="var(--success)" size={20} /> : <AlertCircle color="var(--primary)" size={20} />}
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
              </div>
            )}

            {loadingRecs ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <Loader2 size={40} className="animate-spin text-primary" style={{ margin: '0 auto 1rem' }} />
                <p>AI is analyzing skill-project compatibility...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recommendations.map((rec, i) => {
                  const projectSkills = rec.project.requiredSkills || [];
                  const memberSkills = member?.skills || [];
                  
                  return (
                    <div key={i} className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', color: 'var(--primary)' }}>
                            <Briefcase size={18} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0 }}>{rec.project.name}</h4>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                              Match Score: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{Math.round(rec.score * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAssign(rec.project._id)}
                          disabled={assigning}
                        >
                          {assigning ? 'Assigning...' : 'Confirm to Assign'}
                        </button>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Skills Required / Matched</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {projectSkills.map((ps: string) => {
                            const isMatch = memberSkills.some((ms: string) => ms.toLowerCase() === ps.toLowerCase());
                            return (
                              <span 
                                key={ps} 
                                className="status-badge" 
                                style={{ 
                                  background: isMatch ? 'var(--success)' : 'white', 
                                  color: isMatch ? 'white' : 'var(--text-main)',
                                  border: isMatch ? 'none' : '1px solid var(--border)',
                                  fontWeight: isMatch ? 700 : 400
                                }}
                              >
                                {ps}
                                {isMatch && <Check size={12} style={{ marginLeft: '4px', display: 'inline' }} />}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: 0, lineBreak: 'anywhere' }}>
                        <strong>AI Logic:</strong> {rec.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <Sparkles size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                <p>Upload a resume to see AI-driven assignment suggestions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAssignmentDetail;
