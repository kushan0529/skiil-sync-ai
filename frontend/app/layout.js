import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'SkillSync AI',
  description: 'MERN + Next.js SkillSync AI frontend'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="main-layout">
        <header className="site-header">
          <div className="container header-content">
            <a href="/" className="brand">SkillSync AI</a>
            <Navbar />
          </div>
        </header>
        <main className="container mt-8">
          {children}
        </main>
      </body>
    </html>
  );
}
