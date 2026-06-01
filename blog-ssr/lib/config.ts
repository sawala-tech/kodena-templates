export type Locale = 'id' | 'en'

export interface BlogConfig {
  kontenaBaseUrl: string
  kontenaProjectId: string
  kontenaPublicApiKey: string
  defaultLocale: Locale
  locales: ReadonlyArray<Locale>
  siteName: string
  siteOrigin: string
  formulirApiKey?: string
  formulirContactFormSlug?: string
  /** Posts shown per page on the list/home route. From POSTS_PER_PAGE, default 9. */
  postsPerPage: number
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

function parsePostsPerPage(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

let cached: BlogConfig | undefined

export function loadConfig(): BlogConfig {
  if (cached) return cached
  const defaultLocale = required('DEFAULT_LOCALE') as Locale
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
    postsPerPage: parsePostsPerPage(optional('POSTS_PER_PAGE'), 9),
  }
  return cached
}
