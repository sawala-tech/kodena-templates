export type Locale = 'id' | 'en'

export interface LandingConfig {
  kontenaBaseUrl: string
  kontenaProjectId: string
  kontenaPublicApiKey: string
  defaultLocale: Locale
  locales: ReadonlyArray<Locale>
  siteName: string
  siteOrigin: string
  formulirApiKey?: string
  formulirContactFormSlug?: string
}

function required(name: string): string {
  const value = process.env[name]
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required env var: ${name}. Templates are built with all ` +
        `config injected at build time; see TEMPLATES.md for the full list.`,
    )
  }
  return value
}

function optional(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

function parseLocales(raw: string, fallback: Locale): ReadonlyArray<Locale> {
  const parsed = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Locale => s === 'id' || s === 'en')
  return parsed.length > 0 ? parsed : [fallback]
}

let cached: LandingConfig | undefined

export function loadConfig(): LandingConfig {
  if (cached) return cached
  const defaultLocale = (required('DEFAULT_LOCALE') as Locale)
  cached = {
    kontenaBaseUrl: required('KONTENA_BASE_URL'),
    kontenaProjectId: required('KONTENA_PROJECT_ID'),
    kontenaPublicApiKey: required('NEXT_PUBLIC_KONTENA_API_KEY'),
    defaultLocale,
    locales: parseLocales(required('LOCALES'), defaultLocale),
    siteName: required('SITE_NAME'),
    siteOrigin: required('SITE_ORIGIN'),
    formulirApiKey: optional('NEXT_PUBLIC_FORMULIR_API_KEY'),
    formulirContactFormSlug: optional('NEXT_PUBLIC_FORMULIR_CONTACT_FORM_SLUG'),
  }
  return cached
}
