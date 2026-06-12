import type { Metadata } from 'next'
import site from '@/content/site.json'

export const metadata: Metadata = {
  title: `About — ${site.title}`,
}

export default function AboutPage() {
  return (
    <section className="hero">
      <h1>About this site</h1>
      <p className="tagline">
        This page exists so the static export ships more than one route. Add
        your own pages by creating directories under <code>app/</code> — each
        one becomes a folder of pre-rendered HTML in <code>out/</code>.
      </p>
    </section>
  )
}
