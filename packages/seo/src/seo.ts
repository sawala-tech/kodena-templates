import type { Metadata } from 'next'

export interface OgImage {
  url: string
  width?: number
  height?: number
  alt?: string
}

export interface BuildMetadataInput {
  /** Locale-specific URL path for the current page, e.g. `/` or `/en`. */
  path: string
  /** Absolute origin including protocol, no trailing slash. */
  siteOrigin: string
  /** Editor-facing site name (also used as default OG site_name). */
  siteName: string
  /** Current page's title — used as Next's per-page title; falls back to siteName. */
  title?: string
  description?: string
  /** Locale of the current page, used to compute the `og:locale` value. */
  locale: 'id' | 'en'
  /** All locales the page renders in; used for `<link rel=alternate hreflang>`. */
  alternates?: Partial<Record<'id' | 'en', string>>
  ogImage?: OgImage
  ogType?: 'website' | 'article'
  noindex?: boolean
}

const ogLocaleFor: Record<'id' | 'en', string> = {
  id: 'id_ID',
  en: 'en_GB',
}

/**
 * Generic SEO metadata builder used by every kodena-templates template.
 * No hardcoded brand — every site-specific value (siteName, ogImage,
 * etc.) is read from the template's site-settings Kontena entry and
 * passed in as input.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    path,
    siteOrigin,
    siteName,
    title,
    description,
    locale,
    alternates,
    ogImage,
    ogType = 'website',
    noindex,
  } = input

  const canonical = `${siteOrigin}${path === '/' ? '' : path}` || siteOrigin

  const languages: Record<string, string> = {}
  if (alternates) {
    for (const [lang, p] of Object.entries(alternates)) {
      if (p === undefined) continue
      languages[lang] = `${siteOrigin}${p === '/' ? '' : p}` || siteOrigin
    }
  }

  return {
    title: title ?? siteName,
    description,
    alternates: {
      canonical,
      languages: Object.keys(languages).length > 0 ? languages : undefined,
    },
    openGraph: {
      type: ogType,
      siteName,
      title: title ?? siteName,
      description,
      url: canonical,
      locale: ogLocaleFor[locale],
      images: ogImage
        ? [{ url: ogImage.url, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }]
        : undefined,
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}
