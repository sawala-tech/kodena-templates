import site from '@/content/site.json'
import { CopyButton } from './CopyButton'

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="grid-bg">
        {/* scattered pixels */}
        <span className="pixel" style={{ top: 110, left: '8%', width: 10, height: 10, animation: 'kd-float 5s ease-in-out infinite' }} />
        <span className="pixel" style={{ top: 230, left: '4%', width: 6, height: 6, background: 'var(--ink)', opacity: 0.5 }} />
        <span className="pixel" style={{ top: 90, right: '9%', width: 8, height: 8, background: 'var(--ink)', animation: 'kd-float 6s ease-in-out infinite' }} />
        <span className="pixel" style={{ bottom: 130, right: '6%', width: 14, height: 14, animation: 'kd-float 7s ease-in-out infinite' }} />

        <div className="hero-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-wordmark" src="/logo-mark-black.svg" alt="Kodena" />

          <p className="hero-tagline">{site.tagline}</p>
          <p className="hero-sub">{site.heroSubtitle}</p>

          <div className="hero-actions">
            <div className="install-chip">
              <div className="cmd">
                <span className="dollar">$</span>
                {site.installCmd}
              </div>
              <CopyButton value={site.installCmd} />
            </div>
            <a className="btn-ghost" href={site.browseHref}>
              Browse templates <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ TERMINAL (decorative) ============ */}
      <section className="terminal-section">
        <div className="terminal-section-inner">
          <div className="terminal">
            <div className="terminal-head">
              <span className="terminal-dot" style={{ background: 'var(--kd-accent)' }} />
              <span className="terminal-dot" style={{ background: 'var(--muted2)' }} />
              <span className="terminal-dot" style={{ background: 'var(--muted)' }} />
              <span className="terminal-title">zsh — kodena</span>
            </div>
            <div className="terminal-body">
              <div>
                <span className="ok">$</span> npx create-kodena@latest
              </div>
              <div>
                <span className="ok">✔</span> <span className="dim">Project name</span> … acme-app
              </div>
              <div>
                <span className="ok">✔</span> <span className="dim">Template</span> … SaaS Dashboard
              </div>
              <div>
                <span className="ok">✔</span> <span className="dim">Package manager</span> … pnpm
              </div>
              <div className="dimmer">◐ scaffolding · installing · wiring auth, db, ci …</div>
              <div>
                <span className="ok">✔</span> Ready in 4.2s — 0 vulnerabilities
              </div>
              <div className="dim" style={{ marginTop: 6 }}>
                → cd acme-app &amp;&amp; pnpm dev
              </div>
              <div>
                {'  '}ready on <span className="bright">localhost:3000</span> <span className="terminal-cursor" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
