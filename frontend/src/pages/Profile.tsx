import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Upload, FileText, Check } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

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
    try {
      const res = await axios.post('/api/users/upload-resume', formData);
      setMessage('Resume uploaded successfully!');
      setUser(res.data.user);
    } catch (err) {
      setMessage('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                {user.username}
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
            
            {message && <p style={{ fontSize: '0.875rem', color: message.includes('success') ? 'var(--success)' : 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{message}</p>}
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
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
