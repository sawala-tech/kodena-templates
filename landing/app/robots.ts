import type { MetadataRoute } from 'next'
import { loadConfig } from '@/lib/config'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const { siteOrigin } = loadConfig()
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteOrigin}/sitemap.xml`,
  }
}
