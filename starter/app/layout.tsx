import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import site from '@/content/site.json'
import './globals.css'

export const metadata: Metadata = {
  title: site.title,
  description: site.tagline,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <span className="site-name">{site.title}</span>
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/about/">About</Link>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          Built with the Kodena starter template — content lives in{' '}
          <code>content/site.json</code>.
        </footer>
      </body>
    </html>
  )
}
