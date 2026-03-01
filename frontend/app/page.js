import Link from 'next/link';

export default function Home() {
  return (
    <div className="hero">
      <h1>Welcome to SkillSync AI</h1>
      <p>
        Accelerate your career with AI-powered skill synchronization. 
        Connect, learn, and grow with our intelligent platform.
      </p>
      
      <div className="flex-center" style={{ gap: '1rem' }}>
        <Link href="/login" className="btn btn-primary">
          Get Started
        </Link>
        <Link href="/projects" className="btn btn-secondary">
          View Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 mt-8 text-left">
        <div className="card">
          <h3>AI Analysis</h3>
          <p>Get personalized skill gap analysis powered by advanced AI algorithms.</p>
        </div>
        <div className="card">
          <h3>Project Matching</h3>
          <p>Find projects that perfectly match your current skill level and goals.</p>
        </div>
        <div className="card">
          <h3>Career Growth</h3>
          <p>Track your progress and unlock new career opportunities.</p>
        </div>
      </div>
    </div>
  );
}
