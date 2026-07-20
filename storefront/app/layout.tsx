import type { Metadata } from 'next'
import Link from 'next/link'
import { loadConfig } from '@/lib/config'
import './globals.css'

export function generateMetadata(): Metadata {
  const config = loadConfig()
  return { title: config.siteName, description: `${config.siteName} — online shop` }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = loadConfig()
  return (
    <html lang="id">
      <body>
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold">{config.siteName}</Link>
            <Link href="/cart" className="text-sm text-zinc-600 hover:text-zinc-900">Cart</Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-zinc-400">
          Powered by Sawala Cloud
        </footer>
      </body>
    </html>
  )
}
