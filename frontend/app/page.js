import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h1>Welcome to SkillSync AI</h1>
      <p>This is a demo frontend. Use the API endpoints at /api/* on the backend.</p>
      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/projects">Projects</Link></li>
      </ul>
    </div>
  )
}
