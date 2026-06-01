import type { MetadataRoute } from 'next'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import type { PageEntry, PostEntry } from '@/lib/types'

// Built at request time so newly published posts/pages appear without a redeploy.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = loadConfig()
  const origin = config.siteOrigin
  const k = getKontenaClient()

  const entries: MetadataRoute.Sitemap = []

  for (const locale of config.locales) {
    // Static routes per locale.
    entries.push({ url: `${origin}/${locale}` })
    entries.push({ url: `${origin}/${locale}/kontak` })

    const [posts, pages] = await Promise.all([
      k.listCollection<PostEntry>('post', { locale, limit: 100 }).catch(() => ({ items: [] as Array<{ _row: { slug?: string | null; updatedAt?: string } }> })),
      k.listCollection<PageEntry>('page', { locale, limit: 100 }).catch(() => ({ items: [] as Array<{ _row: { slug?: string | null; updatedAt?: string } }> })),
    ])

    for (const p of [...posts.items, ...pages.items]) {
      const slug = p._row.slug
      if (!slug) continue
      entries.push({
        url: `${origin}/${locale}/${slug}`,
        lastModified: p._row.updatedAt ? new Date(p._row.updatedAt) : undefined,
      })
    }
  }

  return entries
}
