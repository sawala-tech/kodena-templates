import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { JetBrains_Mono, Pixelify_Sans, Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import site from '@/content/site.json'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})
const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: site.title,
  description: site.tagline,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${pixelifySans.variable}`}
    >
      <body>
        <header className="site-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wordmark" src="/logo-mark-black.png" alt={site.title} />
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/about/">About</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="site-footer-top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wordmark" src="/logo-mark-white.png" alt={site.title} />
            <div className="footer-links">
              {site.footerLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="site-footer-spacer" />
          <div className="site-footer-bottom">
            <div className="site-footer-bottom-inner">
              <span>© {new Date().getFullYear()} Kodena — MIT licensed</span>
              <span>Made with pixels &amp; pnpm</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
