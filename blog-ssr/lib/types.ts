// Content shapes for the Blog template, mirroring the Kontena schemas seeded
// from `seed/schemas.json`. User fields are flattened to the top level by the
// Kontena client; system columns (slug, locale, publishedAt, …) live under
// `_row` on each `KontenaEntry<T>`.

export interface MediaRef {
  url?: string
  alt?: string | null
  width?: number
  height?: number
}

export interface SocialLink {
  platform: string
  url: string
}

/** `site-settings` (single) — reused from the landing templates. */
export interface SiteSettingsEntry {
  siteName?: string
  tagline?: string
  logo?: MediaRef | null
  favicon?: MediaRef | null
  footerText?: string
  defaultOgImage?: MediaRef | null
  socialLinks?: SocialLink[]
}

/** A single navigation entry; top-level items may carry nested `children`. */
export interface MenuItem {
  label?: string
  href?: string
  children?: Array<{ label?: string; href?: string }>
}

/** `menu` (single) — header navigation, one level of nesting. */
export interface MenuEntry {
  items?: MenuItem[]
}

/** Optional per-entry SEO fields shared by `post` and `page`. */
export interface SeoFields {
  seoMetaTitle?: string
  seoMetaDescription?: string
  seoOgImage?: MediaRef | null
  seoNoindex?: boolean
}

/**
 * `post` (collection) — a blog post. `title` is a data field; `slug` and
 * `publishedAt` are Kontena system columns read via `entry._row` (the
 * `publishedAt` here is the convenience fallback the template reads when an
 * entry happens to carry it in data).
 */
export interface PostEntry extends SeoFields {
  title?: string
  excerpt?: string
  body?: string
  cover?: MediaRef | null
  author?: string
  publishedAt?: string
  tags?: string[]
}

/** `page` (collection) — an editor-managed static page (About, etc.). `slug` via `_row`. */
export interface PageEntry extends SeoFields {
  title?: string
  body?: string
  cover?: MediaRef | null
}
