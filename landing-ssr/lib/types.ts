export interface MediaRef {
  url?: string
  alt?: string | null
  width?: number
  height?: number
}

export interface SiteSettingsEntry {
  siteName?: string
  tagline?: string
  logo?: MediaRef | null
  favicon?: MediaRef | null
  socialLinks?: Array<{ platform: string; url: string }>
  footerText?: string
  defaultOgImage?: MediaRef | null
}

export interface FeatureItem {
  iconEmoji?: string
  title?: string
  body?: string
}

export interface LandingEntry {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: MediaRef | null
  heroCtaLabel?: string
  heroCtaHref?: string
  features?: FeatureItem[]
  contactSectionTitle?: string
  contactSectionBody?: string
}
