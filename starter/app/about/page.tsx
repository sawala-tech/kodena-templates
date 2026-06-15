import type { Metadata } from 'next'
import site from '@/content/site.json'

export const metadata: Metadata = {
  title: `About — ${site.title}`,
}

export default function AboutPage() {
  return (
    <section className="grid-bg">
      <div className="hero-inner">
        <h1 className="hero-h1">About this site</h1>

        <p className="hero-sub">
          This is the Kodena starter — a standalone Next.js site that builds to
          a static export and deploys to Kodena&apos;s edge as plain assets.
          There is no CMS, no database, and no API keys: everything you see
          lives in this repository and ships as pre-rendered HTML.
        </p>

        <p className="hero-sub">
          The page you are reading exists so the export ships more than one
          route. Add your own pages by creating directories under{' '}
          <code>app/</code> — each <code>page.tsx</code> becomes a folder of
          pre-rendered HTML in <code>out/</code>, served at a clean,
          trailing-slash URL.
        </p>

        <p className="hero-sub">
          To change wording without touching JSX, edit{' '}
          <code>content/site.json</code>: the hero tagline, the sub-line, the
          install command behind the copy button, and the footer links all read
          from there. The pixel branding — the wordmark, the green accent, and
          the decorative terminal — is intentionally baked in.
        </p>

        <p className="hero-sub">
          When you are ready to publish, run <code>kodena deploy --build</code>.
          It runs the static export and uploads <code>out/</code> to your
          Kodena project, then prints the live{' '}
          <code>https://&lt;tenant&gt;.kodena.id</code> URL. Re-run it any time
          you change content or code.
        </p>

        <p className="hero-sub">
          Want to go further? Swap the starter for a CMS-backed template like{' '}
          <code>landing</code> when you need editable content, forms, or media —
          or keep building right here. Scroll down to find the footer links for
          docs, templates, and the changelog.
        </p>
      </div>
    </section>
  )
}
