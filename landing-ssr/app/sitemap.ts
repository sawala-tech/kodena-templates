import type { MetadataRoute } from 'next'
import { loadConfig } from '@/lib/config'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const config = loadConfig()
  const origin = config.siteOrigin
  const url = (l: 'id' | 'en') => `${origin}/${l}`

  const languages: Record<string, string> = {}
  for (const l of config.locales) languages[l] = url(l)

  return config.locales.map((l) => ({
    url: url(l),
    alternates: { languages },
  }))
}
