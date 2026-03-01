'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path) => pathname === path;

  return (
    <nav className="nav-links">
      <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
        Home
      </Link>
      <Link href="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
        Projects
      </Link>
      <Link href="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
        Login
      </Link>
    </nav>
  )
}
