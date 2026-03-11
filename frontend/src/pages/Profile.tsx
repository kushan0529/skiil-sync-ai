import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Shield, Upload, FileText, Check, Loader2, Sparkles } from 'lucide-react';

const SkillOverlay = ({ skills }: { skills: string[] }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <Sparkles size={64} color="var(--primary)" style={{ marginBottom: '2rem', animation: 'bounce 2s infinite' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }}>Skills Identified!</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', maxWidth: '1000px' }}>
        {skills.map((skill, i) => (
          <div 
            key={skill} 
            style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              padding: '1rem 2rem', 
              background: 'var(--primary)', 
              borderRadius: '1rem',
              animation: `fadeIn 0.5s ease-out forwards ${i * 0.1}s`,
              opacity: 0,
              boxShadow: '0 0 20px var(--primary)'
            }}
          >
            {skill}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '3rem', fontSize: '1.5rem', opacity: 0.8 }}>AI is matching you with the perfect project...</p>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSkills, setShowSkills] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setMessage('Analyzing your resume with AI...');
    setUploadProgress(20);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 800);

      const res = await axios.post('/api/users/upload-resume', formData);
      clearInterval(interval);
      setUploadProgress(100);
      
      const skills = res.data.user.skills || [];
      setExtractedSkills(skills);
      setUser(res.data.user);
      
      if (skills.length > 0) {
        setShowSkills(true);
        
        // Call AI assignment in background
        try {
          const assignRes = await axios.post('/api/projects/assign-best');
          const assignedProjectId = assignRes.data.project?._id;
          
          setTimeout(() => {
            setShowSkills(false);
            if (assignedProjectId) {
              navigate(`/projects/${assignedProjectId}`);
            } else {
              navigate('/');
            }
          }, 2500); // 2.5 seconds total to show skills
        } catch (err) {
          console.error('Project assignment failed', err);
          setTimeout(() => {
            setShowSkills(false);
            navigate('/');
          }, 2000);
        }
      } else {
        setMessage('Resume uploaded but no skills identified.');
        setTimeout(() => setUploading(false), 2000);
      }
    } catch (err) {
      setMessage('Failed to upload and analyze resume');
      setUploadProgress(0);
      setUploading(false);
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {showSkills && <SkillOverlay skills={extractedSkills} />}
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Profile Settings</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} />
            Personal Info
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                {user.name}
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Mail size={16} color="var(--text-muted)" />
                {user.email}
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Account Role</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Shield size={16} color="var(--text-muted)" />
                <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} />
            Resume & Skills
          </h3>
          
          <form onSubmit={handleUpload}>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
              <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Upload your resume (PDF) to enable AI skill matching
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
            
            {message && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: message.includes('success') ? 'var(--success)' : (message.includes('Analyzing') ? 'var(--primary)' : 'var(--error)'), marginBottom: '0.5rem' }}>
                  {message}
                </p>
                {uploading && (
                  <div style={{ width: '100%', background: 'var(--bg-secondary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.3s ease' }}></div>
                  </div>
                )}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : 'Upload Resume'}
            </button>
          </form>

          {user.skills && user.skills.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Identified Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.skills.map((skill: string) => (
                  <span key={skill} style={{ background: 'var(--bg)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={12} color="var(--success)" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
