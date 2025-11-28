import './globals.css'

export const metadata = {
  title: 'SkillSync AI',
  description: 'MERN + Next.js SkillSync AI frontend'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{padding: '10px', borderBottom: '1px solid #ddd'}}>
          <h2>SkillSync AI</h2>
        </header>
        <main style={{padding: '16px'}}>{children}</main>
      </body>
    </html>
  )
}
