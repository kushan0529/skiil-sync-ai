'use client'
import Link from 'next/link';

export default function Navbar(){
  return (
    <nav style={{display:'flex', gap:12}}>
      <Link href='/'>Home</Link>
      <Link href='/projects'>Projects</Link>
    </nav>
  )
}
